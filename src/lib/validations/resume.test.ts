import { describe, it, expect } from "vitest";
import {
  resumeContentSchema,
  resumeResponseSchema,
  validatePdfFile,
  MAX_FILE_SIZE,
  ALLOWED_MIME_TYPES,
} from "./resume";

describe("Resume Validation", () => {
  describe("validatePdfFile", () => {
    it("should accept valid PDF file", () => {
      const file = new File(["test content"], "resume.pdf", {
        type: "application/pdf",
      });
      Object.defineProperty(file, "size", { value: 1024 });

      const result = validatePdfFile(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should reject non-PDF file type", () => {
      const file = new File(["test content"], "document.docx", {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      const result = validatePdfFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("PDF");
    });

    it("should reject file exceeding max size", () => {
      const file = new File(["test content"], "resume.pdf", {
        type: "application/pdf",
      });
      Object.defineProperty(file, "size", { value: MAX_FILE_SIZE + 1 });

      const result = validatePdfFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("10MB");
    });

    it("should accept file at exactly max size", () => {
      const file = new File(["test content"], "resume.pdf", {
        type: "application/pdf",
      });
      Object.defineProperty(file, "size", { value: MAX_FILE_SIZE });

      const result = validatePdfFile(file);
      expect(result.valid).toBe(true);
    });

    it("should reject image file", () => {
      const file = new File(["test content"], "image.png", {
        type: "image/png",
      });

      const result = validatePdfFile(file);
      expect(result.valid).toBe(false);
    });

    it("should reject text file", () => {
      const file = new File(["test content"], "document.txt", {
        type: "text/plain",
      });

      const result = validatePdfFile(file);
      expect(result.valid).toBe(false);
    });
  });

  describe("constants", () => {
    it("should have MAX_FILE_SIZE of 10MB", () => {
      expect(MAX_FILE_SIZE).toBe(10 * 1024 * 1024);
    });

    it("should only allow application/pdf mime type", () => {
      expect(ALLOWED_MIME_TYPES).toEqual(["application/pdf"]);
    });
  });

  describe("resumeContentSchema", () => {
    it("should validate valid resume content", () => {
      const content = {
        contact: {
          name: "John Doe",
          email: "john@example.com",
        },
        experiences: [],
        education: [],
        skills: {
          technical: ["TypeScript"],
          soft: ["Communication"],
        },
      };

      const result = resumeContentSchema.safeParse(content);
      expect(result.success).toBe(true);
    });

    it("should require contact name and email", () => {
      const content = {
        contact: {},
        experiences: [],
        education: [],
        skills: { technical: [], soft: [] },
      };

      const result = resumeContentSchema.safeParse(content);
      expect(result.success).toBe(false);
    });

    it("should validate email format", () => {
      const content = {
        contact: {
          name: "John Doe",
          email: "invalid-email",
        },
        experiences: [],
        education: [],
        skills: { technical: [], soft: [] },
      };

      const result = resumeContentSchema.safeParse(content);
      expect(result.success).toBe(false);
    });

    it("should accept optional fields", () => {
      const content = {
        contact: {
          name: "John Doe",
          email: "john@example.com",
          phone: "123-456-7890",
          location: "San Francisco, CA",
          linkedin: "https://linkedin.com/in/johndoe",
          github: "https://github.com/johndoe",
        },
        summary: "Experienced software engineer",
        experiences: [
          {
            id: "exp-1",
            company: "Acme Corp",
            title: "Software Engineer",
            startDate: "2020-01",
            bullets: [{ id: "bullet-1", text: "Built features" }],
          },
        ],
        education: [
          {
            id: "edu-1",
            institution: "MIT",
            degree: "BS",
            field: "Computer Science",
            graduationDate: "2020",
          },
        ],
        skills: {
          technical: ["TypeScript", "React"],
          soft: ["Communication"],
        },
        projects: [
          {
            id: "proj-1",
            name: "My Project",
            description: "A cool project",
            technologies: ["React"],
          },
        ],
      };

      const result = resumeContentSchema.safeParse(content);
      expect(result.success).toBe(true);
    });
  });

  describe("resumeResponseSchema", () => {
    it("should validate a complete resume response", () => {
      const response = {
        id: "resume-123",
        userId: "user-456",
        name: "My Resume",
        content: {
          contact: { name: "John", email: "john@example.com" },
          experiences: [],
          education: [],
          skills: { technical: [], soft: [] },
        },
        templateId: null,
        isMaster: false,
        originalFileName: "resume.pdf",
        fileSize: 1024,
        extractedText: "Resume content here",
        createdAt: 1700000000,
        updatedAt: 1700000001,
      };

      const result = resumeResponseSchema.safeParse(response);
      expect(result.success).toBe(true);
    });

    it("should allow nullable fields", () => {
      const response = {
        id: "resume-123",
        userId: "user-456",
        name: "My Resume",
        content: null,
        templateId: null,
        isMaster: false,
        originalFileName: null,
        fileSize: null,
        extractedText: null,
        createdAt: 1700000000,
        updatedAt: 1700000001,
      };

      const result = resumeResponseSchema.safeParse(response);
      expect(result.success).toBe(true);
    });

    it("should require id field", () => {
      const response = {
        userId: "user-456",
        name: "My Resume",
      };

      const result = resumeResponseSchema.safeParse(response);
      expect(result.success).toBe(false);
    });

    it("should require name field", () => {
      const response = {
        id: "resume-123",
        userId: "user-456",
      };

      const result = resumeResponseSchema.safeParse(response);
      expect(result.success).toBe(false);
    });
  });
});
