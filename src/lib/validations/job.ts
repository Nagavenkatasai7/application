import { z } from "zod";

// Job platform enum matching database schema
export const jobPlatformEnum = z.enum([
  "manual",
  "linkedin",
  "indeed",
  "glassdoor",
  "greenhouse",
  "lever",
  "workday",
  "icims",
  "smartrecruiters",
]);

export type JobPlatform = z.infer<typeof jobPlatformEnum>;

// Schema for creating a job manually
export const createJobSchema = z.object({
  title: z
    .string()
    .min(1, "Job title is required")
    .max(200, "Job title must be less than 200 characters"),
  companyName: z
    .string()
    .min(1, "Company name is required")
    .max(200, "Company name must be less than 200 characters"),
  location: z
    .string()
    .max(200, "Location must be less than 200 characters")
    .optional()
    .transform((val) => val || undefined),
  description: z
    .string()
    .min(10, "Job description must be at least 10 characters")
    .max(50000, "Job description is too long"),
  requirements: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  salary: z
    .string()
    .max(100, "Salary must be less than 100 characters")
    .optional()
    .transform((val) => val || undefined),
  platform: jobPlatformEnum.default("manual"),
  externalId: z.string().optional(),
  url: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val === "") return undefined;
      // Only validate if not empty
      try {
        new URL(val);
        return val;
      } catch {
        return undefined;
      }
    }),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;

// Schema for importing a job from URL (future use)
export const importJobSchema = z.object({
  url: z.string().url("Please enter a valid job URL"),
});

export type ImportJobInput = z.infer<typeof importJobSchema>;

// Schema for job response from API
// Note: Date fields are returned as ISO strings from JSON serialization
export const jobResponseSchema = z.object({
  id: z.string(),
  platform: jobPlatformEnum,
  externalId: z.string().nullable(),
  url: z.string().nullable().optional(),
  title: z.string(),
  companyId: z.string().nullable(),
  companyName: z.string().nullable(),
  location: z.string().nullable(),
  description: z.string().nullable(),
  requirements: z.array(z.string()).nullable(),
  skills: z.array(z.string()).nullable(),
  salary: z.string().nullable(),
  postedAt: z.string().nullable(),
  cachedAt: z.string().nullable(),
  createdAt: z.string().nullable(),
});

export type JobResponse = z.infer<typeof jobResponseSchema>;
