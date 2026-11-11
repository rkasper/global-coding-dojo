export type IdeaVotes = { idea: string; votes: number };

const VOTE_TOKEN = /^x+$/i;

export function parseDotVotes(text: string): IdeaVotes[] {
  return text
    .split("\n")
    .filter((line) => line.startsWith("- "))
    .map(parseIdeaLine);
}

function parseIdeaLine(line: string): IdeaVotes {
  const tokens = line.slice(2).trim().split(/\s+/).filter((t) => t !== "");
  let votes = 0;
  while (tokens.length > 0 && VOTE_TOKEN.test(tokens[tokens.length - 1])) {
    votes += tokens.pop()!.length;
  }
  return { idea: tokens.join(" "), votes };
}

export type Winner = { winners: string[]; votes: number };

export function winner(ideas: IdeaVotes[]): Winner {
  const votes = Math.max(0, ...ideas.map((i) => i.votes));
  if (votes === 0) return { winners: [], votes: 0 };
  const winners = ideas.filter((i) => i.votes === votes).map((i) => i.idea);
  return { winners, votes };
}

// Sort a copy (input untouched). Array sort is stable, so ties keep their order.
export function ranking(ideas: IdeaVotes[]): IdeaVotes[] {
  return [...ideas].sort((a, b) => b.votes - a.votes);
}

export type Ballot = string[];
export type Runoff = { winner: string | null; rounds: Record<string, number>[] };

export function instantRunoff(ballots: Ballot[]): Runoff {
  const inRace = new Set(ballots.flat());
  const rounds: Record<string, number>[] = [];

  while (inRace.size > 0) {
    const { counts, activeBallots } = countRound(ballots, inRace);
    rounds.push(counts);

    const leader = Object.keys(counts).find((idea) => counts[idea] > activeBallots / 2);
    if (leader) return { winner: leader, rounds };

    // Not yet decided by the group: when ideas tie for last, this drops all of them.
    const fewest = Math.min(...Object.values(counts));
    for (const idea of inRace) {
      if (counts[idea] === fewest) inRace.delete(idea);
    }
  }
  return { winner: null, rounds };
}

function countRound(ballots: Ballot[], inRace: Set<string>) {
  const counts: Record<string, number> = {};
  for (const idea of inRace) counts[idea] = 0;

  let activeBallots = 0;
  for (const ballot of ballots) {
    const choice = ballot.find((idea) => inRace.has(idea));
    if (choice === undefined) continue; // exhausted ballot
    counts[choice]++;
    activeBallots++;
  }
  return { counts, activeBallots };
}

// A ballot line is "Name: 1st > 2nd > ...". The name is one word, so idea
// lines ("- ...") and ordinary sentences don't count as ballots.
const BALLOT_LINE = /^(\S+):\s+(.+)$/;

export function parseBallots(text: string): Ballot[] {
  return text
    .split("\n")
    .map((line) => line.trim().match(BALLOT_LINE))
    .filter((match) => match !== null && !match[1].startsWith("-"))
    .map((match) => match![2].split(">").map((choice) => choice.trim()).filter((c) => c !== ""));
}

// Counts a whole vote file: ranked ballots if it has any, otherwise dot votes.
export function countVotes(text: string) {
  const ballots = parseBallots(text);
  if (ballots.length > 0) {
    const {winner, rounds} = instantRunoff(ballots);
    return {kind: "ranked", ballots: ballots.length, rounds, winner};
  }
  const ideas = parseDotVotes(text);
  if (ideas.length === 0) return {kind: "empty"};
  return {kind: "dot", ranking: ranking(ideas), ...winner(ideas)};
}
