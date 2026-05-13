export type Heading = "N" | "E" | "S" | "W";

export interface Rover {
  x: number;
  y: number;
  heading: Heading;
  // Set only when an obstacle blocks an M; absence === not blocked.
  // Always check via truthiness (`if (r.blocked)`), not `=== false`.
  blocked?: true;
}

export interface Plateau {
  width: number;
  height: number;
  obstacles?: {x: number; y: number}[];
}

const deltas: Record<Heading, {dx: number; dy: number}> = {
  N: {dx: 0, dy: 1},
  E: {dx: 1, dy: 0},
  S: {dx: 0, dy: -1},
  W: {dx: -1, dy: 0},
};

const rightOf: Record<Heading, Heading> = {N: "E", E: "S", S: "W", W: "N"};
const leftOf: Record<Heading, Heading> = {N: "W", W: "S", S: "E", E: "N"};

export function runMission(input: string): string {
  const lines = input.split("\n");
  const [width, height] = lines[0].split(" ").map(Number);
  const obstacles: {x: number; y: number}[] = [];

  const outputs: string[] = [];
  for (let i = 1; i + 1 < lines.length; i += 2) {
    const [x, y, heading] = lines[i].split(" ");
    const start: Rover = {x: Number(x), y: Number(y), heading: heading as Heading};
    const commands = lines[i + 1];
    const end = execute(start, commands, {width, height, obstacles});
    outputs.push(`${end.x} ${end.y} ${end.heading}`);
    obstacles.push({x: end.x, y: end.y});
  }
  return outputs.join("\n");
}

export function execute(rover: Rover, commands: string, plateau?: Plateau): Rover {
  let r = rover;
  for (const c of commands) {
    r = move(r, c, plateau);
    if (r.blocked) break;
  }
  return r;
}

export function move(rover: Rover, command: string, plateau?: Plateau): Rover {
  if (command === "R") return {...rover, heading: rightOf[rover.heading]};
  if (command === "L") return {...rover, heading: leftOf[rover.heading]};
  if (command === "M") {
    const {dx, dy} = deltas[rover.heading];
    const nx = rover.x + dx;
    const ny = rover.y + dy;
    if (plateau && (nx < 0 || ny < 0 || nx > plateau.width || ny > plateau.height)) {
      return rover;
    }
    if (plateau?.obstacles?.some(o => o.x === nx && o.y === ny)) {
      return {...rover, blocked: true};
    }
    return {x: nx, y: ny, heading: rover.heading};
  }
  throw new Error(`Unknown command: ${command}`);
}
