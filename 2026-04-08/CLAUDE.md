# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Emoji Encryption kata for the Global Coding Dojo (2026-04-08). A progressive TDD exercise building an emoji-based cipher in Deno/TypeScript.

## Commands

```bash
deno test            # Run all tests
deno test --watch    # Run tests in watch mode (re-runs on save)
```

No build step, no linter configured, no `deno.json` — tests import directly from `deno.land/std@0.224.0`.

## Architecture

- `emojicrypt.ts` — implementation (`encrypt` and `decrypt` functions)
- `emojicrypt_test.ts` — tests, with later levels commented out for progressive TDD
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

JavaScript string `.length` counts UTF-16 code units, not characters. Emojis are 2 code units. Use `[...str].length` to count emoji as single characters.
