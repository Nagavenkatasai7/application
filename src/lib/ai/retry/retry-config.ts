import { z } from "zod";

/**
 * Retry event emitted during retry attempts
 */
export interface RetryEvent {
  /** Current attempt number (1-indexed) */
  attempt: number;
  /** Maximum number of attempts */
  maxAttempts: number;
  /** The error that caused the retry */
  error: Error;
  /** Delay in milliseconds before next attempt */
  delayMs: number;
  /** Whether another retry will be attempted */
  willRetry: boolean;
  /** Error code for logging/metrics */
  errorCode: string;
  /** Retry-after delay from server header (if present) */
  retryAfterMs?: number;
}

/**
 * Retry configuration options
 */
export interface RetryConfig {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries: number;
  /** Initial delay in milliseconds before first retry (default: 1000) */
  initialDelayMs: number;
  /** Maximum delay cap in milliseconds (default: 30000) */
  maxDelayMs: number;
  /** Exponential backoff multiplier (default: 2) */
  backoffMultiplier: number;
  /** Jitter factor 0-1 to randomize delays (default: 0.1) */
  jitterFactor: number;
  /** HTTP status codes that should trigger retry */
  retryableStatusCodes: number[];
  /** Whether to respect Anthropic's retry-after header (default: true) */
  respectRetryAfterHeader: boolean;
  /** Callback for retry events (for logging/metrics) */
  onRetry?: (event: RetryEvent) => void;
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  jitterFactor: 0.1,
  retryableStatusCodes: [429, 500, 502, 503, 529],
  respectRetryAfterHeader: true,
};

/**
 * Zod schema for retry configuration validation
 */
export const retryConfigSchema = z.object({
  maxRetries: z.number().min(0).max(10).default(3),
  initialDelayMs: z.number().positive().default(1000),
  maxDelayMs: z.number().positive().default(30000),
  backoffMultiplier: z.number().min(1).max(4).default(2),
  jitterFactor: z.number().min(0).max(1).default(0.1),
  retryableStatusCodes: z.array(z.number()).default([429, 500, 502, 503, 529]),
  respectRetryAfterHeader: z.boolean().default(true),
});

/**
 * Load retry configuration from environment variables
 */
export function loadRetryConfig(): RetryConfig {
  return retryConfigSchema.parse({
    maxRetries: parseInt(process.env.AI_RETRY_MAX_ATTEMPTS || "3", 10),
    initialDelayMs: parseInt(process.env.AI_RETRY_INITIAL_DELAY_MS || "1000", 10),
    maxDelayMs: parseInt(process.env.AI_RETRY_MAX_DELAY_MS || "30000", 10),
    backoffMultiplier: parseFloat(process.env.AI_RETRY_BACKOFF_MULTIPLIER || "2"),
    jitterFactor: parseFloat(process.env.AI_RETRY_JITTER_FACTOR || "0.1"),
    retryableStatusCodes: process.env.AI_RETRY_STATUS_CODES
      ? process.env.AI_RETRY_STATUS_CODES.split(",").map((s) => parseInt(s.trim(), 10))
      : [429, 500, 502, 503, 529],
    respectRetryAfterHeader: process.env.AI_RETRY_RESPECT_RETRY_AFTER !== "false",
  });
}

/**
 * Cached retry configuration singleton
 */
let cachedRetryConfig: RetryConfig | null = null;

/**
 * Get retry configuration (cached)
 */
export function getRetryConfig(): RetryConfig {
  if (!cachedRetryConfig) {
    cachedRetryConfig = loadRetryConfig();
  }
  return cachedRetryConfig;
}

/**
 * Reset cached retry configuration
 */
export function resetRetryConfigCache(): void {
  cachedRetryConfig = null;
}
