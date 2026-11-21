export interface LocationFix {
  lat: number;
  lng: number;
  accuracy: number;
}

export type LocationAcquisitionError =
  | 'unsupported'
  | 'permission-denied'
  | 'unavailable'
  | 'timeout';

// Realistic thresholds for progressive GPS acquisition
export const GPS_HIGH_ACCURACY_THRESHOLD_METERS = 10;
export const GPS_GOOD_ACCURACY_THRESHOLD_METERS = 25;
export const GPS_TARGET_ACCURACY_METERS = 15;

const GPS_ACQUISITION_TIMEOUT_MS = 12_000; // Max safety timeout 12s
const GPS_SETTLE_WINDOW_MS = 3_000; // Settle window to capture satellite stabilization

export function formatAccuracyMeters(accuracy: number): string {
  if (!Number.isFinite(accuracy) || accuracy <= 0) return '—';
  return String(Math.round(accuracy));
}

/**
 * Acquire best available GPS fix with progressive refinement:
 * 1. Obtains immediate position via highAccuracy geolocation.
 * 2. If accuracy is already high (<= 10m), resolves immediately.
 * 3. Otherwise, watches for up to 3s for a refined satellite fix and locks in the best one.
 * 4. Never blocks for 30 seconds or shows failure messages when a valid position exists.
 */
export function acquireBestGpsFix(
  onProgress: (fix: LocationFix) => void,
  onSuccess: (fix: LocationFix) => void,
  onError: (error: LocationAcquisitionError) => void,
): () => void {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    onError('unsupported');
    return () => {};
  }

  const geolocation = navigator.geolocation;
  const options: PositionOptions = {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 8_000,
  };
  let bestFix: LocationFix | null = null;
  let watchId: number | null = null;
  let overallTimeoutId: number | null = null;
  let settleTimerId: number | null = null;
  let lastError: LocationAcquisitionError = 'unavailable';
  let finished = false;

  const cleanup = () => {
    if (overallTimeoutId !== null) window.clearTimeout(overallTimeoutId);
    if (settleTimerId !== null) window.clearTimeout(settleTimerId);
    if (watchId !== null) geolocation.clearWatch(watchId);
  };

  const finish = (error?: LocationAcquisitionError) => {
    if (finished) return;
    finished = true;
    cleanup();

    if (bestFix) {
      onSuccess(bestFix);
    } else {
      onError(error || lastError);
    }
  };

  const scheduleSettle = () => {
    if (settleTimerId !== null) window.clearTimeout(settleTimerId);
    settleTimerId = window.setTimeout(() => {
      if (bestFix) {
        finish();
      }
    }, GPS_SETTLE_WINDOW_MS);
  };

  const considerPosition = (position: GeolocationPosition) => {
    const { latitude, longitude, accuracy } = position.coords;
    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      !Number.isFinite(accuracy) ||
      accuracy <= 0
    ) {
      return;
    }

    const isFirstFix = bestFix === null;
    const isImprovement = bestFix !== null && accuracy < bestFix.accuracy;

    if (isFirstFix || isImprovement) {
      bestFix = { lat: latitude, lng: longitude, accuracy };
      onProgress(bestFix);

      // If we reach high accuracy (<= 10m), we can finish immediately
      if (accuracy <= GPS_HIGH_ACCURACY_THRESHOLD_METERS) {
        finish();
        return;
      }

      // Otherwise, give up to 3 seconds for GPS hardware to refine
      scheduleSettle();
    }
  };

  const noteError = (error: GeolocationPositionError) => {
    if (error.code === error.PERMISSION_DENIED) {
      finish('permission-denied');
      return;
    }
    lastError = error.code === error.TIMEOUT ? 'timeout' : 'unavailable';
  };

  const startWatching = () => {
    if (finished || watchId !== null) return;
    try {
      watchId = geolocation.watchPosition(
        considerPosition,
        noteError,
        options,
      );
    } catch {
      // Fallback
    }
  };

  overallTimeoutId = window.setTimeout(
    () => finish(bestFix ? undefined : lastError),
    GPS_ACQUISITION_TIMEOUT_MS,
  );

  // Direct call for immediate user-gesture handling
  geolocation.getCurrentPosition(
    (position) => {
      considerPosition(position);
      startWatching();
    },
    (error) => {
      noteError(error);
      startWatching();
    },
    options,
  );

  return () => {
    if (finished) return;
    finished = true;
    cleanup();
  };
}
