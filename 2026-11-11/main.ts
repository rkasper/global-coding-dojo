// Dot Vote CLI: count the votes in a Markdown file.
//
//   deno task vote sample-votes.md    dot votes ("- idea XXX")
//   deno task vote ranked-votes.md    ranked ballots ("Name: 1st > 2nd")
//
// The format is detected from the file: any ballot lines → ranked choice.

import {instantRunoff, parseBallots, parseDotVotes, ranking, winner} from "./vote.ts";

const file = Deno.args[0];
if (!file) {
  console.error("Usage: deno task vote <vote-file.md>");
  Deno.exit(1);
}

let text: string;
try {
  text = await Deno.readTextFile(file);
} catch {
  console.error(`Can't read ${file}`);
  Deno.exit(1);
}

const ballots = parseBallots(text);
if (ballots.length > 0) {
  showRankedChoice(ballots);
} else {
  showDotVotes(text);
}

function showDotVotes(text: string) {
  const ideas = parseDotVotes(text);
  if (ideas.length === 0) {
    console.log(`No ideas or ballots found in ${file}.`);
    console.log(`Ideas are lines like "- my idea XX", ballots like "Name: A > B".`);
    return;
  }

  console.log(`Dot votes in ${file}:\n`);
  for (const {idea, votes} of ranking(ideas)) console.log(bar(votes, idea));

  const result = winner(ideas);
  console.log();
  if (result.winners.length === 0) {
    console.log("No winner: nobody voted.");
  } else if (result.winners.length === 1) {
    console.log(`🏆 Winner (${result.votes} votes): ${result.winners[0]}`);
  } else {
    console.log(`🤝 Tie at ${result.votes} votes: ${result.winners.join(" | ")}`);
  }
}

function showRankedChoice(ballots: string[][]) {
  console.log(`Ranked-choice vote in ${file}: ${ballots.length} ballots\n`);
  const result = instantRunoff(ballots);
  result.rounds.forEach((round, i) => {
    console.log(`Round ${i + 1}:`);
    const sorted = Object.entries(round).sort((a, b) => b[1] - a[1]);
    for (const [idea, votes] of sorted) console.log(bar(votes, idea));
    console.log();
  });
  console.log(result.winner ? `🏆 Winner: ${result.winner}` : "No winner.");
}

function bar(votes: number, idea: string) {
  return `${String(votes).padStart(3)}  ${"█".repeat(votes).padEnd(10)} ${idea}`;
}
