/**
 * SQLite Schema for Local Development
 *
 * Mirrors the PostgreSQL schema but uses SQLite-compatible types.
 * JSON data is stored as TEXT and parsed/serialized automatically.
 */

import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
  index,
  primaryKey,
} from "drizzle-orm/sqlite-core";
import type { AdapterAccountType } from "next-auth/adapters";

// ============================================================================
// NextAuth.js Tables
// ============================================================================

// Experience level enum values for profile
export const experienceLevels = ["entry", "mid", "senior", "lead", "executive"] as const;
export type ExperienceLevel = (typeof experienceLevels)[number];

// Users table (modified for NextAuth.js compatibility)
export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(), // UUID
    email: text("email").unique().notNull(),
    name: text("name"),
    emailVerified: integer("email_verified", { mode: "timestamp" }), // NextAuth.js
    image: text("image"), // NextAuth.js (for OAuth avatars)
    termsAgreedAt: integer("terms_agreed_at", { mode: "timestamp" }), // When user accepted terms
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),

    // Professional info
    jobTitle: text("job_title"),
    experienceLevel: text("experience_level").$type<ExperienceLevel>(), // entry, mid, senior, lead, executive
    skills: text("skills", { mode: "json" }).$type<string[]>().default([]),
    preferredIndustries: text("preferred_industries", { mode: "json" }).$type<string[]>().default([]),

    // Extended info
    city: text("city"),
    country: text("country"),
    bio: text("bio"),
    linkedinUrl: text("linkedin_url"),
    githubUrl: text("github_url"),

    // Profile picture (Vercel Blob URL)
    profilePictureUrl: text("profile_picture_url"),

    // Updated timestamp
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),

    // Password authentication (nullable for magic-link-only users)
    password: text("password"), // bcrypt hashed password
    passwordChangedAt: integer("password_changed_at", { mode: "timestamp" }),

    // Email verification for password signups
    emailVerificationToken: text("email_verification_token"),
    emailVerificationExpires: integer("email_verification_expires", { mode: "timestamp" }),

    // Password reset
    passwordResetToken: text("password_reset_token"),
    passwordResetExpires: integer("password_reset_expires", { mode: "timestamp" }),
    passwordResetCode: text("password_reset_code"), // 6-digit security code

    // Brute force protection for password reset
    passwordResetAttempts: integer("password_reset_attempts").default(0),
    passwordResetLockoutUntil: integer("password_reset_lockout_until", { mode: "timestamp" }),

    // Brute force protection for login
    failedLoginAttempts: integer("failed_login_attempts").default(0),
    loginLockoutUntil: integer("login_lockout_until", { mode: "timestamp" }),
  },
  (table) => [
    // Index for email verification token lookups
    index("users_email_verification_token_idx").on(table.emailVerificationToken),
    // Index for password reset token lookups
    index("users_password_reset_token_idx").on(table.passwordResetToken),
  ]
);

// Accounts table (for OAuth providers - required by NextAuth.js)
export const accounts = sqliteTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
    // Index for looking up accounts by user
    index("accounts_user_idx").on(account.userId),
  ]
);

// Sessions table (for database sessions - required by NextAuth.js)
export const sessions = sqliteTable(
  "sessions",
  {
    sessionToken: text("session_token").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: integer("expires", { mode: "timestamp" }).notNull(),
  },
  (table) => [index("sessions_user_idx").on(table.userId)]
);

// Verification tokens table (REQUIRED for magic link authentication)
export const verificationTokens = sqliteTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(), // email address
    token: text("token").notNull(), // hashed token
    expires: integer("expires", { mode: "timestamp" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
);

// ============================================================================
// Application Tables
// ============================================================================

// Resume templates table
export const templates = sqliteTable("templates", {
  id: text("id").primaryKey(), // UUID
  name: text("name").notNull(),
  htmlTemplate: text("html_template"), // Handlebars template
  cssStyles: text("css_styles"), // Template-specific CSS
  isAtsSafe: integer("is_ats_safe", { mode: "boolean" }).default(true),
});

// Resumes table
export const resumes = sqliteTable(
  "resumes",
  {
    id: text("id").primaryKey(), // UUID
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    content: text("content", { mode: "json" }).notNull(), // Structured resume data (JSON)
    templateId: text("template_id").references(() => templates.id),
    isMaster: integer("is_master", { mode: "boolean" }).default(false),
    // PDF upload fields
    originalFileName: text("original_file_name"), // Original uploaded PDF filename
    fileSize: integer("file_size"), // File size in bytes
    extractedText: text("extracted_text"), // Raw text extracted from PDF
    // Template preservation fields
    originalPdfUrl: text("original_pdf_url"), // Vercel Blob URL for original PDF
    templateAnalysis: text("template_analysis", { mode: "json" }), // AI-extracted template styles
    hasCustomTemplate: integer("has_custom_template", { mode: "boolean" }).default(false),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  },
  (table) => [index("resumes_user_idx").on(table.userId)]
);

// Companies table
export const companies = sqliteTable("companies", {
  id: text("id").primaryKey(), // UUID
  name: text("name").notNull().unique(),
  glassdoorData: text("glassdoor_data", { mode: "json" }), // Ratings, reviews summary
  fundingData: text("funding_data", { mode: "json" }), // Rounds, investors
  cultureSignals: text("culture_signals", { mode: "json" }), // AI-extracted values
  competitors: text("competitors", { mode: "json" }), // JSON array
  cachedAt: integer("cached_at", { mode: "timestamp" }), // 7-day TTL
  // Background processing fields
  status: text("status").default("completed"), // "pending" | "processing" | "completed" | "failed"
  errorMessage: text("error_message"), // Error message if processing failed
  processingStartedAt: integer("processing_started_at", { mode: "timestamp" }),
});

// Jobs table
export const jobs = sqliteTable(
  "jobs",
  {
    id: text("id").primaryKey(), // UUID
    platform: text("platform").notNull(), // platform enum stored as text
    externalId: text("external_id"), // Platform-specific ID
    title: text("title").notNull(),
    companyId: text("company_id").references(() => companies.id),
    companyName: text("company_name"), // Fallback if company not in DB
    location: text("location"),
    description: text("description"),
    requirements: text("requirements", { mode: "json" }), // JSON array
    skills: text("skills", { mode: "json" }), // Extracted via GLiNER - JSON array
    salary: text("salary", { mode: "json" }), // { min, max, currency }
    postedAt: integer("posted_at", { mode: "timestamp" }),
    cachedAt: integer("cached_at", { mode: "timestamp" }), // 24-hour TTL
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  },
  (table) => [
    index("jobs_company_idx").on(table.companyId),
    index("jobs_platform_idx").on(table.platform),
  ]
);

// Soft skills assessment table
export const softSkills = sqliteTable(
  "soft_skills",
  {
    id: text("id").primaryKey(), // UUID
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    skillName: text("skill_name").notNull(),
    evidenceScore: integer("evidence_score"), // 1-5 scale
    conversation: text("conversation", { mode: "json" }), // Full chat history
    statement: text("statement"), // Generated resume statement
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  },
  (table) => [
    uniqueIndex("soft_skills_user_skill_idx").on(table.userId, table.skillName),
  ]
);

// User settings table
export const userSettings = sqliteTable(
  "user_settings",
  {
    id: text("id").primaryKey(), // UUID
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    settings: text("settings", { mode: "json" }).notNull(), // Full settings JSON
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  },
  (table) => [uniqueIndex("user_settings_user_idx").on(table.userId)]
);

// Applications tracking table
export const applications = sqliteTable(
  "applications",
  {
    id: text("id").primaryKey(), // UUID
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    jobId: text("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    resumeId: text("resume_id").references(() => resumes.id, {
      onDelete: "set null",
    }),
    status: text("status").notNull().default("saved"), // "saved" | "applied" | "interviewing" | "offered" | "rejected"
    appliedAt: integer("applied_at", { mode: "timestamp" }),
    notes: text("notes"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  },
  (table) => [
    uniqueIndex("applications_user_job_idx").on(table.userId, table.jobId),
    index("applications_status_idx").on(table.status),
  ]
);

// Type exports for use in application
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Resume = typeof resumes.$inferSelect;
export type NewResume = typeof resumes.$inferInsert;

export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;

export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;

export type SoftSkill = typeof softSkills.$inferSelect;
export type NewSoftSkill = typeof softSkills.$inferInsert;

export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;

export type Template = typeof templates.$inferSelect;
export type NewTemplate = typeof templates.$inferInsert;

export type UserSettingsRecord = typeof userSettings.$inferSelect;
export type NewUserSettingsRecord = typeof userSettings.$inferInsert;

// NextAuth.js types
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type VerificationToken = typeof verificationTokens.$inferSelect;
export type NewVerificationToken = typeof verificationTokens.$inferInsert;
