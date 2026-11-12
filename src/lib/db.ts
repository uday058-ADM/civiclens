import { HazardReport, HazardSeverity, HazardStatus, DefectType } from '@/types';
import { syncHazardToFirestore, localMesh } from './firebase';

// Haversine formula: returns distance in meters between two lat/lng coordinates
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
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

// Calculate traffic factor (max 20)
export function getTrafficFactor(
  road_type: HazardReport['road_type'],
  traffic_level: HazardReport['traffic_level']
): number {
  if (traffic_level === 'Extreme' || road_type === 'Transit Corridor') return 20;
  if (traffic_level === 'High' || road_type === 'Arterial') return 16;
  if (traffic_level === 'Moderate' || road_type === 'Sub-arterial') return 12;
  return 8; // Residential / Low
}

/**
 * Composite Risk Score formula as strictly specified:
 * Composite Risk = (depth_cm * 3.5 [max 40]) + ((width_cm / 100) * 20 [max 20]) + (traffic_factor [max 20]) + (reportsCount * 4 [max 20])
 */
export function computeCompositeRiskScore(params: {
  depth_cm: number;
  width_cm: number;
  road_type: HazardReport['road_type'];
  traffic_level: HazardReport['traffic_level'];
  reportsCount: number;
}): {
  compositeScore: number;
  severity: HazardSeverity;
  breakdown: HazardReport['score_breakdown'];
} {
  const { depth_cm, width_cm, road_type, traffic_level, reportsCount } = params;

  // 1. Depth term (max 40)
  const depth_weight = Math.min(40, Math.round(depth_cm * 3.5));

  // 2. Width / Area term (max 20)
  const area_weight = Math.min(20, Math.round((width_cm / 100) * 20));

  // 3. Traffic factor (max 20)
  const traffic_weight = Math.min(20, getTrafficFactor(road_type, traffic_level));

  // 4. Reports count term (max 20) - 4 points per report
  const reports_weight = Math.min(20, Math.round(reportsCount * 4));

  const compositeScore = Math.min(100, Math.max(10, depth_weight + area_weight + traffic_weight + reports_weight));

  let severity: HazardSeverity = 'Low';
  if (compositeScore >= 85) severity = 'Critical';
  else if (compositeScore >= 70) severity = 'High';
  else if (compositeScore >= 45) severity = 'Medium';
  else severity = 'Low';

  return {
    compositeScore,
    severity,
    breakdown: {
      depth_weight,
      area_weight,
      traffic_weight,
      reports_weight,
    },
  };
}

// Initial realistic dataset for Visakhapatnam Wards
export const initialHazards: HazardReport[] = [
  {
    id: 'VH-4092',
    title: 'RK Beach Road Submarine Curve Crater',
    description: 'Submerged asphalt cavity 15m North of INS Kursura Submarine Museum entrance. Severe subgrade washout risk caused by coastal moisture and heavy weekend tourist traffic.',
    location: 'RK Beach Road, opposite INS Kursura Submarine Museum',
    ward: 'Ward 18 - RK Beach & Pandurangapuram',
    wardNumber: 18,
    coordinates: {
      lat: 17.7142,
      lng: 83.3328,
    },
    width_cm: 82,
    depth_cm: 14.2,
    confidence: 97,
    defect_type: 'Pothole',
    severity: 'Critical',
    risk_score: 95,
    previous_risk_score: 91,
    priority_delta: 'up',
    priority_delta_value: 4,
    rankDelta: '+4',
    why_ranked_here: '14.2cm depth + high coastal transit traffic + 6 citizen reports',
    duplicate_count: 6,
    reportsCount: 6,
    status: 'In Progress',
    progress: 65,
    road_type: 'Transit Corridor',
    traffic_level: 'Extreme',
    images: [
      'https://images.unsplash.com/photo-1599423300746-b62533397364?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1576085898323-2183ba9b2203?auto=format&fit=crop&w=800&q=80',
    ],
    photos: [
      'https://images.unsplash.com/photo-1599423300746-b62533397364?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1576085898323-2183ba9b2203?auto=format&fit=crop&w=800&q=80',
    ],
    after_repair_images: [],
    assigned_crew: 'Ward 18 Rapid Action Road Crew Alpha',
    estimated_asphalt_m3: 1.45,
    reported_at: '2026-11-05T08:15:00Z',
    updated_at: '2026-11-05T14:30:00Z',
    score_breakdown: {
      depth_weight: 40,
      area_weight: 16,
      traffic_weight: 20,
      reports_weight: 20,
    },
    activity_history: [
      {
        id: 'act-1',
        timestamp: '08:15 AM',
        actor: 'Citizen Reporter #04',
        action: 'Reported initial pothole with coin reference',
      },
      {
        id: 'act-2',
        timestamp: '09:20 AM',
        actor: 'Citizen Reporter #11',
        action: 'Proximity match (11m) - Merged second report',
      },
      {
        id: 'act-3',
        timestamp: '11:05 AM',
        actor: 'AE K. Rao (Ward 18 Engineer)',
        action: 'Verified on-site: Escalated to Critical (Score 95)',
        note: 'High water ingress near beach wall. Needs rapid cold-mix patching.',
      },
      {
        id: 'act-4',
        timestamp: '02:30 PM',
        actor: 'Municipal Dispatch Team',
        action: 'Assigned to Rapid Action Crew Alpha with 1.5m³ hot-mix allotment',
      },
    ],
  },
  {
    id: 'VH-4105',
    title: 'Gajuwaka Industrial Highway Trench',
    description: 'Deep pavement rutting and transverse depression directly on heavy container lorry lane near Old Gajuwaka junction.',
    location: 'Old Gajuwaka Junction, NH16 Industrial Flyover Approach',
    ward: 'Ward 65 - Gajuwaka Industrial Hub',
    wardNumber: 65,
    coordinates: {
      lat: 17.6895,
      lng: 83.2144,
    },
    width_cm: 94,
    depth_cm: 12.8,
    confidence: 95,
    defect_type: 'Pavement Fracture',
    severity: 'Critical',
    risk_score: 92,
    previous_risk_score: 87,
    priority_delta: 'up',
    priority_delta_value: 5,
    rankDelta: '+5',
    why_ranked_here: '12.8cm cavity + 40-ton trailer corridor + 5 citizen alerts',
    duplicate_count: 5,
    reportsCount: 5,
    status: 'Assigned',
    progress: 40,
    road_type: 'Transit Corridor',
    traffic_level: 'Extreme',
    images: [
      'https://images.unsplash.com/photo-1597393353415-b3730f3719fe?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584713508709-639a85867350?auto=format&fit=crop&w=800&q=80',
    ],
    photos: [
      'https://images.unsplash.com/photo-1597393353415-b3730f3719fe?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584713508709-639a85867350?auto=format&fit=crop&w=800&q=80',
    ],
    after_repair_images: [],
    assigned_crew: 'Zone-V Heavy Industrial Maintenance Unit',
    estimated_asphalt_m3: 2.1,
    reported_at: '2026-11-05T07:45:00Z',
    updated_at: '2026-11-05T13:10:00Z',
    score_breakdown: {
      depth_weight: 40,
      area_weight: 19,
      traffic_weight: 20,
      reports_weight: 20,
    },
    activity_history: [
      {
        id: 'act-g1',
        timestamp: '07:45 AM',
        actor: 'Citizen Commuter',
        action: 'Captured defect via CivicLens mobile upload',
      },
    ],
  },
  {
    id: 'VH-3901',
    title: 'Dwaraka Nagar RTC Complex Depressed Manhole',
    description: 'Sunken storm drain cover with 10.4cm drop off right in the city bus entry lane. Causes sharp swerving by two-wheelers.',
    location: '2nd Lane, Dwaraka Nagar, opposite RTC Complex Gate 2',
    ward: 'Ward 31 - Dwaraka Nagar Commercial Complex',
    wardNumber: 31,
    coordinates: {
      lat: 17.7289,
      lng: 83.3082,
    },
    width_cm: 65,
    depth_cm: 10.4,
    confidence: 93,
    defect_type: 'Sunken Manhole',
    severity: 'High',
    risk_score: 84,
    previous_risk_score: 86,
    priority_delta: 'down',
    priority_delta_value: 2,
    rankDelta: '-2',
    why_ranked_here: '10.4cm sunken rim + dense city bus and scooter volume',
    duplicate_count: 4,
    reportsCount: 4,
    status: 'Verified',
    progress: 25,
    road_type: 'Arterial',
    traffic_level: 'High',
    images: [
      'https://images.unsplash.com/photo-1584463699039-4d04847bf317?auto=format&fit=crop&w=800&q=80',
    ],
    photos: [
      'https://images.unsplash.com/photo-1584463699039-4d04847bf317?auto=format&fit=crop&w=800&q=80',
    ],
    after_repair_images: [],
    assigned_crew: 'Ward 31 Civil Repair Unit',
    estimated_asphalt_m3: 0.9,
    reported_at: '2026-11-04T16:20:00Z',
    updated_at: '2026-11-05T09:40:00Z',
    score_breakdown: {
      depth_weight: 36,
      area_weight: 13,
      traffic_weight: 16,
      reports_weight: 16,
    },
    activity_history: [
      {
        id: 'act-d1',
        timestamp: 'Yesterday 04:20 PM',
        actor: 'Citizen Rider',
        action: 'Logged hazard with GPS accuracy ±2.4m',
      },
    ],
  },
  {
    id: 'VH-4188',
    title: 'MVP Colony Sector 4 Main Arterial Hole',
    description: 'Pothole spanning between center divide and left travel lane near AS Raja Grounds.',
    location: 'Sector 4, MVP Double Road, near AS Raja Grounds',
    ward: 'Ward 22 - MVP Colony Sectors 1-9',
    wardNumber: 22,
    coordinates: {
      lat: 17.7421,
      lng: 83.3402,
    },
    width_cm: 58,
    depth_cm: 8.5,
    confidence: 91,
    defect_type: 'Pothole',
    severity: 'High',
    risk_score: 78,
    previous_risk_score: 78,
    priority_delta: 'same',
    rankDelta: '0',
    why_ranked_here: '8.5cm depth + high school and residential traffic',
    duplicate_count: 3,
    reportsCount: 3,
    status: 'Assigned',
    progress: 45,
    road_type: 'Arterial',
    traffic_level: 'High',
    images: [
      'https://images.unsplash.com/photo-1599423300746-b62533397364?auto=format&fit=crop&w=800&q=80',
    ],
    photos: [
      'https://images.unsplash.com/photo-1599423300746-b62533397364?auto=format&fit=crop&w=800&q=80',
    ],
    after_repair_images: [],
    assigned_crew: 'MVP Sector Engineering Squad',
    estimated_asphalt_m3: 0.75,
    reported_at: '2026-11-05T06:10:00Z',
    updated_at: '2026-11-05T11:20:00Z',
    score_breakdown: {
      depth_weight: 30,
      area_weight: 12,
      traffic_weight: 16,
      reports_weight: 12,
    },
    activity_history: [
      {
        id: 'act-m1',
        timestamp: '06:10 AM',
        actor: 'Citizen Commuter',
        action: 'Initial submission via CivicLens app',
      },
    ],
  },
  {
    id: 'VH-3802',
    title: 'Siripuram Circle AU Campus Approach Depression',
    description: 'Asphalt rutting at vehicular deceleration strip before VIP Road turn.',
    location: 'Siripuram Circle, near Gurajada Kalakshetram',
    ward: 'Ward 19 - Siripuram & AU Campus',
    wardNumber: 19,
    coordinates: {
      lat: 17.7224,
      lng: 83.3188,
    },
    width_cm: 45,
    depth_cm: 6.2,
    confidence: 88,
    defect_type: 'Pavement Fracture',
    severity: 'Medium',
    risk_score: 66,
    previous_risk_score: 62,
    priority_delta: 'up',
    priority_delta_value: 4,
    rankDelta: '+4',
    why_ranked_here: '6.2cm depth + major student motorcycle corridor',
    duplicate_count: 2,
    reportsCount: 2,
    status: 'Reported',
    progress: 10,
    road_type: 'Sub-arterial',
    traffic_level: 'Moderate',
    images: [
      'https://images.unsplash.com/photo-1597393353415-b3730f3719fe?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584713508709-639a85867350?auto=format&fit=crop&w=800&q=80',
    ],
    photos: [
      'https://images.unsplash.com/photo-1597393353415-b3730f3719fe?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584713508709-639a85867350?auto=format&fit=crop&w=800&q=80',
    ],
    after_repair_images: [],
    assigned_crew: 'Zone-IV Maintenance Team',
    estimated_asphalt_m3: 0.5,
    reported_at: '2026-11-05T10:45:00Z',
    updated_at: '2026-11-05T12:00:00Z',
    score_breakdown: {
      depth_weight: 22,
      area_weight: 9,
      traffic_weight: 12,
      reports_weight: 8,
    },
    activity_history: [
      {
        id: 'act-s1',
        timestamp: '10:45 AM',
        actor: 'Citizen Rider',
        action: 'Logged defect via CivicLens mobile portal',
      },
    ],
  },
];

// In-Memory Database store with 15-meter Haversine proximity check & dynamic ranking
class HazardDatabase {
  private hazards: HazardReport[] = [];

  constructor() {
    this.hazards = [...initialHazards];
  }

  getAll(): HazardReport[] {
    return [...this.hazards].sort((a, b) => b.risk_score - a.risk_score);
  }

  getById(id: string): HazardReport | undefined {
    return this.hazards.find((h) => h.id === id);
  }

  // Find hazard within 15 meters using Haversine
  findNearbyHazard(lat: number, lng: number, thresholdMeters = 15): HazardReport | undefined {
    return this.hazards.find((hazard) => {
      if (hazard.status === 'Fixed') return false;
      const dist = calculateDistanceMeters(lat, lng, hazard.coordinates.lat, hazard.coordinates.lng);
      return dist <= thresholdMeters;
    });
  }

  // Handle incoming hazard submission: Deduplicate if within 15m or insert new row
  submitReport(params: {
    lat: number;
    lng: number;
    ward: string;
    locationName?: string;
    imageData: string;
    width_cm: number;
    depth_cm: number;
    confidence: number;
    defect_type: DefectType;
    road_type?: HazardReport['road_type'];
    traffic_level?: HazardReport['traffic_level'];
    why_ranked_here?: string;
  }): {
    merged: boolean;
    parentId?: string;
    reportsCount: number;
    coinsAwarded: number;
    hazard: HazardReport;
    message: string;
  } {
    const nearby = this.findNearbyHazard(params.lat, params.lng, 15);

    if (nearby) {
      // 1. DEDUPLICATION MATCH (Within 15 meters)
      // a) DO NOT create a new database row.
      // b) Append incoming image to existing photos array.
      nearby.images.push(params.imageData);
      if (!nearby.photos) nearby.photos = [...nearby.images];
      else nearby.photos.push(params.imageData);

      // c) Increment reportsCount by 1.
      const previousScore = nearby.risk_score;
      const newReportsCount = (nearby.reportsCount || nearby.duplicate_count || 1) + 1;
      nearby.reportsCount = newReportsCount;
      nearby.duplicate_count = newReportsCount;

      // Update cavity dimensions if newer report shows greater extent
      const updatedDepth = Math.max(nearby.depth_cm, params.depth_cm);
      const updatedWidth = Math.max(nearby.width_cm, params.width_cm);
      nearby.depth_cm = updatedDepth;
      nearby.width_cm = updatedWidth;

      // d) Recalculate Composite Risk Score
      // Composite Risk = (depth_cm * 3.5 [max 40]) + ((width_cm / 100) * 20 [max 20]) + (traffic_factor [max 20]) + (reportsCount * 4 [max 20])
      const { compositeScore, severity, breakdown } = computeCompositeRiskScore({
        depth_cm: updatedDepth,
        width_cm: updatedWidth,
        road_type: nearby.road_type,
        traffic_level: nearby.traffic_level,
        reportsCount: newReportsCount,
      });

      // e) Track rank delta
      const scoreDiff = compositeScore - previousScore;
      nearby.previous_risk_score = previousScore;
      nearby.risk_score = compositeScore;
      nearby.severity = severity;
      nearby.score_breakdown = breakdown;
      nearby.priority_delta = scoreDiff > 0 ? 'up' : scoreDiff < 0 ? 'down' : 'same';
      nearby.priority_delta_value = Math.abs(scoreDiff);
      nearby.rankDelta = scoreDiff > 0 ? `+${scoreDiff}` : scoreDiff < 0 ? `-${Math.abs(scoreDiff)}` : '0';
      nearby.updated_at = new Date().toISOString();
      nearby.why_ranked_here = `${updatedDepth}cm depth + ${nearby.traffic_level.toLowerCase()} traffic + ${newReportsCount} citizen reports`;

      nearby.activity_history.unshift({
        id: `act-${Date.now()}`,
        timestamp: 'Just now',
        actor: `Citizen Report #${newReportsCount}`,
        action: `Geospatial duplicate merged within 15m. Priority escalated from ${previousScore} to ${compositeScore}.`,
      });

      // Dual-Mode Sync: Firestore + Local Mesh Broadcast
      syncHazardToFirestore(nearby).catch(() => { });
      localMesh.broadcast(this.hazards);

      return {
        merged: true,
        parentId: nearby.id,
        reportsCount: newReportsCount,
        coinsAwarded: 0, // Suppress coin reward for duplicate report to prevent abuse
        hazard: nearby,
        message: `Report merged with existing hazard #${nearby.id}. Your input helped escalate its priority!`,
      };
    }

    // 2. NEW HAZARD INSERTION (Outside 15 meters)
    const newId = `VH-${Math.floor(4300 + Math.random() * 600)}`;
    const road_type = params.road_type || 'Arterial';
    const traffic_level = params.traffic_level || 'High';

    const { compositeScore, severity, breakdown } = computeCompositeRiskScore({
      depth_cm: params.depth_cm,
      width_cm: params.width_cm,
      road_type,
      traffic_level,
      reportsCount: 1,
    });

    const newHazard: HazardReport = {
      id: newId,
      title: `${params.ward} Road Hazard`,
      description: `Road defect detected at coordinates ${params.lat.toFixed(4)}° N, ${params.lng.toFixed(4)}° E. Immediate triage requested by citizen.`,
      location: params.locationName || `${params.ward}, Main Link`,
      ward: params.ward,
      wardNumber: parseInt(params.ward.replace(/\D/g, '')) || 18,
      coordinates: {
        lat: params.lat,
        lng: params.lng,
      },
      width_cm: params.width_cm,
      depth_cm: params.depth_cm,
      confidence: params.confidence,
      defect_type: params.defect_type,
      severity,
      risk_score: compositeScore,
      priority_delta: 'same',
      rankDelta: '0',
      why_ranked_here: params.why_ranked_here || `${params.depth_cm}cm depth + ${traffic_level.toLowerCase()} traffic + initial citizen report`,
      duplicate_count: 1,
      reportsCount: 1,
      status: 'Reported',
      progress: 10,
      road_type,
      traffic_level,
      images: [params.imageData],
      photos: [params.imageData],
      after_repair_images: [],
      reported_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      score_breakdown: breakdown,
      estimated_asphalt_m3: Number(((params.width_cm * params.width_cm * params.depth_cm * 0.000001) * 1.3).toFixed(2)) || 0.45,
      activity_history: [
        {
          id: `act-${Date.now()}`,
          timestamp: 'Just now',
          actor: 'Citizen Reporter',
          action: 'Initial hazard report logged via CivicLens citizen portal',
        },
      ],
    };

    this.hazards.unshift(newHazard);

    // Dual-Mode Sync: Firestore + Local Mesh Broadcast
    syncHazardToFirestore(newHazard).catch(() => { });
    localMesh.broadcast(this.hazards);

    return {
      merged: false,
      reportsCount: 1,
      coinsAwarded: 50, // Award +50 Civic Coins for verified new unique hazard
      hazard: newHazard,
      message: `New hazard ticket #${newId} registered and prioritized in Live Queue.`,
    };
  }

  updateHazard(id: string, updates: Partial<HazardReport> & { activityNote?: string; actor?: string }): HazardReport | undefined {
    const hazard = this.getById(id);
    if (!hazard) return undefined;

    const previousStatus = hazard.status;

    if (updates.status && updates.status !== previousStatus) {
      hazard.status = updates.status;
      if (updates.status === 'Reported') hazard.progress = 10;
      else if (updates.status === 'Verified') hazard.progress = 30;
      else if (updates.status === 'Assigned') hazard.progress = 50;
      else if (updates.status === 'In Progress') hazard.progress = 75;
      else if (updates.status === 'Fixed') hazard.progress = 100;
    }

    if (updates.progress !== undefined) hazard.progress = updates.progress;
    if (updates.assigned_crew) hazard.assigned_crew = updates.assigned_crew;
    if (updates.after_repair_images) {
      hazard.after_repair_images = [...(hazard.after_repair_images || []), ...updates.after_repair_images];
    }

    hazard.updated_at = new Date().toISOString();

    if (updates.activityNote || updates.status !== previousStatus) {
      hazard.activity_history.unshift({
        id: `act-${Date.now()}`,
        timestamp: 'Just now',
        actor: updates.actor || 'Ward Engineer',
        action: updates.status && updates.status !== previousStatus
          ? `Status updated: ${previousStatus} → ${updates.status}`
          : 'Hazard record updated',
        note: updates.activityNote,
        photoUrl: updates.after_repair_images?.[0],
      });
    }

    // Dual-Mode Sync: Firestore + Local Mesh Broadcast
    syncHazardToFirestore(hazard).catch(() => { });
    localMesh.broadcast(this.hazards);

    return hazard;
  }
}

export const db = new HazardDatabase();
