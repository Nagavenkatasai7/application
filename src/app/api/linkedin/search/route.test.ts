import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

// Mock env functions
vi.mock("@/lib/env", () => ({
  isApifyConfigured: vi.fn(),
}));

// Mock LinkedIn client functions
vi.mock("@/lib/linkedin", () => ({
  searchLinkedInJobs: vi.fn(),
  transformApifyJobs: vi.fn(),
}));

describe("LinkedIn Search API Route", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // Reset mocks
    const { isApifyConfigured } = await import("@/lib/env");
    const { searchLinkedInJobs, transformApifyJobs } = await import("@/lib/linkedin");
    vi.mocked(isApifyConfigured).mockReturnValue(true);
    vi.mocked(searchLinkedInJobs).mockResolvedValue([]);
    vi.mocked(transformApifyJobs).mockReturnValue([]);
  });

  describe("POST /api/linkedin/search", () => {
    it("should return 503 when Apify is not configured", async () => {
      const { isApifyConfigured } = await import("@/lib/env");
      vi.mocked(isApifyConfigured).mockReturnValue(false);

      const request = new Request("http://localhost/api/linkedin/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords: "software engineer" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("NOT_CONFIGURED");
    });

    it("should return 400 for invalid search parameters", async () => {
      const request = new Request("http://localhost/api/linkedin/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords: "a" }), // Too short (min 2)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 400 when keywords are missing", async () => {
      const request = new Request("http://localhost/api/linkedin/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: "San Francisco" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return jobs successfully with valid search", async () => {
      const { searchLinkedInJobs, transformApifyJobs } = await import("@/lib/linkedin");

      const mockJobs = [
        {
          id: "job-1",
          externalId: "ext-1",
          title: "Software Engineer",
          companyName: "TechCorp",
          location: "San Francisco, CA",
          salary: "$100k - $150k",
          postedAt: "2024-01-15",
          description: "Great job opportunity",
          url: "https://linkedin.com/jobs/1",
        },
      ];

      vi.mocked(searchLinkedInJobs).mockResolvedValue([{ jobId: "raw-1" }]);
      vi.mocked(transformApifyJobs).mockReturnValue(mockJobs);

      const request = new Request("http://localhost/api/linkedin/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords: "software engineer" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.jobs).toHaveLength(1);
      expect(data.data.jobs[0].title).toBe("Software Engineer");
      expect(data.data.totalCount).toBe(1);
    });

    it("should pass search parameters to searchLinkedInJobs", async () => {
      const { searchLinkedInJobs } = await import("@/lib/linkedin");

      const request = new Request("http://localhost/api/linkedin/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keywords: "data scientist",
          location: "New York",
          timeFrame: "1w",
          experienceLevel: "mid_senior",
          workplaceType: "remote",
          jobType: "full_time",
          limit: 25,
        }),
      });

      await POST(request);

      expect(searchLinkedInJobs).toHaveBeenCalledWith({
        keywords: "data scientist",
        location: "New York",
        timeFrame: "1w",
        experienceLevel: "mid_senior",
        workplaceType: "remote",
        jobType: "full_time",
        companyName: undefined,
        companyId: undefined,
        limit: 25,
      });
    });

    it("should return 504 for timeout errors", async () => {
      const { searchLinkedInJobs } = await import("@/lib/linkedin");
      vi.mocked(searchLinkedInJobs).mockRejectedValue(new Error("Request timed out"));

      const request = new Request("http://localhost/api/linkedin/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords: "software engineer" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(504);
      expect(data.error.code).toBe("TIMEOUT");
    });

    it("should return 429 for rate limit errors", async () => {
      const { searchLinkedInJobs } = await import("@/lib/linkedin");
      vi.mocked(searchLinkedInJobs).mockRejectedValue(new Error("rate limit exceeded"));

      const request = new Request("http://localhost/api/linkedin/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords: "software engineer" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error.code).toBe("RATE_LIMITED");
    });

    it("should return 429 for 429 status code errors", async () => {
      const { searchLinkedInJobs } = await import("@/lib/linkedin");
      vi.mocked(searchLinkedInJobs).mockRejectedValue(new Error("429 Too Many Requests"));

      const request = new Request("http://localhost/api/linkedin/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords: "software engineer" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error.code).toBe("RATE_LIMITED");
    });

    it("should return 500 for other errors", async () => {
      const { searchLinkedInJobs } = await import("@/lib/linkedin");
      vi.mocked(searchLinkedInJobs).mockRejectedValue(new Error("Something went wrong"));

      const request = new Request("http://localhost/api/linkedin/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords: "software engineer" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.code).toBe("SEARCH_ERROR");
      expect(data.error.message).toBe("Something went wrong");
    });

    it("should include search params in response", async () => {
      const { transformApifyJobs } = await import("@/lib/linkedin");
      vi.mocked(transformApifyJobs).mockReturnValue([]);

      const request = new Request("http://localhost/api/linkedin/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keywords: "product manager",
          location: "Seattle",
          timeFrame: "24h",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.searchParams.keywords).toBe("product manager");
      expect(data.data.searchParams.location).toBe("Seattle");
      expect(data.data.searchParams.timeFrame).toBe("24h");
    });

    it("should handle location as null when not provided", async () => {
      const { transformApifyJobs } = await import("@/lib/linkedin");
      vi.mocked(transformApifyJobs).mockReturnValue([]);

      const request = new Request("http://localhost/api/linkedin/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords: "designer" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.searchParams.location).toBeNull();
    });

    it("should use default limit of 50 when not specified", async () => {
      const { searchLinkedInJobs } = await import("@/lib/linkedin");

      const request = new Request("http://localhost/api/linkedin/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords: "engineer" }),
      });

      await POST(request);

      expect(searchLinkedInJobs).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 50 })
      );
    });

    it("should validate experienceLevel enum values", async () => {
      const request = new Request("http://localhost/api/linkedin/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keywords: "engineer",
          experienceLevel: "invalid_level",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should validate workplaceType enum values", async () => {
      const request = new Request("http://localhost/api/linkedin/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keywords: "engineer",
          workplaceType: "invalid_type",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });
  });
});
