import { describe, it, expect } from "vitest";
import {
  experienceLevelSchema,
  personalInfoSchema,
  locationInfoSchema,
  extendedInfoSchema,
  professionalInfoSchema,
  profileSchema,
  profileUpdateSchema,
  profilePictureUploadSchema,
  deleteAccountSchema,
  dataExportSchema,
  sessionInfoSchema,
  profileResponseSchema,
  EXPERIENCE_LEVEL_LABELS,
  COMMON_INDUSTRIES,
} from "./profile";

describe("Profile Validations", () => {
  describe("experienceLevelSchema", () => {
    it("should accept valid experience levels", () => {
      expect(experienceLevelSchema.parse("entry")).toBe("entry");
      expect(experienceLevelSchema.parse("mid")).toBe("mid");
      expect(experienceLevelSchema.parse("senior")).toBe("senior");
      expect(experienceLevelSchema.parse("lead")).toBe("lead");
      expect(experienceLevelSchema.parse("executive")).toBe("executive");
    });

    it("should reject invalid experience levels", () => {
      expect(() => experienceLevelSchema.parse("invalid")).toThrow();
      expect(() => experienceLevelSchema.parse("")).toThrow();
      expect(() => experienceLevelSchema.parse(123)).toThrow();
    });
  });

  describe("personalInfoSchema", () => {
    it("should accept valid personal info", () => {
      const result = personalInfoSchema.parse({
        name: "John Doe",
        email: "john@example.com",
        profilePictureUrl: "https://example.com/avatar.jpg",
      });
      expect(result.name).toBe("John Doe");
      expect(result.email).toBe("john@example.com");
    });

    it("should accept null/undefined optional fields", () => {
      const result = personalInfoSchema.parse({
        email: "john@example.com",
        name: null,
        profilePictureUrl: null,
      });
      expect(result.email).toBe("john@example.com");
      expect(result.name).toBeNull();
    });

    it("should reject invalid email", () => {
      expect(() =>
        personalInfoSchema.parse({
          name: "John",
          email: "invalid-email",
        })
      ).toThrow();
    });

    it("should reject name longer than 100 characters", () => {
      expect(() =>
        personalInfoSchema.parse({
          name: "a".repeat(101),
          email: "john@example.com",
        })
      ).toThrow();
    });
  });

  describe("locationInfoSchema", () => {
    it("should accept valid location info", () => {
      const result = locationInfoSchema.parse({
        city: "San Francisco",
        country: "USA",
      });
      expect(result.city).toBe("San Francisco");
      expect(result.country).toBe("USA");
    });

    it("should accept null values", () => {
      const result = locationInfoSchema.parse({
        city: null,
        country: null,
      });
      expect(result.city).toBeNull();
      expect(result.country).toBeNull();
    });

    it("should reject city longer than 100 characters", () => {
      expect(() =>
        locationInfoSchema.parse({
          city: "a".repeat(101),
          country: "USA",
        })
      ).toThrow();
    });
  });

  describe("extendedInfoSchema", () => {
    it("should accept valid extended info", () => {
      const result = extendedInfoSchema.parse({
        bio: "Software engineer with 5 years of experience",
        linkedinUrl: "https://linkedin.com/in/johndoe",
        githubUrl: "https://github.com/johndoe",
      });
      expect(result.bio).toBe("Software engineer with 5 years of experience");
    });

    it("should reject bio longer than 500 characters", () => {
      expect(() =>
        extendedInfoSchema.parse({
          bio: "a".repeat(501),
        })
      ).toThrow();
    });

    it("should reject non-LinkedIn URL for linkedinUrl", () => {
      expect(() =>
        extendedInfoSchema.parse({
          linkedinUrl: "https://example.com/johndoe",
        })
      ).toThrow();
    });

    it("should reject non-GitHub URL for githubUrl", () => {
      expect(() =>
        extendedInfoSchema.parse({
          githubUrl: "https://example.com/johndoe",
        })
      ).toThrow();
    });

    it("should accept empty strings for URLs", () => {
      const result = extendedInfoSchema.parse({
        linkedinUrl: "",
        githubUrl: "",
      });
      expect(result.linkedinUrl).toBe("");
      expect(result.githubUrl).toBe("");
    });
  });

  describe("professionalInfoSchema", () => {
    it("should accept valid professional info", () => {
      const result = professionalInfoSchema.parse({
        jobTitle: "Senior Software Engineer",
        experienceLevel: "senior",
        skills: ["TypeScript", "React", "Node.js"],
        preferredIndustries: ["Technology", "Finance"],
      });
      expect(result.jobTitle).toBe("Senior Software Engineer");
      expect(result.skills).toHaveLength(3);
    });

    it("should default skills and industries to empty arrays", () => {
      const result = professionalInfoSchema.parse({});
      expect(result.skills).toEqual([]);
      expect(result.preferredIndustries).toEqual([]);
    });

    it("should reject more than 20 skills", () => {
      const skills = Array.from({ length: 21 }, (_, i) => `Skill${i}`);
      expect(() =>
        professionalInfoSchema.parse({ skills })
      ).toThrow();
    });

    it("should reject more than 10 industries", () => {
      const industries = Array.from({ length: 11 }, (_, i) => `Industry${i}`);
      expect(() =>
        professionalInfoSchema.parse({ preferredIndustries: industries })
      ).toThrow();
    });

    it("should reject skill names longer than 50 characters", () => {
      expect(() =>
        professionalInfoSchema.parse({
          skills: ["a".repeat(51)],
        })
      ).toThrow();
    });
  });

  describe("profileSchema", () => {
    it("should accept complete valid profile", () => {
      const result = profileSchema.parse({
        name: "John Doe",
        email: "john@example.com",
        profilePictureUrl: "https://example.com/avatar.jpg",
        city: "San Francisco",
        country: "USA",
        bio: "Software engineer",
        linkedinUrl: "https://linkedin.com/in/johndoe",
        githubUrl: "https://github.com/johndoe",
        jobTitle: "Senior Engineer",
        experienceLevel: "senior",
        skills: ["TypeScript"],
        preferredIndustries: ["Technology"],
      });
      expect(result.name).toBe("John Doe");
      expect(result.email).toBe("john@example.com");
    });

    it("should accept minimal profile with only email", () => {
      const result = profileSchema.parse({
        email: "john@example.com",
      });
      expect(result.email).toBe("john@example.com");
      expect(result.skills).toEqual([]);
    });
  });

  describe("profileUpdateSchema", () => {
    it("should accept partial updates", () => {
      const result = profileUpdateSchema.parse({
        name: "New Name",
      });
      expect(result.name).toBe("New Name");
    });

    it("should not include email field", () => {
      const result = profileUpdateSchema.parse({
        name: "John",
        // email should be omitted
      });
      expect(result).not.toHaveProperty("email");
    });
  });

  describe("profilePictureUploadSchema", () => {
    it("should accept valid JPEG file under 5MB", () => {
      const file = new File(["test content"], "avatar.jpg", { type: "image/jpeg" });
      const result = profilePictureUploadSchema.parse({ file });
      expect(result.file).toBeInstanceOf(File);
    });

    it("should accept valid PNG file under 5MB", () => {
      const file = new File(["test content"], "avatar.png", { type: "image/png" });
      const result = profilePictureUploadSchema.parse({ file });
      expect(result.file).toBeInstanceOf(File);
    });

    it("should accept valid WebP file under 5MB", () => {
      const file = new File(["test content"], "avatar.webp", { type: "image/webp" });
      const result = profilePictureUploadSchema.parse({ file });
      expect(result.file).toBeInstanceOf(File);
    });

    it("should reject file larger than 5MB", () => {
      // Create a mock file object with size > 5MB
      const largeContent = new Array(6 * 1024 * 1024).fill("a").join("");
      const file = new File([largeContent], "large.jpg", { type: "image/jpeg" });
      expect(() => profilePictureUploadSchema.parse({ file })).toThrow(
        "File size must be less than 5MB"
      );
    });

    it("should reject unsupported file types", () => {
      const file = new File(["test content"], "avatar.gif", { type: "image/gif" });
      expect(() => profilePictureUploadSchema.parse({ file })).toThrow(
        "File must be JPEG, PNG, or WebP"
      );
    });

    it("should reject non-File objects", () => {
      expect(() => profilePictureUploadSchema.parse({ file: "not a file" })).toThrow();
      expect(() => profilePictureUploadSchema.parse({ file: null })).toThrow();
    });
  });

  describe("deleteAccountSchema", () => {
    it('should accept exact confirmation text', () => {
      const result = deleteAccountSchema.parse({
        confirmation: "DELETE MY ACCOUNT",
      });
      expect(result.confirmation).toBe("DELETE MY ACCOUNT");
    });

    it("should reject wrong confirmation text", () => {
      expect(() =>
        deleteAccountSchema.parse({
          confirmation: "delete my account",
        })
      ).toThrow();
    });

    it("should reject empty confirmation", () => {
      expect(() =>
        deleteAccountSchema.parse({
          confirmation: "",
        })
      ).toThrow();
    });
  });

  describe("dataExportSchema", () => {
    it("should accept valid export options", () => {
      const result = dataExportSchema.parse({
        format: "json",
        includeResumes: true,
        includeJobs: false,
        includeApplications: true,
        includeSettings: false,
      });
      expect(result.format).toBe("json");
      expect(result.includeResumes).toBe(true);
      expect(result.includeJobs).toBe(false);
    });

    it("should use defaults for missing options", () => {
      const result = dataExportSchema.parse({});
      expect(result.format).toBe("json");
      expect(result.includeResumes).toBe(true);
      expect(result.includeJobs).toBe(true);
      expect(result.includeApplications).toBe(true);
      expect(result.includeSettings).toBe(true);
    });

    it("should reject invalid format", () => {
      expect(() =>
        dataExportSchema.parse({
          format: "xml",
        })
      ).toThrow();
    });
  });

  describe("sessionInfoSchema", () => {
    it("should accept valid session info", () => {
      const result = sessionInfoSchema.parse({
        sessionToken: "***abc123",
        expires: new Date("2025-01-01"),
        isCurrent: true,
      });
      expect(result.sessionToken).toBe("***abc123");
      expect(result.isCurrent).toBe(true);
    });

    it("should accept optional createdAt", () => {
      const result = sessionInfoSchema.parse({
        sessionToken: "***abc123",
        expires: new Date(),
        isCurrent: false,
        createdAt: new Date(),
      });
      expect(result.createdAt).toBeInstanceOf(Date);
    });
  });

  describe("profileResponseSchema", () => {
    it("should accept valid profile response", () => {
      const result = profileResponseSchema.parse({
        id: "user-123",
        email: "john@example.com",
        name: "John Doe",
        emailVerified: new Date(),
        image: "https://example.com/avatar.jpg",
        profilePictureUrl: "https://example.com/avatar.jpg",
        jobTitle: "Engineer",
        experienceLevel: "senior",
        skills: ["TypeScript"],
        preferredIndustries: ["Technology"],
        city: "SF",
        country: "USA",
        bio: "Bio text",
        linkedinUrl: "https://linkedin.com/in/john",
        githubUrl: "https://github.com/john",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      expect(result.id).toBe("user-123");
    });

    it("should accept null values for optional fields", () => {
      const result = profileResponseSchema.parse({
        id: "user-123",
        email: "john@example.com",
        name: null,
        emailVerified: null,
        image: null,
        profilePictureUrl: null,
        jobTitle: null,
        experienceLevel: null,
        skills: [],
        preferredIndustries: [],
        city: null,
        country: null,
        bio: null,
        linkedinUrl: null,
        githubUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      expect(result.name).toBeNull();
    });
  });

  describe("EXPERIENCE_LEVEL_LABELS", () => {
    it("should have labels for all experience levels", () => {
      expect(EXPERIENCE_LEVEL_LABELS.entry).toBe("Entry Level");
      expect(EXPERIENCE_LEVEL_LABELS.mid).toBe("Mid Level");
      expect(EXPERIENCE_LEVEL_LABELS.senior).toBe("Senior Level");
      expect(EXPERIENCE_LEVEL_LABELS.lead).toBe("Lead / Principal");
      expect(EXPERIENCE_LEVEL_LABELS.executive).toBe("Executive / C-Level");
    });
  });

  describe("COMMON_INDUSTRIES", () => {
    it("should contain common industries", () => {
      expect(COMMON_INDUSTRIES).toContain("Technology");
      expect(COMMON_INDUSTRIES).toContain("Healthcare");
      expect(COMMON_INDUSTRIES).toContain("Finance");
      expect(COMMON_INDUSTRIES.length).toBeGreaterThan(10);
    });
  });
});
