import { convert } from "./travelassistant.ts";

const STATIC_DIR = new URL("./static/", import.meta.url);

const CONTENT_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
};

async function serveStatic(pathname: string): Promise<Response> {
  const relative = pathname === "/" ? "/index.html" : pathname;
  const fileUrl = new URL(`.${relative}`, STATIC_DIR);
  // Reject anything that escapes STATIC_DIR (e.g. "/../server.ts") before touching the filesystem.
  if (!fileUrl.pathname.startsWith(STATIC_DIR.pathname)) {
    return new Response("Not found", { status: 404 });
  }
  try {
    const body = await Deno.readFile(fileUrl);
    const ext = relative.slice(relative.lastIndexOf("."));
    return new Response(body, {
      headers: { "content-type": CONTENT_TYPES[ext] ?? "application/octet-stream" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

export function handleConvert(url: URL): Response {
  const time = url.searchParams.get("time") ?? "";
  const from = url.searchParams.get("from") ?? "";
  const to = url.searchParams.get("to") ?? "";
  try {
    const result = convert(time, from, to);
    return Response.json({ result });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return Response.json({ error: message }, { status: 400 });
  }
}

export function handler(req: Request): Response | Promise<Response> {
  const url = new URL(req.url);
  if (url.pathname === "/convert") {
    return handleConvert(url);
  }
  return serveStatic(url.pathname);
}

if (import.meta.main) {
  const portFlag = Deno.args.find((arg) => arg.startsWith("--port"));
  const port = portFlag ? Number(portFlag.split("=")[1] ?? Deno.args[Deno.args.indexOf(portFlag) + 1]) : 8000;
  Deno.serve({ port }, handler);
}
