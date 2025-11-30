import Anthropic from "@anthropic-ai/sdk";
import {
  getAIConfig,
  isAIConfigured,
  getModelConfig,
} from "./config";
import { formatResumeForPrompt } from "./prompts";
import { parseAIJsonResponse, JSON_OUTPUT_INSTRUCTIONS } from "./json-utils";
import type { ResumeContent } from "@/lib/validations/resume";
import type { ContextResult, MatchedSkill, MissingRequirement, ExperienceAlignment } from "@/lib/validations/context";
import { getContextScoreLabel } from "@/lib/validations/context";

/**
 * Job data interface for context analysis
 */
export interface JobData {
  title: string;
  companyName: string | null;
  description: string | null;
  requirements: string[] | null;
  skills: string[] | null;
}

/**
 * System prompt for context alignment analysis
 */
export const CONTEXT_SYSTEM_PROMPT = `You are an expert ATS (Applicant Tracking System) analyst and career coach with 20+ years of experience helping professionals optimize their job applications. Your specialty is analyzing the alignment between a candidate's resume and a specific job opportunity.

Your task is to provide a comprehensive context alignment analysis that helps candidates understand how well their resume matches a job and what they can do to improve their chances.

## Analysis Framework

### 1. Skills Matching
Analyze skill alignment at multiple levels:
- **Exact Match**: Skills mentioned identically in both resume and job
- **Related Match**: Similar or synonymous skills (e.g., "React" matches "React.js")
- **Transferable Match**: Skills that demonstrate relevant capability (e.g., "Angular" for "React" role)

Categorize skill sources:
- Technical skills from skills section
- Soft skills from skills section
- Skills demonstrated in experience bullets
- Skills from education or certifications

### 2. Requirements Gap Analysis
For each job requirement, determine:
- **Critical**: Must-have requirements that could disqualify the candidate
- **Important**: Strongly preferred qualifications
- **Nice-to-have**: Bonus qualifications that enhance candidacy

### 3. Experience Relevance
Evaluate each work experience for:
- Relevance to the target role
- Matching responsibilities
- Industry alignment
- Level of seniority match

### 4. Keyword Coverage
Analyze ATS optimization:
- Key technical terms from the job description
- Industry-specific terminology
- Action verbs and achievement language
- Company-specific language

## Scoring Guidelines

Calculate an alignment score from 0-100:
- 0-29: Poor - Major gaps, unlikely to pass ATS
- 30-49: Weak - Significant gaps to address
- 50-69: Moderate - Some alignment, needs optimization
- 70-84: Good - Strong alignment with minor gaps
- 85-100: Excellent - Exceptional match

## Output Format

Return a JSON object with this structure:
{
  "score": 75,
  "summary": "2-3 sentence executive summary of the alignment",
  "matchedSkills": [
    {
      "skill": "Skill name",
      "source": "technical",
      "strength": "exact",
      "evidence": "Where this skill was found in the resume"
    }
  ],
  "missingRequirements": [
    {
      "requirement": "What's missing",
      "importance": "critical",
      "suggestion": "How to address this gap"
    }
  ],
  "experienceAlignments": [
    {
      "experienceId": "ID from resume",
      "experienceTitle": "Job title",
      "companyName": "Company name",
      "relevance": "high",
      "matchedAspects": ["Aspect 1", "Aspect 2"],
      "explanation": "Why this experience is relevant or not"
    }
  ],
  "keywordCoverage": {
    "matched": 10,
    "total": 15,
    "percentage": 67,
    "keywords": [
      { "keyword": "React", "found": true, "location": "Skills section" }
    ]
  },
  "suggestions": [
    {
      "category": "skills",
      "priority": "high",
      "recommendation": "Specific action to take"
    }
  ],
  "fitAssessment": {
    "strengths": ["Key strength 1", "Key strength 2"],
    "gaps": ["Gap 1", "Gap 2"],
    "overallFit": "Summary assessment of candidate fit"
  }
}

IMPORTANT: Valid values for "source": "technical", "soft", "experience", "education"
Valid values for "strength": "exact", "related", "transferable"
Valid values for "importance": "critical", "important", "nice_to_have"
Valid values for "relevance": "high", "medium", "low"
Valid values for "category": "skills", "experience", "keywords", "tailoring"
Valid values for "priority": "high", "medium", "low"

Be specific and actionable. Reference actual content from both the resume and job description. Do not fabricate or assume information not present.` + JSON_OUTPUT_INSTRUCTIONS;

/**
 * Format job data for the prompt
 */
function formatJobForPrompt(job: JobData): string {
  const sections: string[] = [];

  sections.push(`## Target Job
**Position:** ${job.title}
**Company:** ${job.companyName || "Not specified"}`);

  if (job.description) {
    sections.push(`## Job Description
${job.description}`);
  }

  if (job.requirements && job.requirements.length > 0) {
    sections.push(`## Requirements
${job.requirements.map((r) => `- ${r}`).join("\n")}`);
  }

  if (job.skills && job.skills.length > 0) {
    sections.push(`## Required Skills
${job.skills.map((s) => `- ${s}`).join("\n")}`);
  }

  return sections.join("\n\n");
}

/**
 * Build the user prompt for context alignment analysis
 */
export function buildContextPrompt(resume: ResumeContent, job: JobData): string {
  const formattedResume = formatResumeForPrompt(resume);
  const formattedJob = formatJobForPrompt(job);

  return `Analyze the alignment between this resume and job opportunity:

# JOB OPPORTUNITY
${formattedJob}

# CANDIDATE RESUME
${formattedResume}

Provide a comprehensive context alignment analysis including:
1. Overall alignment score (0-100)
2. Skills that match the job requirements
3. Missing requirements and how to address them
4. Relevance of each work experience
5. Keyword coverage analysis for ATS optimization
6. Prioritized suggestions for improvement
7. Overall fit assessment with strengths and gaps

Return your analysis as a JSON object matching the specified schema.`;
}

/**
 * Error thrown when context analysis fails
 */
export class ContextError extends Error {
  constructor(
    message: string,
    public code: string,
    public cause?: unknown
  ) {
    super(message);
    this.name = "ContextError";
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
 * Validate skill source
 */
function validateSkillSource(source?: string): MatchedSkill["source"] {
  const validSources = ["technical", "soft", "experience", "education"] as const;
  if (source && validSources.includes(source as typeof validSources[number])) {
    return source as MatchedSkill["source"];
  }
  return "technical";
}

/**
 * Validate skill strength
 */
function validateSkillStrength(strength?: string): MatchedSkill["strength"] {
  const validStrengths = ["exact", "related", "transferable"] as const;
  if (strength && validStrengths.includes(strength as typeof validStrengths[number])) {
    return strength as MatchedSkill["strength"];
  }
  return "related";
}

/**
 * Validate importance level
 */
function validateImportance(importance?: string): MissingRequirement["importance"] {
  const validLevels = ["critical", "important", "nice_to_have"] as const;
  if (importance && validLevels.includes(importance as typeof validLevels[number])) {
    return importance as MissingRequirement["importance"];
  }
  return "important";
}

/**
 * Validate relevance level
 */
function validateRelevance(relevance?: string): ExperienceAlignment["relevance"] {
  const validLevels = ["high", "medium", "low"] as const;
  if (relevance && validLevels.includes(relevance as typeof validLevels[number])) {
    return relevance as ExperienceAlignment["relevance"];
  }
  return "medium";
}

/**
 * Validate suggestion category
 */
function validateCategory(category?: string): "skills" | "experience" | "keywords" | "tailoring" {
  const validCategories = ["skills", "experience", "keywords", "tailoring"] as const;
  if (category && validCategories.includes(category as typeof validCategories[number])) {
    return category as typeof validCategories[number];
  }
  return "tailoring";
}

/**
 * Validate priority level
 */
function validatePriority(priority?: string): "high" | "medium" | "low" {
  const validPriorities = ["high", "medium", "low"] as const;
  if (priority && validPriorities.includes(priority as typeof validPriorities[number])) {
    return priority as typeof validPriorities[number];
  }
  return "medium";
}

/**
 * Analyze context alignment between a resume and job
 */
export async function analyzeContext(
  resume: ResumeContent,
  job: JobData
): Promise<ContextResult> {
  // Check if AI is configured
  if (!isAIConfigured()) {
    throw new ContextError(
      "AI is not configured. Please set your API key.",
      "AI_NOT_CONFIGURED"
    );
  }

  // Validate resume has content to analyze
  if (!resume.experiences?.length && !resume.skills?.technical?.length) {
    throw new ContextError(
      "Resume must have experiences or skills to analyze.",
      "INSUFFICIENT_CONTENT"
    );
  }

  // Validate job has description
  if (!job.description && (!job.requirements?.length) && (!job.skills?.length)) {
    throw new ContextError(
      "Job must have a description, requirements, or skills to analyze.",
      "INSUFFICIENT_JOB_CONTENT"
    );
  }

  const modelConfig = getModelConfig("jobMatchAnalysis");
  const userPrompt = buildContextPrompt(resume, job);

  try {
    const client = createClient();

    const response = await client.messages.create({
      model: modelConfig.model,
      max_tokens: 4000,
      temperature: 0.3, // Lower temperature for consistent analysis
      system: CONTEXT_SYSTEM_PROMPT,
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
      throw new ContextError(
        "No response received from AI",
        "EMPTY_RESPONSE"
      );
    }

    // Parse JSON response using shared utility with state-machine repair
    let rawResult: {
      score?: number;
      summary?: string;
      matchedSkills?: Array<{
        skill?: string;
        source?: string;
        strength?: string;
        evidence?: string;
      }>;
      missingRequirements?: Array<{
        requirement?: string;
        importance?: string;
        suggestion?: string;
      }>;
      experienceAlignments?: Array<{
        experienceId?: string;
        experienceTitle?: string;
        companyName?: string;
        relevance?: string;
        matchedAspects?: string[];
        explanation?: string;
      }>;
      keywordCoverage?: {
        matched?: number;
        total?: number;
        percentage?: number;
        keywords?: Array<{
          keyword?: string;
          found?: boolean;
          location?: string;
        }>;
      };
      suggestions?: Array<{
        category?: string;
        priority?: string;
        recommendation?: string;
      }>;
      fitAssessment?: {
        strengths?: string[];
        gaps?: string[];
        overallFit?: string;
      };
    };

    try {
      rawResult = parseAIJsonResponse<typeof rawResult>(textContent.text, "Context");
    } catch (parseError) {
      const errorMessage = parseError instanceof Error ? parseError.message : "Unknown parse error";
      throw new ContextError(
        `Failed to parse AI response: ${errorMessage}`,
        "PARSE_ERROR",
        parseError
      );
    }

    // Transform matched skills
    const matchedSkills: MatchedSkill[] = (rawResult.matchedSkills || []).map((s) => ({
      skill: s.skill || "",
      source: validateSkillSource(s.source),
      strength: validateSkillStrength(s.strength),
      evidence: s.evidence || "",
    }));

    // Transform missing requirements
    const missingRequirements: MissingRequirement[] = (rawResult.missingRequirements || []).map((r) => ({
      requirement: r.requirement || "",
      importance: validateImportance(r.importance),
      suggestion: r.suggestion || "",
    }));

    // Transform experience alignments
    const experienceAlignments: ExperienceAlignment[] = (rawResult.experienceAlignments || []).map((e, index) => ({
      experienceId: e.experienceId || `exp-${index}`,
      experienceTitle: e.experienceTitle || "",
      companyName: e.companyName || "",
      relevance: validateRelevance(e.relevance),
      matchedAspects: e.matchedAspects || [],
      explanation: e.explanation || "",
    }));

    // Transform keyword coverage
    const keywordCoverage = {
      matched: rawResult.keywordCoverage?.matched || 0,
      total: rawResult.keywordCoverage?.total || 0,
      percentage: rawResult.keywordCoverage?.percentage || 0,
      keywords: (rawResult.keywordCoverage?.keywords || []).map((k) => ({
        keyword: k.keyword || "",
        found: k.found ?? false,
        location: k.location,
      })),
    };

    // Transform suggestions
    const suggestions = (rawResult.suggestions || []).map((s) => ({
      category: validateCategory(s.category),
      priority: validatePriority(s.priority),
      recommendation: s.recommendation || "",
    }));

    // Transform fit assessment
    const fitAssessment = {
      strengths: rawResult.fitAssessment?.strengths || [],
      gaps: rawResult.fitAssessment?.gaps || [],
      overallFit: rawResult.fitAssessment?.overallFit || "",
    };

    const score = Math.max(0, Math.min(100, rawResult.score || 50));

    const result: ContextResult = {
      score,
      scoreLabel: getContextScoreLabel(score),
      summary: rawResult.summary || "Analysis complete.",
      matchedSkills,
      missingRequirements,
      experienceAlignments,
      keywordCoverage,
      suggestions,
      fitAssessment,
    };

    return result;
  } catch (error) {
    // Re-throw ContextError as-is
    if (error instanceof ContextError) {
      throw error;
    }

    // Handle Anthropic API errors
    if (error instanceof Anthropic.APIError) {
      if (error.status === 401) {
        throw new ContextError(
          "Invalid API key",
          "AUTH_ERROR",
          error
        );
      }
      if (error.status === 429) {
        throw new ContextError(
          "Rate limit exceeded. Please try again.",
          "RATE_LIMIT",
          error
        );
      }
      throw new ContextError(
        `AI API error: ${error.message}`,
        "API_ERROR",
        error
      );
    }

    // Generic error
    throw new ContextError(
      "Failed to analyze context alignment",
      "UNKNOWN_ERROR",
      error
    );
  }
}
