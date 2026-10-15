# DOCUMIND AI 🧠⚡
### Intelligent Document Understanding, Reasoning & Evidence Intelligence Platform
> **"No unsupported conclusions. Every important finding must be traceable to evidence."**

DocuMind AI is a competition-ready GenAI document intelligence platform designed to process complex, lengthy multi-source documents, execute evidence-grounded reasoning, discover cross-document contradictions, verify executive claims, and generate publication-grade intelligence briefs.

---

## 🏛 System Architecture

DocuMind AI employs a modular, zero-hallucination Retrieval-Augmented Generation (RAG) and Epistemic Verification pipeline:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DOCUMIND AI CORE PIPELINE                       │
└────────────────────────────────────────────────────────────────────────┘
          │
          ▼
   [1. Ingestion Engine] ─── Multi-Format Parsing (PDF, DOCX, TXT)
          │                   ├── Page Number Preservation & Boundary Tracking
          │                   ├── Text Cleaning (Hyphen Rejoining, Sanitization)
          │                   └── Scanned Image / OCR Detection
          ▼
   [2. Chunker & Indexer] ── Overlapping Chunking (650 chars / 130 overlap)
          │                   ├── Metadata: docId, docName, pageNumber, chunkId, headings
          │                   └── BM25 Inverted Index + Dense Cosine Vector Space
          ▼
   [3. Hybrid Retrieval] ─── Convex Combination (55% BM25 + 45% Dense Semantic)
          │                   ├── Exact Match Numerical & Currency Boosters
          │                   └── Context Window Expansion (Adjacent page passages)
          ▼
   [4. Reasoning Engine] ─── Provider Router: Gemini 1.5 Flash / OpenAI / Local Engine
          │                   ├── Strict Prompting: "Answer ONLY using provided chunks"
          │                   └── Insufficient Evidence Threshold Guardrail
          ▼
   [5. Support Checking] ─── Ground-Truth Citation Validation
          │                   ├── Rejection of Hallucinated Chunk IDs / False Pages
          │                   └── Epistemic Classification:
          │                       • Factual Statement (Verified Direct Quote)
          │                       • Inferred Multi-Passage Conclusion
          │                       • AI Strategic Recommendation
          │                       • Insufficient Evidence
          ▼
   [6. Intelligence Brief] ─ Cross-Document Contradiction Discovery & Executive Synthesis
```

---

## ✨ Signature Features

### 1. 🔍 Traceable Evidence Trace
- **Verified Page References**: Every factual assertion is tagged with the source document name, exact original page number, and retrieval relevance percentage.
- **Support-Checking Indicator**: Accurately classifies statements as **Direct Quotes** vs. **Synthesized Inferences**.
- **Context Inspection**: One-click deep inspection modal shows the exact cited passage alongside its surrounding context on that page.
- **Anti-Hallucination Guardrail**: Returned citations are verified against indexed chunk hashes. Hallucinated chunk IDs or false page numbers are stripped.

### 2. ⚔️ Cross-Document Contradiction Discovery
- Compares multiple documents in a single workspace.
- Detects discrepancies in numbers, budgets, delivery milestones, and contractual obligations.
- For every contradiction discovered, DocuMind presents:
  1. The baseline claim from Document A with exact page citation.
  2. The conflicting claim from Document B with exact page citation.
  3. The legal/operational conflict reasoning.
  4. Classification: **Confirmed Contradiction**, **Probable Inconsistency**, or **Requires Human Review**.
  5. Severity level (High / Medium / Low) and interactive status tracker (Open / Reviewed / Resolved).

### 3. 📋 Executive Intelligence Brief
- Synthesizes findings across multiple documents in **Short**, **Standard**, or **Detailed** mode.
- Extracts key figures ($ amounts, percentages, deadlines, stakeholders).
- Establishes a standardized **Enterprise Risk Rubric**.
- Explicitly separates **AI Strategic Recommendations** from explicit document facts.
- Exports to JSON/Markdown and provides clean, print-friendly report rendering.

### 4. 🛡️ Claim Verification Engine
- Allows users to enter any factual claim (e.g., *"The project will be delivered within the approved budget"*).
- Evaluates against the indexed corpus and assigns a strict verdict:
  - **Supported by Available Evidence** (Emerald)
  - **Contradicted by Available Evidence** (Rose)
  - **Partially Supported** (Amber)
  - **Insufficient Evidence in Documents** (Slate)
- Displays side-by-side supporting and opposing evidence passages.
- Explicitly clarifies that absence of evidence in these documents does not constitute proof of falsity externally.

### 5. 📊 Visual Document Analytics
- Interactive charts built on real extracted document data (powered by Recharts):
  - **Contract Baseline vs Incurred Forecast** (Budget variance bar chart)
  - **Risk Rubric Severity Distribution** (Donut chart)
  - **Findings by Functional Domain** (Horizontal bar chart)
  - **Extracted Project Milestone Timeline** (Schedule tracker)

---

## 🎯 Competition Demonstration Mode

DocuMind AI comes pre-loaded with a self-contained, reproducible competition demonstration workspace comparing two synthetic documents:

1. **Document A: Project Alpha Prime — Master Services Agreement (Contract)**
   - Approved Budget Ceiling: **$1,250,000 USD** (Clause 4.1 Fixed Price)
   - Mandatory Delivery Deadline: **November 15, 2026** (Section 3.1)
   - Liquidated Damages: **$5,000 USD per business day** (Section 3.2)
   - Quality Gate: **90.0% automated unit test coverage** (Section 5.1)
   - Dependency: Sponsor must furnish Core Banking API credentials within 14 days (Section 6.3)

2. **Document B: Project Alpha Prime — Q3 Status Report & Risk Assessment**
   - Revised Cost Forecast: **$1,480,000 USD** (+18.4% cost overrun; +$230,000 variance)
   - Revised Completion Date: **January 20, 2027** (66-day delay)
   - Quality Verified: **92.4% automated unit test coverage achieved**
   - Critical Blocker: Tier-1 Core Banking API authorization pending client approval since August 12, 2026 (>49 days pending)

### 🎪 Step-by-Step Competition Demonstration Script

1. **Launch Workspace**:
   - Click the **"Load Competition Demo"** button in the header.
   - The platform instantly loads both documents, computes statistics, and renders the Dashboard.
2. **Demonstrate Factual Evidence Q&A**:
   - Navigate to **"Ask & Reason"**.
   - Click the prompt: *"What is the approved project budget and delivery date in the contract?"*
   - Observe the response citing **Clause 4.1 ($1,250,000 USD)** on **Page 3** and **Section 3.1 (November 15, 2026)** on **Page 2**.
   - Click **"Inspect Context"** to reveal the original contract excerpt and surrounding paragraphs.
3. **Demonstrate Cross-Document Contradiction Discovery**:
   - Navigate to **"Compare Documents"**.
   - Select Document A (Contract) and Document B (Status Report) and click **"Execute Cross-Document Reasoning"**.
   - Observe the highlighted budget breach:
     - Document A Page 3: Fixed cap $1,250,000
     - Document B Page 2: Revised forecast $1,480,000 (+18.4% overrun without signed change order)
   - Observe the schedule conflict:
     - Document A Page 2: Nov 15, 2026 with $5,000/day liquidated damages
     - Document B Page 4: Jan 20, 2027 slip
4. **Demonstrate Claim Verification**:
   - Navigate to **"Claim Verification"**.
   - Click the sample claim: *"The project will be delivered within the approved contract budget."*
   - Observe the instant **Contradicted by Available Evidence** verdict with supporting contract cap vs opposing $1.48M overrun excerpt.
5. **Demonstrate Handling of Absent / Unsupported Information**:
   - In "Ask & Reason", submit: *"Who is the certified technician responsible for solar panel array maintenance?"*
   - Observe the calibrated epistemic response:
     > *"I could not find sufficient evidence in the uploaded documents to answer this reliably."*
   - With zero hallucinated citations!
6. **Demonstrate Intelligence Brief & Visual Analytics**:
   - Navigate to **"Intelligence Brief"** to inspect executive overview, figures, and risk rubric.
   - Click **"Print Report"** or **"Export JSON/Markdown"**.
   - Navigate to **"Visual Analytics"** to inspect financial cost variances and risk donuts.

---

## 🚀 Installation & Launch Guide

### Prerequisites
- Node.js (v18, v20, or v22+)
- npm or yarn

### Quick Start Commands
```bash
# 1. Clone or navigate to the directory
cd ~/Desktop/documind-ai

# 2. Install dependencies (if not already installed)
npm install

# 3. (Optional) Configure AI Provider in .env.local
# By default, DocuMind uses its built-in local deterministic reasoning engine.
# To enable live Google Gemini or OpenAI:
cp .env.example .env.local

# 4. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ AI Provider Configuration

Edit `.env.local` to switch providers:

```env
# Supported: 'gemini' | 'openai' | 'local'
AI_PROVIDER=gemini

# Google Gemini API Key (https://aistudio.google.com/)
GEMINI_API_KEY=your_gemini_api_key_here

# OpenAI API Key (https://platform.openai.com/)
OPENAI_API_KEY=your_openai_api_key_here
```

> **Note**: If no API key is provided, DocuMind AI seamlessly falls back to its built-in deterministic Evidence Extraction Engine, ensuring full functionality with zero external dependencies.

---

## 🧪 Automated Test Suite

Run the acceptance test suite verifying extraction, metadata preservation, citation validation, contradiction discovery, and claim verification:

```bash
npm test
```

---

## 📂 Project Structure

```
documind-ai/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── brief/route.ts          # Intelligence brief generator
│   │   │   ├── claims/route.ts         # Claim verification engine
│   │   │   ├── compare/route.ts        # Cross-document reasoning
│   │   │   ├── demo/route.ts           # Competition demo initializer
│   │   │   ├── documents/route.ts      # Multi-format ingestion & chunking
│   │   │   ├── query/route.ts          # Evidence-grounded QA
│   │   │   ├── stats/route.ts          # Dynamic metric aggregator
│   │   │   └── workspaces/route.ts     # Workspace isolation
│   │   ├── globals.css                 # Obsidian dark styling & glassmorphism
│   │   ├── layout.tsx                  # Root layout
│   │   └── page.tsx                    # Main state orchestrator
│   ├── components/
│   │   ├── views/                      # 8 Dedicated analytical workspaces
│   │   │   ├── AskReasonView.tsx
│   │   │   ├── ClaimVerificationView.tsx
│   │   │   ├── CompareView.tsx
│   │   │   ├── DashboardView.tsx
│   │   │   ├── DocumentLibraryView.tsx
│   │   │   ├── IntelligenceBriefView.tsx
│   │   │   ├── SettingsView.tsx
│   │   │   └── VisualAnalyticsView.tsx
│   │   ├── EvidenceModal.tsx           # Deep citation inspector
│   │   ├── Header.tsx                  # Brand & demo quick-launch
│   │   ├── Sidebar.tsx                 # Navigation
│   │   ├── UploadModal.tsx             # Ingestion modal with progress
│   │   └── WorkspaceModal.tsx          # Workspace manager
│   ├── lib/
│   │   ├── demo/syntheticData.ts       # Synthetic contract & report
│   │   ├── ingestion/
│   │   │   ├── chunker.ts              # Overlapping chunker with metadata
│   │   │   └── extractor.ts            # PDF page-by-page, DOCX, TXT parser
│   │   ├── reasoning/
│   │   │   ├── brief.ts                # Brief generator & Markdown exporter
│   │   │   ├── claims.ts               # Claim checking engine
│   │   │   ├── compare.ts              # Contradiction discovery logic
│   │   │   ├── engine.ts               # RAG reasoning orchestrator
│   │   │   ├── retrieval.ts            # BM25 + dense vector hybrid search
│   │   │   └── supportCheck.ts         # Epistemic citation validator
│   │   └── storage.ts                  # Workspace-isolated persistence
│   └── types/
│       ├── declarations.d.ts           # Type definitions
│       └── index.ts                    # Core TypeScript interfaces
├── synthetic_documents/                # Plaintext inspectable sample files
├── tests/
│   └── test_runner.js                  # Acceptance & unit test runner
├── .env.example
├── package.json
└── README.md
```

---

## 🏆 Implemented Features vs. Future Roadmap

| Feature Area | Implemented in v1.0 | Planned Future Roadmap |
| :--- | :--- | :--- |
| **Ingestion** | PDF (page-preserved), DOCX, TXT, Scanned PDF warning | Optical Character Recognition (Tesseract OCR) |
| **Retrieval** | Hybrid BM25 + Dense Cosine Vector Similarity | Multi-vector Cross-Encoder Reranking |
| **Reasoning** | Evidence Grounding, Anti-Hallucination, Epistemic Verdicts | Recursive Multi-Hop Graph Reasoning |
| **Contradictions** | Dual-source page matching, severity scoring, status | Automated Contract Redline Diff Generation |
| **Claim Check** | Supported / Contradicted / Partial / Insufficient | Real-time Web Knowledge Graph Cross-Checking |
| **Persistence** | Structured workspace JSON with instant recovery | Distributed Vector Database (Pinecone / Qdrant) |

---
**DOCUMIND AI — Every answer has evidence. Every insight has a purpose.**
