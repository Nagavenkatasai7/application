import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

// Mock database
const mockUpdateSet = vi.fn();
const mockUpdateWhere = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
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

import { researchCompany, CompanyResearchError } from "@/lib/ai/company";

const mockResearchCompany = vi.mocked(researchCompany);

const createRequest = (body: unknown): Request => {
  return new Request("http://localhost/api/modules/company/process", {
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
  cultureDimensions: [],
  cultureOverview: "Innovative culture",
  glassdoorData: {
    overallRating: 4.5,
    pros: ["Great benefits"],
    cons: ["Fast paced"],
    recommendToFriend: "85%",
    ceoApproval: "90%",
  },
  fundingData: {
    stage: "Public",
    totalRaised: null,
    valuation: null,
    lastRound: null,
    notableInvestors: [],
  },
  competitors: [],
  interviewTips: [],
  commonInterviewTopics: ["Coding", "System Design"],
  coreValues: ["Innovation", "User Focus"],
  valuesAlignment: [],
  keyTakeaways: ["Strong engineering culture"],
});

describe("Company Process API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateWhere.mockResolvedValue(undefined);
  });

  describe("POST /api/modules/company/process", () => {
    it("should return 400 for missing requestId", async () => {
      const response = await POST(
        createRequest({ companyName: "Google" })
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain("Missing requestId");
    });

    it("should return 400 for missing companyName", async () => {
      const response = await POST(
        createRequest({ requestId: "test-id" })
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain("Missing");
    });

    it("should process company research successfully", async () => {
      const mockResult = createMockResult();
      mockResearchCompany.mockResolvedValue(mockResult);

      const response = await POST(
        createRequest({
          requestId: "test-id",
          companyName: "Google",
        })
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);

      // Verify researchCompany was called
      expect(mockResearchCompany).toHaveBeenCalledWith("Google");
    });

    it("should update status to processing before research", async () => {
      const mockResult = createMockResult();
      mockResearchCompany.mockResolvedValue(mockResult);

      await POST(
        createRequest({
          requestId: "test-id",
          companyName: "Google",
        })
      );

      // Should have been called to update status to processing first
      expect(mockUpdateSet).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "processing",
        })
      );
    });

    it("should update status to completed with results after research", async () => {
      const mockResult = createMockResult();
      mockResearchCompany.mockResolvedValue(mockResult);

      await POST(
        createRequest({
          requestId: "test-id",
          companyName: "Google",
        })
      );

      // Should have been called to update status to completed
      expect(mockUpdateSet).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "completed",
          cultureSignals: mockResult,
        })
      );
    });

    it("should handle CompanyResearchError and update status to failed", async () => {
      mockResearchCompany.mockRejectedValue(
        new CompanyResearchError("AI not configured", "AI_NOT_CONFIGURED")
      );

      const response = await POST(
        createRequest({
          requestId: "test-id",
          companyName: "Google",
        })
      );

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.success).toBe(false);

      // Should update status to failed with error message
      expect(mockUpdateSet).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "failed",
          errorMessage: "AI not configured",
        })
      );
    });

    it("should handle generic errors and update status to failed", async () => {
      mockResearchCompany.mockRejectedValue(new Error("Unknown error"));

      const response = await POST(
        createRequest({
          requestId: "test-id",
          companyName: "Google",
        })
      );

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe("Processing failed");

      // Should update status to failed
      expect(mockUpdateSet).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "failed",
          errorMessage: "Unknown error",
        })
      );
    });

    it("should handle database update errors during failure recording", async () => {
      mockResearchCompany.mockRejectedValue(new Error("Research error"));
      mockUpdateWhere.mockRejectedValueOnce(undefined).mockRejectedValueOnce(new Error("DB error"));

      const response = await POST(
        createRequest({
          requestId: "test-id",
          companyName: "Google",
        })
      );

      // Should still return 500 even if updating error status fails
      expect(response.status).toBe(500);
    });

    it("should handle invalid JSON gracefully", async () => {
      const request = new Request("http://localhost/api/modules/company/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "not valid json",
      });

      // Should return 500 error response for invalid JSON
      const response = await POST(request);
      expect(response.status).toBe(500);
    });
  });
});
