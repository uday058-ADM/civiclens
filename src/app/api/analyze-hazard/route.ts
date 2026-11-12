import { NextRequest, NextResponse } from 'next/server';
import { analyzeHazardWithGemini } from '@/lib/gemini';
import { ScaleReference } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      imageBase64,
      mimeType = 'image/jpeg',
      scaleReference = 'no_reference',
      ward = 'Visakhapatnam',
      roadType = 'Arterial',
      clientApiKey,
      visualTelemetry,
    } = body;

    const apiKeyHeader = req.headers.get('x-gemini-api-key') || clientApiKey;

    // 1. Validation: Payload presence
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid imageBase64 in request payload' },
        { status: 400 }
      );
    }

    // 2. Validation: Payload size (reject raw files exceeding 25MB)
    if (imageBase64.length > 30 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image payload exceeds 25MB limit. Please upload a compressed photo.' },
        { status: 413 }
      );
    }

    // 3. Validation: MIME-type check
    const cleanMime = (mimeType || 'image/jpeg').toLowerCase();
    const supportedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const resolvedMime = supportedMimes.includes(cleanMime) ? cleanMime : 'image/jpeg';

    const validatedScaleRef: ScaleReference =
      scaleReference === 'coin_10' || scaleReference === 'a4_sheet' ? scaleReference : 'no_reference';

    const result = await analyzeHazardWithGemini({
      imageBase64,
      mimeType: resolvedMime,
      scaleReference: validatedScaleRef,
      ward,
      roadType,
      clientApiKey: apiKeyHeader,
      visualTelemetry,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('Error in /api/analyze-hazard route:', error);
    return NextResponse.json(
      {
        error: error.message || 'Internal error during hazard analysis',
        is_hazard: false,
        is_inconclusive: true,
        detected_condition: 'Analysis Error',
        defect_type: 'Inconclusive',
        width_cm: 0,
        depth_cm: 0,
        confidence: 0,
        severity_level: 'None',
        base_risk_score: 0,
        explanation: 'Image analysis service encountered an unexpected error processing this frame.',
        why_ranked_here: 'Analysis service error: could not complete visual inspection.',
        recommended_action: 'Please check your network connection and retry the analysis.',
      },
      { status: 500 }
    );
  }
}
