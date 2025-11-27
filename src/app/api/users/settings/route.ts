import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userSettings } from "@/lib/db/schema";
import { getOrCreateLocalUser } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import {
  settingsUpdateSchema,
  userSettingsSchema,
  DEFAULT_SETTINGS,
  type UserSettings,
} from "@/lib/validations/settings";
import { createErrorResponse, ERROR_CODES } from "@/lib/errors";

// GET /api/users/settings - Get current user's settings
export async function GET() {
  try {
    const user = await getOrCreateLocalUser();

    // Find existing settings
    const existingSettings = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, user.id))
      .limit(1);

    if (existingSettings.length > 0) {
      const record = existingSettings[0];
      // Merge with defaults to ensure all fields exist
      const settings = userSettingsSchema.parse({
        ...DEFAULT_SETTINGS,
        ...(record.settings as UserSettings),
      });

      return NextResponse.json({
        success: true,
        data: {
          id: record.id,
          userId: record.userId,
          settings,
          createdAt: record.createdAt instanceof Date
            ? Math.floor(record.createdAt.getTime() / 1000)
            : record.createdAt,
          updatedAt: record.updatedAt instanceof Date
            ? Math.floor(record.updatedAt.getTime() / 1000)
            : record.updatedAt,
        },
      });
    }

    // Create default settings if none exist
    const newSettings = {
      id: uuidv4(),
      userId: user.id,
      settings: DEFAULT_SETTINGS,
    };

    await db.insert(userSettings).values(newSettings);

    const insertedSettings = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.id, newSettings.id))
      .limit(1);

    const record = insertedSettings[0];
    return NextResponse.json({
      success: true,
      data: {
        id: record.id,
        userId: record.userId,
        settings: record.settings,
        createdAt: record.createdAt instanceof Date
          ? Math.floor(record.createdAt.getTime() / 1000)
          : record.createdAt,
        updatedAt: record.updatedAt instanceof Date
          ? Math.floor(record.updatedAt.getTime() / 1000)
          : record.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error getting settings:", error);
    return NextResponse.json(
      createErrorResponse(ERROR_CODES.FETCH_ERROR, "Failed to get settings"),
      { status: 500 }
    );
  }
}

// PUT /api/users/settings - Update user settings
export async function PUT(request: Request) {
  try {
    const user = await getOrCreateLocalUser();
    const body = await request.json();

    // Validate update payload
    const updateResult = settingsUpdateSchema.safeParse(body);
    if (!updateResult.success) {
      return NextResponse.json(
        createErrorResponse(ERROR_CODES.VALIDATION_ERROR, "Invalid settings data"),
        { status: 400 }
      );
    }

    const updateData = updateResult.data;

    // Get existing settings
    const existingSettings = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, user.id))
      .limit(1);

    let currentSettings: UserSettings = DEFAULT_SETTINGS;
    let settingsId: string;

    if (existingSettings.length > 0) {
      currentSettings = existingSettings[0].settings as UserSettings;
      settingsId = existingSettings[0].id;
    } else {
      // Create new settings record
      settingsId = uuidv4();
      await db.insert(userSettings).values({
        id: settingsId,
        userId: user.id,
        settings: DEFAULT_SETTINGS,
      });
    }

    // Deep merge the settings
    const mergedSettings: UserSettings = {
      appearance: {
        ...currentSettings.appearance,
        ...updateData.appearance,
      },
      ai: {
        ...currentSettings.ai,
        ...updateData.ai,
      },
      resume: {
        ...currentSettings.resume,
        ...updateData.resume,
      },
      notifications: {
        ...currentSettings.notifications,
        ...updateData.notifications,
      },
    };

    // Validate merged settings
    const validatedSettings = userSettingsSchema.parse(mergedSettings);

    // Update the settings
    await db
      .update(userSettings)
      .set({
        settings: validatedSettings,
        updatedAt: new Date(),
      })
      .where(eq(userSettings.userId, user.id));

    // Fetch updated record
    const updatedRecord = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, user.id))
      .limit(1);

    const record = updatedRecord[0];
    return NextResponse.json({
      success: true,
      data: {
        id: record.id,
        userId: record.userId,
        settings: record.settings,
        createdAt: record.createdAt instanceof Date
          ? Math.floor(record.createdAt.getTime() / 1000)
          : record.createdAt,
        updatedAt: record.updatedAt instanceof Date
          ? Math.floor(record.updatedAt.getTime() / 1000)
          : record.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      createErrorResponse(ERROR_CODES.UPDATE_ERROR, "Failed to update settings"),
      { status: 500 }
    );
  }
}
