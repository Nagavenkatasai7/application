import { z } from "zod";

// Theme options
export const themeSchema = z.enum(["light", "dark", "system"]);
export type Theme = z.infer<typeof themeSchema>;

// AI Provider options
export const aiProviderSchema = z.enum(["anthropic", "openai"]);
export type AIProvider = z.infer<typeof aiProviderSchema>;

// AI Model options
export const aiModelSchema = z.enum([
  // Anthropic models
  "claude-sonnet-4-5-20250929",
  "claude-3-5-haiku-20241022",
  // OpenAI models
  "gpt-4o",
  "gpt-4o-mini",
]);
export type AIModel = z.infer<typeof aiModelSchema>;

// Appearance settings
export const appearanceSettingsSchema = z.object({
  theme: themeSchema.default("dark"),
  reducedMotion: z.boolean().default(false),
  compactMode: z.boolean().default(false),
});
export type AppearanceSettings = z.infer<typeof appearanceSettingsSchema>;

// AI configuration settings
export const aiSettingsSchema = z.object({
  provider: aiProviderSchema.default("anthropic"),
  apiKey: z.string().optional(), // Stored encrypted or not stored at all for security
  model: aiModelSchema.default("claude-sonnet-4-5-20250929"),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(100).max(8000).default(4000),
  // Feature toggles
  enableTailoring: z.boolean().default(true),
  enableSummaryGeneration: z.boolean().default(true),
  enableSkillExtraction: z.boolean().default(true),
  enableBulletOptimization: z.boolean().default(true),
});
export type AISettings = z.infer<typeof aiSettingsSchema>;

// Resume preferences
export const resumePreferencesSchema = z.object({
  defaultTemplate: z.string().optional(),
  exportFormat: z.enum(["pdf", "docx"]).default("pdf"),
  includeContactInfo: z.boolean().default(true),
  atsOptimization: z.boolean().default(true),
});
export type ResumePreferences = z.infer<typeof resumePreferencesSchema>;

// Notification settings
export const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean().default(true),
  applicationUpdates: z.boolean().default(true),
  weeklyDigest: z.boolean().default(false),
});
export type NotificationSettings = z.infer<typeof notificationSettingsSchema>;

// Complete user settings
export const userSettingsSchema = z.object({
  appearance: appearanceSettingsSchema.optional().default({
    theme: "dark",
    reducedMotion: false,
    compactMode: false,
  }),
  ai: aiSettingsSchema.optional().default({
    provider: "anthropic",
    model: "claude-sonnet-4-5-20250929",
    temperature: 0.7,
    maxTokens: 4000,
    enableTailoring: true,
    enableSummaryGeneration: true,
    enableSkillExtraction: true,
    enableBulletOptimization: true,
  }),
  resume: resumePreferencesSchema.optional().default({
    exportFormat: "pdf",
    includeContactInfo: true,
    atsOptimization: true,
  }),
  notifications: notificationSettingsSchema.optional().default({
    emailNotifications: true,
    applicationUpdates: true,
    weeklyDigest: false,
  }),
});
export type UserSettings = z.infer<typeof userSettingsSchema>;

// Settings update request (partial)
export const settingsUpdateSchema = z.object({
  appearance: appearanceSettingsSchema.partial().optional(),
  ai: aiSettingsSchema.partial().optional(),
  resume: resumePreferencesSchema.partial().optional(),
  notifications: notificationSettingsSchema.partial().optional(),
});
export type SettingsUpdate = z.infer<typeof settingsUpdateSchema>;

// API response types
export const settingsResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  settings: userSettingsSchema,
  createdAt: z.number(),
  updatedAt: z.number(),
});
export type SettingsResponse = z.infer<typeof settingsResponseSchema>;

// Default settings
export const DEFAULT_SETTINGS: UserSettings = {
  appearance: {
    theme: "dark",
    reducedMotion: false,
    compactMode: false,
  },
  ai: {
    provider: "anthropic",
    model: "claude-sonnet-4-5-20250929",
    temperature: 0.7,
    maxTokens: 4000,
    enableTailoring: true,
    enableSummaryGeneration: true,
    enableSkillExtraction: true,
    enableBulletOptimization: true,
  },
  resume: {
    exportFormat: "pdf",
    includeContactInfo: true,
    atsOptimization: true,
  },
  notifications: {
    emailNotifications: true,
    applicationUpdates: true,
    weeklyDigest: false,
  },
};
