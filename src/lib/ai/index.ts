/**
 * AI Module Exports
 * Central export point for all AI-related configuration and utilities
 */

// Configuration exports
export {
  aiProviderEnum,
  aiModelEnum,
  aiConfigSchema,
  aiFeatureFlagsSchema,
  loadAIConfig,
  loadFeatureFlags,
  getAIConfig,
  getFeatureFlags,
  isAIConfigured,
  resetAIConfigCache,
  getModelConfig,
  MODEL_CONFIGS,
  type AIProvider,
  type AIModel,
  type AIConfig,
  type AIFeatureFlags,
} from "./config";

// Prompt exports
export {
  RESUME_TAILORING_SYSTEM_PROMPT,
  SKILL_EXTRACTION_SYSTEM_PROMPT,
  SUMMARY_GENERATION_SYSTEM_PROMPT,
  BULLET_OPTIMIZATION_SYSTEM_PROMPT,
  JOB_MATCH_ANALYSIS_SYSTEM_PROMPT,
  buildResumeTailoringPrompt,
  buildSkillExtractionPrompt,
  buildSummaryGenerationPrompt,
  buildBulletOptimizationPrompt,
  buildJobMatchAnalysisPrompt,
  formatResumeForPrompt,
  type JobMatchAnalysisResult,
  type SkillExtractionResult,
} from "./prompts";
