/**
 * User Sessions API Routes
 *
 * GET /api/users/sessions - List all active sessions for current user
 * DELETE /api/users/sessions - Sign out from all devices (except current)
 */

import { auth } from "@/auth";
import { db, sessions } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/api";
import { eq, and, ne } from "drizzle-orm";
import { cookies } from "next/headers";

// GET /api/users/sessions - List all active sessions
export async function GET(_request: Request) {
  try {
    const authUser = await requireAuth();

    // Get current session token from cookies
    const session = await auth();
    const currentSessionToken = session?.user?.id ? await getCurrentSessionToken() : null;

    // Get all sessions for this user
    const userSessions = await db
      .select({
        sessionToken: sessions.sessionToken,
        expires: sessions.expires,
      })
      .from(sessions)
      .where(eq(sessions.userId, authUser.id));

    // Filter out expired sessions and mark current session
    const now = new Date();
    const activeSessions = userSessions
      .filter((s: typeof userSessions[number]) => s.expires > now)
      .map((s: typeof userSessions[number]) => ({
        sessionToken: maskSessionToken(s.sessionToken),
        expires: s.expires,
        isCurrent: currentSessionToken ? s.sessionToken === currentSessionToken : false,
      }));

    return successResponse({
      sessions: activeSessions,
      total: activeSessions.length,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return unauthorizedResponse();
    }
    console.error("Error getting sessions:", error);
    return errorResponse("SESSION_ERROR", "Failed to get sessions", 500);
  }
}

// DELETE /api/users/sessions - Sign out from all devices except current
export async function DELETE(_request: Request) {
  try {
    const authUser = await requireAuth();

    // Get current session token
    const currentSessionToken = await getCurrentSessionToken();

    if (!currentSessionToken) {
      return errorResponse("SESSION_NOT_FOUND", "Current session not found", 400);
    }

    // Delete all sessions except current
    await db
      .delete(sessions)
      .where(
        and(
          eq(sessions.userId, authUser.id),
          ne(sessions.sessionToken, currentSessionToken)
        )
      );

    return successResponse({
      message: "Successfully signed out from all other devices",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return unauthorizedResponse();
    }
    console.error("Error signing out from all devices:", error);
    return errorResponse("SESSION_ERROR", "Failed to sign out from other devices", 500);
  }
}

// Helper: Get current session token from request cookies
async function getCurrentSessionToken(): Promise<string | null> {
  // Use Next.js cookies() API for proper cookie parsing
  const cookieStore = await cookies();

  // NextAuth v5 uses 'authjs.session-token' or '__Secure-authjs.session-token'
  // Try each possible cookie name in order of preference
  const sessionToken =
    cookieStore.get("authjs.session-token")?.value ||
    cookieStore.get("__Secure-authjs.session-token")?.value ||
    cookieStore.get("next-auth.session-token")?.value ||
    cookieStore.get("__Secure-next-auth.session-token")?.value ||
    null;

  return sessionToken;
}

// Helper: Mask session token for display (show only last 8 chars)
function maskSessionToken(token: string): string {
  if (token.length <= 8) {
    return "***" + token;
  }
  return "***" + token.slice(-8);
}
