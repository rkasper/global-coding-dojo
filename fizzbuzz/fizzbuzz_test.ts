import {assert, assertEquals} from "https://deno.land/std/assert/mod.ts";
import {fizzbuzz} from "./fizzbuzz.ts";

Deno.test(function deno_tests_work_properly() {
  assert(true);
});

Deno.test(function number_returns_itself_test() {
  let input = 1;
  let expected = "1";
  let actual = fizzbuzz(input);
  assertEquals(actual, expected);

  input = 2;
  expected = "2";
  actual = fizzbuzz(input);
  assertEquals(actual, expected);

  input = 4;
  expected = "4";
  actual = fizzbuzz(input);
  assertEquals(actual, expected);

  input = 7;
  expected = "7";
  actual = fizzbuzz(input);
  assertEquals(actual, expected);
});

// For multiples of 3, print "Fizz" instead of the number.
Deno.test(function Fizz_test() {
  assertEquals(fizzbuzz(3), "Fizz");
  assertEquals(fizzbuzz(6), "Fizz");
  assertEquals(fizzbuzz(9), "Fizz");
  assertEquals(fizzbuzz(12), "Fizz");
  assertEquals(fizzbuzz(633), "Fizz");
});

// For multiples of 5, print "Buzz" instead of the number.
Deno.test(function Buzz_test() {
  assertEquals(fizzbuzz(5), "Buzz");
  assertEquals(fizzbuzz(10), "Buzz");
  assertEquals(fizzbuzz(20), "Buzz");
  assertEquals(fizzbuzz(500), "Buzz");
});

// For numbers that are multiples of both 3 and 5, print "FizzBuzz".
Deno.test(function FizzBuzz_test() {
  assertEquals(fizzbuzz(15), "FizzBuzz");
  assertEquals(fizzbuzz(30), "FizzBuzz");
  assertEquals(fizzbuzz(45), "FizzBuzz");
  assertEquals(fizzbuzz(60), "FizzBuzz");
  assertEquals(fizzbuzz(300), "FizzBuzz");
});



