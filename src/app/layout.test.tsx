import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import RootLayout, { metadata } from './layout'

// Mock next/font/google
vi.mock('next/font/google', () => ({
  Geist: () => ({
    variable: '--font-geist-sans',
  }),
  Geist_Mono: () => ({
    variable: '--font-geist-mono',
  }),
}))

// Mock the Toaster component
vi.mock('@/components/ui/sonner', () => ({
  Toaster: () => <div data-testid="toaster">Toaster</div>,
}))

// Mock the QueryProvider
vi.mock('@/providers/query-provider', () => ({
  QueryProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="query-provider">{children}</div>
  ),
}))

describe('RootLayout', () => {
  describe('metadata', () => {
    it('should have correct title', () => {
      expect(metadata.title).toBe('Resume Tailor - AI-Powered Resume Optimization')
    })

    it('should have correct description', () => {
      expect(metadata.description).toBe(
        'Create highly optimized, ATS-compliant resumes tailored to specific job descriptions using AI.'
      )
    })
  })

  describe('rendering', () => {
    it('should render children', () => {
      render(
        <RootLayout>
          <div data-testid="child">Child Content</div>
        </RootLayout>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('should render QueryProvider', () => {
      render(
        <RootLayout>
          <div>Content</div>
        </RootLayout>
      )
      expect(screen.getByTestId('query-provider')).toBeInTheDocument()
    })

    it('should render Toaster', () => {
      render(
        <RootLayout>
          <div>Content</div>
        </RootLayout>
      )
      expect(screen.getByTestId('toaster')).toBeInTheDocument()
    })

    it('should render content container', () => {
      const { container } = render(
        <RootLayout>
          <div>Content</div>
        </RootLayout>
      )
      // In jsdom, the html/body structure is handled by the test environment
      // We verify the component renders by checking for content
      expect(container.textContent).toContain('Content')
    })
  })

  describe('provider hierarchy', () => {
    it('should wrap children in QueryProvider', () => {
      render(
        <RootLayout>
          <div data-testid="child">Content</div>
        </RootLayout>
      )
      const queryProvider = screen.getByTestId('query-provider')
      const child = screen.getByTestId('child')
      expect(queryProvider).toContainElement(child)
    })
  })

  describe('component structure', () => {
    it('should render toaster alongside content', () => {
      render(
        <RootLayout>
          <div data-testid="child">Content</div>
        </RootLayout>
      )
      expect(screen.getByTestId('toaster')).toBeInTheDocument()
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })
  })
})
