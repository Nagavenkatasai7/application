import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import {
  getAIConfig,
  getFeatureFlags,
  getModelConfig,
  isAIConfigured,
} from "./config";
import {
  RESUME_TAILORING_SYSTEM_PROMPT,
  buildResumeTailoringPrompt,
} from "./prompts";
import type { ResumeContent } from "@/lib/validations/resume";
import { resumeContentSchema } from "@/lib/validations/resume";
import { withRetry, hasRetryMetadata } from "./retry";

/**
 * Tailoring request input
 */
export interface TailorRequest {
  resume: ResumeContent;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  requirements?: string[];
  skills?: string[];
}

/**
 * Tailoring response
 */
export interface TailorResponse {
  tailoredResume: ResumeContent;
  changes: TailorChangeSummary;
}

/**
 * Summary of changes made during tailoring
 */
export interface TailorChangeSummary {
  summaryModified: boolean;
  experienceBulletsModified: number;
  skillsReordered: boolean;
  sectionsReordered: boolean;
}

/**
 * Error thrown when AI tailoring fails
 */
export class TailorError extends Error {
  constructor(
    message: string,
    public code: string,
    public cause?: unknown
  ) {
    super(message);
    this.name = "TailorError";
  }
}

/**
 * Create Anthropic client with current configuration
 */
function createAnthropicClient(): Anthropic {
  const config = getAIConfig();
  return new Anthropic({
    apiKey: config.apiKey,
    timeout: config.timeout,
  });
}

/**
 * Extract JSON from AI response that may contain markdown code blocks
 */
function extractJsonFromResponse(text: string): string {
  // Try to extract JSON from markdown code block
  const jsonBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonBlockMatch) {
    return jsonBlockMatch[1].trim();
  }

  // Try to find raw JSON object
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }

  // Return as-is if no patterns match
  return text.trim();
}

/**
 * Detect changes between original and tailored resume
 */
function detectChanges(
  original: ResumeContent,
  tailored: ResumeContent
): TailorChangeSummary {
  let experienceBulletsModified = 0;

  // Count modified experience bullets
  tailored.experiences.forEach((exp, expIndex) => {
    const originalExp = original.experiences[expIndex];
    if (originalExp) {
      exp.bullets.forEach((bullet, bulletIndex) => {
        const originalBullet = originalExp.bullets[bulletIndex];
        if (!originalBullet || originalBullet.text !== bullet.text) {
          experienceBulletsModified++;
        }
      });
    } else {
      // All bullets in new experience are "modified"
      experienceBulletsModified += exp.bullets.length;
    }
  });

  return {
    summaryModified: original.summary !== tailored.summary,
    experienceBulletsModified,
    skillsReordered:
      JSON.stringify(original.skills) !== JSON.stringify(tailored.skills),
    sectionsReordered:
      original.experiences.map((e) => e.id).join(",") !==
      tailored.experiences.map((e) => e.id).join(","),
  };
}

/**
 * Tailor a resume for a specific job using AI
 *
 * @param request - Tailoring request containing resume and job details
 * @returns Tailored resume with change summary
 * @throws TailorError if AI is not configured or tailoring fails
 */
export async function tailorResume(
  request: TailorRequest
): Promise<TailorResponse> {
  // Check if AI is configured
  if (!isAIConfigured()) {
    throw new TailorError(
      "AI is not configured. Please set your API key.",
      "AI_NOT_CONFIGURED"
    );
  }

  // Check if tailoring feature is enabled
  const featureFlags = getFeatureFlags();
  if (!featureFlags.enableTailoring) {
    throw new TailorError(
      "Resume tailoring feature is disabled.",
      "FEATURE_DISABLED"
    );
  }

  const modelConfig = getModelConfig("resumeTailoring");

  // Build the prompt
  const userPrompt = buildResumeTailoringPrompt(
    request.resume,
    request.jobDescription,
    request.jobTitle,
    request.companyName,
    request.requirements,
    request.skills
  );

  try {
    const client = createAnthropicClient();

    const response = await withRetry(
      () =>
        client.messages.create({
          model: modelConfig.model,
          max_tokens: modelConfig.maxTokens,
          temperature: modelConfig.temperature,
          system: RESUME_TAILORING_SYSTEM_PROMPT,
          messages: [
            {
              role: "user",
              content: userPrompt,
            },
          ],
        }),
      { timeBudgetMs: 170000 } // 170s budget (10s buffer for Vercel 180s limit)
    );

    // Extract text content from response
    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new TailorError(
        "No text response received from AI",
        "EMPTY_RESPONSE"
      );
    }

    // Parse the response as JSON
    const jsonStr = extractJsonFromResponse(textContent.text);

    let parsedResponse: unknown;
    try {
      parsedResponse = JSON.parse(jsonStr);
    } catch (parseError) {
      throw new TailorError(
        "Failed to parse AI response as JSON",
        "PARSE_ERROR",
        parseError
      );
    }

    // Validate the response matches ResumeContent schema
    const validationResult = resumeContentSchema.safeParse(parsedResponse);
    if (!validationResult.success) {
      throw new TailorError(
        `Invalid resume structure in AI response: ${validationResult.error.message}`,
        "VALIDATION_ERROR",
        validationResult.error
      );
    }

    const tailoredResume = validationResult.data;

    // Detect changes made
    const changes = detectChanges(request.resume, tailoredResume);

    return {
      tailoredResume,
      changes,
    };
  } catch (error) {
    // Re-throw TailorError as-is
    if (error instanceof TailorError) {
      throw error;
    }

    // Check for retry-exhausted errors
    if (hasRetryMetadata(error)) {
      const metadata = (error as { retryMetadata: { attempts: number; exhaustedRetries: boolean; errorCode: string } }).retryMetadata;
      throw new TailorError(
        `AI request failed after ${metadata.attempts} attempt(s)`,
        metadata.exhaustedRetries ? "MAX_RETRIES_EXCEEDED" : metadata.errorCode,
        error
      );
    }

    // Handle Anthropic API errors
    if (error instanceof Anthropic.APIError) {
      if (error.status === 401) {
        throw new TailorError(
          "Invalid API key. Please check your configuration.",
          "AUTH_ERROR",
          error
        );
      }
      if (error.status === 429) {
        throw new TailorError(
          "Rate limit exceeded. Please try again later.",
          "RATE_LIMIT",
          error
        );
      }
      if (error.status === 500 || error.status === 503) {
        throw new TailorError(
          "AI service is temporarily unavailable. Please try again.",
          "SERVICE_UNAVAILABLE",
          error
        );
      }
      throw new TailorError(
        `AI API error: ${error.message}`,
        "API_ERROR",
        error
      );
    }

    // Handle timeout errors
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new TailorError(
        "Request timed out. The job description may be too long.",
        "TIMEOUT",
        error
      );
    }

    // Generic error
    throw new TailorError(
      "Failed to tailor resume. Please try again.",
      "UNKNOWN_ERROR",
      error
    );
  }
}

/**
 * Validate tailoring request
 */
export const tailorRequestSchema = z.object({
  resumeId: z.string().uuid("Invalid resume ID"),
  jobId: z.string().uuid("Invalid job ID"),
});

export type TailorRequestInput = z.infer<typeof tailorRequestSchema>;
