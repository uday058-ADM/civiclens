import { NextRequest, NextResponse } from 'next/server';
import { GeocodeResponse } from '@/types';

export const dynamic = 'force-dynamic';

// Seeded Visakhapatnam Landmark Centroids for Instant Offline / Quota Fallback
const VIZAG_LANDMARK_CENTROIDS = [
  {
    name: 'RK Beach Road, opposite INS Kursura Submarine Museum',
    street: 'Beach Road, Pandurangapuram',
    sublocality: 'RK Beach & Pandurangapuram',
    ward: 'Ward 18',
    postalCode: '530003',
    lat: 17.7142,
    lng: 83.3328,
  },
  {
    name: 'Siripuram Circle, near Dutt Island & AU Campus',
    street: 'Waltair Main Road',
    sublocality: 'Siripuram',
    ward: 'Ward 19',
    postalCode: '530003',
    lat: 17.7211,
    lng: 83.3155,
  },
  {
    name: '2nd Lane, Dwaraka Nagar, opposite RTC Complex Gate 2',
    street: 'Station Road',
    sublocality: 'Dwaraka Nagar',
    ward: 'Ward 31',
    postalCode: '530016',
    lat: 17.7275,
    lng: 83.3039,
  },
  {
    name: 'Sector 4, MVP Double Road, near AS Raja Grounds',
    street: 'MVP Double Road',
    sublocality: 'MVP Colony',
    ward: 'Ward 22',
    postalCode: '530017',
    lat: 17.7412,
    lng: 83.3398,
  },
  {
    name: 'Old Gajuwaka Junction, NH16 Industrial Flyover Approach',
    street: 'NH16 Gajuwaka Main Corridor',
    sublocality: 'Gajuwaka Industrial Hub',
    ward: 'Ward 65',
    postalCode: '530026',
    lat: 17.6912,
    lng: 83.2185,
  },
  {
    name: 'Madhurawada IT SEZ Hill 3, near Millennium Tower',
    street: 'IT SEZ Road',
    sublocality: 'Madhurawada',
    ward: 'Ward 44',
    postalCode: '530048',
    lat: 17.8185,
    lng: 83.3512,
  },
  {
    name: 'Jagadamba Centre, Cinema Road, near Jagadamba Theatre',
    street: 'Cinema Road',
    sublocality: 'Jagadamba Junction',
    ward: 'Ward 26',
    postalCode: '530002',
    lat: 17.7128,
    lng: 83.3005,
  },
  {
    name: 'Asilmetta Junction, near Sampath Vinayagar Temple',
    street: 'VIP Road',
    sublocality: 'Asilmetta',
    ward: 'Ward 20',
    postalCode: '530003',
    lat: 17.7245,
    lng: 83.3102,
  },
  {
    name: 'Rushikonda Beach Road, near Gitam University',
    street: 'Bheemili Beach Road',
    sublocality: 'Rushikonda',
    ward: 'Ward 7',
    postalCode: '530045',
    lat: 17.7812,
    lng: 83.3845,
  },
];

// Distance helper
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// In-Memory LRU Cache with rounded coordinates key (~11m resolution)
const geocodeCache = new Map<string, GeocodeResponse>();
const MAX_CACHE_SIZE = 250;

function getCacheKey(lat: number, lng: number): string {
  return `${lat.toFixed(4)}_${lng.toFixed(4)}`;
}

function computeOfflineNearestCentroid(lat: number, lng: number): GeocodeResponse {
  let nearest = VIZAG_LANDMARK_CENTROIDS[0];
  let minDistance = Infinity;

  for (const landmark of VIZAG_LANDMARK_CENTROIDS) {
    const dist = getDistanceMeters(lat, lng, landmark.lat, landmark.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = landmark;
    }
  }

  const distKm = (minDistance / 1000).toFixed(1);
  const address =
    minDistance < 200
      ? `${nearest.name}, Visakhapatnam`
      : `${nearest.street}, near ${nearest.sublocality} (${distKm}km from ${nearest.ward}), Visakhapatnam`;

  return {
    address,
    streetName: nearest.street,
    sublocality: nearest.sublocality,
    postalCode: nearest.postalCode,
    wardName: nearest.ward,
    isFallback: true,
  };
}

async function handleGeocode(lat: number, lng: number): Promise<GeocodeResponse> {
  const cacheKey = getCacheKey(lat, lng);
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!;
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    const fallback = computeOfflineNearestCentroid(lat, lng);
    if (geocodeCache.size >= MAX_CACHE_SIZE) {
      const firstKey = geocodeCache.keys().next().value;
      if (firstKey) geocodeCache.delete(firstKey);
    }
    geocodeCache.set(cacheKey, fallback);
    return fallback;
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&result_type=route|sublocality|neighborhood|street_address&key=${apiKey}`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' }, next: { revalidate: 3600 } });

    if (!res.ok) {
      throw new Error(`Google Maps Geocode HTTP ${res.status}`);
    }

    const data = await res.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const topResult = data.results[0];
      let streetName = '';
      let sublocality = '';
      let postalCode = '';

      for (const comp of topResult.address_components || []) {
        const types: string[] = comp.types || [];
        if (types.includes('route') || types.includes('street_address')) {
          streetName = comp.long_name;
        } else if (
          types.includes('sublocality') ||
          types.includes('sublocality_level_1') ||
          types.includes('neighborhood')
        ) {
          if (!sublocality) sublocality = comp.long_name;
        } else if (types.includes('postal_code')) {
          postalCode = comp.long_name;
        }
      }

      const landmarkFallback = computeOfflineNearestCentroid(lat, lng);
      const cleanStreet = streetName || landmarkFallback.streetName;
      const cleanSublocality = sublocality || landmarkFallback.sublocality;
      const cleanPostal = postalCode || landmarkFallback.postalCode;

      const formatted = `${cleanStreet}, ${cleanSublocality}, Visakhapatnam`;

      const responsePayload: GeocodeResponse = {
        address: formatted,
        streetName: cleanStreet,
        sublocality: cleanSublocality,
        postalCode: cleanPostal,
        wardName: landmarkFallback.wardName,
        isFallback: false,
      };

      if (geocodeCache.size >= MAX_CACHE_SIZE) {
        const firstKey = geocodeCache.keys().next().value;
        if (firstKey) geocodeCache.delete(firstKey);
      }
      geocodeCache.set(cacheKey, responsePayload);

      return responsePayload;
    } else {
      // Fallback if zero results
      return computeOfflineNearestCentroid(lat, lng);
    }
  } catch (error) {
    console.warn('Google Maps Geocoding API failed, falling back to local centroid:', error);
    return computeOfflineNearestCentroid(lat, lng);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const latStr = searchParams.get('lat');
    const lngStr = searchParams.get('lng');

    if (!latStr || !lngStr) {
      return NextResponse.json({ error: 'lat and lng parameters are required' }, { status: 400 });
    }

    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json({ error: 'lat and lng must be valid numbers' }, { status: 400 });
    }

    const result = await handleGeocode(lat, lng);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lat, lng } = body;

    if (lat === undefined || lng === undefined) {
      return NextResponse.json({ error: 'lat and lng fields are required' }, { status: 400 });
    }

    const result = await handleGeocode(Number(lat), Number(lng));
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
