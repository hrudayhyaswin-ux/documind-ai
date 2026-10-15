import { NextRequest, NextResponse } from 'next/server';
import { compareDocuments } from '@/lib/reasoning/compare';
import { getContradictions, updateContradictionStatus } from '@/lib/storage';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId') || 'demo-workspace';
    const contradictions = getContradictions(workspaceId);
    return NextResponse.json({ success: true, contradictions });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { workspaceId, docAId, docBId } = body;

    const targetDocA = docAId || docBId;
    const targetDocB = docBId || docAId;

    if (!targetDocA) {
      return NextResponse.json(
        { success: false, error: 'At least one document ID must be specified for comparison.' },
        { status: 400 }
      );
    }

    const wsId = workspaceId || 'demo-workspace';
    const comparison = await compareDocuments(wsId, targetDocA, targetDocB);

    return NextResponse.json({ success: true, comparison });
  } catch (err: any) {
    console.error('Error comparing documents:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Comparison failed.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { contradictionId, status } = body;

    if (!contradictionId || !status) {
      return NextResponse.json(
        { success: false, error: 'contradictionId and status are required.' },
        { status: 400 }
      );
    }

    const updated = updateContradictionStatus(contradictionId, status);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Contradiction not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Status updated successfully.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
