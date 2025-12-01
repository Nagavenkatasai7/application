/**
 * Tests for RadioGroup Component
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RadioGroup, RadioGroupItem } from "./radio-group";

describe("RadioGroup Component", () => {
  describe("rendering", () => {
    it("should render radio group", () => {
      render(
        <RadioGroup aria-label="Test group">
          <RadioGroupItem value="option1" id="option1" />
          <RadioGroupItem value="option2" id="option2" />
        </RadioGroup>
      );

      expect(screen.getByRole("radiogroup")).toBeInTheDocument();
      expect(screen.getAllByRole("radio")).toHaveLength(2);
    });

    it("should render with custom className", () => {
      render(
        <RadioGroup className="custom-class" aria-label="Test">
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      expect(screen.getByRole("radiogroup")).toHaveClass("custom-class");
    });

    it("should have data-slot attribute on group", () => {
      render(
        <RadioGroup aria-label="Test">
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      expect(screen.getByRole("radiogroup")).toHaveAttribute(
        "data-slot",
        "radio-group"
      );
    });

    it("should have data-slot attribute on items", () => {
      render(
        <RadioGroup aria-label="Test">
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      expect(screen.getByRole("radio")).toHaveAttribute(
        "data-slot",
        "radio-group-item"
      );
    });
  });

  describe("states", () => {
    it("should have no selection by default", () => {
      render(
        <RadioGroup aria-label="Test">
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );

      const radios = screen.getAllByRole("radio");
      radios.forEach((radio) => {
        expect(radio).not.toBeChecked();
      });
    });

    it("should render with defaultValue selected", () => {
      render(
        <RadioGroup defaultValue="option2" aria-label="Test">
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );

      const radios = screen.getAllByRole("radio");
      expect(radios[0]).not.toBeChecked();
      expect(radios[1]).toBeChecked();
    });

    it("should be controlled when value prop is passed", () => {
      render(
        <RadioGroup value="option1" aria-label="Test">
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );

      expect(screen.getAllByRole("radio")[0]).toBeChecked();
    });

    it("should render disabled items", () => {
      render(
        <RadioGroup aria-label="Test">
          <RadioGroupItem value="option1" disabled />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );

      const radios = screen.getAllByRole("radio");
      expect(radios[0]).toBeDisabled();
      expect(radios[1]).not.toBeDisabled();
    });

    it("should disable all items when group is disabled", () => {
      render(
        <RadioGroup disabled aria-label="Test">
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );

      const radios = screen.getAllByRole("radio");
      radios.forEach((radio) => {
        expect(radio).toBeDisabled();
      });
    });
  });

  describe("interactions", () => {
    it("should call onValueChange when selection changes", () => {
      const onValueChange = vi.fn();
      render(
        <RadioGroup onValueChange={onValueChange} aria-label="Test">
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );

      fireEvent.click(screen.getAllByRole("radio")[1]);

      expect(onValueChange).toHaveBeenCalledWith("option2");
    });

    it("should update selection when clicking different option", () => {
      render(
        <RadioGroup defaultValue="option1" aria-label="Test">
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );

      const radios = screen.getAllByRole("radio");
      expect(radios[0]).toBeChecked();

      fireEvent.click(radios[1]);

      expect(radios[0]).not.toBeChecked();
      expect(radios[1]).toBeChecked();
    });

    it("should not call onValueChange when clicking disabled item", () => {
      const onValueChange = vi.fn();
      render(
        <RadioGroup onValueChange={onValueChange} aria-label="Test">
          <RadioGroupItem value="option1" disabled />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );

      fireEvent.click(screen.getAllByRole("radio")[0]);

      expect(onValueChange).not.toHaveBeenCalled();
    });
  });

  describe("accessibility", () => {
    it("should support aria-label on group", () => {
      render(
        <RadioGroup aria-label="Select an option">
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      expect(screen.getByRole("radiogroup")).toHaveAttribute(
        "aria-label",
        "Select an option"
      );
    });

    it("should support id on items", () => {
      render(
        <RadioGroup aria-label="Test">
          <RadioGroupItem value="option1" id="my-radio" />
        </RadioGroup>
      );

      expect(screen.getByRole("radio")).toHaveAttribute("id", "my-radio");
    });

    it("should be focusable via keyboard", () => {
      render(
        <RadioGroup aria-label="Test">
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );

      const radio = screen.getAllByRole("radio")[0];
      radio.focus();

      expect(radio).toHaveFocus();
    });
  });

  describe("RadioGroupItem", () => {
    it("should render with custom className", () => {
      render(
        <RadioGroup aria-label="Test">
          <RadioGroupItem value="option1" className="custom-item-class" />
        </RadioGroup>
      );

      expect(screen.getByRole("radio")).toHaveClass("custom-item-class");
    });

    it("should pass through additional props", () => {
      render(
        <RadioGroup aria-label="Test">
          <RadioGroupItem value="option1" data-testid="custom-radio" />
        </RadioGroup>
      );

      expect(screen.getByTestId("custom-radio")).toBeInTheDocument();
    });
  });
});
