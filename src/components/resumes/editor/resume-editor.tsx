"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { ResumeContent } from "@/lib/validations/resume";

// Loading skeleton for editor sections
function SectionSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-2/3" />
      </CardContent>
    </Card>
  );
}

// Lazy load editor sections - each section is a separate chunk
const ContactSection = dynamic(
  () => import("./contact-section").then((mod) => ({ default: mod.ContactSection })),
  { loading: () => <SectionSkeleton /> }
);

const SummarySection = dynamic(
  () => import("./summary-section").then((mod) => ({ default: mod.SummarySection })),
  { loading: () => <SectionSkeleton /> }
);

const ExperienceSection = dynamic(
  () => import("./experience-section").then((mod) => ({ default: mod.ExperienceSection })),
  { loading: () => <SectionSkeleton /> }
);

const EducationSection = dynamic(
  () => import("./education-section").then((mod) => ({ default: mod.EducationSection })),
  { loading: () => <SectionSkeleton /> }
);

const SkillsSection = dynamic(
  () => import("./skills-section").then((mod) => ({ default: mod.SkillsSection })),
  { loading: () => <SectionSkeleton /> }
);

const ProjectsSection = dynamic(
  () => import("./projects-section").then((mod) => ({ default: mod.ProjectsSection })),
  { loading: () => <SectionSkeleton /> }
);

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
