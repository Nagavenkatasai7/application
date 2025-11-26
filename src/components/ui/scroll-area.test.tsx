import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ScrollArea } from './scroll-area'

describe('ScrollArea Component', () => {
  describe('rendering', () => {
    it('should render the scroll area', () => {
      render(<ScrollArea data-testid="scroll-area">Content</ScrollArea>)
      expect(screen.getByTestId('scroll-area')).toBeInTheDocument()
    })

    it('should have data-slot attribute', () => {
      render(<ScrollArea data-testid="scroll-area">Content</ScrollArea>)
      expect(screen.getByTestId('scroll-area')).toHaveAttribute('data-slot', 'scroll-area')
    })

    it('should render children', () => {
      render(<ScrollArea>Test Content</ScrollArea>)
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })
  })

  describe('styling', () => {
    it('should have relative class', () => {
      render(<ScrollArea data-testid="scroll-area">Content</ScrollArea>)
      expect(screen.getByTestId('scroll-area').className).toContain('relative')
    })

    it('should merge custom className', () => {
      render(<ScrollArea data-testid="scroll-area" className="my-4 h-64">Content</ScrollArea>)
      const scrollArea = screen.getByTestId('scroll-area')
      expect(scrollArea.className).toContain('my-4')
      expect(scrollArea.className).toContain('h-64')
      expect(scrollArea.className).toContain('relative')
    })
  })

  describe('viewport', () => {
    it('should render viewport with data-slot', () => {
      render(<ScrollArea>Content</ScrollArea>)
      const viewport = document.querySelector('[data-slot="scroll-area-viewport"]')
      expect(viewport).toBeInTheDocument()
    })

    it('should render content inside viewport', () => {
      render(<ScrollArea>Nested Content</ScrollArea>)
      const viewport = document.querySelector('[data-slot="scroll-area-viewport"]')
      expect(viewport?.textContent).toContain('Nested Content')
    })
  })
})

describe('ScrollArea with scrollable content', () => {
  it('should render scrollable content', () => {
    render(
      <ScrollArea data-testid="scroll-area" className="h-64 w-48">
        <div style={{ height: '1000px' }}>
          <p>Scrollable content</p>
        </div>
      </ScrollArea>
    )
    expect(screen.getByTestId('scroll-area')).toBeInTheDocument()
    expect(screen.getByText('Scrollable content')).toBeInTheDocument()
  })

  it('should apply className to root', () => {
    render(
      <ScrollArea data-testid="scroll-area" className="h-64 w-48">
        Content
      </ScrollArea>
    )
    const scrollArea = screen.getByTestId('scroll-area')
    expect(scrollArea.className).toContain('h-64')
    expect(scrollArea.className).toContain('w-48')
  })

  it('should render multiple children', () => {
    render(
      <ScrollArea data-testid="scroll-area">
        <p>Item 1</p>
        <p>Item 2</p>
        <p>Item 3</p>
      </ScrollArea>
    )
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
    expect(screen.getByText('Item 3')).toBeInTheDocument()
  })
})
