import Anthropic from "@anthropic-ai/sdk";
import { v4 as uuidv4 } from "uuid";
import {
  getAIConfig,
  isAIConfigured,
  getModelConfig,
} from "./config";
import { formatResumeForPrompt } from "./prompts";
import type { ResumeContent } from "@/lib/validations/resume";
import type { UniquenessResult, UniquenessFactor } from "@/lib/validations/uniqueness";
import { getScoreLabel } from "@/lib/validations/uniqueness";

/**
 * System prompt for uniqueness extraction
 */
export const UNIQUENESS_SYSTEM_PROMPT = `You are an expert career strategist and personal branding consultant with 20+ years of experience helping professionals stand out in competitive job markets. Your specialty is identifying what makes each candidate truly unique.

Your task is to analyze a resume and identify the candidate's unique differentiators - the rare combinations of skills, experiences, and achievements that set them apart from typical candidates.

## Analysis Framework

### 1. Skill Combinations
Look for unusual combinations of skills that are rarely found together:
- Technical + Creative (e.g., Data Science + UX Design)
- Technical + Business (e.g., Engineering + MBA + Sales)
- Cross-domain expertise (e.g., Healthcare + AI + Policy)

### 2. Career Transitions
Identify valuable pivots or non-linear career paths:
- Industry switches that bring unique perspectives
- Role transitions that combine different skill sets
- Entrepreneurial or freelance experiences

### 3. Unique Experiences
Find experiences that most candidates wouldn't have:
- Work in unusual industries or companies
- International or cross-cultural experience
- Leadership in unique contexts
- Notable achievements or awards

### 4. Domain Expertise
Identify deep specialization in niche areas:
- Rare technical skills
- Specialized industry knowledge
- Unique methodologies or frameworks

### 5. Achievement Patterns
Look for distinctive achievement patterns:
- Consistent track record of specific outcomes
- Unusual scale of impact
- Innovation or first-to-market accomplishments

## Scoring Guidelines

Calculate a uniqueness score from 0-100:
- 0-39: Low - Mostly common skills and experiences
- 40-64: Moderate - Some differentiating factors
- 65-84: High - Clear unique value proposition
- 85-100: Exceptional - Truly rare combination

## Output Format

Return a JSON object with this structure:
{
  "score": number (0-100),
  "factors": [
    {
      "type": "skill_combination" | "career_transition" | "unique_experience" | "domain_expertise" | "achievement" | "education",
      "title": "Brief title",
      "description": "Detailed explanation of why this is unique",
      "rarity": "uncommon" | "rare" | "very_rare",
      "evidence": ["Quote or reference from resume"],
      "suggestion": "How to emphasize this in applications"
    }
  ],
  "summary": "2-3 sentence executive summary of the candidate's unique value proposition",
  "differentiators": ["Key differentiator 1", "Key differentiator 2", ...],
  "suggestions": [
    {
      "area": "Area to improve",
      "recommendation": "Specific action to enhance uniqueness"
    }
  ]
}

Be specific and actionable. Reference actual content from the resume. Do not fabricate or assume information not present.`;

/**
 * Build the user prompt for uniqueness analysis
 */
export function buildUniquenessPrompt(resume: ResumeContent): string {
  const formattedResume = formatResumeForPrompt(resume);

  return `Analyze this resume for unique differentiators:

${formattedResume}

Identify:
1. Rare skill combinations
2. Unique career transitions
3. Distinctive experiences
4. Specialized domain expertise
5. Notable achievement patterns

Calculate a uniqueness score (0-100) and provide detailed analysis with actionable suggestions.

Return your analysis as a JSON object matching the specified schema.`;
}

/**
 * Error thrown when uniqueness analysis fails
 */
export class UniquenessError extends Error {
  constructor(
    message: string,
    public code: string,
    public cause?: unknown
  ) {
    super(message);
    this.name = "UniquenessError";
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
 * Extract JSON from AI response - handles various formats Claude might return
 */
function extractJsonFromResponse(text: string): string {
  // Log the raw response for debugging
  console.log("[Uniqueness] Raw AI response length:", text.length);
  console.log("[Uniqueness] Raw AI response preview:", text.substring(0, 500));

  // Clean the text first - remove any BOM or control characters
  let cleanText = text.replace(/^\uFEFF/, "").trim();

  // Strategy 1: Try to extract JSON from markdown code block (most common format)
  // Use a greedy match to get the LAST closing ``` to handle nested code examples
  const jsonBlockMatch = cleanText.match(/```(?:json)?\s*([\s\S]*?)```\s*$/);
  if (jsonBlockMatch) {
    console.log("[Uniqueness] Found JSON in code block (end-anchored)");
    const extracted = jsonBlockMatch[1].trim();
    if (extracted.startsWith("{") && extracted.endsWith("}")) {
      return extracted;
    }
  }

  // Strategy 2: Try non-anchored match for code block
  const jsonBlockMatch2 = cleanText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (jsonBlockMatch2) {
    console.log("[Uniqueness] Found JSON in code block (non-anchored)");
    const extracted = jsonBlockMatch2[1].trim();
    if (extracted.startsWith("{") && extracted.endsWith("}")) {
      return extracted;
    }
  }

  // Strategy 3: Find JSON object with balanced brace matching
  const startIndex = cleanText.indexOf("{");
  if (startIndex !== -1) {
    let braceCount = 0;
    let endIndex = -1;
    let inString = false;
    let escapeNext = false;

    for (let i = startIndex; i < cleanText.length; i++) {
      const char = cleanText[i];

      if (escapeNext) {
        escapeNext = false;
        continue;
      }

      if (char === "\\") {
        escapeNext = true;
        continue;
      }

      if (char === '"' && !escapeNext) {
        inString = !inString;
        continue;
      }

      if (!inString) {
        if (char === "{") braceCount++;
        if (char === "}") braceCount--;
        if (braceCount === 0) {
          endIndex = i;
          break;
        }
      }
    }

    if (endIndex !== -1) {
      const jsonStr = cleanText.substring(startIndex, endIndex + 1);
      console.log("[Uniqueness] Found JSON object via brace matching, length:", jsonStr.length);
      return jsonStr;
    }
  }

  // Strategy 4: Last resort - try to find any valid JSON structure
  const lastBrace = cleanText.lastIndexOf("}");
  const firstBrace = cleanText.indexOf("{");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const jsonStr = cleanText.substring(firstBrace, lastBrace + 1);
    console.log("[Uniqueness] Found JSON object via first/last brace, length:", jsonStr.length);
    return jsonStr;
  }

  console.log("[Uniqueness] No JSON found, returning raw text");
  return cleanText;
}

/**
 * Analyze a resume for uniqueness factors
 */
export async function analyzeUniqueness(
  resume: ResumeContent
): Promise<UniquenessResult> {
  // Check if AI is configured
  if (!isAIConfigured()) {
    throw new UniquenessError(
      "AI is not configured. Please set your API key.",
      "AI_NOT_CONFIGURED"
    );
  }

  // Validate resume has content to analyze
  if (!resume.experiences?.length && !resume.skills?.technical?.length) {
    throw new UniquenessError(
      "Resume must have experiences or skills to analyze.",
      "INSUFFICIENT_CONTENT"
    );
  }

  const modelConfig = getModelConfig("jobMatchAnalysis"); // Use analytical config
  const userPrompt = buildUniquenessPrompt(resume);

  try {
    const client = createClient();

    const response = await client.messages.create({
      model: modelConfig.model,
      max_tokens: 2500,
      temperature: 0.4, // Lower temperature for consistent analysis
      system: UNIQUENESS_SYSTEM_PROMPT,
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
      throw new UniquenessError(
        "No response received from AI",
        "EMPTY_RESPONSE"
      );
    }

    // Parse JSON response
    const jsonStr = extractJsonFromResponse(textContent.text);

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (parseError) {
      // Log detailed error information for debugging
      console.error("[Uniqueness] JSON parse error:", parseError);
      console.error("[Uniqueness] Attempted to parse (first 1000 chars):", jsonStr.substring(0, 1000));
      console.error("[Uniqueness] Attempted to parse (last 500 chars):", jsonStr.substring(jsonStr.length - 500));

      const errorMessage = parseError instanceof Error ? parseError.message : "Unknown parse error";
      throw new UniquenessError(
        `Failed to parse AI response: ${errorMessage}`,
        "PARSE_ERROR",
        parseError
      );
    }

    // Type-check and transform the response
    const rawResult = parsed as {
      score?: number;
      factors?: Array<{
        type?: string;
        title?: string;
        description?: string;
        rarity?: string;
        evidence?: string[];
        suggestion?: string;
      }>;
      summary?: string;
      differentiators?: string[];
      suggestions?: Array<{
        area?: string;
        recommendation?: string;
      }>;
    };

    // Validate and transform factors
    const factors: UniquenessFactor[] = (rawResult.factors || []).map((f, index) => ({
      id: uuidv4(),
      type: validateFactorType(f.type) || "unique_experience",
      title: f.title || `Factor ${index + 1}`,
      description: f.description || "",
      rarity: validateRarity(f.rarity) || "uncommon",
      evidence: f.evidence || [],
      suggestion: f.suggestion || "",
    }));

    const score = Math.max(0, Math.min(100, rawResult.score || 50));

    const result: UniquenessResult = {
      score,
      scoreLabel: getScoreLabel(score),
      factors,
      summary: rawResult.summary || "Analysis complete.",
      differentiators: rawResult.differentiators || [],
      suggestions: (rawResult.suggestions || []).map((s) => ({
        area: s.area || "General",
        recommendation: s.recommendation || "",
      })),
    };

    return result;
  } catch (error) {
    // Re-throw UniquenessError as-is
    if (error instanceof UniquenessError) {
      throw error;
    }

    // Handle Anthropic API errors
    if (error instanceof Anthropic.APIError) {
      if (error.status === 401) {
        throw new UniquenessError(
          "Invalid API key",
          "AUTH_ERROR",
          error
        );
      }
      if (error.status === 429) {
        throw new UniquenessError(
          "Rate limit exceeded. Please try again.",
          "RATE_LIMIT",
          error
        );
      }
      throw new UniquenessError(
        `AI API error: ${error.message}`,
        "API_ERROR",
        error
      );
    }

    // Generic error
    throw new UniquenessError(
      "Failed to analyze uniqueness",
      "UNKNOWN_ERROR",
      error
    );
  }
}

/**
 * Validate factor type
 */
function validateFactorType(
  type?: string
): UniquenessFactor["type"] | undefined {
  const validTypes = [
    "skill_combination",
    "career_transition",
    "unique_experience",
    "domain_expertise",
    "achievement",
    "education",
  ] as const;

  if (type && validTypes.includes(type as typeof validTypes[number])) {
    return type as UniquenessFactor["type"];
  }
  return undefined;
}

/**
 * Validate rarity level
 */
function validateRarity(
  rarity?: string
): UniquenessFactor["rarity"] | undefined {
  const validRarities = ["uncommon", "rare", "very_rare"] as const;

  if (rarity && validRarities.includes(rarity as typeof validRarities[number])) {
    return rarity as UniquenessFactor["rarity"];
  }
  return undefined;
}
