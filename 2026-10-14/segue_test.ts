import {assertEquals, assertThrows} from "https://deno.land/std@0.224.0/assert/mod.ts";
import {beatmatch, keysCompatible} from "./segue.ts";

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
