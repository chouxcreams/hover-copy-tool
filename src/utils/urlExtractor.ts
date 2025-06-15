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

export class UrlExtractor {
  static extractMatches(
    url: string,
    patterns: RegexPattern[]
  ): ExtractedMatch[] {
    const matches: ExtractedMatch[] = [];

    for (const pattern of patterns) {
      try {
        const regex = new RegExp(pattern.regex, "g");
        let match;
        while ((match = regex.exec(url)) !== null) {
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
        }
      } catch (error) {
        console.error("Invalid regex pattern:", pattern.regex, error);
      }
    }

    return matches;
  }

  static validateRegex(regex: string): boolean {
    try {
      new RegExp(regex);
      return true;
    } catch {
      return false;
    }
  }

  static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
