export type HazardSeverity = 'Critical' | 'High' | 'Medium' | 'Low';

export type SeverityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export type HazardStatus = 'Reported' | 'Verified' | 'Assigned' | 'In Progress' | 'Fixed';

export type ScaleReference = 'no_reference' | 'coin_10' | 'a4_sheet';

export type DefectType =
  | 'Pothole'
  | 'Road Crack'
  | 'Damaged Road Surface'
  | 'Waterlogging'
  | 'Open Manhole'
  | 'Road Obstruction'
  | 'Normal Road Condition'
  | 'Inconclusive'
  | 'Sunken Manhole'
  | 'Pavement Fracture'
  | 'Edge Drop-off'
  | 'None';

export interface ActivityLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  note?: string;
  photoUrl?: string;
}

export interface HazardReport {
  id: string;
  title: string;
  description: string;
  location: string;
  ward: string;
  wardNumber: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  width_cm: number;
  depth_cm: number;
  confidence: number;
  defect_type: DefectType;
  severity: SeverityLevel;
  risk_score: number;
  previous_risk_score?: number;
  priority_delta?: 'up' | 'down' | 'same';
  priority_delta_value?: number;
  rankDelta?: string; // e.g. "+3", "+5", "0"
  why_ranked_here: string;
  duplicate_count: number;
  reportsCount: number; // alias for duplicate_count
  status: HazardStatus;
  progress: number;
  road_type: 'Arterial' | 'Transit Corridor' | 'Sub-arterial' | 'Collector' | 'Residential';
  traffic_level: 'Extreme' | 'High' | 'Moderate' | 'Low';
  images: string[];
  photos?: string[]; // alias for images
  after_repair_images?: string[];
  assigned_crew?: string;
  estimated_asphalt_m3?: number;
  reported_at: string;
  updated_at: string;
  activity_history: ActivityLog[];
  score_breakdown: {
    depth_weight: number;  // depth_cm * 3.5 [max 40]
    area_weight: number;   // (width_cm / 100) * 20 [max 20]
    traffic_weight: number; // traffic factor [max 20]
    reports_weight: number; // reportsCount * 4 [max 20]
  };
}

export interface GeminiAnalysisResult {
  is_hazard: boolean;
  detected_condition: string;
  defect_type: DefectType;
  width_cm: number;
  depth_cm: number;
  confidence: number;
  severity_level: 'Critical' | 'High' | 'Medium' | 'Low' | 'None';
  base_risk_score: number; // 0 to 100
  explanation: string;
  why_ranked_here: string; // Concise engineering justification
  recommended_action: string;
  is_inconclusive?: boolean;
  scale_reference_used?: ScaleReference;
  error?: string;
}

export interface OfflineReport {
  id: string;
  timestamp: number;
  imageData: string;
  scaleReference?: ScaleReference;
  ward: string;
  roadType?: string;
  coordinates: {
    lat: number;
    lng: number;
    accuracy?: number;
  };
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  error?: string;
}

export interface Coupon {
  id: string;
  title: string;
  brand: string;
  category: 'food' | 'clothing' | 'groceries';
  discount: string;
  coinCost: number;
  description: string;
  code: string;
  expiryDays: number;
  badge: string;
  bgGradient: string;
}

export type UserRole = 'citizen' | 'engineer';

export interface GeocodeResponse {
  address: string;
  streetName: string;
  sublocality: string;
  postalCode?: string;
  wardName: string;
  isFallback: boolean;
}

export interface OptimizedWaypoint {
  id: string;
  originalIndex: number;
  optimizedSequence: number;
  lat: number;
  lng: number;
  locationName: string;
  priorityScore: number;
  asphalt_m3?: number;
}

export interface RouteOptimizationResponse {
  totalDistanceKm: number;
  totalDurationMinutes: number;
  orderedHazards: OptimizedWaypoint[];
  encodedPolyline?: string;
  isFallback: boolean;
  depotLocation: {
    lat: number;
    lng: number;
    name: string;
  };
}

export interface RepairVerificationResponse {
  is_location_match: boolean;
  repair_verified: boolean;
  compaction_quality_score: number; // 0 to 100
  contractor_audit_verdict: 'APPROVED_CLOSED' | 'REJECTED_REWORK_REQUIRED';
  engineering_remarks: string; // 1-2 sentence civil audit summary
  verification_timestamp?: string;
  is_fallback?: boolean;
}
