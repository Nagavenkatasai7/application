import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { createMockUser } from "@/test/factories";

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
    },
  };
});

// Mock users schema
vi.mock("@/lib/db/schema", () => ({
  users: {
    emailVerificationToken: "emailVerificationToken",
    emailVerificationExpires: "emailVerificationExpires",
    id: "id",
  },
}));

describe("Verify Email API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/auth/verify-email", () => {
    it("should verify email successfully with valid token", async () => {
      const { db } = await import("@/lib/db");
      vi.mocked(db.query.users.findFirst).mockResolvedValueOnce(
        createMockUser({
          id: "user-123",
          email: "test@example.com",
          emailVerificationToken: "valid_token_123",
          emailVerificationExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        })
      );

      const request = new Request("http://localhost/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: "valid_token_123",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.verified).toBe(true);
      expect(data.data.message).toContain("verified successfully");
    });

    it("should reject missing token", async () => {
      const request = new Request("http://localhost/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should reject empty token", async () => {
      const request = new Request("http://localhost/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: "",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should reject invalid token", async () => {
      const { db } = await import("@/lib/db");
      vi.mocked(db.query.users.findFirst).mockResolvedValueOnce(undefined);

      const request = new Request("http://localhost/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: "invalid_token_xyz",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("INVALID_TOKEN");
      expect(data.error.message).toContain("Invalid or expired");
    });

    it("should reject expired token", async () => {
      const { db } = await import("@/lib/db");
      // The query itself filters out expired tokens, so finding nothing means expired/invalid
      vi.mocked(db.query.users.findFirst).mockResolvedValueOnce(undefined);

      const request = new Request("http://localhost/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: "expired_token_123",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("INVALID_TOKEN");
    });

    it("should clear verification token after successful verification", async () => {
      const { db } = await import("@/lib/db");
      vi.mocked(db.query.users.findFirst).mockResolvedValueOnce(
        createMockUser({
          id: "user-123",
          email: "test@example.com",
          emailVerificationToken: "valid_token_123",
          emailVerificationExpires: new Date(Date.now() + 60 * 60 * 1000),
        })
      );

      const request = new Request("http://localhost/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: "valid_token_123",
        }),
      });

      await POST(request);

      // Verify db.update was called
      expect(db.update).toHaveBeenCalled();
    });

    it("should handle database errors gracefully", async () => {
      const { db } = await import("@/lib/db");
      vi.mocked(db.query.users.findFirst).mockRejectedValueOnce(
        new Error("Database connection failed")
      );

      const request = new Request("http://localhost/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: "some_token",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.code).toBe("VERIFICATION_ERROR");
    });
  });
});
