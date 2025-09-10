import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import { BowlingGame } from "./bowling.ts";

// Our pair programming timer: https://mobtime.hadrienmp.fr/mob/ontarioisawesome

Deno.test(function deno_tests_work_properly() {
  assert(true);
  assertEquals(6 * 7, 42);
});

Deno.test(function gutter_game() {
  const game: BowlingGame = new BowlingGame();
  for (let i = 0; i < 20; i++) {
    game.roll(0);
  }
  assertEquals(game.score(), 0);
});

Deno.test(function all_ones_game() {
  const game: BowlingGame = new BowlingGame();
  for (let i = 0; i < 20; i++) {
    game.roll(1);
  }
  assertEquals(game.score(), 20);
});

Deno.test(function all_fours_game() {
  const game: BowlingGame = new BowlingGame();
  for (let i = 0; i < 20; i++) {
    game.roll(4);
  }
  assertEquals(game.score(), 80);
});

Deno.test(function one_spare_game() {
  const game: BowlingGame = new BowlingGame();
  game.roll(5);
  game.roll(5);

  game.roll(3);
  for (let i = 0; i < 17; i++) {
    game.roll(0);
  }
  assertEquals(game.score(), 16);
});

Deno.test(function two_spare_game() {
  const game: BowlingGame = new BowlingGame();
  game.roll(5);
  game.roll(5);

  game.roll(3);
  assertEquals(game.score(), 16);
  game.roll(3);
  assertEquals(game.score(), 19);

  game.roll(5);
  game.roll(5);

  game.roll(1);
  assertEquals(game.score(), 31);

  for (let i = 0; i < 13; i++) {
    game.roll(0);
  }
  assertEquals(game.score(), 31);
});

// One Strike
// First roll: 10 pins (strike)
// Next two rolls: 3 and 4
// All other rolls: 0 pins
// Score = 10 + 3 + 4 + 3 + 4 = 24
Deno.test(function one_strike_game() {
  const game: BowlingGame = new BowlingGame();
  game.roll(10); // End of first frame

  game.roll(3);
  game.roll(4); // End of second frame
  assertEquals(game.score(), 24);

  for (let i = 0; i < 16; i++) {
    game.roll(0);
  }
  assertEquals(game.score(), 24);
});

Deno.test(function two_strike_game() {
  const game: BowlingGame = new BowlingGame();
  game.roll(10); // End of first frame

  game.roll(3);
  game.roll(4); // End of second frame
  assertEquals(game.score(), 24);

  game.roll(10); // End of third frame

  game.roll(3);
  game.roll(4); // End of fourth frame
  assertEquals(game.score(), 48);

  for (let i = 0; i < 12; i++) {
    game.roll(0);
  }
  assertEquals(game.score(), 48);
});

Deno.test(function last_frame_is_a_strike_game() {
  const game: BowlingGame = new BowlingGame();
  for (let i = 0; i < 18; i++) {
    game.roll(0);
  }
  game.roll(10); // End of tenth frame

  game.roll(3);
  game.roll(4); // End of bonus balls
  assertEquals(game.score(), 24);
});

// TODO
// // Perfect Game
// // All strikes (12 strikes total - 10 frames plus 2 bonus)
// // Score = 300
// Deno.test(function all_strikes_game() {
//   const game: BowlingGame = new BowlingGame();
//   for (let i = 0; i < 12; i++) {
//     game.roll(10);
//   }
//   assertEquals(game.score(), 300);
// });
