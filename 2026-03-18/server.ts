import { reorderPdf } from "./pdf_reorder.ts";

const port = parseInt(Deno.env.get("PORT") ?? "8000", 10);

Deno.serve({ port }, async (req: Request): Promise<Response> => {
  const url = new URL(req.url);

  if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
    const html = await Deno.readFile("./static/index.html");
    return new Response(html, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  if (req.method === "POST" && url.pathname === "/api/reorder") {
    try {
      const contentType = req.headers.get("content-type") ?? "";
      if (!contentType.includes("multipart/form-data")) {
        return new Response("Expected multipart/form-data", { status: 400 });
      }

      const formData = await req.formData();
      const file = formData.get("pdf");
      if (!(file instanceof File)) {
        return new Response("Missing 'pdf' file field", { status: 400 });
      }

      const patternStr = formData.get("pattern") as string | null;
      const pdfBytes = new Uint8Array(await file.arrayBuffer());
      const result = await reorderPdf(pdfBytes, patternStr ?? undefined);

      return new Response(result, {
        headers: {
          "content-type": "application/pdf",
          "content-disposition": `attachment; filename="reordered_${file.name}"`,
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Reorder error:", message);
      return new Response(message, { status: 500 });
    }
  }

  return new Response("Not Found", { status: 404 });
});
