import { NextResponse } from "next/server";
import { db, companies } from "@/lib/db";
import { eq } from "drizzle-orm";
import { researchCompany, CompanyResearchError } from "@/lib/ai/company";

// Use serverless runtime with max duration - match AI timeout
export const maxDuration = 180;

/**
 * POST /api/modules/company/process - Background company research processor
 *
 * This endpoint is called internally by the main company endpoint.
 * It performs the actual AI research and updates the database.
 *
 * Request Body:
 * {
 *   requestId: string,
 *   companyName: string
 * }
 */
export async function POST(request: Request) {
  let requestId: string | undefined;

  try {
    const body = await request.json();
    requestId = body.requestId;
    const companyName = body.companyName;

    if (!requestId || !companyName) {
      return NextResponse.json(
        { success: false, error: "Missing requestId or companyName" },
        { status: 400 }
      );
    }

    // Update status to processing
    await db
      .update(companies)
      .set({
        status: "processing",
        processingStartedAt: new Date(),
      })
      .where(eq(companies.id, requestId));

    // Perform AI research (this is the slow part)
    const result = await researchCompany(companyName);

    // Update with completed result
    await db
      .update(companies)
      .set({
        cultureSignals: result as unknown as Record<string, unknown>,
        status: "completed",
        cachedAt: new Date(),
        errorMessage: null,
      })
      .where(eq(companies.id, requestId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Background processing error:", error);

    // Update status to failed
    if (requestId) {
      try {
        const errorMessage =
          error instanceof CompanyResearchError
            ? error.message
            : error instanceof Error
              ? error.message
              : "Unknown error during research";

        await db
          .update(companies)
          .set({
            status: "failed",
            errorMessage,
          })
          .where(eq(companies.id, requestId));
      } catch (updateError) {
        console.error("Failed to update error status:", updateError);
      }
    }

    return NextResponse.json(
      { success: false, error: "Processing failed" },
      { status: 500 }
    );
  }
}
