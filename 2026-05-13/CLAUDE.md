# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Mars Rover kata for the Global Coding Dojo (2026-05-13). A progressive TDD exercise building a Mars Rover simulator in Deno/TypeScript.

## Commands

```bash
deno test            # Run all tests
deno test --watch    # Run tests in watch mode (re-runs on save)
```

No build step, no linter configured, no `deno.json` — tests import directly from `deno.land/std@0.224.0`.

## Architecture

- `mars_rover.ts` — implementation (`move`, `execute`, and friends)
- `mars_rover_test.ts` — tests, with later levels commented out for progressive TDD
- `README.md` — kata spec with 6 levels of increasing difficulty

## TDD Cycle

Follow these steps strictly and announce which step you are on:

1. **RED** — Write or uncomment exactly one test. Run `deno test`. It must fail.
2. **GREEN** — Write the simplest code that makes the failing test pass. Run `deno test`. It must pass.
3. **REFACTOR** — Clean up the code (only while green). Run `deno test`. It must still pass.

Then go back to step 1. Never skip a step. Never implement beyond what the current failing test requires. Always run tests to confirm each transition.

## Commits

Use concise one-line commit messages. No co-author trailers.

## Gotcha

Turning `L` from `N` lands on `W`, not `E`. Easy to flip the sign accidentally — write the rotation tests for all four headings before refactoring rotation into a lookup table or modular arithmetic.