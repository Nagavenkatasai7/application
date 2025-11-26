import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: () =>
    Promise.resolve({
      get: vi.fn().mockReturnValue({ value: 'true' }),
    }),
}))

// Mock the sidebar components
vi.mock('@/components/ui/sidebar', () => ({
  SidebarProvider: ({ children, defaultOpen }: { children: React.ReactNode; defaultOpen?: boolean }) => (
    <div data-testid="sidebar-provider" data-default-open={defaultOpen}>
      {children}
    </div>
  ),
  SidebarInset: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-inset">{children}</div>
  ),
  SidebarTrigger: ({ className }: { className?: string }) => (
    <button data-testid="sidebar-trigger" className={className}>
      Toggle
    </button>
  ),
}))

// Mock the AppSidebar
vi.mock('@/components/layout/app-sidebar', () => ({
  AppSidebar: () => <div data-testid="app-sidebar">App Sidebar</div>,
}))

// Mock the SidebarCookieSync
vi.mock('@/components/layout/sidebar-cookie-sync', () => ({
  SidebarCookieSync: () => <div data-testid="sidebar-cookie-sync" />,
}))

// Mock the Separator
vi.mock('@/components/ui/separator', () => ({
  Separator: ({ orientation, className }: { orientation?: string; className?: string }) => (
    <div data-testid="separator" data-orientation={orientation} className={className} />
  ),
}))

// Import after mocks are set up
import DashboardLayout from './layout'

describe('DashboardLayout', () => {
  describe('rendering', () => {
    it('should render children', async () => {
      const Layout = await DashboardLayout({
        children: <div data-testid="child">Child Content</div>,
      })
      render(Layout)
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('should render SidebarProvider', async () => {
      const Layout = await DashboardLayout({
        children: <div>Content</div>,
      })
      render(Layout)
      expect(screen.getByTestId('sidebar-provider')).toBeInTheDocument()
    })

    it('should render AppSidebar', async () => {
      const Layout = await DashboardLayout({
        children: <div>Content</div>,
      })
      render(Layout)
      expect(screen.getByTestId('app-sidebar')).toBeInTheDocument()
    })

    it('should render SidebarCookieSync', async () => {
      const Layout = await DashboardLayout({
        children: <div>Content</div>,
      })
      render(Layout)
      expect(screen.getByTestId('sidebar-cookie-sync')).toBeInTheDocument()
    })

    it('should render SidebarInset', async () => {
      const Layout = await DashboardLayout({
        children: <div>Content</div>,
      })
      render(Layout)
      expect(screen.getByTestId('sidebar-inset')).toBeInTheDocument()
    })

    it('should render SidebarTrigger', async () => {
      const Layout = await DashboardLayout({
        children: <div>Content</div>,
      })
      render(Layout)
      expect(screen.getByTestId('sidebar-trigger')).toBeInTheDocument()
    })

    it('should render Separator', async () => {
      const Layout = await DashboardLayout({
        children: <div>Content</div>,
      })
      render(Layout)
      expect(screen.getByTestId('separator')).toBeInTheDocument()
    })
  })

  describe('sidebar state from cookies', () => {
    it('should pass defaultOpen based on cookie value', async () => {
      const Layout = await DashboardLayout({
        children: <div>Content</div>,
      })
      render(Layout)
      // Cookie value is 'true', so sidebar should be open (defaultOpen !== false)
      expect(screen.getByTestId('sidebar-provider')).toHaveAttribute('data-default-open', 'true')
    })
  })

  describe('header structure', () => {
    it('should render header with correct structure', async () => {
      const Layout = await DashboardLayout({
        children: <div>Content</div>,
      })
      render(Layout)

      // Check header contains trigger and separator
      const trigger = screen.getByTestId('sidebar-trigger')
      const separator = screen.getByTestId('separator')

      expect(trigger).toBeInTheDocument()
      expect(separator).toBeInTheDocument()
      expect(separator).toHaveAttribute('data-orientation', 'vertical')
    })
  })

  describe('main content', () => {
    it('should render children in main area', async () => {
      const Layout = await DashboardLayout({
        children: <div data-testid="child">Main Content</div>,
      })
      render(Layout)

      const child = screen.getByTestId('child')
      expect(child).toHaveTextContent('Main Content')
    })
  })
})

describe('DashboardLayout Cookie Handling', () => {
  it('should correctly determine defaultOpen from cookie', async () => {
    // The mock returns value: 'true', so defaultOpen should be true
    const Layout = await DashboardLayout({
      children: <div>Content</div>,
    })
    render(Layout)

    // When cookie value is 'true', it's not equal to 'false', so defaultOpen is true
    expect(screen.getByTestId('sidebar-provider')).toHaveAttribute('data-default-open', 'true')
  })
})
