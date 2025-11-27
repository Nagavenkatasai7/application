import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import JobsPage from "./page";

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

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
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

const mockJobs = [
  {
    id: "job-1",
    platform: "linkedin",
    externalId: null,
    title: "Software Engineer",
    companyId: null,
    companyName: "Acme Corp",
    location: "San Francisco, CA",
    description: "A great job",
    requirements: [],
    skills: ["React", "TypeScript"],
    salary: "$150k",
    postedAt: null,
    cachedAt: null,
    createdAt: 1700000000,
  },
  {
    id: "job-2",
    platform: "manual",
    externalId: null,
    title: "Product Manager",
    companyId: null,
    companyName: "Tech Inc",
    location: "Remote",
    description: "Lead products",
    requirements: [],
    skills: ["Agile", "Scrum"],
    salary: null,
    postedAt: null,
    cachedAt: null,
    createdAt: 1700000001,
  },
];

describe("JobsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConfirm.mockReturnValue(true);
    mockPush.mockClear();
  });

  describe("header", () => {
    it("should render page title", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ success: true, data: [], meta: { total: 0 } }),
      });

      renderWithProviders(<JobsPage />);

      expect(screen.getByText("Jobs")).toBeInTheDocument();
    });

    it("should render page description", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ success: true, data: [], meta: { total: 0 } }),
      });

      renderWithProviders(<JobsPage />);

      expect(
        screen.getByText("Manage your saved job postings")
      ).toBeInTheDocument();
    });

    it("should render Add Job button", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ success: true, data: [], meta: { total: 0 } }),
      });

      renderWithProviders(<JobsPage />);

      expect(screen.getByRole("link", { name: /add job/i })).toBeInTheDocument();
    });

    it("should have link to /jobs/new", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ success: true, data: [], meta: { total: 0 } }),
      });

      renderWithProviders(<JobsPage />);

      const addButton = screen.getByRole("link", { name: /add job/i });
      expect(addButton).toHaveAttribute("href", "/jobs/new");
    });
  });

  describe("loading state", () => {
    it("should show loading skeletons while fetching", () => {
      mockFetch.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      renderWithProviders(<JobsPage />);

      // Should show skeleton cards
      const skeletons = document.querySelectorAll("[data-slot='skeleton']");
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe("empty state", () => {
    it("should show empty state when no jobs", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ success: true, data: [], meta: { total: 0 } }),
      });

      renderWithProviders(<JobsPage />);

      await waitFor(() => {
        expect(screen.getByText("No jobs saved")).toBeInTheDocument();
      });
    });

    it("should show empty state description", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ success: true, data: [], meta: { total: 0 } }),
      });

      renderWithProviders(<JobsPage />);

      await waitFor(() => {
        expect(
          screen.getByText("Add a job posting to start tailoring your resume")
        ).toBeInTheDocument();
      });
    });

    it("should show Add Your First Job button in empty state", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ success: true, data: [], meta: { total: 0 } }),
      });

      renderWithProviders(<JobsPage />);

      await waitFor(() => {
        expect(
          screen.getByRole("link", { name: /add your first job/i })
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

      renderWithProviders(<JobsPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/failed to load jobs/i)
        ).toBeInTheDocument();
      });
    });

    it("should show retry button on error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: "Failed" }),
      });

      renderWithProviders(<JobsPage />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /retry/i })
        ).toBeInTheDocument();
      });
    });
  });

  describe("jobs list", () => {
    it("should render job cards when jobs exist", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ success: true, data: mockJobs, meta: { total: 2 } }),
      });

      renderWithProviders(<JobsPage />);

      await waitFor(() => {
        expect(screen.getByText("Software Engineer")).toBeInTheDocument();
      });

      expect(screen.getByText("Product Manager")).toBeInTheDocument();
    });

    it("should render job company names", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ success: true, data: mockJobs, meta: { total: 2 } }),
      });

      renderWithProviders(<JobsPage />);

      await waitFor(() => {
        expect(screen.getByText("Acme Corp")).toBeInTheDocument();
      });

      expect(screen.getByText("Tech Inc")).toBeInTheDocument();
    });

    it("should show job count", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ success: true, data: mockJobs, meta: { total: 2 } }),
      });

      renderWithProviders(<JobsPage />);

      await waitFor(() => {
        expect(screen.getByText("2 jobs saved")).toBeInTheDocument();
      });
    });

    it("should show singular form for one job", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: [mockJobs[0]],
            meta: { total: 1 },
          }),
      });

      renderWithProviders(<JobsPage />);

      await waitFor(() => {
        expect(screen.getByText("1 job saved")).toBeInTheDocument();
      });
    });
  });

  describe("delete functionality", () => {
    it("should call delete API when delete is confirmed", async () => {
      const user = userEvent.setup();
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: mockJobs,
              meta: { total: 2 },
            }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: [mockJobs[1]],
              meta: { total: 1 },
            }),
        });

      mockConfirm.mockReturnValue(true);

      renderWithProviders(<JobsPage />);

      await waitFor(() => {
        expect(screen.getByText("Software Engineer")).toBeInTheDocument();
      });

      // Find and click the menu button for the first job
      const menuButtons = screen.getAllByRole("button", { name: /open menu/i });
      await user.click(menuButtons[0]);

      // Click delete
      const deleteButton = screen.getByText("Delete");
      await user.click(deleteButton);

      // Verify delete was called
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "/api/jobs/job-1",
          expect.objectContaining({ method: "DELETE" })
        );
      });
    });

    it("should not delete when user cancels confirmation", async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: mockJobs,
            meta: { total: 2 },
          }),
      });

      mockConfirm.mockReturnValue(false);

      renderWithProviders(<JobsPage />);

      await waitFor(() => {
        expect(screen.getByText("Software Engineer")).toBeInTheDocument();
      });

      const menuButtons = screen.getAllByRole("button", { name: /open menu/i });
      await user.click(menuButtons[0]);

      const deleteButton = screen.getByText("Delete");
      await user.click(deleteButton);

      // Should only have the initial fetch call
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("create application", () => {
    it("should call applications API and redirect when create application is clicked", async () => {
      const { toast } = await import("sonner");
      const user = userEvent.setup();

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: mockJobs,
              meta: { total: 2 },
            }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: { id: "app-123", jobId: "job-1", status: "saved" },
            }),
        });

      renderWithProviders(<JobsPage />);

      await waitFor(() => {
        expect(screen.getByText("Software Engineer")).toBeInTheDocument();
      });

      const menuButtons = screen.getAllByRole("button", { name: /open menu/i });
      await user.click(menuButtons[0]);

      const createButton = screen.getByText("Create Application");
      await user.click(createButton);

      // Verify API was called
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "/api/applications",
          expect.objectContaining({
            method: "POST",
            body: JSON.stringify({ jobId: "job-1", status: "saved" }),
          })
        );
      });

      // Verify redirect
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/applications");
      });

      // Verify success toast
      expect(toast.success).toHaveBeenCalledWith(
        "Application created! Redirecting to applications..."
      );
    });

    it("should show error toast when create application fails", async () => {
      const { toast } = await import("sonner");
      const user = userEvent.setup();

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: mockJobs,
              meta: { total: 2 },
            }),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: () =>
            Promise.resolve({
              success: false,
              error: { message: "Application already exists" },
            }),
        });

      renderWithProviders(<JobsPage />);

      await waitFor(() => {
        expect(screen.getByText("Software Engineer")).toBeInTheDocument();
      });

      const menuButtons = screen.getAllByRole("button", { name: /open menu/i });
      await user.click(menuButtons[0]);

      const createButton = screen.getByText("Create Application");
      await user.click(createButton);

      // Verify error toast
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Application already exists");
      });

      // Should not redirect
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("grid layout", () => {
    it("should have grid layout for jobs", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: mockJobs,
            meta: { total: 2 },
          }),
      });

      const { container } = renderWithProviders(<JobsPage />);

      await waitFor(() => {
        expect(screen.getByText("Software Engineer")).toBeInTheDocument();
      });

      const grid = container.querySelector(".grid");
      expect(grid).toBeInTheDocument();
    });
  });
});
