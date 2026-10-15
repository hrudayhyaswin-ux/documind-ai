'use client';

import React from 'react';
import {
  BrainCircuit,
  Sparkles,
  Upload,
  FolderOpen,
  CheckCircle2,
  Cpu,
  ChevronDown,
} from 'lucide-react';
import { Workspace } from '@/types';

interface HeaderProps {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  onSelectWorkspace: (ws: Workspace) => void;
  onOpenUpload: () => void;
  onOpenWorkspaceModal: () => void;
  onLoadDemo: () => void;
  isDemoLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentWorkspace,
  workspaces,
  onSelectWorkspace,
  onOpenUpload,
  onOpenWorkspaceModal,
  onLoadDemo,
  isDemoLoading,
}) => {
  return (
    <header className="h-16 border-b border-white/10 bg-background-deep/90 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
      {/* Brand & Platform Identity */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 p-[1px] shadow-glow flex items-center justify-center">
          <div className="w-full h-full bg-background-card rounded-[11px] flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-cyan-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg tracking-wider text-white">DOCUMIND</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-violet-500/20 text-violet-400 border border-violet-500/30">
              AI
            </span>
          </div>
          <p className="text-[11px] text-slate-400 tracking-tight">
            Intelligent Document Reasoning & Evidence Platform
          </p>
        </div>
      </div>

      {/* Center: Workspace Selector */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-background-card/90 border border-white/10 rounded-lg px-3 py-1.5 hover:border-violet-500/40 transition-colors">
          <FolderOpen className="w-4 h-4 text-violet-400" />
          <button
            onClick={onOpenWorkspaceModal}
            className="flex items-center gap-2 text-sm text-slate-200 font-medium hover:text-white"
          >
            <span>{currentWorkspace?.name || 'Select Workspace'}</span>
            {currentWorkspace?.isDemo && (
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/30 font-medium">
                DEMO
              </span>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {/* 1-Click Competition Demo Mode Button */}
        <button
          onClick={onLoadDemo}
          disabled={isDemoLoading}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600/30 to-cyan-500/30 hover:from-violet-600/50 hover:to-cyan-500/50 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 transition-all shadow-cyanGlow/20"
          title="Instantly loads synthetic Master Contract & Status Report with intentional contradictions"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isDemoLoading ? 'animate-spin' : 'text-cyan-400'}`} />
          <span>{isDemoLoading ? 'Loading Demo...' : 'Load Competition Demo'}</span>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Active Engine Badge */}
        <div className="hidden md:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <Cpu className="w-3.5 h-3.5" />
          <span className="font-mono text-[11px]">Evidence Engine: Active</span>
        </div>

        {/* Ingest / Upload Button */}
        <button
          onClick={onOpenUpload}
          className="flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white shadow-glow transition-all active:scale-95"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Ingest Document</span>
        </button>
      </div>
    </header>
  );
};
