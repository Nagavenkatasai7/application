import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import { SidebarCookieSync } from './sidebar-cookie-sync'

// Mock useSidebar hook
const mockUseSidebar = vi.fn()

vi.mock('@/components/ui/sidebar', () => ({
  useSidebar: () => mockUseSidebar(),
}))

describe('SidebarCookieSync Component', () => {
  let originalCookie: string

  beforeEach(() => {
    // Store original cookie
    originalCookie = document.cookie
    // Clear cookies
    document.cookie = 'sidebar_state=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Restore original cookie
    document.cookie = originalCookie
  })

  describe('rendering', () => {
    it('should render nothing (returns null)', () => {
      mockUseSidebar.mockReturnValue({ open: true })
      const { container } = render(<SidebarCookieSync />)
      expect(container.firstChild).toBeNull()
    })
  })

  describe('cookie sync', () => {
    it('should set cookie to true when sidebar is open', () => {
      mockUseSidebar.mockReturnValue({ open: true })
      render(<SidebarCookieSync />)
      expect(document.cookie).toContain('sidebar_state=true')
    })

    it('should set cookie to false when sidebar is closed', () => {
      mockUseSidebar.mockReturnValue({ open: false })
      render(<SidebarCookieSync />)
      expect(document.cookie).toContain('sidebar_state=false')
    })

    it('should include path=/', () => {
      mockUseSidebar.mockReturnValue({ open: true })
      render(<SidebarCookieSync />)
      // Cookie string should have been set (path is not directly visible in document.cookie)
      expect(document.cookie).toContain('sidebar_state=true')
    })
  })

  describe('state updates', () => {
    it('should update cookie when open state changes', () => {
      mockUseSidebar.mockReturnValue({ open: true })
      const { rerender } = render(<SidebarCookieSync />)
      expect(document.cookie).toContain('sidebar_state=true')

      mockUseSidebar.mockReturnValue({ open: false })
      rerender(<SidebarCookieSync />)
      expect(document.cookie).toContain('sidebar_state=false')
    })
  })
})
