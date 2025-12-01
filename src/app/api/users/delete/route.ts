/**
 * Account Deletion API Route
 *
 * POST /api/users/delete - Delete user account and all associated data (GDPR compliant)
 */

import { requireAuth, getUserById } from "@/lib/auth";
import {
  db,
  users,
  resumes,
  applications,
  userSettings,
  softSkills,
  sessions,
  accounts,
} from "@/lib/db";
import { errorResponse, parseRequestBody, successResponse, unauthorizedResponse } from "@/lib/api";
import { deleteAccountSchema } from "@/lib/validations/profile";
import { eq } from "drizzle-orm";
import { del } from "@vercel/blob";

// POST /api/users/delete - Delete account and all data
export async function POST(request: Request) {
  try {
    const authUser = await requireAuth();

    // Validate confirmation
    const parsed = await parseRequestBody(request, deleteAccountSchema);
    if (!parsed.success) {
      return parsed.response;
    }

    // Get user to verify they exist
    const user = await getUserById(authUser.id);
    if (!user) {
      return unauthorizedResponse("User not found");
    }

    console.log(`Starting account deletion for user ${authUser.id}`);

    // Delete in order to respect foreign key constraints
    // Note: Many tables have ON DELETE CASCADE, but we're being explicit here

    // 1. Delete soft skills assessments
    await db.delete(softSkills).where(eq(softSkills.userId, authUser.id));
    console.log("Deleted soft skills");

    // 2. Delete applications (before resumes due to FK)
    await db.delete(applications).where(eq(applications.userId, authUser.id));
    console.log("Deleted applications");

    // 3. Get resumes to delete associated blobs
    const userResumes = await db
      .select({ id: resumes.id, originalPdfUrl: resumes.originalPdfUrl })
      .from(resumes)
      .where(eq(resumes.userId, authUser.id));

    // Delete resume blobs from Vercel Blob
    for (const resume of userResumes) {
      if (resume.originalPdfUrl) {
        try {
          await del(resume.originalPdfUrl);
          console.log(`Deleted blob: ${resume.originalPdfUrl}`);
        } catch (error) {
          console.error(`Failed to delete blob: ${resume.originalPdfUrl}`, error);
          // Continue with deletion even if blob deletion fails
        }
      }
    }

    // 4. Delete resumes
    await db.delete(resumes).where(eq(resumes.userId, authUser.id));
    console.log("Deleted resumes");

    // 5. Delete user settings
    await db.delete(userSettings).where(eq(userSettings.userId, authUser.id));
    console.log("Deleted user settings");

    // 6. Delete all sessions (logs user out everywhere)
    await db.delete(sessions).where(eq(sessions.userId, authUser.id));
    console.log("Deleted sessions");

    // 7. Delete OAuth accounts
    await db.delete(accounts).where(eq(accounts.userId, authUser.id));
    console.log("Deleted accounts");

    // 8. Delete profile picture blob if exists
    if (user.profilePictureUrl) {
      try {
        await del(user.profilePictureUrl);
        console.log("Deleted profile picture blob");
      } catch (error) {
        console.error("Failed to delete profile picture blob:", error);
        // Continue with deletion
      }
    }

    // 9. Finally, delete the user record
    await db.delete(users).where(eq(users.id, authUser.id));
    console.log(`Successfully deleted account for user ${authUser.id}`);

    // Return success - client should redirect to home page
    return successResponse({
      message: "Account deleted successfully",
      deletedAt: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return unauthorizedResponse();
    }
    console.error("Error deleting account:", error);
    return errorResponse(
      "DELETE_ACCOUNT_ERROR",
      "Failed to delete account. Please try again or contact support.",
      500
    );
  }
}
