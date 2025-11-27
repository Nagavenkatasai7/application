import { z } from "zod";

/**
 * Schema for uniqueness analysis request
 */
export const uniquenessRequestSchema = z.object({
  resumeId: z.string().uuid("Invalid resume ID"),
});

export type UniquenessRequest = z.infer<typeof uniquenessRequestSchema>;

/**
 * Schema for a single uniqueness factor
 */
export const uniquenessFactorSchema = z.object({
  id: z.string(),
  type: z.enum([
    "skill_combination",
    "career_transition",
    "unique_experience",
    "domain_expertise",
    "achievement",
    "education",
  ]),
  title: z.string(),
  description: z.string(),
  rarity: z.enum(["uncommon", "rare", "very_rare"]),
  evidence: z.array(z.string()),
  suggestion: z.string(),
});

export type UniquenessFactor = z.infer<typeof uniquenessFactorSchema>;

/**
 * Schema for uniqueness analysis result
 */
export const uniquenessResultSchema = z.object({
  score: z.number().min(0).max(100),
  scoreLabel: z.enum(["low", "moderate", "high", "exceptional"]),
  factors: z.array(uniquenessFactorSchema),
  summary: z.string(),
  differentiators: z.array(z.string()),
  suggestions: z.array(
    z.object({
      area: z.string(),
      recommendation: z.string(),
    })
  ),
});

export type UniquenessResult = z.infer<typeof uniquenessResultSchema>;

/**
 * API Response schema
 */
export const uniquenessResponseSchema = z.object({
  success: z.boolean(),
  data: uniquenessResultSchema.optional(),
  error: z
    .object({
      code: z.string(),
      message: z.string(),
    })
    .optional(),
});

export type UniquenessResponse = z.infer<typeof uniquenessResponseSchema>;

/**
 * Get score label from numeric score
 */
export function getScoreLabel(
  score: number
): "low" | "moderate" | "high" | "exceptional" {
  if (score >= 85) return "exceptional";
  if (score >= 65) return "high";
  if (score >= 40) return "moderate";
  return "low";
}

/**
 * Get rarity color for UI
 */
export function getRarityColor(
  rarity: "uncommon" | "rare" | "very_rare"
): string {
  switch (rarity) {
    case "uncommon":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "rare":
      return "bg-purple-500/10 text-purple-500 border-purple-500/20";
    case "very_rare":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
  }
}

/**
 * Get score color for UI
 */
export function getScoreColor(
  label: "low" | "moderate" | "high" | "exceptional"
): string {
  switch (label) {
    case "low":
      return "text-red-500";
    case "moderate":
      return "text-yellow-500";
    case "high":
      return "text-green-500";
    case "exceptional":
      return "text-primary";
  }
}
