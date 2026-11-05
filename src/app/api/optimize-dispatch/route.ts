import { NextRequest, NextResponse } from 'next/server';
import { RouteOptimizationResponse, OptimizedWaypoint } from '@/types';

export const dynamic = 'force-dynamic';

const DEPOT = {
  lat: 17.7231,
  lng: 83.3086,
  name: 'GVMC Main Office Central Depot, Asilmetta',
};

// Haversine distance in meters
function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

// Local Nearest Neighbor TSP optimizer (Offline / Graceful Fallback)
function computeOfflineOptimizedRoute(
  hazards: Array<{ id: string; lat: number; lng: number; locationName?: string; priorityScore?: number; estimated_asphalt_m3?: number }>
): RouteOptimizationResponse {
  const unvisited = [...hazards];
  const ordered: OptimizedWaypoint[] = [];

  let currentLat = DEPOT.lat;
  let currentLng = DEPOT.lng;
  let totalDistanceMeters = 0;

  let step = 1;
  while (unvisited.length > 0) {
    let nearestIdx = 0;
    let minDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const dist = getHaversineDistance(currentLat, currentLng, unvisited[i].lat, unvisited[i].lng);
      if (dist < minDistance) {
        minDistance = dist;
        nearestIdx = i;
      }
    }

    const [chosen] = unvisited.splice(nearestIdx, 1);
    totalDistanceMeters += minDistance;
    currentLat = chosen.lat;
    currentLng = chosen.lng;

    ordered.push({
      id: chosen.id,
      originalIndex: hazards.findIndex((h) => h.id === chosen.id),
      optimizedSequence: step++,
      lat: chosen.lat,
      lng: chosen.lng,
      locationName: chosen.locationName || `Hazard #${chosen.id}`,
      priorityScore: chosen.priorityScore || 85,
      asphalt_m3: chosen.estimated_asphalt_m3 || 0.6,
    });
  }

  // Return to depot
  totalDistanceMeters += getHaversineDistance(currentLat, currentLng, DEPOT.lat, DEPOT.lng);

  // Road circuit multiplier (real streets vs straight line ~1.28x in Vizag terrain)
  const roadDistanceKm = Number(((totalDistanceMeters * 1.28) / 1000).toFixed(1));
  // Average municipal asphalt truck speed (22 km/h in city traffic) + 10 mins compaction per site
  const driveMinutes = Math.round((roadDistanceKm / 22) * 60);
  const totalDurationMinutes = driveMinutes + ordered.length * 10;

  return {
    totalDistanceKm: roadDistanceKm,
    totalDurationMinutes,
    orderedHazards: ordered,
    isFallback: true,
    depotLocation: DEPOT,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const hazards: Array<{
      id: string;
      lat: number;
      lng: number;
      locationName?: string;
      priorityScore?: number;
      estimated_asphalt_m3?: number;
    }> = body.hazards || [];

    if (!hazards || hazards.length === 0) {
      return NextResponse.json({ error: 'No hazards provided for route optimization' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    // If API key is not configured, gracefully use local Nearest-Neighbor TSP
    if (!apiKey) {
      const fallback = computeOfflineOptimizedRoute(hazards);
      return NextResponse.json(fallback);
    }

    // Call Google Maps Routes API v2
    try {
      const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask':
            'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.optimizedIntermediateWaypointIndex',
        },
        body: JSON.stringify({
          origin: {
            location: {
              latLng: {
                latitude: DEPOT.lat,
                longitude: DEPOT.lng,
              },
            },
          },
          destination: {
            location: {
              latLng: {
                latitude: DEPOT.lat,
                longitude: DEPOT.lng,
              },
            },
          },
          intermediates: hazards.map((h) => ({
            location: {
              latLng: {
                latitude: h.lat,
                longitude: h.lng,
              },
            },
          })),
          travelMode: 'DRIVE',
          optimizeWaypointOrder: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Google Routes API HTTP error: ${response.status}`);
      }

      const data = await response.json();
      const route = data.routes?.[0];

      if (!route) {
        throw new Error('No route returned by Google Routes API');
      }

      const distanceMeters = route.distanceMeters || 0;
      const durationSecondsStr = route.duration || '0s';
      const durationSeconds = parseInt(durationSecondsStr.replace('s', ''), 10) || 0;
      const optimizedIndices: number[] = route.optimizedIntermediateWaypointIndex || hazards.map((_, i) => i);

      // Re-order hazards according to Google Routes optimized waypoint order
      const orderedHazards: OptimizedWaypoint[] = optimizedIndices.map((origIdx, seq) => {
        const h = hazards[origIdx];
        return {
          id: h.id,
          originalIndex: origIdx,
          optimizedSequence: seq + 1,
          lat: h.lat,
          lng: h.lng,
          locationName: h.locationName || `Site #${h.id}`,
          priorityScore: h.priorityScore || 85,
          asphalt_m3: h.estimated_asphalt_m3 || 0.6,
        };
      });

      const totalDistanceKm = Number((distanceMeters / 1000).toFixed(1));
      // Drive duration + 10 mins compaction per stop
      const totalDurationMinutes = Math.round(durationSeconds / 60) + orderedHazards.length * 10;

      const result: RouteOptimizationResponse = {
        totalDistanceKm,
        totalDurationMinutes,
        orderedHazards,
        encodedPolyline: route.polyline?.encodedPolyline,
        isFallback: false,
        depotLocation: DEPOT,
      };

      return NextResponse.json(result);
    } catch (routeErr) {
      console.warn('Google Routes API request failed, utilizing local TSP fallback:', routeErr);
      const fallback = computeOfflineOptimizedRoute(hazards);
      return NextResponse.json(fallback);
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
