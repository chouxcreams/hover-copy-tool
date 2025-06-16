interface RegexPattern {
  id: string;
  name: string;
  regex: string;
  createdAt: number;
}

interface ExtractedMatch {
  value: string;
  patternName: string;
}

export function extractMatches(
  url: string,
  patterns: RegexPattern[]
): ExtractedMatch[] {
  const matches: ExtractedMatch[] = [];

  for (const pattern of patterns) {
    try {
      const regex = new RegExp(pattern.regex, "g");
      let match: RegExpExecArray | null = regex.exec(url);
      while (match !== null) {
        if (match[1]) {
          matches.push({
            value: match[1],
            patternName: pattern.name,
          });
        } else if (match[0]) {
          matches.push({
            value: match[0],
            patternName: pattern.name,
          });
        }
        // Prevent infinite loop for zero-length matches
        if (match.index === regex.lastIndex) {
          regex.lastIndex++;
        }
        match = regex.exec(url);
      }
    } catch (error) {
      console.error("Invalid regex pattern:", pattern.regex, error);
    }
  }

  return matches;
}

export function validateRegex(regex: string): boolean {
  try {
    new RegExp(regex);
    return true;
  } catch {
    return false;
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
