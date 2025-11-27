import { NextResponse } from "next/server";
import { db, resumes, jobs } from "@/lib/db";
import { getOrCreateLocalUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { analyzeContext, ContextError } from "@/lib/ai/context";
import type { JobData } from "@/lib/ai/context";
import { contextRequestSchema } from "@/lib/validations/context";
import type { ResumeContent } from "@/lib/validations/resume";

/**
 * POST /api/modules/context - Analyze resume alignment with a job description
 *
 * Request Body:
 * {
 *   resumeId: string (UUID),
 *   jobId: string (UUID)
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   data?: ContextResult,
 *   error?: { code: string, message: string }
 * }
 *
 * Error Codes:
 * - VALIDATION_ERROR: Invalid request body
 * - RESUME_NOT_FOUND: Resume doesn't exist or user doesn't own it
 * - JOB_NOT_FOUND: Job doesn't exist
 * - INVALID_RESUME: Resume has no content to analyze
 * - INVALID_JOB: Job has no description to analyze
 * - AI_NOT_CONFIGURED: AI API key not set
 * - ANALYSIS_ERROR: Failed to analyze context
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
    const validation = contextRequestSchema.safeParse(body);
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

    const { resumeId, jobId } = validation.data;

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

    // Fetch the job (jobs are global, not user-scoped)
    const [job] = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId));

    if (!job) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "JOB_NOT_FOUND",
            message: "Job not found",
          },
        },
        { status: 404 }
      );
    }

    // Cast requirements and skills as arrays (they are JSON in DB)
    const jobRequirements = job.requirements as string[] | null;
    const jobSkills = job.skills as string[] | null;

    // Validate job has content to analyze
    if (!job.description && !jobRequirements?.length && !jobSkills?.length) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_JOB",
            message: "Job has no description or requirements to analyze",
          },
        },
        { status: 400 }
      );
    }

    // Prepare job data for analysis
    const jobData: JobData = {
      title: job.title,
      companyName: job.companyName,
      description: job.description,
      requirements: jobRequirements,
      skills: jobSkills,
    };

    // Analyze context alignment
    const result = await analyzeContext(resumeContent, jobData);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Context analysis error:", error);

    // Handle ContextError with specific codes
    if (error instanceof ContextError) {
      const statusMap: Record<string, number> = {
        AI_NOT_CONFIGURED: 503,
        INSUFFICIENT_CONTENT: 400,
        INSUFFICIENT_JOB_CONTENT: 400,
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
          message: "Failed to analyze context alignment",
        },
      },
      { status: 500 }
    );
  }
}
