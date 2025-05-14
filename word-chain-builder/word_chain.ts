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

const wordList = await loadWordList("./words_alpha.txt");

export function word_chain_builder(start: string, end: string) {
  try {
    return wordList.includes(start) && wordList.includes(end);
  } catch (error) {
    return false;
  }
}
