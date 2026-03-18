export const DEFAULT_PATTERN = /Page\s+(\d+)\s+of\s+(\d+)/i;

/** Group PDF pages into statements based on "Page X of Y" markers. */
export function detectStatementGroups(
  pageTexts: string[],
  pattern: RegExp = DEFAULT_PATTERN,
): number[][] {
  const groups: number[][] = [];
  let currentGroup: number[] = [];

  for (let i = 0; i < pageTexts.length; i++) {
    const match = pageTexts[i].match(pattern);
    if (match) {
      const pageNum = parseInt(match[1], 10);
      if (pageNum === 1 && currentGroup.length > 0) {
        groups.push(currentGroup);
        currentGroup = [];
      }
    }
    currentGroup.push(i);
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
}

export function parsePattern(patternStr: string): RegExp {
  try {
    return new RegExp(patternStr, "i");
  } catch {
    throw new Error(`Invalid regex pattern: ${patternStr}`);
  }
}
