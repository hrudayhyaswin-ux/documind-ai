export type FileType = 'pdf' | 'docx' | 'txt';

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;
}

export interface DocumentRecord {
  id: string;
  workspaceId: string;
  name: string;
  originalName: string;
  fileType: FileType;
  fileSize: number;
  pageCount: number;
  chunkCount: number;
  isScannedWarning: boolean;
  uploadedAt: string;
  status: 'processing' | 'ready' | 'error';
  errorMessage?: string;
  rawText?: string;
  pages?: Array<{ pageNumber: number; text: string }>;
}

export interface Chunk {
  id: string;
  docId: string;
  docName: string;
  pageNumber: number;
  chunkIndex: number;
  text: string;
  startChar: number;
  endChar: number;
  sectionHeading?: string;
}

export type SupportStatus = 'direct_quote' | 'inferred' | 'unsupported';

export interface Citation {
  citationId: string;
  docId: string;
  docName: string;
  pageNumber: number;
  chunkId: string;
  excerpt: string;
  relevanceScore: number; // 0 to 100
  supportStatus: SupportStatus;
  surroundingContext?: string;
}

export type ClassificationVerdict = 
  | 'factual_statement'
  | 'inferred_conclusion'
  | 'ai_recommendation'
  | 'insufficient_evidence';

export interface QAResponse {
  id: string;
  workspaceId: string;
  question: string;
  answer: string;
  verdict: ClassificationVerdict;
  citations: Citation[];
  reasoningNotes?: string;
  timestamp: string;
}

export type ContradictionClassification = 'confirmed' | 'probable' | 'requires_human_review';
export type SeverityLevel = 'high' | 'medium' | 'low';

export interface Contradiction {
  id: string;
  topic: string;
  claimA: {
    docId: string;
    docName: string;
    page: number;
    text: string;
    chunkId?: string;
  };
  claimB: {
    docId: string;
    docName: string;
    page: number;
    text: string;
    chunkId?: string;
  };
  conflictReason: string;
  classification: ContradictionClassification;
  severity: SeverityLevel;
  status: 'open' | 'reviewed' | 'resolved';
}

export type BriefMode = 'short' | 'standard' | 'detailed';

export interface IntelligenceBrief {
  id: string;
  workspaceId: string;
  generatedAt: string;
  mode: BriefMode;
  executiveOverview: string;
  keyFindings: Array<{
    title: string;
    statement: string;
    category: string;
    citations: Citation[];
  }>;
  keyFigures: Array<{
    label: string;
    value: string;
    context: string;
    citation: Citation;
  }>;
  stakeholders: Array<{
    name: string;
    role: string;
    context: string;
  }>;
  milestones: Array<{
    milestone: string;
    date: string;
    status: 'completed' | 'on_track' | 'delayed' | 'pending';
    docSource: string;
    page: number;
  }>;
  decisions: Array<{
    decision: string;
    stakeholder: string;
    citation: Citation;
  }>;
  risks: Array<{
    id: string;
    title: string;
    category: 'Financial' | 'Operational' | 'Schedule' | 'Compliance' | 'Technical';
    severity: SeverityLevel;
    reasoning: string;
    suggestedAction: string;
    citation: Citation;
    requiresHumanReview: boolean;
  }>;
  opportunities: string[];
  aiRecommendations: Array<{
    recommendation: string;
    supportingEvidence: string;
    rationale: string;
  }>;
  openQuestions: string[];
}

export type ClaimVerdict = 
  | 'supported'
  | 'contradicted'
  | 'partially_supported'
  | 'insufficient_evidence';

export interface ClaimVerification {
  id: string;
  workspaceId: string;
  claim: string;
  verdict: ClaimVerdict;
  confidenceScore: number; // 0 - 100
  reasoning: string;
  supportingEvidence: Citation[];
  opposingEvidence: Citation[];
  evaluatedAt: string;
}

export interface AppStats {
  totalDocuments: number;
  totalPages: number;
  totalQuestionsAsked: number;
  totalFindings: number;
  totalConflictsIdentified: number;
}
