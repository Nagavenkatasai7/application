import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Skeleton } from './skeleton'

describe('Skeleton Component', () => {
  describe('rendering', () => {
    it('should render a skeleton div', () => {
      render(<Skeleton data-testid="skeleton" />)
      expect(screen.getByTestId('skeleton')).toBeInTheDocument()
      expect(screen.getByTestId('skeleton').tagName).toBe('DIV')
    })

    it('should have data-slot attribute', () => {
      render(<Skeleton data-testid="skeleton" />)
      expect(screen.getByTestId('skeleton')).toHaveAttribute('data-slot', 'skeleton')
    })
  })

  describe('styling', () => {
    it('should have animate-pulse class', () => {
      render(<Skeleton data-testid="skeleton" />)
      expect(screen.getByTestId('skeleton').className).toContain('animate-pulse')
    })

    it('should have rounded-md class', () => {
      render(<Skeleton data-testid="skeleton" />)
      expect(screen.getByTestId('skeleton').className).toContain('rounded-md')
    })

    it('should have bg-accent class', () => {
      render(<Skeleton data-testid="skeleton" />)
      expect(screen.getByTestId('skeleton').className).toContain('bg-accent')
    })
  })

  describe('className merging', () => {
    it('should merge custom className with default classes', () => {
      render(<Skeleton data-testid="skeleton" className="h-4 w-full" />)
      const skeleton = screen.getByTestId('skeleton')
      expect(skeleton.className).toContain('h-4')
      expect(skeleton.className).toContain('w-full')
      expect(skeleton.className).toContain('animate-pulse')
    })

    it('should allow custom width and height', () => {
      render(<Skeleton data-testid="skeleton" className="h-12 w-48" />)
      const skeleton = screen.getByTestId('skeleton')
      expect(skeleton.className).toContain('h-12')
      expect(skeleton.className).toContain('w-48')
    })
  })

  describe('composition', () => {
    it('should render multiple skeletons in a row', () => {
      render(
        <div data-testid="container">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      )
      const skeletons = screen.getByTestId('container').querySelectorAll('[data-slot="skeleton"]')
      expect(skeletons).toHaveLength(3)
    })

    it('should work as card skeleton', () => {
      render(
        <div className="flex flex-col space-y-3">
          <Skeleton data-testid="image" className="h-[125px] w-[250px] rounded-xl" />
          <div className="space-y-2">
            <Skeleton data-testid="title" className="h-4 w-[250px]" />
            <Skeleton data-testid="description" className="h-4 w-[200px]" />
          </div>
        </div>
      )
      expect(screen.getByTestId('image')).toBeInTheDocument()
      expect(screen.getByTestId('title')).toBeInTheDocument()
      expect(screen.getByTestId('description')).toBeInTheDocument()
    })
  })

  describe('props passing', () => {
    it('should pass additional props to the div', () => {
      render(<Skeleton data-testid="skeleton" id="my-skeleton" />)
      expect(screen.getByTestId('skeleton')).toHaveAttribute('id', 'my-skeleton')
    })

    it('should support aria attributes', () => {
      render(<Skeleton data-testid="skeleton" aria-label="Loading content" />)
      expect(screen.getByTestId('skeleton')).toHaveAttribute('aria-label', 'Loading content')
    })
  })
})
