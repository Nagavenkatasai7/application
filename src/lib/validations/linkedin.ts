/**
 * LinkedIn Search Validation Schemas
 */

import { z } from "zod";
import { TIME_FRAME_OPTIONS, type TimeFrame } from "@/lib/linkedin/types";

// =============================================================================
// SEARCH REQUEST SCHEMA
// =============================================================================

export const linkedInSearchSchema = z.object({
  keywords: z
    .string()
    .min(2, "Job title must be at least 2 characters")
    .max(100, "Job title must be less than 100 characters")
    .trim(),

  location: z
    .string()
    .max(100, "Location must be less than 100 characters")
    .trim()
    .optional()
    .transform((val) => (val === "" ? undefined : val)),

  // Company names to filter (optional array)
  companyName: z
    .array(z.string().trim())
    .optional()
    .transform((val) => (val && val.length === 0 ? undefined : val)),

  // Company IDs to filter (optional array)
  companyId: z
    .array(z.string().trim())
    .optional()
    .transform((val) => (val && val.length === 0 ? undefined : val)),

  // Time frame filter: "", "24h", "1w", "1m"
  timeFrame: z.enum(["", "24h", "1w", "1m"] as const).optional(),

  // Experience level: internship, entry_level, associate, mid_senior, director, executive
  experienceLevel: z
    .enum(["internship", "entry_level", "associate", "mid_senior", "director", "executive"] as const)
    .optional(),

  // Workplace type: on_site, remote, hybrid
  workplaceType: z
    .enum(["on_site", "remote", "hybrid"] as const)
    .optional(),

  // Job type: full_time, part_time, contract, temporary, internship, volunteer
  jobType: z
    .enum(["full_time", "part_time", "contract", "temporary", "internship", "volunteer"] as const)
    .optional(),

  // Number of results (max 50)
  limit: z.coerce
    .number()
    .min(1)
    .max(50)
    .optional(),
});

// Input type for forms (what the form uses)
export type LinkedInSearchFormData = z.input<typeof linkedInSearchSchema>;

// Output type after validation/transformation (what API receives)
export type LinkedInSearchInput = z.output<typeof linkedInSearchSchema>;

// =============================================================================
// JOB RESULT SCHEMA (for validation of Apify responses)
// =============================================================================

export const linkedInJobResultSchema = z.object({
  id: z.string(),
  externalId: z.string(),
  title: z.string(),
  companyName: z.string(),
  location: z.string().nullable(),
  salary: z.string().nullable(),
  postedAt: z.string().nullable(),
  description: z.string().nullable(),
  url: z.string().nullable(),
});

export type LinkedInJobResultValidated = z.infer<typeof linkedInJobResultSchema>;

// =============================================================================
// API RESPONSE SCHEMA
// =============================================================================

export const linkedInSearchResponseSchema = z.object({
  success: z.boolean(),
  data: z
    .object({
      jobs: z.array(linkedInJobResultSchema),
      totalCount: z.number(),
      searchParams: z.object({
        keywords: z.string(),
        location: z.string().nullable(),
        timeFrame: z.enum(["", "24h", "1w", "1m"] as const),
      }),
    })
    .optional(),
  error: z
    .object({
      code: z.string(),
      message: z.string(),
    })
    .optional(),
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get human-readable label for a time frame
 */
export function getTimeFrameLabel(timeFrame: TimeFrame): string {
  return TIME_FRAME_OPTIONS[timeFrame]?.label || "Unknown";
}

/**
 * Validate search params and return typed result
 */
export function validateSearchParams(params: unknown): LinkedInSearchInput {
  return linkedInSearchSchema.parse(params);
}
