// src/stores/editor-store.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useEditorStore } from './editor-store'

describe('Editor Store', () => {
  beforeEach(() => {
    // Reset store to initial state
    useEditorStore.getState().resetEditor()
  })

  describe('resume selection', () => {
    it('should have no resume selected by default', () => {
      const { currentResumeId } = useEditorStore.getState()
      expect(currentResumeId).toBeNull()
    })

    it('should set current resume ID', () => {
      const { setCurrentResumeId } = useEditorStore.getState()

      setCurrentResumeId('resume-123')
      expect(useEditorStore.getState().currentResumeId).toBe('resume-123')
    })

    it('should clear current resume ID', () => {
      const { setCurrentResumeId } = useEditorStore.getState()

      setCurrentResumeId('resume-123')
      setCurrentResumeId(null)
      expect(useEditorStore.getState().currentResumeId).toBeNull()
    })
  })

  describe('target job selection', () => {
    it('should have no target job by default', () => {
      const { targetJobId } = useEditorStore.getState()
      expect(targetJobId).toBeNull()
    })

    it('should set target job ID', () => {
      const { setTargetJobId } = useEditorStore.getState()

      setTargetJobId('job-456')
      expect(useEditorStore.getState().targetJobId).toBe('job-456')
    })
  })

  describe('unsaved changes', () => {
    it('should not have unsaved changes by default', () => {
      const { hasUnsavedChanges } = useEditorStore.getState()
      expect(hasUnsavedChanges).toBe(false)
    })

    it('should track unsaved changes', () => {
      const { setHasUnsavedChanges } = useEditorStore.getState()

      setHasUnsavedChanges(true)
      expect(useEditorStore.getState().hasUnsavedChanges).toBe(true)

      setHasUnsavedChanges(false)
      expect(useEditorStore.getState().hasUnsavedChanges).toBe(false)
    })
  })

  describe('resume content', () => {
    it('should have no resume content by default', () => {
      const { resumeContent } = useEditorStore.getState()
      expect(resumeContent).toBeNull()
    })

    it('should set resume content', () => {
      const { setResumeContent } = useEditorStore.getState()

      const mockContent = {
        contact: {
          name: 'John Doe',
          email: 'john@example.com',
        },
        experiences: [],
        education: [],
        skills: {
          technical: ['TypeScript'],
          soft: ['Communication'],
        },
      }

      setResumeContent(mockContent)
      expect(useEditorStore.getState().resumeContent).toEqual(mockContent)
    })

    it('should reset unsaved changes when setting content', () => {
      const { setHasUnsavedChanges, setResumeContent } = useEditorStore.getState()

      setHasUnsavedChanges(true)
      setResumeContent({
        contact: { name: 'Test', email: 'test@test.com' },
        experiences: [],
        education: [],
        skills: { technical: [], soft: [] },
      })

      expect(useEditorStore.getState().hasUnsavedChanges).toBe(false)
    })
  })

  describe('selected section', () => {
    it('should have no section selected by default', () => {
      const { selectedSection } = useEditorStore.getState()
      expect(selectedSection).toBeNull()
    })

    it('should set selected section', () => {
      const { setSelectedSection } = useEditorStore.getState()

      setSelectedSection('experience')
      expect(useEditorStore.getState().selectedSection).toBe('experience')

      setSelectedSection('education')
      expect(useEditorStore.getState().selectedSection).toBe('education')
    })
  })

  describe('tailored content', () => {
    it('should have no tailored content by default', () => {
      const { tailoredContent } = useEditorStore.getState()
      expect(tailoredContent).toBeNull()
    })

    it('should set tailored content', () => {
      const { setTailoredContent } = useEditorStore.getState()

      const mockTailored = {
        contact: { name: 'Jane Doe', email: 'jane@example.com' },
        experiences: [],
        education: [],
        skills: { technical: ['React', 'Node.js'], soft: ['Leadership'] },
      }

      setTailoredContent(mockTailored)
      expect(useEditorStore.getState().tailoredContent).toEqual(mockTailored)
    })
  })

  describe('reset', () => {
    it('should reset all state to initial values', () => {
      const store = useEditorStore.getState()

      // Set some values
      store.setCurrentResumeId('resume-1')
      store.setTargetJobId('job-1')
      store.setHasUnsavedChanges(true)
      store.setSelectedSection('skills')

      // Reset
      store.resetEditor()

      // Verify all reset
      const state = useEditorStore.getState()
      expect(state.currentResumeId).toBeNull()
      expect(state.targetJobId).toBeNull()
      expect(state.hasUnsavedChanges).toBe(false)
      expect(state.selectedSection).toBeNull()
      expect(state.resumeContent).toBeNull()
      expect(state.tailoredContent).toBeNull()
    })
  })
})
