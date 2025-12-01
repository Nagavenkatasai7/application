import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  uniqueIndex,
  index,
  jsonb,
  primaryKey,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

// ============================================================================
// NextAuth.js Tables
// ============================================================================

// Experience level enum values for profile
export const experienceLevels = ["entry", "mid", "senior", "lead", "executive"] as const;
export type ExperienceLevel = (typeof experienceLevels)[number];

// Users table (modified for NextAuth.js compatibility)
export const users = pgTable("users", {
  id: text("id").primaryKey(), // UUID
  email: text("email").unique().notNull(),
  name: text("name"),
  emailVerified: timestamp("email_verified", { mode: "date" }), // NextAuth.js
  image: text("image"), // NextAuth.js (for OAuth avatars)
  termsAgreedAt: timestamp("terms_agreed_at", { mode: "date" }), // When user accepted terms
  createdAt: timestamp("created_at").notNull().defaultNow(),

  // Professional info
  jobTitle: text("job_title"),
  experienceLevel: text("experience_level").$type<ExperienceLevel>(), // entry, mid, senior, lead, executive
  skills: jsonb("skills").$type<string[]>().default([]),
  preferredIndustries: jsonb("preferred_industries").$type<string[]>().default([]),

  // Extended info
  city: text("city"),
  country: text("country"),
  bio: text("bio"),
  linkedinUrl: text("linkedin_url"),
  githubUrl: text("github_url"),

  // Profile picture (Vercel Blob URL)
  profilePictureUrl: text("profile_picture_url"),

  // Updated timestamp
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Accounts table (for OAuth providers - required by NextAuth.js)
export const accounts = pgTable(
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
  ]
);

// Sessions table (for database sessions - required by NextAuth.js)
export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

// Verification tokens table (REQUIRED for magic link authentication)
export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(), // email address
    token: text("token").notNull(), // hashed token
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
);

// ============================================================================
// Application Tables
// ============================================================================

// Resume templates table
export const templates = pgTable("templates", {
  id: text("id").primaryKey(), // UUID
  name: text("name").notNull(),
  htmlTemplate: text("html_template"), // Handlebars template
  cssStyles: text("css_styles"), // Template-specific CSS
  isAtsSafe: boolean("is_ats_safe").default(true),
});

// Resumes table
export const resumes = pgTable(
  "resumes",
  {
    id: text("id").primaryKey(), // UUID
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    content: jsonb("content").notNull(), // Structured resume data (JSON)
    templateId: text("template_id").references(() => templates.id),
    isMaster: boolean("is_master").default(false),
    // PDF upload fields
    originalFileName: text("original_file_name"), // Original uploaded PDF filename
    fileSize: integer("file_size"), // File size in bytes
    extractedText: text("extracted_text"), // Raw text extracted from PDF
    // Template preservation fields
    originalPdfUrl: text("original_pdf_url"), // Vercel Blob URL for original PDF
    templateAnalysis: jsonb("template_analysis"), // AI-extracted template styles (colors, fonts, layout)
    hasCustomTemplate: boolean("has_custom_template").default(false), // Flag for custom template uploads
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [index("resumes_user_idx").on(table.userId)]
);

// Companies table
export const companies = pgTable("companies", {
  id: text("id").primaryKey(), // UUID
  name: text("name").notNull().unique(),
  glassdoorData: jsonb("glassdoor_data"), // Ratings, reviews summary, pros/cons
  fundingData: jsonb("funding_data"), // Rounds, investors, valuation, stage
  cultureSignals: jsonb("culture_signals"), // AI-extracted values (1-5 scale per dimension)
  competitors: jsonb("competitors"), // JSON array
  cachedAt: timestamp("cached_at"), // 7-day TTL
  // Background processing fields
  status: text("status").default("completed"), // "pending" | "processing" | "completed" | "failed"
  errorMessage: text("error_message"), // Error message if processing failed
  processingStartedAt: timestamp("processing_started_at"), // When processing began
});

// Jobs table
export const jobs = pgTable(
  "jobs",
  {
    id: text("id").primaryKey(), // UUID
    platform: text("platform", {
      enum: [
        "linkedin",
        "indeed",
        "glassdoor",
        "greenhouse",
        "lever",
        "workday",
        "icims",
        "smartrecruiters",
        "manual",
      ],
    }).notNull(),
    externalId: text("external_id"), // Platform-specific ID
    title: text("title").notNull(),
    companyId: text("company_id").references(() => companies.id),
    companyName: text("company_name"), // Fallback if company not in DB
    location: text("location"),
    description: text("description"),
    requirements: jsonb("requirements"), // JSON array
    skills: jsonb("skills"), // Extracted via GLiNER - JSON array
    salary: jsonb("salary"), // { min, max, currency }
    postedAt: timestamp("posted_at"),
    cachedAt: timestamp("cached_at"), // 24-hour TTL
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("jobs_company_idx").on(table.companyId),
    index("jobs_platform_idx").on(table.platform),
  ]
);

// Soft skills assessment table
export const softSkills = pgTable(
  "soft_skills",
  {
    id: text("id").primaryKey(), // UUID
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    skillName: text("skill_name").notNull(),
    evidenceScore: integer("evidence_score"), // 1-5 scale
    conversation: jsonb("conversation"), // Full chat history - JSON array
    statement: text("statement"), // Generated resume statement
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("soft_skills_user_skill_idx").on(table.userId, table.skillName),
  ]
);

// User settings table
export const userSettings = pgTable(
  "user_settings",
  {
    id: text("id").primaryKey(), // UUID
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    settings: jsonb("settings").notNull(), // Full settings JSON
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("user_settings_user_idx").on(table.userId)]
);

// Applications tracking table
export const applications = pgTable(
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
    status: text("status", {
      enum: ["saved", "applied", "interviewing", "offered", "rejected"],
    })
      .notNull()
      .default("saved"),
    appliedAt: timestamp("applied_at"),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
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
