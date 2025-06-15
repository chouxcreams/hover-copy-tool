// Chrome API のモック
export const mockChromeStorage = {
  sync: {
    get: (keys: string[] | string) => {
      return Promise.resolve({
        regexPatterns: [
          {
            id: 'pattern1',
            name: 'User ID',
            regex: 'user/(\\d+)',
            createdAt: 1671234567890,
          },
          {
            id: 'pattern2',
            name: 'Post ID',
            regex: 'post/(\\d+)',
            createdAt: 1671234567891,
          },
        ],
        activePatternId: 'pattern1',
      });
    },
    set: (data: any) => {
      console.log('Mock chrome.storage.sync.set called with:', data);
      return Promise.resolve();
    },
  },
  onChanged: {
    addListener: (callback: Function) => {
      console.log('Mock chrome.storage.onChanged.addListener called');
    },
  },
};

// グローバルにChrome APIモックを設定
(global as any).chrome = {
  storage: mockChromeStorage,
};

export default mockChromeStorage;