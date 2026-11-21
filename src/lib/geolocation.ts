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

export const GPS_TARGET_ACCURACY_METERS = 3;

const GPS_ACQUISITION_TIMEOUT_MS = 30_000;
const GPS_INITIAL_FIX_TIMEOUT_MS = 10_000;

export function formatAccuracyMeters(accuracy: number): string {
  return String(Math.ceil(accuracy));
}

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
    timeout: GPS_INITIAL_FIX_TIMEOUT_MS,
  };
  let bestFix: LocationFix | null = null;
  let watchId: number | null = null;
  let deadlineId: number | null = null;
  let lastError: LocationAcquisitionError = 'unavailable';
  let finished = false;

  const cleanup = () => {
    if (deadlineId !== null) window.clearTimeout(deadlineId);
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

  const noteError = (error: GeolocationPositionError) => {
    if (error.code === error.PERMISSION_DENIED) {
      finish('permission-denied');
      return;
    }
    lastError = error.code === error.TIMEOUT ? 'timeout' : 'unavailable';
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

    if (!bestFix || accuracy < bestFix.accuracy) {
      bestFix = { lat: latitude, lng: longitude, accuracy };
      onProgress(bestFix);
    }

    if (accuracy <= GPS_TARGET_ACCURACY_METERS) {
      finish();
    }
  };

  const startWatching = () => {
    if (finished || watchId !== null) return;
    watchId = geolocation.watchPosition(
      considerPosition,
      noteError,
      options,
    );
  };

  deadlineId = window.setTimeout(
    () => finish(bestFix ? undefined : lastError),
    GPS_ACQUISITION_TIMEOUT_MS,
  );

  // This direct call is kept on the user-gesture path so browsers can prompt.
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
