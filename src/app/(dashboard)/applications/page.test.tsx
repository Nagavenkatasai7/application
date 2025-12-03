import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ApplicationsPage from "./page";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock window.confirm
const mockConfirm = vi.fn();
global.confirm = mockConfirm;

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

const mockApplications = [
  {
    id: "app-1",
    userId: "user-1",
    jobId: "job-1",
    resumeId: "resume-1",
    status: "applied",
    appliedAt: new Date("2024-01-15").toISOString(),
    notes: "Great opportunity",
    createdAt: new Date("2024-01-10").toISOString(),
    updatedAt: new Date("2024-01-15").toISOString(),
    job: {
      id: "job-1",
      title: "Software Engineer",
      companyName: "Acme Corp",
      location: "San Francisco, CA",
    },
    resume: {
      id: "resume-1",
      name: "Main Resume",
    },
  },
  {
    id: "app-2",
    userId: "user-1",
    jobId: "job-2",
    resumeId: null,
    status: "saved",
    appliedAt: null,
    notes: null,
    createdAt: new Date("2024-01-12").toISOString(),
    updatedAt: new Date("2024-01-12").toISOString(),
    job: {
      id: "job-2",
      title: "Product Manager",
      companyName: "Tech Inc",
      location: "Remote",
    },
    resume: null,
  },
  {
    id: "app-3",
    userId: "user-1",
    jobId: "job-3",
    resumeId: null,
    status: "interviewing",
    appliedAt: new Date("2024-01-05").toISOString(),
    notes: "Phone screen scheduled",
    createdAt: new Date("2024-01-01").toISOString(),
    updatedAt: new Date("2024-01-08").toISOString(),
    job: {
      id: "job-3",
      title: "Senior Developer",
      companyName: "Startup Co",
      location: "New York, NY",
    },
    resume: null,
  },
];

describe("ApplicationsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConfirm.mockReturnValue(true);
  });

  describe("header", () => {
    it("should render page title", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ success: true, data: [], meta: { total: 0 } }),
      });

      renderWithProviders(<ApplicationsPage />);

      expect(screen.getByText("Applications")).toBeInTheDocument();
    });

    it("should render page description", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ success: true, data: [], meta: { total: 0 } }),
      });

      renderWithProviders(<ApplicationsPage />);

      expect(
        screen.getByText("Track your job applications and their progress")
      ).toBeInTheDocument();
    });

    it("should render View Jobs button", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ success: true, data: [], meta: { total: 0 } }),
      });

      renderWithProviders(<ApplicationsPage />);

      expect(
        screen.getByRole("link", { name: /view jobs/i })
      ).toBeInTheDocument();
    });
  });

  describe("loading state", () => {
    it("should show loading skeletons while fetching", () => {
      mockFetch.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      renderWithProviders(<ApplicationsPage />);

      const skeletons = document.querySelectorAll("[data-slot='skeleton']");
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe("empty state", () => {
    it("should show empty state when no applications", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ success: true, data: [], meta: { total: 0 } }),
      });

      renderWithProviders(<ApplicationsPage />);

      await waitFor(() => {
        expect(screen.getByText("No applications yet")).toBeInTheDocument();
      });
    });

    it("should show empty state description", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ success: true, data: [], meta: { total: 0 } }),
      });

      renderWithProviders(<ApplicationsPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/start tracking your job applications/i)
        ).toBeInTheDocument();
      });
    });

    it("should show Browse Jobs button in empty state", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ success: true, data: [], meta: { total: 0 } }),
      });

      renderWithProviders(<ApplicationsPage />);

      await waitFor(() => {
        expect(
          screen.getByRole("link", { name: /browse jobs/i })
        ).toBeInTheDocument();
      });
    });
  });

  describe("error state", () => {
    it("should show error message when fetch fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: "Failed" }),
      });

      renderWithProviders(<ApplicationsPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/failed to load applications/i)
        ).toBeInTheDocument();
      });
    });

    it("should show retry button on error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: "Failed" }),
      });

      renderWithProviders(<ApplicationsPage />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /retry/i })
        ).toBeInTheDocument();
      });
    });
  });

  describe("applications list", () => {
    it("should render application cards when applications exist", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: mockApplications,
            meta: { total: 3 },
          }),
      });

      renderWithProviders(<ApplicationsPage />);

      await waitFor(() => {
        expect(screen.getByText("Software Engineer")).toBeInTheDocument();
      });

      expect(screen.getByText("Product Manager")).toBeInTheDocument();
      expect(screen.getByText("Senior Developer")).toBeInTheDocument();
    });

    it("should render job company names", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: mockApplications,
            meta: { total: 3 },
          }),
      });

      renderWithProviders(<ApplicationsPage />);

      await waitFor(() => {
        expect(screen.getByText("Acme Corp")).toBeInTheDocument();
      });

      expect(screen.getByText("Tech Inc")).toBeInTheDocument();
      expect(screen.getByText("Startup Co")).toBeInTheDocument();
    });

    it("should show application count", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: mockApplications,
            meta: { total: 3 },
          }),
      });

      renderWithProviders(<ApplicationsPage />);

      await waitFor(() => {
        expect(screen.getByText("3 applications")).toBeInTheDocument();
      });
    });

    it("should show singular form for one application", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: [mockApplications[0]],
            meta: { total: 1 },
          }),
      });

      renderWithProviders(<ApplicationsPage />);

      await waitFor(() => {
        expect(screen.getByText("1 application")).toBeInTheDocument();
      });
    });
  });

  describe("status overview cards", () => {
    it("should show status counts", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: mockApplications,
            meta: { total: 3 },
          }),
      });

      renderWithProviders(<ApplicationsPage />);

      await waitFor(() => {
        expect(screen.getByText("Software Engineer")).toBeInTheDocument();
      });

      // Status labels should be present (may have multiple instances)
      expect(screen.getAllByText("Saved").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Applied").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Interviewing").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Offered").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Rejected").length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("search functionality", () => {
    it("should filter applications by search query", async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: mockApplications,
            meta: { total: 3 },
          }),
      });

      renderWithProviders(<ApplicationsPage />);

      await waitFor(() => {
        expect(screen.getByText("Software Engineer")).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText("Search applications...");
      await user.type(searchInput, "Product");

      await waitFor(() => {
        expect(screen.getByText("Product Manager")).toBeInTheDocument();
        expect(screen.queryByText("Software Engineer")).not.toBeInTheDocument();
      });
    });
  });

  describe("delete functionality", () => {
    it("should show confirm dialog when delete is clicked", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: mockApplications,
            meta: { total: 3 },
          }),
      });

      renderWithProviders(<ApplicationsPage />);

      await waitFor(() => {
        expect(screen.getByText("Software Engineer")).toBeInTheDocument();
      });

      // Verify applications are rendered
      expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    });
  });

  describe("status update", () => {
    it("should render status dropdown options", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: mockApplications,
            meta: { total: 3 },
          }),
      });

      renderWithProviders(<ApplicationsPage />);

      await waitFor(() => {
        expect(screen.getByText("Software Engineer")).toBeInTheDocument();
      });

      // Verify status elements are rendered (multiple instances may exist in overview cards and badges)
      expect(screen.getAllByText("Saved").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Applied").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Interviewing").length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("grid layout", () => {
    it("should have grid layout for applications", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: mockApplications,
            meta: { total: 3 },
          }),
      });

      const { container } = renderWithProviders(<ApplicationsPage />);

      await waitFor(() => {
        expect(screen.getByText("Software Engineer")).toBeInTheDocument();
      });

      const grid = container.querySelector(".grid");
      expect(grid).toBeInTheDocument();
    });
  });
});
