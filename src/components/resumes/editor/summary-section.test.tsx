import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SummarySection } from "./summary-section";

describe("SummarySection", () => {
  describe("rendering", () => {
    it("should render the summary textarea", () => {
      const onChange = vi.fn();
      render(<SummarySection summary="" onChange={onChange} />);

      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("should display section title", () => {
      const onChange = vi.fn();
      render(<SummarySection summary="" onChange={onChange} />);

      // CardTitle is the visible title in the card header
      const cardTitle = document.querySelector('[data-slot="card-title"]');
      expect(cardTitle).toHaveTextContent("Professional Summary");
    });

    it("should display helper text", () => {
      const onChange = vi.fn();
      render(<SummarySection summary="" onChange={onChange} />);

      expect(screen.getByText(/write a compelling 2-4 sentence/i)).toBeInTheDocument();
    });

    it("should populate textarea with provided summary", () => {
      const onChange = vi.fn();
      const summary = "Experienced software engineer with 5+ years of expertise.";
      render(<SummarySection summary={summary} onChange={onChange} />);

      expect(screen.getByRole("textbox")).toHaveValue(summary);
    });

    it("should show placeholder text when empty", () => {
      const onChange = vi.fn();
      render(<SummarySection summary="" onChange={onChange} />);

      expect(screen.getByPlaceholderText(/brief professional summary/i)).toBeInTheDocument();
    });
  });

  describe("interactions", () => {
    it("should call onChange when text is entered", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<SummarySection summary="" onChange={onChange} />);

      const textarea = screen.getByRole("textbox");
      await user.type(textarea, "New summary text");

      expect(onChange).toHaveBeenCalled();
    });

    it("should call onChange for each character typed", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<SummarySection summary="" onChange={onChange} />);

      const textarea = screen.getByRole("textbox");
      await user.type(textarea, "Test");

      // onChange is called for each character typed
      expect(onChange).toHaveBeenCalledTimes(4);
      // Last call has just the last character since we start with empty string
      expect(onChange.mock.calls[3][0]).toBe("t");
    });
  });

  describe("disabled state", () => {
    it("should disable textarea when disabled prop is true", () => {
      const onChange = vi.fn();
      render(<SummarySection summary="Some text" onChange={onChange} disabled />);

      expect(screen.getByRole("textbox")).toBeDisabled();
    });
  });
});
