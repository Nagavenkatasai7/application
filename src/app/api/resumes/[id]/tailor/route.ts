import { NextResponse } from "next/server";
import { db, resumes, jobs } from "@/lib/db";
import { getOrCreateLocalUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import {
  tailorResume,
  tailorRequestSchema,
  TailorError,
  isAIConfigured,
} from "@/lib/ai";
import type { ResumeContent } from "@/lib/validations/resume";

// Vercel serverless timeout (180s for Pro plan, 10s buffer for safety)
export const maxDuration = 180;

/**
 * POST /api/resumes/:id/tailor - Tailor a resume for a specific job
 *
 * Request body:
 * {
 *   jobId: string (UUID of the job to tailor for)
 * }
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     tailoredResume: ResumeContent,
 *     changes: {
 *       summaryModified: boolean,
 *       experienceBulletsModified: number,
 *       skillsReordered: boolean,
 *       sectionsReordered: boolean
 *     }
 *   }
 * }
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: resumeId } = await params;
    const user = await getOrCreateLocalUser();

    // Check if AI is configured
    if (!isAIConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AI_NOT_CONFIGURED",
            message: "AI features are not configured. Please add your API key.",
          },
        },
        { status: 503 }
      );
    }

    // Parse and validate request body
    let body: { jobId?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: { code: "INVALID_JSON", message: "Invalid JSON in request body" },
        },
        { status: 400 }
      );
    }

    // Validate input
    const validation = tailorRequestSchema.safeParse({
      resumeId,
      jobId: body.jobId,
    });

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

    const { jobId } = validation.data;

    // Fetch the resume and verify ownership
    const [resume] = await db
      .select()
      .from(resumes)
      .where(and(eq(resumes.id, resumeId), eq(resumes.userId, user.id)));

    if (!resume) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "RESUME_NOT_FOUND", message: "Resume not found" },
        },
        { status: 404 }
      );
    }

    // Fetch the job
    const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId));

    if (!job) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "JOB_NOT_FOUND", message: "Job not found" },
        },
        { status: 404 }
      );
    }

    // Ensure we have valid resume content
    const resumeContent = resume.content as ResumeContent | null;
    if (!resumeContent || !resumeContent.contact) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_RESUME",
            message: "Resume has no content to tailor",
          },
        },
        { status: 400 }
      );
    }

    // Ensure job has a description
    if (!job.description) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_JOB",
            message: "Job has no description for tailoring",
          },
        },
        { status: 400 }
      );
    }

    // Call the tailoring service
    const result = await tailorResume({
      resume: resumeContent,
      jobTitle: job.title,
      companyName: job.companyName || "Company",
      jobDescription: job.description,
      requirements: (job.requirements as string[]) || [],
      skills: (job.skills as string[]) || [],
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error tailoring resume:", error);

    // Handle TailorError with specific error codes
    if (error instanceof TailorError) {
      const statusMap: Record<string, number> = {
        AI_NOT_CONFIGURED: 503,
        FEATURE_DISABLED: 503,
        AUTH_ERROR: 401,
        RATE_LIMIT: 429,
        SERVICE_UNAVAILABLE: 503,
        TIMEOUT: 504,
        PARSE_ERROR: 500,
        VALIDATION_ERROR: 500,
        API_ERROR: 500,
        UNKNOWN_ERROR: 500,
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

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "TAILOR_ERROR",
          message: "Failed to tailor resume",
        },
      },
      { status: 500 }
    );
  }
}
