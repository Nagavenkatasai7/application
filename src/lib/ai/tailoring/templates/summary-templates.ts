/**
 * Summary Templates
 *
 * Templates for generating professional summaries that position
 * candidates strategically based on their unique value and target role.
 */

import type { SummaryTemplate, StrategicTone } from "../types";

/**
 * Summary templates for different strategic tones
 */
export const SUMMARY_TEMPLATES: SummaryTemplate[] = [
  {
    id: "EXPERIENCED_PROFESSIONAL",
    name: "Experienced Professional",
    structure: `{years_experience}+ years of experience in {domain} with proven expertise in {top_skills}. {unique_differentiator}. Seeking to leverage {key_strength} as {target_role} at {target_company}.`,
    variables: [
      "years_experience",
      "domain",
      "top_skills",
      "unique_differentiator",
      "key_strength",
      "target_role",
      "target_company",
    ],
    toneGuidelines: {
      confident: "Lead with 'Senior' or 'Staff-level' if applicable. Use 'delivered', 'drove', 'led'. Position as the ideal candidate.",
      measured: "Balance experience with continued learning. Use 'developed', 'contributed', 'grew'.",
      humble: "Focus on eagerness and potential. Use 'passionate about', 'eager to', 'excited to contribute'.",
    },
  },

  {
    id: "CAREER_CHANGER",
    name: "Career Transition",
    structure: `{background_domain} professional transitioning to {target_domain}, bringing unique perspective from {unique_experience}. {transferable_value}. Seeking {target_role} where {contribution_statement}.`,
    variables: [
      "background_domain",
      "target_domain",
      "unique_experience",
      "transferable_value",
      "target_role",
      "contribution_statement",
    ],
    toneGuidelines: {
      confident: "Frame transition as strategic advantage. Emphasize transferable achievements.",
      measured: "Acknowledge learning while highlighting relevant skills.",
      humble: "Focus on enthusiasm and quick learning ability.",
    },
  },

  {
    id: "TECHNICAL_SPECIALIST",
    name: "Technical Specialist",
    structure: `{specialization} specialist with deep expertise in {technologies}. {quantified_achievement}. Passionate about {technical_passion} and seeking to {contribution} as {target_role}.`,
    variables: [
      "specialization",
      "technologies",
      "quantified_achievement",
      "technical_passion",
      "contribution",
      "target_role",
    ],
    toneGuidelines: {
      confident: "Lead with 'Expert in' or 'Specialist in'. Cite specific achievements.",
      measured: "Use 'Strong background in'. Balance depth with breadth.",
      humble: "Focus on continuous learning and problem-solving passion.",
    },
  },

  {
    id: "LEADER_MANAGER",
    name: "Technical Leader",
    structure: `{leadership_type} leader with {years} years building and scaling {team_type} teams. {leadership_achievement}. Seeking to drive {impact_area} as {target_role} at {target_company}.`,
    variables: [
      "leadership_type",
      "years",
      "team_type",
      "leadership_achievement",
      "impact_area",
      "target_role",
      "target_company",
    ],
    toneGuidelines: {
      confident: "Use 'Proven leader', 'Track record of'. Cite team sizes and outcomes.",
      measured: "Use 'Experienced in leading'. Balance technical and people skills.",
      humble: "Focus on servant leadership and team development.",
    },
  },

  {
    id: "INTERNATIONAL_CANDIDATE",
    name: "International Background",
    structure: `{domain} professional with {international_context}, bringing global perspective to {specialization}. {key_achievement}. Seeking {target_role} to apply {unique_value} at {target_company}.`,
    variables: [
      "domain",
      "international_context",
      "specialization",
      "key_achievement",
      "target_role",
      "unique_value",
      "target_company",
    ],
    toneGuidelines: {
      confident: "Position international experience as competitive advantage.",
      measured: "Emphasize adaptability and diverse perspective.",
      humble: "Focus on cultural awareness and learning orientation.",
    },
  },
];

/**
 * Get summary template by ID
 */
export function getSummaryTemplate(id: string): SummaryTemplate | undefined {
  return SUMMARY_TEMPLATES.find((t) => t.id === id);
}

/**
 * Get tone-specific guidance for a template
 */
export function getToneGuidance(templateId: string, tone: StrategicTone): string | undefined {
  const template = getSummaryTemplate(templateId);
  return template?.toneGuidelines[tone];
}

/**
 * Suggest the best summary template based on candidate profile
 */
export function suggestSummaryTemplate(profile: {
  yearsExperience: number;
  isCareerChanger: boolean;
  isLeader: boolean;
  isInternational: boolean;
  isSpecialist: boolean;
}): SummaryTemplate {
  if (profile.isCareerChanger) {
    return SUMMARY_TEMPLATES.find((t) => t.id === "CAREER_CHANGER")!;
  }

  if (profile.isLeader && profile.yearsExperience >= 5) {
    return SUMMARY_TEMPLATES.find((t) => t.id === "LEADER_MANAGER")!;
  }

  if (profile.isInternational) {
    return SUMMARY_TEMPLATES.find((t) => t.id === "INTERNATIONAL_CANDIDATE")!;
  }

  if (profile.isSpecialist) {
    return SUMMARY_TEMPLATES.find((t) => t.id === "TECHNICAL_SPECIALIST")!;
  }

  return SUMMARY_TEMPLATES.find((t) => t.id === "EXPERIENCED_PROFESSIONAL")!;
}
