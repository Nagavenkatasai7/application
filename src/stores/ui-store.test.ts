// src/stores/ui-store.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useUIStore } from './ui-store'

describe('UI Store', () => {
  beforeEach(() => {
    // Reset store to initial state
    useUIStore.setState({
      theme: 'dark',
      sidebarOpen: true,
      activeModal: null,
    })
  })

  describe('theme', () => {
    it('should have dark theme as default', () => {
      const { theme } = useUIStore.getState()
      expect(theme).toBe('dark')
    })

    it('should toggle theme between dark and light', () => {
      const { setTheme } = useUIStore.getState()

      setTheme('light')
      expect(useUIStore.getState().theme).toBe('light')

      setTheme('dark')
      expect(useUIStore.getState().theme).toBe('dark')
    })
  })

  describe('sidebar', () => {
    it('should have sidebar open by default', () => {
      const { sidebarOpen } = useUIStore.getState()
      expect(sidebarOpen).toBe(true)
    })

    it('should toggle sidebar open state', () => {
      const { toggleSidebar } = useUIStore.getState()

      toggleSidebar()
      expect(useUIStore.getState().sidebarOpen).toBe(false)

      toggleSidebar()
      expect(useUIStore.getState().sidebarOpen).toBe(true)
    })

    it('should set sidebar open state directly', () => {
      const { setSidebarOpen } = useUIStore.getState()

      setSidebarOpen(false)
      expect(useUIStore.getState().sidebarOpen).toBe(false)

      setSidebarOpen(true)
      expect(useUIStore.getState().sidebarOpen).toBe(true)
    })
  })

  describe('modal', () => {
    it('should have no active modal by default', () => {
      const { activeModal } = useUIStore.getState()
      expect(activeModal).toBeNull()
    })

    it('should open and close modals', () => {
      const { openModal, closeModal } = useUIStore.getState()

      openModal('settings')
      expect(useUIStore.getState().activeModal).toBe('settings')

      closeModal()
      expect(useUIStore.getState().activeModal).toBeNull()
    })
  })
})
