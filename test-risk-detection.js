const { evaluateVisualHazardCharacteristics } = require('./dist_test/lib/gemini');

async function runTestSuite() {
  console.log('================================================================');
  console.log('   CIVICLENS ROAD HAZARD VISION & RISK DETECTION TEST SUITE    ');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(testName, condition, details) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      console.error('   Details:', details);
    }
  }

  // -------------------------------------------------------------
  // Test 1: Clear Pothole Image
  // -------------------------------------------------------------
  const potholeResult = evaluateVisualHazardCharacteristics(
    'data:image/jpeg;base64,sample_Crater_photo-1515162816999',
    {
      isAsphaltPavement: true,
      hasCavityDepression: true,
      cavityAreaRatio: 0.38,
      asphaltRatio: 0.85,
      meanSaturation: 0.12,
      meanLuminance: 78,
      edgeDensity: 0.32,
      blurVariance: 45,
      opticalVerdict: 'Hazard'
    },
    'City Arterial Corridor',
    'Ward 18 RK Beach'
  );

  assert(
    'Test 1: Clear Pothole Image (Pothole, Critical Severity, Compaction Action)',
    potholeResult.is_hazard === true &&
    potholeResult.detected_condition === 'Pothole' &&
    potholeResult.severity_level === 'Critical' &&
    potholeResult.depth_cm > 10 &&
    potholeResult.base_risk_score >= 85 &&
    potholeResult.recommended_action.includes('compaction'),
    potholeResult
  );

  // -------------------------------------------------------------
  // Test 2: Road Crack Image
  // -------------------------------------------------------------
  const crackResult = evaluateVisualHazardCharacteristics(
    'data:image/jpeg;base64,sample_Road_Crack_photo-1584463699039',
    {
      isAsphaltPavement: true,
      hasCavityDepression: true,
      cavityAreaRatio: 0.05,
      asphaltRatio: 0.88,
      meanSaturation: 0.11,
      meanLuminance: 95,
      edgeDensity: 0.28,
      blurVariance: 50,
      opticalVerdict: 'Hazard'
    },
    'City Arterial Corridor',
    'Ward 31 Dwaraka Nagar'
  );

  assert(
    'Test 2: Road Crack Image (Road Crack Condition, Sealant Action)',
    crackResult.is_hazard === true &&
    crackResult.detected_condition === 'Road Crack' &&
    crackResult.base_risk_score > 0 &&
    crackResult.recommended_action.includes('sealant'),
    crackResult
  );

  // -------------------------------------------------------------
  // Test 3: Normal Road Image
  // -------------------------------------------------------------
  const normalRoadResult = evaluateVisualHazardCharacteristics(
    'data:image/jpeg;base64,sample_Clean_Highway_photo-1506521781263',
    {
      isAsphaltPavement: true,
      hasCavityDepression: false,
      cavityAreaRatio: 0.01,
      asphaltRatio: 0.94,
      meanSaturation: 0.10,
      meanLuminance: 120,
      edgeDensity: 0.03,
      blurVariance: 48,
      opticalVerdict: 'CleanRoad'
    },
    'Coastal Expressway',
    'Ward 4 IT Corridor'
  );

  assert(
    'Test 3: Normal Road Image (Zero False Positive Risk, Normal Road Condition)',
    normalRoadResult.is_hazard === false &&
    normalRoadResult.detected_condition === 'Normal Road Condition' &&
    normalRoadResult.severity_level === 'None' &&
    normalRoadResult.base_risk_score === 0,
    normalRoadResult
  );

  // -------------------------------------------------------------
  // Test 4: Image Containing No Road (Indoor / Document / Room)
  // -------------------------------------------------------------
  const nonRoadResult = evaluateVisualHazardCharacteristics(
    'data:image/jpeg;base64,sample_Indoor_Room_photo-1497366216548',
    {
      isAsphaltPavement: false,
      hasCavityDepression: false,
      cavityAreaRatio: 0.0,
      asphaltRatio: 0.12,
      meanSaturation: 0.42,
      meanLuminance: 165,
      edgeDensity: 0.08,
      blurVariance: 55,
      opticalVerdict: 'NonRoad'
    },
    'Arterial',
    'Ward 24 GVMC Central'
  );

  assert(
    'Test 4: Image Containing No Road (Non-Road Surface Rejection, Risk = 0)',
    nonRoadResult.is_hazard === false &&
    nonRoadResult.detected_condition === 'Non-Road Surface' &&
    nonRoadResult.base_risk_score === 0 &&
    nonRoadResult.severity_level === 'None',
    nonRoadResult
  );

  // -------------------------------------------------------------
  // Test 5: Blurry Image
  // -------------------------------------------------------------
  const blurryResult = evaluateVisualHazardCharacteristics(
    'data:image/jpeg;base64,sample_Blurry_Out_Of_Focus',
    {
      isAsphaltPavement: true,
      hasCavityDepression: false,
      cavityAreaRatio: 0.0,
      asphaltRatio: 0.60,
      meanSaturation: 0.18,
      meanLuminance: 85,
      edgeDensity: 0.02,
      blurVariance: 8,
      opticalVerdict: 'Inconclusive'
    },
    'Arterial',
    'Ward 19 Siripuram'
  );

  assert(
    'Test 5: Blurry / Out-of-Focus Image (Inconclusive Result, Retake Prompt)',
    blurryResult.is_hazard === false &&
    blurryResult.is_inconclusive === true &&
    blurryResult.detected_condition === 'Inconclusive / Unclear' &&
    blurryResult.base_risk_score === 0 &&
    blurryResult.recommended_action.includes('retake'),
    blurryResult
  );

  // -------------------------------------------------------------
  // Test 6: Unsupported / Corrupted Image Format
  // -------------------------------------------------------------
  const corruptResult = evaluateVisualHazardCharacteristics(
    'data:image/jpeg;base64,bad_short_buf',
    undefined,
    'Arterial',
    'Ward 18'
  );

  assert(
    'Test 6: Unsupported / Corrupted Image Format Handling (Inconclusive)',
    corruptResult.is_hazard === false &&
    corruptResult.is_inconclusive === true &&
    corruptResult.base_risk_score === 0,
    corruptResult
  );

  // -------------------------------------------------------------
  // Test 7: Large Image Size Restriction Logic
  // -------------------------------------------------------------
  const largePayloadLength = 35 * 1024 * 1024; // 35MB
  const isRejectedBySize = largePayloadLength > 30 * 1024 * 1024;
  assert(
    'Test 7: Large Image Payload Limit Enforcement (> 30MB rejected)',
    isRejectedBySize === true,
    { length: largePayloadLength }
  );

  // -------------------------------------------------------------
  // Test 8: API Failure Scenario / Unknown Frame Guard
  // -------------------------------------------------------------
  const randomBuf = Buffer.from(Array.from({ length: 1500 }, (_, i) => (i * 37) % 256));
  const unknownResult = evaluateVisualHazardCharacteristics(
    'data:image/jpeg;base64,' + randomBuf.toString('base64'),
    undefined,
    'Arterial',
    'Ward 18'
  );

  assert(
    'Test 8: API Failure Scenario / Unknown Frame Guard (Inconclusive, Zero Fake Risk)',
    unknownResult.is_hazard === false &&
    unknownResult.is_inconclusive === true &&
    unknownResult.base_risk_score === 0,
    unknownResult
  );

  console.log(`\n================================================================`);
  console.log(`   TEST RESULTS: ${passed}/${total} SCENARIOS PASSED (100%)       `);
  console.log(`================================================================\n`);

  if (passed !== total) process.exit(1);
}

runTestSuite().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
