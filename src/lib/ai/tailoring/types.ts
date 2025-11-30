/**
 * Hybrid Tailoring System Types
 *
 * This module defines the type system for the recruiter-optimized resume tailoring system
 * that addresses 5 critical issues:
 * 1. Resumes look identical (uniqueness)
 * 2. Lists duties, not impact (impact quantification)
 * 3. Unknown companies need context (U.S. context translation)
 * 4. Not showing cultural fit (soft skills)
 * 5. Generic applications (customization)
 */

import type { ImpactResult } from "@/lib/validations/impact";
import type { UniquenessResult } from "@/lib/validations/uniqueness";
import type { ContextResult } from "@/lib/validations/context";
import type { ResumeContent } from "@/lib/validations/resume";

// =============================================================================
// RECRUITER ISSUE TYPES
// =============================================================================

/**
 * The 5 recruiter issues this system addresses
 */
export type RecruiterIssue = 1 | 2 | 3 | 4 | 5;

export const RECRUITER_ISSUES = {
  1: { name: "Uniqueness", description: "Resumes look identical" },
  2: { name: "Impact", description: "Lists duties, not impact" },
  3: { name: "US Context", description: "Unknown companies need context" },
  4: { name: "Cultural Fit", description: "Not showing cultural fit" },
  5: { name: "Customization", description: "Generic applications" },
} as const;

// =============================================================================
// PRE-ANALYSIS TYPES
// =============================================================================

/**
 * Company research result for U.S. context translation
 */
export interface CompanyResearchResult {
  companyName: string;
  isWellKnown: boolean;
  industry: string | null;
  size: "startup" | "growth" | "enterprise" | "unknown";
  fundingStage: string | null;
  comparable: string | null; // Well-known company comparison
  context: string; // Generated context string
}

/**
 * Soft skill assessment for cultural fit
 */
export interface SoftSkillAssessment {
  skill: string;
  evidence: string[];
  strength: "weak" | "moderate" | "strong";
  bulletIds: string[]; // Experience bullet IDs where this was demonstrated
}

/**
 * Aggregated pre-analysis results from all modules
 */
export interface PreAnalysisResult {
  impact: ImpactResult;
  uniqueness: UniquenessResult;
  context: ContextResult;
  company: CompanyResearchResult | null;
  softSkills: SoftSkillAssessment[];

  // Metadata
  analyzedAt: Date;
  resumeId: string;
  jobId: string;
}

// =============================================================================
// RULE ENGINE TYPES
// =============================================================================

/**
 * Strategic tone for transformations
 * - confident: Assertive language for strong matches
 * - measured: Balanced language for moderate matches
 * - humble: Conservative language for stretch opportunities
 */
export type StrategicTone = "confident" | "measured" | "humble";

/**
 * Rule condition types for evaluating when a rule should apply
 */
export interface RuleCondition {
  type: "AND" | "OR" | "THRESHOLD" | "MATCH" | "EXISTS" | "NOT";
  field?: string;
  operator?: "<" | "<=" | "=" | ">=" | ">" | "in" | "contains";
  value?: number | string | string[] | boolean;
  conditions?: RuleCondition[];
}

/**
 * Transformation action types
 */
export type TransformActionType =
  | "apply_template"      // Apply a bullet/summary template
  | "reorder"             // Reorder items by relevance
  | "enhance"             // Add metrics/keywords
  | "contextualize"       // Add company/experience context
  | "highlight"           // Promote to "Why I'm the Right Fit" section
  | "inject_keywords"     // Add missing keywords naturally
  | "add_soft_skills";    // Weave soft skill evidence into bullets

/**
 * Target for transformation
 */
export type TransformTarget = "bullet" | "summary" | "skills" | "experience" | "section";

/**
 * A single transformation action
 */
export interface TransformationAction {
  type: TransformActionType;
  target: TransformTarget;
  templateId?: string;
  data?: Record<string, unknown>;
  preserveOriginalMeaning: boolean;
}

/**
 * A transformation rule definition
 */
export interface TransformationRule {
  id: string;
  name: string;
  description: string;
  priority: number; // Lower = higher priority (processed first)
  recruiterIssue: RecruiterIssue;
  condition: RuleCondition;
  actions: TransformationAction[];
  strategicTone: StrategicTone;
  enabled: boolean;
}

/**
 * Result of evaluating a rule
 */
export interface RuleEvaluationResult {
  ruleId: string;
  ruleName: string;
  matched: boolean;
  recruiterIssue: RecruiterIssue;
  matchedTargets: string[]; // IDs of bullets/experiences that matched
  actions: TransformationAction[];
  strategicTone: StrategicTone;
}

// =============================================================================
// TRANSFORMATION INSTRUCTION TYPES
// =============================================================================

/**
 * Instruction for transforming a single bullet point
 */
export interface BulletTransformInstruction {
  bulletId: string;
  experienceId: string;
  originalText: string;

  // What to change
  addMetrics: boolean;
  suggestedMetrics: string[]; // From impact analysis

  addKeywords: boolean;
  keywordsToAdd: string[]; // From context analysis

  addContext: boolean;
  contextToAdd: string; // Company context

  addSoftSkills: boolean;
  softSkillsToWeave: string[];

  // Template to use
  templateId: string | null;

  // Strategic positioning
  tone: StrategicTone;

  // Improvement level from impact analysis
  improvementLevel: "none" | "minor" | "major" | "transformed";

  // The final rewrite instruction for AI
  rewriteInstruction: string;
}

/**
 * Instruction for transforming the summary
 */
export interface SummaryTransformInstruction {
  originalSummary: string | undefined;
  targetRole: string;
  targetCompany: string;

  // What to include
  uniqueDifferentiators: string[];
  matchedSkills: string[];
  companyAlignment: string | null;

  // Tone
  tone: StrategicTone;

  // The final instruction for AI
  rewriteInstruction: string;
}

/**
 * Instruction for the "Why I'm the Right Fit" section
 */
export interface WhyFitInstruction {
  bullets: Array<{
    label: string; // Bold prefix
    text: string;
    source: "uniqueness" | "experience" | "skill" | "achievement";
    rarity: "uncommon" | "rare" | "very_rare";
  }>;
}

/**
 * Skills reordering instruction
 */
export interface SkillsReorderInstruction {
  technical: {
    original: string[];
    reordered: string[];
    matchedFirst: string[];
    toAdd: string[];
  };
  soft: {
    original: string[];
    reordered: string[];
    emphasized: string[];
  };
}

/**
 * Experience reordering instruction
 */
export interface ExperienceReorderInstruction {
  experienceIds: string[];
  relevanceScores: Record<string, number>;
  newOrder: string[];
}

/**
 * Complete transformation instructions for AI rewriting
 */
export interface TransformationInstructions {
  bullets: BulletTransformInstruction[];
  summary: SummaryTransformInstruction;
  whyFit: WhyFitInstruction;
  skills: SkillsReorderInstruction;
  experienceOrder: ExperienceReorderInstruction;

  // Applied rules for debugging/tracing
  appliedRules: RuleEvaluationResult[];

  // Overall strategic tone
  overallTone: StrategicTone;
}

// =============================================================================
// SCORING TYPES
// =============================================================================

/**
 * A single dimension score
 */
export interface DimensionScore {
  raw: number; // 0-100
  weighted: number; // After weight applied
  weight: number; // 0-1
  label: string;
  color: string;
  suggestions: string[];
}

/**
 * Recruiter readiness score with all dimensions
 */
export interface RecruiterReadinessScore {
  composite: number; // 0-100 weighted average
  label: "needs_work" | "getting_there" | "good" | "strong" | "exceptional";
  color: string;

  dimensions: {
    uniqueness: DimensionScore;    // Issue #1, weight: 20%
    impact: DimensionScore;        // Issue #2, weight: 30%
    contextTranslation: DimensionScore; // Issue #3, weight: 15%
    culturalFit: DimensionScore;   // Issue #4, weight: 10%
    customization: DimensionScore; // Issue #5, weight: 25%
  };

  // Top 3 actionable suggestions
  topSuggestions: Array<{
    dimension: keyof RecruiterReadinessScore["dimensions"];
    action: string;
    impact: "high" | "medium" | "low";
  }>;
}

// =============================================================================
// HYBRID TAILOR OUTPUT TYPES
// =============================================================================

/**
 * Changes made during tailoring
 */
export interface TailoringChanges {
  summaryModified: boolean;
  summaryDiff: { before: string | undefined; after: string } | null;

  experienceBulletsModified: number;
  bulletDiffs: Array<{
    bulletId: string;
    experienceId: string;
    before: string;
    after: string;
    changeType: "metrics" | "keywords" | "context" | "soft_skills" | "combined";
  }>;

  skillsReordered: boolean;
  skillsAdded: string[];

  experiencesReordered: boolean;

  whyFitSectionAdded: boolean;
  whyFitBulletCount: number;

  competenciesGenerated: boolean;
}

/**
 * Complete result from hybrid tailoring
 */
export interface HybridTailorResult {
  // The tailored resume content
  tailoredResume: ResumeContent;

  // Pre-analysis data
  preAnalysis: PreAnalysisResult;

  // Rules that were applied
  appliedRules: RuleEvaluationResult[];

  // Detailed changes for comparison view
  changes: TailoringChanges;

  // Quality score
  qualityScore: RecruiterReadinessScore;

  // Token usage for monitoring
  tokenUsage: {
    preAnalysis: number;
    rewriting: number;
    total: number;
    savedVsPureAI: number; // Estimated savings
  };

  // Metadata
  tailoredAt: Date;
  processingTimeMs: number;
}

// =============================================================================
// TEMPLATE TYPES
// =============================================================================

/**
 * Bullet template definition
 */
export interface BulletTemplate {
  id: string;
  name: string;
  pattern: string;
  variables: string[];
  examples: Array<{
    before: string;
    after: string;
  }>;
  applicableTo: Array<"metrics" | "context" | "keywords" | "soft_skills">;
}

/**
 * Summary template definition
 */
export interface SummaryTemplate {
  id: string;
  name: string;
  structure: string;
  variables: string[];
  toneGuidelines: Record<StrategicTone, string>;
}

// =============================================================================
// JOB DATA (re-export for convenience)
// =============================================================================

export interface JobData {
  id: string;
  title: string;
  companyName: string | null;
  description: string | null;
  requirements: string[] | null;
  skills: string[] | null;
}
