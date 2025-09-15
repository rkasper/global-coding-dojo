import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import { BowlingGame } from "./bowling.ts";

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

Deno.test(function two_consecutive_spares_game() {
  const game: BowlingGame = new BowlingGame();
  game.roll(5);
  assertEquals(game.score(), 5);
  game.roll(5);
  assertEquals(game.score(), 10);

  game.roll(5);
  assertEquals(game.score(), 20);
  game.roll(5);
  assertEquals(game.score(), 25);

  game.roll(1);
  assertEquals(game.score(), 27);

  for (let i = 0; i < 15; i++) {
    game.roll(0);
  }
  assertEquals(game.score(), 27);
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
  game.roll(10); // Frame 1, ball 1, end of frame 1
  assertEquals(game.score(), 10);

  game.roll(3); // Frame 2, ball 1
  assertEquals(game.score(), 16);
  game.roll(4); // Frame 2, ball 2, end of frame 2
  assertEquals(game.score(), 24);

  game.roll(10); // Frame 3, ball 1, end of frame 3
  assertEquals(game.score(), 34); // TODO fix test failure here. actual value is 44

  game.roll(3); // Frame 4, ball 1
  assertEquals(game.score(), 40);
  game.roll(4); // Frame 4, ball 2, end of frame 4
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
  game.roll(10); // Tenth frame is a strike
  assertEquals(game.score(), 10);

  game.roll(3); // First bonus ball
  assertEquals(game.score(), 13);
  game.roll(4); // End of bonus balls
  assertEquals(game.score(), 17);
});

Deno.test(function bonus_balls_are_strikes_game() {
  const game: BowlingGame = new BowlingGame();
  for (let i = 0; i < 18; i++) {
    game.roll(0);
  }
  game.roll(10); // Tenth frame is a strike
  assertEquals(game.score(), 10);

  game.roll(10); // First bonus ball
  assertEquals(game.score(), 20);

  game.roll(10); // End of bonus balls
  assertEquals(game.score(), 30);
});

Deno.test(function two_consecutive_strikes_game() {
  const game: BowlingGame = new BowlingGame();
  game.roll(10); // Frame 1 - frame score 24 - total score 10
  assertEquals(game.score(), 10);

  game.roll(10); // Frame 2 - frame score 17 - total score 30
  assertEquals(game.score(), 30);

  game.roll(4); // Frame 3 - frame score 7 - total score 48
  assertEquals(game.score(), 42);
  game.roll(3);
  assertEquals(game.score(), 48);
});

Deno.test(function three_consecutive_strikes_game() {
  const game: BowlingGame = new BowlingGame();
  game.roll(10); // Frame 1: Strike           X + 10 + 10 == 30
  assertEquals(game.score(), 10);

  game.roll(10); // Frame 2: Strike           X + 10 +  4 == 24
  assertEquals(game.score(), 30);

  game.roll(10); // Frame 3: Strike (turkey!) X +  4 +  3 == 17
  assertEquals(game.score(), 60);

  game.roll(4); // Frame 4: First ball        4
  assertEquals(game.score(), 72);

  game.roll(3); // Frame 4: Second ball        +  3 == 7
  assertEquals(game.score(), 78);
});

// // Perfect Game
// // All strikes (12 strikes total - 10 frames plus 2 bonus)
// // Score = 300
// Deno.test(function perfect_game() {
//   const game: BowlingGame = new BowlingGame();
//
//   // Frame 1
//   game.roll(10);
//   assertEquals(game.score(), 10);
//
//   // Frame 2
//   game.roll(10);
//   assertEquals(game.score(), 30);
//
//   // Frame 3
//   game.roll(10);
//   assertEquals(game.score(), 60);
//
//   // Frame 4
//   game.roll(10);
//   assertEquals(game.score(), 90);
//
//   // Frame 5
//   game.roll(10);
//   assertEquals(game.score(), 120);
//
//   // Frame 6
//   game.roll(10);
//   assertEquals(game.score(), 150);
//
//   // Frame 7
//   game.roll(10);
//   assertEquals(game.score(), 180);
//
//   // Frame 8
//   game.roll(10);
//   assertEquals(game.score(), 210);
//
//   // Frame 9
//   game.roll(10);
//   assertEquals(game.score(), 240);
//
//   // Frame 10 - first strike
//   game.roll(10);
//   assertEquals(game.score(), 270);
//
//   // Frame 10 - bonus ball 1
//   game.roll(10);
//   assertEquals(game.score(), 290);
//
//   // Frame 10 - bonus ball 2
//   game.roll(10);
//   assertEquals(game.score(), 300);
// });

// TODO Mixed game with spares, strikes, no-bonus rolls, gutter balls
