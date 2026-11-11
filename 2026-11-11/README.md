# Kata: Dot Vote 🗳️

Every dojo starts the same way: someone types kata ideas into a README,
everyone adds X's after the ones they like, and a human squints at the
screen and counts. Then there's a tie, or someone asks "what about ranked
choice?", and the counting starts over.

Let's build the tool that does it for us. The long-term dream is a VS Code
extension. Step one is an app that runs **outside** VS Code: a small
voting engine with a thin app on top.

Build it up level by level using TDD. Each level works on its own, so the
group can stop wherever time runs out.

---

## Level 1 — Count the X's

Parse a dojo-style idea list and count the votes on each line.

```typescript
parseDotVotes(`
Kata ideas
- a game X X x X
- logic game, e.g. sudoku   X
- autonomous agents tool XXx
- VSCode extension to vote on ideas - first step, an app outside VSCode   XXxxx
`)
// [
//   { idea: "a game", votes: 4 },
//   { idea: "logic game, e.g. sudoku", votes: 1 },
//   { idea: "autonomous agents tool", votes: 3 },
//   { idea: "VSCode extension to vote on ideas - first step, an app outside VSCode", votes: 5 },
// ]
```

### Rules

- An idea is a line starting with `- `. Ignore every other line.
- Votes are the **trailing** whitespace-separated tokens made up only of
  `x` or `X`. Each letter is one vote: `X X x X` is 4, `XXxxx` is 5.
- The x's *inside* the idea text don't count. The "x" in "extension" and
  "e.g." are not votes, and neither is the one at the end of `- a big box`.
- An idea with no X's has 0 votes. It's still an idea.
- Trim the idea text.

---

## Level 2 — Tally and Declare a Winner

```typescript
winner(parseDotVotes(readme))
// { winners: ["VSCode extension to vote on ideas - ..."], votes: 5 }

winner([{ idea: "A", votes: 3 }, { idea: "B", votes: 3 }, { idea: "C", votes: 1 }])
// { winners: ["A", "B"], votes: 3 }      // a tie is reported, not hidden

ranking(ideas)
// ideas sorted by votes, highest first; ties keep their original order
```

### Rules

- A tie returns every tied idea, in their original order.
- An empty list, or a list where nobody voted, has no winner:
  `{ winners: [], votes: 0 }`.

---

## Level 3 — Ranked Choice (Instant Runoff)

Dot votes reward popular ideas but ignore second choices. With ranked
choice, each voter lists ideas in order of preference.

```typescript
const ballots = [
  ["game", "agents", "sudoku"],
  ["game", "sudoku"],
  ["agents", "game"],
  ["sudoku", "agents"],
  ["sudoku", "agents"],
];

instantRunoff(ballots)
// { winner: "game", rounds: [
//     { game: 2, agents: 1, sudoku: 2 },   // no majority, drop "agents"
//     { game: 3, sudoku: 2 },              // "agents" ballot moves to "game": 3 of 5 wins
//   ] }
```

### Rules

- Count each ballot's highest-ranked idea that is still in the race.
- An idea with **more than half** of the active ballots wins.
- Otherwise drop the idea with the fewest votes and count again.
- A ballot whose ideas have all been dropped is *exhausted*. It no longer
  counts toward the majority.
- Ties for last place: decide as a group (drop all of them? drop the one
  with fewer first-choice votes?), then write the test that pins it down.

---

## Level 4 — Same Votes, Different Winners

Run the same ballots through other methods and see whether they agree.

```typescript
borda(ballots)      // n-1 points for 1st, n-2 for 2nd, ..., 0 for last
approval(ballots)   // every idea on a ballot gets 1 point, order ignored
compare(ballots)   // the Level 3 ballots
// {
//   plurality:     ["game", "sudoku"],             // 2–2–1 on first choices: a tie
//   instantRunoff: ["game"],
//   borda:         ["game", "agents", "sudoku"],   // 5–5–5: a three-way tie
//   approval:      ["agents", "sudoku"],           // each on 4 of 5 ballots
// }
```

Five ballots, four methods, four different answers.

### Rules

- `n` is the number of ideas in the whole election. Ideas missing from a
  ballot get 0 Borda points from it.
- Plurality = first choices only (which is Level 2 again).
- Every method returns a list of winners, because ties happen.
- Find (or have Claude find) a set of ballots where all four methods pick
  a different single winner.

---

## Level 5 — The App (outside VS Code)

Wrap the engine in a tiny HTTP API so a group can share ideas and vote
from their own laptops.

```text
POST /polls                  { "title": "Kata ideas", "method": "dot" }  → { "id": "abc" }
POST /polls/abc/ideas        { "idea": "a game" }
POST /polls/abc/votes        { "voter": "Karsten", "idea": "a game" }               // dot
POST /polls/abc/votes        { "voter": "Karsten", "ranking": ["game", "agents"] }  // ranked
GET  /polls/abc/results      → winner + tally, using the poll's method
```

### Rules

- Test the request handler directly
  (`handler(new Request(...)) → Response`). You don't need a running
  server in the tests. `Deno.serve(handler)` is one line at the end.
- In-memory storage is fine.
- Dot polls give each voter a budget of dots (default 3). A vote over
  budget gets a `400`.
- A ranked voter who votes again replaces their earlier ballot.
- `POST /polls/import` with a README body creates a dot poll from
  Level 1's parser. Today's README should elect today's kata.

---

## Stretch Goals (choose your adventure)

- **The real extension**: scaffold a VS Code extension that shows the
  current poll in a sidebar and votes with a click. It talks to the
  Level 5 API.
- **Live results**: push updates over Server-Sent Events or WebSockets so
  the tally moves while people vote.
- **Write the X's back**: a vote in the app appends an `X` to the right
  line of the README, keeping the file the source of truth.
- **Condorcet**: find the idea that beats every other one head-to-head,
  or report that there's a cycle (rock, paper, scissors).
- **Anonymous but honest**: one vote per person without storing who voted
  for what.

---

## Tips for TDD

1. **One failing test at a time.** Red → green → refactor sets the size
   of the step.
2. **Start with the boring case.** One line, one X. "Extension" and
   "sudoku   X" come after the simple one is green.
3. **Use real data.** The idea list in this README makes a great test
   fixture. Paste it in.
4. **Tally with a `Map`.** It keeps insertion order, which gives you
   stable tie-breaking for free.
5. **Refactor in green**, never in red.

## Commands

```bash
deno test
deno test --watch
```

---

## For the Facilitator

- **Suggested starting level**: Level 1. `parseDotVotes("- a game X")` is
  a gentle first test for anyone new to TDD.
- **Realistic goal for 2 hours**: Levels 1–3, maybe into 4. Level 3 doesn't
  need Levels 1–2, so a group that wants algorithms can start there.
- **Mixed groups**: Levels 1–2 suit people newer to TDD. Levels 3–5 and
  the stretch goals have more meat for experienced folks.
- **Known trap**: in Level 1, a regex like `/x/gi` counts the x in
  "extension" and "e.g.". Put this README's real VSCode line in a test
  early.

---

## Who's here

Hi its John
Richard
Karsten here
Hello Randle here!
Hello Gerald Dickinson here!!

## Kata ideas (the vote that picked this kata)

- a game X X x X
- logic game, e.g. sudoku   X
- autonomous agents tool XXx
- VSCode extension to vote on ideas - dot voting, ranked choice, etc. - share ideas and vote on them - first step, it's an app outside of VScode   XXxxx
run the tests for level 2 in claude commands
are the tests that you ran material to a successful level 2 code? If yes, I'd like to fix those errors. Please give me a count of the errors that would prevent us from a successful level 2 test and next we will address them