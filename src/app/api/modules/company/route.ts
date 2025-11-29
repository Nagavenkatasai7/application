import { NextResponse } from "next/server";
import { db, companies } from "@/lib/db";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { companyResearchRequestSchema } from "@/lib/validations/company";

// Keep duration low for quick response - actual AI work happens in background
export const maxDuration = 10;

/**
 * Cache TTL in milliseconds (7 days)
 */
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

/**
 * Stale processing timeout (5 minutes) - if processing started but not completed
 */
const STALE_PROCESSING_TIMEOUT = 5 * 60 * 1000;

/**
 * POST /api/modules/company - Research a company
 *
 * This endpoint uses background processing to avoid Vercel Hobby plan timeouts.
 * For uncached companies, it returns a processing status and the client polls for results.
 *
 * Request Body:
 * {
 *   companyName: string
 * }
 *
 * Response (cached):
 * {
 *   success: true,
 *   data: CompanyResearchResult,
 *   cached: true
 * }
 *
 * Response (processing):
 * {
 *   success: true,
 *   status: "processing",
 *   requestId: string
 * }
 *
 * Error Codes:
 * - INVALID_JSON: Invalid JSON in request body
 * - VALIDATION_ERROR: Invalid request body
 */
export async function POST(request: Request) {
  try {
    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_JSON",
            message: "Invalid JSON in request body",
          },
        },
        { status: 400 }
      );
    }

    // Validate request
    const validation = companyResearchRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: validation.error.issues[0]?.message || "Invalid request",
          },
        },
        { status: 400 }
      );
    }

    const { companyName } = validation.data;
    const normalizedName = companyName.trim().toLowerCase();

    // Check for existing company record
    const [existingCompany] = await db
      .select()
      .from(companies)
      .where(eq(companies.name, normalizedName));

    // CASE 1: Valid cached data - return immediately
    if (existingCompany?.status === "completed" && existingCompany.cachedAt) {
      const cacheAge = Date.now() - existingCompany.cachedAt.getTime();
      if (cacheAge < CACHE_TTL && existingCompany.cultureSignals) {
        return NextResponse.json({
          success: true,
          data: existingCompany.cultureSignals,
          cached: true,
        });
      }
    }

    // CASE 2: Already processing - check if stale
    if (existingCompany?.status === "processing") {
      const processingAge = existingCompany.processingStartedAt
        ? Date.now() - existingCompany.processingStartedAt.getTime()
        : Infinity;

      // If not stale, return current processing status
      if (processingAge < STALE_PROCESSING_TIMEOUT) {
        return NextResponse.json({
          success: true,
          status: "processing",
          requestId: existingCompany.id,
        });
      }
      // If stale, will re-trigger below
    }

    // CASE 3: Start new processing
    const requestId = existingCompany?.id || uuidv4();

    // Create/update record with pending status
    if (!existingCompany) {
      await db.insert(companies).values({
        id: requestId,
        name: normalizedName,
        status: "pending",
      });
    } else {
      await db
        .update(companies)
        .set({
          status: "pending",
          errorMessage: null,
          processingStartedAt: null,
        })
        .where(eq(companies.id, existingCompany.id));
    }

    // Fire-and-forget background processing
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Don't await - fire and forget
    fetch(`${baseUrl}/api/modules/company/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, companyName: companyName.trim() }),
    }).catch((err) => console.error("Failed to trigger background process:", err));

    return NextResponse.json({
      success: true,
      status: "processing",
      requestId,
    });
  } catch (error) {
    console.error("Company research error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to process request",
        },
      },
      { status: 500 }
    );
  }
}
