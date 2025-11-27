import Anthropic from "@anthropic-ai/sdk";
import { v4 as uuidv4 } from "uuid";
import {
  getAIConfig,
  isAIConfigured,
  getModelConfig,
} from "./config";
import { formatResumeForPrompt } from "./prompts";
import type { ResumeContent } from "@/lib/validations/resume";
import type { ImpactResult, ImpactBullet, ImpactLevel } from "@/lib/validations/impact";
import { getImpactScoreLabel } from "@/lib/validations/impact";

/**
 * System prompt for impact quantification
 */
export const IMPACT_SYSTEM_PROMPT = `You are an expert resume writer and career coach with 20+ years of experience transforming vague job descriptions into powerful, metrics-driven achievement statements. Your specialty is helping professionals quantify their impact.

Your task is to analyze resume bullet points and transform them into quantified achievement statements with specific metrics.

## Quantification Framework

### Types of Metrics to Add

1. **Percentages (%)**
   - Improvement rates: "Improved efficiency by 40%"
   - Growth metrics: "Increased sales by 150%"
   - Reduction metrics: "Reduced costs by 25%"

2. **Monetary Values ($)**
   - Revenue generated: "Generated $2M in new revenue"
   - Cost savings: "Saved $500K annually"
   - Budget managed: "Managed $3M project budget"

3. **Time Metrics**
   - Time saved: "Reduced processing time from 2 weeks to 2 days"
   - Speed improvements: "Accelerated delivery by 3 weeks"
   - Frequency: "Delivered weekly reports to 50+ stakeholders"

4. **Scale/Volume Metrics**
   - Team size: "Led team of 12 engineers"
   - User base: "Served 100K+ daily active users"
   - Volume: "Processed 1M+ transactions daily"

5. **Other Quantifiable Metrics**
   - Rankings: "Ranked #1 in customer satisfaction"
   - Awards: "Won 3 innovation awards"
   - Certifications: "Achieved 99.9% uptime"

## Transformation Guidelines

1. **Start with action verbs**: Led, Developed, Implemented, Achieved, Increased, Reduced
2. **Add specific numbers**: Even estimates are better than vague descriptions
3. **Show impact/results**: What was the outcome of the action?
4. **Keep it concise**: 1-2 lines maximum per bullet
5. **Use the CAR format**: Challenge → Action → Result
6. **Be realistic**: Don't fabricate metrics, but help estimate reasonable ones based on context

## Scoring Guidelines

Calculate an impact quantification score from 0-100:
- 0-39: Weak - Most bullets lack metrics
- 40-64: Moderate - Some quantification present
- 65-84: Strong - Good use of metrics
- 85-100: Exceptional - Excellent quantification throughout

## Output Format

Return a JSON object with this structure:
{
  "score": number (0-100),
  "summary": "2-3 sentence summary of the overall quantification level",
  "bullets": [
    {
      "experienceId": "id from resume",
      "experienceTitle": "job title",
      "companyName": "company name",
      "original": "original bullet text",
      "improved": "improved bullet with metrics",
      "metrics": ["metric1", "metric2"],
      "improvement": "none" | "minor" | "major" | "transformed",
      "explanation": "Why this improvement was made"
    }
  ],
  "metricCategories": {
    "percentage": count of % metrics,
    "monetary": count of $ metrics,
    "time": count of time metrics,
    "scale": count of scale/volume metrics,
    "other": count of other metrics
  },
  "suggestions": [
    {
      "area": "Area for improvement",
      "recommendation": "Specific action to add more metrics"
    }
  ]
}

Be specific and actionable. If a bullet is already well-quantified, mark improvement as "none" and keep the original. Do not fabricate information not present or inferable from the resume.`;

/**
 * Build the user prompt for impact analysis
 */
export function buildImpactPrompt(resume: ResumeContent): string {
  const formattedResume = formatResumeForPrompt(resume);

  // Extract all bullets for analysis
  const bulletsForAnalysis = resume.experiences.flatMap((exp) =>
    exp.bullets.map((bullet) => ({
      experienceId: exp.id,
      experienceTitle: exp.title,
      companyName: exp.company,
      bulletId: bullet.id,
      text: bullet.text,
    }))
  );

  return `Analyze and quantify the impact of each bullet point in this resume:

${formattedResume}

## Bullets to Analyze
${bulletsForAnalysis
  .map(
    (b, i) =>
      `${i + 1}. [${b.experienceTitle} at ${b.companyName}] "${b.text}" (experienceId: ${b.experienceId})`
  )
  .join("\n")}

For each bullet:
1. If it lacks quantification, transform it with specific metrics
2. If it's already quantified, mark as "none" improvement
3. Explain what metrics were added and why

Calculate an overall impact quantification score (0-100) and provide actionable suggestions.

Return your analysis as a JSON object matching the specified schema.`;
}

/**
 * Error thrown when impact analysis fails
 */
export class ImpactError extends Error {
  constructor(
    message: string,
    public code: string,
    public cause?: unknown
  ) {
    super(message);
    this.name = "ImpactError";
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
 * Analyze a resume for impact quantification opportunities
 */
export async function analyzeImpact(
  resume: ResumeContent
): Promise<ImpactResult> {
  // Check if AI is configured
  if (!isAIConfigured()) {
    throw new ImpactError(
      "AI is not configured. Please set your API key.",
      "AI_NOT_CONFIGURED"
    );
  }

  // Validate resume has experience bullets to analyze
  const totalBullets = resume.experiences.reduce(
    (sum, exp) => sum + exp.bullets.length,
    0
  );

  if (totalBullets === 0) {
    throw new ImpactError(
      "Resume must have experience bullets to analyze.",
      "INSUFFICIENT_CONTENT"
    );
  }

  const modelConfig = getModelConfig("jobMatchAnalysis"); // Use analytical config
  const userPrompt = buildImpactPrompt(resume);

  try {
    const client = createClient();

    const response = await client.messages.create({
      model: modelConfig.model,
      max_tokens: 4000, // More tokens needed for bullet-by-bullet analysis
      temperature: 0.4, // Lower temperature for consistent analysis
      system: IMPACT_SYSTEM_PROMPT,
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
      throw new ImpactError(
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
      throw new ImpactError(
        "Failed to parse AI response",
        "PARSE_ERROR",
        parseError
      );
    }

    // Type-check and transform the response
    const rawResult = parsed as {
      score?: number;
      summary?: string;
      bullets?: Array<{
        experienceId?: string;
        experienceTitle?: string;
        companyName?: string;
        original?: string;
        improved?: string;
        metrics?: string[];
        improvement?: string;
        explanation?: string;
      }>;
      metricCategories?: {
        percentage?: number;
        monetary?: number;
        time?: number;
        scale?: number;
        other?: number;
      };
      suggestions?: Array<{
        area?: string;
        recommendation?: string;
      }>;
    };

    // Validate and transform bullets
    const bullets: ImpactBullet[] = (rawResult.bullets || []).map((b, index) => ({
      id: uuidv4(),
      experienceId: b.experienceId || `exp-${index}`,
      experienceTitle: b.experienceTitle || "Unknown Position",
      companyName: b.companyName || "Unknown Company",
      original: b.original || "",
      improved: b.improved || b.original || "",
      metrics: b.metrics || [],
      improvement: validateImprovementLevel(b.improvement) || "none",
      explanation: b.explanation || "",
    }));

    const score = Math.max(0, Math.min(100, rawResult.score || 50));
    const bulletsImproved = bullets.filter(
      (b) => b.improvement !== "none"
    ).length;

    const result: ImpactResult = {
      score,
      scoreLabel: getImpactScoreLabel(score),
      summary: rawResult.summary || "Analysis complete.",
      totalBullets,
      bulletsImproved,
      bullets,
      metricCategories: {
        percentage: rawResult.metricCategories?.percentage || 0,
        monetary: rawResult.metricCategories?.monetary || 0,
        time: rawResult.metricCategories?.time || 0,
        scale: rawResult.metricCategories?.scale || 0,
        other: rawResult.metricCategories?.other || 0,
      },
      suggestions: (rawResult.suggestions || []).map((s) => ({
        area: s.area || "General",
        recommendation: s.recommendation || "",
      })),
    };

    return result;
  } catch (error) {
    // Re-throw ImpactError as-is
    if (error instanceof ImpactError) {
      throw error;
    }

    // Handle Anthropic API errors
    if (error instanceof Anthropic.APIError) {
      if (error.status === 401) {
        throw new ImpactError(
          "Invalid API key",
          "AUTH_ERROR",
          error
        );
      }
      if (error.status === 429) {
        throw new ImpactError(
          "Rate limit exceeded. Please try again.",
          "RATE_LIMIT",
          error
        );
      }
      throw new ImpactError(
        `AI API error: ${error.message}`,
        "API_ERROR",
        error
      );
    }

    // Generic error
    throw new ImpactError(
      "Failed to analyze impact",
      "UNKNOWN_ERROR",
      error
    );
  }
}

/**
 * Validate improvement level
 */
function validateImprovementLevel(
  level?: string
): ImpactLevel | undefined {
  const validLevels = ["none", "minor", "major", "transformed"] as const;

  if (level && validLevels.includes(level as typeof validLevels[number])) {
    return level as ImpactLevel;
  }
  return undefined;
}
