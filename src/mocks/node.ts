// src/mocks/node.ts
// MSW server setup for Node.js environment (unit/integration tests)
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
