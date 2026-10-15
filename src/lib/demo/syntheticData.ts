import { DocumentRecord, Chunk, Workspace } from '@/types';
import { chunkPages } from '../ingestion/chunker';
import { ExtractedPage } from '../ingestion/extractor';
import { saveDocument, wipeWorkspaceData } from '../storage';
import fs from 'fs';
import path from 'path';

export const DEMO_WORKSPACE_ID = 'demo-workspace';

export const DEMO_DOC_A_PAGES: ExtractedPage[] = [
  {
    pageNumber: 1,
    text: `MASTER SERVICES AGREEMENT
PROJECT ALPHA PRIME — CORE INFRASTRUCTURE PLATFORM
CONTRACT IDENTIFIER: MSA-2026-ALPHA-089

PARTIES AND RECITALS:
This Master Services Agreement ("Agreement") is executed on June 1, 2026, by and between:
1. SPONSOR: Apex Global Financial Services Corp., represented by Elena Rostova, Principal Contract Officer.
2. VENDOR: NovaSynthetix Enterprise Systems LLC, represented by Marcus Vance, Lead Delivery Director.

ARTICLE 1: PURPOSE AND SCOPE OF WORK
Vendor shall design, construct, test, and deploy the Project Alpha Prime Intelligent Document Reasoning Engine and Core Financial Ingestion Platform. All system components must achieve production readiness, high-availability multi-region fault tolerance, and automated compliance auditing as detailed in Schedule A.`,
  },
  {
    pageNumber: 2,
    text: `ARTICLE 3: PROJECT SCHEDULE, MILESTONES, AND ACCEPTANCE
Section 3.1: Milestone Schedule:
- Milestone 1: Architectural Foundation, Ingestion Engine & Schema Pipeline — July 30, 2026.
- Milestone 2: Hybrid Retrieval Engine & Semantic Indexing — September 30, 2026.
- Milestone 3: Core Banking API Integration & Multi-Document Reasoning Gateway — October 31, 2026.
- Final Acceptance Testing & Production Go-Live: November 15, 2026.

Section 3.2: Delay and Liquidated Damages:
Time is of the essence. In the event of unexcused delay beyond the final completion date of November 15, 2026, Vendor shall pay liquidated damages of $5,000 USD per business day until formal acceptance is executed, up to an aggregate cap of $250,000 USD.`,
  },
  {
    pageNumber: 3,
    text: `ARTICLE 4: COMPENSATION, BUDGET CEILING, AND PAYMENT TERMS
Section 4.1: Fixed-Price Contract Cap:
The total agreed compensation for all deliverables, licenses, infrastructure setup, and professional services under this Agreement shall not exceed $1,250,000 USD ("Approved Contract Ceiling"). 

Section 4.2: Scope Changes and Cost Overruns:
Vendor shall not incur any reimbursable expenditure or invoice amounts exceeding $1,250,000 USD without a formal, written Bilateral Contract Amendment signed by both Elena Rostova (Sponsor) and Marcus Vance (Vendor). Any unilateral expense in excess of this ceiling shall be borne exclusively by the Vendor.`,
  },
  {
    pageNumber: 4,
    text: `ARTICLE 5: QUALITY METRICS AND TECHNICAL STANDARDS
Section 5.1: Engineering Quality Gates:
Vendor must maintain a minimum of 90.0% automated unit test coverage across all microservices and business logic layers prior to production deployment.

ARTICLE 6: CLIENT DEPENDENCIES AND INTEGRATION OBLIGATIONS
Section 6.3: Third-Party Banking Integration Credentials:
Sponsor warrants that all necessary API tokens, mutual TLS certificates, and compliance authorization for the Tier-1 Core Banking Gateway shall be delivered to Vendor within 14 calendar days of contract execution (no later than June 15, 2026). Delays caused by Sponsor's failure to furnish required access shall constitute an Excusable Delay.`,
  },
];

export const DEMO_DOC_B_PAGES: ExtractedPage[] = [
  {
    pageNumber: 1,
    text: `PROJECT ALPHA PRIME — QUARTERLY STATUS REPORT & RISK ASSESSMENT
REPORTING PERIOD: Q3 2026 (CLOSING SEPTEMBER 30, 2026)
AUTHOR: Marcus Vance, Lead Delivery Director (NovaSynthetix)
DISTRIBUTION: Project Steering Committee, Elena Rostova, Executive Sponsors
OVERALL STATUS: AMBER (Schedule & Commercial Variance)

EXECUTIVE SUMMARY:
Core engineering deliverables for Project Alpha Prime have achieved exceptional technical milestones during Q3 2026. Milestones 1 and 2 were completed on schedule. However, project execution is facing critical external blockers and an updated financial forecast variance that necessitates steering committee intervention and formal contractual realignment.`,
  },
  {
    pageNumber: 2,
    text: `FINANCIAL PERFORMANCE & COST VARIANCE ASSESSMENT
1. Revised Forecast to Completion:
Due to extended cloud provisioning requirements, cross-region replication setup, and comprehensive third-party security penetration auditing, the updated total cost forecast to complete Project Alpha Prime is $1,480,000 USD.

2. Cost Variance Analysis:
This represents an 18.4% cost overrun ($230,000 USD variance) relative to the original baseline budget of $1,250,000 USD. A formal Cost Variance Justification memo is being prepared for Elena Rostova to request supplementary budget allocation. Currently, no signed bilateral change order is in effect.`,
  },
  {
    pageNumber: 3,
    text: `ENGINEERING EXECUTION & QUALITY METRICS
1. Milestone Accomplishments:
- Milestone 1 (Ingestion & Schema Pipeline): 100% Complete (Accepted July 28, 2026).
- Milestone 2 (Hybrid Retrieval & BM25 Vector Indexing): 100% Complete (Accepted September 29, 2026).

2. Quality Gate Verification:
Automated test suite execution currently registers 92.4% test coverage across 840 automated integration test suites, successfully exceeding the contractual SLA threshold of 90.0%. Automated SAST/DAST static analysis reports zero critical vulnerabilities.`,
  },
  {
    pageNumber: 4,
    text: `SCHEDULE RE-BASELINE & CRITICAL DEPENDENCY BLOCKER
1. Production Go-Live Delay:
The final production deployment date has slipped by 66 calendar days. The updated target completion date is now January 20, 2027 (revised from the initial November 15, 2026 date).

2. Unresolved Blocker — Tier-1 Banking API Authorization:
The primary cause of the schedule delay is the pending security sign-off for the Tier-1 Core Banking API Gateway. Authorization has been blocked at the Client Compliance Review Committee since August 12, 2026 (over 49 days pending). Vendor development teams cannot execute end-to-end reconciliation testing until Dr. Sarah Chen releases the sandbox tokens. Vendor formally invokes Section 6.3 regarding Excusable Delay.`,
  },
];

/**
 * Initializes or resets the Competition Demo Workspace
 */
export function initializeCompetitionDemo(): {
  workspace: Workspace;
  docA: DocumentRecord;
  docB: DocumentRecord;
} {
  // Clear any existing demo workspace data
  wipeWorkspaceData(DEMO_WORKSPACE_ID);

  const workspace: Workspace = {
    id: DEMO_WORKSPACE_ID,
    name: 'Project Alpha Prime Demo',
    description: 'Official competition verification environment comparing Master Contract vs Q3 Status Report',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDemo: true,
  };

  const docAId = 'demo-doc-contract';
  const docAName = 'Project_Alpha_Prime_Contract.pdf';
  const rawTextA = DEMO_DOC_A_PAGES.map((p) => p.text).join('\n\n');
  const chunksA = chunkPages(docAId, docAName, DEMO_DOC_A_PAGES);

  const docA: DocumentRecord = {
    id: docAId,
    workspaceId: DEMO_WORKSPACE_ID,
    name: docAName,
    originalName: docAName,
    fileType: 'pdf',
    fileSize: 184520,
    pageCount: DEMO_DOC_A_PAGES.length,
    chunkCount: chunksA.length,
    isScannedWarning: false,
    uploadedAt: new Date().toISOString(),
    status: 'ready',
    rawText: rawTextA,
    pages: DEMO_DOC_A_PAGES,
  };

  const docBId = 'demo-doc-status-report';
  const docBName = 'Project_Alpha_Prime_Q3_Status_Report.pdf';
  const rawTextB = DEMO_DOC_B_PAGES.map((p) => p.text).join('\n\n');
  const chunksB = chunkPages(docBId, docBName, DEMO_DOC_B_PAGES);

  const docB: DocumentRecord = {
    id: docBId,
    workspaceId: DEMO_WORKSPACE_ID,
    name: docBName,
    originalName: docBName,
    fileType: 'pdf',
    fileSize: 156340,
    pageCount: DEMO_DOC_B_PAGES.length,
    chunkCount: chunksB.length,
    isScannedWarning: false,
    uploadedAt: new Date().toISOString(),
    status: 'ready',
    rawText: rawTextB,
    pages: DEMO_DOC_B_PAGES,
  };

  saveDocument(docA, chunksA);
  saveDocument(docB, chunksB);

  // Write synthetic files to synthetic_documents directory for export/inspection
  try {
    const synDir = path.join(process.cwd(), 'synthetic_documents');
    if (!fs.existsSync(synDir)) {
      fs.mkdirSync(synDir, { recursive: true });
    }
    fs.writeFileSync(
      path.join(synDir, 'Project_Alpha_Prime_Contract.txt'),
      DEMO_DOC_A_PAGES.map((p) => `--- PAGE ${p.pageNumber} ---\n${p.text}`).join('\n\n'),
      'utf-8'
    );
    fs.writeFileSync(
      path.join(synDir, 'Project_Alpha_Prime_Q3_Status_Report.txt'),
      DEMO_DOC_B_PAGES.map((p) => `--- PAGE ${p.pageNumber} ---\n${p.text}`).join('\n\n'),
      'utf-8'
    );
  } catch (err) {
    console.warn('Could not write synthetic doc text files to disk', err);
  }

  return { workspace, docA, docB };
}

export const SAMPLE_QUESTIONS = [
  {
    title: 'Factual Budget & Deadline Verification',
    question: 'What is the approved project budget and delivery date in the contract?',
    expectedType: 'Factual with Page Citation',
  },
  {
    title: 'Cross-Document Contradiction Analysis',
    question: 'Are there conflicting timelines or budget figures between the contract and the status report?',
    expectedType: 'Contradiction Discovery',
  },
  {
    title: 'Dependency & Delivery Risk Assessment',
    question: 'What unresolved dependencies or risks are threatening delivery?',
    expectedType: 'Operational & Risk Reasoning',
  },
  {
    title: 'Unsupported Query (Absence of Evidence)',
    question: 'Who is the certified technician responsible for solar panel array maintenance?',
    expectedType: 'Insufficient Evidence Grounding',
  },
];
