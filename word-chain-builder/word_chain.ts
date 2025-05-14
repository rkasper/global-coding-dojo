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

      return [""];
    } else {
      return [];
    }
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
