import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import {
  Sidebar,
  SidebarProvider,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from './sidebar'

// Mock use-mobile hook
vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => false,
}))

// Test component to access useSidebar hook
function TestSidebarConsumer() {
  const { state, open, isMobile, toggleSidebar } = useSidebar()
  return (
    <div>
      <span data-testid="state">{state}</span>
      <span data-testid="open">{String(open)}</span>
      <span data-testid="is-mobile">{String(isMobile)}</span>
      <button data-testid="toggle" onClick={toggleSidebar}>Toggle</button>
    </div>
  )
}

describe('SidebarProvider Component', () => {
  describe('rendering', () => {
    it('should render children', () => {
      render(
        <SidebarProvider>
          <div data-testid="child">Child</div>
        </SidebarProvider>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('should have data-slot attribute', () => {
      render(
        <SidebarProvider data-testid="wrapper">
          <div>Child</div>
        </SidebarProvider>
      )
      const wrapper = document.querySelector('[data-slot="sidebar-wrapper"]')
      expect(wrapper).toBeInTheDocument()
    })
  })

  describe('default state', () => {
    it('should be open by default', () => {
      render(
        <SidebarProvider>
          <TestSidebarConsumer />
        </SidebarProvider>
      )
      expect(screen.getByTestId('open')).toHaveTextContent('true')
      expect(screen.getByTestId('state')).toHaveTextContent('expanded')
    })

    it('should respect defaultOpen=false', () => {
      render(
        <SidebarProvider defaultOpen={false}>
          <TestSidebarConsumer />
        </SidebarProvider>
      )
      expect(screen.getByTestId('open')).toHaveTextContent('false')
      expect(screen.getByTestId('state')).toHaveTextContent('collapsed')
    })
  })

  describe('controlled state', () => {
    it('should work with controlled open prop', () => {
      const onOpenChange = vi.fn()
      render(
        <SidebarProvider open={true} onOpenChange={onOpenChange}>
          <TestSidebarConsumer />
        </SidebarProvider>
      )
      expect(screen.getByTestId('open')).toHaveTextContent('true')
    })
  })

  describe('toggle functionality', () => {
    it('should toggle sidebar state', () => {
      render(
        <SidebarProvider>
          <TestSidebarConsumer />
        </SidebarProvider>
      )

      expect(screen.getByTestId('open')).toHaveTextContent('true')

      fireEvent.click(screen.getByTestId('toggle'))

      expect(screen.getByTestId('open')).toHaveTextContent('false')
    })
  })

  describe('keyboard shortcut', () => {
    it('should toggle on Ctrl+B', () => {
      render(
        <SidebarProvider>
          <TestSidebarConsumer />
        </SidebarProvider>
      )

      expect(screen.getByTestId('open')).toHaveTextContent('true')

      fireEvent.keyDown(window, { key: 'b', ctrlKey: true })

      expect(screen.getByTestId('open')).toHaveTextContent('false')
    })

    it('should toggle on Meta+B (Mac)', () => {
      render(
        <SidebarProvider>
          <TestSidebarConsumer />
        </SidebarProvider>
      )

      expect(screen.getByTestId('open')).toHaveTextContent('true')

      fireEvent.keyDown(window, { key: 'b', metaKey: true })

      expect(screen.getByTestId('open')).toHaveTextContent('false')
    })
  })

  describe('CSS variables', () => {
    it('should set sidebar width CSS variables', () => {
      render(
        <SidebarProvider data-testid="provider">
          <div>Child</div>
        </SidebarProvider>
      )
      const wrapper = document.querySelector('[data-slot="sidebar-wrapper"]')
      expect(wrapper).toHaveStyle({ '--sidebar-width': '16rem' })
    })
  })
})

describe('useSidebar Hook', () => {
  it('should throw error when used outside provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(<TestSidebarConsumer />)
    }).toThrow('useSidebar must be used within a SidebarProvider.')

    consoleError.mockRestore()
  })
})

describe('Sidebar Component', () => {
  describe('rendering', () => {
    it('should render sidebar', () => {
      render(
        <SidebarProvider>
          <Sidebar data-testid="sidebar">
            <div>Sidebar Content</div>
          </Sidebar>
        </SidebarProvider>
      )
      const sidebar = document.querySelector('[data-slot="sidebar"]')
      expect(sidebar).toBeInTheDocument()
    })
  })

  describe('collapsible none', () => {
    it('should render non-collapsible sidebar', () => {
      render(
        <SidebarProvider>
          <Sidebar collapsible="none" data-testid="sidebar">
            <div>Content</div>
          </Sidebar>
        </SidebarProvider>
      )
      const sidebar = document.querySelector('[data-slot="sidebar"]')
      expect(sidebar).toBeInTheDocument()
    })
  })

  describe('variants', () => {
    it('should support sidebar variant', () => {
      render(
        <SidebarProvider>
          <Sidebar variant="sidebar">
            <div>Content</div>
          </Sidebar>
        </SidebarProvider>
      )
      const sidebar = document.querySelector('[data-variant="sidebar"]')
      expect(sidebar).toBeInTheDocument()
    })

    it('should support floating variant', () => {
      render(
        <SidebarProvider>
          <Sidebar variant="floating">
            <div>Content</div>
          </Sidebar>
        </SidebarProvider>
      )
      const sidebar = document.querySelector('[data-variant="floating"]')
      expect(sidebar).toBeInTheDocument()
    })

    it('should support inset variant', () => {
      render(
        <SidebarProvider>
          <Sidebar variant="inset">
            <div>Content</div>
          </Sidebar>
        </SidebarProvider>
      )
      const sidebar = document.querySelector('[data-variant="inset"]')
      expect(sidebar).toBeInTheDocument()
    })
  })

  describe('side', () => {
    it('should default to left side', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <div>Content</div>
          </Sidebar>
        </SidebarProvider>
      )
      const sidebar = document.querySelector('[data-side="left"]')
      expect(sidebar).toBeInTheDocument()
    })

    it('should support right side', () => {
      render(
        <SidebarProvider>
          <Sidebar side="right">
            <div>Content</div>
          </Sidebar>
        </SidebarProvider>
      )
      const sidebar = document.querySelector('[data-side="right"]')
      expect(sidebar).toBeInTheDocument()
    })
  })
})

describe('SidebarTrigger Component', () => {
  it('should render trigger button', () => {
    render(
      <SidebarProvider>
        <SidebarTrigger data-testid="trigger" />
      </SidebarProvider>
    )
    expect(screen.getByTestId('trigger')).toBeInTheDocument()
  })

  it('should have data-slot attribute', () => {
    render(
      <SidebarProvider>
        <SidebarTrigger data-testid="trigger" />
      </SidebarProvider>
    )
    expect(screen.getByTestId('trigger')).toHaveAttribute('data-slot', 'sidebar-trigger')
  })

  it('should toggle sidebar on click', () => {
    render(
      <SidebarProvider>
        <TestSidebarConsumer />
        <SidebarTrigger data-testid="trigger" />
      </SidebarProvider>
    )

    expect(screen.getByTestId('open')).toHaveTextContent('true')

    fireEvent.click(screen.getByTestId('trigger'))

    expect(screen.getByTestId('open')).toHaveTextContent('false')
  })

  it('should call custom onClick handler', () => {
    const onClick = vi.fn()
    render(
      <SidebarProvider>
        <SidebarTrigger onClick={onClick} data-testid="trigger" />
      </SidebarProvider>
    )

    fireEvent.click(screen.getByTestId('trigger'))

    expect(onClick).toHaveBeenCalled()
  })
})

describe('SidebarRail Component', () => {
  it('should render rail', () => {
    render(
      <SidebarProvider>
        <SidebarRail data-testid="rail" />
      </SidebarProvider>
    )
    expect(screen.getByTestId('rail')).toBeInTheDocument()
  })

  it('should have data-slot attribute', () => {
    render(
      <SidebarProvider>
        <SidebarRail data-testid="rail" />
      </SidebarProvider>
    )
    expect(screen.getByTestId('rail')).toHaveAttribute('data-slot', 'sidebar-rail')
  })

  it('should toggle sidebar on click', () => {
    render(
      <SidebarProvider>
        <TestSidebarConsumer />
        <SidebarRail data-testid="rail" />
      </SidebarProvider>
    )

    expect(screen.getByTestId('open')).toHaveTextContent('true')

    fireEvent.click(screen.getByTestId('rail'))

    expect(screen.getByTestId('open')).toHaveTextContent('false')
  })
})

describe('SidebarInset Component', () => {
  it('should render main element', () => {
    render(
      <SidebarProvider>
        <SidebarInset data-testid="inset">Content</SidebarInset>
      </SidebarProvider>
    )
    expect(screen.getByTestId('inset')).toBeInTheDocument()
    expect(screen.getByTestId('inset').tagName).toBe('MAIN')
  })

  it('should have data-slot attribute', () => {
    render(
      <SidebarProvider>
        <SidebarInset data-testid="inset">Content</SidebarInset>
      </SidebarProvider>
    )
    expect(screen.getByTestId('inset')).toHaveAttribute('data-slot', 'sidebar-inset')
  })
})

describe('SidebarInput Component', () => {
  it('should render input', () => {
    render(
      <SidebarProvider>
        <SidebarInput data-testid="input" placeholder="Search" />
      </SidebarProvider>
    )
    expect(screen.getByTestId('input')).toBeInTheDocument()
  })

  it('should have data-slot attribute', () => {
    render(
      <SidebarProvider>
        <SidebarInput data-testid="input" />
      </SidebarProvider>
    )
    expect(screen.getByTestId('input')).toHaveAttribute('data-slot', 'sidebar-input')
  })
})

describe('SidebarHeader Component', () => {
  it('should render header', () => {
    render(
      <SidebarProvider>
        <SidebarHeader data-testid="header">Header</SidebarHeader>
      </SidebarProvider>
    )
    expect(screen.getByTestId('header')).toBeInTheDocument()
  })

  it('should have data-slot attribute', () => {
    render(
      <SidebarProvider>
        <SidebarHeader data-testid="header">Header</SidebarHeader>
      </SidebarProvider>
    )
    expect(screen.getByTestId('header')).toHaveAttribute('data-slot', 'sidebar-header')
  })
})

describe('SidebarFooter Component', () => {
  it('should render footer', () => {
    render(
      <SidebarProvider>
        <SidebarFooter data-testid="footer">Footer</SidebarFooter>
      </SidebarProvider>
    )
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })

  it('should have data-slot attribute', () => {
    render(
      <SidebarProvider>
        <SidebarFooter data-testid="footer">Footer</SidebarFooter>
      </SidebarProvider>
    )
    expect(screen.getByTestId('footer')).toHaveAttribute('data-slot', 'sidebar-footer')
  })
})

describe('SidebarSeparator Component', () => {
  it('should render separator', () => {
    render(
      <SidebarProvider>
        <SidebarSeparator data-testid="separator" />
      </SidebarProvider>
    )
    expect(screen.getByTestId('separator')).toBeInTheDocument()
  })

  it('should have data-slot attribute', () => {
    render(
      <SidebarProvider>
        <SidebarSeparator data-testid="separator" />
      </SidebarProvider>
    )
    expect(screen.getByTestId('separator')).toHaveAttribute('data-slot', 'sidebar-separator')
  })
})

describe('SidebarContent Component', () => {
  it('should render content', () => {
    render(
      <SidebarProvider>
        <SidebarContent data-testid="content">Content</SidebarContent>
      </SidebarProvider>
    )
    expect(screen.getByTestId('content')).toBeInTheDocument()
  })

  it('should have data-slot attribute', () => {
    render(
      <SidebarProvider>
        <SidebarContent data-testid="content">Content</SidebarContent>
      </SidebarProvider>
    )
    expect(screen.getByTestId('content')).toHaveAttribute('data-slot', 'sidebar-content')
  })
})

describe('SidebarGroup Component', () => {
  it('should render group', () => {
    render(
      <SidebarProvider>
        <SidebarGroup data-testid="group">Group</SidebarGroup>
      </SidebarProvider>
    )
    expect(screen.getByTestId('group')).toBeInTheDocument()
  })

  it('should have data-slot attribute', () => {
    render(
      <SidebarProvider>
        <SidebarGroup data-testid="group">Group</SidebarGroup>
      </SidebarProvider>
    )
    expect(screen.getByTestId('group')).toHaveAttribute('data-slot', 'sidebar-group')
  })
})

describe('SidebarGroupLabel Component', () => {
  it('should render group label', () => {
    render(
      <SidebarProvider>
        <SidebarGroupLabel data-testid="label">Label</SidebarGroupLabel>
      </SidebarProvider>
    )
    expect(screen.getByTestId('label')).toBeInTheDocument()
  })

  it('should have data-slot attribute', () => {
    render(
      <SidebarProvider>
        <SidebarGroupLabel data-testid="label">Label</SidebarGroupLabel>
      </SidebarProvider>
    )
    expect(screen.getByTestId('label')).toHaveAttribute('data-slot', 'sidebar-group-label')
  })

  it('should support asChild prop', () => {
    render(
      <SidebarProvider>
        <SidebarGroupLabel asChild>
          <span data-testid="custom-label">Custom Label</span>
        </SidebarGroupLabel>
      </SidebarProvider>
    )
    expect(screen.getByTestId('custom-label')).toBeInTheDocument()
  })
})

describe('SidebarGroupAction Component', () => {
  it('should render group action', () => {
    render(
      <SidebarProvider>
        <SidebarGroupAction data-testid="action">Action</SidebarGroupAction>
      </SidebarProvider>
    )
    expect(screen.getByTestId('action')).toBeInTheDocument()
  })

  it('should have data-slot attribute', () => {
    render(
      <SidebarProvider>
        <SidebarGroupAction data-testid="action">Action</SidebarGroupAction>
      </SidebarProvider>
    )
    expect(screen.getByTestId('action')).toHaveAttribute('data-slot', 'sidebar-group-action')
  })
})

describe('SidebarGroupContent Component', () => {
  it('should render group content', () => {
    render(
      <SidebarProvider>
        <SidebarGroupContent data-testid="content">Content</SidebarGroupContent>
      </SidebarProvider>
    )
    expect(screen.getByTestId('content')).toBeInTheDocument()
  })

  it('should have data-slot attribute', () => {
    render(
      <SidebarProvider>
        <SidebarGroupContent data-testid="content">Content</SidebarGroupContent>
      </SidebarProvider>
    )
    expect(screen.getByTestId('content')).toHaveAttribute('data-slot', 'sidebar-group-content')
  })
})

describe('SidebarMenu Component', () => {
  it('should render menu', () => {
    render(
      <SidebarProvider>
        <SidebarMenu data-testid="menu">Menu</SidebarMenu>
      </SidebarProvider>
    )
    expect(screen.getByTestId('menu')).toBeInTheDocument()
    expect(screen.getByTestId('menu').tagName).toBe('UL')
  })

  it('should have data-slot attribute', () => {
    render(
      <SidebarProvider>
        <SidebarMenu data-testid="menu">Menu</SidebarMenu>
      </SidebarProvider>
    )
    expect(screen.getByTestId('menu')).toHaveAttribute('data-slot', 'sidebar-menu')
  })
})

describe('SidebarMenuItem Component', () => {
  it('should render menu item', () => {
    render(
      <SidebarProvider>
        <SidebarMenuItem data-testid="item">Item</SidebarMenuItem>
      </SidebarProvider>
    )
    expect(screen.getByTestId('item')).toBeInTheDocument()
    expect(screen.getByTestId('item').tagName).toBe('LI')
  })

  it('should have data-slot attribute', () => {
    render(
      <SidebarProvider>
        <SidebarMenuItem data-testid="item">Item</SidebarMenuItem>
      </SidebarProvider>
    )
    expect(screen.getByTestId('item')).toHaveAttribute('data-slot', 'sidebar-menu-item')
  })
})

describe('SidebarMenuButton Component', () => {
  it('should render menu button', () => {
    render(
      <SidebarProvider>
        <SidebarMenuButton data-testid="button">Button</SidebarMenuButton>
      </SidebarProvider>
    )
    expect(screen.getByTestId('button')).toBeInTheDocument()
  })

  it('should have data-slot attribute', () => {
    render(
      <SidebarProvider>
        <SidebarMenuButton data-testid="button">Button</SidebarMenuButton>
      </SidebarProvider>
    )
    expect(screen.getByTestId('button')).toHaveAttribute('data-slot', 'sidebar-menu-button')
  })

  it('should support isActive prop', () => {
    render(
      <SidebarProvider>
        <SidebarMenuButton data-testid="button" isActive>Active</SidebarMenuButton>
      </SidebarProvider>
    )
    expect(screen.getByTestId('button')).toHaveAttribute('data-active', 'true')
  })

  it('should support size prop', () => {
    render(
      <SidebarProvider>
        <SidebarMenuButton data-testid="button" size="sm">Small</SidebarMenuButton>
      </SidebarProvider>
    )
    expect(screen.getByTestId('button')).toHaveAttribute('data-size', 'sm')
  })

  it('should support asChild prop', () => {
    render(
      <SidebarProvider>
        <SidebarMenuButton asChild>
          <a href="#" data-testid="link">Link</a>
        </SidebarMenuButton>
      </SidebarProvider>
    )
    expect(screen.getByTestId('link').tagName).toBe('A')
  })
})

describe('SidebarMenuAction Component', () => {
  it('should render menu action', () => {
    render(
      <SidebarProvider>
        <SidebarMenuAction data-testid="action">Action</SidebarMenuAction>
      </SidebarProvider>
    )
    expect(screen.getByTestId('action')).toBeInTheDocument()
  })

  it('should have data-slot attribute', () => {
    render(
      <SidebarProvider>
        <SidebarMenuAction data-testid="action">Action</SidebarMenuAction>
      </SidebarProvider>
    )
    expect(screen.getByTestId('action')).toHaveAttribute('data-slot', 'sidebar-menu-action')
  })
})

describe('SidebarMenuBadge Component', () => {
  it('should render menu badge', () => {
    render(
      <SidebarProvider>
        <SidebarMenuBadge data-testid="badge">5</SidebarMenuBadge>
      </SidebarProvider>
    )
    expect(screen.getByTestId('badge')).toBeInTheDocument()
  })

  it('should have data-slot attribute', () => {
    render(
      <SidebarProvider>
        <SidebarMenuBadge data-testid="badge">5</SidebarMenuBadge>
      </SidebarProvider>
    )
    expect(screen.getByTestId('badge')).toHaveAttribute('data-slot', 'sidebar-menu-badge')
  })
})

describe('SidebarMenuSkeleton Component', () => {
  it('should render menu skeleton', () => {
    render(
      <SidebarProvider>
        <SidebarMenuSkeleton data-testid="skeleton" />
      </SidebarProvider>
    )
    expect(screen.getByTestId('skeleton')).toBeInTheDocument()
  })

  it('should have data-slot attribute', () => {
    render(
      <SidebarProvider>
        <SidebarMenuSkeleton data-testid="skeleton" />
      </SidebarProvider>
    )
    expect(screen.getByTestId('skeleton')).toHaveAttribute('data-slot', 'sidebar-menu-skeleton')
  })

  it('should show icon when showIcon is true', () => {
    render(
      <SidebarProvider>
        <SidebarMenuSkeleton showIcon data-testid="skeleton" />
      </SidebarProvider>
    )
    const iconSkeleton = document.querySelector('[data-sidebar="menu-skeleton-icon"]')
    expect(iconSkeleton).toBeInTheDocument()
  })
})

describe('SidebarMenuSub Component', () => {
  it('should render menu sub', () => {
    render(
      <SidebarProvider>
        <SidebarMenuSub data-testid="sub">Sub</SidebarMenuSub>
      </SidebarProvider>
    )
    expect(screen.getByTestId('sub')).toBeInTheDocument()
    expect(screen.getByTestId('sub').tagName).toBe('UL')
  })

  it('should have data-slot attribute', () => {
    render(
      <SidebarProvider>
        <SidebarMenuSub data-testid="sub">Sub</SidebarMenuSub>
      </SidebarProvider>
    )
    expect(screen.getByTestId('sub')).toHaveAttribute('data-slot', 'sidebar-menu-sub')
  })
})

describe('SidebarMenuSubItem Component', () => {
  it('should render menu sub item', () => {
    render(
      <SidebarProvider>
        <SidebarMenuSubItem data-testid="sub-item">Sub Item</SidebarMenuSubItem>
      </SidebarProvider>
    )
    expect(screen.getByTestId('sub-item')).toBeInTheDocument()
    expect(screen.getByTestId('sub-item').tagName).toBe('LI')
  })

  it('should have data-slot attribute', () => {
    render(
      <SidebarProvider>
        <SidebarMenuSubItem data-testid="sub-item">Sub Item</SidebarMenuSubItem>
      </SidebarProvider>
    )
    expect(screen.getByTestId('sub-item')).toHaveAttribute('data-slot', 'sidebar-menu-sub-item')
  })
})

describe('SidebarMenuSubButton Component', () => {
  it('should render menu sub button', () => {
    render(
      <SidebarProvider>
        <SidebarMenuSubButton data-testid="sub-button">Sub Button</SidebarMenuSubButton>
      </SidebarProvider>
    )
    expect(screen.getByTestId('sub-button')).toBeInTheDocument()
  })

  it('should have data-slot attribute', () => {
    render(
      <SidebarProvider>
        <SidebarMenuSubButton data-testid="sub-button">Sub Button</SidebarMenuSubButton>
      </SidebarProvider>
    )
    expect(screen.getByTestId('sub-button')).toHaveAttribute('data-slot', 'sidebar-menu-sub-button')
  })

  it('should support isActive prop', () => {
    render(
      <SidebarProvider>
        <SidebarMenuSubButton data-testid="sub-button" isActive>Active</SidebarMenuSubButton>
      </SidebarProvider>
    )
    expect(screen.getByTestId('sub-button')).toHaveAttribute('data-active', 'true')
  })

  it('should support size prop', () => {
    render(
      <SidebarProvider>
        <SidebarMenuSubButton data-testid="sub-button" size="sm">Small</SidebarMenuSubButton>
      </SidebarProvider>
    )
    expect(screen.getByTestId('sub-button')).toHaveAttribute('data-size', 'sm')
  })
})

describe('Sidebar Composition', () => {
  it('should work with all components together', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <span>Logo</span>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive>
                      <span>Home</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <span>Settings</span>
                    </SidebarMenuButton>
                    <SidebarMenuBadge>3</SidebarMenuBadge>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <span>Footer</span>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <SidebarInset>
          <div>Main Content</div>
        </SidebarInset>
      </SidebarProvider>
    )

    expect(screen.getByText('Logo')).toBeInTheDocument()
    expect(screen.getByText('Navigation')).toBeInTheDocument()
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('Footer')).toBeInTheDocument()
    expect(screen.getByText('Main Content')).toBeInTheDocument()
  })
})
