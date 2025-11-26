// src/mocks/browser.ts
// MSW service worker setup for browser environment (E2E tests, development)
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)
