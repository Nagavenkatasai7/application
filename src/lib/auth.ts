/**
 * Authentication Helpers
 *
 * Provides helper functions for getting the authenticated user from NextAuth sessions.
 */

import { auth } from "@/auth";
import { db, users, type User } from "@/lib/db";
import { eq } from "drizzle-orm";

// ============================================================================
// Types
// ============================================================================

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
};

// ============================================================================
// Session Helpers
// ============================================================================

/**
 * Get the authenticated user from the session.
 * Returns null if not authenticated.
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email!,
    name: session.user.name ?? null,
  };
}

/**
 * Require authentication - throws if not authenticated.
 * Use this in API routes that require authentication.
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUser();

  if (!user) {
    throw new Error("Authentication required");
  }

  return user;
}

// ============================================================================
// User Database Helpers
// ============================================================================

/**
 * Get user by ID from the database.
 */
export async function getUserById(id: string): Promise<User | null> {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user || null;
}

/**
 * Get user by email from the database.
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()));
  return user || null;
}

/**
 * Update user profile (basic fields).
 */
export async function updateUser(
  id: string,
  data: Partial<Pick<User, "name" | "email">>
): Promise<User | null> {
  await db.update(users).set(data).where(eq(users.id, id));
  return getUserById(id);
}

/**
 * Update user profile (all profile fields).
 */
export async function updateUserProfile(
  id: string,
  data: Partial<Omit<User, "id" | "email" | "emailVerified" | "createdAt">>
): Promise<User | null> {
  await db
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, id));
  return getUserById(id);
}

// ============================================================================
// Legacy Compatibility (Deprecated)
// ============================================================================

/**
 * @deprecated Use getAuthUser() or requireAuth() instead.
 * This function is kept temporarily for backwards compatibility during migration.
 */
export async function getOrCreateLocalUser(): Promise<User> {
  // Try to get user from session first
  const authUser = await getAuthUser();
  if (authUser) {
    const dbUser = await getUserById(authUser.id);
    if (dbUser) {
      return dbUser;
    }
  }

  // In production, this should not be called without a session
  throw new Error("Authentication required. Please log in.");
}
