import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PageTransition, StaggerContainer, StaggerItem, AnimatedCard } from './page-transition'

describe('Page Transition Components', () => {
  describe('PageTransition', () => {
    it('should render children', () => {
      render(
        <PageTransition>
          <div data-testid="content">Page content</div>
        </PageTransition>
      )

      expect(screen.getByTestId('content')).toBeInTheDocument()
      expect(screen.getByTestId('content')).toHaveTextContent('Page content')
    })

    it('should apply custom className', () => {
      render(
        <PageTransition className="custom-class">
          <div>Content</div>
        </PageTransition>
      )

      // The className is passed to motion.div
      const container = screen.getByText('Content').parentElement
      expect(container?.className).toContain('custom-class')
    })

    it('should render nested elements', () => {
      render(
        <PageTransition>
          <div>
            <h1>Title</h1>
            <p>Paragraph</p>
          </div>
        </PageTransition>
      )

      expect(screen.getByText('Title')).toBeInTheDocument()
      expect(screen.getByText('Paragraph')).toBeInTheDocument()
    })
  })

  describe('StaggerContainer', () => {
    it('should render children', () => {
      render(
        <StaggerContainer>
          <div data-testid="item1">Item 1</div>
          <div data-testid="item2">Item 2</div>
        </StaggerContainer>
      )

      expect(screen.getByTestId('item1')).toBeInTheDocument()
      expect(screen.getByTestId('item2')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      render(
        <StaggerContainer className="grid grid-cols-3">
          <div>Content</div>
        </StaggerContainer>
      )

      const container = screen.getByText('Content').parentElement
      expect(container?.className).toContain('grid')
      expect(container?.className).toContain('grid-cols-3')
    })

    it('should render multiple StaggerItems as children', () => {
      render(
        <StaggerContainer>
          <StaggerItem>
            <div data-testid="stagger-1">Stagger 1</div>
          </StaggerItem>
          <StaggerItem>
            <div data-testid="stagger-2">Stagger 2</div>
          </StaggerItem>
          <StaggerItem>
            <div data-testid="stagger-3">Stagger 3</div>
          </StaggerItem>
        </StaggerContainer>
      )

      expect(screen.getByTestId('stagger-1')).toBeInTheDocument()
      expect(screen.getByTestId('stagger-2')).toBeInTheDocument()
      expect(screen.getByTestId('stagger-3')).toBeInTheDocument()
    })
  })

  describe('StaggerItem', () => {
    it('should render children', () => {
      render(
        <StaggerItem>
          <div data-testid="item">Stagger item content</div>
        </StaggerItem>
      )

      expect(screen.getByTestId('item')).toBeInTheDocument()
      expect(screen.getByTestId('item')).toHaveTextContent('Stagger item content')
    })

    it('should apply custom className', () => {
      render(
        <StaggerItem className="p-4">
          <div>Content</div>
        </StaggerItem>
      )

      const container = screen.getByText('Content').parentElement
      expect(container?.className).toContain('p-4')
    })
  })

  describe('AnimatedCard', () => {
    it('should render children', () => {
      render(
        <AnimatedCard>
          <div data-testid="card-content">Card content</div>
        </AnimatedCard>
      )

      expect(screen.getByTestId('card-content')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      render(
        <AnimatedCard className="w-full">
          <div>Content</div>
        </AnimatedCard>
      )

      const container = screen.getByText('Content').parentElement
      expect(container?.className).toContain('w-full')
    })

    it('should render complex card content', () => {
      render(
        <AnimatedCard>
          <div className="p-4">
            <h2>Card Title</h2>
            <p>Card description</p>
            <button>Action</button>
          </div>
        </AnimatedCard>
      )

      expect(screen.getByText('Card Title')).toBeInTheDocument()
      expect(screen.getByText('Card description')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
    })
  })

  describe('Composition', () => {
    it('should work with all components together', () => {
      render(
        <PageTransition>
          <div>
            <h1>Page Title</h1>
            <StaggerContainer className="grid grid-cols-2 gap-4">
              <StaggerItem>
                <AnimatedCard>
                  <div data-testid="card-1">Card 1</div>
                </AnimatedCard>
              </StaggerItem>
              <StaggerItem>
                <AnimatedCard>
                  <div data-testid="card-2">Card 2</div>
                </AnimatedCard>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </PageTransition>
      )

      expect(screen.getByText('Page Title')).toBeInTheDocument()
      expect(screen.getByTestId('card-1')).toBeInTheDocument()
      expect(screen.getByTestId('card-2')).toBeInTheDocument()
    })
  })
})
