/**
 * Score Thresholds Configuration
 *
 * Defines the thresholds and visual styling for the scoring system.
 */

import type { RecruiterReadinessScore } from "@/lib/ai/tailoring/types";

// =============================================================================
// SCORE THRESHOLDS
// =============================================================================

export const SCORE_THRESHOLDS = {
  exceptional: { min: 90, max: 100 },
  strong: { min: 75, max: 89 },
  good: { min: 60, max: 74 },
  getting_there: { min: 45, max: 59 },
  needs_work: { min: 0, max: 44 },
} as const;

// =============================================================================
// LABEL FUNCTIONS
// =============================================================================

/**
 * Get score label from numeric score
 */
export function getScoreLabel(
  score: number
): RecruiterReadinessScore["label"] {
  if (score >= SCORE_THRESHOLDS.exceptional.min) return "exceptional";
  if (score >= SCORE_THRESHOLDS.strong.min) return "strong";
  if (score >= SCORE_THRESHOLDS.good.min) return "good";
  if (score >= SCORE_THRESHOLDS.getting_there.min) return "getting_there";
  return "needs_work";
}

/**
 * Get human-readable label
 */
export function getReadableLabel(
  label: RecruiterReadinessScore["label"]
): string {
  switch (label) {
    case "exceptional":
      return "Exceptional";
    case "strong":
      return "Strong";
    case "good":
      return "Good";
    case "getting_there":
      return "Getting There";
    case "needs_work":
      return "Needs Work";
  }
}

// =============================================================================
// COLOR FUNCTIONS
// =============================================================================

/**
 * Get color for a score label
 */
export function getScoreColor(label: RecruiterReadinessScore["label"]): string {
  switch (label) {
    case "exceptional":
      return "text-amber-500"; // Gold
    case "strong":
      return "text-green-500";
    case "good":
      return "text-lime-500";
    case "getting_there":
      return "text-yellow-500";
    case "needs_work":
      return "text-red-500";
  }
}

/**
 * Get background color for a score label
 */
export function getScoreBgColor(label: RecruiterReadinessScore["label"]): string {
  switch (label) {
    case "exceptional":
      return "bg-amber-500/10";
    case "strong":
      return "bg-green-500/10";
    case "good":
      return "bg-lime-500/10";
    case "getting_there":
      return "bg-yellow-500/10";
    case "needs_work":
      return "bg-red-500/10";
  }
}

/**
 * Get border color for a score label
 */
export function getScoreBorderColor(label: RecruiterReadinessScore["label"]): string {
  switch (label) {
    case "exceptional":
      return "border-amber-500/30";
    case "strong":
      return "border-green-500/30";
    case "good":
      return "border-lime-500/30";
    case "getting_there":
      return "border-yellow-500/30";
    case "needs_work":
      return "border-red-500/30";
  }
}

/**
 * Get dimension color based on raw score
 */
export function getDimensionColor(score: number): string {
  if (score >= 85) return "text-amber-500";
  if (score >= 70) return "text-green-500";
  if (score >= 55) return "text-lime-500";
  if (score >= 40) return "text-yellow-500";
  return "text-red-500";
}

/**
 * Get progress bar color based on raw score
 */
export function getProgressColor(score: number): string {
  if (score >= 85) return "bg-amber-500";
  if (score >= 70) return "bg-green-500";
  if (score >= 55) return "bg-lime-500";
  if (score >= 40) return "bg-yellow-500";
  return "bg-red-500";
}

// =============================================================================
// ICON/EMOJI FUNCTIONS
// =============================================================================

/**
 * Get emoji for a score label (optional, for non-professional contexts)
 */
export function getScoreEmoji(label: RecruiterReadinessScore["label"]): string {
  switch (label) {
    case "exceptional":
      return "🌟";
    case "strong":
      return "✅";
    case "good":
      return "👍";
    case "getting_there":
      return "📈";
    case "needs_work":
      return "🔧";
  }
}

// =============================================================================
// DIMENSION DISPLAY NAMES
// =============================================================================

export const DIMENSION_DISPLAY_NAMES: Record<
  keyof RecruiterReadinessScore["dimensions"],
  { name: string; description: string; issueNumber: number }
> = {
  uniqueness: {
    name: "Uniqueness",
    description: "Standing out from other candidates",
    issueNumber: 1,
  },
  impact: {
    name: "Impact",
    description: "Quantified achievements with metrics",
    issueNumber: 2,
  },
  contextTranslation: {
    name: "U.S. Context",
    description: "Company and experience translation",
    issueNumber: 3,
  },
  culturalFit: {
    name: "Cultural Fit",
    description: "Soft skills and collaboration evidence",
    issueNumber: 4,
  },
  customization: {
    name: "Customization",
    description: "Job-specific keyword and skill alignment",
    issueNumber: 5,
  },
};
