import {assertEquals} from "https://deno.land/std@0.224.0/assert/mod.ts";
import {encrypt, decrypt} from "./emojicrypt.ts";

Deno.test("Level 1 - Simple Substitution", async (t) => {
  await t.step("encrypt a single letter", () => {
    const result = encrypt("a");
    assertEquals([...result].length, 1);
  });

  await t.step("encrypt returns an emoji, not the original letter", () => {
    const result = encrypt("a");
    assertEquals(result !== "a", true);
  });

  await t.step("each encrypted letter is an emoji", () => {
    const encrypted = encrypt("abc");
    for (const char of encrypted) {
      const codePoint = char.codePointAt(0)!;
      assertEquals(codePoint > 0x1F00, true, `Expected emoji but got "${char}" (U+${codePoint.toString(16)})`);
    }
  });

  await t.step("decrypt reverses encrypt for a single letter", () => {
    assertEquals(decrypt(encrypt("a")), "a");
  });

  await t.step("encrypt a full word", () => {
    const encrypted = encrypt("hi");
    assertEquals(decrypt(encrypted), "hi");
  });

  await t.step("encrypt produces exactly one emoji per letter", () => {
    const encrypted = encrypt("abcdefghijklmnopqrstuvwxyz");
    assertEquals([...encrypted].length, 26);
  });

  await t.step("round-trip works for every letter of the alphabet", () => {
    const alphabet = "abcdefghijklmnopqrstuvwxyz";
    assertEquals(decrypt(encrypt(alphabet)), alphabet);
  });

  await t.step("every letter encrypts to a visible emoji, not a control character", () => {
    const alphabet = "abcdefghijklmnopqrstuvwxyz";
    for (const letter of alphabet) {
      const emoji = encrypt(letter);
      const codePoint = [...emoji][0].codePointAt(0)!;
      // Must not be a variation selector (U+FE0F) or other invisible character
      const isVariationSelector = codePoint >= 0xFE00 && codePoint <= 0xFE0F;
      assertEquals(isVariationSelector, false, `Letter "${letter}" mapped to a variation selector U+${codePoint.toString(16)}`);
      assertEquals(codePoint > 0x1F00, true, `Letter "${letter}" mapped to U+${codePoint.toString(16)} which is not a visible emoji`);
    }
  });

  await t.step("each letter maps to a unique emoji", () => {
    const seen = new Set<string>();
    for (const letter of "abcdefghijklmnopqrstuvwxyz") {
      const emoji = encrypt(letter);
      assertEquals(seen.has(emoji), false, `Duplicate emoji ${emoji} for letter "${letter}"`);
      seen.add(emoji);
    }
  });

  await t.step("encrypt is case-insensitive", () => {
    assertEquals(encrypt("A"), encrypt("a"));
    assertEquals(decrypt(encrypt("Hello")), "hello");
  });

  await t.step("non-letter characters pass through unchanged", () => {
    assertEquals(decrypt(encrypt("hello world!")), "hello world!");
    assertEquals(encrypt(" "), " ");
    assertEquals(encrypt("123"), "123");
  });

  await t.step("round-trip works for a sentence", () => {
    assertEquals(decrypt(encrypt("The quick brown fox!")), "the quick brown fox!");
  });

  await t.step("same input always encrypts the same way", () => {
    assertEquals(encrypt("hello"), encrypt("hello"));
  });
});
