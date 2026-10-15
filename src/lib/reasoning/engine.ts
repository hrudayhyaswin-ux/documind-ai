import { Chunk, QAResponse, Citation, ClassificationVerdict } from '@/types';
import { retrieveTopChunks, createCitationFromChunk, ScoredChunk } from './retrieval';
import { validateCitations, determineVerdict } from './supportCheck';
import { getChunks, getChunksByDocument, getDocument, saveQAResponse } from '../storage';
import { callGeminiCascade, getGeminiApiKey } from '../gemini';

const INSUFFICIENT_EVIDENCE_REPLY =
  'I could not find sufficient evidence in the uploaded documents to answer this reliably.';

interface LLMAnswerResult {
  answer: string;
  citedChunkIds: string[];
  reasoningNotes?: string;
}

/**
 * Builds prompt for generative models with anti-hallucination guardrails
 */
function buildPrompt(question: string, contextChunks: Chunk[], docName?: string): string {
  const contextStr = contextChunks
    .map(
      (c) =>
        `[CHUNK_ID: ${c.id} | DOCUMENT: ${c.docName} | PAGE: ${c.pageNumber} | SECTION: ${c.sectionHeading || 'General'}]\n${c.text}`
    )
    .join('\n\n---\n\n');

  return `You are DOCUMIND AI, an Evidence-Grounded Reasoning Engine.
Your primary directive is: "No unsupported conclusions. Every important finding must be traceable to evidence."

STRICT INSTRUCTIONS:
1. Answer the user's question accurately, thoroughly, and directly using the provided evidence chunks below${docName ? ` from ${docName}` : ''}.
2. If the context does not contain sufficient factual evidence to answer the question, answer honestly:
   "${INSUFFICIENT_EVIDENCE_REPLY}"
3. Do NOT make assumptions or invent facts, page numbers, or statistics.
4. For every important factual assertion you make, reference the exact document name and page number or [CHUNK_ID: ...].
5. Format your response clearly with bullet points or numbered lists where appropriate for readability.

EVIDENCE CHUNKS:
${contextStr}

QUESTION:
${question}

Provide your grounded answer:`;
}

/**
 * Calls Gemini REST API using gemini-2.5-flash
 */
async function callGemini(apiKey: string, prompt: string): Promise<string> {
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1000,
          },
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        const candidate = data.candidates?.[0];
        const text = candidate?.content?.parts?.[0]?.text;
        if (text) return text;
      } else {
        console.warn(`callGemini attempt ${attempt + 1} status: ${resp.status}`);
        if (attempt === 0) await new Promise((r) => setTimeout(r, 1000));
      }
    } catch (e: any) {
      console.warn(`callGemini attempt ${attempt + 1} exception:`, e.message);
      if (attempt === 0) await new Promise((r) => setTimeout(r, 1000));
    }
  }

  return '';
}

/**
 * Calls OpenAI API
 */
async function callOpenAI(apiKey: string, prompt: string): Promise<string> {
  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are DOCUMIND AI, an evidence-grounded document intelligence engine.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.1,
    }),
  });

  if (!resp.ok) {
    const errorText = await resp.text();
    throw new Error(`OpenAI API error (${resp.status}): ${errorText}`);
  }

  const data = await resp.json();
  return data.choices?.[0]?.message?.content || '';
}

/**
 * Built-in Deterministic Evidence Engine (works without external API keys!)
 * Synthesizes answer directly from retrieved chunks and verified facts.
 */
function localEvidenceSynthesizer(question: string, topChunks: Chunk[]): LLMAnswerResult {
  if (topChunks.length === 0) {
    return {
      answer: INSUFFICIENT_EVIDENCE_REPLY,
      citedChunkIds: [],
      reasoningNotes: 'Zero relevant passages found in corpus.',
    };
  }

  const qLower = question.toLowerCase();

  // Find sentences across top chunks that directly answer the query
  const relevantSentences: { sentence: string; chunk: Chunk }[] = [];

  for (const chunk of topChunks) {
    const sentences = chunk.text.split(/(?<=[.?!])\s+/);
    for (const sent of sentences) {
      const sTrim = sent.trim();
      if (sTrim.length < 15) continue;

      // Extract matching factors: numbers, dates, terms
      const qTerms = qLower.replace(/[^\w\s]/g, '').split(/\s+/).filter((w) => w.length > 3);
      const matched = qTerms.filter((term) => sTrim.toLowerCase().includes(term));

      if (matched.length >= 2 || (matched.length >= 1 && /\$|\d{4}|percent|%|delay|budget|deadline|penalty/i.test(sTrim))) {
        relevantSentences.push({ sentence: sTrim, chunk });
      }
    }
  }

  if (relevantSentences.length === 0) {
    // If top chunk is highly relevant, return its central clause
    const primary = topChunks[0];
    return {
      answer: `According to ${primary.docName} (Page ${primary.pageNumber}): "${primary.text.slice(0, 240)}..."`,
      citedChunkIds: [primary.id],
      reasoningNotes: 'Extracted primary grounded passage matching key terms.',
    };
  }

  // Deduplicate and combine up to 3 most relevant factual sentences
  const uniqueSentences = Array.from(new Set(relevantSentences.map((r) => r.sentence))).slice(0, 3);
  const citedChunks = Array.from(new Set(relevantSentences.map((r) => r.chunk.id)));

  const synthesized = uniqueSentences.join(' ');
  return {
    answer: synthesized,
    citedChunkIds: citedChunks,
    reasoningNotes: 'Extracted direct factual assertions from indexed evidence passages.',
  };
}

/**
 * Main Evidence-Grounded Reasoning Query Handler
 */
export async function executeQuery(
  workspaceId: string,
  question: string,
  docId?: string
): Promise<QAResponse> {
  const allChunks = getChunks(workspaceId);
  const targetDoc = docId ? getDocument(docId) : undefined;
  const targetDocChunks = docId ? getChunksByDocument(docId) : [];

  // 1. Retrieve top matching chunks using hybrid retrieval
  let scoredChunks: ScoredChunk[] = [];

  // Prioritize active document chunks if available
  if (targetDocChunks.length > 0) {
    scoredChunks = retrieveTopChunks(question, targetDocChunks, 6);
  }

  // If no chunks or low score, and there are other chunks in workspace, supplement from allChunks
  if (scoredChunks.length === 0 || scoredChunks[0].score < 0.16) {
    const generalScored = retrieveTopChunks(question, allChunks, 6);
    if (generalScored.length > 0 && (scoredChunks.length === 0 || generalScored[0].score > (scoredChunks[0]?.score || 0))) {
      scoredChunks = generalScored;
    }
  }

  // Exploratory query fallback for active document
  if ((scoredChunks.length === 0 || scoredChunks[0].score < 0.12) && targetDocChunks.length > 0) {
    const isExploratory = /about|summary|overview|explain|introduction|what is this|tell me about|scope|topics/i.test(question);
    if (isExploratory) {
      scoredChunks = targetDocChunks.slice(0, 4).map((c, idx) => ({
        chunk: c,
        score: 0.85 - idx * 0.05,
        keywordScore: 0.8,
        semanticScore: 0.8,
        matchedTerms: ['overview', 'document'],
      }));
    }
  }

  // Check if retrieval score is too low (< 0.13) or no chunks found
  if (scoredChunks.length === 0 || scoredChunks[0].score < 0.13) {
    const insufficientResponse: QAResponse = {
      id: `qa-${Date.now()}`,
      workspaceId,
      question,
      answer: INSUFFICIENT_EVIDENCE_REPLY,
      verdict: 'insufficient_evidence',
      citations: [],
      reasoningNotes: 'Search score below confidence threshold (no verifiable evidence found).',
      timestamp: new Date().toISOString(),
    };
    saveQAResponse(insufficientResponse);
    return insufficientResponse;
  }

  const topChunks = scoredChunks.map((s) => s.chunk);

  // 2. Call AI provider with Multi-Model Cascade
  const geminiKey = getGeminiApiKey();
  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  const preferredProvider = process.env.AI_PROVIDER?.toLowerCase() || 'gemini';

  let rawAnswer = '';
  let citedChunkIds: string[] = [];
  let reasoningNotes = 'Verified against indexed document passages.';

  try {
    if (preferredProvider === 'gemini' && geminiKey) {
      const prompt = buildPrompt(question, topChunks, targetDoc?.name);
      const res = await callGeminiCascade(prompt, {
        temperature: 0.1,
        maxOutputTokens: 1000,
      });
      rawAnswer = res.text;
      reasoningNotes = `Verified with Google Gemini (${res.modelUsed}) against indexed document evidence.`;
    } else if (preferredProvider === 'openai' && openaiKey && openaiKey !== 'your_openai_api_key_here') {
      const prompt = buildPrompt(question, topChunks, targetDoc?.name);
      rawAnswer = await callOpenAI(openaiKey, prompt);
    }
  } catch (err: any) {
    console.warn(`[DocuMind API warning] Provider error: ${err.message}. Falling back to deterministic engine.`);
  }

  // If rawAnswer is still empty (or AI failed), synthesize using deterministic local engine!
  if (!rawAnswer || rawAnswer.trim().length === 0) {
    const localResult = localEvidenceSynthesizer(question, topChunks);
    rawAnswer = localResult.answer;
    citedChunkIds = localResult.citedChunkIds;
    reasoningNotes = localResult.reasoningNotes || reasoningNotes;
  }

  // 3. Generate candidate citations from scored chunks
  const chunksPool = targetDocChunks.length > 0 ? targetDocChunks : allChunks;
  let candidateCitations: Citation[] = scoredChunks.slice(0, 3).map((scored) =>
    createCitationFromChunk(scored, chunksPool)
  );

  // 4. Citation Validation Step: strictly validate against indexed chunks
  const validCitations = validateCitations(candidateCitations, chunksPool);

  // 5. Determine epistemic verdict
  const verdict: ClassificationVerdict = determineVerdict(rawAnswer, validCitations);

  const response: QAResponse = {
    id: `qa-${Date.now()}`,
    workspaceId,
    question,
    answer: rawAnswer,
    verdict,
    citations: verdict === 'insufficient_evidence' ? [] : validCitations,
    reasoningNotes,
    timestamp: new Date().toISOString(),
  };

  saveQAResponse(response);
  return response;
}
