import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import type { ResumeContent } from "@/lib/validations/resume";

// Mock database
const mockResumeWhere = vi.fn();
const mockJobWhere = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn((table) => ({
        where: table === "resumes" ? mockResumeWhere : mockJobWhere,
      })),
    })),
  },
  resumes: "resumes",
  jobs: "jobs",
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
vi.mock("@/lib/ai/context", () => ({
  analyzeContext: vi.fn(),
  ContextError: class ContextError extends Error {
    code: string;
    constructor(message: string, code: string) {
      super(message);
      this.code = code;
      this.name = "ContextError";
    }
  },
}));

import { analyzeContext, ContextError } from "@/lib/ai/context";

const mockAnalyzeContext = vi.mocked(analyzeContext);

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

const createMockJob = () => ({
  id: "job-123",
  title: "Senior Software Engineer",
  companyName: "Awesome Inc",
  description: "We are looking for a Senior Software Engineer...",
  requirements: ["5+ years experience", "Strong JavaScript skills"],
  skills: ["JavaScript", "React", "Node.js"],
});

const createRequest = (body: unknown): Request => {
  return new Request("http://localhost/api/modules/context", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
};

describe("Context API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/modules/context", () => {
    it("should return 400 for invalid JSON", async () => {
      const request = new Request("http://localhost/api/modules/context", {
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
        createRequest({
          resumeId: "not-a-uuid",
          jobId: "660e8400-e29b-41d4-a716-446655440001",
        })
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 400 for invalid job ID", async () => {
      const response = await POST(
        createRequest({
          resumeId: "550e8400-e29b-41d4-a716-446655440000",
          jobId: "not-a-uuid",
        })
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 400 for missing resume ID", async () => {
      const response = await POST(
        createRequest({
          jobId: "660e8400-e29b-41d4-a716-446655440001",
        })
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 400 for missing job ID", async () => {
      const response = await POST(
        createRequest({
          resumeId: "550e8400-e29b-41d4-a716-446655440000",
        })
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 404 when resume not found", async () => {
      mockResumeWhere.mockResolvedValue([]);

      const response = await POST(
        createRequest({
          resumeId: "550e8400-e29b-41d4-a716-446655440000",
          jobId: "660e8400-e29b-41d4-a716-446655440001",
        })
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
        createRequest({
          resumeId: "550e8400-e29b-41d4-a716-446655440000",
          jobId: "660e8400-e29b-41d4-a716-446655440001",
        })
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INVALID_RESUME");
    });

    it("should return 404 when job not found", async () => {
      mockResumeWhere.mockResolvedValue([
        {
          id: "resume-123",
          userId: "user-123",
          content: createMockResume(),
        },
      ]);
      mockJobWhere.mockResolvedValue([]);

      const response = await POST(
        createRequest({
          resumeId: "550e8400-e29b-41d4-a716-446655440000",
          jobId: "660e8400-e29b-41d4-a716-446655440001",
        })
      );

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("JOB_NOT_FOUND");
    });

    it("should return 400 when job has no content", async () => {
      mockResumeWhere.mockResolvedValue([
        {
          id: "resume-123",
          userId: "user-123",
          content: createMockResume(),
        },
      ]);
      mockJobWhere.mockResolvedValue([
        {
          id: "job-123",
          title: "Test Job",
          companyName: null,
          description: null,
          requirements: null,
          skills: null,
        },
      ]);

      const response = await POST(
        createRequest({
          resumeId: "550e8400-e29b-41d4-a716-446655440000",
          jobId: "660e8400-e29b-41d4-a716-446655440001",
        })
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.code).toBe("INVALID_JOB");
    });

    it("should return context analysis on success", async () => {
      const mockResult = {
        score: 75,
        scoreLabel: "good" as const,
        summary: "Good alignment overall",
        matchedSkills: [
          {
            skill: "JavaScript",
            source: "technical" as const,
            strength: "exact" as const,
            evidence: "Listed in skills section",
          },
        ],
        missingRequirements: [
          {
            requirement: "5+ years experience",
            importance: "important" as const,
            suggestion: "Highlight equivalent experience",
          },
        ],
        experienceAlignments: [
          {
            experienceId: "exp-1",
            experienceTitle: "Software Engineer",
            companyName: "Tech Corp",
            relevance: "high" as const,
            matchedAspects: ["Web development"],
            explanation: "Relevant experience",
          },
        ],
        keywordCoverage: {
          matched: 5,
          total: 10,
          percentage: 50,
          keywords: [
            { keyword: "JavaScript", found: true, location: "Skills" },
          ],
        },
        suggestions: [
          { category: "skills" as const, priority: "high" as const, recommendation: "Add more skills" },
        ],
        fitAssessment: {
          strengths: ["Strong technical skills"],
          gaps: ["Needs more experience"],
          overallFit: "Good fit overall",
        },
      };

      mockResumeWhere.mockResolvedValue([
        {
          id: "resume-123",
          userId: "user-123",
          content: createMockResume(),
        },
      ]);
      mockJobWhere.mockResolvedValue([createMockJob()]);
      mockAnalyzeContext.mockResolvedValue(mockResult);

      const response = await POST(
        createRequest({
          resumeId: "550e8400-e29b-41d4-a716-446655440000",
          jobId: "660e8400-e29b-41d4-a716-446655440001",
        })
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.score).toBe(75);
      expect(data.data.matchedSkills).toHaveLength(1);
    });

    it("should handle AI not configured error", async () => {
      mockResumeWhere.mockResolvedValue([
        {
          id: "resume-123",
          userId: "user-123",
          content: createMockResume(),
        },
      ]);
      mockJobWhere.mockResolvedValue([createMockJob()]);

      mockAnalyzeContext.mockRejectedValue(
        new ContextError("AI not configured", "AI_NOT_CONFIGURED")
      );

      const response = await POST(
        createRequest({
          resumeId: "550e8400-e29b-41d4-a716-446655440000",
          jobId: "660e8400-e29b-41d4-a716-446655440001",
        })
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
      mockJobWhere.mockResolvedValue([createMockJob()]);

      mockAnalyzeContext.mockRejectedValue(
        new ContextError("Rate limited", "RATE_LIMIT")
      );

      const response = await POST(
        createRequest({
          resumeId: "550e8400-e29b-41d4-a716-446655440000",
          jobId: "660e8400-e29b-41d4-a716-446655440001",
        })
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
      mockJobWhere.mockResolvedValue([createMockJob()]);

      mockAnalyzeContext.mockRejectedValue(new Error("Unknown error"));

      const response = await POST(
        createRequest({
          resumeId: "550e8400-e29b-41d4-a716-446655440000",
          jobId: "660e8400-e29b-41d4-a716-446655440001",
        })
      );

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("ANALYSIS_ERROR");
    });

    it("should call analyzeContext with correct parameters", async () => {
      const resumeContent = createMockResume();
      const jobData = createMockJob();

      mockResumeWhere.mockResolvedValue([
        {
          id: "resume-123",
          userId: "user-123",
          content: resumeContent,
        },
      ]);
      mockJobWhere.mockResolvedValue([jobData]);

      mockAnalyzeContext.mockResolvedValue({
        score: 50,
        scoreLabel: "moderate" as const,
        summary: "Test",
        matchedSkills: [],
        missingRequirements: [],
        experienceAlignments: [],
        keywordCoverage: { matched: 0, total: 0, percentage: 0, keywords: [] },
        suggestions: [],
        fitAssessment: { strengths: [], gaps: [], overallFit: "" },
      });

      await POST(
        createRequest({
          resumeId: "550e8400-e29b-41d4-a716-446655440000",
          jobId: "660e8400-e29b-41d4-a716-446655440001",
        })
      );

      expect(mockAnalyzeContext).toHaveBeenCalledWith(resumeContent, {
        title: jobData.title,
        companyName: jobData.companyName,
        description: jobData.description,
        requirements: jobData.requirements,
        skills: jobData.skills,
      });
    });
  });
});
