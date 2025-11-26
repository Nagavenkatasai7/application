import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from './dropdown-menu'

// Mock Radix Dropdown Menu primitives
vi.mock('@radix-ui/react-dropdown-menu', () => ({
  Root: ({ children, ...props }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-menu-root" data-slot="dropdown-menu" {...props}>{children}</div>
  ),
  Trigger: ({ children, ...props }: { children: React.ReactNode }) => (
    <button data-testid="dropdown-menu-trigger" data-slot="dropdown-menu-trigger" {...props}>{children}</button>
  ),
  Portal: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-menu-portal" data-slot="dropdown-menu-portal">{children}</div>
  ),
  Content: ({ children, className, sideOffset, ...props }: { children: React.ReactNode; className?: string; sideOffset?: number }) => (
    <div data-testid="dropdown-menu-content" data-slot="dropdown-menu-content" data-side-offset={sideOffset} className={className} {...props}>{children}</div>
  ),
  Group: ({ children, ...props }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-menu-group" data-slot="dropdown-menu-group" {...props}>{children}</div>
  ),
  Item: ({ children, className, ...props }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="dropdown-menu-item" data-slot="dropdown-menu-item" className={className} {...props}>{children}</div>
  ),
  CheckboxItem: ({ children, className, checked, ...props }: { children: React.ReactNode; className?: string; checked?: boolean }) => (
    <div data-testid="dropdown-menu-checkbox-item" data-slot="dropdown-menu-checkbox-item" data-checked={checked} className={className} {...props}>{children}</div>
  ),
  RadioGroup: ({ children, ...props }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-menu-radio-group" data-slot="dropdown-menu-radio-group" {...props}>{children}</div>
  ),
  RadioItem: ({ children, className, ...props }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="dropdown-menu-radio-item" data-slot="dropdown-menu-radio-item" className={className} {...props}>{children}</div>
  ),
  ItemIndicator: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="item-indicator">{children}</span>
  ),
  Label: ({ children, className, ...props }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="dropdown-menu-label" data-slot="dropdown-menu-label" className={className} {...props}>{children}</div>
  ),
  Separator: ({ className, ...props }: { className?: string }) => (
    <div data-testid="dropdown-menu-separator" data-slot="dropdown-menu-separator" className={className} {...props} />
  ),
  Sub: ({ children, ...props }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-menu-sub" data-slot="dropdown-menu-sub" {...props}>{children}</div>
  ),
  SubTrigger: ({ children, className, ...props }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="dropdown-menu-sub-trigger" data-slot="dropdown-menu-sub-trigger" className={className} {...props}>{children}</div>
  ),
  SubContent: ({ children, className, ...props }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="dropdown-menu-sub-content" data-slot="dropdown-menu-sub-content" className={className} {...props}>{children}</div>
  ),
}))

describe('DropdownMenu Component', () => {
  describe('rendering', () => {
    it('should render the dropdown menu root', () => {
      render(<DropdownMenu><div>Content</div></DropdownMenu>)
      expect(screen.getByTestId('dropdown-menu-root')).toBeInTheDocument()
    })

    it('should have data-slot attribute', () => {
      render(<DropdownMenu><div>Content</div></DropdownMenu>)
      expect(screen.getByTestId('dropdown-menu-root')).toHaveAttribute('data-slot', 'dropdown-menu')
    })
  })
})

describe('DropdownMenuTrigger Component', () => {
  describe('rendering', () => {
    it('should render the trigger', () => {
      render(<DropdownMenuTrigger>Open</DropdownMenuTrigger>)
      expect(screen.getByTestId('dropdown-menu-trigger')).toBeInTheDocument()
    })

    it('should have data-slot attribute', () => {
      render(<DropdownMenuTrigger>Open</DropdownMenuTrigger>)
      expect(screen.getByTestId('dropdown-menu-trigger')).toHaveAttribute('data-slot', 'dropdown-menu-trigger')
    })
  })
})

describe('DropdownMenuPortal Component', () => {
  it('should render portal', () => {
    render(<DropdownMenuPortal><div>Portal Content</div></DropdownMenuPortal>)
    expect(screen.getByTestId('dropdown-menu-portal')).toBeInTheDocument()
  })
})

describe('DropdownMenuContent Component', () => {
  describe('rendering', () => {
    it('should render the content', () => {
      render(<DropdownMenuContent>Menu Content</DropdownMenuContent>)
      expect(screen.getByTestId('dropdown-menu-content')).toBeInTheDocument()
    })

    it('should have data-slot attribute', () => {
      render(<DropdownMenuContent>Menu Content</DropdownMenuContent>)
      expect(screen.getByTestId('dropdown-menu-content')).toHaveAttribute('data-slot', 'dropdown-menu-content')
    })

    it('should have default sideOffset of 4', () => {
      render(<DropdownMenuContent>Content</DropdownMenuContent>)
      expect(screen.getByTestId('dropdown-menu-content')).toHaveAttribute('data-side-offset', '4')
    })

    it('should accept custom sideOffset', () => {
      render(<DropdownMenuContent sideOffset={8}>Content</DropdownMenuContent>)
      expect(screen.getByTestId('dropdown-menu-content')).toHaveAttribute('data-side-offset', '8')
    })
  })
})

describe('DropdownMenuGroup Component', () => {
  it('should render group', () => {
    render(<DropdownMenuGroup>Group Content</DropdownMenuGroup>)
    expect(screen.getByTestId('dropdown-menu-group')).toBeInTheDocument()
  })

  it('should have data-slot attribute', () => {
    render(<DropdownMenuGroup>Group Content</DropdownMenuGroup>)
    expect(screen.getByTestId('dropdown-menu-group')).toHaveAttribute('data-slot', 'dropdown-menu-group')
  })
})

describe('DropdownMenuItem Component', () => {
  describe('rendering', () => {
    it('should render the item', () => {
      render(<DropdownMenuItem>Item</DropdownMenuItem>)
      expect(screen.getByTestId('dropdown-menu-item')).toBeInTheDocument()
    })

    it('should have data-slot attribute', () => {
      render(<DropdownMenuItem>Item</DropdownMenuItem>)
      expect(screen.getByTestId('dropdown-menu-item')).toHaveAttribute('data-slot', 'dropdown-menu-item')
    })
  })

  describe('variants', () => {
    it('should support default variant', () => {
      render(<DropdownMenuItem variant="default">Item</DropdownMenuItem>)
      expect(screen.getByTestId('dropdown-menu-item')).toHaveAttribute('data-variant', 'default')
    })

    it('should support destructive variant', () => {
      render(<DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>)
      expect(screen.getByTestId('dropdown-menu-item')).toHaveAttribute('data-variant', 'destructive')
    })
  })

  describe('inset', () => {
    it('should support inset prop', () => {
      render(<DropdownMenuItem inset>Inset Item</DropdownMenuItem>)
      expect(screen.getByTestId('dropdown-menu-item')).toHaveAttribute('data-inset', 'true')
    })
  })
})

describe('DropdownMenuCheckboxItem Component', () => {
  describe('rendering', () => {
    it('should render the checkbox item', () => {
      render(<DropdownMenuCheckboxItem>Checkbox</DropdownMenuCheckboxItem>)
      expect(screen.getByTestId('dropdown-menu-checkbox-item')).toBeInTheDocument()
    })

    it('should have data-slot attribute', () => {
      render(<DropdownMenuCheckboxItem>Checkbox</DropdownMenuCheckboxItem>)
      expect(screen.getByTestId('dropdown-menu-checkbox-item')).toHaveAttribute('data-slot', 'dropdown-menu-checkbox-item')
    })
  })

  describe('checked state', () => {
    it('should show checked state', () => {
      render(<DropdownMenuCheckboxItem checked>Checked</DropdownMenuCheckboxItem>)
      expect(screen.getByTestId('dropdown-menu-checkbox-item')).toHaveAttribute('data-checked', 'true')
    })

    it('should show unchecked state', () => {
      render(<DropdownMenuCheckboxItem checked={false}>Unchecked</DropdownMenuCheckboxItem>)
      expect(screen.getByTestId('dropdown-menu-checkbox-item')).toHaveAttribute('data-checked', 'false')
    })
  })
})

describe('DropdownMenuRadioGroup Component', () => {
  it('should render radio group', () => {
    render(<DropdownMenuRadioGroup>Radio Items</DropdownMenuRadioGroup>)
    expect(screen.getByTestId('dropdown-menu-radio-group')).toBeInTheDocument()
  })

  it('should have data-slot attribute', () => {
    render(<DropdownMenuRadioGroup>Radio Items</DropdownMenuRadioGroup>)
    expect(screen.getByTestId('dropdown-menu-radio-group')).toHaveAttribute('data-slot', 'dropdown-menu-radio-group')
  })
})

describe('DropdownMenuRadioItem Component', () => {
  it('should render radio item', () => {
    render(<DropdownMenuRadioItem value="1">Option 1</DropdownMenuRadioItem>)
    expect(screen.getByTestId('dropdown-menu-radio-item')).toBeInTheDocument()
  })

  it('should have data-slot attribute', () => {
    render(<DropdownMenuRadioItem value="1">Option 1</DropdownMenuRadioItem>)
    expect(screen.getByTestId('dropdown-menu-radio-item')).toHaveAttribute('data-slot', 'dropdown-menu-radio-item')
  })
})

describe('DropdownMenuLabel Component', () => {
  describe('rendering', () => {
    it('should render the label', () => {
      render(<DropdownMenuLabel>Label</DropdownMenuLabel>)
      expect(screen.getByTestId('dropdown-menu-label')).toBeInTheDocument()
    })

    it('should have data-slot attribute', () => {
      render(<DropdownMenuLabel>Label</DropdownMenuLabel>)
      expect(screen.getByTestId('dropdown-menu-label')).toHaveAttribute('data-slot', 'dropdown-menu-label')
    })
  })

  describe('inset', () => {
    it('should support inset prop', () => {
      render(<DropdownMenuLabel inset>Inset Label</DropdownMenuLabel>)
      expect(screen.getByTestId('dropdown-menu-label')).toHaveAttribute('data-inset', 'true')
    })
  })
})

describe('DropdownMenuSeparator Component', () => {
  it('should render separator', () => {
    render(<DropdownMenuSeparator />)
    expect(screen.getByTestId('dropdown-menu-separator')).toBeInTheDocument()
  })

  it('should have data-slot attribute', () => {
    render(<DropdownMenuSeparator />)
    expect(screen.getByTestId('dropdown-menu-separator')).toHaveAttribute('data-slot', 'dropdown-menu-separator')
  })
})

describe('DropdownMenuShortcut Component', () => {
  it('should render shortcut', () => {
    render(<DropdownMenuShortcut data-testid="shortcut">⌘K</DropdownMenuShortcut>)
    expect(screen.getByTestId('shortcut')).toBeInTheDocument()
    expect(screen.getByText('⌘K')).toBeInTheDocument()
  })

  it('should have data-slot attribute', () => {
    render(<DropdownMenuShortcut data-testid="shortcut">⌘K</DropdownMenuShortcut>)
    expect(screen.getByTestId('shortcut')).toHaveAttribute('data-slot', 'dropdown-menu-shortcut')
  })

  it('should have ml-auto class', () => {
    render(<DropdownMenuShortcut data-testid="shortcut">⌘K</DropdownMenuShortcut>)
    expect(screen.getByTestId('shortcut').className).toContain('ml-auto')
  })
})

describe('DropdownMenuSub Component', () => {
  it('should render sub menu', () => {
    render(<DropdownMenuSub>Sub Content</DropdownMenuSub>)
    expect(screen.getByTestId('dropdown-menu-sub')).toBeInTheDocument()
  })

  it('should have data-slot attribute', () => {
    render(<DropdownMenuSub>Sub Content</DropdownMenuSub>)
    expect(screen.getByTestId('dropdown-menu-sub')).toHaveAttribute('data-slot', 'dropdown-menu-sub')
  })
})

describe('DropdownMenuSubTrigger Component', () => {
  describe('rendering', () => {
    it('should render sub trigger', () => {
      render(<DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>)
      expect(screen.getByTestId('dropdown-menu-sub-trigger')).toBeInTheDocument()
    })

    it('should have data-slot attribute', () => {
      render(<DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>)
      expect(screen.getByTestId('dropdown-menu-sub-trigger')).toHaveAttribute('data-slot', 'dropdown-menu-sub-trigger')
    })
  })

  describe('inset', () => {
    it('should support inset prop', () => {
      render(<DropdownMenuSubTrigger inset>More</DropdownMenuSubTrigger>)
      expect(screen.getByTestId('dropdown-menu-sub-trigger')).toHaveAttribute('data-inset', 'true')
    })
  })
})

describe('DropdownMenuSubContent Component', () => {
  it('should render sub content', () => {
    render(<DropdownMenuSubContent>Sub Items</DropdownMenuSubContent>)
    expect(screen.getByTestId('dropdown-menu-sub-content')).toBeInTheDocument()
  })

  it('should have data-slot attribute', () => {
    render(<DropdownMenuSubContent>Sub Items</DropdownMenuSubContent>)
    expect(screen.getByTestId('dropdown-menu-sub-content')).toHaveAttribute('data-slot', 'dropdown-menu-sub-content')
  })
})

describe('DropdownMenu Composition', () => {
  it('should work with all components together', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    expect(screen.getByText('Open Menu')).toBeInTheDocument()
    expect(screen.getByText('My Account')).toBeInTheDocument()
    expect(screen.getByText('Profile')).toBeInTheDocument()
    expect(screen.getByText('Logout')).toBeInTheDocument()
  })
})
