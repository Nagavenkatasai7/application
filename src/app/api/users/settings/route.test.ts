import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, PUT } from "./route";
import { DEFAULT_SETTINGS } from "@/lib/validations/settings";

// Mock user
const mockUser = {
  id: "user-123",
  email: "test@example.com",
  name: "Test User",
  createdAt: new Date(),
};

// Mock settings record
const mockSettingsRecord = {
  id: "settings-456",
  userId: "user-123",
  settings: DEFAULT_SETTINGS,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock auth module
vi.mock("@/lib/auth", () => ({
  getOrCreateLocalUser: vi.fn().mockResolvedValue({
    id: "user-123",
    email: "test@example.com",
    name: "Test User",
    createdAt: new Date(),
  }),
}));

// Mock uuid
vi.mock("uuid", () => ({
  v4: vi.fn().mockReturnValue("new-uuid-123"),
}));

// Mock drizzle-orm
vi.mock("drizzle-orm", () => ({
  eq: vi.fn((col, val) => ({ column: col, value: val })),
}));

// Mock db
vi.mock("@/lib/db", () => {
  const mockSelect = vi.fn().mockReturnThis();
  const mockFrom = vi.fn().mockReturnThis();
  const mockWhere = vi.fn().mockReturnThis();
  const mockLimit = vi.fn().mockResolvedValue([]);
  const mockInsert = vi.fn().mockReturnThis();
  const mockValues = vi.fn().mockResolvedValue(undefined);
  const mockUpdate = vi.fn().mockReturnThis();
  const mockSet = vi.fn().mockReturnThis();

  return {
    db: {
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
    },
  };
});

describe("Users Settings API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/users/settings", () => {
    it("should return existing settings", async () => {
      const { db } = await import("@/lib/db");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockSettingsRecord]),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe("settings-456");
      expect(data.data.userId).toBe("user-123");
      expect(data.data.settings.appearance.theme).toBe("dark");
    });

    it("should create default settings if none exist", async () => {
      const { db } = await import("@/lib/db");

      // First call returns empty (no existing settings)
      // Second call returns the newly inserted settings
      const mockSelectFrom = vi.fn();
      mockSelectFrom
        .mockReturnValueOnce({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        })
        .mockReturnValueOnce({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                id: "new-uuid-123",
                userId: "user-123",
                settings: DEFAULT_SETTINGS,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ]),
          }),
        });

      vi.mocked(db.select).mockReturnValue({
        from: mockSelectFrom,
      } as unknown as ReturnType<typeof db.select>);

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      } as unknown as ReturnType<typeof db.insert>);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.settings).toMatchObject(DEFAULT_SETTINGS);
    });

    it("should handle errors when getting settings", async () => {
      const { getOrCreateLocalUser } = await import("@/lib/auth");
      vi.mocked(getOrCreateLocalUser).mockRejectedValueOnce(
        new Error("Auth error")
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.code).toBe("FETCH_ERROR");
    });
  });

  describe("PUT /api/users/settings", () => {
    it("should update appearance settings", async () => {
      const { db } = await import("@/lib/db");

      // Mock existing settings
      const mockSelectFrom = vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockSettingsRecord]),
        }),
      });

      vi.mocked(db.select).mockReturnValue({
        from: mockSelectFrom,
      } as unknown as ReturnType<typeof db.select>);

      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      } as unknown as ReturnType<typeof db.update>);

      const request = new Request("http://localhost/api/users/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appearance: { theme: "light" },
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it("should update AI settings", async () => {
      const { db } = await import("@/lib/db");

      const mockSelectFrom = vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockSettingsRecord]),
        }),
      });

      vi.mocked(db.select).mockReturnValue({
        from: mockSelectFrom,
      } as unknown as ReturnType<typeof db.select>);

      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      } as unknown as ReturnType<typeof db.update>);

      const request = new Request("http://localhost/api/users/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ai: { temperature: 0.5, model: "gpt-4o" },
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it("should update multiple sections at once", async () => {
      const { db } = await import("@/lib/db");

      const mockSelectFrom = vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockSettingsRecord]),
        }),
      });

      vi.mocked(db.select).mockReturnValue({
        from: mockSelectFrom,
      } as unknown as ReturnType<typeof db.select>);

      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      } as unknown as ReturnType<typeof db.update>);

      const request = new Request("http://localhost/api/users/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appearance: { theme: "system", compactMode: true },
          notifications: { weeklyDigest: true },
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it("should reject invalid settings data", async () => {
      const request = new Request("http://localhost/api/users/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ai: { temperature: 10 }, // Invalid: max is 2
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should reject invalid theme value", async () => {
      const request = new Request("http://localhost/api/users/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appearance: { theme: "midnight" }, // Invalid theme
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should create settings if none exist and update", async () => {
      const { db } = await import("@/lib/db");

      // First call returns empty (no existing settings)
      // Subsequent calls for update and fetch
      let callCount = 0;
      const mockSelectFrom = vi.fn().mockImplementation(() => ({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockImplementation(() => {
            callCount++;
            if (callCount === 1) {
              return Promise.resolve([]); // No existing settings
            }
            return Promise.resolve([
              {
                id: "new-uuid-123",
                userId: "user-123",
                settings: { ...DEFAULT_SETTINGS, appearance: { ...DEFAULT_SETTINGS.appearance, theme: "light" } },
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ]);
          }),
        }),
      }));

      vi.mocked(db.select).mockReturnValue({
        from: mockSelectFrom,
      } as unknown as ReturnType<typeof db.select>);

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      } as unknown as ReturnType<typeof db.insert>);

      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      } as unknown as ReturnType<typeof db.update>);

      const request = new Request("http://localhost/api/users/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appearance: { theme: "light" },
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it("should handle errors when updating settings", async () => {
      const { getOrCreateLocalUser } = await import("@/lib/auth");
      vi.mocked(getOrCreateLocalUser).mockRejectedValueOnce(
        new Error("Auth error")
      );

      const request = new Request("http://localhost/api/users/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appearance: { theme: "light" },
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.code).toBe("UPDATE_ERROR");
    });
  });
});
