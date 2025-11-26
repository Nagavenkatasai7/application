import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import type { ResumeContent } from "@/lib/validations/resume";

// Mock dependencies
vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn(),
  },
  resumes: {},
  jobs: {},
}));

vi.mock("@/lib/auth", () => ({
  getOrCreateLocalUser: vi.fn(),
}));

vi.mock("@/lib/ai", () => ({
  tailorResume: vi.fn(),
  tailorRequestSchema: {
    safeParse: vi.fn(),
  },
  TailorError: class TailorError extends Error {
    code: string;
    constructor(message: string, code: string) {
      super(message);
      this.code = code;
      this.name = "TailorError";
    }
  },
  isAIConfigured: vi.fn(),
}));

import { db } from "@/lib/db";
import { getOrCreateLocalUser } from "@/lib/auth";
import { tailorResume, tailorRequestSchema, TailorError, isAIConfigured } from "@/lib/ai";

const mockDb = vi.mocked(db);
const mockGetOrCreateLocalUser = vi.mocked(getOrCreateLocalUser);
const mockTailorResume = vi.mocked(tailorResume);
const mockTailorRequestSchema = vi.mocked(tailorRequestSchema);
const mockIsAIConfigured = vi.mocked(isAIConfigured);

const createMockResume = (): ResumeContent => ({
  contact: {
    name: "John Doe",
    email: "john@example.com",
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
  education: [],
  skills: {
    technical: ["JavaScript"],
    soft: ["Communication"],
  },
});

const createRequest = (body: unknown): Request => {
  return new Request("http://localhost/api/resumes/resume-123/tailor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
};

const createParams = (id: string) => Promise.resolve({ id });

describe("Tailor API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    mockGetOrCreateLocalUser.mockResolvedValue({
      id: "user-123",
      email: "test@example.com",
      createdAt: new Date(),
    });
    mockIsAIConfigured.mockReturnValue(true);
    mockTailorRequestSchema.safeParse.mockReturnValue({
      success: true,
      data: {
        resumeId: "resume-123",
        jobId: "job-123",
      },
    });
  });

  describe("POST /api/resumes/:id/tailor", () => {
    it("should return 503 when AI is not configured", async () => {
      mockIsAIConfigured.mockReturnValue(false);

      const response = await POST(
        createRequest({ jobId: "job-123" }),
        { params: createParams("resume-123") }
      );

      expect(response.status).toBe(503);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("AI_NOT_CONFIGURED");
    });

    it("should return 400 for invalid JSON body", async () => {
      const request = new Request("http://localhost/api/resumes/resume-123/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "invalid json",
      });

      const response = await POST(request, { params: createParams("resume-123") });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.code).toBe("INVALID_JSON");
    });

    it("should return 400 for validation errors", async () => {
      mockTailorRequestSchema.safeParse.mockReturnValue({
        success: false,
        error: { issues: [{ message: "Invalid job ID" }] },
      } as never);

      const response = await POST(
        createRequest({ jobId: "invalid" }),
        { params: createParams("resume-123") }
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 404 when resume not found", async () => {
      mockDb.where.mockResolvedValue([]);

      const response = await POST(
        createRequest({ jobId: "job-123" }),
        { params: createParams("resume-123") }
      );

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error.code).toBe("RESUME_NOT_FOUND");
    });

    it("should return 404 when job not found", async () => {
      // First call returns resume, second call returns empty (job not found)
      mockDb.where
        .mockResolvedValueOnce([{
          id: "resume-123",
          userId: "user-123",
          content: createMockResume(),
        }])
        .mockResolvedValueOnce([]);

      const response = await POST(
        createRequest({ jobId: "job-123" }),
        { params: createParams("resume-123") }
      );

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error.code).toBe("JOB_NOT_FOUND");
    });

    it("should return 400 when resume has no content", async () => {
      mockDb.where
        .mockResolvedValueOnce([{
          id: "resume-123",
          userId: "user-123",
          content: null,
        }])
        .mockResolvedValueOnce([{
          id: "job-123",
          title: "Software Engineer",
          companyName: "Acme",
          description: "Job description",
        }]);

      const response = await POST(
        createRequest({ jobId: "job-123" }),
        { params: createParams("resume-123") }
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.code).toBe("INVALID_RESUME");
    });

    it("should return 400 when job has no description", async () => {
      mockDb.where
        .mockResolvedValueOnce([{
          id: "resume-123",
          userId: "user-123",
          content: createMockResume(),
        }])
        .mockResolvedValueOnce([{
          id: "job-123",
          title: "Software Engineer",
          companyName: "Acme",
          description: null,
        }]);

      const response = await POST(
        createRequest({ jobId: "job-123" }),
        { params: createParams("resume-123") }
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.code).toBe("INVALID_JOB");
    });

    it("should return tailored resume on success", async () => {
      const tailoredResume = createMockResume();
      tailoredResume.summary = "Tailored summary";

      mockDb.where
        .mockResolvedValueOnce([{
          id: "resume-123",
          userId: "user-123",
          content: createMockResume(),
        }])
        .mockResolvedValueOnce([{
          id: "job-123",
          title: "Senior Software Engineer",
          companyName: "Acme Inc",
          description: "Looking for a senior engineer...",
          requirements: ["5+ years"],
          skills: ["React", "Node.js"],
        }]);

      mockTailorResume.mockResolvedValue({
        tailoredResume,
        changes: {
          summaryModified: true,
          experienceBulletsModified: 2,
          skillsReordered: false,
          sectionsReordered: false,
        },
      });

      const response = await POST(
        createRequest({ jobId: "job-123" }),
        { params: createParams("resume-123") }
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.tailoredResume).toBeDefined();
      expect(data.data.changes.summaryModified).toBe(true);
    });

    it("should handle TailorError with proper status codes", async () => {
      mockDb.where
        .mockResolvedValueOnce([{
          id: "resume-123",
          userId: "user-123",
          content: createMockResume(),
        }])
        .mockResolvedValueOnce([{
          id: "job-123",
          title: "Engineer",
          companyName: "Acme",
          description: "Job description",
        }]);

      const tailorError = new TailorError("Rate limit exceeded", "RATE_LIMIT");
      mockTailorResume.mockRejectedValue(tailorError);

      const response = await POST(
        createRequest({ jobId: "job-123" }),
        { params: createParams("resume-123") }
      );

      expect(response.status).toBe(429);
      const data = await response.json();
      expect(data.error.code).toBe("RATE_LIMIT");
    });

    it("should handle AUTH_ERROR with 401 status", async () => {
      mockDb.where
        .mockResolvedValueOnce([{
          id: "resume-123",
          userId: "user-123",
          content: createMockResume(),
        }])
        .mockResolvedValueOnce([{
          id: "job-123",
          title: "Engineer",
          companyName: "Acme",
          description: "Job description",
        }]);

      const tailorError = new TailorError("Invalid API key", "AUTH_ERROR");
      mockTailorResume.mockRejectedValue(tailorError);

      const response = await POST(
        createRequest({ jobId: "job-123" }),
        { params: createParams("resume-123") }
      );

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error.code).toBe("AUTH_ERROR");
    });

    it("should handle generic errors with 500 status", async () => {
      mockDb.where
        .mockResolvedValueOnce([{
          id: "resume-123",
          userId: "user-123",
          content: createMockResume(),
        }])
        .mockResolvedValueOnce([{
          id: "job-123",
          title: "Engineer",
          companyName: "Acme",
          description: "Job description",
        }]);

      mockTailorResume.mockRejectedValue(new Error("Unknown error"));

      const response = await POST(
        createRequest({ jobId: "job-123" }),
        { params: createParams("resume-123") }
      );

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error.code).toBe("TAILOR_ERROR");
    });

    it("should use default company name when not provided", async () => {
      mockDb.where
        .mockResolvedValueOnce([{
          id: "resume-123",
          userId: "user-123",
          content: createMockResume(),
        }])
        .mockResolvedValueOnce([{
          id: "job-123",
          title: "Software Engineer",
          companyName: null,
          description: "Looking for an engineer...",
        }]);

      mockTailorResume.mockResolvedValue({
        tailoredResume: createMockResume(),
        changes: {
          summaryModified: false,
          experienceBulletsModified: 0,
          skillsReordered: false,
          sectionsReordered: false,
        },
      });

      const response = await POST(
        createRequest({ jobId: "job-123" }),
        { params: createParams("resume-123") }
      );

      expect(response.status).toBe(200);
      expect(mockTailorResume).toHaveBeenCalledWith(
        expect.objectContaining({
          companyName: "Company",
        })
      );
    });
  });
});
