import { NextRequest, NextResponse } from 'next/server';
import { generateIntelligenceBrief, formatBriefAsMarkdown } from '@/lib/reasoning/brief';
import { getLatestBrief } from '@/lib/storage';
import { BriefMode } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId') || 'demo-workspace';
    const brief = getLatestBrief(workspaceId);
    return NextResponse.json({ success: true, brief });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { workspaceId, mode, docId } = body;
    const wsId = workspaceId || 'demo-workspace';
    const briefMode: BriefMode = (mode as BriefMode) || 'standard';

    const brief = await generateIntelligenceBrief(wsId, briefMode, docId);
    const markdown = formatBriefAsMarkdown(brief);

    return NextResponse.json({ success: true, brief, markdown });
  } catch (err: any) {
    console.error('Error generating intelligence brief:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Brief generation failed.' },
      { status: 500 }
    );
  }
}
