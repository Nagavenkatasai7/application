// src/tests/setup.ts
import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock window.matchMedia for tests that use media queries
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver
class ResizeObserverMock {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

window.ResizeObserver = ResizeObserverMock

// Mock IntersectionObserver
class IntersectionObserverMock {
  readonly root: Element | null = null
  readonly rootMargin: string = ''
  readonly thresholds: ReadonlyArray<number> = []

  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  takeRecords = vi.fn().mockReturnValue([])
}

window.IntersectionObserver = IntersectionObserverMock as unknown as typeof IntersectionObserver

// Mock scrollTo
window.scrollTo = vi.fn()

// Disable Framer Motion animations for consistent snapshots
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion')
  return {
    ...actual,
    motion: {
      div: 'div',
      span: 'span',
      button: 'button',
      ul: 'ul',
      li: 'li',
      a: 'a',
      p: 'p',
      h1: 'h1',
      h2: 'h2',
      h3: 'h3',
      nav: 'nav',
      header: 'header',
      footer: 'footer',
      main: 'main',
      section: 'section',
      article: 'article',
      aside: 'aside',
      svg: 'svg',
      path: 'path',
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    useMotionValue: (initial: number = 0) => {
      let value = initial
      const listeners: Array<(v: number) => void> = []
      return {
        set: (v: number) => {
          value = v
          listeners.forEach(listener => listener(v))
        },
        get: () => value,
        on: (_event: string, callback: (v: number) => void) => {
          listeners.push(callback)
          // Immediately call with current value
          callback(value)
          return () => {
            const index = listeners.indexOf(callback)
            if (index > -1) listeners.splice(index, 1)
          }
        },
      }
    },
    useSpring: (source: { get: () => number; on: (event: string, cb: (v: number) => void) => () => void }) => source,
    useTransform: <T,>(source: { get: () => number; on: (event: string, cb: (v: number) => void) => () => void }, transform: (v: number) => T) => {
      const listeners: Array<(v: T) => void> = []
      // Subscribe to source changes
      source.on('change', (v: number) => {
        const transformed = transform(v)
        listeners.forEach(listener => listener(transformed))
      })
      return {
        get: () => transform(source.get()),
        on: (_event: string, callback: (v: T) => void) => {
          listeners.push(callback)
          // Immediately call with current value
          callback(transform(source.get()))
          return () => {
            const index = listeners.indexOf(callback)
            if (index > -1) listeners.splice(index, 1)
          }
        },
      }
    },
  }
})

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}))

