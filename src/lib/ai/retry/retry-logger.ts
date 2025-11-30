import type { RetryEvent } from "./retry-config";

/**
 * Log level for retry events
 */
type LogLevel = "debug" | "info" | "warn" | "error";

/**
 * Structured log data for retry events
 */
interface RetryLogData {
  component: string;
  attempt: number;
  maxAttempts: number;
  errorCode: string;
  delayMs: number;
  willRetry: boolean;
  retryAfterMs?: number;
  timestamp: string;
  errorMessage?: string;
}

/**
 * Get appropriate log level for retry event
 */
function getLogLevel(event: RetryEvent): LogLevel {
  if (!event.willRetry) {
    return "error"; // Final failure
  }
  if (event.attempt >= 2) {
    return "warn"; // Multiple retries
  }
  return "info"; // First retry
}

/**
 * Format retry event for logging
 */
function formatLogData(event: RetryEvent): RetryLogData {
  return {
    component: "ai-retry",
    attempt: event.attempt,
    maxAttempts: event.maxAttempts,
    errorCode: event.errorCode,
    delayMs: event.delayMs,
    willRetry: event.willRetry,
    retryAfterMs: event.retryAfterMs,
    timestamp: new Date().toISOString(),
    errorMessage: event.error.message,
  };
}

/**
 * Format a human-readable log message
 */
function formatLogMessage(event: RetryEvent): string {
  if (event.willRetry) {
    return `[AI Retry] Attempt ${event.attempt}/${event.maxAttempts} failed (${event.errorCode}), retrying in ${event.delayMs}ms`;
  }
  return `[AI Retry] All ${event.maxAttempts} attempts exhausted (${event.errorCode}): ${event.error.message}`;
}

/**
 * Log retry event with structured data
 *
 * In development: logs to console with full details
 * In production: can be extended to send to monitoring services
 */
export function logRetryEvent(event: RetryEvent): void {
  const logData = formatLogData(event);
  const message = formatLogMessage(event);
  const level = getLogLevel(event);

  // Development logging
  if (process.env.NODE_ENV === "development") {
    switch (level) {
      case "debug":
        console.debug(message, logData);
        break;
      case "info":
        console.info(message, logData);
        break;
      case "warn":
        console.warn(message, logData);
        break;
      case "error":
        console.error(message, logData);
        break;
    }
    return;
  }

  // Production logging - only log warnings and errors
  if (level === "warn" || level === "error") {
    // In production, use console.log for structured logging
    // This can be picked up by log aggregation services
    console.log(
      JSON.stringify({
        level,
        message,
        ...logData,
      })
    );
  }

  // Future: Add external monitoring service integration here
  // e.g., Sentry, DataDog, LogRocket, etc.
}

/**
 * Create a retry logger callback for use in RetryConfig.onRetry
 */
export function createRetryLogger(
  context?: Record<string, unknown>
): (event: RetryEvent) => void {
  return (event: RetryEvent) => {
    // Add any additional context to the log
    if (context) {
      const logData = formatLogData(event);
      const enrichedData = { ...logData, ...context };

      if (process.env.NODE_ENV === "development") {
        console.log(formatLogMessage(event), enrichedData);
      }
    } else {
      logRetryEvent(event);
    }
  };
}
