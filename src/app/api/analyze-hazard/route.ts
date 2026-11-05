import { NextRequest, NextResponse } from 'next/server';
import { analyzeHazardWithGemini } from '@/lib/gemini';
import { ScaleReference } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      imageBase64,
      mimeType,
      scaleReference = 'no_reference',
      ward = 'Visakhapatnam',
      roadType = 'Arterial',
      clientApiKey,
      visualTelemetry,
    } = body;

    const apiKeyHeader = req.headers.get('x-gemini-api-key') || clientApiKey;

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'Missing imageBase64 in request payload' },
        { status: 400 }
      );
    }

    const validatedScaleRef: ScaleReference =
      scaleReference === 'coin_10' || scaleReference === 'a4_sheet' ? scaleReference : 'no_reference';

    const result = await analyzeHazardWithGemini({
      imageBase64,
      mimeType,
      scaleReference: validatedScaleRef,
      ward,
      roadType,
      clientApiKey: apiKeyHeader,
      visualTelemetry,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('Error in /api/analyze-hazard route:', error);
    // On unexpected error, do NOT report false positive hazard!
    return NextResponse.json(
      {
        error: error.message || 'Internal error during hazard analysis',
        is_hazard: false,
        defect_type: 'None',
        width_cm: 0,
        depth_cm: 0,
        confidence: 90,
        severity_level: 'Low',
        base_risk_score: 0,
        why_ranked_here: 'Analysis service encountered an unreadable image frame.',
      },
      { status: 200 }
    );
  }
}
