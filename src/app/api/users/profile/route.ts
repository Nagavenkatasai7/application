/**
 * User Profile API Routes
 *
 * GET /api/users/profile - Get current user's full profile
 * PATCH /api/users/profile - Update user profile
 */

import { requireAuth, getUserById, updateUserProfile } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  parseRequestBody,
  unauthorizedResponse,
} from "@/lib/api";
import { profileUpdateSchema } from "@/lib/validations/profile";

// GET /api/users/profile - Get current user's full profile
export async function GET() {
  try {
    const authUser = await requireAuth();
    const user = await getUserById(authUser.id);

    if (!user) {
      return unauthorizedResponse("User not found");
    }

    // Return full profile with all fields
    return successResponse({
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified,
      image: user.image,
      profilePictureUrl: user.profilePictureUrl,
      // Professional info
      jobTitle: user.jobTitle,
      experienceLevel: user.experienceLevel,
      skills: user.skills || [],
      preferredIndustries: user.preferredIndustries || [],
      // Extended info
      city: user.city,
      country: user.country,
      bio: user.bio,
      linkedinUrl: user.linkedinUrl,
      githubUrl: user.githubUrl,
      // Timestamps
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return unauthorizedResponse();
    }
    console.error("Error getting profile:", error);
    return errorResponse("PROFILE_ERROR", "Failed to get profile", 500);
  }
}

// PATCH /api/users/profile - Update user profile
export async function PATCH(request: Request) {
  try {
    const authUser = await requireAuth();

    // Validate request body
    const parsed = await parseRequestBody(request, profileUpdateSchema);
    if (!parsed.success) {
      return parsed.response;
    }

    // Update profile
    const updatedUser = await updateUserProfile(authUser.id, {
      name: parsed.data.name,
      // Professional info
      jobTitle: parsed.data.jobTitle,
      experienceLevel: parsed.data.experienceLevel,
      skills: parsed.data.skills,
      preferredIndustries: parsed.data.preferredIndustries,
      // Extended info
      city: parsed.data.city,
      country: parsed.data.country,
      bio: parsed.data.bio,
      linkedinUrl: parsed.data.linkedinUrl,
      githubUrl: parsed.data.githubUrl,
      // Profile picture
      profilePictureUrl: parsed.data.profilePictureUrl,
    });

    if (!updatedUser) {
      return errorResponse("PROFILE_UPDATE_ERROR", "Failed to update profile", 500);
    }

    // Return updated profile
    return successResponse({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      emailVerified: updatedUser.emailVerified,
      image: updatedUser.image,
      profilePictureUrl: updatedUser.profilePictureUrl,
      jobTitle: updatedUser.jobTitle,
      experienceLevel: updatedUser.experienceLevel,
      skills: updatedUser.skills || [],
      preferredIndustries: updatedUser.preferredIndustries || [],
      city: updatedUser.city,
      country: updatedUser.country,
      bio: updatedUser.bio,
      linkedinUrl: updatedUser.linkedinUrl,
      githubUrl: updatedUser.githubUrl,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return unauthorizedResponse();
    }
    console.error("Error updating profile:", error);
    return errorResponse("PROFILE_UPDATE_ERROR", "Failed to update profile", 500);
  }
}
