import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import { BowlingGame } from "./bowling.ts";

function rollMany(game: BowlingGame, n: number, pins: number): void {
  for (let i = 0; i < n; i++) {
    game.roll(pins);
  }
}

Deno.test(function deno_tests_work_properly() {
  assert(true);
  assertEquals(6 * 7, 42);
});

Deno.test(function gutter_game() {
  const game: BowlingGame = new BowlingGame();
  rollMany(game, 20, 0);
  assertEquals(game.score(), 0);
});

Deno.test(function all_ones_game() {
  const game: BowlingGame = new BowlingGame();
  rollMany(game, 20, 1);
  assertEquals(game.score(), 20);
});

Deno.test(function all_fours_game() {
  const game: BowlingGame = new BowlingGame();
  rollMany(game, 20, 4);
  assertEquals(game.score(), 80);
});

Deno.test(function one_spare_game() {
  const game: BowlingGame = new BowlingGame();
  game.roll(5);
  game.roll(5);

  game.roll(3);
  rollMany(game, 17, 0);
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

  rollMany(game, 13, 0);
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

  rollMany(game, 15, 0);
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

  rollMany(game, 16, 0);
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

  rollMany(game, 12, 0);
  assertEquals(game.score(), 48);
});

Deno.test(function last_frame_is_a_strike_game() {
  const game: BowlingGame = new BowlingGame();
  rollMany(game, 18, 0);
  game.roll(10); // Tenth frame is a strike
  assertEquals(game.score(), 10);

  game.roll(3); // First bonus ball
  assertEquals(game.score(), 13);
  game.roll(4); // End of bonus balls
  assertEquals(game.score(), 17);
});

Deno.test(function bonus_balls_are_strikes_game() {
  const game: BowlingGame = new BowlingGame();
  rollMany(game, 18, 0);
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

// Perfect Game
// All strikes (12 strikes total - 10 frames plus 2 bonus)
// Score = 300
Deno.test(function perfect_game() {
  const game: BowlingGame = new BowlingGame();

  // Frames 1-9: each completed frame of strikes scores 30 (X + 10 + 10)
  const expectedScores = [10, 30, 60, 90, 120, 150, 180, 210, 240];
  for (let i = 0; i < 9; i++) {
    game.roll(10);
    assertEquals(game.score(), expectedScores[i]);
  }

  // Frame 10 - first strike + 2 bonus balls
  game.roll(10);
  assertEquals(game.score(), 270);

  game.roll(10);
  assertEquals(game.score(), 290);

  game.roll(10);
  assertEquals(game.score(), 300);
});

Deno.test(function mixed_game() {
  const game: BowlingGame = new BowlingGame();

  // Frame 1: Strike (X)
  game.roll(10);
  assertEquals(game.score(), 10);

  // Frame 2: Spare (7, /)
  game.roll(7);
  game.roll(3);
  assertEquals(game.score(), 30);

  // Frame 3: Regular (5, 3)
  game.roll(5);
  game.roll(3);
  assertEquals(game.score(), 43);

  // Frame 4: Gutter balls (0, 0)
  game.roll(0);
  game.roll(0);
  assertEquals(game.score(), 43);

  // Frame 5: Strike (X) + 10 + 4
  game.roll(10);
  assertEquals(game.score(), 53);

  // Frame 6: Strike (X) + 4
  game.roll(10);
  assertEquals(game.score(), 73);

  // Frame 7: Regular (4, 2)
  game.roll(4);
  game.roll(2);
  assertEquals(game.score(), 89);

  // Frame 8: Spare (8, /)
  game.roll(8);
  // assertEquals(game.score(), 99);
  game.roll(2);
  assertEquals(game.score(), 99);

  // Frame 9: Regular (6, 3)
  game.roll(6);
  game.roll(3);
  assertEquals(game.score(), 114);

  // Frame 10: Strike with bonus balls
  game.roll(10);
  game.roll(7);
  game.roll(3);
  assertEquals(game.score(), 134);
});
