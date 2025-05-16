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
  assert(word_chain_builder("cat", "dog").length > 1);
  assertEquals(word_chain_builder("not word like", "word").length, 0);
  assertEquals(word_chain_builder("not_word_like!", "like").length, 0);
});

Deno.test(function both_inputs_are_dictionary_words() {
  assert(word_chain_builder("cat", "dog").length > 1);
  assertEquals(word_chain_builder("aoeusnthi", "word").length, 0);
  assertEquals(word_chain_builder("dictionary", "aisnthinote").length, 0);
});

Deno.test(function start_and_end_are_same_word() {
  const chain = word_chain_builder("word", "word");
  assertEquals(chain.length, 1);
  assertEquals(chain[0], "word");
});

Deno.test(function start_and_end_are_1_letter_apart() {
  const chain = word_chain_builder("dot", "dog");
  assertEquals(chain.length, 2);
  assertEquals(chain[0], "dot");
  assertEquals(chain[1], "dog");
});

Deno.test(function can_find_3_letter_word_chains() {
  const chain = word_chain_builder("cat", "dog");
  assert(chain.length > 2);
  assertEquals(chain[0], "cat");
  assertEquals(chain[chain.length-1], "dog");
  console.log(chain);
});

Deno.test(function can_find_6_letter_word_chains() {
  const chain = word_chain_builder("planet", "rocket");
  assert(chain.length > 2);
  assertEquals(chain[0], "planet");
  assertEquals(chain[chain.length-1], "rocket");
  console.log(chain);
});

Deno.test(function can_find_13_letter_word_chains() {
  const chain = word_chain_builder("thinking", "drinking");
  assert(chain.length > 2);
  assertEquals(chain[0], "thinking");
  assertEquals(chain[chain.length-1], "drinking");
  console.log(chain);
});


// TODO assert that the inputs are not empty strings
// TODO assert that the inputs are the same length as each other

// TODO advanced kata options, like find the minimum word chain. Idea: optimize the search space -
//  go from cat -> [cd][ao][tg] -> dog. Idea2: find the arbitrary length word chain, then filter it to make it shorter.
// Idea3: would a breadth-first search find a shorter word chain?
