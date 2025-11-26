"use client";

import { ContactSection } from "./contact-section";
import { SummarySection } from "./summary-section";
import { ExperienceSection } from "./experience-section";
import { EducationSection } from "./education-section";
import { SkillsSection } from "./skills-section";
import { ProjectsSection } from "./projects-section";
import type { ResumeContent } from "@/lib/validations/resume";

interface ResumeEditorProps {
  content: ResumeContent;
  onChange: (content: ResumeContent) => void;
  disabled?: boolean;
}

const defaultContent: ResumeContent = {
  contact: { name: "", email: "" },
  summary: "",
  experiences: [],
  education: [],
  skills: { technical: [], soft: [] },
  projects: [],
};

export function ResumeEditor({ content, onChange, disabled }: ResumeEditorProps) {
  // Ensure content has all required fields with defaults
  const safeContent: ResumeContent = {
    ...defaultContent,
    ...content,
    contact: { ...defaultContent.contact, ...content?.contact },
    skills: { ...defaultContent.skills, ...content?.skills },
  };

  const updateContent = <K extends keyof ResumeContent>(
    field: K,
    value: ResumeContent[K]
  ) => {
    onChange({
      ...safeContent,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      <ContactSection
        data={safeContent.contact}
        onChange={(data) => updateContent("contact", data)}
        disabled={disabled}
      />

      <SummarySection
        summary={safeContent.summary || ""}
        onChange={(summary) => updateContent("summary", summary)}
        disabled={disabled}
      />

      <ExperienceSection
        experiences={safeContent.experiences}
        onChange={(experiences) => updateContent("experiences", experiences)}
        disabled={disabled}
      />

      <EducationSection
        education={safeContent.education}
        onChange={(education) => updateContent("education", education)}
        disabled={disabled}
      />

      <SkillsSection
        skills={safeContent.skills}
        onChange={(skills) => updateContent("skills", skills)}
        disabled={disabled}
      />

      <ProjectsSection
        projects={safeContent.projects || []}
        onChange={(projects) => updateContent("projects", projects)}
        disabled={disabled}
      />
    </div>
  );
}
