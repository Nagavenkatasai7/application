/**
 * Recruiter Readiness Scoring
 *
 * Calculates a composite score based on the 5 recruiter issues:
 * 1. Uniqueness (20%) - Standing out from other candidates
 * 2. Impact (30%) - Quantified achievements
 * 3. Context Translation (15%) - U.S. context for unknown companies
 * 4. Cultural Fit (10%) - Soft skills evidence
 * 5. Customization (25%) - Job-specific alignment
 */

import type { PreAnalysisResult } from "@/lib/ai/tailoring/types";
import type { RecruiterReadinessScore, DimensionScore } from "@/lib/ai/tailoring/types";
import { getDimensionColor, getScoreLabel, getScoreColor } from "./thresholds";

// =============================================================================
// DIMENSION WEIGHTS
// =============================================================================

export const DIMENSION_WEIGHTS = {
  uniqueness: 0.20,      // Issue #1
  impact: 0.30,          // Issue #2
  contextTranslation: 0.15, // Issue #3
  culturalFit: 0.10,     // Issue #4
  customization: 0.25,   // Issue #5
} as const;

// =============================================================================
// DIMENSION SCORE CALCULATORS
// =============================================================================

/**
 * Calculate uniqueness dimension score
 */
function calculateUniquenessScore(preAnalysis: PreAnalysisResult): DimensionScore {
  const raw = preAnalysis.uniqueness.score;
  const weight = DIMENSION_WEIGHTS.uniqueness;
  const weighted = raw * weight;

  const suggestions: string[] = [];

  if (raw < 50) {
    suggestions.push("Highlight unique skill combinations that set you apart");
  }
  if (preAnalysis.uniqueness.factors.filter((f) => f.rarity === "very_rare").length === 0) {
    suggestions.push("Identify and emphasize your rarest qualifications");
  }
  if (raw < 70) {
    suggestions.push("Add career transitions or cross-domain expertise to your narrative");
  }

  return {
    raw,
    weighted,
    weight,
    label: preAnalysis.uniqueness.scoreLabel,
    color: getDimensionColor(raw),
    suggestions: suggestions.slice(0, 2),
  };
}

/**
 * Calculate impact dimension score
 */
function calculateImpactScore(preAnalysis: PreAnalysisResult): DimensionScore {
  const raw = preAnalysis.impact.score;
  const weight = DIMENSION_WEIGHTS.impact;
  const weighted = raw * weight;

  const suggestions: string[] = [];

  if (raw < 50) {
    suggestions.push("Add specific metrics to your achievement statements (%, $, #)");
  }
  if (preAnalysis.impact.metricCategories.percentage < 2) {
    suggestions.push("Include improvement percentages (increased by X%, reduced by Y%)");
  }
  if (preAnalysis.impact.metricCategories.scale < 2) {
    suggestions.push("Add scale context (team size, user base, transaction volume)");
  }
  if (preAnalysis.impact.bulletsImproved > preAnalysis.impact.totalBullets * 0.5) {
    suggestions.push("Most bullets need stronger quantification");
  }

  return {
    raw,
    weighted,
    weight,
    label: preAnalysis.impact.scoreLabel,
    color: getDimensionColor(raw),
    suggestions: suggestions.slice(0, 2),
  };
}

/**
 * Calculate context translation dimension score
 */
function calculateContextScore(preAnalysis: PreAnalysisResult): DimensionScore {
  let raw: number;

  if (!preAnalysis.company) {
    // No company to contextualize
    raw = 70; // Neutral score
  } else if (preAnalysis.company.isWellKnown) {
    // Well-known company, no context needed
    raw = 100;
  } else if (preAnalysis.company.comparable) {
    // Has comparable company reference
    raw = 80;
  } else if (preAnalysis.company.context && preAnalysis.company.context.length > 0) {
    // Has some context
    raw = 60;
  } else {
    // Unknown company, no context
    raw = 30;
  }

  const weight = DIMENSION_WEIGHTS.contextTranslation;
  const weighted = raw * weight;

  const suggestions: string[] = [];

  if (preAnalysis.company && !preAnalysis.company.isWellKnown) {
    suggestions.push("Add context for unfamiliar companies (size, industry, comparable companies)");
  }
  if (raw < 70) {
    suggestions.push("Include company descriptions that U.S. recruiters will understand");
  }

  return {
    raw,
    weighted,
    weight,
    label: getScoreLabel(raw),
    color: getDimensionColor(raw),
    suggestions: suggestions.slice(0, 2),
  };
}

/**
 * Calculate cultural fit dimension score
 */
function calculateCulturalFitScore(preAnalysis: PreAnalysisResult): DimensionScore {
  let raw: number;

  if (preAnalysis.softSkills.length === 0) {
    raw = 30;
  } else {
    // Calculate based on strength and variety of soft skills
    const strongSkills = preAnalysis.softSkills.filter((s) => s.strength === "strong").length;
    const moderateSkills = preAnalysis.softSkills.filter((s) => s.strength === "moderate").length;

    raw = Math.min(100, 30 + strongSkills * 20 + moderateSkills * 10);
  }

  const weight = DIMENSION_WEIGHTS.culturalFit;
  const weighted = raw * weight;

  const suggestions: string[] = [];

  if (raw < 50) {
    suggestions.push("Add evidence of soft skills like leadership, collaboration, communication");
  }
  if (!preAnalysis.softSkills.some((s) => s.skill === "leadership")) {
    suggestions.push("Highlight leadership experiences (led, mentored, coached)");
  }
  if (!preAnalysis.softSkills.some((s) => s.skill === "collaboration")) {
    suggestions.push("Show collaboration evidence (partnered, cross-functional, stakeholders)");
  }

  return {
    raw,
    weighted,
    weight,
    label: getScoreLabel(raw),
    color: getDimensionColor(raw),
    suggestions: suggestions.slice(0, 2),
  };
}

/**
 * Calculate customization dimension score
 */
function calculateCustomizationScore(preAnalysis: PreAnalysisResult): DimensionScore {
  const raw = preAnalysis.context.score;
  const weight = DIMENSION_WEIGHTS.customization;
  const weighted = raw * weight;

  const suggestions: string[] = [];

  if (preAnalysis.context.keywordCoverage.percentage < 60) {
    suggestions.push("Include more keywords from the job description naturally");
  }
  if (preAnalysis.context.missingRequirements.filter((r) => r.importance === "critical").length > 0) {
    suggestions.push("Address critical missing requirements in your resume");
  }
  if (preAnalysis.context.experienceAlignments.filter((e) => e.relevance === "high").length === 0) {
    suggestions.push("Tailor experience descriptions to highlight relevant aspects");
  }
  if (raw < 70) {
    suggestions.push("Customize your summary and skills section for this specific role");
  }

  return {
    raw,
    weighted,
    weight,
    label: preAnalysis.context.scoreLabel,
    color: getDimensionColor(raw),
    suggestions: suggestions.slice(0, 2),
  };
}

// =============================================================================
// MAIN SCORING FUNCTION
// =============================================================================

/**
 * Calculate the complete recruiter readiness score
 */
export function calculateRecruiterReadiness(
  preAnalysis: PreAnalysisResult
): RecruiterReadinessScore {
  // Calculate each dimension
  const dimensions = {
    uniqueness: calculateUniquenessScore(preAnalysis),
    impact: calculateImpactScore(preAnalysis),
    contextTranslation: calculateContextScore(preAnalysis),
    culturalFit: calculateCulturalFitScore(preAnalysis),
    customization: calculateCustomizationScore(preAnalysis),
  };

  // Calculate composite score
  const composite = Math.round(
    dimensions.uniqueness.weighted +
    dimensions.impact.weighted +
    dimensions.contextTranslation.weighted +
    dimensions.culturalFit.weighted +
    dimensions.customization.weighted
  );

  // Determine label and color
  const label = getScoreLabel(composite);
  const color = getScoreColor(label);

  // Generate top suggestions (prioritize by impact potential)
  const allSuggestions: Array<{
    dimension: keyof typeof dimensions;
    action: string;
    impact: "high" | "medium" | "low";
    score: number;
  }> = [];

  for (const [key, dim] of Object.entries(dimensions)) {
    const dimKey = key as keyof typeof dimensions;
    const impact = dim.raw < 50 ? "high" : dim.raw < 70 ? "medium" : "low";

    for (const action of dim.suggestions) {
      allSuggestions.push({
        dimension: dimKey,
        action,
        impact,
        score: dim.raw,
      });
    }
  }

  // Sort by impact (high first) then by score (low first)
  allSuggestions.sort((a, b) => {
    const impactOrder = { high: 0, medium: 1, low: 2 };
    if (impactOrder[a.impact] !== impactOrder[b.impact]) {
      return impactOrder[a.impact] - impactOrder[b.impact];
    }
    return a.score - b.score;
  });

  const topSuggestions = allSuggestions.slice(0, 3).map((s) => ({
    dimension: s.dimension,
    action: s.action,
    impact: s.impact,
  }));

  return {
    composite,
    label,
    color,
    dimensions,
    topSuggestions,
  };
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get a summary message based on the score
 */
export function getScoreSummary(score: RecruiterReadinessScore): string {
  if (score.composite >= 90) {
    return "Exceptional match! Your resume is well-optimized for this role.";
  }
  if (score.composite >= 75) {
    return "Strong match! A few targeted improvements could make your application even stronger.";
  }
  if (score.composite >= 60) {
    return "Good potential. Focus on the suggested improvements to stand out.";
  }
  if (score.composite >= 45) {
    return "Room for improvement. Your resume needs more tailoring for this specific role.";
  }
  return "Significant work needed. Consider major revisions to improve your match.";
}

/**
 * Get the most impactful dimension to improve
 */
export function getMostImpactfulImprovement(
  score: RecruiterReadinessScore
): keyof RecruiterReadinessScore["dimensions"] {
  const dims = Object.entries(score.dimensions)
    .map(([key, dim]) => ({
      key: key as keyof RecruiterReadinessScore["dimensions"],
      raw: dim.raw,
      weight: dim.weight,
      potential: (100 - dim.raw) * dim.weight, // Potential improvement
    }))
    .sort((a, b) => b.potential - a.potential);

  return dims[0].key;
}
