import type { RetryConfig, RetryEvent } from "./retry-config";
import { DEFAULT_RETRY_CONFIG, getRetryConfig } from "./retry-config";
import {
  isTransientError,
  getRetryAfterMs,
  getErrorCode,
  enhanceError,
} from "./retry-errors";
import { calculateDelay, delay } from "./retry-strategy";
import { logRetryEvent } from "./retry-logger";

/**
 * Extended retry options with time budget support
 */
export interface RetryOptions extends Partial<RetryConfig> {
  /** Total time budget in milliseconds for all retry attempts (optional) */
  timeBudgetMs?: number;
}

/**
 * Execute an async operation with automatic retry on transient failures
 *
 * Features:
 * - Exponential backoff with jitter
 * - Respects retry-after headers from 429 responses
 * - Configurable retry parameters
 * - Structured logging of retry events
 * - AbortSignal support for cancellation
 *
 * @param operation - Async function to execute
 * @param config - Optional partial retry configuration (merged with defaults)
 * @returns Promise resolving to the operation result
 * @throws Enhanced error with retry metadata if all attempts fail
 *
 * @example
 * ```typescript
 * const response = await withRetry(
 *   () => client.messages.create({ ... }),
 *   { maxRetries: 5, onRetry: (event) => console.log(event) }
 * );
 * ```
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options?: RetryOptions
): Promise<T> {
  // Extract time budget before merging configs
  const timeBudgetMs = options?.timeBudgetMs;
  const startTime = Date.now();

  // Merge provided config with environment-loaded defaults
  const baseConfig = getRetryConfig();
  const finalConfig: RetryConfig = {
    ...DEFAULT_RETRY_CONFIG,
    ...baseConfig,
    ...options,
  };

  return executeWithRetry(operation, finalConfig, 0, startTime, timeBudgetMs);
}

/**
 * Minimum time needed for a retry attempt (timeout buffer)
 */
const MIN_TIME_FOR_RETRY_MS = 15000; // 15 seconds minimum

/**
 * Internal recursive retry executor with time budget awareness
 */
async function executeWithRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig,
  attempt: number,
  startTime: number,
  timeBudgetMs?: number
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    // Calculate remaining time budget
    const elapsed = Date.now() - startTime;
    const remaining = timeBudgetMs ? timeBudgetMs - elapsed : Infinity;

    // Calculate delay for potential retry
    const retryAfterMs = config.respectRetryAfterHeader
      ? getRetryAfterMs(error)
      : undefined;

    const calculatedDelay = calculateDelay(
      attempt,
      config.initialDelayMs,
      config.maxDelayMs,
      config.backoffMultiplier,
      config.jitterFactor
    );

    // Use retry-after header if present, otherwise use calculated delay
    const delayMs = retryAfterMs ?? calculatedDelay;

    // Check if we have enough time for another retry attempt
    const hasTimeBudget = remaining > (delayMs + MIN_TIME_FOR_RETRY_MS);

    // Determine if we should retry
    const shouldRetry =
      attempt < config.maxRetries &&
      isTransientError(error, config.retryableStatusCodes) &&
      hasTimeBudget;

    // Build retry event for logging
    const event: RetryEvent = {
      attempt: attempt + 1,
      maxAttempts: config.maxRetries + 1,
      error: error instanceof Error ? error : new Error(String(error)),
      delayMs,
      willRetry: shouldRetry,
      errorCode: getErrorCode(error),
      retryAfterMs,
    };

    // Log the retry event
    logRetryEvent(event);

    // Call user-provided onRetry callback if present
    config.onRetry?.(event);

    // If we shouldn't retry, throw enhanced error
    if (!shouldRetry) {
      // Add time budget exhaustion info to error if applicable
      const reason = !hasTimeBudget && attempt < config.maxRetries
        ? "TIME_BUDGET_EXHAUSTED"
        : undefined;
      throw enhanceError(error, attempt, config.maxRetries, reason);
    }

    // Wait before retrying
    await delay(delayMs);

    // Recursive retry
    return executeWithRetry(operation, config, attempt + 1, startTime, timeBudgetMs);
  }
}

/**
 * Create a pre-configured retry wrapper with fixed settings
 *
 * Useful for creating module-specific retry wrappers with consistent configuration
 *
 * @param baseConfig - Base configuration to use for all operations
 * @returns A withRetry function with pre-applied configuration
 *
 * @example
 * ```typescript
 * const retryWithLogging = createRetryWrapper({
 *   onRetry: (event) => trackMetric('ai_retry', event),
 * });
 *
 * const response = await retryWithLogging(() => client.messages.create({ ... }));
 * ```
 */
export function createRetryWrapper(
  baseConfig: Partial<RetryConfig>
): <T>(operation: () => Promise<T>, config?: Partial<RetryConfig>) => Promise<T> {
  return <T>(
    operation: () => Promise<T>,
    config?: Partial<RetryConfig>
  ): Promise<T> => {
    return withRetry(operation, { ...baseConfig, ...config });
  };
}
