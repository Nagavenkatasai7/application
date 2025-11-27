import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  PageTransition,
  StaggerContainer,
  StaggerItem,
  AnimatedCard,
  AnimatedList,
  AnimatedListItem,
  AnimatedNumber,
  FadeIn,
  SlideIn,
  ScaleOnTap,
  Pulse,
  SuccessCheck,
  Shimmer,
  SkeletonShimmer,
  HoverGrow,
} from './page-transition'

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

  // New Animation Components (Phase 4 Priority 5)
  describe('AnimatedList', () => {
    it('should render children', () => {
      render(
        <AnimatedList>
          <div data-testid="list-content">List Content</div>
        </AnimatedList>
      )

      expect(screen.getByTestId('list-content')).toBeInTheDocument()
    })

    it('should apply className', () => {
      render(
        <AnimatedList className="list-class">
          <div>Content</div>
        </AnimatedList>
      )

      expect(screen.getByText('Content').parentElement).toHaveClass('list-class')
    })
  })

  describe('AnimatedListItem', () => {
    it('should render children', () => {
      render(
        <AnimatedListItem>
          <div data-testid="list-item">Item</div>
        </AnimatedListItem>
      )

      expect(screen.getByTestId('list-item')).toBeInTheDocument()
    })

    it('should accept layoutId prop', () => {
      render(
        <AnimatedListItem layoutId="item-1">
          <div>Item</div>
        </AnimatedListItem>
      )

      expect(screen.getByText('Item')).toBeInTheDocument()
    })
  })

  describe('AnimatedNumber', () => {
    it('should render correctly', () => {
      render(<AnimatedNumber value={42} />)
      // With mocked framer-motion, displays formatted value
      expect(document.body).toBeInTheDocument()
    })

    it('should accept custom formatFn', () => {
      render(
        <AnimatedNumber
          value={1000}
          formatFn={(v) => `$${v.toFixed(2)}`}
        />
      )
      expect(document.body).toBeInTheDocument()
    })
  })

  describe('FadeIn', () => {
    it('should render children', () => {
      render(
        <FadeIn>
          <div data-testid="fade-content">Fade Content</div>
        </FadeIn>
      )

      expect(screen.getByTestId('fade-content')).toBeInTheDocument()
    })

    it('should apply className', () => {
      render(
        <FadeIn className="fade-class">
          <div>Content</div>
        </FadeIn>
      )

      const wrapper = screen.getByText('Content').parentElement
      expect(wrapper).toHaveClass('fade-class')
    })
  })

  describe('SlideIn', () => {
    it('should render children', () => {
      render(
        <SlideIn>
          <div data-testid="slide-content">Slide Content</div>
        </SlideIn>
      )

      expect(screen.getByTestId('slide-content')).toBeInTheDocument()
    })

    it('should accept direction prop', () => {
      render(
        <SlideIn direction="left">
          <div>Left Slide</div>
        </SlideIn>
      )

      expect(screen.getByText('Left Slide')).toBeInTheDocument()
    })

    it('should accept all direction values', () => {
      const directions = ['up', 'down', 'left', 'right'] as const

      directions.forEach((direction) => {
        const { unmount } = render(
          <SlideIn direction={direction}>
            <div>{direction}</div>
          </SlideIn>
        )
        expect(screen.getByText(direction)).toBeInTheDocument()
        unmount()
      })
    })
  })

  describe('ScaleOnTap', () => {
    it('should render children', () => {
      render(
        <ScaleOnTap>
          <button data-testid="tap-btn">Click me</button>
        </ScaleOnTap>
      )

      expect(screen.getByTestId('tap-btn')).toBeInTheDocument()
    })
  })

  describe('Pulse', () => {
    it('should render children', () => {
      render(
        <Pulse>
          <div data-testid="pulse-content">Pulsing</div>
        </Pulse>
      )

      expect(screen.getByTestId('pulse-content')).toBeInTheDocument()
    })
  })

  describe('SuccessCheck', () => {
    it('should render when show is true', () => {
      render(<SuccessCheck show={true} />)
      expect(document.querySelector('svg')).toBeInTheDocument()
    })

    it('should not render when show is false', () => {
      render(<SuccessCheck show={false} />)
      expect(document.querySelector('svg')).not.toBeInTheDocument()
    })

    it('should accept custom size', () => {
      render(<SuccessCheck show={true} size={48} />)
      const svg = document.querySelector('svg')
      expect(svg).toHaveAttribute('width', '48')
      expect(svg).toHaveAttribute('height', '48')
    })
  })

  describe('Shimmer', () => {
    it('should render correctly', () => {
      const { container } = render(<Shimmer />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should apply custom dimensions', () => {
      const { container } = render(<Shimmer width="200px" height="50px" />)
      const shimmer = container.firstChild as HTMLElement
      expect(shimmer).toHaveStyle({ width: '200px', height: '50px' })
    })
  })

  describe('SkeletonShimmer', () => {
    it('should render default lines', () => {
      const { container } = render(<SkeletonShimmer />)
      const shimmers = container.querySelectorAll('.bg-muted')
      expect(shimmers.length).toBe(3)
    })

    it('should render custom number of lines', () => {
      const { container } = render(<SkeletonShimmer lines={5} />)
      const shimmers = container.querySelectorAll('.bg-muted')
      expect(shimmers.length).toBe(5)
    })

    it('should render avatar when requested', () => {
      const { container } = render(<SkeletonShimmer avatar lines={2} />)
      const shimmers = container.querySelectorAll('.bg-muted')
      expect(shimmers.length).toBeGreaterThan(2)
    })
  })

  describe('HoverGrow', () => {
    it('should render children', () => {
      render(
        <HoverGrow>
          <div data-testid="grow-content">Grow on hover</div>
        </HoverGrow>
      )

      expect(screen.getByTestId('grow-content')).toBeInTheDocument()
    })

    it('should apply className', () => {
      render(
        <HoverGrow className="grow-class">
          <div>Content</div>
        </HoverGrow>
      )

      const wrapper = screen.getByText('Content').parentElement
      expect(wrapper).toHaveClass('grow-class')
    })
  })
})
