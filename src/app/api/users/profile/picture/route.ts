/**
 * Profile Picture Upload API Routes
 *
 * POST /api/users/profile/picture - Upload profile picture
 * DELETE /api/users/profile/picture - Remove profile picture
 */

import { NextResponse } from "next/server";
import { requireAuth, updateUserProfile } from "@/lib/auth";
import { errorResponse, successResponse, unauthorizedResponse } from "@/lib/api";
import { put } from "@vercel/blob";

// Maximum file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed MIME types for profile pictures
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Check if Vercel Blob is configured
function isBlobConfigured(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

// POST /api/users/profile/picture - Upload profile picture
export async function POST(request: Request) {
  try {
    const authUser = await requireAuth();

    // Check if Vercel Blob is configured
    if (!isBlobConfigured()) {
      return errorResponse(
        "BLOB_NOT_CONFIGURED",
        "File storage is not configured. Please contact support.",
        503
      );
    }

    // Parse FormData
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    // Validate file presence
    if (!file) {
      return errorResponse("NO_FILE", "No file provided", 400);
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return errorResponse(
        "INVALID_TYPE",
        "Only JPEG, PNG, and WebP images are allowed",
        400
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return errorResponse(
        "FILE_TOO_LARGE",
        "File size must be less than 5MB",
        400
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determine file extension from MIME type
    const extension = file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : "webp";

    // Upload to Vercel Blob
    const blob = await put(
      `profiles/${authUser.id}/avatar.${extension}`,
      buffer,
      {
        access: "public",
        contentType: file.type,
        addRandomSuffix: true, // Prevent caching issues
      }
    );

    // Update user profile with new picture URL
    await updateUserProfile(authUser.id, {
      profilePictureUrl: blob.url,
    });

    return successResponse({
      url: blob.url,
      message: "Profile picture uploaded successfully",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return unauthorizedResponse();
    }
    console.error("Error uploading profile picture:", error);
    return errorResponse(
      "PROFILE_PICTURE_UPLOAD_ERROR",
      "Failed to upload profile picture",
      500
    );
  }
}

// DELETE /api/users/profile/picture - Remove profile picture
export async function DELETE() {
  try {
    const authUser = await requireAuth();

    // Get current profile picture URL (would need to fetch from DB)
    // For now, we just clear the URL - orphaned blobs can be cleaned up via cron
    await updateUserProfile(authUser.id, {
      profilePictureUrl: null,
    });

    return NextResponse.json(
      {
        success: true,
        data: { message: "Profile picture removed successfully" },
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return unauthorizedResponse();
    }
    console.error("Error removing profile picture:", error);
    return errorResponse(
      "PROFILE_PICTURE_DELETE_ERROR",
      "Failed to remove profile picture",
      500
    );
  }
}
