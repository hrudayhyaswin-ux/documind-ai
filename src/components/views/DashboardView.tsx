'use client';

import React from 'react';
import {
  FileText,
  BookOpen,
  MessageSquare,
  Sparkles,
  GitCompare,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Cpu,
} from 'lucide-react';
import { AppStats, DocumentRecord, Workspace } from '@/types';
import { NavTab } from '../Sidebar';

interface DashboardViewProps {
  stats: AppStats;
  documents: DocumentRecord[];
  workspace: Workspace | null;
  onNavigate: (tab: NavTab) => void;
  onOpenUpload: () => void;
  onLoadDemo: () => void;
  isDemoLoading: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  documents,
  workspace,
  onNavigate,
  onOpenUpload,
  onLoadDemo,
  isDemoLoading,
}) => {
  const metricCards = [
    {
      label: 'Documents Ingested',
      value: stats.totalDocuments,
      unit: 'files',
      icon: FileText,
      color: 'text-violet-400',
      border: 'border-violet-500/20',
      bg: 'bg-violet-500/5',
    },
    {
      label: 'Pages Extracted & Indexed',
      value: stats.totalPages,
      unit: 'pages',
      icon: BookOpen,
      color: 'text-cyan-400',
      border: 'border-cyan-500/20',
      bg: 'bg-cyan-500/5',
    },
    {
      label: 'Questions Reasoned',
      value: stats.totalQuestionsAsked,
      unit: 'queries',
      icon: MessageSquare,
      color: 'text-indigo-400',
      border: 'border-indigo-500/20',
      bg: 'bg-indigo-500/5',
    },
    {
      label: 'Grounded Findings',
      value: stats.totalFindings,
      unit: 'findings',
      icon: Sparkles,
      color: 'text-emerald-400',
      border: 'border-emerald-500/20',
      bg: 'bg-emerald-500/5',
    },
    {
      label: 'Cross-Doc Conflicts',
      value: stats.totalConflictsIdentified,
      unit: 'detected',
      icon: AlertTriangle,
      color: 'text-amber-400',
      border: 'border-amber-500/20',
      bg: 'bg-amber-500/5',
    },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-violet-950/40 via-background-card to-background-card p-6 shadow-glow/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                ACTIVE WORKSPACE
              </span>
              <h1 className="text-xl font-bold text-white tracking-tight">
                {workspace?.name || 'Evidence Workspace'}
              </h1>
            </div>
            <p className="text-sm text-slate-400 max-w-2xl">
              {workspace?.description ||
                'Upload documents to extract facts, uncover cross-document contradictions, and generate evidence-backed intelligence.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {documents.length === 0 ? (
              <button
                onClick={onLoadDemo}
                disabled={isDemoLoading}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-glow hover:opacity-95 transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isDemoLoading ? 'Loading Demo Fixture...' : 'Load Sample Contract & Report'}</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('ask')}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-glow transition-all flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Start Asking Questions</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Real Metric Counter Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {metricCards.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border ${m.border} ${m.bg} bg-background-card/80 backdrop-blur-sm transition-all hover:border-white/20`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400">{m.label}</span>
                <Icon className={`w-4 h-4 ${m.color}`} />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-white font-mono">{m.value}</span>
                <span className="text-xs text-slate-500">{m.unit}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Core Workflow Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Pillar 1: Evidence Q&A */}
        <div
          onClick={() => onNavigate('ask')}
          className="group cursor-pointer p-6 rounded-2xl border border-white/10 bg-background-card/70 hover:border-violet-500/40 hover:bg-background-card transition-all space-y-4"
        >
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-105 transition-transform">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white group-hover:text-violet-300 transition-colors">
              Ask & Reason
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Query multiple documents. Every answer is grounded with document names, exact page citations, and support status.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-violet-400 font-medium pt-2">
            <span>Explore reasoning interface</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Pillar 2: Cross-Document Reasoning */}
        <div
          onClick={() => onNavigate('compare')}
          className="group cursor-pointer p-6 rounded-2xl border border-white/10 bg-background-card/70 hover:border-amber-500/40 hover:bg-background-card transition-all space-y-4"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
            <GitCompare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white group-hover:text-amber-300 transition-colors">
              Cross-Document Comparison
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Detect conflicting budgets, rescheduled deadlines, missing change orders, and unresolved dependency risks side by side.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium pt-2">
            <span>Inspect conflicting claims</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Pillar 3: Claim Verification */}
        <div
          onClick={() => onNavigate('claims')}
          className="group cursor-pointer p-6 rounded-2xl border border-white/10 bg-background-card/70 hover:border-emerald-500/40 hover:bg-background-card transition-all space-y-4"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white group-hover:text-emerald-300 transition-colors">
              Claim Verification
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Verify executive assertions against the document corpus. Classifies claims as Supported, Contradicted, or Insufficient Evidence.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium pt-2">
            <span>Verify factual claims</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Ingested Documents List */}
      <div className="p-6 rounded-2xl border border-white/10 bg-background-card/50 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-violet-400" />
            <h2 className="text-sm font-semibold text-white">Ingested Document Corpus</h2>
          </div>
          <button
            onClick={() => onNavigate('documents')}
            className="text-xs text-violet-400 hover:text-violet-300 font-medium"
          >
            Manage Documents ({documents.length})
          </button>
        </div>

        {documents.length === 0 ? (
          <div className="py-8 text-center space-y-3">
            <p className="text-xs text-slate-400">No documents ingested in this workspace yet.</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={onOpenUpload}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-glow"
              >
                Upload Document
              </button>
              <button
                onClick={onLoadDemo}
                disabled={isDemoLoading}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white"
              >
                Load Competition Demo
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-3.5 rounded-xl border border-white/10 bg-background-elevated/40 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400 shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-white truncate max-w-xs">{doc.name}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{doc.pageCount} Pages</span>
                      <span>•</span>
                      <span>{doc.chunkCount} Chunks</span>
                      <span>•</span>
                      <span>{(doc.fileSize / 1024).toFixed(0)} KB</span>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                  READY
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
