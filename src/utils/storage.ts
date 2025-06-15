interface RegexPattern {
  id: string;
  name: string;
  regex: string;
  createdAt: number;
}

interface StorageData {
  regexPatterns?: RegexPattern[];
  activePatternIds?: string[];
}

export class StorageManager {
  static async loadPatterns(): Promise<{ patterns: RegexPattern[]; activeIds: string[] }> {
    try {
      const result = (await chrome.storage.sync.get([
        'regexPatterns',
        'activePatternIds',
        'activePatternId', // Legacy support
      ])) as StorageData & { activePatternId?: string };
      
      let activeIds = result.activePatternIds || [];
      
      // Migration: convert old single activePatternId to array
      if (!result.activePatternIds && result.activePatternId) {
        activeIds = [result.activePatternId];
      }
      
      return {
        patterns: result.regexPatterns || [],
        activeIds,
      };
    } catch (error) {
      console.error('Failed to load patterns:', error);
      return {
        patterns: [],
        activeIds: [],
      };
    }
  }

  static async savePatterns(patterns: RegexPattern[], activeIds: string[]): Promise<void> {
    try {
      await chrome.storage.sync.set({
        regexPatterns: patterns,
        activePatternIds: activeIds,
      });
    } catch (error) {
      console.error('Failed to save patterns:', error);
      throw error;
    }
  }

  static async getActivePatterns(): Promise<RegexPattern[]> {
    try {
      const { patterns, activeIds } = await this.loadPatterns();
      if (activeIds.length === 0) return [];
      
      return patterns.filter(p => activeIds.includes(p.id));
    } catch (error) {
      console.error('Failed to get active patterns:', error);
      return [];
    }
  }
}