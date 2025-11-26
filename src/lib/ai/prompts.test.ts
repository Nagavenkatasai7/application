import { describe, it, expect } from "vitest";
import type { ResumeContent } from "@/lib/validations/resume";
import {
  RESUME_TAILORING_SYSTEM_PROMPT,
  SKILL_EXTRACTION_SYSTEM_PROMPT,
  SUMMARY_GENERATION_SYSTEM_PROMPT,
  BULLET_OPTIMIZATION_SYSTEM_PROMPT,
  JOB_MATCH_ANALYSIS_SYSTEM_PROMPT,
  buildResumeTailoringPrompt,
  buildSkillExtractionPrompt,
  buildSummaryGenerationPrompt,
  buildBulletOptimizationPrompt,
  buildJobMatchAnalysisPrompt,
  formatResumeForPrompt,
} from "./prompts";

const createMockResume = (): ResumeContent => ({
  contact: {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 555-123-4567",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/johndoe",
    github: "github.com/johndoe",
  },
  summary: "Senior Software Engineer with 8+ years of experience.",
  experiences: [
    {
      id: "exp-1",
      company: "Tech Corp",
      title: "Senior Software Engineer",
      location: "San Francisco, CA",
      startDate: "Jan 2020",
      endDate: "Present",
      bullets: [
        { id: "bullet-1", text: "Led development of microservices architecture" },
        { id: "bullet-2", text: "Improved system performance by 40%" },
      ],
    },
    {
      id: "exp-2",
      company: "Startup Inc",
      title: "Software Engineer",
      location: "Remote",
      startDate: "Jun 2018",
      endDate: "Dec 2019",
      bullets: [
        { id: "bullet-3", text: "Built RESTful APIs using Node.js" },
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "Stanford University",
      degree: "Master of Science",
      field: "Computer Science",
      graduationDate: "May 2018",
      gpa: "3.9/4.0",
    },
    {
      id: "edu-2",
      institution: "UC Berkeley",
      degree: "Bachelor of Science",
      field: "Computer Science",
      graduationDate: "May 2016",
    },
  ],
  skills: {
    technical: ["TypeScript", "React", "Node.js", "Python", "AWS"],
    soft: ["Leadership", "Communication", "Problem Solving"],
    languages: ["English", "Spanish"],
    certifications: ["AWS Solutions Architect"],
  },
  projects: [
    {
      id: "proj-1",
      name: "Open Source CLI Tool",
      description: "A command-line tool for developers",
      technologies: ["TypeScript", "Node.js"],
      link: "https://github.com/user/cli-tool",
    },
  ],
});

describe("AI Prompts", () => {
  describe("System Prompts", () => {
    it("should have non-empty system prompts", () => {
      expect(RESUME_TAILORING_SYSTEM_PROMPT.length).toBeGreaterThan(100);
      expect(SKILL_EXTRACTION_SYSTEM_PROMPT.length).toBeGreaterThan(100);
      expect(SUMMARY_GENERATION_SYSTEM_PROMPT.length).toBeGreaterThan(100);
      expect(BULLET_OPTIMIZATION_SYSTEM_PROMPT.length).toBeGreaterThan(100);
      expect(JOB_MATCH_ANALYSIS_SYSTEM_PROMPT.length).toBeGreaterThan(100);
    });

    it("resume tailoring prompt should mention key guidelines", () => {
      expect(RESUME_TAILORING_SYSTEM_PROMPT).toContain("fabricate");
      expect(RESUME_TAILORING_SYSTEM_PROMPT).toContain("action verb");
      expect(RESUME_TAILORING_SYSTEM_PROMPT).toContain("ATS");
    });

    it("skill extraction prompt should mention categorization", () => {
      expect(SKILL_EXTRACTION_SYSTEM_PROMPT).toContain("technical");
      expect(SKILL_EXTRACTION_SYSTEM_PROMPT).toContain("soft");
      expect(SKILL_EXTRACTION_SYSTEM_PROMPT).toContain("required");
      expect(SKILL_EXTRACTION_SYSTEM_PROMPT).toContain("preferred");
    });

    it("summary generation prompt should mention format guidelines", () => {
      expect(SUMMARY_GENERATION_SYSTEM_PROMPT).toContain("2-4 sentences");
      expect(SUMMARY_GENERATION_SYSTEM_PROMPT).toContain("first person");
    });

    it("bullet optimization prompt should mention CAR format", () => {
      expect(BULLET_OPTIMIZATION_SYSTEM_PROMPT).toContain("CAR");
      expect(BULLET_OPTIMIZATION_SYSTEM_PROMPT).toContain("action verb");
    });

    it("job match analysis prompt should mention scoring", () => {
      expect(JOB_MATCH_ANALYSIS_SYSTEM_PROMPT).toContain("overallScore");
      expect(JOB_MATCH_ANALYSIS_SYSTEM_PROMPT).toContain("0-100");
    });
  });

  describe("buildResumeTailoringPrompt", () => {
    it("should include resume content as JSON", () => {
      const resume = createMockResume();
      const prompt = buildResumeTailoringPrompt(
        resume,
        "We are looking for a senior engineer...",
        "Senior Engineer",
        "Acme Corp"
      );

      expect(prompt).toContain(JSON.stringify(resume, null, 2));
    });

    it("should include job details", () => {
      const resume = createMockResume();
      const prompt = buildResumeTailoringPrompt(
        resume,
        "We are looking for a senior engineer...",
        "Senior Engineer",
        "Acme Corp"
      );

      expect(prompt).toContain("Senior Engineer");
      expect(prompt).toContain("Acme Corp");
    });

    it("should include requirements when provided", () => {
      const resume = createMockResume();
      const prompt = buildResumeTailoringPrompt(
        resume,
        "Job description here",
        "Engineer",
        "Company",
        ["5+ years experience", "React expertise"]
      );

      expect(prompt).toContain("Key Requirements");
      expect(prompt).toContain("5+ years experience");
      expect(prompt).toContain("React expertise");
    });

    it("should include skills when provided", () => {
      const resume = createMockResume();
      const prompt = buildResumeTailoringPrompt(
        resume,
        "Job description here",
        "Engineer",
        "Company",
        undefined,
        ["TypeScript", "React", "Node.js"]
      );

      expect(prompt).toContain("Required Skills");
      expect(prompt).toContain("TypeScript");
      expect(prompt).toContain("Node.js");
    });

    it("should not include requirements section when not provided", () => {
      const resume = createMockResume();
      const prompt = buildResumeTailoringPrompt(
        resume,
        "Job description here",
        "Engineer",
        "Company"
      );

      expect(prompt).not.toContain("Key Requirements");
    });
  });

  describe("buildSkillExtractionPrompt", () => {
    it("should include job title and description", () => {
      const prompt = buildSkillExtractionPrompt(
        "We need a React developer with 5 years experience...",
        "Frontend Engineer"
      );

      expect(prompt).toContain("Frontend Engineer");
      expect(prompt).toContain("React developer");
    });

    it("should request JSON output", () => {
      const prompt = buildSkillExtractionPrompt(
        "Job description here",
        "Engineer"
      );

      expect(prompt).toContain("JSON");
    });
  });

  describe("buildSummaryGenerationPrompt", () => {
    it("should include experience information", () => {
      const resume = createMockResume();
      const prompt = buildSummaryGenerationPrompt(resume);

      expect(prompt).toContain("Senior Software Engineer");
      expect(prompt).toContain("Tech Corp");
    });

    it("should include education information", () => {
      const resume = createMockResume();
      const prompt = buildSummaryGenerationPrompt(resume);

      expect(prompt).toContain("Master of Science");
      expect(prompt).toContain("Stanford University");
    });

    it("should include skills", () => {
      const resume = createMockResume();
      const prompt = buildSummaryGenerationPrompt(resume);

      expect(prompt).toContain("TypeScript");
      expect(prompt).toContain("Leadership");
    });

    it("should include target role when provided", () => {
      const resume = createMockResume();
      const prompt = buildSummaryGenerationPrompt(
        resume,
        "Tech Lead",
        "Google"
      );

      expect(prompt).toContain("Target Role: Tech Lead at Google");
    });

    it("should handle missing target company", () => {
      const resume = createMockResume();
      const prompt = buildSummaryGenerationPrompt(resume, "Tech Lead");

      expect(prompt).toContain("Target Role: Tech Lead");
      // Should not have "Target Role: Tech Lead at ..." (no company appended)
      expect(prompt).not.toMatch(/Target Role: Tech Lead at /);
    });
  });

  describe("buildBulletOptimizationPrompt", () => {
    it("should include original bullets", () => {
      const bullets = [
        "Worked on the backend",
        "Fixed bugs",
        "Attended meetings",
      ];
      const prompt = buildBulletOptimizationPrompt(bullets, "Software Engineer");

      expect(prompt).toContain("1. Worked on the backend");
      expect(prompt).toContain("2. Fixed bugs");
      expect(prompt).toContain("3. Attended meetings");
    });

    it("should include job title", () => {
      const bullets = ["Developed features"];
      const prompt = buildBulletOptimizationPrompt(bullets, "Frontend Developer");

      expect(prompt).toContain("Frontend Developer");
    });

    it("should include target role when provided", () => {
      const bullets = ["Developed features"];
      const prompt = buildBulletOptimizationPrompt(
        bullets,
        "Developer",
        "Senior Developer"
      );

      expect(prompt).toContain("Target Role: Senior Developer");
    });

    it("should include target skills when provided", () => {
      const bullets = ["Developed features"];
      const prompt = buildBulletOptimizationPrompt(
        bullets,
        "Developer",
        undefined,
        ["React", "TypeScript"]
      );

      expect(prompt).toContain("Target Role Skills to Emphasize");
      expect(prompt).toContain("React, TypeScript");
    });

    it("should request JSON array output", () => {
      const bullets = ["Developed features"];
      const prompt = buildBulletOptimizationPrompt(bullets, "Developer");

      expect(prompt).toContain("JSON array");
    });
  });

  describe("buildJobMatchAnalysisPrompt", () => {
    it("should include resume and job details", () => {
      const resume = createMockResume();
      const prompt = buildJobMatchAnalysisPrompt(
        resume,
        "Looking for experienced engineers...",
        "Senior Engineer",
        "Tech Company"
      );

      expect(prompt).toContain("Senior Engineer");
      expect(prompt).toContain("Tech Company");
      expect(prompt).toContain("John Doe");
    });

    it("should include requirements when provided", () => {
      const resume = createMockResume();
      const prompt = buildJobMatchAnalysisPrompt(
        resume,
        "Job description",
        "Engineer",
        "Company",
        ["Bachelor's degree", "3+ years experience"]
      );

      expect(prompt).toContain("Required Qualifications");
      expect(prompt).toContain("Bachelor's degree");
    });

    it("should include skills when provided", () => {
      const resume = createMockResume();
      const prompt = buildJobMatchAnalysisPrompt(
        resume,
        "Job description",
        "Engineer",
        "Company",
        undefined,
        ["Python", "SQL", "AWS"]
      );

      expect(prompt).toContain("Required Skills");
      expect(prompt).toContain("Python");
      expect(prompt).toContain("AWS");
    });

    it("should request detailed analysis", () => {
      const resume = createMockResume();
      const prompt = buildJobMatchAnalysisPrompt(
        resume,
        "Job description",
        "Engineer",
        "Company"
      );

      expect(prompt).toContain("Overall match score");
      expect(prompt.toLowerCase()).toContain("strengths");
      expect(prompt.toLowerCase()).toContain("gaps");
      expect(prompt.toLowerCase()).toContain("recommendations");
    });
  });

  describe("formatResumeForPrompt", () => {
    it("should include contact information", () => {
      const resume = createMockResume();
      const formatted = formatResumeForPrompt(resume);

      expect(formatted).toContain("John Doe");
      expect(formatted).toContain("john.doe@example.com");
      expect(formatted).toContain("San Francisco, CA");
    });

    it("should include summary when present", () => {
      const resume = createMockResume();
      const formatted = formatResumeForPrompt(resume);

      expect(formatted).toContain("## Summary");
      expect(formatted).toContain("Senior Software Engineer with 8+ years");
    });

    it("should include experience with bullets", () => {
      const resume = createMockResume();
      const formatted = formatResumeForPrompt(resume);

      expect(formatted).toContain("## Experience");
      expect(formatted).toContain("Senior Software Engineer at Tech Corp");
      expect(formatted).toContain("Led development of microservices");
    });

    it("should include education", () => {
      const resume = createMockResume();
      const formatted = formatResumeForPrompt(resume);

      expect(formatted).toContain("## Education");
      expect(formatted).toContain("Master of Science");
      expect(formatted).toContain("Stanford University");
    });

    it("should include skills by category", () => {
      const resume = createMockResume();
      const formatted = formatResumeForPrompt(resume);

      expect(formatted).toContain("## Skills");
      expect(formatted).toContain("Technical: TypeScript");
      expect(formatted).toContain("Soft: Leadership");
      expect(formatted).toContain("Languages: English, Spanish");
      expect(formatted).toContain("Certifications: AWS Solutions Architect");
    });

    it("should include projects when present", () => {
      const resume = createMockResume();
      const formatted = formatResumeForPrompt(resume);

      expect(formatted).toContain("## Projects");
      expect(formatted).toContain("Open Source CLI Tool");
      expect(formatted).toContain("Technologies: TypeScript, Node.js");
    });

    it("should handle resume without optional fields", () => {
      const minimalResume: ResumeContent = {
        contact: {
          name: "Jane Smith",
          email: "jane@example.com",
        },
        experiences: [],
        education: [],
        skills: {
          technical: [],
          soft: [],
        },
      };

      const formatted = formatResumeForPrompt(minimalResume);

      expect(formatted).toContain("Jane Smith");
      expect(formatted).toContain("jane@example.com");
      expect(formatted).not.toContain("## Summary");
      expect(formatted).not.toContain("## Projects");
    });

    it("should handle empty skills arrays", () => {
      const resume: ResumeContent = {
        contact: { name: "Test", email: "test@test.com" },
        experiences: [],
        education: [],
        skills: { technical: [], soft: [] },
      };

      const formatted = formatResumeForPrompt(resume);
      // Should not crash with empty arrays
      expect(formatted).toContain("Test");
    });
  });
});
