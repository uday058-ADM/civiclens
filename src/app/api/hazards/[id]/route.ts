import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const hazard = db.getById(params.id);
    if (!hazard) {
      return NextResponse.json({ error: 'Hazard not found' }, { status: 404 });
    }
    return NextResponse.json(hazard);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const updated = db.updateHazard(params.id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Hazard not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
