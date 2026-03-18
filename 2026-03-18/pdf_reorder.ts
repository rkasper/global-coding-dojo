// deno-lint-ignore-file no-explicit-any
import { getDocument } from "pdfjs-dist";
import { PDFDocument } from "pdf-lib";

const DEFAULT_PATTERN = /Page\s+(\d+)\s+of\s+(\d+)/i;

/** Extract text content from each page of a PDF. */
export async function extractPageTexts(pdfBytes: Uint8Array): Promise<string[]> {
  const doc = await getDocument({ data: pdfBytes, useWorkerFetch: false, isEvalSupported: false, useSystemFonts: true, disableAutoFetch: true } as any).promise;
  const texts: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item: any) => item.str ?? "").join(" ");
    texts.push(pageText);
  }
  return texts;
}

/** Group PDF pages into statements based on "Page X of Y" markers. */
export function detectStatementGroups(
  pageTexts: string[],
  pattern: RegExp = DEFAULT_PATTERN,
): number[][] {
  const groups: number[][] = [];
  let currentGroup: number[] = [];

  for (let i = 0; i < pageTexts.length; i++) {
    const match = pageTexts[i].match(pattern);
    if (match) {
      const pageNum = parseInt(match[1], 10);
      if (pageNum === 1 && currentGroup.length > 0) {
        groups.push(currentGroup);
        currentGroup = [];
      }
    }
    currentGroup.push(i);
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
}

/** Reorder PDF so statement groups appear in reversed order. */
export async function reorderPdf(
  pdfBytes: Uint8Array,
  patternStr?: string,
): Promise<Uint8Array> {
  const pattern = patternStr ? parsePattern(patternStr) : DEFAULT_PATTERN;

  // Copy bytes because pdfjs-dist may transfer the underlying ArrayBuffer
  const bytesCopy = new Uint8Array(pdfBytes);
  const pageTexts = await extractPageTexts(bytesCopy);
  const groups = detectStatementGroups(pageTexts, pattern);
  const reversedGroups = [...groups].reverse();
  const newPageOrder = reversedGroups.flat();

  const srcDoc = await PDFDocument.load(pdfBytes);
  const destDoc = await PDFDocument.create();

  const copiedPages = await destDoc.copyPages(srcDoc, newPageOrder);
  for (const page of copiedPages) {
    destDoc.addPage(page);
  }

  return destDoc.save();
}

function parsePattern(patternStr: string): RegExp {
  try {
    return new RegExp(patternStr, "i");
  } catch {
    throw new Error(`Invalid regex pattern: ${patternStr}`);
  }
}
