import { describe, it, expect, vi, beforeEach } from "vitest";
import { transformApifyJobs, transformApifyJob, toJobInsert } from "./transform";
import type { ApifyLinkedInJob, LinkedInJobResult } from "./types";

// Mock uuid
vi.mock("uuid", () => ({
  v4: () => "mock-uuid-1234",
}));

describe("transformApifyJob", () => {
  it("should return null if no title", () => {
    const raw: ApifyLinkedInJob = { company: "Acme" };
    expect(transformApifyJob(raw)).toBeNull();
  });

  it("should return null if no company", () => {
    const raw: ApifyLinkedInJob = { title: "Engineer" };
    expect(transformApifyJob(raw)).toBeNull();
  });

  it("should extract title from 'title' field", () => {
    const raw: ApifyLinkedInJob = { title: "Software Engineer", company: "Acme" };
    const result = transformApifyJob(raw);
    expect(result?.title).toBe("Software Engineer");
  });

  it("should extract title from 'jobTitle' fallback", () => {
    const raw: ApifyLinkedInJob = { jobTitle: "Senior Dev", company: "Acme" };
    const result = transformApifyJob(raw);
    expect(result?.title).toBe("Senior Dev");
  });

  it("should extract company from 'company' field", () => {
    const raw: ApifyLinkedInJob = { title: "Dev", company: "Acme Corp" };
    const result = transformApifyJob(raw);
    expect(result?.companyName).toBe("Acme Corp");
  });

  it("should extract company from 'companyName' fallback", () => {
    const raw: ApifyLinkedInJob = { title: "Dev", companyName: "BigCorp" };
    const result = transformApifyJob(raw);
    expect(result?.companyName).toBe("BigCorp");
  });

  it("should extract externalId from jobId", () => {
    const raw: ApifyLinkedInJob = { title: "Dev", company: "Acme", jobId: "12345" };
    const result = transformApifyJob(raw);
    expect(result?.externalId).toBe("12345");
  });

  it("should extract externalId from job_id fallback", () => {
    const raw: ApifyLinkedInJob = { title: "Dev", company: "Acme", job_id: "67890" };
    const result = transformApifyJob(raw);
    expect(result?.externalId).toBe("67890");
  });

  it("should extract externalId from URL pattern", () => {
    const raw: ApifyLinkedInJob = {
      title: "Dev",
      company: "Acme",
      link: "https://linkedin.com/jobs/view/123456789",
    };
    const result = transformApifyJob(raw);
    expect(result?.externalId).toBe("123456789");
  });

  it("should extract externalId from jobUrl", () => {
    const raw: ApifyLinkedInJob = {
      title: "Dev",
      company: "Acme",
      jobUrl: "https://linkedin.com/jobs/view/987654321",
    };
    const result = transformApifyJob(raw);
    expect(result?.externalId).toBe("987654321");
  });

  it("should generate UUID for missing externalId", () => {
    const raw: ApifyLinkedInJob = { title: "Dev", company: "Acme" };
    const result = transformApifyJob(raw);
    expect(result?.externalId).toBe("mock-uuid-1234");
  });

  it("should extract location from 'location' field", () => {
    const raw: ApifyLinkedInJob = { title: "Dev", company: "Acme", location: "San Francisco" };
    const result = transformApifyJob(raw);
    expect(result?.location).toBe("San Francisco");
  });

  it("should extract location from 'jobLocation' fallback", () => {
    const raw: ApifyLinkedInJob = { title: "Dev", company: "Acme", jobLocation: "NYC" };
    const result = transformApifyJob(raw);
    expect(result?.location).toBe("NYC");
  });

  it("should return null for missing location", () => {
    const raw: ApifyLinkedInJob = { title: "Dev", company: "Acme" };
    const result = transformApifyJob(raw);
    expect(result?.location).toBeNull();
  });

  it("should extract salary from 'salary' field", () => {
    const raw: ApifyLinkedInJob = { title: "Dev", company: "Acme", salary: "$150k-$200k" };
    const result = transformApifyJob(raw);
    expect(result?.salary).toBe("$150k-$200k");
  });

  it("should extract salary from 'salaryInfo' fallback", () => {
    const raw: ApifyLinkedInJob = { title: "Dev", company: "Acme", salaryInfo: "$100k" };
    const result = transformApifyJob(raw);
    expect(result?.salary).toBe("$100k");
  });

  it("should extract salary from 'job_salary_info' fallback", () => {
    const raw: ApifyLinkedInJob = { title: "Dev", company: "Acme", job_salary_info: "$120k" };
    const result = transformApifyJob(raw);
    expect(result?.salary).toBe("$120k");
  });

  it("should extract postedAt from 'postedTime'", () => {
    const raw: ApifyLinkedInJob = { title: "Dev", company: "Acme", postedTime: "2 hours ago" };
    const result = transformApifyJob(raw);
    expect(result?.postedAt).toBe("2 hours ago");
  });

  it("should extract postedAt from 'postedAt' field", () => {
    const raw: ApifyLinkedInJob = { title: "Dev", company: "Acme", postedAt: "1 day ago" };
    const result = transformApifyJob(raw);
    expect(result?.postedAt).toBe("1 day ago");
  });

  it("should extract postedAt from 'publishedAt' fallback", () => {
    const raw: ApifyLinkedInJob = { title: "Dev", company: "Acme", publishedAt: "3 days ago" };
    const result = transformApifyJob(raw);
    expect(result?.postedAt).toBe("3 days ago");
  });

  it("should extract postedAt from 'job_published_at' fallback", () => {
    const raw: ApifyLinkedInJob = { title: "Dev", company: "Acme", job_published_at: "1 week ago" };
    const result = transformApifyJob(raw);
    expect(result?.postedAt).toBe("1 week ago");
  });

  it("should sanitize description HTML", () => {
    const raw: ApifyLinkedInJob = {
      title: "Dev",
      company: "Acme",
      description: "<p>Job <b>description</b>&nbsp;here</p>",
    };
    const result = transformApifyJob(raw);
    expect(result?.description).toBe("Job description here");
  });

  it("should extract description from 'descriptionText' fallback", () => {
    const raw: ApifyLinkedInJob = {
      title: "Dev",
      company: "Acme",
      descriptionText: "Job description text",
    };
    const result = transformApifyJob(raw);
    expect(result?.description).toBe("Job description text");
  });

  it("should extract description from 'description_text' fallback", () => {
    const raw: ApifyLinkedInJob = {
      title: "Dev",
      company: "Acme",
      description_text: "Job description from snake case",
    };
    const result = transformApifyJob(raw);
    expect(result?.description).toBe("Job description from snake case");
  });

  it("should extract URL from 'link' field", () => {
    const raw: ApifyLinkedInJob = { title: "Dev", company: "Acme", link: "https://linkedin.com/job/1" };
    const result = transformApifyJob(raw);
    expect(result?.url).toBe("https://linkedin.com/job/1");
  });

  it("should extract URL from 'jobUrl' fallback", () => {
    const raw: ApifyLinkedInJob = { title: "Dev", company: "Acme", jobUrl: "https://linkedin.com/job/2" };
    const result = transformApifyJob(raw);
    expect(result?.url).toBe("https://linkedin.com/job/2");
  });

  it("should extract URL from 'url' fallback", () => {
    const raw: ApifyLinkedInJob = { title: "Dev", company: "Acme", url: "https://linkedin.com/job/3" };
    const result = transformApifyJob(raw);
    expect(result?.url).toBe("https://linkedin.com/job/3");
  });

  it("should handle HTML entities in description", () => {
    const raw: ApifyLinkedInJob = {
      title: "Dev",
      company: "Acme",
      description: "Test &amp; verify &lt;data&gt; with &quot;quotes&quot; and &#39;apostrophes&#39;",
    };
    const result = transformApifyJob(raw);
    expect(result?.description).toBe("Test & verify <data> with \"quotes\" and 'apostrophes'");
  });

  it("should normalize whitespace in description", () => {
    const raw: ApifyLinkedInJob = {
      title: "Dev",
      company: "Acme",
      description: "Multiple   spaces   and\n\n\n\nmany newlines",
    };
    const result = transformApifyJob(raw);
    // Whitespace is normalized to single spaces
    expect(result?.description).toBe("Multiple spaces and many newlines");
  });
});

describe("transformApifyJobs", () => {
  it("should transform array and filter nulls", () => {
    const rawJobs: ApifyLinkedInJob[] = [
      { title: "Dev", company: "Acme" },
      { title: "Only title" }, // Will be null (no company)
      { title: "Engineer", company: "BigCorp" },
    ];
    const result = transformApifyJobs(rawJobs);
    expect(result).toHaveLength(2);
  });

  it("should handle empty array", () => {
    const result = transformApifyJobs([]);
    expect(result).toHaveLength(0);
  });

  it("should filter out jobs without title", () => {
    const rawJobs: ApifyLinkedInJob[] = [
      { company: "Acme" }, // No title
      { title: "Dev", company: "BigCorp" },
    ];
    const result = transformApifyJobs(rawJobs);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Dev");
  });

  it("should filter out jobs without company", () => {
    const rawJobs: ApifyLinkedInJob[] = [
      { title: "Dev" }, // No company
      { title: "Engineer", company: "BigCorp" },
    ];
    const result = transformApifyJobs(rawJobs);
    expect(result).toHaveLength(1);
    expect(result[0].companyName).toBe("BigCorp");
  });
});

describe("toJobInsert", () => {
  it("should convert to database format", () => {
    const job: LinkedInJobResult = {
      id: "uuid-1",
      externalId: "ext-123",
      title: "Software Engineer",
      companyName: "Acme Corp",
      location: "San Francisco",
      salary: "$150k",
      postedAt: "2 hours ago",
      description: "Great job",
      url: "https://linkedin.com/job/1",
    };

    const result = toJobInsert(job);
    expect(result.platform).toBe("linkedin");
    expect(result.externalId).toBe("ext-123");
    expect(result.title).toBe("Software Engineer");
    expect(result.companyName).toBe("Acme Corp");
    expect(result.location).toBe("San Francisco");
    expect(result.description).toBe("Great job");
    expect(result.salary).toEqual({ raw: "$150k" });
    expect(result.skills).toEqual([]);
    expect(result.requirements).toEqual([]);
  });

  it("should handle null salary", () => {
    const job: LinkedInJobResult = {
      id: "uuid-1",
      externalId: "ext-123",
      title: "Dev",
      companyName: "Acme",
      location: null,
      salary: null,
      postedAt: null,
      description: null,
      url: null,
    };

    const result = toJobInsert(job);
    expect(result.salary).toBeNull();
  });

  it("should parse '2 hours ago' posted time", () => {
    const job: LinkedInJobResult = {
      id: "uuid-1",
      externalId: "ext-123",
      title: "Dev",
      companyName: "Acme",
      location: null,
      salary: null,
      postedAt: "2 hours ago",
      description: null,
      url: null,
    };

    const result = toJobInsert(job);
    expect(result.postedAt).toBeInstanceOf(Date);
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    expect(Math.abs(result.postedAt!.getTime() - twoHoursAgo)).toBeLessThan(1000);
  });

  it("should parse '1 day ago' posted time", () => {
    const job: LinkedInJobResult = {
      id: "uuid-1",
      externalId: "ext-123",
      title: "Dev",
      companyName: "Acme",
      location: null,
      salary: null,
      postedAt: "1 day ago",
      description: null,
      url: null,
    };

    const result = toJobInsert(job);
    expect(result.postedAt).toBeInstanceOf(Date);
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    expect(Math.abs(result.postedAt!.getTime() - oneDayAgo)).toBeLessThan(1000);
  });

  it("should parse '3 weeks ago' posted time", () => {
    const job: LinkedInJobResult = {
      id: "uuid-1",
      externalId: "ext-123",
      title: "Dev",
      companyName: "Acme",
      location: null,
      salary: null,
      postedAt: "3 weeks ago",
      description: null,
      url: null,
    };

    const result = toJobInsert(job);
    expect(result.postedAt).toBeInstanceOf(Date);
    const threeWeeksAgo = Date.now() - 3 * 7 * 24 * 60 * 60 * 1000;
    expect(Math.abs(result.postedAt!.getTime() - threeWeeksAgo)).toBeLessThan(1000);
  });

  it("should parse '1 month ago' posted time", () => {
    const job: LinkedInJobResult = {
      id: "uuid-1",
      externalId: "ext-123",
      title: "Dev",
      companyName: "Acme",
      location: null,
      salary: null,
      postedAt: "1 month ago",
      description: null,
      url: null,
    };

    const result = toJobInsert(job);
    expect(result.postedAt).toBeInstanceOf(Date);
  });

  it("should return null for unparseable time strings", () => {
    const job: LinkedInJobResult = {
      id: "uuid-1",
      externalId: "ext-123",
      title: "Dev",
      companyName: "Acme",
      location: null,
      salary: null,
      postedAt: "some random text",
      description: null,
      url: null,
    };

    const result = toJobInsert(job);
    expect(result.postedAt).toBeNull();
  });

  it("should handle null postedAt", () => {
    const job: LinkedInJobResult = {
      id: "uuid-1",
      externalId: "ext-123",
      title: "Dev",
      companyName: "Acme",
      location: null,
      salary: null,
      postedAt: null,
      description: null,
      url: null,
    };

    const result = toJobInsert(job);
    expect(result.postedAt).toBeNull();
  });
});
