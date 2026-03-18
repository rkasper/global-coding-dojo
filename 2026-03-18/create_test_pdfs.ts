import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

/** Create a multi-statement PDF in reverse chronological order (most recent first). */
async function createMultiStatementPdf(filename: string) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const statements = [
    { month: "March 2026", pages: 3 },
    { month: "February 2026", pages: 2 },
    { month: "January 2026", pages: 4 },
  ];

  for (const stmt of statements) {
    for (let p = 1; p <= stmt.pages; p++) {
      const page = doc.addPage([612, 792]); // Letter size
      // Header
      page.drawText("ACME Bank", { x: 50, y: 730, size: 20, font: bold, color: rgb(0, 0.2, 0.5) });
      page.drawText(`Statement for ${stmt.month}`, { x: 50, y: 700, size: 14, font: bold });
      page.drawText(`Page ${p} of ${stmt.pages}`, { x: 450, y: 730, size: 10, font });

      // Some fake content
      let y = 660;
      page.drawText("Date          Description                    Amount", { x: 50, y, size: 10, font: bold });
      y -= 20;
      page.drawLine({ start: { x: 50, y: y + 5 }, end: { x: 550, y: y + 5 }, thickness: 0.5 });

      const transactions = [
        ["03/01", "Coffee Shop", "-$4.50"],
        ["03/02", "Grocery Store", "-$67.23"],
        ["03/03", "Direct Deposit", "+$3,200.00"],
        ["03/04", "Electric Bill", "-$142.00"],
        ["03/05", "Restaurant", "-$38.75"],
      ];
      for (const [date, desc, amt] of transactions) {
        page.drawText(`${date}          ${desc}`, { x: 50, y, size: 10, font });
        page.drawText(amt, { x: 480, y, size: 10, font });
        y -= 18;
      }

      // Footer
      page.drawText(`Account: ****4821 | ${stmt.month}`, { x: 50, y: 30, size: 8, font, color: rgb(0.5, 0.5, 0.5) });
    }
  }

  const bytes = await doc.save();
  await Deno.writeFile(filename, bytes);
  console.log(`Created ${filename} (${statements.reduce((s, st) => s + st.pages, 0)} pages, ${statements.length} statements)`);
}

/** Create a single-statement PDF (edge case). */
async function createSingleStatementPdf(filename: string) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);

  for (let p = 1; p <= 2; p++) {
    const page = doc.addPage([612, 792]);
    page.drawText("Single Statement Bank", { x: 50, y: 730, size: 18, font });
    page.drawText(`Page ${p} of 2`, { x: 450, y: 730, size: 10, font });
    page.drawText("Only one statement here - order should be unchanged.", { x: 50, y: 680, size: 12, font });
  }

  const bytes = await doc.save();
  await Deno.writeFile(filename, bytes);
  console.log(`Created ${filename} (2 pages, 1 statement)`);
}

await createMultiStatementPdf("test_3_statements.pdf");
await createSingleStatementPdf("test_1_statement.pdf");
console.log("\nUpload these to http://localhost:8000 to test.");
