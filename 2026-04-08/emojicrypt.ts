const emojis = "🍎🐝🐱🐶🥚🐸🍇🌺🍦🎮🔑🍋🌙🥜🐙🍕🫅🌹⭐🌮🦄🌋🌊❌🧶⚡";
const emojiList = [...emojis];

const letterToEmoji = new Map<string, string>();
const emojiToLetter = new Map<string, string>();

for (let i = 0; i < 26; i++) {
  const letter = String.fromCharCode(97 + i);
  letterToEmoji.set(letter, emojiList[i]);
  emojiToLetter.set(emojiList[i], letter);
}

export function encrypt(message: string, alphabet?: string[]): string {
  const mapping = alphabet
    ? new Map(alphabet.map((emoji, i) => [String.fromCharCode(97 + i), emoji]))
    : letterToEmoji;
  return [...message.toLowerCase()].map(c => mapping.get(c) ?? c).join("");
}

export function decrypt(encrypted: string, alphabet?: string[]): string {
  const mapping = alphabet
    ? new Map(alphabet.map((emoji, i) => [emoji, String.fromCharCode(97 + i)]))
    : emojiToLetter;
  return [...encrypted].map(c => mapping.get(c) ?? c).join("");
}
