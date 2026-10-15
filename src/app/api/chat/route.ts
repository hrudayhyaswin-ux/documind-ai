import { NextRequest, NextResponse } from 'next/server';
import { getChunks, getChunksByDocument, getDocument } from '@/lib/storage';
import { retrieveTopChunks, createCitationFromChunk, ScoredChunk } from '@/lib/reasoning/retrieval';
import { validateCitations } from '@/lib/reasoning/supportCheck';
import { callGeminiCascade, getGeminiApiKey } from '@/lib/gemini';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { workspaceId, messages, query, docId } = body;

    const lastMessage = query || (messages && messages[messages.length - 1]?.content);

    if (!lastMessage || typeof lastMessage !== 'string' || !lastMessage.trim()) {
      return NextResponse.json(
        { success: false, error: 'A query or message is required.' },
        { status: 400 }
      );
    }

    const wsId = workspaceId || 'demo-workspace';
    const targetDoc = docId ? getDocument(docId) : undefined;
    const targetChunks = docId ? getChunksByDocument(docId) : [];
    const allChunks = getChunks(wsId);

    // Retrieve top relevant context passages for the conversation turn
    let scoredChunks: ScoredChunk[] = [];
    if (targetChunks.length > 0) {
      scoredChunks = retrieveTopChunks(lastMessage, targetChunks, 5);
    }

    if (scoredChunks.length === 0 || scoredChunks[0].score < 0.16) {
      const genScored = retrieveTopChunks(lastMessage, allChunks, 5);
      if (genScored.length > 0 && (scoredChunks.length === 0 || genScored[0].score > (scoredChunks[0]?.score || 0))) {
        scoredChunks = genScored;
      }
    }

    // Exploratory query fallback for active document
    if ((scoredChunks.length === 0 || scoredChunks[0].score < 0.12) && targetChunks.length > 0) {
      const isExploratory = /about|summary|overview|explain|introduction|what is this|tell me about|scope|topics/i.test(lastMessage);
      if (isExploratory) {
        scoredChunks = targetChunks.slice(0, 4).map((c, idx) => ({
          chunk: c,
          score: 0.85 - idx * 0.05,
          keywordScore: 0.8,
          semanticScore: 0.8,
          matchedTerms: ['overview', 'document'],
        }));
      }
    }

    const contextStr = scoredChunks
      .map(
        (s) =>
          `[DOCUMENT: ${s.chunk.docName} | PAGE ${s.chunk.pageNumber} | SECTION: ${s.chunk.sectionHeading || 'Clause'}]\n${s.chunk.text}`
      )
      .join('\n\n---\n\n');

    const apiKey = getGeminiApiKey();

    const systemPrompt = `You are DocuMind AI Conversational Assistant, powered by Google Gemini.
You assist users by understanding their documents and answering questions with 100% precision and evidence grounding.
${targetDoc ? `Active Focused Document: "${targetDoc.name}" (${targetDoc.pageCount} pages). Prioritize facts and definitions from this document.` : ''}

GROUNDING DIRECTIVE:
1. Always base your answers on the provided document excerpts below.
2. When stating facts, definitions, numbers, dates, or specifications, cite the document name and page number (e.g., "[${targetDoc?.name || 'Document'}, p.${scoredChunks[0]?.chunk.pageNumber || 1}]").
3. If the user asks something not found in the documents, honestly clarify: "The uploaded documents do not establish this."
4. Be articulate, highly informative, structured with bullet points where appropriate, and professional.

RELEVANT DOCUMENT EXCERPTS:
${contextStr || 'No document passages available.'}`;

    let reply = '';
    let modelUsed = 'gemini-cascade';

    if (apiKey) {
      const conversationHistory = (messages || []).slice(-6).map((m: ChatMessage) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      if (
        conversationHistory.length === 0 ||
        conversationHistory[conversationHistory.length - 1].parts[0].text !== lastMessage
      ) {
        conversationHistory.push({
          role: 'user',
          parts: [{ text: lastMessage }],
        });
      }

      try {
        const res = await callGeminiCascade(conversationHistory, {
          systemInstruction: systemPrompt,
          temperature: 0.2,
          maxOutputTokens: 1000,
        });
        reply = res.text;
        modelUsed = res.modelUsed;
      } catch (err: any) {
        console.warn('Gemini chat error in cascade:', err.message);
      }
    }

    // High-precision grounded fallback if AI call was unavailable
    if (!reply || reply.trim().length === 0) {
      reply =
        scoredChunks.length > 0
          ? `According to ${scoredChunks[0].chunk.docName} (Page ${scoredChunks[0].chunk.pageNumber}):\n\n"${scoredChunks[0].chunk.text.slice(0, 380)}..."\n\n(Generated via local grounded evidence engine)`
          : 'I could not find sufficient evidence in the uploaded documents to answer this question reliably.';
    }

    // Attach verified citations
    const chunksPool = targetChunks.length > 0 ? targetChunks : allChunks;
    const citations = scoredChunks.map((s) => createCitationFromChunk(s, chunksPool));
    const validCitations = validateCitations(citations, chunksPool);

    return NextResponse.json({
      success: true,
      reply,
      citations: validCitations,
      model: modelUsed,
    });
  } catch (err: any) {
    console.error('Chat API Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Chat processing failed.' },
      { status: 500 }
    );
  }
}
