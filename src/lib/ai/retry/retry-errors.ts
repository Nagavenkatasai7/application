import Anthropic from "@anthropic-ai/sdk";
import { DEFAULT_RETRY_CONFIG } from "./retry-config";

/**
 * Error types from Anthropic API that should trigger retry
 */
const RETRYABLE_ERROR_TYPES = new Set([
  "overloaded_error",
  "rate_limit_error",
  "internal_error",
  "api_error",
]);

/**
 * Determines if an error is transient and should be retried
 */
export function isTransientError(
  error: unknown,
  retryableStatusCodes: number[] = DEFAULT_RETRY_CONFIG.retryableStatusCodes
): boolean {
  // Anthropic API errors
  if (error instanceof Anthropic.APIError) {
    // Check status code
    if (retryableStatusCodes.includes(error.status)) {
      return true;
    }

    // Check error type from response body
    const errorBody = error as { error?: { type?: string } };
    const errorType = errorBody.error?.type;
    if (errorType && RETRYABLE_ERROR_TYPES.has(errorType)) {
      return true;
    }

    return false;
  }

  // Network errors (browser/Node.js fetch)
  if (error instanceof TypeError && error.message === "Failed to fetch") {
    return true;
  }

  // Generic Error handling
  if (error instanceof Error) {
    // Timeout errors
    if (error.name === "TimeoutError" || error.name === "AbortError") {
      return true;
    }

    // Node.js network errors
    const nodeError = error as { code?: string };
    if (nodeError.code) {
      const retryableNodeCodes = [
        "ECONNRESET",
        "ETIMEDOUT",
        "ENOTFOUND",
        "ECONNREFUSED",
        "EPIPE",
        "EHOSTUNREACH",
      ];
      if (retryableNodeCodes.includes(nodeError.code)) {
        return true;
      }
    }

    // Check message for common transient patterns
    const message = error.message.toLowerCase();
    if (
      message.includes("timeout") ||
      message.includes("econnreset") ||
      message.includes("socket hang up") ||
      message.includes("network")
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Extract retry-after delay from Anthropic 429 response headers
 * @returns delay in milliseconds, or undefined if not present
 */
export function getRetryAfterMs(error: unknown): number | undefined {
  if (!(error instanceof Anthropic.APIError)) {
    return undefined;
  }

  // Only extract retry-after from 429 responses
  if (error.status !== 429) {
    return undefined;
  }

  // Try to access headers from the error
  const errorWithHeaders = error as {
    headers?: {
      get?: (key: string) => string | null;
      "retry-after"?: string;
    };
  };

  const headers = errorWithHeaders.headers;
  if (!headers) {
    return undefined;
  }

  // Try Map-style get() method first
  let retryAfter: string | null | undefined;
  if (typeof headers.get === "function") {
    retryAfter = headers.get("retry-after");
  }

  // Fall back to direct property access
  if (!retryAfter) {
    retryAfter = headers["retry-after"];
  }

  if (!retryAfter) {
    return undefined;
  }

  // Retry-after can be in seconds (number) or HTTP-date format
  const seconds = parseInt(retryAfter, 10);
  if (!isNaN(seconds)) {
    return seconds * 1000; // Convert to milliseconds
  }

  // Try parsing as HTTP-date (e.g., "Wed, 21 Oct 2015 07:28:00 GMT")
  const date = new Date(retryAfter);
  if (!isNaN(date.getTime())) {
    return Math.max(0, date.getTime() - Date.now());
  }

  return undefined;
}

/**
 * Extract error code for logging/metrics
 */
export function getErrorCode(error: unknown): string {
  if (error instanceof Anthropic.APIError) {
    switch (error.status) {
      case 429:
        return "RATE_LIMIT";
      case 503:
      case 529:
        return "SERVICE_OVERLOADED";
      case 500:
      case 502:
        return "SERVER_ERROR";
      case 401:
        return "AUTH_ERROR";
      case 400:
        return "BAD_REQUEST";
      default:
        return "API_ERROR";
    }
  }

  if (error instanceof Error) {
    if (error.name === "TimeoutError") {
      return "TIMEOUT";
    }
    if (error.name === "AbortError") {
      return "ABORTED";
    }
    if (error.message === "Failed to fetch") {
      return "NETWORK_ERROR";
    }

    // Node.js error codes
    const nodeError = error as { code?: string };
    if (nodeError.code) {
      return nodeError.code.toUpperCase();
    }
  }

  return "UNKNOWN_ERROR";
}

/**
 * Create an enhanced error with retry metadata
 */
export function enhanceError(
  originalError: unknown,
  attempts: number,
  maxRetries: number
): Error {
  const message =
    originalError instanceof Error
      ? originalError.message
      : String(originalError);

  const enhanced = new Error(
    `AI request failed after ${attempts + 1} attempt(s): ${message}`
  );

  // Preserve stack trace and chain original error
  if (originalError instanceof Error) {
    enhanced.cause = originalError;
    enhanced.stack = originalError.stack;
  }

  // Add retry metadata as non-enumerable property
  Object.defineProperty(enhanced, "retryMetadata", {
    value: {
      attempts: attempts + 1,
      maxRetries: maxRetries + 1,
      exhaustedRetries: attempts >= maxRetries,
      errorCode: getErrorCode(originalError),
    },
    enumerable: false,
    writable: false,
  });

  return enhanced;
}

/**
 * Type guard to check if error has retry metadata
 */
export function hasRetryMetadata(
  error: unknown
): error is Error & {
  retryMetadata: {
    attempts: number;
    maxRetries: number;
    exhaustedRetries: boolean;
    errorCode: string;
  };
} {
  return (
    error instanceof Error &&
    "retryMetadata" in error &&
    typeof (error as { retryMetadata?: unknown }).retryMetadata === "object"
  );
}
