/**
 * Email Verification API Route
 *
 * POST /api/auth/verify-email - Verify email with token
 */

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { successResponse, errorResponse } from "@/lib/api";
import { verifyEmailSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const parsed = verifyEmailSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Invalid verification token",
        400
      );
    }

    const { token } = parsed.data;

    // Find user with matching token that hasn't expired
    const user = await db.query.users.findFirst({
      where: and(
        eq(users.emailVerificationToken, token),
        gt(users.emailVerificationExpires, new Date())
      ),
    });

    if (!user) {
      return errorResponse(
        "INVALID_TOKEN",
        "Invalid or expired verification token. Please request a new one.",
        400
      );
    }

    // Update user as verified
    await db
      .update(users)
      .set({
        emailVerified: new Date(),
        emailVerificationToken: null,
        emailVerificationExpires: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return successResponse({
      message: "Email verified successfully. You can now login.",
      verified: true,
    });
  } catch (error) {
    console.error("Email verification error:", error);
    return errorResponse(
      "VERIFICATION_ERROR",
      "Failed to verify email. Please try again.",
      500
    );
  }
}
