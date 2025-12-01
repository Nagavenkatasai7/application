/**
 * Tests for API Validation Utilities
 */

import { describe, it, expect } from "vitest";
import {
  sanitizeFilename,
  userUpdateSchema,
  jobCreateSchema,
} from "./validation";

describe("sanitizeFilename", () => {
  describe("path traversal prevention", () => {
    it("should remove Unix path components", () => {
      expect(sanitizeFilename("/etc/passwd")).toBe("passwd");
      expect(sanitizeFilename("../../etc/passwd")).toBe("passwd");
      expect(sanitizeFilename("foo/bar/baz.pdf")).toBe("baz.pdf");
    });

    it("should remove Windows path components", () => {
      expect(sanitizeFilename("C:\\Windows\\System32\\file.exe")).toBe("file.exe");
      expect(sanitizeFilename("..\\..\\secret.txt")).toBe("secret.txt");
      expect(sanitizeFilename("foo\\bar\\baz.pdf")).toBe("baz.pdf");
    });

    it("should remove double dots", () => {
      expect(sanitizeFilename("..file.pdf")).toBe("file.pdf");
      expect(sanitizeFilename("file..pdf")).toBe("file.pdf");
      expect(sanitizeFilename("....test")).toBe("test");
    });
  });

  describe("dangerous character removal", () => {
    it("should remove Windows-forbidden characters", () => {
      expect(sanitizeFilename("file<name>.pdf")).toBe("filename.pdf");
      expect(sanitizeFilename('file"name".pdf')).toBe("filename.pdf");
      expect(sanitizeFilename("file|name.pdf")).toBe("filename.pdf");
      expect(sanitizeFilename("file?name*.pdf")).toBe("filename.pdf");
      expect(sanitizeFilename("file:name.pdf")).toBe("filename.pdf");
    });

    it("should remove leading dots", () => {
      expect(sanitizeFilename(".hidden")).toBe("hidden");
      expect(sanitizeFilename("...file.pdf")).toBe("file.pdf");
      expect(sanitizeFilename(".")).toBe("untitled");
    });
  });

  describe("edge cases", () => {
    it("should handle empty string", () => {
      expect(sanitizeFilename("")).toBe("untitled");
    });

    it("should handle whitespace only", () => {
      expect(sanitizeFilename("   ")).toBe("untitled");
    });

    it("should handle string with only forbidden chars", () => {
      expect(sanitizeFilename("<>:\"|?*")).toBe("untitled");
    });

    it("should preserve valid filenames", () => {
      expect(sanitizeFilename("resume.pdf")).toBe("resume.pdf");
      expect(sanitizeFilename("My Resume 2024.pdf")).toBe("My Resume 2024.pdf");
      expect(sanitizeFilename("john_doe-resume_v2.pdf")).toBe("john_doe-resume_v2.pdf");
    });

    it("should handle Unicode characters", () => {
      expect(sanitizeFilename("résumé.pdf")).toBe("résumé.pdf");
      expect(sanitizeFilename("履歴書.pdf")).toBe("履歴書.pdf");
    });
  });
});

describe("userUpdateSchema", () => {
  describe("valid inputs", () => {
    it("should accept valid name and email", () => {
      const result = userUpdateSchema.safeParse({
        name: "John Doe",
        email: "john@example.com",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("John Doe");
        expect(result.data.email).toBe("john@example.com");
      }
    });

    it("should accept name only", () => {
      const result = userUpdateSchema.safeParse({ name: "John Doe" });
      expect(result.success).toBe(true);
    });

    it("should accept email only", () => {
      const result = userUpdateSchema.safeParse({ email: "john@example.com" });
      expect(result.success).toBe(true);
    });

    it("should accept empty object", () => {
      const result = userUpdateSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe("invalid inputs", () => {
    it("should reject empty name", () => {
      const result = userUpdateSchema.safeParse({ name: "" });
      expect(result.success).toBe(false);
    });

    it("should reject name over 100 characters", () => {
      const result = userUpdateSchema.safeParse({ name: "a".repeat(101) });
      expect(result.success).toBe(false);
    });

    it("should reject invalid email format", () => {
      const result = userUpdateSchema.safeParse({ email: "not-an-email" });
      expect(result.success).toBe(false);
    });

    it("should reject email over 255 characters", () => {
      const result = userUpdateSchema.safeParse({
        email: "a".repeat(250) + "@b.com",
      });
      expect(result.success).toBe(false);
    });
  });
});

describe("jobCreateSchema", () => {
  describe("valid inputs", () => {
    it("should accept minimal valid job", () => {
      const result = jobCreateSchema.safeParse({
        title: "Software Engineer",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe("Software Engineer");
        expect(result.data.platform).toBe("manual"); // default
        expect(result.data.requirements).toEqual([]); // default
        expect(result.data.skills).toEqual([]); // default
      }
    });

    it("should accept full job with all fields", () => {
      const result = jobCreateSchema.safeParse({
        platform: "linkedin",
        externalId: "job-123",
        title: "Senior Developer",
        companyId: "company-abc",
        companyName: "Acme Corp",
        location: "San Francisco, CA",
        description: "Great opportunity",
        requirements: ["5+ years experience", "TypeScript"],
        skills: ["React", "Node.js"],
        salary: { min: 150000, max: 200000, currency: "USD" },
        postedAt: "2024-01-15T10:00:00Z",
      });
      expect(result.success).toBe(true);
    });

    it("should accept all valid platforms", () => {
      const platforms = [
        "linkedin",
        "indeed",
        "glassdoor",
        "greenhouse",
        "lever",
        "workday",
        "icims",
        "smartrecruiters",
        "manual",
      ];

      platforms.forEach((platform) => {
        const result = jobCreateSchema.safeParse({
          platform,
          title: "Test Job",
        });
        expect(result.success).toBe(true);
      });
    });

    it("should accept nullable fields as null", () => {
      const result = jobCreateSchema.safeParse({
        title: "Test Job",
        externalId: null,
        companyId: null,
        companyName: null,
        location: null,
        description: null,
        salary: null,
        postedAt: null,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("invalid inputs", () => {
    it("should reject missing title", () => {
      const result = jobCreateSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("should reject empty title", () => {
      const result = jobCreateSchema.safeParse({ title: "" });
      expect(result.success).toBe(false);
    });

    it("should reject title over 500 characters", () => {
      const result = jobCreateSchema.safeParse({ title: "a".repeat(501) });
      expect(result.success).toBe(false);
    });

    it("should reject invalid platform", () => {
      const result = jobCreateSchema.safeParse({
        title: "Test Job",
        platform: "invalid-platform",
      });
      expect(result.success).toBe(false);
    });

    it("should reject company name over 200 characters", () => {
      const result = jobCreateSchema.safeParse({
        title: "Test Job",
        companyName: "a".repeat(201),
      });
      expect(result.success).toBe(false);
    });

    it("should reject location over 200 characters", () => {
      const result = jobCreateSchema.safeParse({
        title: "Test Job",
        location: "a".repeat(201),
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid datetime for postedAt", () => {
      const result = jobCreateSchema.safeParse({
        title: "Test Job",
        postedAt: "not-a-date",
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid salary structure", () => {
      const result = jobCreateSchema.safeParse({
        title: "Test Job",
        salary: { min: "not-a-number" },
      });
      expect(result.success).toBe(false);
    });

    it("should reject non-array requirements", () => {
      const result = jobCreateSchema.safeParse({
        title: "Test Job",
        requirements: "not-an-array",
      });
      expect(result.success).toBe(false);
    });

    it("should reject non-array skills", () => {
      const result = jobCreateSchema.safeParse({
        title: "Test Job",
        skills: "not-an-array",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("salary field", () => {
    it("should accept salary with defaults", () => {
      const result = jobCreateSchema.safeParse({
        title: "Test Job",
        salary: { min: 100000 },
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.salary?.currency).toBe("USD");
      }
    });

    it("should accept custom currency", () => {
      const result = jobCreateSchema.safeParse({
        title: "Test Job",
        salary: { min: 100000, currency: "EUR" },
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.salary?.currency).toBe("EUR");
      }
    });
  });
});

describe("parseRequestBody", () => {
  // Note: parseRequestBody is tested indirectly via API route tests
  // These tests verify the exported function behavior

  describe("with valid JSON", () => {
    it("should parse valid JSON matching schema", async () => {
      const { parseRequestBody } = await import("./validation");
      const mockRequest = {
        json: async () => ({ name: "Test User", email: "test@example.com" }),
      } as unknown as Request;

      const result = await parseRequestBody(mockRequest, userUpdateSchema);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Test User");
        expect(result.data.email).toBe("test@example.com");
      }
    });

    it("should return validation error for schema mismatch", async () => {
      const { parseRequestBody } = await import("./validation");
      const mockRequest = {
        json: async () => ({ email: "invalid-email" }),
      } as unknown as Request;

      const result = await parseRequestBody(mockRequest, userUpdateSchema);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.response.status).toBe(400);
      }
    });
  });

  describe("with invalid JSON", () => {
    it("should return validation error for non-JSON body", async () => {
      const { parseRequestBody } = await import("./validation");
      const mockRequest = {
        json: async () => {
          throw new SyntaxError("Unexpected token");
        },
      } as unknown as Request;

      const result = await parseRequestBody(mockRequest, userUpdateSchema);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.response.status).toBe(400);
      }
    });
  });
});
