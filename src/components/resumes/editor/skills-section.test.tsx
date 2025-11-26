import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SkillsSection } from "./skills-section";

const createMockSkills = () => ({
  technical: ["JavaScript", "TypeScript", "React"],
  soft: ["Communication", "Leadership"],
  languages: ["English", "Spanish"],
  certifications: ["AWS Certified"],
});

describe("SkillsSection", () => {
  describe("rendering", () => {
    it("should render section title", () => {
      const onChange = vi.fn();
      render(<SkillsSection skills={{ technical: [], soft: [] }} onChange={onChange} />);

      expect(screen.getByText("Skills")).toBeInTheDocument();
    });

    it("should render all skill category labels", () => {
      const onChange = vi.fn();
      render(<SkillsSection skills={{ technical: [], soft: [] }} onChange={onChange} />);

      expect(screen.getByText("Technical Skills")).toBeInTheDocument();
      expect(screen.getByText("Soft Skills")).toBeInTheDocument();
      expect(screen.getByText("Languages")).toBeInTheDocument();
      expect(screen.getByText("Certifications")).toBeInTheDocument();
    });

    it("should display skills as badges", () => {
      const onChange = vi.fn();
      const skills = createMockSkills();
      render(<SkillsSection skills={skills} onChange={onChange} />);

      expect(screen.getByText("JavaScript")).toBeInTheDocument();
      expect(screen.getByText("TypeScript")).toBeInTheDocument();
      expect(screen.getByText("React")).toBeInTheDocument();
      expect(screen.getByText("Communication")).toBeInTheDocument();
      expect(screen.getByText("Leadership")).toBeInTheDocument();
    });

    it("should show placeholder text when no skills", () => {
      const onChange = vi.fn();
      render(<SkillsSection skills={{ technical: [], soft: [] }} onChange={onChange} />);

      const placeholders = screen.getAllByPlaceholderText(/type and press enter/i);
      expect(placeholders.length).toBeGreaterThan(0);
    });

    it("should show description text for each category", () => {
      const onChange = vi.fn();
      render(<SkillsSection skills={{ technical: [], soft: [] }} onChange={onChange} />);

      expect(screen.getByText(/programming languages, frameworks/i)).toBeInTheDocument();
      expect(screen.getByText(/communication, leadership/i)).toBeInTheDocument();
    });
  });

  describe("interactions", () => {
    it("should call onChange when skill is added via Enter", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<SkillsSection skills={{ technical: [], soft: [] }} onChange={onChange} />);

      const technicalInput = screen.getByLabelText("Technical Skills");
      await user.type(technicalInput, "Python{enter}");

      expect(onChange).toHaveBeenCalled();
      const newSkills = onChange.mock.calls[onChange.mock.calls.length - 1][0];
      expect(newSkills.technical).toContain("Python");
    });

    it("should call onChange when skill is added via comma", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<SkillsSection skills={{ technical: [], soft: [] }} onChange={onChange} />);

      const technicalInput = screen.getByLabelText("Technical Skills");
      await user.type(technicalInput, "Go,");

      expect(onChange).toHaveBeenCalled();
      const newSkills = onChange.mock.calls[onChange.mock.calls.length - 1][0];
      expect(newSkills.technical).toContain("Go");
    });

    it("should call onChange when skill is removed", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const skills = createMockSkills();
      render(<SkillsSection skills={skills} onChange={onChange} />);

      const removeButton = screen.getByRole("button", { name: /remove javascript/i });
      await user.click(removeButton);

      expect(onChange).toHaveBeenCalled();
      const newSkills = onChange.mock.calls[0][0];
      expect(newSkills.technical).not.toContain("JavaScript");
    });

    it("should not add duplicate skills", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const skills = { technical: ["JavaScript"], soft: [] };
      render(<SkillsSection skills={skills} onChange={onChange} />);

      const technicalInput = screen.getByLabelText("Technical Skills");
      await user.type(technicalInput, "JavaScript{enter}");

      // When trying to add a duplicate skill, the addSkill function checks
      // if the skill already exists and doesn't call onChange if it's a duplicate.
      // The input gets cleared but no change occurs.
      // We verify that after all interactions, there's still only one "JavaScript"
      // If onChange was called, it should not have added a duplicate
      if (onChange.mock.calls.length > 0) {
        onChange.mock.calls.forEach((call) => {
          const techSkills = call[0].technical;
          expect(techSkills.filter((s: string) => s === "JavaScript")).toHaveLength(1);
        });
      }
      // The key assertion is that we don't have duplicate skills
      expect(screen.getAllByText("JavaScript")).toHaveLength(1);
    });

    it("should add skill on blur if input has value", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<SkillsSection skills={{ technical: [], soft: [] }} onChange={onChange} />);

      const technicalInput = screen.getByLabelText("Technical Skills");
      await user.type(technicalInput, "Ruby");
      await user.tab(); // blur

      expect(onChange).toHaveBeenCalled();
      const newSkills = onChange.mock.calls[onChange.mock.calls.length - 1][0];
      expect(newSkills.technical).toContain("Ruby");
    });
  });

  describe("disabled state", () => {
    it("should disable inputs when disabled", () => {
      const onChange = vi.fn();
      render(<SkillsSection skills={{ technical: [], soft: [] }} onChange={onChange} disabled />);

      expect(screen.getByLabelText("Technical Skills")).toBeDisabled();
      expect(screen.getByLabelText("Soft Skills")).toBeDisabled();
    });

    it("should not show remove buttons when disabled", () => {
      const onChange = vi.fn();
      const skills = createMockSkills();
      render(<SkillsSection skills={skills} onChange={onChange} disabled />);

      expect(screen.queryByRole("button", { name: /remove javascript/i })).not.toBeInTheDocument();
    });
  });

  describe("languages and certifications", () => {
    it("should display languages", () => {
      const onChange = vi.fn();
      const skills = createMockSkills();
      render(<SkillsSection skills={skills} onChange={onChange} />);

      expect(screen.getByText("English")).toBeInTheDocument();
      expect(screen.getByText("Spanish")).toBeInTheDocument();
    });

    it("should display certifications", () => {
      const onChange = vi.fn();
      const skills = createMockSkills();
      render(<SkillsSection skills={skills} onChange={onChange} />);

      expect(screen.getByText("AWS Certified")).toBeInTheDocument();
    });

    it("should handle undefined languages and certifications", () => {
      const onChange = vi.fn();
      const skills = { technical: ["JS"], soft: ["Team"] };
      render(<SkillsSection skills={skills} onChange={onChange} />);

      // Should not throw and should render properly
      expect(screen.getByText("Skills")).toBeInTheDocument();
    });
  });
});
