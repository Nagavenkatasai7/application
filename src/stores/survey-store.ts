import { create } from "zustand";

// Soft skill survey state for adaptive conversational assessment
interface SurveyMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: Date;
}

interface SurveyState {
  // Current skill being assessed
  currentSkill: string | null;
  setCurrentSkill: (skill: string | null) => void;

  // Conversation history
  messages: SurveyMessage[];
  addMessage: (message: Omit<SurveyMessage, "id" | "timestamp">) => void;
  clearMessages: () => void;

  // Survey progress
  questionCount: number;
  incrementQuestionCount: () => void;
  resetQuestionCount: () => void;

  // Evidence score (1-5)
  evidenceScore: number | null;
  setEvidenceScore: (score: number | null) => void;

  // Generated statement
  generatedStatement: string | null;
  setGeneratedStatement: (statement: string | null) => void;

  // Loading state
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;

  // Survey completion
  isComplete: boolean;
  setIsComplete: (complete: boolean) => void;

  // Reset survey
  resetSurvey: () => void;
}

const initialState = {
  currentSkill: null,
  messages: [],
  questionCount: 0,
  evidenceScore: null,
  generatedStatement: null,
  isProcessing: false,
  isComplete: false,
};

export const useSurveyStore = create<SurveyState>()((set) => ({
  ...initialState,

  setCurrentSkill: (skill) => set({ currentSkill: skill }),

  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        },
      ],
    })),

  clearMessages: () => set({ messages: [] }),

  incrementQuestionCount: () =>
    set((state) => ({ questionCount: state.questionCount + 1 })),

  resetQuestionCount: () => set({ questionCount: 0 }),

  setEvidenceScore: (score) => set({ evidenceScore: score }),

  setGeneratedStatement: (statement) => set({ generatedStatement: statement }),

  setIsProcessing: (processing) => set({ isProcessing: processing }),

  setIsComplete: (complete) => set({ isComplete: complete }),

  resetSurvey: () => set(initialState),
}));

export type { SurveyMessage };
