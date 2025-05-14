import {assert, assertEquals} from "https://deno.land/std@0.224.0/assert/mod.ts";
import {word_chain_builder} from "./word_chain.ts";

Deno.test(function deno_tests_work_properly() {
  assert(true);
  assertEquals(6*7, 42);
});

Deno.test(function input1_cannot_be_a_number() {
  const result = word_chain_builder("1234567890", "two");
  assertEquals(result.length, 0);
});

Deno.test(function input2_cannot_be_a_number() {
  const result = word_chain_builder("one", "1234567890");
  assertEquals(result.length, 0);
});

Deno.test(function both_inputs_are_wordlike() {
  assertEquals(word_chain_builder("word", "like").length, 1);
  assertEquals(word_chain_builder("not word like", "word").length, 0);
  assertEquals(word_chain_builder("not_word_like!", "like").length, 0);
});

Deno.test(function both_inputs_are_dictionary_words() {
  assertEquals(word_chain_builder("dictionary", "word").length, 1);
  assertEquals(word_chain_builder("aoeusnthi", "word").length, 0);
  assertEquals(word_chain_builder("dictionary", "aisnthinote").length, 0);
});

// TODO
Deno.test(function start_and_end_are_same_word() {
  const chain = word_chain_builder("word", "word");
  assertEquals(chain.length, 1);
  assertEquals(chain[0], "word");
});

// TODO start_and_end_are_1_letter_apart

// TODO start_and_end_are_2_letters_apart

// TODO can_find_longer_word_chains

// TODO assert that the inputs are not empty strings
// TODO assert that the inputs are the same length as each other
// TODO assert that the inputs are not identical
// TODO assert that the inputs are not type 'object'

