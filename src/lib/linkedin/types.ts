/**
 * LinkedIn Job Scraping Types
 *
 * Types for Apify LinkedIn Jobs Scraper integration
 */

// =============================================================================
// TIME FRAME OPTIONS
// =============================================================================

export type TimeFrame = "1h" | "24h" | "3d" | "1w" | "1m";

export const TIME_FRAME_OPTIONS: Record<
  TimeFrame,
  { label: string; value: number; unit: string }
> = {
  "1h": { label: "Past hour", value: 1, unit: "hour" },
  "24h": { label: "Past 24 hours", value: 24, unit: "hours" },
  "3d": { label: "Past 3 days", value: 3, unit: "days" },
  "1w": { label: "Past week", value: 7, unit: "days" },
  "1m": { label: "Past month", value: 30, unit: "days" },
};

export const DEFAULT_TIME_FRAME: TimeFrame = "1h";

// =============================================================================
// SEARCH PARAMETERS
// =============================================================================

export interface LinkedInSearchParams {
  keywords: string;
  location?: string;
  timeFrame: TimeFrame;
  limit?: number;
}

// =============================================================================
// APIFY API TYPES
// =============================================================================

/**
 * Raw job data from Apify LinkedIn Jobs Scraper
 * Based on bebity/linkedin-jobs-scraper output
 */
export interface ApifyLinkedInJob {
  // Core job info
  title?: string;
  jobTitle?: string;
  company?: string;
  companyName?: string;
  location?: string;
  jobLocation?: string;

  // Job identifiers
  jobId?: string;
  job_id?: string;
  link?: string;
  jobUrl?: string;
  url?: string;

  // Description & details
  description?: string;
  descriptionText?: string;
  description_text?: string;

  // Salary info
  salary?: string;
  salaryInfo?: string;
  job_salary_info?: string;

  // Posted time
  postedTime?: string;
  postedAt?: string;
  publishedAt?: string;
  job_published_at?: string;

  // Additional metadata
  applicants?: number;
  applicantsCount?: number;
  employmentType?: string;
  experienceLevel?: string;
  industries?: string[];
}

/**
 * Apify actor run response
 */
export interface ApifyRunResponse {
  data: {
    id: string;
    status: string;
    defaultDatasetId: string;
    defaultKeyValueStoreId: string;
  };
}

/**
 * Apify dataset items response
 */
export interface ApifyDatasetResponse<T> {
  data: T[];
}

// =============================================================================
// NORMALIZED JOB RESULT
// =============================================================================

/**
 * Normalized job result for UI display
 */
export interface LinkedInJobResult {
  id: string;
  externalId: string;
  title: string;
  companyName: string;
  location: string | null;
  salary: string | null;
  postedAt: string | null;
  description: string | null;
  url: string | null;
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface LinkedInSearchResponse {
  success: boolean;
  data?: {
    jobs: LinkedInJobResult[];
    totalCount: number;
    searchParams: {
      keywords: string;
      location: string | null;
      timeFrame: TimeFrame;
    };
  };
  error?: {
    code: string;
    message: string;
  };
}
