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

    it("should not render date when createdAt is undefined", () => {
      render(<ResumeCard resume={createMockResume({ createdAt: undefined })} />);
      // Without createdAt, no date should be shown
      expect(screen.queryByText(/Nov/)).not.toBeInTheDocument();
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

  describe("action buttons", () => {
    it("should render View button when onView is provided", () => {
      const onView = vi.fn();
      render(<ResumeCard resume={createMockResume()} onView={onView} />);
      expect(screen.getByText("View")).toBeInTheDocument();
    });

    it("should render Edit button when onEdit is provided", () => {
      const onEdit = vi.fn();
      render(<ResumeCard resume={createMockResume()} onEdit={onEdit} />);
      expect(screen.getByText("Edit")).toBeInTheDocument();
    });

    it("should render Tailor button when onTailor is provided", () => {
      const onTailor = vi.fn();
      render(<ResumeCard resume={createMockResume()} onTailor={onTailor} />);
      expect(screen.getByText("Tailor")).toBeInTheDocument();
    });

    it("should not render View button when onView is not provided", () => {
      render(<ResumeCard resume={createMockResume()} />);
      expect(screen.queryByText("View")).not.toBeInTheDocument();
    });
  });

  describe("dropdown menu", () => {
    it("should render more actions button", () => {
      render(<ResumeCard resume={createMockResume()} />);
      expect(screen.getByRole("button", { name: /more actions/i })).toBeInTheDocument();
    });

    it("should show download option when originalFileName is provided", async () => {
      const user = userEvent.setup();
      render(<ResumeCard resume={createMockResume()} />);

      await user.click(screen.getByRole("button", { name: /more actions/i }));

      expect(screen.getByText("Download Original")).toBeInTheDocument();
    });

    it("should not show download option when originalFileName is not provided", async () => {
      const user = userEvent.setup();
      render(<ResumeCard resume={createMockResume({ originalFileName: null })} />);

      await user.click(screen.getByRole("button", { name: /more actions/i }));

      expect(screen.queryByText("Download Original")).not.toBeInTheDocument();
    });

    it("should show delete option when onDelete is provided", async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();
      render(<ResumeCard resume={createMockResume()} onDelete={onDelete} />);

      await user.click(screen.getByRole("button", { name: /more actions/i }));

      expect(screen.getByText("Delete")).toBeInTheDocument();
    });

    it("should not show delete option when onDelete is not provided", async () => {
      const user = userEvent.setup();
      render(<ResumeCard resume={createMockResume()} />);

      await user.click(screen.getByRole("button", { name: /more actions/i }));

      expect(screen.queryByText("Delete")).not.toBeInTheDocument();
    });
  });

  describe("interactions", () => {
    it("should call onDelete with resume id when delete is clicked", async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();
      render(<ResumeCard resume={createMockResume()} onDelete={onDelete} />);

      await user.click(screen.getByRole("button", { name: /more actions/i }));
      await user.click(screen.getByText("Delete"));

      expect(onDelete).toHaveBeenCalledWith("resume-123");
    });

    it("should call onView with resume id when view is clicked", async () => {
      const user = userEvent.setup();
      const onView = vi.fn();
      render(<ResumeCard resume={createMockResume()} onView={onView} />);

      await user.click(screen.getByText("View"));

      expect(onView).toHaveBeenCalledWith("resume-123");
    });

    it("should call onTailor with resume id when tailor is clicked", async () => {
      const user = userEvent.setup();
      const onTailor = vi.fn();
      render(<ResumeCard resume={createMockResume()} onTailor={onTailor} />);

      await user.click(screen.getByText("Tailor"));

      expect(onTailor).toHaveBeenCalledWith("resume-123");
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

    it("should handle ISO string dates", () => {
      render(<ResumeCard resume={createMockResume({ createdAt: "2023-11-14T22:13:20.000Z" as unknown as number })} />);
      expect(screen.getByText(/Nov 14, 2023/)).toBeInTheDocument();
    });
  });

  describe("card styling", () => {
    it("should render as a Card component", () => {
      const { container } = render(<ResumeCard resume={createMockResume()} />);
      expect(container.querySelector("[data-slot='card']")).toBeInTheDocument();
    });

    it("should have group class for hover effects", () => {
      const { container } = render(<ResumeCard resume={createMockResume()} />);
      const card = container.querySelector("[data-slot='card']");
      expect(card?.className).toContain("group");
    });
  });
});
