import { assertEquals, assertNotEquals } from "std/assert";
import { applyAction, getOrCreateRoom, snapshot } from "./room.ts";

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
  applyAction(first, { type: "addPlace", name: "Birria" });
  const second = getOrCreateRoom(id);
  assertEquals(second.places.includes("Birria"), true);
});

Deno.test("addPlace/removePlace delegan a decide.js", () => {
  const room = getOrCreateRoom(`test-places-${crypto.randomUUID()}`);
  applyAction(room, { type: "addPlace", name: "Birria" });
  assertEquals(room.places.includes("Birria"), true);
  applyAction(room, { type: "removePlace", name: "birria" });
  assertEquals(room.places.includes("Birria"), false);
});

Deno.test("addUser/removeUser delegan a decide.js", () => {
  const room = getOrCreateRoom(`test-users-${crypto.randomUUID()}`);
  applyAction(room, { type: "addUser", name: "Ana" });
  assertEquals(room.users, ["Ana"]);
  applyAction(room, { type: "removeUser", name: "ana" });
  assertEquals(room.users, []);
});

Deno.test("requestWinner con mayoría clara fija lastPick sin runoff", () => {
  const room = getOrCreateRoom(`test-winner-${crypto.randomUUID()}`);
  applyAction(room, { type: "castVote", user: "Ana", place: "Tacos al pastor" });
  applyAction(room, { type: "castVote", user: "Beto", place: "Tacos al pastor" });
  applyAction(room, { type: "castVote", user: "Caro", place: "Pozole" });
  applyAction(room, { type: "requestWinner" });
  assertEquals(room.lastPick, "Tacos al pastor");
  assertEquals(room.runoffPlaces, null);
});

Deno.test("requestWinner con empate arma runoffPlaces y limpia los votos", () => {
  const room = getOrCreateRoom(`test-tie-${crypto.randomUUID()}`);
  applyAction(room, { type: "castVote", user: "Ana", place: "Tacos al pastor" });
  applyAction(room, { type: "castVote", user: "Beto", place: "Pozole" });
  applyAction(room, { type: "requestWinner" });
  assertEquals(room.lastPick, null);
  assertEquals(room.runoffPlaces?.sort(), ["Pozole", "Tacos al pastor"]);
  assertEquals(room.votes, {});
});

Deno.test("resetVotes limpia votos y runoff pero conserva usuarios/lugares", () => {
  const room = getOrCreateRoom(`test-reset-${crypto.randomUUID()}`);
  applyAction(room, { type: "addUser", name: "Ana" });
  applyAction(room, { type: "castVote", user: "Ana", place: "Pozole" });
  applyAction(room, { type: "requestWinner" });
  applyAction(room, { type: "resetVotes" });
  assertEquals(room.votes, {});
  assertEquals(room.runoffPlaces, null);
  assertEquals(room.lastPick, null);
  assertEquals(room.users, ["Ana"]);
  assertEquals(room.places.length > 0, true);
});

Deno.test("setMode y randomPick", () => {
  const room = getOrCreateRoom(`test-mode-${crypto.randomUUID()}`);
  applyAction(room, { type: "setMode", mode: "vote" });
  assertEquals(room.mode, "vote");
  applyAction(room, { type: "setMode", mode: "bogus" });
  assertEquals(room.mode, "random");

  applyAction(room, { type: "randomPick" });
  assertEquals(room.places.includes(room.lastPick ?? ""), true);
});

Deno.test("dos salas distintas nunca se mezclan entre sí", () => {
  const a = getOrCreateRoom(`test-iso-a-${crypto.randomUUID()}`);
  const b = getOrCreateRoom(`test-iso-b-${crypto.randomUUID()}`);
  applyAction(a, { type: "addPlace", name: "Birria" });
  applyAction(a, { type: "addUser", name: "Ana" });
  assertEquals(b.places.includes("Birria"), false);
  assertEquals(b.users, []);
  assertNotEquals(a, b);
});

Deno.test("snapshot no incluye los sockets", () => {
  const room = getOrCreateRoom(`test-snapshot-${crypto.randomUUID()}`);
  const snap = snapshot(room) as Record<string, unknown>;
  assertEquals("sockets" in snap, false);
  assertEquals(Object.keys(snap).sort(), [
    "lastPick",
    "mode",
    "places",
    "runoffPlaces",
    "users",
    "votes",
  ]);
});

Deno.test("una acción desconocida no cambia el estado", () => {
  const room = getOrCreateRoom(`test-unknown-${crypto.randomUUID()}`);
  const before = snapshot(room);
  applyAction(room, { type: "doesNotExist" });
  assertEquals(snapshot(room), before);
});
