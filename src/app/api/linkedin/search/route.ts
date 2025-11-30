/**
 * LinkedIn Jobs Search API Route
 *
 * POST /api/linkedin/search
 * Search LinkedIn for jobs via Apify
 */

import { NextResponse } from "next/server";
import { isApifyConfigured } from "@/lib/env";
import { searchLinkedInJobs, transformApifyJobs } from "@/lib/linkedin";
import { linkedInSearchSchema } from "@/lib/validations/linkedin";
import type { LinkedInSearchResponse, TimeFrame } from "@/lib/linkedin/types";

// Allow longer timeout for Apify scraping
export const maxDuration = 180; // 3 minutes

// =============================================================================
// POST /api/linkedin/search
// =============================================================================

export async function POST(request: Request): Promise<NextResponse<LinkedInSearchResponse>> {
  try {
    // Check if Apify is configured
    if (!isApifyConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_CONFIGURED",
            message: "LinkedIn search is not configured. Please add your Apify API key.",
          },
        },
        { status: 503 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = linkedInSearchSchema.safeParse(body);

    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: firstError?.message || "Invalid search parameters",
          },
        },
        { status: 400 }
      );
    }

    const { keywords, location, timeFrame, limit = 25 } = validation.data;

    console.log(`[LinkedIn Search] Keywords: "${keywords}", Location: "${location || 'any'}", TimeFrame: ${timeFrame}`);

    // Search LinkedIn jobs via Apify
    const rawJobs = await searchLinkedInJobs({
      keywords,
      location,
      timeFrame: timeFrame as TimeFrame,
      limit,
    });

    console.log(`[LinkedIn Search] Found ${rawJobs.length} raw jobs`);

    // Transform raw jobs to normalized format
    const jobs = transformApifyJobs(rawJobs);

    console.log(`[LinkedIn Search] Transformed to ${jobs.length} valid jobs`);

    return NextResponse.json({
      success: true,
      data: {
        jobs,
        totalCount: jobs.length,
        searchParams: {
          keywords,
          location: location || null,
          timeFrame: timeFrame as TimeFrame,
        },
      },
    });
  } catch (error) {
    console.error("[LinkedIn Search] Error:", error);

    // Handle specific error types
    const message = error instanceof Error ? error.message : "Unknown error";

    if (message.includes("timed out")) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "TIMEOUT",
            message: "Search took too long. Try a more specific query or fewer results.",
          },
        },
        { status: 504 }
      );
    }

    if (message.includes("rate limit") || message.includes("429")) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMITED",
            message: "Too many searches. Please wait a moment and try again.",
          },
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SEARCH_ERROR",
          message: "Failed to search LinkedIn jobs. Please try again.",
        },
      },
      { status: 500 }
    );
  }
}
