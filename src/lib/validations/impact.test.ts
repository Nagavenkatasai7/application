import { describe, it, expect } from "vitest";
import {
  impactRequestSchema,
  impactBulletSchema,
  impactResultSchema,
  getImpactScoreLabel,
  getImprovementColor,
  getImpactScoreColor,
  getImprovementLabel,
} from "./impact";

describe("Impact Validation Schemas", () => {
  describe("impactRequestSchema", () => {
    it("should accept valid UUID", () => {
      const result = impactRequestSchema.safeParse({
        resumeId: "550e8400-e29b-41d4-a716-446655440000",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid UUID", () => {
      const result = impactRequestSchema.safeParse({
        resumeId: "not-a-uuid",
      });
      expect(result.success).toBe(false);
    });

    it("should reject missing resumeId", () => {
      const result = impactRequestSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe("impactBulletSchema", () => {
    it("should accept valid bullet", () => {
      const bullet = {
        id: "bullet-1",
        experienceId: "exp-1",
        experienceTitle: "Software Engineer",
        companyName: "Tech Corp",
        original: "Worked on projects",
        improved: "Led 5 projects that increased revenue by 25%",
        metrics: ["25%", "5 projects"],
        improvement: "major",
        explanation: "Added quantification with specific numbers",
      };
      const result = impactBulletSchema.safeParse(bullet);
      expect(result.success).toBe(true);
    });

    it("should accept all valid improvement levels", () => {
      const levels = ["none", "minor", "major", "transformed"];

      levels.forEach((improvement) => {
        const bullet = {
          id: "bullet-1",
          experienceId: "exp-1",
          experienceTitle: "Software Engineer",
          companyName: "Tech Corp",
          original: "Test",
          improved: "Test improved",
          metrics: [],
          improvement,
          explanation: "Test",
        };
        const result = impactBulletSchema.safeParse(bullet);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid improvement level", () => {
      const bullet = {
        id: "bullet-1",
        experienceId: "exp-1",
        experienceTitle: "Software Engineer",
        companyName: "Tech Corp",
        original: "Test",
        improved: "Test",
        metrics: [],
        improvement: "invalid_level",
        explanation: "Test",
      };
      const result = impactBulletSchema.safeParse(bullet);
      expect(result.success).toBe(false);
    });
  });

  describe("impactResultSchema", () => {
    it("should accept valid result", () => {
      const result = impactResultSchema.safeParse({
        score: 75,
        scoreLabel: "strong",
        summary: "Good quantification",
        totalBullets: 10,
        bulletsImproved: 7,
        bullets: [],
        metricCategories: {
          percentage: 3,
          monetary: 2,
          time: 1,
          scale: 2,
          other: 1,
        },
        suggestions: [{ area: "Skills", recommendation: "Add more metrics" }],
      });
      expect(result.success).toBe(true);
    });

    it("should reject score below 0", () => {
      const result = impactResultSchema.safeParse({
        score: -10,
        scoreLabel: "weak",
        summary: "Test",
        totalBullets: 0,
        bulletsImproved: 0,
        bullets: [],
        metricCategories: {
          percentage: 0,
          monetary: 0,
          time: 0,
          scale: 0,
          other: 0,
        },
        suggestions: [],
      });
      expect(result.success).toBe(false);
    });

    it("should reject score above 100", () => {
      const result = impactResultSchema.safeParse({
        score: 150,
        scoreLabel: "exceptional",
        summary: "Test",
        totalBullets: 0,
        bulletsImproved: 0,
        bullets: [],
        metricCategories: {
          percentage: 0,
          monetary: 0,
          time: 0,
          scale: 0,
          other: 0,
        },
        suggestions: [],
      });
      expect(result.success).toBe(false);
    });

    it("should accept all valid score labels", () => {
      const labels = ["weak", "moderate", "strong", "exceptional"];

      labels.forEach((label) => {
        const result = impactResultSchema.safeParse({
          score: 50,
          scoreLabel: label,
          summary: "Test",
          totalBullets: 0,
          bulletsImproved: 0,
          bullets: [],
          metricCategories: {
            percentage: 0,
            monetary: 0,
            time: 0,
            scale: 0,
            other: 0,
          },
          suggestions: [],
        });
        expect(result.success).toBe(true);
      });
    });
  });
});

describe("Impact Helper Functions", () => {
  describe("getImpactScoreLabel", () => {
    it("should return weak for scores 0-39", () => {
      expect(getImpactScoreLabel(0)).toBe("weak");
      expect(getImpactScoreLabel(20)).toBe("weak");
      expect(getImpactScoreLabel(39)).toBe("weak");
    });

    it("should return moderate for scores 40-64", () => {
      expect(getImpactScoreLabel(40)).toBe("moderate");
      expect(getImpactScoreLabel(50)).toBe("moderate");
      expect(getImpactScoreLabel(64)).toBe("moderate");
    });

    it("should return strong for scores 65-84", () => {
      expect(getImpactScoreLabel(65)).toBe("strong");
      expect(getImpactScoreLabel(75)).toBe("strong");
      expect(getImpactScoreLabel(84)).toBe("strong");
    });

    it("should return exceptional for scores 85-100", () => {
      expect(getImpactScoreLabel(85)).toBe("exceptional");
      expect(getImpactScoreLabel(95)).toBe("exceptional");
      expect(getImpactScoreLabel(100)).toBe("exceptional");
    });
  });

  describe("getImprovementColor", () => {
    it("should return green color class for none", () => {
      const color = getImprovementColor("none");
      expect(color).toContain("green");
    });

    it("should return blue color class for minor", () => {
      const color = getImprovementColor("minor");
      expect(color).toContain("blue");
    });

    it("should return amber color class for major", () => {
      const color = getImprovementColor("major");
      expect(color).toContain("amber");
    });

    it("should return purple color class for transformed", () => {
      const color = getImprovementColor("transformed");
      expect(color).toContain("purple");
    });
  });

  describe("getImpactScoreColor", () => {
    it("should return red for weak", () => {
      expect(getImpactScoreColor("weak")).toContain("red");
    });

    it("should return yellow for moderate", () => {
      expect(getImpactScoreColor("moderate")).toContain("yellow");
    });

    it("should return green for strong", () => {
      expect(getImpactScoreColor("strong")).toContain("green");
    });

    it("should return primary for exceptional", () => {
      expect(getImpactScoreColor("exceptional")).toContain("primary");
    });
  });

  describe("getImprovementLabel", () => {
    it("should return correct labels for each level", () => {
      expect(getImprovementLabel("none")).toBe("Already Quantified");
      expect(getImprovementLabel("minor")).toBe("Minor Improvement");
      expect(getImprovementLabel("major")).toBe("Major Improvement");
      expect(getImprovementLabel("transformed")).toBe("Transformed");
    });
  });
});
