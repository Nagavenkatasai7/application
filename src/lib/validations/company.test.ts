import { describe, it, expect } from "vitest";
import {
  companyResearchRequestSchema,
  cultureDimensionSchema,
  interviewTipSchema,
  competitorSchema,
  glassdoorDataSchema,
  fundingDataSchema,
  companyResearchResultSchema,
  CULTURE_DIMENSIONS,
  getCultureScoreLabel,
  getCultureScoreColor,
  getCultureScoreBgColor,
  getInterviewCategoryLabel,
  getPriorityColor,
  getPriorityBgColor,
} from "./company";

describe("Company Validation", () => {
  describe("companyResearchRequestSchema", () => {
    it("should validate a valid company name", () => {
      const result = companyResearchRequestSchema.safeParse({
        companyName: "Google",
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty company name", () => {
      const result = companyResearchRequestSchema.safeParse({
        companyName: "",
      });
      expect(result.success).toBe(false);
    });

    it("should reject missing company name", () => {
      const result = companyResearchRequestSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("should reject company name over 200 characters", () => {
      const result = companyResearchRequestSchema.safeParse({
        companyName: "A".repeat(201),
      });
      expect(result.success).toBe(false);
    });

    it("should accept company name at max length", () => {
      const result = companyResearchRequestSchema.safeParse({
        companyName: "A".repeat(200),
      });
      expect(result.success).toBe(true);
    });
  });

  describe("cultureDimensionSchema", () => {
    it("should validate a valid culture dimension", () => {
      const result = cultureDimensionSchema.safeParse({
        dimension: "Work-Life Balance",
        score: 4.2,
        description: "Flexible work hours",
      });
      expect(result.success).toBe(true);
    });

    it("should reject score below 1", () => {
      const result = cultureDimensionSchema.safeParse({
        dimension: "Innovation",
        score: 0,
        description: "Test",
      });
      expect(result.success).toBe(false);
    });

    it("should reject score above 5", () => {
      const result = cultureDimensionSchema.safeParse({
        dimension: "Innovation",
        score: 6,
        description: "Test",
      });
      expect(result.success).toBe(false);
    });

    it("should accept all valid scores", () => {
      for (let score = 1; score <= 5; score += 0.5) {
        const result = cultureDimensionSchema.safeParse({
          dimension: "Test",
          score,
          description: "Description",
        });
        expect(result.success).toBe(true);
      }
    });
  });

  describe("interviewTipSchema", () => {
    it("should validate a valid interview tip", () => {
      const result = interviewTipSchema.safeParse({
        category: "preparation",
        tip: "Research the company values",
        priority: "high",
      });
      expect(result.success).toBe(true);
    });

    it("should accept all valid categories", () => {
      const categories = ["preparation", "technical", "behavioral", "cultural_fit", "questions_to_ask"];
      categories.forEach((category) => {
        const result = interviewTipSchema.safeParse({
          category,
          tip: "Test tip",
          priority: "medium",
        });
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid category", () => {
      const result = interviewTipSchema.safeParse({
        category: "invalid",
        tip: "Test",
        priority: "high",
      });
      expect(result.success).toBe(false);
    });

    it("should accept all valid priorities", () => {
      const priorities = ["high", "medium", "low"];
      priorities.forEach((priority) => {
        const result = interviewTipSchema.safeParse({
          category: "preparation",
          tip: "Test tip",
          priority,
        });
        expect(result.success).toBe(true);
      });
    });
  });

  describe("competitorSchema", () => {
    it("should validate a valid competitor", () => {
      const result = competitorSchema.safeParse({
        name: "Microsoft",
        relationship: "Direct competitor in cloud services",
      });
      expect(result.success).toBe(true);
    });

    it("should reject missing name", () => {
      const result = competitorSchema.safeParse({
        relationship: "Competitor",
      });
      expect(result.success).toBe(false);
    });

    it("should reject missing relationship", () => {
      const result = competitorSchema.safeParse({
        name: "Competitor Inc",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("glassdoorDataSchema", () => {
    it("should validate valid glassdoor data", () => {
      const result = glassdoorDataSchema.safeParse({
        overallRating: 4.2,
        pros: ["Great culture", "Good benefits"],
        cons: ["Long hours"],
        recommendToFriend: "85%",
        ceoApproval: "92%",
      });
      expect(result.success).toBe(true);
    });

    it("should accept null values for optional fields", () => {
      const result = glassdoorDataSchema.safeParse({
        overallRating: null,
        pros: [],
        cons: [],
        recommendToFriend: null,
        ceoApproval: null,
      });
      expect(result.success).toBe(true);
    });

    it("should reject rating below 1", () => {
      const result = glassdoorDataSchema.safeParse({
        overallRating: 0,
        pros: [],
        cons: [],
        recommendToFriend: null,
        ceoApproval: null,
      });
      expect(result.success).toBe(false);
    });

    it("should reject rating above 5", () => {
      const result = glassdoorDataSchema.safeParse({
        overallRating: 6,
        pros: [],
        cons: [],
        recommendToFriend: null,
        ceoApproval: null,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("fundingDataSchema", () => {
    it("should validate complete funding data", () => {
      const result = fundingDataSchema.safeParse({
        stage: "Series C",
        totalRaised: "$500 million",
        valuation: "$5 billion",
        lastRound: {
          round: "Series C",
          amount: "$200 million",
          date: "2023",
          investors: ["Sequoia", "a16z"],
        },
        notableInvestors: ["Sequoia", "a16z"],
      });
      expect(result.success).toBe(true);
    });

    it("should accept minimal funding data", () => {
      const result = fundingDataSchema.safeParse({
        stage: null,
        totalRaised: null,
        valuation: null,
        lastRound: null,
        notableInvestors: [],
      });
      expect(result.success).toBe(true);
    });
  });

  describe("companyResearchResultSchema", () => {
    it("should validate a complete research result", () => {
      const result = companyResearchResultSchema.safeParse({
        companyName: "Google",
        industry: "Technology",
        summary: "Leading technology company",
        founded: "1998",
        headquarters: "Mountain View, CA",
        employeeCount: "100,000+",
        website: "https://google.com",
        cultureDimensions: [
          { dimension: "Innovation", score: 4.5, description: "Highly innovative" },
        ],
        cultureOverview: "Innovative culture",
        glassdoorData: {
          overallRating: 4.3,
          pros: ["Great benefits"],
          cons: ["Fast-paced"],
          recommendToFriend: "88%",
          ceoApproval: "92%",
        },
        fundingData: {
          stage: "Public",
          totalRaised: null,
          valuation: "$1.8 trillion",
          lastRound: null,
          notableInvestors: [],
        },
        competitors: [{ name: "Microsoft", relationship: "Direct competitor" }],
        interviewTips: [{ category: "preparation", tip: "Study products", priority: "high" }],
        commonInterviewTopics: ["System Design", "Coding"],
        coreValues: ["Innovation", "User Focus"],
        valuesAlignment: [{ value: "Innovation", howToDemo: "Share innovative projects" }],
        keyTakeaways: ["Top employer", "Competitive"],
      });
      expect(result.success).toBe(true);
    });
  });

  describe("CULTURE_DIMENSIONS", () => {
    it("should contain all 8 culture dimensions", () => {
      expect(CULTURE_DIMENSIONS.length).toBe(8);
    });

    it("should contain expected dimensions", () => {
      expect(CULTURE_DIMENSIONS).toContain("Work-Life Balance");
      expect(CULTURE_DIMENSIONS).toContain("Innovation");
      expect(CULTURE_DIMENSIONS).toContain("Career Growth");
      expect(CULTURE_DIMENSIONS).toContain("Diversity & Inclusion");
    });
  });

  describe("getCultureScoreLabel", () => {
    it("should return correct labels for all score ranges", () => {
      expect(getCultureScoreLabel(5)).toBe("Excellent");
      expect(getCultureScoreLabel(4.5)).toBe("Excellent");
      expect(getCultureScoreLabel(4)).toBe("Good");
      expect(getCultureScoreLabel(3.5)).toBe("Good");
      expect(getCultureScoreLabel(3)).toBe("Average");
      expect(getCultureScoreLabel(2.5)).toBe("Average");
      expect(getCultureScoreLabel(2)).toBe("Below Average");
      expect(getCultureScoreLabel(1.5)).toBe("Below Average");
      expect(getCultureScoreLabel(1)).toBe("Poor");
    });
  });

  describe("getCultureScoreColor", () => {
    it("should return correct colors for all score ranges", () => {
      expect(getCultureScoreColor(5)).toBe("text-primary");
      expect(getCultureScoreColor(4)).toBe("text-green-500");
      expect(getCultureScoreColor(3)).toBe("text-yellow-500");
      expect(getCultureScoreColor(2)).toBe("text-orange-500");
      expect(getCultureScoreColor(1)).toBe("text-red-500");
    });
  });

  describe("getCultureScoreBgColor", () => {
    it("should return correct background colors for all score ranges", () => {
      expect(getCultureScoreBgColor(5)).toBe("bg-primary/10 border-primary/20");
      expect(getCultureScoreBgColor(4)).toBe("bg-green-500/10 border-green-500/20");
      expect(getCultureScoreBgColor(3)).toBe("bg-yellow-500/10 border-yellow-500/20");
      expect(getCultureScoreBgColor(2)).toBe("bg-orange-500/10 border-orange-500/20");
      expect(getCultureScoreBgColor(1)).toBe("bg-red-500/10 border-red-500/20");
    });
  });

  describe("getInterviewCategoryLabel", () => {
    it("should return correct labels for all categories", () => {
      expect(getInterviewCategoryLabel("preparation")).toBe("Preparation");
      expect(getInterviewCategoryLabel("technical")).toBe("Technical");
      expect(getInterviewCategoryLabel("behavioral")).toBe("Behavioral");
      expect(getInterviewCategoryLabel("cultural_fit")).toBe("Cultural Fit");
      expect(getInterviewCategoryLabel("questions_to_ask")).toBe("Questions to Ask");
    });
  });

  describe("getPriorityColor", () => {
    it("should return correct colors for all priorities", () => {
      expect(getPriorityColor("high")).toBe("text-red-500");
      expect(getPriorityColor("medium")).toBe("text-amber-500");
      expect(getPriorityColor("low")).toBe("text-blue-500");
    });
  });

  describe("getPriorityBgColor", () => {
    it("should return correct background colors for all priorities", () => {
      expect(getPriorityBgColor("high")).toBe("bg-red-500/10 border-red-500/20");
      expect(getPriorityBgColor("medium")).toBe("bg-amber-500/10 border-amber-500/20");
      expect(getPriorityBgColor("low")).toBe("bg-blue-500/10 border-blue-500/20");
    });
  });
});
