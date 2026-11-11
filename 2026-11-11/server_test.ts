import {assertEquals} from "@std/assert";
import {handler} from "./server.ts";

// The handler is tested directly, so no server and no permissions are needed.

function count(text: string) {
  return handler(new Request("http://localhost/api/count", {method: "POST", body: text}));
}

Deno.test(async function count_dot_votes() {
  const res = await count("- a game XX\n- sudoku X");
  assertEquals(res.status, 200);
  assertEquals(await res.json(), {
    kind: "dot",
    ranking: [{idea: "a game", votes: 2}, {idea: "sudoku", votes: 1}],
    winners: ["a game"],
    votes: 2,
  });
});

Deno.test(async function count_ranked_ballots() {
  const res = await count("Alex: A > B\nBea: B\nCy: C > A");
  assertEquals(await res.json(), {
    kind: "ranked",
    ballots: 3,
    rounds: [{A: 1, B: 1, C: 1}],
    winner: null, // three-way tie for last: all dropped (the group hasn't picked a tie rule yet)
  });
});

Deno.test(async function count_ranked_ballots_with_a_winner() {
  const res = await count("Alex: A > B\nBea: B\nCy: A");
  assertEquals(await res.json(), {
    kind: "ranked",
    ballots: 3,
    rounds: [{A: 2, B: 1}],
    winner: "A",
  });
});

Deno.test(async function count_nothing_reports_empty() {
  const res = await count("just some text");
  assertEquals(await res.json(), {kind: "empty"});
});

Deno.test(async function unknown_path_is_404() {
  const res = await handler(new Request("http://localhost/nope"));
  assertEquals(res.status, 404);
  await res.body?.cancel();
});
