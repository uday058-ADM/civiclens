export type TranslationKey =
  | 'CIVICLENS_PLATFORM'
  | 'VIZAG_LOCATION'
  | 'THE_MISSION'
  | 'MISSION_TEXT'
  | 'FATALITIES_TITLE'
  | 'FATALITIES_SOURCE'
  | 'TWO_WHEELER_TITLE'
  | 'TWO_WHEELER_DESC'
  | 'BRIDGE_GOVERNANCE_TITLE'
  | 'BRIDGE_GOVERNANCE_DESC'
  | 'OPERATIONAL_METRICS'
  | 'DEDUPLICATION'
  | 'ACCURACY'
  | 'ACTIVE_SCOUTS'
  | 'STORAGE_STATE'
  | 'SYNCED_LOCAL'
  | 'CLEAR_APP_DATA'
  | 'REPORT_HAZARD'
  | 'REPORT_HAZARD_DESC'
  | 'CAPTURE_PHOTO'
  | 'RECORD_VIDEO'
  | 'UPLOAD_FILE'
  | 'PHOTO_DESC'
  | 'VIDEO_DESC'
  | 'UPLOAD_DESC'
  | 'GEMINI_KEY_OPTIONAL'
  | 'SAVE_KEY'
  | 'LOCATING'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'ERROR'
  | 'INFO'
  | 'CITIZEN'
  | 'WARD_AE'
  | 'SYNC_READY'
  | 'POINTS'
  | 'LIVE_REC'
  | 'SOCIETAL_VALUE_TITLE'
  | 'SOCIETAL_VALUE_DESC'
  | 'WHY_REPORT_TITLE'
  | 'PREVENT_FATALITIES_TITLE'
  | 'PREVENT_FATALITIES_DESC'
  | 'EARN_REWARDS_TITLE'
  | 'EARN_REWARDS_DESC'
  | 'DIRECT_GOVERNANCE_TITLE'
  | 'DIRECT_GOVERNANCE_DESC'
  | 'CITIZEN_USEFULNESS_TITLE'
  | 'CITIZEN_USEFULNESS_DESC'
  | 'LANGUAGE_EN'
  | 'LANGUAGE_TEL'
  | 'NAV_REPORT'
  | 'NAV_CLUSTER'
  | 'NAV_REWARDS'
  | 'NAV_MAP'
  | 'NAV_WORKS'
  | 'NAV_STATS'
  | 'LIVE_CLUSTER_FEED'
  | 'LIVE_CLUSTER_DESC'
  | 'SYNCED'
  | 'REFRESH_FEED'
  | 'SEARCH_LOCATION'
  | 'ALL_WARDS'
  | 'WARD_18'
  | 'WARD_31'
  | 'WARD_22'
  | 'WARD_65'
  | 'ALL_SEVERITIES'
  | 'CRITICAL_FILTER'
  | 'HIGH_FILTER'
  | 'MEDIUM_FILTER'
  | 'LOW_FILTER'
  | 'NO_MATCHING_HAZARDS'
  | 'REPORTS'
  | 'RISK'
  | 'WIDTH'
  | 'DEPTH'
  | 'JUSTIFICATION_DEPTH'
  | 'JUSTIFICATION_TRAFFIC'
  | 'CITIZEN_REPORTS'
  | 'LIVE_URBAN_TRIAGE'
  | 'SAMPLE_PROJECTED_DATA'
  | 'TELEMETRY_SYNCED'
  | 'TOTAL_HAZARDS'
  | 'LOGGED_ALL_ZONES'
  | 'CRITICAL_OPEN'
  | 'IMMEDIATE_CORDON'
  | 'BUS_ROUTE_DEPTH'
  | 'FIXED_THIS_WEEK'
  | 'VS_LAST_WEEK'
  | 'RESURFACED_CLOSED'
  | 'AVG_TRIAGE_TIME'
  | 'TRIAGE_SPEED'
  | 'CAPTURE_TO_CREW'
  | 'DUPLICATES_MERGED'
  | 'RADIUS_15M'
  | 'REDUNDANT_TICKETS'
  | 'RISK_DISTRIBUTION'
  | 'CURRENT_ACTIVE'
  | 'TOTAL_SITES'
  | 'SEVERITY_CRITICAL'
  | 'SEVERITY_HIGH'
  | 'SEVERITY_MEDIUM'
  | 'SEVERITY_LOW'
  | 'HAZARD_DENSITY_BY_WARD'
  | 'VULNERABILITY_DESCRIPTION'
  | 'TOP_FIVE_SECTORS'
  | 'CRITICAL_COUNT'
  | 'TOTAL_COUNT'
  | 'RED_SEGMENT'
  | 'AMBER_SEGMENT'
  | 'TWO_WHEELER_RIDERS'
  | 'DELIVERY_RIDER_RISK'
  | 'PILOT_SAAS_MODEL'
  | 'NETWORK_COVERAGE'
  | 'GLOBAL_IMPACT_METRICS'
  | 'AI_VERIFICATION_ENGINE'
  | 'SIGNAL_NOISE_REDUCTION'
  | 'FATALITIES_TWO_WHEELERS'
  | 'GIG_RIDER_RISK'
  | 'DIRECT_IMPACT'
  | 'DIRECT_IMPACT_DESC'
  | 'XP_REWARDS'
  | 'XP_REWARDS_DESC'
  | 'DIGITAL_GOVERNANCE_BRIDGE'
  | 'CIVIC_RESPONSIBILITY_ACTION'
  | 'TRANSPARENT_PROGRESS'
  | 'SAFER_COMMUTES'
  | 'GOVERNMENT_ACCOUNTABILITY'
  | 'PRECISION_LOCATION_REQUIRED'
  | 'USE_EXACT_GPS'
  | 'ACQUIRING_GPS'
  | 'GPS_ACTIVE'
  | 'GPS_PERMISSION_DENIED'
  | 'LOCATION_UNAVAILABLE'
  | 'LOCATION_REQUIRED_TO_REPORT'
  | 'GPS_CAPTURED'
  | 'GPS_TIMEOUT'
  | 'ALLOW_LOCATION_PERMISSION'
  | 'SEVERITY_LABEL'
  | 'STATUS_REPORTED'
  | 'STATUS_VERIFIED'
  | 'STATUS_ASSIGNED'
  | 'STATUS_IN_PROGRESS'
  | 'STATUS_FIXED'
  | 'DEFECT_POTHOLE'
  | 'DEFECT_PAVEMENT_FRACTURE'
  | 'DEFECT_SUNKEN_MANHOLE'
  | 'TRAFFIC_EXTREME'
  | 'TRAFFIC_HIGH'
  | 'TRAFFIC_MODERATE'
  | 'TRAFFIC_LOW'
  | 'CLUSTER_LOCATION_4092'
  | 'CLUSTER_LOCATION_4105'
  | 'CLUSTER_LOCATION_3901'
  | 'CLUSTER_LOCATION_4188'
  | 'CLUSTER_LOCATION_3802'
  | 'COMMUNITY_VALUE_DESCRIPTION'
  | 'COMMUNITY_IMAGE_ALT'
  | 'LOCATION_NOT_CAPTURED'
  | 'WARD_19'
  | 'JUST_NOW'
  | 'GPS_ACCURACY_GUIDANCE'
  | 'GPS_TARGET_REACHED'
  | 'GPS_BEST_AVAILABLE';

export const translations: Record<'EN' | 'TEL', Record<TranslationKey, string>> = {
  EN: {
    CIVICLENS_PLATFORM: 'CIVICLENS',
    VIZAG_LOCATION: 'Smart City Governance Bridge',
    THE_MISSION: 'BRIDGING THE GOVERNANCE GAP',
    MISSION_TEXT: 'CivicLens serves as a high-precision digital bridge between citizens and government authorities. We empower communities to report real-world infrastructure hazards, providing government engineers with actionable, AI-verified data to prioritize repairs and ensure public safety.',
    FATALITIES_TITLE: 'Pothole-related road fatalities in India (2020-2024)',
    FATALITIES_SOURCE: 'Source: National Road Safety Records',
    TWO_WHEELER_TITLE: 'Vulnerable Commuter Safety',
    TWO_WHEELER_DESC: 'Providing a voice for two-wheeler riders who face the highest risk from surface hazards.',
    BRIDGE_GOVERNANCE_TITLE: 'Direct Action Pipeline',
    BRIDGE_GOVERNANCE_DESC: 'Transforming citizen reports into municipal work orders with 96% accuracy.',
    OPERATIONAL_METRICS: 'PLATFORM OPERATIONAL INTELLIGENCE',
    DEDUPLICATION: 'SIGNAL DEDUPLICATION',
    ACCURACY: 'VERIFICATION ACCURACY',
    ACTIVE_SCOUTS: 'COMMUNITY SCOUTS',
    STORAGE_STATE: 'Network Status',
    SYNCED_LOCAL: 'Cloud Synchronized',
    CLEAR_APP_DATA: 'RESET PLATFORM DATA',
    REPORT_HAZARD: 'REPORT CIVIC HAZARD',
    REPORT_HAZARD_DESC: 'Empower your city. Upload infrastructure issues directly to the government triage dashboard.',
    CAPTURE_PHOTO: 'Live Snap',
    RECORD_VIDEO: 'Visual Evidence',
    UPLOAD_FILE: 'Gallery Upload',
    PHOTO_DESC: 'Capture immediate hazard details',
    VIDEO_DESC: 'Document environmental context',
    UPLOAD_DESC: 'Select existing evidence',
    GEMINI_KEY_OPTIONAL: 'AI Analysis Engine Key (Optional)',
    SAVE_KEY: 'Activate Engine',
    LOCATING: 'Triangulating...',
    PROCESSING: 'AI Verification in Progress...',
    SUCCESS: 'Report Transmitted',
    ERROR: 'System Error',
    INFO: 'System Notification',
    CITIZEN: 'Citizen Portal',
    WARD_AE: 'Government Dashboard',
    SYNC_READY: 'UPLINK READY',
    POINTS: 'CIVIC XP',
    LIVE_REC: 'ACTIVE MONITOR',
    SOCIETAL_VALUE_TITLE: 'YOUR REPORT SAVES LIVES.',
    SOCIETAL_VALUE_DESC: 'Every hazard reported is a potential accident prevented. By bridging the gap between citizens and government, we ensure our roads are safe for every commuter, every family, and every child.',
    WHY_REPORT_TITLE: 'Why Report?',
    PREVENT_FATALITIES_TITLE: 'Prevent Fatalities',
    PREVENT_FATALITIES_DESC: 'Road hazards are responsible for over 9,000 deaths annually. Your report helps lower this number.',
    EARN_REWARDS_TITLE: 'Earn Rewards',
    EARN_REWARDS_DESC: 'Verified reports earn you Civic XP, which can be redeemed for community benefits.',
    DIRECT_GOVERNANCE_TITLE: 'Direct Governance',
    DIRECT_GOVERNANCE_DESC: 'Skip the paperwork. Your report goes straight to the engineer responsible for your ward.',
    CITIZEN_USEFULNESS_TITLE: 'Empowering Citizens',
    CITIZEN_USEFULNESS_DESC: 'CivicLens provides a transparent platform where citizens can see their contributions making a real difference in their neighborhoods.',
    LANGUAGE_EN: 'EN',
    LANGUAGE_TEL: 'తెలుగు',
    NAV_REPORT: 'Report Hazard',
    NAV_CLUSTER: 'Cluster Feed',
    NAV_REWARDS: 'Rewards & Coupons',
    NAV_MAP: 'Vizag Traffic Map',
    NAV_WORKS: 'Work Orders',
    NAV_STATS: 'About & Stats',
    LIVE_CLUSTER_FEED: 'Live Cluster Feed & Triage',
    LIVE_CLUSTER_DESC: 'Real-time proximity deduplication and dynamic risk-priority queue.',
    SYNCED: 'Synced',
    REFRESH_FEED: 'Refresh Feed',
    SEARCH_LOCATION: 'Search location, ward, or ID...',
    ALL_WARDS: 'All Wards (GVMC)',
    WARD_18: 'Ward 18 (RK Beach & Pandurangapuram)',
    WARD_31: 'Ward 31 (Dwaraka Nagar Commercial)',
    WARD_22: 'Ward 22 (MVP Colony Sectors 1-9)',
    WARD_65: 'Ward 65 (Gajuwaka Industrial Hub)',
    ALL_SEVERITIES: 'All Severities',
    CRITICAL_FILTER: 'Critical (Risk > 85)',
    HIGH_FILTER: 'High (Risk 70-85)',
    MEDIUM_FILTER: 'Medium (Risk 45-70)',
    LOW_FILTER: 'Low (Risk < 45)',
    NO_MATCHING_HAZARDS: 'No hazards match the current filters.',
    REPORTS: 'Reports',
    RISK: 'Risk',
    WIDTH: 'W',
    DEPTH: 'D',
    JUSTIFICATION_DEPTH: 'depth',
    JUSTIFICATION_TRAFFIC: 'traffic',
    CITIZEN_REPORTS: 'citizen reports',
    LIVE_URBAN_TRIAGE: 'LIVE URBAN TRIAGE',
    SAMPLE_PROJECTED_DATA: 'Sample / Projected Data',
    TELEMETRY_SYNCED: 'Telemetry Synced (100% Wards)',
    TOTAL_HAZARDS: 'Total Hazards',
    LOGGED_ALL_ZONES: 'Logged across all 7 zones',
    CRITICAL_OPEN: 'Critical Open',
    IMMEDIATE_CORDON: 'Immediate cordon',
    BUS_ROUTE_DEPTH: '>8.0cm depth on bus routes',
    FIXED_THIS_WEEK: 'Fixed This Week',
    VS_LAST_WEEK: 'vs last week',
    RESURFACED_CLOSED: 'Resurfaced & closed',
    AVG_TRIAGE_TIME: 'Avg Triage Time',
    TRIAGE_SPEED: 'faster',
    CAPTURE_TO_CREW: 'From capture to crew',
    DUPLICATES_MERGED: 'Duplicates Merged',
    RADIUS_15M: '15m radius',
    REDUNDANT_TICKETS: 'Redundant tickets saved',
    RISK_DISTRIBUTION: 'Risk Distribution',
    CURRENT_ACTIVE: 'Current active',
    TOTAL_SITES: 'Total Sites',
    SEVERITY_CRITICAL: 'Critical',
    SEVERITY_HIGH: 'High',
    SEVERITY_MEDIUM: 'Medium',
    SEVERITY_LOW: 'Low',
    HAZARD_DENSITY_BY_WARD: 'Hazard Density by Visakhapatnam Ward',
    VULNERABILITY_DESCRIPTION: 'Vulnerability scores based on heavy traffic and coastal rainfall.',
    TOP_FIVE_SECTORS: 'Top 5 Sectors',
    CRITICAL_COUNT: 'Critical',
    TOTAL_COUNT: 'Total',
    RED_SEGMENT: 'Red: Immediate two-wheeler hazards',
    AMBER_SEGMENT: 'Amber: Maintenance priority',
    TWO_WHEELER_RIDERS: 'Fatalities are two-wheeler riders',
    DELIVERY_RIDER_RISK: 'Delivery riders face the greatest road-surface risk',
    PILOT_SAAS_MODEL: '6-Month Pilot SaaS Model',
    NETWORK_COVERAGE: 'Coverage across 100 km of GVMC arterial roads',
    GLOBAL_IMPACT_METRICS: 'Global Impact Metrics',
    AI_VERIFICATION_ENGINE: 'AI Verification Engine',
    SIGNAL_NOISE_REDUCTION: 'Signal Noise Reduction',
    FATALITIES_TWO_WHEELERS: 'Fatalities are two-wheeler riders',
    GIG_RIDER_RISK: 'Delivery riders face the greatest road-surface risk',
    DIRECT_IMPACT: 'Direct Impact',
    DIRECT_IMPACT_DESC: 'Reports go directly to ward engineers, helping reduce delays.',
    XP_REWARDS: 'Civic Rewards',
    XP_REWARDS_DESC: 'Earn points for verified reports and redeem community coupons.',
    DIGITAL_GOVERNANCE_BRIDGE: 'Digital Governance Bridge',
    CIVIC_RESPONSIBILITY_ACTION: 'Turning civic responsibility into action.',
    TRANSPARENT_PROGRESS: 'Transparent Progress Tracking',
    SAFER_COMMUTES: 'Safer Commutes for Everyone',
    GOVERNMENT_ACCOUNTABILITY: 'Stronger Government Accountability',
    PRECISION_LOCATION_REQUIRED: 'Allow device location to attach your exact coordinates to this report.',
    USE_EXACT_GPS: 'Use My Exact GPS Location',
    ACQUIRING_GPS: 'Acquiring GPS...',
    GPS_ACTIVE: 'GPS Active',
    GPS_PERMISSION_DENIED: 'Permission Denied',
    LOCATION_UNAVAILABLE: 'Location Unavailable',
    LOCATION_REQUIRED_TO_REPORT: 'Capture your GPS location before submitting a report.',
    GPS_CAPTURED: 'GPS location captured.',
    GPS_TIMEOUT: 'Unable to obtain GPS fix within timeout. Please ensure location services are enabled.',
    ALLOW_LOCATION_PERMISSION: 'Allow location access in your browser settings and try again.',
    GPS_ACCURACY_GUIDANCE: 'Active satellite and network triangulation ready. Tap below to capture live coordinates.',
    GPS_TARGET_REACHED: 'High-precision GPS fix locked',
    GPS_BEST_AVAILABLE: 'GPS position locked with live coordinates',
    SEVERITY_LABEL: 'Severity',
    STATUS_REPORTED: 'Reported',
    STATUS_VERIFIED: 'Verified',
    STATUS_ASSIGNED: 'Assigned',
    STATUS_IN_PROGRESS: 'In Progress',
    STATUS_FIXED: 'Fixed',
    DEFECT_POTHOLE: 'Pothole',
    DEFECT_PAVEMENT_FRACTURE: 'Pavement Fracture',
    DEFECT_SUNKEN_MANHOLE: 'Sunken Manhole',
    TRAFFIC_EXTREME: 'extreme traffic',
    TRAFFIC_HIGH: 'high traffic',
    TRAFFIC_MODERATE: 'moderate traffic',
    TRAFFIC_LOW: 'low traffic',
    CLUSTER_LOCATION_4092: 'RK Beach Road, opposite INS Kursura Submarine Museum',
    CLUSTER_LOCATION_4105: 'Old Gajuwaka Junction, NH16 Industrial Flyover Approach',
    CLUSTER_LOCATION_3901: '2nd Lane, Dwaraka Nagar, opposite RTC Complex Gate 2',
    CLUSTER_LOCATION_4188: 'Sector 4, MVP Double Road, near AS Raja Grounds',
    CLUSTER_LOCATION_3802: 'Siripuram Circle, near Gurajada Kalakshetram',
    COMMUNITY_VALUE_DESCRIPTION: 'CivicLens is built on the belief that local knowledge can improve our city. When residents report a road hazard, they help city teams find problems and prioritize repairs.',
    COMMUNITY_IMAGE_ALT: 'Community members working together',
    LOCATION_NOT_CAPTURED: 'Location not captured',
    WARD_19: 'Ward 19 (Siripuram & AU Campus)',
    JUST_NOW: 'Just now',
  },
  TEL: {
    CIVICLENS_PLATFORM: 'సివిక్ లెన్స్',
    VIZAG_LOCATION: 'స్మార్ట్ సిటీ గవర్నెన్స్ బ్రిడ్జ్',
    THE_MISSION: 'ప్రభుత్వానికి మరియు ప్రజలకు మధ్య వారధి',
    MISSION_TEXT: 'సివిక్ లెన్స్ పౌరులకు మరియు ప్రభుత్వ అధికారులకు మధ్య ఒక డిజిటల్ వారధిగా పనిచేస్తుంది. మౌలిక సదుపాయాల సమస్యలను నివేదించడానికి మేము ప్రజలకు శక్తిని ఇస్తాము, తద్వారా ప్రభుత్వ ఇంజనీర్లు త్వరితగతిన చర్యలు తీసుకోగలరు.',
    FATALITIES_TITLE: 'భారతదేశంలో రోడ్డు ప్రమాదాల మరణాలు (2020-2024)',
    FATALITIES_SOURCE: 'మూలం: జాతీయ రహదారి భద్రత రికార్డులు',
    TWO_WHEELER_TITLE: 'ప్రయాణీకుల భద్రత',
    TWO_WHEELER_DESC: 'ఉపరితల ప్రమాదాల నుండి ద్విచక్ర వాహనదారుల రక్షణ కోసం.',
    BRIDGE_GOVERNANCE_TITLE: 'ప్రత్యక్ష కార్యాచరణ పైప్‌లైన్',
    BRIDGE_GOVERNANCE_DESC: '96% ఖచ్చితత్వంతో పౌరుల నివేదికలను మున్సిపల్ పని ఆదేశాలుగా మార్చడం.',
    OPERATIONAL_METRICS: 'ప్లాట్‌ఫాం కార్యాచరణ కొలమానాలు',
    DEDUPLICATION: 'నకిలీల తొలగింపు',
    ACCURACY: 'ఖచ్చితత్వం',
    ACTIVE_SCOUTS: 'క్రియాశీల స్కౌట్స్',
    STORAGE_STATE: 'నెట్‌వర్క్ స్థితి',
    SYNCED_LOCAL: 'క్లౌడ్‌తో సమకాలీకరించబడింది',
    CLEAR_APP_DATA: 'ప్లాట్‌ఫాం డేటాను రీసెట్ చేయండి',
    REPORT_HAZARD: 'పౌర సమస్యను నివేదించండి',
    REPORT_HAZARD_DESC: 'మీ నగరాన్ని శక్తివంతం చేయండి. మౌలిక సదుపాయాల సమస్యలను నేరుగా ప్రభుత్వానికి నివేదించండి.',
    CAPTURE_PHOTO: 'లైవ్ స్నాప్',
    RECORD_VIDEO: 'దృశ్య సాక్ష్యం',
    UPLOAD_FILE: 'గ్యాలరీ అప్‌లోడ్',
    PHOTO_DESC: 'తక్షణ ప్రమాద వివరాలను తీయండి',
    VIDEO_DESC: 'పర్యావరణ సందర్భాన్ని డాక్యుమెంట్ చేయండి',
    UPLOAD_DESC: 'ఉన్న సాక్ష్యాన్ని ఎంచుకోండి',
    GEMINI_KEY_OPTIONAL: 'AI విశ్లేషణ ఇంజిన్ కీ (ఐచ్ఛికం)',
    SAVE_KEY: 'ఇంజిన్‌ను ప్రారంభించండి',
    LOCATING: 'గుర్తిస్తోంది...',
    PROCESSING: 'AI వెరిఫికేషన్ జరుగుతోంది...',
    SUCCESS: 'నివేదిక పంపబడింది',
    ERROR: 'సిస్టమ్ లోపం',
    INFO: 'సిస్టమ్ నోటిఫికేషన్',
    CITIZEN: 'పౌర పోర్టల్',
    WARD_AE: 'ప్రభుత్వ డాష్‌బోర్డ్',
    SYNC_READY: 'అప్‌లింక్ సిద్ధంగా ఉంది',
    POINTS: 'సివిక్ పాయింట్లు',
    LIVE_REC: 'యాక్టివ్ మానిటర్',
    SOCIETAL_VALUE_TITLE: 'మీ నివేదిక ప్రాణాలను కాపాడుతుంది.',
    SOCIETAL_VALUE_DESC: 'నివేదించబడిన ప్రతి ప్రమాదం ఒక సంభావ్య ప్రమాదాన్ని నివారిస్తుంది. పౌరులు మరియు ప్రభుత్వం మధ్య అంతరాన్ని తగ్గించడం ద్వారా, మేము మా రోడ్లను సురక్షితంగా ఉంచుతాము.',
    WHY_REPORT_TITLE: 'ఎందుకు నివేదించాలి?',
    PREVENT_FATALITIES_TITLE: 'మరణాలను నివారించండి',
    PREVENT_FATALITIES_DESC: 'రోడ్డు ప్రమాదాల వల్ల ఏటా 9,000 మందికి పైగా మరణిస్తున్నారు. మీ నివేదిక ఈ సంఖ్యను తగ్గించడంలో సహాయపడుతుంది.',
    EARN_REWARDS_TITLE: 'బహుమతులు పొందండి',
    EARN_REWARDS_DESC: 'ధృవీకరించబడిన నివేదికలు మీకు సివిక్ ఎక్స్‌పిని సంపాదిస్తాయి, వీటిని సామాజిక ప్రయోజనాల కోసం ఉపయోగించవచ్చు.',
    DIRECT_GOVERNANCE_TITLE: 'ప్రత్యక్ష పాలన',
    DIRECT_GOVERNANCE_DESC: 'కాగితపు పనిని వదిలేయండి. మీ నివేదిక నేరుగా మీ వార్డుకు బాధ్యత వహించే ఇంజనీర్‌కు వెళుతుంది.',
    CITIZEN_USEFULNESS_TITLE: 'పౌరుల సముద్ధరణ',
    CITIZEN_USEFULNESS_DESC: 'సివిక్ లెన్స్ పౌరులకు తమ సహకారం తమ పరిసరాల్లో నిజమైన మార్పును చూపుతుందని చూసేందుకు ఒక పారదర్శక ప్లాట్‌ఫారమ్‌ను అందిస్తుంది.',
    LANGUAGE_EN: 'EN',
    LANGUAGE_TEL: 'తెలుగు',
    NAV_REPORT: 'రోడ్డు సమస్యను నివేదించండి',
    NAV_CLUSTER: 'సమస్యల జాబితా',
    NAV_REWARDS: 'బహుమతులు మరియు కూపన్లు',
    NAV_MAP: 'విశాఖ ట్రాఫిక్ మ్యాప్',
    NAV_WORKS: 'పనుల ఆదేశాలు',
    NAV_STATS: 'సమాచారం మరియు గణాంకాలు',
    LIVE_CLUSTER_FEED: 'తక్షణ సమస్యల జాబితా మరియు పరిశీలన',
    LIVE_CLUSTER_DESC: 'సమీపంలో ఉన్న ఫిర్యాదుల సమీకరణ మరియు ప్రమాద ప్రాధాన్యత క్రమం.',
    SYNCED: 'సమకాలీకరణ',
    REFRESH_FEED: 'జాబితాను రిఫ్రెష్ చేయండి',
    SEARCH_LOCATION: 'ప్రాంతం, వార్డు లేదా ఐడీని వెతకండి...',
    ALL_WARDS: 'అన్ని వార్డులు (GVMC)',
    WARD_18: 'వార్డు 18 (ఆర్కే బీచ్ మరియు పాండురంగపురం)',
    WARD_31: 'వార్డు 31 (ద్వారకా నగర్ వాణిజ్య ప్రాంతం)',
    WARD_22: 'వార్డు 22 (ఎంవీపీ కాలనీ సెక్టర్లు 1-9)',
    WARD_65: 'వార్డు 65 (గాజువాక పారిశ్రామిక కేంద్రం)',
    ALL_SEVERITIES: 'అన్ని తీవ్రతలు',
    CRITICAL_FILTER: 'అత్యంత ప్రమాదకరం (ప్రమాద స్కోరు > 85)',
    HIGH_FILTER: 'అధికం (ప్రమాద స్కోరు 70-85)',
    MEDIUM_FILTER: 'మధ్యస్థం (ప్రమాద స్కోరు 45-70)',
    LOW_FILTER: 'తక్కువ (ప్రమాద స్కోరు < 45)',
    NO_MATCHING_HAZARDS: 'ప్రస్తుత ఫిల్టర్లకు సరిపడే సమస్యలు లేవు.',
    REPORTS: 'నివేదికలు',
    RISK: 'ప్రమాదం',
    WIDTH: 'వెడల్పు',
    DEPTH: 'లోతు',
    JUSTIFICATION_DEPTH: 'లోతు',
    JUSTIFICATION_TRAFFIC: 'ట్రాఫిక్',
    CITIZEN_REPORTS: 'పౌరుల నివేదికలు',
    LIVE_URBAN_TRIAGE: 'నగర సమస్యల తక్షణ పరిశీలన',
    SAMPLE_PROJECTED_DATA: 'నమూనా / అంచనా డేటా',
    TELEMETRY_SYNCED: 'టెలిమెట్రీ సమకాలీకరించబడింది (100% వార్డులు)',
    TOTAL_HAZARDS: 'మొత్తం రోడ్డు సమస్యలు',
    LOGGED_ALL_ZONES: 'మొత్తం 7 జోన్లలో నమోదు',
    CRITICAL_OPEN: 'తీవ్రమైన పరిష్కారం కాని సమస్యలు',
    IMMEDIATE_CORDON: 'వెంటనే ప్రాంతాన్ని మూసివేయండి',
    BUS_ROUTE_DEPTH: 'బస్సు మార్గాల్లో 8 సెం.మీ. కంటే ఎక్కువ లోతు',
    FIXED_THIS_WEEK: 'ఈ వారం పరిష్కరించినవి',
    VS_LAST_WEEK: 'గత వారంతో పోలిస్తే',
    RESURFACED_CLOSED: 'రోడ్డు పునరుద్ధరించి ముగించినవి',
    AVG_TRIAGE_TIME: 'సగటు పరిశీలన సమయం',
    TRIAGE_SPEED: 'వేగంగా',
    CAPTURE_TO_CREW: 'ఫోటో తీసినప్పటి నుండి సిబ్బంది కేటాయింపు వరకు',
    DUPLICATES_MERGED: 'సమీకరించిన నకిలీ నివేదికలు',
    RADIUS_15M: '15 మీటర్ల పరిధి',
    REDUNDANT_TICKETS: 'అనవసర టికెట్లు తగ్గించబడ్డాయి',
    RISK_DISTRIBUTION: 'ప్రమాద స్థాయిల విభజన',
    CURRENT_ACTIVE: 'ప్రస్తుతం క్రియాశీలంగా ఉన్నవి',
    TOTAL_SITES: 'మొత్తం ప్రాంతాలు',
    SEVERITY_CRITICAL: 'తీవ్రమైనవి',
    SEVERITY_HIGH: 'అధికం',
    SEVERITY_MEDIUM: 'మధ్యస్థం',
    SEVERITY_LOW: 'తక్కువ',
    HAZARD_DENSITY_BY_WARD: 'విశాఖపట్నం వార్డు వారీగా రోడ్డు సమస్యలు',
    VULNERABILITY_DESCRIPTION: 'భారీ ట్రాఫిక్ మరియు తీరప్రాంత వర్షాల ఆధారంగా ప్రమాద స్థాయిలు.',
    TOP_FIVE_SECTORS: 'ముఖ్యమైన 5 ప్రాంతాలు',
    CRITICAL_COUNT: 'తీవ్రమైనవి',
    TOTAL_COUNT: 'మొత్తం',
    RED_SEGMENT: 'ఎరుపు: ద్విచక్ర వాహనదారులకు తక్షణ ప్రమాదాలు',
    AMBER_SEGMENT: 'పసుపు: మరమ్మతులకు ప్రాధాన్యత',
    TWO_WHEELER_RIDERS: 'మరణించిన వారిలో ద్విచక్ర వాహనదారులు',
    DELIVERY_RIDER_RISK: 'డెలివరీ వాహనదారులకు రోడ్డు ఉపరితల ప్రమాదం ఎక్కువ',
    PILOT_SAAS_MODEL: '6 నెలల పైలట్ సాఫ్ట్‌వేర్ నమూనా',
    NETWORK_COVERAGE: 'GVMC పరిధిలో 100 కి.మీ. ప్రధాన రహదారుల కవరేజ్',
    GLOBAL_IMPACT_METRICS: 'మొత్తం ప్రభావ గణాంకాలు',
    AI_VERIFICATION_ENGINE: 'AI ధృవీకరణ వ్యవస్థ',
    SIGNAL_NOISE_REDUCTION: 'నకిలీ నివేదికల తగ్గింపు',
    FATALITIES_TWO_WHEELERS: 'మరణించిన వారిలో ద్విచక్ర వాహనదారులు',
    GIG_RIDER_RISK: 'డెలివరీ వాహనదారులకు రోడ్డు ఉపరితల ప్రమాదం ఎక్కువ',
    DIRECT_IMPACT: 'ప్రత్యక్ష ప్రభావం',
    DIRECT_IMPACT_DESC: 'నివేదికలు నేరుగా వార్డు ఇంజినీర్లకు చేరి ఆలస్యాన్ని తగ్గిస్తాయి.',
    XP_REWARDS: 'పౌర బహుమతులు',
    XP_REWARDS_DESC: 'ధృవీకరించిన నివేదికలకు పాయింట్లు పొంది కూపన్లుగా మార్చుకోండి.',
    DIGITAL_GOVERNANCE_BRIDGE: 'డిజిటల్ పాలనా వారధి',
    CIVIC_RESPONSIBILITY_ACTION: 'పౌర బాధ్యతను కార్యాచరణగా మారుద్దాం.',
    TRANSPARENT_PROGRESS: 'పనుల పురోగతిని స్పష్టంగా తెలుసుకోండి',
    SAFER_COMMUTES: 'అందరికీ సురక్షిత ప్రయాణం',
    GOVERNMENT_ACCOUNTABILITY: 'ప్రభుత్వ జవాబుదారీతనాన్ని పెంచడం',
    PRECISION_LOCATION_REQUIRED: 'ఈ నివేదికకు మీ ఖచ్చితమైన స్థానాన్ని జోడించడానికి పరికర లొకేషన్‌ను అనుమతించండి.',
    USE_EXACT_GPS: 'నా ఖచ్చితమైన GPS స్థానాన్ని ఉపయోగించండి',
    ACQUIRING_GPS: 'GPS స్థానాన్ని పొందుతోంది...',
    GPS_ACTIVE: 'GPS క్రియాశీలం',
    GPS_PERMISSION_DENIED: 'అనుమతి నిరాకరించబడింది',
    LOCATION_UNAVAILABLE: 'స్థానం అందుబాటులో లేదు',
    LOCATION_REQUIRED_TO_REPORT: 'నివేదిక పంపే ముందు మీ GPS స్థానాన్ని పొందండి.',
    GPS_CAPTURED: 'GPS స్థానం పొందబడింది.',
    GPS_TIMEOUT: 'నిర్దేశిత సమయంలో GPS స్థానం పొందలేకపోయాం. దయచేసి లొకేషన్ సేవలను ఆన్ చేసి మళ్లీ ప్రయత్నించండి.',
    ALLOW_LOCATION_PERMISSION: 'బ్రౌజర్ సెట్టింగుల్లో లొకేషన్ అనుమతించి మళ్లీ ప్రయత్నించండి.',
    GPS_ACCURACY_GUIDANCE: 'ఉపగ్రహ మరియు నెట్‌వర్క్ ట్రయాంగులేషన్ సిద్ధంగా ఉంది. లైవ్ కోఆర్డినేట్లను పొందడానికి క్రింద నొక్కండి.',
    GPS_TARGET_REACHED: 'అధిక ఖచ్చితత్వంతో GPS స్థానం లాక్ చేయబడింది',
    GPS_BEST_AVAILABLE: 'లైవ్ కోఆర్డినేట్లతో GPS స్థానం లాక్ చేయబడింది',
    SEVERITY_LABEL: 'తీవ్రత',
    STATUS_REPORTED: 'నివేదించబడింది',
    STATUS_VERIFIED: 'ధృవీకరించబడింది',
    STATUS_ASSIGNED: 'కేటాయించబడింది',
    STATUS_IN_PROGRESS: 'పని జరుగుతోంది',
    STATUS_FIXED: 'పరిష్కరించబడింది',
    DEFECT_POTHOLE: 'గుంత',
    DEFECT_PAVEMENT_FRACTURE: 'రోడ్డు ఉపరితల పగులు',
    DEFECT_SUNKEN_MANHOLE: 'కుంగిన మ్యాన్‌హోల్',
    TRAFFIC_EXTREME: 'అత్యధిక ట్రాఫిక్',
    TRAFFIC_HIGH: 'అధిక ట్రాఫిక్',
    TRAFFIC_MODERATE: 'మధ్యస్థ ట్రాఫిక్',
    TRAFFIC_LOW: 'తక్కువ ట్రాఫిక్',
    CLUSTER_LOCATION_4092: 'ఆర్కే బీచ్ రోడ్, ఐఎన్ఎస్ కుర్సురా జలాంతర్గామి మ్యూజియం ఎదురుగా',
    CLUSTER_LOCATION_4105: 'పాత గాజువాక జంక్షన్, ఎన్‌హెచ్ 16 పారిశ్రామిక ఫ్లైఓవర్ ప్రవేశ మార్గం',
    CLUSTER_LOCATION_3901: '2వ లేన్, ద్వారకా నగర్, ఆర్టీసీ కాంప్లెక్స్ గేట్ 2 ఎదురుగా',
    CLUSTER_LOCATION_4188: 'సెక్టార్ 4, ఎంవీపీ డబుల్ రోడ్, ఏఎస్ రాజా గ్రౌండ్స్ సమీపంలో',
    CLUSTER_LOCATION_3802: 'సిరిపురం సర్కిల్, గురజాడ కళాక్షేత్రం సమీపంలో',
    COMMUNITY_VALUE_DESCRIPTION: 'స్థానిక ప్రజల పరిజ్ఞానం నగరాన్ని మెరుగుపరచగలదనే నమ్మకంతో సివిక్‌లెన్స్ రూపొందించబడింది. నివాసితులు రోడ్డు సమస్యను నివేదించినప్పుడు, నగర బృందాలు సమస్యలను గుర్తించి మరమ్మతులకు ప్రాధాన్యత ఇవ్వడంలో సహాయపడతారు.',
    COMMUNITY_IMAGE_ALT: 'కలిసి పనిచేస్తున్న సమాజ సభ్యులు',
    LOCATION_NOT_CAPTURED: 'స్థానం పొందలేదు',
    WARD_19: 'వార్డు 19 (సిరిపురం మరియు ఏయూ క్యాంపస్)',
    JUST_NOW: 'ఇప్పుడే',
  },
};
