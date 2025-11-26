import { NextResponse } from "next/server";
import { getOrCreateLocalUser, updateUser } from "@/lib/auth";

// GET /api/users/me - Get current user (auto-creates if not exists)
export async function GET() {
  try {
    const user = await getOrCreateLocalUser();
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("Error getting user:", error);
    return NextResponse.json(
      { success: false, error: { code: "USER_ERROR", message: "Failed to get user" } },
      { status: 500 }
    );
  }
}

// PATCH /api/users/me - Update current user
export async function PATCH(request: Request) {
  try {
    const user = await getOrCreateLocalUser();
    const body = await request.json();

    const updatedUser = await updateUser(user.id, {
      name: body.name,
      email: body.email,
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { success: false, error: { code: "UPDATE_ERROR", message: "Failed to update user" } },
      { status: 500 }
    );
  }
}
