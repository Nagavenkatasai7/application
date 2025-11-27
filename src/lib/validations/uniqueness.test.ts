import { describe, it, expect } from "vitest";
import {
  uniquenessRequestSchema,
  uniquenessFactorSchema,
  uniquenessResultSchema,
  getScoreLabel,
  getRarityColor,
  getScoreColor,
} from "./uniqueness";

describe("Uniqueness Validation Schemas", () => {
  describe("uniquenessRequestSchema", () => {
    it("should accept valid UUID", () => {
      const result = uniquenessRequestSchema.safeParse({
        resumeId: "550e8400-e29b-41d4-a716-446655440000",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid UUID", () => {
      const result = uniquenessRequestSchema.safeParse({
        resumeId: "not-a-uuid",
      });
      expect(result.success).toBe(false);
    });

    it("should reject missing resumeId", () => {
      const result = uniquenessRequestSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe("uniquenessFactorSchema", () => {
    it("should accept valid factor", () => {
      const factor = {
        id: "factor-1",
        type: "skill_combination",
        title: "Technical + Creative",
        description: "Rare combination of ML and UX design",
        rarity: "rare",
        evidence: ["5 years ML", "UX certification"],
        suggestion: "Highlight in summary",
      };
      const result = uniquenessFactorSchema.safeParse(factor);
      expect(result.success).toBe(true);
    });

    it("should accept all valid factor types", () => {
      const types = [
        "skill_combination",
        "career_transition",
        "unique_experience",
        "domain_expertise",
        "achievement",
        "education",
      ];

      types.forEach((type) => {
        const factor = {
          id: "factor-1",
          type,
          title: "Test",
          description: "Test",
          rarity: "uncommon",
          evidence: [],
          suggestion: "Test",
        };
        const result = uniquenessFactorSchema.safeParse(factor);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid factor type", () => {
      const factor = {
        id: "factor-1",
        type: "invalid_type",
        title: "Test",
        description: "Test",
        rarity: "rare",
        evidence: [],
        suggestion: "Test",
      };
      const result = uniquenessFactorSchema.safeParse(factor);
      expect(result.success).toBe(false);
    });

    it("should accept all valid rarity levels", () => {
      const rarities = ["uncommon", "rare", "very_rare"];

      rarities.forEach((rarity) => {
        const factor = {
          id: "factor-1",
          type: "skill_combination",
          title: "Test",
          description: "Test",
          rarity,
          evidence: [],
          suggestion: "Test",
        };
        const result = uniquenessFactorSchema.safeParse(factor);
        expect(result.success).toBe(true);
      });
    });
  });

  describe("uniquenessResultSchema", () => {
    it("should accept valid result", () => {
      const result = uniquenessResultSchema.safeParse({
        score: 75,
        scoreLabel: "high",
        factors: [],
        summary: "Test summary",
        differentiators: ["diff1"],
        suggestions: [{ area: "Skills", recommendation: "Add more" }],
      });
      expect(result.success).toBe(true);
    });

    it("should reject score below 0", () => {
      const result = uniquenessResultSchema.safeParse({
        score: -10,
        scoreLabel: "low",
        factors: [],
        summary: "Test",
        differentiators: [],
        suggestions: [],
      });
      expect(result.success).toBe(false);
    });

    it("should reject score above 100", () => {
      const result = uniquenessResultSchema.safeParse({
        score: 150,
        scoreLabel: "exceptional",
        factors: [],
        summary: "Test",
        differentiators: [],
        suggestions: [],
      });
      expect(result.success).toBe(false);
    });

    it("should accept all valid score labels", () => {
      const labels = ["low", "moderate", "high", "exceptional"];

      labels.forEach((label) => {
        const result = uniquenessResultSchema.safeParse({
          score: 50,
          scoreLabel: label,
          factors: [],
          summary: "Test",
          differentiators: [],
          suggestions: [],
        });
        expect(result.success).toBe(true);
      });
    });
  });
});

describe("Uniqueness Helper Functions", () => {
  describe("getScoreLabel", () => {
    it("should return low for scores 0-39", () => {
      expect(getScoreLabel(0)).toBe("low");
      expect(getScoreLabel(20)).toBe("low");
      expect(getScoreLabel(39)).toBe("low");
    });

    it("should return moderate for scores 40-64", () => {
      expect(getScoreLabel(40)).toBe("moderate");
      expect(getScoreLabel(50)).toBe("moderate");
      expect(getScoreLabel(64)).toBe("moderate");
    });

    it("should return high for scores 65-84", () => {
      expect(getScoreLabel(65)).toBe("high");
      expect(getScoreLabel(75)).toBe("high");
      expect(getScoreLabel(84)).toBe("high");
    });

    it("should return exceptional for scores 85-100", () => {
      expect(getScoreLabel(85)).toBe("exceptional");
      expect(getScoreLabel(95)).toBe("exceptional");
      expect(getScoreLabel(100)).toBe("exceptional");
    });
  });

  describe("getRarityColor", () => {
    it("should return blue color class for uncommon", () => {
      const color = getRarityColor("uncommon");
      expect(color).toContain("blue");
    });

    it("should return purple color class for rare", () => {
      const color = getRarityColor("rare");
      expect(color).toContain("purple");
    });

    it("should return amber color class for very_rare", () => {
      const color = getRarityColor("very_rare");
      expect(color).toContain("amber");
    });
  });

  describe("getScoreColor", () => {
    it("should return red for low", () => {
      expect(getScoreColor("low")).toContain("red");
    });

    it("should return yellow for moderate", () => {
      expect(getScoreColor("moderate")).toContain("yellow");
    });

    it("should return green for high", () => {
      expect(getScoreColor("high")).toContain("green");
    });

    it("should return primary for exceptional", () => {
      expect(getScoreColor("exceptional")).toContain("primary");
    });
  });
});
