import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useIsMobile } from './use-mobile'

describe('useIsMobile Hook', () => {
  const originalInnerWidth = window.innerWidth
  const originalMatchMedia = window.matchMedia
  let mediaQueryCallback: ((event: { matches: boolean }) => void) | null = null

  const createMockMatchMedia = (matches: boolean = false) => {
    return vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn((event: string, callback: () => void) => {
        if (event === 'change') {
          mediaQueryCallback = callback
        }
      }),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })) as unknown as typeof window.matchMedia
  }

  beforeEach(() => {
    window.matchMedia = createMockMatchMedia(false)
  })

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    })
    window.matchMedia = originalMatchMedia
    mediaQueryCallback = null
  })

  it('should return false for desktop width', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(false)
  })

  it('should return true for mobile width', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    })

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(true)
  })

  it('should return false for exactly 768px (breakpoint)', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    })

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(false)
  })

  it('should return true for 767px (just below breakpoint)', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 767,
    })

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(true)
  })

  it('should call matchMedia with correct query', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })

    renderHook(() => useIsMobile())

    expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 767px)')
  })

  it('should add event listener on mount', () => {
    const addEventListener = vi.fn()
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener,
      removeEventListener: vi.fn(),
    })) as unknown as typeof window.matchMedia

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })

    renderHook(() => useIsMobile())

    expect(addEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })

  it('should remove event listener on unmount', () => {
    const removeEventListener = vi.fn()
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener,
    })) as unknown as typeof window.matchMedia

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })

    const { unmount } = renderHook(() => useIsMobile())
    unmount()

    expect(removeEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })

  it('should update when window is resized to mobile', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)

    // Simulate resize to mobile
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      if (mediaQueryCallback) {
        mediaQueryCallback({ matches: true })
      }
    })

    expect(result.current).toBe(true)
  })
})
