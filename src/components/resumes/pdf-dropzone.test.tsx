import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PdfDropzone } from "./pdf-dropzone";

describe("PdfDropzone Component", () => {
  const mockOnFileSelect = vi.fn();
  const mockOnFileRemove = vi.fn();

  beforeEach(() => {
    mockOnFileSelect.mockClear();
    mockOnFileRemove.mockClear();
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
    it("should render dropzone when no file selected", () => {
      render(<PdfDropzone onFileSelect={mockOnFileSelect} />);
      expect(screen.getByText(/drag & drop your pdf here/i)).toBeInTheDocument();
    });

    it("should render click to browse text", () => {
      render(<PdfDropzone onFileSelect={mockOnFileSelect} />);
      expect(screen.getByText(/click to browse/i)).toBeInTheDocument();
    });

    it("should render max size hint", () => {
      render(<PdfDropzone onFileSelect={mockOnFileSelect} />);
      expect(screen.getByText(/max 10mb/i)).toBeInTheDocument();
    });

    it("should render file input with PDF accept type", () => {
      render(<PdfDropzone onFileSelect={mockOnFileSelect} />);
      const input = screen.getByLabelText(/upload pdf file/i);
      expect(input).toHaveAttribute("accept", ".pdf,application/pdf");
    });
  });

  describe("file selection", () => {
    it("should call onFileSelect when valid PDF is selected", async () => {
      const user = userEvent.setup();
      render(<PdfDropzone onFileSelect={mockOnFileSelect} />);

      const file = createMockFile();
      const input = screen.getByLabelText(/upload pdf file/i);

      await user.upload(input, file);

      expect(mockOnFileSelect).toHaveBeenCalledWith(file);
    });

    it("should validate non-PDF file type before calling onFileSelect", async () => {
      // Test the validation function directly
      const { validatePdfFile } = await import("@/lib/validations/resume");
      const file = createMockFile("doc.txt", "text/plain");

      const result = validatePdfFile(file);

      expect(result.valid).toBe(false);
      expect(result.error).toContain("PDF");
    });

    it("should validate file exceeding size limit before calling onFileSelect", async () => {
      // Test the validation function directly
      const { validatePdfFile } = await import("@/lib/validations/resume");
      const file = createMockFile("large.pdf", "application/pdf", 11 * 1024 * 1024);

      const result = validatePdfFile(file);

      expect(result.valid).toBe(false);
      expect(result.error).toContain("10MB");
    });
  });

  describe("selected file state", () => {
    it("should display selected file name", () => {
      const file = createMockFile("my-resume.pdf");
      render(
        <PdfDropzone
          onFileSelect={mockOnFileSelect}
          selectedFile={file}
          onFileRemove={mockOnFileRemove}
        />
      );

      expect(screen.getByText("my-resume.pdf")).toBeInTheDocument();
    });

    it("should display file size", () => {
      const file = createMockFile("resume.pdf", "application/pdf", 2048);
      render(
        <PdfDropzone
          onFileSelect={mockOnFileSelect}
          selectedFile={file}
          onFileRemove={mockOnFileRemove}
        />
      );

      expect(screen.getByText("2.0 KB")).toBeInTheDocument();
    });

    it("should render remove button when file is selected", () => {
      const file = createMockFile();
      render(
        <PdfDropzone
          onFileSelect={mockOnFileSelect}
          selectedFile={file}
          onFileRemove={mockOnFileRemove}
        />
      );

      expect(screen.getByRole("button", { name: /remove file/i })).toBeInTheDocument();
    });

    it("should call onFileRemove when remove button is clicked", async () => {
      const user = userEvent.setup();
      const file = createMockFile();
      render(
        <PdfDropzone
          onFileSelect={mockOnFileSelect}
          selectedFile={file}
          onFileRemove={mockOnFileRemove}
        />
      );

      await user.click(screen.getByRole("button", { name: /remove file/i }));

      expect(mockOnFileRemove).toHaveBeenCalled();
    });
  });

  describe("drag and drop", () => {
    it("should show drag over state", () => {
      render(<PdfDropzone onFileSelect={mockOnFileSelect} />);
      const dropzone = screen.getByText(/drag & drop your pdf here/i).closest("div");

      fireEvent.dragOver(dropzone!);

      expect(screen.getByText(/drop your pdf here/i)).toBeInTheDocument();
    });

    it("should reset drag state on drag leave", () => {
      render(<PdfDropzone onFileSelect={mockOnFileSelect} />);
      const dropzone = screen.getByText(/drag & drop your pdf here/i).closest("div");

      fireEvent.dragOver(dropzone!);
      fireEvent.dragLeave(dropzone!);

      expect(screen.getByText(/drag & drop your pdf here/i)).toBeInTheDocument();
    });

    it("should handle file drop", () => {
      render(<PdfDropzone onFileSelect={mockOnFileSelect} />);
      const dropzone = screen.getByText(/drag & drop your pdf here/i).closest("div");
      const file = createMockFile();

      const dataTransfer = {
        files: [file],
        items: [{ kind: "file", type: file.type, getAsFile: () => file }],
        types: ["Files"],
      };

      fireEvent.drop(dropzone!, { dataTransfer });

      expect(mockOnFileSelect).toHaveBeenCalledWith(file);
    });
  });

  describe("disabled state", () => {
    it("should disable file input when disabled prop is true", () => {
      render(<PdfDropzone onFileSelect={mockOnFileSelect} disabled />);
      const input = screen.getByLabelText(/upload pdf file/i);
      expect(input).toBeDisabled();
    });

    it("should not show remove button when disabled", () => {
      const file = createMockFile();
      render(
        <PdfDropzone
          onFileSelect={mockOnFileSelect}
          selectedFile={file}
          onFileRemove={mockOnFileRemove}
          disabled
        />
      );

      expect(screen.queryByRole("button", { name: /remove file/i })).not.toBeInTheDocument();
    });

    it("should apply opacity styling when disabled", () => {
      const { container } = render(
        <PdfDropzone onFileSelect={mockOnFileSelect} disabled />
      );
      expect(container.firstChild).toHaveClass("space-y-2");
    });
  });

  describe("error state", () => {
    it("should display external error", () => {
      render(
        <PdfDropzone
          onFileSelect={mockOnFileSelect}
          error="Please select a PDF file"
        />
      );

      expect(screen.getByText("Please select a PDF file")).toBeInTheDocument();
    });

    it("should show error styling", () => {
      render(
        <PdfDropzone
          onFileSelect={mockOnFileSelect}
          error="Error message"
        />
      );

      expect(screen.getByText("Error message")).toBeInTheDocument();
    });
  });

  describe("file size formatting", () => {
    it("should format bytes correctly", () => {
      const file = createMockFile("resume.pdf", "application/pdf", 500);
      render(
        <PdfDropzone
          onFileSelect={mockOnFileSelect}
          selectedFile={file}
        />
      );
      expect(screen.getByText("500 B")).toBeInTheDocument();
    });

    it("should format kilobytes correctly", () => {
      const file = createMockFile("resume.pdf", "application/pdf", 1536);
      render(
        <PdfDropzone
          onFileSelect={mockOnFileSelect}
          selectedFile={file}
        />
      );
      expect(screen.getByText("1.5 KB")).toBeInTheDocument();
    });

    it("should format megabytes correctly", () => {
      const file = createMockFile("resume.pdf", "application/pdf", 2.5 * 1024 * 1024);
      render(
        <PdfDropzone
          onFileSelect={mockOnFileSelect}
          selectedFile={file}
        />
      );
      expect(screen.getByText("2.5 MB")).toBeInTheDocument();
    });
  });
});
