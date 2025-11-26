// __mocks__/zustand.ts
// Official Zustand mock pattern to reset state between tests
import { act } from '@testing-library/react'
import type * as ZustandExportedTypes from 'zustand'

const { create: actualCreate } = await import('zustand')

// Store reset functions for cleanup
export const storeResetFns = new Set<() => void>()

// Wrap the actual create function to track initial state
export const create = (<T>(stateCreator: ZustandExportedTypes.StateCreator<T>) => {
  const store = actualCreate(stateCreator)
  const initialState = store.getInitialState()
  storeResetFns.add(() => store.setState(initialState, true))
  return store
}) as typeof ZustandExportedTypes.create

// Reset all stores after each test
afterEach(() => {
  act(() => storeResetFns.forEach((resetFn) => resetFn()))
})

// Re-export everything else from zustand
export * from 'zustand'
