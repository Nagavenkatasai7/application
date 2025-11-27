import { z } from "zod";

/**
 * Schema for company research request
 */
export const companyResearchRequestSchema = z.object({
  companyName: z
    .string()
    .min(1, "Company name is required")
    .max(200, "Company name too long"),
});

export type CompanyResearchRequest = z.infer<typeof companyResearchRequestSchema>;

/**
 * Culture dimension schema (1-5 scale rating)
 */
export const cultureDimensionSchema = z.object({
  dimension: z.string(),
  score: z.number().min(1).max(5),
  description: z.string(),
});

export type CultureDimension = z.infer<typeof cultureDimensionSchema>;

/**
 * Funding round schema
 */
export const fundingRoundSchema = z.object({
  round: z.string(),
  amount: z.string().optional(),
  date: z.string().optional(),
  investors: z.array(z.string()).optional(),
});

export type FundingRound = z.infer<typeof fundingRoundSchema>;

/**
 * Interview tip schema
 */
export const interviewTipSchema = z.object({
  category: z.enum(["preparation", "technical", "behavioral", "cultural_fit", "questions_to_ask"]),
  tip: z.string(),
  priority: z.enum(["high", "medium", "low"]),
});

export type InterviewTip = z.infer<typeof interviewTipSchema>;

/**
 * Competitor schema
 */
export const competitorSchema = z.object({
  name: z.string(),
  relationship: z.string(),
});

export type Competitor = z.infer<typeof competitorSchema>;

/**
 * Glassdoor-style data schema
 */
export const glassdoorDataSchema = z.object({
  overallRating: z.number().min(1).max(5).nullable(),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  recommendToFriend: z.string().nullable(),
  ceoApproval: z.string().nullable(),
});

export type GlassdoorData = z.infer<typeof glassdoorDataSchema>;

/**
 * Funding data schema
 */
export const fundingDataSchema = z.object({
  stage: z.string().nullable(),
  totalRaised: z.string().nullable(),
  valuation: z.string().nullable(),
  lastRound: fundingRoundSchema.nullable(),
  notableInvestors: z.array(z.string()),
});

export type FundingData = z.infer<typeof fundingDataSchema>;

/**
 * Schema for company research result
 */
export const companyResearchResultSchema = z.object({
  // Basic info
  companyName: z.string(),
  industry: z.string(),
  summary: z.string(),
  founded: z.string().nullable(),
  headquarters: z.string().nullable(),
  employeeCount: z.string().nullable(),
  website: z.string().nullable(),

  // Culture analysis
  cultureDimensions: z.array(cultureDimensionSchema),
  cultureOverview: z.string(),

  // Glassdoor-style insights
  glassdoorData: glassdoorDataSchema,

  // Funding information
  fundingData: fundingDataSchema,

  // Competitors
  competitors: z.array(competitorSchema),

  // Interview preparation
  interviewTips: z.array(interviewTipSchema),
  commonInterviewTopics: z.array(z.string()),

  // Values alignment
  coreValues: z.array(z.string()),
  valuesAlignment: z.array(
    z.object({
      value: z.string(),
      howToDemo: z.string(),
    })
  ),

  // Key takeaways
  keyTakeaways: z.array(z.string()),
});

export type CompanyResearchResult = z.infer<typeof companyResearchResultSchema>;

/**
 * API Response schema
 */
export const companyResearchResponseSchema = z.object({
  success: z.boolean(),
  data: companyResearchResultSchema.optional(),
  cached: z.boolean().optional(),
  error: z
    .object({
      code: z.string(),
      message: z.string(),
    })
    .optional(),
});

export type CompanyResearchResponse = z.infer<typeof companyResearchResponseSchema>;

/**
 * Culture dimension labels
 */
export const CULTURE_DIMENSIONS = [
  "Work-Life Balance",
  "Innovation",
  "Collaboration",
  "Career Growth",
  "Diversity & Inclusion",
  "Compensation & Benefits",
  "Management Quality",
  "Job Security",
] as const;

/**
 * Get score label for culture dimension
 */
export function getCultureScoreLabel(score: number): string {
  if (score >= 4.5) return "Excellent";
  if (score >= 3.5) return "Good";
  if (score >= 2.5) return "Average";
  if (score >= 1.5) return "Below Average";
  return "Poor";
}

/**
 * Get score color for culture dimension
 */
export function getCultureScoreColor(score: number): string {
  if (score >= 4.5) return "text-primary";
  if (score >= 3.5) return "text-green-500";
  if (score >= 2.5) return "text-yellow-500";
  if (score >= 1.5) return "text-orange-500";
  return "text-red-500";
}

/**
 * Get background color for culture score
 */
export function getCultureScoreBgColor(score: number): string {
  if (score >= 4.5) return "bg-primary/10 border-primary/20";
  if (score >= 3.5) return "bg-green-500/10 border-green-500/20";
  if (score >= 2.5) return "bg-yellow-500/10 border-yellow-500/20";
  if (score >= 1.5) return "bg-orange-500/10 border-orange-500/20";
  return "bg-red-500/10 border-red-500/20";
}

/**
 * Get interview tip category label
 */
export function getInterviewCategoryLabel(category: InterviewTip["category"]): string {
  const labels: Record<InterviewTip["category"], string> = {
    preparation: "Preparation",
    technical: "Technical",
    behavioral: "Behavioral",
    cultural_fit: "Cultural Fit",
    questions_to_ask: "Questions to Ask",
  };
  return labels[category];
}

/**
 * Get priority color for interview tips
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

/**
 * Get priority background color
 */
export function getPriorityBgColor(priority: "high" | "medium" | "low"): string {
  switch (priority) {
    case "high":
      return "bg-red-500/10 border-red-500/20";
    case "medium":
      return "bg-amber-500/10 border-amber-500/20";
    case "low":
      return "bg-blue-500/10 border-blue-500/20";
  }
}
