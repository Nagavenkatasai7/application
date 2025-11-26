import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from './sheet'

// Mock Radix Dialog primitives
vi.mock('@radix-ui/react-dialog', () => ({
  Root: ({ children, ...props }: { children: React.ReactNode }) => (
    <div data-testid="sheet-root" data-slot="sheet" {...props}>{children}</div>
  ),
  Trigger: ({ children, ...props }: { children: React.ReactNode }) => (
    <button data-testid="sheet-trigger" data-slot="sheet-trigger" {...props}>{children}</button>
  ),
  Close: ({ children, className, ...props }: { children: React.ReactNode; className?: string }) => (
    <button data-testid="sheet-close" data-slot="sheet-close" className={className} {...props}>{children}</button>
  ),
  Portal: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sheet-portal" data-slot="sheet-portal">{children}</div>
  ),
  Overlay: ({ className, ...props }: { className?: string }) => (
    <div data-testid="sheet-overlay" data-slot="sheet-overlay" className={className} {...props} />
  ),
  Content: ({ children, className, ...props }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="sheet-content" data-slot="sheet-content" className={className} {...props}>{children}</div>
  ),
  Title: ({ children, className, ...props }: { children: React.ReactNode; className?: string }) => (
    <h2 data-testid="sheet-title" data-slot="sheet-title" className={className} {...props}>{children}</h2>
  ),
  Description: ({ children, className, ...props }: { children: React.ReactNode; className?: string }) => (
    <p data-testid="sheet-description" data-slot="sheet-description" className={className} {...props}>{children}</p>
  ),
}))

describe('Sheet Component', () => {
  describe('rendering', () => {
    it('should render the sheet root', () => {
      render(<Sheet><div>Content</div></Sheet>)
      expect(screen.getByTestId('sheet-root')).toBeInTheDocument()
    })

    it('should have data-slot attribute', () => {
      render(<Sheet><div>Content</div></Sheet>)
      expect(screen.getByTestId('sheet-root')).toHaveAttribute('data-slot', 'sheet')
    })
  })
})

describe('SheetTrigger Component', () => {
  describe('rendering', () => {
    it('should render the trigger', () => {
      render(<SheetTrigger>Open</SheetTrigger>)
      expect(screen.getByTestId('sheet-trigger')).toBeInTheDocument()
      expect(screen.getByText('Open')).toBeInTheDocument()
    })

    it('should have data-slot attribute', () => {
      render(<SheetTrigger>Open</SheetTrigger>)
      expect(screen.getByTestId('sheet-trigger')).toHaveAttribute('data-slot', 'sheet-trigger')
    })
  })
})

describe('SheetClose Component', () => {
  describe('rendering', () => {
    it('should render the close button', () => {
      render(<SheetClose>Close</SheetClose>)
      expect(screen.getByTestId('sheet-close')).toBeInTheDocument()
    })

    it('should have data-slot attribute', () => {
      render(<SheetClose>Close</SheetClose>)
      expect(screen.getByTestId('sheet-close')).toHaveAttribute('data-slot', 'sheet-close')
    })
  })
})

describe('SheetContent Component', () => {
  describe('rendering', () => {
    it('should render the content', () => {
      render(<SheetContent>Content</SheetContent>)
      expect(screen.getByTestId('sheet-content')).toBeInTheDocument()
    })

    it('should have data-slot attribute', () => {
      render(<SheetContent>Content</SheetContent>)
      expect(screen.getByTestId('sheet-content')).toHaveAttribute('data-slot', 'sheet-content')
    })

    it('should render children', () => {
      render(<SheetContent><p>Sheet content</p></SheetContent>)
      expect(screen.getByText('Sheet content')).toBeInTheDocument()
    })
  })

  describe('side prop', () => {
    it('should default to right', () => {
      render(<SheetContent>Content</SheetContent>)
      const content = screen.getByTestId('sheet-content')
      expect(content.className).toContain('right')
    })

    it('should support left side', () => {
      render(<SheetContent side="left">Content</SheetContent>)
      const content = screen.getByTestId('sheet-content')
      expect(content.className).toContain('left')
    })

    it('should support top side', () => {
      render(<SheetContent side="top">Content</SheetContent>)
      const content = screen.getByTestId('sheet-content')
      expect(content.className).toContain('top')
    })

    it('should support bottom side', () => {
      render(<SheetContent side="bottom">Content</SheetContent>)
      const content = screen.getByTestId('sheet-content')
      expect(content.className).toContain('bottom')
    })
  })

  describe('close button', () => {
    it('should render close button with X icon', () => {
      render(<SheetContent>Content</SheetContent>)
      expect(screen.getByText('Close')).toBeInTheDocument()
    })
  })
})

describe('SheetHeader Component', () => {
  describe('rendering', () => {
    it('should render the header', () => {
      render(<SheetHeader data-testid="sheet-header">Header</SheetHeader>)
      expect(screen.getByTestId('sheet-header')).toBeInTheDocument()
    })

    it('should have data-slot attribute', () => {
      render(<SheetHeader data-testid="sheet-header">Header</SheetHeader>)
      expect(screen.getByTestId('sheet-header')).toHaveAttribute('data-slot', 'sheet-header')
    })

    it('should have flex column layout', () => {
      render(<SheetHeader data-testid="sheet-header">Header</SheetHeader>)
      expect(screen.getByTestId('sheet-header').className).toContain('flex')
      expect(screen.getByTestId('sheet-header').className).toContain('flex-col')
    })
  })

  describe('className merging', () => {
    it('should merge custom className', () => {
      render(<SheetHeader data-testid="sheet-header" className="my-4">Header</SheetHeader>)
      const header = screen.getByTestId('sheet-header')
      expect(header.className).toContain('my-4')
      expect(header.className).toContain('flex')
    })
  })
})

describe('SheetFooter Component', () => {
  describe('rendering', () => {
    it('should render the footer', () => {
      render(<SheetFooter data-testid="sheet-footer">Footer</SheetFooter>)
      expect(screen.getByTestId('sheet-footer')).toBeInTheDocument()
    })

    it('should have data-slot attribute', () => {
      render(<SheetFooter data-testid="sheet-footer">Footer</SheetFooter>)
      expect(screen.getByTestId('sheet-footer')).toHaveAttribute('data-slot', 'sheet-footer')
    })

    it('should have mt-auto class', () => {
      render(<SheetFooter data-testid="sheet-footer">Footer</SheetFooter>)
      expect(screen.getByTestId('sheet-footer').className).toContain('mt-auto')
    })
  })
})

describe('SheetTitle Component', () => {
  describe('rendering', () => {
    it('should render the title', () => {
      render(<SheetTitle>Title</SheetTitle>)
      expect(screen.getByTestId('sheet-title')).toBeInTheDocument()
    })

    it('should have data-slot attribute', () => {
      render(<SheetTitle>Title</SheetTitle>)
      expect(screen.getByTestId('sheet-title')).toHaveAttribute('data-slot', 'sheet-title')
    })

    it('should have font-semibold class', () => {
      render(<SheetTitle>Title</SheetTitle>)
      expect(screen.getByTestId('sheet-title').className).toContain('font-semibold')
    })
  })
})

describe('SheetDescription Component', () => {
  describe('rendering', () => {
    it('should render the description', () => {
      render(<SheetDescription>Description</SheetDescription>)
      expect(screen.getByTestId('sheet-description')).toBeInTheDocument()
    })

    it('should have data-slot attribute', () => {
      render(<SheetDescription>Description</SheetDescription>)
      expect(screen.getByTestId('sheet-description')).toHaveAttribute('data-slot', 'sheet-description')
    })

    it('should have text-sm class', () => {
      render(<SheetDescription>Description</SheetDescription>)
      expect(screen.getByTestId('sheet-description').className).toContain('text-sm')
    })
  })
})

describe('Sheet Composition', () => {
  it('should work with all components together', () => {
    render(
      <Sheet>
        <SheetTrigger>Open Sheet</SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Sheet Title</SheetTitle>
            <SheetDescription>Sheet description text</SheetDescription>
          </SheetHeader>
          <div>Main content</div>
          <SheetFooter>
            <SheetClose>Close</SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    )

    expect(screen.getByText('Open Sheet')).toBeInTheDocument()
    expect(screen.getByText('Sheet Title')).toBeInTheDocument()
    expect(screen.getByText('Sheet description text')).toBeInTheDocument()
    expect(screen.getByText('Main content')).toBeInTheDocument()
  })
})
