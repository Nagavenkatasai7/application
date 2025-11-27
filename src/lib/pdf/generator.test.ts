import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ResumeContent } from "@/lib/validations/resume";
import { PDFGenerationError, generatePdfFilename } from "./generator";

// Mock @react-pdf/renderer - this is a complex dependency to mock
vi.mock("@react-pdf/renderer", () => ({
  renderToBuffer: vi.fn().mockResolvedValue(Buffer.from("mock-pdf-content")),
  Document: ({ children }: { children: React.ReactNode }) => children,
  Page: ({ children }: { children: React.ReactNode }) => children,
  View: ({ children }: { children: React.ReactNode }) => children,
  Text: ({ children }: { children: React.ReactNode }) => children,
  Link: ({ children }: { children: React.ReactNode }) => children,
  StyleSheet: {
    create: (styles: Record<string, unknown>) => styles,
  },
  Font: {
    register: vi.fn(),
  },
}));

const createMockResume = (): ResumeContent => ({
  contact: {
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 555-123-4567",
    location: "San Francisco, CA",
    linkedin: "https://linkedin.com/in/johndoe",
    github: "https://github.com/johndoe",
  },
  summary: "Experienced software engineer with 5+ years of experience.",
  experiences: [
    {
      id: "exp-1",
      company: "Tech Corp",
      title: "Senior Software Engineer",
      location: "San Francisco, CA",
      startDate: "Jan 2020",
      endDate: "Present",
      bullets: [
        { id: "bullet-1", text: "Built scalable web applications" },
        { id: "bullet-2", text: "Led team of 5 engineers" },
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
      gpa: "3.8",
    },
  ],
  skills: {
    technical: ["JavaScript", "TypeScript", "React", "Node.js"],
    soft: ["Communication", "Leadership", "Problem Solving"],
  },
  projects: [
    {
      id: "proj-1",
      name: "Open Source Project",
      description: "A popular open source library",
      technologies: ["TypeScript", "React"],
      link: "https://github.com/example/project",
    },
  ],
});

describe("PDF Generator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("PDFGenerationError", () => {
    it("should create error with message and code", () => {
      const error = new PDFGenerationError("Test error", "TEST_CODE");
      expect(error.message).toBe("Test error");
      expect(error.code).toBe("TEST_CODE");
      expect(error.name).toBe("PDFGenerationError");
    });

    it("should be instance of Error", () => {
      const error = new PDFGenerationError("Test error", "TEST_CODE");
      expect(error).toBeInstanceOf(Error);
    });

    it("should include cause when provided", () => {
      const cause = new Error("Original error");
      const error = new PDFGenerationError("Wrapped error", "WRAP_CODE", cause);
      expect(error.cause).toBe(cause);
    });

    it("should have correct name property", () => {
      const error = new PDFGenerationError("Test", "CODE");
      expect(error.name).toBe("PDFGenerationError");
    });

    it("should work with INVALID_CONTENT code", () => {
      const error = new PDFGenerationError(
        "Invalid content",
        "INVALID_CONTENT"
      );
      expect(error.code).toBe("INVALID_CONTENT");
    });

    it("should work with GENERATION_ERROR code", () => {
      const error = new PDFGenerationError(
        "Generation failed",
        "GENERATION_ERROR"
      );
      expect(error.code).toBe("GENERATION_ERROR");
    });
  });

  describe("generatePdfFilename", () => {
    // Get today's date in ISO format for test expectations
    const today = new Date().toISOString().split("T")[0];

    it("should generate filename from contact name", () => {
      const resume = createMockResume();
      const filename = generatePdfFilename(resume);
      expect(filename).toBe(`john-doe-resume-${today}.pdf`);
    });

    it("should handle names with multiple words", () => {
      const resume = createMockResume();
      resume.contact.name = "John Michael Doe";
      const filename = generatePdfFilename(resume);
      expect(filename).toBe(`john-michael-doe-resume-${today}.pdf`);
    });

    it("should handle names with special characters by removing them", () => {
      const resume = createMockResume();
      resume.contact.name = "José García";
      const filename = generatePdfFilename(resume);
      // Special characters are removed, spaces become dashes
      expect(filename).toBe(`jos-garc-a-resume-${today}.pdf`);
    });

    it("should handle empty name", () => {
      const resume = createMockResume();
      resume.contact.name = "";
      const filename = generatePdfFilename(resume);
      // Empty name results in just the suffix
      expect(filename).toBe(`-resume-${today}.pdf`);
    });

    it("should handle whitespace-only name", () => {
      const resume = createMockResume();
      resume.contact.name = "   ";
      const filename = generatePdfFilename(resume);
      // Whitespace becomes empty after processing
      expect(filename).toBe(`-resume-${today}.pdf`);
    });

    it("should trim whitespace from name", () => {
      const resume = createMockResume();
      resume.contact.name = "  John Doe  ";
      const filename = generatePdfFilename(resume);
      expect(filename).toBe(`john-doe-resume-${today}.pdf`);
    });

    it("should include current date in filename", () => {
      const resume = createMockResume();
      const filename = generatePdfFilename(resume);
      expect(filename).toContain(today);
    });

    it("should end with .pdf extension", () => {
      const resume = createMockResume();
      const filename = generatePdfFilename(resume);
      expect(filename).toMatch(/\.pdf$/);
    });
  });

  describe("generateResumePdf", () => {
    it("should generate PDF buffer for valid resume", async () => {
      const { generateResumePdf } = await import("./generator");
      const resume = createMockResume();
      const buffer = await generateResumePdf(resume);
      expect(buffer).toBeInstanceOf(Buffer);
    });

    it("should throw INVALID_CONTENT for missing contact name", async () => {
      const { generateResumePdf } = await import("./generator");
      const resume = createMockResume();
      resume.contact.name = "";

      await expect(generateResumePdf(resume)).rejects.toThrow(
        PDFGenerationError
      );
      await expect(generateResumePdf(resume)).rejects.toMatchObject({
        code: "INVALID_CONTENT",
      });
    });

    it("should throw INVALID_CONTENT for missing contact email", async () => {
      const { generateResumePdf } = await import("./generator");
      const resume = createMockResume();
      resume.contact.email = "";

      await expect(generateResumePdf(resume)).rejects.toThrow(
        PDFGenerationError
      );
      await expect(generateResumePdf(resume)).rejects.toMatchObject({
        code: "INVALID_CONTENT",
      });
    });

    it("should handle resume with minimal content", async () => {
      const { generateResumePdf } = await import("./generator");
      const minimalResume: ResumeContent = {
        contact: {
          name: "John Doe",
          email: "john@example.com",
        },
        experiences: [],
        education: [],
        skills: {
          technical: [],
          soft: [],
        },
      };

      const buffer = await generateResumePdf(minimalResume);
      expect(buffer).toBeInstanceOf(Buffer);
    });

    it("should handle resume with all sections populated", async () => {
      const { generateResumePdf } = await import("./generator");
      const fullResume = createMockResume();

      const buffer = await generateResumePdf(fullResume);
      expect(buffer).toBeInstanceOf(Buffer);
    });

    it("should handle resume without optional fields", async () => {
      const { generateResumePdf } = await import("./generator");
      const resume: ResumeContent = {
        contact: {
          name: "Jane Smith",
          email: "jane@example.com",
          // No phone, location, linkedin, website
        },
        experiences: [
          {
            id: "exp-1",
            company: "Company",
            title: "Engineer",
            startDate: "2020",
            // No location, endDate
            bullets: [],
          },
        ],
        education: [
          {
            id: "edu-1",
            institution: "University",
            degree: "BS",
            field: "CS",
            graduationDate: "2019",
            // No gpa
          },
        ],
        skills: {
          technical: ["JavaScript"],
          soft: [],
        },
        // No summary, projects
      };

      const buffer = await generateResumePdf(resume);
      expect(buffer).toBeInstanceOf(Buffer);
    });
  });

  describe("Resume content validation", () => {
    it("should validate resume with experiences", async () => {
      const resume = createMockResume();
      expect(resume.experiences).toHaveLength(1);
      expect(resume.experiences[0].bullets).toHaveLength(2);
    });

    it("should validate resume with education", async () => {
      const resume = createMockResume();
      expect(resume.education).toHaveLength(1);
      expect(resume.education[0].institution).toBe("Stanford University");
    });

    it("should validate resume with skills", async () => {
      const resume = createMockResume();
      expect(resume.skills.technical).toHaveLength(4);
      expect(resume.skills.soft).toHaveLength(3);
    });

    it("should validate resume with projects", async () => {
      const resume = createMockResume();
      expect(resume.projects).toHaveLength(1);
      expect(resume.projects![0].name).toBe("Open Source Project");
    });
  });
});
