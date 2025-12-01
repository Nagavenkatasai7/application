/**
 * Structured Logger
 *
 * Provides consistent, structured logging across the application.
 * Outputs JSON in production for log aggregation services.
 * Outputs human-readable format in development.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Minimum log level (can be configured via environment)
const MIN_LOG_LEVEL: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) ||
  (process.env.NODE_ENV === "production" ? "info" : "debug");

const isProduction = process.env.NODE_ENV === "production";

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LOG_LEVEL];
}

function formatError(error: unknown): LogEntry["error"] | undefined {
  if (!error) return undefined;

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: isProduction ? undefined : error.stack,
    };
  }

  return {
    name: "UnknownError",
    message: String(error),
  };
}

function createLogEntry(
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: unknown
): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    context: context && Object.keys(context).length > 0 ? context : undefined,
    error: formatError(error),
  };
}

function formatForDevelopment(entry: LogEntry): string {
  const prefix = `[${entry.timestamp}] ${entry.level.toUpperCase()}:`;
  let output = `${prefix} ${entry.message}`;

  if (entry.context) {
    output += ` ${JSON.stringify(entry.context)}`;
  }

  if (entry.error) {
    output += `\n  Error: ${entry.error.name}: ${entry.error.message}`;
    if (entry.error.stack) {
      output += `\n  ${entry.error.stack}`;
    }
  }

  return output;
}

function log(
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: unknown
): void {
  if (!shouldLog(level)) return;

  const entry = createLogEntry(level, message, context, error);

  if (isProduction) {
    // JSON output for production log aggregation
    const consoleMethod = level === "error" ? "error" : level === "warn" ? "warn" : "log";
    console[consoleMethod](JSON.stringify(entry));
  } else {
    // Human-readable output for development
    const formatted = formatForDevelopment(entry);
    switch (level) {
      case "error":
        console.error(formatted);
        break;
      case "warn":
        console.warn(formatted);
        break;
      case "debug":
        console.debug(formatted);
        break;
      default:
        console.log(formatted);
    }
  }
}

/**
 * Logger instance with methods for each log level
 */
export const logger = {
  debug: (message: string, context?: LogContext) => log("debug", message, context),
  info: (message: string, context?: LogContext) => log("info", message, context),
  warn: (message: string, context?: LogContext, error?: unknown) =>
    log("warn", message, context, error),
  error: (message: string, context?: LogContext, error?: unknown) =>
    log("error", message, context, error),

  /**
   * Create a child logger with preset context
   */
  child: (baseContext: LogContext) => ({
    debug: (message: string, context?: LogContext) =>
      log("debug", message, { ...baseContext, ...context }),
    info: (message: string, context?: LogContext) =>
      log("info", message, { ...baseContext, ...context }),
    warn: (message: string, context?: LogContext, error?: unknown) =>
      log("warn", message, { ...baseContext, ...context }, error),
    error: (message: string, context?: LogContext, error?: unknown) =>
      log("error", message, { ...baseContext, ...context }, error),
  }),

  /**
   * Create a request-scoped logger with request metadata
   */
  forRequest: (request: Request) => {
    const url = new URL(request.url);
    const baseContext: LogContext = {
      method: request.method,
      path: url.pathname,
      userAgent: request.headers.get("user-agent") || undefined,
    };

    return logger.child(baseContext);
  },
};

export type Logger = typeof logger;
export type ChildLogger = ReturnType<typeof logger.child>;
