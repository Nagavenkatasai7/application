/**
 * LinkedIn Job Scraping Types
 *
 * Types for Apify LinkedIn Jobs Scraper integration
 * Based on bebity/linkedin-jobs-scraper actor input schema
 */

// =============================================================================
// TIME FRAME OPTIONS (publishedAt)
// =============================================================================

// LinkedIn time filters use seconds-based values (f_TPR parameter):
// Note: Apify bebity/linkedin-jobs-scraper only supports these values
// - "" = Any time
// - r86400 = 24 hours (86,400 seconds)
// - r604800 = 1 week (604,800 seconds)
// - r2592000 = 1 month (2,592,000 seconds)
export type TimeFrame = "" | "24h" | "1w" | "1m";

export const TIME_FRAME_OPTIONS: Record<
  TimeFrame,
  { label: string; apiValue: string }
> = {
  "": { label: "Any time", apiValue: "" },
  "24h": { label: "Past 24 hours", apiValue: "r86400" },
  "1w": { label: "Past week", apiValue: "r604800" },
  "1m": { label: "Past month", apiValue: "r2592000" },
};

export const DEFAULT_TIME_FRAME: TimeFrame = "";

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
export type ExperienceLevel =
  | "internship"
  | "entry_level"
  | "associate"
  | "mid_senior"
  | "director"
  | "executive";

export const EXPERIENCE_LEVEL_OPTIONS: Record<
  ExperienceLevel,
  { label: string; apiValue: string; description: string }
> = {
  internship: {
    label: "Internship",
    apiValue: "1",
    description: "For students and recent graduates"
  },
  entry_level: {
    label: "Entry Level",
    apiValue: "2",
    description: "0-2 years of experience"
  },
  associate: {
    label: "Associate",
    apiValue: "3",
    description: "2-5 years of experience"
  },
  mid_senior: {
    label: "Mid-Senior Level",
    apiValue: "4",
    description: "5+ years of experience"
  },
  director: {
    label: "Director",
    apiValue: "5",
    description: "Leadership roles"
  },
  executive: {
    label: "Executive",
    apiValue: "6",
    description: "C-level positions"
  },
};

// =============================================================================
// WORKPLACE TYPE OPTIONS (onSiteRemote)
// =============================================================================

// LinkedIn workplace type filters:
// - 1 = On-site
// - 2 = Remote
// - 3 = Hybrid
export type WorkplaceType = "on_site" | "remote" | "hybrid";

export const WORKPLACE_TYPE_OPTIONS: Record<
  WorkplaceType,
  { label: string; apiValue: string; description: string }
> = {
  on_site: {
    label: "On-Site",
    apiValue: "1",
    description: "Work from office"
  },
  remote: {
    label: "Remote",
    apiValue: "2",
    description: "Work from anywhere"
  },
  hybrid: {
    label: "Hybrid",
    apiValue: "3",
    description: "Mix of office and remote"
  },
};

// =============================================================================
// JOB TYPE OPTIONS
// =============================================================================

// LinkedIn job type filters (f_JT parameter):
// - F = Full-time
// - P = Part-time
// - C = Contract
// - T = Temporary
// - I = Internship
// - V = Volunteer
export type JobType =
  | "full_time"
  | "part_time"
  | "contract"
  | "temporary"
  | "internship"
  | "volunteer";

export const JOB_TYPE_OPTIONS: Record<
  JobType,
  { label: string; apiValue: string; description: string }
> = {
  full_time: {
    label: "Full-time",
    apiValue: "F",
    description: "Permanent full-time position"
  },
  part_time: {
    label: "Part-time",
    apiValue: "P",
    description: "Less than 40 hours/week"
  },
  contract: {
    label: "Contract",
    apiValue: "C",
    description: "Fixed-term contract"
  },
  temporary: {
    label: "Temporary",
    apiValue: "T",
    description: "Short-term position"
  },
  internship: {
    label: "Internship",
    apiValue: "I",
    description: "Internship program"
  },
  volunteer: {
    label: "Volunteer",
    apiValue: "V",
    description: "Unpaid volunteer work"
  },
};

// =============================================================================
// SEARCH PARAMETERS
// =============================================================================

export interface LinkedInSearchParams {
  // Required
  keywords: string;

  // Optional filters
  location?: string;
  companyName?: string[];
  companyId?: string[];

  // Time filter
  timeFrame?: TimeFrame;

  // Job filters
  experienceLevel?: ExperienceLevel;
  workplaceType?: WorkplaceType;
  jobType?: JobType;

  // Pagination
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
