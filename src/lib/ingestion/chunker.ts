import { Chunk } from '@/types';
import { ExtractedPage } from './extractor';

export interface ChunkingOptions {
  chunkSize?: number; // Characters per chunk (default 650)
  chunkOverlap?: number; // Overlapping characters (default 130)
}

/**
 * Extracts a likely heading or section title from a text block
 */
function detectHeading(text: string): string | undefined {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    if (
      line.startsWith('#') ||
      /^(SECTION|ARTICLE|CLAUSE|SCHEDULE|APPENDIX|EXHIBIT|MILESTONE|PART)\s+[0-9A-Z]/i.test(line) ||
      (line.length < 80 && line === line.toUpperCase() && /[A-Z]/.test(line))
    ) {
      return line.replace(/^#+\s*/, '').slice(0, 80);
    }
  }
  return undefined;
}

/**
 * Splits document pages into overlapping semantic chunks with full metadata:
 * docId, docName, pageNumber, chunkId, startChar, endChar, sectionHeading
 */
export function chunkPages(
  docId: string,
  docName: string,
  pages: ExtractedPage[],
  options: ChunkingOptions = {}
): Chunk[] {
  const chunkSize = options.chunkSize || 650;
  const chunkOverlap = options.chunkOverlap || 130;
  const chunks: Chunk[] = [];

  let globalChunkIndex = 0;

  for (const page of pages) {
    const pageText = page.text.trim();
    if (!pageText) continue;

    // Detect general heading on page
    const pageHeading = detectHeading(pageText);

    // If page text is smaller than chunk size, create a single chunk
    if (pageText.length <= chunkSize) {
      chunks.push({
        id: `${docId}-p${page.pageNumber}-c${globalChunkIndex}`,
        docId,
        docName,
        pageNumber: page.pageNumber,
        chunkIndex: globalChunkIndex,
        text: pageText,
        startChar: 0,
        endChar: pageText.length,
        sectionHeading: pageHeading || `Page ${page.pageNumber}`,
      });
      globalChunkIndex++;
      continue;
    }

    // Split page into overlapping chunks
    let startChar = 0;
    while (startChar < pageText.length) {
      let endChar = Math.min(startChar + chunkSize, pageText.length);

      // Find natural boundary (period, question mark, newline, or space) near endChar
      if (endChar < pageText.length) {
        const lookbackDistance = Math.min(60, endChar - startChar);
        const sub = pageText.substring(endChar - lookbackDistance, endChar);
        const lastSentenceEnd = Math.max(
          sub.lastIndexOf('. '),
          sub.lastIndexOf('.\n'),
          sub.lastIndexOf('?\n'),
          sub.lastIndexOf(';\n')
        );

        if (lastSentenceEnd !== -1) {
          endChar = endChar - lookbackDistance + lastSentenceEnd + 1;
        } else {
          const lastSpace = sub.lastIndexOf(' ');
          if (lastSpace !== -1) {
            endChar = endChar - lookbackDistance + lastSpace;
          }
        }
      }

      const chunkText = pageText.substring(startChar, endChar).trim();
      if (chunkText.length > 20) {
        const localHeading = detectHeading(chunkText) || pageHeading || `Page ${page.pageNumber}`;
        chunks.push({
          id: `${docId}-p${page.pageNumber}-c${globalChunkIndex}`,
          docId,
          docName,
          pageNumber: page.pageNumber,
          chunkIndex: globalChunkIndex,
          text: chunkText,
          startChar,
          endChar,
          sectionHeading: localHeading,
        });
        globalChunkIndex++;
      }

      if (endChar >= pageText.length) {
        break;
      }

      startChar = Math.max(startChar + 1, endChar - chunkOverlap);
    }
  }

  return chunks;
}
