/**
 * LinkedIn Job Data Transformer
 *
 * Transforms raw Apify output to normalized job format
 */

import { v4 as uuidv4 } from "uuid";
import type { ApifyLinkedInJob, LinkedInJobResult } from "./types";

// =============================================================================
// MAIN TRANSFORMER
// =============================================================================

/**
 * Transform an array of raw Apify jobs to normalized format
 */
export function transformApifyJobs(
  rawJobs: ApifyLinkedInJob[]
): LinkedInJobResult[] {
  return rawJobs
    .map(transformApifyJob)
    .filter((job): job is LinkedInJobResult => job !== null);
}

/**
 * Transform a single raw Apify job to normalized format
 */
export function transformApifyJob(
  raw: ApifyLinkedInJob
): LinkedInJobResult | null {
  // Skip if no title
  const title = getTitle(raw);
  if (!title) {
    return null;
  }

  const companyName = getCompanyName(raw);
  if (!companyName) {
    return null;
  }

  return {
    id: uuidv4(),
    externalId: getExternalId(raw),
    title,
    companyName,
    location: getLocation(raw),
    salary: getSalary(raw),
    postedAt: getPostedAt(raw),
    description: getDescription(raw),
    url: getJobUrl(raw),
  };
}

// =============================================================================
// FIELD EXTRACTORS
// =============================================================================

function getTitle(raw: ApifyLinkedInJob): string | null {
  return raw.title || raw.jobTitle || null;
}

function getCompanyName(raw: ApifyLinkedInJob): string | null {
  return raw.company || raw.companyName || null;
}

function getExternalId(raw: ApifyLinkedInJob): string {
  // Try various ID fields
  if (raw.jobId) return raw.jobId;
  if (raw.job_id) return raw.job_id;

  // Extract from URL if available
  const url = raw.link || raw.jobUrl || raw.url;
  if (url) {
    const match = url.match(/jobs\/view\/(\d+)/);
    if (match) return match[1];
  }

  // Fallback to UUID
  return uuidv4();
}

function getLocation(raw: ApifyLinkedInJob): string | null {
  return raw.location || raw.jobLocation || null;
}

function getSalary(raw: ApifyLinkedInJob): string | null {
  return raw.salary || raw.salaryInfo || raw.job_salary_info || null;
}

function getPostedAt(raw: ApifyLinkedInJob): string | null {
  // Return raw posted time string (e.g., "2 hours ago", "1 day ago")
  return (
    raw.postedTime ||
    raw.postedAt ||
    raw.publishedAt ||
    raw.job_published_at ||
    null
  );
}

function getDescription(raw: ApifyLinkedInJob): string | null {
  const description =
    raw.description || raw.descriptionText || raw.description_text;

  if (!description) return null;

  // Sanitize: remove HTML, normalize whitespace
  return sanitizeDescription(description);
}

function getJobUrl(raw: ApifyLinkedInJob): string | null {
  return raw.link || raw.jobUrl || raw.url || null;
}

// =============================================================================
// SANITIZATION
// =============================================================================

/**
 * Sanitize job description text
 */
function sanitizeDescription(text: string): string {
  return (
    text
      // Remove HTML tags
      .replace(/<[^>]*>/g, " ")
      // Fix HTML entities
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      // Normalize whitespace
      .replace(/\s+/g, " ")
      // Limit consecutive newlines
      .replace(/\n{3,}/g, "\n\n")
      .trim()
      // Limit length
      .slice(0, 50000)
  );
}

// =============================================================================
// JOB TO DATABASE FORMAT
// =============================================================================

/**
 * Convert a LinkedInJobResult to database job format
 * Used when user clicks "Add" to save job to library
 */
export function toJobInsert(job: LinkedInJobResult) {
  return {
    platform: "linkedin" as const,
    externalId: job.externalId,
    title: job.title,
    companyName: job.companyName,
    location: job.location,
    description: job.description,
    salary: job.salary ? { raw: job.salary } : null,
    postedAt: job.postedAt ? parsePostedTime(job.postedAt) : null,
    skills: [],
    requirements: [],
  };
}

/**
 * Parse relative time string to Date
 * e.g., "2 hours ago", "1 day ago", "3 weeks ago"
 */
function parsePostedTime(timeStr: string): Date | null {
  const now = new Date();
  const lowerStr = timeStr.toLowerCase();

  // Match patterns like "2 hours ago", "1 day ago"
  const match = lowerStr.match(/(\d+)\s*(hour|day|week|month)s?\s*ago/i);
  if (!match) return null;

  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  const msPerUnit: Record<string, number> = {
    hour: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000,
  };

  const ms = msPerUnit[unit];
  if (!ms) return null;

  return new Date(now.getTime() - value * ms);
}
