/**
 * Tests for Checkbox Component
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Checkbox } from "./checkbox";

describe("Checkbox Component", () => {
  describe("rendering", () => {
    it("should render checkbox", () => {
      render(<Checkbox aria-label="Test checkbox" />);

      expect(screen.getByRole("checkbox")).toBeInTheDocument();
    });

    it("should render with custom className", () => {
      render(<Checkbox className="custom-class" aria-label="Test" />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveClass("custom-class");
    });

    it("should have data-slot attribute", () => {
      render(<Checkbox aria-label="Test" />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("data-slot", "checkbox");
    });
  });

  describe("states", () => {
    it("should be unchecked by default", () => {
      render(<Checkbox aria-label="Test" />);

      expect(screen.getByRole("checkbox")).not.toBeChecked();
    });

    it("should render as checked when defaultChecked", () => {
      render(<Checkbox defaultChecked aria-label="Test" />);

      expect(screen.getByRole("checkbox")).toBeChecked();
    });

    it("should be controlled when checked prop is passed", () => {
      render(<Checkbox checked={true} aria-label="Test" />);

      expect(screen.getByRole("checkbox")).toBeChecked();
    });

    it("should render as disabled", () => {
      render(<Checkbox disabled aria-label="Test" />);

      expect(screen.getByRole("checkbox")).toBeDisabled();
    });
  });

  describe("interactions", () => {
    it("should call onCheckedChange when clicked", () => {
      const onCheckedChange = vi.fn();
      render(<Checkbox onCheckedChange={onCheckedChange} aria-label="Test" />);

      fireEvent.click(screen.getByRole("checkbox"));

      expect(onCheckedChange).toHaveBeenCalledWith(true);
    });

    it("should toggle state on click", () => {
      render(<Checkbox defaultChecked={false} aria-label="Test" />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).not.toBeChecked();

      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();

      fireEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it("should not call onCheckedChange when disabled", () => {
      const onCheckedChange = vi.fn();
      render(
        <Checkbox
          disabled
          onCheckedChange={onCheckedChange}
          aria-label="Test"
        />
      );

      fireEvent.click(screen.getByRole("checkbox"));

      expect(onCheckedChange).not.toHaveBeenCalled();
    });
  });

  describe("accessibility", () => {
    it("should support aria-label", () => {
      render(<Checkbox aria-label="Accept terms" />);

      expect(screen.getByLabelText("Accept terms")).toBeInTheDocument();
    });

    it("should support aria-describedby", () => {
      render(
        <>
          <Checkbox aria-describedby="description" aria-label="Test" />
          <span id="description">This is a description</span>
        </>
      );

      expect(screen.getByRole("checkbox")).toHaveAttribute(
        "aria-describedby",
        "description"
      );
    });

    it("should be focusable via keyboard", () => {
      render(<Checkbox aria-label="Test" />);

      const checkbox = screen.getByRole("checkbox");
      checkbox.focus();

      expect(checkbox).toHaveFocus();
    });
  });
});
