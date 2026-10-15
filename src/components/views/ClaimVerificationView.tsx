'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Send,
  Loader2,
  Eye,
  BookOpen,
  Info,
} from 'lucide-react';
import { ClaimVerification, Citation, ClaimVerdict } from '@/types';

interface ClaimVerificationViewProps {
  workspaceId: string;
  claims: ClaimVerification[];
  onClaimVerified: (claim: ClaimVerification) => void;
  onInspectCitation: (cit: Citation) => void;
}

export const ClaimVerificationView: React.FC<ClaimVerificationViewProps> = ({
  workspaceId,
  claims,
  onClaimVerified,
  onInspectCitation,
}) => {
  const [claimInput, setClaimInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sampleClaims = [
    {
      claim: 'The project will be delivered within the approved contract budget.',
      expectedVerdict: 'Contradicted (Forecast $1.48M vs $1.25M)',
    },
    {
      claim: 'The project engineering team has achieved greater than 90% test coverage.',
      expectedVerdict: 'Supported (Status Report logs 92.4%)',
    },
    {
      claim: 'Final acceptance and delivery will be completed on the original November 15, 2026 deadline.',
      expectedVerdict: 'Contradicted (Delayed to Jan 20, 2027)',
    },
    {
      claim: 'The server facility runs exclusively on geothermal volcanic energy.',
      expectedVerdict: 'Insufficient Evidence (Not documented)',
    },
  ];

  const handleVerify = async (statement: string) => {
    const text = statement.trim();
    if (!text || isVerifying) return;

    setIsVerifying(true);
    setError(null);

    try {
      const resp = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          claim: text,
        }),
      });

      const data = await resp.json();
      if (!resp.ok || !data.success) {
        throw new Error(data.error || 'Failed to verify claim.');
      }

      onClaimVerified(data.verification);
      setClaimInput('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const getVerdictPresentation = (verdict: ClaimVerdict) => {
    switch (verdict) {
      case 'supported':
        return {
          label: 'Supported by Available Evidence',
          icon: CheckCircle2,
          border: 'border-emerald-500/40',
          bg: 'bg-emerald-950/20',
          text: 'text-emerald-400',
        };
      case 'contradicted':
        return {
          label: 'Contradicted by Available Evidence',
          icon: XCircle,
          border: 'border-rose-500/40',
          bg: 'bg-rose-950/20',
          text: 'text-rose-400',
        };
      case 'partially_supported':
        return {
          label: 'Partially Supported',
          icon: AlertCircle,
          border: 'border-amber-500/40',
          bg: 'bg-amber-950/20',
          text: 'text-amber-400',
        };
      case 'insufficient_evidence':
      default:
        return {
          label: 'Insufficient Evidence in Documents',
          icon: HelpCircle,
          border: 'border-slate-500/40',
          bg: 'bg-slate-900/40',
          text: 'text-slate-400',
        };
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>Claim Verification Engine</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Validate assertions against indexed corpus with supporting and opposing document citations.
        </p>
      </div>

      {/* Input Box */}
      <div className="p-6 rounded-2xl border border-white/10 bg-background-card/80 space-y-4 shadow-lg">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Enter Claim or Assertion to Check
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={claimInput}
            onChange={(e) => setClaimInput(e.target.value)}
            placeholder="e.g. 'The project will be delivered within the approved budget.'"
            className="flex-1 bg-background-deep border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleVerify(claimInput);
              }
            }}
          />
          <button
            onClick={() => handleVerify(claimInput)}
            disabled={!claimInput.trim() || isVerifying}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white shadow-glow transition-all flex items-center gap-2"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Evaluating...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Verify Claim</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
            {error}
          </div>
        )}

        {/* Sample claims */}
        <div className="space-y-1.5 pt-2">
          <span className="text-[11px] text-slate-400">Sample Claims to Verify:</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {sampleClaims.map((sc, i) => (
              <button
                key={i}
                onClick={() => {
                  setClaimInput(sc.claim);
                  handleVerify(sc.claim);
                }}
                disabled={isVerifying}
                className="text-left p-2.5 rounded-xl border border-white/5 bg-background-deep/60 hover:border-emerald-500/30 text-xs text-slate-300 transition-colors flex items-center justify-between group"
              >
                <span className="truncate max-w-[260px] group-hover:text-emerald-300 font-medium">
                  "{sc.claim}"
                </span>
                <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-2">
                  {sc.expectedVerdict}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Claim History & Evaluation Results */}
      <div className="space-y-6">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Verification Records ({claims.length})
        </h2>

        {claims.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border border-white/5 bg-background-card/20 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">No claims evaluated yet.</p>
          </div>
        ) : (
          claims.map((record) => {
            const vPres = getVerdictPresentation(record.verdict);
            const VIcon = vPres.icon;

            return (
              <div
                key={record.id}
                className="rounded-2xl border border-white/10 bg-background-card/90 overflow-hidden shadow-lg p-6 space-y-5"
              >
                {/* Claim Statement & Verdict Banner */}
                <div className="space-y-3 pb-3 border-b border-white/10">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">
                        Audited Claim Statement
                      </span>
                      <h3 className="text-base font-semibold text-white">"{record.claim}"</h3>
                    </div>
                    <span className="text-[11px] text-slate-500 shrink-0">
                      {new Date(record.evaluatedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div
                    className={`p-3 rounded-xl border ${vPres.border} ${vPres.bg} flex items-center justify-between gap-3`}
                  >
                    <div className="flex items-center gap-2">
                      <VIcon className={`w-5 h-5 ${vPres.text} shrink-0`} />
                      <span className={`text-sm font-bold ${vPres.text}`}>{vPres.label}</span>
                    </div>
                    <span className="text-xs font-mono text-slate-400">
                      Confidence: {record.confidenceScore}%
                    </span>
                  </div>
                </div>

                {/* Reasoning */}
                <div className="p-3.5 rounded-xl bg-background-deep/60 border border-white/5 space-y-1">
                  <span className="text-[11px] font-semibold text-violet-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    <span>Epistemic Evaluation Reasoning</span>
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">{record.reasoning}</p>
                </div>

                {/* Supporting vs Opposing Evidence Panels */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Supporting Evidence */}
                  <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-950/10 space-y-2">
                    <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
                      <span>Supporting Document Passages</span>
                      <span>({record.supportingEvidence.length})</span>
                    </div>

                    {record.supportingEvidence.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No supporting passages found.</p>
                    ) : (
                      record.supportingEvidence.map((cit, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg bg-background-deep/60 border border-white/5 space-y-1 text-xs"
                        >
                          <div className="flex justify-between text-[11px] text-slate-400">
                            <span className="font-semibold text-white">{cit.docName}</span>
                            <span className="font-mono text-emerald-400">p.{cit.pageNumber}</span>
                          </div>
                          <p className="text-slate-300 italic">"{cit.excerpt}"</p>
                          <button
                            onClick={() => onInspectCitation(cit)}
                            className="text-violet-400 text-[10px] hover:underline"
                          >
                            Inspect Page Context
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Opposing Evidence */}
                  <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-950/10 space-y-2">
                    <div className="flex items-center justify-between text-xs text-rose-400 font-semibold">
                      <span>Opposing / Contradicting Passages</span>
                      <span>({record.opposingEvidence.length})</span>
                    </div>

                    {record.opposingEvidence.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No contradicting passages found.</p>
                    ) : (
                      record.opposingEvidence.map((cit, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg bg-background-deep/60 border border-white/5 space-y-1 text-xs"
                        >
                          <div className="flex justify-between text-[11px] text-slate-400">
                            <span className="font-semibold text-white">{cit.docName}</span>
                            <span className="font-mono text-rose-400">p.{cit.pageNumber}</span>
                          </div>
                          <p className="text-slate-300 italic">"{cit.excerpt}"</p>
                          <button
                            onClick={() => onInspectCitation(cit)}
                            className="text-violet-400 text-[10px] hover:underline"
                          >
                            Inspect Page Context
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
