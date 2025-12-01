/**
 * Next.js Middleware
 *
 * Applies rate limiting to API routes using Upstash Redis (production)
 * or in-memory storage (development).
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  checkRateLimit,
  getClientIdentifier,
  type RateLimitResult,
} from "@/lib/rate-limit";

// Routes that need stricter rate limiting
const UPLOAD_ROUTES = ["/api/resumes/upload"];
const AI_ROUTES = ["/api/resumes/parse", "/api/ai"];

function getRateLimitType(
  pathname: string
): "api" | "upload" | "ai" {
  if (UPLOAD_ROUTES.some((route) => pathname.startsWith(route))) {
    return "upload";
  }
  if (AI_ROUTES.some((route) => pathname.startsWith(route))) {
    return "ai";
  }
  return "api";
}

function createRateLimitResponse(result: RateLimitResult): NextResponse {
  const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);

  return NextResponse.json(
    {
      success: false,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests. Please try again later.",
        retryAfter,
      },
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": String(result.reset),
      },
    }
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only rate limit API routes
  if (!pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Skip rate limiting for health checks
  if (pathname === "/api/health") {
    return NextResponse.next();
  }

  try {
    const identifier = getClientIdentifier(request);
    const limitType = getRateLimitType(pathname);
    const result = await checkRateLimit(identifier, limitType);

    if (!result.success) {
      return createRateLimitResponse(result);
    }

    // Add rate limit headers to successful responses
    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Remaining", String(result.remaining));
    response.headers.set("X-RateLimit-Reset", String(result.reset));

    return response;
  } catch (error) {
    // Log error but don't block request if rate limiting fails
    console.error("Rate limit check failed:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    // Match all API routes except static files
    "/api/:path*",
  ],
};
