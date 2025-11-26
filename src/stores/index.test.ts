import { describe, it, expect } from 'vitest'
import { useUIStore, useEditorStore, useSurveyStore } from './index'

describe('Store Exports', () => {
  it('should export useUIStore', () => {
    expect(useUIStore).toBeDefined()
    expect(typeof useUIStore).toBe('function')
  })

  it('should export useEditorStore', () => {
    expect(useEditorStore).toBeDefined()
    expect(typeof useEditorStore).toBe('function')
  })

  it('should export useSurveyStore', () => {
    expect(useSurveyStore).toBeDefined()
    expect(typeof useSurveyStore).toBe('function')
  })

  it('useUIStore should be callable and return state', () => {
    const state = useUIStore.getState()
    expect(state).toBeDefined()
  })

  it('useEditorStore should be callable and return state', () => {
    const state = useEditorStore.getState()
    expect(state).toBeDefined()
  })

  it('useSurveyStore should be callable and return state', () => {
    const state = useSurveyStore.getState()
    expect(state).toBeDefined()
  })
})
