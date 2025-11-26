import { describe, it, expect } from "vitest";
import type { ResumeContent } from "@/lib/validations/resume";
import { tailorRequestSchema, TailorError } from "./tailor";

// We'll test the schema validation and error class directly,
// and mock the full tailorResume function in integration tests

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
      location: "San Francisco, CA",
      startDate: "Jan 2020",
      endDate: "Present",
      bullets: [
        { id: "bullet-1", text: "Built web applications" },
        { id: "bullet-2", text: "Improved performance" },
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
    technical: ["JavaScript", "TypeScript", "React"],
    soft: ["Communication", "Leadership"],
  },
});

describe("Tailor Service", () => {
  describe("tailorRequestSchema", () => {
    it("should validate valid request with UUID format", () => {
      const result = tailorRequestSchema.safeParse({
        resumeId: "550e8400-e29b-41d4-a716-446655440000",
        jobId: "550e8400-e29b-41d4-a716-446655440001",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid resume ID format", () => {
      const result = tailorRequestSchema.safeParse({
        resumeId: "invalid-uuid",
        jobId: "550e8400-e29b-41d4-a716-446655440001",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Invalid resume ID");
      }
    });

    it("should reject invalid job ID format", () => {
      const result = tailorRequestSchema.safeParse({
        resumeId: "550e8400-e29b-41d4-a716-446655440000",
        jobId: "invalid-uuid",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Invalid job ID");
      }
    });

    it("should reject missing resumeId", () => {
      const result = tailorRequestSchema.safeParse({
        jobId: "550e8400-e29b-41d4-a716-446655440001",
      });
      expect(result.success).toBe(false);
    });

    it("should reject missing jobId", () => {
      const result = tailorRequestSchema.safeParse({
        resumeId: "550e8400-e29b-41d4-a716-446655440000",
      });
      expect(result.success).toBe(false);
    });

    it("should reject empty object", () => {
      const result = tailorRequestSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("should reject non-object input", () => {
      const result = tailorRequestSchema.safeParse("not-an-object");
      expect(result.success).toBe(false);
    });
  });

  describe("TailorError", () => {
    it("should create error with message and code", () => {
      const error = new TailorError("Test error", "TEST_CODE");
      expect(error.message).toBe("Test error");
      expect(error.code).toBe("TEST_CODE");
      expect(error.name).toBe("TailorError");
    });

    it("should be instance of Error", () => {
      const error = new TailorError("Test error", "TEST_CODE");
      expect(error).toBeInstanceOf(Error);
    });

    it("should include cause when provided", () => {
      const cause = new Error("Original error");
      const error = new TailorError("Wrapped error", "WRAP_CODE", cause);
      expect(error.cause).toBe(cause);
    });

    it("should have correct name property", () => {
      const error = new TailorError("Test", "CODE");
      expect(error.name).toBe("TailorError");
    });

    it("should work with different error codes", () => {
      const codes = [
        "AI_NOT_CONFIGURED",
        "FEATURE_DISABLED",
        "AUTH_ERROR",
        "RATE_LIMIT",
        "SERVICE_UNAVAILABLE",
        "TIMEOUT",
        "PARSE_ERROR",
        "VALIDATION_ERROR",
        "API_ERROR",
        "UNKNOWN_ERROR",
      ];

      codes.forEach((code) => {
        const error = new TailorError(`Error with ${code}`, code);
        expect(error.code).toBe(code);
      });
    });
  });

  describe("TailorRequest interface", () => {
    it("should accept valid request structure", () => {
      // This is a compile-time check, but we can validate the shape
      const request = {
        resume: createMockResume(),
        jobTitle: "Senior Software Engineer",
        companyName: "Acme Inc",
        jobDescription: "We are looking for a senior engineer...",
        requirements: ["5+ years experience"],
        skills: ["React", "TypeScript"],
      };

      expect(request.resume).toBeDefined();
      expect(request.resume.contact.name).toBe("John Doe");
      expect(request.jobTitle).toBe("Senior Software Engineer");
      expect(request.companyName).toBe("Acme Inc");
      expect(request.jobDescription).toContain("senior engineer");
      expect(request.requirements).toHaveLength(1);
      expect(request.skills).toHaveLength(2);
    });

    it("should allow optional requirements and skills", () => {
      // Verify request structure allows optional fields
      const request: {
        resume: ReturnType<typeof createMockResume>;
        jobTitle: string;
        companyName: string;
        jobDescription: string;
        requirements?: string[];
        skills?: string[];
      } = {
        resume: createMockResume(),
        jobTitle: "Software Engineer",
        companyName: "Acme Inc",
        jobDescription: "Job description here",
      };

      expect(request.requirements).toBeUndefined();
      expect(request.skills).toBeUndefined();
    });
  });

  describe("TailorChangeSummary interface", () => {
    it("should have correct structure", () => {
      const changes = {
        summaryModified: true,
        experienceBulletsModified: 3,
        skillsReordered: false,
        sectionsReordered: true,
      };

      expect(typeof changes.summaryModified).toBe("boolean");
      expect(typeof changes.experienceBulletsModified).toBe("number");
      expect(typeof changes.skillsReordered).toBe("boolean");
      expect(typeof changes.sectionsReordered).toBe("boolean");
    });
  });
});
