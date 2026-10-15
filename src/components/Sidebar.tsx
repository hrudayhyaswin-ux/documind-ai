'use client';

import React from 'react';
import {
  LayoutDashboard,
  Files,
  MessageSquareText,
  FileText,
  GitCompare,
  CheckCircle2,
  BarChart3,
  Settings,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

export type NavTab =
  | 'welcome'
  | 'dashboard'
  | 'documents'
  | 'ask'
  | 'brief'
  | 'compare'
  | 'claims'
  | 'analytics'
  | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  documentCount: number;
  conflictCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  documentCount,
  conflictCount,
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'documents' as NavTab,
      label: 'Document Library',
      icon: Files,
      badge: documentCount > 0 ? documentCount : null,
    },
    {
      id: 'ask' as NavTab,
      label: 'Ask & Reason',
      icon: MessageSquareText,
      badge: 'Core',
    },
    {
      id: 'compare' as NavTab,
      label: 'Compare Documents',
      icon: GitCompare,
      badge: conflictCount > 0 ? `${conflictCount} Conflicts` : null,
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    {
      id: 'brief' as NavTab,
      label: 'Intelligence Brief',
      icon: FileText,
      badge: null,
    },
    {
      id: 'claims' as NavTab,
      label: 'Claim Verification',
      icon: CheckCircle2,
      badge: 'Truth',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      id: 'analytics' as NavTab,
      label: 'Visual Analytics',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'settings' as NavTab,
      label: 'Configuration',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 border-r border-white/10 bg-background-deep flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] select-none">
      <div className="p-4 space-y-1">
        <div className="px-3 py-2 text-[10px] uppercase tracking-wider font-bold text-slate-500">
          Reasoning Workspace
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-violet-600/20 text-white border border-violet-500/30 shadow-glow/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-violet-400' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== null && (
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                    item.badgeColor ||
                    'text-violet-300 bg-violet-500/10 border-violet-500/20'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Grounded Truth Guarantee Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="p-3 rounded-xl bg-background-card/80 border border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-violet-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Evidence Grounded</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Every conclusion is traced to exact document pages. Zero unsupported hallucinations.
          </p>
        </div>
      </div>
    </aside>
  );
};
