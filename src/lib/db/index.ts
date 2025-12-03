/**
 * Database Connection Module
 *
 * Supports two modes:
 * - PostgreSQL (default): Uses Vercel Postgres for cloud/production
 * - SQLite (USE_SQLITE=true): Uses local SQLite for offline development
 *
 * Usage:
 *   pnpm dev           # Uses PostgreSQL (requires POSTGRES_URL)
 *   pnpm dev:local     # Uses SQLite (no external dependencies)
 */

// Check if we should use SQLite for local development
const USE_SQLITE = process.env.USE_SQLITE === "true";

// Re-export schema types for use in application
// These work regardless of database type
export * from "./schema";

// Dynamic database creation based on environment
function createDatabase() {
  if (USE_SQLITE) {
    // SQLite for local development
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Database = require("better-sqlite3");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { drizzle } = require("drizzle-orm/better-sqlite3");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const schema = require("./schema-sqlite");

    const sqlite = new Database("./local.db");
    // Enable WAL mode for better concurrent access
    sqlite.pragma("journal_mode = WAL");

    console.log("[Database] Using SQLite (local.db)");
    return drizzle(sqlite, { schema });
  } else {
    // PostgreSQL for cloud/production
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { sql } = require("@vercel/postgres");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { drizzle } = require("drizzle-orm/vercel-postgres");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const schema = require("./schema");

    console.log("[Database] Using PostgreSQL (Vercel Postgres)");
    return drizzle(sql, { schema });
  }
}

// Create and export the database instance
// Using 'any' type since the actual type depends on runtime environment
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db: any = createDatabase();
