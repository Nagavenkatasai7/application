import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AppSidebar } from './app-sidebar'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}))

// Mock the sidebar UI components
vi.mock('@/components/ui/sidebar', () => ({
  Sidebar: ({ children, collapsible }: { children: React.ReactNode; collapsible?: string }) => (
    <div data-testid="sidebar" data-collapsible={collapsible}>{children}</div>
  ),
  SidebarContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-content">{children}</div>
  ),
  SidebarFooter: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="sidebar-footer" className={className}>{children}</div>
  ),
  SidebarGroup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-group">{children}</div>
  ),
  SidebarGroupContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-group-content">{children}</div>
  ),
  SidebarGroupLabel: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-group-label">{children}</div>
  ),
  SidebarHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="sidebar-header" className={className}>{children}</div>
  ),
  SidebarMenu: ({ children }: { children: React.ReactNode }) => (
    <ul data-testid="sidebar-menu">{children}</ul>
  ),
  SidebarMenuButton: ({ children, asChild, isActive, tooltip, size }: {
    children: React.ReactNode;
    asChild?: boolean;
    isActive?: boolean;
    tooltip?: string;
    size?: string;
  }) => (
    <button data-testid="sidebar-menu-button" data-active={isActive} data-tooltip={tooltip} data-size={size}>
      {children}
    </button>
  ),
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => (
    <li data-testid="sidebar-menu-item">{children}</li>
  ),
  SidebarRail: () => <div data-testid="sidebar-rail" />,
}))

describe('AppSidebar Component', () => {
  describe('rendering', () => {
    it('should render the sidebar', () => {
      render(<AppSidebar />)
      expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    })

    it('should render sidebar header', () => {
      render(<AppSidebar />)
      expect(screen.getByTestId('sidebar-header')).toBeInTheDocument()
    })

    it('should render sidebar content', () => {
      render(<AppSidebar />)
      expect(screen.getByTestId('sidebar-content')).toBeInTheDocument()
    })

    it('should render sidebar footer', () => {
      render(<AppSidebar />)
      expect(screen.getByTestId('sidebar-footer')).toBeInTheDocument()
    })

    it('should render sidebar rail', () => {
      render(<AppSidebar />)
      expect(screen.getByTestId('sidebar-rail')).toBeInTheDocument()
    })

    it('should have collapsible icon mode', () => {
      render(<AppSidebar />)
      expect(screen.getByTestId('sidebar')).toHaveAttribute('data-collapsible', 'icon')
    })
  })

  describe('branding', () => {
    it('should render Resume Tailor branding', () => {
      render(<AppSidebar />)
      expect(screen.getByText('Resume Tailor')).toBeInTheDocument()
    })

    it('should render AI-Powered Optimization tagline', () => {
      render(<AppSidebar />)
      expect(screen.getByText('AI-Powered Optimization')).toBeInTheDocument()
    })
  })

  describe('navigation', () => {
    it('should render Dashboard link', () => {
      render(<AppSidebar />)
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    it('should render Analysis Modules section', () => {
      render(<AppSidebar />)
      expect(screen.getByText('Analysis Modules')).toBeInTheDocument()
    })

    it('should render Management section', () => {
      render(<AppSidebar />)
      expect(screen.getByText('Management')).toBeInTheDocument()
    })

    it('should render all analysis modules', () => {
      render(<AppSidebar />)
      expect(screen.getByText('Uniqueness')).toBeInTheDocument()
      expect(screen.getByText('Impact')).toBeInTheDocument()
      expect(screen.getByText('Context')).toBeInTheDocument()
      expect(screen.getByText('Soft Skills')).toBeInTheDocument()
      expect(screen.getByText('Company Research')).toBeInTheDocument()
    })

    it('should render all management items', () => {
      render(<AppSidebar />)
      expect(screen.getByText('Jobs')).toBeInTheDocument()
      expect(screen.getByText('Applications')).toBeInTheDocument()
      expect(screen.getByText('Resumes')).toBeInTheDocument()
    })

    it('should render Settings in footer', () => {
      render(<AppSidebar />)
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })
  })

  describe('links', () => {
    it('should have correct link to dashboard', () => {
      render(<AppSidebar />)
      const links = screen.getAllByRole('link')
      const dashboardLink = links.find((link) => link.getAttribute('href') === '/')
      expect(dashboardLink).toBeInTheDocument()
    })

    it('should have correct link to jobs', () => {
      render(<AppSidebar />)
      const links = screen.getAllByRole('link')
      const jobsLink = links.find((link) => link.getAttribute('href') === '/jobs')
      expect(jobsLink).toBeInTheDocument()
    })

    it('should have correct link to applications', () => {
      render(<AppSidebar />)
      const links = screen.getAllByRole('link')
      const applicationsLink = links.find((link) => link.getAttribute('href') === '/applications')
      expect(applicationsLink).toBeInTheDocument()
    })

    it('should have correct link to resumes', () => {
      render(<AppSidebar />)
      const links = screen.getAllByRole('link')
      const resumesLink = links.find((link) => link.getAttribute('href') === '/resumes')
      expect(resumesLink).toBeInTheDocument()
    })

    it('should have correct link to settings', () => {
      render(<AppSidebar />)
      const links = screen.getAllByRole('link')
      const settingsLink = links.find((link) => link.getAttribute('href') === '/settings')
      expect(settingsLink).toBeInTheDocument()
    })
  })
})
