import { NextResponse } from "next/server";
import { z } from "zod";
import { db, resumes, jobs } from "@/lib/db";
import { getOrCreateLocalUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { isAIConfigured } from "@/lib/ai";
import { hybridTailor, HybridTailorError } from "@/lib/ai/tailoring";
import type { ResumeContent } from "@/lib/validations/resume";
import type { JobData } from "@/lib/ai/tailoring";

// Vercel serverless timeout (180s for Pro plan, 10s buffer for safety)
export const maxDuration = 180;

/**
 * Request validation schema
 */
const hybridTailorRequestSchema = z.object({
  jobId: z.string().uuid("Invalid job ID"),
});

/**
 * POST /api/resumes/:id/hybrid-tailor - Tailor a resume using the hybrid system
 *
 * This endpoint uses the recruiter-optimized hybrid tailoring system that:
 * 1. Runs pre-analysis modules in parallel (impact, uniqueness, context)
 * 2. Applies deterministic transformation rules
 * 3. Uses minimal AI for natural language rewriting
 * 4. Calculates a quality score based on 5 recruiter criteria
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
 *     qualityScore: RecruiterReadinessScore,
 *     changes: TailoringChanges,
 *     preAnalysis: PreAnalysisResult,
 *     appliedRules: RuleEvaluationResult[],
 *     tokenUsage: { preAnalysis, rewriting, total, savedVsPureAI },
 *     processingTimeMs: number
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
    let body: unknown;
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
    const validation = hybridTailorRequestSchema.safeParse(body);

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

    // Prepare job data for hybrid tailoring
    const jobData: JobData = {
      id: job.id,
      title: job.title,
      companyName: job.companyName,
      description: job.description,
      requirements: (job.requirements as string[]) || null,
      skills: (job.skills as string[]) || null,
    };

    // Call the hybrid tailoring service
    const result = await hybridTailor(resumeContent, jobData, resumeId);

    return NextResponse.json({
      success: true,
      data: {
        tailoredResume: result.tailoredResume,
        qualityScore: result.qualityScore,
        changes: result.changes,
        preAnalysis: {
          impact: {
            score: result.preAnalysis.impact.score,
            scoreLabel: result.preAnalysis.impact.scoreLabel,
            bulletsImproved: result.preAnalysis.impact.bulletsImproved,
          },
          uniqueness: {
            score: result.preAnalysis.uniqueness.score,
            scoreLabel: result.preAnalysis.uniqueness.scoreLabel,
            differentiators: result.preAnalysis.uniqueness.differentiators,
          },
          context: {
            score: result.preAnalysis.context.score,
            scoreLabel: result.preAnalysis.context.scoreLabel,
            keywordCoverage: result.preAnalysis.context.keywordCoverage.percentage,
          },
          softSkillsDetected: result.preAnalysis.softSkills.length,
          companyContextNeeded: result.preAnalysis.company
            ? !result.preAnalysis.company.isWellKnown
            : false,
        },
        appliedRules: result.appliedRules.map((r) => ({
          ruleId: r.ruleId,
          ruleName: r.ruleName,
          recruiterIssue: r.recruiterIssue,
        })),
        tokenUsage: result.tokenUsage,
        processingTimeMs: result.processingTimeMs,
        tailoredAt: result.tailoredAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error in hybrid tailoring:", error);

    // Handle HybridTailorError with specific error codes
    if (error instanceof HybridTailorError) {
      const statusMap: Record<string, number> = {
        PRE_ANALYSIS_FAILED: 500,
        RULES_FAILED: 500,
        REWRITING_FAILED: 500,
        SCORING_FAILED: 500,
        AI_NOT_CONFIGURED: 503,
        AUTH_ERROR: 401,
        RATE_LIMIT: 429,
        TIMEOUT: 504,
        UNKNOWN_ERROR: 500,
      };

      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message,
            phase: error.phase,
          },
        },
        { status: statusMap[error.code] || 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "HYBRID_TAILOR_ERROR",
          message: "Failed to tailor resume with hybrid system",
        },
      },
      { status: 500 }
    );
  }
}
