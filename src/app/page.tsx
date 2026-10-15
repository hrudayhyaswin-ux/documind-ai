'use client';

import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Sparkles,
  Upload,
  RefreshCw,
  Cpu,
  Layers,
} from 'lucide-react';
import { RealisticDocumentCanvas } from '@/components/studio/RealisticDocumentCanvas';
import { EliteReasoningStudio } from '@/components/studio/EliteReasoningStudio';
import { UploadModal } from '@/components/UploadModal';
import { DocumentRecord } from '@/types';

export default function Home() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [activeDocId, setActiveDocId] = useState<string>('demo-doc-contract');
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isDemoLoading, setIsDemoLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Active citation highlighting on the left document reader
  const [highlightedText, setHighlightedText] = useState<string | null>(null);
  const [highlightedPage, setHighlightedPage] = useState<number | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  useEffect(() => {
    initWorkspace();
  }, []);

  const initWorkspace = async () => {
    setIsDemoLoading(true);
    try {
      const resp = await fetch('/api/documents?workspaceId=demo-workspace');
      const data = await resp.json();
      if (data.success && data.documents && data.documents.length > 0) {
        setDocuments(data.documents);
        setActiveDocId(data.documents[0].id);
        return;
      }
      await resetDemo();
    } catch (err) {
      console.error('Failed to init workspace', err);
      await resetDemo();
    } finally {
      setIsDemoLoading(false);
    }
  };

  const resetDemo = async () => {
    setIsDemoLoading(true);
    try {
      const resp = await fetch('/api/demo', { method: 'POST' });
      const data = await resp.json();
      if (data.success && data.documents) {
        setDocuments(data.documents);
        setActiveDocId(data.documents[0].id);
        setHighlightedPage(1);
        setHighlightedText(null);
        showNotification('Competition Demo Studio Ready: Master Contract & Q3 Status Report loaded.');
      }
    } catch (err) {
      console.error('Failed to load demo', err);
    } finally {
      setIsDemoLoading(false);
    }
  };

  const handleHighlightPassage = (docId: string, page: number, text: string) => {
    setActiveDocId(docId);
    setHighlightedPage(page);
    setHighlightedText(text);
  };

  const handleDocumentUploaded = (doc: DocumentRecord) => {
    setDocuments((prev) => [doc, ...prev.filter((d) => d.id !== doc.id)]);
    setActiveDocId(doc.id);
    setHighlightedPage(1);
    setHighlightedText(null);
    showNotification(`Document "${doc.name}" ingested successfully (${doc.pageCount} pages, ${doc.chunkCount} chunks indexed).`);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#070A11] overflow-hidden text-slate-100">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl bg-violet-950/95 border border-violet-500/40 text-white text-xs font-semibold shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* TOP COMPACT STUDIO HEADER */}
      <header className="h-14 border-b border-white/10 bg-[#070A11] px-6 flex items-center justify-between shrink-0 z-30">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 p-[1px] shadow-glow flex items-center justify-center">
            <div className="w-full h-full bg-[#0D1322] rounded-[7px] flex items-center justify-center">
              <BrainCircuit className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-base tracking-wider text-white">DOCUMIND</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-violet-500/20 text-violet-400 border border-violet-500/30">
              AI STUDIO
            </span>
          </div>
          <span className="text-slate-600 hidden md:inline">|</span>
          <span className="text-xs text-slate-400 hidden md:inline font-mono">
            Competition Presentation Studio
          </span>
        </div>

        {/* Center Live Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-[11px]">Evidence Engine: Grounded</span>
          <span className="text-slate-500">•</span>
          <span className="text-[11px] text-slate-300">Anti-Hallucination Active</span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={resetDemo}
            disabled={isDemoLoading}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors flex items-center gap-1.5"
            title="Reset to clean competition fixture"
          >
            <RefreshCw className={`w-3 h-3 ${isDemoLoading ? 'animate-spin' : ''}`} />
            <span>Reset Demo</span>
          </button>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-glow transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>+ Ingest Document</span>
          </button>
        </div>
      </header>

      {/* UNIFIED 2-PANEL COMPETITION STUDIO */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL: Photorealistic Document Canvas (50% width) */}
        <div className="w-1/2 h-full border-r border-white/10 flex flex-col">
          <RealisticDocumentCanvas
            documents={documents}
            activeDocId={activeDocId}
            onSelectDoc={(id) => {
              setActiveDocId(id);
              setHighlightedText(null);
            }}
            highlightedText={highlightedText}
            highlightedPage={highlightedPage}
          />
        </div>

        {/* RIGHT PANEL: Elite Reasoning Studio (50% width) */}
        <div className="w-1/2 h-full flex flex-col">
          <EliteReasoningStudio
            workspaceId="demo-workspace"
            documents={documents}
            activeDocId={activeDocId}
            onSelectDoc={(id) => {
              setActiveDocId(id);
              setHighlightedText(null);
            }}
            onHighlightPassage={handleHighlightPassage}
            onOpenUpload={() => setIsUploadOpen(true)}
          />
        </div>
      </div>

      {/* Custom Document Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        workspaceId="demo-workspace"
        onSuccess={handleDocumentUploaded}
      />
    </div>
  );
}
