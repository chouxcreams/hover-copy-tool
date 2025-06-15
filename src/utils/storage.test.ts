import { describe, it, expect, vi, beforeEach } from 'vitest'
import { StorageManager } from './storage'

// Mock Chrome storage API
const mockChromeStorage = {
  sync: {
    get: vi.fn(),
    set: vi.fn(),
  },
}

Object.defineProperty(global, 'chrome', {
  value: {
    storage: mockChromeStorage,
  },
  writable: true,
})

const mockPatterns = [
  {
    id: 'pattern1',
    name: 'User ID Pattern',
    regex: '/user/(\\d+)',
    createdAt: 1234567890,
  },
  {
    id: 'pattern2',
    name: 'Product Code Pattern',
    regex: '/product/([A-Z]+\\d+)',
    createdAt: 1234567891,
  },
]

describe('StorageManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loadPatterns', () => {
    it('loads patterns and active ID from storage', async () => {
      mockChromeStorage.sync.get.mockResolvedValue({
        regexPatterns: mockPatterns,
        activePatternId: 'pattern1',
      })

      const result = await StorageManager.loadPatterns()

      expect(result).toEqual({
        patterns: mockPatterns,
        activeId: 'pattern1',
      })
      
      expect(mockChromeStorage.sync.get).toHaveBeenCalledWith([
        'regexPatterns',
        'activePatternId',
      ])
    })

    it('returns defaults when storage is empty', async () => {
      mockChromeStorage.sync.get.mockResolvedValue({})

      const result = await StorageManager.loadPatterns()

      expect(result).toEqual({
        patterns: [],
        activeId: null,
      })
    })

    it('handles storage errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockChromeStorage.sync.get.mockRejectedValue(new Error('Storage error'))

      const result = await StorageManager.loadPatterns()

      expect(result).toEqual({
        patterns: [],
        activeId: null,
      })
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to load patterns:',
        expect.any(Error)
      )
      
      consoleErrorSpy.mockRestore()
    })

    it('handles partial storage data', async () => {
      mockChromeStorage.sync.get.mockResolvedValue({
        regexPatterns: mockPatterns,
        // activePatternId is missing
      })

      const result = await StorageManager.loadPatterns()

      expect(result).toEqual({
        patterns: mockPatterns,
        activeId: null,
      })
    })
  })

  describe('savePatterns', () => {
    it('saves patterns and active ID to storage', async () => {
      mockChromeStorage.sync.set.mockResolvedValue(undefined)

      await StorageManager.savePatterns(mockPatterns, 'pattern2')

      expect(mockChromeStorage.sync.set).toHaveBeenCalledWith({
        regexPatterns: mockPatterns,
        activePatternId: 'pattern2',
      })
    })

    it('saves with null active ID', async () => {
      mockChromeStorage.sync.set.mockResolvedValue(undefined)

      await StorageManager.savePatterns(mockPatterns, null)

      expect(mockChromeStorage.sync.set).toHaveBeenCalledWith({
        regexPatterns: mockPatterns,
        activePatternId: null,
      })
    })

    it('saves empty patterns array', async () => {
      mockChromeStorage.sync.set.mockResolvedValue(undefined)

      await StorageManager.savePatterns([], null)

      expect(mockChromeStorage.sync.set).toHaveBeenCalledWith({
        regexPatterns: [],
        activePatternId: null,
      })
    })

    it('throws error when storage fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const storageError = new Error('Storage error')
      mockChromeStorage.sync.set.mockRejectedValue(storageError)

      await expect(StorageManager.savePatterns(mockPatterns, 'pattern1'))
        .rejects.toThrow('Storage error')

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to save patterns:',
        storageError
      )
      
      consoleErrorSpy.mockRestore()
    })
  })

  describe('getActivePattern', () => {
    it('returns active pattern when found', async () => {
      mockChromeStorage.sync.get.mockResolvedValue({
        regexPatterns: mockPatterns,
        activePatternId: 'pattern2',
      })

      const result = await StorageManager.getActivePattern()

      expect(result).toEqual(mockPatterns[1])
    })

    it('returns null when no active pattern ID', async () => {
      mockChromeStorage.sync.get.mockResolvedValue({
        regexPatterns: mockPatterns,
        activePatternId: null,
      })

      const result = await StorageManager.getActivePattern()

      expect(result).toBeNull()
    })

    it('returns null when active pattern not found', async () => {
      mockChromeStorage.sync.get.mockResolvedValue({
        regexPatterns: mockPatterns,
        activePatternId: 'nonexistent',
      })

      const result = await StorageManager.getActivePattern()

      expect(result).toBeNull()
    })

    it('returns null when patterns array is empty', async () => {
      mockChromeStorage.sync.get.mockResolvedValue({
        regexPatterns: [],
        activePatternId: 'pattern1',
      })

      const result = await StorageManager.getActivePattern()

      expect(result).toBeNull()
    })

    it('handles storage errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockChromeStorage.sync.get.mockRejectedValue(new Error('Storage error'))

      const result = await StorageManager.getActivePattern()

      expect(result).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to load patterns:',
        expect.any(Error)
      )
      
      consoleErrorSpy.mockRestore()
    })
  })
})