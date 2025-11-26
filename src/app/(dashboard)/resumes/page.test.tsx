import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ResumesPage from "./page";

const mockResumes = [
  {
    id: "resume-1",
    userId: "user-1",
    name: "Software Engineer Resume",
    content: null,
    templateId: null,
    isMaster: true,
    originalFileName: "resume.pdf",
    fileSize: 1024,
    extractedText: "Experienced software engineer",
    createdAt: 1700000000,
    updatedAt: 1700000001,
  },
  {
    id: "resume-2",
    userId: "user-1",
    name: "Frontend Developer Resume",
    content: null,
    templateId: null,
    isMaster: false,
    originalFileName: "frontend.pdf",
    fileSize: 2048,
    extractedText: "Frontend specialist",
    createdAt: 1700000002,
    updatedAt: 1700000003,
  },
];

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const renderWithQueryClient = (ui: React.ReactNode) => {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
};

describe("ResumesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe("loading state", () => {
    it("should show loading skeletons initially", () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise(() => {})
      );

      renderWithQueryClient(<ResumesPage />);

      const skeletons = screen.getAllByTestId
        ? document.querySelectorAll("[data-slot='skeleton']")
        : document.querySelectorAll(".animate-pulse");

      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe("header", () => {
    it("should render page title", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: [], meta: { total: 0 } }),
      });

      renderWithQueryClient(<ResumesPage />);

      await waitFor(() => {
        expect(screen.getByText("Resumes")).toBeInTheDocument();
      });
    });

    it("should render page description", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: [], meta: { total: 0 } }),
      });

      renderWithQueryClient(<ResumesPage />);

      await waitFor(() => {
        expect(screen.getByText(/manage your uploaded resumes/i)).toBeInTheDocument();
      });
    });

    it("should render Upload Resume button", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: [], meta: { total: 0 } }),
      });

      renderWithQueryClient(<ResumesPage />);

      await waitFor(() => {
        expect(screen.getByRole("link", { name: /upload resume/i })).toBeInTheDocument();
      });
    });

    it("should link to new resume page", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: [], meta: { total: 0 } }),
      });

      renderWithQueryClient(<ResumesPage />);

      await waitFor(() => {
        const link = screen.getByRole("link", { name: /upload resume/i });
        expect(link).toHaveAttribute("href", "/resumes/new");
      });
    });
  });

  describe("empty state", () => {
    it("should show empty state when no resumes", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: [], meta: { total: 0 } }),
      });

      renderWithQueryClient(<ResumesPage />);

      await waitFor(() => {
        expect(screen.getByText(/no resumes uploaded/i)).toBeInTheDocument();
      });
    });

    it("should show call to action in empty state", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: [], meta: { total: 0 } }),
      });

      renderWithQueryClient(<ResumesPage />);

      await waitFor(() => {
        expect(screen.getByText(/upload a pdf resume to get started/i)).toBeInTheDocument();
      });
    });

    it("should show upload button in empty state", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: [], meta: { total: 0 } }),
      });

      renderWithQueryClient(<ResumesPage />);

      await waitFor(() => {
        expect(
          screen.getByRole("link", { name: /upload your first resume/i })
        ).toBeInTheDocument();
      });
    });
  });

  describe("error state", () => {
    it("should show error message when fetch fails", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ success: false, error: "Failed" }),
      });

      renderWithQueryClient(<ResumesPage />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load resumes/i)).toBeInTheDocument();
      });
    });

    it("should show retry button on error", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ success: false, error: "Failed" }),
      });

      renderWithQueryClient(<ResumesPage />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
      });
    });
  });

  describe("resumes list", () => {
    it("should render resume cards", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: mockResumes,
            meta: { total: 2 },
          }),
      });

      renderWithQueryClient(<ResumesPage />);

      await waitFor(() => {
        expect(screen.getByText("Software Engineer Resume")).toBeInTheDocument();
        expect(screen.getByText("Frontend Developer Resume")).toBeInTheDocument();
      });
    });

    it("should show resume count", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: mockResumes,
            meta: { total: 2 },
          }),
      });

      renderWithQueryClient(<ResumesPage />);

      await waitFor(() => {
        expect(screen.getByText(/2 resumes uploaded/i)).toBeInTheDocument();
      });
    });

    it("should show singular when only one resume", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: [mockResumes[0]],
            meta: { total: 1 },
          }),
      });

      renderWithQueryClient(<ResumesPage />);

      await waitFor(() => {
        expect(screen.getByText(/1 resume uploaded/i)).toBeInTheDocument();
      });
    });
  });

  describe("delete functionality", () => {
    beforeEach(() => {
      vi.spyOn(window, "confirm").mockImplementation(() => true);
    });

    it("should call delete API when delete is confirmed", async () => {
      const user = userEvent.setup();
      (global.fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: mockResumes,
              meta: { total: 2 },
            }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });

      renderWithQueryClient(<ResumesPage />);

      await waitFor(() => {
        expect(screen.getByText("Software Engineer Resume")).toBeInTheDocument();
      });

      const menuButtons = screen.getAllByRole("button", { name: /open menu/i });
      await user.click(menuButtons[0]);
      await user.click(screen.getByText("Delete"));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/resumes/resume-1", {
          method: "DELETE",
        });
      });
    });
  });
});
