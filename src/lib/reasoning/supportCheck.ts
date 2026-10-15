import { Chunk, Citation, ClassificationVerdict, SupportStatus } from '@/types';

/**
 * Validates whether an excerpt actually exists in the referenced chunk text
 */
export function verifyExcerptInChunk(excerpt: string, chunkText: string): boolean {
  if (!excerpt || !chunkText) return false;

  // Clean strings for comparison
  const normExcerpt = excerpt.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
  const normChunk = chunkText.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();

  // 1. Direct substring match
  if (normChunk.includes(normExcerpt)) {
    return true;
  }

  // 2. Token overlap match (at least 75% of excerpt tokens appear in chunk)
  const tokens = normExcerpt.split(' ').filter((t) => t.length > 2);
  if (tokens.length === 0) return false;

  let matched = 0;
  for (const token of tokens) {
    if (normChunk.includes(token)) {
      matched++;
    }
  }

  return matched / tokens.length >= 0.75;
}

/**
 * Validates a list of candidate citations against ground-truth indexed chunks.
 * Discards hallucinated citations and evaluates support status.
 */
export function validateCitations(
  citations: Citation[],
  indexedChunks: Chunk[]
): Citation[] {
  const chunkMap = new Map<string, Chunk>();
  for (const c of indexedChunks) {
    chunkMap.set(c.id, c);
  }

  const validCitations: Citation[] = [];

  for (const cit of citations) {
    const chunk = chunkMap.get(cit.chunkId);

    // If chunk does not exist in our index, this is a hallucinated citation!
    if (!chunk) {
      console.warn(`[DocuMind Warning] Hallucinated chunkId "${cit.chunkId}" filtered out.`);
      continue;
    }

    // Verify page number matches ground-truth chunk
    const pageMatches = chunk.pageNumber === cit.pageNumber;
    const excerptVerified = verifyExcerptInChunk(cit.excerpt, chunk.text);

    let status: SupportStatus = 'unsupported';
    if (pageMatches && excerptVerified) {
      // Check if it's a direct verbatim quote or an inferred summary
      const cleanExcerpt = cit.excerpt.trim();
      if (chunk.text.includes(cleanExcerpt) || cleanExcerpt.length > 40) {
        status = 'direct_quote';
      } else {
        status = 'inferred';
      }
    } else if (pageMatches) {
      status = 'inferred';
    }

    validCitations.push({
      ...cit,
      docName: chunk.docName, // Ensure accurate document name from ground truth
      pageNumber: chunk.pageNumber, // Ensure accurate page number
      supportStatus: status,
    });
  }

  return validCitations;
}

/**
 * Classifies an answer into one of 4 strict epistemic categories:
 * - 'factual_statement': Verified directly against document text
 * - 'inferred_conclusion': Synthesized across multiple passages
 * - 'ai_recommendation': Advisory / forward-looking recommendation
 * - 'insufficient_evidence': Cannot be reliably proven from uploaded documents
 */
export function determineVerdict(
  answer: string,
  citations: Citation[],
  isUnknownQuery = false
): ClassificationVerdict {
  if (isUnknownQuery || citations.length === 0) {
    return 'insufficient_evidence';
  }

  const lower = answer.toLowerCase();

  // Check for insufficient evidence markers
  if (
    lower.includes('could not find sufficient evidence') ||
    lower.includes('insufficient evidence') ||
    lower.includes('not mentioned in the documents') ||
    lower.includes('documents do not contain') ||
    lower.includes('cannot establish')
  ) {
    return 'insufficient_evidence';
  }

  // Check for recommendation markers
  if (
    lower.startsWith('recommendation:') ||
    lower.includes('we recommend') ||
    lower.includes('it is recommended') ||
    lower.includes('suggested action') ||
    lower.includes('advisable to')
  ) {
    return 'ai_recommendation';
  }

  // If citations have direct quotes with high confidence
  const directQuotes = citations.filter((c) => c.supportStatus === 'direct_quote');
  if (directQuotes.length >= 1 && citations[0].relevanceScore > 60) {
    return 'factual_statement';
  }

  return 'inferred_conclusion';
}
