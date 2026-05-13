# Mars Rover Kata

Pilot a rover across the surface of Mars. Parse commands, track position and heading, and avoid driving off cliffs or into rocks. Build it up step by step using TDD.

The rover understands three commands:

- `L` — turn left 90° in place
- `R` — turn right 90° in place
- `M` — move forward one square in the direction it's facing

Headings are `N`, `E`, `S`, `W`. The plateau uses standard `(x, y)` coordinates with `(0, 0)` at the bottom-left.

---

## Level 1 — One Command at a Time

Implement a function that takes a rover state and a single command, and returns the new state.

```typescript
move({ x: 0, y: 0, heading: "N" }, "M")  // { x: 0, y: 1, heading: "N" }
move({ x: 0, y: 0, heading: "N" }, "R")  // { x: 0, y: 0, heading: "E" }
move({ x: 0, y: 0, heading: "N" }, "L")  // { x: 0, y: 0, heading: "W" }
```

### Rules

- `M` moves +1 in `y` facing N, +1 in `x` facing E, -1 in `y` facing S, -1 in `x` facing W
- `L` and `R` rotate 90° without changing position
- Unknown commands throw

---

## Level 2 — Command Strings

Accept a string of commands and apply them in order.

```typescript
execute({ x: 0, y: 0, heading: "N" }, "LMLMLMLMM")
// { x: 0, y: 1, heading: "N" }
```

### Rules

- Empty string returns the rover unchanged
- Commands run left to right

---

## Level 3 — Bounded Plateau

The plateau has a finite size, given by its top-right corner. If a `M` command would push the rover off the plateau, the rover ignores that command and stays put.

```typescript
const plateau = { width: 5, height: 5 };
execute({ x: 0, y: 5, heading: "N" }, "M", plateau)
// stays at (0, 5)
```

### Rules

- The rover never reports an out-of-bounds position
- Subsequent commands continue to be processed normally
- Rotation (`L`/`R`) is never blocked by the edge

---

## Level 4 — Obstacles

The plateau can contain rocks. If a `M` command would land the rover on a rock, it stops before that square and reports that it's blocked.

```typescript
const plateau = { width: 5, height: 5, obstacles: [{ x: 1, y: 2 }] };
execute({ x: 1, y: 0, heading: "N" }, "MMM", plateau)
// { x: 1, y: 1, heading: "N", blocked: true }
```

### Rules

- After a block, remaining commands in the string are not executed
- `L` and `R` are never blocked

---

## Level 5 — Mission Control (Multi-Rover Input)

Parse the classic Mars Rover input format and output the final position of each rover, one per line:

**Input**
```
5 5
1 2 N
LMLMLMLMM
3 3 E
MMRMMRMRRM
```

**Output**
```
1 3 N
5 1 E
```

### Rules

- The first line is the plateau's top-right corner
- Each rover gets two lines: starting position+heading, then commands
- Rovers move sequentially — each finishes its commands before the next starts
- (Optional) Treat parked rovers as obstacles for subsequent rovers

---

## Level 6 — Extensions (Choose Your Own Adventure!)

Pick one or more:

- **Wrap-around world**: instead of stopping at edges, wrap to the opposite side (Mars is round, after all)
- **Backwards move (`B`)**: one square in the opposite direction the rover is facing
- **Fuel budget**: each `M` costs 1 fuel; the rover stops when fuel runs out
- **Replay log**: return every intermediate position so you can visualize the path
- **Lost rover**: when a rover would drive off the edge it falls instead, and leaves a "scent" that prevents future rovers from doing the same (the British Mars Rover variant)

---

## Tips for TDD

1. Start with a rover at `(0, 0, N)` and a single `M` command
2. Add headings one at a time — don't try to handle all four at once
3. Get rotation right with simple `L`/`R` cases before combining with movement
4. Keep state in a plain data shape (`{ x, y, heading }`) — resist a class until you actually need one
5. Test the round-trip: `LLLL` and `RRRR` should leave heading unchanged

## Commands

```bash
deno test
deno test --watch
```

---

## For the Facilitator

- **Rotation**: 5-7 minutes per person
- **Suggested starting level**: Level 1
- **Realistic goal for 2 hours**: Levels 1-3, maybe into 4
- **If you finish early**: Level 5 (the parser) or pick from Level 6