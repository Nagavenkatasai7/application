import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import type { ResumeContent } from "@/lib/validations/resume";

// Mock database
const mockResumeWhere = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: mockResumeWhere,
      })),
    })),
  },
  resumes: "resumes",
}));

vi.mock("@/lib/auth", () => ({
  getOrCreateLocalUser: vi.fn().mockResolvedValue({
    id: "user-123",
    email: "test@example.com",
    name: "Test User",
    createdAt: new Date(),
  }),
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((field, value) => ({ field, value })),
  and: vi.fn((...conditions) => conditions),
}));

// Mock AI service
vi.mock("@/lib/ai/impact", () => ({
  analyzeImpact: vi.fn(),
  ImpactError: class ImpactError extends Error {
    code: string;
    constructor(message: string, code: string) {
      super(message);
      this.code = code;
      this.name = "ImpactError";
    }
  },
}));

import { analyzeImpact, ImpactError } from "@/lib/ai/impact";

const mockAnalyzeImpact = vi.mocked(analyzeImpact);

const createMockResume = (): ResumeContent => ({
  contact: {
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 555-123-4567",
    location: "San Francisco, CA",
  },
  summary: "Experienced software engineer.",
  experiences: [
    {
      id: "exp-1",
      company: "Tech Corp",
      title: "Software Engineer",
      startDate: "Jan 2020",
      bullets: [
        { id: "bullet-1", text: "Built web applications" },
        { id: "bullet-2", text: "Led team projects" },
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "Stanford University",
      degree: "Bachelor of Science",
      field: "Computer Science",
      graduationDate: "May 2019",
    },
  ],
  skills: {
    technical: ["JavaScript", "React", "Python"],
    soft: ["Communication", "Leadership"],
  },
});

const createRequest = (body: unknown): Request => {
  return new Request("http://localhost/api/modules/impact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
};

describe("Impact API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/modules/impact", () => {
    it("should return 400 for invalid JSON", async () => {
      const request = new Request("http://localhost/api/modules/impact", {
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

    it("should return 400 for invalid resume ID", async () => {
      const response = await POST(
        createRequest({ resumeId: "not-a-uuid" })
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 400 for missing resume ID", async () => {
      const response = await POST(createRequest({}));

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 404 when resume not found", async () => {
      mockResumeWhere.mockResolvedValue([]);

      const response = await POST(
        createRequest({ resumeId: "550e8400-e29b-41d4-a716-446655440000" })
      );

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("RESUME_NOT_FOUND");
    });

    it("should return 400 when resume has no content", async () => {
      mockResumeWhere.mockResolvedValue([
        {
          id: "resume-123",
          userId: "user-123",
          content: null,
        },
      ]);

      const response = await POST(
        createRequest({ resumeId: "550e8400-e29b-41d4-a716-446655440000" })
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INVALID_RESUME");
    });

    it("should return 400 when resume has no experience bullets", async () => {
      mockResumeWhere.mockResolvedValue([
        {
          id: "resume-123",
          userId: "user-123",
          content: {
            contact: { name: "Test", email: "test@test.com" },
            experiences: [],
            education: [],
            skills: { technical: [], soft: [] },
          },
        },
      ]);

      const response = await POST(
        createRequest({ resumeId: "550e8400-e29b-41d4-a716-446655440000" })
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.code).toBe("INVALID_RESUME");
    });

    it("should return impact analysis on success", async () => {
      const mockResult = {
        score: 75,
        scoreLabel: "strong" as const,
        summary: "Good quantification overall",
        totalBullets: 2,
        bulletsImproved: 2,
        bullets: [
          {
            id: "bullet-1",
            experienceId: "exp-1",
            experienceTitle: "Software Engineer",
            companyName: "Tech Corp",
            original: "Built web applications",
            improved: "Built 5 web applications serving 10K+ users",
            metrics: ["5 applications", "10K+ users"],
            improvement: "major" as const,
            explanation: "Added scale metrics",
          },
        ],
        metricCategories: {
          percentage: 1,
          monetary: 0,
          time: 1,
          scale: 2,
          other: 0,
        },
        suggestions: [{ area: "Revenue", recommendation: "Add dollar amounts" }],
      };

      mockResumeWhere.mockResolvedValue([
        {
          id: "resume-123",
          userId: "user-123",
          content: createMockResume(),
        },
      ]);
      mockAnalyzeImpact.mockResolvedValue(mockResult);

      const response = await POST(
        createRequest({ resumeId: "550e8400-e29b-41d4-a716-446655440000" })
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.score).toBe(75);
      expect(data.data.bullets).toHaveLength(1);
    });

    it("should handle AI not configured error", async () => {
      mockResumeWhere.mockResolvedValue([
        {
          id: "resume-123",
          userId: "user-123",
          content: createMockResume(),
        },
      ]);

      mockAnalyzeImpact.mockRejectedValue(
        new ImpactError("AI not configured", "AI_NOT_CONFIGURED")
      );

      const response = await POST(
        createRequest({ resumeId: "550e8400-e29b-41d4-a716-446655440000" })
      );

      expect(response.status).toBe(503);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("AI_NOT_CONFIGURED");
    });

    it("should handle rate limit error", async () => {
      mockResumeWhere.mockResolvedValue([
        {
          id: "resume-123",
          userId: "user-123",
          content: createMockResume(),
        },
      ]);

      mockAnalyzeImpact.mockRejectedValue(
        new ImpactError("Rate limited", "RATE_LIMIT")
      );

      const response = await POST(
        createRequest({ resumeId: "550e8400-e29b-41d4-a716-446655440000" })
      );

      expect(response.status).toBe(429);
      const data = await response.json();
      expect(data.error.code).toBe("RATE_LIMIT");
    });

    it("should handle generic errors", async () => {
      mockResumeWhere.mockResolvedValue([
        {
          id: "resume-123",
          userId: "user-123",
          content: createMockResume(),
        },
      ]);

      mockAnalyzeImpact.mockRejectedValue(new Error("Unknown error"));

      const response = await POST(
        createRequest({ resumeId: "550e8400-e29b-41d4-a716-446655440000" })
      );

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("ANALYSIS_ERROR");
    });

    it("should call analyzeImpact with resume content", async () => {
      const resumeContent = createMockResume();
      mockResumeWhere.mockResolvedValue([
        {
          id: "resume-123",
          userId: "user-123",
          content: resumeContent,
        },
      ]);

      mockAnalyzeImpact.mockResolvedValue({
        score: 50,
        scoreLabel: "moderate" as const,
        summary: "Test",
        totalBullets: 2,
        bulletsImproved: 1,
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

      await POST(
        createRequest({ resumeId: "550e8400-e29b-41d4-a716-446655440000" })
      );

      expect(mockAnalyzeImpact).toHaveBeenCalledWith(resumeContent);
    });
  });
});
