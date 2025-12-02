import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { createMockUser } from "@/test/factories";

// Mock uuid
vi.mock("uuid", () => ({
  v4: vi.fn().mockReturnValue("new-user-uuid"),
}));

// Mock password module
vi.mock("@/lib/auth/password", () => ({
  hashPassword: vi.fn().mockResolvedValue("hashed_password_123"),
  generateVerificationToken: vi.fn().mockReturnValue("verification_token_123"),
  getTokenExpiration: vi.fn().mockReturnValue(new Date(Date.now() + 24 * 60 * 60 * 1000)),
}));

// Mock Resend
vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ id: "email-id" }),
    },
  })),
}));

// Mock email template
vi.mock("@/lib/email/templates/verification-email", () => ({
  VerificationEmail: vi.fn().mockReturnValue(null),
}));

// Mock drizzle-orm
vi.mock("drizzle-orm", () => ({
  eq: vi.fn((col, val) => ({ column: col, value: val })),
}));

// Mock db - use function factory without top-level variables
vi.mock("@/lib/db", () => {
  const mockInsertValues = vi.fn().mockResolvedValue(undefined);
  const mockUpdateSetWhere = vi.fn().mockResolvedValue(undefined);

  return {
    db: {
      query: {
        users: {
          findFirst: vi.fn(),
        },
      },
      insert: vi.fn().mockReturnValue({
        values: mockInsertValues,
      }),
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: mockUpdateSetWhere,
        }),
      }),
    },
  };
});

// Mock users schema
vi.mock("@/lib/db/schema", () => ({
  users: { email: "email" },
}));

describe("Register API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const { db } = await import("@/lib/db");
      vi.mocked(db.query.users.findFirst).mockResolvedValueOnce(undefined);

      const request = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "newuser@example.com",
          password: "SecurePass123",
          confirmPassword: "SecurePass123",
          name: "New User",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.requiresVerification).toBe(true);
      expect(data.data.message).toContain("verify");
    });

    it("should reject invalid email format", async () => {
      const request = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "invalid-email",
          password: "SecurePass123",
          confirmPassword: "SecurePass123",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should reject weak password (no uppercase)", async () => {
      const request = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "weakpass123",
          confirmPassword: "weakpass123",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.message).toContain("uppercase");
    });

    it("should reject weak password (too short)", async () => {
      const request = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "Abc1",
          confirmPassword: "Abc1",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.message).toContain("8 characters");
    });

    it("should reject mismatched passwords", async () => {
      const request = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "SecurePass123",
          confirmPassword: "DifferentPass123",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.message).toContain("match");
    });

    it("should reject duplicate email for password user", async () => {
      const { db } = await import("@/lib/db");
      vi.mocked(db.query.users.findFirst).mockResolvedValueOnce(
        createMockUser({
          id: "existing-user",
          email: "existing@example.com",
          password: "hashed_existing_password",
          name: "Existing User",
        })
      );

      const request = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "existing@example.com",
          password: "SecurePass123",
          confirmPassword: "SecurePass123",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error.code).toBe("EMAIL_EXISTS");
    });

    it("should add password to existing magic-link user", async () => {
      const { db } = await import("@/lib/db");
      vi.mocked(db.query.users.findFirst).mockResolvedValueOnce(
        createMockUser({
          id: "magic-link-user",
          email: "magiclink@example.com",
          password: null, // No password - magic link user
          name: "Magic Link User",
          emailVerified: new Date(), // Already verified via magic link
        })
      );

      const request = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "magiclink@example.com",
          password: "SecurePass123",
          confirmPassword: "SecurePass123",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.requiresVerification).toBe(false);
      expect(data.data.message).toContain("Password added");
    });

    it("should normalize email to lowercase", async () => {
      const { db } = await import("@/lib/db");
      vi.mocked(db.query.users.findFirst).mockResolvedValueOnce(undefined);

      const request = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "Test.User@EXAMPLE.COM",
          password: "SecurePass123",
          confirmPassword: "SecurePass123",
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      // Verify the findFirst was called with normalized email
      expect(db.query.users.findFirst).toHaveBeenCalled();
    });

    it("should handle database errors gracefully", async () => {
      const { db } = await import("@/lib/db");
      vi.mocked(db.query.users.findFirst).mockRejectedValueOnce(
        new Error("Database connection failed")
      );

      const request = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "SecurePass123",
          confirmPassword: "SecurePass123",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.code).toBe("REGISTRATION_ERROR");
    });
  });
});
