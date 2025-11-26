import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Separator } from './separator'

describe('Separator Component', () => {
  describe('rendering', () => {
    it('should render a separator', () => {
      render(<Separator data-testid="separator" />)
      expect(screen.getByTestId('separator')).toBeInTheDocument()
    })

    it('should have data-slot attribute', () => {
      render(<Separator data-testid="separator" />)
      expect(screen.getByTestId('separator')).toHaveAttribute('data-slot', 'separator')
    })

    it('should have role none when decorative (default)', () => {
      render(<Separator data-testid="separator" />)
      // When decorative is true (default), role is none
      expect(screen.getByTestId('separator')).toHaveAttribute('role', 'none')
    })
  })

  describe('orientation', () => {
    it('should be horizontal by default', () => {
      render(<Separator data-testid="separator" />)
      expect(screen.getByTestId('separator')).toHaveAttribute('data-orientation', 'horizontal')
    })

    it('should support horizontal orientation', () => {
      render(<Separator data-testid="separator" orientation="horizontal" />)
      expect(screen.getByTestId('separator')).toHaveAttribute('data-orientation', 'horizontal')
    })

    it('should support vertical orientation', () => {
      render(<Separator data-testid="separator" orientation="vertical" />)
      expect(screen.getByTestId('separator')).toHaveAttribute('data-orientation', 'vertical')
    })
  })

  describe('decorative', () => {
    it('should be decorative by default with role none', () => {
      render(<Separator data-testid="separator" />)
      // When decorative is true (default), role should be none
      const separator = screen.getByTestId('separator')
      expect(separator).toHaveAttribute('role', 'none')
    })

    it('should have separator role when decorative is false', () => {
      render(<Separator data-testid="separator" decorative={false} />)
      const separator = screen.getByTestId('separator')
      expect(separator).toHaveAttribute('role', 'separator')
    })
  })

  describe('styling', () => {
    it('should have shrink-0 class', () => {
      render(<Separator data-testid="separator" />)
      expect(screen.getByTestId('separator').className).toContain('shrink-0')
    })

    it('should have bg-border class', () => {
      render(<Separator data-testid="separator" />)
      expect(screen.getByTestId('separator').className).toContain('bg-border')
    })
  })

  describe('className merging', () => {
    it('should merge custom className', () => {
      render(<Separator data-testid="separator" className="my-4" />)
      const separator = screen.getByTestId('separator')
      expect(separator.className).toContain('my-4')
      expect(separator.className).toContain('shrink-0')
    })
  })

  describe('composition', () => {
    it('should work as a list divider', () => {
      render(
        <div>
          <p>Item 1</p>
          <Separator data-testid="sep1" />
          <p>Item 2</p>
          <Separator data-testid="sep2" />
          <p>Item 3</p>
        </div>
      )
      expect(screen.getByTestId('sep1')).toBeInTheDocument()
      expect(screen.getByTestId('sep2')).toBeInTheDocument()
    })

    it('should work as a vertical divider in flex container', () => {
      render(
        <div className="flex h-5 items-center space-x-4 text-sm">
          <span>Option 1</span>
          <Separator data-testid="separator" orientation="vertical" />
          <span>Option 2</span>
        </div>
      )
      expect(screen.getByTestId('separator')).toHaveAttribute('data-orientation', 'vertical')
    })
  })
})
