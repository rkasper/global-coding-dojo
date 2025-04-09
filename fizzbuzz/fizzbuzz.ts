export function fizzbuzz(input: number) {
  if (input % 3 === 0 && input % 5 === 0) {
    return "FizzBuzz";
  } else if (input % 3 === 0) {  // Why === instead of == ? Answer: 2==2 matches the value, 2===2 matches the value and the type
    return "Fizz";
  } else if (input % 5 ===0)  {
    return "Buzz";
  }
  return input.toString();
}

function main() {
  for (let i = 1; i <= 100; i++) {
    console.log(fizzbuzz(i));
  }
}

if (import.meta.main) {
  main();
}
