/**
 * Forgot Password API Route
 *
 * POST /api/auth/forgot-password - Request password reset
 */

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Resend } from "resend";
import { successResponse, errorResponse } from "@/lib/api";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import {
  generateVerificationToken,
  generateSecurityCode,
  getTokenExpiration,
  getSecurityCodeExpiration,
} from "@/lib/auth/password";
import { PasswordResetLinkEmail } from "@/lib/email/templates/password-reset-link";
import { PasswordResetCodeEmail } from "@/lib/email/templates/password-reset-code";

// Lazy-load Resend client to avoid build-time initialization errors
function getResendClient(): Resend {
  return new Resend(process.env.AUTH_RESEND_KEY);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(
        "VALIDATION_ERROR",
        parsed.error.issues.map((e) => e.message).join(", "),
        400
      );
    }

    const { email, method } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    const user = await db.query.users.findFirst({
      where: eq(users.email, normalizedEmail),
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return successResponse({
        message: "If an account exists, you will receive a password reset email",
        method,
      });
    }

    // Check if user has a password (password-based account)
    // Even magic-link users can set a password via this flow
    if (method === "magic_link") {
      // Generate reset token
      const resetToken = generateVerificationToken();
      const resetExpires = getTokenExpiration(1); // 1 hour

      await db
        .update(users)
        .set({
          passwordResetToken: resetToken,
          passwordResetExpires: resetExpires,
          passwordResetCode: null, // Clear any existing code
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      // Send reset link email (wrapped in try-catch to prevent request failures)
      const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;
      try {
        const resend = getResendClient();
        await resend.emails.send({
          from: process.env.EMAIL_FROM || "onboarding@resend.dev",
          to: normalizedEmail,
          subject: "Reset your password",
          react: PasswordResetLinkEmail({ resetUrl }),
        });
      } catch (emailError) {
        console.error("Failed to send password reset email:", emailError);
        // Still return success to prevent email enumeration
      }
    } else {
      // Generate security code
      const resetCode = generateSecurityCode();
      const codeExpires = getSecurityCodeExpiration(); // 10 minutes

      await db
        .update(users)
        .set({
          passwordResetCode: resetCode,
          passwordResetExpires: codeExpires,
          passwordResetToken: null, // Clear any existing token
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      // Send code email (wrapped in try-catch to prevent request failures)
      try {
        const resend = getResendClient();
        await resend.emails.send({
          from: process.env.EMAIL_FROM || "onboarding@resend.dev",
          to: normalizedEmail,
          subject: "Your password reset code",
          react: PasswordResetCodeEmail({ code: resetCode }),
        });
      } catch (emailError) {
        console.error("Failed to send password reset code email:", emailError);
        // Still return success to prevent email enumeration
      }
    }

    return successResponse({
      message: "If an account exists, you will receive a password reset email",
      method,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return errorResponse(
      "FORGOT_PASSWORD_ERROR",
      "Failed to process request. Please try again.",
      500
    );
  }
}
