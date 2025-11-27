import { describe, it, expect } from "vitest";
import {
  surveyMessageSchema,
  startAssessmentRequestSchema,
  chatRequestSchema,
  chatResponseSchema,
  assessmentResultSchema,
  SOFT_SKILLS_LIST,
  getEvidenceScoreLabel,
  getEvidenceScoreColor,
  getEvidenceScoreBgColor,
} from "./soft-skills";

describe("Soft Skills Validation", () => {
  describe("surveyMessageSchema", () => {
    it("should validate a valid assistant message", () => {
      const result = surveyMessageSchema.safeParse({
        role: "assistant",
        content: "Tell me about a time when you demonstrated leadership.",
      });
      expect(result.success).toBe(true);
    });

    it("should validate a valid user message", () => {
      const result = surveyMessageSchema.safeParse({
        role: "user",
        content: "I led a team of 5 engineers on a critical project.",
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty content", () => {
      const result = surveyMessageSchema.safeParse({
        role: "assistant",
        content: "",
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid role", () => {
      const result = surveyMessageSchema.safeParse({
        role: "system",
        content: "Hello",
      });
      expect(result.success).toBe(false);
    });

    it("should reject missing role", () => {
      const result = surveyMessageSchema.safeParse({
        content: "Hello",
      });
      expect(result.success).toBe(false);
    });

    it("should reject missing content", () => {
      const result = surveyMessageSchema.safeParse({
        role: "user",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("startAssessmentRequestSchema", () => {
    it("should validate a valid skill name", () => {
      const result = startAssessmentRequestSchema.safeParse({
        skillName: "Leadership",
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty skill name", () => {
      const result = startAssessmentRequestSchema.safeParse({
        skillName: "",
      });
      expect(result.success).toBe(false);
    });

    it("should reject skill name over 100 characters", () => {
      const result = startAssessmentRequestSchema.safeParse({
        skillName: "A".repeat(101),
      });
      expect(result.success).toBe(false);
    });

    it("should reject missing skill name", () => {
      const result = startAssessmentRequestSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("should accept skill name at max length", () => {
      const result = startAssessmentRequestSchema.safeParse({
        skillName: "A".repeat(100),
      });
      expect(result.success).toBe(true);
    });
  });

  describe("chatRequestSchema", () => {
    it("should validate a valid chat request", () => {
      const result = chatRequestSchema.safeParse({
        skillId: "550e8400-e29b-41d4-a716-446655440000",
        message: "I managed a team of 10 developers.",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid UUID", () => {
      const result = chatRequestSchema.safeParse({
        skillId: "not-a-uuid",
        message: "Hello",
      });
      expect(result.success).toBe(false);
    });

    it("should reject empty message", () => {
      const result = chatRequestSchema.safeParse({
        skillId: "550e8400-e29b-41d4-a716-446655440000",
        message: "",
      });
      expect(result.success).toBe(false);
    });

    it("should reject message over 2000 characters", () => {
      const result = chatRequestSchema.safeParse({
        skillId: "550e8400-e29b-41d4-a716-446655440000",
        message: "A".repeat(2001),
      });
      expect(result.success).toBe(false);
    });

    it("should accept message at max length", () => {
      const result = chatRequestSchema.safeParse({
        skillId: "550e8400-e29b-41d4-a716-446655440000",
        message: "A".repeat(2000),
      });
      expect(result.success).toBe(true);
    });

    it("should reject missing skillId", () => {
      const result = chatRequestSchema.safeParse({
        message: "Hello",
      });
      expect(result.success).toBe(false);
    });

    it("should reject missing message", () => {
      const result = chatRequestSchema.safeParse({
        skillId: "550e8400-e29b-41d4-a716-446655440000",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("chatResponseSchema", () => {
    it("should validate a mid-conversation response", () => {
      const result = chatResponseSchema.safeParse({
        message: "Tell me more about that experience.",
        isComplete: false,
        questionNumber: 2,
        evidenceScore: null,
        statement: null,
      });
      expect(result.success).toBe(true);
    });

    it("should validate a complete response", () => {
      const result = chatResponseSchema.safeParse({
        message: "Great conversation! Here's your assessment.",
        isComplete: true,
        questionNumber: 5,
        evidenceScore: 4,
        statement: "Demonstrated strong leadership skills.",
      });
      expect(result.success).toBe(true);
    });

    it("should reject question number below 1", () => {
      const result = chatResponseSchema.safeParse({
        message: "Hello",
        isComplete: false,
        questionNumber: 0,
        evidenceScore: null,
        statement: null,
      });
      expect(result.success).toBe(false);
    });

    it("should reject question number above 5", () => {
      const result = chatResponseSchema.safeParse({
        message: "Hello",
        isComplete: false,
        questionNumber: 6,
        evidenceScore: null,
        statement: null,
      });
      expect(result.success).toBe(false);
    });

    it("should reject evidence score below 1", () => {
      const result = chatResponseSchema.safeParse({
        message: "Hello",
        isComplete: true,
        questionNumber: 5,
        evidenceScore: 0,
        statement: "Test",
      });
      expect(result.success).toBe(false);
    });

    it("should reject evidence score above 5", () => {
      const result = chatResponseSchema.safeParse({
        message: "Hello",
        isComplete: true,
        questionNumber: 5,
        evidenceScore: 6,
        statement: "Test",
      });
      expect(result.success).toBe(false);
    });

    it("should accept all valid evidence scores", () => {
      for (let score = 1; score <= 5; score++) {
        const result = chatResponseSchema.safeParse({
          message: "Hello",
          isComplete: true,
          questionNumber: 5,
          evidenceScore: score,
          statement: "Test",
        });
        expect(result.success).toBe(true);
      }
    });
  });

  describe("assessmentResultSchema", () => {
    it("should validate a complete assessment result", () => {
      const result = assessmentResultSchema.safeParse({
        id: "test-id",
        skillName: "Leadership",
        evidenceScore: 4,
        statement: "Strong leadership skills demonstrated.",
        conversation: [
          { role: "assistant", content: "Question 1" },
          { role: "user", content: "Answer 1" },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid conversation messages", () => {
      const result = assessmentResultSchema.safeParse({
        id: "test-id",
        skillName: "Leadership",
        evidenceScore: 4,
        statement: "Test",
        conversation: [
          { role: "invalid", content: "Question 1" },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      expect(result.success).toBe(false);
    });
  });

  describe("SOFT_SKILLS_LIST", () => {
    it("should contain expected skills", () => {
      expect(SOFT_SKILLS_LIST).toContain("Leadership");
      expect(SOFT_SKILLS_LIST).toContain("Communication");
      expect(SOFT_SKILLS_LIST).toContain("Problem Solving");
      expect(SOFT_SKILLS_LIST).toContain("Teamwork");
    });

    it("should have 15 skills", () => {
      expect(SOFT_SKILLS_LIST.length).toBe(15);
    });

    it("should not contain duplicates", () => {
      const uniqueSkills = new Set(SOFT_SKILLS_LIST);
      expect(uniqueSkills.size).toBe(SOFT_SKILLS_LIST.length);
    });
  });

  describe("getEvidenceScoreLabel", () => {
    it("should return correct labels for all scores", () => {
      expect(getEvidenceScoreLabel(1)).toBe("Developing");
      expect(getEvidenceScoreLabel(2)).toBe("Foundational");
      expect(getEvidenceScoreLabel(3)).toBe("Competent");
      expect(getEvidenceScoreLabel(4)).toBe("Proficient");
      expect(getEvidenceScoreLabel(5)).toBe("Expert");
    });

    it("should return Unknown for invalid scores", () => {
      expect(getEvidenceScoreLabel(0)).toBe("Unknown");
      expect(getEvidenceScoreLabel(6)).toBe("Unknown");
      expect(getEvidenceScoreLabel(-1)).toBe("Unknown");
    });
  });

  describe("getEvidenceScoreColor", () => {
    it("should return correct colors for all scores", () => {
      expect(getEvidenceScoreColor(1)).toBe("text-red-500");
      expect(getEvidenceScoreColor(2)).toBe("text-orange-500");
      expect(getEvidenceScoreColor(3)).toBe("text-yellow-500");
      expect(getEvidenceScoreColor(4)).toBe("text-green-500");
      expect(getEvidenceScoreColor(5)).toBe("text-primary");
    });

    it("should return default color for invalid scores", () => {
      expect(getEvidenceScoreColor(0)).toBe("text-muted-foreground");
      expect(getEvidenceScoreColor(6)).toBe("text-muted-foreground");
    });
  });

  describe("getEvidenceScoreBgColor", () => {
    it("should return correct background colors for all scores", () => {
      expect(getEvidenceScoreBgColor(1)).toBe("bg-red-500/10 border-red-500/20");
      expect(getEvidenceScoreBgColor(2)).toBe("bg-orange-500/10 border-orange-500/20");
      expect(getEvidenceScoreBgColor(3)).toBe("bg-yellow-500/10 border-yellow-500/20");
      expect(getEvidenceScoreBgColor(4)).toBe("bg-green-500/10 border-green-500/20");
      expect(getEvidenceScoreBgColor(5)).toBe("bg-primary/10 border-primary/20");
    });

    it("should return default background color for invalid scores", () => {
      expect(getEvidenceScoreBgColor(0)).toBe("bg-muted/50 border-muted");
      expect(getEvidenceScoreBgColor(6)).toBe("bg-muted/50 border-muted");
    });
  });
});
