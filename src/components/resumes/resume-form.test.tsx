import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResumeForm } from "./resume-form";

describe("ResumeForm Component", () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnSubmit.mockResolvedValue(undefined);
  });

  const createMockFile = (
    name: string = "resume.pdf",
    type: string = "application/pdf",
    size: number = 1024
  ) => {
    const file = new File(["test content"], name, { type });
    Object.defineProperty(file, "size", { value: size });
    return file;
  };

  describe("rendering", () => {
    it("should render Upload Resume section", () => {
      render(<ResumeForm onSubmit={mockOnSubmit} />);
      // CardTitle is a div with data-slot="card-title"
      const titles = screen.getAllByText("Upload Resume");
      expect(titles.length).toBeGreaterThan(0);
    });

    it("should render Resume Details section", () => {
      render(<ResumeForm onSubmit={mockOnSubmit} />);
      expect(screen.getByText("Resume Details")).toBeInTheDocument();
    });

    it("should render resume name input", () => {
      render(<ResumeForm onSubmit={mockOnSubmit} />);
      expect(screen.getByLabelText(/resume name/i)).toBeInTheDocument();
    });

    it("should render dropzone", () => {
      render(<ResumeForm onSubmit={mockOnSubmit} />);
      expect(screen.getByText(/drag & drop your pdf here/i)).toBeInTheDocument();
    });

    it("should render upload button", () => {
      render(<ResumeForm onSubmit={mockOnSubmit} />);
      expect(screen.getByRole("button", { name: /upload resume/i })).toBeInTheDocument();
    });

    it("should render cancel button", () => {
      render(<ResumeForm onSubmit={mockOnSubmit} />);
      expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    });

    it("should show required indicator for resume name", () => {
      render(<ResumeForm onSubmit={mockOnSubmit} />);
      expect(screen.getByText("*")).toBeInTheDocument();
    });
  });

  describe("default values", () => {
    it("should apply default name when provided", () => {
      render(
        <ResumeForm
          onSubmit={mockOnSubmit}
          defaultValues={{ name: "Software Engineer Resume" }}
        />
      );

      expect(screen.getByLabelText(/resume name/i)).toHaveValue(
        "Software Engineer Resume"
      );
    });

    it("should have empty name by default", () => {
      render(<ResumeForm onSubmit={mockOnSubmit} />);
      expect(screen.getByLabelText(/resume name/i)).toHaveValue("");
    });
  });

  describe("file selection", () => {
    it("should auto-fill name from filename when name is empty", async () => {
      const user = userEvent.setup();
      render(<ResumeForm onSubmit={mockOnSubmit} />);

      const file = createMockFile("my-awesome-resume.pdf");
      const input = screen.getByLabelText(/upload pdf file/i);

      await user.upload(input, file);

      await waitFor(() => {
        expect(screen.getByLabelText(/resume name/i)).toHaveValue(
          "my-awesome-resume"
        );
      });
    });

    it("should not overwrite name if already filled", async () => {
      const user = userEvent.setup();
      render(
        <ResumeForm
          onSubmit={mockOnSubmit}
          defaultValues={{ name: "Existing Name" }}
        />
      );

      const file = createMockFile("new-resume.pdf");
      const input = screen.getByLabelText(/upload pdf file/i);

      await user.upload(input, file);

      expect(screen.getByLabelText(/resume name/i)).toHaveValue("Existing Name");
    });

    it("should display selected file", async () => {
      const user = userEvent.setup();
      render(<ResumeForm onSubmit={mockOnSubmit} />);

      const file = createMockFile("resume.pdf");
      const input = screen.getByLabelText(/upload pdf file/i);

      await user.upload(input, file);

      expect(screen.getByText("resume.pdf")).toBeInTheDocument();
    });
  });

  describe("form submission", () => {
    it("should call onSubmit with form data and file when valid", async () => {
      const user = userEvent.setup();
      render(<ResumeForm onSubmit={mockOnSubmit} />);

      const file = createMockFile("resume.pdf");
      const input = screen.getByLabelText(/upload pdf file/i);

      await user.upload(input, file);
      await user.clear(screen.getByLabelText(/resume name/i));
      await user.type(screen.getByLabelText(/resume name/i), "My Resume");
      await user.click(screen.getByRole("button", { name: /upload resume/i }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      });

      expect(mockOnSubmit).toHaveBeenCalledWith({ name: "My Resume" }, file);
    });

    it("should show error when no file is selected", async () => {
      const user = userEvent.setup();
      render(<ResumeForm onSubmit={mockOnSubmit} />);

      await user.type(screen.getByLabelText(/resume name/i), "My Resume");
      // The upload button should be disabled when no file is selected
      const uploadButton = screen.getByRole("button", { name: /upload resume/i });
      expect(uploadButton).toBeDisabled();

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("should show error when name is empty", async () => {
      const user = userEvent.setup();
      render(<ResumeForm onSubmit={mockOnSubmit} />);

      const file = createMockFile("resume.pdf");
      const input = screen.getByLabelText(/upload pdf file/i);

      await user.upload(input, file);
      // Clear the auto-filled name
      await user.clear(screen.getByLabelText(/resume name/i));
      await user.click(screen.getByRole("button", { name: /upload resume/i }));

      await waitFor(() => {
        expect(screen.getByText(/resume name is required/i)).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe("loading state", () => {
    it("should show loading state when isLoading is true", () => {
      render(<ResumeForm onSubmit={mockOnSubmit} isLoading />);
      expect(screen.getByText(/uploading/i)).toBeInTheDocument();
    });

    it("should disable upload button when loading", () => {
      render(<ResumeForm onSubmit={mockOnSubmit} isLoading />);
      expect(screen.getByRole("button", { name: /uploading/i })).toBeDisabled();
    });

    it("should disable cancel button when loading", () => {
      render(<ResumeForm onSubmit={mockOnSubmit} isLoading />);
      expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    });

    it("should disable name input when loading", () => {
      render(<ResumeForm onSubmit={mockOnSubmit} isLoading />);
      expect(screen.getByLabelText(/resume name/i)).toBeDisabled();
    });

    it("should disable dropzone when loading", () => {
      render(<ResumeForm onSubmit={mockOnSubmit} isLoading />);
      expect(screen.getByLabelText(/upload pdf file/i)).toBeDisabled();
    });
  });

  describe("button states", () => {
    it("should disable upload button when no file is selected", () => {
      render(<ResumeForm onSubmit={mockOnSubmit} />);
      expect(screen.getByRole("button", { name: /upload resume/i })).toBeDisabled();
    });

    it("should enable upload button when file is selected", async () => {
      const user = userEvent.setup();
      render(<ResumeForm onSubmit={mockOnSubmit} />);

      const file = createMockFile("resume.pdf");
      const input = screen.getByLabelText(/upload pdf file/i);

      await user.upload(input, file);

      expect(screen.getByRole("button", { name: /upload resume/i })).toBeEnabled();
    });
  });

  describe("file removal", () => {
    it("should clear file when remove button is clicked", async () => {
      const user = userEvent.setup();
      render(<ResumeForm onSubmit={mockOnSubmit} />);

      const file = createMockFile("resume.pdf");
      const input = screen.getByLabelText(/upload pdf file/i);

      await user.upload(input, file);
      expect(screen.getByText("resume.pdf")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /remove file/i }));

      expect(screen.queryByText("resume.pdf")).not.toBeInTheDocument();
      expect(screen.getByText(/drag & drop your pdf here/i)).toBeInTheDocument();
    });
  });

  describe("placeholder text", () => {
    it("should have correct placeholder for name", () => {
      render(<ResumeForm onSubmit={mockOnSubmit} />);
      expect(
        screen.getByPlaceholderText(/software engineer resume/i)
      ).toBeInTheDocument();
    });
  });

  describe("form structure", () => {
    it("should be wrapped in a form element", () => {
      const { container } = render(<ResumeForm onSubmit={mockOnSubmit} />);
      expect(container.querySelector("form")).toBeInTheDocument();
    });

    it("should have cards for form sections", () => {
      const { container } = render(<ResumeForm onSubmit={mockOnSubmit} />);
      const cards = container.querySelectorAll("[data-slot='card']");
      expect(cards.length).toBeGreaterThanOrEqual(2);
    });
  });
});
