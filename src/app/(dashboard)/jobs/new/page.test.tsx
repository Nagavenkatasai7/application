import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NewJobPage from "./page";

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
    replace: vi.fn(),
    refresh: vi.fn(),
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

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
};

describe("NewJobPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("header", () => {
    it("should render page title", () => {
      renderWithProviders(<NewJobPage />);

      expect(screen.getByText("Add Job")).toBeInTheDocument();
    });

    it("should render page description", () => {
      renderWithProviders(<NewJobPage />);

      expect(
        screen.getByText("Paste a job URL or enter details manually")
      ).toBeInTheDocument();
    });

    it("should render back button", () => {
      renderWithProviders(<NewJobPage />);

      expect(
        screen.getByRole("link", { name: /back to jobs/i })
      ).toBeInTheDocument();
    });

    it("should have link back to /jobs", () => {
      renderWithProviders(<NewJobPage />);

      const backButton = screen.getByRole("link", { name: /back to jobs/i });
      expect(backButton).toHaveAttribute("href", "/jobs");
    });
  });

  describe("form rendering", () => {
    it("should render JobForm component", () => {
      renderWithProviders(<NewJobPage />);

      expect(screen.getByLabelText(/job title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/job description/i)).toBeInTheDocument();
    });

    it("should render save button", () => {
      renderWithProviders(<NewJobPage />);

      expect(
        screen.getByRole("button", { name: /save job/i })
      ).toBeInTheDocument();
    });
  });

  describe("form submission", () => {
    it("should call API on successful form submission", async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ data: { id: "new-job-123" } }),
      });

      renderWithProviders(<NewJobPage />);

      await user.type(
        screen.getByLabelText(/job title/i),
        "Software Engineer"
      );
      await user.type(screen.getByLabelText(/company name/i), "Acme Corp");
      await user.type(
        screen.getByLabelText(/job description/i),
        "This is a great job opportunity for engineers."
      );

      await user.click(screen.getByRole("button", { name: /save job/i }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "/api/jobs",
          expect.objectContaining({
            method: "POST",
            headers: { "Content-Type": "application/json" },
          })
        );
      });
    });

    it("should redirect to /jobs on successful creation", async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ data: { id: "new-job-123" } }),
      });

      renderWithProviders(<NewJobPage />);

      await user.type(
        screen.getByLabelText(/job title/i),
        "Software Engineer"
      );
      await user.type(screen.getByLabelText(/company name/i), "Acme Corp");
      await user.type(
        screen.getByLabelText(/job description/i),
        "This is a great job opportunity for engineers."
      );

      await user.click(screen.getByRole("button", { name: /save job/i }));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/jobs");
      });
    });

    it("should show success toast on successful creation", async () => {
      const { toast } = await import("sonner");
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ data: { id: "new-job-123" } }),
      });

      renderWithProviders(<NewJobPage />);

      await user.type(
        screen.getByLabelText(/job title/i),
        "Software Engineer"
      );
      await user.type(screen.getByLabelText(/company name/i), "Acme Corp");
      await user.type(
        screen.getByLabelText(/job description/i),
        "This is a great job opportunity for engineers."
      );

      await user.click(screen.getByRole("button", { name: /save job/i }));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("Job created successfully");
      });
    });
  });

  describe("error handling", () => {
    it("should show error toast on API error", async () => {
      const { toast } = await import("sonner");
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () =>
          Promise.resolve({
            error: { message: "Server error" },
          }),
      });

      renderWithProviders(<NewJobPage />);

      await user.type(
        screen.getByLabelText(/job title/i),
        "Software Engineer"
      );
      await user.type(screen.getByLabelText(/company name/i), "Acme Corp");
      await user.type(
        screen.getByLabelText(/job description/i),
        "This is a great job opportunity for engineers."
      );

      await user.click(screen.getByRole("button", { name: /save job/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Server error");
      });

      // Wait for mutation to settle to prevent unhandled rejection
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /save job/i })).not.toBeDisabled();
      });
    });

    it("should show default error message when no message provided", async () => {
      const { toast } = await import("sonner");
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({}),
      });

      renderWithProviders(<NewJobPage />);

      await user.type(
        screen.getByLabelText(/job title/i),
        "Software Engineer"
      );
      await user.type(screen.getByLabelText(/company name/i), "Acme Corp");
      await user.type(
        screen.getByLabelText(/job description/i),
        "This is a great job opportunity for engineers."
      );

      await user.click(screen.getByRole("button", { name: /save job/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Failed to create job");
      });

      // Wait for mutation to settle to prevent unhandled rejection
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /save job/i })).not.toBeDisabled();
      });
    });

    it("should not redirect on error", async () => {
      const { toast } = await import("sonner");
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () =>
          Promise.resolve({
            error: { message: "Server error" },
          }),
      });

      renderWithProviders(<NewJobPage />);

      await user.type(
        screen.getByLabelText(/job title/i),
        "Software Engineer"
      );
      await user.type(screen.getByLabelText(/company name/i), "Acme Corp");
      await user.type(
        screen.getByLabelText(/job description/i),
        "This is a great job opportunity for engineers."
      );

      await user.click(screen.getByRole("button", { name: /save job/i }));

      // Wait for error toast to be called (indicating mutation completed)
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });

      // Verify push was not called
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("loading state", () => {
    it("should show loading state while submitting", async () => {
      const user = userEvent.setup();
      let resolvePromise: (value: unknown) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockFetch.mockReturnValueOnce(promise);

      renderWithProviders(<NewJobPage />);

      await user.type(
        screen.getByLabelText(/job title/i),
        "Software Engineer"
      );
      await user.type(screen.getByLabelText(/company name/i), "Acme Corp");
      await user.type(
        screen.getByLabelText(/job description/i),
        "This is a great job opportunity for engineers."
      );

      await user.click(screen.getByRole("button", { name: /save job/i }));

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText(/saving/i)).toBeInTheDocument();
      });

      // Resolve the promise
      resolvePromise!({
        ok: true,
        json: () => Promise.resolve({ data: { id: "new-job-123" } }),
      });
    });
  });

  describe("layout", () => {
    it("should have max-width container", () => {
      const { container } = renderWithProviders(<NewJobPage />);

      expect(container.querySelector(".max-w-2xl")).toBeInTheDocument();
    });

    it("should center content", () => {
      const { container } = renderWithProviders(<NewJobPage />);

      expect(container.querySelector(".mx-auto")).toBeInTheDocument();
    });
  });

  describe("request body", () => {
    it("should send correct data in request body", async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ data: { id: "new-job-123" } }),
      });

      renderWithProviders(<NewJobPage />);

      await user.type(
        screen.getByLabelText(/job title/i),
        "Software Engineer"
      );
      await user.type(screen.getByLabelText(/company name/i), "Acme Corp");
      await user.type(screen.getByLabelText(/location/i), "San Francisco");
      await user.type(screen.getByLabelText(/salary range/i), "$150k");
      await user.type(
        screen.getByLabelText(/job description/i),
        "This is a great job opportunity for engineers."
      );

      await user.click(screen.getByRole("button", { name: /save job/i }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      const [, options] = mockFetch.mock.calls[0];
      const body = JSON.parse(options.body);

      expect(body).toMatchObject({
        title: "Software Engineer",
        companyName: "Acme Corp",
        location: "San Francisco",
        salary: "$150k",
        description: "This is a great job opportunity for engineers.",
      });
    });
  });
});
