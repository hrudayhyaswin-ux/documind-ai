'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  MessageSquare,
  GitCompare,
  CheckCircle2,
  FileText,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  Eye,
  Loader2,
  DollarSign,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  QAResponse,
  Contradiction,
  ClaimVerification,
  IntelligenceBrief,
  Citation,
  DocumentRecord,
} from '@/types';

interface ReasoningStudioPanelProps {
  workspaceId: string;
  documents: DocumentRecord[];
  onHighlightPassage: (docId: string, page: number, text: string) => void;
  onOpenUpload: () => void;
}

export const ReasoningStudioPanel: React.FC<ReasoningStudioPanelProps> = ({
  workspaceId,
  documents,
  onHighlightPassage,
  onOpenUpload,
}) => {
  const [activeTab, setActiveTab] = useState<'ask' | 'compare' | 'claims' | 'brief'>('ask');
  const [query, setQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qaHistory, setQaHistory] = useState<QAResponse[]>([]);
  const [activeStep, setActiveStep] = useState<number | null>(null);

  // Contradiction state
  const [contradictions, setContradictions] = useState<Contradiction[]>([]);
  const [isComparing, setIsComparing] = useState(false);

  // Claim state
  const [claimText, setClaimText] = useState('');
  const [claimsList, setClaimsList] = useState<ClaimVerification[]>([]);
  const [isVerifyingClaim, setIsVerifyingClaim] = useState(false);

  // Brief state
  const [brief, setBrief] = useState<IntelligenceBrief | null>(null);
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);

  // Pitch Tour Handler
  const handlePitchStep = async (step: number) => {
    setActiveStep(step);

    if (step === 1) {
      // Step 1: Verified Fact ($1.25M Cap)
      setActiveTab('ask');
      const question = 'What is the approved project budget and delivery date in the contract?';
      setQuery(question);
      await executeQA(question, 'demo-doc-contract', 3, 'ARTICLE 4: COMPENSATION, BUDGET CEILING');
    } else if (step === 2) {
      // Step 2: Catch The $230K Overrun Contradiction
      setActiveTab('compare');
      await executeContradictionScan();
      // Highlight Contract Page 3 ($1.25M) vs Report Page 2 ($1.48M)
      onHighlightPassage('demo-doc-contract', 3, '$1,250,000 USD');
    } else if (step === 3) {
      // Step 3: Schedule Slip (Nov 15 vs Jan 20)
      setActiveTab('compare');
      if (contradictions.length === 0) await executeContradictionScan();
      onHighlightPassage('demo-doc-contract', 2, 'November 15, 2026');
    } else if (step === 4) {
      // Step 4: Anti-Hallucination Trick Question
      setActiveTab('ask');
      const trick = 'Who is the certified technician responsible for solar panel array maintenance?';
      setQuery(trick);
      await executeQA(trick);
    }
  };

  const executeQA = async (
    questionText: string,
    targetDocId?: string,
    targetPage?: number,
    targetText?: string
  ) => {
    setIsSubmitting(true);
    try {
      const resp = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId, question: questionText }),
      });
      const data = await resp.json();
      if (data.success && data.response) {
        setQaHistory((prev) => [data.response, ...prev]);

        // Auto-highlight left document viewer
        if (targetDocId && targetPage) {
          onHighlightPassage(targetDocId, targetPage, targetText || data.response.answer);
        } else if (data.response.citations && data.response.citations[0]) {
          const cit = data.response.citations[0];
          onHighlightPassage(cit.docId, cit.pageNumber, cit.excerpt);
        }
      }
    } catch (err) {
      console.error('QA Error', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeContradictionScan = async () => {
    setIsComparing(true);
    try {
      const docA = documents.find((d) => d.id === 'demo-doc-contract') || documents[0];
      const docB = documents.find((d) => d.id === 'demo-doc-status-report') || documents[1] || documents[0];

      const resp = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          docAId: docA.id,
          docBId: docB.id,
        }),
      });
      const data = await resp.json();
      if (data.success && data.comparison) {
        setContradictions(data.comparison.contradictions);
      }
    } catch (err) {
      console.error('Comparison error', err);
    } finally {
      setIsComparing(false);
    }
  };

  const executeClaimCheck = async (claimStr: string) => {
    setIsVerifyingClaim(true);
    try {
      const resp = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId, claim: claimStr }),
      });
      const data = await resp.json();
      if (data.success && data.verification) {
        setClaimsList((prev) => [data.verification, ...prev]);
        if (data.verification.opposingEvidence?.[0]) {
          const cit = data.verification.opposingEvidence[0];
          onHighlightPassage(cit.docId, cit.pageNumber, cit.excerpt);
        } else if (data.verification.supportingEvidence?.[0]) {
          const cit = data.verification.supportingEvidence[0];
          onHighlightPassage(cit.docId, cit.pageNumber, cit.excerpt);
        }
      }
    } catch (err) {
      console.error('Claim check error', err);
    } finally {
      setIsVerifyingClaim(false);
    }
  };

  const executeGenerateBrief = async () => {
    setIsGeneratingBrief(true);
    try {
      const resp = await fetch('/api/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId, mode: 'standard' }),
      });
      const data = await resp.json();
      if (data.success && data.brief) {
        setBrief(data.brief);
      }
    } catch (err) {
      console.error('Brief error', err);
    } finally {
      setIsGeneratingBrief(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background-deep select-none">
      {/* 🏆 JUDGE PITCH TOUR BAR (Top of Right Panel) */}
      <div className="p-4 border-b border-white/10 bg-gradient-to-r from-violet-950/40 via-background-card to-background-card shrink-0 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              🏆 Live Judge Pitch Tour (90-Second Demo Story)
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">1-Click Live Demonstration</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
          <button
            onClick={() => handlePitchStep(1)}
            disabled={isSubmitting}
            className={`p-2 rounded-xl border text-left text-xs transition-all ${
              activeStep === 1
                ? 'bg-violet-600 text-white border-violet-400 shadow-glow'
                : 'bg-background-elevated/80 border-white/10 text-slate-300 hover:border-violet-500/40'
            }`}
          >
            <div className="font-semibold flex items-center gap-1.5 text-cyan-300">
              <span>Step 1</span>
              <DollarSign className="w-3 h-3 text-cyan-400" />
            </div>
            <div className="text-[11px] font-medium text-white truncate">Contract Budget Cap</div>
            <div className="text-[10px] text-slate-400">$1.25M Page 3 Citation</div>
          </button>

          <button
            onClick={() => handlePitchStep(2)}
            disabled={isComparing}
            className={`p-2 rounded-xl border text-left text-xs transition-all ${
              activeStep === 2
                ? 'bg-rose-600 text-white border-rose-400 shadow-glow'
                : 'bg-background-elevated/80 border-white/10 text-slate-300 hover:border-rose-500/40'
            }`}
          >
            <div className="font-semibold flex items-center gap-1.5 text-rose-300">
              <span>Step 2</span>
              <AlertTriangle className="w-3 h-3 text-rose-400" />
            </div>
            <div className="text-[11px] font-medium text-white truncate">Catch $230K Overrun</div>
            <div className="text-[10px] text-slate-400">Contradiction Radar</div>
          </button>

          <button
            onClick={() => handlePitchStep(3)}
            disabled={isComparing}
            className={`p-2 rounded-xl border text-left text-xs transition-all ${
              activeStep === 3
                ? 'bg-amber-600 text-white border-amber-400 shadow-glow'
                : 'bg-background-elevated/80 border-white/10 text-slate-300 hover:border-amber-500/40'
            }`}
          >
            <div className="font-semibold flex items-center gap-1.5 text-amber-300">
              <span>Step 3</span>
              <Calendar className="w-3 h-3 text-amber-400" />
            </div>
            <div className="text-[11px] font-medium text-white truncate">Uncover 66-Day Slip</div>
            <div className="text-[10px] text-slate-400">Nov 15 vs Jan 20 Blocker</div>
          </button>

          <button
            onClick={() => handlePitchStep(4)}
            disabled={isSubmitting}
            className={`p-2 rounded-xl border text-left text-xs transition-all ${
              activeStep === 4
                ? 'bg-cyan-600 text-white border-cyan-400 shadow-glow'
                : 'bg-background-elevated/80 border-white/10 text-slate-300 hover:border-cyan-500/40'
            }`}
          >
            <div className="font-semibold flex items-center gap-1.5 text-cyan-300">
              <span>Step 4</span>
              <ShieldCheck className="w-3 h-3 text-cyan-400" />
            </div>
            <div className="text-[11px] font-medium text-white truncate">Anti-Hallucination</div>
            <div className="text-[10px] text-slate-400">Zero Hallucinations Test</div>
          </button>
        </div>
      </div>

      {/* Navigation Switcher Tabs (Simple, 4 Clean Modes) */}
      <div className="px-4 py-2 border-b border-white/10 bg-background-card/50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('ask')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'ask'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Ask & Trace</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('compare');
              if (contradictions.length === 0) executeContradictionScan();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'compare'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Contradiction Radar</span>
            {contradictions.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 text-amber-300">
                {contradictions.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('claims')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'claims'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Claim Verifier</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('brief');
              if (!brief) executeGenerateBrief();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'brief'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Executive Brief</span>
          </button>
        </div>

        <button
          onClick={onOpenUpload}
          className="text-xs text-violet-400 hover:text-violet-300 font-semibold"
        >
          + Upload Custom File
        </button>
      </div>

      {/* Main Tab Content Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* TAB 1: ASK & REASON */}
        {activeTab === 'ask' && (
          <div className="space-y-4">
            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (query.trim() && !isSubmitting) executeQA(query.trim());
              }}
              className="relative rounded-xl border border-white/15 bg-background-card/90 shadow-md focus-within:border-violet-500 transition-all p-3 space-y-2"
            >
              <textarea
                rows={2}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask any question across the document corpus..."
                className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (query.trim() && !isSubmitting) executeQA(query.trim());
                  }
                }}
              />
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-500">
                  Hit <kbd className="px-1 rounded bg-white/10 font-mono text-[9px]">Enter</kbd> to execute reasoning
                </span>
                <button
                  type="submit"
                  disabled={!query.trim() || isSubmitting}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white shadow-glow transition-all flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Reasoning...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3 h-3" />
                      <span>Ask AI</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Answer Feed */}
            {qaHistory.length === 0 ? (
              <div className="py-12 text-center rounded-xl border border-white/5 bg-background-card/30 space-y-2">
                <Sparkles className="w-8 h-8 text-violet-400 mx-auto" />
                <p className="text-xs font-semibold text-white">Ask anything or click a Pitch Tour Step above</p>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  Every answer highlights the exact matching passage on the left document reader in real time.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {qaHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-white/10 bg-background-card/90 space-y-3 shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-xs font-semibold text-white">Q: {item.question}</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase shrink-0 font-semibold ${
                          item.verdict === 'factual_statement'
                            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                            : item.verdict === 'insufficient_evidence'
                            ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                            : 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
                        }`}
                      >
                        {item.verdict.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-background-deep/60 border border-white/5 text-xs text-slate-200 leading-relaxed font-sans">
                      {item.answer}
                    </div>

                    {item.citations && item.citations.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                          Traceable Evidence Citations:
                        </span>
                        {item.citations.map((cit, idx) => (
                          <div
                            key={idx}
                            onClick={() => onHighlightPassage(cit.docId, cit.pageNumber, cit.excerpt)}
                            className="p-2.5 rounded-lg border border-white/10 bg-background-elevated/40 hover:border-violet-500/40 cursor-pointer transition-all flex items-center justify-between text-xs group"
                          >
                            <div className="min-w-0 pr-2">
                              <span className="font-semibold text-white group-hover:text-violet-300 truncate block">
                                {cit.docName} (Page {cit.pageNumber})
                              </span>
                              <span className="text-[11px] text-slate-400 italic line-clamp-1">
                                "{cit.excerpt}"
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20 shrink-0">
                              Highlight in Doc →
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CONTRADICTION RADAR */}
        {activeTab === 'compare' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Cross-Document Inconsistencies & Breaches
                </h3>
                <p className="text-[11px] text-slate-400">
                  Discovered across Master Contract vs Q3 Status Report
                </p>
              </div>
              <button
                onClick={executeContradictionScan}
                disabled={isComparing}
                className="px-3 py-1 rounded-lg text-xs font-semibold bg-amber-600/30 text-amber-300 border border-amber-500/30 hover:bg-amber-600/50 transition-all flex items-center gap-1.5"
              >
                {isComparing ? <Loader2 className="w-3 h-3 animate-spin" /> : <GitCompare className="w-3 h-3" />}
                <span>Rescan</span>
              </button>
            </div>

            {contradictions.length === 0 ? (
              <div className="py-12 text-center rounded-xl border border-white/10 bg-background-card/40 space-y-2">
                <GitCompare className="w-8 h-8 text-amber-400 mx-auto" />
                <p className="text-xs font-medium text-white">Click "Step 2" or "Rescan" to detect contradictions</p>
              </div>
            ) : (
              <div className="space-y-3">
                {contradictions.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-xl border border-white/10 bg-background-card/90 space-y-3 shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        {c.topic}
                      </span>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border bg-rose-500/10 text-rose-400 border-rose-500/20 font-semibold">
                        {c.severity} Severity
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed bg-background-deep/60 p-2.5 rounded-lg border border-white/5">
                      {c.conflictReason}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {/* Document A side */}
                      <div
                        onClick={() => onHighlightPassage(c.claimA.docId, c.claimA.page, c.claimA.text)}
                        className="p-2.5 rounded-lg border border-violet-500/20 bg-violet-950/20 cursor-pointer hover:border-violet-500/50 transition-all"
                      >
                        <div className="text-[10px] font-semibold text-violet-300 truncate">
                          {c.claimA.docName} (p.{c.claimA.page})
                        </div>
                        <div className="text-[11px] text-slate-300 line-clamp-2 mt-1">
                          "{c.claimA.text}"
                        </div>
                        <span className="text-[9px] text-violet-400 underline block mt-1">
                          View in Left Panel →
                        </span>
                      </div>

                      {/* Document B side */}
                      <div
                        onClick={() => onHighlightPassage(c.claimB.docId, c.claimB.page, c.claimB.text)}
                        className="p-2.5 rounded-lg border border-cyan-500/20 bg-cyan-950/20 cursor-pointer hover:border-cyan-500/50 transition-all"
                      >
                        <div className="text-[10px] font-semibold text-cyan-300 truncate">
                          {c.claimB.docName} (p.{c.claimB.page})
                        </div>
                        <div className="text-[11px] text-slate-300 line-clamp-2 mt-1">
                          "{c.claimB.text}"
                        </div>
                        <span className="text-[9px] text-cyan-400 underline block mt-1">
                          View in Left Panel →
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CLAIM VERIFIER */}
        {activeTab === 'claims' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Audited Claim Verification
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={claimText}
                  onChange={(e) => setClaimText(e.target.value)}
                  placeholder="Enter a claim (e.g. 'Delivered within budget?')"
                  className="flex-1 bg-background-deep border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && claimText.trim()) {
                      e.preventDefault();
                      executeClaimCheck(claimText.trim());
                    }
                  }}
                />
                <button
                  onClick={() => executeClaimCheck(claimText.trim())}
                  disabled={!claimText.trim() || isVerifyingClaim}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white shadow-glow transition-all"
                >
                  {isVerifyingClaim ? 'Checking...' : 'Verify'}
                </button>
              </div>

              {/* Quick sample chips */}
              <div className="flex items-center gap-1.5 pt-1 overflow-x-auto text-[10px]">
                <button
                  onClick={() => {
                    setClaimText('The project will be delivered within the approved contract budget.');
                    executeClaimCheck('The project will be delivered within the approved contract budget.');
                  }}
                  className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 whitespace-nowrap"
                >
                  Check Budget Claim
                </button>
                <button
                  onClick={() => {
                    setClaimText('The project engineering team has achieved greater than 90% test coverage.');
                    executeClaimCheck('The project engineering team has achieved greater than 90% test coverage.');
                  }}
                  className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 whitespace-nowrap"
                >
                  Check Test Coverage SLA
                </button>
              </div>
            </div>

            {/* Claims Results */}
            <div className="space-y-3">
              {claimsList.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl border border-white/10 bg-background-card/90 space-y-2 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">"{c.claim}"</span>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-semibold ${
                        c.verdict === 'supported'
                          ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                          : c.verdict === 'contradicted'
                          ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                          : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                      }`}
                    >
                      {c.verdict}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{c.reasoning}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: EXECUTIVE BRIEF */}
        {activeTab === 'brief' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Executive Synthesis & Risk Rubric
              </span>
              <button
                onClick={executeGenerateBrief}
                disabled={isGeneratingBrief}
                className="px-3 py-1 rounded-lg text-xs font-semibold bg-violet-600/30 text-violet-300 border border-violet-500/30 hover:bg-violet-600/50"
              >
                {isGeneratingBrief ? 'Regenerating...' : 'Regenerate Brief'}
              </button>
            </div>

            {brief ? (
              <div className="space-y-4">
                {/* Overview */}
                <div className="p-4 rounded-xl border border-white/10 bg-background-card/90 space-y-2">
                  <span className="text-[10px] text-violet-400 uppercase font-semibold">
                    Executive Overview
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">{brief.executiveOverview}</p>
                </div>

                {/* Key figures */}
                <div className="grid grid-cols-2 gap-2">
                  {brief.keyFigures.slice(0, 4).map((f, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl border border-white/10 bg-background-deep/60 space-y-1"
                    >
                      <span className="text-[10px] text-slate-400 uppercase">{f.label}</span>
                      <div className="text-base font-bold text-white font-mono">{f.value}</div>
                      <span className="text-[10px] text-slate-500">{f.context}</span>
                    </div>
                  ))}
                </div>

                {/* Risks */}
                <div className="space-y-2">
                  <span className="text-[10px] text-rose-400 uppercase font-semibold">
                    Critical Document Risks
                  </span>
                  {brief.risks.slice(0, 3).map((r) => (
                    <div
                      key={r.id}
                      className="p-3 rounded-xl border border-rose-500/20 bg-rose-950/10 space-y-1 text-xs"
                    >
                      <div className="flex justify-between font-semibold text-white">
                        <span>{r.title}</span>
                        <span className="text-rose-400 font-mono text-[10px] uppercase">
                          {r.severity}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">{r.reasoning}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">
                Generating Executive Brief...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
