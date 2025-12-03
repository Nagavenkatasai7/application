import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button, buttonVariants } from './button'

describe('Button Component', () => {
  describe('rendering', () => {
    it('should render a button with text', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
    })

    it('should render with data-slot attribute', () => {
      render(<Button>Test</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('data-slot', 'button')
    })

    it('should pass additional props to the button', () => {
      render(<Button data-testid="test-button">Test</Button>)
      expect(screen.getByTestId('test-button')).toBeInTheDocument()
    })
  })

  describe('variants', () => {
    it('should render default variant', () => {
      render(<Button variant="default">Default</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('bg-primary')
    })

    it('should render destructive variant', () => {
      render(<Button variant="destructive">Destructive</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('bg-destructive')
    })

    it('should render outline variant', () => {
      render(<Button variant="outline">Outline</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('border')
    })

    it('should render secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('bg-secondary')
    })

    it('should render ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('hover:bg-accent')
    })

    it('should render link variant', () => {
      render(<Button variant="link">Link</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('text-primary')
      expect(button.className).toContain('underline-offset-4')
    })
  })

  describe('sizes', () => {
    it('should render default size', () => {
      render(<Button size="default">Default</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('h-10')
    })

    it('should render small size', () => {
      render(<Button size="sm">Small</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('h-9')
    })

    it('should render large size', () => {
      render(<Button size="lg">Large</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('h-12')
    })

    it('should render icon size', () => {
      render(<Button size="icon">Icon</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('size-10')
    })
  })

  describe('asChild', () => {
    it('should render as a Slot when asChild is true', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      )
      expect(screen.getByRole('link', { name: 'Link Button' })).toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('should call onClick handler when clicked', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Click me</Button>)
      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should not call onClick when disabled', () => {
      const handleClick = vi.fn()
      render(
        <Button onClick={handleClick} disabled>
          Disabled
        </Button>
      )
      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('should have disabled state when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })
  })

  describe('className merging', () => {
    it('should merge custom className with default classes', () => {
      render(<Button className="custom-class">Test</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('custom-class')
      expect(button.className).toContain('inline-flex')
    })
  })

  describe('buttonVariants', () => {
    it('should export buttonVariants function', () => {
      expect(buttonVariants).toBeDefined()
      expect(typeof buttonVariants).toBe('function')
    })

    it('should generate correct class string', () => {
      const classes = buttonVariants({ variant: 'default', size: 'default' })
      expect(classes).toContain('bg-primary')
      expect(classes).toContain('h-10')
    })
  })
})
