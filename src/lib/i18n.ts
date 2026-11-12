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
  | 'CITIZEN_USEFULNESS_DESC';

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
  },
};
