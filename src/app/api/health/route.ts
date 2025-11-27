import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: {
      status: "up" | "down";
      latency?: number;
      error?: string;
    };
    ai: {
      status: "configured" | "not_configured";
      provider?: string;
    };
  };
}

const startTime = Date.now();

/**
 * GET /api/health
 * Health check endpoint for monitoring and load balancers
 *
 * Returns:
 * - 200: System is healthy
 * - 503: System is unhealthy (database down)
 */
export async function GET(): Promise<NextResponse<HealthStatus>> {
  const timestamp = new Date().toISOString();
  const uptime = Math.floor((Date.now() - startTime) / 1000);

  // Check database connectivity
  let dbStatus: HealthStatus["checks"]["database"] = { status: "down" };
  try {
    const dbStart = Date.now();
    // Simple query to verify database connection
    await db.select({ count: sql<number>`count(*)` }).from(users).limit(1);
    dbStatus = {
      status: "up",
      latency: Date.now() - dbStart,
    };
  } catch (error) {
    dbStatus = {
      status: "down",
      error: error instanceof Error ? error.message : "Unknown database error",
    };
  }

  // Check AI configuration
  const aiProvider = process.env.AI_PROVIDER || "anthropic";
  const hasApiKey =
    (aiProvider === "anthropic" && !!process.env.ANTHROPIC_API_KEY) ||
    (aiProvider === "openai" && !!process.env.OPENAI_API_KEY);

  const aiStatus: HealthStatus["checks"]["ai"] = hasApiKey
    ? { status: "configured", provider: aiProvider }
    : { status: "not_configured" };

  // Determine overall status
  const isHealthy = dbStatus.status === "up";
  const isDegraded = !hasApiKey && dbStatus.status === "up";

  const health: HealthStatus = {
    status: isHealthy ? (isDegraded ? "degraded" : "healthy") : "unhealthy",
    timestamp,
    version: process.env.npm_package_version || "0.1.0",
    uptime,
    checks: {
      database: dbStatus,
      ai: aiStatus,
    },
  };

  return NextResponse.json(health, {
    status: isHealthy ? 200 : 503,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
