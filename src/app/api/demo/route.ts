import { NextResponse } from 'next/server';
import { initializeCompetitionDemo, SAMPLE_QUESTIONS, DEMO_WORKSPACE_ID } from '@/lib/demo/syntheticData';
import { getDocuments } from '@/lib/storage';

export async function GET() {
  try {
    const docs = getDocuments(DEMO_WORKSPACE_ID);
    return NextResponse.json({
      success: true,
      isLoaded: docs.length >= 2,
      documentsCount: docs.length,
      sampleQuestions: SAMPLE_QUESTIONS,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const demoData = initializeCompetitionDemo();
    return NextResponse.json({
      success: true,
      message: 'Competition demo workspace loaded successfully with synthetic Contract and Status Report.',
      workspace: demoData.workspace,
      documents: [demoData.docA, demoData.docB],
      sampleQuestions: SAMPLE_QUESTIONS,
    });
  } catch (err: any) {
    console.error('Error loading demo workspace:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to initialize demo workspace.' },
      { status: 500 }
    );
  }
}
