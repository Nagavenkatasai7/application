import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryProvider } from './query-provider'
import { useQuery } from '@tanstack/react-query'

// Test component that uses query
function TestQueryConsumer() {
  const { data, isLoading } = useQuery({
    queryKey: ['test'],
    queryFn: () => Promise.resolve('test-data'),
  })

  if (isLoading) return <div>Loading...</div>
  return <div data-testid="result">{data}</div>
}

describe('QueryProvider Component', () => {
  describe('rendering', () => {
    it('should render children', () => {
      render(
        <QueryProvider>
          <div data-testid="child">Child content</div>
        </QueryProvider>
      )

      expect(screen.getByTestId('child')).toBeInTheDocument()
      expect(screen.getByTestId('child')).toHaveTextContent('Child content')
    })

    it('should render multiple children', () => {
      render(
        <QueryProvider>
          <div data-testid="child1">Child 1</div>
          <div data-testid="child2">Child 2</div>
        </QueryProvider>
      )

      expect(screen.getByTestId('child1')).toBeInTheDocument()
      expect(screen.getByTestId('child2')).toBeInTheDocument()
    })
  })

  describe('QueryClient configuration', () => {
    it('should provide QueryClient to children', async () => {
      render(
        <QueryProvider>
          <TestQueryConsumer />
        </QueryProvider>
      )

      // Initially loading
      expect(screen.getByText('Loading...')).toBeInTheDocument()

      // Wait for query to resolve
      const result = await screen.findByTestId('result')
      expect(result).toHaveTextContent('test-data')
    })
  })

  describe('nested usage', () => {
    it('should support nested components', () => {
      render(
        <QueryProvider>
          <div>
            <header>Header</header>
            <main data-testid="main">
              <section>Content</section>
            </main>
            <footer>Footer</footer>
          </div>
        </QueryProvider>
      )

      expect(screen.getByTestId('main')).toBeInTheDocument()
      expect(screen.getByText('Header')).toBeInTheDocument()
      expect(screen.getByText('Content')).toBeInTheDocument()
      expect(screen.getByText('Footer')).toBeInTheDocument()
    })
  })
})
