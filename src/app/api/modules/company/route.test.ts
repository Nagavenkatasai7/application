import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

// Mock database
const mockCompanyWhere = vi.fn();
const mockInsertValues = vi.fn();
const mockUpdateWhere = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: mockCompanyWhere,
      })),
    })),
    insert: vi.fn(() => ({
      values: mockInsertValues,
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: mockUpdateWhere,
      })),
    })),
  },
  companies: "companies",
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((field, value) => ({ field, value })),
}));

// Mock AI service
vi.mock("@/lib/ai/company", () => ({
  researchCompany: vi.fn(),
  CompanyResearchError: class CompanyResearchError extends Error {
    code: string;
    constructor(message: string, code: string) {
      super(message);
      this.code = code;
      this.name = "CompanyResearchError";
    }
  },
}));

// Mock uuid
vi.mock("uuid", () => ({
  v4: vi.fn().mockReturnValue("test-company-id"),
}));

import { researchCompany, CompanyResearchError } from "@/lib/ai/company";

const mockResearchCompany = vi.mocked(researchCompany);

const createRequest = (body: unknown): Request => {
  return new Request("http://localhost/api/modules/company", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
};

const createMockResult = () => ({
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
  interviewTips: [{ category: "preparation" as const, tip: "Study products", priority: "high" as const }],
  commonInterviewTopics: ["System Design"],
  coreValues: ["Innovation"],
  valuesAlignment: [{ value: "Innovation", howToDemo: "Share projects" }],
  keyTakeaways: ["Top employer"],
});

describe("Company Research API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCompanyWhere.mockResolvedValue([]);
    mockInsertValues.mockResolvedValue(undefined);
    mockUpdateWhere.mockResolvedValue(undefined);
  });

  describe("POST /api/modules/company", () => {
    it("should return 400 for invalid JSON", async () => {
      const request = new Request("http://localhost/api/modules/company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "not json",
      });

      const response = await POST(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INVALID_JSON");
    });

    it("should return 400 for empty company name", async () => {
      const response = await POST(createRequest({ companyName: "" }));

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 400 for missing company name", async () => {
      const response = await POST(createRequest({}));

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 400 for company name too long", async () => {
      const response = await POST(createRequest({ companyName: "A".repeat(201) }));

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should research company successfully and cache result", async () => {
      const mockResult = createMockResult();
      mockResearchCompany.mockResolvedValue(mockResult);

      const response = await POST(createRequest({ companyName: "Google" }));

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.companyName).toBe("Google");
      expect(data.cached).toBe(false);
      expect(mockInsertValues).toHaveBeenCalled();
    });

    it("should return cached result if available", async () => {
      const mockResult = createMockResult();
      const cachedCompany = {
        id: "existing-id",
        name: "google",
        cultureSignals: mockResult,
        cachedAt: new Date(), // Fresh cache
      };
      mockCompanyWhere.mockResolvedValue([cachedCompany]);

      const response = await POST(createRequest({ companyName: "Google" }));

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.cached).toBe(true);
      expect(mockResearchCompany).not.toHaveBeenCalled();
    });

    it("should re-research if cache is expired", async () => {
      const mockResult = createMockResult();
      const expiredCache = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000); // 8 days old
      const cachedCompany = {
        id: "existing-id",
        name: "google",
        cultureSignals: mockResult,
        cachedAt: expiredCache,
      };
      mockCompanyWhere.mockResolvedValue([cachedCompany]);
      mockResearchCompany.mockResolvedValue(mockResult);

      const response = await POST(createRequest({ companyName: "Google" }));

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.cached).toBe(false);
      expect(mockResearchCompany).toHaveBeenCalled();
      expect(mockUpdateWhere).toHaveBeenCalled();
    });

    it("should handle AI not configured error", async () => {
      mockResearchCompany.mockRejectedValue(
        new CompanyResearchError("AI not configured", "AI_NOT_CONFIGURED")
      );

      const response = await POST(createRequest({ companyName: "Google" }));

      expect(response.status).toBe(503);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("AI_NOT_CONFIGURED");
    });

    it("should handle rate limit error", async () => {
      mockResearchCompany.mockRejectedValue(
        new CompanyResearchError("Rate limited", "RATE_LIMIT")
      );

      const response = await POST(createRequest({ companyName: "Google" }));

      expect(response.status).toBe(429);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("RATE_LIMIT");
    });

    it("should handle auth error", async () => {
      mockResearchCompany.mockRejectedValue(
        new CompanyResearchError("Invalid API key", "AUTH_ERROR")
      );

      const response = await POST(createRequest({ companyName: "Google" }));

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error.code).toBe("AUTH_ERROR");
    });

    it("should handle generic errors", async () => {
      mockResearchCompany.mockRejectedValue(new Error("Unknown error"));

      const response = await POST(createRequest({ companyName: "Google" }));

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("RESEARCH_ERROR");
    });

    it("should normalize company name to lowercase for caching", async () => {
      const mockResult = createMockResult();
      mockResearchCompany.mockResolvedValue(mockResult);

      await POST(createRequest({ companyName: "GOOGLE" }));

      // Check that the company was inserted with lowercase name
      expect(mockInsertValues).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "google",
        })
      );
    });

    it("should call researchCompany with trimmed company name", async () => {
      const mockResult = createMockResult();
      mockResearchCompany.mockResolvedValue(mockResult);

      await POST(createRequest({ companyName: "  Google  " }));

      expect(mockResearchCompany).toHaveBeenCalledWith("Google");
    });
  });
});
