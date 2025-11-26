import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Toaster } from './sonner'

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'dark' }),
}))

// Mock sonner
vi.mock('sonner', () => ({
  Toaster: ({ theme, className, icons, style }: {
    theme?: string;
    className?: string;
    icons?: Record<string, React.ReactNode>;
    style?: React.CSSProperties;
  }) => (
    <div
      data-testid="sonner-toaster"
      data-theme={theme}
      className={className}
      style={style}
    >
      {icons && (
        <div data-testid="icons">
          {Object.keys(icons).map((key) => (
            <span key={key} data-testid={`icon-${key}`}>
              {icons[key]}
            </span>
          ))}
        </div>
      )}
    </div>
  ),
}))

describe('Toaster Component', () => {
  describe('rendering', () => {
    it('should render the toaster', () => {
      render(<Toaster />)
      expect(screen.getByTestId('sonner-toaster')).toBeInTheDocument()
    })

    it('should have toaster group class', () => {
      render(<Toaster />)
      expect(screen.getByTestId('sonner-toaster')).toHaveClass('toaster')
      expect(screen.getByTestId('sonner-toaster')).toHaveClass('group')
    })
  })

  describe('theme', () => {
    it('should pass theme from useTheme', () => {
      render(<Toaster />)
      expect(screen.getByTestId('sonner-toaster')).toHaveAttribute('data-theme', 'dark')
    })
  })

  describe('icons', () => {
    it('should render success icon', () => {
      render(<Toaster />)
      expect(screen.getByTestId('icon-success')).toBeInTheDocument()
    })

    it('should render info icon', () => {
      render(<Toaster />)
      expect(screen.getByTestId('icon-info')).toBeInTheDocument()
    })

    it('should render warning icon', () => {
      render(<Toaster />)
      expect(screen.getByTestId('icon-warning')).toBeInTheDocument()
    })

    it('should render error icon', () => {
      render(<Toaster />)
      expect(screen.getByTestId('icon-error')).toBeInTheDocument()
    })

    it('should render loading icon', () => {
      render(<Toaster />)
      expect(screen.getByTestId('icon-loading')).toBeInTheDocument()
    })
  })

  describe('styles', () => {
    it('should have custom CSS variables in style', () => {
      render(<Toaster />)
      const toaster = screen.getByTestId('sonner-toaster')
      expect(toaster).toHaveStyle({
        '--normal-bg': 'var(--popover)',
        '--normal-text': 'var(--popover-foreground)',
        '--normal-border': 'var(--border)',
        '--border-radius': 'var(--radius)',
      })
    })
  })

  describe('props forwarding', () => {
    it('should accept additional props', () => {
      render(<Toaster data-custom="test" />)
      // The component should render without errors
      expect(screen.getByTestId('sonner-toaster')).toBeInTheDocument()
    })
  })
})
