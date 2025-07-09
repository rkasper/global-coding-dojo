import {assert, assertEquals} from "https://deno.land/std@0.224.0/assert/mod.ts";
import {fizzbuzz} from "./fizzbuzz.ts";

Deno.test(function deno_tests_work_properly() {
  assert(true);
  assertEquals(6 * 7, 42);
});

Deno.test(function test_normal_number() {
  assertEquals(fizzbuzz(1), "1");
  assertEquals(fizzbuzz(2), "2");
});

Deno.test(function test_fizz_number() {
  assertEquals(fizzbuzz(3), "Fizz");
  assertEquals(fizzbuzz(6), "Fizz");
  assertEquals(fizzbuzz(9), "Fizz");
  assertEquals(fizzbuzz(99), "Fizz");
});

Deno.test(function test_buzz_number() {
  assertEquals(fizzbuzz(5), "Buzz");
  assertEquals(fizzbuzz(10), "Buzz");
  assertEquals(fizzbuzz(20), "Buzz");
  assertEquals(fizzbuzz(100), "Buzz");
});

Deno.test(function test_fizzBuzz_number() {
  assertEquals(fizzbuzz(15), "FizzBuzz");
  assertEquals(fizzbuzz(30), "FizzBuzz");
  assertEquals(fizzbuzz(45), "FizzBuzz");
  assertEquals(fizzbuzz(90), "FizzBuzz");
});

Deno.test(function test_pop_number() {
  assertEquals(fizzbuzz(7), "Pop");
  assertEquals(fizzbuzz(14), "Pop");
  assertEquals(fizzbuzz(49), "Pop");
  assertEquals(fizzbuzz(98), "Pop");
});

Deno.test(function test_fizzPop_number() {
  assertEquals(fizzbuzz(21), "FizzPop");
  assertEquals(fizzbuzz(42), "FizzPop");
  assertEquals(fizzbuzz(63), "FizzPop");
  assertEquals(fizzbuzz(84), "FizzPop");
});

Deno.test(function test_buzzPop_number() {
  assertEquals(fizzbuzz(35), "BuzzPop");
  assertEquals(fizzbuzz(70), "BuzzPop");
});

Deno.test(function test_fizzBuzzPop_number() {
  assertEquals(fizzbuzz(105), "FizzBuzzPop");
  assertEquals(fizzbuzz(210), "FizzBuzzPop");
});
