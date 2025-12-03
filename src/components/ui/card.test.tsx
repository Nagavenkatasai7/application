import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from './card'

describe('Card Components', () => {
  describe('Card', () => {
    it('should render a card with children', () => {
      render(<Card data-testid="card">Card content</Card>)
      expect(screen.getByTestId('card')).toHaveTextContent('Card content')
    })

    it('should have data-slot attribute', () => {
      render(<Card data-testid="card">Content</Card>)
      expect(screen.getByTestId('card')).toHaveAttribute('data-slot', 'card')
    })

    it('should merge custom className', () => {
      render(
        <Card data-testid="card" className="custom-class">
          Content
        </Card>
      )
      expect(screen.getByTestId('card').className).toContain('custom-class')
    })

    it('should have base card styles', () => {
      render(<Card data-testid="card">Content</Card>)
      const card = screen.getByTestId('card')
      expect(card.className).toContain('rounded-2xl')
      expect(card.className).toContain('border')
    })
  })

  describe('CardHeader', () => {
    it('should render header content', () => {
      render(<CardHeader data-testid="header">Header</CardHeader>)
      expect(screen.getByTestId('header')).toHaveTextContent('Header')
    })

    it('should have data-slot attribute', () => {
      render(<CardHeader data-testid="header">Header</CardHeader>)
      expect(screen.getByTestId('header')).toHaveAttribute('data-slot', 'card-header')
    })

    it('should merge custom className', () => {
      render(
        <CardHeader data-testid="header" className="custom-header">
          Header
        </CardHeader>
      )
      expect(screen.getByTestId('header').className).toContain('custom-header')
    })
  })

  describe('CardTitle', () => {
    it('should render title text', () => {
      render(<CardTitle data-testid="title">My Title</CardTitle>)
      expect(screen.getByTestId('title')).toHaveTextContent('My Title')
    })

    it('should have data-slot attribute', () => {
      render(<CardTitle data-testid="title">Title</CardTitle>)
      expect(screen.getByTestId('title')).toHaveAttribute('data-slot', 'card-title')
    })

    it('should have font-semibold class', () => {
      render(<CardTitle data-testid="title">Title</CardTitle>)
      expect(screen.getByTestId('title').className).toContain('font-semibold')
    })
  })

  describe('CardDescription', () => {
    it('should render description text', () => {
      render(<CardDescription data-testid="desc">Description text</CardDescription>)
      expect(screen.getByTestId('desc')).toHaveTextContent('Description text')
    })

    it('should have data-slot attribute', () => {
      render(<CardDescription data-testid="desc">Desc</CardDescription>)
      expect(screen.getByTestId('desc')).toHaveAttribute('data-slot', 'card-description')
    })

    it('should have muted foreground color', () => {
      render(<CardDescription data-testid="desc">Desc</CardDescription>)
      expect(screen.getByTestId('desc').className).toContain('text-muted-foreground')
    })
  })

  describe('CardContent', () => {
    it('should render content', () => {
      render(<CardContent data-testid="content">Main content</CardContent>)
      expect(screen.getByTestId('content')).toHaveTextContent('Main content')
    })

    it('should have data-slot attribute', () => {
      render(<CardContent data-testid="content">Content</CardContent>)
      expect(screen.getByTestId('content')).toHaveAttribute('data-slot', 'card-content')
    })

    it('should have padding class', () => {
      render(<CardContent data-testid="content">Content</CardContent>)
      expect(screen.getByTestId('content').className).toContain('px-6')
    })
  })

  describe('CardFooter', () => {
    it('should render footer content', () => {
      render(<CardFooter data-testid="footer">Footer</CardFooter>)
      expect(screen.getByTestId('footer')).toHaveTextContent('Footer')
    })

    it('should have data-slot attribute', () => {
      render(<CardFooter data-testid="footer">Footer</CardFooter>)
      expect(screen.getByTestId('footer')).toHaveAttribute('data-slot', 'card-footer')
    })

    it('should have flex layout', () => {
      render(<CardFooter data-testid="footer">Footer</CardFooter>)
      expect(screen.getByTestId('footer').className).toContain('flex')
    })
  })

  describe('CardAction', () => {
    it('should render action content', () => {
      render(<CardAction data-testid="action">Action</CardAction>)
      expect(screen.getByTestId('action')).toHaveTextContent('Action')
    })

    it('should have data-slot attribute', () => {
      render(<CardAction data-testid="action">Action</CardAction>)
      expect(screen.getByTestId('action')).toHaveAttribute('data-slot', 'card-action')
    })
  })

  describe('Full Card composition', () => {
    it('should render a complete card with all components', () => {
      render(
        <Card data-testid="full-card">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
            <CardAction>
              <button>Action</button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p>Card body content</p>
          </CardContent>
          <CardFooter>
            <button>Submit</button>
          </CardFooter>
        </Card>
      )

      expect(screen.getByText('Card Title')).toBeInTheDocument()
      expect(screen.getByText('Card Description')).toBeInTheDocument()
      expect(screen.getByText('Card body content')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()
    })
  })
})
