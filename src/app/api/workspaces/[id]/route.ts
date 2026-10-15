import { NextRequest, NextResponse } from 'next/server';
import { deleteWorkspace, getWorkspace } from '@/lib/storage';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ws = getWorkspace(params.id);
    if (!ws) {
      return NextResponse.json({ success: false, error: 'Workspace not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, workspace: ws });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = deleteWorkspace(params.id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Workspace not found or could not be deleted.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Workspace deleted successfully.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
