'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Stamp,
  Download,
  Printer,
  AlertTriangle,
  Layers,
  FileCode,
} from 'lucide-react';
import { DocumentRecord } from '@/types';

interface RealisticDocumentCanvasProps {
  documents: DocumentRecord[];
  activeDocId: string;
  onSelectDoc: (id: string) => void;
  highlightedText?: string | null;
  highlightedPage?: number | null;
}

export const RealisticDocumentCanvas: React.FC<RealisticDocumentCanvasProps> = ({
  documents,
  activeDocId,
  onSelectDoc,
  highlightedText,
  highlightedPage,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [pageJumpInput, setPageJumpInput] = useState<string>('1');
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeDoc = documents.find((d) => d.id === activeDocId) || documents[0];

  // Helper to retrieve extracted pages from active document
  const getActivePages = (): Array<{ pageNumber: number; text: string }> => {
    if (!activeDoc) return [];
    if (activeDoc.pages && activeDoc.pages.length > 0) {
      return activeDoc.pages;
    }
    if (activeDoc.rawText) {
      const formFeedSplit = activeDoc.rawText.split('\f');
      if (formFeedSplit.length > 1) {
        return formFeedSplit.map((p, i) => ({ pageNumber: i + 1, text: p.trim() }));
      }
      const paragraphs = activeDoc.rawText.split('\n\n');
      const logicalPages: Array<{ pageNumber: number; text: string }> = [];
      let curText = '';
      let pageNum = 1;
      for (const p of paragraphs) {
        if (curText.length + p.length > 2500 && curText.length > 500) {
          logicalPages.push({ pageNumber: pageNum, text: curText.trim() });
          pageNum++;
          curText = p + '\n\n';
        } else {
          curText += p + '\n\n';
        }
      }
      if (curText.trim()) {
        logicalPages.push({ pageNumber: pageNum, text: curText.trim() });
      }
      return logicalPages.length > 0 ? logicalPages : [{ pageNumber: 1, text: activeDoc.rawText }];
    }
    return [{ pageNumber: 1, text: 'No text extracted from this document.' }];
  };

  const activePages = getActivePages();
  const totalPages =
    activeDoc?.id === 'demo-doc-contract'
      ? 4
      : activeDoc?.id === 'demo-doc-status-report'
      ? 4
      : Math.max(1, activeDoc?.pageCount || activePages.length);

  const displayPage = Math.min(Math.max(1, currentPage), totalPages);

  // Sync jump input with current page
  useEffect(() => {
    setPageJumpInput(String(displayPage));
  }, [displayPage]);

  // Reset to page 1 when switching documents
  useEffect(() => {
    setCurrentPage(1);
    setPageJumpInput('1');
  }, [activeDocId]);

  // Auto-switch page when an evidence citation or pitch step is clicked
  useEffect(() => {
    if (highlightedPage && highlightedPage >= 1) {
      setCurrentPage(Math.min(highlightedPage, totalPages));
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [highlightedPage, highlightedText, totalPages]);

  // Document A: Project Alpha Prime Contract (4 realistic pages)
  const renderContractPage = (page: number) => {
    const isTargetPage = highlightedPage === page || (!highlightedPage && page === 3);
    const hasHighlight = highlightedText && isTargetPage;

    switch (page) {
      case 1:
        return (
          <div className="space-y-6 text-[#1E293B]">
            {/* Formal Legal Header */}
            <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
              <div>
                <div className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                  CONFIDENTIAL & BINDING LEGAL INSTRUMENT
                </div>
                <h1 className="text-xl font-bold font-serif text-slate-900 tracking-tight mt-1">
                  MASTER SERVICES AGREEMENT
                </h1>
                <div className="text-xs font-serif italic text-slate-600 mt-0.5">
                  Core Enterprise Ingestion & Document Intelligence Platform
                </div>
              </div>
              <div className="text-right font-mono text-[10px] text-slate-500 border border-slate-300 p-2 rounded bg-slate-50">
                <div>CONTRACT ID: MSA-2026-ALPHA-089</div>
                <div>EXECUTION DATE: JUNE 1, 2026</div>
                <div className="text-emerald-700 font-bold">STATUS: FULLY EXECUTED</div>
              </div>
            </div>

            {/* Recitals */}
            <div className="space-y-3 text-xs leading-relaxed font-serif">
              <p>
                This Master Services Agreement (the <strong>"Agreement"</strong>) is entered into as of{' '}
                <strong>June 1, 2026</strong> (the <strong>"Effective Date"</strong>), by and between:
              </p>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded border border-slate-200">
                <div>
                  <div className="font-bold text-slate-900 text-[11px] uppercase tracking-wider">
                    SPONSOR (CLIENT):
                  </div>
                  <div className="font-sans font-semibold text-slate-800 mt-1">
                    Apex Global Financial Services Corp.
                  </div>
                  <div className="text-[11px] text-slate-600">100 Wall Street, New York, NY</div>
                  <div className="text-[11px] text-slate-600 mt-1">
                    Authorized Signatory: <strong>Elena Rostova</strong>, Principal Contract Officer
                  </div>
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-[11px] uppercase tracking-wider">
                    VENDOR (PROVIDER):
                  </div>
                  <div className="font-sans font-semibold text-slate-800 mt-1">
                    NovaSynthetix Enterprise Systems LLC
                  </div>
                  <div className="text-[11px] text-slate-600">450 Mission Street, San Francisco, CA</div>
                  <div className="text-[11px] text-slate-600 mt-1">
                    Authorized Signatory: <strong>Marcus Vance</strong>, Lead Delivery Director
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <h3 className="font-bold font-sans text-xs text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                  ARTICLE 1: RECITALS & PURPOSE OF ENGAGEMENT
                </h3>
                <p className="mt-2 text-slate-700 leading-relaxed">
                  WHEREAS, Sponsor requires the design, development, integration, and high-availability deployment
                  of the Project Alpha Prime Document Intelligence Platform; and Vendor represents that it possesses
                  the technical architecture, personnel, and compliance controls required to deliver all specified
                  deliverables in accordance with Schedule A (Technical Specifications).
                </p>
              </div>

              <div>
                <h3 className="font-bold font-sans text-xs text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                  ARTICLE 2: SCOPE OF DELIVERABLES
                </h3>
                <p className="mt-2 text-slate-700 leading-relaxed">
                  Vendor shall construct the automated ingestion pipeline, hybrid BM25 and vector retrieval
                  cluster, cross-document contradiction reasoning gateway, and multi-format export interface. All
                  system components must achieve 99.95% operational uptime in a multi-region deployment.
                </p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 text-[#1E293B]">
            <div className="border-b border-slate-300 pb-2 flex justify-between items-center text-xs text-slate-500 font-mono">
              <span>PROJECT ALPHA PRIME — MSA-2026-ALPHA-089</span>
              <span>PAGE 2 OF 4</span>
            </div>

            <div className="space-y-4 text-xs font-serif leading-relaxed">
              <h3 className="font-bold font-sans text-xs text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                ARTICLE 3: PROJECT SCHEDULE, MILESTONES, AND ACCEPTANCE
              </h3>

              <p className="text-slate-700">
                <strong>Section 3.1: Milestone Schedule.</strong> Vendor shall achieve the following technical
                milestones. Time is of the essence with respect to each designated completion date:
              </p>

              {/* Milestones Table */}
              <div className="border border-slate-300 rounded overflow-hidden">
                <table className="w-full text-left font-sans text-xs">
                  <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                    <tr>
                      <th className="p-2">Milestone</th>
                      <th className="p-2">Scope & Deliverables</th>
                      <th className="p-2">Target Date</th>
                      <th className="p-2">Acceptance Gate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    <tr>
                      <td className="p-2 font-semibold">Milestone 1</td>
                      <td className="p-2">Core Ingestion Engine & Page Schema Pipeline</td>
                      <td className="p-2 font-mono">July 30, 2026</td>
                      <td className="p-2 text-emerald-700 font-medium">100% Extraction Match</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold">Milestone 2</td>
                      <td className="p-2">Hybrid BM25 Retrieval & Vector Knowledge Graph</td>
                      <td className="p-2 font-mono">September 30, 2026</td>
                      <td className="p-2 text-emerald-700 font-medium">Sub-50ms Latency</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold">Milestone 3</td>
                      <td className="p-2">Tier-1 Core Banking Gateway & Multi-Doc Reasoning</td>
                      <td className="p-2 font-mono">October 31, 2026</td>
                      <td className="p-2 text-amber-700 font-medium">Mutual TLS Active</td>
                    </tr>
                    <tr className="bg-slate-50 font-bold">
                      <td className="p-2">Final Delivery</td>
                      <td className="p-2">Final Production Go-Live & Acceptance Testing</td>
                      <td className="p-2 font-mono text-violet-800">November 15, 2026</td>
                      <td className="p-2 text-slate-900">Formal Sign-Off</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Liquidated Damages Clause (Highlightable) */}
              <div
                className={`p-3 rounded border transition-all ${
                  hasHighlight && (highlightedText?.includes('November 15') || highlightedText?.includes('5,000'))
                    ? 'bg-amber-100 border-amber-500 shadow-lg ring-2 ring-amber-400'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="font-bold font-sans text-xs text-slate-900 flex items-center justify-between">
                  <span>SECTION 3.2: UNEXCUSED DELAY & LIQUIDATED DAMAGES</span>
                  {hasHighlight && (highlightedText?.includes('November 15') || highlightedText?.includes('5,000')) && (
                    <span className="text-[10px] font-mono bg-amber-600 text-white px-2 py-0.5 rounded font-bold animate-pulse">
                      ✦ CITED CONTRACT DEADLINE
                    </span>
                  )}
                </div>
                <p className="mt-1 text-slate-800 leading-relaxed font-sans text-xs">
                  "Time is of the absolute essence. In the event of unexcused delay beyond the contractual final
                  delivery date of <strong>November 15, 2026</strong>, Vendor shall pay liquidated damages of{' '}
                  <strong className="text-rose-700">$5,000 USD per business day</strong> until formal written
                  acceptance is executed, up to an aggregate liability cap of $250,000 USD."
                </p>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 text-[#1E293B]">
            <div className="border-b border-slate-300 pb-2 flex justify-between items-center text-xs text-slate-500 font-mono">
              <span>PROJECT ALPHA PRIME — MSA-2026-ALPHA-089</span>
              <span>PAGE 3 OF 4</span>
            </div>

            <div className="space-y-4 text-xs font-serif leading-relaxed">
              <h3 className="font-bold font-sans text-xs text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                ARTICLE 4: COMPENSATION, BUDGET CEILING, AND PAYMENT TERMS
              </h3>

              {/* Fixed Price Budget Cap Clause (Highlightable) */}
              <div
                className={`p-4 rounded-lg border transition-all ${
                  hasHighlight || true // Always highlight clearly if on page 3
                    ? 'bg-violet-50/90 border-violet-400 shadow-md ring-2 ring-violet-400/60'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between font-sans text-xs font-bold text-violet-950 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-violet-700" />
                    SECTION 4.1: FIXED-PRICE BUDGET CEILING & COMPENSATION
                  </span>
                  <span className="text-[10px] font-mono bg-violet-600 text-white px-2 py-0.5 rounded font-bold">
                    ✦ GROUND TRUTH BASELINE
                  </span>
                </div>
                <p className="text-slate-900 leading-relaxed font-sans text-xs font-medium">
                  "The total agreed compensation for all deliverables, software licenses, infrastructure setup, and
                  professional services under this Agreement shall not exceed{' '}
                  <mark className="bg-yellow-200 text-slate-950 font-bold px-1.5 py-0.5 rounded border border-yellow-400">
                    $1,250,000 USD
                  </mark>{' '}
                  ('Approved Contract Ceiling'). Sponsor shall have no obligation to pay any sum in excess of this
                  amount."
                </p>
              </div>

              {/* Cost Overrun Prohibition Clause */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded text-slate-700 font-sans text-xs leading-relaxed space-y-1">
                <div className="font-bold text-slate-900">
                  SECTION 4.2: SCOPE CHANGES & COST OVERRUNS PROHIBITION
                </div>
                <p>
                  "Vendor shall not incur any reimbursable expenditure or invoice amounts exceeding $1,250,000 USD
                  without a formal, written Bilateral Contract Amendment signed by both Elena Rostova (Sponsor) and
                  Marcus Vance (Vendor). Any unilateral expense in excess of this ceiling shall be borne exclusively
                  by the Vendor without recourse to Sponsor."
                </p>
              </div>

              <div>
                <div className="font-bold font-sans text-xs text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 mt-4">
                  SECTION 4.3: INVOICING AND AUDIT RIGHTS
                </div>
                <p className="mt-2 text-slate-700 leading-relaxed font-sans">
                  Vendor shall submit itemized invoices against verified milestone acceptance certificates. Sponsor
                  maintains full financial audit rights to review all cloud compute receipts, vendor subcontractor
                  hours, and software license records upon five (5) business days written notice.
                </p>
              </div>
            </div>
          </div>
        );

      case 4:
      default:
        return (
          <div className="space-y-6 text-[#1E293B]">
            <div className="border-b border-slate-300 pb-2 flex justify-between items-center text-xs text-slate-500 font-mono">
              <span>PROJECT ALPHA PRIME — MSA-2026-ALPHA-089</span>
              <span>PAGE 4 OF 4</span>
            </div>

            <div className="space-y-4 text-xs font-serif leading-relaxed">
              <h3 className="font-bold font-sans text-xs text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                ARTICLE 5: QUALITY METRICS AND TECHNICAL STANDARDS
              </h3>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded font-sans text-xs leading-relaxed">
                <div className="font-bold text-slate-900">SECTION 5.1: CODE QUALITY & TEST COVERAGE SLA</div>
                <p className="mt-1 text-slate-700">
                  "Vendor must maintain a minimum of <strong>90.0% automated unit test coverage</strong> across all
                  core microservices and business logic layers prior to production deployment. Automated security
                  scans must report zero critical or high vulnerabilities."
                </p>
              </div>

              <h3 className="font-bold font-sans text-xs text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 mt-4">
                ARTICLE 6: CLIENT DEPENDENCIES AND INTEGRATION OBLIGATIONS
              </h3>

              {/* Section 6.3 Client Dependency */}
              <div
                className={`p-3 rounded border font-sans text-xs leading-relaxed transition-all ${
                  hasHighlight && highlightedText?.includes('Banking')
                    ? 'bg-cyan-50 border-cyan-400 shadow-md ring-2 ring-cyan-300'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="font-bold text-slate-900 flex items-center justify-between">
                  <span>SECTION 6.3: THIRD-PARTY BANKING API CREDENTIALS</span>
                  {hasHighlight && highlightedText?.includes('Banking') && (
                    <span className="text-[10px] font-mono bg-cyan-600 text-white px-2 py-0.5 rounded font-bold">
                      ✦ CITED DEPENDENCY CLAUSE
                    </span>
                  )}
                </div>
                <p className="mt-1 text-slate-800">
                  "Sponsor warrants that all necessary API tokens, mutual TLS certificates, and compliance authorization
                  for the Tier-1 Core Banking Gateway shall be delivered to Vendor within 14 calendar days of contract
                  execution (no later than June 15, 2026). Delays caused by Sponsor's failure to furnish required access
                  shall constitute an Excusable Delay."
                </p>
              </div>

              {/* Signature Block */}
              <div className="pt-6 border-t-2 border-slate-900">
                <div className="text-[11px] font-sans font-bold text-slate-900 uppercase tracking-wider mb-4">
                  IN WITNESS WHEREOF, THE PARTIES HAVE EXECUTED THIS AGREEMENT:
                </div>
                <div className="grid grid-cols-2 gap-6 font-sans">
                  <div className="border border-slate-300 p-3 rounded bg-slate-50 relative">
                    <div className="text-[10px] text-slate-500 uppercase">FOR SPONSOR:</div>
                    <div className="font-serif italic text-base text-slate-900 mt-1">Elena Rostova</div>
                    <div className="text-xs font-semibold text-slate-800">Elena Rostova</div>
                    <div className="text-[10px] text-slate-600">Principal Contract Officer</div>
                    <div className="text-[9px] font-mono text-emerald-700 mt-1">
                      ✓ Digitally Signed & Notarized: 2026-06-01 14:22:09 UTC
                    </div>
                  </div>

                  <div className="border border-slate-300 p-3 rounded bg-slate-50 relative">
                    <div className="text-[10px] text-slate-500 uppercase">FOR VENDOR:</div>
                    <div className="font-serif italic text-base text-slate-900 mt-1">Marcus Vance</div>
                    <div className="text-xs font-semibold text-slate-800">Marcus Vance</div>
                    <div className="text-[10px] text-slate-600">Lead Delivery Director</div>
                    <div className="text-[9px] font-mono text-emerald-700 mt-1">
                      ✓ Digitally Signed & Notarized: 2026-06-01 15:40:12 UTC
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  // Document B: Project Alpha Prime Q3 Status Report (4 realistic pages)
  const renderStatusReportPage = (page: number) => {
    const isTargetPage = highlightedPage === page || (!highlightedPage && page === 2);
    const hasHighlight = highlightedText && isTargetPage;

    switch (page) {
      case 1:
        return (
          <div className="space-y-6 text-[#1E293B]">
            {/* Executive Status Header */}
            <div className="border-b-2 border-amber-600 pb-3 flex items-start justify-between">
              <div>
                <div className="text-[10px] font-mono tracking-widest text-amber-700 uppercase font-bold">
                  EXECUTIVE STEERING COMMITTEE REPORT
                </div>
                <h1 className="text-xl font-bold font-sans text-slate-900 tracking-tight mt-1">
                  PROJECT ALPHA PRIME — STATUS REPORT & RISK AUDIT
                </h1>
                <div className="text-xs text-slate-600 font-medium">Reporting Period: Q3 2026 (Ending September 30, 2026)</div>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 rounded bg-amber-500 text-white font-bold font-mono text-xs shadow-sm">
                  OVERALL STATUS: AMBER
                </span>
                <div className="text-[10px] font-mono text-slate-500 mt-1">DISTRIBUTION: RESTRICTED</div>
              </div>
            </div>

            <div className="space-y-4 text-xs font-sans leading-relaxed">
              <div className="bg-slate-50 p-3 rounded border border-slate-200 grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Author</div>
                  <div className="font-bold text-slate-900 text-xs">Marcus Vance</div>
                  <div className="text-[10px] text-slate-600">Delivery Director</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Reviewer</div>
                  <div className="font-bold text-slate-900 text-xs">Elena Rostova</div>
                  <div className="text-[10px] text-slate-600">Client Sponsor</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Schedule Variance</div>
                  <div className="font-bold text-rose-700 text-xs">+66 Days Slip</div>
                  <div className="text-[10px] text-slate-600">Critical Blocker</div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                  1. EXECUTIVE SUMMARY & REASONING
                </h3>
                <p className="mt-2 text-slate-700 leading-relaxed">
                  During Q3 2026, engineering teams successfully completed Milestones 1 and 2 ahead of schedule,
                  demonstrating automated code quality (92.4% test coverage). However, overall delivery is now
                  facing critical commercial variance and an external dependency impasse that requires immediate
                  executive steering committee intervention.
                </p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 text-[#1E293B]">
            <div className="border-b border-slate-300 pb-2 flex justify-between items-center text-xs text-slate-500 font-mono">
              <span>PROJECT ALPHA PRIME — STATUS REPORT Q3 2026</span>
              <span>PAGE 2 OF 4</span>
            </div>

            <div className="space-y-4 text-xs font-sans leading-relaxed">
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                2. FINANCIAL PERFORMANCE & REVISED COST FORECAST
              </h3>

              {/* The Blatant Cost Overrun Box (Highlighted) */}
              <div
                className={`p-4 rounded-lg border transition-all ${
                  hasHighlight || true
                    ? 'bg-rose-50 border-rose-400 shadow-md ring-2 ring-rose-400/60'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold text-rose-950 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
                    REVISED FORECAST TO COMPLETION (COST OVERRUN)
                  </span>
                  <span className="text-[10px] font-mono bg-rose-600 text-white px-2 py-0.5 rounded font-bold">
                    ⚠️ CONTRADICTION DETECTED
                  </span>
                </div>
                <p className="text-slate-900 leading-relaxed font-sans text-xs">
                  "Due to extended cloud infrastructure provisioning, multi-region database replication, and
                  comprehensive third-party penetration audits, the revised total cost forecast to complete Project
                  Alpha Prime is{' '}
                  <mark className="bg-rose-200 text-rose-950 font-bold px-1.5 py-0.5 rounded border border-rose-400">
                    $1,480,000 USD
                  </mark>
                  ."
                </p>
                <div className="mt-3 p-2 bg-white rounded border border-rose-200 text-slate-800 text-[11px] space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>Approved Contract Ceiling (Doc A):</span>
                    <span className="font-mono text-slate-900">$1,250,000 USD</span>
                  </div>
                  <div className="flex justify-between font-bold text-rose-700">
                    <span>Revised Forecast (Doc B):</span>
                    <span className="font-mono">$1,480,000 USD (+18.4%)</span>
                  </div>
                  <div className="flex justify-between text-slate-600 border-t border-slate-200 pt-1 text-[10px]">
                    <span>Net Unapproved Cost Variance:</span>
                    <span className="font-mono font-bold text-rose-700">+$230,000 USD Overrun</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded text-slate-700 text-xs">
                <div className="font-bold text-slate-900">COST VARIANCE ACTION ITEM:</div>
                <p className="mt-1">
                  A formal Cost Variance Justification memo is being submitted to Elena Rostova. Currently,{' '}
                  <strong>no bilateral contract amendment has been executed</strong>, creating immediate billing exposure
                  under Section 4.2 of the Master Agreement.
                </p>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 text-[#1E293B]">
            <div className="border-b border-slate-300 pb-2 flex justify-between items-center text-xs text-slate-500 font-mono">
              <span>PROJECT ALPHA PRIME — STATUS REPORT Q3 2026</span>
              <span>PAGE 3 OF 4</span>
            </div>

            <div className="space-y-4 text-xs font-sans leading-relaxed">
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                3. TECHNICAL QUALITY GATES & CODE METRICS
              </h3>

              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded text-emerald-950 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span>AUTOMATED UNIT TEST COVERAGE: 92.4%</span>
                  <span className="text-[10px] font-mono bg-emerald-600 text-white px-2 py-0.5 rounded">
                    ✓ EXCEEDS 90.0% SLA
                  </span>
                </div>
                <p className="text-slate-800 text-[11px]">
                  "Automated regression suites report 92.4% line coverage across 840 automated integration test
                  suites, successfully surpassing the Section 5.1 contractual standard."
                </p>
              </div>
            </div>
          </div>
        );

      case 4:
      default:
        return (
          <div className="space-y-6 text-[#1E293B]">
            <div className="border-b border-slate-300 pb-2 flex justify-between items-center text-xs text-slate-500 font-mono">
              <span>PROJECT ALPHA PRIME — STATUS REPORT Q3 2026</span>
              <span>PAGE 4 OF 4</span>
            </div>

            <div className="space-y-4 text-xs font-sans leading-relaxed">
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                4. SCHEDULE RE-BASELINE & DEPENDENCY BLOCKER
              </h3>

              {/* Delivery Delay Box (Highlighted) */}
              <div
                className={`p-4 rounded-lg border transition-all ${
                  hasHighlight || true
                    ? 'bg-amber-50 border-amber-400 shadow-md ring-2 ring-amber-400/60'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold text-amber-950 mb-1">
                  <span>PRODUCTION GO-LIVE RESCHEDULED: JANUARY 20, 2027</span>
                  <span className="text-[10px] font-mono bg-amber-600 text-white px-2 py-0.5 rounded font-bold">
                    66-DAY SLIP
                  </span>
                </div>
                <p className="text-slate-800 text-xs leading-relaxed">
                  "Target completion has slipped by 66 calendar days, with projected go-live moving from{' '}
                  <strong>November 15, 2026</strong> to{' '}
                  <mark className="bg-amber-200 text-slate-900 font-bold px-1.5 py-0.5 rounded">
                    January 20, 2027
                  </mark>
                  ."
                </p>
              </div>

              {/* Critical Blocker */}
              <div className="p-3 bg-rose-50 border border-rose-300 rounded text-xs space-y-1">
                <div className="font-bold text-rose-950 flex items-center justify-between">
                  <span>CRITICAL PATH BLOCKER: TIER-1 BANKING API AUTHORIZATION</span>
                  <span className="text-[10px] font-mono text-rose-700 font-bold">49+ DAYS STALLED</span>
                </div>
                <p className="text-slate-800 text-[11px] leading-relaxed">
                  "Primary root cause is pending security sign-off for the Tier-1 Banking API Gateway. Authorization
                  has been stalled at the Client Compliance Review Committee since August 12, 2026. Vendor formally
                  invokes Section 6.3 regarding Excusable Delay."
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  // Custom Uploaded Document Engine: photorealistic dynamic page rendering with heading detection & evidence illumination
  const renderCustomDocumentPage = (pageNumber: number) => {
    const pageData = activePages.find((p) => p.pageNumber === pageNumber) || activePages[pageNumber - 1] || activePages[0];
    const pageText = pageData?.text || '';

    // Split raw page text into structured paragraphs
    const rawParagraphs = pageText
      .split('\n\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const isTargetPage = highlightedPage === pageNumber;

    return (
      <div className="space-y-6 text-[#1E293B]">
        {/* Document Header with Security / Verification Seal */}
        <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between">
          <div className="max-w-[70%]">
            <div className="text-[10px] font-mono tracking-widest text-slate-500 uppercase flex items-center gap-1.5">
              <span>AUTHENTICATED RECORD</span>
              <span>•</span>
              <span className="text-violet-700 font-bold uppercase">{activeDoc.fileType}</span>
              <span>•</span>
              <span className="text-emerald-700 font-semibold">PARSED INGESTION</span>
            </div>
            <h1 className="text-base font-bold font-sans text-slate-900 tracking-tight mt-1 truncate">
              {activeDoc.name}
            </h1>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              Uploaded: {new Date(activeDoc.uploadedAt).toLocaleDateString()} • {activeDoc.fileSize ? `${(activeDoc.fileSize / 1024).toFixed(1)} KB` : 'Ready'} • {activeDoc.chunkCount} Chunks Indexed
            </div>
          </div>
          <div className="text-right font-mono text-[10px] text-slate-500 border border-slate-300 p-2 rounded bg-slate-50 shrink-0">
            <div>DOC ID: {activeDoc.id.slice(0, 15)}...</div>
            <div className="text-violet-700 font-bold">PAGE {pageNumber} OF {totalPages}</div>
            <div className="text-emerald-700 font-semibold">EVIDENCE GROUNDED</div>
          </div>
        </div>

        {/* Scanned Warning Banner if text density is low */}
        {activeDoc.isScannedWarning && (
          <div className="p-3 bg-amber-50 border border-amber-300 rounded text-amber-900 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Low extractable text detected. This document may be a scanned image requiring OCR.</span>
          </div>
        )}

        {/* Render page paragraphs */}
        {rawParagraphs.length === 0 ? (
          <div className="py-24 text-center text-slate-400 font-mono text-xs">
            [No extractable text found on Page {pageNumber}]
          </div>
        ) : (
          <div className="space-y-3.5 text-xs font-sans leading-relaxed text-slate-800">
            {rawParagraphs.map((para, idx) => {
              // Highlight matching logic:
              const isMatch =
                isTargetPage &&
                highlightedText &&
                (para.toLowerCase().includes(highlightedText.toLowerCase()) ||
                  highlightedText.toLowerCase().includes(para.slice(0, 40).toLowerCase()) ||
                  (highlightedText.length > 20 && para.includes(highlightedText.slice(0, 20))));

              // Heading detection:
              const isHeading =
                (para.length < 100 && /^[A-Z0-9\s.,:\-_#()]{4,}$/.test(para)) ||
                /^(CHAPTER|SECTION|ARTICLE|\d+\.|\d+\.\d+|EXECUTIVE|SUMMARY|INTRODUCTION|CONCLUSION|TABLE OF CONTENTS)/i.test(para);

              if (isHeading) {
                return (
                  <div
                    key={idx}
                    className={`pt-2 pb-1 border-b ${
                      isMatch
                        ? 'border-violet-500 bg-violet-50 px-3 py-1.5 rounded text-violet-950 font-bold ring-2 ring-violet-500/50'
                        : 'border-slate-200 text-slate-900 font-bold text-xs uppercase tracking-wider'
                    }`}
                  >
                    {para}
                  </div>
                );
              }

              return (
                <div
                  key={idx}
                  className={`transition-all duration-300 rounded ${
                    isMatch
                      ? 'bg-violet-100/90 text-violet-950 p-3 border-l-4 border-violet-600 shadow-md ring-2 ring-violet-400/50 font-medium'
                      : 'text-slate-700'
                  }`}
                >
                  {isMatch && (
                    <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-violet-700 uppercase tracking-wider mb-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-violet-600 animate-pulse" />
                      <span>CITED EVIDENCE PASSAGE (GROUND TRUTH VERIFIED)</span>
                    </div>
                  )}
                  <p className="whitespace-pre-line leading-relaxed">{para}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Document Page Footer */}
        <div className="border-t border-slate-200 pt-3 mt-8 flex justify-between items-center text-[10px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>DOCUMIND EVIDENCE GROUNDING ENGINE</span>
          </div>
          <span>PAGE {pageNumber} OF {totalPages}</span>
          <span className="text-emerald-700 font-semibold">✓ INTEGRITY AUDITED</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#0B0F19] select-none">
      {/* Top Document Header Bar */}
      <div className="h-12 border-b border-white/10 bg-[#070A11] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto max-w-[calc(100%-280px)] scrollbar-none py-1">
          {documents.map((doc) => {
            const isSelected = activeDoc?.id === doc.id;
            return (
              <button
                key={doc.id}
                onClick={() => {
                  onSelectDoc(doc.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 shrink-0 transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-glow border border-violet-400/40'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
                title={doc.name}
              >
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate max-w-[150px]">{doc.name}</span>
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-black/40 text-slate-300">
                  {doc.pageCount || (doc.pages ? doc.pages.length : 1)}p
                </span>
              </button>
            );
          })}
        </div>

        {/* Page Switcher & Zoom */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-0.5 font-mono text-slate-300">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={displayPage <= 1}
              className="p-1 rounded hover:bg-white/10 disabled:opacity-30"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center gap-1 px-1.5 font-bold text-cyan-300">
              <span>Page</span>
              <input
                type="text"
                value={pageJumpInput}
                onChange={(e) => {
                  setPageJumpInput(e.target.value);
                  const p = parseInt(e.target.value, 10);
                  if (!isNaN(p) && p >= 1 && p <= totalPages) {
                    setCurrentPage(p);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const p = parseInt(pageJumpInput, 10);
                    if (!isNaN(p) && p >= 1 && p <= totalPages) {
                      setCurrentPage(p);
                    } else {
                      setPageJumpInput(String(displayPage));
                    }
                  }
                }}
                className="w-9 text-center bg-white/10 border border-white/20 rounded text-cyan-300 font-mono text-xs py-0.5 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                title="Type a page number and press Enter"
              />
              <span>of {totalPages}</span>
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={displayPage >= totalPages}
              className="p-1 rounded hover:bg-white/10 disabled:opacity-30"
              title="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1 text-slate-400">
            <button
              onClick={() => setZoomLevel((z) => Math.max(80, z - 10))}
              className="p-0.5 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono px-1 text-slate-300">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(130, z + 10))}
              className="p-0.5 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Document Sub-bar with Live Verification Tag */}
      <div className="h-8 border-b border-white/5 bg-[#0D1322] px-4 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-slate-300">Ground Truth PDF Sheet</span>
          <span>•</span>
          <span className="font-mono text-cyan-400 truncate max-w-[280px]">{activeDoc?.name}</span>
          <span className="text-[10px] text-slate-500 font-mono">({totalPages} pages)</span>
        </div>

        {highlightedText && (
          <div className="flex items-center gap-1.5 text-violet-300 bg-violet-950/60 px-2.5 py-0.5 rounded border border-violet-500/30 text-[10px] font-semibold animate-in fade-in">
            <Sparkles className="w-3 h-3 text-cyan-300 animate-spin" />
            <span>Target Passage Illuminated in Document</span>
          </div>
        )}
      </div>

      {/* Photorealistic Document Sheet Canvas */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 flex justify-center bg-[#070A11]/90"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.05) 0%, transparent 80%)',
        }}
      >
        <div
          className="bg-white text-slate-900 rounded-lg shadow-2xl p-10 max-w-2xl w-full border border-slate-300 transition-all duration-200 min-h-[720px] relative"
          style={{
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'top center',
          }}
        >
          {/* Watermark / Seal */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none opacity-[0.03] rotate-[-25deg] text-6xl font-black font-serif uppercase tracking-widest text-slate-950">
            OFFICIAL RECORD
          </div>

          {!activeDoc ? (
            <div className="py-32 text-center text-slate-400 font-mono text-sm">
              No document selected.
            </div>
          ) : activeDoc.id === 'demo-doc-contract' ? (
            renderContractPage(displayPage)
          ) : activeDoc.id === 'demo-doc-status-report' ? (
            renderStatusReportPage(displayPage)
          ) : (
            renderCustomDocumentPage(displayPage)
          )}
        </div>
      </div>
    </div>
  );
};
