/**
 * Impact Rules (Recruiter Issue #2)
 *
 * Problem: "Lists duties, not impact"
 * Solution: Transform vague bullets into quantified achievements using CAR format
 *
 * These rules identify bullets that need metrics/quantification and
 * generate instructions for the AI rewriter.
 */

import type { TransformationRule } from "./types";

/**
 * Impact quantification rules
 */
export const IMPACT_RULES: TransformationRule[] = [
  {
    id: "impact-transform-weak-bullets",
    name: "Transform Weak Bullets",
    description: "Apply CAR format to bullets marked as needing major improvement",
    priority: 10, // High priority - metrics are critical
    recruiterIssue: 2,
    condition: {
      type: "THRESHOLD",
      field: "impact.bulletsImproved",
      operator: ">",
      value: 0,
    },
    actions: [
      {
        type: "apply_template",
        target: "bullet",
        templateId: "CAR_FORMAT",
        preserveOriginalMeaning: true,
      },
    ],
    strategicTone: "confident",
    enabled: true,
  },

  {
    id: "impact-add-scale-context",
    name: "Add Scale Context",
    description: "Add user base, team size, or volume metrics to bullets",
    priority: 15,
    recruiterIssue: 2,
    condition: {
      type: "AND",
      conditions: [
        {
          type: "THRESHOLD",
          field: "impact.score",
          operator: "<",
          value: 70,
        },
        {
          type: "THRESHOLD",
          field: "impact.metricCategories.scale",
          operator: "<",
          value: 3,
        },
      ],
    },
    actions: [
      {
        type: "enhance",
        target: "bullet",
        templateId: "SCALE_ENHANCEMENT",
        data: {
          metricType: "scale",
          examples: [
            "serving X users",
            "team of X engineers",
            "processing X transactions/day",
          ],
        },
        preserveOriginalMeaning: true,
      },
    ],
    strategicTone: "confident",
    enabled: true,
  },

  {
    id: "impact-add-percentage-metrics",
    name: "Add Percentage Improvements",
    description: "Add improvement percentages to bullets lacking them",
    priority: 20,
    recruiterIssue: 2,
    condition: {
      type: "AND",
      conditions: [
        {
          type: "THRESHOLD",
          field: "impact.metricCategories.percentage",
          operator: "<",
          value: 2,
        },
        {
          type: "THRESHOLD",
          field: "impact.bulletsImproved",
          operator: ">",
          value: 2,
        },
      ],
    },
    actions: [
      {
        type: "enhance",
        target: "bullet",
        templateId: "PERCENTAGE_IMPROVEMENT",
        data: {
          patterns: [
            "improved X by Y%",
            "reduced X by Y%",
            "increased X by Y%",
          ],
        },
        preserveOriginalMeaning: true,
      },
    ],
    strategicTone: "confident",
    enabled: true,
  },

  {
    id: "impact-add-time-metrics",
    name: "Add Time Savings",
    description: "Add time-related metrics (saved X hours, accelerated by X weeks)",
    priority: 25,
    recruiterIssue: 2,
    condition: {
      type: "AND",
      conditions: [
        {
          type: "THRESHOLD",
          field: "impact.metricCategories.time",
          operator: "<",
          value: 1,
        },
        {
          type: "THRESHOLD",
          field: "impact.score",
          operator: "<",
          value: 75,
        },
      ],
    },
    actions: [
      {
        type: "enhance",
        target: "bullet",
        templateId: "TIME_SAVINGS",
        data: {
          patterns: [
            "reducing time from X to Y",
            "saving X hours per week",
            "accelerating delivery by X weeks",
          ],
        },
        preserveOriginalMeaning: true,
      },
    ],
    strategicTone: "confident",
    enabled: true,
  },

  {
    id: "impact-low-score-major-transform",
    name: "Major Transformation for Low Impact",
    description: "Completely transform bullets for resumes with very low impact scores",
    priority: 5, // Highest priority for very weak resumes
    recruiterIssue: 2,
    condition: {
      type: "THRESHOLD",
      field: "impact.score",
      operator: "<",
      value: 40,
    },
    actions: [
      {
        type: "apply_template",
        target: "bullet",
        templateId: "FULL_CAR_TRANSFORM",
        data: {
          requireMetrics: true,
          requireActionVerb: true,
          requireResult: true,
        },
        preserveOriginalMeaning: true,
      },
    ],
    strategicTone: "measured", // Be careful with weak resumes
    enabled: true,
  },
];

/**
 * Get all impact rules
 */
export function getImpactRules(): TransformationRule[] {
  return IMPACT_RULES;
}

/**
 * Get enabled impact rules
 */
export function getEnabledImpactRules(): TransformationRule[] {
  return IMPACT_RULES.filter((r) => r.enabled);
}
