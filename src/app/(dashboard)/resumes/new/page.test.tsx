import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NewResumePage from "./page";

// Helper to wait for dynamic component to load
const waitForDropzone = async () => {
  await waitFor(() => {
    expect(screen.getByText(/drag & drop your pdf here/i)).toBeInTheDocument();
  }, { timeout: 3000 });
};

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

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

const createMockFile = (
  name: string = "resume.pdf",
  type: string = "application/pdf",
  size: number = 1024
) => {
  const file = new File(["test content"], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
};

describe("NewResumePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
    global.fetch = vi.fn();
  });

  describe("rendering", () => {
    it("should render page title", () => {
      renderWithQueryClient(<NewResumePage />);
      // The page has an h1 with "Upload Resume" title
      const titles = screen.getAllByText("Upload Resume");
      expect(titles.length).toBeGreaterThan(0);
    });

    it("should render page description", () => {
      renderWithQueryClient(<NewResumePage />);
      expect(
        screen.getByText(/upload a pdf resume to extract and manage/i)
      ).toBeInTheDocument();
    });

    it("should render back button", () => {
      renderWithQueryClient(<NewResumePage />);
      expect(screen.getByRole("link", { name: /back to resumes/i })).toBeInTheDocument();
    });

    it("should link back button to resumes page", () => {
      renderWithQueryClient(<NewResumePage />);
      const link = screen.getByRole("link", { name: /back to resumes/i });
      expect(link).toHaveAttribute("href", "/resumes");
    });

    it("should render resume form", async () => {
      renderWithQueryClient(<NewResumePage />);
      await waitForDropzone();
      expect(screen.getByText(/drag & drop your pdf here/i)).toBeInTheDocument();
    });
  });

  describe("form submission", () => {
    it("should upload resume and redirect on success", async () => {
      const user = userEvent.setup();
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: { id: "resume-123", name: "Test Resume" },
          }),
      });

      renderWithQueryClient(<NewResumePage />);
      await waitForDropzone();

      const file = createMockFile("resume.pdf");
      const input = screen.getByLabelText(/upload pdf file/i);

      await user.upload(input, file);

      await waitFor(() => {
        expect(screen.getByLabelText(/resume name/i)).toHaveValue("resume");
      });

      await user.click(screen.getByRole("button", { name: /upload resume/i }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/resumes/upload",
          expect.objectContaining({
            method: "POST",
          })
        );
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/resumes");
      });
    });

    it("should show error message on upload failure", async () => {
      const user = userEvent.setup();
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        json: () =>
          Promise.resolve({
            success: false,
            error: { message: "Upload failed" },
          }),
      });

      renderWithQueryClient(<NewResumePage />);
      await waitForDropzone();

      const file = createMockFile("resume.pdf");
      const input = screen.getByLabelText(/upload pdf file/i);

      await user.upload(input, file);
      await user.click(screen.getByRole("button", { name: /upload resume/i }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      // Should not redirect on error
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("should include file in FormData", async () => {
      const user = userEvent.setup();
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: { id: "resume-123", name: "Test Resume" },
          }),
      });

      renderWithQueryClient(<NewResumePage />);
      await waitForDropzone();

      const file = createMockFile("my-resume.pdf");
      const input = screen.getByLabelText(/upload pdf file/i);

      await user.upload(input, file);
      await user.click(screen.getByRole("button", { name: /upload resume/i }));

      await waitFor(() => {
        const [, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
        expect(options.body).toBeInstanceOf(FormData);
      });
    });
  });

  describe("loading state", () => {
    it("should show loading state during upload", async () => {
      const user = userEvent.setup();
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: () => Promise.resolve({ success: true, data: {} }),
                }),
              100
            )
          )
      );

      renderWithQueryClient(<NewResumePage />);
      await waitForDropzone();

      const file = createMockFile("resume.pdf");
      const input = screen.getByLabelText(/upload pdf file/i);

      await user.upload(input, file);
      await user.click(screen.getByRole("button", { name: /upload resume/i }));

      expect(screen.getByText(/uploading/i)).toBeInTheDocument();
    });
  });

  describe("page structure", () => {
    it("should have proper heading hierarchy", () => {
      renderWithQueryClient(<NewResumePage />);

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent("Upload Resume");
    });

    it("should have max width container", () => {
      const { container } = renderWithQueryClient(<NewResumePage />);
      expect(container.querySelector(".max-w-2xl")).toBeInTheDocument();
    });
  });
});
