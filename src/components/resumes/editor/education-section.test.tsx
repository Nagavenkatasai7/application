import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EducationSection } from "./education-section";

const createMockEducation = () => ({
  id: "edu-1",
  institution: "Stanford University",
  degree: "Bachelor of Science",
  field: "Computer Science",
  graduationDate: "May 2020",
  gpa: "3.8/4.0",
});

describe("EducationSection", () => {
  describe("rendering", () => {
    it("should render section title", () => {
      const onChange = vi.fn();
      render(<EducationSection education={[]} onChange={onChange} />);

      expect(screen.getByText("Education")).toBeInTheDocument();
    });

    it("should show empty state when no education", () => {
      const onChange = vi.fn();
      render(<EducationSection education={[]} onChange={onChange} />);

      expect(screen.getByText(/no education added/i)).toBeInTheDocument();
    });

    it("should show Add Education button", () => {
      const onChange = vi.fn();
      render(<EducationSection education={[]} onChange={onChange} />);

      expect(screen.getByRole("button", { name: /add education/i })).toBeInTheDocument();
    });

    it("should display education when provided", () => {
      const onChange = vi.fn();
      const edu = createMockEducation();
      render(<EducationSection education={[edu]} onChange={onChange} />);

      expect(screen.getByDisplayValue(edu.institution)).toBeInTheDocument();
      expect(screen.getByDisplayValue(edu.degree)).toBeInTheDocument();
      expect(screen.getByDisplayValue(edu.field)).toBeInTheDocument();
    });

    it("should display gpa and graduation date", () => {
      const onChange = vi.fn();
      const edu = createMockEducation();
      render(<EducationSection education={[edu]} onChange={onChange} />);

      expect(screen.getByDisplayValue(edu.graduationDate)).toBeInTheDocument();
      expect(screen.getByDisplayValue(edu.gpa!)).toBeInTheDocument();
    });

    it("should show education number label", () => {
      const onChange = vi.fn();
      const edu = createMockEducation();
      render(<EducationSection education={[edu]} onChange={onChange} />);

      expect(screen.getByText("Education 1")).toBeInTheDocument();
    });
  });

  describe("interactions", () => {
    it("should call onChange when Add Education is clicked", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<EducationSection education={[]} onChange={onChange} />);

      await user.click(screen.getByRole("button", { name: /add education/i }));

      expect(onChange).toHaveBeenCalledTimes(1);
      const newEducation = onChange.mock.calls[0][0];
      expect(newEducation).toHaveLength(1);
      expect(newEducation[0]).toHaveProperty("id");
      expect(newEducation[0]).toHaveProperty("institution");
    });

    it("should call onChange when education is removed", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const edu = createMockEducation();
      render(<EducationSection education={[edu]} onChange={onChange} />);

      await user.click(screen.getByRole("button", { name: /remove education/i }));

      expect(onChange).toHaveBeenCalled();
      const newEducation = onChange.mock.calls[0][0];
      expect(newEducation).toHaveLength(0);
    });

    it("should call onChange when institution is updated", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const edu = createMockEducation();
      render(<EducationSection education={[edu]} onChange={onChange} />);

      const institutionInput = screen.getByDisplayValue(edu.institution);
      await user.clear(institutionInput);
      await user.type(institutionInput, "MIT");

      expect(onChange).toHaveBeenCalled();
    });

    it("should call onChange when degree is updated", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const edu = createMockEducation();
      render(<EducationSection education={[edu]} onChange={onChange} />);

      const degreeInput = screen.getByDisplayValue(edu.degree);
      await user.clear(degreeInput);
      await user.type(degreeInput, "Master of Science");

      expect(onChange).toHaveBeenCalled();
    });
  });

  describe("disabled state", () => {
    it("should disable Add Education button when disabled", () => {
      const onChange = vi.fn();
      render(<EducationSection education={[]} onChange={onChange} disabled />);

      expect(screen.getByRole("button", { name: /add education/i })).toBeDisabled();
    });

    it("should disable inputs when disabled", () => {
      const onChange = vi.fn();
      const edu = createMockEducation();
      render(<EducationSection education={[edu]} onChange={onChange} disabled />);

      expect(screen.getByDisplayValue(edu.institution)).toBeDisabled();
      expect(screen.getByDisplayValue(edu.degree)).toBeDisabled();
      expect(screen.getByDisplayValue(edu.field)).toBeDisabled();
    });
  });

  describe("multiple education entries", () => {
    it("should render multiple education entries", () => {
      const onChange = vi.fn();
      const edu1 = createMockEducation();
      const edu2 = { ...createMockEducation(), id: "edu-2", institution: "MIT", degree: "Master of Science" };
      render(<EducationSection education={[edu1, edu2]} onChange={onChange} />);

      expect(screen.getByText("Education 1")).toBeInTheDocument();
      expect(screen.getByText("Education 2")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Stanford University")).toBeInTheDocument();
      expect(screen.getByDisplayValue("MIT")).toBeInTheDocument();
    });
  });
});
