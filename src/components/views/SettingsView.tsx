'use client';

import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Cpu,
  Trash2,
  RefreshCw,
  Sparkles,
  Key,
  Database,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { Workspace } from '@/types';

interface SettingsViewProps {
  currentWorkspace: Workspace | null;
  onLoadDemo: () => void;
  onWipeData: () => void;
  isDemoLoading: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentWorkspace,
  onLoadDemo,
  onWipeData,
  isDemoLoading,
}) => {
  const [activeProvider, setActiveProvider] = useState<'gemini' | 'openai' | 'local'>('local');

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-violet-400" />
          <span>System Architecture & Configuration</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage AI providers, review zero-trust document security policies, and manage local persistence.
        </p>
      </div>

      {/* AI Provider Configuration Card */}
      <div className="p-6 rounded-2xl border border-white/10 bg-background-card/80 space-y-5 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="font-semibold text-white text-sm">Active AI Reasoning Engine</h3>
              <p className="text-xs text-slate-400">
                Configured via server-side environment variables (.env.local)
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            ONLINE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Provider 1: Built-in Local Engine */}
          <div
            onClick={() => setActiveProvider('local')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              activeProvider === 'local'
                ? 'border-cyan-500/50 bg-cyan-950/20 text-white'
                : 'border-white/10 bg-background-deep/60 text-slate-400 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-xs text-white">Built-in Local Engine</span>
              {activeProvider === 'local' && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Deterministic evidence extraction. Operates 100% offline with zero external API key requirements.
            </p>
          </div>

          {/* Provider 2: Google Gemini */}
          <div
            onClick={() => setActiveProvider('gemini')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              activeProvider === 'gemini'
                ? 'border-violet-500/50 bg-violet-950/20 text-white'
                : 'border-white/10 bg-background-deep/60 text-slate-400 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-xs text-white">Google Gemini API</span>
              {activeProvider === 'gemini' && <CheckCircle2 className="w-3.5 h-3.5 text-violet-400" />}
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Powered by Gemini 1.5 Flash. Requires <code className="text-violet-300">GEMINI_API_KEY</code> in server environment.
            </p>
          </div>

          {/* Provider 3: OpenAI */}
          <div
            onClick={() => setActiveProvider('openai')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              activeProvider === 'openai'
                ? 'border-emerald-500/50 bg-emerald-950/20 text-white'
                : 'border-white/10 bg-background-deep/60 text-slate-400 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-xs text-white">OpenAI API</span>
              {activeProvider === 'openai' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Powered by GPT-4o-mini. Requires <code className="text-emerald-300">OPENAI_API_KEY</code> in server environment.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-background-deep/80 border border-white/5 space-y-1">
          <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-violet-400" />
            <span>API Key Security Protocol</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            API keys are strictly loaded through server-side environment variables and are never transmitted to or stored in client-side code or browser storage.
          </p>
        </div>
      </div>

      {/* Privacy & Security Disclosure Card */}
      <div className="p-6 rounded-2xl border border-white/10 bg-background-card/80 space-y-4 shadow-lg">
        <div className="flex items-center gap-2.5">
          <Shield className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="font-semibold text-white text-sm">Enterprise Data Privacy & Security</h3>
            <p className="text-xs text-slate-400">Zero-retention and workspace isolation architecture</p>
          </div>
        </div>

        <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
          <div className="flex items-start gap-2">
            <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Workspace Isolation:</strong> All documents, text chunks, and citations are compartmentalized by workspace ID.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Prompt Injection Guardrails:</strong> Document text is sanitized and treated as untrusted data. Embedded instructions attempting to override system rules are neutralized.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Local Storage:</strong> Prototype indexes are stored in local SQLite / structured JSON without third-party cloud data persistence.
            </span>
          </div>
        </div>
      </div>

      {/* Data Management Actions */}
      <div className="p-6 rounded-2xl border border-white/10 bg-background-card/80 space-y-4 shadow-lg">
        <h3 className="font-semibold text-white text-sm">Workspace Data Controls</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onLoadDemo}
            disabled={isDemoLoading}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600/30 hover:bg-violet-600/50 text-violet-300 border border-violet-500/30 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isDemoLoading ? 'animate-spin' : ''}`} />
            <span>Reset Competition Demo Workspace</span>
          </button>

          <button
            onClick={() => {
              if (
                confirm(
                  `Are you sure you want to wipe all ingested documents, QA history, and briefs for "${
                    currentWorkspace?.name || 'this workspace'
                  }"?`
                )
              ) {
                onWipeData();
              }
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Wipe Workspace Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
