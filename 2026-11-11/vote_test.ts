import {assertEquals} from "@std/assert";
import {
  instantRunoff,
  parseBallots,
  parseDotVotes,
  ranking,
  winner,
} from "./vote.ts";

// Level 1 — Count the X's

Deno.test(function empty_input_has_no_ideas() {
  assertEquals(parseDotVotes(""), []);
});

Deno.test(function one_idea_with_one_vote() {
  assertEquals(parseDotVotes("- a game X"), [{idea: "a game", votes: 1}]);
});

Deno.test(function idea_without_votes_still_counts_as_an_idea() {
  assertEquals(parseDotVotes("- a game"), [{idea: "a game", votes: 0}]);
});

Deno.test(function lines_not_starting_with_dash_space_are_ignored() {
  const input = `Kata ideas
Hi its John
-not an idea X
- a game X`;
  assertEquals(parseDotVotes(input), [{idea: "a game", votes: 1}]);
});

Deno.test(function space_separated_votes_are_each_counted() {
  assertEquals(parseDotVotes("- a game X X x X"), [{idea: "a game", votes: 4}]);
});

Deno.test(function each_letter_in_a_run_of_xs_is_a_vote() {
  assertEquals(parseDotVotes("- autonomous agents tool XXx"), [
    {idea: "autonomous agents tool", votes: 3},
  ]);
});

Deno.test(function lowercase_and_uppercase_x_both_count() {
  assertEquals(parseDotVotes("- a game xX"), [{idea: "a game", votes: 2}]);
});

Deno.test(function extra_whitespace_is_trimmed_from_the_idea() {
  assertEquals(parseDotVotes("-   logic game, e.g. sudoku   X   "), [
    {idea: "logic game, e.g. sudoku", votes: 1},
  ]);
});

Deno.test(function x_inside_words_is_not_a_vote() {
  assertEquals(parseDotVotes("- VSCode extension, e.g. for voting"), [
    {idea: "VSCode extension, e.g. for voting", votes: 0},
  ]);
});

Deno.test(function x_at_the_end_of_a_word_is_not_a_vote() {
  assertEquals(parseDotVotes("- a big box"), [{idea: "a big box", votes: 0}]);
});

Deno.test(function x_tokens_in_the_middle_of_the_idea_are_not_votes() {
  assertEquals(parseDotVotes("- tic tac toe x vs o XX"), [
    {idea: "tic tac toe x vs o", votes: 2},
  ]);
});

Deno.test(function multiple_ideas_keep_their_original_order() {
  const input = `- a game X
- sudoku XX`;
  assertEquals(parseDotVotes(input), [
    {idea: "a game", votes: 1},
    {idea: "sudoku", votes: 2},
  ]);
});

Deno.test(function todays_real_idea_list() {
  const readme = `
## Kata ideas

- a game X X x X
- logic game, e.g. sudoku   X
- autonomous agents tool XXx
- VSCode extension to vote on ideas - dot voting, ranked choice, etc. - share ideas and vote on them - first step, it's an app outside of VScode   XXxxx
`;
  assertEquals(parseDotVotes(readme), [
    {idea: "a game", votes: 4},
    {idea: "logic game, e.g. sudoku", votes: 1},
    {idea: "autonomous agents tool", votes: 3},
    {
      idea:
        "VSCode extension to vote on ideas - dot voting, ranked choice, etc. - share ideas and vote on them - first step, it's an app outside of VScode",
      votes: 5,
    },
  ]);
});

// Level 2 — Tally and Declare a Winner

Deno.test(function winner_of_an_empty_list_is_nobody() {
  assertEquals(winner([]), {winners: [], votes: 0});
});

Deno.test(function winner_when_nobody_voted_is_nobody() {
  assertEquals(
    winner([{idea: "A", votes: 0}, {idea: "B", votes: 0}]),
    {winners: [], votes: 0},
  );
});

Deno.test(function single_idea_with_votes_wins() {
  assertEquals(winner([{idea: "A", votes: 2}]), {winners: ["A"], votes: 2});
});

Deno.test(function idea_with_most_votes_wins() {
  assertEquals(
    winner([{idea: "A", votes: 1}, {idea: "B", votes: 4}, {idea: "C", votes: 2}]),
    {winners: ["B"], votes: 4},
  );
});

Deno.test(function a_tie_reports_every_tied_idea_in_original_order() {
  assertEquals(
    winner([{idea: "A", votes: 3}, {idea: "B", votes: 1}, {idea: "C", votes: 3}]),
    {winners: ["A", "C"], votes: 3},
  );
});

Deno.test(function winner_does_not_change_its_input() {
  const ideas = [{idea: "A", votes: 1}, {idea: "B", votes: 4}];
  winner(ideas);
  assertEquals(ideas, [{idea: "A", votes: 1}, {idea: "B", votes: 4}]);
});

Deno.test(function todays_readme_elects_the_voting_app() {
  const readme = `- a game X X x X
- logic game, e.g. sudoku   X
- autonomous agents tool XXx
- VSCode extension to vote on ideas   XXxxx`;
  assertEquals(winner(parseDotVotes(readme)), {
    winners: ["VSCode extension to vote on ideas"],
    votes: 5,
  });
});

Deno.test(function ranking_of_an_empty_list_is_empty() {
  assertEquals(ranking([]), []);
});

Deno.test(function ranking_sorts_highest_votes_first() {
  assertEquals(
    ranking([{idea: "A", votes: 1}, {idea: "B", votes: 4}, {idea: "C", votes: 2}]),
    [{idea: "B", votes: 4}, {idea: "C", votes: 2}, {idea: "A", votes: 1}],
  );
});

Deno.test(function ranking_keeps_original_order_for_ties() {
  assertEquals(
    ranking([
      {idea: "A", votes: 1},
      {idea: "B", votes: 3},
      {idea: "C", votes: 1},
      {idea: "D", votes: 3},
    ]),
    [
      {idea: "B", votes: 3},
      {idea: "D", votes: 3},
      {idea: "A", votes: 1},
      {idea: "C", votes: 1},
    ],
  );
});

Deno.test(function ranking_keeps_ideas_with_zero_votes() {
  assertEquals(
    ranking([{idea: "A", votes: 0}, {idea: "B", votes: 2}]),
    [{idea: "B", votes: 2}, {idea: "A", votes: 0}],
  );
});

Deno.test(function ranking_does_not_change_its_input() {
  const ideas = [{idea: "A", votes: 1}, {idea: "B", votes: 4}];
  ranking(ideas);
  assertEquals(ideas, [{idea: "A", votes: 1}, {idea: "B", votes: 4}]);
});

// Level 3 — Ranked Choice (Instant Runoff)
// Each round is a map of idea → votes for every idea still in the race.
// (Ties for last place are left for the group to decide, so no test below has one.)

Deno.test(function no_ballots_means_no_winner() {
  assertEquals(instantRunoff([]), {winner: null, rounds: []});
});

Deno.test(function only_empty_ballots_means_no_winner() {
  assertEquals(instantRunoff([[], []]), {winner: null, rounds: []});
});

Deno.test(function a_single_ballot_wins_in_round_one() {
  assertEquals(instantRunoff([["A"]]), {winner: "A", rounds: [{A: 1}]});
});

Deno.test(function a_first_round_majority_wins_immediately() {
  assertEquals(instantRunoff([["A"], ["A"], ["B"]]), {
    winner: "A",
    rounds: [{A: 2, B: 1}],
  });
});

Deno.test(function ideas_ranked_lower_start_the_race_with_zero_votes() {
  assertEquals(instantRunoff([["A", "C"], ["A"], ["B"]]), {
    winner: "A",
    rounds: [{A: 2, B: 1, C: 0}],
  });
});

Deno.test(function exactly_half_is_not_a_majority() {
  const ballots = [["A"], ["A"], ["A"], ["B"], ["B"], ["C", "A"]];
  assertEquals(instantRunoff(ballots), {
    winner: "A",
    rounds: [
      {A: 3, B: 2, C: 1}, // 3 of 6 is not more than half: drop C
      {A: 4, B: 2}, // C's ballot moves to A
    ],
  });
});

Deno.test(function readme_example_game_wins_in_round_two() {
  const ballots = [
    ["game", "agents", "sudoku"],
    ["game", "sudoku"],
    ["agents", "game"],
    ["sudoku", "agents"],
    ["sudoku", "agents"],
  ];
  assertEquals(instantRunoff(ballots), {
    winner: "game",
    rounds: [
      {game: 2, agents: 1, sudoku: 2},
      {game: 3, sudoku: 2},
    ],
  });
});

Deno.test(function an_idea_with_zero_votes_is_dropped_first() {
  const ballots = [["A", "C"], ["A"], ["B", "C"], ["B"], ["D", "B"]];
  assertEquals(instantRunoff(ballots), {
    winner: "B",
    rounds: [
      {A: 2, B: 2, C: 0, D: 1}, // drop C
      {A: 2, B: 2, D: 1}, // drop D, its ballot moves to B
      {A: 2, B: 3},
    ],
  });
});

Deno.test(function exhausted_ballots_no_longer_count_toward_the_majority() {
  const ballots = [["A"], ["A"], ["A"], ["B"], ["B"], ["C"]];
  assertEquals(instantRunoff(ballots), {
    winner: "A",
    rounds: [
      {A: 3, B: 2, C: 1}, // 3 of 6: no majority, drop C
      {A: 3, B: 2}, // C's ballot is exhausted: 3 of 5 active ballots wins
    ],
  });
});

Deno.test(function instant_runoff_does_not_change_its_input() {
  const ballots = [["A", "B"], ["B"], ["C", "A"]];
  instantRunoff(ballots);
  assertEquals(ballots, [["A", "B"], ["B"], ["C", "A"]]);
});

// Reading ranked ballots from a file: one per line, "Name: 1st > 2nd > ..."

Deno.test(function no_ballot_lines_means_no_ballots() {
  assertEquals(parseBallots("# Heading\n- an idea XX\nsome text"), []);
});

Deno.test(function one_ballot_line_becomes_one_ballot() {
  assertEquals(parseBallots("Alex: Game of Life > Mastermind"), [
    ["Game of Life", "Mastermind"],
  ]);
});

Deno.test(function a_ballot_can_have_a_single_choice() {
  assertEquals(parseBallots("Jo: Tennis scoring"), [["Tennis scoring"]]);
});

Deno.test(function whitespace_around_choices_is_trimmed() {
  assertEquals(parseBallots("  Alex:   Game of Life  >   Mastermind  "), [
    ["Game of Life", "Mastermind"],
  ]);
});

Deno.test(function ballots_keep_file_order_and_other_lines_are_ignored() {
  const text = `## Ballots

Alex: A > B
- C
Bea: B > A
`;
  assertEquals(parseBallots(text), [["A", "B"], ["B", "A"]]);
});

Deno.test(function idea_list_lines_are_not_ballots_even_with_a_colon() {
  assertEquals(parseBallots("- Note: this is an idea, not a ballot"), []);
});

