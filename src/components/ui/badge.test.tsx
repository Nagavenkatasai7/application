import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge, badgeVariants } from './badge'

describe('Badge Component', () => {
  describe('rendering', () => {
    it('should render a badge with text', () => {
      render(<Badge>New</Badge>)
      expect(screen.getByText('New')).toBeInTheDocument()
    })

    it('should have data-slot attribute', () => {
      render(<Badge data-testid="badge">Test</Badge>)
      expect(screen.getByTestId('badge')).toHaveAttribute('data-slot', 'badge')
    })

    it('should render as a span by default', () => {
      render(<Badge data-testid="badge">Test</Badge>)
      expect(screen.getByTestId('badge').tagName).toBe('SPAN')
    })
  })

  describe('variants', () => {
    it('should render default variant', () => {
      render(<Badge data-testid="badge" variant="default">Default</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge.className).toContain('bg-primary')
    })

    it('should render secondary variant', () => {
      render(<Badge data-testid="badge" variant="secondary">Secondary</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge.className).toContain('bg-secondary')
    })

    it('should render destructive variant', () => {
      render(<Badge data-testid="badge" variant="destructive">Destructive</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge.className).toContain('bg-destructive')
    })

    it('should render outline variant', () => {
      render(<Badge data-testid="badge" variant="outline">Outline</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge.className).toContain('text-foreground')
    })
  })

  describe('asChild', () => {
    it('should render as a Slot when asChild is true', () => {
      render(
        <Badge asChild>
          <a href="/test">Link Badge</a>
        </Badge>
      )
      expect(screen.getByRole('link', { name: 'Link Badge' })).toBeInTheDocument()
    })
  })

  describe('className merging', () => {
    it('should merge custom className with default classes', () => {
      render(<Badge data-testid="badge" className="custom-badge">Test</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge.className).toContain('custom-badge')
      expect(badge.className).toContain('inline-flex')
    })
  })

  describe('badgeVariants', () => {
    it('should export badgeVariants function', () => {
      expect(badgeVariants).toBeDefined()
      expect(typeof badgeVariants).toBe('function')
    })

    it('should generate correct class string for default variant', () => {
      const classes = badgeVariants({ variant: 'default' })
      expect(classes).toContain('bg-primary')
    })

    it('should generate correct class string for secondary variant', () => {
      const classes = badgeVariants({ variant: 'secondary' })
      expect(classes).toContain('bg-secondary')
    })
  })

  describe('styling', () => {
    it('should have rounded-full class', () => {
      render(<Badge data-testid="badge">Test</Badge>)
      expect(screen.getByTestId('badge').className).toContain('rounded-full')
    })

    it('should have text-xs class', () => {
      render(<Badge data-testid="badge">Test</Badge>)
      expect(screen.getByTestId('badge').className).toContain('text-xs')
    })

    it('should have font-medium class', () => {
      render(<Badge data-testid="badge">Test</Badge>)
      expect(screen.getByTestId('badge').className).toContain('font-medium')
    })
  })
})
