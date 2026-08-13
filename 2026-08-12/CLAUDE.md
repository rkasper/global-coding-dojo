# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Cantar la Lotería kata for the Global Coding Dojo (2026-08-12), in-person in Mexico City. A progressive TDD exercise building a Mexican Lotería game engine in Deno/TypeScript.

The session runs in Spanish. Domain names in the code are Spanish (`carta`, `crearBaraja`, `barajar`, `crearTabla`, `marcar`, `hayGanador`). Talk to the mob in Spanish.

## Commands

```bash
deno test            # Run all tests
deno test --watch    # Run tests in watch mode (re-runs on save)
```

No build step, no linter configured, no `deno.json` — tests import directly from `deno.land/std@0.224.0`.

## Architecture

- `loteria.ts` — implementation
- `loteria_test.ts` — tests, with later levels commented out for progressive TDD
- `README.md` — kata spec with 6 levels, plus the 54-card reference list

## TDD Cycle

Follow these steps strictly and announce which step you are on:

1. **RED** — Write or uncomment exactly one test. Run `deno test`. It must fail.
2. **GREEN** — Write the simplest code that makes the failing test pass. Run `deno test`. It must pass.
3. **REFACTOR** — Clean up the code (only while green). Run `deno test`. It must still pass.

Then go back to step 1. Never skip a step. Never implement beyond what the current failing test requires. Always run tests to confirm each transition.

## Turn-Sized Work

This session is about turn-sized prompts. Do one failing test's worth of work and stop. If you find yourself writing a second function, you have gone too far — stop and hand the keyboard back. Being interrupted is normal and expected, not a failure.

Exception: the 54-card data table is data, not logic. When asked, type the whole list at once instead of driving it out one test at a time.

## Commits

Use concise one-line commit messages. No co-author trailers.

## Gotcha

Shuffling is the level where mobs get stuck, because randomness resists assertion. Steer toward testing invariants ("still 54 cards, no duplicates") and a seeded PRNG for reproducibility — do not reach for `Math.random()` directly, it makes the tests unwritable.
