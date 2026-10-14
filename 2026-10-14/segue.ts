export type BeatmatchResult =
  | {compatible: true; pitchPercent: number}
  | {compatible: false};

// A typical DJ deck's pitch fader can speed up or slow down a track by ±8%.
const DEFAULT_PITCH_FADER_RANGE_PERCENT = 8;

// A track at half or double tempo still lines up beat for beat.
const HALF_TIME = 0.5;
const NORMAL_TIME = 1;
const DOUBLE_TIME = 2;
const TEMPO_MULTIPLIERS = [NORMAL_TIME, DOUBLE_TIME, HALF_TIME];

const PERCENT = 100;

export function beatmatch(
  currentBpm: number,
  nextBpm: number,
  {range = DEFAULT_PITCH_FADER_RANGE_PERCENT}: {range?: number} = {},
): BeatmatchResult {
  const pitchPercent = smallestPitchChange(currentBpm, nextBpm);
  const withinPitchFader = Math.abs(pitchPercent) <= range;

  if (!withinPitchFader) return {compatible: false};
  return {compatible: true, pitchPercent};
}

// Tries the next track at normal, double and half time, and returns the
// pitch change that needs the least adjustment.
function smallestPitchChange(currentBpm: number, nextBpm: number): number {
  return TEMPO_MULTIPLIERS
    .map((multiplier) => pitchChangePercent(currentBpm, nextBpm * multiplier))
    .reduce((smallest, pitch) =>
      Math.abs(pitch) < Math.abs(smallest) ? pitch : smallest
    );
}

// How far (in %) the next track's speed must change to match the current
// track: negative means slow it down, positive means speed it up.
function pitchChangePercent(currentBpm: number, nextBpm: number): number {
  const speedRatio = currentBpm / nextBpm;
  return roundToHundredths((speedRatio - 1) * PERCENT);
}

// Rounds half away from zero, so -3.125 becomes -3.13 (Math.round alone gives -3.12).
function roundToHundredths(n: number): number {
  const HUNDREDTHS = 100;
  return Math.sign(n) * Math.round(Math.abs(n) * HUNDREDTHS) / HUNDREDTHS;
}

// Camelot wheel: numbers 1–12 around a clock, letter A = minor, B = major.
const WHEEL_SIZE = 12;
const CAMELOT_KEY = /^(1[0-2]|[1-9])([AB])$/;

type CamelotKey = {number: number; letter: "A" | "B"};

export function keysCompatible(currentKey: string, nextKey: string): boolean {
  const current = parseCamelotKey(currentKey);
  const next = parseCamelotKey(nextKey);

  const sameLetter = current.letter === next.letter;
  const steps = stepsAroundWheel(current.number, next.number);

  const sameKey = sameLetter && steps === 0;
  const neighbouringKey = sameLetter && steps === 1;
  const relativeMajorMinor = !sameLetter && steps === 0;

  return sameKey || neighbouringKey || relativeMajorMinor;
}

function parseCamelotKey(key: string): CamelotKey {
  const match = CAMELOT_KEY.exec(key);
  if (!match) throw new Error(`Invalid Camelot key: "${key}"`);
  return {number: Number(match[1]), letter: match[2] as "A" | "B"};
}

// Shortest distance between two numbers on the wheel, so 12 → 1 is one step.
function stepsAroundWheel(from: number, to: number): number {
  const clockwise = Math.abs(from - to);
  return Math.min(clockwise, WHEEL_SIZE - clockwise);
}

export type Track = {title: string; bpm: number; key: string};

type Candidate = {track: Track; pitchPercent: number; sameKey: boolean};

// Picks the track from the crate that mixes best after the current one:
// it must beatmatch and have a compatible key. The smallest pitch change
// wins; on a tie, the same key beats a neighbouring key.
export function nextTrack(current: Track, crate: Track[]): Track | null {
  const candidates: Candidate[] = [];

  for (const track of crate) {
    const tempo = beatmatch(current.bpm, track.bpm);
    if (!tempo.compatible) continue;
    if (!keysCompatible(current.key, track.key)) continue;
    candidates.push({
      track,
      pitchPercent: tempo.pitchPercent,
      sameKey: current.key === track.key,
    });
  }

  candidates.sort(bestMixFirst);
  return candidates[0]?.track ?? null;
}

function bestMixFirst(a: Candidate, b: Candidate): number {
  const pitchDifference = Math.abs(a.pitchPercent) - Math.abs(b.pitchPercent);
  if (pitchDifference !== 0) return pitchDifference;
  return Number(b.sameKey) - Number(a.sameKey);
}

// Builds a set starting with the opener, repeatedly mixing into the best
// next track from the crate. Each track plays at most once; the set ends
// when nothing left in the crate can follow the last track.
export function planSet(opener: Track, crate: Track[]): Track[] {
  const set = [opener];
  let remaining = crate.filter((track) => track !== opener);

  let next = nextTrack(opener, remaining);
  while (next) {
    set.push(next);
    remaining = remaining.filter((track) => track !== next);
    next = nextTrack(next, remaining);
  }

  return set;
}
