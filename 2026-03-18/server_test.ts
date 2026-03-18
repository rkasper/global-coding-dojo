import { assertEquals } from "std/assert";
import { PDFDocument } from "pdf-lib";

const BASE_URL = "http://localhost:8001";

/** Create a minimal test PDF. */
async function createTestPdf(pageTexts: string[]): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  for (const text of pageTexts) {
    const page = doc.addPage([200, 200]);
    page.drawText(text, { x: 10, y: 100, size: 10 });
  }
  return doc.save();
}

// Start a test server instance
let server: Deno.HttpServer | null = null;

function startServer() {
  // Dynamic import would be cleaner but for tests we inline a minimal server
  return import("./pdf_reorder.ts").then(({ reorderPdf }) => {
    server = Deno.serve({ port: 8001 }, async (req: Request): Promise<Response> => {
      const url = new URL(req.url);
      if (req.method === "GET" && url.pathname === "/") {
        const html = await Deno.readFile("./static/index.html");
        return new Response(html, {
          headers: { "content-type": "text/html; charset=utf-8" },
        });
      }
      if (req.method === "POST" && url.pathname === "/api/reorder") {
        try {
          const formData = await req.formData();
          const file = formData.get("pdf");
          if (!(file instanceof File)) {
            return new Response("Missing 'pdf' file field", { status: 400 });
          }
          const patternStr = formData.get("pattern") as string | null;
          const pdfBytes = new Uint8Array(await file.arrayBuffer());
          const result = await reorderPdf(pdfBytes, patternStr ?? undefined);
          return new Response(result as unknown as BodyInit, {
            headers: { "content-type": "application/pdf" },
          });
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Unknown error";
          return new Response(message, { status: 500 });
        }
      }
      return new Response("Not Found", { status: 404 });
    });
  });
}

async function stopServer() {
  if (server) {
    await server.shutdown();
    server = null;
  }
}

Deno.test({
  name: "integration tests",
  sanitizeResources: false,
  sanitizeOps: false,
  fn: async (t) => {
    await startServer();

    await t.step("GET / returns HTML", async () => {
      const resp = await fetch(BASE_URL + "/");
      assertEquals(resp.status, 200);
      const ct = resp.headers.get("content-type");
      assertEquals(ct?.includes("text/html"), true);
      const body = await resp.text();
      assertEquals(body.includes("PDF Bank Statement Reorderer"), true);
    });

    await t.step("GET /unknown returns 404", async () => {
      const resp = await fetch(BASE_URL + "/unknown");
      assertEquals(resp.status, 404);
      await resp.body?.cancel();
    });

    await t.step("POST /api/reorder returns reordered PDF", async () => {
      const pdfBytes = await createTestPdf([
        "Page 1 of 2 - First",
        "Page 2 of 2 - First",
        "Page 1 of 1 - Second",
      ]);

      const formData = new FormData();
      formData.append("pdf", new File([pdfBytes as BlobPart], "test.pdf", { type: "application/pdf" }));

      const resp = await fetch(BASE_URL + "/api/reorder", {
        method: "POST",
        body: formData,
      });
      assertEquals(resp.status, 200);
      assertEquals(resp.headers.get("content-type"), "application/pdf");

      const result = new Uint8Array(await resp.arrayBuffer());
      const doc = await PDFDocument.load(result);
      assertEquals(doc.getPageCount(), 3);
    });

    await t.step("POST /api/reorder without file returns 400", async () => {
      const formData = new FormData();
      formData.append("pattern", "test");
      const resp = await fetch(BASE_URL + "/api/reorder", {
        method: "POST",
        body: formData,
      });
      assertEquals(resp.status, 400);
      await resp.body?.cancel();
    });

    await stopServer();
  },
});
