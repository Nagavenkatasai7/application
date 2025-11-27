import { describe, it, expect, vi } from "vitest";
import {
  ERROR_CODES,
  ERROR_MESSAGES,
  getErrorMessage,
  getStatusFromCode,
  AppError,
  parseApiError,
  createErrorResponse,
  isNetworkError,
  getErrorInfo,
  logError,
} from "./errors";

describe("ERROR_CODES", () => {
  it("should have all expected error codes defined", () => {
    expect(ERROR_CODES.UNKNOWN_ERROR).toBe("UNKNOWN_ERROR");
    expect(ERROR_CODES.NETWORK_ERROR).toBe("NETWORK_ERROR");
    expect(ERROR_CODES.NOT_FOUND).toBe("NOT_FOUND");
    expect(ERROR_CODES.AI_NOT_CONFIGURED).toBe("AI_NOT_CONFIGURED");
    expect(ERROR_CODES.VALIDATION_ERROR).toBe("VALIDATION_ERROR");
  });
});

describe("ERROR_MESSAGES", () => {
  it("should have messages for all error codes", () => {
    Object.values(ERROR_CODES).forEach((code) => {
      expect(ERROR_MESSAGES[code]).toBeDefined();
      expect(typeof ERROR_MESSAGES[code]).toBe("string");
    });
  });
});

describe("getErrorMessage", () => {
  it("returns correct message for known error code", () => {
    expect(getErrorMessage("NOT_FOUND")).toBe(ERROR_MESSAGES.NOT_FOUND);
    expect(getErrorMessage("NETWORK_ERROR")).toBe(ERROR_MESSAGES.NETWORK_ERROR);
  });

  it("returns unknown error message for undefined code", () => {
    expect(getErrorMessage(undefined)).toBe(ERROR_MESSAGES.UNKNOWN_ERROR);
    expect(getErrorMessage(null)).toBe(ERROR_MESSAGES.UNKNOWN_ERROR);
  });

  it("returns unknown error message for invalid code", () => {
    expect(getErrorMessage("INVALID_CODE")).toBe(ERROR_MESSAGES.UNKNOWN_ERROR);
  });
});

describe("getStatusFromCode", () => {
  it("returns 400 for validation errors", () => {
    expect(getStatusFromCode(ERROR_CODES.INVALID_JSON)).toBe(400);
    expect(getStatusFromCode(ERROR_CODES.VALIDATION_ERROR)).toBe(400);
    expect(getStatusFromCode(ERROR_CODES.INVALID_INPUT)).toBe(400);
  });

  it("returns 401 for auth errors", () => {
    expect(getStatusFromCode(ERROR_CODES.AUTH_ERROR)).toBe(401);
    expect(getStatusFromCode(ERROR_CODES.UNAUTHORIZED)).toBe(401);
  });

  it("returns 404 for not found errors", () => {
    expect(getStatusFromCode(ERROR_CODES.NOT_FOUND)).toBe(404);
    expect(getStatusFromCode(ERROR_CODES.RESUME_NOT_FOUND)).toBe(404);
    expect(getStatusFromCode(ERROR_CODES.JOB_NOT_FOUND)).toBe(404);
  });

  it("returns 429 for rate limit", () => {
    expect(getStatusFromCode(ERROR_CODES.RATE_LIMIT)).toBe(429);
  });

  it("returns 503 for service unavailable", () => {
    expect(getStatusFromCode(ERROR_CODES.AI_NOT_CONFIGURED)).toBe(503);
    expect(getStatusFromCode(ERROR_CODES.SERVICE_UNAVAILABLE)).toBe(503);
  });

  it("returns 500 for unknown errors", () => {
    expect(getStatusFromCode(ERROR_CODES.UNKNOWN_ERROR)).toBe(500);
    expect(getStatusFromCode(ERROR_CODES.CREATE_ERROR)).toBe(500);
  });
});

describe("AppError", () => {
  it("creates error with code and default message", () => {
    const error = new AppError(ERROR_CODES.NOT_FOUND);

    expect(error.code).toBe(ERROR_CODES.NOT_FOUND);
    expect(error.message).toBe(ERROR_MESSAGES.NOT_FOUND);
    expect(error.name).toBe("AppError");
  });

  it("creates error with custom message", () => {
    const error = new AppError(ERROR_CODES.NOT_FOUND, "Custom not found message");

    expect(error.code).toBe(ERROR_CODES.NOT_FOUND);
    expect(error.message).toBe("Custom not found message");
  });

  it("creates error with cause", () => {
    const cause = new Error("Original error");
    const error = new AppError(ERROR_CODES.FETCH_ERROR, undefined, cause);

    expect(error.cause).toBe(cause);
  });
});

describe("parseApiError", () => {
  it("returns code and message from response", () => {
    const response = {
      success: false,
      error: {
        code: "NOT_FOUND",
        message: "Resource not found",
      },
    };

    const result = parseApiError(response);

    expect(result.code).toBe("NOT_FOUND");
    expect(result.message).toBe("Resource not found");
  });

  it("returns defaults for missing error data", () => {
    const response = {
      success: false,
    };

    const result = parseApiError(response);

    expect(result.code).toBe(ERROR_CODES.UNKNOWN_ERROR);
  });

  it("handles success response", () => {
    const response = { success: true };

    const result = parseApiError(response);

    expect(result.code).toBe(ERROR_CODES.UNKNOWN_ERROR);
  });
});

describe("createErrorResponse", () => {
  it("creates error response with code and default message", () => {
    const response = createErrorResponse(ERROR_CODES.NOT_FOUND);

    expect(response.success).toBe(false);
    expect(response.error.code).toBe(ERROR_CODES.NOT_FOUND);
    expect(response.error.message).toBe(ERROR_MESSAGES.NOT_FOUND);
  });

  it("creates error response with custom message", () => {
    const response = createErrorResponse(ERROR_CODES.NOT_FOUND, "Custom message");

    expect(response.error.message).toBe("Custom message");
  });
});

describe("isNetworkError", () => {
  it("returns true for fetch failed error", () => {
    const error = new TypeError("Failed to fetch");
    expect(isNetworkError(error)).toBe(true);
  });

  it("returns true for abort error", () => {
    const error = new DOMException("Aborted", "AbortError");
    expect(isNetworkError(error)).toBe(true);
  });

  it("returns false for other errors", () => {
    expect(isNetworkError(new Error("Some error"))).toBe(false);
    expect(isNetworkError("string error")).toBe(false);
    expect(isNetworkError(null)).toBe(false);
  });
});

describe("getErrorInfo", () => {
  it("extracts info from AppError", () => {
    const error = new AppError(ERROR_CODES.NOT_FOUND, "Custom message");
    const info = getErrorInfo(error);

    expect(info.name).toBe("AppError");
    expect(info.message).toBe("Custom message");
    expect(info.code).toBe(ERROR_CODES.NOT_FOUND);
    expect(info.stack).toBeDefined();
  });

  it("extracts info from regular Error", () => {
    const error = new Error("Regular error");
    const info = getErrorInfo(error);

    expect(info.name).toBe("Error");
    expect(info.message).toBe("Regular error");
    expect(info.code).toBeUndefined();
  });

  it("handles non-Error values", () => {
    expect(getErrorInfo("string error").message).toBe("string error");
    expect(getErrorInfo(123).message).toBe("123");
    expect(getErrorInfo(null).message).toBe("null");
  });
});

describe("logError", () => {
  it("logs error in development", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // Force development mode
    vi.stubEnv("NODE_ENV", "development");

    const error = new Error("Test error");
    logError(error, { page: "test" });

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
    vi.unstubAllEnvs();
  });
});
