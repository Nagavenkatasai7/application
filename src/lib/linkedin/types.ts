/**
 * LinkedIn Job Scraping Types
 *
 * Types for Apify LinkedIn Jobs Scraper integration
 */

// =============================================================================
// TIME FRAME OPTIONS
// =============================================================================

// LinkedIn time filters use seconds-based values (f_TPR parameter):
// Note: Apify bebity/linkedin-jobs-scraper only supports these values
// - r86400 = 24 hours (86,400 seconds)
// - r604800 = 1 week (604,800 seconds)
// - r2592000 = 1 month (2,592,000 seconds)
export type TimeFrame = "24h" | "1w" | "1m";

export const TIME_FRAME_OPTIONS: Record<
  TimeFrame,
  { label: string; value: number; unit: string }
> = {
  "24h": { label: "Past 24 hours", value: 24, unit: "hours" },
  "1w": { label: "Past week", value: 7, unit: "days" },
  "1m": { label: "Past month", value: 30, unit: "days" },
};

export const DEFAULT_TIME_FRAME: TimeFrame = "24h";

// =============================================================================
// EXPERIENCE LEVEL OPTIONS
// =============================================================================

// LinkedIn experience level filters (f_E parameter):
// - 1 = Internship
// - 2 = Entry level
// - 3 = Associate
// - 4 = Mid-Senior level
// - 5 = Director
// - 6 = Executive
export type ExperienceLevel = "internship" | "entry_level" | "associate";

export const EXPERIENCE_LEVEL_OPTIONS: Record<
  ExperienceLevel,
  { label: string; value: string; description: string }
> = {
  internship: {
    label: "Internship",
    value: "1",
    description: "For students and recent graduates seeking internship opportunities"
  },
  entry_level: {
    label: "Entry Level",
    value: "2",
    description: "For freshers with 0-2 years of experience"
  },
  associate: {
    label: "Associate",
    value: "3",
    description: "For professionals with 2-5 years of experience"
  },
};

export const DEFAULT_EXPERIENCE_LEVELS: ExperienceLevel[] = ["internship", "entry_level"];

// =============================================================================
// SEARCH PARAMETERS
// =============================================================================

export interface LinkedInSearchParams {
  keywords: string;
  location?: string;
  timeFrame: TimeFrame;
  limit?: number;
  experienceLevels?: ExperienceLevel[];
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
