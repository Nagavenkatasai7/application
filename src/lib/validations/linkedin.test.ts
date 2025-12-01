import { describe, it, expect } from "vitest";
import {
  linkedInSearchSchema,
  linkedInJobResultSchema,
  linkedInSearchResponseSchema,
  getTimeFrameLabel,
  validateSearchParams,
  type LinkedInSearchInput,
} from "./linkedin";
import type { TimeFrame } from "@/lib/linkedin/types";

describe("linkedInSearchSchema", () => {
  describe("keywords validation", () => {
    it("should accept valid keywords", () => {
      const result = linkedInSearchSchema.parse({
        keywords: "Software Engineer",
        timeFrame: "24h",
      });
      expect(result.keywords).toBe("Software Engineer");
    });

    it("should trim keywords", () => {
      const result = linkedInSearchSchema.parse({
        keywords: "  Developer  ",
        timeFrame: "24h",
      });
      expect(result.keywords).toBe("Developer");
    });

    it("should reject keywords too short", () => {
      expect(() =>
        linkedInSearchSchema.parse({
          keywords: "A",
          timeFrame: "24h",
        })
      ).toThrow("Job title must be at least 2 characters");
    });

    it("should reject keywords too long", () => {
      const longKeywords = "a".repeat(101);
      expect(() =>
        linkedInSearchSchema.parse({
          keywords: longKeywords,
          timeFrame: "24h",
        })
      ).toThrow("Job title must be less than 100 characters");
    });
  });

  describe("location validation", () => {
    it("should accept valid location", () => {
      const result = linkedInSearchSchema.parse({
        keywords: "Developer",
        location: "San Francisco, CA",
        timeFrame: "24h",
      });
      expect(result.location).toBe("San Francisco, CA");
    });

    it("should trim location", () => {
      const result = linkedInSearchSchema.parse({
        keywords: "Developer",
        location: "  New York  ",
        timeFrame: "24h",
      });
      expect(result.location).toBe("New York");
    });

    it("should transform empty string to undefined", () => {
      const result = linkedInSearchSchema.parse({
        keywords: "Developer",
        location: "",
        timeFrame: "24h",
      });
      expect(result.location).toBeUndefined();
    });

    it("should reject location too long", () => {
      const longLocation = "a".repeat(101);
      expect(() =>
        linkedInSearchSchema.parse({
          keywords: "Developer",
          location: longLocation,
          timeFrame: "24h",
        })
      ).toThrow("Location must be less than 100 characters");
    });

    it("should allow undefined location", () => {
      const result = linkedInSearchSchema.parse({
        keywords: "Developer",
        timeFrame: "24h",
      });
      expect(result.location).toBeUndefined();
    });
  });

  describe("timeFrame validation", () => {
    // LinkedIn time filters: 1h, 24h, 1w, 1m
    it.each(["1h", "24h", "1w", "1m"] as const)(
      "should accept timeFrame: %s",
      (timeFrame) => {
        const result = linkedInSearchSchema.parse({
          keywords: "Developer",
          timeFrame,
        });
        expect(result.timeFrame).toBe(timeFrame);
      }
    );

    it("should reject invalid timeFrame", () => {
      expect(() =>
        linkedInSearchSchema.parse({
          keywords: "Developer",
          timeFrame: "invalid",
        })
      ).toThrow();
    });
  });

  describe("limit validation", () => {
    it("should accept valid limit", () => {
      const result = linkedInSearchSchema.parse({
        keywords: "Developer",
        timeFrame: "24h",
        limit: 25,
      });
      expect(result.limit).toBe(25);
    });

    it("should coerce string limit to number", () => {
      const result = linkedInSearchSchema.parse({
        keywords: "Developer",
        timeFrame: "24h",
        limit: "10" as unknown as number,
      });
      expect(result.limit).toBe(10);
    });

    it("should reject limit below 1", () => {
      expect(() =>
        linkedInSearchSchema.parse({
          keywords: "Developer",
          timeFrame: "24h",
          limit: 0,
        })
      ).toThrow();
    });

    it("should reject limit above 25", () => {
      expect(() =>
        linkedInSearchSchema.parse({
          keywords: "Developer",
          timeFrame: "24h",
          limit: 26,
        })
      ).toThrow();
    });

    it("should allow undefined limit", () => {
      const result = linkedInSearchSchema.parse({
        keywords: "Developer",
        timeFrame: "24h",
      });
      expect(result.limit).toBeUndefined();
    });
  });
});

describe("linkedInJobResultSchema", () => {
  it("should accept valid job result", () => {
    const job = {
      id: "123",
      externalId: "ext-456",
      title: "Software Engineer",
      companyName: "Acme Corp",
      location: "San Francisco",
      salary: "$100k-$150k",
      postedAt: "2 hours ago",
      description: "Great job",
      url: "https://linkedin.com/jobs/123",
    };
    const result = linkedInJobResultSchema.parse(job);
    expect(result).toEqual(job);
  });

  it("should accept job result with null optional fields", () => {
    const job = {
      id: "123",
      externalId: "ext-456",
      title: "Software Engineer",
      companyName: "Acme Corp",
      location: null,
      salary: null,
      postedAt: null,
      description: null,
      url: null,
    };
    const result = linkedInJobResultSchema.parse(job);
    expect(result.location).toBeNull();
    expect(result.salary).toBeNull();
    expect(result.postedAt).toBeNull();
    expect(result.description).toBeNull();
    expect(result.url).toBeNull();
  });

  it("should reject job without required fields", () => {
    expect(() =>
      linkedInJobResultSchema.parse({
        id: "123",
        title: "Engineer",
      })
    ).toThrow();
  });
});

describe("linkedInSearchResponseSchema", () => {
  it("should accept successful response with jobs", () => {
    const response = {
      success: true,
      data: {
        jobs: [
          {
            id: "1",
            externalId: "ext-1",
            title: "Developer",
            companyName: "Company",
            location: null,
            salary: null,
            postedAt: null,
            description: null,
            url: null,
          },
        ],
        totalCount: 1,
        searchParams: {
          keywords: "Developer",
          location: null,
          timeFrame: "24h" as const,
        },
      },
    };
    const result = linkedInSearchResponseSchema.parse(response);
    expect(result.success).toBe(true);
    expect(result.data?.jobs).toHaveLength(1);
  });

  it("should accept error response", () => {
    const response = {
      success: false,
      error: {
        code: "SEARCH_ERROR",
        message: "Failed to search",
      },
    };
    const result = linkedInSearchResponseSchema.parse(response);
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("SEARCH_ERROR");
  });

  it("should accept response without data or error", () => {
    const response = { success: false };
    const result = linkedInSearchResponseSchema.parse(response);
    expect(result.success).toBe(false);
    expect(result.data).toBeUndefined();
    expect(result.error).toBeUndefined();
  });
});

describe("getTimeFrameLabel", () => {
  it("should return 'Past hour' for '1h'", () => {
    expect(getTimeFrameLabel("1h")).toBe("Past hour");
  });

  it("should return 'Past 24 hours' for '24h'", () => {
    expect(getTimeFrameLabel("24h")).toBe("Past 24 hours");
  });

  it("should return 'Past week' for '1w'", () => {
    expect(getTimeFrameLabel("1w")).toBe("Past week");
  });

  it("should return 'Past month' for '1m'", () => {
    expect(getTimeFrameLabel("1m")).toBe("Past month");
  });

  it("should return 'Unknown' for invalid timeFrame", () => {
    // Cast to TimeFrame to test the fallback behavior
    expect(getTimeFrameLabel("invalid" as TimeFrame)).toBe("Unknown");
  });
});

describe("validateSearchParams", () => {
  it("should return validated params for valid input", () => {
    const params = {
      keywords: "Software Engineer",
      location: "San Francisco",
      timeFrame: "24h",
    };
    const result = validateSearchParams(params);
    expect(result.keywords).toBe("Software Engineer");
    expect(result.location).toBe("San Francisco");
    expect(result.timeFrame).toBe("24h");
  });

  it("should transform empty location to undefined", () => {
    const params = {
      keywords: "Developer",
      location: "",
      timeFrame: "1w",
    };
    const result = validateSearchParams(params);
    expect(result.location).toBeUndefined();
  });

  it("should throw for invalid params", () => {
    expect(() =>
      validateSearchParams({
        keywords: "A", // Too short
        timeFrame: "24h",
      })
    ).toThrow();
  });

  it("should throw for missing required fields", () => {
    expect(() =>
      validateSearchParams({
        location: "San Francisco",
      })
    ).toThrow();
  });
});
