import { z } from "zod";

/**
 * Schema for impact quantification request
 */
export const impactRequestSchema = z.object({
  resumeId: z.string().uuid("Invalid resume ID"),
});

export type ImpactRequest = z.infer<typeof impactRequestSchema>;

/**
 * Improvement level for a bullet point
 */
export const improvementLevelEnum = z.enum([
  "none",      // Already well-quantified
  "minor",     // Small improvements made
  "major",     // Significant improvements made
  "transformed" // Complete transformation needed
]);

export type ImpactLevel = z.infer<typeof improvementLevelEnum>;

/**
 * Schema for a single bullet analysis
 */
export const impactBulletSchema = z.object({
  id: z.string(),
  experienceId: z.string(),
  experienceTitle: z.string(),
  companyName: z.string(),
  original: z.string(),
  improved: z.string(),
  metrics: z.array(z.string()),
  improvement: improvementLevelEnum,
  explanation: z.string(),
});

export type ImpactBullet = z.infer<typeof impactBulletSchema>;

/**
 * Score label for overall impact analysis
 */
export const impactScoreLabelEnum = z.enum([
  "weak",       // 0-39: Mostly vague, few metrics
  "moderate",   // 40-64: Some quantification
  "strong",     // 65-84: Good quantification
  "exceptional" // 85-100: Excellent metrics throughout
]);

export type ImpactScoreLabel = z.infer<typeof impactScoreLabelEnum>;

/**
 * Schema for impact analysis result
 */
export const impactResultSchema = z.object({
  score: z.number().min(0).max(100),
  scoreLabel: impactScoreLabelEnum,
  summary: z.string(),
  totalBullets: z.number(),
  bulletsImproved: z.number(),
  bullets: z.array(impactBulletSchema),
  metricCategories: z.object({
    percentage: z.number(),
    monetary: z.number(),
    time: z.number(),
    scale: z.number(),
    other: z.number(),
  }),
  suggestions: z.array(
    z.object({
      area: z.string(),
      recommendation: z.string(),
    })
  ),
});

export type ImpactResult = z.infer<typeof impactResultSchema>;

/**
 * API Response schema
 */
export const impactResponseSchema = z.object({
  success: z.boolean(),
  data: impactResultSchema.optional(),
  error: z
    .object({
      code: z.string(),
      message: z.string(),
    })
    .optional(),
});

export type ImpactResponse = z.infer<typeof impactResponseSchema>;

/**
 * Get score label from numeric score
 */
export function getImpactScoreLabel(
  score: number
): ImpactScoreLabel {
  if (score >= 85) return "exceptional";
  if (score >= 65) return "strong";
  if (score >= 40) return "moderate";
  return "weak";
}

/**
 * Get improvement level color for UI
 */
export function getImprovementColor(
  level: ImpactLevel
): string {
  switch (level) {
    case "none":
      return "bg-green-500/10 text-green-500 border-green-500/20";
    case "minor":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "major":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "transformed":
      return "bg-purple-500/10 text-purple-500 border-purple-500/20";
  }
}

/**
 * Get score color for UI
 */
export function getImpactScoreColor(
  label: ImpactScoreLabel
): string {
  switch (label) {
    case "weak":
      return "text-red-500";
    case "moderate":
      return "text-yellow-500";
    case "strong":
      return "text-green-500";
    case "exceptional":
      return "text-primary";
  }
}

/**
 * Get improvement level label for UI
 */
export function getImprovementLabel(level: ImpactLevel): string {
  switch (level) {
    case "none":
      return "Already Quantified";
    case "minor":
      return "Minor Improvement";
    case "major":
      return "Major Improvement";
    case "transformed":
      return "Transformed";
  }
}
