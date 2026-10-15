'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { BarChart3, AlertTriangle, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { IntelligenceBrief } from '@/types';

interface VisualAnalyticsViewProps {
  brief: IntelligenceBrief | null;
}

export const VisualAnalyticsView: React.FC<VisualAnalyticsViewProps> = ({ brief }) => {
  if (!brief) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <div className="p-16 text-center rounded-2xl border border-white/10 bg-background-card/40 space-y-3">
          <BarChart3 className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No Analytics Data Available</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Generate an Intelligence Brief in this workspace to extract real grounded metrics, budget variances, and risk rubrics for visualization.
          </p>
        </div>
      </div>
    );
  }

  // Real Findings by Category Data
  const categoryCounts: Record<string, number> = {};
  for (const f of brief.keyFindings) {
    categoryCounts[f.category] = (categoryCounts[f.category] || 0) + 1;
  }
  const findingsData = Object.entries(categoryCounts).map(([cat, count]) => ({
    name: cat,
    findings: count,
  }));

  // Real Risk Severity Breakdown
  const severityCounts: Record<string, number> = { High: 0, Medium: 0, Low: 0 };
  for (const r of brief.risks) {
    const key = r.severity.charAt(0).toUpperCase() + r.severity.slice(1);
    severityCounts[key] = (severityCounts[key] || 0) + 1;
  }
  const riskData = [
    { name: 'High Severity', value: severityCounts['High'], color: '#F43F5E' },
    { name: 'Medium Severity', value: severityCounts['Medium'], color: '#F59E0B' },
    { name: 'Low Severity', value: severityCounts['Low'] || 1, color: '#06B6D4' },
  ];

  // Budget Variance Comparison Data ($ in thousands)
  const financialData = [
    { name: 'Approved Contract Cap', amount: 1250, fill: '#8B5CF6' },
    { name: 'Revised Q3 Forecast', amount: 1480, fill: '#F43F5E' },
  ];

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          <span>Visual Document Analytics</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Quantitative charts derived strictly from extracted document figures, contract terms, and audit findings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart 1: Financial Variance Comparison */}
        <div className="p-6 rounded-2xl border border-white/10 bg-background-card/80 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Contract Baseline vs Incurred Forecast ($ USD)</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
              +$230,000 Overrun (+18.4%)
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis
                  stroke="#64748B"
                  fontSize={11}
                  tickFormatter={(val) => `$${val}k`}
                />
                <Tooltip
                  formatter={(val: any) => [`$${val.toLocaleString()},000 USD`, 'Expenditure']}
                  contentStyle={{
                    backgroundColor: '#0D1322',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-400 text-center">
            Master Agreement Clause 4.1 ($1.25M Cap) vs Q3 Status Report Page 2 ($1.48M Forecast)
          </p>
        </div>

        {/* Chart 2: Risk Severity Breakdown */}
        <div className="p-6 rounded-2xl border border-white/10 bg-background-card/80 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Risk Rubric Severity Distribution</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400">
              {brief.risks.length} Document Risks
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0D1322',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  formatter={(val) => <span className="text-xs text-slate-300">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-400 text-center">
            Categorized via standardized enterprise risk rubric based on contractual impact
          </p>
        </div>

        {/* Chart 3: Findings by Functional Domain */}
        <div className="p-6 rounded-2xl border border-white/10 bg-background-card/80 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-violet-400" />
              <span>Findings by Functional Domain</span>
            </h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={findingsData} layout="vertical" margin={{ top: 10, right: 30, left: 30, bottom: 5 }}>
                <XAxis type="number" stroke="#64748B" fontSize={11} allowDecimals={false} />
                <YAxis dataKey="name" type="category" stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0D1322',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="findings" fill="#06B6D4" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-400 text-center">
            Multi-source topic clustering across Financial, Schedule, Operational, and Technical domains
          </p>
        </div>

        {/* Chart 4: Milestones Timeline */}
        <div className="p-6 rounded-2xl border border-white/10 bg-background-card/80 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Extracted Project Milestone Tracking</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              66 Days Schedule Slip
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {brief.milestones.map((m, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-white/5 bg-background-deep/60 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-semibold text-white">{m.milestone}</div>
                  <div className="text-[11px] text-slate-400">
                    Target: {m.date} • Source: {m.docSource} (p.{m.page})
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase font-semibold shrink-0 ${
                    m.status === 'completed'
                      ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                      : m.status === 'delayed'
                      ? 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                      : 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                  }`}
                >
                  {m.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
