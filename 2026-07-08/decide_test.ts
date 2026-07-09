import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  addPlace,
  castVote,
  findCanonical,
  normalize,
  pickRandom,
  removePlace,
  tallyVotes,
  topChoices,
  uniqueName,
  votedFor,
} from "./static/decide.js";

Deno.test("normalize recorta y colapsa espacios", () => {
  assertEquals(normalize("  Tacos   El   Güero "), "Tacos El Güero");
  assertEquals(normalize(""), "");
  assertEquals(normalize(null), "");
});

Deno.test("addPlace agrega un lugar nuevo", () => {
  assertEquals(addPlace([], "Tacos"), ["Tacos"]);
  assertEquals(addPlace(["Tacos"], "Pozole"), ["Tacos", "Pozole"]);
});

Deno.test("addPlace ignora vacíos", () => {
  assertEquals(addPlace(["Tacos"], "   "), ["Tacos"]);
});

Deno.test("addPlace no duplica (sin distinguir mayúsculas/acentos)", () => {
  assertEquals(addPlace(["Tácos"], "tacos"), ["Tácos"]);
  assertEquals(addPlace(["Tacos"], "TACOS"), ["Tacos"]);
});

Deno.test("addPlace no muta la lista original", () => {
  const original = ["Tacos"];
  addPlace(original, "Pozole");
  assertEquals(original, ["Tacos"]);
});

Deno.test("removePlace quita el lugar indicado", () => {
  assertEquals(removePlace(["Tacos", "Pozole"], "tacos"), ["Pozole"]);
});

Deno.test("pickRandom usa el rng inyectado", () => {
  const lista = ["A", "B", "C"];
  assertEquals(pickRandom(lista, () => 0), "A");
  assertEquals(pickRandom(lista, () => 0.5), "B");
  assertEquals(pickRandom(lista, () => 0.99), "C");
});

Deno.test("pickRandom devuelve null si la lista está vacía", () => {
  assertEquals(pickRandom([], () => 0), null);
});

Deno.test("tallyVotes determina al ganador", () => {
  const { winner, counts } = tallyVotes(["Tacos", "Pozole", "Tacos"]);
  assertEquals(winner, "Tacos");
  assertEquals(counts, { Tacos: 2, Pozole: 1 });
});

Deno.test("tallyVotes marca empate", () => {
  const { tie } = tallyVotes(["Tacos", "Pozole"]);
  assertEquals(tie, true);
});

Deno.test("topChoices devuelve los lugares con más votos", () => {
  assertEquals(topChoices({ Tacos: 2, Pozole: 1 }), ["Tacos"]);
  assertEquals(topChoices({ Tacos: 2, Pozole: 2, Sushi: 1 }), ["Tacos", "Pozole"]);
  assertEquals(topChoices({}), []);
});

Deno.test("findCanonical devuelve la forma exacta ya registrada", () => {
  assertEquals(findCanonical(["Ana", "Beto"], "ana"), "Ana");
  assertEquals(findCanonical(["Ana"], "Caro"), null);
});

Deno.test("uniqueName devuelve el nombre tal cual si no choca", () => {
  assertEquals(uniqueName([], "Ana"), "Ana");
  assertEquals(uniqueName(["Beto"], "Ana"), "Ana");
});

Deno.test("uniqueName agrega un sufijo si el nombre ya está en uso", () => {
  assertEquals(uniqueName(["Ana"], "ana"), "Ana 2");
  assertEquals(uniqueName(["Ana", "Ana 2"], "Ana"), "Ana 3");
});

Deno.test("uniqueName ignora vacíos", () => {
  assertEquals(uniqueName(["Ana"], "   "), "");
});

Deno.test("castVote registra el voto de una persona", () => {
  const v1 = castVote({}, "Ana", "Tacos");
  assertEquals(v1, { Ana: "Tacos" });
});

Deno.test("castVote reemplaza el voto anterior de la misma persona", () => {
  let votes = castVote({}, "Ana", "Tacos");
  votes = castVote(votes, "Ana", "Pozole");
  assertEquals(votes, { Ana: "Pozole" });
});

Deno.test("castVote ignora usuario o lugar vacíos", () => {
  assertEquals(castVote({}, "  ", "Tacos"), {});
  assertEquals(castVote({}, "Ana", "  "), {});
});

Deno.test("castVote no muta el mapa original", () => {
  const original = { Ana: "Tacos" };
  castVote(original, "Beto", "Pozole");
  assertEquals(original, { Ana: "Tacos" });
});

Deno.test("votedFor devuelve el lugar elegido o null", () => {
  const votes = castVote({}, "Ana", "Tacos");
  assertEquals(votedFor(votes, "ana"), "Tacos");
  assertEquals(votedFor(votes, "Beto"), null);
});
