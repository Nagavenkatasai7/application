import { describe, it, expect } from "vitest";
import {
  themeSchema,
  aiProviderSchema,
  aiModelSchema,
  appearanceSettingsSchema,
  aiSettingsSchema,
  resumePreferencesSchema,
  notificationSettingsSchema,
  userSettingsSchema,
  settingsUpdateSchema,
  settingsResponseSchema,
  DEFAULT_SETTINGS,
  type Theme,
  type AIProvider,
  type AIModel,
  type UserSettings,
} from "./settings";

describe("Settings Validation Schemas", () => {
  describe("themeSchema", () => {
    it("should accept valid themes", () => {
      const validThemes: Theme[] = ["light", "dark", "system"];

      validThemes.forEach((theme) => {
        const result = themeSchema.safeParse(theme);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid themes", () => {
      const result = themeSchema.safeParse("midnight");
      expect(result.success).toBe(false);
    });
  });

  describe("aiProviderSchema", () => {
    it("should accept valid AI providers", () => {
      const validProviders: AIProvider[] = ["anthropic", "openai"];

      validProviders.forEach((provider) => {
        const result = aiProviderSchema.safeParse(provider);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid providers", () => {
      const result = aiProviderSchema.safeParse("google");
      expect(result.success).toBe(false);
    });
  });

  describe("aiModelSchema", () => {
    it("should accept valid AI models", () => {
      const validModels: AIModel[] = [
        "claude-sonnet-4-5-20250929",
        "claude-3-5-haiku-20241022",
        "gpt-4o",
        "gpt-4o-mini",
      ];

      validModels.forEach((model) => {
        const result = aiModelSchema.safeParse(model);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid models", () => {
      const result = aiModelSchema.safeParse("gpt-5");
      expect(result.success).toBe(false);
    });
  });

  describe("appearanceSettingsSchema", () => {
    it("should accept valid appearance settings", () => {
      const result = appearanceSettingsSchema.safeParse({
        theme: "dark",
        reducedMotion: true,
        compactMode: false,
      });
      expect(result.success).toBe(true);
    });

    it("should apply defaults for missing fields", () => {
      const result = appearanceSettingsSchema.parse({});
      expect(result.theme).toBe("dark");
      expect(result.reducedMotion).toBe(false);
      expect(result.compactMode).toBe(false);
    });

    it("should reject invalid theme", () => {
      const result = appearanceSettingsSchema.safeParse({
        theme: "invalid",
      });
      expect(result.success).toBe(false);
    });

    it("should reject non-boolean reducedMotion", () => {
      const result = appearanceSettingsSchema.safeParse({
        reducedMotion: "yes",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("aiSettingsSchema", () => {
    it("should accept valid AI settings", () => {
      const result = aiSettingsSchema.safeParse({
        provider: "anthropic",
        model: "claude-sonnet-4-5-20250929",
        temperature: 0.7,
        maxTokens: 4000,
        enableTailoring: true,
        enableSummaryGeneration: true,
        enableSkillExtraction: true,
        enableBulletOptimization: true,
      });
      expect(result.success).toBe(true);
    });

    it("should apply defaults for missing fields", () => {
      const result = aiSettingsSchema.parse({});
      expect(result.provider).toBe("anthropic");
      expect(result.model).toBe("claude-sonnet-4-5-20250929");
      expect(result.temperature).toBe(0.7);
      expect(result.maxTokens).toBe(4000);
      expect(result.enableTailoring).toBe(true);
    });

    it("should accept optional apiKey", () => {
      const result = aiSettingsSchema.safeParse({
        apiKey: "sk-test-key-123",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.apiKey).toBe("sk-test-key-123");
      }
    });

    it("should reject temperature below 0", () => {
      const result = aiSettingsSchema.safeParse({
        temperature: -0.5,
      });
      expect(result.success).toBe(false);
    });

    it("should reject temperature above 2", () => {
      const result = aiSettingsSchema.safeParse({
        temperature: 2.5,
      });
      expect(result.success).toBe(false);
    });

    it("should reject maxTokens below 100", () => {
      const result = aiSettingsSchema.safeParse({
        maxTokens: 50,
      });
      expect(result.success).toBe(false);
    });

    it("should reject maxTokens above 8000", () => {
      const result = aiSettingsSchema.safeParse({
        maxTokens: 10000,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("resumePreferencesSchema", () => {
    it("should accept valid resume preferences", () => {
      const result = resumePreferencesSchema.safeParse({
        defaultTemplate: "modern",
        exportFormat: "pdf",
        includeContactInfo: true,
        atsOptimization: true,
      });
      expect(result.success).toBe(true);
    });

    it("should apply defaults for missing fields", () => {
      const result = resumePreferencesSchema.parse({});
      expect(result.exportFormat).toBe("pdf");
      expect(result.includeContactInfo).toBe(true);
      expect(result.atsOptimization).toBe(true);
    });

    it("should accept docx export format", () => {
      const result = resumePreferencesSchema.safeParse({
        exportFormat: "docx",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid export format", () => {
      const result = resumePreferencesSchema.safeParse({
        exportFormat: "txt",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("notificationSettingsSchema", () => {
    it("should accept valid notification settings", () => {
      const result = notificationSettingsSchema.safeParse({
        emailNotifications: true,
        applicationUpdates: false,
        weeklyDigest: true,
      });
      expect(result.success).toBe(true);
    });

    it("should apply defaults for missing fields", () => {
      const result = notificationSettingsSchema.parse({});
      expect(result.emailNotifications).toBe(true);
      expect(result.applicationUpdates).toBe(true);
      expect(result.weeklyDigest).toBe(false);
    });
  });

  describe("userSettingsSchema", () => {
    it("should accept complete valid settings", () => {
      const result = userSettingsSchema.safeParse({
        appearance: {
          theme: "light",
          reducedMotion: false,
          compactMode: true,
        },
        ai: {
          provider: "openai",
          model: "gpt-4o",
          temperature: 0.5,
          maxTokens: 2000,
          enableTailoring: true,
          enableSummaryGeneration: false,
          enableSkillExtraction: true,
          enableBulletOptimization: false,
        },
        resume: {
          exportFormat: "docx",
          includeContactInfo: false,
          atsOptimization: true,
        },
        notifications: {
          emailNotifications: false,
          applicationUpdates: true,
          weeklyDigest: true,
        },
      });
      expect(result.success).toBe(true);
    });

    it("should apply nested defaults for empty object", () => {
      // When parsing empty object, section defaults are applied as empty objects
      // Individual field defaults within sections are then applied
      const result = userSettingsSchema.parse({});
      // The sections should exist (due to default({}))
      expect(result.appearance).toBeDefined();
      expect(result.ai).toBeDefined();
      expect(result.resume).toBeDefined();
      expect(result.notifications).toBeDefined();
    });

    it("should apply partial defaults within sections", () => {
      const result = userSettingsSchema.parse({
        appearance: { theme: "light" },
      });
      expect(result.appearance.theme).toBe("light");
      // Other sections should still have defaults
      expect(result.ai).toBeDefined();
      expect(result.resume).toBeDefined();
      expect(result.notifications).toBeDefined();
    });
  });

  describe("settingsUpdateSchema", () => {
    it("should accept partial appearance update", () => {
      const result = settingsUpdateSchema.safeParse({
        appearance: { theme: "light" },
      });
      expect(result.success).toBe(true);
    });

    it("should accept partial AI update", () => {
      const result = settingsUpdateSchema.safeParse({
        ai: { temperature: 0.9 },
      });
      expect(result.success).toBe(true);
    });

    it("should accept multiple partial sections", () => {
      const result = settingsUpdateSchema.safeParse({
        appearance: { theme: "system" },
        ai: { model: "gpt-4o-mini" },
        notifications: { weeklyDigest: true },
      });
      expect(result.success).toBe(true);
    });

    it("should accept empty update", () => {
      const result = settingsUpdateSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("should reject invalid values in partial update", () => {
      const result = settingsUpdateSchema.safeParse({
        ai: { temperature: 5 },
      });
      expect(result.success).toBe(false);
    });
  });

  describe("settingsResponseSchema", () => {
    it("should validate a complete settings response", () => {
      const response = {
        id: "settings-123",
        userId: "user-456",
        settings: DEFAULT_SETTINGS,
        createdAt: 1700000000,
        updatedAt: 1700000001,
      };
      const result = settingsResponseSchema.safeParse(response);
      expect(result.success).toBe(true);
    });

    it("should require id", () => {
      const response = {
        userId: "user-456",
        settings: DEFAULT_SETTINGS,
        createdAt: 1700000000,
        updatedAt: 1700000001,
      };
      const result = settingsResponseSchema.safeParse(response);
      expect(result.success).toBe(false);
    });

    it("should require userId", () => {
      const response = {
        id: "settings-123",
        settings: DEFAULT_SETTINGS,
        createdAt: 1700000000,
        updatedAt: 1700000001,
      };
      const result = settingsResponseSchema.safeParse(response);
      expect(result.success).toBe(false);
    });

    it("should accept settings object with extra fields (stripped)", () => {
      // Zod strips unknown keys by default rather than rejecting them
      const response = {
        id: "settings-123",
        userId: "user-456",
        settings: { invalid: "data" },
        createdAt: 1700000000,
        updatedAt: 1700000001,
      };
      const result = settingsResponseSchema.safeParse(response);
      // Schema is lenient - extra fields are stripped, missing fields get defaults
      expect(result.success).toBe(true);
    });

    it("should reject settings with invalid nested values", () => {
      const response = {
        id: "settings-123",
        userId: "user-456",
        settings: {
          appearance: { theme: "invalid-theme" }, // Invalid enum value
        },
        createdAt: 1700000000,
        updatedAt: 1700000001,
      };
      const result = settingsResponseSchema.safeParse(response);
      expect(result.success).toBe(false);
    });
  });

  describe("DEFAULT_SETTINGS", () => {
    it("should have valid structure", () => {
      const result = userSettingsSchema.safeParse(DEFAULT_SETTINGS);
      expect(result.success).toBe(true);
    });

    it("should have dark theme by default", () => {
      expect(DEFAULT_SETTINGS.appearance.theme).toBe("dark");
    });

    it("should use anthropic as default provider", () => {
      expect(DEFAULT_SETTINGS.ai.provider).toBe("anthropic");
    });

    it("should have all AI features enabled by default", () => {
      expect(DEFAULT_SETTINGS.ai.enableTailoring).toBe(true);
      expect(DEFAULT_SETTINGS.ai.enableSummaryGeneration).toBe(true);
      expect(DEFAULT_SETTINGS.ai.enableSkillExtraction).toBe(true);
      expect(DEFAULT_SETTINGS.ai.enableBulletOptimization).toBe(true);
    });

    it("should have pdf as default export format", () => {
      expect(DEFAULT_SETTINGS.resume.exportFormat).toBe("pdf");
    });

    it("should have weekly digest disabled by default", () => {
      expect(DEFAULT_SETTINGS.notifications.weeklyDigest).toBe(false);
    });
  });

  describe("type inference", () => {
    it("should correctly infer UserSettings type", () => {
      const settings: UserSettings = userSettingsSchema.parse({});
      expect(settings.appearance).toBeDefined();
      expect(settings.ai).toBeDefined();
      expect(settings.resume).toBeDefined();
      expect(settings.notifications).toBeDefined();
    });
  });
});
