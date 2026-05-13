import {assert, assertEquals, assertThrows} from "https://deno.land/std@0.224.0/assert/mod.ts";
import {execute, move, type Rover} from "./mars_rover.ts";

Deno.test(function deno_tests_work_properly() {
  assert(true);
  assertEquals(6 * 7, 42);
});

Deno.test("Level 1 - One Command at a Time", async (t) => {
  await t.step("M from (0,0,N) moves to (0,1,N)", () => {
    assertEquals(move({x: 0, y: 0, heading: "N"}, "M"), {x: 0, y: 1, heading: "N"});
  });

  await t.step("M from (0,0,E) moves to (1,0,E)", () => {
    assertEquals(move({x: 0, y: 0, heading: "E"}, "M"), {x: 1, y: 0, heading: "E"});
  });

  await t.step("M from (2,2,S) moves to (2,1,S)", () => {
    assertEquals(move({x: 2, y: 2, heading: "S"}, "M"), {x: 2, y: 1, heading: "S"});
  });

  await t.step("M from (2,2,W) moves to (1,2,W)", () => {
    assertEquals(move({x: 2, y: 2, heading: "W"}, "M"), {x: 1, y: 2, heading: "W"});
  });

  await t.step("R from (0,0,N) turns to (0,0,E)", () => {
    assertEquals(move({x: 0, y: 0, heading: "N"}, "R"), {x: 0, y: 0, heading: "E"});
  });

  await t.step("R cycles N → E → S → W → N", () => {
    let r: Rover = {x: 0, y: 0, heading: "N"};
    r = move(r, "R"); assertEquals(r.heading, "E");
    r = move(r, "R"); assertEquals(r.heading, "S");
    r = move(r, "R"); assertEquals(r.heading, "W");
    r = move(r, "R"); assertEquals(r.heading, "N");
  });

  await t.step("L cycles N → W → S → E → N", () => {
    let r: Rover = {x: 0, y: 0, heading: "N"};
    r = move(r, "L"); assertEquals(r.heading, "W");
    r = move(r, "L"); assertEquals(r.heading, "S");
    r = move(r, "L"); assertEquals(r.heading, "E");
    r = move(r, "L"); assertEquals(r.heading, "N");
  });

  await t.step("unknown command throws", () => {
    assertThrows(() => move({x: 0, y: 0, heading: "N"}, "X"));
  });
});

Deno.test("Level 2 - Command Strings", async (t) => {
  await t.step("empty string returns the rover unchanged", () => {
    const r: Rover = {x: 2, y: 3, heading: "E"};
    assertEquals(execute(r, ""), r);
  });

  await t.step("single M moves the rover one square forward", () => {
    assertEquals(execute({x: 0, y: 0, heading: "N"}, "M"), {x: 0, y: 1, heading: "N"});
  });

  await t.step("LMLMLMLMM from (0,0,N) ends at (0,1,N)", () => {
    assertEquals(execute({x: 0, y: 0, heading: "N"}, "LMLMLMLMM"), {x: 0, y: 1, heading: "N"});
  });

  await t.step("commands run left to right (MR is not the same as RM)", () => {
    const start: Rover = {x: 0, y: 0, heading: "N"};
    assertEquals(execute(start, "MR"), {x: 0, y: 1, heading: "E"});
    assertEquals(execute(start, "RM"), {x: 1, y: 0, heading: "E"});
  });
});