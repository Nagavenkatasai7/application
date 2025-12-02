import { z } from "zod";

// Password requirements: 8+ chars, uppercase, lowercase, number
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be less than 128 characters")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[0-9]/, "Password must contain a number");

// Registration with password
export const registerWithPasswordSchema = z
  .object({
    email: z.string().email("Please enter a valid email").max(255),
    password: passwordSchema,
    confirmPassword: z.string(),
    name: z.string().min(1).max(100).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type RegisterWithPasswordInput = z.infer<typeof registerWithPasswordSchema>;

// Login with password
export const loginWithPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email").max(255),
  password: z.string().min(1, "Password is required"),
});

export type LoginWithPasswordInput = z.infer<typeof loginWithPasswordSchema>;

// Change password (for logged-in users)
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ["confirmNewPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// Forgot password request
export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email").max(255),
  method: z.enum(["magic_link", "security_code"]).default("magic_link"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

// Reset password with token (magic link)
export const resetPasswordWithTokenSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type ResetPasswordWithTokenInput = z.infer<typeof resetPasswordWithTokenSchema>;

// Reset password with security code
export const resetPasswordWithCodeSchema = z
  .object({
    email: z.string().email("Please enter a valid email"),
    code: z
      .string()
      .length(6, "Security code must be 6 digits")
      .regex(/^\d{6}$/, "Security code must be 6 digits"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type ResetPasswordWithCodeInput = z.infer<typeof resetPasswordWithCodeSchema>;

// Email verification
export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

// Resend verification email
export const resendVerificationSchema = z.object({
  email: z.string().email("Please enter a valid email").max(255),
});

export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;

// Password strength check result
export type PasswordStrength = {
  score: 0 | 1 | 2 | 3 | 4;
  feedback: string[];
};

/**
 * Check password strength (client-side helper)
 * Score: 0 = very weak, 1 = weak, 2 = fair, 3 = strong, 4 = very strong
 */
export function checkPasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score++;
  else feedback.push("Use at least 8 characters");

  if (password.length >= 12) score++;

  if (/[A-Z]/.test(password)) score++;
  else feedback.push("Add uppercase letter");

  if (/[a-z]/.test(password)) score++;
  else feedback.push("Add lowercase letter");

  if (/[0-9]/.test(password)) score++;
  else feedback.push("Add a number");

  if (/[^A-Za-z0-9]/.test(password)) score++;
  else feedback.push("Add a special character for extra security");

  // Normalize to 0-4 scale
  const normalizedScore = Math.min(4, Math.floor((score / 6) * 4)) as 0 | 1 | 2 | 3 | 4;

  return { score: normalizedScore, feedback };
}

// Password strength labels
export const PASSWORD_STRENGTH_LABELS: Record<number, string> = {
  0: "Very Weak",
  1: "Weak",
  2: "Fair",
  3: "Strong",
  4: "Very Strong",
};
