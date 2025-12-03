import { describe, it, expect } from "vitest";
import {
  createJobSchema,
  importJobSchema,
  jobResponseSchema,
  jobPlatformEnum,
  type CreateJobInput,
  type JobPlatform,
} from "./job";

describe("Job Validation Schemas", () => {
  describe("jobPlatformEnum", () => {
    it("should accept valid platforms", () => {
      const validPlatforms: JobPlatform[] = [
        "manual",
        "linkedin",
        "indeed",
        "glassdoor",
        "greenhouse",
        "lever",
        "workday",
        "icims",
        "smartrecruiters",
      ];

      validPlatforms.forEach((platform) => {
        const result = jobPlatformEnum.safeParse(platform);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid platforms", () => {
      const result = jobPlatformEnum.safeParse("invalid_platform");
      expect(result.success).toBe(false);
    });
  });

  describe("createJobSchema", () => {
    describe("required fields", () => {
      it("should require title", () => {
        const result = createJobSchema.safeParse({
          companyName: "Test Co",
          description: "A job description that is long enough",
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain("title");
        }
      });

      it("should require companyName", () => {
        const result = createJobSchema.safeParse({
          title: "Software Engineer",
          description: "A job description that is long enough",
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain("companyName");
        }
      });

      it("should require description with minimum length", () => {
        const result = createJobSchema.safeParse({
          title: "Software Engineer",
          companyName: "Test Co",
          description: "short",
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain("description");
        }
      });
    });

    describe("valid input", () => {
      it("should accept valid minimal input", () => {
        const input = {
          title: "Software Engineer",
          companyName: "Test Company",
          description: "This is a valid job description with enough characters",
        };
        const result = createJobSchema.safeParse(input);
        expect(result.success).toBe(true);
      });

      it("should accept valid complete input", () => {
        const input = {
          title: "Senior Software Engineer",
          companyName: "Acme Corporation",
          location: "San Francisco, CA",
          description:
            "This is a comprehensive job description for a senior role.",
          requirements: ["5+ years experience", "React expertise"],
          skills: ["TypeScript", "React", "Node.js"],
          salary: "$150,000 - $200,000",
          platform: "linkedin" as const,
          externalId: "ext-123",
          url: "https://linkedin.com/jobs/view/123",
        };
        const result = createJobSchema.safeParse(input);
        expect(result.success).toBe(true);
      });
    });

    describe("field validation", () => {
      it("should reject title exceeding max length", () => {
        const result = createJobSchema.safeParse({
          title: "a".repeat(201),
          companyName: "Test Co",
          description: "Valid description here with enough characters",
        });
        expect(result.success).toBe(false);
      });

      it("should reject companyName exceeding max length", () => {
        const result = createJobSchema.safeParse({
          title: "Engineer",
          companyName: "a".repeat(201),
          description: "Valid description here with enough characters",
        });
        expect(result.success).toBe(false);
      });

      it("should reject location exceeding max length", () => {
        const result = createJobSchema.safeParse({
          title: "Engineer",
          companyName: "Test Co",
          description: "Valid description here with enough characters",
          location: "a".repeat(201),
        });
        expect(result.success).toBe(false);
      });

      it("should reject description exceeding max length", () => {
        const result = createJobSchema.safeParse({
          title: "Engineer",
          companyName: "Test Co",
          description: "a".repeat(50001),
        });
        expect(result.success).toBe(false);
      });

      it("should reject salary exceeding max length", () => {
        const result = createJobSchema.safeParse({
          title: "Engineer",
          companyName: "Test Co",
          description: "Valid description here with enough characters",
          salary: "a".repeat(101),
        });
        expect(result.success).toBe(false);
      });
    });

    describe("optional fields and transforms", () => {
      it("should default platform to manual", () => {
        const result = createJobSchema.parse({
          title: "Engineer",
          companyName: "Test Co",
          description: "Valid description here with enough characters",
        });
        expect(result.platform).toBe("manual");
      });

      it("should default requirements to empty array", () => {
        const result = createJobSchema.parse({
          title: "Engineer",
          companyName: "Test Co",
          description: "Valid description here with enough characters",
        });
        expect(result.requirements).toEqual([]);
      });

      it("should default skills to empty array", () => {
        const result = createJobSchema.parse({
          title: "Engineer",
          companyName: "Test Co",
          description: "Valid description here with enough characters",
        });
        expect(result.skills).toEqual([]);
      });

      it("should transform empty location to undefined", () => {
        const result = createJobSchema.parse({
          title: "Engineer",
          companyName: "Test Co",
          description: "Valid description here with enough characters",
          location: "",
        });
        expect(result.location).toBeUndefined();
      });

      it("should transform empty salary to undefined", () => {
        const result = createJobSchema.parse({
          title: "Engineer",
          companyName: "Test Co",
          description: "Valid description here with enough characters",
          salary: "",
        });
        expect(result.salary).toBeUndefined();
      });

      it("should transform empty url to undefined", () => {
        const result = createJobSchema.parse({
          title: "Engineer",
          companyName: "Test Co",
          description: "Valid description here with enough characters",
          url: "",
        });
        expect(result.url).toBeUndefined();
      });

      it("should transform invalid url to undefined", () => {
        const result = createJobSchema.parse({
          title: "Engineer",
          companyName: "Test Co",
          description: "Valid description here with enough characters",
          url: "not-a-valid-url",
        });
        expect(result.url).toBeUndefined();
      });

      it("should accept valid url", () => {
        const result = createJobSchema.parse({
          title: "Engineer",
          companyName: "Test Co",
          description: "Valid description here with enough characters",
          url: "https://example.com/job/123",
        });
        expect(result.url).toBe("https://example.com/job/123");
      });
    });

    describe("type inference", () => {
      it("should have correct output type", () => {
        const input = {
          title: "Engineer",
          companyName: "Test Co",
          description: "Valid description here with enough characters",
        };
        const result: CreateJobInput = createJobSchema.parse(input);
        expect(result.title).toBe("Engineer");
        expect(result.companyName).toBe("Test Co");
      });
    });
  });

  describe("importJobSchema", () => {
    it("should require a valid URL", () => {
      const result = importJobSchema.safeParse({ url: "not-a-url" });
      expect(result.success).toBe(false);
    });

    it("should accept a valid URL", () => {
      const result = importJobSchema.safeParse({
        url: "https://linkedin.com/jobs/view/123",
      });
      expect(result.success).toBe(true);
    });

    it("should reject missing URL", () => {
      const result = importJobSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe("jobResponseSchema", () => {
    it("should validate a complete job response", () => {
      const response = {
        id: "job-123",
        platform: "linkedin",
        externalId: "ext-456",
        title: "Software Engineer",
        companyId: "company-789",
        companyName: "Test Company",
        location: "Remote",
        description: "Job description here",
        requirements: ["Req 1", "Req 2"],
        skills: ["Skill 1", "Skill 2"],
        salary: "$100k - $150k",
        postedAt: "2023-11-14T22:13:20.000Z",
        cachedAt: "2023-11-14T22:13:21.000Z",
        createdAt: "2023-11-14T22:13:22.000Z",
      };
      const result = jobResponseSchema.safeParse(response);
      expect(result.success).toBe(true);
    });

    it("should allow nullable fields", () => {
      const response = {
        id: "job-123",
        platform: "manual",
        externalId: null,
        title: "Software Engineer",
        companyId: null,
        companyName: null,
        location: null,
        description: null,
        requirements: null,
        skills: null,
        salary: null,
        postedAt: null,
        cachedAt: null,
        createdAt: null,
      };
      const result = jobResponseSchema.safeParse(response);
      expect(result.success).toBe(true);
    });

    it("should require id field", () => {
      const response = {
        platform: "manual",
        title: "Software Engineer",
      };
      const result = jobResponseSchema.safeParse(response);
      expect(result.success).toBe(false);
    });

    it("should require valid platform", () => {
      const response = {
        id: "job-123",
        platform: "invalid",
        title: "Software Engineer",
      };
      const result = jobResponseSchema.safeParse(response);
      expect(result.success).toBe(false);
    });
  });
});
