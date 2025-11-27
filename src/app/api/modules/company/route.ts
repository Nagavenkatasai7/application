import { NextResponse } from "next/server";
import { db, companies } from "@/lib/db";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { researchCompany, CompanyResearchError } from "@/lib/ai/company";
import { companyResearchRequestSchema } from "@/lib/validations/company";

/**
 * Cache TTL in milliseconds (7 days)
 */
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

/**
 * POST /api/modules/company - Research a company
 *
 * Request Body:
 * {
 *   companyName: string
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   data?: CompanyResearchResult,
 *   cached?: boolean,
 *   error?: { code: string, message: string }
 * }
 *
 * Error Codes:
 * - INVALID_JSON: Invalid JSON in request body
 * - VALIDATION_ERROR: Invalid request body
 * - AI_NOT_CONFIGURED: AI API key not set
 * - RESEARCH_ERROR: Failed to research company
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

    // Check for cached company data
    const [existingCompany] = await db
      .select()
      .from(companies)
      .where(eq(companies.name, normalizedName));

    // If we have cached data that's still valid, return it
    if (existingCompany && existingCompany.cachedAt) {
      const cacheAge = Date.now() - existingCompany.cachedAt.getTime();
      if (cacheAge < CACHE_TTL && existingCompany.cultureSignals) {
        // Parse the cached data
        const cachedResult = existingCompany.cultureSignals as Record<string, unknown>;
        return NextResponse.json({
          success: true,
          data: cachedResult,
          cached: true,
        });
      }
    }

    // Research the company using AI
    const result = await researchCompany(companyName.trim());

    // Cache the result in the database
    if (existingCompany) {
      // Update existing company
      await db
        .update(companies)
        .set({
          cultureSignals: result as unknown as Record<string, unknown>,
          cachedAt: new Date(),
        })
        .where(eq(companies.id, existingCompany.id));
    } else {
      // Create new company entry
      await db.insert(companies).values({
        id: uuidv4(),
        name: normalizedName,
        cultureSignals: result as unknown as Record<string, unknown>,
        cachedAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      data: result,
      cached: false,
    });
  } catch (error) {
    console.error("Company research error:", error);

    // Handle CompanyResearchError with specific codes
    if (error instanceof CompanyResearchError) {
      const statusMap: Record<string, number> = {
        AI_NOT_CONFIGURED: 503,
        INVALID_INPUT: 400,
        AUTH_ERROR: 401,
        RATE_LIMIT: 429,
        PARSE_ERROR: 500,
        API_ERROR: 502,
      };

      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status: statusMap[error.code] || 500 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "RESEARCH_ERROR",
          message: "Failed to research company",
        },
      },
      { status: 500 }
    );
  }
}
