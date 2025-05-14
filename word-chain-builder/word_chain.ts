// TODO Make wordList a dictionary with O(1) lookup time
// TODO Use a smaller dictionary of English words
const wordList = await loadWordList("./words_alpha.txt");

// Returns a word chain from 'start' to 'end'. Or returns empty list for error.
export function word_chain_builder(start: string, end: string): string[] {
  try {
    if (wordList.includes(start) && wordList.includes(end)) {
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
  // deno-lint-ignore no-unused-vars
  } catch (error) {
    return [];
  }
}

async function loadWordList(filePath: string): Promise<string[]> {
  try {
    const text = await Deno.readTextFile(filePath);
    return text.split("\n")
      .map(word => word.trim().toLowerCase())
      .filter(word => word.length > 0);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error loading word list: ${error.message}`);
    } else {
      console.error(`Unknown error loading word list: ${String(error)}`);
    }
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
  // Find all valid next words (same length, one letter different, in dictionary, not visited)
  const candidates = wordList.filter(word =>
    word.length === current.length &&
    areWordsOneDifferent(current, word) &&
    !visited.has(word)
  );

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

    // If no result through this path, backtrack (remove from visited)
    // visited.delete(nextWord); // Uncomment this for backtracking
  }

  // If we've tried all options and found nothing, return null
  return null;
}
