import {assert, assertEquals, assertThrows} from "https://deno.land/std@0.224.0/assert/mod.ts";
import {execute, move, runMission, type Rover} from "./mars_rover.ts";

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
    r = move(r, "R"); assertEquals(r.x, 0);
    r = move(r, "R"); assertEquals(r.y, 0);
  });

  await t.step("L cycles N → W → S → E → N", () => {
    let r: Rover = {x: 0, y: 0, heading: "N"};
    r = move(r, "L"); assertEquals(r.heading, "W");
    r = move(r, "L"); assertEquals(r.heading, "S");
    r = move(r, "L"); assertEquals(r.heading, "E");
    r = move(r, "L"); assertEquals(r.heading, "N");
    r = move(r, "L"); assertEquals(r.x, 0);
    r = move(r, "L"); assertEquals(r.y, 0);
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

Deno.test("Level 3 - Bounded Plateau", async (t) => {
  const plateau = {width: 5, height: 5};

  await t.step("M at north edge is ignored", () => {
    assertEquals(execute({x: 0, y: 5, heading: "N"}, "M", plateau), {x: 0, y: 5, heading: "N"});
  });

  await t.step("M at south edge is ignored", () => {
    assertEquals(execute({x: 0, y: 0, heading: "S"}, "M", plateau), {x: 0, y: 0, heading: "S"});
  });

  await t.step("M at east edge is ignored", () => {
    assertEquals(execute({x: 5, y: 0, heading: "E"}, "M", plateau), {x: 5, y: 0, heading: "E"});
  });

  await t.step("M at west edge is ignored", () => {
    assertEquals(execute({x: 0, y: 0, heading: "W"}, "M", plateau), {x: 0, y: 0, heading: "W"});
  });

  await t.step("rotation is not blocked at the edge", () => {
    assertEquals(execute({x: 0, y: 5, heading: "N"}, "R", plateau), {x: 0, y: 5, heading: "E"});
  });

  await t.step("commands after a blocked move still execute", () => {
    // M blocked at north edge, R turns to E, M now moves east legally
    assertEquals(execute({x: 0, y: 5, heading: "N"}, "MRM", plateau), {x: 1, y: 5, heading: "E"});
  });

  await t.step("no plateau means no bounds", () => {
    assertEquals(execute({x: 0, y: 100, heading: "N"}, "M"), {x: 0, y: 101, heading: "N"});
  });
});

Deno.test("Level 4 - Obstacles", async (t) => {
  await t.step("M toward an obstacle stops the rover and sets blocked", () => {
    const plateau = {width: 5, height: 5, obstacles: [{x: 0, y: 1}]};
    assertEquals(execute({x: 0, y: 0, heading: "N"}, "M", plateau), {x: 0, y: 0, heading: "N", blocked: true});
  });

  await t.step("MMM with obstacle 2 squares ahead moves once then stops blocked", () => {
    const plateau = {width: 5, height: 5, obstacles: [{x: 1, y: 2}]};
    assertEquals(execute({x: 1, y: 0, heading: "N"}, "MMM", plateau), {x: 1, y: 1, heading: "N", blocked: true});
  });

  await t.step("rotation is not blocked by an obstacle ahead", () => {
    const plateau = {width: 5, height: 5, obstacles: [{x: 0, y: 1}]};
    assertEquals(execute({x: 0, y: 0, heading: "N"}, "R", plateau), {x: 0, y: 0, heading: "E"});
  });

  await t.step("execute stops after a blocked move", () => {
    // Obstacle directly north blocks the first M; R and the second M are not executed
    const plateau = {width: 5, height: 5, obstacles: [{x: 0, y: 1}]};
    assertEquals(execute({x: 0, y: 0, heading: "N"}, "MRM", plateau), {x: 0, y: 0, heading: "N", blocked: true});
  });

  await t.step("obstacle on the side does not block forward movement", () => {
    const plateau = {width: 5, height: 5, obstacles: [{x: 1, y: 0}]};
    assertEquals(execute({x: 0, y: 0, heading: "N"}, "M", plateau), {x: 0, y: 1, heading: "N"});
  });

  await t.step("empty obstacles list behaves like a plain plateau", () => {
    const plateau = {width: 5, height: 5, obstacles: []};
    assertEquals(execute({x: 0, y: 0, heading: "N"}, "M", plateau), {x: 0, y: 1, heading: "N"});
  });

  await t.step("successful M does not set blocked", () => {
    const plateau = {width: 5, height: 5, obstacles: [{x: 4, y: 4}]};
    const result = execute({x: 0, y: 0, heading: "N"}, "M", plateau);
    assertEquals(result.blocked, undefined);
  });

  await t.step("edge-blocked M does not set blocked (only obstacles do)", () => {
    const plateau = {width: 5, height: 5};
    const result = execute({x: 0, y: 5, heading: "N"}, "M", plateau);
    assertEquals(result.blocked, undefined);
  });

  await t.step("rotation near an obstacle does not set blocked", () => {
    const plateau = {width: 5, height: 5, obstacles: [{x: 0, y: 1}]};
    const result = execute({x: 0, y: 0, heading: "N"}, "R", plateau);
    assertEquals(result.blocked, undefined);
  });
});

Deno.test("Level 5 - Mission Control", async (t) => {
  await t.step("mission with only a plateau and no rovers returns empty output", () => {
    assertEquals(runMission("5 5"), "");
  });

  await t.step("one rover with no commands returns its starting position", () => {
    const input = ["5 5", "1 2 N", ""].join("\n");
    assertEquals(runMission(input), "1 2 N");
  });

  await t.step("one rover with commands returns its final position", () => {
    const input = ["5 5", "1 2 N", "LMLMLMLMM"].join("\n");
    assertEquals(runMission(input), "1 3 N");
  });

  await t.step("canonical two-rover mission from the README", () => {
    const input = [
      "5 5",
      "1 2 N",
      "LMLMLMLMM",
      "3 3 E",
      "MMRMMRMRRM",
    ].join("\n");
    const expected = ["1 3 N", "5 1 E"].join("\n");
    assertEquals(runMission(input), expected);
  });

  await t.step("parked rover blocks the next rover's path", () => {
    // Rover 1 parks at (1,1,N). Rover 2 tries to move from (1,0,N) into (1,1) and is blocked.
    const input = [
      "5 5",
      "1 1 N",
      "",
      "1 0 N",
      "M",
    ].join("\n");
    const expected = ["1 1 N", "1 0 N"].join("\n");
    assertEquals(runMission(input), expected);
  });

  await t.step("six-rover mission on a 10x10 plateau with two collisions", () => {
    // R1 parks at (3,5). R2 from (3,0) heading N walks straight into it -> blocked at (3,4).
    // R3 cruises down the east side. R4 walks east then hits the south edge harmlessly.
    // R5 cruises west across the middle. R6 from (0,5) heading E walks into R1 -> blocked at (2,5).
    const input = [
      "10 10",
      "3 3 N", "MM",
      "3 0 N", "MMMMMMM",
      "9 9 S", "MMMMMM",
      "0 0 E", "MMMMMRMM",
      "7 7 W", "MMMM",
      "0 5 E", "MMM",
    ].join("\n");
    const expected = [
      "3 5 N",
      "3 4 N",
      "9 3 S",
      "5 0 S",
      "3 7 W",
      "2 5 E",
    ].join("\n");
    assertEquals(runMission(input), expected);
  });
});