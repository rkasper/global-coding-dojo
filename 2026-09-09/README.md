# Kata: Travel Assistant ✈️🌍

We're a global, distributed group today, so let's build something that
deals with that directly: an assistant that takes a rough trip plan —
flights, hotel, meetings, all in different local time zones — and turns it
into a real, importable calendar.

Build it up level by level using TDD. Level 1 stands alone as a simpler
fallback if the group wants to keep it small; Levels 2+ build the full
travel assistant.

---

## Level 1 — Time Zone Converter

A function that converts a wall-clock time from one IANA time zone to
another.

```typescript
convert("2026-09-09T14:30:00", "America/New_York", "Europe/Paris")
// "2026-09-09T20:30:00"  (NY is UTC-4 / EDT, Paris is UTC+2 / CEST in September)

convert("2026-09-09T09:00:00", "Asia/Tokyo", "America/Los_Angeles")
// "2026-09-08T17:00:00"  (crosses the date line backwards)
```

### Rules

- Input is a local wall-clock time (no offset) plus an IANA zone name
  (`"America/New_York"`, `"Asia/Tokyo"`, `"Europe/Paris"`, ...).
- Output is the equivalent wall-clock time in the target zone.
- Must handle the date changing (either direction).
- Must get daylight saving right for the date given — don't hardcode a
  fixed UTC offset per zone, it'll be wrong half the year.

> 💡 **Pista/Hint:** you don't need a library. `Intl.DateTimeFormat` with a
> `timeZone` option (or `Temporal`, if enabled) knows the real IANA
> database and handles DST for you. Reach for that before reaching for
> manual offset math.

---

## Level 2 — Normalize a Day's Itinerary

A function that takes a list of events, each in its own local zone, and
normalizes them all to one reference (e.g. UTC, or the traveler's home
zone).

```typescript
normalize([
  { name: "Flight AA100",  start: "2026-09-09T08:00:00", end: "2026-09-09T11:15:00", zone: "America/New_York" },
  { name: "Client meeting", start: "2026-09-09T15:00:00", end: "2026-09-09T16:00:00", zone: "Europe/Paris" },
])
// → same events, with start/end also expressed in UTC
```

### Rules

- Every event keeps its original local time *and* gets a UTC time.
- Order the output chronologically (by UTC start), not by input order.

---

## Level 3 — Detect Conflicts

Given a normalized itinerary, flag events that overlap, or that leave too
little buffer between them (e.g. a connecting flight, or a meeting
starting right after landing).

```typescript
findConflicts(itinerary, { minBufferMinutes: 60 })
// → [ { between: ["Flight AA100", "Client meeting"], gapMinutes: 15,
//       reason: "only 15 minutes between landing and meeting start" } ]
```

### Rules

- Two events that overlap in UTC time are always a conflict.
- Two events that don't overlap, but leave less than `minBufferMinutes`
  between them, are a conflict too (that's the realistic case — you never
  actually make the 20-minute layover).
- No conflicts on an itinerary with plenty of gaps.

---

## Level 4 — Generate the Calendar Cluster

Turn a full trip plan (flights, hotel check-in/out, meetings) into a set
of calendar events ready to export — this is the "cluster of calendar
items for everything I need for a trip" the whole kata is named for.

```typescript
buildCalendarEvents(tripPlan)
// → [
//     { uid: "...", summary: "Flight AA100 JFK → CDG", startUTC: ..., endUTC: ..., location: "JFK" },
//     { uid: "...", summary: "Hotel check-in — Hôtel de Ville", startUTC: ..., endUTC: ... },
//     ...
//   ]
```

### Rules

- Every input item (flight, hotel, meeting) becomes exactly one event.
- Each event has a stable, unique `uid`.
- Times are UTC internally; keep the original local zone around too, so a
  human-readable summary can say "14:20 CET" instead of a UTC time nobody
  wants to mentally convert.

---

## Level 5 — Emit a Real `.ics` File

Serialize the calendar cluster as a valid iCalendar file, importable into
Google/Apple/Outlook calendars.

```typescript
toICS(events)
// → `BEGIN:VCALENDAR
// VERSION:2.0
// PRODID:-//Global Coding Dojo//Travel Assistant//EN
// BEGIN:VEVENT
// UID:...
// DTSTART:20260909T120000Z
// DTEND:20260909T151500Z
// SUMMARY:Flight AA100 JFK → CDG
// END:VEVENT
// ...
// END:VCALENDAR
// `
```

### Rules

- Valid [RFC 5545](https://www.rfc-editor.org/rfc/rfc5545) — `DTSTART`/`DTEND` in UTC (`...Z` suffix), each event wrapped in
  `BEGIN:VEVENT` / `END:VEVENT`.
- Round-trip test: write the file, and confirm your test suite (or a real
  calendar app, if someone wants to try it live) can read the dates back
  correctly.

> 💡 Don't reach for an npm/`.ics`-generation library here — the format for
> what we need is a handful of lines of string templating. Writing it by
> hand is the point of the exercise.

---

## Stretch Goals (choose your adventure)

- **Travel buffers**: auto-insert a "leave for airport" event N hours
  before international flights, fewer for domestic.
- **Reminders**: add `VALARM` blocks to the `.ics` output.
- **Multi-leg trips**: a trip spanning several zones in one day (red-eye
  flight, landing, same-day meeting).
- **DST edge case**: a trip that starts before a DST transition and ends
  after it, in one of the zones involved.
- **Loose input**: parse a free-text trip description ("fly to Paris
  Wednesday morning, meeting at 3pm Thursday, back Friday night") into a
  `TripPlan` — ask Claude to help turn fuzzy text into structured data.
- **Meeting-time finder**: given several people's home zones and working
  hours, find overlapping windows that work for everyone (ties back to
  the group being distributed today).

---

## Tips for TDD

1. **One failing test at a time.** Red → green → refactor sets the size
   of the step.
2. **Level 1 first, always** — even if the group wants to build the full
   assistant, the time-zone conversion is the load-bearing piece
   everything else depends on. Get it solid before building on top.
3. **Time zones are the "shuffle" of this kata** — the part that looks
   simple and isn't. Test with zones that actually have different DST
   rules and offsets (`America/New_York` vs `Europe/Paris` vs
   `Asia/Tokyo` vs `Australia/Sydney` is a good spread), not just one.
4. **Don't hand-roll UTC offset arithmetic.** Use `Intl.DateTimeFormat`
   (or `Temporal` if available) — the offsets are data, not logic, and
   the platform already has the IANA tz database.
5. **Refactor in green**, never in red.

## Commands

```bash
deno test
deno test --watch
```

---

## For the Facilitator

- **Rotation**: 4 minutes per person (per today's deck).
- **Suggested starting level**: Level 1 — the first test (`convert`
  between two zones) is approachable for someone new to TDD, and useful
  on its own if the group decides to stop there.
- **Realistic goal for 2 hours**: Levels 1–4, maybe into 5.
- **Mixed groups**: Levels 1–2 suit people newer to TDD; Level 3
  (conflict detection) and the stretch goals have more meat for
  experienced folks.
- **Shortcut**: don't spend mob time hand-writing IANA zone name strings
  or sample trip data — that's data entry, not logic. Ask Claude to type
  it in one go and move on.
- **Known trap**: someone will want to test time-zone conversion by
  computing the expected offset by hand. Don't — verify against a known
  reference (e.g. what a calendar app or `date -u` shows for that
  instant) instead of a second hand-rolled calculation, or the test and
  the code can both be wrong the same way.
