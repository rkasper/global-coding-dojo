type Rule = {"value": number, "output": string};
const rules: Rule[] = [
  {"value": 3, "output": "Fizz"},
  {"value": 5, "output": "Buzz"},
  {"value": 7, "output": "Pop"},
];

// TODO Compute the combinations within fizzbuzz() instead of hard-coding them here
const combinations: Rule[] = [
  {"value": 105, "output": "FizzBuzzPop"},
  {"value": 35, "output": "BuzzPop"},
  {"value": 21, "output": "FizzPop"},
  {"value": 15, "output": "FizzBuzz"},
];
  
export function fizzbuzz(num: number): string {
  // TODO Compute the combinations here instead of hard-coding them above
  for (const combination of combinations) {
    if (num % combination.value === 0) {
      return combination.output;
    }
  }

  // TODO Append the combinations to the original 'rules' so we only need one for loop
  for (const rule of rules) {
    if (num % rule.value === 0) {
      return rule.output;
    }
  }

  return num.toString();
}
