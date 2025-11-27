// Centralized error handling utilities and message mapping

/**
 * Error codes used throughout the application
 */
export const ERROR_CODES = {
  // Generic errors
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT_ERROR: "TIMEOUT_ERROR",

  // Validation errors
  INVALID_JSON: "INVALID_JSON",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_INPUT: "INVALID_INPUT",

  // Resource errors
  NOT_FOUND: "NOT_FOUND",
  RESUME_NOT_FOUND: "RESUME_NOT_FOUND",
  JOB_NOT_FOUND: "JOB_NOT_FOUND",
  APPLICATION_NOT_FOUND: "APPLICATION_NOT_FOUND",

  // File errors
  NO_FILE: "NO_FILE",
  INVALID_TYPE: "INVALID_TYPE",
  FILE_TOO_LARGE: "FILE_TOO_LARGE",

  // Auth errors
  AUTH_ERROR: "AUTH_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",

  // AI/API errors
  AI_NOT_CONFIGURED: "AI_NOT_CONFIGURED",
  RATE_LIMIT: "RATE_LIMIT",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  API_ERROR: "API_ERROR",
  PARSE_ERROR: "PARSE_ERROR",

  // Database errors
  CREATE_ERROR: "CREATE_ERROR",
  UPDATE_ERROR: "UPDATE_ERROR",
  DELETE_ERROR: "DELETE_ERROR",
  FETCH_ERROR: "FETCH_ERROR",

  // Resume-specific errors
  INVALID_RESUME: "INVALID_RESUME",
  GENERATION_ERROR: "GENERATION_ERROR",
  TAILOR_ERROR: "TAILOR_ERROR",

  // Job-specific errors
  INVALID_JOB: "INVALID_JOB",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/**
 * User-friendly error messages mapped to error codes
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  // Generic errors
  [ERROR_CODES.UNKNOWN_ERROR]: "Something went wrong. Please try again.",
  [ERROR_CODES.NETWORK_ERROR]: "Unable to connect. Please check your internet connection.",
  [ERROR_CODES.TIMEOUT_ERROR]: "The request took too long. Please try again.",

  // Validation errors
  [ERROR_CODES.INVALID_JSON]: "Invalid request format. Please try again.",
  [ERROR_CODES.VALIDATION_ERROR]: "Please check your input and try again.",
  [ERROR_CODES.INVALID_INPUT]: "The provided input is invalid.",

  // Resource errors
  [ERROR_CODES.NOT_FOUND]: "The requested resource was not found.",
  [ERROR_CODES.RESUME_NOT_FOUND]: "Resume not found. It may have been deleted.",
  [ERROR_CODES.JOB_NOT_FOUND]: "Job not found. It may have been deleted.",
  [ERROR_CODES.APPLICATION_NOT_FOUND]: "Application not found.",

  // File errors
  [ERROR_CODES.NO_FILE]: "Please select a file to upload.",
  [ERROR_CODES.INVALID_TYPE]: "Invalid file type. Please upload a PDF or Word document.",
  [ERROR_CODES.FILE_TOO_LARGE]: "File is too large. Maximum size is 5MB.",

  // Auth errors
  [ERROR_CODES.AUTH_ERROR]: "Authentication failed. Please try again.",
  [ERROR_CODES.UNAUTHORIZED]: "You don't have permission to perform this action.",

  // AI/API errors
  [ERROR_CODES.AI_NOT_CONFIGURED]: "AI features are not configured. Please add your API key in settings.",
  [ERROR_CODES.RATE_LIMIT]: "Too many requests. Please wait a moment and try again.",
  [ERROR_CODES.SERVICE_UNAVAILABLE]: "Service is temporarily unavailable. Please try again later.",
  [ERROR_CODES.API_ERROR]: "An error occurred with the external service.",
  [ERROR_CODES.PARSE_ERROR]: "Failed to process the response. Please try again.",

  // Database errors
  [ERROR_CODES.CREATE_ERROR]: "Failed to create. Please try again.",
  [ERROR_CODES.UPDATE_ERROR]: "Failed to save changes. Please try again.",
  [ERROR_CODES.DELETE_ERROR]: "Failed to delete. Please try again.",
  [ERROR_CODES.FETCH_ERROR]: "Failed to load data. Please refresh the page.",

  // Resume-specific errors
  [ERROR_CODES.INVALID_RESUME]: "Resume is missing required information.",
  [ERROR_CODES.GENERATION_ERROR]: "Failed to generate PDF. Please try again.",
  [ERROR_CODES.TAILOR_ERROR]: "Failed to tailor resume. Please try again.",

  // Job-specific errors
  [ERROR_CODES.INVALID_JOB]: "Job description is missing required information.",
};

/**
 * Get user-friendly error message from error code
 */
export function getErrorMessage(code: string | undefined | null): string {
  if (!code) return ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR];
  return ERROR_MESSAGES[code as ErrorCode] || ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR];
}

/**
 * Get HTTP status code from error code
 */
export function getStatusFromCode(code: ErrorCode): number {
  switch (code) {
    case ERROR_CODES.INVALID_JSON:
    case ERROR_CODES.VALIDATION_ERROR:
    case ERROR_CODES.INVALID_INPUT:
    case ERROR_CODES.NO_FILE:
    case ERROR_CODES.INVALID_TYPE:
    case ERROR_CODES.FILE_TOO_LARGE:
    case ERROR_CODES.INVALID_RESUME:
    case ERROR_CODES.INVALID_JOB:
      return 400;

    case ERROR_CODES.AUTH_ERROR:
    case ERROR_CODES.UNAUTHORIZED:
      return 401;

    case ERROR_CODES.NOT_FOUND:
    case ERROR_CODES.RESUME_NOT_FOUND:
    case ERROR_CODES.JOB_NOT_FOUND:
    case ERROR_CODES.APPLICATION_NOT_FOUND:
      return 404;

    case ERROR_CODES.RATE_LIMIT:
      return 429;

    case ERROR_CODES.AI_NOT_CONFIGURED:
    case ERROR_CODES.SERVICE_UNAVAILABLE:
      return 503;

    default:
      return 500;
  }
}

/**
 * Application error class with code support
 */
export class AppError extends Error {
  code: ErrorCode;
  cause?: Error;

  constructor(code: ErrorCode, message?: string, cause?: Error) {
    super(message || getErrorMessage(code));
    this.name = "AppError";
    this.code = code;
    this.cause = cause;
  }
}

/**
 * Parse error from API response
 */
export function parseApiError(response: {
  success: boolean;
  error?: { code?: string; message?: string }
}): { code: string; message: string } {
  if (response.success) {
    return { code: ERROR_CODES.UNKNOWN_ERROR, message: "Unexpected error" };
  }

  const code = response.error?.code || ERROR_CODES.UNKNOWN_ERROR;
  const message = response.error?.message || getErrorMessage(code);

  return { code, message };
}

/**
 * Create standardized API error response
 */
export function createErrorResponse(
  code: ErrorCode,
  message?: string
): { success: false; error: { code: ErrorCode; message: string } } {
  return {
    success: false,
    error: {
      code,
      message: message || getErrorMessage(code),
    },
  };
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message === "Failed to fetch") {
    return true;
  }
  // Check for AbortError (both DOMException and Error)
  if (error instanceof DOMException && error.name === "AbortError") {
    return true;
  }
  if (error instanceof Error && error.name === "AbortError") {
    return true;
  }
  return false;
}

/**
 * Get error info for logging
 */
export function getErrorInfo(error: unknown): {
  name: string;
  message: string;
  code?: string;
  stack?: string;
} {
  if (error instanceof AppError) {
    return {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack,
    };
  }

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    name: "Unknown",
    message: String(error),
  };
}

/**
 * Log error with context (can be extended for external logging services)
 */
export function logError(
  error: unknown,
  context?: Record<string, unknown>
): void {
  const errorInfo = getErrorInfo(error);

  // In development, log to console
  if (process.env.NODE_ENV === "development") {
    console.error("[Error]", {
      ...errorInfo,
      context,
      timestamp: new Date().toISOString(),
    });
  }

  // In production, this could send to an error tracking service
  // e.g., Sentry, LogRocket, etc.
}
