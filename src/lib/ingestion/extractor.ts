import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { FileType } from '@/types';

export interface ExtractedPage {
  pageNumber: number;
  text: string;
}

export interface ExtractionResult {
  fileType: FileType;
  pageCount: number;
  rawText: string;
  pages: ExtractedPage[];
  isScannedWarning: boolean;
  charCount: number;
}

/**
 * Normalizes document text:
 * - fixes soft hyphens and broken words across line breaks
 * - normalizes multiple whitespace / tabs into single spaces
 * - cleans control characters
 */
export function cleanText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/(\w+)-\n(\w+)/g, '$1$2') // rejoin hyphenated words across line breaks
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // remove weird binary control chars
    .replace(/[ \t]+/g, ' ')
    .trim();
}

/**
 * Detects if a document consists of scanned images without text layer
 */
export function isLikelyScanned(text: string, pageCount: number): boolean {
  const cleaned = text.replace(/\s+/g, '');
  if (cleaned.length === 0) return true;
  // If fewer than 40 characters per page on average, it's virtually empty/scanned
  return cleaned.length < Math.max(50, pageCount * 40);
}

export async function extractDocumentContent(
  buffer: Buffer,
  fileName: string
): Promise<ExtractionResult> {
  if (!buffer || buffer.length === 0) {
    throw new Error(`File "${fileName}" is empty (0 bytes).`);
  }

  const extension = fileName.split('.').pop()?.toLowerCase();

  if (extension === 'pdf') {
    return extractPdf(buffer, fileName);
  } else if (extension === 'docx' || extension === 'doc') {
    return extractDocx(buffer, fileName);
  } else if (extension === 'txt' || extension === 'md' || extension === 'rtf' || extension === 'csv') {
    return extractPlainText(buffer, fileName, extension as FileType);
  } else {
    throw new Error(
      `Unsupported file format: ".${extension}". Please upload a PDF, DOCX, or TXT file.`
    );
  }
}

async function extractPdf(buffer: Buffer, fileName: string): Promise<ExtractionResult> {
  const pages: ExtractedPage[] = [];

  try {
    const customPagerender = async function (pageData: any) {
      const pageIndex = pageData.pageIndex || 0;
      const textContent = await pageData.getTextContent({
        normalizeWhitespace: true,
        disableCombineTextItems: false,
      });

      let lastY: number | null = null;
      let text = '';

      for (const item of textContent.items) {
        if (!item.str) continue;
        if (lastY === null || lastY === item.transform[5]) {
          text += item.str + ' ';
        } else {
          text += '\n' + item.str + ' ';
        }
        lastY = item.transform[5];
      }

      const cleaned = cleanText(text);
      pages.push({
        pageNumber: pageIndex + 1,
        text: cleaned,
      });

      return cleaned;
    };

    const parsed = await pdfParse(buffer, {
      pagerender: customPagerender,
    });

    // Ensure pages are sorted by pageNumber
    pages.sort((a, b) => a.pageNumber - b.pageNumber);

    // If custom pagerender didn't populate for some fallback reasons
    if (pages.length === 0 && parsed.text) {
      pages.push({
        pageNumber: 1,
        text: cleanText(parsed.text),
      });
    }

    const fullText = pages.map((p) => p.text).join('\n\n');
    const scanned = isLikelyScanned(fullText, parsed.numpages || pages.length);

    return {
      fileType: 'pdf',
      pageCount: parsed.numpages || Math.max(1, pages.length),
      rawText: fullText,
      pages,
      isScannedWarning: scanned,
      charCount: fullText.length,
    };
  } catch (err: any) {
    if (err.message && err.message.toLowerCase().includes('password')) {
      throw new Error(`The PDF "${fileName}" is password-protected. Please upload an unlocked PDF.`);
    }
    throw new Error(`Failed to parse PDF "${fileName}": ${err.message || 'Malformed PDF structure.'}`);
  }
}

async function extractDocx(buffer: Buffer, fileName: string): Promise<ExtractionResult> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    const fullText = cleanText(result.value);

    if (!fullText) {
      return {
        fileType: 'docx',
        pageCount: 1,
        rawText: '',
        pages: [{ pageNumber: 1, text: '' }],
        isScannedWarning: true,
        charCount: 0,
      };
    }

    // DOCX does not always have explicit page boundaries. Paginate logically every ~2000 chars.
    const PAGE_SIZE = 2000;
    const pages: ExtractedPage[] = [];
    const paragraphs = fullText.split('\n\n');

    let currentPage = 1;
    let currentText = '';

    for (const para of paragraphs) {
      if (currentText.length + para.length > PAGE_SIZE && currentText.length > 500) {
        pages.push({
          pageNumber: currentPage,
          text: currentText.trim(),
        });
        currentPage++;
        currentText = para + '\n\n';
      } else {
        currentText += para + '\n\n';
      }
    }

    if (currentText.trim().length > 0) {
      pages.push({
        pageNumber: currentPage,
        text: currentText.trim(),
      });
    }

    return {
      fileType: 'docx',
      pageCount: pages.length,
      rawText: fullText,
      pages,
      isScannedWarning: false,
      charCount: fullText.length,
    };
  } catch (err: any) {
    throw new Error(`Failed to parse DOCX "${fileName}": ${err.message}`);
  }
}

async function extractPlainText(
  buffer: Buffer,
  fileName: string,
  fileType: FileType = 'txt'
): Promise<ExtractionResult> {
  const fullText = cleanText(buffer.toString('utf-8'));
  // Support form feeds or paginate every ~2500 chars
  const pages: ExtractedPage[] = [];
  const formFeedPages = fullText.split('\f');

  if (formFeedPages.length > 1) {
    formFeedPages.forEach((pText, i) => {
      pages.push({
        pageNumber: i + 1,
        text: cleanText(pText),
      });
    });
  } else {
    const PAGE_SIZE = 2500;
    const paragraphs = fullText.split('\n\n');
    let currentPage = 1;
    let currentText = '';

    for (const para of paragraphs) {
      if (currentText.length + para.length > PAGE_SIZE && currentText.length > 500) {
        pages.push({
          pageNumber: currentPage,
          text: currentText.trim(),
        });
        currentPage++;
        currentText = para + '\n\n';
      } else {
        currentText += para + '\n\n';
      }
    }

    if (currentText.trim().length > 0) {
      pages.push({
        pageNumber: currentPage,
        text: currentText.trim(),
      });
    }
  }

  if (pages.length === 0) {
    pages.push({ pageNumber: 1, text: fullText });
  }

  return {
    fileType,
    pageCount: pages.length,
    rawText: fullText,
    pages,
    isScannedWarning: fullText.length < 20,
    charCount: fullText.length,
  };
}
