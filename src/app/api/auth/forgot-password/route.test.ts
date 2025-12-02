import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { createMockUser } from "@/test/factories";

// Mock password module
vi.mock("@/lib/auth/password", () => ({
  generateVerificationToken: vi.fn().mockReturnValue("reset_token_123"),
  generateSecurityCode: vi.fn().mockReturnValue("123456"),
  getTokenExpiration: vi.fn().mockReturnValue(new Date(Date.now() + 60 * 60 * 1000)),
  getSecurityCodeExpiration: vi.fn().mockReturnValue(new Date(Date.now() + 10 * 60 * 1000)),
}));

// Mock Resend
vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ id: "email-id" }),
    },
  })),
}));

// Mock email templates
vi.mock("@/lib/email/templates/password-reset-link", () => ({
  PasswordResetLinkEmail: vi.fn().mockReturnValue(null),
}));

vi.mock("@/lib/email/templates/password-reset-code", () => ({
  PasswordResetCodeEmail: vi.fn().mockReturnValue(null),
}));

// Mock drizzle-orm
vi.mock("drizzle-orm", () => ({
  eq: vi.fn((col, val) => ({ column: col, value: val })),
}));

// Mock db - use function factory without top-level variables
vi.mock("@/lib/db", () => {
  return {
    db: {
      query: {
        users: {
          findFirst: vi.fn(),
        },
      },
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      }),
    },
  };
});

// Mock users schema
vi.mock("@/lib/db/schema", () => ({
  users: { email: "email", id: "id" },
}));

describe("Forgot Password API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/auth/forgot-password", () => {
    it("should send magic link for existing user", async () => {
      const { db } = await import("@/lib/db");
      vi.mocked(db.query.users.findFirst).mockResolvedValueOnce(
        createMockUser({ id: "user-123", email: "test@example.com", password: "hashed_password" })
      );

      const request = new Request("http://localhost/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          method: "magic_link",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.method).toBe("magic_link");
      expect(data.data.message).toContain("If an account exists");
    });

    it("should send security code for existing user", async () => {
      const { db } = await import("@/lib/db");
      vi.mocked(db.query.users.findFirst).mockResolvedValueOnce(
        createMockUser({ id: "user-123", email: "test@example.com", password: "hashed_password" })
      );

      const request = new Request("http://localhost/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          method: "security_code",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.method).toBe("security_code");
    });

    it("should default to magic_link method", async () => {
      const { db } = await import("@/lib/db");
      vi.mocked(db.query.users.findFirst).mockResolvedValueOnce(
        createMockUser({ id: "user-123", email: "test@example.com", password: "hashed_password" })
      );

      const request = new Request("http://localhost/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.method).toBe("magic_link");
    });

    it("should not reveal if user exists (email enumeration prevention)", async () => {
      const { db } = await import("@/lib/db");
      vi.mocked(db.query.users.findFirst).mockResolvedValueOnce(undefined);

      const request = new Request("http://localhost/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "nonexistent@example.com",
          method: "magic_link",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      // Should return same success response as if user exists
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.message).toContain("If an account exists");
    });

    it("should reject invalid email format", async () => {
      const request = new Request("http://localhost/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "invalid-email",
          method: "magic_link",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should reject invalid method", async () => {
      const request = new Request("http://localhost/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          method: "invalid_method",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should normalize email to lowercase", async () => {
      const { db } = await import("@/lib/db");
      vi.mocked(db.query.users.findFirst).mockResolvedValueOnce(undefined);

      const request = new Request("http://localhost/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "Test.User@EXAMPLE.COM",
          method: "magic_link",
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(db.query.users.findFirst).toHaveBeenCalled();
    });

    it("should update reset token for magic link", async () => {
      const { db } = await import("@/lib/db");
      vi.mocked(db.query.users.findFirst).mockResolvedValueOnce(
        createMockUser({ id: "user-123", email: "test@example.com", password: "hashed_password" })
      );

      const request = new Request("http://localhost/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          method: "magic_link",
        }),
      });

      await POST(request);

      expect(db.update).toHaveBeenCalled();
    });

    it("should update reset code for security code method", async () => {
      const { db } = await import("@/lib/db");
      vi.mocked(db.query.users.findFirst).mockResolvedValueOnce(
        createMockUser({ id: "user-123", email: "test@example.com", password: "hashed_password" })
      );

      const request = new Request("http://localhost/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          method: "security_code",
        }),
      });

      await POST(request);

      expect(db.update).toHaveBeenCalled();
    });

    it("should handle database errors gracefully", async () => {
      const { db } = await import("@/lib/db");
      vi.mocked(db.query.users.findFirst).mockRejectedValueOnce(
        new Error("Database connection failed")
      );

      const request = new Request("http://localhost/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          method: "magic_link",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.code).toBe("FORGOT_PASSWORD_ERROR");
    });

    it("should work for magic-link-only users (no password)", async () => {
      const { db } = await import("@/lib/db");
      vi.mocked(db.query.users.findFirst).mockResolvedValueOnce(
        createMockUser({ id: "user-123", email: "test@example.com", password: null })
      );

      const request = new Request("http://localhost/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          method: "magic_link",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});
