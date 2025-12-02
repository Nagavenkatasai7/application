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

        // Verify password
        const isValidPassword = await verifyPassword(password, user.password);
        if (!isValidPassword) {
          return null;
        }

        // Check if email is verified (required for password users)
        if (!user.emailVerified) {
          // Throw a specific error to be handled by the client
          throw new Error("EMAIL_NOT_VERIFIED");
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
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    session: async ({ session, user }) => {
      // Include user.id in session for API routes
      if (session.user) {
        session.user.id = user.id;
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
