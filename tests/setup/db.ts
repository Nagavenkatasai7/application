// tests/setup/db.ts
// Test database factory for Drizzle ORM with in-memory SQLite
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from '@/lib/db/schema'

/**
 * Creates an in-memory SQLite database for testing
 * Each test gets a fresh database instance
 */
export function createTestDb() {
  const sqlite = new Database(':memory:')
  const db = drizzle(sqlite, { schema })

  // Create tables manually (since we don't have migrations in memory)
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      created_at INTEGER DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS resumes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'master',
      content TEXT,
      parsed_data TEXT,
      parent_id TEXT REFERENCES resumes(id) ON DELETE SET NULL,
      job_id TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      domain TEXT,
      industry TEXT,
      size TEXT,
      culture_notes TEXT,
      research_data TEXT,
      cached_at INTEGER DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      platform TEXT NOT NULL,
      external_id TEXT,
      title TEXT NOT NULL,
      company_id TEXT REFERENCES companies(id) ON DELETE SET NULL,
      company_name TEXT,
      location TEXT,
      description TEXT,
      requirements TEXT,
      skills TEXT,
      salary TEXT,
      posted_at INTEGER,
      cached_at INTEGER DEFAULT (unixepoch()),
      created_at INTEGER DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS soft_skills (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      survey_data TEXT NOT NULL,
      analysis TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      resume_id TEXT REFERENCES resumes(id) ON DELETE SET NULL,
      status TEXT NOT NULL DEFAULT 'saved',
      applied_at INTEGER,
      notes TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      html_template TEXT NOT NULL,
      css_styles TEXT,
      is_default INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (unixepoch())
    );

    CREATE INDEX IF NOT EXISTS idx_resumes_user ON resumes(user_id);
    CREATE INDEX IF NOT EXISTS idx_jobs_platform ON jobs(platform);
    CREATE INDEX IF NOT EXISTS idx_applications_user ON applications(user_id);
    CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
  `)

  return { db, sqlite }
}

/**
 * Seeds the test database with sample data
 */
export async function seedTestDb(db: ReturnType<typeof createTestDb>['db']) {
  const userId = 'test-user-1'

  // Insert test user
  await db.insert(schema.users).values({
    id: userId,
    email: 'test@example.com',
    name: 'Test User',
  })

  // Insert test company
  await db.insert(schema.companies).values({
    id: 'company-1',
    name: 'Acme Corp',
  })

  // Insert test job
  await db.insert(schema.jobs).values({
    id: 'job-1',
    platform: 'manual',
    title: 'Software Engineer',
    companyId: 'company-1',
    companyName: 'Acme Corp',
    location: 'San Francisco, CA',
    description: 'Build amazing software',
    requirements: JSON.stringify(['5+ years experience', 'TypeScript', 'React']),
    skills: JSON.stringify(['TypeScript', 'React', 'Node.js']),
  })

  // Insert test resume
  await db.insert(schema.resumes).values({
    id: 'resume-1',
    userId,
    name: 'Software Engineer Resume',
    isMaster: true,
    content: {
      name: 'Test User',
      email: 'test@example.com',
      experience: [],
    },
  })

  return { userId }
}
