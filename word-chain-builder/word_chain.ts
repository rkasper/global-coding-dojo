let wordSet = new Set<string>();

async function loadWordList(filePath: string): Promise<void> {
  try {
    const text = await Deno.readTextFile(filePath);
    const words = text.split("\n")
      .map(word => word.trim().toLowerCase())
      .filter(word => word.length > 0);

    wordSet = new Set(words);
    console.log(`Loaded ${wordSet.size} words from dictionary`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error loading word list: ${error.message}`);
    } else {
      console.error(`Unknown error loading word list: ${String(error)}`);
    }
  }
}

await loadWordList("./words_alpha.txt");

// Returns a word chain from 'start' to 'end'. Or returns empty list if there is no chain, or if there's an error.
export function word_chain_builder(start: string, end: string): string[] {
  try {
    if (wordSet.has(start) && wordSet.has(end)) {
      if (start === end) {
        return [start];
      }

      if (areWordsOneDifferent(start, end)) {
        return [start, end];
      }

      const visited = new Set<string>([start]);
      const result = findChain(start, end, visited, [start]);
      return result || [];
    } else {
      return [];
    }
  } catch (error) {
    console.error(`Error building word chain: ${error}`);
    return [];
  }
}

function areWordsOneDifferent(word1: string, word2: string): boolean {
  if (word1.length !== word2.length) {
    return false;
  }

  let differences = 0;

  for (let i = 0; i < word1.length; i++) {
    if (word1[i] !== word2[i]) {
      differences++;
      if (differences > 1) {
        return false;
      }
    }
  }

  return differences === 1;
}

function findChain(
  current: string,
  end: string,
  visited: Set<string>,
  chain: string[]
): string[] | null {
  // Optimization: Instead of filtering the entire wordList,
  // generate possible one-letter variations and check if they exist
  const candidates: string[] = [];

  // Try changing each position one by one
  for (let i = 0; i < current.length; i++) {
    // Try each letter of the alphabet
    for (let charCode = 97; charCode <= 122; charCode++) {
      const letter = String.fromCharCode(charCode);
      if (letter === current[i]) continue; // Skip the same letter

      // Create new word with this letter changed
      const newWord = current.substring(0, i) + letter + current.substring(i + 1);

      // Check if it's a valid word and not visited
      if (wordSet.has(newWord) && !visited.has(newWord)) {
        candidates.push(newWord);
      }
    }
  }

  // Try each candidate
  for (const nextWord of candidates) {
    // Mark word as visited
    visited.add(nextWord);

    // If we've reached the target, we're done
    if (nextWord === end) {
      return [...chain, end];
    }

    // Otherwise, recursively continue the chain
    const result = findChain(nextWord, end, visited, [...chain, nextWord]);

    // If we found a result, return it
    if (result) {
      return result;
    }
  }

  // If we've tried all options and found nothing, return null
  return null;
}
