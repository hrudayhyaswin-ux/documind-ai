import { NextRequest, NextResponse } from 'next/server';
import { getDocument, deleteDocument, getChunksByDocument } from '@/lib/storage';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const doc = getDocument(params.id);
    if (!doc) {
      return NextResponse.json({ success: false, error: 'Document not found.' }, { status: 404 });
    }
    const chunks = getChunksByDocument(params.id);
    return NextResponse.json({ success: true, document: doc, chunks });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = deleteDocument(params.id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Document not found or already deleted.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Document removed successfully.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
