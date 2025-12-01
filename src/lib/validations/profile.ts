import { z } from "zod";
import { experienceLevels } from "@/lib/db/schema";

// Experience level enum schema (matches database)
export const experienceLevelSchema = z.enum(experienceLevels);
export type ExperienceLevel = z.infer<typeof experienceLevelSchema>;

// URL validation helpers
const urlSchema = z
  .string()
  .url("Please enter a valid URL")
  .max(500)
  .optional()
  .nullable()
  .or(z.literal(""));

const linkedinUrlSchema = z
  .string()
  .url("Please enter a valid LinkedIn URL")
  .refine(
    (url) => !url || url.includes("linkedin.com"),
    "URL must be a LinkedIn profile"
  )
  .optional()
  .nullable()
  .or(z.literal(""));

const githubUrlSchema = z
  .string()
  .url("Please enter a valid GitHub URL")
  .refine(
    (url) => !url || url.includes("github.com"),
    "URL must be a GitHub profile"
  )
  .optional()
  .nullable()
  .or(z.literal(""));

// Personal info schema
export const personalInfoSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).optional().nullable(),
  email: z.string().email("Please enter a valid email").max(255),
  profilePictureUrl: urlSchema,
});
export type PersonalInfo = z.infer<typeof personalInfoSchema>;

// Location info schema
export const locationInfoSchema = z.object({
  city: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
});
export type LocationInfo = z.infer<typeof locationInfoSchema>;

// Bio and social links schema
export const extendedInfoSchema = z.object({
  bio: z.string().max(500, "Bio must be 500 characters or less").optional().nullable(),
  linkedinUrl: linkedinUrlSchema,
  githubUrl: githubUrlSchema,
});
export type ExtendedInfo = z.infer<typeof extendedInfoSchema>;

// Professional info schema
export const professionalInfoSchema = z.object({
  jobTitle: z.string().max(100).optional().nullable(),
  experienceLevel: experienceLevelSchema.optional().nullable(),
  skills: z
    .array(z.string().max(50, "Skill name too long"))
    .max(20, "Maximum 20 skills allowed")
    .default([]),
  preferredIndustries: z
    .array(z.string().max(50, "Industry name too long"))
    .max(10, "Maximum 10 industries allowed")
    .default([]),
});
export type ProfessionalInfo = z.infer<typeof professionalInfoSchema>;

// Complete profile schema
export const profileSchema = z.object({
  // Personal info
  name: z.string().min(1).max(100).optional().nullable(),
  email: z.string().email().max(255),
  profilePictureUrl: urlSchema,
  // Location
  city: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  // Extended info
  bio: z.string().max(500).optional().nullable(),
  linkedinUrl: linkedinUrlSchema,
  githubUrl: githubUrlSchema,
  // Professional info
  jobTitle: z.string().max(100).optional().nullable(),
  experienceLevel: experienceLevelSchema.optional().nullable(),
  skills: z.array(z.string().max(50)).max(20).default([]),
  preferredIndustries: z.array(z.string().max(50)).max(10).default([]),
});
export type Profile = z.infer<typeof profileSchema>;

// Profile update schema (partial - for PATCH requests)
export const profileUpdateSchema = profileSchema.partial().omit({ email: true });
export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;

// Profile picture upload schema
export const profilePictureUploadSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => file.size <= 5 * 1024 * 1024,
    "File size must be less than 5MB"
  ).refine(
    (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
    "File must be JPEG, PNG, or WebP"
  ),
});
export type ProfilePictureUpload = z.infer<typeof profilePictureUploadSchema>;

// Account deletion confirmation schema
export const deleteAccountSchema = z.object({
  confirmation: z
    .string()
    .refine((val) => val === "DELETE MY ACCOUNT", {
      message: 'Please type "DELETE MY ACCOUNT" to confirm',
    }),
});
export type DeleteAccountConfirmation = z.infer<typeof deleteAccountSchema>;

// Data export options schema
export const dataExportSchema = z.object({
  format: z.enum(["json"]).default("json"),
  includeResumes: z.boolean().default(true),
  includeJobs: z.boolean().default(true),
  includeApplications: z.boolean().default(true),
  includeSettings: z.boolean().default(true),
});
export type DataExportOptions = z.infer<typeof dataExportSchema>;

// Session info schema (for listing sessions)
export const sessionInfoSchema = z.object({
  sessionToken: z.string(),
  expires: z.date(),
  isCurrent: z.boolean(),
  createdAt: z.date().optional(),
});
export type SessionInfo = z.infer<typeof sessionInfoSchema>;

// Profile response schema (API response)
export const profileResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  emailVerified: z.date().nullable(),
  image: z.string().nullable(),
  profilePictureUrl: z.string().nullable(),
  jobTitle: z.string().nullable(),
  experienceLevel: experienceLevelSchema.nullable(),
  skills: z.array(z.string()),
  preferredIndustries: z.array(z.string()),
  city: z.string().nullable(),
  country: z.string().nullable(),
  bio: z.string().nullable(),
  linkedinUrl: z.string().nullable(),
  githubUrl: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type ProfileResponse = z.infer<typeof profileResponseSchema>;

// Experience level display names
export const EXPERIENCE_LEVEL_LABELS: Record<ExperienceLevel, string> = {
  entry: "Entry Level",
  mid: "Mid Level",
  senior: "Senior Level",
  lead: "Lead / Principal",
  executive: "Executive / C-Level",
};

// Common industries for suggestions
export const COMMON_INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Retail",
  "Manufacturing",
  "Consulting",
  "Media & Entertainment",
  "Telecommunications",
  "Energy",
  "Real Estate",
  "Transportation",
  "Hospitality",
  "Non-Profit",
  "Government",
] as const;
