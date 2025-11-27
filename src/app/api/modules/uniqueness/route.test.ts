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
vi.mock("@/lib/ai/uniqueness", () => ({
  analyzeUniqueness: vi.fn(),
  UniquenessError: class UniquenessError extends Error {
    code: string;
    constructor(message: string, code: string) {
      super(message);
      this.code = code;
      this.name = "UniquenessError";
    }
  },
}));

import { analyzeUniqueness, UniquenessError } from "@/lib/ai/uniqueness";

const mockAnalyzeUniqueness = vi.mocked(analyzeUniqueness);

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
      bullets: [{ id: "bullet-1", text: "Built web applications" }],
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
  return new Request("http://localhost/api/modules/uniqueness", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
};

describe("Uniqueness API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/modules/uniqueness", () => {
    it("should return 400 for invalid JSON", async () => {
      const request = new Request("http://localhost/api/modules/uniqueness", {
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

    it("should return 400 when resume has no contact", async () => {
      mockResumeWhere.mockResolvedValue([
        {
          id: "resume-123",
          userId: "user-123",
          content: {
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

    it("should return uniqueness analysis on success", async () => {
      const mockResult = {
        score: 75,
        scoreLabel: "high" as const,
        factors: [
          {
            id: "factor-1",
            type: "skill_combination" as const,
            title: "Technical + Creative",
            description: "Rare combination",
            rarity: "rare" as const,
            evidence: ["5 years ML"],
            suggestion: "Highlight in summary",
          },
        ],
        summary: "Strong unique profile",
        differentiators: ["ML + UX"],
        suggestions: [{ area: "Skills", recommendation: "Add more" }],
      };

      mockResumeWhere.mockResolvedValue([
        {
          id: "resume-123",
          userId: "user-123",
          content: createMockResume(),
        },
      ]);
      mockAnalyzeUniqueness.mockResolvedValue(mockResult);

      const response = await POST(
        createRequest({ resumeId: "550e8400-e29b-41d4-a716-446655440000" })
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.score).toBe(75);
      expect(data.data.factors).toHaveLength(1);
    });

    it("should handle AI not configured error", async () => {
      mockResumeWhere.mockResolvedValue([
        {
          id: "resume-123",
          userId: "user-123",
          content: createMockResume(),
        },
      ]);

      mockAnalyzeUniqueness.mockRejectedValue(
        new UniquenessError("AI not configured", "AI_NOT_CONFIGURED")
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

      mockAnalyzeUniqueness.mockRejectedValue(
        new UniquenessError("Rate limited", "RATE_LIMIT")
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

      mockAnalyzeUniqueness.mockRejectedValue(new Error("Unknown error"));

      const response = await POST(
        createRequest({ resumeId: "550e8400-e29b-41d4-a716-446655440000" })
      );

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("ANALYSIS_ERROR");
    });

    it("should call analyzeUniqueness with resume content", async () => {
      const resumeContent = createMockResume();
      mockResumeWhere.mockResolvedValue([
        {
          id: "resume-123",
          userId: "user-123",
          content: resumeContent,
        },
      ]);

      mockAnalyzeUniqueness.mockResolvedValue({
        score: 50,
        scoreLabel: "moderate" as const,
        factors: [],
        summary: "Test",
        differentiators: [],
        suggestions: [],
      });

      await POST(
        createRequest({ resumeId: "550e8400-e29b-41d4-a716-446655440000" })
      );

      expect(mockAnalyzeUniqueness).toHaveBeenCalledWith(resumeContent);
    });
  });
});
