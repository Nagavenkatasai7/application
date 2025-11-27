import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";

// Mock drizzle-orm
vi.mock("drizzle-orm", () => ({
  sql: vi.fn((strings: TemplateStringsArray) => strings.join("")),
}));

// Mock db
vi.mock("@/lib/db", () => {
  return {
    db: {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ count: 1 }]),
    },
  };
});

describe("Health API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/health", () => {
    it("should return healthy/degraded status when database is up", async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      // Status is "healthy" if AI is configured, "degraded" if not
      expect(["healthy", "degraded"]).toContain(data.status);
      expect(data.checks.database.status).toBe("up");
      expect(data.checks.database.latency).toBeDefined();
      expect(data.timestamp).toBeDefined();
      expect(data.uptime).toBeGreaterThanOrEqual(0);
    });

    it("should include version information", async () => {
      const response = await GET();
      const data = await response.json();

      expect(data.version).toBeDefined();
    });

    it("should include AI configuration status", async () => {
      const response = await GET();
      const data = await response.json();

      expect(data.checks.ai).toBeDefined();
      expect(["configured", "not_configured"]).toContain(data.checks.ai.status);
    });

    it("should have no-cache headers", async () => {
      const response = await GET();

      expect(response.headers.get("Cache-Control")).toBe(
        "no-store, no-cache, must-revalidate"
      );
    });

    it("should return unhealthy when database is down", async () => {
      const { db } = await import("@/lib/db");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          limit: vi.fn().mockRejectedValue(new Error("Connection failed")),
        }),
      } as unknown as ReturnType<typeof db.select>);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.status).toBe("unhealthy");
      expect(data.checks.database.status).toBe("down");
      expect(data.checks.database.error).toBe("Connection failed");
    });
  });
});
