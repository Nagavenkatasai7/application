/**
 * Debug endpoint to check environment variable availability
 * This should be removed after debugging
 */
import { NextResponse } from "next/server";

export async function GET() {
  const envVars = {
    AUTH_SECRET: process.env.AUTH_SECRET ? `SET (length: ${process.env.AUTH_SECRET.length})` : "NOT SET",
    AUTH_RESEND_KEY: process.env.AUTH_RESEND_KEY ? `SET (starts: ${process.env.AUTH_RESEND_KEY.substring(0, 5)}...)` : "NOT SET",
    AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST || "NOT SET",
    EMAIL_FROM: process.env.EMAIL_FROM || "NOT SET",
    POSTGRES_URL: process.env.POSTGRES_URL ? "SET (encrypted)" : "NOT SET",
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL || "NOT SET",
    VERCEL_ENV: process.env.VERCEL_ENV || "NOT SET",
  };

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    env: envVars,
  });
}
