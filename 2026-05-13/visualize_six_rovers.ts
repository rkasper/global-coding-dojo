import {execute, type Heading, type Rover} from "./mars_rover.ts";

const W = 10;
const H = 10;

const mission: { rover: Rover; commands: string }[] = [
  {rover: {x: 3, y: 3, heading: "N"}, commands: "MM"},
  {rover: {x: 3, y: 0, heading: "N"}, commands: "MMMMMMM"},
  {rover: {x: 9, y: 9, heading: "S"}, commands: "MMMMMM"},
  {rover: {x: 0, y: 0, heading: "E"}, commands: "MMMMMRMM"},
  {rover: {x: 7, y: 7, heading: "W"}, commands: "MMMM"},
  {rover: {x: 0, y: 5, heading: "E"}, commands: "MMM"},
];

const arrow: Record<Heading, string> = {N: "^", E: ">", S: "v", W: "<"};

const CLEAR = "\x1b[2J\x1b[H";
const HOME = "\x1b[H";
const ERASE_DOWN = "\x1b[J";
const HIDE = "\x1b[?25l";
const SHOW = "\x1b[?25h";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";

const enc = new TextEncoder();
const write = (s: string) => Deno.stdout.write(enc.encode(s));
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function render(parked: Rover[], active: Rover | null, label: string): string {
  const lines: string[] = [];
  lines.push(BOLD + label.padEnd(60) + RESET);
  lines.push("");
  for (let y = H; y >= 0; y--) {
    let row = DIM + y.toString().padStart(2) + RESET + " ";
    for (let x = 0; x <= W; x++) {
      const p = parked.find((r) => r.x === x && r.y === y);
      const isActive = active && active.x === x && active.y === y;
      let cell: string;
      if (isActive) {
        const color = active!.blocked ? RED : GREEN;
        cell = color + BOLD + arrow[active!.heading] + RESET;
      } else if (p) {
        cell = arrow[p.heading];
      } else {
        cell = DIM + "." + RESET;
      }
      row += " " + cell;
    }
    lines.push(row);
  }
  let axis = "   ";
  for (let x = 0; x <= W; x++) axis += " " + DIM + (x % 10) + RESET;
  lines.push(axis);
  return lines.join("\n") + "\n";
}

const frameDelay = Number(Deno.args[0] ?? 250);

await write(CLEAR + HIDE);

try {
  const parked: Rover[] = [];
  const obstacles: {x: number; y: number}[] = [];

  for (let m = 0; m < mission.length; m++) {
    let r: Rover = mission[m].rover;
    await write(HOME + ERASE_DOWN + render(parked, r, `Rover ${m + 1} starting at (${r.x},${r.y},${r.heading})`));
    await sleep(frameDelay * 2);

    for (let i = 0; i < mission[m].commands.length; i++) {
      const c = mission[m].commands[i];
      r = execute(r, c, {width: W, height: H, obstacles});
      const note = r.blocked ? " [BLOCKED]" : "";
      const label = `Rover ${m + 1}, step ${i + 1}/${mission[m].commands.length}: ${c}${note}`;
      await write(HOME + ERASE_DOWN + render(parked, r, label));
      await sleep(frameDelay);
      if (r.blocked) break;
    }

    parked.push(r);
    obstacles.push({x: r.x, y: r.y});
    await write(HOME + ERASE_DOWN + render(parked, null, `Rover ${m + 1} parked at (${r.x},${r.y},${r.heading})`));
    await sleep(frameDelay * 2);
  }

  await write(HOME + ERASE_DOWN + render(parked, null, "Mission complete! All 6 rovers parked."));
} finally {
  await write(SHOW);
}
