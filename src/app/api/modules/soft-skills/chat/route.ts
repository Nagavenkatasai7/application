import { NextResponse } from "next/server";
import { db, softSkills } from "@/lib/db";
import { getOrCreateLocalUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { continueAssessment, SoftSkillsError } from "@/lib/ai/soft-skills";
import { chatRequestSchema, type SurveyMessage } from "@/lib/validations/soft-skills";

/**
 * POST /api/modules/soft-skills/chat - Continue soft skills assessment conversation
 *
 * Request Body:
 * {
 *   skillId: string (UUID),
 *   message: string
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   data?: {
 *     message: string,
 *     isComplete: boolean,
 *     questionNumber: number,
 *     evidenceScore?: number (1-5),
 *     statement?: string
 *   },
 *   error?: { code: string, message: string }
 * }
 *
 * Error Codes:
 * - VALIDATION_ERROR: Invalid request body
 * - SKILL_NOT_FOUND: Soft skill record not found
 * - ALREADY_COMPLETE: Assessment is already complete
 * - AI_NOT_CONFIGURED: AI API key not set
 * - CHAT_ERROR: Failed to continue conversation
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
    const validation = chatRequestSchema.safeParse(body);
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

    const { skillId, message: userMessage } = validation.data;

    // Get current user
    const user = await getOrCreateLocalUser();

    // Fetch the soft skill record and verify ownership
    const [softSkill] = await db
      .select()
      .from(softSkills)
      .where(and(eq(softSkills.id, skillId), eq(softSkills.userId, user.id)));

    if (!softSkill) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "SKILL_NOT_FOUND",
            message: "Soft skill assessment not found",
          },
        },
        { status: 404 }
      );
    }

    // Check if assessment is already complete
    if (softSkill.evidenceScore !== null && softSkill.statement !== null) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ALREADY_COMPLETE",
            message: "This assessment has already been completed",
          },
        },
        { status: 400 }
      );
    }

    // Get existing conversation
    const existingConversation = (softSkill.conversation as SurveyMessage[]) || [];
    const currentQuestionNumber = existingConversation.filter(
      (msg) => msg.role === "assistant"
    ).length;

    // Continue the AI conversation
    const aiResponse = await continueAssessment(
      softSkill.skillName,
      existingConversation,
      userMessage,
      currentQuestionNumber
    );

    // Update conversation with user message and AI response
    const updatedConversation = [
      ...existingConversation,
      { role: "user" as const, content: userMessage },
      { role: "assistant" as const, content: aiResponse.message },
    ];

    // Build update object
    const updateData: {
      conversation: typeof updatedConversation;
      updatedAt: Date;
      evidenceScore?: number;
      statement?: string;
    } = {
      conversation: updatedConversation,
      updatedAt: new Date(),
    };

    // If assessment is complete, save the score and statement
    if (aiResponse.isComplete && aiResponse.evidenceScore && aiResponse.statement) {
      updateData.evidenceScore = aiResponse.evidenceScore;
      updateData.statement = aiResponse.statement;
    }

    // Update the database
    await db.update(softSkills)
      .set(updateData)
      .where(eq(softSkills.id, skillId));

    return NextResponse.json({
      success: true,
      data: {
        message: aiResponse.message,
        isComplete: aiResponse.isComplete,
        questionNumber: aiResponse.questionNumber,
        evidenceScore: aiResponse.evidenceScore,
        statement: aiResponse.statement,
      },
    });
  } catch (error) {
    console.error("Soft skills chat error:", error);

    // Handle SoftSkillsError with specific codes
    if (error instanceof SoftSkillsError) {
      const statusMap: Record<string, number> = {
        AI_NOT_CONFIGURED: 503,
        INVALID_MESSAGE: 400,
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
          code: "CHAT_ERROR",
          message: "Failed to continue assessment",
        },
      },
      { status: 500 }
    );
  }
}
