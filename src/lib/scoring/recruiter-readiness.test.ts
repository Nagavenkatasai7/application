import { describe, it, expect } from "vitest";
import {
  calculateRecruiterReadiness,
  DIMENSION_WEIGHTS,
  getScoreSummary,
} from "./recruiter-readiness";
import type { PreAnalysisResult } from "@/lib/ai/tailoring/types";

// Default mock impact data
const defaultMockImpact = {
  score: 65,
  scoreLabel: "strong" as const,
  summary: "Good impact quantification",
  totalBullets: 10,
  bullets: [],
  bulletsImproved: 3,
  metricCategories: {
    percentage: 3,
    monetary: 2,
    time: 1,
    scale: 2,
    other: 1,
  },
  suggestions: [],
};

// Default mock uniqueness data
const defaultMockUniqueness = {
  score: 70,
  scoreLabel: "high" as const,
  differentiators: ["Led team of 10", "Published paper"],
  factors: [],
  summary: "Good uniqueness",
  suggestions: [],
};

// Default mock context data
const defaultMockContext = {
  score: 60,
  scoreLabel: "moderate" as const,
  summary: "Moderate alignment",
  keywordCoverage: {
    matched: 5,
    total: 10,
    percentage: 55,
    keywords: [
      { keyword: "React", found: true, location: "skills" },
      { keyword: "TypeScript", found: true, location: "skills" },
      { keyword: "AWS", found: false },
    ],
  },
  matchedSkills: [],
  missingRequirements: [],
  experienceAlignments: [],
  suggestions: [],
  fitAssessment: {
    strengths: ["Strong React experience"],
    gaps: ["No AWS experience"],
    overallFit: "Moderate fit for the role",
  },
};

// Mock pre-analysis result factory
function createMockPreAnalysis(overrides?: Partial<PreAnalysisResult>): PreAnalysisResult {
  return {
    impact: defaultMockImpact,
    uniqueness: defaultMockUniqueness,
    context: defaultMockContext,
    company: {
      companyName: "Startup Inc",
      isWellKnown: false,
      industry: "Technology",
      size: "startup",
      fundingStage: "Series A",
      comparable: "Like a smaller Stripe",
      context: "A fintech startup focused on payment infrastructure",
    },
    softSkills: [
      {
        skill: "Leadership",
        evidence: ["Led team of 10 engineers"],
        strength: "strong",
        bulletIds: ["bullet-1"],
      },
      {
        skill: "Communication",
        evidence: ["Presented to stakeholders"],
        strength: "moderate",
        bulletIds: ["bullet-2"],
      },
    ],
    analyzedAt: new Date(),
    resumeId: "test-resume-id",
    jobId: "test-job-id",
    ...overrides,
  };
}

describe("Recruiter Readiness Scoring", () => {
  describe("DIMENSION_WEIGHTS", () => {
    it("should sum to 1.0", () => {
      const totalWeight = Object.values(DIMENSION_WEIGHTS).reduce((sum, w) => sum + w, 0);
      expect(totalWeight).toBeCloseTo(1.0, 2);
    });

    it("should have impact as highest weight", () => {
      expect(DIMENSION_WEIGHTS.impact).toBeGreaterThanOrEqual(DIMENSION_WEIGHTS.uniqueness);
      expect(DIMENSION_WEIGHTS.impact).toBeGreaterThanOrEqual(DIMENSION_WEIGHTS.customization);
      expect(DIMENSION_WEIGHTS.impact).toBeGreaterThanOrEqual(DIMENSION_WEIGHTS.contextTranslation);
      expect(DIMENSION_WEIGHTS.impact).toBeGreaterThanOrEqual(DIMENSION_WEIGHTS.culturalFit);
    });

    it("should have all 5 dimensions", () => {
      expect(DIMENSION_WEIGHTS).toHaveProperty("uniqueness");
      expect(DIMENSION_WEIGHTS).toHaveProperty("impact");
      expect(DIMENSION_WEIGHTS).toHaveProperty("contextTranslation");
      expect(DIMENSION_WEIGHTS).toHaveProperty("culturalFit");
      expect(DIMENSION_WEIGHTS).toHaveProperty("customization");
    });
  });

  describe("calculateRecruiterReadiness", () => {
    it("should return a valid score structure", () => {
      const preAnalysis = createMockPreAnalysis();
      const result = calculateRecruiterReadiness(preAnalysis);

      expect(result).toHaveProperty("composite");
      expect(result).toHaveProperty("label");
      expect(result).toHaveProperty("color");
      expect(result).toHaveProperty("dimensions");
      expect(result).toHaveProperty("topSuggestions");
    });

    it("should have composite score between 0 and 100", () => {
      const preAnalysis = createMockPreAnalysis();
      const result = calculateRecruiterReadiness(preAnalysis);

      expect(result.composite).toBeGreaterThanOrEqual(0);
      expect(result.composite).toBeLessThanOrEqual(100);
    });

    it("should have all dimension scores", () => {
      const preAnalysis = createMockPreAnalysis();
      const result = calculateRecruiterReadiness(preAnalysis);

      expect(result.dimensions).toHaveProperty("uniqueness");
      expect(result.dimensions).toHaveProperty("impact");
      expect(result.dimensions).toHaveProperty("contextTranslation");
      expect(result.dimensions).toHaveProperty("culturalFit");
      expect(result.dimensions).toHaveProperty("customization");
    });

    it("should have raw and weighted scores for each dimension", () => {
      const preAnalysis = createMockPreAnalysis();
      const result = calculateRecruiterReadiness(preAnalysis);

      Object.values(result.dimensions).forEach((dimension) => {
        expect(dimension).toHaveProperty("raw");
        expect(dimension).toHaveProperty("weighted");
        expect(dimension).toHaveProperty("weight");
        expect(dimension).toHaveProperty("label");
        expect(dimension.raw).toBeGreaterThanOrEqual(0);
        expect(dimension.raw).toBeLessThanOrEqual(100);
      });
    });

    it("should return higher impact score for high impact analysis", () => {
      const lowImpact = createMockPreAnalysis({
        impact: { ...defaultMockImpact, score: 30 },
      });
      const highImpact = createMockPreAnalysis({
        impact: { ...defaultMockImpact, score: 90 },
      });

      const lowResult = calculateRecruiterReadiness(lowImpact);
      const highResult = calculateRecruiterReadiness(highImpact);

      expect(highResult.dimensions.impact.raw).toBeGreaterThan(lowResult.dimensions.impact.raw);
    });

    it("should return full context score for well-known companies", () => {
      const wellKnownCompany = createMockPreAnalysis({
        company: {
          companyName: "Google",
          isWellKnown: true,
          industry: "Technology",
          size: "enterprise",
          fundingStage: null,
          comparable: null,
          context: "",
        },
      });
      const result = calculateRecruiterReadiness(wellKnownCompany);

      expect(result.dimensions.contextTranslation.raw).toBe(100);
    });

    it("should return minimum cultural fit for no soft skills", () => {
      const noSoftSkills = createMockPreAnalysis({
        softSkills: [],
      });
      const result = calculateRecruiterReadiness(noSoftSkills);

      // Base score is 30 when no soft skills are present
      expect(result.dimensions.culturalFit.raw).toBe(30);
    });

    it("should calculate correct composite from weighted dimensions", () => {
      const preAnalysis = createMockPreAnalysis();
      const result = calculateRecruiterReadiness(preAnalysis);

      // Composite should be sum of weighted scores
      const expectedComposite = Object.values(result.dimensions).reduce(
        (sum, dim) => sum + dim.weighted,
        0
      );

      expect(result.composite).toBe(Math.round(expectedComposite));
    });

    it("should assign correct labels based on composite score", () => {
      // Test with different score ranges
      const highScore = createMockPreAnalysis({
        impact: { ...defaultMockImpact, score: 95 },
        uniqueness: { ...defaultMockUniqueness, score: 95, scoreLabel: "exceptional" as const, differentiators: ["1", "2", "3", "4", "5"] },
        context: { ...defaultMockContext, score: 95, scoreLabel: "excellent" as const, keywordCoverage: { matched: 9, total: 10, percentage: 90, keywords: [] } },
        company: { companyName: "Google", isWellKnown: true, industry: "Tech", size: "enterprise", fundingStage: null, comparable: null, context: "" },
        softSkills: [
          { skill: "Leadership", evidence: ["Led"], strength: "strong", bulletIds: ["1"] },
          { skill: "Communication", evidence: ["Presented"], strength: "strong", bulletIds: ["2"] },
          { skill: "Teamwork", evidence: ["Collaborated"], strength: "strong", bulletIds: ["3"] },
        ],
      });
      const highResult = calculateRecruiterReadiness(highScore);
      expect(highResult.label).toBe("exceptional");

      const lowScore = createMockPreAnalysis({
        impact: { ...defaultMockImpact, score: 20 },
        uniqueness: { ...defaultMockUniqueness, score: 20, scoreLabel: "low" as const, differentiators: [] },
        context: { ...defaultMockContext, score: 20, scoreLabel: "poor" as const, keywordCoverage: { matched: 2, total: 10, percentage: 20, keywords: [] } },
        company: null,
        softSkills: [],
      });
      const lowResult = calculateRecruiterReadiness(lowScore);
      expect(lowResult.label).toBe("needs_work");
    });

    it("should provide top suggestions for improvement", () => {
      const preAnalysis = createMockPreAnalysis();
      const result = calculateRecruiterReadiness(preAnalysis);

      expect(Array.isArray(result.topSuggestions)).toBe(true);
      expect(result.topSuggestions.length).toBeLessThanOrEqual(3);
    });
  });

  describe("getScoreSummary", () => {
    it("should return a summary string", () => {
      const preAnalysis = createMockPreAnalysis();
      const score = calculateRecruiterReadiness(preAnalysis);
      const summary = getScoreSummary(score);

      expect(typeof summary).toBe("string");
      expect(summary.length).toBeGreaterThan(0);
    });
  });
});
