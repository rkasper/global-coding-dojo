import {assert, assertEquals, assertThrows} from "https://deno.land/std@0.224.0/assert/mod.ts";
import {convert} from "./travelassistant.ts";

Deno.test(function deno_tests_work_properly() {
  assert(true);
  assertEquals(6 * 7, 42);
});

Deno.test(function deno_test_convert() {
  let converted_time = convert(
    "2026-09-09T12:00:00",
    "America/New_York",
    "America/New_York",
  );
  assertEquals(converted_time, "2026-09-09T12:00:00");
});

Deno.test(function deno_test_convert_across_zones() {
  let converted_time = convert(
    "2026-09-09T14:30:00",
    "America/New_York",
    "Europe/Paris",
  );
  assertEquals(converted_time, "2026-09-09T20:30:00");
});

Deno.test(function deno_test_convert_rejects_non_numeric_time() {
  assertThrows(
    () => convert("not-a-time", "America/New_York", "Europe/Paris"),
    Error,
    "Invalid time",
  );
});

Deno.test(function deno_test_convert_rejects_wrong_shape() {
  assertThrows(
    () => convert("2026-09-09 12:00pm", "America/New_York", "Europe/Paris"),
    Error,
    "Invalid time",
  );
});

Deno.test(function deno_test_convert_rejects_hour_over_23() {
  assertThrows(
    () => convert("2026-09-09T25:00:00", "America/New_York", "Europe/Paris"),
    Error,
    "hour",
  );
});

Deno.test(function deno_test_convert_rejects_negative_hour() {
  assertThrows(
    () => convert("2026-09-09T-5:00:00", "America/New_York", "Europe/Paris"),
    Error,
    "Invalid time",
  );
});

Deno.test(function deno_test_convert_rejects_minute_over_59() {
  assertThrows(
    () => convert("2026-09-09T12:75:00", "America/New_York", "Europe/Paris"),
    Error,
    "minute",
  );
});

// US and EU don't start daylight saving on the same date. In 2026 the US
// springs forward on March 8, the EU on March 29 — a 3-week window where
// the usual 6-hour NY/Paris offset is briefly 5 hours.
Deno.test(function deno_test_convert_handles_asymmetric_dst_start_dates() {
  assertEquals(
    convert("2026-03-15T09:00:00", "America/New_York", "Europe/Paris"),
    "2026-03-15T14:00:00",
  );
  assertEquals(
    convert("2026-04-01T09:00:00", "America/New_York", "Europe/Paris"),
    "2026-04-01T15:00:00",
  );
});

// Southern-hemisphere zones observe DST in the opposite months.
Deno.test(function deno_test_convert_handles_southern_hemisphere_dst() {
  assertEquals(
    convert("2026-01-15T10:00:00", "Australia/Sydney", "America/New_York"),
    "2026-01-14T18:00:00",
  );
  assertEquals(
    convert("2026-07-15T10:00:00", "Australia/Sydney", "America/New_York"),
    "2026-07-14T20:00:00",
  );
});

// 2026-03-08 02:00-02:59 never happens in America/New_York — clocks jump
// straight from 02:00 to 03:00. This local time doesn't exist.
Deno.test(function deno_test_convert_handles_spring_forward_gap() {
  assertEquals(
    convert("2026-03-08T02:30:00", "America/New_York", "UTC"),
    "2026-03-08T07:30:00",
  );
});

// 2026-11-01 01:00-01:59 happens twice in America/New_York — once as EDT,
// once (an hour later in UTC terms) as EST. This local time is ambiguous.
Deno.test(function deno_test_convert_handles_fall_back_ambiguous_hour() {
  assertEquals(
    convert("2026-11-01T01:30:00", "America/New_York", "UTC"),
    "2026-11-01T05:30:00",
  );
});

// Most of Arizona never observes DST, unlike its Mountain-zone neighbors.
// So Phoenix and Denver share a clock in winter but diverge by an hour
// once Denver springs forward.
Deno.test(function deno_test_convert_handles_arizona_never_observing_dst() {
  assertEquals(
    convert("2026-01-15T10:00:00", "America/Phoenix", "America/Denver"),
    "2026-01-15T10:00:00",
  );
  assertEquals(
    convert("2026-07-15T10:00:00", "America/Phoenix", "America/Denver"),
    "2026-07-15T11:00:00",
  );
});

