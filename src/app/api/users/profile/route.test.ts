import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, PATCH } from "./route";

// Mock auth module
vi.mock("@/lib/auth", () => ({
  requireAuth: vi.fn(),
  getUserById: vi.fn(),
  updateUserProfile: vi.fn(),
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

describe("User Profile API Routes", () => {
  const mockUser = {
    id: "user-123",
    email: "test@example.com",
    name: "Test User",
    emailVerified: new Date(),
    image: null,
    profilePictureUrl: null,
    jobTitle: "Software Engineer",
    experienceLevel: "mid_senior",
    skills: ["TypeScript", "React"],
    preferredIndustries: ["Tech"],
    city: "San Francisco",
    country: "USA",
    bio: "A developer",
    linkedinUrl: "https://linkedin.com/in/test",
    githubUrl: "https://github.com/test",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const { requireAuth, getUserById, updateUserProfile } = await import("@/lib/auth");
    vi.mocked(requireAuth).mockResolvedValue({ id: "user-123", email: "test@example.com", name: "Test User" });
    vi.mocked(getUserById).mockResolvedValue(mockUser as never);
    vi.mocked(updateUserProfile).mockResolvedValue(mockUser as never);
  });

  describe("GET /api/users/profile", () => {
    it("should return user profile successfully", async () => {
      const response = await GET();
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.id).toBe("user-123");
      expect(data.data.email).toBe("test@example.com");
      expect(data.data.name).toBe("Test User");
    });

    it("should return unauthorized when not authenticated", async () => {
      const { requireAuth } = await import("@/lib/auth");
      vi.mocked(requireAuth).mockRejectedValue(new Error("Authentication required"));

      const response = await GET();

      expect(response.status).toBe(401);
    });

    it("should return unauthorized when user not found", async () => {
      const { getUserById } = await import("@/lib/auth");
      vi.mocked(getUserById).mockResolvedValue(null);

      const response = await GET();

      expect(response.status).toBe(401);
    });

    it("should include all profile fields in response", async () => {
      const response = await GET();
      const data = await response.json();

      expect(data.data).toHaveProperty("jobTitle");
      expect(data.data).toHaveProperty("experienceLevel");
      expect(data.data).toHaveProperty("skills");
      expect(data.data).toHaveProperty("preferredIndustries");
      expect(data.data).toHaveProperty("city");
      expect(data.data).toHaveProperty("country");
      expect(data.data).toHaveProperty("bio");
      expect(data.data).toHaveProperty("linkedinUrl");
      expect(data.data).toHaveProperty("githubUrl");
    });

    it("should handle errors gracefully", async () => {
      const { getUserById } = await import("@/lib/auth");
      vi.mocked(getUserById).mockRejectedValue(new Error("Database error"));

      const response = await GET();

      expect(response.status).toBe(500);
    });
  });

  describe("PATCH /api/users/profile", () => {
    it("should update profile successfully", async () => {
      const { parseRequestBody, successResponse } = await import("@/lib/api");
      vi.mocked(parseRequestBody).mockResolvedValue({
        success: true,
        data: { name: "Updated Name" },
      });

      const request = new Request("http://localhost/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Updated Name" }),
      });

      const response = await PATCH(request);

      expect(response.status).toBe(200);
      expect(successResponse).toHaveBeenCalled();
    });

    it("should return unauthorized when not authenticated", async () => {
      const { requireAuth } = await import("@/lib/auth");
      vi.mocked(requireAuth).mockRejectedValue(new Error("Authentication required"));

      const request = new Request("http://localhost/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Updated Name" }),
      });

      const response = await PATCH(request);

      expect(response.status).toBe(401);
    });

    it("should return validation error for invalid data", async () => {
      const { parseRequestBody } = await import("@/lib/api");
      vi.mocked(parseRequestBody).mockResolvedValue({
        success: false,
        response: {
          json: () =>
            Promise.resolve({
              success: false,
              error: { code: "VALIDATION_ERROR", message: "Invalid data" },
            }),
          status: 400,
        } as never,
      });

      const request = new Request("http://localhost/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invalidField: "value" }),
      });

      const response = await PATCH(request);

      expect(response.status).toBe(400);
    });

    it("should return error when update fails", async () => {
      const { parseRequestBody } = await import("@/lib/api");
      const { updateUserProfile } = await import("@/lib/auth");
      vi.mocked(parseRequestBody).mockResolvedValue({
        success: true,
        data: { name: "Updated Name" },
      });
      vi.mocked(updateUserProfile).mockResolvedValue(null);

      const request = new Request("http://localhost/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Updated Name" }),
      });

      const response = await PATCH(request);

      expect(response.status).toBe(500);
    });

    it("should handle errors gracefully", async () => {
      const { parseRequestBody } = await import("@/lib/api");
      vi.mocked(parseRequestBody).mockRejectedValue(new Error("Parse error"));

      const request = new Request("http://localhost/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Updated Name" }),
      });

      const response = await PATCH(request);

      expect(response.status).toBe(500);
    });
  });
});
