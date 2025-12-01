/**
 * Next.js Middleware
 *
 * Handles:
 * 1. Authentication - Protects dashboard routes, redirects to login
 * 2. Rate limiting - Applies rate limits to API routes
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import {
  checkRateLimit,
  getClientIdentifier,
  type RateLimitResult,
} from "@/lib/rate-limit";

// ============================================================================
// Route Configuration
// ============================================================================

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/",              // Landing page
  "/login",         // Login page
  "/verify-request", // "Check your email" page
  "/auth-error",    // Auth error page
];

// Routes that should redirect authenticated users to dashboard
const AUTH_REDIRECT_ROUTES = ["/", "/login"];

// Auth API routes (handled by NextAuth)
const AUTH_API_ROUTES = ["/api/auth"];

// Routes that need stricter rate limiting
const UPLOAD_ROUTES = ["/api/resumes/upload"];
const AI_ROUTES = ["/api/resumes/parse", "/api/ai", "/api/modules"];

// ============================================================================
// Helper Functions
// ============================================================================

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

function shouldRedirectAuthenticatedUser(pathname: string): boolean {
  return AUTH_REDIRECT_ROUTES.includes(pathname);
}

function isAuthApiRoute(pathname: string): boolean {
  return AUTH_API_ROUTES.some((route) => pathname.startsWith(route));
}

function isApiRoute(pathname: string): boolean {
  return pathname.startsWith("/api");
}

function isStaticAsset(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp)$/) !== null
  );
}

function getRateLimitType(pathname: string): "api" | "upload" | "ai" {
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

function createUnauthorizedResponse(): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required",
      },
    },
    { status: 401 }
  );
}

// ============================================================================
// Middleware
// ============================================================================

export default auth(async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Skip static assets
  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  // Get session from NextAuth (added by auth() wrapper)
  const session = request.auth;

  // Redirect authenticated users from landing/login to dashboard
  if (session?.user && shouldRedirectAuthenticatedUser(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Allow public routes without authentication
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Allow NextAuth routes
  if (isAuthApiRoute(pathname)) {
    return NextResponse.next();
  }

  // Skip rate limiting for health checks
  if (pathname === "/api/health") {
    return NextResponse.next();
  }

  // Check authentication for protected routes
  if (!session?.user) {
    // Redirect to login for page routes
    if (!isApiRoute(pathname)) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Return 401 for API routes
    return createUnauthorizedResponse();
  }

  // Apply rate limiting to API routes (for authenticated users)
  if (isApiRoute(pathname)) {
    try {
      const identifier = getClientIdentifier(request as NextRequest);
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

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
