/**
 * User Registration API Route
 *
 * POST /api/auth/register - Register with email/password
 */

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { Resend } from "resend";
import { successResponse, errorResponse } from "@/lib/api";
import { registerWithPasswordSchema } from "@/lib/validations/auth";
import {
  hashPassword,
  generateVerificationToken,
  getTokenExpiration,
} from "@/lib/auth/password";
import { VerificationEmail } from "@/lib/email/templates/verification-email";

const resend = new Resend(process.env.AUTH_RESEND_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const parsed = registerWithPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(
        "VALIDATION_ERROR",
        parsed.error.issues.map((e) => e.message).join(", "),
        400
      );
    }

    const { email, password, name } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, normalizedEmail),
    });

    if (existingUser) {
      // If user exists with password, they're already registered
      if (existingUser.password) {
        return errorResponse(
          "EMAIL_EXISTS",
          "An account with this email already exists",
          409
        );
      }

      // If user exists without password (magic-link user), add password to their account
      const hashedPassword = await hashPassword(password);
      const verificationToken = generateVerificationToken();
      const verificationExpires = getTokenExpiration(24); // 24 hours

      await db
        .update(users)
        .set({
          password: hashedPassword,
          name: name || existingUser.name,
          emailVerificationToken: verificationToken,
          emailVerificationExpires: verificationExpires,
          // Don't clear emailVerified - they already verified via magic link
          updatedAt: new Date(),
        })
        .where(eq(users.id, existingUser.id));

      // If already verified, they can login immediately
      if (existingUser.emailVerified) {
        return successResponse({
          message: "Password added to your account. You can now login.",
          requiresVerification: false,
        });
      }

      // Send verification email
      await sendVerificationEmail(normalizedEmail, verificationToken);

      return successResponse({
        message: "Please check your email to verify your account",
        requiresVerification: true,
      });
    }

    // Create new user
    const hashedPassword = await hashPassword(password);
    const verificationToken = generateVerificationToken();
    const verificationExpires = getTokenExpiration(24); // 24 hours
    const userId = uuidv4();

    await db.insert(users).values({
      id: userId,
      email: normalizedEmail,
      name: name || null,
      password: hashedPassword,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Send verification email
    await sendVerificationEmail(normalizedEmail, verificationToken);

    return successResponse(
      {
        message: "Please check your email to verify your account",
        requiresVerification: true,
      },
      201
    );
  } catch (error) {
    console.error("Registration error:", error);
    return errorResponse(
      "REGISTRATION_ERROR",
      "Failed to register. Please try again.",
      500
    );
  }
}

async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/verify-email?token=${token}`;

  await resend.emails.send({
    from: process.env.EMAIL_FROM || "onboarding@resend.dev",
    to: email,
    subject: "Verify your email address",
    react: VerificationEmail({ verificationUrl }),
  });
}
