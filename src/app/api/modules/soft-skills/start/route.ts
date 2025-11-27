import { NextResponse } from "next/server";
import { db, softSkills } from "@/lib/db";
import { getOrCreateLocalUser } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { startAssessment, SoftSkillsError } from "@/lib/ai/soft-skills";
import { startAssessmentRequestSchema } from "@/lib/validations/soft-skills";

/**
 * POST /api/modules/soft-skills/start - Start a new soft skills assessment
 *
 * Request Body:
 * {
 *   skillName: string
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   data?: {
 *     skillId: string,
 *     message: string,
 *     questionNumber: number
 *   },
 *   error?: { code: string, message: string }
 * }
 *
 * Error Codes:
 * - VALIDATION_ERROR: Invalid request body
 * - AI_NOT_CONFIGURED: AI API key not set
 * - ASSESSMENT_ERROR: Failed to start assessment
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
    const validation = startAssessmentRequestSchema.safeParse(body);
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

    const { skillName } = validation.data;

    // Get current user
    const user = await getOrCreateLocalUser();

    // Create new soft skill record
    const skillId = uuidv4();
    await db.insert(softSkills).values({
      id: skillId,
      userId: user.id,
      skillName: skillName,
      evidenceScore: null,
      conversation: [],
      statement: null,
    });

    // Start the AI assessment
    const aiResponse = await startAssessment(skillName);

    // Update the conversation with the initial AI message
    await db.update(softSkills)
      .set({
        conversation: [
          {
            role: "assistant",
            content: aiResponse.message,
          },
        ],
        updatedAt: new Date(),
      })
      .where(eq(softSkills.id, skillId));

    return NextResponse.json({
      success: true,
      data: {
        skillId,
        message: aiResponse.message,
        questionNumber: aiResponse.questionNumber,
      },
    });
  } catch (error) {
    console.error("Soft skills start error:", error);

    // Handle SoftSkillsError with specific codes
    if (error instanceof SoftSkillsError) {
      const statusMap: Record<string, number> = {
        AI_NOT_CONFIGURED: 503,
        INVALID_SKILL: 400,
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
          code: "ASSESSMENT_ERROR",
          message: "Failed to start assessment",
        },
      },
      { status: 500 }
    );
  }
}
