import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSurveyStore } from './survey-store'

// Mock crypto.randomUUID
vi.stubGlobal('crypto', {
  randomUUID: () => 'mock-uuid-123',
})

describe('Survey Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useSurveyStore.getState().resetSurvey()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useSurveyStore.getState()

      expect(state.currentSkill).toBeNull()
      expect(state.messages).toEqual([])
      expect(state.questionCount).toBe(0)
      expect(state.evidenceScore).toBeNull()
      expect(state.generatedStatement).toBeNull()
      expect(state.isProcessing).toBe(false)
      expect(state.isComplete).toBe(false)
    })
  })

  describe('setCurrentSkill', () => {
    it('should set current skill', () => {
      useSurveyStore.getState().setCurrentSkill('Leadership')

      expect(useSurveyStore.getState().currentSkill).toBe('Leadership')
    })

    it('should set current skill to null', () => {
      useSurveyStore.getState().setCurrentSkill('Leadership')
      useSurveyStore.getState().setCurrentSkill(null)

      expect(useSurveyStore.getState().currentSkill).toBeNull()
    })
  })

  describe('addMessage', () => {
    it('should add a message with auto-generated id and timestamp', () => {
      useSurveyStore.getState().addMessage({
        role: 'assistant',
        content: 'Hello, how are you?',
      })

      const messages = useSurveyStore.getState().messages
      expect(messages).toHaveLength(1)
      expect(messages[0].id).toBe('mock-uuid-123')
      expect(messages[0].role).toBe('assistant')
      expect(messages[0].content).toBe('Hello, how are you?')
      expect(messages[0].timestamp).toBeInstanceOf(Date)
    })

    it('should add multiple messages', () => {
      useSurveyStore.getState().addMessage({
        role: 'assistant',
        content: 'Question 1',
      })
      useSurveyStore.getState().addMessage({
        role: 'user',
        content: 'Answer 1',
      })

      const messages = useSurveyStore.getState().messages
      expect(messages).toHaveLength(2)
      expect(messages[0].role).toBe('assistant')
      expect(messages[1].role).toBe('user')
    })
  })

  describe('clearMessages', () => {
    it('should clear all messages', () => {
      useSurveyStore.getState().addMessage({ role: 'assistant', content: 'Test' })
      useSurveyStore.getState().addMessage({ role: 'user', content: 'Response' })

      useSurveyStore.getState().clearMessages()

      expect(useSurveyStore.getState().messages).toEqual([])
    })
  })

  describe('questionCount', () => {
    it('should increment question count', () => {
      expect(useSurveyStore.getState().questionCount).toBe(0)

      useSurveyStore.getState().incrementQuestionCount()
      expect(useSurveyStore.getState().questionCount).toBe(1)

      useSurveyStore.getState().incrementQuestionCount()
      expect(useSurveyStore.getState().questionCount).toBe(2)
    })

    it('should reset question count', () => {
      useSurveyStore.getState().incrementQuestionCount()
      useSurveyStore.getState().incrementQuestionCount()

      useSurveyStore.getState().resetQuestionCount()

      expect(useSurveyStore.getState().questionCount).toBe(0)
    })
  })

  describe('setEvidenceScore', () => {
    it('should set evidence score', () => {
      useSurveyStore.getState().setEvidenceScore(4)

      expect(useSurveyStore.getState().evidenceScore).toBe(4)
    })

    it('should accept scores from 1 to 5', () => {
      for (let i = 1; i <= 5; i++) {
        useSurveyStore.getState().setEvidenceScore(i)
        expect(useSurveyStore.getState().evidenceScore).toBe(i)
      }
    })

    it('should set evidence score to null', () => {
      useSurveyStore.getState().setEvidenceScore(3)
      useSurveyStore.getState().setEvidenceScore(null)

      expect(useSurveyStore.getState().evidenceScore).toBeNull()
    })
  })

  describe('setGeneratedStatement', () => {
    it('should set generated statement', () => {
      const statement = 'Led cross-functional teams to deliver 3 projects on time.'
      useSurveyStore.getState().setGeneratedStatement(statement)

      expect(useSurveyStore.getState().generatedStatement).toBe(statement)
    })

    it('should set generated statement to null', () => {
      useSurveyStore.getState().setGeneratedStatement('Test statement')
      useSurveyStore.getState().setGeneratedStatement(null)

      expect(useSurveyStore.getState().generatedStatement).toBeNull()
    })
  })

  describe('setIsProcessing', () => {
    it('should set processing state to true', () => {
      useSurveyStore.getState().setIsProcessing(true)

      expect(useSurveyStore.getState().isProcessing).toBe(true)
    })

    it('should set processing state to false', () => {
      useSurveyStore.getState().setIsProcessing(true)
      useSurveyStore.getState().setIsProcessing(false)

      expect(useSurveyStore.getState().isProcessing).toBe(false)
    })
  })

  describe('setIsComplete', () => {
    it('should set complete state to true', () => {
      useSurveyStore.getState().setIsComplete(true)

      expect(useSurveyStore.getState().isComplete).toBe(true)
    })

    it('should set complete state to false', () => {
      useSurveyStore.getState().setIsComplete(true)
      useSurveyStore.getState().setIsComplete(false)

      expect(useSurveyStore.getState().isComplete).toBe(false)
    })
  })

  describe('resetSurvey', () => {
    it('should reset all state to initial values', () => {
      // Set various state
      useSurveyStore.getState().setCurrentSkill('Leadership')
      useSurveyStore.getState().addMessage({ role: 'assistant', content: 'Test' })
      useSurveyStore.getState().incrementQuestionCount()
      useSurveyStore.getState().setEvidenceScore(4)
      useSurveyStore.getState().setGeneratedStatement('Test statement')
      useSurveyStore.getState().setIsProcessing(true)
      useSurveyStore.getState().setIsComplete(true)

      // Reset
      useSurveyStore.getState().resetSurvey()

      // Verify all reset
      const state = useSurveyStore.getState()
      expect(state.currentSkill).toBeNull()
      expect(state.messages).toEqual([])
      expect(state.questionCount).toBe(0)
      expect(state.evidenceScore).toBeNull()
      expect(state.generatedStatement).toBeNull()
      expect(state.isProcessing).toBe(false)
      expect(state.isComplete).toBe(false)
    })
  })

  describe('full survey flow', () => {
    it('should support a complete survey workflow', () => {
      // Start survey
      useSurveyStore.getState().setCurrentSkill('Problem Solving')
      expect(useSurveyStore.getState().currentSkill).toBe('Problem Solving')

      // Add conversation
      useSurveyStore.getState().addMessage({ role: 'assistant', content: 'Describe a challenging problem you solved.' })
      useSurveyStore.getState().incrementQuestionCount()

      useSurveyStore.getState().addMessage({ role: 'user', content: 'I debugged a critical production issue...' })

      useSurveyStore.getState().addMessage({ role: 'assistant', content: 'How did you approach the debugging?' })
      useSurveyStore.getState().incrementQuestionCount()

      // Processing state
      useSurveyStore.getState().setIsProcessing(true)
      expect(useSurveyStore.getState().isProcessing).toBe(true)

      // Complete with results
      useSurveyStore.getState().setIsProcessing(false)
      useSurveyStore.getState().setEvidenceScore(4)
      useSurveyStore.getState().setGeneratedStatement('Demonstrated strong analytical skills...')
      useSurveyStore.getState().setIsComplete(true)

      // Verify final state
      const finalState = useSurveyStore.getState()
      expect(finalState.currentSkill).toBe('Problem Solving')
      expect(finalState.messages).toHaveLength(3)
      expect(finalState.questionCount).toBe(2)
      expect(finalState.evidenceScore).toBe(4)
      expect(finalState.generatedStatement).toBeTruthy()
      expect(finalState.isComplete).toBe(true)
    })
  })
})
