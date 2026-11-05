import { HazardReport } from '@/types';

// Client-safe Firebase Environment Config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  !firebaseConfig.apiKey.includes('YOUR_')
);

// Fallback Real-time Channel for multi-tab and local mesh telemetry
class LocalMeshBroadcaster {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<(hazards: HazardReport[]) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('civiclens_hazard_mesh');
        this.channel.onmessage = (event) => {
          if (event.data?.type === 'HAZARD_UPDATE' && Array.isArray(event.data.hazards)) {
            this.notify(event.data.hazards);
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel not supported in this environment', e);
      }
    }
  }

  public subscribe(cb: (hazards: HazardReport[]) => void): () => void {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  public notify(hazards: HazardReport[]): void {
    this.listeners.forEach((cb) => cb(hazards));
  }

  public broadcast(hazards: HazardReport[]): void {
    this.notify(hazards);
    if (this.channel) {
      try {
        this.channel.postMessage({ type: 'HAZARD_UPDATE', hazards });
      } catch (e) {
        // channel error
      }
    }
  }
}

export const localMesh = new LocalMeshBroadcaster();

// Dynamic instances with safe dynamic imports
let firestoreDb: any = null;
let firebaseStorage: any = null;

async function getFirebaseInstances() {
  if (typeof window === 'undefined') return { db: null, storage: null };
  if (!isFirebaseConfigured) return { db: null, storage: null };

  if (!firestoreDb) {
    try {
      const appMod = await (Function('return import("firebase/app")')() as Promise<any>).catch(() => null);
      if (!appMod) return { db: null, storage: null };

      const firestoreMod = await (Function('return import("firebase/firestore")')() as Promise<any>).catch(() => null);
      const storageMod = await (Function('return import("firebase/storage")')() as Promise<any>).catch(() => null);

      if (!firestoreMod) return { db: null, storage: null };

      const { initializeApp, getApps, getApp } = appMod;
      const { getFirestore } = firestoreMod;
      const { getStorage } = storageMod || {};

      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      firestoreDb = getFirestore(app);
      if (getStorage) {
        firebaseStorage = getStorage(app);
      }
    } catch (err) {
      console.warn('Firebase initialization deferred, operating in Local Mesh mode', err);
    }
  }

  return { db: firestoreDb, storage: firebaseStorage };
}

/**
 * Upload hazard photo to Firebase Storage (/hazards/${Date.now()}_report.jpg)
 * Gracefully returns base64 if Firebase Storage is unconfigured
 */
export async function uploadHazardImage(base64Data: string, filenamePrefix = 'report'): Promise<string> {
  if (!isFirebaseConfigured) {
    return base64Data;
  }

  try {
    const { storage } = await getFirebaseInstances();
    if (!storage) return base64Data;

    const storageMod = await (Function('return import("firebase/storage")')() as Promise<any>).catch(() => null);
    if (!storageMod) return base64Data;

    const { ref, uploadString, getDownloadURL } = storageMod;
    const filename = `hazards/${Date.now()}_${filenamePrefix}.jpg`;
    const storageRef = ref(storage, filename);

    await uploadString(storageRef, base64Data, 'data_url');
    const publicUrl = await getDownloadURL(storageRef);
    return publicUrl;
  } catch (err) {
    console.warn('Firebase Storage upload failed, retaining inline base64:', err);
    return base64Data;
  }
}

/**
 * Sync Hazard Report to Firestore (/hazards/{hazardId})
 */
export async function syncHazardToFirestore(hazard: HazardReport): Promise<void> {
  if (!isFirebaseConfigured) {
    return;
  }

  try {
    const { db } = await getFirebaseInstances();
    if (!db) return;

    const firestoreMod = await (Function('return import("firebase/firestore")')() as Promise<any>).catch(() => null);
    if (!firestoreMod) return;

    const { doc, setDoc } = firestoreMod;
    const hazardRef = doc(db, 'hazards', hazard.id);

    // Schema mapping per requirements:
    await setDoc(
      hazardRef,
      {
        id: hazard.id,
        lat: hazard.coordinates.lat,
        lng: hazard.coordinates.lng,
        address: hazard.location,
        ward: hazard.ward,
        width_cm: hazard.width_cm,
        depth_cm: hazard.depth_cm,
        defect_type: hazard.defect_type,
        composite_risk: hazard.risk_score,
        reportsCount: hazard.reportsCount || hazard.duplicate_count || 1,
        status: hazard.status,
        photos: hazard.photos || hazard.images || [],
        statusHistory: hazard.activity_history || [],
        createdAt: hazard.reported_at,
        updatedAt: hazard.updated_at,
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Firestore sync failed, local database active:', err);
  }
}

/**
 * Subscribe to Real-Time Updates
 * If Firestore is available, registers onSnapshot listener.
 * If not, listens to local mesh broadcast channel.
 */
export function subscribeToRealtimeHazards(
  callback: (hazards: HazardReport[]) => void
): () => void {
  let unsubscribeFirestore: (() => void) | null = null;
  const unsubscribeLocal = localMesh.subscribe(callback);

  if (isFirebaseConfigured && typeof window !== 'undefined') {
    getFirebaseInstances().then(async ({ db }) => {
      if (!db) return;
      try {
        const firestoreMod = await (Function('return import("firebase/firestore")')() as Promise<any>).catch(() => null);
        if (!firestoreMod) return;

        const { collection, onSnapshot, query, orderBy } = firestoreMod;
        const hazardsCol = collection(db, 'hazards');
        const q = query(hazardsCol, orderBy('composite_risk', 'desc'));

        unsubscribeFirestore = onSnapshot(q, (snapshot: any) => {
          const liveList: HazardReport[] = [];
          snapshot.forEach((docSnap: any) => {
            const data = docSnap.data();
            liveList.push({
              id: data.id || docSnap.id,
              title: `${data.defect_type || 'Pothole'} on ${data.address || data.ward}`,
              description: `Reported defect with ${data.depth_cm}cm depth and ${data.width_cm}cm width.`,
              location: data.address || `${data.ward}, Visakhapatnam`,
              ward: data.ward,
              wardNumber: parseInt(data.ward?.match(/\d+/)?.[0] || '18', 10),
              coordinates: {
                lat: data.lat,
                lng: data.lng,
              },
              width_cm: data.width_cm,
              depth_cm: data.depth_cm,
              confidence: 96,
              defect_type: data.defect_type || 'Pothole',
              severity:
                data.composite_risk >= 85
                  ? 'Critical'
                  : data.composite_risk >= 70
                  ? 'High'
                  : data.composite_risk >= 45
                  ? 'Medium'
                  : 'Low',
              risk_score: data.composite_risk,
              why_ranked_here: `${data.depth_cm}cm depth + ${data.reportsCount} citizen reports`,
              duplicate_count: data.reportsCount || 1,
              reportsCount: data.reportsCount || 1,
              status: data.status || 'Reported',
              progress: data.status === 'Fixed' ? 100 : data.status === 'In Progress' ? 60 : 20,
              road_type: 'Arterial',
              traffic_level: 'High',
              images: data.photos || [],
              photos: data.photos || [],
              reported_at: data.createdAt || 'Today',
              updated_at: data.updatedAt || 'Just now',
              activity_history: data.statusHistory || [],
              score_breakdown: {
                depth_weight: Math.min(40, Math.round((data.depth_cm || 10) * 3.5)),
                area_weight: Math.min(20, Math.round(((data.width_cm || 40) / 100) * 20)),
                traffic_weight: 16,
                reports_weight: Math.min(20, (data.reportsCount || 1) * 4),
              },
            });
          });

          if (liveList.length > 0) {
            callback(liveList);
          }
        });
      } catch (err) {
        console.warn('Firestore onSnapshot listener failed, defaulting to local mesh:', err);
      }
    });
  }

  return () => {
    unsubscribeLocal();
    if (unsubscribeFirestore) {
      unsubscribeFirestore();
    }
  };
}
