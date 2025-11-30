/**
 * Retry utilities for Anthropic API calls
 *
 * This module provides automatic retry functionality for transient API errors
 * such as rate limits (429), service unavailable (503), and overloaded (529).
 *
 * @example
 * ```typescript
 * import { withRetry } from "@/lib/ai/retry";
 *
 * const response = await withRetry(() =>
 *   client.messages.create({ ... })
 * );
 * ```
 */

// Main retry wrapper
export { withRetry, createRetryWrapper, type RetryOptions } from "./retry-client";

// Configuration
export {
  type RetryConfig,
  type RetryEvent,
  DEFAULT_RETRY_CONFIG,
  getRetryConfig,
  loadRetryConfig,
  resetRetryConfigCache,
} from "./retry-config";

// Error detection utilities
export {
  isTransientError,
  getRetryAfterMs,
  getErrorCode,
  enhanceError,
  hasRetryMetadata,
  getUserFriendlyMessage,
} from "./retry-errors";

// Backoff strategy
export { calculateDelay, delay } from "./retry-strategy";

// Logging
export { logRetryEvent, createRetryLogger } from "./retry-logger";
