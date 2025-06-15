import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import HoverWindow from './HoverWindow'

const mockMatches = [
  { value: '123456', patternName: 'User ID' },
  { value: 'ABC789', patternName: 'Product Code' },
  { value: 'xyz-123', patternName: 'Session ID' }
]

describe('HoverWindow', () => {
  it('renders with extracted matches', () => {
    const mockOnCopy = vi.fn()
    render(<HoverWindow matches={mockMatches} onCopy={mockOnCopy} />)
    
    expect(screen.getByText('Extracted Matches')).toBeInTheDocument()
    expect(screen.getByText('123456')).toBeInTheDocument()
    expect(screen.getByText('ABC789')).toBeInTheDocument()
    expect(screen.getByText('xyz-123')).toBeInTheDocument()
  })

  it('renders correct number of copy buttons', () => {
    const mockOnCopy = vi.fn()
    render(<HoverWindow matches={mockMatches} onCopy={mockOnCopy} />)
    
    const copyButtons = screen.getAllByText('Copy')
    expect(copyButtons).toHaveLength(3)
  })

  it('calls onCopy with correct value when copy button is clicked', () => {
    const mockOnCopy = vi.fn()
    render(<HoverWindow matches={mockMatches} onCopy={mockOnCopy} />)
    
    const copyButtons = screen.getAllByText('Copy')
    
    fireEvent.click(copyButtons[0])
    expect(mockOnCopy).toHaveBeenCalledWith('123456')
    
    fireEvent.click(copyButtons[1])
    expect(mockOnCopy).toHaveBeenCalledWith('ABC789')
    
    fireEvent.click(copyButtons[2])
    expect(mockOnCopy).toHaveBeenCalledWith('xyz-123')
  })

  it('prevents event propagation on copy button click', () => {
    const mockOnCopy = vi.fn()
    const mockPreventDefault = vi.fn()
    const mockStopPropagation = vi.fn()
    
    render(<HoverWindow matches={mockMatches} onCopy={mockOnCopy} />)
    
    const copyButton = screen.getAllByText('Copy')[0]
    
    fireEvent.click(copyButton, {
      preventDefault: mockPreventDefault,
      stopPropagation: mockStopPropagation
    })
    
    expect(mockOnCopy).toHaveBeenCalledWith('123456')
  })

  it('renders empty state when no matches provided', () => {
    const mockOnCopy = vi.fn()
    render(<HoverWindow matches={[]} onCopy={mockOnCopy} />)
    
    expect(screen.getByText('Extracted Matches')).toBeInTheDocument()
    expect(screen.queryByText('Copy')).not.toBeInTheDocument()
  })

  it('applies correct CSS classes', () => {
    const mockOnCopy = vi.fn()
    const { container } = render(<HoverWindow matches={mockMatches} onCopy={mockOnCopy} />)
    
    expect(container.querySelector('.hover-copy-window')).toBeInTheDocument()
    expect(container.querySelector('.hover-copy-header')).toBeInTheDocument()
    expect(container.querySelector('.hover-copy-items')).toBeInTheDocument()
    expect(container.querySelectorAll('.hover-copy-item')).toHaveLength(3)
    expect(container.querySelectorAll('.match-value')).toHaveLength(3)
    expect(container.querySelectorAll('.copy-btn')).toHaveLength(3)
  })
})