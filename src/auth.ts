/**
 * NextAuth.js Configuration
 *
 * Hybrid authentication: Magic Link (Resend) + Password (Credentials).
 * Uses Drizzle adapter for database sessions.
 */

import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  users,
  accounts,
  sessions,
  verificationTokens,
} from "@/lib/db/schema";
import { verifyPassword } from "@/lib/auth/password";
import { loginWithPasswordSchema } from "@/lib/validations/auth";

// Login brute force protection constants
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    // Magic link provider (passwordless email)
    Resend({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
    }),

    // Password-based authentication
    Credentials({
      id: "credentials",
      name: "Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validate input
        const parsed = loginWithPasswordSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        // Find user by email
        const user = await db.query.users.findFirst({
          where: eq(users.email, email.toLowerCase()),
        });

        // User not found or no password set (magic-link-only user)
        if (!user || !user.password) {
          return null;
        }

        // Check if user is locked out
        if (user.loginLockoutUntil && new Date() < user.loginLockoutUntil) {
          throw new Error("ACCOUNT_LOCKED");
        }

        // Verify password
        const isValidPassword = await verifyPassword(password, user.password);
        if (!isValidPassword) {
          // Increment failed login attempts
          const newAttempts = (user.failedLoginAttempts || 0) + 1;
          const shouldLockout = newAttempts >= MAX_LOGIN_ATTEMPTS;

          await db
            .update(users)
            .set({
              failedLoginAttempts: newAttempts,
              loginLockoutUntil: shouldLockout
                ? new Date(Date.now() + LOGIN_LOCKOUT_DURATION_MS)
                : null,
              updatedAt: new Date(),
            })
            .where(eq(users.id, user.id));

          if (shouldLockout) {
            throw new Error("ACCOUNT_LOCKED");
          }

          return null;
        }

        // Check if email is verified (required for password users)
        if (!user.emailVerified) {
          // Throw a specific error to be handled by the client
          throw new Error("EMAIL_NOT_VERIFIED");
        }

        // Successful login - reset failed attempt counters
        if ((user.failedLoginAttempts ?? 0) > 0 || user.loginLockoutUntil) {
          await db
            .update(users)
            .set({
              failedLoginAttempts: 0,
              loginLockoutUntil: null,
              updatedAt: new Date(),
            })
            .where(eq(users.id, user.id));
        }

        // Return user object for session
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/verify-request",
    error: "/auth-error",
  },
  session: {
    // Use JWT strategy - required for Credentials provider to work
    // Database strategy only works with OAuth providers
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      // Include user.id in JWT token on sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },
    session: async ({ session, token }) => {
      // Include user.id from JWT token in session for API routes
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string | null;
        session.user.image = token.picture as string | null;
      }
      return session;
    },
  },
});

// Type augmentation for session.user.id
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
    };
  }
}
