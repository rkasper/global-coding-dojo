import {assert, assertEquals, assertThrows} from "https://deno.land/std@0.224.0/assert/mod.ts";
import {add} from "./string_calculator.ts";

Deno.test(function deno_tests_work_properly() {
  assert(true);
  assertEquals(6 * 7, 42);
});

Deno.test(function empty_string_returns_zero() {
  assertEquals(add(""), 0);
});

Deno.test(function single_number_returns_that_number() {
  assertEquals(add("1"), 1);
  assertEquals(add("5"), 5);
  assertEquals(add("42"), 42);
  assertEquals(add("99"), 99);
});

Deno.test(function two_numbers_separated_by_comma_returns_sum() {
  assertEquals(add("1,2"), 3);
});

Deno.test(function multiple_numbers_separated_by_comma_returns_sum() {
  assertEquals(add("1,2,3"), 6);
  assertEquals(add("1,2,3,4"), 10);
  assertEquals(add("10,20,30,40,50"), 150);
});

Deno.test(function numbers_separated_by_newline_returns_sum() {
  assertEquals(add("1\n2"), 3);
  assertEquals(add("5\n10"), 15);
  assertEquals(add("1\n2\n3"), 6);
  assertEquals(add("10\n20\n30\n40"), 100);
});

Deno.test(function numbers_separated_by_mixed_delimiters_returns_sum() {
  assertEquals(add("1\n2,3"), 6);
  assertEquals(add("1,2\n3"), 6);
  assertEquals(add("1,2\n3,4"), 10);
  assertEquals(add("10\n20,30\n40"), 100);
});

Deno.test(function custom_delimiter_returns_sum() {
  assertEquals(add("//;\n1;2"), 3);
  assertEquals(add("//;\n1;2;3"), 6);
  assertEquals(add("//|\n1|2|3"), 6);
  assertEquals(add("//-\n10-20-30"), 60);
});

Deno.test(function negative_numbers_throw_error() {
  assertThrows(
    () => add("1,-2"),
    Error,
    "negatives not allowed: -2"
  );
  assertThrows(
    () => add("-1,2"),
    Error,
    "negatives not allowed: -1"
  );
  assertThrows(
    () => add("-1,-2,-3"),
    Error,
    "negatives not allowed: -1, -2, -3"
  );
  assertThrows(
    () => add("1\n-5,3"),
    Error,
    "negatives not allowed: -5"
  );
});
