/**
 * Tailoring Module
 *
 * Recruiter-optimized resume tailoring system that addresses
 * 5 critical issues that cause international students to be rejected:
 *
 * 1. Resumes look identical (→ Uniqueness highlighting)
 * 2. Lists duties, not impact (→ Metrics quantification)
 * 3. Unknown companies need context (→ U.S. context translation)
 * 4. Not showing cultural fit (→ Soft skills integration)
 * 5. Generic applications (→ Job-specific customization)
 */

// Main orchestrator
export { hybridTailor, analyzeForTailoring, HybridTailorError } from "./hybrid-tailor";

// Types
export type {
  // Core types
  RecruiterIssue,
  StrategicTone,
  JobData,

  // Pre-analysis types
  PreAnalysisResult,
  CompanyResearchResult,
  SoftSkillAssessment,

  // Rule types
  TransformationRule,
  RuleCondition,
  TransformationAction,
  RuleEvaluationResult,

  // Instruction types
  TransformationInstructions,
  BulletTransformInstruction,
  SummaryTransformInstruction,
  WhyFitInstruction,
  SkillsReorderInstruction,
  ExperienceReorderInstruction,

  // Scoring types
  RecruiterReadinessScore,
  DimensionScore,

  // Result types
  HybridTailorResult,
  TailoringChanges,

  // Template types
  BulletTemplate,
  SummaryTemplate,
} from "./types";

// Pre-analysis
export { runPreAnalysis, PreAnalysisError, summarizePreAnalysis } from "./pre-analysis";

// Rule engine
export {
  evaluateCondition,
  evaluateRule,
  evaluateRules,
  calculateStrategicTone,
  generateTransformationInstructions,
} from "./rule-engine";

// Rules
export {
  getAllEnabledRules,
  getRulesByIssue,
  getRuleStats,
  getImpactRules,
  getUniquenessRules,
  getContextRules,
  getUSContextRules,
  getCulturalFitRules,
} from "./rules";

// Templates
export {
  getBulletTemplate,
  getTemplatesForType,
  getSummaryTemplate,
  suggestSummaryTemplate,
} from "./templates";

// Rewriter
export { rewriteBullets, rewriteSummary, polishWhyFitBullets, applyTransformations } from "./rewriter";
