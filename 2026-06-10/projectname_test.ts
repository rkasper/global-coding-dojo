import {assert, assertEquals} from "https://deno.land/std@0.224.0/assert/mod.ts";
// import {projectname} from "./projectname.ts";

Deno.test(function deno_tests_work_properly() {
  assert(true);
  assertEquals(6 * 7, 42);
});
