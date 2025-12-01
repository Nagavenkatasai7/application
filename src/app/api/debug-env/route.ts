/**
 * Debug endpoint to check environment variable availability
 * This should be removed after debugging
 */
import { NextResponse } from "next/server";

export async function GET() {
  // Get all env var keys that are set
  const allEnvKeys = Object.keys(process.env).filter(
    (key) => !key.startsWith("npm_") && !key.startsWith("PATH")
  );

  const envVars = {
    AUTH_SECRET: process.env.AUTH_SECRET
      ? `SET (length: ${process.env.AUTH_SECRET.length})`
      : "NOT SET",
    AUTH_RESEND_KEY: process.env.AUTH_RESEND_KEY
      ? `SET (starts: ${process.env.AUTH_RESEND_KEY.substring(0, 5)}...)`
      : "NOT SET",
    AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST || "NOT SET",
    EMAIL_FROM: process.env.EMAIL_FROM || "NOT SET",
    POSTGRES_URL: process.env.POSTGRES_URL ? "SET (encrypted)" : "NOT SET",
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY
      ? `SET (starts: ${process.env.ANTHROPIC_API_KEY.substring(0, 8)}...)`
      : "NOT SET",
    AI_PROVIDER: process.env.AI_PROVIDER || "NOT SET",
    APIFY_API_KEY: process.env.APIFY_API_KEY ? "SET" : "NOT SET",
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL || "NOT SET",
    VERCEL_ENV: process.env.VERCEL_ENV || "NOT SET",
  };

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    env: envVars,
    allEnvKeys: allEnvKeys.sort(),
  });
}
