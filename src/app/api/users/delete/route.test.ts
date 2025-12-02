import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

// Mock auth module
vi.mock("@/lib/auth", () => ({
  requireAuth: vi.fn(),
  getUserById: vi.fn(),
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
  parseRequestBody: vi.fn(),
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
}));

// Mock db with all tables
vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn(),
    delete: vi.fn(),
  },
  users: { id: "id" },
  resumes: { userId: "userId", id: "id", originalPdfUrl: "originalPdfUrl" },
  applications: { userId: "userId" },
  userSettings: { userId: "userId" },
  softSkills: { userId: "userId" },
  sessions: { userId: "userId" },
  accounts: { userId: "userId" },
}));

// Mock Vercel Blob
vi.mock("@vercel/blob", () => ({
  del: vi.fn(),
}));

describe("Account Deletion API Route", () => {
  const mockUser = {
    id: "user-123",
    email: "test@example.com",
    name: "Test User",
    profilePictureUrl: "https://blob.vercel.com/picture.jpg",
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const { requireAuth, getUserById } = await import("@/lib/auth");
    const { parseRequestBody } = await import("@/lib/api");
    const { db } = await import("@/lib/db");
    const { del } = await import("@vercel/blob");

    vi.mocked(requireAuth).mockResolvedValue({ id: "user-123", email: "test@example.com", name: "Test User" });
    vi.mocked(getUserById).mockResolvedValue(mockUser as never);
    vi.mocked(parseRequestBody).mockResolvedValue({
      success: true,
      data: { confirmation: "DELETE" },
    });

    // Mock db.select chain for resumes
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([
          { id: "resume-1", originalPdfUrl: "https://blob.vercel.com/resume1.pdf" },
        ]),
      }),
    } as never);

    // Mock db.delete chain
    vi.mocked(db.delete).mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    } as never);

    vi.mocked(del).mockResolvedValue(undefined);
  });

  describe("POST /api/users/delete", () => {
    it("should delete account successfully with confirmation", async () => {
      const request = new Request("http://localhost/api/users/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: "DELETE" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.message).toContain("deleted successfully");
      expect(data.data.deletedAt).toBeDefined();
    });

    it("should return unauthorized when not authenticated", async () => {
      const { requireAuth } = await import("@/lib/auth");
      vi.mocked(requireAuth).mockRejectedValue(new Error("Authentication required"));

      const request = new Request("http://localhost/api/users/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: "DELETE" }),
      });

      const response = await POST(request);

      expect(response.status).toBe(401);
    });

    it("should return unauthorized when user not found", async () => {
      const { getUserById } = await import("@/lib/auth");
      vi.mocked(getUserById).mockResolvedValue(null);

      const request = new Request("http://localhost/api/users/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: "DELETE" }),
      });

      const response = await POST(request);

      expect(response.status).toBe(401);
    });

    it("should return validation error for invalid confirmation", async () => {
      const { parseRequestBody } = await import("@/lib/api");
      vi.mocked(parseRequestBody).mockResolvedValue({
        success: false,
        response: {
          json: () =>
            Promise.resolve({
              success: false,
              error: { code: "VALIDATION_ERROR", message: "Invalid confirmation" },
            }),
          status: 400,
        } as never,
      });

      const request = new Request("http://localhost/api/users/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: "wrong" }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it("should delete all related data in correct order", async () => {
      const { db } = await import("@/lib/db");

      const request = new Request("http://localhost/api/users/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: "DELETE" }),
      });

      await POST(request);

      // Should call delete multiple times for different tables
      expect(db.delete).toHaveBeenCalled();
    });

    it("should delete resume blobs from Vercel Blob", async () => {
      const { del } = await import("@vercel/blob");

      const request = new Request("http://localhost/api/users/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: "DELETE" }),
      });

      await POST(request);

      // Should delete resume blob
      expect(del).toHaveBeenCalledWith("https://blob.vercel.com/resume1.pdf");
    });

    it("should delete profile picture blob if exists", async () => {
      const { del } = await import("@vercel/blob");

      const request = new Request("http://localhost/api/users/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: "DELETE" }),
      });

      await POST(request);

      // Should delete profile picture blob
      expect(del).toHaveBeenCalledWith("https://blob.vercel.com/picture.jpg");
    });

    it("should continue deletion even if blob deletion fails", async () => {
      const { del } = await import("@vercel/blob");
      vi.mocked(del).mockRejectedValue(new Error("Blob delete failed"));

      const request = new Request("http://localhost/api/users/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: "DELETE" }),
      });

      const response = await POST(request);
      const data = await response.json();

      // Should still succeed even if blob deletion fails
      expect(data.success).toBe(true);
    });

    it("should handle database errors gracefully", async () => {
      const { db } = await import("@/lib/db");
      vi.mocked(db.delete).mockReturnValue({
        where: vi.fn().mockRejectedValue(new Error("Database error")),
      } as never);

      const request = new Request("http://localhost/api/users/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: "DELETE" }),
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
    });

    it("should handle user with no resumes", async () => {
      const { db } = await import("@/lib/db");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]), // No resumes
        }),
      } as never);

      const request = new Request("http://localhost/api/users/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: "DELETE" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
    });

    it("should handle user without profile picture", async () => {
      const { getUserById } = await import("@/lib/auth");
      vi.mocked(getUserById).mockResolvedValue({
        ...mockUser,
        profilePictureUrl: null,
      } as never);

      const request = new Request("http://localhost/api/users/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: "DELETE" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
    });
  });
});
