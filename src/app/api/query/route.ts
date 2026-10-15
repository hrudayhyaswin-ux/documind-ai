import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/reasoning/engine';
import { getQAHistory, clearQAHistory } from '@/lib/storage';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId') || 'demo-workspace';
    const history = getQAHistory(workspaceId);
    return NextResponse.json({ success: true, history });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { workspaceId, question, docId } = body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      return NextResponse.json(
        { success: false, error: 'Question text is required.' },
        { status: 400 }
      );
    }

    const wsId = workspaceId || 'demo-workspace';
    const response = await executeQuery(wsId, question.trim(), docId);

    return NextResponse.json({ success: true, response });
  } catch (err: any) {
    console.error('Error executing query:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to process question.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId') || 'demo-workspace';
    clearQAHistory(workspaceId);
    return NextResponse.json({ success: true, message: 'QA history cleared.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
