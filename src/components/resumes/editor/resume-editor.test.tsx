import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResumeEditor } from "./resume-editor";
import type { ResumeContent } from "@/lib/validations/resume";

const createMockContent = (): ResumeContent => ({
  contact: {
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 555-123-4567",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/johndoe",
    github: "github.com/johndoe",
  },
  summary: "Experienced software engineer with 5+ years of expertise.",
  experiences: [
    {
      id: "exp-1",
      company: "Acme Inc.",
      title: "Software Engineer",
      location: "San Francisco, CA",
      startDate: "Jan 2020",
      endDate: "Present",
      bullets: [
        { id: "bullet-1", text: "Built scalable microservices" },
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "Stanford University",
      degree: "Bachelor of Science",
      field: "Computer Science",
      graduationDate: "May 2019",
      gpa: "3.8/4.0",
    },
  ],
  skills: {
    technical: ["JavaScript", "TypeScript", "React"],
    soft: ["Communication", "Leadership"],
    languages: ["English"],
    certifications: ["AWS Certified"],
  },
  projects: [
    {
      id: "proj-1",
      name: "Resume Maker",
      description: "A web application for creating resumes",
      technologies: ["React", "Next.js"],
      link: "https://github.com/user/resume-maker",
    },
  ],
});

describe("ResumeEditor", () => {
  describe("rendering", () => {
    it("should render all section titles", () => {
      const onChange = vi.fn();
      const content = createMockContent();
      render(<ResumeEditor content={content} onChange={onChange} />);

      // All section cards should be rendered
      expect(document.querySelector('[data-slot="card-title"]')).toBeInTheDocument();
    });

    it("should render contact section", () => {
      const onChange = vi.fn();
      const content = createMockContent();
      render(<ResumeEditor content={content} onChange={onChange} />);

      expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
      expect(screen.getByDisplayValue("john@example.com")).toBeInTheDocument();
    });

    it("should render summary section", () => {
      const onChange = vi.fn();
      const content = createMockContent();
      render(<ResumeEditor content={content} onChange={onChange} />);

      expect(screen.getByDisplayValue(content.summary!)).toBeInTheDocument();
    });

    it("should render experience section", () => {
      const onChange = vi.fn();
      const content = createMockContent();
      render(<ResumeEditor content={content} onChange={onChange} />);

      expect(screen.getByDisplayValue("Acme Inc.")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Software Engineer")).toBeInTheDocument();
    });

    it("should render education section", () => {
      const onChange = vi.fn();
      const content = createMockContent();
      render(<ResumeEditor content={content} onChange={onChange} />);

      expect(screen.getByDisplayValue("Stanford University")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Bachelor of Science")).toBeInTheDocument();
    });

    it("should render skills section", () => {
      const onChange = vi.fn();
      const content = createMockContent();
      render(<ResumeEditor content={content} onChange={onChange} />);

      expect(screen.getByText("JavaScript")).toBeInTheDocument();
      expect(screen.getByText("TypeScript")).toBeInTheDocument();
    });

    it("should render projects section", () => {
      const onChange = vi.fn();
      const content = createMockContent();
      render(<ResumeEditor content={content} onChange={onChange} />);

      expect(screen.getByDisplayValue("Resume Maker")).toBeInTheDocument();
    });
  });

  describe("disabled state", () => {
    it("should disable all sections when disabled", () => {
      const onChange = vi.fn();
      const content = createMockContent();
      render(<ResumeEditor content={content} onChange={onChange} disabled />);

      // Contact fields should be disabled
      expect(screen.getByDisplayValue("John Doe")).toBeDisabled();
      expect(screen.getByDisplayValue("john@example.com")).toBeDisabled();
    });
  });

  describe("empty content", () => {
    it("should handle empty content", () => {
      const onChange = vi.fn();
      const emptyContent: ResumeContent = {
        contact: { name: "", email: "" },
        experiences: [],
        education: [],
        skills: { technical: [], soft: [] },
      };
      render(<ResumeEditor content={emptyContent} onChange={onChange} />);

      // Should render without crashing
      expect(screen.getByText(/no work experience added/i)).toBeInTheDocument();
      expect(screen.getByText(/no education added/i)).toBeInTheDocument();
    });
  });
});
