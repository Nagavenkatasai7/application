import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

// Mock database
const mockSoftSkillWhere = vi.fn();
const mockUpdateWhere = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: mockSoftSkillWhere,
      })),
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
  and: vi.fn((...conditions) => conditions),
}));

// Mock AI service
vi.mock("@/lib/ai/soft-skills", () => ({
  continueAssessment: vi.fn(),
  SoftSkillsError: class SoftSkillsError extends Error {
    code: string;
    constructor(message: string, code: string) {
      super(message);
      this.code = code;
      this.name = "SoftSkillsError";
    }
  },
}));

import { continueAssessment, SoftSkillsError } from "@/lib/ai/soft-skills";

const mockContinueAssessment = vi.mocked(continueAssessment);

const createRequest = (body: unknown): Request => {
  return new Request("http://localhost/api/modules/soft-skills/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
};

const createMockSoftSkill = (overrides = {}) => ({
  id: "550e8400-e29b-41d4-a716-446655440000",
  userId: "user-123",
  skillName: "Leadership",
  evidenceScore: null,
  conversation: [
    { role: "assistant", content: "Tell me about your leadership experience." },
  ],
  statement: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe("Soft Skills Chat API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateWhere.mockResolvedValue(undefined);
  });

  describe("POST /api/modules/soft-skills/chat", () => {
    it("should return 400 for invalid JSON", async () => {
      const request = new Request("http://localhost/api/modules/soft-skills/chat", {
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

    it("should return 400 for invalid skill ID", async () => {
      const response = await POST(
        createRequest({
          skillId: "not-a-uuid",
          message: "My response",
        })
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 400 for empty message", async () => {
      const response = await POST(
        createRequest({
          skillId: "550e8400-e29b-41d4-a716-446655440000",
          message: "",
        })
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 400 for message too long", async () => {
      const response = await POST(
        createRequest({
          skillId: "550e8400-e29b-41d4-a716-446655440000",
          message: "A".repeat(2001),
        })
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 404 when soft skill not found", async () => {
      mockSoftSkillWhere.mockResolvedValue([]);

      const response = await POST(
        createRequest({
          skillId: "550e8400-e29b-41d4-a716-446655440000",
          message: "My response",
        })
      );

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("SKILL_NOT_FOUND");
    });

    it("should return 400 when assessment already complete", async () => {
      mockSoftSkillWhere.mockResolvedValue([
        createMockSoftSkill({
          evidenceScore: 4,
          statement: "Strong leadership skills.",
        }),
      ]);

      const response = await POST(
        createRequest({
          skillId: "550e8400-e29b-41d4-a716-446655440000",
          message: "My response",
        })
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("ALREADY_COMPLETE");
    });

    it("should continue assessment successfully", async () => {
      mockSoftSkillWhere.mockResolvedValue([createMockSoftSkill()]);
      mockContinueAssessment.mockResolvedValue({
        message: "That's great! Tell me more about the outcome.",
        isComplete: false,
        questionNumber: 2,
        evidenceScore: null,
        statement: null,
      });

      const response = await POST(
        createRequest({
          skillId: "550e8400-e29b-41d4-a716-446655440000",
          message: "I led a team of 5 engineers.",
        })
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.message).toBe("That's great! Tell me more about the outcome.");
      expect(data.data.isComplete).toBe(false);
      expect(data.data.questionNumber).toBe(2);
    });

    it("should return complete assessment with score and statement", async () => {
      mockSoftSkillWhere.mockResolvedValue([
        createMockSoftSkill({
          conversation: [
            { role: "assistant", content: "Question 1" },
            { role: "user", content: "Answer 1" },
            { role: "assistant", content: "Question 2" },
            { role: "user", content: "Answer 2" },
            { role: "assistant", content: "Question 3" },
          ],
        }),
      ]);
      mockContinueAssessment.mockResolvedValue({
        message: "Great conversation! Here is your assessment.",
        isComplete: true,
        questionNumber: 5,
        evidenceScore: 4,
        statement: "Demonstrated exceptional leadership skills.",
      });

      const response = await POST(
        createRequest({
          skillId: "550e8400-e29b-41d4-a716-446655440000",
          message: "Final answer",
        })
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.isComplete).toBe(true);
      expect(data.data.evidenceScore).toBe(4);
      expect(data.data.statement).toBe("Demonstrated exceptional leadership skills.");
    });

    it("should handle AI not configured error", async () => {
      mockSoftSkillWhere.mockResolvedValue([createMockSoftSkill()]);
      mockContinueAssessment.mockRejectedValue(
        new SoftSkillsError("AI not configured", "AI_NOT_CONFIGURED")
      );

      const response = await POST(
        createRequest({
          skillId: "550e8400-e29b-41d4-a716-446655440000",
          message: "My response",
        })
      );

      expect(response.status).toBe(503);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("AI_NOT_CONFIGURED");
    });

    it("should handle rate limit error", async () => {
      mockSoftSkillWhere.mockResolvedValue([createMockSoftSkill()]);
      mockContinueAssessment.mockRejectedValue(
        new SoftSkillsError("Rate limited", "RATE_LIMIT")
      );

      const response = await POST(
        createRequest({
          skillId: "550e8400-e29b-41d4-a716-446655440000",
          message: "My response",
        })
      );

      expect(response.status).toBe(429);
      const data = await response.json();
      expect(data.error.code).toBe("RATE_LIMIT");
    });

    it("should handle generic errors", async () => {
      mockSoftSkillWhere.mockResolvedValue([createMockSoftSkill()]);
      mockContinueAssessment.mockRejectedValue(new Error("Unknown error"));

      const response = await POST(
        createRequest({
          skillId: "550e8400-e29b-41d4-a716-446655440000",
          message: "My response",
        })
      );

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("CHAT_ERROR");
    });

    it("should call continueAssessment with correct parameters", async () => {
      const conversation = [
        { role: "assistant" as const, content: "Question 1" },
        { role: "user" as const, content: "Answer 1" },
      ];

      mockSoftSkillWhere.mockResolvedValue([
        createMockSoftSkill({ conversation }),
      ]);
      mockContinueAssessment.mockResolvedValue({
        message: "Follow-up question",
        isComplete: false,
        questionNumber: 2,
        evidenceScore: null,
        statement: null,
      });

      await POST(
        createRequest({
          skillId: "550e8400-e29b-41d4-a716-446655440000",
          message: "New response",
        })
      );

      expect(mockContinueAssessment).toHaveBeenCalledWith(
        "Leadership",
        conversation,
        "New response",
        1 // Number of assistant messages
      );
    });
  });
});
