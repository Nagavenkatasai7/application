import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";

// Mock env functions
vi.mock("@/lib/env", () => ({
  isApifyConfigured: vi.fn(),
  getApifyApiKey: vi.fn(),
}));

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("LinkedIn Status API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/linkedin/status", () => {
    it("should return not_configured when Apify API key is not set", async () => {
      const { isApifyConfigured } = await import("@/lib/env");
      vi.mocked(isApifyConfigured).mockReturnValue(false);

      const response = await GET();
      const data = await response.json();

      expect(data.status).toBe("not_configured");
      expect(data.message).toContain("APIFY_API_KEY");
    });

    it("should return valid status with username when API key works", async () => {
      const { isApifyConfigured, getApifyApiKey } = await import("@/lib/env");
      vi.mocked(isApifyConfigured).mockReturnValue(true);
      vi.mocked(getApifyApiKey).mockReturnValue("valid_api_key");

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          data: { username: "testuser" },
        }),
      });

      const response = await GET();
      const data = await response.json();

      expect(data.status).toBe("valid");
      expect(data.username).toBe("testuser");
      expect(data.message).toContain("valid and working");
    });

    it("should return valid status with unknown username when username not in response", async () => {
      const { isApifyConfigured, getApifyApiKey } = await import("@/lib/env");
      vi.mocked(isApifyConfigured).mockReturnValue(true);
      vi.mocked(getApifyApiKey).mockReturnValue("valid_api_key");

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          data: {},
        }),
      });

      const response = await GET();
      const data = await response.json();

      expect(data.status).toBe("valid");
      expect(data.username).toBe("unknown");
    });

    it("should return invalid when API key is unauthorized (401)", async () => {
      const { isApifyConfigured, getApifyApiKey } = await import("@/lib/env");
      vi.mocked(isApifyConfigured).mockReturnValue(true);
      vi.mocked(getApifyApiKey).mockReturnValue("invalid_api_key");

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const response = await GET();
      const data = await response.json();

      expect(data.status).toBe("invalid");
      expect(data.message).toContain("invalid or expired");
    });

    it("should return invalid for other HTTP error codes", async () => {
      const { isApifyConfigured, getApifyApiKey } = await import("@/lib/env");
      vi.mocked(isApifyConfigured).mockReturnValue(true);
      vi.mocked(getApifyApiKey).mockReturnValue("some_api_key");

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const response = await GET();
      const data = await response.json();

      expect(data.status).toBe("invalid");
      expect(data.message).toContain("500");
    });

    it("should return error when fetch fails", async () => {
      const { isApifyConfigured, getApifyApiKey } = await import("@/lib/env");
      vi.mocked(isApifyConfigured).mockReturnValue(true);
      vi.mocked(getApifyApiKey).mockReturnValue("some_api_key");

      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const response = await GET();
      const data = await response.json();

      expect(data.status).toBe("error");
      expect(data.message).toBe("Network error");
    });

    it("should call Apify API with correct authorization header", async () => {
      const { isApifyConfigured, getApifyApiKey } = await import("@/lib/env");
      vi.mocked(isApifyConfigured).mockReturnValue(true);
      vi.mocked(getApifyApiKey).mockReturnValue("test_api_key_123");

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({ data: { username: "user" } }),
      });

      await GET();

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.apify.com/v2/users/me",
        {
          headers: {
            Authorization: "Bearer test_api_key_123",
          },
        }
      );
    });
  });
});
