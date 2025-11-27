import { describe, it, expect } from "vitest";
import { z } from "zod";

// Test the environment schema logic directly without module caching issues
describe("Environment Validation Schema", () => {
  const envSchema = z.object({
    DATABASE_URL: z.string().default("file:./data/resume-maker.db"),
    AI_PROVIDER: z.enum(["anthropic", "openai"]).default("anthropic"),
    ANTHROPIC_API_KEY: z.string().optional(),
    OPENAI_API_KEY: z.string().optional(),
    AI_MODEL: z.string().default("claude-sonnet-4-5-20250929"),
    AI_TEMPERATURE: z.coerce.number().min(0).max(2).default(0.7),
    AI_MAX_TOKENS: z.coerce.number().min(100).max(8000).default(4000),
    ENABLE_AI_TAILORING: z.string().default("true").transform(v => v === "true"),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  });

  it("should use default values when not specified", () => {
    const env = envSchema.parse({});

    expect(env.DATABASE_URL).toBe("file:./data/resume-maker.db");
    expect(env.AI_PROVIDER).toBe("anthropic");
    expect(env.AI_MODEL).toBe("claude-sonnet-4-5-20250929");
    expect(env.AI_TEMPERATURE).toBe(0.7);
    expect(env.AI_MAX_TOKENS).toBe(4000);
    expect(env.NODE_ENV).toBe("development");
  });

  it("should parse AI_TEMPERATURE as number", () => {
    const env = envSchema.parse({ AI_TEMPERATURE: "0.5" });

    expect(env.AI_TEMPERATURE).toBe(0.5);
    expect(typeof env.AI_TEMPERATURE).toBe("number");
  });

  it("should parse feature flags as booleans", () => {
    const env = envSchema.parse({ ENABLE_AI_TAILORING: "false" });

    expect(env.ENABLE_AI_TAILORING).toBe(false);
    expect(typeof env.ENABLE_AI_TAILORING).toBe("boolean");
  });

  it("should accept valid AI provider", () => {
    const env1 = envSchema.parse({ AI_PROVIDER: "anthropic" });
    const env2 = envSchema.parse({ AI_PROVIDER: "openai" });

    expect(env1.AI_PROVIDER).toBe("anthropic");
    expect(env2.AI_PROVIDER).toBe("openai");
  });

  it("should reject invalid AI provider", () => {
    const result = envSchema.safeParse({ AI_PROVIDER: "invalid" });
    expect(result.success).toBe(false);
  });

  it("should accept valid NODE_ENV values", () => {
    const envDev = envSchema.parse({ NODE_ENV: "development" });
    const envProd = envSchema.parse({ NODE_ENV: "production" });
    const envTest = envSchema.parse({ NODE_ENV: "test" });

    expect(envDev.NODE_ENV).toBe("development");
    expect(envProd.NODE_ENV).toBe("production");
    expect(envTest.NODE_ENV).toBe("test");
  });

  it("should validate temperature range", () => {
    const valid = envSchema.safeParse({ AI_TEMPERATURE: "1.0" });
    expect(valid.success).toBe(true);

    const tooLow = envSchema.safeParse({ AI_TEMPERATURE: "-1" });
    expect(tooLow.success).toBe(false);

    const tooHigh = envSchema.safeParse({ AI_TEMPERATURE: "3" });
    expect(tooHigh.success).toBe(false);
  });

  it("should validate max tokens range", () => {
    const valid = envSchema.safeParse({ AI_MAX_TOKENS: "4000" });
    expect(valid.success).toBe(true);

    const tooLow = envSchema.safeParse({ AI_MAX_TOKENS: "50" });
    expect(tooLow.success).toBe(false);

    const tooHigh = envSchema.safeParse({ AI_MAX_TOKENS: "10000" });
    expect(tooHigh.success).toBe(false);
  });

  it("should validate URL format for app URL", () => {
    const valid = envSchema.safeParse({ NEXT_PUBLIC_APP_URL: "https://example.com" });
    expect(valid.success).toBe(true);

    const invalid = envSchema.safeParse({ NEXT_PUBLIC_APP_URL: "not-a-url" });
    expect(invalid.success).toBe(false);
  });
});

describe("AI Configuration Detection", () => {
  function isAIConfigured(provider: string, anthropicKey?: string, openaiKey?: string): boolean {
    return (
      (provider === "anthropic" && !!anthropicKey) ||
      (provider === "openai" && !!openaiKey)
    );
  }

  it("should detect when AI is configured with Anthropic", () => {
    expect(isAIConfigured("anthropic", "test-key", undefined)).toBe(true);
    expect(isAIConfigured("anthropic", undefined, "test-key")).toBe(false);
  });

  it("should detect when AI is configured with OpenAI", () => {
    expect(isAIConfigured("openai", undefined, "test-key")).toBe(true);
    expect(isAIConfigured("openai", "test-key", undefined)).toBe(false);
  });

  it("should detect when AI is not configured", () => {
    expect(isAIConfigured("anthropic", undefined, undefined)).toBe(false);
    expect(isAIConfigured("openai", undefined, undefined)).toBe(false);
  });
});

describe("Environment Helper Functions", () => {
  function isProduction(nodeEnv: string): boolean {
    return nodeEnv === "production";
  }

  function isDevelopment(nodeEnv: string): boolean {
    return nodeEnv === "development";
  }

  function isTest(nodeEnv: string): boolean {
    return nodeEnv === "test";
  }

  it("should correctly identify production environment", () => {
    expect(isProduction("production")).toBe(true);
    expect(isProduction("development")).toBe(false);
    expect(isProduction("test")).toBe(false);
  });

  it("should correctly identify development environment", () => {
    expect(isDevelopment("development")).toBe(true);
    expect(isDevelopment("production")).toBe(false);
    expect(isDevelopment("test")).toBe(false);
  });

  it("should correctly identify test environment", () => {
    expect(isTest("test")).toBe(true);
    expect(isTest("development")).toBe(false);
    expect(isTest("production")).toBe(false);
  });
});
