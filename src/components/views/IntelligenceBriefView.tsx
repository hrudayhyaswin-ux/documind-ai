'use client';

import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Download,
  Printer,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Calendar,
  Users,
  Eye,
  Loader2,
  HelpCircle,
} from 'lucide-react';
import { IntelligenceBrief, BriefMode, Citation } from '@/types';

interface IntelligenceBriefViewProps {
  workspaceId: string;
  brief: IntelligenceBrief | null;
  onBriefGenerated: (brief: IntelligenceBrief) => void;
  onInspectCitation: (cit: Citation) => void;
}

export const IntelligenceBriefView: React.FC<IntelligenceBriefViewProps> = ({
  workspaceId,
  brief,
  onBriefGenerated,
  onInspectCitation,
}) => {
  const [mode, setMode] = useState<BriefMode>('standard');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (selectedMode: BriefMode = mode) => {
    setIsGenerating(true);
    setError(null);

    try {
      const resp = await fetch('/api/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          mode: selectedMode,
        }),
      });

      const data = await resp.json();
      if (!resp.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate brief.');
      }

      onBriefGenerated(data.brief);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportMarkdown = () => {
    if (!brief) return;
    const blob = new Blob([JSON.stringify(brief, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DocuMind_Intelligence_Brief_${brief.mode}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const getRiskSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'high':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'medium':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default:
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-violet-400" />
            <span>Executive Intelligence Brief</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Evidence-backed executive synthesis, risk rubric, and audited statistics
          </p>
        </div>

        {/* Mode selector & trigger */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-background-card border border-white/10 rounded-xl p-1 text-xs">
            {(['short', 'standard', 'detailed'] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  if (brief) handleGenerate(m);
                }}
                className={`px-3 py-1 rounded-lg capitalize font-medium transition-all ${
                  mode === m
                    ? 'bg-violet-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleGenerate(mode)}
            disabled={isGenerating}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white shadow-glow transition-all flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Synthesizing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Brief</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
          {error}
        </div>
      )}

      {!brief ? (
        <div className="py-20 text-center rounded-2xl border border-white/10 bg-background-card/40 space-y-3">
          <FileText className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No Intelligence Brief Generated Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Click "Generate Brief" above to create an evidence-grounded executive summary with findings, key figures, and risk rubric.
          </p>
          <button
            onClick={() => handleGenerate(mode)}
            disabled={isGenerating}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-glow"
          >
            Synthesize Brief Now
          </button>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Action Export Bar */}
          <div className="flex items-center justify-between text-xs text-slate-400 p-3 rounded-xl bg-background-card/70 border border-white/10">
            <span>
              Generated at: {new Date(brief.generatedAt).toLocaleString()} ({brief.mode.toUpperCase()} MODE)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportMarkdown}
                className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON / Markdown</span>
              </button>
              <button
                onClick={handlePrint}
                className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Report</span>
              </button>
            </div>
          </div>

          {/* 1. Executive Overview */}
          <div className="p-6 rounded-2xl border border-white/10 bg-background-card/90 space-y-3 shadow-lg">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-400" />
              <span>1. Executive Overview</span>
            </h2>
            <p className="text-sm text-slate-200 leading-relaxed font-sans">{brief.executiveOverview}</p>
          </div>

          {/* 2. Key Grounded Findings */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>2. Key Grounded Findings</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {brief.keyFindings.map((finding, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl border border-white/10 bg-background-card/80 space-y-3 hover:border-violet-500/30 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">{finding.title}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20">
                        {finding.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{finding.statement}</p>
                  </div>

                  {finding.citations[0] && (
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 truncate max-w-[200px]">
                        {finding.citations[0].docName} (p.{finding.citations[0].pageNumber})
                      </span>
                      <button
                        onClick={() => onInspectCitation(finding.citations[0])}
                        className="text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect Evidence</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 3. Key Financial & Operational Figures */}
          <div className="p-6 rounded-2xl border border-white/10 bg-background-card/90 space-y-4 shadow-lg">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>3. Grounded Figures & Financial Metrics</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {brief.keyFigures.map((fig, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-white/10 bg-background-deep/60 space-y-2"
                >
                  <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    {fig.label}
                  </span>
                  <div className="text-xl font-bold font-mono text-white text-gradient">
                    {fig.value}
                  </div>
                  <p className="text-xs text-slate-400 leading-snug">{fig.context}</p>
                  <div className="pt-2 text-[10px] text-slate-500 font-mono flex items-center justify-between">
                    <span>Source: p.{fig.citation.pageNumber}</span>
                    <button
                      onClick={() => onInspectCitation(fig.citation)}
                      className="text-violet-400 hover:underline"
                    >
                      Verify
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Risk Assessment & Rubric */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>4. Risk Assessment & Rubric</span>
            </h2>
            <div className="space-y-3">
              {brief.risks.map((risk) => (
                <div
                  key={risk.id}
                  className="p-5 rounded-2xl border border-white/10 bg-background-card/80 space-y-3"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <h4 className="font-semibold text-sm text-white">{risk.title}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10">
                        {risk.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-semibold ${getRiskSeverityBadge(
                          risk.severity
                        )}`}
                      >
                        {risk.severity} Severity
                      </span>
                      {risk.requiresHumanReview && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          Human Review Required
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong className="text-slate-400">Reasoning:</strong> {risk.reasoning}
                  </p>

                  <div className="p-3 rounded-xl bg-violet-950/20 border border-violet-500/20 text-xs text-slate-200">
                    <strong className="text-violet-400">Suggested Action:</strong> {risk.suggestedAction}
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                    <span>
                      Grounded Citation: {risk.citation.docName} (Page {risk.citation.pageNumber})
                    </span>
                    <button
                      onClick={() => onInspectCitation(risk.citation)}
                      className="text-violet-400 hover:text-violet-300 font-medium"
                    >
                      Inspect Source
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. AI Recommendations (Explicitly separated from document facts) */}
          <div className="p-6 rounded-2xl border border-violet-500/30 bg-violet-950/10 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-violet-300 uppercase tracking-wider flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-violet-400" />
                <span>5. AI Strategic Recommendations</span>
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                AI Advisory — Distinct From Document Facts
              </span>
            </div>

            <div className="space-y-3">
              {brief.aiRecommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-violet-500/20 bg-background-card/80 space-y-2"
                >
                  <h4 className="font-semibold text-sm text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                    <span>{rec.recommendation}</span>
                  </h4>
                  <p className="text-xs text-slate-300">
                    <strong className="text-slate-400">Rationale:</strong> {rec.rationale}
                  </p>
                  <p className="text-xs text-slate-400 italic">
                    <strong className="text-slate-500 not-italic">Supporting Document Evidence:</strong>{' '}
                    "{rec.supportingEvidence}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Open Questions */}
          <div className="p-6 rounded-2xl border border-white/10 bg-background-card/60 space-y-3">
            <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              <span>6. Open Questions Requiring Stakeholder Resolution</span>
            </h2>
            <div className="space-y-2">
              {brief.openQuestions.map((q, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-background-deep/60 border border-white/5 text-xs text-slate-300 flex items-start gap-2"
                >
                  <span className="text-amber-400 font-semibold shrink-0">Q{idx + 1}:</span>
                  <span>{q}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
