import {assert, assertEquals, assertFalse} from "https://deno.land/std@0.224.0/assert/mod.ts";
import {word_chain_builder} from "./word_chain.ts";

Deno.test(function deno_tests_work_properly() {
  assert(true);
  assertEquals(6*7, 42);
});

Deno.test(function input1_cannot_be_a_number() {
  const result = word_chain_builder("1", "two");
  assertFalse(result);
});

Deno.test(function input2_cannot_be_a_number() {
  const result = word_chain_builder("one", "2");
  assertFalse(result);
});

Deno.test(function both_inputs_are_wordlike() {
  assert(word_chain_builder("word", "like"));
  assertFalse(word_chain_builder("not word like", "word"));
  assertFalse(word_chain_builder("not_word_like!", "like"));
});

Deno.test(function both_inputs_are_dictionary_words() {
  assert(word_chain_builder("dictionary", "word"));
  assertFalse(word_chain_builder("aoeusnthi", "word"));
  assertFalse(word_chain_builder("dictionary", "aisnthinote"));
});

Deno.test(function start_and_end_are_same_word() {
  // Richard is taking a short break.
});

// TODO start_and_end_are_1_letter_apart

// TODO start_and_end_are_2_letters_apart

// TODO can_find_longer_word_chains

// TODO assert that the inputs are not empty strings
// TODO assert that the inputs are the same length as each other
// TODO assert that the inputs are not identical
// TODO assert that the inputs are not type 'object'

