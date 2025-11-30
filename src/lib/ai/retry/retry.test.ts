import { describe, it, expect } from "vitest";
import {
  isTransientError,
  getErrorCode,
  calculateDelay,
  DEFAULT_RETRY_CONFIG,
} from "./index";

describe("Retry Module", () => {
  describe("isTransientError - Error message patterns", () => {
    it("should return true for network errors with ECONNRESET in message", () => {
      const error = new Error("Connection failed: ECONNRESET");
      expect(isTransientError(error)).toBe(true);
    });

    it("should return true for timeout errors", () => {
      const error = new Error("Request timeout");
      expect(isTransientError(error)).toBe(true);
    });

    it("should return true for socket hang up errors", () => {
      const error = new Error("socket hang up");
      expect(isTransientError(error)).toBe(true);
    });

    it("should return true for network errors in message", () => {
      const error = new Error("network error occurred");
      expect(isTransientError(error)).toBe(true);
    });

    it("should return false for random errors without transient patterns", () => {
      const error = new Error("Invalid input data");
      expect(isTransientError(error)).toBe(false);
    });

    it("should return false for validation errors", () => {
      const error = new Error("Validation failed");
      expect(isTransientError(error)).toBe(false);
    });

    it("should return true for TimeoutError by name", () => {
      const error = new Error("Operation timed out");
      error.name = "TimeoutError";
      expect(isTransientError(error)).toBe(true);
    });

    it("should return true for AbortError by name", () => {
      const error = new Error("Request aborted");
      error.name = "AbortError";
      expect(isTransientError(error)).toBe(true);
    });

    it("should return true for TypeError with Failed to fetch", () => {
      const error = new TypeError("Failed to fetch");
      expect(isTransientError(error)).toBe(true);
    });
  });

  describe("isTransientError - Node.js error codes", () => {
    it("should return true for ECONNRESET code", () => {
      const error = new Error("Connection reset");
      (error as NodeJS.ErrnoException).code = "ECONNRESET";
      expect(isTransientError(error)).toBe(true);
    });

    it("should return true for ETIMEDOUT code", () => {
      const error = new Error("Connection timed out");
      (error as NodeJS.ErrnoException).code = "ETIMEDOUT";
      expect(isTransientError(error)).toBe(true);
    });

    it("should return true for ECONNREFUSED code", () => {
      const error = new Error("Connection refused");
      (error as NodeJS.ErrnoException).code = "ECONNREFUSED";
      expect(isTransientError(error)).toBe(true);
    });

    it("should return true for EPIPE code", () => {
      const error = new Error("Broken pipe");
      (error as NodeJS.ErrnoException).code = "EPIPE";
      expect(isTransientError(error)).toBe(true);
    });

    it("should return true for EHOSTUNREACH code", () => {
      const error = new Error("Host unreachable");
      (error as NodeJS.ErrnoException).code = "EHOSTUNREACH";
      expect(isTransientError(error)).toBe(true);
    });

    it("should return true for ENOTFOUND code", () => {
      const error = new Error("DNS lookup failed");
      (error as NodeJS.ErrnoException).code = "ENOTFOUND";
      expect(isTransientError(error)).toBe(true);
    });

    it("should return false for non-retryable error codes", () => {
      const error = new Error("Permission denied");
      (error as NodeJS.ErrnoException).code = "EACCES";
      expect(isTransientError(error)).toBe(false);
    });
  });

  describe("isTransientError - edge cases", () => {
    it("should handle null/undefined errors", () => {
      expect(isTransientError(null)).toBe(false);
      expect(isTransientError(undefined)).toBe(false);
    });

    it("should handle string errors", () => {
      expect(isTransientError("some error")).toBe(false);
    });

    it("should handle number errors", () => {
      expect(isTransientError(500)).toBe(false);
    });
  });

  describe("getErrorCode - generic errors", () => {
    it("should return TIMEOUT for TimeoutError", () => {
      const error = new Error("Timed out");
      error.name = "TimeoutError";
      expect(getErrorCode(error)).toBe("TIMEOUT");
    });

    it("should return ABORTED for AbortError", () => {
      const error = new Error("Aborted");
      error.name = "AbortError";
      expect(getErrorCode(error)).toBe("ABORTED");
    });

    it("should return NETWORK_ERROR for Failed to fetch", () => {
      const error = new Error("Failed to fetch");
      expect(getErrorCode(error)).toBe("NETWORK_ERROR");
    });

    it("should return uppercase node error code", () => {
      const error = new Error("Connection reset");
      (error as NodeJS.ErrnoException).code = "ECONNRESET";
      expect(getErrorCode(error)).toBe("ECONNRESET");
    });

    it("should return UNKNOWN_ERROR for generic errors", () => {
      const error = new Error("Something went wrong");
      expect(getErrorCode(error)).toBe("UNKNOWN_ERROR");
    });

    it("should return UNKNOWN_ERROR for null/undefined", () => {
      expect(getErrorCode(null)).toBe("UNKNOWN_ERROR");
      expect(getErrorCode(undefined)).toBe("UNKNOWN_ERROR");
    });

    it("should return UNKNOWN_ERROR for non-error objects", () => {
      expect(getErrorCode({ message: "error" })).toBe("UNKNOWN_ERROR");
    });
  });

  describe("calculateDelay", () => {
    it("should calculate exponential backoff with 0-indexed attempts", () => {
      // Attempt 0: 1000 * 2^0 = 1000
      const delay0 = calculateDelay(0, 1000, 30000, 2, 0);
      expect(delay0).toBe(1000);

      // Attempt 1: 1000 * 2^1 = 2000
      const delay1 = calculateDelay(1, 1000, 30000, 2, 0);
      expect(delay1).toBe(2000);

      // Attempt 2: 1000 * 2^2 = 4000
      const delay2 = calculateDelay(2, 1000, 30000, 2, 0);
      expect(delay2).toBe(4000);

      // Attempt 3: 1000 * 2^3 = 8000
      const delay3 = calculateDelay(3, 1000, 30000, 2, 0);
      expect(delay3).toBe(8000);
    });

    it("should respect max delay cap", () => {
      // 1000 * 2^10 = 1024000, but capped at 5000
      const delay = calculateDelay(10, 1000, 5000, 2, 0);
      expect(delay).toBe(5000);
    });

    it("should add jitter when configured", () => {
      // With 10% jitter on 2000ms base (attempt 1), result should be between 2000 and 2200
      const delay = calculateDelay(1, 1000, 30000, 2, 0.1);
      expect(delay).toBeGreaterThanOrEqual(2000);
      expect(delay).toBeLessThanOrEqual(2200);
    });

    it("should handle zero initial delay", () => {
      const delay = calculateDelay(1, 0, 30000, 2, 0);
      expect(delay).toBe(0);
    });

    it("should handle multiplier of 1 (constant delay)", () => {
      expect(calculateDelay(0, 1000, 30000, 1, 0)).toBe(1000);
      expect(calculateDelay(1, 1000, 30000, 1, 0)).toBe(1000);
      expect(calculateDelay(5, 1000, 30000, 1, 0)).toBe(1000);
    });

    it("should handle multiplier of 3", () => {
      expect(calculateDelay(0, 1000, 100000, 3, 0)).toBe(1000);
      expect(calculateDelay(1, 1000, 100000, 3, 0)).toBe(3000);
      expect(calculateDelay(2, 1000, 100000, 3, 0)).toBe(9000);
    });

    it("should handle different initial delays", () => {
      expect(calculateDelay(0, 500, 30000, 2, 0)).toBe(500);
      expect(calculateDelay(1, 500, 30000, 2, 0)).toBe(1000);
      expect(calculateDelay(2, 500, 30000, 2, 0)).toBe(2000);
    });
  });

  describe("DEFAULT_RETRY_CONFIG", () => {
    it("should have expected default values", () => {
      expect(DEFAULT_RETRY_CONFIG.maxRetries).toBe(3);
      expect(DEFAULT_RETRY_CONFIG.initialDelayMs).toBe(1000);
      expect(DEFAULT_RETRY_CONFIG.maxDelayMs).toBe(30000);
      expect(DEFAULT_RETRY_CONFIG.backoffMultiplier).toBe(2);
      expect(DEFAULT_RETRY_CONFIG.jitterFactor).toBe(0.1);
      expect(DEFAULT_RETRY_CONFIG.respectRetryAfterHeader).toBe(true);
    });

    it("should include 5xx and 429 in retryable status codes", () => {
      expect(DEFAULT_RETRY_CONFIG.retryableStatusCodes).toContain(429);
      expect(DEFAULT_RETRY_CONFIG.retryableStatusCodes).toContain(500);
      expect(DEFAULT_RETRY_CONFIG.retryableStatusCodes).toContain(502);
      expect(DEFAULT_RETRY_CONFIG.retryableStatusCodes).toContain(503);
      expect(DEFAULT_RETRY_CONFIG.retryableStatusCodes).toContain(529);
    });

    it("should not include client error codes in retryable", () => {
      expect(DEFAULT_RETRY_CONFIG.retryableStatusCodes).not.toContain(400);
      expect(DEFAULT_RETRY_CONFIG.retryableStatusCodes).not.toContain(401);
      expect(DEFAULT_RETRY_CONFIG.retryableStatusCodes).not.toContain(403);
      expect(DEFAULT_RETRY_CONFIG.retryableStatusCodes).not.toContain(404);
    });
  });
});
