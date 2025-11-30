/**
 * Customization Rules (Recruiter Issue #5)
 *
 * Problem: "Generic applications - not showing strategic thinking"
 * Solution: Ensure job-specific keywords and skill alignment
 *
 * These rules analyze context/job match and generate instructions
 * for customizing the resume to the specific role.
 */

import type { TransformationRule } from "./types";

/**
 * Customization/context alignment rules
 */
export const CONTEXT_RULES: TransformationRule[] = [
  {
    id: "context-inject-missing-keywords",
    name: "Inject Missing Keywords",
    description: "Naturally incorporate missing job keywords into bullets",
    priority: 10,
    recruiterIssue: 5,
    condition: {
      type: "THRESHOLD",
      field: "context.keywordCoverage.percentage",
      operator: "<",
      value: 70,
    },
    actions: [
      {
        type: "inject_keywords",
        target: "bullet",
        data: {
          maxPerBullet: 2,
          naturalIntegration: true,
          avoidKeywordStuffing: true,
        },
        preserveOriginalMeaning: true,
      },
    ],
    strategicTone: "confident",
    enabled: true,
  },

  {
    id: "context-reorder-skills-by-relevance",
    name: "Reorder Skills by Relevance",
    description: "Put matched skills first, most relevant at the top",
    priority: 15,
    recruiterIssue: 5,
    condition: {
      type: "THRESHOLD",
      field: "context.matchedSkills.length",
      operator: ">",
      value: 0,
    },
    actions: [
      {
        type: "reorder",
        target: "skills",
        data: {
          sortBy: "matchStrength",
          matchedFirst: true,
        },
        preserveOriginalMeaning: true,
      },
    ],
    strategicTone: "confident",
    enabled: true,
  },

  {
    id: "context-tailor-summary-to-role",
    name: "Tailor Summary to Role",
    description: "Customize professional summary for target role",
    priority: 8,
    recruiterIssue: 5,
    condition: {
      type: "EXISTS",
      field: "context.fitAssessment.strengths",
    },
    actions: [
      {
        type: "enhance",
        target: "summary",
        data: {
          includeRoleTitle: true,
          highlightStrengths: true,
          alignWithCompanyValues: true,
        },
        preserveOriginalMeaning: true,
      },
    ],
    strategicTone: "confident",
    enabled: true,
  },

  {
    id: "context-address-gaps",
    name: "Address Critical Gaps",
    description: "Strategically address critical missing requirements",
    priority: 12,
    recruiterIssue: 5,
    condition: {
      type: "EXISTS",
      field: "context.missingRequirements",
    },
    actions: [
      {
        type: "enhance",
        target: "bullet",
        data: {
          showTransferableSkills: true,
          bridgeGaps: true,
          focusOn: "critical",
        },
        preserveOriginalMeaning: true,
      },
    ],
    strategicTone: "measured",
    enabled: true,
  },

  {
    id: "context-low-match-strategic-pivot",
    name: "Strategic Pivot for Low Match",
    description: "For low context scores, focus on transferable value",
    priority: 5,
    recruiterIssue: 5,
    condition: {
      type: "THRESHOLD",
      field: "context.score",
      operator: "<",
      value: 50,
    },
    actions: [
      {
        type: "enhance",
        target: "summary",
        data: {
          emphasizeTransferableSkills: true,
          showLearningAgility: true,
          toneDown: true, // Don't overclaim
        },
        preserveOriginalMeaning: true,
      },
    ],
    strategicTone: "humble",
    enabled: true,
  },

  {
    id: "context-excellent-match-confidence",
    name: "Strong Match Confidence",
    description: "For excellent matches, use confident positioning",
    priority: 20,
    recruiterIssue: 5,
    condition: {
      type: "THRESHOLD",
      field: "context.score",
      operator: ">=",
      value: 80,
    },
    actions: [
      {
        type: "enhance",
        target: "summary",
        data: {
          positionAsIdealCandidate: true,
          emphasizeDirectExperience: true,
        },
        preserveOriginalMeaning: true,
      },
    ],
    strategicTone: "confident",
    enabled: true,
  },

  {
    id: "context-highlight-relevant-experiences",
    name: "Highlight Relevant Experiences",
    description: "Emphasize highly relevant work experiences",
    priority: 18,
    recruiterIssue: 5,
    condition: {
      type: "EXISTS",
      field: "context.experienceAlignments",
    },
    actions: [
      {
        type: "enhance",
        target: "experience",
        data: {
          highlightRelevant: true,
          addRelevanceContext: true,
        },
        preserveOriginalMeaning: true,
      },
    ],
    strategicTone: "confident",
    enabled: true,
  },
];

/**
 * Get all context/customization rules
 */
export function getContextRules(): TransformationRule[] {
  return CONTEXT_RULES;
}

/**
 * Get enabled context rules
 */
export function getEnabledContextRules(): TransformationRule[] {
  return CONTEXT_RULES.filter((r) => r.enabled);
}
