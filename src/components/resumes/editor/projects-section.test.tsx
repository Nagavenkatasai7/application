import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProjectsSection } from "./projects-section";

const createMockProject = () => ({
  id: "proj-1",
  name: "Resume Maker",
  description: "A web application for creating professional resumes",
  technologies: ["React", "TypeScript", "Next.js"],
  link: "https://github.com/user/resume-maker",
});

describe("ProjectsSection", () => {
  describe("rendering", () => {
    it("should render section title", () => {
      const onChange = vi.fn();
      render(<ProjectsSection projects={[]} onChange={onChange} />);

      expect(screen.getByText("Projects")).toBeInTheDocument();
    });

    it("should show empty state when no projects", () => {
      const onChange = vi.fn();
      render(<ProjectsSection projects={[]} onChange={onChange} />);

      expect(screen.getByText(/no projects added/i)).toBeInTheDocument();
    });

    it("should show Add Project button", () => {
      const onChange = vi.fn();
      render(<ProjectsSection projects={[]} onChange={onChange} />);

      expect(screen.getByRole("button", { name: /add project/i })).toBeInTheDocument();
    });

    it("should display project when provided", () => {
      const onChange = vi.fn();
      const project = createMockProject();
      render(<ProjectsSection projects={[project]} onChange={onChange} />);

      expect(screen.getByDisplayValue(project.name)).toBeInTheDocument();
      expect(screen.getByDisplayValue(project.description)).toBeInTheDocument();
      expect(screen.getByDisplayValue(project.link!)).toBeInTheDocument();
    });

    it("should display technologies as badges", () => {
      const onChange = vi.fn();
      const project = createMockProject();
      render(<ProjectsSection projects={[project]} onChange={onChange} />);

      expect(screen.getByText("React")).toBeInTheDocument();
      expect(screen.getByText("TypeScript")).toBeInTheDocument();
      expect(screen.getByText("Next.js")).toBeInTheDocument();
    });

    it("should show project number label", () => {
      const onChange = vi.fn();
      const project = createMockProject();
      render(<ProjectsSection projects={[project]} onChange={onChange} />);

      expect(screen.getByText("Project 1")).toBeInTheDocument();
    });
  });

  describe("interactions", () => {
    it("should call onChange when Add Project is clicked", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<ProjectsSection projects={[]} onChange={onChange} />);

      await user.click(screen.getByRole("button", { name: /add project/i }));

      expect(onChange).toHaveBeenCalledTimes(1);
      const newProjects = onChange.mock.calls[0][0];
      expect(newProjects).toHaveLength(1);
      expect(newProjects[0]).toHaveProperty("id");
      expect(newProjects[0]).toHaveProperty("technologies");
    });

    it("should call onChange when project is removed", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const project = createMockProject();
      render(<ProjectsSection projects={[project]} onChange={onChange} />);

      await user.click(screen.getByRole("button", { name: /remove project/i }));

      expect(onChange).toHaveBeenCalled();
      const newProjects = onChange.mock.calls[0][0];
      expect(newProjects).toHaveLength(0);
    });

    it("should call onChange when project name is updated", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const project = createMockProject();
      render(<ProjectsSection projects={[project]} onChange={onChange} />);

      const nameInput = screen.getByDisplayValue(project.name);
      await user.clear(nameInput);
      await user.type(nameInput, "New Project");

      expect(onChange).toHaveBeenCalled();
    });

    it("should call onChange when description is updated", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const project = createMockProject();
      render(<ProjectsSection projects={[project]} onChange={onChange} />);

      const descInput = screen.getByDisplayValue(project.description);
      await user.clear(descInput);
      await user.type(descInput, "New description");

      expect(onChange).toHaveBeenCalled();
    });

    it("should call onChange when technology is added", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const project = { ...createMockProject(), technologies: [] };
      render(<ProjectsSection projects={[project]} onChange={onChange} />);

      const techInput = screen.getByPlaceholderText(/type and press enter/i);
      await user.type(techInput, "Node.js{enter}");

      expect(onChange).toHaveBeenCalled();
      const newProjects = onChange.mock.calls[onChange.mock.calls.length - 1][0];
      expect(newProjects[0].technologies).toContain("Node.js");
    });

    it("should call onChange when technology is removed", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const project = createMockProject();
      render(<ProjectsSection projects={[project]} onChange={onChange} />);

      const removeButton = screen.getByRole("button", { name: /remove react/i });
      await user.click(removeButton);

      expect(onChange).toHaveBeenCalled();
      const newProjects = onChange.mock.calls[0][0];
      expect(newProjects[0].technologies).not.toContain("React");
    });
  });

  describe("disabled state", () => {
    it("should disable Add Project button when disabled", () => {
      const onChange = vi.fn();
      render(<ProjectsSection projects={[]} onChange={onChange} disabled />);

      expect(screen.getByRole("button", { name: /add project/i })).toBeDisabled();
    });

    it("should disable inputs when disabled", () => {
      const onChange = vi.fn();
      const project = createMockProject();
      render(<ProjectsSection projects={[project]} onChange={onChange} disabled />);

      expect(screen.getByDisplayValue(project.name)).toBeDisabled();
      expect(screen.getByDisplayValue(project.description)).toBeDisabled();
      expect(screen.getByDisplayValue(project.link!)).toBeDisabled();
    });

    it("should not show remove technology buttons when disabled", () => {
      const onChange = vi.fn();
      const project = createMockProject();
      render(<ProjectsSection projects={[project]} onChange={onChange} disabled />);

      expect(screen.queryByRole("button", { name: /remove react/i })).not.toBeInTheDocument();
    });
  });

  describe("multiple projects", () => {
    it("should render multiple projects", () => {
      const onChange = vi.fn();
      const proj1 = createMockProject();
      const proj2 = { ...createMockProject(), id: "proj-2", name: "Blog Platform", description: "A blog platform" };
      render(<ProjectsSection projects={[proj1, proj2]} onChange={onChange} />);

      expect(screen.getByText("Project 1")).toBeInTheDocument();
      expect(screen.getByText("Project 2")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Resume Maker")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Blog Platform")).toBeInTheDocument();
    });
  });

  describe("project link", () => {
    it("should handle empty project link", () => {
      const onChange = vi.fn();
      const project = { ...createMockProject(), link: "" };
      render(<ProjectsSection projects={[project]} onChange={onChange} />);

      // Should not throw and should render properly
      expect(screen.getByDisplayValue(project.name)).toBeInTheDocument();
    });

    it("should handle undefined project link", () => {
      const onChange = vi.fn();
      const project = { ...createMockProject(), link: undefined };
      render(<ProjectsSection projects={[project]} onChange={onChange} />);

      // Should not throw and should render properly
      expect(screen.getByDisplayValue(project.name)).toBeInTheDocument();
    });
  });
});
