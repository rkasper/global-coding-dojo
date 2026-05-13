export type Heading = "N" | "E" | "S" | "W";

export interface Rover {
  x: number;
  y: number;
  heading: Heading;
}

const deltas: Record<Heading, {dx: number; dy: number}> = {
  N: {dx: 0, dy: 1},
  E: {dx: 1, dy: 0},
  S: {dx: 0, dy: -1},
  W: {dx: -1, dy: 0},
};

const rightOf: Record<Heading, Heading> = {N: "E", E: "S", S: "W", W: "N"};
const leftOf: Record<Heading, Heading> = {N: "W", W: "S", S: "E", E: "N"};

export function move(rover: Rover, command: string): Rover {
  if (command === "R") return {...rover, heading: rightOf[rover.heading]};
  if (command === "L") return {...rover, heading: leftOf[rover.heading]};
  if (command === "M") {
    const {dx, dy} = deltas[rover.heading];
    return {x: rover.x + dx, y: rover.y + dy, heading: rover.heading};
  }
  throw new Error(`Unknown command: ${command}`);
}
