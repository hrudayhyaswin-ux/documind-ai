import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaces, createWorkspace } from '@/lib/storage';

export async function GET() {
  try {
    const workspaces = getWorkspaces();
    return NextResponse.json({ success: true, workspaces });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description } = body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Workspace name is required.' }, { status: 400 });
    }

    const ws = createWorkspace(name.trim(), description?.trim());
    return NextResponse.json({ success: true, workspace: ws });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
