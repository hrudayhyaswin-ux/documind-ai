import { NextRequest, NextResponse } from 'next/server';
import { getDocuments, saveDocument } from '@/lib/storage';
import { extractDocumentContent } from '@/lib/ingestion/extractor';
import { chunkPages } from '@/lib/ingestion/chunker';
import { DocumentRecord } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId') || 'demo-workspace';
    const documents = getDocuments(workspaceId);
    return NextResponse.json({ success: true, documents });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const workspaceId = (formData.get('workspaceId') as string) || 'demo-workspace';
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided in form data.' },
        { status: 400 }
      );
    }

    const fileName = file.name;
    const fileSize = file.size;

    // File validation: Size cap (25MB)
    const MAX_SIZE = 25 * 1024 * 1024;
    if (fileSize > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: `File size (${(fileSize / (1024 * 1024)).toFixed(1)}MB) exceeds maximum limit of 25MB.` },
        { status: 400 }
      );
    }

    // Check duplicate detection in same workspace
    const existingDocs = getDocuments(workspaceId);
    const duplicate = existingDocs.find(
      (d) => d.originalName.toLowerCase() === fileName.toLowerCase() && d.fileSize === fileSize
    );

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          error: `Duplicate file detected: "${fileName}" is already ingested in this workspace.`,
          existingDocument: duplicate,
        },
        { status: 409 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Document Ingestion Engine: Extraction
    const extraction = await extractDocumentContent(buffer, fileName);

    const docId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    
    // Chunking with metadata
    const chunks = chunkPages(docId, fileName, extraction.pages);

    const docRecord: DocumentRecord = {
      id: docId,
      workspaceId,
      name: fileName,
      originalName: fileName,
      fileType: extraction.fileType,
      fileSize,
      pageCount: extraction.pageCount,
      chunkCount: chunks.length,
      isScannedWarning: extraction.isScannedWarning,
      uploadedAt: new Date().toISOString(),
      status: 'ready',
      rawText: extraction.rawText,
      pages: extraction.pages,
    };

    saveDocument(docRecord, chunks);

    return NextResponse.json({
      success: true,
      document: docRecord,
      chunkCount: chunks.length,
      isScannedWarning: extraction.isScannedWarning,
      warningMessage: extraction.isScannedWarning
        ? 'Warning: This document contains very little extractable text and may be a scanned image requiring OCR.'
        : undefined,
    });
  } catch (err: any) {
    console.error('Error processing document upload:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to process document upload.' },
      { status: 500 }
    );
  }
}
