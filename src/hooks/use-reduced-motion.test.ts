import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useReducedMotion } from './use-reduced-motion'

describe('useReducedMotion Hook', () => {
  const originalMatchMedia = window.matchMedia
  let mediaQueryCallback: ((event: MediaQueryListEvent) => void) | null = null

  const createMockMatchMedia = (matches: boolean = false) => {
    return vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn((event: string, callback: (event: MediaQueryListEvent) => void) => {
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
    window.matchMedia = originalMatchMedia
    mediaQueryCallback = null
    vi.clearAllMocks()
  })

  it('should return false when reduced motion is not preferred', () => {
    window.matchMedia = createMockMatchMedia(false)

    const { result } = renderHook(() => useReducedMotion())

    expect(result.current).toBe(false)
  })

  it('should return true when reduced motion is preferred', () => {
    window.matchMedia = createMockMatchMedia(true)

    const { result } = renderHook(() => useReducedMotion())

    expect(result.current).toBe(true)
  })

  it('should call matchMedia with correct query', () => {
    renderHook(() => useReducedMotion())

    expect(window.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')
  })

  it('should add event listener on mount', () => {
    const addEventListener = vi.fn()
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener,
      removeEventListener: vi.fn(),
    })) as unknown as typeof window.matchMedia

    renderHook(() => useReducedMotion())

    expect(addEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })

  it('should remove event listener on unmount', () => {
    const removeEventListener = vi.fn()
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn((event: string, callback: () => void) => {
        if (event === 'change') {
          mediaQueryCallback = callback
        }
      }),
      removeEventListener,
    })) as unknown as typeof window.matchMedia

    const { unmount } = renderHook(() => useReducedMotion())
    unmount()

    expect(removeEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })

  it('should update when preference changes to reduced motion', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn((event: string, callback: (event: MediaQueryListEvent) => void) => {
        if (event === 'change') {
          mediaQueryCallback = callback
        }
      }),
      removeEventListener: vi.fn(),
    })) as unknown as typeof window.matchMedia

    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(false)

    // Simulate preference change
    act(() => {
      if (mediaQueryCallback) {
        mediaQueryCallback({ matches: true } as MediaQueryListEvent)
      }
    })

    expect(result.current).toBe(true)
  })

  it('should update when preference changes to no reduced motion', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: true,
      media: query,
      addEventListener: vi.fn((event: string, callback: (event: MediaQueryListEvent) => void) => {
        if (event === 'change') {
          mediaQueryCallback = callback
        }
      }),
      removeEventListener: vi.fn(),
    })) as unknown as typeof window.matchMedia

    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(true)

    // Simulate preference change
    act(() => {
      if (mediaQueryCallback) {
        mediaQueryCallback({ matches: false } as MediaQueryListEvent)
      }
    })

    expect(result.current).toBe(false)
  })
})
