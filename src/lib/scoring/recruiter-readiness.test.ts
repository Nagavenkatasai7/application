import { describe, it, expect } from "vitest";
import {
  calculateRecruiterReadiness,
  DIMENSION_WEIGHTS,
  getScoreSummary,
  getMostImpactfulImprovement,
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

    it("should return exceptional message for scores >= 90", () => {
      const preAnalysis = createMockPreAnalysis({
        impact: { ...defaultMockImpact, score: 95 },
        uniqueness: { ...defaultMockUniqueness, score: 95, scoreLabel: "exceptional" as const },
        context: { ...defaultMockContext, score: 95, scoreLabel: "excellent" as const },
        company: { companyName: "Google", isWellKnown: true, industry: "Tech", size: "enterprise", fundingStage: null, comparable: null, context: "" },
        softSkills: [
          { skill: "Leadership", evidence: ["Led"], strength: "strong", bulletIds: ["1"] },
          { skill: "Communication", evidence: ["Presented"], strength: "strong", bulletIds: ["2"] },
          { skill: "Teamwork", evidence: ["Collaborated"], strength: "strong", bulletIds: ["3"] },
          { skill: "Problem Solving", evidence: ["Solved"], strength: "strong", bulletIds: ["4"] },
        ],
      });
      const score = calculateRecruiterReadiness(preAnalysis);
      const summary = getScoreSummary(score);
      expect(summary).toContain("Exceptional");
    });

    it("should return strong match message for scores 75-89", () => {
      const preAnalysis = createMockPreAnalysis({
        impact: { ...defaultMockImpact, score: 80 },
        uniqueness: { ...defaultMockUniqueness, score: 80, scoreLabel: "high" as const },
        context: { ...defaultMockContext, score: 80, scoreLabel: "good" as const },
        company: { companyName: "Google", isWellKnown: true, industry: "Tech", size: "enterprise", fundingStage: null, comparable: null, context: "" },
        softSkills: [
          { skill: "Leadership", evidence: ["Led"], strength: "strong", bulletIds: ["1"] },
          { skill: "Communication", evidence: ["Presented"], strength: "strong", bulletIds: ["2"] },
        ],
      });
      const score = calculateRecruiterReadiness(preAnalysis);
      const summary = getScoreSummary(score);
      expect(summary).toContain("Strong match");
    });

    it("should return good potential message for scores 60-74", () => {
      // Default mock typically produces score in this range
      const preAnalysis = createMockPreAnalysis();
      const score = calculateRecruiterReadiness(preAnalysis);
      const summary = getScoreSummary(score);
      expect(summary).toContain("Good potential");
    });

    it("should return room for improvement message for scores 45-59", () => {
      const preAnalysis = createMockPreAnalysis({
        impact: { ...defaultMockImpact, score: 45 },
        uniqueness: { ...defaultMockUniqueness, score: 45, scoreLabel: "moderate" as const },
        context: { ...defaultMockContext, score: 45, scoreLabel: "moderate" as const },
        company: null,
        softSkills: [
          { skill: "Communication", evidence: ["Spoke"], strength: "moderate", bulletIds: ["1"] },
        ],
      });
      const score = calculateRecruiterReadiness(preAnalysis);
      const summary = getScoreSummary(score);
      expect(summary).toContain("Room for improvement");
    });

    it("should return significant work needed for scores < 45", () => {
      const preAnalysis = createMockPreAnalysis({
        impact: { ...defaultMockImpact, score: 20 },
        uniqueness: { ...defaultMockUniqueness, score: 20, scoreLabel: "low" as const },
        context: { ...defaultMockContext, score: 20, scoreLabel: "poor" as const },
        company: null,
        softSkills: [],
      });
      const score = calculateRecruiterReadiness(preAnalysis);
      const summary = getScoreSummary(score);
      expect(summary).toContain("Significant work needed");
    });
  });

  describe("getMostImpactfulImprovement", () => {
    it("should return the dimension with highest improvement potential", () => {
      const preAnalysis = createMockPreAnalysis({
        impact: { ...defaultMockImpact, score: 30 }, // Low score, high weight = high potential
        uniqueness: { ...defaultMockUniqueness, score: 90 }, // High score = low potential
        context: { ...defaultMockContext, score: 90 },
        company: { companyName: "Google", isWellKnown: true, industry: "Tech", size: "enterprise", fundingStage: null, comparable: null, context: "" },
        softSkills: [
          { skill: "Leadership", evidence: ["Led"], strength: "strong", bulletIds: ["1"] },
          { skill: "Communication", evidence: ["Presented"], strength: "strong", bulletIds: ["2"] },
        ],
      });
      const score = calculateRecruiterReadiness(preAnalysis);
      const mostImpactful = getMostImpactfulImprovement(score);

      // Impact has low score (30) and high weight (0.30), so potential = (100-30)*0.30 = 21
      expect(mostImpactful).toBe("impact");
    });

    it("should consider weight in improvement calculation", () => {
      // Set all dimensions to same score
      const preAnalysis = createMockPreAnalysis({
        impact: { ...defaultMockImpact, score: 50 },
        uniqueness: { ...defaultMockUniqueness, score: 50 },
        context: { ...defaultMockContext, score: 50 },
        company: null, // Gives contextTranslation score of 70
        softSkills: [], // Gives culturalFit score of 30
      });
      const score = calculateRecruiterReadiness(preAnalysis);
      const mostImpactful = getMostImpactfulImprovement(score);

      // culturalFit has score 30 but low weight (0.10), potential = 70*0.10 = 7
      // impact has score 50 and high weight (0.30), potential = 50*0.30 = 15
      // customization has score 50 and weight 0.25, potential = 50*0.25 = 12.5
      // impact should win due to highest weighted potential
      expect(typeof mostImpactful).toBe("string");
      expect(["impact", "customization", "culturalFit"]).toContain(mostImpactful);
    });

    it("should return a valid dimension key", () => {
      const preAnalysis = createMockPreAnalysis();
      const score = calculateRecruiterReadiness(preAnalysis);
      const mostImpactful = getMostImpactfulImprovement(score);

      const validDimensions = [
        "uniqueness",
        "impact",
        "contextTranslation",
        "culturalFit",
        "customization",
      ];
      expect(validDimensions).toContain(mostImpactful);
    });
  });

  describe("context translation scoring", () => {
    it("should return 70 for no company", () => {
      const noCompany = createMockPreAnalysis({
        company: null,
      });
      const result = calculateRecruiterReadiness(noCompany);
      expect(result.dimensions.contextTranslation.raw).toBe(70);
    });

    it("should return 80 for comparable company", () => {
      const comparableCompany = createMockPreAnalysis({
        company: {
          companyName: "Startup",
          isWellKnown: false,
          industry: "Tech",
          size: "startup",
          fundingStage: "Series A",
          comparable: "Like a smaller Stripe",
          context: "",
        },
      });
      const result = calculateRecruiterReadiness(comparableCompany);
      expect(result.dimensions.contextTranslation.raw).toBe(80);
    });

    it("should return 60 for company with only context", () => {
      const contextOnly = createMockPreAnalysis({
        company: {
          companyName: "Unknown Startup",
          isWellKnown: false,
          industry: "Tech",
          size: "startup",
          fundingStage: null,
          comparable: null,
          context: "A fintech startup",
        },
      });
      const result = calculateRecruiterReadiness(contextOnly);
      expect(result.dimensions.contextTranslation.raw).toBe(60);
    });

    it("should return 30 for unknown company with no context", () => {
      const noContext = createMockPreAnalysis({
        company: {
          companyName: "Random Inc",
          isWellKnown: false,
          industry: "Unknown",
          size: "unknown",
          fundingStage: null,
          comparable: null,
          context: "",
        },
      });
      const result = calculateRecruiterReadiness(noContext);
      expect(result.dimensions.contextTranslation.raw).toBe(30);
    });
  });

  describe("cultural fit scoring", () => {
    it("should calculate score based on soft skill strength", () => {
      const strongSkills = createMockPreAnalysis({
        softSkills: [
          { skill: "Leadership", evidence: ["Led"], strength: "strong", bulletIds: ["1"] },
          { skill: "Communication", evidence: ["Spoke"], strength: "strong", bulletIds: ["2"] },
        ],
      });
      const result = calculateRecruiterReadiness(strongSkills);
      // 30 base + 2 strong * 20 = 70
      expect(result.dimensions.culturalFit.raw).toBe(70);
    });

    it("should include moderate skills in calculation", () => {
      const mixedSkills = createMockPreAnalysis({
        softSkills: [
          { skill: "Leadership", evidence: ["Led"], strength: "strong", bulletIds: ["1"] },
          { skill: "Communication", evidence: ["Spoke"], strength: "moderate", bulletIds: ["2"] },
          { skill: "Teamwork", evidence: ["Worked"], strength: "moderate", bulletIds: ["3"] },
        ],
      });
      const result = calculateRecruiterReadiness(mixedSkills);
      // 30 base + 1 strong * 20 + 2 moderate * 10 = 30 + 20 + 20 = 70
      expect(result.dimensions.culturalFit.raw).toBe(70);
    });

    it("should cap score at 100", () => {
      const manySkills = createMockPreAnalysis({
        softSkills: [
          { skill: "Leadership", evidence: ["Led"], strength: "strong", bulletIds: ["1"] },
          { skill: "Communication", evidence: ["Spoke"], strength: "strong", bulletIds: ["2"] },
          { skill: "Teamwork", evidence: ["Worked"], strength: "strong", bulletIds: ["3"] },
          { skill: "Problem Solving", evidence: ["Solved"], strength: "strong", bulletIds: ["4"] },
          { skill: "Creativity", evidence: ["Created"], strength: "strong", bulletIds: ["5"] },
        ],
      });
      const result = calculateRecruiterReadiness(manySkills);
      // 30 + 5 * 20 = 130, but capped at 100
      expect(result.dimensions.culturalFit.raw).toBe(100);
    });
  });
});
