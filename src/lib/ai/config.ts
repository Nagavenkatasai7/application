import { z } from "zod";

/**
 * AI Provider enum - currently supporting Anthropic Claude
 * Can be extended to support other providers in the future
 */
export const aiProviderEnum = z.enum(["anthropic", "openai"]);
export type AIProvider = z.infer<typeof aiProviderEnum>;

/**
 * Available AI models
 * Claude models for different use cases:
 * - claude-3-5-sonnet: Best for complex tasks, resume tailoring
 * - claude-3-haiku: Fast and efficient for simple tasks
 */
export const aiModelEnum = z.enum([
  "claude-sonnet-4-5-20250929",
  "claude-3-5-sonnet-20241022",
  "claude-3-5-haiku-20241022",
  "claude-3-opus-20240229",
  "gpt-4-turbo",
  "gpt-4o",
  "gpt-3.5-turbo",
]);
export type AIModel = z.infer<typeof aiModelEnum>;

/**
 * AI Configuration schema with Zod validation
 */
export const aiConfigSchema = z.object({
  provider: aiProviderEnum.default("anthropic"),
  apiKey: z.string().min(1, "API key is required"),
  model: aiModelEnum.default("claude-sonnet-4-5-20250929"),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().positive().default(4000),
  timeout: z.number().positive().default(180000), // 180 seconds (3 minutes) for complex AI operations
});

export type AIConfig = z.infer<typeof aiConfigSchema>;

/**
 * Feature flags for AI capabilities
 */
export const aiFeatureFlagsSchema = z.object({
  enableTailoring: z.boolean().default(true),
  enableSummaryGeneration: z.boolean().default(true),
  enableSkillExtraction: z.boolean().default(true),
  enableBulletOptimization: z.boolean().default(true),
  enableJobMatchAnalysis: z.boolean().default(true),
});

export type AIFeatureFlags = z.infer<typeof aiFeatureFlagsSchema>;

/**
 * Load AI configuration from environment variables
 * Throws ZodError if configuration is invalid
 */
export function loadAIConfig(): AIConfig {
  const rawConfig = {
    provider: process.env.AI_PROVIDER || "anthropic",
    apiKey: process.env.AI_PROVIDER === "openai"
      ? process.env.OPENAI_API_KEY
      : process.env.ANTHROPIC_API_KEY,
    model: process.env.AI_MODEL || "claude-sonnet-4-5-20250929",
    temperature: parseFloat(process.env.AI_TEMPERATURE || "0.7"),
    maxTokens: parseInt(process.env.AI_MAX_TOKENS || "4000", 10),
    timeout: parseInt(process.env.AI_TIMEOUT || "180000", 10),
  };

  return aiConfigSchema.parse(rawConfig);
}

/**
 * Load feature flags from environment variables
 */
export function loadFeatureFlags(): AIFeatureFlags {
  return aiFeatureFlagsSchema.parse({
    enableTailoring: process.env.ENABLE_AI_TAILORING !== "false",
    enableSummaryGeneration: process.env.ENABLE_AI_SUMMARY !== "false",
    enableSkillExtraction: process.env.ENABLE_AI_SKILL_EXTRACTION !== "false",
    enableBulletOptimization: process.env.ENABLE_AI_BULLET_OPTIMIZATION !== "false",
    enableJobMatchAnalysis: process.env.ENABLE_AI_JOB_MATCH !== "false",
  });
}

/**
 * Cached configuration singleton
 * Prevents re-parsing environment variables on every call
 */
let cachedConfig: AIConfig | null = null;
let cachedFeatureFlags: AIFeatureFlags | null = null;

/**
 * Get AI configuration (cached)
 * @throws Error if API key is not configured
 */
export function getAIConfig(): AIConfig {
  if (!cachedConfig) {
    cachedConfig = loadAIConfig();
  }
  return cachedConfig;
}

/**
 * Get feature flags (cached)
 */
export function getFeatureFlags(): AIFeatureFlags {
  if (!cachedFeatureFlags) {
    cachedFeatureFlags = loadFeatureFlags();
  }
  return cachedFeatureFlags;
}

/**
 * Check if AI features are available
 * Returns false if API key is not configured
 */
export function isAIConfigured(): boolean {
  try {
    const config = getAIConfig();
    return !!config.apiKey;
  } catch {
    return false;
  }
}

/**
 * Reset cached configuration
 * Useful for testing or when environment changes
 */
export function resetAIConfigCache(): void {
  cachedConfig = null;
  cachedFeatureFlags = null;
}

/**
 * Model-specific configurations for different use cases
 */
export const MODEL_CONFIGS = {
  // Parse resume text into structured format
  resumeParsing: {
    model: "claude-sonnet-4-5-20250929" as AIModel,
    temperature: 0.1, // Low temperature for consistent parsing
    maxTokens: 4000,
  },
  // Best for complex reasoning and creative writing
  resumeTailoring: {
    model: "claude-sonnet-4-5-20250929" as AIModel,
    temperature: 0.7,
    maxTokens: 4000,
  },
  // Best for analytical tasks
  jobMatchAnalysis: {
    model: "claude-sonnet-4-5-20250929" as AIModel,
    temperature: 0.3,
    maxTokens: 2000,
  },
  // Fast extraction tasks
  skillExtraction: {
    model: "claude-3-5-haiku-20241022" as AIModel,
    temperature: 0.2,
    maxTokens: 1000,
  },
  // Creative summary generation
  summaryGeneration: {
    model: "claude-sonnet-4-5-20250929" as AIModel,
    temperature: 0.7,
    maxTokens: 500,
  },
  // Bullet point improvements
  bulletOptimization: {
    model: "claude-sonnet-4-5-20250929" as AIModel,
    temperature: 0.5,
    maxTokens: 1500,
  },
  // Conversational assessments (soft skills survey)
  conversational: {
    model: "claude-sonnet-4-5-20250929" as AIModel,
    temperature: 0.7,
    maxTokens: 1000,
  },
  // Company research and intelligence
  companyResearch: {
    model: "claude-sonnet-4-5-20250929" as AIModel,
    temperature: 0.5,
    maxTokens: 4000,
  },
} as const;

/**
 * Get model configuration for a specific use case
 */
export function getModelConfig(useCase: keyof typeof MODEL_CONFIGS) {
  return MODEL_CONFIGS[useCase];
}
