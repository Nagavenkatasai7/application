import { z } from "zod";

/**
 * Environment variable schema for runtime validation
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z
    .string()
    .default("file:./data/resume-maker.db")
    .describe("SQLite database file path"),

  // AI Provider
  AI_PROVIDER: z
    .enum(["anthropic", "openai"])
    .default("anthropic")
    .describe("AI provider to use"),

  ANTHROPIC_API_KEY: z
    .string()
    .optional()
    .describe("Anthropic API key (required if AI_PROVIDER=anthropic)"),

  OPENAI_API_KEY: z
    .string()
    .optional()
    .describe("OpenAI API key (required if AI_PROVIDER=openai)"),

  // AI Configuration
  AI_MODEL: z
    .string()
    .default("claude-sonnet-4-5-20250929")
    .describe("AI model to use"),

  AI_TEMPERATURE: z.coerce
    .number()
    .min(0)
    .max(2)
    .default(0.7)
    .describe("Model temperature"),

  AI_MAX_TOKENS: z.coerce
    .number()
    .min(100)
    .max(8000)
    .default(4000)
    .describe("Maximum tokens per response"),

  AI_TIMEOUT: z.coerce
    .number()
    .default(60000)
    .describe("AI request timeout in milliseconds"),

  // Feature Flags (using transform to properly handle "true"/"false" strings)
  ENABLE_AI_TAILORING: z.string().default("true").transform(v => v === "true"),
  ENABLE_AI_SUMMARY: z.string().default("true").transform(v => v === "true"),
  ENABLE_AI_SKILL_EXTRACTION: z.string().default("true").transform(v => v === "true"),
  ENABLE_AI_BULLET_OPTIMIZATION: z.string().default("true").transform(v => v === "true"),
  ENABLE_AI_JOB_MATCH: z.string().default("true").transform(v => v === "true"),

  // Application
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  NEXT_PUBLIC_APP_URL: z
    .string()
    .url()
    .default("http://localhost:3000")
    .describe("Application URL"),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validated environment variables
 * Throws on invalid configuration
 */
function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("Environment validation failed:");
    console.error(result.error.flatten().fieldErrors);
    throw new Error("Invalid environment configuration");
  }

  const env = result.data;

  // Validate AI provider has required API key
  if (env.AI_PROVIDER === "anthropic" && !env.ANTHROPIC_API_KEY) {
    console.warn(
      "Warning: AI_PROVIDER is set to 'anthropic' but ANTHROPIC_API_KEY is not set. AI features will be disabled."
    );
  }

  if (env.AI_PROVIDER === "openai" && !env.OPENAI_API_KEY) {
    console.warn(
      "Warning: AI_PROVIDER is set to 'openai' but OPENAI_API_KEY is not set. AI features will be disabled."
    );
  }

  return env;
}

/**
 * Get validated environment variables
 * Caches the result after first validation
 */
let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (!cachedEnv) {
    cachedEnv = validateEnv();
  }
  return cachedEnv;
}

/**
 * Check if AI is configured and available
 */
export function isAIConfigured(): boolean {
  const env = getEnv();
  return (
    (env.AI_PROVIDER === "anthropic" && !!env.ANTHROPIC_API_KEY) ||
    (env.AI_PROVIDER === "openai" && !!env.OPENAI_API_KEY)
  );
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return getEnv().NODE_ENV === "production";
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return getEnv().NODE_ENV === "development";
}

/**
 * Check if running in test environment
 */
export function isTest(): boolean {
  return getEnv().NODE_ENV === "test";
}
