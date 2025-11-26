import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResumeCard } from "./resume-card";
import type { ResumeResponse } from "@/lib/validations/resume";

const createMockResume = (overrides: Partial<ResumeResponse> = {}): ResumeResponse => ({
  id: "resume-123",
  userId: "user-456",
  name: "My Resume",
  content: {
    contact: { name: "John Doe", email: "john@example.com" },
    experiences: [],
    education: [],
    skills: { technical: [], soft: [] },
  },
  templateId: null,
  isMaster: false,
  originalFileName: "resume.pdf",
  fileSize: 1024,
  extractedText: "Experienced software engineer with expertise in TypeScript and React.",
  createdAt: 1700000000,
  updatedAt: 1700000001,
  ...overrides,
});

describe("ResumeCard Component", () => {
  describe("rendering", () => {
    it("should render resume name", () => {
      render(<ResumeCard resume={createMockResume()} />);
      expect(screen.getByText("My Resume")).toBeInTheDocument();
    });

    it("should render original file name when provided", () => {
      render(<ResumeCard resume={createMockResume()} />);
      expect(screen.getByText("resume.pdf")).toBeInTheDocument();
    });

    it("should not render file name when not provided", () => {
      render(<ResumeCard resume={createMockResume({ originalFileName: null })} />);
      expect(screen.queryByText("resume.pdf")).not.toBeInTheDocument();
    });

    it("should render file size when provided", () => {
      render(<ResumeCard resume={createMockResume({ fileSize: 2048 })} />);
      expect(screen.getByText("2.0 KB")).toBeInTheDocument();
    });

    it("should not render file size when not provided", () => {
      render(<ResumeCard resume={createMockResume({ fileSize: null })} />);
      expect(screen.queryByText(/KB|MB|B/)).not.toBeInTheDocument();
    });

    it("should render formatted date when createdAt is provided", () => {
      render(<ResumeCard resume={createMockResume()} />);
      expect(screen.getByText(/Nov 14, 2023/)).toBeInTheDocument();
    });

    it("should not render date when createdAt is null", () => {
      render(<ResumeCard resume={createMockResume({ createdAt: null })} />);
      expect(screen.queryByText(/Created/)).not.toBeInTheDocument();
    });

    it("should render extracted text preview", () => {
      render(<ResumeCard resume={createMockResume()} />);
      expect(screen.getByText(/experienced software engineer/i)).toBeInTheDocument();
    });

    it("should not render extracted text when not provided", () => {
      render(<ResumeCard resume={createMockResume({ extractedText: null })} />);
      expect(screen.queryByText(/experienced software engineer/i)).not.toBeInTheDocument();
    });

    it("should truncate long extracted text", () => {
      const longText = "a".repeat(250);
      render(<ResumeCard resume={createMockResume({ extractedText: longText })} />);
      expect(screen.getByText(/\.\.\.$/)).toBeInTheDocument();
    });
  });

  describe("master badge", () => {
    it("should show Master badge when isMaster is true", () => {
      render(<ResumeCard resume={createMockResume({ isMaster: true })} />);
      expect(screen.getByText("Master")).toBeInTheDocument();
    });

    it("should not show Master badge when isMaster is false", () => {
      render(<ResumeCard resume={createMockResume({ isMaster: false })} />);
      expect(screen.queryByText("Master")).not.toBeInTheDocument();
    });
  });

  describe("dropdown menu", () => {
    it("should render menu trigger button", () => {
      render(<ResumeCard resume={createMockResume()} />);
      expect(screen.getByRole("button", { name: /open menu/i })).toBeInTheDocument();
    });

    it("should show edit option when onEdit is provided", async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();
      render(<ResumeCard resume={createMockResume()} onEdit={onEdit} />);

      await user.click(screen.getByRole("button", { name: /open menu/i }));

      expect(screen.getByText("Edit")).toBeInTheDocument();
    });

    it("should not show edit option when onEdit is not provided", async () => {
      const user = userEvent.setup();
      render(<ResumeCard resume={createMockResume()} />);

      await user.click(screen.getByRole("button", { name: /open menu/i }));

      expect(screen.queryByText("Edit")).not.toBeInTheDocument();
    });

    it("should show delete option when onDelete is provided", async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();
      render(<ResumeCard resume={createMockResume()} onDelete={onDelete} />);

      await user.click(screen.getByRole("button", { name: /open menu/i }));

      expect(screen.getByText("Delete")).toBeInTheDocument();
    });

    it("should not show delete option when onDelete is not provided", async () => {
      const user = userEvent.setup();
      render(<ResumeCard resume={createMockResume()} />);

      await user.click(screen.getByRole("button", { name: /open menu/i }));

      expect(screen.queryByText("Delete")).not.toBeInTheDocument();
    });

    it("should show download option when originalFileName is provided", async () => {
      const user = userEvent.setup();
      render(<ResumeCard resume={createMockResume()} />);

      await user.click(screen.getByRole("button", { name: /open menu/i }));

      expect(screen.getByText("Download Original")).toBeInTheDocument();
    });

    it("should not show download option when originalFileName is not provided", async () => {
      const user = userEvent.setup();
      render(<ResumeCard resume={createMockResume({ originalFileName: null })} />);

      await user.click(screen.getByRole("button", { name: /open menu/i }));

      expect(screen.queryByText("Download Original")).not.toBeInTheDocument();
    });
  });

  describe("interactions", () => {
    it("should call onDelete with resume id when delete is clicked", async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();
      render(<ResumeCard resume={createMockResume()} onDelete={onDelete} />);

      await user.click(screen.getByRole("button", { name: /open menu/i }));
      await user.click(screen.getByText("Delete"));

      expect(onDelete).toHaveBeenCalledWith("resume-123");
    });

    it("should call onEdit with resume id when edit is clicked", async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();
      render(<ResumeCard resume={createMockResume()} onEdit={onEdit} />);

      await user.click(screen.getByRole("button", { name: /open menu/i }));
      await user.click(screen.getByText("Edit"));

      expect(onEdit).toHaveBeenCalledWith("resume-123");
    });
  });

  describe("file size formatting", () => {
    it("should format bytes correctly", () => {
      render(<ResumeCard resume={createMockResume({ fileSize: 500 })} />);
      expect(screen.getByText("500 B")).toBeInTheDocument();
    });

    it("should format kilobytes correctly", () => {
      render(<ResumeCard resume={createMockResume({ fileSize: 1536 })} />);
      expect(screen.getByText("1.5 KB")).toBeInTheDocument();
    });

    it("should format megabytes correctly", () => {
      render(<ResumeCard resume={createMockResume({ fileSize: 2.5 * 1024 * 1024 })} />);
      expect(screen.getByText("2.5 MB")).toBeInTheDocument();
    });
  });

  describe("date formatting", () => {
    it("should handle Unix timestamp in seconds", () => {
      render(<ResumeCard resume={createMockResume({ createdAt: 1700000000 })} />);
      expect(screen.getByText(/Nov 14, 2023/)).toBeInTheDocument();
    });

    it("should handle Unix timestamp in milliseconds", () => {
      render(<ResumeCard resume={createMockResume({ createdAt: 1700000000000 })} />);
      expect(screen.getByText(/Nov 14, 2023/)).toBeInTheDocument();
    });

    it("should handle different timestamp formats", () => {
      // Test with a large timestamp that would be in milliseconds
      render(<ResumeCard resume={createMockResume({ createdAt: 1700000000000 })} />);
      // Should display some formatted date
      expect(screen.getByText(/Created/)).toBeInTheDocument();
    });
  });

  describe("card styling", () => {
    it("should render as a Card component", () => {
      const { container } = render(<ResumeCard resume={createMockResume()} />);
      expect(container.querySelector("[data-slot='card']")).toBeInTheDocument();
    });

    it("should have hover effect class", () => {
      const { container } = render(<ResumeCard resume={createMockResume()} />);
      const card = container.querySelector("[data-slot='card']");
      expect(card?.className).toContain("hover:bg-card-hover");
    });
  });
});
