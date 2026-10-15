import fs from 'fs';
import path from 'path';
import {
  Workspace,
  DocumentRecord,
  Chunk,
  QAResponse,
  IntelligenceBrief,
  ClaimVerification,
  Contradiction,
  AppStats,
} from '@/types';

interface DatabaseSchema {
  workspaces: Workspace[];
  documents: DocumentRecord[];
  chunks: Chunk[];
  qaHistory: QAResponse[];
  briefs: IntelligenceBrief[];
  claims: ClaimVerification[];
  contradictions: Contradiction[];
}

const DB_DIR = path.join(process.cwd(), process.env.DATA_DIR || '.documind');
const DB_FILE = path.join(DB_DIR, 'db.json');

function ensureDb(): DatabaseSchema {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialData: DatabaseSchema = {
      workspaces: [
        {
          id: 'demo-workspace',
          name: 'Project Alpha Prime Demo',
          description: 'Official competition verification environment comparing Master Contract vs Q3 Status Report',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDemo: true,
        },
      ],
      documents: [],
      chunks: [],
      qaHistory: [],
      briefs: [],
      claims: [],
      contradictions: [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw) as DatabaseSchema;
  } catch (err) {
    console.error('Error reading db.json, returning empty structure', err);
    return {
      workspaces: [],
      documents: [],
      chunks: [],
      qaHistory: [],
      briefs: [],
      claims: [],
      contradictions: [],
    };
  }
}

function saveDb(data: DatabaseSchema): void {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Workspaces
export function getWorkspaces(): Workspace[] {
  const db = ensureDb();
  return db.workspaces;
}

export function getWorkspace(id: string): Workspace | undefined {
  const db = ensureDb();
  return db.workspaces.find((w) => w.id === id);
}

export function createWorkspace(name: string, description?: string, isDemo = false): Workspace {
  const db = ensureDb();
  const newWorkspace: Workspace = {
    id: `ws-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name,
    description,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDemo,
  };
  db.workspaces.unshift(newWorkspace);
  saveDb(db);
  return newWorkspace;
}

export function deleteWorkspace(id: string): boolean {
  const db = ensureDb();
  const initialLength = db.workspaces.length;
  db.workspaces = db.workspaces.filter((w) => w.id !== id);
  db.documents = db.documents.filter((d) => d.workspaceId !== id);
  db.chunks = db.chunks.filter((c) => {
    const doc = db.documents.find((d) => d.id === c.docId);
    return doc && doc.workspaceId !== id;
  });
  db.qaHistory = db.qaHistory.filter((q) => q.workspaceId !== id);
  db.briefs = db.briefs.filter((b) => b.workspaceId !== id);
  db.claims = db.claims.filter((c) => c.workspaceId !== id);
  db.contradictions = db.contradictions.filter((c) => {
    const docA = db.documents.find((d) => d.id === c.claimA.docId);
    return docA && docA.workspaceId !== id;
  });
  saveDb(db);
  return db.workspaces.length < initialLength;
}

// Documents
export function getDocuments(workspaceId: string): DocumentRecord[] {
  const db = ensureDb();
  return db.documents.filter((d) => d.workspaceId === workspaceId);
}

export function getDocument(id: string): DocumentRecord | undefined {
  const db = ensureDb();
  return db.documents.find((d) => d.id === id);
}

export function saveDocument(doc: DocumentRecord, chunks: Chunk[]): void {
  const db = ensureDb();
  db.documents = db.documents.filter((d) => d.id !== doc.id);
  db.chunks = db.chunks.filter((c) => c.docId !== doc.id);
  db.documents.push(doc);
  db.chunks.push(...chunks);
  saveDb(db);
}

export function deleteDocument(docId: string): boolean {
  const db = ensureDb();
  const countBefore = db.documents.length;
  db.documents = db.documents.filter((d) => d.id !== docId);
  db.chunks = db.chunks.filter((c) => c.docId !== docId);
  saveDb(db);
  return db.documents.length < countBefore;
}

// Chunks
export function getChunks(workspaceId: string): Chunk[] {
  const db = ensureDb();
  const docIds = new Set(db.documents.filter((d) => d.workspaceId === workspaceId).map((d) => d.id));
  return db.chunks.filter((c) => docIds.has(c.docId));
}

export function getChunksByDocument(docId: string): Chunk[] {
  const db = ensureDb();
  return db.chunks.filter((c) => c.docId === docId);
}

export function getChunk(chunkId: string): Chunk | undefined {
  const db = ensureDb();
  return db.chunks.find((c) => c.id === chunkId);
}

// QA History
export function getQAHistory(workspaceId: string): QAResponse[] {
  const db = ensureDb();
  return db.qaHistory.filter((q) => q.workspaceId === workspaceId);
}

export function saveQAResponse(qa: QAResponse): void {
  const db = ensureDb();
  db.qaHistory.unshift(qa);
  saveDb(db);
}

export function clearQAHistory(workspaceId: string): void {
  const db = ensureDb();
  db.qaHistory = db.qaHistory.filter((q) => q.workspaceId !== workspaceId);
  saveDb(db);
}

// Intelligence Briefs
export function getBriefs(workspaceId: string): IntelligenceBrief[] {
  const db = ensureDb();
  return db.briefs.filter((b) => b.workspaceId === workspaceId);
}

export function getLatestBrief(workspaceId: string): IntelligenceBrief | undefined {
  const list = getBriefs(workspaceId);
  return list[0];
}

export function saveBrief(brief: IntelligenceBrief): void {
  const db = ensureDb();
  db.briefs = db.briefs.filter((b) => b.id !== brief.id);
  db.briefs.unshift(brief);
  saveDb(db);
}

// Claim Verifications
export function getClaims(workspaceId: string): ClaimVerification[] {
  const db = ensureDb();
  return db.claims.filter((c) => c.workspaceId === workspaceId);
}

export function saveClaimVerification(claim: ClaimVerification): void {
  const db = ensureDb();
  db.claims.unshift(claim);
  saveDb(db);
}

// Contradictions
export function getContradictions(workspaceId: string): Contradiction[] {
  const db = ensureDb();
  const docs = getDocuments(workspaceId);
  const docIds = new Set(docs.map((d) => d.id));
  return db.contradictions.filter(
    (c) => docIds.has(c.claimA.docId) || docIds.has(c.claimB.docId)
  );
}

export function saveContradictions(workspaceId: string, contradictions: Contradiction[]): void {
  const db = ensureDb();
  const docs = getDocuments(workspaceId);
  const docIds = new Set(docs.map((d) => d.id));
  db.contradictions = db.contradictions.filter(
    (c) => !(docIds.has(c.claimA.docId) || docIds.has(c.claimB.docId))
  );
  db.contradictions.push(...contradictions);
  saveDb(db);
}

export function updateContradictionStatus(
  id: string,
  status: 'open' | 'reviewed' | 'resolved'
): boolean {
  const db = ensureDb();
  const item = db.contradictions.find((c) => c.id === id);
  if (item) {
    item.status = status;
    saveDb(db);
    return true;
  }
  return false;
}

// Stats (Calculated dynamically from real workspace state)
export function getAppStats(workspaceId: string): AppStats {
  const docs = getDocuments(workspaceId);
  const qa = getQAHistory(workspaceId);
  const briefs = getBriefs(workspaceId);
  const contradictions = getContradictions(workspaceId);

  const totalPages = docs.reduce((acc, d) => acc + (d.pageCount || 1), 0);
  
  // Count findings in latest brief if present
  let findingsCount = 0;
  if (briefs.length > 0) {
    findingsCount = briefs[0].keyFindings.length + briefs[0].risks.length;
  } else {
    findingsCount = docs.length * 3; // basic structural findings
  }

  return {
    totalDocuments: docs.length,
    totalPages,
    totalQuestionsAsked: qa.length,
    totalFindings: findingsCount,
    totalConflictsIdentified: contradictions.length,
  };
}

// Wipe workspace
export function wipeWorkspaceData(workspaceId: string): void {
  const db = ensureDb();
  const docIds = new Set(db.documents.filter((d) => d.workspaceId === workspaceId).map((d) => d.id));
  
  db.documents = db.documents.filter((d) => d.workspaceId !== workspaceId);
  db.chunks = db.chunks.filter((c) => !docIds.has(c.docId));
  db.qaHistory = db.qaHistory.filter((q) => q.workspaceId !== workspaceId);
  db.briefs = db.briefs.filter((b) => b.workspaceId !== workspaceId);
  db.claims = db.claims.filter((c) => c.workspaceId !== workspaceId);
  db.contradictions = db.contradictions.filter(
    (c) => !(docIds.has(c.claimA.docId) || docIds.has(c.claimB.docId))
  );
  saveDb(db);
}
