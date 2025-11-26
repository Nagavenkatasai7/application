import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from './input'

describe('Input Component', () => {
  describe('rendering', () => {
    it('should render an input element', () => {
      render(<Input data-testid="input" />)
      expect(screen.getByTestId('input')).toBeInTheDocument()
      expect(screen.getByTestId('input').tagName).toBe('INPUT')
    })

    it('should have data-slot attribute', () => {
      render(<Input data-testid="input" />)
      expect(screen.getByTestId('input')).toHaveAttribute('data-slot', 'input')
    })

    it('should render with placeholder', () => {
      render(<Input placeholder="Enter your name" />)
      expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument()
    })
  })

  describe('types', () => {
    it('should render text input by default', () => {
      render(<Input data-testid="input" />)
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'text')
    })

    it('should render email input', () => {
      render(<Input data-testid="input" type="email" />)
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'email')
    })

    it('should render password input', () => {
      render(<Input data-testid="input" type="password" />)
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'password')
    })

    it('should render number input', () => {
      render(<Input data-testid="input" type="number" />)
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'number')
    })

    it('should render file input', () => {
      render(<Input data-testid="input" type="file" />)
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'file')
    })
  })

  describe('interactions', () => {
    it('should handle value changes', async () => {
      const user = userEvent.setup()
      render(<Input data-testid="input" />)
      const input = screen.getByTestId('input')

      await user.type(input, 'Hello World')
      expect(input).toHaveValue('Hello World')
    })

    it('should call onChange handler', async () => {
      const handleChange = vi.fn()
      const user = userEvent.setup()
      render(<Input data-testid="input" onChange={handleChange} />)

      await user.type(screen.getByTestId('input'), 'a')
      expect(handleChange).toHaveBeenCalled()
    })

    it('should handle onBlur event', () => {
      const handleBlur = vi.fn()
      render(<Input data-testid="input" onBlur={handleBlur} />)

      fireEvent.blur(screen.getByTestId('input'))
      expect(handleBlur).toHaveBeenCalled()
    })

    it('should handle onFocus event', () => {
      const handleFocus = vi.fn()
      render(<Input data-testid="input" onFocus={handleFocus} />)

      fireEvent.focus(screen.getByTestId('input'))
      expect(handleFocus).toHaveBeenCalled()
    })
  })

  describe('disabled state', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Input data-testid="input" disabled />)
      expect(screen.getByTestId('input')).toBeDisabled()
    })

    it('should not allow input when disabled', async () => {
      const user = userEvent.setup()
      render(<Input data-testid="input" disabled />)
      const input = screen.getByTestId('input')

      await user.type(input, 'test')
      expect(input).toHaveValue('')
    })
  })

  describe('className merging', () => {
    it('should merge custom className with default classes', () => {
      render(<Input data-testid="input" className="custom-input" />)
      const input = screen.getByTestId('input')
      expect(input.className).toContain('custom-input')
      expect(input.className).toContain('rounded-md')
    })
  })

  describe('styling', () => {
    it('should have height class', () => {
      render(<Input data-testid="input" />)
      expect(screen.getByTestId('input').className).toContain('h-9')
    })

    it('should have rounded-md class', () => {
      render(<Input data-testid="input" />)
      expect(screen.getByTestId('input').className).toContain('rounded-md')
    })

    it('should have border class', () => {
      render(<Input data-testid="input" />)
      expect(screen.getByTestId('input').className).toContain('border')
    })
  })

  describe('controlled input', () => {
    it('should work as controlled input', () => {
      const { rerender } = render(<Input data-testid="input" value="initial" onChange={() => {}} />)
      expect(screen.getByTestId('input')).toHaveValue('initial')

      rerender(<Input data-testid="input" value="updated" onChange={() => {}} />)
      expect(screen.getByTestId('input')).toHaveValue('updated')
    })
  })

  describe('aria attributes', () => {
    it('should support aria-label', () => {
      render(<Input data-testid="input" aria-label="Name input" />)
      expect(screen.getByTestId('input')).toHaveAttribute('aria-label', 'Name input')
    })

    it('should support aria-invalid', () => {
      render(<Input data-testid="input" aria-invalid="true" />)
      expect(screen.getByTestId('input')).toHaveAttribute('aria-invalid', 'true')
    })
  })
})
