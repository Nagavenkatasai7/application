/**
 * Bullet Templates
 *
 * Templates for transforming resume bullets using the CAR format
 * (Challenge-Action-Result) and other proven patterns.
 */

import type { BulletTemplate } from "../types";

/**
 * CAR (Challenge-Action-Result) Format Templates
 */
export const CAR_TEMPLATES: BulletTemplate[] = [
  {
    id: "CAR_FORMAT",
    name: "CAR Format",
    pattern: "{action_verb} {what} by {how}, resulting in {metric} {improvement}",
    variables: ["action_verb", "what", "how", "metric", "improvement"],
    examples: [
      {
        before: "Worked on ML model for processing data",
        after: "Engineered ML pipeline processing 10M+ daily transactions, reducing data latency by 40%",
      },
      {
        before: "Helped improve website performance",
        after: "Optimized frontend rendering by implementing lazy loading and code splitting, improving page load time by 65%",
      },
    ],
    applicableTo: ["metrics"],
  },

  {
    id: "FULL_CAR_TRANSFORM",
    name: "Full CAR Transformation",
    pattern: "{challenge_context}: {action_verb} {solution} resulting in {quantified_result}",
    variables: ["challenge_context", "action_verb", "solution", "quantified_result"],
    examples: [
      {
        before: "Managed cloud infrastructure",
        after: "Facing 99.5% uptime requirements: Architected fault-tolerant cloud infrastructure across 3 AWS regions, achieving 99.99% uptime for 2M+ daily active users",
      },
    ],
    applicableTo: ["metrics", "context"],
  },
];

/**
 * Scale Enhancement Templates
 */
export const SCALE_TEMPLATES: BulletTemplate[] = [
  {
    id: "SCALE_ENHANCEMENT",
    name: "Scale Context Addition",
    pattern: "{original} ({scale_context})",
    variables: ["original", "scale_context"],
    examples: [
      {
        before: "Managed cloud infrastructure",
        after: "Managed cloud infrastructure serving 2M+ daily active users across 3 AWS regions",
      },
      {
        before: "Led development of mobile app",
        after: "Led development of mobile app with 500K+ downloads and 4.8★ rating",
      },
    ],
    applicableTo: ["metrics"],
  },

  {
    id: "TEAM_SCALE",
    name: "Team Scale Addition",
    pattern: "{action} {responsibility} across a team of {team_size} {role_type}",
    variables: ["action", "responsibility", "team_size", "role_type"],
    examples: [
      {
        before: "Led frontend development",
        after: "Led frontend development across a team of 8 engineers, delivering 15+ features per quarter",
      },
    ],
    applicableTo: ["metrics"],
  },
];

/**
 * Percentage Improvement Templates
 */
export const PERCENTAGE_TEMPLATES: BulletTemplate[] = [
  {
    id: "PERCENTAGE_IMPROVEMENT",
    name: "Percentage Improvement",
    pattern: "{action_verb} {what}, {direction} {metric} by {percentage}%",
    variables: ["action_verb", "what", "direction", "metric", "percentage"],
    examples: [
      {
        before: "Improved database queries",
        after: "Optimized database queries, reducing query latency by 75% and saving $50K annually in compute costs",
      },
    ],
    applicableTo: ["metrics"],
  },

  {
    id: "BEFORE_AFTER",
    name: "Before/After Comparison",
    pattern: "{action_verb} {what}, improving {metric} from {before} to {after}",
    variables: ["action_verb", "what", "metric", "before", "after"],
    examples: [
      {
        before: "Fixed slow page loads",
        after: "Refactored rendering pipeline, improving page load time from 4.2s to 1.1s (74% faster)",
      },
    ],
    applicableTo: ["metrics"],
  },
];

/**
 * Time Metrics Templates
 */
export const TIME_TEMPLATES: BulletTemplate[] = [
  {
    id: "TIME_SAVINGS",
    name: "Time Savings",
    pattern: "{action_verb} {what}, saving {time_amount} {time_unit} per {period}",
    variables: ["action_verb", "what", "time_amount", "time_unit", "period"],
    examples: [
      {
        before: "Automated deployment process",
        after: "Automated CI/CD pipeline, saving 15 hours per week in manual deployment time",
      },
    ],
    applicableTo: ["metrics"],
  },

  {
    id: "TIME_ACCELERATION",
    name: "Time Acceleration",
    pattern: "{action_verb} {process}, reducing {what} from {before} to {after}",
    variables: ["action_verb", "process", "what", "before", "after"],
    examples: [
      {
        before: "Sped up onboarding process",
        after: "Streamlined developer onboarding, reducing setup time from 2 days to 2 hours",
      },
    ],
    applicableTo: ["metrics"],
  },
];

/**
 * Company Context Templates
 */
export const COMPANY_CONTEXT_TEMPLATES: BulletTemplate[] = [
  {
    id: "COMPANY_CONTEXT_ENTERPRISE",
    name: "Enterprise Company Context",
    pattern: "At {company} (Fortune 500 {industry} leader), {rest_of_bullet}",
    variables: ["company", "industry", "rest_of_bullet"],
    examples: [
      {
        before: "Led infrastructure team",
        after: "At Acme Corp (Fortune 500 fintech leader), led infrastructure team supporting $2B+ in daily transactions",
      },
    ],
    applicableTo: ["context"],
  },

  {
    id: "COMPANY_CONTEXT_STARTUP",
    name: "Startup Company Context",
    pattern: "At {company} ({funding_stage} {industry} startup), {rest_of_bullet}",
    variables: ["company", "funding_stage", "industry", "rest_of_bullet"],
    examples: [
      {
        before: "Built payment system",
        after: "At PayFlow (Series B fintech startup), built payment system processing 100K+ transactions monthly",
      },
    ],
    applicableTo: ["context"],
  },

  {
    id: "COMPANY_CONTEXT_COMPARABLE",
    name: "Comparable Company Context",
    pattern: "At {company} (similar to early-stage {well_known_company}), {rest_of_bullet}",
    variables: ["company", "well_known_company", "rest_of_bullet"],
    examples: [
      {
        before: "Developed ML features",
        after: "At DataMind (similar to early-stage Databricks), developed ML features powering 50+ enterprise clients",
      },
    ],
    applicableTo: ["context"],
  },
];

/**
 * Soft Skills Integration Templates
 */
export const SOFT_SKILL_TEMPLATES: BulletTemplate[] = [
  {
    id: "LEADERSHIP_INTEGRATION",
    name: "Leadership Integration",
    pattern: "{led_verb} {team_desc} to {achievement}, {result}",
    variables: ["led_verb", "team_desc", "achievement", "result"],
    examples: [
      {
        before: "Worked on new feature launch",
        after: "Led cross-functional team of 6 to launch new feature, driving 25% increase in user engagement",
      },
    ],
    applicableTo: ["soft_skills"],
  },

  {
    id: "COLLABORATION_INTEGRATION",
    name: "Collaboration Integration",
    pattern: "{collab_verb} with {teams} to {action}, resulting in {outcome}",
    variables: ["collab_verb", "teams", "action", "outcome"],
    examples: [
      {
        before: "Improved API performance",
        after: "Collaborated with backend and DevOps teams to optimize API performance, reducing latency by 60%",
      },
    ],
    applicableTo: ["soft_skills"],
  },

  {
    id: "COMMUNICATION_INTEGRATION",
    name: "Communication Integration",
    pattern: "{comm_verb} {what} to {audience}, {outcome}",
    variables: ["comm_verb", "what", "audience", "outcome"],
    examples: [
      {
        before: "Created technical documentation",
        after: "Authored technical documentation and presented architecture decisions to VP-level stakeholders, securing $500K budget approval",
      },
    ],
    applicableTo: ["soft_skills"],
  },
];

/**
 * Keyword Integration Templates
 */
export const KEYWORD_TEMPLATES: BulletTemplate[] = [
  {
    id: "NATURAL_KEYWORD_INSERT",
    name: "Natural Keyword Insertion",
    pattern: "{original_bullet} using {keywords}",
    variables: ["original_bullet", "keywords"],
    examples: [
      {
        before: "Built data pipeline",
        after: "Built data pipeline using Apache Kafka and Spark, processing 1M+ events per second",
      },
    ],
    applicableTo: ["keywords"],
  },

  {
    id: "KEYWORD_LEAD",
    name: "Keyword-Led Bullet",
    pattern: "Leveraging {keyword}, {action} to {result}",
    variables: ["keyword", "action", "result"],
    examples: [
      {
        before: "Created machine learning model",
        after: "Leveraging TensorFlow and PyTorch, developed ML model achieving 95% accuracy in fraud detection",
      },
    ],
    applicableTo: ["keywords"],
  },
];

/**
 * All bullet templates
 */
export const ALL_BULLET_TEMPLATES: BulletTemplate[] = [
  ...CAR_TEMPLATES,
  ...SCALE_TEMPLATES,
  ...PERCENTAGE_TEMPLATES,
  ...TIME_TEMPLATES,
  ...COMPANY_CONTEXT_TEMPLATES,
  ...SOFT_SKILL_TEMPLATES,
  ...KEYWORD_TEMPLATES,
];

/**
 * Get template by ID
 */
export function getBulletTemplate(id: string): BulletTemplate | undefined {
  return ALL_BULLET_TEMPLATES.find((t) => t.id === id);
}

/**
 * Get templates applicable to a specific transformation type
 */
export function getTemplatesForType(
  type: "metrics" | "context" | "keywords" | "soft_skills"
): BulletTemplate[] {
  return ALL_BULLET_TEMPLATES.filter((t) => t.applicableTo.includes(type));
}
