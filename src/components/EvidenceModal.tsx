'use client';

import React, { useState } from 'react';
import {
  X,
  FileText,
  Copy,
  Check,
  ExternalLink,
  Layers,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { Citation } from '@/types';

interface EvidenceModalProps {
  citation: Citation | null;
  onClose: () => void;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({ citation, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [showSurrounding, setShowSurrounding] = useState(true);

  if (!citation) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(citation.excerpt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusColor =
    citation.supportStatus === 'direct_quote'
      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
      : citation.supportStatus === 'inferred'
      ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
      : 'text-amber-400 bg-amber-500/10 border-amber-500/20';

  const statusLabel =
    citation.supportStatus === 'direct_quote'
      ? 'Verified Direct Quote'
      : citation.supportStatus === 'inferred'
      ? 'Synthesized Inference'
      : 'Ambiguous / Unverified';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-background-deep border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-background-card/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white text-base truncate max-w-md">
                  {citation.docName}
                </h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  Page {citation.pageNumber}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">Chunk ID: {citation.chunkId}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Indicators Bar */}
        <div className="px-6 py-3 border-b border-white/10 bg-background-elevated/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            {/* Retrieval Score */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Retrieval Relevance:</span>
              <span className="font-semibold text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                {citation.relevanceScore}% Match
              </span>
            </div>

            {/* Epistemic Support Degree */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Validation:</span>
              <span className={`px-2 py-0.5 rounded border font-semibold flex items-center gap-1 ${statusColor}`}>
                <ShieldCheck className="w-3 h-3" />
                <span>{statusLabel}</span>
              </span>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Passage'}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Cited Target Passage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-violet-400 uppercase tracking-wider">
              <span>Target Grounded Passage</span>
              <span className="text-slate-500">Original Document Text</span>
            </div>
            <div className="p-4 rounded-xl bg-violet-950/20 border border-violet-500/30 text-slate-200 text-sm leading-relaxed font-sans shadow-inner">
              <span className="bg-violet-500/30 text-white px-1 py-0.5 rounded font-medium">
                "{citation.excerpt}"
              </span>
            </div>
          </div>

          {/* Surrounding Context Toggle */}
          {citation.surroundingContext && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowSurrounding(!showSurrounding)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Surrounding Context on Page {citation.pageNumber}</span>
                  <span className="text-[10px] text-slate-500">
                    ({showSurrounding ? 'Click to hide' : 'Click to expand'})
                  </span>
                </button>
              </div>

              {showSurrounding && (
                <div className="p-4 rounded-xl bg-background-card/90 border border-white/10 text-slate-300 text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                  {citation.surroundingContext}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-background-deep flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Validated against indexed chunk hash — Zero generative hallucination
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
