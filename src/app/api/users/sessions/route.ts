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

// GET /api/users/sessions - List all active sessions
export async function GET(request: Request) {
  try {
    const authUser = await requireAuth();

    // Get current session token from cookies
    const session = await auth();
    const currentSessionToken = session?.user?.id ? await getCurrentSessionToken(request) : null;

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
      .filter((s) => s.expires > now)
      .map((s) => ({
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
export async function DELETE(request: Request) {
  try {
    const authUser = await requireAuth();

    // Get current session token
    const currentSessionToken = await getCurrentSessionToken(request);

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
async function getCurrentSessionToken(request: Request): Promise<string | null> {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  // Parse cookies to find session token
  // NextAuth v5 uses 'authjs.session-token' or 'next-auth.session-token'
  const cookies = Object.fromEntries(
    cookieHeader.split("; ").map((c) => {
      const [key, ...val] = c.split("=");
      return [key, val.join("=")];
    })
  );

  return (
    cookies["authjs.session-token"] ||
    cookies["__Secure-authjs.session-token"] ||
    cookies["next-auth.session-token"] ||
    cookies["__Secure-next-auth.session-token"] ||
    null
  );
}

// Helper: Mask session token for display (show only last 8 chars)
function maskSessionToken(token: string): string {
  if (token.length <= 8) {
    return "***" + token;
  }
  return "***" + token.slice(-8);
}
