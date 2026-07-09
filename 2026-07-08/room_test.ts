import { assertEquals, assertNotEquals } from "std/assert";
import { applyAction, getOrCreateRoom, removeSocket, snapshot, snapshotFor } from "./room.ts";

// Las pruebas de identidad no necesitan un WebSocket real: applyAction solo
// usa el socket como llave para "quién es quién" (Map key / referencia),
// nunca llama a ningún método de WebSocket sobre él.
function fakeSocket(): WebSocket {
  return {} as unknown as WebSocket;
}

Deno.test("una sala nueva arranca con el SEED y sin usuarios/votos", () => {
  const room = getOrCreateRoom(`test-seed-${crypto.randomUUID()}`);
  assertEquals(room.places, [
    "Tacos al pastor",
    "Pozole",
    "Tortas",
    "Sushi",
    "Pizza",
    "Ramen",
  ]);
  assertEquals(room.users, []);
  assertEquals(room.votes, {});
  assertEquals(room.mode, "random");
  assertEquals(room.runoffPlaces, null);
});

Deno.test("getOrCreateRoom devuelve la misma sala si ya existe", () => {
  const id = `test-same-${crypto.randomUUID()}`;
  const first = getOrCreateRoom(id);
  applyAction(first, fakeSocket(), { type: "addPlace", name: "Birria" });
  const second = getOrCreateRoom(id);
  assertEquals(second.places.includes("Birria"), true);
});

Deno.test("addPlace/removePlace delegan a decide.js", () => {
  const room = getOrCreateRoom(`test-places-${crypto.randomUUID()}`);
  const s = fakeSocket();
  applyAction(room, s, { type: "addPlace", name: "Birria" });
  assertEquals(room.places.includes("Birria"), true);
  applyAction(room, s, { type: "removePlace", name: "birria" });
  assertEquals(room.places.includes("Birria"), false);
});

Deno.test("claimIdentity registra un nombre nuevo y lo confirma en el snapshot", () => {
  const room = getOrCreateRoom(`test-claim-${crypto.randomUUID()}`);
  const ana = fakeSocket();
  applyAction(room, ana, { type: "claimIdentity", name: "Ana" });
  assertEquals(room.users, ["Ana"]);
  assertEquals(snapshotFor(room, ana).myName, "Ana");
});

Deno.test("claimIdentity re-reclamar el mismo nombre con el mismo socket es idempotente", () => {
  const room = getOrCreateRoom(`test-claim-idem-${crypto.randomUUID()}`);
  const ana = fakeSocket();
  applyAction(room, ana, { type: "claimIdentity", name: "Ana" });
  applyAction(room, ana, { type: "claimIdentity", name: "Ana" });
  assertEquals(room.users, ["Ana"]);
  assertEquals(snapshotFor(room, ana).myName, "Ana");
});

Deno.test("claimIdentity con el mismo nombre desde OTRA conexión viva genera una variante", () => {
  const room = getOrCreateRoom(`test-claim-conflict-${crypto.randomUUID()}`);
  const deviceA = fakeSocket();
  const deviceB = fakeSocket();
  applyAction(room, deviceA, { type: "claimIdentity", name: "Ana" });
  applyAction(room, deviceB, { type: "claimIdentity", name: "Ana" });

  assertEquals(room.users, ["Ana", "Ana 2"]);
  assertEquals(snapshotFor(room, deviceA).myName, "Ana");
  assertEquals(snapshotFor(room, deviceB).myName, "Ana 2");
});

Deno.test("claimIdentity genera variantes sucesivas para una tercera conexión", () => {
  const room = getOrCreateRoom(`test-claim-triple-${crypto.randomUUID()}`);
  const a = fakeSocket();
  const b = fakeSocket();
  const c = fakeSocket();
  applyAction(room, a, { type: "claimIdentity", name: "Ana" });
  applyAction(room, b, { type: "claimIdentity", name: "ana" }); // sin distinguir mayúsculas
  applyAction(room, c, { type: "claimIdentity", name: "Ana" });

  assertEquals(room.users, ["Ana", "Ana 2", "Ana 3"]);
  assertEquals(snapshotFor(room, c).myName, "Ana 3");
});

Deno.test("al desconectar se libera el nombre, pero sigue en la lista de usuarios", () => {
  const room = getOrCreateRoom(`test-release-${crypto.randomUUID()}`);
  const a = fakeSocket();
  applyAction(room, a, { type: "claimIdentity", name: "Ana" });
  removeSocket(room, a); // lo que corre server.ts en socket.onclose

  assertEquals(room.users, ["Ana"]); // el registro persiste

  const b = fakeSocket();
  applyAction(room, b, { type: "claimIdentity", name: "Ana" });
  assertEquals(room.users, ["Ana"]); // se reclama tal cual, sin variante
  assertEquals(snapshotFor(room, b).myName, "Ana");
});

Deno.test("castVote siempre vota como la identidad reclamada por ese socket, sin importar el payload", () => {
  const room = getOrCreateRoom(`test-vote-self-${crypto.randomUUID()}`);
  const ana = fakeSocket();
  const beto = fakeSocket();
  applyAction(room, ana, { type: "claimIdentity", name: "Ana" });
  applyAction(room, beto, { type: "claimIdentity", name: "Beto" });

  // Ana intenta mandar un voto "como Beto" — el servidor lo ignora y vota como Ana.
  applyAction(room, ana, { type: "castVote", user: "Beto", place: "Tacos al pastor" });

  assertEquals(room.votes, { Ana: "Tacos al pastor" });
});

Deno.test("castVote sin haberse registrado no hace nada", () => {
  const room = getOrCreateRoom(`test-vote-unregistered-${crypto.randomUUID()}`);
  const anon = fakeSocket();
  applyAction(room, anon, { type: "castVote", place: "Tacos al pastor" });
  assertEquals(room.votes, {});
});

Deno.test("requestWinner no resuelve nada hasta que todos hayan votado", () => {
  const room = getOrCreateRoom(`test-wait-all-${crypto.randomUUID()}`);
  const ana = fakeSocket();
  const beto = fakeSocket();
  applyAction(room, ana, { type: "claimIdentity", name: "Ana" });
  applyAction(room, beto, { type: "claimIdentity", name: "Beto" });
  applyAction(room, ana, { type: "castVote", place: "Tacos al pastor" });

  applyAction(room, ana, { type: "requestWinner" });

  assertEquals(room.lastPick, null);
  assertEquals(room.runoffPlaces, null);
  assertEquals(room.votes, { Ana: "Tacos al pastor" }); // no se tocan los votos ya puestos
});

Deno.test("requestWinner resuelve en cuanto el último registrado vota", () => {
  const room = getOrCreateRoom(`test-wait-all-resolve-${crypto.randomUUID()}`);
  const ana = fakeSocket();
  const beto = fakeSocket();
  applyAction(room, ana, { type: "claimIdentity", name: "Ana" });
  applyAction(room, beto, { type: "claimIdentity", name: "Beto" });
  applyAction(room, ana, { type: "castVote", place: "Tacos al pastor" });
  applyAction(room, beto, { type: "castVote", place: "Tacos al pastor" });

  applyAction(room, ana, { type: "requestWinner" });

  assertEquals(room.lastPick, "Tacos al pastor");
});

Deno.test("requestWinner con empate arma runoffPlaces y limpia los votos", () => {
  const room = getOrCreateRoom(`test-tie-${crypto.randomUUID()}`);
  const ana = fakeSocket();
  const beto = fakeSocket();
  applyAction(room, ana, { type: "claimIdentity", name: "Ana" });
  applyAction(room, beto, { type: "claimIdentity", name: "Beto" });
  applyAction(room, ana, { type: "castVote", place: "Tacos al pastor" });
  applyAction(room, beto, { type: "castVote", place: "Pozole" });

  applyAction(room, ana, { type: "requestWinner" });

  assertEquals(room.lastPick, null);
  assertEquals(room.runoffPlaces?.sort(), ["Pozole", "Tacos al pastor"]);
  assertEquals(room.votes, {});
});

Deno.test("un registrado nuevo a mitad de la votación también debe votar antes de resolver", () => {
  const room = getOrCreateRoom(`test-late-join-${crypto.randomUUID()}`);
  const ana = fakeSocket();
  const beto = fakeSocket();
  applyAction(room, ana, { type: "claimIdentity", name: "Ana" });
  applyAction(room, ana, { type: "castVote", place: "Tacos al pastor" });
  applyAction(room, ana, { type: "requestWinner" });
  assertEquals(room.lastPick, "Tacos al pastor"); // Ana era la única registrada

  applyAction(room, beto, { type: "claimIdentity", name: "Beto" });
  applyAction(room, ana, { type: "requestWinner" }); // Beto todavía no vota
  assertEquals(room.lastPick, "Tacos al pastor"); // no cambia: sigue igual, no se re-resuelve
});

Deno.test("resetVotes limpia votos y runoff pero conserva usuarios/lugares", () => {
  const room = getOrCreateRoom(`test-reset-${crypto.randomUUID()}`);
  const ana = fakeSocket();
  applyAction(room, ana, { type: "claimIdentity", name: "Ana" });
  applyAction(room, ana, { type: "castVote", place: "Pozole" });
  applyAction(room, ana, { type: "requestWinner" });
  applyAction(room, ana, { type: "resetVotes" });
  assertEquals(room.votes, {});
  assertEquals(room.runoffPlaces, null);
  assertEquals(room.lastPick, null);
  assertEquals(room.users, ["Ana"]);
  assertEquals(room.places.length > 0, true);
});

Deno.test("setMode y randomPick", () => {
  const room = getOrCreateRoom(`test-mode-${crypto.randomUUID()}`);
  const s = fakeSocket();
  applyAction(room, s, { type: "setMode", mode: "vote" });
  assertEquals(room.mode, "vote");
  applyAction(room, s, { type: "setMode", mode: "bogus" });
  assertEquals(room.mode, "random");

  applyAction(room, s, { type: "randomPick" });
  assertEquals(room.places.includes(room.lastPick ?? ""), true);
});

Deno.test("dos salas distintas nunca se mezclan entre sí", () => {
  const a = getOrCreateRoom(`test-iso-a-${crypto.randomUUID()}`);
  const b = getOrCreateRoom(`test-iso-b-${crypto.randomUUID()}`);
  applyAction(a, fakeSocket(), { type: "addPlace", name: "Birria" });
  applyAction(a, fakeSocket(), { type: "claimIdentity", name: "Ana" });
  assertEquals(b.places.includes("Birria"), false);
  assertEquals(b.users, []);
  assertNotEquals(a, b);
});

Deno.test("snapshot no incluye los sockets ni los claims", () => {
  const room = getOrCreateRoom(`test-snapshot-${crypto.randomUUID()}`);
  const snap = snapshot(room) as Record<string, unknown>;
  assertEquals("sockets" in snap, false);
  assertEquals("claims" in snap, false);
  assertEquals(Object.keys(snap).sort(), [
    "lastPick",
    "mode",
    "places",
    "runoffPlaces",
    "users",
    "votes",
  ]);
});

Deno.test("snapshotFor agrega myName y nada más", () => {
  const room = getOrCreateRoom(`test-snapshotfor-${crypto.randomUUID()}`);
  const s = fakeSocket();
  const snap = snapshotFor(room, s) as Record<string, unknown>;
  assertEquals(snap.myName, null);
  assertEquals(Object.keys(snap).sort(), [
    "lastPick",
    "mode",
    "myName",
    "places",
    "runoffPlaces",
    "users",
    "votes",
  ]);
});

Deno.test("una acción desconocida no cambia el estado", () => {
  const room = getOrCreateRoom(`test-unknown-${crypto.randomUUID()}`);
  const s = fakeSocket();
  const before = snapshot(room);
  applyAction(room, s, { type: "doesNotExist" });
  assertEquals(snapshot(room), before);
});
