import {assertEquals, assertThrows} from "https://deno.land/std@0.224.0/assert/mod.ts";
import {beatmatch, keysCompatible, nextTrack, planSet, type Track} from "./segue.ts";

Deno.test(function same_bpm_needs_no_pitch_change() {
  assertEquals(beatmatch(128, 128), {compatible: true, pitchPercent: 0});
});

Deno.test(function faster_next_track_is_pitched_down() {
  assertEquals(beatmatch(124, 128), {compatible: true, pitchPercent: -3.13});
});

Deno.test(function slower_next_track_is_pitched_up() {
  assertEquals(beatmatch(128, 124), {compatible: true, pitchPercent: 3.23});
});

Deno.test(function tempo_beyond_the_pitch_fader_is_not_compatible() {
  assertEquals(beatmatch(128, 140), {compatible: false});
});

Deno.test(function exactly_at_the_fader_limit_is_compatible() {
  assertEquals(beatmatch(108, 100), {compatible: true, pitchPercent: 8});
});

Deno.test(function half_time_track_matches() {
  assertEquals(beatmatch(140, 70), {compatible: true, pitchPercent: 0});
});

Deno.test(function double_time_track_matches() {
  assertEquals(beatmatch(87, 170), {compatible: true, pitchPercent: 2.35});
});

Deno.test(function pitch_fader_range_can_be_narrowed() {
  assertEquals(beatmatch(120, 128, {range: 6}), {compatible: false});
  assertEquals(beatmatch(120, 128), {compatible: true, pitchPercent: -6.25});
});

Deno.test(function same_key_is_compatible() {
  assertEquals(keysCompatible("8A", "8A"), true);
});

Deno.test(function one_step_around_the_wheel_is_compatible() {
  assertEquals(keysCompatible("8A", "9A"), true);
  assertEquals(keysCompatible("8A", "7A"), true);
});

Deno.test(function the_wheel_wraps_around_from_12_to_1() {
  assertEquals(keysCompatible("12B", "1B"), true);
  assertEquals(keysCompatible("1B", "12B"), true);
});

Deno.test(function relative_major_and_minor_are_compatible() {
  assertEquals(keysCompatible("8A", "8B"), true);
});

Deno.test(function two_steps_around_the_wheel_clash() {
  assertEquals(keysCompatible("8A", "10A"), false);
});

Deno.test(function changing_number_and_letter_together_clashes() {
  assertEquals(keysCompatible("8A", "9B"), false);
});

Deno.test(function malformed_keys_are_rejected() {
  assertThrows(() => keysCompatible("13A", "8A"), Error, "13A");
  assertThrows(() => keysCompatible("8A", "8C"), Error, "8C");
  assertThrows(() => keysCompatible("", "8A"), Error, "Invalid Camelot key");
});

const billieJean: Track = {title: "Billie Jean", bpm: 117, key: "11A"};
const getLucky: Track = {title: "Get Lucky", bpm: 116, key: "11A"};
const smokeOnTheWater: Track = {title: "Smoke on the Water", bpm: 114, key: "6A"};
const wholeLottaLove: Track = {title: "Whole Lotta Love", bpm: 90, key: "9A"};

Deno.test(function empty_crate_has_no_next_track() {
  assertEquals(nextTrack(billieJean, []), null);
});

Deno.test(function compatible_track_is_picked() {
  assertEquals(nextTrack(billieJean, [getLucky]), getLucky);
});

Deno.test(function track_with_clashing_key_is_skipped() {
  // 114 BPM is only +2.63% away, but 6A clashes with 11A
  assertEquals(nextTrack(billieJean, [smokeOnTheWater]), null);
});

Deno.test(function track_with_unmatchable_tempo_is_skipped() {
  const sameKeyTooSlow: Track = {title: "Too slow", bpm: 90, key: "11A"};
  assertEquals(nextTrack(billieJean, [sameKeyTooSlow]), null);
});

Deno.test(function only_the_compatible_track_is_picked_from_a_mixed_crate() {
  assertEquals(
    nextTrack(billieJean, [wholeLottaLove, smokeOnTheWater, getLucky]),
    getLucky,
  );
});

Deno.test(function smallest_pitch_change_wins() {
  const bigPitch: Track = {title: "Big pitch", bpm: 112, key: "11A"};
  assertEquals(nextTrack(billieJean, [bigPitch, getLucky]), getLucky);
});

Deno.test(function on_equal_pitch_the_same_key_beats_a_neighbouring_key() {
  const neighbourKey: Track = {title: "Neighbour", bpm: 116, key: "12A"};
  assertEquals(nextTrack(billieJean, [neighbourKey, getLucky]), getLucky);
});

Deno.test(function set_with_an_empty_crate_is_just_the_opener() {
  assertEquals(planSet(billieJean, []), [billieJean]);
});

Deno.test(function set_adds_a_compatible_track() {
  assertEquals(planSet(billieJean, [getLucky]), [billieJean, getLucky]);
});

Deno.test(function set_chains_through_tracks_that_only_match_their_neighbour() {
  // 1A clashes with the opener's 11A, but follows 12A fine
  const step1: Track = {title: "Step 1", bpm: 116, key: "12A"};
  const step2: Track = {title: "Step 2", bpm: 116, key: "1A"};
  assertEquals(planSet(billieJean, [step2, step1]), [billieJean, step1, step2]);
});

Deno.test(function set_never_repeats_a_track() {
  assertEquals(planSet(billieJean, [getLucky, billieJean]), [billieJean, getLucky]);
});

Deno.test(function set_stops_when_nothing_can_follow() {
  assertEquals(
    planSet(billieJean, [getLucky, wholeLottaLove, smokeOnTheWater]),
    [billieJean, getLucky],
  );
});
