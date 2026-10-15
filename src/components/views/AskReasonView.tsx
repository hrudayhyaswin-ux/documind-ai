'use client';

import React, { useState } from 'react';
import {
  MessageSquareText,
  Send,
  Sparkles,
  ShieldCheck,
  FileText,
  BookOpen,
  Eye,
  Trash2,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { QAResponse, Citation, ClassificationVerdict } from '@/types';
import { SAMPLE_QUESTIONS } from '@/lib/demo/syntheticData';

interface AskReasonViewProps {
  workspaceId: string;
  qaHistory: QAResponse[];
  onNewResponse: (qa: QAResponse) => void;
  onClearHistory: () => void;
  onInspectCitation: (cit: Citation) => void;
}

export const AskReasonView: React.FC<AskReasonViewProps> = ({
  workspaceId,
  qaHistory,
  onNewResponse,
  onClearHistory,
  onInspectCitation,
}) => {
  const [query, setQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (questionText: string) => {
    const q = questionText.trim();
    if (!q || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const resp = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          question: q,
        }),
      });

      const data = await resp.json();
      if (!resp.ok || !data.success) {
        throw new Error(data.error || 'Failed to process question.');
      }

      onNewResponse(data.response);
      setQuery('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getVerdictBadge = (verdict: ClassificationVerdict) => {
    switch (verdict) {
      case 'factual_statement':
        return {
          label: 'Factual Statement (Direct Quote)',
          icon: CheckCircle2,
          classes: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        };
      case 'inferred_conclusion':
        return {
          label: 'Inferred Multi-Passage Conclusion',
          icon: ShieldCheck,
          classes: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
        };
      case 'ai_recommendation':
        return {
          label: 'AI Recommendation (Forward-Looking)',
          icon: Lightbulb,
          classes: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
        };
      case 'insufficient_evidence':
      default:
        return {
          label: 'Insufficient Grounded Evidence',
          icon: AlertCircle,
          classes: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        };
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto flex flex-col min-h-[calc(100vh-5rem)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <MessageSquareText className="w-5 h-5 text-violet-400" />
            <span>Ask & Reason</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Evidence-grounded intelligence. Every claim is strictly validated against source pages.
          </p>
        </div>

        {qaHistory.length > 0 && (
          <button
            onClick={onClearHistory}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Suggested Competition Prompts */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Competition Verification Prompts</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {SAMPLE_QUESTIONS.map((sq, i) => (
            <button
              key={i}
              onClick={() => {
                setQuery(sq.question);
                handleSubmit(sq.question);
              }}
              disabled={isSubmitting}
              className="text-left p-3 rounded-xl border border-white/10 bg-background-card/60 hover:bg-background-card hover:border-violet-500/40 text-xs text-slate-300 transition-all flex flex-col justify-between group"
            >
              <span className="font-medium text-white group-hover:text-violet-300 transition-colors">
                "{sq.question}"
              </span>
              <span className="text-[10px] text-slate-400 font-mono mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                {sq.expectedType}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Query Input Box */}
      <div className="sticky top-20 z-20 bg-background/95 backdrop-blur-md pt-2 pb-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(query);
          }}
          className="relative rounded-2xl border border-white/15 bg-background-card/90 shadow-xl focus-within:border-violet-500/60 transition-all"
        >
          <textarea
            rows={2}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question across your document corpus (e.g., 'What is the approved project budget in the contract?')"
            className="w-full bg-transparent px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(query);
              }
            }}
          />
          <div className="flex items-center justify-between px-4 pb-3">
            <span className="text-[11px] text-slate-500">
              Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px]">Enter</kbd> to submit
            </span>
            <button
              type="submit"
              disabled={!query.trim() || isSubmitting}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white shadow-glow transition-all flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Reasoning...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Question</span>
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
            {error}
          </div>
        )}
      </div>

      {/* Answers History */}
      <div className="space-y-6 flex-1">
        {qaHistory.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border border-white/5 bg-background-card/20 space-y-2">
            <MessageSquareText className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-medium text-slate-300">No reasoning queries executed yet</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Select one of the sample competition prompts above or type your own question to inspect grounded citations.
            </p>
          </div>
        ) : (
          qaHistory.map((qa) => {
            const badge = getVerdictBadge(qa.verdict);
            const BadgeIcon = badge.icon;
            return (
              <div
                key={qa.id}
                className="rounded-2xl border border-white/10 bg-background-card/80 overflow-hidden shadow-lg space-y-4 p-6"
              >
                {/* Question Row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                      Query
                    </span>
                    <h3 className="text-base font-semibold text-white">{qa.question}</h3>
                  </div>
                  <span className="text-[11px] text-slate-500 shrink-0">
                    {new Date(qa.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Verdict Badge */}
                <div>
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border ${badge.classes}`}
                  >
                    <BadgeIcon className="w-3.5 h-3.5" />
                    <span>{badge.label}</span>
                  </span>
                </div>

                {/* Grounded Answer */}
                <div className="p-4 rounded-xl bg-background-deep/60 border border-white/5 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                  {qa.answer}
                </div>

                {/* Traceable Evidence Panel */}
                {qa.citations.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
                      <span className="flex items-center gap-1.5 text-violet-400">
                        <BookOpen className="w-3.5 h-3.5" />
                        Traceable Evidence ({qa.citations.length} Verified Citations)
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Strictly Grounded Passages
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {qa.citations.map((cit, idx) => (
                        <div
                          key={cit.citationId || idx}
                          className="p-3.5 rounded-xl border border-white/10 bg-background-elevated/40 hover:border-violet-500/40 transition-all flex flex-col justify-between space-y-3"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
                              <span className="font-semibold text-white truncate max-w-[180px]" title={cit.docName}>
                                {cit.docName}
                              </span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                                  Page {cit.pageNumber}
                                </span>
                                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                  {cit.relevanceScore}% Match
                                </span>
                              </div>
                            </div>

                            <p className="text-xs text-slate-300 italic line-clamp-3 bg-white/[0.02] p-2 rounded border border-white/5">
                              "{cit.excerpt}"
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-1 text-[11px]">
                            <span className="text-emerald-400 font-medium flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" />
                              {cit.supportStatus === 'direct_quote' ? 'Direct Quote' : 'Inferred'}
                            </span>

                            <button
                              onClick={() => onInspectCitation(cit)}
                              className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-violet-300 hover:text-white border border-white/10 text-xs flex items-center gap-1 transition-colors"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Inspect Context</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
