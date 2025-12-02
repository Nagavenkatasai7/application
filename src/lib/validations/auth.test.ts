/**
 * Auth Validation Tests
 *
 * Tests for authentication validation schemas.
 */

import { describe, it, expect } from "vitest";
import {
  passwordSchema,
  registerWithPasswordSchema,
  resendVerificationSchema,
  loginWithPasswordSchema,
  forgotPasswordSchema,
  resetPasswordWithTokenSchema,
  resetPasswordWithCodeSchema,
  verifyEmailSchema,
  changePasswordSchema,
  checkPasswordStrength,
  PASSWORD_STRENGTH_LABELS,
} from "./auth";

describe("auth validations", () => {
  describe("passwordSchema", () => {
    it("should accept valid passwords", () => {
      const validPasswords = [
        "Password1",
        "SecurePass123",
        "MyP@ssw0rd!",
        "LongPasswordWith1Number",
      ];

      validPasswords.forEach((password) => {
        const result = passwordSchema.safeParse(password);
        expect(result.success).toBe(true);
      });
    });

    it("should reject passwords shorter than 8 characters", () => {
      const result = passwordSchema.safeParse("Pass1");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("8 characters");
      }
    });

    it("should reject passwords longer than 128 characters", () => {
      const longPassword = "A1" + "a".repeat(128);
      const result = passwordSchema.safeParse(longPassword);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("128 characters");
      }
    });

    it("should reject passwords without uppercase letters", () => {
      const result = passwordSchema.safeParse("password123");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("uppercase");
      }
    });

    it("should reject passwords without lowercase letters", () => {
      const result = passwordSchema.safeParse("PASSWORD123");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("lowercase");
      }
    });

    it("should reject passwords without numbers", () => {
      const result = passwordSchema.safeParse("PasswordOnly");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("number");
      }
    });
  });

  describe("registerWithPasswordSchema", () => {
    it("should accept valid registration data", () => {
      const result = registerWithPasswordSchema.safeParse({
        email: "user@example.com",
        password: "Password123",
        confirmPassword: "Password123",
        name: "John Doe",
      });
      expect(result.success).toBe(true);
    });

    it("should accept registration without name", () => {
      const result = registerWithPasswordSchema.safeParse({
        email: "user@example.com",
        password: "Password123",
        confirmPassword: "Password123",
      });
      expect(result.success).toBe(true);
    });

    it("should reject when passwords do not match", () => {
      const result = registerWithPasswordSchema.safeParse({
        email: "user@example.com",
        password: "Password123",
        confirmPassword: "DifferentPassword123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("match");
      }
    });

    it("should reject invalid email", () => {
      const result = registerWithPasswordSchema.safeParse({
        email: "not-an-email",
        password: "Password123",
        confirmPassword: "Password123",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("resendVerificationSchema", () => {
    it("should accept valid email", () => {
      const result = resendVerificationSchema.safeParse({
        email: "user@example.com",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const result = resendVerificationSchema.safeParse({
        email: "invalid",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("loginWithPasswordSchema", () => {
    it("should accept valid login data", () => {
      const result = loginWithPasswordSchema.safeParse({
        email: "user@example.com",
        password: "anypassword",
      });
      expect(result.success).toBe(true);
    });

    it("should accept any password (no strength validation on login)", () => {
      const result = loginWithPasswordSchema.safeParse({
        email: "user@example.com",
        password: "weak",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const result = loginWithPasswordSchema.safeParse({
        email: "invalid",
        password: "password",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("forgotPasswordSchema", () => {
    it("should accept magic_link method", () => {
      const result = forgotPasswordSchema.safeParse({
        email: "user@example.com",
        method: "magic_link",
      });
      expect(result.success).toBe(true);
    });

    it("should accept security_code method", () => {
      const result = forgotPasswordSchema.safeParse({
        email: "user@example.com",
        method: "security_code",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid method", () => {
      const result = forgotPasswordSchema.safeParse({
        email: "user@example.com",
        method: "invalid_method",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("resetPasswordWithTokenSchema", () => {
    it("should accept valid token reset data", () => {
      const result = resetPasswordWithTokenSchema.safeParse({
        token: "abc123token",
        newPassword: "NewPassword123",
        confirmPassword: "NewPassword123",
      });
      expect(result.success).toBe(true);
    });

    it("should reject when passwords do not match", () => {
      const result = resetPasswordWithTokenSchema.safeParse({
        token: "abc123token",
        newPassword: "NewPassword123",
        confirmPassword: "DifferentPassword123",
      });
      expect(result.success).toBe(false);
    });

    it("should reject weak password", () => {
      const result = resetPasswordWithTokenSchema.safeParse({
        token: "abc123token",
        newPassword: "weak",
        confirmPassword: "weak",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("resetPasswordWithCodeSchema", () => {
    it("should accept valid code reset data", () => {
      const result = resetPasswordWithCodeSchema.safeParse({
        email: "user@example.com",
        code: "123456",
        newPassword: "NewPassword123",
        confirmPassword: "NewPassword123",
      });
      expect(result.success).toBe(true);
    });

    it("should reject codes not exactly 6 digits", () => {
      const result = resetPasswordWithCodeSchema.safeParse({
        email: "user@example.com",
        code: "12345",
        newPassword: "NewPassword123",
        confirmPassword: "NewPassword123",
      });
      expect(result.success).toBe(false);
    });

    it("should reject codes with non-digits", () => {
      const result = resetPasswordWithCodeSchema.safeParse({
        email: "user@example.com",
        code: "12345a",
        newPassword: "NewPassword123",
        confirmPassword: "NewPassword123",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("verifyEmailSchema", () => {
    it("should accept valid token", () => {
      const result = verifyEmailSchema.safeParse({
        token: "valid-token-123",
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty token", () => {
      const result = verifyEmailSchema.safeParse({
        token: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("changePasswordSchema", () => {
    it("should accept valid password change data", () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: "oldPassword",
        newPassword: "NewPassword123",
        confirmNewPassword: "NewPassword123",
      });
      expect(result.success).toBe(true);
    });

    it("should reject when passwords do not match", () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: "oldPassword",
        newPassword: "NewPassword123",
        confirmNewPassword: "DifferentPassword123",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("checkPasswordStrength", () => {
    it("should return score 0 for empty password", () => {
      const result = checkPasswordStrength("");
      expect(result.score).toBe(0);
    });

    it("should return low score for short passwords", () => {
      const result = checkPasswordStrength("abc");
      expect(result.score).toBeLessThanOrEqual(1);
      expect(result.feedback.some((f) => f.includes("8 characters"))).toBe(true);
    });

    it("should return low score for passwords without variety", () => {
      const result = checkPasswordStrength("abcdefgh");
      expect(result.score).toBeLessThanOrEqual(2);
    });

    it("should return high score for strong passwords", () => {
      const result = checkPasswordStrength("MyP@ssw0rd!123");
      expect(result.score).toBeGreaterThanOrEqual(3);
    });

    it("should give bonus for length over 12 characters", () => {
      const shortResult = checkPasswordStrength("Pass123!");
      const longResult = checkPasswordStrength("Pass123!ExtraLong");
      expect(longResult.score).toBeGreaterThanOrEqual(shortResult.score);
    });

    it("should provide feedback for missing criteria", () => {
      const result = checkPasswordStrength("lowercase");
      expect(result.feedback.length).toBeGreaterThan(0);
    });
  });

  describe("PASSWORD_STRENGTH_LABELS", () => {
    it("should have labels for all 5 strength levels", () => {
      expect(Object.keys(PASSWORD_STRENGTH_LABELS)).toHaveLength(5);
      expect(PASSWORD_STRENGTH_LABELS[0]).toBe("Very Weak");
      expect(PASSWORD_STRENGTH_LABELS[4]).toBe("Very Strong");
    });
  });
});
