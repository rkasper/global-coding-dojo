export type Heading = "N" | "E" | "S" | "W";

export interface Rover {
  x: number;
  y: number;
  heading: Heading;
}

export interface Plateau {
  width: number;
  height: number;
}

const deltas: Record<Heading, {dx: number; dy: number}> = {
  N: {dx: 0, dy: 1},
  E: {dx: 1, dy: 0},
  S: {dx: 0, dy: -1},
  W: {dx: -1, dy: 0},
};

const rightOf: Record<Heading, Heading> = {N: "E", E: "S", S: "W", W: "N"};
const leftOf: Record<Heading, Heading> = {N: "W", W: "S", S: "E", E: "N"};

export function execute(rover: Rover, commands: string, plateau?: Plateau): Rover {
  let r = rover;
  for (const c of commands) r = move(r, c, plateau);
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
    return {x: nx, y: ny, heading: rover.heading};
  }
  throw new Error(`Unknown command: ${command}`);
}
