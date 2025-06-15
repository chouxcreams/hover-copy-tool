import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PopupApp from './PopupApp'

// Mock Chrome storage API
const mockChromeStorage = {
  sync: {
    get: vi.fn(),
    set: vi.fn(),
  },
  onChanged: {
    addListener: vi.fn(),
  },
}

// Mock window.confirm and window.alert
const mockConfirm = vi.fn()
const mockAlert = vi.fn()

Object.defineProperty(global, 'chrome', {
  value: {
    storage: mockChromeStorage,
  },
  writable: true,
})

Object.defineProperty(global, 'confirm', {
  value: mockConfirm,
  writable: true,
})

Object.defineProperty(global, 'alert', {
  value: mockAlert,
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

describe('PopupApp', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockChromeStorage.sync.get.mockResolvedValue({
      regexPatterns: mockPatterns,
      activePatternId: 'pattern1',
    })
    mockChromeStorage.sync.set.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders header correctly', async () => {
    render(<PopupApp />)
    
    expect(screen.getByText('Hover Copy Tool')).toBeInTheDocument()
    expect(screen.getByText('正規表現パターンの設定')).toBeInTheDocument()
  })

  it('loads and displays patterns from storage', async () => {
    render(<PopupApp />)
    
    await waitFor(() => {
      expect(screen.getByText('User ID Pattern')).toBeInTheDocument()
      expect(screen.getByText('Product Code Pattern')).toBeInTheDocument()
    })
    
    expect(screen.getByText('/user/(\\d+)')).toBeInTheDocument()
    expect(screen.getByText('/product/([A-Z]+\\d+)')).toBeInTheDocument()
  })

  it('shows active pattern correctly', async () => {
    render(<PopupApp />)
    
    await waitFor(() => {
      const activePattern = screen.getByText('User ID Pattern').closest('.pattern-item')
      expect(activePattern).toHaveClass('active')
      
      const activeButton = activePattern?.querySelector('button')
      expect(activeButton).toHaveTextContent('使用中')
      expect(activeButton).toBeDisabled()
    })
  })

  it('shows no patterns message when empty', async () => {
    mockChromeStorage.sync.get.mockResolvedValue({
      regexPatterns: [],
      activePatternId: null,
    })
    
    render(<PopupApp />)
    
    await waitFor(() => {
      expect(screen.getByText('パターンが登録されていません')).toBeInTheDocument()
    })
  })

  it('toggles form visibility when add button is clicked', async () => {
    render(<PopupApp />)
    
    await waitFor(() => {
      expect(screen.getByText('新しいパターンを追加')).toBeInTheDocument()
    })
    
    const toggleButton = screen.getByText('新しいパターンを追加')
    fireEvent.click(toggleButton)
    
    expect(screen.getByText('フォームを閉じる')).toBeInTheDocument()
    expect(screen.getByLabelText('パターン名:')).toBeInTheDocument()
    expect(screen.getByLabelText('正規表現:')).toBeInTheDocument()
  })

  it('submits new pattern with valid data', async () => {
    render(<PopupApp />)
    
    await waitFor(() => {
      const toggleButton = screen.getByText('新しいパターンを追加')
      fireEvent.click(toggleButton)
    })
    
    const nameInput = screen.getByLabelText('パターン名:')
    const regexInput = screen.getByLabelText('正規表現:')
    const submitButton = screen.getByText('保存')
    
    fireEvent.change(nameInput, { target: { value: 'Test Pattern' } })
    fireEvent.change(regexInput, { target: { value: 'test-\\d+' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockChromeStorage.sync.set).toHaveBeenCalledWith(
        expect.objectContaining({
          regexPatterns: expect.arrayContaining([
            expect.objectContaining({
              name: 'Test Pattern',
              regex: 'test-\\d+',
            }),
          ]),
        })
      )
    })
  })

  it('shows error for invalid regex', async () => {
    render(<PopupApp />)
    
    await waitFor(() => {
      const toggleButton = screen.getByText('新しいパターンを追加')
      fireEvent.click(toggleButton)
    })
    
    const nameInput = screen.getByLabelText('パターン名:')
    const regexInput = screen.getByLabelText('正規表現:')
    const submitButton = screen.getByText('保存')
    
    fireEvent.change(nameInput, { target: { value: 'Invalid Pattern' } })
    fireEvent.change(regexInput, { target: { value: '[invalid regex' } })
    fireEvent.click(submitButton)
    
    expect(mockAlert).toHaveBeenCalledWith('正規表現が無効です。正しい形式で入力してください。')
  })

  it('shows error for empty fields', async () => {
    render(<PopupApp />)
    
    await waitFor(() => {
      const toggleButton = screen.getByText('新しいパターンを追加')
      fireEvent.click(toggleButton)
    })
    
    const submitButton = screen.getByText('保存')
    fireEvent.click(submitButton)
    
    expect(mockAlert).toHaveBeenCalledWith('パターン名と正規表現を入力してください。')
  })

  it('activates pattern when use button is clicked', async () => {
    render(<PopupApp />)
    
    await waitFor(() => {
      const productPattern = screen.getByText('Product Code Pattern').closest('.pattern-item')
      const useButton = productPattern?.querySelector('button')
      if (useButton && useButton.textContent === '使用') {
        fireEvent.click(useButton)
      }
    })
    
    await waitFor(() => {
      expect(mockChromeStorage.sync.set).toHaveBeenCalledWith(
        expect.objectContaining({
          activePatternId: 'pattern2',
        })
      )
    })
  })

  it('opens edit form with pattern data', async () => {
    render(<PopupApp />)
    
    await waitFor(() => {
      const editButtons = screen.getAllByText('編集')
      fireEvent.click(editButtons[0])
    })
    
    expect(screen.getByDisplayValue('User ID Pattern')).toBeInTheDocument()
    expect(screen.getByDisplayValue('/user/(\\d+)')).toBeInTheDocument()
  })

  it('deletes pattern with confirmation', async () => {
    mockConfirm.mockReturnValue(true)
    
    render(<PopupApp />)
    
    await waitFor(() => {
      const deleteButtons = screen.getAllByText('削除')
      fireEvent.click(deleteButtons[0])
    })
    
    expect(mockConfirm).toHaveBeenCalledWith('このパターンを削除しますか？')
    
    await waitFor(() => {
      expect(mockChromeStorage.sync.set).toHaveBeenCalledWith(
        expect.objectContaining({
          regexPatterns: expect.arrayContaining([
            expect.objectContaining({
              id: 'pattern2',
            }),
          ]),
        })
      )
    })
  })

  it('cancels delete when confirmation is rejected', async () => {
    mockConfirm.mockReturnValue(false)
    
    render(<PopupApp />)
    
    await waitFor(() => {
      const deleteButtons = screen.getAllByText('削除')
      fireEvent.click(deleteButtons[0])
    })
    
    expect(mockConfirm).toHaveBeenCalledWith('このパターンを削除しますか？')
    expect(mockChromeStorage.sync.set).not.toHaveBeenCalled()
  })

  it('handles storage errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockChromeStorage.sync.get.mockRejectedValue(new Error('Storage error'))
    
    render(<PopupApp />)
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load patterns:', expect.any(Error))
    })
    
    consoleErrorSpy.mockRestore()
  })
})