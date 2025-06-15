interface RegexPattern {
  id: string;
  name: string;
  regex: string;
  createdAt: number;
}

interface StorageData {
  regexPatterns?: RegexPattern[];
  activePatternId?: string;
}

export class StorageManager {
  static async loadPatterns(): Promise<{ patterns: RegexPattern[]; activeId: string | null }> {
    try {
      const result = (await chrome.storage.sync.get([
        'regexPatterns',
        'activePatternId',
      ])) as StorageData;
      
      return {
        patterns: result.regexPatterns || [],
        activeId: result.activePatternId || null,
      };
    } catch (error) {
      console.error('Failed to load patterns:', error);
      return {
        patterns: [],
        activeId: null,
      };
    }
  }

  static async savePatterns(patterns: RegexPattern[], activeId: string | null): Promise<void> {
    try {
      await chrome.storage.sync.set({
        regexPatterns: patterns,
        activePatternId: activeId,
      });
    } catch (error) {
      console.error('Failed to save patterns:', error);
      throw error;
    }
  }

  static async getActivePattern(): Promise<RegexPattern | null> {
    try {
      const { patterns, activeId } = await this.loadPatterns();
      if (!activeId) return null;
      
      return patterns.find(p => p.id === activeId) || null;
    } catch (error) {
      console.error('Failed to get active pattern:', error);
      return null;
    }
  }
}