// Dot Vote web UI.  Run: deno task ui   then open http://localhost:8000

import {countVotes} from "./vote.ts";

const SAMPLES = new Set(["sample-votes.md", "ranked-votes.md"]);

export async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);

  if (req.method === "POST" && url.pathname === "/api/count") {
    return Response.json(countVotes(await req.text()));
  }

  if (req.method === "GET" && url.pathname === "/") {
    return serveFile("./static/index.html", "text/html; charset=utf-8");
  }

  const sample = url.pathname.replace("/samples/", "");
  if (req.method === "GET" && url.pathname.startsWith("/samples/") && SAMPLES.has(sample)) {
    return serveFile(`./${sample}`, "text/markdown; charset=utf-8");
  }

  return new Response("Not Found", {status: 404});
}

async function serveFile(path: string, contentType: string) {
  const body = await Deno.readFile(new URL(path, import.meta.url));
  return new Response(body, {headers: {"content-type": contentType}});
}

if (import.meta.main) {
  const port = Number(Deno.args[0] ?? 8000);
  Deno.serve({port}, handler);
}
