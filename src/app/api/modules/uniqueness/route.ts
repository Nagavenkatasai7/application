import { NextResponse } from "next/server";
import { db, resumes } from "@/lib/db";
import { getOrCreateLocalUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { analyzeUniqueness, UniquenessError } from "@/lib/ai/uniqueness";
import { uniquenessRequestSchema } from "@/lib/validations/uniqueness";
import type { ResumeContent } from "@/lib/validations/resume";

// Vercel function configuration - match AI timeout
export const maxDuration = 180;

/**
 * POST /api/modules/uniqueness - Analyze resume for unique differentiators
 *
 * Request Body:
 * {
 *   resumeId: string (UUID)
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   data?: UniquenessResult,
 *   error?: { code: string, message: string }
 * }
 *
 * Error Codes:
 * - VALIDATION_ERROR: Invalid request body
 * - RESUME_NOT_FOUND: Resume doesn't exist or user doesn't own it
 * - INVALID_RESUME: Resume has no content to analyze
 * - AI_NOT_CONFIGURED: AI API key not set
 * - ANALYSIS_ERROR: Failed to analyze uniqueness
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
    const validation = uniquenessRequestSchema.safeParse(body);
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

    const { resumeId } = validation.data;

    // Get current user
    const user = await getOrCreateLocalUser();

    // Fetch the resume and verify ownership
    const [resume] = await db
      .select()
      .from(resumes)
      .where(and(eq(resumes.id, resumeId), eq(resumes.userId, user.id)));

    if (!resume) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RESUME_NOT_FOUND",
            message: "Resume not found",
          },
        },
        { status: 404 }
      );
    }

    // Validate resume has content
    const resumeContent = resume.content as ResumeContent | null;
    if (!resumeContent || !resumeContent.contact) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_RESUME",
            message: "Resume has no content to analyze",
          },
        },
        { status: 400 }
      );
    }

    // Analyze uniqueness
    const result = await analyzeUniqueness(resumeContent);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Uniqueness analysis error:", error);

    // Handle UniquenessError with specific codes
    if (error instanceof UniquenessError) {
      const statusMap: Record<string, number> = {
        AI_NOT_CONFIGURED: 503,
        INSUFFICIENT_CONTENT: 400,
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
          code: "ANALYSIS_ERROR",
          message: "Failed to analyze uniqueness",
        },
      },
      { status: 500 }
    );
  }
}
