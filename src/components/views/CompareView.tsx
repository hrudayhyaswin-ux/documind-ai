'use client';

import React, { useState } from 'react';
import {
  GitCompare,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Filter,
  ArrowRight,
  ShieldAlert,
  Loader2,
  Check,
  Eye,
  Info,
} from 'lucide-react';
import { Contradiction, DocumentRecord, Citation } from '@/types';

interface CompareViewProps {
  workspaceId: string;
  documents: DocumentRecord[];
  contradictions: Contradiction[];
  onContradictionsUpdated: (updated: Contradiction[]) => void;
  onInspectCitation: (cit: Citation) => void;
}

export const CompareView: React.FC<CompareViewProps> = ({
  workspaceId,
  documents,
  contradictions,
  onContradictionsUpdated,
  onInspectCitation,
}) => {
  const [docAId, setDocAId] = useState<string>(documents[0]?.id || '');
  const [docBId, setDocBId] = useState<string>(documents[1]?.id || '');
  const [isComparing, setIsComparing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [comparisonSummary, setComparisonSummary] = useState<any>(null);

  const handleRunComparison = async () => {
    if (!docAId || !docBId) {
      setError('Please select two distinct documents to compare.');
      return;
    }
    if (docAId === docBId) {
      setError('Please select two different documents to compare against each other.');
      return;
    }

    setIsComparing(true);
    setError(null);

    try {
      const resp = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          docAId,
          docBId,
        }),
      });

      const data = await resp.json();
      if (!resp.ok || !data.success) {
        throw new Error(data.error || 'Comparison failed.');
      }

      setComparisonSummary(data.comparison);
      onContradictionsUpdated(data.comparison.contradictions);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsComparing(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'open' | 'reviewed' | 'resolved') => {
    try {
      const resp = await fetch('/api/compare', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contradictionId: id, status }),
      });
      if (resp.ok) {
        const updated = contradictions.map((c) => (c.id === id ? { ...c, status } : c));
        onContradictionsUpdated(updated);
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const filteredContradictions = contradictions.filter((c) => {
    if (filterSeverity !== 'all' && c.severity !== filterSeverity) return false;
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    return true;
  });

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'high':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'medium':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default:
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
    }
  };

  const getClassificationBadge = (cls: string) => {
    switch (cls) {
      case 'confirmed':
        return 'text-rose-300 bg-rose-950/40 border-rose-500/30';
      case 'probable':
        return 'text-amber-300 bg-amber-950/40 border-amber-500/30';
      default:
        return 'text-violet-300 bg-violet-950/40 border-violet-500/30';
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-amber-400" />
          <span>Cross-Document Reasoning & Contradiction Discovery</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Perform multi-source comparative intelligence to uncover budget breaches, schedule discrepancies, and dependency blockers.
        </p>
      </div>

      {/* Document Selector & Trigger Card */}
      <div className="p-6 rounded-2xl border border-white/10 bg-background-card/80 space-y-5 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Document A Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-violet-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Baseline Document A</span>
            </label>
            <select
              value={docAId}
              onChange={(e) => setDocAId(e.target.value)}
              className="w-full bg-background-deep border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500"
            >
              <option value="">Select Document A...</option>
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.pageCount} pages)
                </option>
              ))}
            </select>
          </div>

          {/* Document B Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Comparative Document B</span>
            </label>
            <select
              value={docBId}
              onChange={(e) => setDocBId(e.target.value)}
              className="w-full bg-background-deep border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="">Select Document B...</option>
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.pageCount} pages)
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center pt-2">
          <span className="text-xs text-slate-400">
            Compares clauses, numbers, delivery milestones, and contractual commitments.
          </span>
          <button
            onClick={handleRunComparison}
            disabled={isComparing || !docAId || !docBId || docAId === docBId}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 disabled:opacity-40 text-white shadow-glow transition-all flex items-center gap-2"
          >
            {isComparing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Comparing Documents...</span>
              </>
            ) : (
              <>
                <GitCompare className="w-4 h-4" />
                <span>Execute Cross-Document Reasoning</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Contradictions & Conflicts Section */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              Discovered Contradictions & Inconsistencies ({filteredContradictions.length})
            </h2>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Severity:</span>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="bg-background-card border border-white/10 rounded-lg px-2 py-1 text-xs text-white"
              >
                <option value="all">All Severities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-background-card border border-white/10 rounded-lg px-2 py-1 text-xs text-white"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="reviewed">Reviewed</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>

        {filteredContradictions.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-white/10 bg-background-card/50 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-semibold text-white">No active contradictions found</h3>
            <p className="text-xs text-slate-400">
              Run cross-document reasoning above or adjust your filters.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredContradictions.map((conflict) => (
              <div
                key={conflict.id}
                className="rounded-2xl border border-white/10 bg-background-card/90 overflow-hidden shadow-lg p-6 space-y-5"
              >
                {/* Topic & Badges Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <h3 className="font-semibold text-white text-base">{conflict.topic}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-semibold ${getClassificationBadge(
                        conflict.classification
                      )}`}
                    >
                      {conflict.classification.replace('_', ' ')}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-semibold ${getSeverityBadge(
                        conflict.severity
                      )}`}
                    >
                      {conflict.severity} severity
                    </span>

                    {/* Status Toggle */}
                    <div className="flex items-center gap-1 ml-2 bg-white/5 rounded-lg p-1 border border-white/10">
                      {(['open', 'reviewed', 'resolved'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => handleUpdateStatus(conflict.id, st)}
                          className={`px-2 py-0.5 rounded text-[10px] capitalize font-medium transition-colors ${
                            conflict.status === st
                              ? 'bg-violet-600 text-white font-semibold'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Side-by-Side Evidence Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Claim A */}
                  <div className="p-4 rounded-xl border border-violet-500/20 bg-violet-950/10 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-violet-300 truncate max-w-[200px]">
                        {conflict.claimA.docName}
                      </span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                        Page {conflict.claimA.page}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed font-sans italic">
                      "{conflict.claimA.text}"
                    </p>
                  </div>

                  {/* Claim B */}
                  <div className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-950/10 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-cyan-300 truncate max-w-[200px]">
                        {conflict.claimB.docName}
                      </span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        Page {conflict.claimB.page}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed font-sans italic">
                      "{conflict.claimB.text}"
                    </p>
                  </div>
                </div>

                {/* Conflict Reasoning Explanation */}
                <div className="p-3.5 rounded-xl bg-background-deep/60 border border-white/5 space-y-1">
                  <div className="text-[11px] font-semibold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Info className="w-3.5 h-3.5" />
                    <span>Evidence Reasoning & Root Cause</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{conflict.conflictReason}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Agreements & Missing Information Section */}
      {comparisonSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
          {/* Document Agreements */}
          <div className="p-6 rounded-2xl border border-white/10 bg-background-card/60 space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              <span>Multi-Source Alignment & Agreements</span>
            </div>
            <div className="space-y-3">
              {comparisonSummary.agreements.map((ag: any, idx: number) => (
                <div key={idx} className="p-3 rounded-xl bg-background-deep/60 border border-white/5 space-y-1">
                  <span className="text-xs font-semibold text-white">{ag.topic}</span>
                  <p className="text-[11px] text-slate-400">{ag.statementA}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Missing Information Checklist */}
          <div className="p-6 rounded-2xl border border-white/10 bg-background-card/60 space-y-4">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              <span>Missing Documents & Unresolved Audit Items</span>
            </div>
            <div className="space-y-2">
              {comparisonSummary.missingInformation.map((item: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2 p-2.5 rounded-xl bg-background-deep/60 border border-white/5 text-xs text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
