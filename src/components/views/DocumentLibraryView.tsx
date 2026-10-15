'use client';

import React, { useState } from 'react';
import {
  Files,
  Search,
  Upload,
  Trash2,
  BookOpen,
  FileText,
  AlertTriangle,
  Eye,
  Layers,
  Calendar,
  X,
  FileCheck,
} from 'lucide-react';
import { DocumentRecord, Chunk } from '@/types';

interface DocumentLibraryViewProps {
  documents: DocumentRecord[];
  onOpenUpload: () => void;
  onDeleteDocument: (id: string) => void;
}

export const DocumentLibraryView: React.FC<DocumentLibraryViewProps> = ({
  documents,
  onOpenUpload,
  onDeleteDocument,
}) => {
  const [search, setSearch] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);
  const [docChunks, setDocChunks] = useState<Chunk[]>([]);
  const [isLoadingChunks, setIsLoadingChunks] = useState(false);

  const filteredDocs = documents.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleInspectDocument = async (doc: DocumentRecord) => {
    setSelectedDoc(doc);
    setIsLoadingChunks(true);
    try {
      const resp = await fetch(`/api/documents/${doc.id}`);
      const data = await resp.json();
      if (data.success && data.chunks) {
        setDocChunks(data.chunks);
      }
    } catch (err) {
      console.error('Failed to load chunks', err);
    } finally {
      setIsLoadingChunks(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Files className="w-5 h-5 text-violet-400" />
            <span>Document Library</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse, inspect extracted pages, and audit indexed chunks for this workspace
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-background-card border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 w-56"
            />
          </div>

          <button
            onClick={onOpenUpload}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-glow transition-all flex items-center gap-1.5 shrink-0"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Grid of Documents */}
      {filteredDocs.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-white/10 bg-background-card/50 space-y-3">
          <Files className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No documents found</h3>
          <p className="text-xs text-slate-400">
            {search ? 'No documents match your query.' : 'Upload PDFs, DOCX, or text files to begin.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="rounded-2xl border border-white/10 bg-background-card/80 hover:border-violet-500/40 transition-all p-5 flex flex-col justify-between space-y-4 shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="p-2.5 rounded-xl bg-violet-600/10 text-violet-400 border border-violet-500/20 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Remove "${doc.name}" from this workspace?`)) {
                        onDeleteDocument(doc.id);
                      }
                    }}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                    title="Delete Document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="font-semibold text-sm text-white mt-3 truncate" title={doc.name}>
                  {doc.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <span>{(doc.fileSize / 1024).toFixed(0)} KB</span>
                  <span>•</span>
                  <span className="uppercase">{doc.fileType}</span>
                </div>

                {doc.isScannedWarning && (
                  <div className="mt-3 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Scanned PDF warning: OCR may be needed.</span>
                  </div>
                )}
              </div>

              {/* Stats badges */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-cyan-400" />
                    <span>{doc.pageCount} Pages</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Layers className="w-3 h-3 text-violet-400" />
                    <span>{doc.chunkCount} Chunks</span>
                  </span>
                </div>

                <button
                  onClick={() => handleInspectDocument(doc)}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-violet-300 hover:text-white border border-white/10 text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  <Eye className="w-3 h-3" />
                  <span>Inspect</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Document Inspector Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-background-deep border border-white/10 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-background-card/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-base truncate max-w-lg">
                    {selectedDoc.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {selectedDoc.pageCount} Pages • {selectedDoc.chunkCount} Indexed Chunks •{' '}
                    {(selectedDoc.fileSize / 1024).toFixed(0)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-violet-400">
                  Indexed Ground-Truth Chunks
                </span>
                <span>Page-by-Page Metadata</span>
              </div>

              {isLoadingChunks ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  Loading indexed chunks...
                </div>
              ) : (
                <div className="space-y-3">
                  {docChunks.map((chunk) => (
                    <div
                      key={chunk.id}
                      className="p-4 rounded-xl border border-white/10 bg-background-card/60 space-y-2 hover:border-violet-500/30 transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-cyan-400 font-semibold">
                          Page {chunk.pageNumber} {chunk.sectionHeading ? `— ${chunk.sectionHeading}` : ''}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">ID: {chunk.id}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        {chunk.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/10 bg-background-deep flex justify-end">
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
