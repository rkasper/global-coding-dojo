export function add(input: string): number {
  if (input === "") {
    return 0;
  }

  const { delimiter, numbers } = parseInput(input);

  const nums = numbers
    .split(delimiter)
    .map(n => parseInt(n));

  const negatives = nums.filter(n => n < 0);
  if (negatives.length > 0) {
    throw new Error(`negatives not allowed: ${negatives.join(", ")}`);
  }

  return nums.reduce((a, b) => a + b, 0);
}

function parseInput(input: string): { delimiter: RegExp; numbers: string } {
  if (input.startsWith("//")) {
    const customDelimiter = escapeRegex(input[2]);
    return {
      delimiter: new RegExp(customDelimiter),
      numbers: input.substring(4),
    };
  }

  return {
    delimiter: /[,\n]/,
    numbers: input,
  };
}

function escapeRegex(char: string): string {
  const specialChars = /[.*+?^${}()|[\]\\]/g;
  return char.replace(specialChars, '\\$&');
}

