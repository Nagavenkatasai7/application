import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
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
} from "./config";

describe("AI Configuration", () => {
  // Store original env
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset cache before each test
    resetAIConfigCache();
    // Reset environment
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    resetAIConfigCache();
  });

  describe("aiProviderEnum", () => {
    it("should accept valid providers", () => {
      const validProviders: AIProvider[] = ["anthropic", "openai"];

      validProviders.forEach((provider) => {
        const result = aiProviderEnum.safeParse(provider);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid providers", () => {
      const result = aiProviderEnum.safeParse("invalid_provider");
      expect(result.success).toBe(false);
    });
  });

  describe("aiModelEnum", () => {
    it("should accept valid Anthropic models", () => {
      const anthropicModels: AIModel[] = [
        "claude-sonnet-4-5-20250929",
        "claude-3-5-sonnet-20241022",
        "claude-3-5-haiku-20241022",
        "claude-3-opus-20240229",
      ];

      anthropicModels.forEach((model) => {
        const result = aiModelEnum.safeParse(model);
        expect(result.success).toBe(true);
      });
    });

    it("should accept valid OpenAI models", () => {
      const openaiModels: AIModel[] = ["gpt-4-turbo", "gpt-4o", "gpt-3.5-turbo"];

      openaiModels.forEach((model) => {
        const result = aiModelEnum.safeParse(model);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid models", () => {
      const result = aiModelEnum.safeParse("invalid-model");
      expect(result.success).toBe(false);
    });
  });

  describe("aiConfigSchema", () => {
    it("should accept valid complete config", () => {
      const config = {
        provider: "anthropic",
        apiKey: "sk-ant-test-key",
        model: "claude-3-5-sonnet-20241022",
        temperature: 0.7,
        maxTokens: 4000,
        timeout: 60000,
      };

      const result = aiConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it("should apply defaults for optional fields", () => {
      const config = {
        apiKey: "sk-ant-test-key",
      };

      const result = aiConfigSchema.parse(config);
      expect(result.provider).toBe("anthropic");
      expect(result.model).toBe("claude-sonnet-4-5-20250929");
      expect(result.temperature).toBe(0.7);
      expect(result.maxTokens).toBe(4000);
      expect(result.timeout).toBe(60000); // 60s per request (allows 3 attempts in 180s Vercel budget)
    });

    it("should require apiKey", () => {
      const config = {
        provider: "anthropic",
      };

      const result = aiConfigSchema.safeParse(config);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("apiKey");
      }
    });

    it("should reject empty apiKey", () => {
      const config = {
        apiKey: "",
      };

      const result = aiConfigSchema.safeParse(config);
      expect(result.success).toBe(false);
    });

    it("should validate temperature range (0-2)", () => {
      const validTemps = [0, 0.5, 1, 1.5, 2];
      validTemps.forEach((temp) => {
        const result = aiConfigSchema.safeParse({
          apiKey: "test-key",
          temperature: temp,
        });
        expect(result.success).toBe(true);
      });

      const invalidTemps = [-0.1, 2.1, 3];
      invalidTemps.forEach((temp) => {
        const result = aiConfigSchema.safeParse({
          apiKey: "test-key",
          temperature: temp,
        });
        expect(result.success).toBe(false);
      });
    });

    it("should require positive maxTokens", () => {
      const result = aiConfigSchema.safeParse({
        apiKey: "test-key",
        maxTokens: 0,
      });
      expect(result.success).toBe(false);

      const negResult = aiConfigSchema.safeParse({
        apiKey: "test-key",
        maxTokens: -100,
      });
      expect(negResult.success).toBe(false);
    });

    it("should require positive timeout", () => {
      const result = aiConfigSchema.safeParse({
        apiKey: "test-key",
        timeout: 0,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("aiFeatureFlagsSchema", () => {
    it("should apply default values", () => {
      const result = aiFeatureFlagsSchema.parse({});

      expect(result.enableTailoring).toBe(true);
      expect(result.enableSummaryGeneration).toBe(true);
      expect(result.enableSkillExtraction).toBe(true);
      expect(result.enableBulletOptimization).toBe(true);
      expect(result.enableJobMatchAnalysis).toBe(true);
    });

    it("should accept explicit false values", () => {
      const result = aiFeatureFlagsSchema.parse({
        enableTailoring: false,
        enableSummaryGeneration: false,
      });

      expect(result.enableTailoring).toBe(false);
      expect(result.enableSummaryGeneration).toBe(false);
      expect(result.enableSkillExtraction).toBe(true);
    });
  });

  describe("loadAIConfig", () => {
    it("should load config from environment variables", () => {
      process.env.AI_PROVIDER = "openai";
      process.env.OPENAI_API_KEY = "sk-openai-test-key";
      process.env.AI_MODEL = "gpt-4o";
      process.env.AI_TEMPERATURE = "0.5";
      process.env.AI_MAX_TOKENS = "2000";
      process.env.AI_TIMEOUT = "30000";

      const config = loadAIConfig();

      expect(config.provider).toBe("openai");
      expect(config.apiKey).toBe("sk-openai-test-key");
      expect(config.model).toBe("gpt-4o");
      expect(config.temperature).toBe(0.5);
      expect(config.maxTokens).toBe(2000);
      expect(config.timeout).toBe(30000);
    });

    it("should use Anthropic API key when provider is anthropic", () => {
      process.env.AI_PROVIDER = "anthropic";
      process.env.ANTHROPIC_API_KEY = "sk-ant-test-key";

      const config = loadAIConfig();
      expect(config.apiKey).toBe("sk-ant-test-key");
    });

    it("should use OpenAI API key when provider is openai", () => {
      process.env.AI_PROVIDER = "openai";
      process.env.OPENAI_API_KEY = "sk-openai-test-key";

      const config = loadAIConfig();
      expect(config.apiKey).toBe("sk-openai-test-key");
    });

    it("should use default values when env vars are not set", () => {
      process.env.ANTHROPIC_API_KEY = "sk-ant-test-key";

      const config = loadAIConfig();

      expect(config.provider).toBe("anthropic");
      expect(config.model).toBe("claude-sonnet-4-5-20250929");
      expect(config.temperature).toBe(0.7);
      expect(config.maxTokens).toBe(4000);
      expect(config.timeout).toBe(60000); // 60s per request (allows 3 attempts in 180s Vercel budget)
    });

    it("should throw error when API key is missing", () => {
      delete process.env.ANTHROPIC_API_KEY;
      delete process.env.OPENAI_API_KEY;

      expect(() => loadAIConfig()).toThrow();
    });
  });

  describe("loadFeatureFlags", () => {
    it("should load feature flags from environment", () => {
      process.env.ENABLE_AI_TAILORING = "false";
      process.env.ENABLE_AI_SUMMARY = "false";

      const flags = loadFeatureFlags();

      expect(flags.enableTailoring).toBe(false);
      expect(flags.enableSummaryGeneration).toBe(false);
      expect(flags.enableSkillExtraction).toBe(true);
      expect(flags.enableBulletOptimization).toBe(true);
      expect(flags.enableJobMatchAnalysis).toBe(true);
    });

    it("should treat missing env vars as enabled (true)", () => {
      delete process.env.ENABLE_AI_TAILORING;
      delete process.env.ENABLE_AI_SUMMARY;

      const flags = loadFeatureFlags();

      expect(flags.enableTailoring).toBe(true);
      expect(flags.enableSummaryGeneration).toBe(true);
    });
  });

  describe("getAIConfig (cached)", () => {
    it("should return cached config on subsequent calls", () => {
      process.env.ANTHROPIC_API_KEY = "sk-ant-test-key";

      const config1 = getAIConfig();
      const config2 = getAIConfig();

      expect(config1).toBe(config2); // Same reference
    });

    it("should return fresh config after reset", () => {
      process.env.ANTHROPIC_API_KEY = "sk-ant-first-key";
      const config1 = getAIConfig();

      resetAIConfigCache();
      process.env.ANTHROPIC_API_KEY = "sk-ant-second-key";
      const config2 = getAIConfig();

      expect(config1.apiKey).toBe("sk-ant-first-key");
      expect(config2.apiKey).toBe("sk-ant-second-key");
    });
  });

  describe("getFeatureFlags (cached)", () => {
    it("should return cached flags on subsequent calls", () => {
      const flags1 = getFeatureFlags();
      const flags2 = getFeatureFlags();

      expect(flags1).toBe(flags2);
    });

    it("should return fresh flags after reset", () => {
      process.env.ENABLE_AI_TAILORING = "true";
      const flags1 = getFeatureFlags();

      resetAIConfigCache();
      process.env.ENABLE_AI_TAILORING = "false";
      const flags2 = getFeatureFlags();

      expect(flags1.enableTailoring).toBe(true);
      expect(flags2.enableTailoring).toBe(false);
    });
  });

  describe("isAIConfigured", () => {
    it("should return true when API key is configured", () => {
      process.env.ANTHROPIC_API_KEY = "sk-ant-test-key";

      expect(isAIConfigured()).toBe(true);
    });

    it("should return false when API key is missing", () => {
      delete process.env.ANTHROPIC_API_KEY;
      delete process.env.OPENAI_API_KEY;

      expect(isAIConfigured()).toBe(false);
    });
  });

  describe("MODEL_CONFIGS", () => {
    it("should have configs for all use cases", () => {
      expect(MODEL_CONFIGS.resumeTailoring).toBeDefined();
      expect(MODEL_CONFIGS.jobMatchAnalysis).toBeDefined();
      expect(MODEL_CONFIGS.skillExtraction).toBeDefined();
      expect(MODEL_CONFIGS.summaryGeneration).toBeDefined();
      expect(MODEL_CONFIGS.bulletOptimization).toBeDefined();
    });

    it("should have valid model names", () => {
      Object.values(MODEL_CONFIGS).forEach((config) => {
        const result = aiModelEnum.safeParse(config.model);
        expect(result.success).toBe(true);
      });
    });

    it("should have valid temperature values", () => {
      Object.values(MODEL_CONFIGS).forEach((config) => {
        expect(config.temperature).toBeGreaterThanOrEqual(0);
        expect(config.temperature).toBeLessThanOrEqual(2);
      });
    });

    it("should have positive maxTokens values", () => {
      Object.values(MODEL_CONFIGS).forEach((config) => {
        expect(config.maxTokens).toBeGreaterThan(0);
      });
    });
  });

  describe("getModelConfig", () => {
    it("should return correct config for each use case", () => {
      expect(getModelConfig("resumeTailoring")).toBe(MODEL_CONFIGS.resumeTailoring);
      expect(getModelConfig("jobMatchAnalysis")).toBe(MODEL_CONFIGS.jobMatchAnalysis);
      expect(getModelConfig("skillExtraction")).toBe(MODEL_CONFIGS.skillExtraction);
      expect(getModelConfig("summaryGeneration")).toBe(MODEL_CONFIGS.summaryGeneration);
      expect(getModelConfig("bulletOptimization")).toBe(MODEL_CONFIGS.bulletOptimization);
    });
  });
});
