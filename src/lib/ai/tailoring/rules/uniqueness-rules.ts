/**
 * Uniqueness Rules (Recruiter Issue #1)
 *
 * Problem: "Resumes look identical - same templates, same buzzwords"
 * Solution: Highlight rare skill combinations and unique experiences
 *
 * These rules identify unique differentiators and generate instructions
 * to prominently feature them in the resume.
 */

import type { TransformationRule } from "./types";

/**
 * Uniqueness highlighting rules
 */
export const UNIQUENESS_RULES: TransformationRule[] = [
  {
    id: "uniqueness-highlight-very-rare",
    name: "Highlight Very Rare Factors",
    description: "Prominently feature very rare skill combinations or experiences",
    priority: 8, // High priority
    recruiterIssue: 1,
    condition: {
      type: "EXISTS",
      field: "uniqueness.factors",
    },
    actions: [
      {
        type: "highlight",
        target: "section",
        data: {
          section: "whyFit",
          source: "uniqueness.factors",
          filterRarity: ["very_rare", "rare"],
        },
        preserveOriginalMeaning: true,
      },
    ],
    strategicTone: "confident",
    enabled: true,
  },

  {
    id: "uniqueness-lead-summary",
    name: "Lead Summary with Differentiators",
    description: "Start summary with unique value proposition",
    priority: 12,
    recruiterIssue: 1,
    condition: {
      type: "AND",
      conditions: [
        {
          type: "EXISTS",
          field: "uniqueness.differentiators",
        },
        {
          type: "THRESHOLD",
          field: "uniqueness.score",
          operator: ">=",
          value: 50,
        },
      ],
    },
    actions: [
      {
        type: "enhance",
        target: "summary",
        data: {
          leadWith: "uniqueness.differentiators",
          maxDifferentiators: 2,
        },
        preserveOriginalMeaning: true,
      },
    ],
    strategicTone: "confident",
    enabled: true,
  },

  {
    id: "uniqueness-skill-combinations",
    name: "Emphasize Rare Skill Combinations",
    description: "Group and highlight rare technical skill combinations",
    priority: 18,
    recruiterIssue: 1,
    condition: {
      type: "AND",
      conditions: [
        {
          type: "EXISTS",
          field: "uniqueness.factors",
        },
        {
          type: "MATCH",
          field: "uniqueness.factors[0].type",
          operator: "=",
          value: "skill_combination",
        },
      ],
    },
    actions: [
      {
        type: "reorder",
        target: "skills",
        data: {
          groupBy: "rarity",
          promoteRare: true,
        },
        preserveOriginalMeaning: true,
      },
    ],
    strategicTone: "confident",
    enabled: true,
  },

  {
    id: "uniqueness-career-transition",
    name: "Leverage Career Transitions",
    description: "Position career transitions as strategic advantages",
    priority: 22,
    recruiterIssue: 1,
    condition: {
      type: "MATCH",
      field: "uniqueness.factors",
      operator: "contains",
      value: "career_transition",
    },
    actions: [
      {
        type: "enhance",
        target: "summary",
        data: {
          includeTransitionNarrative: true,
          framingStyle: "strategic_pivot",
        },
        preserveOriginalMeaning: true,
      },
    ],
    strategicTone: "confident",
    enabled: true,
  },

  {
    id: "uniqueness-low-score-find-differentiators",
    name: "Find Hidden Differentiators",
    description: "For low uniqueness scores, look harder for differentiators",
    priority: 5,
    recruiterIssue: 1,
    condition: {
      type: "THRESHOLD",
      field: "uniqueness.score",
      operator: "<",
      value: 50,
    },
    actions: [
      {
        type: "enhance",
        target: "bullet",
        data: {
          emphasizeUncommonAspects: true,
          lookFor: [
            "specific technologies",
            "project scale",
            "industry-specific knowledge",
            "cross-functional experience",
          ],
        },
        preserveOriginalMeaning: true,
      },
    ],
    strategicTone: "measured",
    enabled: true,
  },

  {
    id: "uniqueness-domain-expertise",
    name: "Highlight Domain Expertise",
    description: "Prominently feature deep specialization areas",
    priority: 15,
    recruiterIssue: 1,
    condition: {
      type: "MATCH",
      field: "uniqueness.factors",
      operator: "contains",
      value: "domain_expertise",
    },
    actions: [
      {
        type: "highlight",
        target: "section",
        data: {
          section: "competencies",
          createExpertiseCategory: true,
        },
        preserveOriginalMeaning: true,
      },
    ],
    strategicTone: "confident",
    enabled: true,
  },
];

/**
 * Get all uniqueness rules
 */
export function getUniquenessRules(): TransformationRule[] {
  return UNIQUENESS_RULES;
}

/**
 * Get enabled uniqueness rules
 */
export function getEnabledUniquenessRules(): TransformationRule[] {
  return UNIQUENESS_RULES.filter((r) => r.enabled);
}
