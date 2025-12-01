/**
 * NextAuth.js API Route Handler
 *
 * Handles all authentication routes:
 * - GET/POST /api/auth/signin
 * - GET/POST /api/auth/signout
 * - GET /api/auth/session
 * - POST /api/auth/callback/:provider
 * - GET /api/auth/providers
 * - GET /api/auth/csrf
 */

import { handlers } from "@/auth";

export const { GET, POST } = handlers;
