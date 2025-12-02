import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { createMockUser } from "@/test/factories";

// Mock password module
vi.mock("@/lib/auth/password", () => ({
  hashPassword: vi.fn().mockResolvedValue("new_hashed_password"),
  isTokenExpired: vi.fn().mockReturnValue(false),
}));

// Mock drizzle-orm
vi.mock("drizzle-orm", () => ({
  eq: vi.fn((col, val) => ({ column: col, value: val })),
  and: vi.fn((...conditions) => ({ type: "and", conditions })),
  gt: vi.fn((col, val) => ({ column: col, operator: ">", value: val })),
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
      delete: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    },
  };
});

// Mock schema
vi.mock("@/lib/db/schema", () => ({
  users: {
    email: "email",
    id: "id",
    passwordResetToken: "passwordResetToken",
    passwordResetExpires: "passwordResetExpires",
  },
  sessions: { userId: "userId" },
}));

describe("Reset Password API Route", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // Reset the default mock behavior for modules
    const { isTokenExpired, hashPassword } = await import("@/lib/auth/password");
    vi.mocked(isTokenExpired).mockReturnValue(false);
    vi.mocked(hashPassword).mockResolvedValue("new_hashed_password");

    // Reset db mock implementations
    const { db } = await import("@/lib/db");
    vi.mocked(db.update).mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    } as unknown as ReturnType<typeof db.update>);
    vi.mocked(db.delete).mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    } as unknown as ReturnType<typeof db.delete>);
  });

  describe("POST /api/auth/reset-password with token", () => {
    it("should reset password successfully with valid token", async () => {
      const { db } = await import("@/lib/db");
      vi.mocked(db.query.users.findFirst).mockResolvedValueOnce(
        createMockUser({
          id: "user-123",
          email: "test@example.com",
          passwordResetToken: "valid_reset_token",
          passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000),
        })
      );

      const request = new Request("http://localhost/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: "valid_reset_token",
          newPassword: "NewSecure123",
          confirmPassword: "NewSecure123",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.message).toContain("successfully");
    });

    it("should reject invalid token", async () => {
      const { db } = await import("@/lib/db");
      vi.mocked(db.query.users.findFirst).mockResolvedValueOnce(undefined);

      const request = new Request("http://localhost/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: "invalid_token",
          newPassword: "NewSecure123",
          confirmPassword: "NewSecure123",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("INVALID_TOKEN");
    });

    it("should reject mismatched passwords", async () => {
      const request = new Request("http://localhost/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: "valid_token",
          newPassword: "NewSecure123",
          confirmPassword: "DifferentPass123",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should reject weak password", async () => {
      const request = new Request("http://localhost/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: "valid_token",
          newPassword: "weak",
          confirmPassword: "weak",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should invalidate all sessions after password reset", async () => {
      const { db } = await import("@/lib/db");
      vi.mocked(db.query.users.findFirst).mockResolvedValueOnce(
        createMockUser({
          id: "user-123",
          email: "test@example.com",
          passwordResetToken: "valid_reset_token",
          passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000),
        })
      );

      const request = new Request("http://localhost/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: "valid_reset_token",
          newPassword: "NewSecure123",
          confirmPassword: "NewSecure123",
        }),
      });

      await POST(request);

      // Verify sessions were deleted
      expect(db.delete).toHaveBeenCalled();
    });
  });

  describe("POST /api/auth/reset-password with code", () => {
    it("should reset password successfully with valid code", async () => {
      const { db } = await import("@/lib/db");
      vi.mocked(db.query.users.findFirst).mockResolvedValueOnce(
        createMockUser({
          id: "user-123",
          email: "test@example.com",
          passwordResetCode: "123456",
          passwordResetExpires: new Date(Date.now() + 10 * 60 * 1000),
          passwordResetAttempts: 0,
          passwordResetLockoutUntil: null,
        })
      );

      const request = new Request("http://localhost/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          code: "123456",
          newPassword: "NewSecure123",
          confirmPassword: "NewSecure123",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it("should reject invalid code and track attempts", async () => {
      const { db } = await import("@/lib/db");
      vi.mocked(db.query.users.findFirst).mockResolvedValueOnce(
        createMockUser({
          id: "user-123",
          email: "test@example.com",
          passwordResetCode: "123456",
          passwordResetExpires: new Date(Date.now() + 10 * 60 * 1000),
          passwordResetAttempts: 0,
          passwordResetLockoutUntil: null,
        })
      );

      const request = new Request("http://localhost/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          code: "000000", // Valid 6-digit format but wrong code
          newPassword: "NewSecure123",
          confirmPassword: "NewSecure123",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("INVALID_CODE");
      expect(data.error.message).toContain("attempt");
    });

    it("should lock account after 5 failed attempts", async () => {
      const { db } = await import("@/lib/db");
      vi.mocked(db.query.users.findFirst).mockResolvedValueOnce(
        createMockUser({
          id: "user-123",
          email: "test@example.com",
          passwordResetCode: "123456",
          passwordResetExpires: new Date(Date.now() + 10 * 60 * 1000),
          passwordResetAttempts: 4, // One more attempt will trigger lockout
          passwordResetLockoutUntil: null,
        })
      );

      const request = new Request("http://localhost/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          code: "000000", // Valid 6-digit format but wrong code
          newPassword: "NewSecure123",
          confirmPassword: "NewSecure123",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error.code).toBe("ACCOUNT_LOCKED");
      expect(data.error.message).toContain("locked for 15 minutes");
    });

    it("should reject if account is locked", async () => {
      const { db } = await import("@/lib/db");
      vi.mocked(db.query.users.findFirst).mockResolvedValueOnce(
        createMockUser({
          id: "user-123",
          email: "test@example.com",
          passwordResetCode: "123456",
          passwordResetExpires: new Date(Date.now() + 10 * 60 * 1000),
          passwordResetAttempts: 5,
          passwordResetLockoutUntil: new Date(Date.now() + 10 * 60 * 1000), // Locked for 10 more minutes
        })
      );

      const request = new Request("http://localhost/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          code: "123456",
          newPassword: "NewSecure123",
          confirmPassword: "NewSecure123",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error.code).toBe("ACCOUNT_LOCKED");
    });

    it("should reject expired code", async () => {
      const { db } = await import("@/lib/db");
      const { isTokenExpired } = await import("@/lib/auth/password");
      vi.mocked(isTokenExpired).mockReturnValueOnce(true);

      vi.mocked(db.query.users.findFirst).mockResolvedValueOnce(
        createMockUser({
          id: "user-123",
          email: "test@example.com",
          passwordResetCode: "123456",
          passwordResetExpires: new Date(Date.now() - 60 * 1000), // Expired 1 minute ago
          passwordResetAttempts: 0,
          passwordResetLockoutUntil: null,
        })
      );

      const request = new Request("http://localhost/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          code: "123456",
          newPassword: "NewSecure123",
          confirmPassword: "NewSecure123",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("CODE_EXPIRED");
    });

    it("should reject invalid email", async () => {
      const { db } = await import("@/lib/db");
      vi.mocked(db.query.users.findFirst).mockResolvedValueOnce(undefined);

      const request = new Request("http://localhost/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "nonexistent@example.com",
          code: "123456",
          newPassword: "NewSecure123",
          confirmPassword: "NewSecure123",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      // User not found returns INVALID_CODE (to prevent email enumeration)
      expect(data.error.code).toBe("INVALID_CODE");
    });

    it("should reject code that is not 6 digits", async () => {
      const request = new Request("http://localhost/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          code: "12345", // Only 5 digits
          newPassword: "NewSecure123",
          confirmPassword: "NewSecure123",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("POST /api/auth/reset-password - general cases", () => {
    it("should reject request without token or code", async () => {
      const request = new Request("http://localhost/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newPassword: "NewSecure123",
          confirmPassword: "NewSecure123",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.message).toContain("token or code");
    });
  });
});
