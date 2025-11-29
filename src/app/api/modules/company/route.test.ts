import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

// Mock database
const mockCompanyWhere = vi.fn();
const mockInsertValues = vi.fn();
const mockUpdateSet = vi.fn();
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
      set: mockUpdateSet.mockReturnValue({
        where: mockUpdateWhere,
      }),
    })),
  },
  companies: "companies",
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((field, value) => ({ field, value })),
}));

// Mock fetch for background process trigger
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock uuid
vi.mock("uuid", () => ({
  v4: vi.fn().mockReturnValue("test-company-id"),
}));

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
    mockFetch.mockResolvedValue({ ok: true });
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

    it("should return cached result immediately if available", async () => {
      const mockResult = createMockResult();
      const cachedCompany = {
        id: "existing-id",
        name: "google",
        status: "completed",
        cultureSignals: mockResult,
        cachedAt: new Date(), // Fresh cache
      };
      mockCompanyWhere.mockResolvedValue([cachedCompany]);

      const response = await POST(createRequest({ companyName: "Google" }));

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.cached).toBe(true);
      expect(data.data.companyName).toBe("Google");
      // Should not trigger background process for cached results
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("should return processing status for new company", async () => {
      // No cached company
      mockCompanyWhere.mockResolvedValue([]);

      const response = await POST(createRequest({ companyName: "Google" }));

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.status).toBe("processing");
      expect(data.requestId).toBe("test-company-id");
      // Should insert new record
      expect(mockInsertValues).toHaveBeenCalled();
      // Should trigger background process
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/modules/company/process"),
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("Google"),
        })
      );
    });

    it("should return processing status if already processing", async () => {
      const processingCompany = {
        id: "processing-id",
        name: "google",
        status: "processing",
        processingStartedAt: new Date(), // Just started
      };
      mockCompanyWhere.mockResolvedValue([processingCompany]);

      const response = await POST(createRequest({ companyName: "Google" }));

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.status).toBe("processing");
      expect(data.requestId).toBe("processing-id");
      // Should not insert or update for in-progress requests
      expect(mockInsertValues).not.toHaveBeenCalled();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("should re-trigger processing if stale", async () => {
      const staleProcessing = {
        id: "stale-id",
        name: "google",
        status: "processing",
        processingStartedAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago (stale)
      };
      mockCompanyWhere.mockResolvedValue([staleProcessing]);

      const response = await POST(createRequest({ companyName: "Google" }));

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.status).toBe("processing");
      // Should re-trigger processing for stale requests
      expect(mockUpdateWhere).toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalled();
    });

    it("should re-research if cache is expired", async () => {
      const mockResult = createMockResult();
      const expiredCache = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000); // 8 days old
      const cachedCompany = {
        id: "existing-id",
        name: "google",
        status: "completed",
        cultureSignals: mockResult,
        cachedAt: expiredCache,
      };
      mockCompanyWhere.mockResolvedValue([cachedCompany]);

      const response = await POST(createRequest({ companyName: "Google" }));

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.status).toBe("processing");
      // Should trigger re-research for expired cache
      expect(mockUpdateWhere).toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalled();
    });

    it("should normalize company name to lowercase for caching", async () => {
      mockCompanyWhere.mockResolvedValue([]);

      await POST(createRequest({ companyName: "GOOGLE" }));

      // Check that the company was inserted with lowercase name
      expect(mockInsertValues).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "google",
        })
      );
    });

    it("should trim company name when triggering background process", async () => {
      mockCompanyWhere.mockResolvedValue([]);

      await POST(createRequest({ companyName: "  Google  " }));

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            requestId: "test-company-id",
            companyName: "Google",
          }),
        })
      );
    });
  });
});
