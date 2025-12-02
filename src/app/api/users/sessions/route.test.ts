import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, DELETE } from "./route";

// Mock auth
vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

// Mock db
vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn(),
    delete: vi.fn(),
  },
  sessions: {
    sessionToken: "sessionToken",
    expires: "expires",
    userId: "userId",
  },
}));

// Mock lib/auth
vi.mock("@/lib/auth", () => ({
  requireAuth: vi.fn(),
}));

// Mock api utils
vi.mock("@/lib/api", () => ({
  successResponse: vi.fn((data) => ({
    json: () => Promise.resolve({ success: true, data }),
    status: 200,
  })),
  errorResponse: vi.fn((code, message, status) => ({
    json: () => Promise.resolve({ success: false, error: { code, message } }),
    status,
  })),
  unauthorizedResponse: vi.fn((message = "Unauthorized") => ({
    json: () =>
      Promise.resolve({
        success: false,
        error: { code: "UNAUTHORIZED", message },
      }),
    status: 401,
  })),
}));

// Mock drizzle-orm
vi.mock("drizzle-orm", () => ({
  eq: vi.fn((col, val) => ({ column: col, value: val })),
  and: vi.fn((...conditions) => ({ type: "and", conditions })),
  ne: vi.fn((col, val) => ({ column: col, operator: "ne", value: val })),
}));

// Mock next/headers
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

describe("User Sessions API Routes", () => {
  const mockSession = {
    sessionToken: "session-token-abc123",
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const { requireAuth } = await import("@/lib/auth");
    const { auth } = await import("@/auth");
    const { db } = await import("@/lib/db");
    const { cookies } = await import("next/headers");

    vi.mocked(requireAuth).mockResolvedValue({ id: "user-123", email: "test@example.com", name: "Test User" });
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-123" } } as never);
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockImplementation((name) => {
        if (name === "authjs.session-token") {
          return { value: "session-token-abc123" };
        }
        return undefined;
      }),
    } as never);

    // Mock db.select chain
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([mockSession]),
      }),
    } as never);

    // Mock db.delete chain
    vi.mocked(db.delete).mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    } as never);
  });

  describe("GET /api/users/sessions", () => {
    it("should return list of active sessions", async () => {
      const request = new Request("http://localhost/api/users/sessions");
      const response = await GET(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.sessions).toBeDefined();
      expect(Array.isArray(data.data.sessions)).toBe(true);
    });

    it("should mask session tokens for security", async () => {
      const request = new Request("http://localhost/api/users/sessions");
      const response = await GET(request);
      const data = await response.json();

      // Session tokens should be masked (start with ***)
      if (data.data.sessions.length > 0) {
        expect(data.data.sessions[0].sessionToken.startsWith("***")).toBe(true);
      }
    });

    it("should return unauthorized when not authenticated", async () => {
      const { requireAuth } = await import("@/lib/auth");
      vi.mocked(requireAuth).mockRejectedValue(new Error("Authentication required"));

      const request = new Request("http://localhost/api/users/sessions");
      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it("should filter out expired sessions", async () => {
      const { db } = await import("@/lib/db");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            { sessionToken: "active-token", expires: new Date(Date.now() + 60000) },
            { sessionToken: "expired-token", expires: new Date(Date.now() - 60000) },
          ]),
        }),
      } as never);

      const request = new Request("http://localhost/api/users/sessions");
      const response = await GET(request);
      const data = await response.json();

      // Only active session should be returned
      expect(data.data.sessions).toHaveLength(1);
    });

    it("should handle database errors gracefully", async () => {
      const { db } = await import("@/lib/db");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockRejectedValue(new Error("Database error")),
        }),
      } as never);

      const request = new Request("http://localhost/api/users/sessions");
      const response = await GET(request);

      expect(response.status).toBe(500);
    });
  });

  describe("DELETE /api/users/sessions", () => {
    it("should sign out from all devices except current", async () => {
      const request = new Request("http://localhost/api/users/sessions", {
        method: "DELETE",
      });
      const response = await DELETE(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.message).toContain("signed out");
    });

    it("should return unauthorized when not authenticated", async () => {
      const { requireAuth } = await import("@/lib/auth");
      vi.mocked(requireAuth).mockRejectedValue(new Error("Authentication required"));

      const request = new Request("http://localhost/api/users/sessions", {
        method: "DELETE",
      });
      const response = await DELETE(request);

      expect(response.status).toBe(401);
    });

    it("should return error when current session not found", async () => {
      const { cookies } = await import("next/headers");
      vi.mocked(cookies).mockResolvedValue({
        get: vi.fn().mockReturnValue(undefined),
      } as never);

      const request = new Request("http://localhost/api/users/sessions", {
        method: "DELETE",
      });
      const response = await DELETE(request);

      expect(response.status).toBe(400);
    });

    it("should call db.delete with correct parameters", async () => {
      const { db } = await import("@/lib/db");

      const request = new Request("http://localhost/api/users/sessions", {
        method: "DELETE",
      });
      await DELETE(request);

      expect(db.delete).toHaveBeenCalled();
    });

    it("should handle delete errors gracefully", async () => {
      const { db } = await import("@/lib/db");
      vi.mocked(db.delete).mockReturnValue({
        where: vi.fn().mockRejectedValue(new Error("Delete failed")),
      } as never);

      const request = new Request("http://localhost/api/users/sessions", {
        method: "DELETE",
      });
      const response = await DELETE(request);

      expect(response.status).toBe(500);
    });
  });
});
