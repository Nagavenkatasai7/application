import { describe, it, expect } from "vitest";
import {
  SCORE_THRESHOLDS,
  getScoreLabel,
  getReadableLabel,
  getScoreColor,
  getScoreBgColor,
  getScoreBorderColor,
  getDimensionColor,
  getProgressColor,
  getScoreEmoji,
  DIMENSION_DISPLAY_NAMES,
} from "./thresholds";

describe("Score Thresholds", () => {
  describe("SCORE_THRESHOLDS", () => {
    it("should have non-overlapping ranges", () => {
      expect(SCORE_THRESHOLDS.exceptional.min).toBeGreaterThan(SCORE_THRESHOLDS.strong.max);
      expect(SCORE_THRESHOLDS.strong.min).toBeGreaterThan(SCORE_THRESHOLDS.good.max);
      expect(SCORE_THRESHOLDS.good.min).toBeGreaterThan(SCORE_THRESHOLDS.getting_there.max);
      expect(SCORE_THRESHOLDS.getting_there.min).toBeGreaterThan(SCORE_THRESHOLDS.needs_work.max);
    });

    it("should cover full 0-100 range", () => {
      expect(SCORE_THRESHOLDS.needs_work.min).toBe(0);
      expect(SCORE_THRESHOLDS.exceptional.max).toBe(100);
    });
  });

  describe("getScoreLabel", () => {
    it("should return 'exceptional' for scores >= 90", () => {
      expect(getScoreLabel(90)).toBe("exceptional");
      expect(getScoreLabel(95)).toBe("exceptional");
      expect(getScoreLabel(100)).toBe("exceptional");
    });

    it("should return 'strong' for scores 75-89", () => {
      expect(getScoreLabel(75)).toBe("strong");
      expect(getScoreLabel(80)).toBe("strong");
      expect(getScoreLabel(89)).toBe("strong");
    });

    it("should return 'good' for scores 60-74", () => {
      expect(getScoreLabel(60)).toBe("good");
      expect(getScoreLabel(65)).toBe("good");
      expect(getScoreLabel(74)).toBe("good");
    });

    it("should return 'getting_there' for scores 45-59", () => {
      expect(getScoreLabel(45)).toBe("getting_there");
      expect(getScoreLabel(50)).toBe("getting_there");
      expect(getScoreLabel(59)).toBe("getting_there");
    });

    it("should return 'needs_work' for scores < 45", () => {
      expect(getScoreLabel(0)).toBe("needs_work");
      expect(getScoreLabel(30)).toBe("needs_work");
      expect(getScoreLabel(44)).toBe("needs_work");
    });
  });

  describe("getReadableLabel", () => {
    it("should return human-readable labels", () => {
      expect(getReadableLabel("exceptional")).toBe("Exceptional");
      expect(getReadableLabel("strong")).toBe("Strong");
      expect(getReadableLabel("good")).toBe("Good");
      expect(getReadableLabel("getting_there")).toBe("Getting There");
      expect(getReadableLabel("needs_work")).toBe("Needs Work");
    });
  });

  describe("getScoreColor", () => {
    it("should return appropriate colors for each label", () => {
      expect(getScoreColor("exceptional")).toBe("text-amber-500");
      expect(getScoreColor("strong")).toBe("text-green-500");
      expect(getScoreColor("good")).toBe("text-lime-500");
      expect(getScoreColor("getting_there")).toBe("text-yellow-500");
      expect(getScoreColor("needs_work")).toBe("text-red-500");
    });
  });

  describe("getScoreBgColor", () => {
    it("should return appropriate background colors", () => {
      expect(getScoreBgColor("exceptional")).toBe("bg-amber-500/10");
      expect(getScoreBgColor("strong")).toBe("bg-green-500/10");
      expect(getScoreBgColor("good")).toBe("bg-lime-500/10");
      expect(getScoreBgColor("getting_there")).toBe("bg-yellow-500/10");
      expect(getScoreBgColor("needs_work")).toBe("bg-red-500/10");
    });
  });

  describe("getScoreBorderColor", () => {
    it("should return appropriate border colors", () => {
      expect(getScoreBorderColor("exceptional")).toBe("border-amber-500/30");
      expect(getScoreBorderColor("strong")).toBe("border-green-500/30");
      expect(getScoreBorderColor("good")).toBe("border-lime-500/30");
      expect(getScoreBorderColor("getting_there")).toBe("border-yellow-500/30");
      expect(getScoreBorderColor("needs_work")).toBe("border-red-500/30");
    });
  });

  describe("getDimensionColor", () => {
    it("should return appropriate colors based on raw score", () => {
      expect(getDimensionColor(90)).toBe("text-amber-500");
      expect(getDimensionColor(75)).toBe("text-green-500");
      expect(getDimensionColor(60)).toBe("text-lime-500");
      expect(getDimensionColor(45)).toBe("text-yellow-500");
      expect(getDimensionColor(30)).toBe("text-red-500");
    });
  });

  describe("getProgressColor", () => {
    it("should return appropriate progress bar colors", () => {
      expect(getProgressColor(90)).toBe("bg-amber-500");
      expect(getProgressColor(75)).toBe("bg-green-500");
      expect(getProgressColor(60)).toBe("bg-lime-500");
      expect(getProgressColor(45)).toBe("bg-yellow-500");
      expect(getProgressColor(30)).toBe("bg-red-500");
    });
  });

  describe("getScoreEmoji", () => {
    it("should return appropriate emojis", () => {
      expect(getScoreEmoji("exceptional")).toBeDefined();
      expect(getScoreEmoji("strong")).toBeDefined();
      expect(getScoreEmoji("good")).toBeDefined();
      expect(getScoreEmoji("getting_there")).toBeDefined();
      expect(getScoreEmoji("needs_work")).toBeDefined();
    });
  });

  describe("DIMENSION_DISPLAY_NAMES", () => {
    it("should have all 5 dimensions", () => {
      expect(DIMENSION_DISPLAY_NAMES).toHaveProperty("uniqueness");
      expect(DIMENSION_DISPLAY_NAMES).toHaveProperty("impact");
      expect(DIMENSION_DISPLAY_NAMES).toHaveProperty("contextTranslation");
      expect(DIMENSION_DISPLAY_NAMES).toHaveProperty("culturalFit");
      expect(DIMENSION_DISPLAY_NAMES).toHaveProperty("customization");
    });

    it("should have issue numbers 1-5", () => {
      const issueNumbers = Object.values(DIMENSION_DISPLAY_NAMES).map((d) => d.issueNumber);
      expect(issueNumbers).toContain(1);
      expect(issueNumbers).toContain(2);
      expect(issueNumbers).toContain(3);
      expect(issueNumbers).toContain(4);
      expect(issueNumbers).toContain(5);
    });

    it("should have names and descriptions for each dimension", () => {
      Object.values(DIMENSION_DISPLAY_NAMES).forEach((dimension) => {
        expect(dimension.name).toBeDefined();
        expect(dimension.name.length).toBeGreaterThan(0);
        expect(dimension.description).toBeDefined();
        expect(dimension.description.length).toBeGreaterThan(0);
      });
    });
  });
});
