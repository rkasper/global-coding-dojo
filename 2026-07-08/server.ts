import {
  addSocket,
  applyAction,
  broadcast,
  getOrCreateRoom,
  removeSocket,
  snapshotFor,
} from "./room.ts";

const MAX_MESSAGE_LENGTH = 2000;

// Cubeta de tokens por socket: permite ráfagas cortas de acciones legítimas
// y seguidas (ej. "registrarme" → "votar" en el mismo segundo) pero frena
// un flujo sostenido de mensajes (cliente roto o malicioso). Un límite
// estricto de "mínimo N ms entre mensajes" resultó demasiado agresivo: hasta
// dos acciones humanas normales en rápida sucesión chocaban con él.
const BURST_CAPACITY = 8;
const REFILL_MS = 200; // 1 token cada 200ms => 5 mensajes/seg sostenidos

interface Bucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new WeakMap<WebSocket, Bucket>();

function allowMessage(socket: WebSocket): boolean {
  const now = Date.now();
  let bucket = buckets.get(socket);
  if (!bucket) {
    bucket = { tokens: BURST_CAPACITY, lastRefill: now };
    buckets.set(socket, bucket);
  }

  const refillCount = Math.floor((now - bucket.lastRefill) / REFILL_MS);
  if (refillCount > 0) {
    bucket.tokens = Math.min(BURST_CAPACITY, bucket.tokens + refillCount);
    bucket.lastRefill = now;
  }

  if (bucket.tokens <= 0) return false;
  bucket.tokens--;
  return true;
}

export async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);

  if (url.pathname === "/ws") {
    const roomId = url.searchParams.get("room");
    if (!roomId || req.headers.get("upgrade") !== "websocket") {
      return new Response("Expected WebSocket with ?room=", { status: 400 });
    }

    const { socket, response } = Deno.upgradeWebSocket(req);
    const room = getOrCreateRoom(roomId);

    socket.onopen = () => {
      addSocket(room, socket);
      socket.send(JSON.stringify({ type: "state", ...snapshotFor(room, socket) }));
    };

    socket.onmessage = (event) => {
      if (typeof event.data !== "string" || event.data.length > MAX_MESSAGE_LENGTH) {
        socket.send(JSON.stringify({ type: "error", message: "message too large" }));
        return;
      }

      if (!allowMessage(socket)) {
        return; // se ignora silenciosamente: sin tokens disponibles ahora mismo
      }

      try {
        const action = JSON.parse(event.data);
        if (action.type === "ping") return; // heartbeat: mantiene viva la conexión
        applyAction(room, socket, action);
        broadcast(room);
      } catch {
        socket.send(JSON.stringify({ type: "error", message: "bad message" }));
      }
    };

    socket.onclose = () => removeSocket(room, socket);

    return response;
  }

  if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
    const html = await Deno.readFile("./static/index.html");
    return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
  }

  if (req.method === "GET" && url.pathname === "/decide.js") {
    const js = await Deno.readFile("./static/decide.js");
    return new Response(js, { headers: { "content-type": "application/javascript; charset=utf-8" } });
  }

  return new Response("Not Found", { status: 404 });
}

const port = parseInt(Deno.env.get("PORT") ?? "8000", 10);
Deno.serve({ port }, handler);
