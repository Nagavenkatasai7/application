/**
 * Rules Module
 *
 * Aggregates all transformation rules for the hybrid tailoring system.
 */

export * from "./types";
export * from "./impact-rules";
export * from "./uniqueness-rules";
export * from "./context-rules";
export * from "./us-context-rules";
export * from "./cultural-fit-rules";

import { getEnabledImpactRules } from "./impact-rules";
import { getEnabledUniquenessRules } from "./uniqueness-rules";
import { getEnabledContextRules } from "./context-rules";
import { getEnabledUSContextRules } from "./us-context-rules";
import { getEnabledCulturalFitRules } from "./cultural-fit-rules";
import type { TransformationRule } from "./types";

/**
 * Get all enabled transformation rules, sorted by priority
 */
export function getAllEnabledRules(): TransformationRule[] {
  const allRules = [
    ...getEnabledImpactRules(),
    ...getEnabledUniquenessRules(),
    ...getEnabledContextRules(),
    ...getEnabledUSContextRules(),
    ...getEnabledCulturalFitRules(),
  ];

  // Sort by priority (lower = higher priority)
  return allRules.sort((a, b) => a.priority - b.priority);
}

/**
 * Get rules by recruiter issue
 */
export function getRulesByIssue(issue: 1 | 2 | 3 | 4 | 5): TransformationRule[] {
  return getAllEnabledRules().filter((r) => r.recruiterIssue === issue);
}

/**
 * Get rule statistics
 */
export function getRuleStats(): {
  total: number;
  byIssue: Record<number, number>;
  byPriority: { high: number; medium: number; low: number };
} {
  const rules = getAllEnabledRules();

  const byIssue: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const byPriority = { high: 0, medium: 0, low: 0 };

  for (const rule of rules) {
    byIssue[rule.recruiterIssue]++;

    if (rule.priority < 10) {
      byPriority.high++;
    } else if (rule.priority < 20) {
      byPriority.medium++;
    } else {
      byPriority.low++;
    }
  }

  return {
    total: rules.length,
    byIssue,
    byPriority,
  };
}
