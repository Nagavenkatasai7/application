import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";

// Mock database
const mockCompanyWhere = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: mockCompanyWhere,
      })),
    })),
  },
  companies: "companies",
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((field, value) => ({ field, value })),
}));

const createMockResult = () => ({
  companyName: "Google",
  industry: "Technology",
  summary: "Leading technology company",
  cultureOverview: "Innovative culture",
});

describe("Company Status API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/modules/company/status/[id]", () => {
    it("should return 400 for invalid or missing ID", async () => {
      const request = new Request("http://localhost/api/modules/company/status/");
      const response = await GET(request, { params: Promise.resolve({ id: "" }) });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INVALID_ID");
    });

    it("should return 404 when company not found", async () => {
      mockCompanyWhere.mockResolvedValue([]);

      const request = new Request("http://localhost/api/modules/company/status/test-id");
      const response = await GET(request, { params: Promise.resolve({ id: "test-id" }) });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("NOT_FOUND");
    });

    it("should return completed status with data when research is done", async () => {
      const mockResult = createMockResult();
      mockCompanyWhere.mockResolvedValue([{
        id: "test-id",
        name: "google",
        status: "completed",
        cultureSignals: mockResult,
      }]);

      const request = new Request("http://localhost/api/modules/company/status/test-id");
      const response = await GET(request, { params: Promise.resolve({ id: "test-id" }) });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.status).toBe("completed");
      expect(data.data).toEqual(mockResult);
    });

    it("should return failed status with error message", async () => {
      mockCompanyWhere.mockResolvedValue([{
        id: "test-id",
        name: "google",
        status: "failed",
        errorMessage: "AI service unavailable",
      }]);

      const request = new Request("http://localhost/api/modules/company/status/test-id");
      const response = await GET(request, { params: Promise.resolve({ id: "test-id" }) });

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.status).toBe("failed");
      expect(data.error.code).toBe("RESEARCH_FAILED");
      expect(data.error.message).toBe("AI service unavailable");
    });

    it("should return default error message when errorMessage is null", async () => {
      mockCompanyWhere.mockResolvedValue([{
        id: "test-id",
        name: "google",
        status: "failed",
        errorMessage: null,
      }]);

      const request = new Request("http://localhost/api/modules/company/status/test-id");
      const response = await GET(request, { params: Promise.resolve({ id: "test-id" }) });

      const data = await response.json();
      expect(data.error.message).toBe("Company research failed");
    });

    it("should return processing status when research is in progress", async () => {
      mockCompanyWhere.mockResolvedValue([{
        id: "test-id",
        name: "google",
        status: "processing",
      }]);

      const request = new Request("http://localhost/api/modules/company/status/test-id");
      const response = await GET(request, { params: Promise.resolve({ id: "test-id" }) });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.status).toBe("processing");
    });

    it("should return pending status when research has not started", async () => {
      mockCompanyWhere.mockResolvedValue([{
        id: "test-id",
        name: "google",
        status: "pending",
      }]);

      const request = new Request("http://localhost/api/modules/company/status/test-id");
      const response = await GET(request, { params: Promise.resolve({ id: "test-id" }) });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.status).toBe("pending");
    });

    it("should handle database errors gracefully", async () => {
      mockCompanyWhere.mockRejectedValue(new Error("Database error"));

      const request = new Request("http://localhost/api/modules/company/status/test-id");
      const response = await GET(request, { params: Promise.resolve({ id: "test-id" }) });

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INTERNAL_ERROR");
    });

    it("should return pending when status is null", async () => {
      mockCompanyWhere.mockResolvedValue([{
        id: "test-id",
        name: "google",
        status: null,
      }]);

      const request = new Request("http://localhost/api/modules/company/status/test-id");
      const response = await GET(request, { params: Promise.resolve({ id: "test-id" }) });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.status).toBe("pending");
    });
  });
});
