import { NextRequest, NextResponse } from 'next/server';
import { verifyClaim } from '@/lib/reasoning/claims';
import { getClaims } from '@/lib/storage';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId') || 'demo-workspace';
    const claims = getClaims(workspaceId);
    return NextResponse.json({ success: true, claims });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { workspaceId, claim, docId } = body;

    if (!claim || typeof claim !== 'string' || !claim.trim()) {
      return NextResponse.json(
        { success: false, error: 'Claim statement is required.' },
        { status: 400 }
      );
    }

    const wsId = workspaceId || 'demo-workspace';
    const verification = await verifyClaim(wsId, claim.trim(), docId);

    return NextResponse.json({ success: true, verification });
  } catch (err: any) {
    console.error('Error verifying claim:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Claim verification failed.' },
      { status: 500 }
    );
  }
}
