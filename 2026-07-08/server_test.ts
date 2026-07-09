import { assertEquals } from "std/assert";
import { handler } from "./server.ts";

const PORT = 8099;
const BASE_URL = `http://localhost:${PORT}`;
const WS_URL = `ws://localhost:${PORT}`;

function once(socket: WebSocket, type: "open" | "message"): Promise<MessageEvent> {
  return new Promise((resolve) => {
    socket.addEventListener(type, (event) => resolve(event as MessageEvent), { once: true });
  });
}

// Abre `count` sockets a la misma sala y drena el snapshot inicial de cada
// uno. Los listeners de "message" se registran en el MISMO tick que la
// construcción del socket — si se registraran después de "open", el
// snapshot inicial podría llegar antes de empezar a escuchar y perderse
// para siempre (addEventListener solo ve eventos despachados después de
// engancharse), colgando el siguiente await.
async function connectSockets(roomId: string, count: number) {
  const sockets = Array.from({ length: count }, () => new WebSocket(`${WS_URL}/ws?room=${roomId}`));
  const firstMessages = sockets.map((s) => once(s, "message"));
  await Promise.all(sockets.map((s) => once(s, "open")));
  const initial = (await Promise.all(firstMessages)).map((e) => JSON.parse(e.data));
  return { sockets, initial };
}

// Manda `action` desde `sender` y espera a que el broadcast resultante
// llegue a TODOS los `sockets` indicados (cada acción se transmite a todos
// los sockets de la sala, no solo a quien la manda — hay que drenarlos
// todos antes de la siguiente acción, o el listener del siguiente paso
// puede atrapar por error un broadcast viejo sin consumir). Devuelve los
// mensajes ya parseados, en el mismo orden que `sockets`.
async function sendAndDrain(sender: WebSocket, sockets: WebSocket[], action: unknown) {
  const pending = Promise.all(sockets.map((s) => once(s, "message")));
  sender.send(typeof action === "string" ? action : JSON.stringify(action));
  return (await pending).map((e) => JSON.parse(e.data));
}

Deno.test({
  name: "integration tests",
  sanitizeResources: false,
  sanitizeOps: false,
  fn: async (t) => {
    const server = Deno.serve({ port: PORT }, handler);

    try {
      await t.step("GET / returns the app HTML", async () => {
        const resp = await fetch(BASE_URL + "/");
        assertEquals(resp.status, 200);
        assertEquals(resp.headers.get("content-type")?.includes("text/html"), true);
        const body = await resp.text();
        assertEquals(body.includes("CDMX"), true);
      });

      await t.step("GET /decide.js returns the module", async () => {
        const resp = await fetch(BASE_URL + "/decide.js");
        assertEquals(resp.status, 200);
        assertEquals(resp.headers.get("content-type")?.includes("javascript"), true);
        const body = await resp.text();
        assertEquals(body.includes("export function"), true);
      });

      await t.step("GET /unknown returns 404", async () => {
        const resp = await fetch(BASE_URL + "/unknown");
        assertEquals(resp.status, 404);
        await resp.body?.cancel();
      });

      await t.step("GET /ws without ?room= returns 400 instead of upgrading", async () => {
        const resp = await fetch(BASE_URL + "/ws");
        assertEquals(resp.status, 400);
        await resp.body?.cancel();
      });

      await t.step("connecting sends an initial state snapshot", async () => {
        const roomId = `t-${crypto.randomUUID()}`;
        const { sockets: [a], initial: [first] } = await connectSockets(roomId, 1);
        assertEquals(first.type, "state");
        assertEquals(first.places.includes("Tacos al pastor"), true);
        assertEquals(first.users, []);
        a.close();
      });

      await t.step("addPlace broadcasts to every socket in the same room", async () => {
        const roomId = `t-${crypto.randomUUID()}`;
        const { sockets: [a, b] } = await connectSockets(roomId, 2);

        const [, bState] = await sendAndDrain(a, [a, b], { type: "addPlace", name: "Birria" });
        assertEquals(bState.type, "state");
        assertEquals(bState.places.includes("Birria"), true);

        a.close();
        b.close();
      });

      await t.step("two different rooms never mix state", async () => {
        const roomA = `t-a-${crypto.randomUUID()}`;
        const roomB = `t-b-${crypto.randomUUID()}`;
        const { sockets: [a] } = await connectSockets(roomA, 1);
        const { sockets: [b] } = await connectSockets(roomB, 1);

        const [stateA] = await sendAndDrain(a, [a], { type: "addPlace", name: "Solo en A" });
        assertEquals(stateA.places.includes("Solo en A"), true);

        const [stateB] = await sendAndDrain(b, [b], { type: "addPlace", name: "Solo en B" });
        assertEquals(stateB.places.includes("Solo en A"), false);
        assertEquals(stateB.places.includes("Solo en B"), true);

        a.close();
        b.close();
      });

      await t.step("claimIdentity confirms myName in the reply state", async () => {
        const roomId = `t-${crypto.randomUUID()}`;
        const { sockets: [a] } = await connectSockets(roomId, 1);

        const [msg] = await sendAndDrain(a, [a], { type: "claimIdentity", name: "Ana" });
        assertEquals(msg.myName, "Ana");
        assertEquals(msg.users, ["Ana"]);

        a.close();
      });

      await t.step("claiming an already-live name from a different socket gets a variant", async () => {
        const roomId = `t-${crypto.randomUUID()}`;
        const { sockets: [a, b] } = await connectSockets(roomId, 2);

        await sendAndDrain(a, [a, b], { type: "claimIdentity", name: "Ana" });
        const [, bMsg] = await sendAndDrain(b, [a, b], { type: "claimIdentity", name: "Ana" });
        assertEquals(bMsg.myName, "Ana 2");
        assertEquals(bMsg.users, ["Ana", "Ana 2"]);

        a.close();
        b.close();
      });

      await t.step("castVote always votes as the claimed identity, ignoring the payload", async () => {
        const roomId = `t-${crypto.randomUUID()}`;
        const { sockets: [a] } = await connectSockets(roomId, 1);

        await sendAndDrain(a, [a], { type: "claimIdentity", name: "Ana" });
        const [msg] = await sendAndDrain(a, [a], { type: "castVote", user: "Beto", place: "Pozole" });
        assertEquals(msg.votes, { Ana: "Pozole" });

        a.close();
      });

      await t.step("requestWinner waits for every registered user to vote", async () => {
        const roomId = `t-${crypto.randomUUID()}`;
        const { sockets: [a, b] } = await connectSockets(roomId, 2);
        const both = [a, b];

        await sendAndDrain(a, both, { type: "claimIdentity", name: "Ana" });
        await sendAndDrain(b, both, { type: "claimIdentity", name: "Beto" });
        await sendAndDrain(a, both, { type: "castVote", place: "Tacos al pastor" });

        // Solo Ana ha votado hasta ahora — pedir ganador no debe resolver nada.
        const [notYet] = await sendAndDrain(a, both, { type: "requestWinner" });
        assertEquals(notYet.lastPick, null);

        // Beto también vota — ahora sí debe resolver.
        await sendAndDrain(b, both, { type: "castVote", place: "Tacos al pastor" });
        const [resolved] = await sendAndDrain(a, both, { type: "requestWinner" });
        assertEquals(resolved.lastPick, "Tacos al pastor");

        a.close();
        b.close();
      });

      await t.step("malformed JSON returns an error message, not a crash", async () => {
        const roomId = `t-${crypto.randomUUID()}`;
        const { sockets: [a] } = await connectSockets(roomId, 1);

        const [err] = await sendAndDrain(a, [a], "{not valid json");
        assertEquals(err.type, "error");

        a.close();
      });

      await t.step("an oversized message is rejected", async () => {
        const roomId = `t-${crypto.randomUUID()}`;
        const { sockets: [a] } = await connectSockets(roomId, 1);

        const huge = JSON.stringify({ type: "addPlace", name: "x".repeat(3000) });
        const [err] = await sendAndDrain(a, [a], huge);
        assertEquals(err.type, "error");

        a.close();
      });

      await t.step("a ping heartbeat does not error and keeps the connection open", async () => {
        const roomId = `t-${crypto.randomUUID()}`;
        const { sockets: [a] } = await connectSockets(roomId, 1);

        a.send(JSON.stringify({ type: "ping" }));
        // give the event loop a turn; the socket should remain OPEN with no error reply
        await new Promise((r) => setTimeout(r, 80));
        assertEquals(a.readyState, WebSocket.OPEN);

        a.close();
      });
    } finally {
      await server.shutdown();
    }
  },
});
