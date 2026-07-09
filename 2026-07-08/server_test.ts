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
        const a = new WebSocket(`${WS_URL}/ws?room=${roomId}`);
        await once(a, "open");
        const first = JSON.parse((await once(a, "message")).data);
        assertEquals(first.type, "state");
        assertEquals(first.places.includes("Tacos al pastor"), true);
        assertEquals(first.users, []);
        a.close();
      });

      await t.step("addPlace broadcasts to every socket in the same room", async () => {
        const roomId = `t-${crypto.randomUUID()}`;
        const a = new WebSocket(`${WS_URL}/ws?room=${roomId}`);
        const b = new WebSocket(`${WS_URL}/ws?room=${roomId}`);
        // Register the "message" listeners in the SAME tick as "open", right
        // after construction — otherwise the server's initial snapshot can
        // arrive before we start listening and be dropped forever (addEventListener
        // only sees events dispatched after it's attached), hanging the next await.
        const aFirstMsg = once(a, "message");
        const bFirstMsg = once(b, "message");
        await Promise.all([once(a, "open"), once(b, "open")]);
        await Promise.all([aFirstMsg, bFirstMsg]);

        a.send(JSON.stringify({ type: "addPlace", name: "Birria" }));
        const msg = JSON.parse((await once(b, "message")).data);
        assertEquals(msg.type, "state");
        assertEquals(msg.places.includes("Birria"), true);

        a.close();
        b.close();
      });

      await t.step("two different rooms never mix state", async () => {
        const roomA = `t-a-${crypto.randomUUID()}`;
        const roomB = `t-b-${crypto.randomUUID()}`;
        const a = new WebSocket(`${WS_URL}/ws?room=${roomA}`);
        const b = new WebSocket(`${WS_URL}/ws?room=${roomB}`);
        const aFirstMsg = once(a, "message");
        const bFirstMsg = once(b, "message");
        await Promise.all([once(a, "open"), once(b, "open")]);
        await Promise.all([aFirstMsg, bFirstMsg]);

        a.send(JSON.stringify({ type: "addPlace", name: "Solo en A" }));
        const stateA = JSON.parse((await once(a, "message")).data);
        assertEquals(stateA.places.includes("Solo en A"), true);

        // b never receives another message because it's a different room —
        // give the broadcast a moment to (not) arrive, then check b's socket
        // is still on its original state by sending its own action and
        // confirming "Solo en A" never appears in b's room.
        b.send(JSON.stringify({ type: "addPlace", name: "Solo en B" }));
        const stateB = JSON.parse((await once(b, "message")).data);
        assertEquals(stateB.places.includes("Solo en A"), false);
        assertEquals(stateB.places.includes("Solo en B"), true);

        a.close();
        b.close();
      });

      await t.step("claimIdentity confirms myName in the reply state", async () => {
        const roomId = `t-${crypto.randomUUID()}`;
        const a = new WebSocket(`${WS_URL}/ws?room=${roomId}`);
        await once(a, "open");
        await once(a, "message"); // initial snapshot, myName: null

        a.send(JSON.stringify({ type: "claimIdentity", name: "Ana" }));
        const msg = JSON.parse((await once(a, "message")).data);
        assertEquals(msg.myName, "Ana");
        assertEquals(msg.users, ["Ana"]);

        a.close();
      });

      await t.step("claiming an already-live name from a different socket gets a variant", async () => {
        const roomId = `t-${crypto.randomUUID()}`;
        const a = new WebSocket(`${WS_URL}/ws?room=${roomId}`);
        const b = new WebSocket(`${WS_URL}/ws?room=${roomId}`);
        const aFirstMsg = once(a, "message");
        const bFirstMsg = once(b, "message");
        await Promise.all([once(a, "open"), once(b, "open")]);
        await Promise.all([aFirstMsg, bFirstMsg]);

        // Cada acción se transmite a TODOS los sockets de la sala, no solo
        // a quien la manda — hay que drenar el mensaje de ambos en cada
        // paso, o el listener del siguiente paso puede atrapar por error
        // un broadcast "viejo" que nunca se consumió (el mismo tipo de
        // condición de carrera que ya se dio en el paso "addPlace broadcasts").
        let pending = Promise.all([once(a, "message"), once(b, "message")]);
        a.send(JSON.stringify({ type: "claimIdentity", name: "Ana" }));
        await pending;

        pending = Promise.all([once(a, "message"), once(b, "message")]);
        b.send(JSON.stringify({ type: "claimIdentity", name: "Ana" }));
        const [, bEvent] = await pending;
        const bMsg = JSON.parse(bEvent.data);
        assertEquals(bMsg.myName, "Ana 2");
        assertEquals(bMsg.users, ["Ana", "Ana 2"]);

        a.close();
        b.close();
      });

      await t.step("castVote always votes as the claimed identity, ignoring the payload", async () => {
        const roomId = `t-${crypto.randomUUID()}`;
        const a = new WebSocket(`${WS_URL}/ws?room=${roomId}`);
        await once(a, "open");
        await once(a, "message");

        a.send(JSON.stringify({ type: "claimIdentity", name: "Ana" }));
        await once(a, "message");

        a.send(JSON.stringify({ type: "castVote", user: "Beto", place: "Pozole" }));
        const msg = JSON.parse((await once(a, "message")).data);
        assertEquals(msg.votes, { Ana: "Pozole" });

        a.close();
      });

      await t.step("requestWinner waits for every registered user to vote", async () => {
        const roomId = `t-${crypto.randomUUID()}`;
        const a = new WebSocket(`${WS_URL}/ws?room=${roomId}`);
        const b = new WebSocket(`${WS_URL}/ws?room=${roomId}`);
        const aFirstMsg = once(a, "message");
        const bFirstMsg = once(b, "message");
        await Promise.all([once(a, "open"), once(b, "open")]);
        await Promise.all([aFirstMsg, bFirstMsg]);

        // Cada acción se transmite a AMBOS sockets: siempre se drenan los
        // dos antes de mandar la siguiente acción (ver el comentario del
        // paso anterior sobre por qué es necesario).
        let pending = Promise.all([once(a, "message"), once(b, "message")]);
        a.send(JSON.stringify({ type: "claimIdentity", name: "Ana" }));
        await pending;

        pending = Promise.all([once(a, "message"), once(b, "message")]);
        b.send(JSON.stringify({ type: "claimIdentity", name: "Beto" }));
        await pending;

        pending = Promise.all([once(a, "message"), once(b, "message")]);
        a.send(JSON.stringify({ type: "castVote", place: "Tacos al pastor" }));
        await pending;

        // Solo Ana ha votado hasta ahora — pedir ganador no debe resolver nada.
        pending = Promise.all([once(a, "message"), once(b, "message")]);
        a.send(JSON.stringify({ type: "requestWinner" }));
        const [notYetEvent] = await pending;
        assertEquals(JSON.parse(notYetEvent.data).lastPick, null);

        // Beto también vota — ahora sí debe resolver.
        pending = Promise.all([once(a, "message"), once(b, "message")]);
        b.send(JSON.stringify({ type: "castVote", place: "Tacos al pastor" }));
        await pending;

        pending = Promise.all([once(a, "message"), once(b, "message")]);
        a.send(JSON.stringify({ type: "requestWinner" }));
        const [resolvedEvent] = await pending;
        assertEquals(JSON.parse(resolvedEvent.data).lastPick, "Tacos al pastor");

        a.close();
        b.close();
      });

      await t.step("malformed JSON returns an error message, not a crash", async () => {
        const roomId = `t-${crypto.randomUUID()}`;
        const a = new WebSocket(`${WS_URL}/ws?room=${roomId}`);
        await once(a, "open");
        await once(a, "message"); // initial snapshot

        a.send("{not valid json");
        const err = JSON.parse((await once(a, "message")).data);
        assertEquals(err.type, "error");

        a.close();
      });

      await t.step("an oversized message is rejected", async () => {
        const roomId = `t-${crypto.randomUUID()}`;
        const a = new WebSocket(`${WS_URL}/ws?room=${roomId}`);
        await once(a, "open");
        await once(a, "message"); // initial snapshot

        const huge = JSON.stringify({ type: "addPlace", name: "x".repeat(3000) });
        a.send(huge);
        const err = JSON.parse((await once(a, "message")).data);
        assertEquals(err.type, "error");

        a.close();
      });

      await t.step("a ping heartbeat does not error and keeps the connection open", async () => {
        const roomId = `t-${crypto.randomUUID()}`;
        const a = new WebSocket(`${WS_URL}/ws?room=${roomId}`);
        await once(a, "open");
        await once(a, "message"); // initial snapshot

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
