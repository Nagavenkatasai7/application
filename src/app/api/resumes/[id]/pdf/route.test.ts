import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import type { ResumeContent } from "@/lib/validations/resume";

// Mock functions for chained calls
const mockResumeWhere = vi.fn();

// Mock dependencies
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

vi.mock("@/lib/pdf/generator", () => ({
  generateResumePdf: vi.fn(),
  generatePdfFilename: vi.fn().mockReturnValue("John_Doe_Resume.pdf"),
  PDFGenerationError: class PDFGenerationError extends Error {
    code: string;
    constructor(message: string, code: string) {
      super(message);
      this.code = code;
      this.name = "PDFGenerationError";
    }
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((field, value) => ({ field, value })),
  and: vi.fn((...conditions) => conditions),
}));

import {
  generateResumePdf,
  generatePdfFilename,
  PDFGenerationError,
} from "@/lib/pdf/generator";

const mockGenerateResumePdf = vi.mocked(generateResumePdf);
const mockGeneratePdfFilename = vi.mocked(generatePdfFilename);

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
    technical: ["JavaScript"],
    soft: ["Communication"],
  },
});

const createRequest = (): Request => {
  return new Request("http://localhost/api/resumes/resume-123/pdf", {
    method: "GET",
  });
};

const createParams = (id: string) => Promise.resolve({ id });

describe("PDF API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGeneratePdfFilename.mockReturnValue("John_Doe_Resume.pdf");
  });

  describe("GET /api/resumes/:id/pdf", () => {
    it("should return 404 when resume not found", async () => {
      mockResumeWhere.mockResolvedValue([]);

      const response = await GET(createRequest(), {
        params: createParams("resume-123"),
      });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("RESUME_NOT_FOUND");
    });

    it("should return 404 when resume belongs to different user", async () => {
      // The where clause with userId check means empty result = not found/not owned
      mockResumeWhere.mockResolvedValue([]);

      const response = await GET(createRequest(), {
        params: createParams("resume-123"),
      });

      expect(response.status).toBe(404);
      const data = await response.json();
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

      const response = await GET(createRequest(), {
        params: createParams("resume-123"),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INVALID_RESUME");
      expect(data.error.message).toBe("Resume has no content to export");
    });

    it("should return 400 when resume content has no contact", async () => {
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

      const response = await GET(createRequest(), {
        params: createParams("resume-123"),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.code).toBe("INVALID_RESUME");
    });

    it("should return PDF file on success", async () => {
      const mockPdfBuffer = Buffer.from("mock-pdf-content");
      mockResumeWhere.mockResolvedValue([
        {
          id: "resume-123",
          userId: "user-123",
          content: createMockResume(),
        },
      ]);
      mockGenerateResumePdf.mockResolvedValue(mockPdfBuffer);
      mockGeneratePdfFilename.mockReturnValue("John_Doe_Resume.pdf");

      const response = await GET(createRequest(), {
        params: createParams("resume-123"),
      });

      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toBe("application/pdf");
      expect(response.headers.get("Content-Disposition")).toBe(
        'attachment; filename="John_Doe_Resume.pdf"'
      );
      expect(response.headers.get("Content-Length")).toBe(
        mockPdfBuffer.length.toString()
      );
      expect(response.headers.get("Cache-Control")).toBe(
        "no-cache, no-store, must-revalidate"
      );
    });

    it("should return correct PDF content", async () => {
      const mockPdfContent = "mock-pdf-binary-content";
      const mockPdfBuffer = Buffer.from(mockPdfContent);
      mockResumeWhere.mockResolvedValue([
        {
          id: "resume-123",
          userId: "user-123",
          content: createMockResume(),
        },
      ]);
      mockGenerateResumePdf.mockResolvedValue(mockPdfBuffer);

      const response = await GET(createRequest(), {
        params: createParams("resume-123"),
      });

      const arrayBuffer = await response.arrayBuffer();
      const receivedContent = Buffer.from(arrayBuffer).toString();
      expect(receivedContent).toBe(mockPdfContent);
    });

    it("should handle PDFGenerationError with INVALID_CONTENT code", async () => {
      mockResumeWhere.mockResolvedValue([
        {
          id: "resume-123",
          userId: "user-123",
          content: createMockResume(),
        },
      ]);

      const pdfError = new PDFGenerationError(
        "Resume must have contact name",
        "INVALID_CONTENT"
      );
      mockGenerateResumePdf.mockRejectedValue(pdfError);

      const response = await GET(createRequest(), {
        params: createParams("resume-123"),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INVALID_CONTENT");
    });

    it("should handle PDFGenerationError with GENERATION_ERROR code", async () => {
      mockResumeWhere.mockResolvedValue([
        {
          id: "resume-123",
          userId: "user-123",
          content: createMockResume(),
        },
      ]);

      const pdfError = new PDFGenerationError(
        "Failed to generate PDF",
        "GENERATION_ERROR"
      );
      mockGenerateResumePdf.mockRejectedValue(pdfError);

      const response = await GET(createRequest(), {
        params: createParams("resume-123"),
      });

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("GENERATION_ERROR");
    });

    it("should handle generic errors with 500 status", async () => {
      mockResumeWhere.mockResolvedValue([
        {
          id: "resume-123",
          userId: "user-123",
          content: createMockResume(),
        },
      ]);

      mockGenerateResumePdf.mockRejectedValue(new Error("Unknown error"));

      const response = await GET(createRequest(), {
        params: createParams("resume-123"),
      });

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("PDF_ERROR");
      expect(data.error.message).toBe("Failed to generate PDF");
    });

    it("should call generateResumePdf with resume content", async () => {
      const resumeContent = createMockResume();
      mockResumeWhere.mockResolvedValue([
        {
          id: "resume-123",
          userId: "user-123",
          content: resumeContent,
        },
      ]);
      mockGenerateResumePdf.mockResolvedValue(Buffer.from("pdf"));

      await GET(createRequest(), {
        params: createParams("resume-123"),
      });

      expect(mockGenerateResumePdf).toHaveBeenCalledWith(resumeContent);
    });

    it("should call generatePdfFilename with resume content", async () => {
      const resumeContent = createMockResume();
      mockResumeWhere.mockResolvedValue([
        {
          id: "resume-123",
          userId: "user-123",
          content: resumeContent,
        },
      ]);
      mockGenerateResumePdf.mockResolvedValue(Buffer.from("pdf"));

      await GET(createRequest(), {
        params: createParams("resume-123"),
      });

      expect(mockGeneratePdfFilename).toHaveBeenCalledWith(resumeContent);
    });

    it("should use generated filename in Content-Disposition header", async () => {
      mockResumeWhere.mockResolvedValue([
        {
          id: "resume-123",
          userId: "user-123",
          content: createMockResume(),
        },
      ]);
      mockGenerateResumePdf.mockResolvedValue(Buffer.from("pdf"));
      mockGeneratePdfFilename.mockReturnValue("Jane_Smith_Resume.pdf");

      const response = await GET(createRequest(), {
        params: createParams("resume-123"),
      });

      expect(response.headers.get("Content-Disposition")).toBe(
        'attachment; filename="Jane_Smith_Resume.pdf"'
      );
    });

    it("should work with different resume IDs", async () => {
      mockResumeWhere.mockResolvedValue([
        {
          id: "different-resume-id",
          userId: "user-123",
          content: createMockResume(),
        },
      ]);
      mockGenerateResumePdf.mockResolvedValue(Buffer.from("pdf"));

      const response = await GET(createRequest(), {
        params: createParams("different-resume-id"),
      });

      expect(response.status).toBe(200);
    });
  });
});
