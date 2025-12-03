import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import DashboardPage from "./page";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

// Mock sonner
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
};

describe("Dashboard Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock responses for API calls
    mockFetch.mockImplementation((url: string) => {
      if (url === "/api/resumes") {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: [
                { id: "resume-1", name: "My Resume" },
                { id: "resume-2", name: "Other Resume" },
              ],
            }),
        });
      }
      if (url === "/api/jobs") {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: [
                { id: "job-1", title: "Software Engineer", companyName: "Acme" },
              ],
            }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: [] }),
      });
    });
  });

  describe("Header Section", () => {
    it("should render page heading", async () => {
      renderWithProviders(<DashboardPage />);

      expect(screen.getByText(/AI-Powered Resume Tailoring/i)).toBeInTheDocument();
    });

    it("should render page description", async () => {
      renderWithProviders(<DashboardPage />);

      expect(
        screen.getByText(/Ready to land your dream job/i)
      ).toBeInTheDocument();
    });
  });

  describe("Resume Selection", () => {
    it("should render resume selection card", async () => {
      renderWithProviders(<DashboardPage />);

      expect(screen.getByText("1. Select Your Resume")).toBeInTheDocument();
      expect(
        screen.getByText("Choose an existing resume or upload a new one")
      ).toBeInTheDocument();
    });

    it("should render resume selector component", async () => {
      renderWithProviders(<DashboardPage />);

      // Wait for resumes to load
      await waitFor(() => {
        expect(screen.getByText("Your Resume")).toBeInTheDocument();
      });
    });
  });

  describe("Job Input Section", () => {
    it("should render job input card", async () => {
      renderWithProviders(<DashboardPage />);

      expect(screen.getByText("2. Target Job")).toBeInTheDocument();
      expect(
        screen.getByText("Paste a job description or select from your saved jobs")
      ).toBeInTheDocument();
    });

    it("should render job input tabs", async () => {
      renderWithProviders(<DashboardPage />);

      expect(screen.getByText("Paste Job")).toBeInTheDocument();
      expect(screen.getByText("Saved Jobs")).toBeInTheDocument();
    });
  });

  describe("Tailor Button", () => {
    it("should render tailor button", async () => {
      renderWithProviders(<DashboardPage />);

      expect(
        screen.getByRole("button", { name: /Tailor My Resume/i })
      ).toBeInTheDocument();
    });

    it("should disable tailor button when inputs are empty", async () => {
      renderWithProviders(<DashboardPage />);

      const button = screen.getByRole("button", { name: /Tailor My Resume/i });
      expect(button).toBeDisabled();
    });
  });

  describe("Layout and Structure", () => {
    it("should have proper page structure", async () => {
      const { container } = renderWithProviders(<DashboardPage />);

      // Should have main layout container
      expect(container.querySelector(".space-y-8")).toBeInTheDocument();
    });

    it("should render two cards for inputs", async () => {
      renderWithProviders(<DashboardPage />);

      // Should have the two main input cards
      expect(screen.getByText("1. Select Your Resume")).toBeInTheDocument();
      expect(screen.getByText("2. Target Job")).toBeInTheDocument();
    });
  });
});
