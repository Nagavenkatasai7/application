/**
 * Tests for API Response Utilities
 */

import { describe, it, expect } from "vitest";
import {
  successResponse,
  successWithMeta,
  errorResponse,
  notFoundResponse,
  validationErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  rateLimitResponse,
} from "./responses";

describe("API Response Utilities", () => {
  describe("successResponse", () => {
    it("should return success response with data", async () => {
      const data = { id: "123", name: "Test" };
      const response = successResponse(data);

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json).toEqual({ success: true, data });
    });

    it("should accept custom status code", async () => {
      const data = { id: "123" };
      const response = successResponse(data, 201);

      expect(response.status).toBe(201);
      const json = await response.json();
      expect(json.success).toBe(true);
    });

    it("should handle array data", async () => {
      const data = [{ id: "1" }, { id: "2" }];
      const response = successResponse(data);

      const json = await response.json();
      expect(json.data).toHaveLength(2);
    });

    it("should handle null data", async () => {
      const response = successResponse(null);

      const json = await response.json();
      expect(json.data).toBeNull();
    });
  });

  describe("successWithMeta", () => {
    it("should return success response with data and metadata", async () => {
      const data = [{ id: "1" }, { id: "2" }];
      const meta = { limit: 10, offset: 0, total: 50 };
      const response = successWithMeta(data, meta);

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json).toEqual({ success: true, data, meta });
    });

    it("should accept custom status code", async () => {
      const data = [{ id: "1" }];
      const meta = { limit: 10, offset: 0, total: 1 };
      const response = successWithMeta(data, meta, 201);

      expect(response.status).toBe(201);
    });
  });

  describe("errorResponse", () => {
    it("should return error response with code and message", async () => {
      const response = errorResponse("TEST_ERROR", "Test error message");

      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json).toEqual({
        success: false,
        error: { code: "TEST_ERROR", message: "Test error message" },
      });
    });

    it("should accept custom status code", async () => {
      const response = errorResponse("BAD_REQUEST", "Invalid input", 400);

      expect(response.status).toBe(400);
    });
  });

  describe("notFoundResponse", () => {
    it("should return 404 not found response", async () => {
      const response = notFoundResponse("User");

      expect(response.status).toBe(404);
      const json = await response.json();
      expect(json).toEqual({
        success: false,
        error: { code: "NOT_FOUND", message: "User not found" },
      });
    });

    it("should include resource name in message", async () => {
      const response = notFoundResponse("Resume");

      const json = await response.json();
      expect(json.error.message).toBe("Resume not found");
    });
  });

  describe("validationErrorResponse", () => {
    it("should return 400 validation error response", async () => {
      const response = validationErrorResponse("Email is required");

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json).toEqual({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Email is required" },
      });
    });
  });

  describe("unauthorizedResponse", () => {
    it("should return 401 unauthorized response with default message", async () => {
      const response = unauthorizedResponse();

      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json).toEqual({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Unauthorized" },
      });
    });

    it("should accept custom message", async () => {
      const response = unauthorizedResponse("Invalid token");

      const json = await response.json();
      expect(json.error.message).toBe("Invalid token");
    });
  });

  describe("forbiddenResponse", () => {
    it("should return 403 forbidden response with default message", async () => {
      const response = forbiddenResponse();

      expect(response.status).toBe(403);
      const json = await response.json();
      expect(json).toEqual({
        success: false,
        error: { code: "FORBIDDEN", message: "Forbidden" },
      });
    });

    it("should accept custom message", async () => {
      const response = forbiddenResponse("Access denied");

      const json = await response.json();
      expect(json.error.message).toBe("Access denied");
    });
  });

  describe("rateLimitResponse", () => {
    it("should return 429 rate limit response", async () => {
      const response = rateLimitResponse();

      expect(response.status).toBe(429);
      const json = await response.json();
      expect(json).toEqual({
        success: false,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Too many requests. Please try again later.",
        },
      });
    });

    it("should include Retry-After header when provided", async () => {
      const response = rateLimitResponse(60);

      expect(response.status).toBe(429);
      expect(response.headers.get("Retry-After")).toBe("60");
    });

    it("should not include Retry-After header when not provided", async () => {
      const response = rateLimitResponse();

      expect(response.headers.get("Retry-After")).toBeNull();
    });
  });
});
