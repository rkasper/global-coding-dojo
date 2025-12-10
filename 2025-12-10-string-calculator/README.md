# String Calculator Kata

## Overview

Create a simple calculator that accepts a string of numbers and returns their sum.

---

## Requirements (in progressive order)

### 1. Start Simple
Create a method `add(numbers: string): number`

**Basic cases:**
- [x] An empty string returns `0`
    - `add("") → 0`
- [x] A single number returns that number
    - `add("1") → 1`
    - `add("2") → 2`
    - `add("3") → 3`
- [x] Two numbers separated by comma return their sum
    - `add("1,2") → 3`

### 2. Handle Arbitrary Amount of Numbers
- [x] The calculator should be able to sum any quantity of numbers:
- `add("1,2,3") → 6`
- `add("1,2,3,4,5") → 15`

### 3. Handle New Lines Between Numbers
- [x] In addition to commas, allow new lines (`\n`) as delimiters:
- `add("1\n2,3") → 6`
- `add("1\n2\n3") → 6`

**Note:** You do NOT need to handle invalid cases like `"1,\n"` (comma followed by newline)

### 4. Support Custom Delimiters
[x] Allow specifying a custom delimiter in this format:
```
//[delimiter]\n[numbers]
```

**Examples:**
- `add("//;\n1;2") → 3`
    - The delimiter is `;`
    - The numbers are `1` and `2`
- `add("//|\n1|2|3") → 6`
    - The delimiter is `|`
    - The numbers are `1`, `2`, and `3`

**Important:** The custom delimiter is optional. Commas and newlines still work as default delimiters.

### 5. Reject Negative Numbers
[x] If negative numbers are passed, throw an exception with the message:
```
"negatives not allowed: [negative numbers]"
```

**Examples:**
- `add("-1,2")` → throws exception: `"negatives not allowed: -1"`
- `add("1,-2,-3")` → throws exception: `"negatives not allowed: -2, -3"`

**Important:** The exception must show ALL negative numbers that were passed.

### 6. Ignore Numbers Greater Than 1000 (Optional)
Numbers greater than 1000 should be ignored in the sum:
- `add("2,1001") → 2`
- `add("1000,1001,2") → 1002`

---

## Complete Examples

```typescript
add("")           // → 0
add("1")          // → 1
add("1,2")        // → 3
add("1,2,3,4,5")  // → 15
add("1\n2,3")     // → 6
add("//;\n1;2")   // → 3
add("//|\n1|2|3") // → 6
add("-1,2")       // → throws "negatives not allowed: -1"
add("2,1001")     // → 2
```

---

## TDD Tips

1. **Don't try to solve everything at once** - Implement ONE requirement at a time
2. **Write the test first** - Red → Green → Refactor
3. **Use Claude Code strategically:**
    - Ask it to write tests for specific cases
    - Ask it to suggest implementations
    - BUT review and understand what it generates
4. **Refactor frequently** - Don't let the code get ugly
5. **Celebrate small steps** - Each passing test is an achievement

---

## Suggested Approach for Mob Programming

1. **Rotate every 5-7 minutes**
2. **Driver:** Writes the code the navigator suggests
3. **Navigator:** Thinks out loud, guides the driver
4. **Mob:** Suggests ideas, asks questions, helps think

---

## Start with the simplest case!

The first test should be:
```typescript
test("empty string returns 0", () => {
  expect(add("")).toBe(0);
});
```

**Have fun! 🚀**
