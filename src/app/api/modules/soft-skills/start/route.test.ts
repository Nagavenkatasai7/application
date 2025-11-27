import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

// Mock database
const mockInsert = vi.fn();
const mockUpdateWhere = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    insert: vi.fn(() => ({
      values: mockInsert,
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: mockUpdateWhere,
      })),
    })),
  },
  softSkills: "softSkills",
}));

vi.mock("@/lib/auth", () => ({
  getOrCreateLocalUser: vi.fn().mockResolvedValue({
    id: "user-123",
    email: "test@example.com",
    name: "Test User",
    createdAt: new Date(),
  }),
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((field, value) => ({ field, value })),
}));

// Mock AI service
vi.mock("@/lib/ai/soft-skills", () => ({
  startAssessment: vi.fn(),
  SoftSkillsError: class SoftSkillsError extends Error {
    code: string;
    constructor(message: string, code: string) {
      super(message);
      this.code = code;
      this.name = "SoftSkillsError";
    }
  },
}));

// Mock uuid
vi.mock("uuid", () => ({
  v4: vi.fn().mockReturnValue("test-skill-id"),
}));

import { startAssessment, SoftSkillsError } from "@/lib/ai/soft-skills";

const mockStartAssessment = vi.mocked(startAssessment);

const createRequest = (body: unknown): Request => {
  return new Request("http://localhost/api/modules/soft-skills/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
};

describe("Soft Skills Start API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsert.mockResolvedValue(undefined);
    mockUpdateWhere.mockResolvedValue(undefined);
  });

  describe("POST /api/modules/soft-skills/start", () => {
    it("should return 400 for invalid JSON", async () => {
      const request = new Request("http://localhost/api/modules/soft-skills/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "not json",
      });

      const response = await POST(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INVALID_JSON");
    });

    it("should return 400 for empty skill name", async () => {
      const response = await POST(createRequest({ skillName: "" }));

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 400 for missing skill name", async () => {
      const response = await POST(createRequest({}));

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 400 for skill name too long", async () => {
      const response = await POST(createRequest({ skillName: "A".repeat(101) }));

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should start assessment successfully", async () => {
      mockStartAssessment.mockResolvedValue({
        message: "Tell me about a time when you demonstrated leadership.",
        isComplete: false,
        questionNumber: 1,
        evidenceScore: null,
        statement: null,
      });

      const response = await POST(createRequest({ skillName: "Leadership" }));

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.skillId).toBe("test-skill-id");
      expect(data.data.message).toBe("Tell me about a time when you demonstrated leadership.");
      expect(data.data.questionNumber).toBe(1);
    });

    it("should handle AI not configured error", async () => {
      mockStartAssessment.mockRejectedValue(
        new SoftSkillsError("AI not configured", "AI_NOT_CONFIGURED")
      );

      const response = await POST(createRequest({ skillName: "Leadership" }));

      expect(response.status).toBe(503);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("AI_NOT_CONFIGURED");
    });

    it("should handle rate limit error", async () => {
      mockStartAssessment.mockRejectedValue(
        new SoftSkillsError("Rate limited", "RATE_LIMIT")
      );

      const response = await POST(createRequest({ skillName: "Leadership" }));

      expect(response.status).toBe(429);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("RATE_LIMIT");
    });

    it("should handle auth error", async () => {
      mockStartAssessment.mockRejectedValue(
        new SoftSkillsError("Invalid API key", "AUTH_ERROR")
      );

      const response = await POST(createRequest({ skillName: "Leadership" }));

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error.code).toBe("AUTH_ERROR");
    });

    it("should handle generic errors", async () => {
      mockStartAssessment.mockRejectedValue(new Error("Unknown error"));

      const response = await POST(createRequest({ skillName: "Leadership" }));

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("ASSESSMENT_ERROR");
    });

    it("should call startAssessment with correct skill name", async () => {
      mockStartAssessment.mockResolvedValue({
        message: "Question",
        isComplete: false,
        questionNumber: 1,
        evidenceScore: null,
        statement: null,
      });

      await POST(createRequest({ skillName: "Communication" }));

      expect(mockStartAssessment).toHaveBeenCalledWith("Communication");
    });
  });
});
