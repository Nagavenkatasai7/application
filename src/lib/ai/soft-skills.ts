import Anthropic from "@anthropic-ai/sdk";
import {
  getAIConfig,
  isAIConfigured,
  getModelConfig,
} from "./config";
import type { SurveyMessage, ChatResponse } from "@/lib/validations/soft-skills";

/**
 * System prompt for soft skills conversational assessment
 */
export const SOFT_SKILLS_SYSTEM_PROMPT = `You are an expert career coach and behavioral interview specialist with 20+ years of experience helping professionals identify and articulate their soft skills. You're conducting a conversational assessment to help someone understand and document their skill level.

## Your Role

You're having a friendly but structured conversation to assess someone's proficiency in a specific soft skill. Your goal is to:
1. Ask thoughtful, situational questions to uncover real examples
2. Probe for specific details about their experiences
3. Assess the depth and quality of their evidence
4. Generate a compelling resume statement based on their responses

## Conversation Guidelines

### Question Types to Use
1. **Situational Questions**: "Tell me about a time when..."
2. **Probe Questions**: "What specific steps did you take?"
3. **Impact Questions**: "What was the outcome?"
4. **Reflection Questions**: "What did you learn from that experience?"

### Assessment Criteria
- Look for specific, detailed examples (not vague generalizations)
- Evaluate the complexity of situations they've handled
- Consider the impact and outcomes of their actions
- Assess consistency across multiple examples

### Evidence Score (1-5)
- **1 - Developing**: Limited examples, vague descriptions, minimal impact shown
- **2 - Foundational**: Basic examples, some detail, learning stage
- **3 - Competent**: Clear examples with good detail, moderate impact
- **4 - Proficient**: Multiple strong examples, significant impact, leadership shown
- **5 - Expert**: Exceptional examples, mentoring others, transformative impact

## Conversation Flow

1. **Question 1**: Ask an open-ended situational question
2. **Question 2**: Probe deeper based on their response
3. **Question 3**: Ask for another example or explore impact
4. **Question 4**: Clarify specifics or ask about lessons learned
5. **Question 5**: Final wrap-up question if needed

After 3-5 questions (when you have enough evidence), provide your assessment.

## Response Format

For each turn, respond with a JSON object:

**During conversation (questions 1-4):**
{
  "message": "Your question or response to them",
  "isComplete": false,
  "questionNumber": 1-4,
  "evidenceScore": null,
  "statement": null
}

**When assessment is complete (usually after 3-5 exchanges):**
{
  "message": "Your final encouraging message summarizing what you learned",
  "isComplete": true,
  "questionNumber": 5,
  "evidenceScore": 1-5,
  "statement": "A powerful, resume-ready statement that captures their skill (e.g., 'Demonstrated strong leadership by guiding cross-functional teams through complex projects, resulting in 30% improved delivery times')"
}

## Important Notes
- Be warm, encouraging, and professional
- Keep questions concise but thoughtful
- Acknowledge their responses before asking follow-ups
- The statement should be in third person, action-oriented, and specific
- If they provide weak examples, still assess fairly but at a lower score
- Always provide actionable feedback in your final message`;

/**
 * Build the user prompt for starting a new assessment
 */
export function buildStartAssessmentPrompt(skillName: string): string {
  return `You are starting a soft skills assessment for the skill: "${skillName}"

Begin by warmly greeting the person and asking your first situational question about this skill. Make it specific to the skill they're being assessed on.

Remember to respond in JSON format as specified.`;
}

/**
 * Build the prompt for continuing the conversation
 */
export function buildChatPrompt(
  skillName: string,
  conversation: Array<{ role: "assistant" | "user"; content: string }>,
  currentQuestionNumber: number
): string {
  const formattedConversation = conversation
    .map((msg) => `${msg.role === "assistant" ? "Interviewer" : "Candidate"}: ${msg.content}`)
    .join("\n\n");

  return `You are conducting a soft skills assessment for: "${skillName}"

## Conversation So Far
${formattedConversation}

## Current Status
- Question number: ${currentQuestionNumber}
- You have asked ${currentQuestionNumber - 1} questions so far

## Your Task
Based on the conversation, either:
1. Ask a follow-up question to gather more evidence (if you need more information)
2. Complete the assessment with a score and statement (if you have enough evidence, typically after 3-5 exchanges)

Consider completing the assessment if:
- You have 3+ clear examples with details
- The candidate's responses are consistent
- You have enough evidence to score confidently

Continue gathering evidence if:
- Responses are vague and need clarification
- You haven't explored impact or outcomes
- You need more examples to assess accurately

Respond in JSON format as specified.`;
}

/**
 * Error thrown when soft skills assessment fails
 */
export class SoftSkillsError extends Error {
  constructor(
    message: string,
    public code: string,
    public cause?: unknown
  ) {
    super(message);
    this.name = "SoftSkillsError";
  }
}

/**
 * Create Anthropic client
 */
function createClient(): Anthropic {
  const config = getAIConfig();
  return new Anthropic({
    apiKey: config.apiKey,
    timeout: config.timeout,
  });
}

/**
 * Extract JSON from AI response
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

  return text.trim();
}

/**
 * Parse and validate the chat response from AI
 */
function parseChatResponse(text: string): ChatResponse {
  const jsonStr = extractJsonFromResponse(text);

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (parseError) {
    throw new SoftSkillsError(
      "Failed to parse AI response",
      "PARSE_ERROR",
      parseError
    );
  }

  const raw = parsed as {
    message?: string;
    isComplete?: boolean;
    questionNumber?: number;
    evidenceScore?: number | null;
    statement?: string | null;
  };

  // Validate required fields
  if (!raw.message || typeof raw.message !== "string") {
    throw new SoftSkillsError(
      "Invalid response: missing message",
      "INVALID_RESPONSE"
    );
  }

  return {
    message: raw.message,
    isComplete: Boolean(raw.isComplete),
    questionNumber: Math.min(5, Math.max(1, raw.questionNumber || 1)),
    evidenceScore: raw.evidenceScore !== undefined && raw.evidenceScore !== null
      ? Math.min(5, Math.max(1, raw.evidenceScore))
      : null,
    statement: raw.statement || null,
  };
}

/**
 * Start a new soft skills assessment conversation
 */
export async function startAssessment(skillName: string): Promise<ChatResponse> {
  // Check if AI is configured
  if (!isAIConfigured()) {
    throw new SoftSkillsError(
      "AI is not configured. Please set your API key.",
      "AI_NOT_CONFIGURED"
    );
  }

  if (!skillName || skillName.trim().length === 0) {
    throw new SoftSkillsError(
      "Skill name is required",
      "INVALID_SKILL"
    );
  }

  const modelConfig = getModelConfig("conversational");
  const userPrompt = buildStartAssessmentPrompt(skillName.trim());

  try {
    const client = createClient();

    const response = await client.messages.create({
      model: modelConfig.model,
      max_tokens: 1000,
      temperature: 0.7, // Slightly higher for natural conversation
      system: SOFT_SKILLS_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    // Extract text content
    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new SoftSkillsError(
        "No response received from AI",
        "EMPTY_RESPONSE"
      );
    }

    return parseChatResponse(textContent.text);
  } catch (error) {
    // Re-throw SoftSkillsError as-is
    if (error instanceof SoftSkillsError) {
      throw error;
    }

    // Handle Anthropic API errors
    if (error instanceof Anthropic.APIError) {
      if (error.status === 401) {
        throw new SoftSkillsError(
          "Invalid API key",
          "AUTH_ERROR",
          error
        );
      }
      if (error.status === 429) {
        throw new SoftSkillsError(
          "Rate limit exceeded. Please try again.",
          "RATE_LIMIT",
          error
        );
      }
      throw new SoftSkillsError(
        `AI API error: ${error.message}`,
        "API_ERROR",
        error
      );
    }

    // Generic error
    throw new SoftSkillsError(
      "Failed to start assessment",
      "UNKNOWN_ERROR",
      error
    );
  }
}

/**
 * Continue the soft skills assessment conversation
 */
export async function continueAssessment(
  skillName: string,
  conversation: SurveyMessage[],
  userMessage: string,
  currentQuestionNumber: number
): Promise<ChatResponse> {
  // Check if AI is configured
  if (!isAIConfigured()) {
    throw new SoftSkillsError(
      "AI is not configured. Please set your API key.",
      "AI_NOT_CONFIGURED"
    );
  }

  if (!userMessage || userMessage.trim().length === 0) {
    throw new SoftSkillsError(
      "Message is required",
      "INVALID_MESSAGE"
    );
  }

  // Build conversation history for the prompt
  const conversationForPrompt = [
    ...conversation.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
    {
      role: "user" as const,
      content: userMessage.trim(),
    },
  ];

  // Build messages for API call (include full conversation)
  const apiMessages: Anthropic.MessageParam[] = [];

  // Add initial prompt
  apiMessages.push({
    role: "user",
    content: buildStartAssessmentPrompt(skillName),
  });

  // Add conversation turns
  for (const msg of conversationForPrompt) {
    apiMessages.push({
      role: msg.role,
      content: msg.content,
    });
  }

  // Add continuation prompt
  apiMessages.push({
    role: "user",
    content: buildChatPrompt(skillName, conversationForPrompt, currentQuestionNumber + 1),
  });

  const modelConfig = getModelConfig("conversational");

  try {
    const client = createClient();

    const response = await client.messages.create({
      model: modelConfig.model,
      max_tokens: 1000,
      temperature: 0.7,
      system: SOFT_SKILLS_SYSTEM_PROMPT,
      messages: apiMessages,
    });

    // Extract text content
    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new SoftSkillsError(
        "No response received from AI",
        "EMPTY_RESPONSE"
      );
    }

    return parseChatResponse(textContent.text);
  } catch (error) {
    // Re-throw SoftSkillsError as-is
    if (error instanceof SoftSkillsError) {
      throw error;
    }

    // Handle Anthropic API errors
    if (error instanceof Anthropic.APIError) {
      if (error.status === 401) {
        throw new SoftSkillsError(
          "Invalid API key",
          "AUTH_ERROR",
          error
        );
      }
      if (error.status === 429) {
        throw new SoftSkillsError(
          "Rate limit exceeded. Please try again.",
          "RATE_LIMIT",
          error
        );
      }
      throw new SoftSkillsError(
        `AI API error: ${error.message}`,
        "API_ERROR",
        error
      );
    }

    // Generic error
    throw new SoftSkillsError(
      "Failed to continue assessment",
      "UNKNOWN_ERROR",
      error
    );
  }
}
