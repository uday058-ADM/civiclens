import { get, set } from 'idb-keyval';
import { OfflineReport } from '@/types';

const QUEUE_STORAGE_KEY = 'civiclens_offline_hazard_queue';

// Get all queued offline reports
export async function getOfflineReports(): Promise<OfflineReport[]> {
  if (typeof window === 'undefined') return [];
  try {
    const reports = await get<OfflineReport[]>(QUEUE_STORAGE_KEY);
    return reports || [];
  } catch (err) {
    try {
      const fallback = localStorage.getItem(QUEUE_STORAGE_KEY);
      return fallback ? JSON.parse(fallback) : [];
    } catch {
      return [];
    }
  }
}

// Save a report to offline queue
export async function saveOfflineReport(report: OfflineReport): Promise<void> {
  const current = await getOfflineReports();
  const updated = [report, ...current.filter((r) => r.id !== report.id)];
  try {
    await set(QUEUE_STORAGE_KEY, updated);
  } catch (err) {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  }
}

// Remove a single report from queue
export async function removeOfflineReport(id: string): Promise<void> {
  const current = await getOfflineReports();
  const updated = current.filter((r) => r.id !== id);
  try {
    await set(QUEUE_STORAGE_KEY, updated);
  } catch (err) {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  }
}

// Sync all queued offline reports with the backend server
export async function syncOfflineReports(
  onSyncedOne?: (reportId: string, result: any) => void
): Promise<{ synced: number; failed: number }> {
  if (typeof window === 'undefined' || !navigator.onLine) {
    return { synced: 0, failed: 0 };
  }

  const reports = await getOfflineReports();
  if (reports.length === 0) return { synced: 0, failed: 0 };

  let syncedCount = 0;
  let failedCount = 0;

  for (const report of reports) {
    try {
      const analysisRes = await fetch('/api/analyze-hazard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: report.imageData,
          ward: report.ward,
          roadType: report.roadType || 'Arterial',
        }),
      });

      const analysis = await analysisRes.json();

      const hazardRes = await fetch('/api/hazards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: report.coordinates.lat,
          lng: report.coordinates.lng,
          ward: report.ward,
          imageData: report.imageData,
          width_cm: analysis.width_cm || 45,
          depth_cm: analysis.depth_cm || 8.5,
          confidence: analysis.confidence || 92,
          defect_type: analysis.defect_type || 'Pothole',
          why_ranked_here: analysis.why_ranked_here,
        }),
      });

      if (hazardRes.ok) {
        const hazardData = await hazardRes.json();
        await removeOfflineReport(report.id);
        syncedCount++;
        if (onSyncedOne) onSyncedOne(report.id, hazardData);
      } else {
        failedCount++;
      }
    } catch (err) {
      console.error('Failed to sync offline report', report.id, err);
      failedCount++;
    }
  }

  return { synced: syncedCount, failed: failedCount };
}

// Auto-register online sync listener
export function registerAutoSync(onSyncComplete: (syncedCount: number) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleOnline = async () => {
    const result = await syncOfflineReports();
    if (result.synced > 0) {
      onSyncComplete(result.synced);
    }
  };

  window.addEventListener('online', handleOnline);
  return () => window.removeEventListener('online', handleOnline);
}
