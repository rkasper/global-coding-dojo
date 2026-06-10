import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { score } from "./tennis.ts";

// Level 1 — first points. (0-0 is handled by the Level 2 "Love-All" test below,
// since equal scores get the "-All" treatment.)
Deno.test("Level 1: fifteen-love", () => {
  assertEquals(score(1, 0), "Fifteen-Love");
});

Deno.test("Level 1: thirty-fifteen", () => {
  assertEquals(score(2, 1), "Thirty-Fifteen");
});

Deno.test("Level 1: forty-fifteen", () => {
  assertEquals(score(3, 1), "Forty-Fifteen");
});

Deno.test("Level 2: love-all", () => {
  assertEquals(score(0, 0), "Love-All");
});

Deno.test("Level 2: thirty-all", () => {
  assertEquals(score(2, 2), "Thirty-All");
});

Deno.test("Level 2: deuce at 3-3", () => {
  assertEquals(score(3, 3), "Deuce");
});

Deno.test("Level 2: deuce at 4-4", () => {
  assertEquals(score(4, 4), "Deuce");
});

Deno.test("Level 3: player 1 wins clean", () => {
  assertEquals(score(4, 0), "Player 1 wins");
});

Deno.test("Level 3: player 1 wins by two", () => {
  assertEquals(score(4, 2), "Player 1 wins");
});

Deno.test("Level 3: player 2 wins", () => {
  assertEquals(score(1, 4), "Player 2 wins");
});

Deno.test("Level 4: advantage player 1", () => {
  assertEquals(score(4, 3), "Advantage Player 1");
});

Deno.test("Level 4: advantage player 2", () => {
  assertEquals(score(3, 4), "Advantage Player 2");
});

Deno.test("Level 4: advantage after extended deuce", () => {
  assertEquals(score(5, 4), "Advantage Player 1");
});

Deno.test("Level 4: back to deuce at 6-6", () => {
  assertEquals(score(6, 6), "Deuce");
});
