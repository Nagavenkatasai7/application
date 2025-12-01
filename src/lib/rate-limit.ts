/**
 * Rate Limiting Configuration
 *
 * Uses Upstash Redis for production rate limiting.
 * Falls back to in-memory storage for development.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Check if Upstash Redis is configured
function isUpstashConfigured(): boolean {
  return !!(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

// In-memory storage for development (per-instance, resets on restart)
const inMemoryStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Simple in-memory rate limiter for development
 */
function createInMemoryLimiter(limit: number, windowMs: number) {
  return {
    limit: async (identifier: string) => {
      const now = Date.now();
      const record = inMemoryStore.get(identifier);

      if (!record || now >= record.resetTime) {
        inMemoryStore.set(identifier, {
          count: 1,
          resetTime: now + windowMs,
        });
        return {
          success: true,
          remaining: limit - 1,
          reset: now + windowMs,
        };
      }

      if (record.count >= limit) {
        return {
          success: false,
          remaining: 0,
          reset: record.resetTime,
        };
      }

      record.count++;
      return {
        success: true,
        remaining: limit - record.count,
        reset: record.resetTime,
      };
    },
  };
}

// Rate limit configurations
const RATE_LIMITS = {
  // API: 100 requests per minute per IP
  api: { limit: 100, window: "1m" as const, windowMs: 60 * 1000 },
  // Upload: 10 requests per minute (expensive operation)
  upload: { limit: 10, window: "1m" as const, windowMs: 60 * 1000 },
  // AI: 20 requests per minute (expensive)
  ai: { limit: 20, window: "1m" as const, windowMs: 60 * 1000 },
};

type RateLimitType = keyof typeof RATE_LIMITS;

// Create rate limiters based on environment
const rateLimiters: Record<RateLimitType, ReturnType<typeof createInMemoryLimiter> | Ratelimit> = {} as Record<RateLimitType, ReturnType<typeof createInMemoryLimiter> | Ratelimit>;

if (isUpstashConfigured()) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  rateLimiters.api = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(
      RATE_LIMITS.api.limit,
      RATE_LIMITS.api.window
    ),
    analytics: true,
    prefix: "ratelimit:api",
  });

  rateLimiters.upload = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(
      RATE_LIMITS.upload.limit,
      RATE_LIMITS.upload.window
    ),
    analytics: true,
    prefix: "ratelimit:upload",
  });

  rateLimiters.ai = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(
      RATE_LIMITS.ai.limit,
      RATE_LIMITS.ai.window
    ),
    analytics: true,
    prefix: "ratelimit:ai",
  });
} else {
  // Development fallback
  rateLimiters.api = createInMemoryLimiter(
    RATE_LIMITS.api.limit,
    RATE_LIMITS.api.windowMs
  );
  rateLimiters.upload = createInMemoryLimiter(
    RATE_LIMITS.upload.limit,
    RATE_LIMITS.upload.windowMs
  );
  rateLimiters.ai = createInMemoryLimiter(
    RATE_LIMITS.ai.limit,
    RATE_LIMITS.ai.windowMs
  );
}

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  reset: number;
};

/**
 * Check rate limit for a given identifier and type
 */
export async function checkRateLimit(
  identifier: string,
  type: RateLimitType = "api"
): Promise<RateLimitResult> {
  const limiter = rateLimiters[type];
  const result = await limiter.limit(identifier);

  return {
    success: result.success,
    remaining: result.remaining,
    reset: result.reset,
  };
}

/**
 * Get client identifier from request (IP-based)
 */
export function getClientIdentifier(request: Request): string {
  // Try various headers for the real IP
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");

  // Use the first IP from x-forwarded-for, or fall back to others
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    realIp ||
    cfConnectingIp ||
    "anonymous";

  return ip;
}

export { RATE_LIMITS };
