import { assertEquals } from "std/assert";
import { PDFDocument } from "pdf-lib";
import { detectStatementGroups } from "./statement_grouping.ts";
import { extractPageTexts, reorderPdf } from "./pdf_reorder.ts";

/** Create a test PDF where each page contains the given text strings. */
async function createTestPdf(pageTexts: string[]): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  for (const text of pageTexts) {
    const page = doc.addPage([200, 200]);
    page.drawText(text, { x: 10, y: 100, size: 10 });
  }
  return doc.save();
}

Deno.test("detectStatementGroups - groups pages by 'Page 1 of' markers", () => {
  const texts = [
    "Statement A Page 1 of 3",
    "Statement A Page 2 of 3",
    "Statement A Page 3 of 3",
    "Statement B Page 1 of 2",
    "Statement B Page 2 of 2",
  ];
  const groups = detectStatementGroups(texts);
  assertEquals(groups, [[0, 1, 2], [3, 4]]);
});

Deno.test("detectStatementGroups - single statement is one group", () => {
  const texts = [
    "Page 1 of 2",
    "Page 2 of 2",
  ];
  const groups = detectStatementGroups(texts);
  assertEquals(groups, [[0, 1]]);
});

Deno.test("detectStatementGroups - pages without markers stay in current group", () => {
  const texts = [
    "Page 1 of 2",
    "no marker here",
    "Page 2 of 2",
    "Page 1 of 1",
  ];
  const groups = detectStatementGroups(texts);
  assertEquals(groups, [[0, 1, 2], [3]]);
});

Deno.test("detectStatementGroups - custom pattern", () => {
  const texts = [
    "Pagina 1 de 2",
    "Pagina 2 de 2",
    "Pagina 1 de 1",
  ];
  const pattern = /Pagina\s+(\d+)\s+de\s+(\d+)/i;
  const groups = detectStatementGroups(texts, pattern);
  assertEquals(groups, [[0, 1], [2]]);
});

Deno.test("detectStatementGroups - empty input returns empty", () => {
  const groups = detectStatementGroups([]);
  assertEquals(groups, []);
});

Deno.test("extractPageTexts - reads text from generated PDF", async () => {
  const pdfBytes = await createTestPdf(["Hello World", "Second Page"]);
  const texts = await extractPageTexts(new Uint8Array(pdfBytes));
  assertEquals(texts.length, 2);
  assertEquals(texts[0].includes("Hello World"), true);
  assertEquals(texts[1].includes("Second Page"), true);
});

Deno.test("reorderPdf - reverses statement groups", async () => {
  const pdfBytes = await createTestPdf([
    "Page 1 of 2 - StatementA",
    "Page 2 of 2 - StatementA",
    "Page 1 of 1 - StatementB",
  ]);

  const result = await reorderPdf(new Uint8Array(pdfBytes));

  // Verify the result is a valid PDF with 3 pages
  const resultDoc = await PDFDocument.load(result);
  assertEquals(resultDoc.getPageCount(), 3);

  // Extract texts from result to verify order
  const resultTexts = await extractPageTexts(new Uint8Array(result));
  assertEquals(resultTexts[0].includes("StatementB"), true);
  assertEquals(resultTexts[1].includes("StatementA"), true);
  assertEquals(resultTexts[2].includes("StatementA"), true);
});

Deno.test("reorderPdf - single statement remains unchanged", async () => {
  const pdfBytes = await createTestPdf([
    "Page 1 of 2 - Only",
    "Page 2 of 2 - Only",
  ]);

  const result = await reorderPdf(new Uint8Array(pdfBytes));
  const resultDoc = await PDFDocument.load(result);
  assertEquals(resultDoc.getPageCount(), 2);
});

Deno.test("reorderPdf - invalid pattern throws", async () => {
  const pdfBytes = await createTestPdf(["test"]);
  let threw = false;
  try {
    await reorderPdf(new Uint8Array(pdfBytes), "[invalid");
  } catch (e: unknown) {
    threw = true;
    assertEquals((e as Error).message.includes("Invalid regex"), true);
  }
  assertEquals(threw, true);
});
