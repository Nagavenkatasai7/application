import { sql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";
import * as schema from "./schema";

// Create Drizzle instance with Vercel Postgres
// Uses POSTGRES_URL environment variable automatically
export const db = drizzle(sql, { schema });

// Export schema for use in queries
export * from "./schema";
