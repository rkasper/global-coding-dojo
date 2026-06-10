
# Tennis Scoring Kata

Score a single game of tennis. Deceptively simple on the surface — `love`, `15`, `30`,
`40` — but `deuce` and `advantage` make the state modeling genuinely interesting. Build it
up level by level using TDD, then refactor toward the tidiest design you can find.

## The rules (a refresher)

- Each player's running score within a game goes: **0 → 15 → 30 → 40 → game**.
- We *announce* those numbers as words: `Love`, `Fifteen`, `Thirty`, `Forty`.
- When both players reach 40 it's **Deuce**, not "Forty-All".
- From deuce, the player who scores leads with **Advantage**. Score again and they **win**.
  Lose the next point and it's back to **Deuce**.
- You must win by **two** points.

---

## Level 1: Both players below 40

Report the score as `"<P1>-<P2>"`, using `Love / Fifteen / Thirty`.

| P1 points | P2 points | Score          |
|-----------|-----------|----------------|
| 0         | 0         | `Love-Love`    |
| 1         | 0         | `Fifteen-Love` |
| 2         | 1         | `Thirty-Fifteen` |
| 3         | 1         | `Forty-Fifteen`  |

## Level 2: Equal scores ("All" and "Deuce")

- When scores are equal below 40: `"Fifteen-All"`, `"Thirty-All"`, etc.
- When scores are equal **at 40 or above**: `"Deuce"`.

| P1 | P2 | Score        |
|----|----|--------------|
| 0  | 0  | `Love-All`   |
| 2  | 2  | `Thirty-All` |
| 3  | 3  | `Deuce`      |
| 4  | 4  | `Deuce`      |

## Level 3: Winning a game (clear lead)

When a player reaches 4+ points with a 2-point lead, they win.

| P1 | P2 | Score              |
|----|----|--------------------|
| 4  | 0  | `Player 1 wins`    |
| 4  | 2  | `Player 1 wins`    |
| 1  | 4  | `Player 2 wins`    |

## Level 4: Advantage

When both players have 40+ (3+ points) and one leads by exactly one point.

| P1 | P2 | Score                  |
|----|----|------------------------|
| 4  | 3  | `Advantage Player 1`   |
| 3  | 4  | `Advantage Player 2`   |
| 5  | 4  | `Advantage Player 1`   |
| 6  | 6  | `Deuce`                |

## Level 5: Play by points, not totals

Refactor so the game is driven by *events* rather than passing in final totals.
Build a small `Game` that you feed one point at a time:

```ts
const game = new Game();        // or whatever shape you design
game.pointTo(1);
game.pointTo(1);
game.score();                   // "Thirty-Love"
```

Replay a whole game and assert the final result. Bonus: make illegal states
unrepresentable — can you design it so `score()` can never return nonsense?

---

## Stretch goals (if you're flying)

- **Named players**: `new Game("Serena", "Venus")` → `"Advantage Serena"`.
- **Set & match**: score a full set (first to 6 games, win by 2), then a best-of-3 match.
- **Tiebreak**: at 6-6 in games, play a 7-point tiebreak (win by 2).
- **Property-based test**: a game always ends with exactly one winner leading by ≥2 points.
