import { describe, it, expect } from "vitest";
import {
  contextRequestSchema,
  matchedSkillSchema,
  missingRequirementSchema,
  experienceAlignmentSchema,
  contextResultSchema,
  getContextScoreLabel,
  getContextScoreColor,
  getRelevanceColor,
  getImportanceColor,
  getStrengthColor,
  getPriorityColor,
} from "./context";

describe("Context Validation Schemas", () => {
  describe("contextRequestSchema", () => {
    it("should accept valid UUIDs for both resumeId and jobId", () => {
      const result = contextRequestSchema.safeParse({
        resumeId: "550e8400-e29b-41d4-a716-446655440000",
        jobId: "660e8400-e29b-41d4-a716-446655440001",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid resume UUID", () => {
      const result = contextRequestSchema.safeParse({
        resumeId: "not-a-uuid",
        jobId: "660e8400-e29b-41d4-a716-446655440001",
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid job UUID", () => {
      const result = contextRequestSchema.safeParse({
        resumeId: "550e8400-e29b-41d4-a716-446655440000",
        jobId: "not-a-uuid",
      });
      expect(result.success).toBe(false);
    });

    it("should reject missing resumeId", () => {
      const result = contextRequestSchema.safeParse({
        jobId: "660e8400-e29b-41d4-a716-446655440001",
      });
      expect(result.success).toBe(false);
    });

    it("should reject missing jobId", () => {
      const result = contextRequestSchema.safeParse({
        resumeId: "550e8400-e29b-41d4-a716-446655440000",
      });
      expect(result.success).toBe(false);
    });

    it("should reject empty object", () => {
      const result = contextRequestSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe("matchedSkillSchema", () => {
    it("should accept valid matched skill", () => {
      const skill = {
        skill: "TypeScript",
        source: "technical",
        strength: "exact",
        evidence: "Listed in skills section",
      };
      const result = matchedSkillSchema.safeParse(skill);
      expect(result.success).toBe(true);
    });

    it("should accept all valid sources", () => {
      const sources = ["technical", "soft", "experience", "education"];

      sources.forEach((source) => {
        const skill = {
          skill: "Test",
          source,
          strength: "exact",
          evidence: "Test",
        };
        const result = matchedSkillSchema.safeParse(skill);
        expect(result.success).toBe(true);
      });
    });

    it("should accept all valid strengths", () => {
      const strengths = ["exact", "related", "transferable"];

      strengths.forEach((strength) => {
        const skill = {
          skill: "Test",
          source: "technical",
          strength,
          evidence: "Test",
        };
        const result = matchedSkillSchema.safeParse(skill);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid source", () => {
      const skill = {
        skill: "Test",
        source: "invalid",
        strength: "exact",
        evidence: "Test",
      };
      const result = matchedSkillSchema.safeParse(skill);
      expect(result.success).toBe(false);
    });

    it("should reject invalid strength", () => {
      const skill = {
        skill: "Test",
        source: "technical",
        strength: "invalid",
        evidence: "Test",
      };
      const result = matchedSkillSchema.safeParse(skill);
      expect(result.success).toBe(false);
    });
  });

  describe("missingRequirementSchema", () => {
    it("should accept valid missing requirement", () => {
      const req = {
        requirement: "5+ years of experience",
        importance: "critical",
        suggestion: "Highlight equivalent experience",
      };
      const result = missingRequirementSchema.safeParse(req);
      expect(result.success).toBe(true);
    });

    it("should accept all valid importance levels", () => {
      const levels = ["critical", "important", "nice_to_have"];

      levels.forEach((importance) => {
        const req = {
          requirement: "Test",
          importance,
          suggestion: "Test",
        };
        const result = missingRequirementSchema.safeParse(req);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid importance", () => {
      const req = {
        requirement: "Test",
        importance: "invalid",
        suggestion: "Test",
      };
      const result = missingRequirementSchema.safeParse(req);
      expect(result.success).toBe(false);
    });
  });

  describe("experienceAlignmentSchema", () => {
    it("should accept valid experience alignment", () => {
      const exp = {
        experienceId: "exp-1",
        experienceTitle: "Software Engineer",
        companyName: "Tech Corp",
        relevance: "high",
        matchedAspects: ["Backend development", "API design"],
        explanation: "Highly relevant experience",
      };
      const result = experienceAlignmentSchema.safeParse(exp);
      expect(result.success).toBe(true);
    });

    it("should accept all valid relevance levels", () => {
      const levels = ["high", "medium", "low"];

      levels.forEach((relevance) => {
        const exp = {
          experienceId: "exp-1",
          experienceTitle: "Test",
          companyName: "Test",
          relevance,
          matchedAspects: [],
          explanation: "Test",
        };
        const result = experienceAlignmentSchema.safeParse(exp);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid relevance", () => {
      const exp = {
        experienceId: "exp-1",
        experienceTitle: "Test",
        companyName: "Test",
        relevance: "invalid",
        matchedAspects: [],
        explanation: "Test",
      };
      const result = experienceAlignmentSchema.safeParse(exp);
      expect(result.success).toBe(false);
    });
  });

  describe("contextResultSchema", () => {
    it("should accept valid result", () => {
      const result = contextResultSchema.safeParse({
        score: 75,
        scoreLabel: "good",
        summary: "Good alignment",
        matchedSkills: [],
        missingRequirements: [],
        experienceAlignments: [],
        keywordCoverage: {
          matched: 5,
          total: 10,
          percentage: 50,
          keywords: [],
        },
        suggestions: [],
        fitAssessment: {
          strengths: ["Strong technical skills"],
          gaps: ["Needs more leadership experience"],
          overallFit: "Good fit overall",
        },
      });
      expect(result.success).toBe(true);
    });

    it("should reject score below 0", () => {
      const result = contextResultSchema.safeParse({
        score: -10,
        scoreLabel: "poor",
        summary: "Test",
        matchedSkills: [],
        missingRequirements: [],
        experienceAlignments: [],
        keywordCoverage: { matched: 0, total: 0, percentage: 0, keywords: [] },
        suggestions: [],
        fitAssessment: { strengths: [], gaps: [], overallFit: "" },
      });
      expect(result.success).toBe(false);
    });

    it("should reject score above 100", () => {
      const result = contextResultSchema.safeParse({
        score: 150,
        scoreLabel: "excellent",
        summary: "Test",
        matchedSkills: [],
        missingRequirements: [],
        experienceAlignments: [],
        keywordCoverage: { matched: 0, total: 0, percentage: 0, keywords: [] },
        suggestions: [],
        fitAssessment: { strengths: [], gaps: [], overallFit: "" },
      });
      expect(result.success).toBe(false);
    });

    it("should accept all valid score labels", () => {
      const labels = ["excellent", "good", "moderate", "weak", "poor"];

      labels.forEach((label) => {
        const result = contextResultSchema.safeParse({
          score: 50,
          scoreLabel: label,
          summary: "Test",
          matchedSkills: [],
          missingRequirements: [],
          experienceAlignments: [],
          keywordCoverage: { matched: 0, total: 0, percentage: 0, keywords: [] },
          suggestions: [],
          fitAssessment: { strengths: [], gaps: [], overallFit: "" },
        });
        expect(result.success).toBe(true);
      });
    });

    it("should accept valid suggestion structure", () => {
      const result = contextResultSchema.safeParse({
        score: 50,
        scoreLabel: "moderate",
        summary: "Test",
        matchedSkills: [],
        missingRequirements: [],
        experienceAlignments: [],
        keywordCoverage: { matched: 0, total: 0, percentage: 0, keywords: [] },
        suggestions: [
          { category: "skills", priority: "high", recommendation: "Add more skills" },
          { category: "experience", priority: "medium", recommendation: "Highlight experience" },
          { category: "keywords", priority: "low", recommendation: "Add keywords" },
          { category: "tailoring", priority: "high", recommendation: "Tailor resume" },
        ],
        fitAssessment: { strengths: [], gaps: [], overallFit: "" },
      });
      expect(result.success).toBe(true);
    });
  });
});

describe("Context Helper Functions", () => {
  describe("getContextScoreLabel", () => {
    it("should return poor for scores 0-29", () => {
      expect(getContextScoreLabel(0)).toBe("poor");
      expect(getContextScoreLabel(15)).toBe("poor");
      expect(getContextScoreLabel(29)).toBe("poor");
    });

    it("should return weak for scores 30-49", () => {
      expect(getContextScoreLabel(30)).toBe("weak");
      expect(getContextScoreLabel(40)).toBe("weak");
      expect(getContextScoreLabel(49)).toBe("weak");
    });

    it("should return moderate for scores 50-69", () => {
      expect(getContextScoreLabel(50)).toBe("moderate");
      expect(getContextScoreLabel(60)).toBe("moderate");
      expect(getContextScoreLabel(69)).toBe("moderate");
    });

    it("should return good for scores 70-84", () => {
      expect(getContextScoreLabel(70)).toBe("good");
      expect(getContextScoreLabel(77)).toBe("good");
      expect(getContextScoreLabel(84)).toBe("good");
    });

    it("should return excellent for scores 85-100", () => {
      expect(getContextScoreLabel(85)).toBe("excellent");
      expect(getContextScoreLabel(95)).toBe("excellent");
      expect(getContextScoreLabel(100)).toBe("excellent");
    });
  });

  describe("getContextScoreColor", () => {
    it("should return primary for excellent", () => {
      expect(getContextScoreColor("excellent")).toContain("primary");
    });

    it("should return green for good", () => {
      expect(getContextScoreColor("good")).toContain("green");
    });

    it("should return yellow for moderate", () => {
      expect(getContextScoreColor("moderate")).toContain("yellow");
    });

    it("should return orange for weak", () => {
      expect(getContextScoreColor("weak")).toContain("orange");
    });

    it("should return red for poor", () => {
      expect(getContextScoreColor("poor")).toContain("red");
    });
  });

  describe("getRelevanceColor", () => {
    it("should return green for high", () => {
      expect(getRelevanceColor("high")).toContain("green");
    });

    it("should return yellow for medium", () => {
      expect(getRelevanceColor("medium")).toContain("yellow");
    });

    it("should return red for low", () => {
      expect(getRelevanceColor("low")).toContain("red");
    });
  });

  describe("getImportanceColor", () => {
    it("should return red for critical", () => {
      expect(getImportanceColor("critical")).toContain("red");
    });

    it("should return amber for important", () => {
      expect(getImportanceColor("important")).toContain("amber");
    });

    it("should return blue for nice_to_have", () => {
      expect(getImportanceColor("nice_to_have")).toContain("blue");
    });
  });

  describe("getStrengthColor", () => {
    it("should return green for exact", () => {
      expect(getStrengthColor("exact")).toContain("green");
    });

    it("should return blue for related", () => {
      expect(getStrengthColor("related")).toContain("blue");
    });

    it("should return purple for transferable", () => {
      expect(getStrengthColor("transferable")).toContain("purple");
    });
  });

  describe("getPriorityColor", () => {
    it("should return red for high", () => {
      expect(getPriorityColor("high")).toContain("red");
    });

    it("should return amber for medium", () => {
      expect(getPriorityColor("medium")).toContain("amber");
    });

    it("should return blue for low", () => {
      expect(getPriorityColor("low")).toContain("blue");
    });
  });
});
