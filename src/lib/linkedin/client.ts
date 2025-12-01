/**
 * Apify LinkedIn Jobs Scraper Client
 *
 * Wrapper for the Apify REST API to search LinkedIn jobs
 * Based on bebity/linkedin-jobs-scraper actor
 */

import { getApifyApiKey, isApifyConfigured } from "@/lib/env";
import type {
  LinkedInSearchParams,
  ApifyRunResponse,
  ApifyLinkedInJob,
} from "./types";
import {
  TIME_FRAME_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS,
  WORKPLACE_TYPE_OPTIONS,
  JOB_TYPE_OPTIONS,
} from "./types";

// =============================================================================
// CONSTANTS
// =============================================================================

const APIFY_API_BASE = "https://api.apify.com/v2";
const LINKEDIN_SCRAPER_ACTOR = "bebity~linkedin-jobs-scraper";

// Polling configuration
const POLL_INTERVAL_MS = 3000; // 3 seconds
const MAX_POLL_ATTEMPTS = 60; // 3 minutes max wait

// =============================================================================
// API FUNCTIONS
// =============================================================================

/**
 * Check if Apify is configured and ready to use
 */
export function isLinkedInSearchAvailable(): boolean {
  return isApifyConfigured();
}

/**
 * Search LinkedIn jobs via Apify
 *
 * @param params Search parameters with all filter options
 * @returns Array of raw job results from Apify
 */
export async function searchLinkedInJobs(
  params: LinkedInSearchParams
): Promise<ApifyLinkedInJob[]> {
  if (!isApifyConfigured()) {
    throw new Error("LinkedIn search is not configured. Please add APIFY_API_KEY.");
  }

  const apiKey = getApifyApiKey();

  // Start the actor run
  const runResponse = await startActorRun(apiKey, params);
  const runId = runResponse.data.id;
  const datasetId = runResponse.data.defaultDatasetId;

  // Poll for completion
  await waitForRunCompletion(apiKey, runId);

  // Get results from dataset
  const results = await getDatasetItems(apiKey, datasetId);

  return results;
}

/**
 * Start an Apify actor run
 */
async function startActorRun(
  apiKey: string,
  params: LinkedInSearchParams
): Promise<ApifyRunResponse> {
  const url = `${APIFY_API_BASE}/acts/${LINKEDIN_SCRAPER_ACTOR}/runs`;

  // Build actor input based on search params
  const input = buildActorInput(params);

  // Log input for debugging
  console.log("[Apify] Starting actor run with input:", JSON.stringify(input, null, 2));

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[Apify] API error response:", {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
      url,
    });
    throw new Error(`Apify API error (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  console.log("[Apify] Actor run started:", result.data?.id);
  return result;
}

/**
 * Build actor input from search params
 *
 * Based on bebity/linkedin-jobs-scraper actor input schema:
 * - title: Job title search term
 * - location: Location filter
 * - companyName: Array of company names to filter
 * - companyId: Array of company IDs to filter
 * - publishedAt: Time filter ("", "r86400", "r604800", "r2592000")
 * - rows: Number of results to return (max 50)
 * - onSiteRemote: Workplace type ("1"=On-site, "2"=Remote, "3"=Hybrid)
 * - jobType: Job type ("F"=Full-time, "P"=Part-time, etc.)
 * - experienceLevel: Experience level ("1"-"6")
 * - proxy: Proxy configuration
 */
function buildActorInput(params: LinkedInSearchParams): Record<string, unknown> {
  const {
    keywords,
    location,
    companyName,
    companyId,
    timeFrame,
    limit = 50,
    experienceLevel,
    workplaceType,
    jobType,
  } = params;

  // Build the input object - only include fields that have values
  const input: Record<string, unknown> = {
    // Job title search term (required)
    title: keywords,
    // Location filter
    location: location || "",
    // Number of results (Apify allows up to 50)
    rows: Math.min(limit, 50),
    // Proxy configuration
    proxy: {
      useApifyProxy: true,
    },
  };

  // Add company name filter if provided
  if (companyName && companyName.length > 0) {
    input.companyName = companyName;
  }

  // Add company ID filter if provided
  if (companyId && companyId.length > 0) {
    input.companyId = companyId;
  }

  // Add time filter (publishedAt)
  if (timeFrame && TIME_FRAME_OPTIONS[timeFrame]) {
    input.publishedAt = TIME_FRAME_OPTIONS[timeFrame].apiValue;
  } else {
    // Default to empty string (any time)
    input.publishedAt = "";
  }

  // Add experience level filter
  if (experienceLevel && EXPERIENCE_LEVEL_OPTIONS[experienceLevel]) {
    input.experienceLevel = EXPERIENCE_LEVEL_OPTIONS[experienceLevel].apiValue;
  }

  // Add workplace type filter (onSiteRemote)
  if (workplaceType && WORKPLACE_TYPE_OPTIONS[workplaceType]) {
    input.onSiteRemote = WORKPLACE_TYPE_OPTIONS[workplaceType].apiValue;
  }

  // Add job type filter
  if (jobType && JOB_TYPE_OPTIONS[jobType]) {
    input.jobType = JOB_TYPE_OPTIONS[jobType].apiValue;
  }

  return input;
}

/**
 * Wait for actor run to complete
 */
async function waitForRunCompletion(
  apiKey: string,
  runId: string
): Promise<void> {
  const url = `${APIFY_API_BASE}/actor-runs/${runId}`;

  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!response.ok) {
      throw new Error(`Failed to check run status: ${response.status}`);
    }

    const data = await response.json();
    const status = data.data?.status;

    if (status === "SUCCEEDED") {
      return;
    }

    if (status === "FAILED" || status === "ABORTED" || status === "TIMED-OUT") {
      throw new Error(`LinkedIn search failed with status: ${status}`);
    }

    // Still running, wait and try again
    await sleep(POLL_INTERVAL_MS);
  }

  throw new Error("LinkedIn search timed out. Please try again.");
}

/**
 * Get items from a dataset
 */
async function getDatasetItems(
  apiKey: string,
  datasetId: string
): Promise<ApifyLinkedInJob[]> {
  const url = `${APIFY_API_BASE}/datasets/${datasetId}/items`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to get search results: ${response.status}`);
  }

  const items = await response.json();

  // Apify returns array directly for dataset items
  return Array.isArray(items) ? items : [];
}

/**
 * Sleep helper
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
