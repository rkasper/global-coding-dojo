# Kata: Live DJ Segue Assistant 🎧🔀

A DJ's core skill is the segue: blending the end of one song into the
start of the next so the dance floor never notices the seam. Doing it well
means matching tempo, picking songs in compatible keys, starting the blend
on a phrase boundary, and fading the volumes so the energy doesn't dip.

Let's build the brain of a tool that helps with that. It plans the
transition: which track next, how much to pitch it, when to start the mix,
and how to fade. It doesn't touch any audio.

Build it up level by level using TDD. Each level works on its own, so the
group can stop wherever time runs out.

---

## Level 1 — Beatmatch: Can These Two Tracks Mix?

A function that says whether the next track can be tempo-matched to the
current one using the deck's pitch fader, and by how much.

```typescript
beatmatch(124, 128)
// { compatible: true, pitchPercent: -3.13 }   // slow 128 down to 124

beatmatch(128, 140)
// { compatible: false }                       // needs -8.57%, beyond the fader

beatmatch(140, 70)
// { compatible: true, pitchPercent: 0 }       // half-time: 70 ≈ 140 / 2
```

### Rules

- The *current* track's tempo is fixed (it's playing). Only the *next*
  track gets pitched.
- `pitchPercent = (currentBpm / nextBpm - 1) * 100`, rounded to 2 decimals.
- The pitch fader range is ±8% by default; allow it to be passed in
  (`beatmatch(124, 128, { range: 6 })`).
- Half-time and double-time count: try `nextBpm`, `nextBpm * 2` and
  `nextBpm / 2`, and pick whichever needs the smallest adjustment.

---

## Level 2 — Harmonic Mixing: Are the Keys Compatible?

DJs use the **Camelot wheel** to avoid clashing keys. Every key is a
number 1–12 plus a letter: `A` = minor, `B` = major (e.g. `8A` = A minor,
`8B` = C major).

```typescript
keysCompatible("8A", "8A")   // true  — same key
keysCompatible("8A", "9A")   // true  — one step around the wheel
keysCompatible("12B", "1B")  // true  — the wheel wraps around
keysCompatible("8A", "8B")   // true  — relative major/minor
keysCompatible("8A", "10A")  // false
keysCompatible("8A", "9B")   // false
```

### Rules

- Compatible means: the same key, ±1 on the number with the same letter
  (with 12 ↔ 1 wrapping), or the same number with the other letter.
- Reject malformed keys (`"13A"`, `"8C"`, `""`) with a clear error.

---

## Level 3 — When to Start the Mix: Phrase Alignment

Dance music is built in phrases, usually 8, 16 or 32 bars of 4 beats.
A segue sounds right when the incoming track starts on a phrase boundary
of the outgoing one.

```typescript
mixInPoint({ bpm: 128, durationSec: 360, firstBeatSec: 0.5 }, { phraseBars: 16 })
// 300.5   // start of the last full 16-bar phrase before the track ends
```

### Rules

- One beat = `60 / bpm` seconds. One bar = 4 beats. At 128 BPM, one
  16-bar phrase is exactly 30 seconds.
- Phrases are counted from `firstBeatSec` (the first downbeat, which is
  rarely at exactly 0).
- Return the start time of the **last complete phrase** that still fits
  inside the track's duration.

---

## Level 4 — The Crossfade Curve

During the blend, one deck fades out while the other fades in. Given the
progress through the transition (`0` → `1`), return both volumes.

```typescript
crossfade(0.5, "linear")       // { out: 0.5,   in: 0.5   }
crossfade(0.5, "equal-power")  // { out: 0.707, in: 0.707 }
crossfade(0,   "equal-power")  // { out: 1,     in: 0     }
```

### Rules

- **Linear**: `out = 1 - t`, `in = t`. Simple, but the room sounds quieter
  in the middle of the mix.
- **Equal-power**: `out = cos(t · π/2)`, `in = sin(t · π/2)`. Total
  loudness stays steady, which is why real mixers use it.
- Clamp `t` to `[0, 1]`.

---

## Level 5 — Plan the Set

Given the current track and a crate of candidates, pick the best next
track. Then chain picks into a whole set.

```typescript
nextTrack(current, crate)
// → the candidate that beatmatches with the smallest pitch change and
//   has a compatible key; null if nothing in the crate works

planSet(opener, crate)
// → [opener, t2, t3, ...]   every adjacent pair is mixable, no repeats
```

### Rules

- A candidate must pass both Level 1 (tempo) and Level 2 (key).
- Ties: prefer the smaller absolute pitch change, then the same key over a
  neighbouring key.
- `planSet` stops when no remaining track can follow the last one.

---

## Stretch Goals (choose your adventure)

- **Musical key names**: convert `"A minor"` / `"F♯ major"` to Camelot
  and back.
- **Energy boost**: allow a `+2` jump on the wheel (`8A → 10A`) as a
  deliberate "lift" move, but no more than once every N tracks.
- **Energy arc**: give each track an energy rating 1–10 and make
  `planSet` follow a target curve (warm up, peak, cool down).
- **Request queue**: the crowd requests a track. Find the shortest chain
  of mixable tracks from the current one to the request.
- **Hear it**: wire the crossfade curve to two `<audio>` elements with the
  Web Audio API and try a real segue in the browser.

---

## Tips for TDD

1. **One failing test at a time.** Red → green → refactor sets the size
   of the step.
2. **Start with the boring case.** Same BPM, same key, linear fade at 0.
   The interesting cases (half-time, wheel wrap-around, a phrase that
   doesn't fit) come after the simple one is green.
3. **Floating point will bite.** `0.707106...` is not `0.707`. Decide
   early whether to round in the code or compare with a tolerance in the
   tests (`assertAlmostEquals`).
4. **The Camelot wheel is data, not logic.** Resist a big `if` ladder;
   number + letter arithmetic with modulo 12 covers it.
5. **Refactor in green**, never in red.

## Commands

```bash
deno test
deno test --watch
```

---

## For the Facilitator

- **Suggested starting level**: Level 1. `beatmatch(128, 128)` is a gentle
  first test for anyone new to TDD.
- **Realistic goal for 2 hours**: Levels 1–3, maybe into 4. Levels 1, 2
  and 4 are independent, so a group that gets stuck on phrase math can
  skip ahead.
- **Mixed groups**: Levels 1–2 suit people newer to TDD. Levels 3 and 5
  and the stretch goals have more meat for experienced folks.
- **Shortcut**: don't spend mob time typing a crate of sample tracks with
  BPMs and keys. Ask Claude to generate one.
- **Known trap**: in Level 1, the pitch is relative to the *next* track's
  BPM, not the current one. `124 → 128` is −3.13%, not −3.23%. Write that
  test early.

---

## Who's here

Richard
John's here!
Joel's here
Karsten is here
Gaby is here 
Yulia is here
Sri is here