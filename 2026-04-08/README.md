# Emoji Encryption Kata

Encode and decode secret messages using emoji substitution ciphers. Build it up step by step using TDD.

---

## Level 1 - Simple Substitution

Create two functions:

- `encrypt(message)` — replace each letter with a fixed emoji
- `decrypt(encrypted)` — convert the emojis back to letters

Use a fixed mapping like: `a` → 🍎, `b` → 🐝, `c` → 🐱, etc.

### Rules

- Case-insensitive: `"A"` and `"a"` both encrypt the same way
- Non-letter characters (spaces, punctuation, numbers) pass through unchanged
- `decrypt(encrypt(message))` must return the original message (lowercased)

### Examples

```typescript
encrypt("hi")       // "🌺🍦"
decrypt("🌺🍦")    // "hi"
encrypt("Hello!")   // "🌺🥚🍋🍋🐙!"
```

---

## Level 2 - Custom Alphabet

Allow the user to provide their own emoji alphabet:

```typescript
const alphabet = ["🔴", "🟠", "🟡", "🟢", "🔵", ...]; // 26 emojis

encrypt("abc", alphabet)  // "🔴🟠🟡"
```

### Rules

- The alphabet must contain exactly 26 unique emojis (throw an error otherwise)
- Encryption and decryption must use the same alphabet to round-trip

---

## Level 3 - Keyword Shift (Caesar-style)

Add a keyword that shifts the emoji mapping. The keyword determines the rotation offset:

```typescript
encrypt("hello", { keyword: "cat" })   // different from encrypt("hello", { keyword: "dog" })
```

### How the shift works

- Sum the character codes of the keyword, mod 26 — that's the rotation offset
- `"cat"` → 99 + 97 + 116 = 312 → 312 % 26 = 0 → shift by 0
- `"dog"` → 100 + 111 + 103 = 314 → 314 % 26 = 2 → shift by 2
- With shift 2: `a` maps to the emoji that `c` normally maps to, etc.

### Rules

- Same keyword must encrypt and decrypt correctly
- Different keywords produce different ciphertexts for the same input

---

## Level 4 - Polyalphabetic Cipher (Vigenère-style)

Instead of a single shift for the whole message, each letter uses a different shift based on its position in the keyword:

```typescript
encrypt("hello", { keyword: "ab", mode: "vigenere" })
// h shifted by 'a' (0), e shifted by 'b' (1), l shifted by 'a' (0), l shifted by 'b' (1), o shifted by 'a' (0)
```

### How it works

- Each character of the keyword gives a shift: `a` = 0, `b` = 1, ..., `z` = 25
- The keyword repeats to match the message length (skipping non-letter characters)
- Each letter is shifted independently

### Rules

- This is harder to break than a simple shift — same letter can encrypt to different emojis
- `decrypt(encrypt(message, opts), opts)` still round-trips correctly

---

## Level 5 - Frequency Resistance

Add dummy emojis to disguise letter frequency:

```typescript
encrypt("hello", { padding: true })
// "🌺🥚🍋🍋🐙🎭🎪🎭" — extra emojis are noise
```

### Rules

- Insert random "null" emojis (from a separate set not used for letters) at random positions
- Decryption must strip the noise and recover the original message
- The null emoji set must be disjoint from the letter emoji set

---

## Level 6 - Extensions (Choose Your Own Adventure!)

Pick one or more:

- **Emoji dictionary**: Map whole words to single emojis (`"love"` → ❤️, `"star"` → ⭐) with fallback to letter-by-letter
- **Number support**: Encode digits 0-9 with their own emoji set
- **Steganography**: Hide the encrypted message inside innocent-looking emoji sequences (e.g., a row of food emojis where only every 3rd one carries data)
- **Brute force cracker**: Given an encrypted message (from Level 3), try all 26 shifts and score results by English word frequency to find the keyword shift

---

## Tips for TDD

1. Start with encrypting a single character
2. Then a full word, then sentences with spaces and punctuation
3. Always test the round-trip: `decrypt(encrypt(x))` === `x`
4. Use property-based thinking: encryption should never lose information

## Commands

```bash
# Run tests
deno test

# Run tests in watch mode
deno test --watch
```

---

## For the Facilitator

- **Rotation**: 5-7 minutes per person
- **Suggested starting level**: Level 1
- **Realistic goal for 2 hours**: Levels 1-4
- **If you finish early**: Level 5 or 6 are great stretch goals