import { NextRequest, NextResponse } from 'next/server';
import { db, computeCompositeRiskScore } from '@/lib/db';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { HazardReport, HazardSeverity, HazardStatus, DefectType } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ward = searchParams.get('ward');
    const severity = searchParams.get('severity') as HazardSeverity | null;
    const status = searchParams.get('status') as HazardStatus | null;
    const sort = searchParams.get('sort') || 'risk';
    const search = searchParams.get('search')?.toLowerCase();

    // 1. Attempt to fetch from Supabase if configured
    let list: HazardReport[] = [];

    if (isSupabaseConfigured) {
      try {
        const { data: supaHazards, error } = await supabase
          .from('hazards')
          .select('*')
          .order('composite_risk', { ascending: false });

        if (!error && supaHazards && supaHazards.length > 0) {
          list = supaHazards.map((row: any) => ({
            id: row.id,
            title: `${row.defect_type || 'Pothole'} on ${row.address || row.ward}`,
            description: `Road defect detected at coordinates ${row.lat}° N, ${row.lng}° E.`,
            location: row.address || `${row.ward}, Visakhapatnam`,
            ward: row.ward,
            wardNumber: parseInt(row.ward?.replace(/\D/g, '') || '18', 10),
            coordinates: { lat: Number(row.lat), lng: Number(row.lng) },
            width_cm: Number(row.width_cm) || 45,
            depth_cm: Number(row.depth_cm) || 10,
            confidence: 95,
            defect_type: (row.defect_type as DefectType) || 'Pothole',
            severity:
              (row.composite_risk || 80) >= 85
                ? 'Critical'
                : (row.composite_risk || 80) >= 70
                ? 'High'
                : (row.composite_risk || 80) >= 45
                ? 'Medium'
                : 'Low',
            risk_score: row.composite_risk || 80,
            rankDelta: row.rank_delta || '0',
            why_ranked_here: `${row.depth_cm || 10}cm depth + ${row.reportsCount || 1} reports`,
            duplicate_count: row.reportsCount || 1,
            reportsCount: row.reportsCount || 1,
            status: (row.status as HazardStatus) || 'Reported',
            progress: row.status === 'Fixed' ? 100 : row.status === 'In Progress' ? 65 : 20,
            road_type: 'Arterial',
            traffic_level: 'High',
            images: row.photos || [],
            photos: row.photos || [],
            after_repair_images: row.after_repair_images || [],
            reported_at: row.created_at || new Date().toISOString(),
            updated_at: row.updated_at || new Date().toISOString(),
            activity_history: row.activity_history || [],
            score_breakdown: {
              depth_weight: Math.min(40, Math.round((row.depth_cm || 10) * 3.5)),
              area_weight: Math.min(20, Math.round(((row.width_cm || 45) / 100) * 20)),
              traffic_weight: 16,
              reports_weight: Math.min(20, (row.reportsCount || 1) * 4),
            },
          }));
        }
      } catch (supaErr) {
        console.warn('Supabase fetch failed, falling back to local database:', supaErr);
      }
    }

    // 2. Fall back to local DB if Supabase returned zero records or unconfigured
    if (list.length === 0) {
      list = db.getAll();
    }

    // Filter controls
    if (ward && ward !== 'all') {
      list = list.filter(
        (h) =>
          h.ward.toLowerCase().includes(ward.toLowerCase()) ||
          h.wardNumber === parseInt(ward.replace(/\D/g, ''), 10)
      );
    }

    if (severity && severity !== ('all' as any)) {
      list = list.filter((h) => h.severity === severity);
    }

    if (status && status !== ('all' as any)) {
      list = list.filter((h) => h.status === status);
    }

    if (search) {
      list = list.filter(
        (h) =>
          h.title.toLowerCase().includes(search) ||
          h.location.toLowerCase().includes(search) ||
          h.id.toLowerCase().includes(search) ||
          h.defect_type.toLowerCase().includes(search) ||
          h.ward.toLowerCase().includes(search)
      );
    }

    if (sort === 'newest') {
      list.sort((a, b) => new Date(b.reported_at).getTime() - new Date(a.reported_at).getTime());
    } else if (sort === 'reports') {
      list.sort((a, b) => (b.reportsCount || b.duplicate_count) - (a.reportsCount || a.duplicate_count));
    } else {
      list.sort((a, b) => b.risk_score - a.risk_score);
    }

    return NextResponse.json({
      hazards: list,
      total: list.length,
      updated_at: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error fetching hazards:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      lat,
      lng,
      address,
      locationName,
      ward = 'Ward 18 - RK Beach & Pandurangapuram',
      width_cm = 45,
      depth_cm = 8.5,
      defect_type = 'Pothole',
      base_risk_score = 80,
      photoUrl,
      imageData,
      why_ranked_here,
      road_type = 'Arterial',
      traffic_level = 'High',
      confidence = 92,
    } = body;

    const finalPhoto = photoUrl || imageData;
    const finalAddress = address || locationName || `${ward}, Visakhapatnam`;

    if (lat === undefined || lng === undefined || !finalPhoto) {
      return NextResponse.json(
        { error: 'Missing coordinates (lat, lng) or photoUrl/imageData in request body' },
        { status: 400 }
      );
    }

    // 1. SUPABASE POSTGIS 15M DEDUPLICATION PIPELINE
    if (isSupabaseConfigured) {
      try {
        const { data: nearby, error: rpcError } = await supabase.rpc('find_nearby_hazard', {
          p_lat: Number(lat),
          p_lng: Number(lng),
          p_radius_meters: 15,
        });

        const nearbyList = Array.isArray(nearby) ? nearby : nearby ? [nearby] : [];

        // Check if an existing unclosed hazard exists within 15 meters
        if (!rpcError && nearbyList.length > 0 && nearbyList[0]?.id) {
          const parent = nearbyList[0];
          const newReportsCount = (parent.reportsCount || parent.duplicate_count || 1) + 1;
          const updatedPhotos = Array.from(new Set([...(parent.photos || parent.images || []), finalPhoto]));

          // Recalculate Composite Risk Score
          const { compositeScore, severity, breakdown } = computeCompositeRiskScore({
            depth_cm: Number(parent.depth_cm || depth_cm),
            width_cm: Number(parent.width_cm || width_cm),
            road_type: (parent.road_type as any) || road_type,
            traffic_level: (parent.traffic_level as any) || traffic_level,
            reportsCount: newReportsCount,
          });

          const previousScore = parent.composite_risk || parent.risk_score || base_risk_score;
          const deltaNum = compositeScore - previousScore;
          const rankDelta = deltaNum > 0 ? `+${deltaNum}` : '0';

          // Update Supabase row
          await supabase
            .from('hazards')
            .update({
              photos: updatedPhotos,
              reportsCount: newReportsCount,
              composite_risk: compositeScore,
              rank_delta: rankDelta,
              updated_at: new Date().toISOString(),
            })
            .eq('id', parent.id);

          // Also mirror update to local DB for immediate UI responsiveness
          const localUpdated = db.updateHazard(parent.id, {
            reportsCount: newReportsCount,
            duplicate_count: newReportsCount,
            risk_score: compositeScore,
            rankDelta,
            images: updatedPhotos,
            photos: updatedPhotos,
            activityNote: `PostGIS 15m duplicate merged. Priority escalated from ${previousScore} to ${compositeScore}.`,
          });

          return NextResponse.json(
            {
              merged: true,
              parentId: parent.id,
              reportsCount: newReportsCount,
              coinsAwarded: 25,
              hazard: localUpdated || {
                ...parent,
                reportsCount: newReportsCount,
                risk_score: compositeScore,
                rankDelta,
              },
              message: `Report merged with existing hazard #${parent.id} via PostGIS 15m radius filter. Your input escalated its priority!`,
            },
            { status: 200 }
          );
        }

        // 2. INSERT NEW HAZARD INTO SUPABASE
        const newId = `VH-${Math.floor(4300 + Math.random() * 600)}`;
        const { compositeScore, severity, breakdown } = computeCompositeRiskScore({
          depth_cm: Number(depth_cm),
          width_cm: Number(width_cm),
          road_type: road_type as any,
          traffic_level: traffic_level as any,
          reportsCount: 1,
        });

        const newRow = {
          id: newId,
          lat: Number(lat),
          lng: Number(lng),
          address: finalAddress,
          ward,
          width_cm: Number(width_cm),
          depth_cm: Number(depth_cm),
          defect_type,
          composite_risk: compositeScore,
          reportsCount: 1,
          status: 'Reported',
          photos: [finalPhoto],
          rank_delta: '0',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { error: insertError } = await supabase.from('hazards').insert(newRow);

        if (!insertError) {
          // Mirror insert to local DB
          const localResult = db.submitReport({
            lat: Number(lat),
            lng: Number(lng),
            ward,
            locationName: finalAddress,
            imageData: finalPhoto,
            width_cm: Number(width_cm),
            depth_cm: Number(depth_cm),
            confidence: Number(confidence),
            defect_type: defect_type as DefectType,
            road_type,
            traffic_level,
            why_ranked_here,
          });

          return NextResponse.json(
            {
              merged: false,
              reportsCount: 1,
              coinsAwarded: 50,
              hazard: localResult.hazard,
              message: `New hazard ticket #${newId} committed to PostGIS database and prioritized in Live Queue.`,
            },
            { status: 201 }
          );
        }
      } catch (supaPostErr) {
        console.warn('Supabase PostGIS deduplication encountered error, using local fallback:', supaPostErr);
      }
    }

    // 3. ZERO-CRASH LOCAL POSTGIS / HAVERSINE FALLBACK ENGINE
    const result = db.submitReport({
      lat: Number(lat),
      lng: Number(lng),
      ward,
      locationName: finalAddress,
      imageData: finalPhoto,
      width_cm: Number(width_cm),
      depth_cm: Number(depth_cm),
      confidence: Number(confidence),
      defect_type: defect_type as DefectType,
      road_type,
      traffic_level,
      why_ranked_here,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Error in /api/hazards route:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
