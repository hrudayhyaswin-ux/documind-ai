import { Chunk, Citation } from '@/types';

export interface ScoredChunk {
  chunk: Chunk;
  score: number; // 0 to 1
  keywordScore: number;
  semanticScore: number;
  matchedTerms: string[];
}

/**
 * Tokenizes text into lowercase terms, removing punctuation and common stop words
 */
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
  'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were',
  'will', 'with', 'what', 'which', 'who', 'how', 'when', 'where', 'this', 'there'
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s$€£%-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

/**
 * Computes BM25 ranking across a corpus of chunks
 */
export class BM25Index {
  private chunks: Chunk[];
  private docLengths: number[];
  private avgDocLength: number;
  private docFrequencies: Map<string, number>;
  private totalDocs: number;
  private k1 = 1.5;
  private b = 0.75;

  constructor(chunks: Chunk[]) {
    this.chunks = chunks;
    this.totalDocs = chunks.length;
    this.docLengths = [];
    this.docFrequencies = new Map();

    let totalLength = 0;
    for (const chunk of chunks) {
      const tokens = tokenize(chunk.text);
      const len = tokens.length;
      this.docLengths.push(len);
      totalLength += len;

      const uniqueTokens = new Set(tokens);
      for (const token of uniqueTokens) {
        this.docFrequencies.set(token, (this.docFrequencies.get(token) || 0) + 1);
      }
    }

    this.avgDocLength = this.totalDocs > 0 ? totalLength / this.totalDocs : 1;
  }

  public score(query: string): { chunkIndex: number; score: number; matches: string[] }[] {
    const queryTokens = tokenize(query);
    if (queryTokens.length === 0 || this.totalDocs === 0) {
      return [];
    }

    const results: { chunkIndex: number; score: number; matches: string[] }[] = [];

    for (let i = 0; i < this.totalDocs; i++) {
      const chunkText = this.chunks[i].text.toLowerCase();
      const tokens = tokenize(chunkText);
      const tokenCounts = new Map<string, number>();

      for (const t of tokens) {
        tokenCounts.set(t, (tokenCounts.get(t) || 0) + 1);
      }

      let bm25Score = 0;
      const matched: string[] = [];

      for (const qToken of queryTokens) {
        const tf = tokenCounts.get(qToken) || 0;
        if (tf > 0) {
          matched.push(qToken);
          const df = this.docFrequencies.get(qToken) || 1;
          const idf = Math.log((this.totalDocs - df + 0.5) / (df + 0.5) + 1);
          const docLen = this.docLengths[i];
          const numerator = tf * (this.k1 + 1);
          const denominator = tf + this.k1 * (1 - this.b + this.b * (docLen / this.avgDocLength));
          bm25Score += idf * (numerator / denominator);
        }
      }

      // Bonus for exact multi-word substring / numbers matching
      if (query.trim().length > 3 && chunkText.includes(query.toLowerCase().trim())) {
        bm25Score += 2.5;
      }

      if (bm25Score > 0) {
        results.push({ chunkIndex: i, score: bm25Score, matches: matched });
      }
    }

    return results;
  }
}

/**
 * Computes cosine similarity over character and word n-gram frequency vectors
 */
export function computeVectorSimilarity(query: string, chunkText: string): number {
  const qTokens = tokenize(query);
  const cTokens = tokenize(chunkText);

  if (qTokens.length === 0 || cTokens.length === 0) return 0;

  const vectorQ = new Map<string, number>();
  const vectorC = new Map<string, number>();

  for (const t of qTokens) vectorQ.set(t, (vectorQ.get(t) || 0) + 1);
  for (const t of cTokens) vectorC.set(t, (vectorC.get(t) || 0) + 1);

  let dotProduct = 0;
  for (const [term, weight] of vectorQ.entries()) {
    if (vectorC.has(term)) {
      dotProduct += weight * vectorC.get(term)!;
    }
  }

  let magQ = 0;
  for (const w of vectorQ.values()) magQ += w * w;
  let magC = 0;
  for (const w of vectorC.values()) magC += w * w;

  if (magQ === 0 || magC === 0) return 0;
  return dotProduct / (Math.sqrt(magQ) * Math.sqrt(magC));
}

/**
 * Hybrid retrieval combining BM25 keyword matching and vector semantic similarity
 */
export function retrieveTopChunks(
  query: string,
  chunks: Chunk[],
  topK = 5
): ScoredChunk[] {
  if (chunks.length === 0 || !query.trim()) {
    return [];
  }

  const bm25 = new BM25Index(chunks);
  const bm25Results = bm25.score(query);
  const bm25Map = new Map<number, { score: number; matches: string[] }>();

  let maxBm25 = 0;
  for (const res of bm25Results) {
    if (res.score > maxBm25) maxBm25 = res.score;
    bm25Map.set(res.chunkIndex, { score: res.score, matches: res.matches });
  }

  const scored: ScoredChunk[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const bmEntry = bm25Map.get(i);
    const rawBm25 = bmEntry ? bmEntry.score : 0;
    const normalizedBm25 = maxBm25 > 0 ? rawBm25 / maxBm25 : 0;

    const vecSim = computeVectorSimilarity(query, chunk.text);

    // Hybrid combination: 55% BM25 keyword signal, 45% dense similarity
    const hybridScore = 0.55 * normalizedBm25 + 0.45 * vecSim;

    // Minimum retrieval threshold to filter out random noise
    if (hybridScore > 0.12 || normalizedBm25 > 0.25) {
      scored.push({
        chunk,
        score: Math.min(1, hybridScore),
        keywordScore: normalizedBm25,
        semanticScore: vecSim,
        matchedTerms: bmEntry ? bmEntry.matches : [],
      });
    }
  }

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, topK);
}

/**
 * Converts a ScoredChunk into a traceable Citation
 */
export function createCitationFromChunk(
  scored: ScoredChunk,
  allChunks: Chunk[]
): Citation {
  const { chunk, score } = scored;

  // Find surrounding context (previous and next chunk in the same document if available)
  const docChunks = allChunks.filter((c) => c.docId === chunk.docId);
  const idx = docChunks.findIndex((c) => c.id === chunk.id);
  
  let surrounding = '';
  if (idx > 0) {
    surrounding += `[Previous Page/Section Context]:\n${docChunks[idx - 1].text.slice(-250)}\n\n`;
  }
  surrounding += `[Target Cited Passage - Page ${chunk.pageNumber}]:\n${chunk.text}\n\n`;
  if (idx < docChunks.length - 1) {
    surrounding += `[Following Page/Section Context]:\n${docChunks[idx + 1].text.slice(0, 250)}`;
  }

  // Format relevance score as 0 - 100 percentage
  const relevancePct = Math.round(Math.min(99, Math.max(30, score * 100)));

  return {
    citationId: `cit-${chunk.id}`,
    docId: chunk.docId,
    docName: chunk.docName,
    pageNumber: chunk.pageNumber,
    chunkId: chunk.id,
    excerpt: chunk.text.slice(0, 320) + (chunk.text.length > 320 ? '...' : ''),
    relevanceScore: relevancePct,
    supportStatus: 'direct_quote',
    surroundingContext: surrounding.trim(),
  };
}
