'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Search,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { DocumentRecord, Chunk } from '@/types';

interface DocumentViewerPanelProps {
  documents: DocumentRecord[];
  activeDocId: string;
  onSelectDoc: (id: string) => void;
  highlightedText?: string | null;
  highlightedPage?: number | null;
}

export const DocumentViewerPanel: React.FC<DocumentViewerPanelProps> = ({
  documents,
  activeDocId,
  onSelectDoc,
  highlightedText,
  highlightedPage,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const contentContainerRef = useRef<HTMLDivElement>(null);

  const activeDoc = documents.find((d) => d.id === activeDocId) || documents[0];

  // Auto-switch to highlighted page when an answer is cited
  useEffect(() => {
    if (highlightedPage && activeDoc) {
      setCurrentPage(highlightedPage);
    }
  }, [highlightedPage]);

  // Extract pages from document rawText
  const getPages = (): { pageNumber: number; text: string }[] => {
    if (!activeDoc || !activeDoc.rawText) return [{ pageNumber: 1, text: 'No text available' }];

    const raw = activeDoc.rawText;
    // Check if rawText contains page markers or split logically
    if (raw.includes('ARTICLE 3: PROJECT SCHEDULE') && raw.includes('ARTICLE 4: COMPENSATION')) {
      // Synthetic demo doc A
      return [
        {
          pageNumber: 1,
          text: `MASTER SERVICES AGREEMENT\nPROJECT ALPHA PRIME — CORE INFRASTRUCTURE PLATFORM\nCONTRACT IDENTIFIER: MSA-2026-ALPHA-089\n\nPARTIES AND RECITALS:\nThis Master Services Agreement ("Agreement") is executed on June 1, 2026, by and between:\n1. SPONSOR: Apex Global Financial Services Corp., represented by Elena Rostova, Principal Contract Officer.\n2. VENDOR: NovaSynthetix Enterprise Systems LLC, represented by Marcus Vance, Lead Delivery Director.\n\nARTICLE 1: PURPOSE AND SCOPE OF WORK\nVendor shall design, construct, test, and deploy the Project Alpha Prime Intelligent Document Reasoning Engine and Core Financial Ingestion Platform. All system components must achieve production readiness, high-availability multi-region fault tolerance, and automated compliance auditing as detailed in Schedule A.`,
        },
        {
          pageNumber: 2,
          text: `ARTICLE 3: PROJECT SCHEDULE, MILESTONES, AND ACCEPTANCE\nSection 3.1: Milestone Schedule:\n- Milestone 1: Architectural Foundation, Ingestion Engine & Schema Pipeline — July 30, 2026.\n- Milestone 2: Hybrid Retrieval Engine & Semantic Indexing — September 30, 2026.\n- Milestone 3: Core Banking API Integration & Multi-Document Reasoning Gateway — October 31, 2026.\n- Final Acceptance Testing & Production Go-Live: November 15, 2026.\n\nSection 3.2: Delay and Liquidated Damages:\nTime is of the essence. In the event of unexcused delay beyond the final completion date of November 15, 2026, Vendor shall pay liquidated damages of $5,000 USD per business day until formal acceptance is executed, up to an aggregate cap of $250,000 USD.`,
        },
        {
          pageNumber: 3,
          text: `ARTICLE 4: COMPENSATION, BUDGET CEILING, AND PAYMENT TERMS\nSection 4.1: Fixed-Price Contract Cap:\nThe total agreed compensation for all deliverables, licenses, infrastructure setup, and professional services under this Agreement shall not exceed $1,250,000 USD ("Approved Contract Ceiling").\n\nSection 4.2: Scope Changes and Cost Overruns:\nVendor shall not incur any reimbursable expenditure or invoice amounts exceeding $1,250,000 USD without a formal, written Bilateral Contract Amendment signed by both Elena Rostova (Sponsor) and Marcus Vance (Vendor). Any unilateral expense in excess of this ceiling shall be borne exclusively by the Vendor.`,
        },
        {
          pageNumber: 4,
          text: `ARTICLE 5: QUALITY METRICS AND TECHNICAL STANDARDS\nSection 5.1: Engineering Quality Gates:\nVendor must maintain a minimum of 90.0% automated unit test coverage across all microservices and business logic layers prior to production deployment.\n\nARTICLE 6: CLIENT DEPENDENCIES AND INTEGRATION OBLIGATIONS\nSection 6.3: Third-Party Banking Integration Credentials:\nSponsor warrants that all necessary API tokens, mutual TLS certificates, and compliance authorization for the Tier-1 Core Banking Gateway shall be delivered to Vendor within 14 calendar days of contract execution (no later than June 15, 2026). Delays caused by Sponsor's failure to furnish required access shall constitute an Excusable Delay.`,
        },
      ];
    } else if (raw.includes('FINANCIAL PERFORMANCE & COST VARIANCE') && raw.includes('$1,480,000')) {
      // Synthetic demo doc B
      return [
        {
          pageNumber: 1,
          text: `PROJECT ALPHA PRIME — QUARTERLY STATUS REPORT & RISK ASSESSMENT\nREPORTING PERIOD: Q3 2026 (CLOSING SEPTEMBER 30, 2026)\nAUTHOR: Marcus Vance, Lead Delivery Director (NovaSynthetix)\nDISTRIBUTION: Project Steering Committee, Elena Rostova, Executive Sponsors\nOVERALL STATUS: AMBER (Schedule & Commercial Variance)\n\nEXECUTIVE SUMMARY:\nCore engineering deliverables for Project Alpha Prime have achieved exceptional technical milestones during Q3 2026. Milestones 1 and 2 were completed on schedule. However, project execution is facing critical external blockers and an updated financial forecast variance that necessitates steering committee intervention and formal contractual realignment.`,
        },
        {
          pageNumber: 2,
          text: `FINANCIAL PERFORMANCE & COST VARIANCE ASSESSMENT\n1. Revised Forecast to Completion:\nDue to extended cloud provisioning requirements, cross-region replication setup, and comprehensive third-party security penetration auditing, the updated total cost forecast to complete Project Alpha Prime is $1,480,000 USD.\n\n2. Cost Variance Analysis:\nThis represents an 18.4% cost overrun ($230,000 USD variance) relative to the original baseline budget of $1,250,000 USD. A formal Cost Variance Justification memo is being prepared for Elena Rostova to request supplementary budget allocation. Currently, no signed bilateral change order is in effect.`,
        },
        {
          pageNumber: 3,
          text: `ENGINEERING EXECUTION & QUALITY METRICS\n1. Milestone Accomplishments:\n- Milestone 1 (Ingestion & Schema Pipeline): 100% Complete (Accepted July 28, 2026).\n- Milestone 2 (Hybrid Retrieval & BM25 Vector Indexing): 100% Complete (Accepted September 29, 2026).\n\n2. Quality Gate Verification:\nAutomated test suite execution currently registers 92.4% test coverage across 840 automated integration test suites, successfully exceeding the contractual SLA threshold of 90.0%. Automated SAST/DAST static analysis reports zero critical vulnerabilities.`,
        },
        {
          pageNumber: 4,
          text: `SCHEDULE RE-BASELINE & CRITICAL DEPENDENCY BLOCKER\n1. Production Go-Live Delay:\nThe final production deployment date has slipped by 66 calendar days. The updated target completion date is now January 20, 2027 (revised from the initial November 15, 2026 date).\n\n2. Unresolved Blocker — Tier-1 Banking API Authorization:\nThe primary cause of the schedule delay is the pending security sign-off for the Tier-1 Core Banking API Gateway. Authorization has been blocked at the Client Compliance Review Committee since August 12, 2026 (over 49 days pending). Vendor development teams cannot execute end-to-end reconciliation testing until Dr. Sarah Chen releases the sandbox tokens. Vendor formally invokes Section 6.3 regarding Excusable Delay.`,
        },
      ];
    }

    // Default pagination
    const paragraphs = raw.split('\n\n');
    const pages: { pageNumber: number; text: string }[] = [];
    let cur = '';
    let pNum = 1;
    for (const p of paragraphs) {
      if (cur.length + p.length > 1800 && cur.length > 400) {
        pages.push({ pageNumber: pNum, text: cur.trim() });
        pNum++;
        cur = p + '\n\n';
      } else {
        cur += p + '\n\n';
      }
    }
    if (cur.trim().length > 0) {
      pages.push({ pageNumber: pNum, text: cur.trim() });
    }
    return pages.length > 0 ? pages : [{ pageNumber: 1, text: raw }];
  };

  const pages = getPages();
  const activePageObj = pages.find((p) => p.pageNumber === currentPage) || pages[0];

  // Helper to render text with live highlighting
  const renderHighlightedText = (text: string) => {
    if (!text) return null;

    // Check if there is an active cited highlight for this page
    const shouldHighlight =
      highlightedText &&
      (!highlightedPage || highlightedPage === currentPage) &&
      highlightedText.length > 10;

    if (!shouldHighlight) {
      return (
        <div className="text-slate-300 whitespace-pre-wrap leading-relaxed font-sans text-xs">
          {text}
        </div>
      );
    }

    // Clean highlight keyword snippet
    const cleanSnippet = highlightedText!
      .replace(/[^\w\s$€£%-]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3)
      .slice(0, 4)
      .join(' ')
      .toLowerCase();

    const lowerText = text.toLowerCase();
    const matchIdx = cleanSnippet ? lowerText.indexOf(cleanSnippet) : -1;

    if (matchIdx !== -1) {
      const before = text.slice(0, matchIdx);
      const match = text.slice(matchIdx, matchIdx + cleanSnippet.length + 60);
      const after = text.slice(matchIdx + match.length);

      return (
        <div className="text-slate-300 whitespace-pre-wrap leading-relaxed font-sans text-xs">
          {before}
          <mark className="bg-violet-500/30 text-white border-b-2 border-cyan-400 px-1 py-0.5 rounded shadow-cyanGlow/30 font-medium">
            {match}
          </mark>
          {after}
        </div>
      );
    }

    return (
      <div className="text-slate-300 whitespace-pre-wrap leading-relaxed font-sans text-xs">
        {text}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-background-deep border-r border-white/10 select-none">
      {/* Top Document Tabs Bar */}
      <div className="p-3 border-b border-white/10 bg-background-card/90 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full">
          {documents.map((doc) => {
            const isSelected = activeDoc?.id === doc.id;
            return (
              <button
                key={doc.id}
                onClick={() => {
                  onSelectDoc(doc.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-violet-600 text-white shadow-glow border border-violet-400/40'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="truncate max-w-[150px]">{doc.name}</span>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-black/30 text-slate-300">
                  {doc.pageCount}p
                </span>
              </button>
            );
          })}
        </div>

        {/* Page Navigation Controls */}
        <div className="flex items-center gap-1.5 shrink-0 bg-background-deep border border-white/10 rounded-lg px-2 py-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-mono text-slate-300 px-1">
            {currentPage} / {pages.length}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(pages.length, p + 1))}
            disabled={currentPage >= pages.length}
            className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Document Information Strip */}
      <div className="px-4 py-2 border-b border-white/5 bg-background-elevated/40 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-cyan-400 font-semibold">
            {activeDoc?.name}
          </span>
          <span>•</span>
          <span>Page {currentPage} of {pages.length}</span>
        </div>

        {highlightedText && highlightedPage === currentPage && (
          <div className="flex items-center gap-1.5 text-violet-300 bg-violet-500/20 px-2 py-0.5 rounded border border-violet-500/30 animate-pulse">
            <Sparkles className="w-3 h-3 text-cyan-300" />
            <span className="font-semibold text-[10px]">Active Cited Evidence Highlighted</span>
          </div>
        )}
      </div>

      {/* Live Document Page Content */}
      <div
        ref={contentContainerRef}
        className="flex-1 p-6 overflow-y-auto bg-background/50 font-mono text-xs leading-relaxed"
      >
        <div className="max-w-2xl mx-auto bg-background-card/90 border border-white/10 rounded-2xl p-7 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 text-slate-500 text-[10px] uppercase tracking-wider font-mono">
            <span>Official Document Extract — Ground Truth</span>
            <span>Page {currentPage}</span>
          </div>

          {renderHighlightedText(activePageObj?.text || '')}

          <div className="border-t border-white/10 pt-3 flex justify-between text-[10px] text-slate-500 font-mono">
            <span>Hash: {activeDoc?.id}-p{currentPage}</span>
            <span>Immutable Corpus Baseline</span>
          </div>
        </div>
      </div>
    </div>
  );
};
