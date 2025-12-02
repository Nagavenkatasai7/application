/**
 * Reset Password API Route
 *
 * POST /api/auth/reset-password - Reset password with token or code
 */

import { db } from "@/lib/db";
import { users, sessions } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { successResponse, errorResponse } from "@/lib/api";
import {
  resetPasswordWithTokenSchema,
  resetPasswordWithCodeSchema,
} from "@/lib/validations/auth";
import { hashPassword, isTokenExpired } from "@/lib/auth/password";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Determine reset method based on payload
    const hasToken = "token" in body;
    const hasCode = "code" in body;

    if (hasToken) {
      return handleTokenReset(body);
    } else if (hasCode) {
      return handleCodeReset(body);
    } else {
      return errorResponse(
        "VALIDATION_ERROR",
        "Either token or code is required",
        400
      );
    }
  } catch (error) {
    console.error("Reset password error:", error);
    return errorResponse(
      "RESET_PASSWORD_ERROR",
      "Failed to reset password. Please try again.",
      500
    );
  }
}

async function handleTokenReset(body: unknown) {
  // Validate input
  const parsed = resetPasswordWithTokenSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(
      "VALIDATION_ERROR",
      parsed.error.issues.map((e) => e.message).join(", "),
      400
    );
  }

  const { token, newPassword } = parsed.data;

  // Find user with matching token that hasn't expired
  const user = await db.query.users.findFirst({
    where: and(
      eq(users.passwordResetToken, token),
      gt(users.passwordResetExpires, new Date())
    ),
  });

  if (!user) {
    return errorResponse(
      "INVALID_TOKEN",
      "Invalid or expired reset token. Please request a new one.",
      400
    );
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update user password and clear reset tokens
  await db
    .update(users)
    .set({
      password: hashedPassword,
      passwordChangedAt: new Date(),
      passwordResetToken: null,
      passwordResetExpires: null,
      passwordResetCode: null,
      // Mark email as verified (they received the email)
      emailVerified: user.emailVerified || new Date(),
      emailVerificationToken: null,
      emailVerificationExpires: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  // Invalidate all existing sessions for security
  await db.delete(sessions).where(eq(sessions.userId, user.id));

  return successResponse({
    message: "Password reset successfully. Please login with your new password.",
    success: true,
  });
}

// Brute force protection constants
const MAX_RESET_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

async function handleCodeReset(body: unknown) {
  // Validate input
  const parsed = resetPasswordWithCodeSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(
      "VALIDATION_ERROR",
      parsed.error.issues.map((e) => e.message).join(", "),
      400
    );
  }

  const { email, code, newPassword } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  // Find user with matching email
  const user = await db.query.users.findFirst({
    where: eq(users.email, normalizedEmail),
  });

  if (!user) {
    return errorResponse(
      "INVALID_CODE",
      "Invalid email or security code",
      400
    );
  }

  // Check if user is locked out due to too many failed attempts
  if (user.passwordResetLockoutUntil && new Date() < user.passwordResetLockoutUntil) {
    const remainingSeconds = Math.ceil(
      (user.passwordResetLockoutUntil.getTime() - Date.now()) / 1000
    );
    return errorResponse(
      "ACCOUNT_LOCKED",
      `Too many failed attempts. Please try again in ${Math.ceil(remainingSeconds / 60)} minute(s).`,
      429
    );
  }

  // Check code
  if (user.passwordResetCode !== code) {
    // Increment failed attempts
    const newAttempts = (user.passwordResetAttempts || 0) + 1;
    const shouldLockout = newAttempts >= MAX_RESET_ATTEMPTS;

    await db
      .update(users)
      .set({
        passwordResetAttempts: newAttempts,
        passwordResetLockoutUntil: shouldLockout
          ? new Date(Date.now() + LOCKOUT_DURATION_MS)
          : null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    if (shouldLockout) {
      return errorResponse(
        "ACCOUNT_LOCKED",
        "Too many failed attempts. Your account is locked for 15 minutes.",
        429
      );
    }

    const attemptsRemaining = MAX_RESET_ATTEMPTS - newAttempts;
    return errorResponse(
      "INVALID_CODE",
      `Invalid security code. ${attemptsRemaining} attempt(s) remaining.`,
      400
    );
  }

  // Check expiration
  if (isTokenExpired(user.passwordResetExpires)) {
    return errorResponse(
      "CODE_EXPIRED",
      "Security code has expired. Please request a new one.",
      400
    );
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update user password, clear reset tokens, and reset brute force counters
  await db
    .update(users)
    .set({
      password: hashedPassword,
      passwordChangedAt: new Date(),
      passwordResetToken: null,
      passwordResetExpires: null,
      passwordResetCode: null,
      passwordResetAttempts: 0,
      passwordResetLockoutUntil: null,
      // Mark email as verified (they received the email)
      emailVerified: user.emailVerified || new Date(),
      emailVerificationToken: null,
      emailVerificationExpires: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  // Invalidate all existing sessions for security
  await db.delete(sessions).where(eq(sessions.userId, user.id));

  return successResponse({
    message: "Password reset successfully. Please login with your new password.",
    success: true,
  });
}
