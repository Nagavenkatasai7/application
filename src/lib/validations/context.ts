import { z } from "zod";

/**
 * Schema for context alignment request
 * Requires both resumeId and jobId for comparison
 */
export const contextRequestSchema = z.object({
  resumeId: z.string().uuid("Invalid resume ID"),
  jobId: z.string().uuid("Invalid job ID"),
});

export type ContextRequest = z.infer<typeof contextRequestSchema>;

/**
 * Alignment level enum
 */
export const alignmentLevelEnum = z.enum([
  "excellent",
  "good",
  "moderate",
  "weak",
  "poor",
]);

export type AlignmentLevel = z.infer<typeof alignmentLevelEnum>;

/**
 * Schema for a matched skill
 */
export const matchedSkillSchema = z.object({
  skill: z.string(),
  source: z.enum(["technical", "soft", "experience", "education"]),
  strength: z.enum(["exact", "related", "transferable"]),
  evidence: z.string(),
});

export type MatchedSkill = z.infer<typeof matchedSkillSchema>;

/**
 * Schema for a missing requirement
 */
export const missingRequirementSchema = z.object({
  requirement: z.string(),
  importance: z.enum(["critical", "important", "nice_to_have"]),
  suggestion: z.string(),
});

export type MissingRequirement = z.infer<typeof missingRequirementSchema>;

/**
 * Schema for an experience alignment
 */
export const experienceAlignmentSchema = z.object({
  experienceId: z.string(),
  experienceTitle: z.string(),
  companyName: z.string(),
  relevance: z.enum(["high", "medium", "low"]),
  matchedAspects: z.array(z.string()),
  explanation: z.string(),
});

export type ExperienceAlignment = z.infer<typeof experienceAlignmentSchema>;

/**
 * Schema for context alignment result
 */
export const contextResultSchema = z.object({
  score: z.number().min(0).max(100),
  scoreLabel: alignmentLevelEnum,
  summary: z.string(),

  // Skills analysis
  matchedSkills: z.array(matchedSkillSchema),
  missingRequirements: z.array(missingRequirementSchema),

  // Experience relevance
  experienceAlignments: z.array(experienceAlignmentSchema),

  // Keyword coverage
  keywordCoverage: z.object({
    matched: z.number(),
    total: z.number(),
    percentage: z.number(),
    keywords: z.array(z.object({
      keyword: z.string(),
      found: z.boolean(),
      location: z.string().optional(),
    })),
  }),

  // Recommendations
  suggestions: z.array(
    z.object({
      category: z.enum(["skills", "experience", "keywords", "tailoring"]),
      priority: z.enum(["high", "medium", "low"]),
      recommendation: z.string(),
    })
  ),

  // Overall fit assessment
  fitAssessment: z.object({
    strengths: z.array(z.string()),
    gaps: z.array(z.string()),
    overallFit: z.string(),
  }),
});

export type ContextResult = z.infer<typeof contextResultSchema>;

/**
 * API Response schema
 */
export const contextResponseSchema = z.object({
  success: z.boolean(),
  data: contextResultSchema.optional(),
  error: z
    .object({
      code: z.string(),
      message: z.string(),
    })
    .optional(),
});

export type ContextResponse = z.infer<typeof contextResponseSchema>;

/**
 * Get score label from numeric score
 */
export function getContextScoreLabel(score: number): AlignmentLevel {
  if (score >= 85) return "excellent";
  if (score >= 70) return "good";
  if (score >= 50) return "moderate";
  if (score >= 30) return "weak";
  return "poor";
}

/**
 * Get score color for UI
 */
export function getContextScoreColor(label: AlignmentLevel): string {
  switch (label) {
    case "excellent":
      return "text-primary";
    case "good":
      return "text-green-500";
    case "moderate":
      return "text-yellow-500";
    case "weak":
      return "text-orange-500";
    case "poor":
      return "text-red-500";
  }
}

/**
 * Get relevance color for UI
 */
export function getRelevanceColor(relevance: "high" | "medium" | "low"): string {
  switch (relevance) {
    case "high":
      return "bg-green-500/10 text-green-500 border-green-500/20";
    case "medium":
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    case "low":
      return "bg-red-500/10 text-red-500 border-red-500/20";
  }
}

/**
 * Get importance color for missing requirements
 */
export function getImportanceColor(importance: "critical" | "important" | "nice_to_have"): string {
  switch (importance) {
    case "critical":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    case "important":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "nice_to_have":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
  }
}

/**
 * Get strength color for matched skills
 */
export function getStrengthColor(strength: "exact" | "related" | "transferable"): string {
  switch (strength) {
    case "exact":
      return "bg-green-500/10 text-green-500 border-green-500/20";
    case "related":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "transferable":
      return "bg-purple-500/10 text-purple-500 border-purple-500/20";
  }
}

/**
 * Get priority color for suggestions
 */
export function getPriorityColor(priority: "high" | "medium" | "low"): string {
  switch (priority) {
    case "high":
      return "text-red-500";
    case "medium":
      return "text-amber-500";
    case "low":
      return "text-blue-500";
  }
}
