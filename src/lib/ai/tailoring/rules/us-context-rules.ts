/**
 * U.S. Context Rules (Recruiter Issue #3)
 *
 * Problem: "Unknown companies need context - international experience doesn't translate"
 * Solution: Add scale/industry context for non-famous companies
 *
 * These rules help translate international or lesser-known company experience
 * into terms U.S. recruiters understand.
 */

import type { TransformationRule } from "./types";

/**
 * U.S. context translation rules
 */
export const US_CONTEXT_RULES: TransformationRule[] = [
  {
    id: "us-context-unknown-company",
    name: "Add Unknown Company Context",
    description: "Add scale/industry context for companies recruiters won't recognize",
    priority: 12,
    recruiterIssue: 3,
    condition: {
      type: "AND",
      conditions: [
        {
          type: "EXISTS",
          field: "company",
        },
        {
          type: "MATCH",
          field: "company.isWellKnown",
          operator: "=",
          value: false,
        },
      ],
    },
    actions: [
      {
        type: "contextualize",
        target: "experience",
        data: {
          addCompanyDescription: true,
          format: "{company} (description)",
          descriptionTypes: [
            "industry leader in X",
            "Y-person startup",
            "Series X fintech company",
            "Similar to early-stage Z",
          ],
        },
        preserveOriginalMeaning: true,
      },
    ],
    strategicTone: "confident",
    enabled: true,
  },

  {
    id: "us-context-add-scale",
    name: "Add Scale Context",
    description: "Add user base, revenue, or team size to establish scale",
    priority: 15,
    recruiterIssue: 3,
    condition: {
      type: "AND",
      conditions: [
        {
          type: "EXISTS",
          field: "company",
        },
        {
          type: "MATCH",
          field: "company.size",
          operator: "in",
          value: ["startup", "growth", "unknown"],
        },
      ],
    },
    actions: [
      {
        type: "enhance",
        target: "bullet",
        data: {
          addScaleIndicators: true,
          scaleTypes: [
            "serving X+ users",
            "processing $Xm in transactions",
            "across X countries",
          ],
        },
        preserveOriginalMeaning: true,
      },
    ],
    strategicTone: "confident",
    enabled: true,
  },

  {
    id: "us-context-comparable-companies",
    name: "Add Comparable Company Reference",
    description: "Add 'similar to X' references for context",
    priority: 18,
    recruiterIssue: 3,
    condition: {
      type: "AND",
      conditions: [
        {
          type: "EXISTS",
          field: "company",
        },
        {
          type: "MATCH",
          field: "company.isWellKnown",
          operator: "=",
          value: false,
        },
        {
          type: "EXISTS",
          field: "company.industry",
        },
      ],
    },
    actions: [
      {
        type: "contextualize",
        target: "experience",
        data: {
          addComparable: true,
          comparableFormat: "(Similar to early-stage {comparable})",
          industryMappings: {
            fintech: ["Stripe", "Square", "Plaid"],
            edtech: ["Coursera", "Duolingo", "Khan Academy"],
            healthtech: ["Oscar", "Ro", "Headspace"],
            ecommerce: ["Shopify", "Amazon", "Etsy"],
            saas: ["Salesforce", "Slack", "Notion"],
            ai: ["OpenAI", "Anthropic", "Scale AI"],
          },
        },
        preserveOriginalMeaning: true,
      },
    ],
    strategicTone: "confident",
    enabled: true,
  },

  {
    id: "us-context-translate-titles",
    name: "Translate International Titles",
    description: "Convert non-US job titles to US equivalents",
    priority: 20,
    recruiterIssue: 3,
    condition: {
      type: "EXISTS",
      field: "context.experienceAlignments",
    },
    actions: [
      {
        type: "enhance",
        target: "experience",
        data: {
          normalizeJobTitles: true,
          titleMappings: {
            // UK/EU to US mappings
            "programme manager": "Program Manager",
            "senior programme manager": "Senior Program Manager",
            "engineering manager": "Engineering Manager",
            "technical lead": "Tech Lead / Staff Engineer",
            "chief technology officer": "CTO",
            "managing director": "VP / Director",
          },
        },
        preserveOriginalMeaning: true,
      },
    ],
    strategicTone: "confident",
    enabled: true,
  },

  {
    id: "us-context-industry-translation",
    name: "Add Industry Context",
    description: "Add industry context for domain-specific experience",
    priority: 22,
    recruiterIssue: 3,
    condition: {
      type: "AND",
      conditions: [
        {
          type: "EXISTS",
          field: "company.industry",
        },
        {
          type: "MATCH",
          field: "company.isWellKnown",
          operator: "=",
          value: false,
        },
      ],
    },
    actions: [
      {
        type: "contextualize",
        target: "bullet",
        data: {
          addIndustryContext: true,
          formatPatterns: [
            "in the {industry} sector",
            "for {industry} applications",
            "serving {industry} clients",
          ],
        },
        preserveOriginalMeaning: true,
      },
    ],
    strategicTone: "confident",
    enabled: true,
  },
];

/**
 * Get all U.S. context rules
 */
export function getUSContextRules(): TransformationRule[] {
  return US_CONTEXT_RULES;
}

/**
 * Get enabled U.S. context rules
 */
export function getEnabledUSContextRules(): TransformationRule[] {
  return US_CONTEXT_RULES.filter((r) => r.enabled);
}
