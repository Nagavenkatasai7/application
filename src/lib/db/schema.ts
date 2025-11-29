import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  uniqueIndex,
  index,
  jsonb,
} from "drizzle-orm/pg-core";

// Users table
export const users = pgTable("users", {
  id: text("id").primaryKey(), // UUID
  email: text("email").unique().notNull(),
  name: text("name"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

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
