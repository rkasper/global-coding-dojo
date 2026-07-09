import {
  addSocket,
  applyAction,
  broadcast,
  getOrCreateRoom,
  removeSocket,
  snapshot,
} from "./room.ts";

const MAX_MESSAGE_LENGTH = 2000;
const MIN_MESSAGE_INTERVAL_MS = 50;

const lastMessageAt = new WeakMap<WebSocket, number>();

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
      socket.send(JSON.stringify({ type: "state", ...snapshot(room) }));
    };

    socket.onmessage = (event) => {
      if (typeof event.data !== "string" || event.data.length > MAX_MESSAGE_LENGTH) {
        socket.send(JSON.stringify({ type: "error", message: "message too large" }));
        return;
      }

      const now = Date.now();
      const last = lastMessageAt.get(socket) ?? 0;
      if (now - last < MIN_MESSAGE_INTERVAL_MS) {
        return; // se ignora silenciosamente: limita la frecuencia por socket
      }
      lastMessageAt.set(socket, now);

      try {
        const action = JSON.parse(event.data);
        if (action.type === "ping") return; // heartbeat: mantiene viva la conexión
        applyAction(room, action);
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
