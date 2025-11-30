/**
 * Cultural Fit Rules (Recruiter Issue #4)
 *
 * Problem: "Not showing cultural fit - only technical skills"
 * Solution: Weave soft skills evidence into bullets
 *
 * These rules analyze soft skills detected in the resume and generate
 * instructions for naturally integrating cultural fit signals.
 */

import type { TransformationRule } from "./types";

/**
 * Cultural fit / soft skills rules
 */
export const CULTURAL_FIT_RULES: TransformationRule[] = [
  {
    id: "cultural-weave-leadership",
    name: "Weave Leadership Signals",
    description: "Emphasize leadership evidence in bullets",
    priority: 15,
    recruiterIssue: 4,
    condition: {
      type: "AND",
      conditions: [
        {
          type: "EXISTS",
          field: "softSkills",
        },
        {
          type: "MATCH",
          field: "softSkills",
          operator: "contains",
          value: "leadership",
        },
      ],
    },
    actions: [
      {
        type: "add_soft_skills",
        target: "bullet",
        data: {
          skill: "leadership",
          signals: [
            "led", "managed", "mentored", "coached",
            "spearheaded", "directed", "drove",
          ],
          naturalIntegration: true,
        },
        preserveOriginalMeaning: true,
      },
    ],
    strategicTone: "confident",
    enabled: true,
  },

  {
    id: "cultural-weave-collaboration",
    name: "Weave Collaboration Signals",
    description: "Highlight cross-functional and team collaboration",
    priority: 18,
    recruiterIssue: 4,
    condition: {
      type: "AND",
      conditions: [
        {
          type: "EXISTS",
          field: "softSkills",
        },
        {
          type: "MATCH",
          field: "softSkills",
          operator: "contains",
          value: "collaboration",
        },
      ],
    },
    actions: [
      {
        type: "add_soft_skills",
        target: "bullet",
        data: {
          skill: "collaboration",
          signals: [
            "collaborated", "partnered", "cross-functional",
            "stakeholders", "aligned", "coordinated",
          ],
          naturalIntegration: true,
        },
        preserveOriginalMeaning: true,
      },
    ],
    strategicTone: "confident",
    enabled: true,
  },

  {
    id: "cultural-weave-communication",
    name: "Weave Communication Signals",
    description: "Emphasize communication skills in bullets",
    priority: 20,
    recruiterIssue: 4,
    condition: {
      type: "AND",
      conditions: [
        {
          type: "EXISTS",
          field: "softSkills",
        },
        {
          type: "MATCH",
          field: "softSkills",
          operator: "contains",
          value: "communication",
        },
      ],
    },
    actions: [
      {
        type: "add_soft_skills",
        target: "bullet",
        data: {
          skill: "communication",
          signals: [
            "presented", "communicated", "articulated",
            "documented", "reported", "briefed",
          ],
          naturalIntegration: true,
        },
        preserveOriginalMeaning: true,
      },
    ],
    strategicTone: "confident",
    enabled: true,
  },

  {
    id: "cultural-add-initiative",
    name: "Add Initiative Signals",
    description: "Highlight proactive behavior and ownership",
    priority: 22,
    recruiterIssue: 4,
    condition: {
      type: "AND",
      conditions: [
        {
          type: "EXISTS",
          field: "softSkills",
        },
        {
          type: "MATCH",
          field: "softSkills",
          operator: "contains",
          value: "initiative",
        },
      ],
    },
    actions: [
      {
        type: "add_soft_skills",
        target: "bullet",
        data: {
          skill: "initiative",
          signals: [
            "initiated", "proposed", "championed",
            "identified", "pioneered", "launched",
          ],
          naturalIntegration: true,
        },
        preserveOriginalMeaning: true,
      },
    ],
    strategicTone: "confident",
    enabled: true,
  },

  {
    id: "cultural-weak-soft-skills",
    name: "Strengthen Weak Soft Skills",
    description: "For resumes with weak soft skill signals, add evidence",
    priority: 10,
    recruiterIssue: 4,
    condition: {
      type: "OR",
      conditions: [
        {
          type: "NOT",
          conditions: [
            {
              type: "EXISTS",
              field: "softSkills",
            },
          ],
        },
        {
          type: "THRESHOLD",
          field: "softSkills.length",
          operator: "<",
          value: 2,
        },
      ],
    },
    actions: [
      {
        type: "add_soft_skills",
        target: "bullet",
        data: {
          addGenericSignals: true,
          focusOn: ["collaboration", "communication"],
          lookForOpportunities: true,
        },
        preserveOriginalMeaning: true,
      },
    ],
    strategicTone: "measured",
    enabled: true,
  },

  {
    id: "cultural-summary-values",
    name: "Align Summary with Values",
    description: "Include cultural fit signals in professional summary",
    priority: 12,
    recruiterIssue: 4,
    condition: {
      type: "EXISTS",
      field: "softSkills",
    },
    actions: [
      {
        type: "enhance",
        target: "summary",
        data: {
          includeTopSoftSkills: true,
          maxSkills: 2,
          naturalIntegration: true,
        },
        preserveOriginalMeaning: true,
      },
    ],
    strategicTone: "confident",
    enabled: true,
  },

  {
    id: "cultural-problem-solving",
    name: "Highlight Problem-Solving",
    description: "Emphasize analytical and problem-solving abilities",
    priority: 25,
    recruiterIssue: 4,
    condition: {
      type: "MATCH",
      field: "softSkills",
      operator: "contains",
      value: "problem solving",
    },
    actions: [
      {
        type: "add_soft_skills",
        target: "bullet",
        data: {
          skill: "problem-solving",
          signals: [
            "solved", "resolved", "diagnosed",
            "analyzed", "optimized", "improved",
          ],
          naturalIntegration: true,
        },
        preserveOriginalMeaning: true,
      },
    ],
    strategicTone: "confident",
    enabled: true,
  },
];

/**
 * Get all cultural fit rules
 */
export function getCulturalFitRules(): TransformationRule[] {
  return CULTURAL_FIT_RULES;
}

/**
 * Get enabled cultural fit rules
 */
export function getEnabledCulturalFitRules(): TransformationRule[] {
  return CULTURAL_FIT_RULES.filter((r) => r.enabled);
}
