import { describe, it, expect } from "vitest";
import {
  applicationStatusEnum,
  createApplicationSchema,
  updateApplicationSchema,
  applicationResponseSchema,
  APPLICATION_STATUSES,
  getStatusLabel,
  getStatusColor,
  getStatusBgColor,
  getStatusIcon,
  getStatusDescription,
  getNextStatuses,
  isValidStatusTransition,
  type ApplicationStatus,
} from "./application";

describe("Application Validation Schemas", () => {
  describe("applicationStatusEnum", () => {
    it("should accept valid statuses", () => {
      const validStatuses: ApplicationStatus[] = [
        "saved",
        "applied",
        "interviewing",
        "offered",
        "rejected",
      ];

      validStatuses.forEach((status) => {
        const result = applicationStatusEnum.safeParse(status);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid statuses", () => {
      const result = applicationStatusEnum.safeParse("invalid_status");
      expect(result.success).toBe(false);
    });
  });

  describe("APPLICATION_STATUSES constant", () => {
    it("should contain all valid statuses", () => {
      expect(APPLICATION_STATUSES).toEqual([
        "saved",
        "applied",
        "interviewing",
        "offered",
        "rejected",
      ]);
    });

    it("should have correct length", () => {
      expect(APPLICATION_STATUSES.length).toBe(5);
    });
  });

  describe("createApplicationSchema", () => {
    describe("required fields", () => {
      it("should require jobId", () => {
        const result = createApplicationSchema.safeParse({});
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain("jobId");
        }
      });

      it("should reject empty jobId", () => {
        const result = createApplicationSchema.safeParse({
          jobId: "",
        });
        expect(result.success).toBe(false);
      });
    });

    describe("valid input", () => {
      it("should accept valid minimal input", () => {
        const input = {
          jobId: "job-123",
        };
        const result = createApplicationSchema.safeParse(input);
        expect(result.success).toBe(true);
      });

      it("should accept valid complete input", () => {
        const input = {
          jobId: "job-123",
          resumeId: "resume-456",
          status: "applied" as const,
          appliedAt: new Date(),
          notes: "Great opportunity",
        };
        const result = createApplicationSchema.safeParse(input);
        expect(result.success).toBe(true);
      });
    });

    describe("default values", () => {
      it("should default status to saved", () => {
        const result = createApplicationSchema.parse({
          jobId: "job-123",
        });
        expect(result.status).toBe("saved");
      });
    });

    describe("field validation", () => {
      it("should accept valid status", () => {
        APPLICATION_STATUSES.forEach((status) => {
          const result = createApplicationSchema.safeParse({
            jobId: "job-123",
            status,
          });
          expect(result.success).toBe(true);
        });
      });

      it("should reject invalid status", () => {
        const result = createApplicationSchema.safeParse({
          jobId: "job-123",
          status: "invalid",
        });
        expect(result.success).toBe(false);
      });

      it("should reject notes exceeding max length", () => {
        const result = createApplicationSchema.safeParse({
          jobId: "job-123",
          notes: "a".repeat(5001),
        });
        expect(result.success).toBe(false);
      });

      it("should accept notes at max length", () => {
        const result = createApplicationSchema.safeParse({
          jobId: "job-123",
          notes: "a".repeat(5000),
        });
        expect(result.success).toBe(true);
      });
    });
  });

  describe("updateApplicationSchema", () => {
    it("should accept valid status update", () => {
      const result = updateApplicationSchema.safeParse({
        status: "applied",
      });
      expect(result.success).toBe(true);
    });

    it("should accept valid resumeId update", () => {
      const result = updateApplicationSchema.safeParse({
        resumeId: "resume-123",
      });
      expect(result.success).toBe(true);
    });

    it("should accept nullable resumeId", () => {
      const result = updateApplicationSchema.safeParse({
        resumeId: null,
      });
      expect(result.success).toBe(true);
    });

    it("should accept valid appliedAt update", () => {
      const result = updateApplicationSchema.safeParse({
        appliedAt: new Date(),
      });
      expect(result.success).toBe(true);
    });

    it("should accept nullable appliedAt", () => {
      const result = updateApplicationSchema.safeParse({
        appliedAt: null,
      });
      expect(result.success).toBe(true);
    });

    it("should accept valid notes update", () => {
      const result = updateApplicationSchema.safeParse({
        notes: "Updated notes",
      });
      expect(result.success).toBe(true);
    });

    it("should accept nullable notes", () => {
      const result = updateApplicationSchema.safeParse({
        notes: null,
      });
      expect(result.success).toBe(true);
    });

    it("should reject notes exceeding max length", () => {
      const result = updateApplicationSchema.safeParse({
        notes: "a".repeat(5001),
      });
      expect(result.success).toBe(false);
    });

    it("should accept empty object (no updates)", () => {
      const result = updateApplicationSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("should reject invalid status", () => {
      const result = updateApplicationSchema.safeParse({
        status: "invalid",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("applicationResponseSchema", () => {
    const validResponse = {
      id: "app-123",
      userId: "user-456",
      jobId: "job-789",
      resumeId: "resume-abc",
      status: "applied" as const,
      appliedAt: 1700000000,
      notes: "Application notes",
      createdAt: 1700000001,
      updatedAt: 1700000002,
    };

    it("should validate a complete application response", () => {
      const result = applicationResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it("should allow nullable fields", () => {
      const response = {
        id: "app-123",
        userId: "user-456",
        jobId: "job-789",
        resumeId: null,
        status: "saved" as const,
        appliedAt: null,
        notes: null,
        createdAt: null,
        updatedAt: null,
      };
      const result = applicationResponseSchema.safeParse(response);
      expect(result.success).toBe(true);
    });

    it("should require id field", () => {
      const { id: _id, ...responseWithoutId } = validResponse;
      void _id;
      const result = applicationResponseSchema.safeParse(responseWithoutId);
      expect(result.success).toBe(false);
    });

    it("should require userId field", () => {
      const { userId: _userId, ...responseWithoutUserId } = validResponse;
      void _userId;
      const result = applicationResponseSchema.safeParse(responseWithoutUserId);
      expect(result.success).toBe(false);
    });

    it("should require jobId field", () => {
      const { jobId: _jobId, ...responseWithoutJobId } = validResponse;
      void _jobId;
      const result = applicationResponseSchema.safeParse(responseWithoutJobId);
      expect(result.success).toBe(false);
    });

    it("should require valid status", () => {
      const response = {
        ...validResponse,
        status: "invalid",
      };
      const result = applicationResponseSchema.safeParse(response);
      expect(result.success).toBe(false);
    });
  });

  describe("getStatusLabel", () => {
    it("should return correct labels for all statuses", () => {
      expect(getStatusLabel("saved")).toBe("Saved");
      expect(getStatusLabel("applied")).toBe("Applied");
      expect(getStatusLabel("interviewing")).toBe("Interviewing");
      expect(getStatusLabel("offered")).toBe("Offered");
      expect(getStatusLabel("rejected")).toBe("Rejected");
    });
  });

  describe("getStatusColor", () => {
    it("should return correct text colors for all statuses", () => {
      expect(getStatusColor("saved")).toBe("text-slate-500");
      expect(getStatusColor("applied")).toBe("text-blue-500");
      expect(getStatusColor("interviewing")).toBe("text-amber-500");
      expect(getStatusColor("offered")).toBe("text-green-500");
      expect(getStatusColor("rejected")).toBe("text-red-500");
    });
  });

  describe("getStatusBgColor", () => {
    it("should return background color classes for all statuses", () => {
      APPLICATION_STATUSES.forEach((status) => {
        const result = getStatusBgColor(status);
        expect(result).toContain("bg-");
        expect(result).toContain("border-");
        expect(result).toContain("text-");
      });
    });

    it("should return correct background colors", () => {
      expect(getStatusBgColor("saved")).toContain("bg-slate-500/10");
      expect(getStatusBgColor("applied")).toContain("bg-blue-500/10");
      expect(getStatusBgColor("interviewing")).toContain("bg-amber-500/10");
      expect(getStatusBgColor("offered")).toContain("bg-green-500/10");
      expect(getStatusBgColor("rejected")).toContain("bg-red-500/10");
    });
  });

  describe("getStatusIcon", () => {
    it("should return correct icon names for all statuses", () => {
      expect(getStatusIcon("saved")).toBe("Bookmark");
      expect(getStatusIcon("applied")).toBe("Send");
      expect(getStatusIcon("interviewing")).toBe("Calendar");
      expect(getStatusIcon("offered")).toBe("Trophy");
      expect(getStatusIcon("rejected")).toBe("XCircle");
    });
  });

  describe("getStatusDescription", () => {
    it("should return descriptions for all statuses", () => {
      APPLICATION_STATUSES.forEach((status) => {
        const description = getStatusDescription(status);
        expect(typeof description).toBe("string");
        expect(description.length).toBeGreaterThan(0);
      });
    });

    it("should return correct descriptions", () => {
      expect(getStatusDescription("saved")).toContain("saved");
      expect(getStatusDescription("applied")).toContain("submitted");
      expect(getStatusDescription("interviewing")).toContain("interview");
      expect(getStatusDescription("offered")).toContain("offer");
      expect(getStatusDescription("rejected")).toContain("not successful");
    });
  });

  describe("getNextStatuses", () => {
    it("should return correct next statuses for saved", () => {
      const next = getNextStatuses("saved");
      expect(next).toEqual(["applied", "rejected"]);
    });

    it("should return correct next statuses for applied", () => {
      const next = getNextStatuses("applied");
      expect(next).toEqual(["interviewing", "offered", "rejected"]);
    });

    it("should return correct next statuses for interviewing", () => {
      const next = getNextStatuses("interviewing");
      expect(next).toEqual(["offered", "rejected"]);
    });

    it("should return correct next statuses for offered", () => {
      const next = getNextStatuses("offered");
      expect(next).toEqual(["rejected"]);
    });

    it("should return empty array for rejected", () => {
      const next = getNextStatuses("rejected");
      expect(next).toEqual([]);
    });
  });

  describe("isValidStatusTransition", () => {
    it("should always allow transitioning to saved", () => {
      APPLICATION_STATUSES.forEach((from) => {
        expect(isValidStatusTransition(from, "saved")).toBe(true);
      });
    });

    it("should always allow same status", () => {
      APPLICATION_STATUSES.forEach((status) => {
        expect(isValidStatusTransition(status, status)).toBe(true);
      });
    });

    it("should allow valid forward transitions", () => {
      expect(isValidStatusTransition("saved", "applied")).toBe(true);
      expect(isValidStatusTransition("applied", "interviewing")).toBe(true);
      expect(isValidStatusTransition("interviewing", "offered")).toBe(true);
      expect(isValidStatusTransition("offered", "rejected")).toBe(true);
    });

    it("should allow direct rejection from any active status", () => {
      expect(isValidStatusTransition("saved", "rejected")).toBe(true);
      expect(isValidStatusTransition("applied", "rejected")).toBe(true);
      expect(isValidStatusTransition("interviewing", "rejected")).toBe(true);
    });

    it("should not allow transitions from rejected to non-saved statuses", () => {
      expect(isValidStatusTransition("rejected", "applied")).toBe(false);
      expect(isValidStatusTransition("rejected", "interviewing")).toBe(false);
      expect(isValidStatusTransition("rejected", "offered")).toBe(false);
    });

    it("should not allow skipping interviewing from applied to offered", () => {
      expect(isValidStatusTransition("applied", "offered")).toBe(true);
    });
  });
});
