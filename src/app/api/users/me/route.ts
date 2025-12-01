import { getOrCreateLocalUser, updateUser } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  parseRequestBody,
  userUpdateSchema,
} from "@/lib/api";

// GET /api/users/me - Get current user (auto-creates if not exists)
export async function GET() {
  try {
    const user = await getOrCreateLocalUser();
    return successResponse(user);
  } catch (error) {
    console.error("Error getting user:", error);
    return errorResponse("USER_ERROR", "Failed to get user", 500);
  }
}

// PATCH /api/users/me - Update current user
export async function PATCH(request: Request) {
  try {
    const user = await getOrCreateLocalUser();

    // Validate request body
    const parsed = await parseRequestBody(request, userUpdateSchema);
    if (!parsed.success) {
      return parsed.response;
    }

    const updatedUser = await updateUser(user.id, {
      name: parsed.data.name,
      email: parsed.data.email,
    });

    return successResponse(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return errorResponse("UPDATE_ERROR", "Failed to update user", 500);
  }
}
