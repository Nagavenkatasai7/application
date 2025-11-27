import { z } from "zod";

/**
 * Schema for chat message in soft skills survey
 */
export const surveyMessageSchema = z.object({
  role: z.enum(["assistant", "user"]),
  content: z.string().min(1, "Message cannot be empty"),
});

export type SurveyMessage = z.infer<typeof surveyMessageSchema>;

/**
 * Schema for starting a new soft skills assessment
 */
export const startAssessmentRequestSchema = z.object({
  skillName: z.string().min(1, "Skill name is required").max(100, "Skill name too long"),
});

export type StartAssessmentRequest = z.infer<typeof startAssessmentRequestSchema>;

/**
 * Schema for chat request in soft skills survey
 */
export const chatRequestSchema = z.object({
  skillId: z.string().uuid("Invalid skill ID"),
  message: z.string().min(1, "Message cannot be empty").max(2000, "Message too long"),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;

/**
 * Schema for AI chat response
 */
export const chatResponseSchema = z.object({
  message: z.string(),
  isComplete: z.boolean(),
  questionNumber: z.number().min(1).max(5),
  evidenceScore: z.number().min(1).max(5).nullable(),
  statement: z.string().nullable(),
});

export type ChatResponse = z.infer<typeof chatResponseSchema>;

/**
 * Schema for soft skill assessment result
 */
export const assessmentResultSchema = z.object({
  id: z.string(),
  skillName: z.string(),
  evidenceScore: z.number().min(1).max(5),
  statement: z.string(),
  conversation: z.array(surveyMessageSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type AssessmentResult = z.infer<typeof assessmentResultSchema>;

/**
 * Common soft skills list for the survey
 */
export const SOFT_SKILLS_LIST = [
  "Leadership",
  "Communication",
  "Problem Solving",
  "Teamwork",
  "Adaptability",
  "Time Management",
  "Critical Thinking",
  "Creativity",
  "Emotional Intelligence",
  "Conflict Resolution",
  "Decision Making",
  "Negotiation",
  "Public Speaking",
  "Active Listening",
  "Mentoring",
] as const;

export type SoftSkillName = typeof SOFT_SKILLS_LIST[number];

/**
 * Get evidence score label
 */
export function getEvidenceScoreLabel(score: number): string {
  switch (score) {
    case 1:
      return "Developing";
    case 2:
      return "Foundational";
    case 3:
      return "Competent";
    case 4:
      return "Proficient";
    case 5:
      return "Expert";
    default:
      return "Unknown";
  }
}

/**
 * Get evidence score color for UI
 */
export function getEvidenceScoreColor(score: number): string {
  switch (score) {
    case 1:
      return "text-red-500";
    case 2:
      return "text-orange-500";
    case 3:
      return "text-yellow-500";
    case 4:
      return "text-green-500";
    case 5:
      return "text-primary";
    default:
      return "text-muted-foreground";
  }
}

/**
 * Get evidence score background color for UI
 */
export function getEvidenceScoreBgColor(score: number): string {
  switch (score) {
    case 1:
      return "bg-red-500/10 border-red-500/20";
    case 2:
      return "bg-orange-500/10 border-orange-500/20";
    case 3:
      return "bg-yellow-500/10 border-yellow-500/20";
    case 4:
      return "bg-green-500/10 border-green-500/20";
    case 5:
      return "bg-primary/10 border-primary/20";
    default:
      return "bg-muted/50 border-muted";
  }
}
