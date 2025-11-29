import { NextResponse } from "next/server";
import { db, companies } from "@/lib/db";
import { eq } from "drizzle-orm";

export const maxDuration = 5;

/**
 * GET /api/modules/company/status/[id] - Check company research status
 *
 * Used by clients to poll for completion of background processing.
 *
 * Response (completed):
 * {
 *   success: true,
 *   status: "completed",
 *   data: CompanyResearchResult
 * }
 *
 * Response (processing):
 * {
 *   success: true,
 *   status: "processing" | "pending"
 * }
 *
 * Response (failed):
 * {
 *   success: false,
 *   status: "failed",
 *   error: { code: string, message: string }
 * }
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_ID",
            message: "Invalid request ID",
          },
        },
        { status: 400 }
      );
    }

    const [company] = await db
      .select()
      .from(companies)
      .where(eq(companies.id, id));

    if (!company) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Request not found",
          },
        },
        { status: 404 }
      );
    }

    // Completed with data
    if (company.status === "completed" && company.cultureSignals) {
      return NextResponse.json({
        success: true,
        status: "completed",
        data: company.cultureSignals,
      });
    }

    // Failed
    if (company.status === "failed") {
      return NextResponse.json({
        success: false,
        status: "failed",
        error: {
          code: "RESEARCH_FAILED",
          message: company.errorMessage || "Company research failed",
        },
      });
    }

    // Still processing or pending
    return NextResponse.json({
      success: true,
      status: company.status || "pending",
    });
  } catch (error) {
    console.error("Status check error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to check status",
        },
      },
      { status: 500 }
    );
  }
}
