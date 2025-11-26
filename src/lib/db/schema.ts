import { sqliteTable, text, integer, uniqueIndex, index } from "drizzle-orm/sqlite-core";

// Users table
export const users = sqliteTable("users", {
  id: text("id").primaryKey(), // UUID
  email: text("email").unique().notNull(),
  name: text("name"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

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
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [uniqueIndex("resumes_user_idx").on(table.userId)]
);

// Companies table
export const companies = sqliteTable("companies", {
  id: text("id").primaryKey(), // UUID
  name: text("name").notNull().unique(),
  glassdoorData: text("glassdoor_data", { mode: "json" }), // Ratings, reviews summary, pros/cons
  fundingData: text("funding_data", { mode: "json" }), // Rounds, investors, valuation, stage
  cultureSignals: text("culture_signals", { mode: "json" }), // AI-extracted values (1-5 scale per dimension)
  competitors: text("competitors", { mode: "json" }), // JSON array
  cachedAt: integer("cached_at", { mode: "timestamp" }), // 7-day TTL
});

// Jobs table
export const jobs = sqliteTable(
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
    requirements: text("requirements", { mode: "json" }), // JSON array
    skills: text("skills", { mode: "json" }), // Extracted via GLiNER - JSON array
    salary: text("salary", { mode: "json" }), // { min, max, currency }
    postedAt: integer("posted_at", { mode: "timestamp" }),
    cachedAt: integer("cached_at", { mode: "timestamp" }), // 24-hour TTL
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
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
    conversation: text("conversation", { mode: "json" }), // Full chat history - JSON array
    statement: text("statement"), // Generated resume statement
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    uniqueIndex("soft_skills_user_skill_idx").on(table.userId, table.skillName),
  ]
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
    status: text("status", {
      enum: ["saved", "applied", "interviewing", "offered", "rejected"],
    })
      .notNull()
      .default("saved"),
    appliedAt: integer("applied_at", { mode: "timestamp" }),
    notes: text("notes"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
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
