import { describe, it, expect, vi } from 'vitest'
import { UrlExtractor } from './urlExtractor'

const mockPatterns = [
  {
    id: 'pattern1',
    name: 'User ID',
    regex: '/user/(\\d+)',
    createdAt: 1234567890,
  },
  {
    id: 'pattern2',
    name: 'Product Code',
    regex: '/product/([A-Z]+\\d+)',
    createdAt: 1234567891,
  },
  {
    id: 'pattern3',
    name: 'Session ID',
    regex: 'session=([a-f0-9-]+)',
    createdAt: 1234567892,
  },
]

describe('UrlExtractor', () => {
  describe('extractMatches', () => {
    it('extracts matches with capture groups', () => {
      const url = 'https://example.com/user/12345/profile'
      const matches = UrlExtractor.extractMatches(url, [mockPatterns[0]])
      
      expect(matches).toEqual([
        { value: '12345', patternName: 'User ID' }
      ])
    })

    it('extracts multiple matches from single pattern', () => {
      const url = 'https://example.com/user/123/user/456'
      const pattern = {
        id: 'multi',
        name: 'User IDs',
        regex: '/user/(\\d+)',
        createdAt: Date.now(),
      }
      
      const matches = UrlExtractor.extractMatches(url, [pattern])
      
      expect(matches).toHaveLength(2)
      expect(matches[0].value).toBe('123')
      expect(matches[1].value).toBe('456')
    })

    it('extracts matches from multiple patterns', () => {
      const url = 'https://example.com/user/123/product/ABC456?session=a1b2c3d4-e5f6'
      const matches = UrlExtractor.extractMatches(url, mockPatterns)
      
      expect(matches).toHaveLength(3)
      expect(matches.find(m => m.patternName === 'User ID')?.value).toBe('123')
      expect(matches.find(m => m.patternName === 'Product Code')?.value).toBe('ABC456')
      expect(matches.find(m => m.patternName === 'Session ID')?.value).toBe('a1b2c3d4-e5f6')
    })

    it('returns full match when no capture groups', () => {
      const url = 'https://example.com/api/v1/users'
      const pattern = {
        id: 'api',
        name: 'API Path',
        regex: '/api/v\\d+/\\w+',
        createdAt: Date.now(),
      }
      
      const matches = UrlExtractor.extractMatches(url, [pattern])
      
      expect(matches).toEqual([
        { value: '/api/v1/users', patternName: 'API Path' }
      ])
    })

    it('returns empty array when no matches found', () => {
      const url = 'https://example.com/about'
      const matches = UrlExtractor.extractMatches(url, mockPatterns)
      
      expect(matches).toEqual([])
    })

    it('handles invalid regex patterns gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const invalidPattern = {
        id: 'invalid',
        name: 'Invalid Pattern',
        regex: '[invalid',
        createdAt: Date.now(),
      }
      
      const url = 'https://example.com/test'
      const matches = UrlExtractor.extractMatches(url, [invalidPattern])
      
      expect(matches).toEqual([])
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Invalid regex pattern:',
        '[invalid',
        expect.any(Error)
      )
      
      consoleErrorSpy.mockRestore()
    })

    it('prevents infinite loops with zero-length matches', () => {
      const pattern = {
        id: 'zero-length',
        name: 'Zero Length',
        regex: '(?=)',
        createdAt: Date.now(),
      }
      
      const url = 'test'
      const matches = UrlExtractor.extractMatches(url, [pattern])
      
      // Should not hang and should handle gracefully
      expect(Array.isArray(matches)).toBe(true)
    })

    it('handles multiple capture groups correctly', () => {
      const pattern = {
        id: 'multi-capture',
        name: 'Multi Capture',
        regex: '/user/(\\d+)/post/(\\d+)',
        createdAt: Date.now(),
      }
      
      const url = 'https://example.com/user/123/post/456'
      const matches = UrlExtractor.extractMatches(url, [pattern])
      
      expect(matches).toHaveLength(1)
      expect(matches[0].value).toBe('123') // First capture group
    })
  })

  describe('validateRegex', () => {
    it('returns true for valid regex patterns', () => {
      expect(UrlExtractor.validateRegex('\\d+')).toBe(true)
      expect(UrlExtractor.validateRegex('[a-zA-Z0-9]+')).toBe(true)
      expect(UrlExtractor.validateRegex('/user/(\\d+)')).toBe(true)
      expect(UrlExtractor.validateRegex('.*')).toBe(true)
    })

    it('returns false for invalid regex patterns', () => {
      expect(UrlExtractor.validateRegex('[')).toBe(false)
      expect(UrlExtractor.validateRegex('(')).toBe(false)
      expect(UrlExtractor.validateRegex('*')).toBe(false)
      expect(UrlExtractor.validateRegex('?')).toBe(false)
    })

    it('handles empty string', () => {
      expect(UrlExtractor.validateRegex('')).toBe(true)
    })
  })

  describe('generateId', () => {
    it('generates unique IDs', () => {
      const id1 = UrlExtractor.generateId()
      const id2 = UrlExtractor.generateId()
      
      expect(id1).not.toBe(id2)
      expect(typeof id1).toBe('string')
      expect(typeof id2).toBe('string')
      expect(id1.length).toBeGreaterThan(0)
      expect(id2.length).toBeGreaterThan(0)
    })

    it('generates IDs with expected format', () => {
      const id = UrlExtractor.generateId()
      
      // Should be alphanumeric characters (base36)
      expect(id).toMatch(/^[a-z0-9]+$/)
    })
  })
})