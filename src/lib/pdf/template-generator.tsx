/**
 * Template-Aware PDF Generator
 *
 * Generates PDFs that preserve the visual style from the original template analysis.
 * Uses dynamic styles based on the extracted template properties.
 */

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
  Link,
} from "@react-pdf/renderer";
import type { ResumeContent } from "@/lib/validations/resume";
import type { TemplateAnalysis } from "./template-analyzer";
import { DEFAULT_TEMPLATE } from "./template-analyzer";

/**
 * Create dynamic styles based on template analysis
 */
// Helper to convert header style to React-PDF textAlign value
function toTextAlign(headerStyle: "centered" | "left" | "right"): "center" | "left" | "right" {
  if (headerStyle === "centered") return "center";
  return headerStyle;
}

function createTemplateStyles(template: TemplateAnalysis) {
  const { colors, fonts, spacing, layout } = template;

  return StyleSheet.create({
    page: {
      paddingTop: spacing.margins.top,
      paddingRight: spacing.margins.right,
      paddingBottom: spacing.margins.bottom,
      paddingLeft: spacing.margins.left,
      fontSize: fonts.body.size,
      fontFamily: "Helvetica", // React-PDF limited font support
      lineHeight: spacing.lineHeight,
      backgroundColor: colors.background,
    },
    // Header / Contact Section
    header: {
      marginBottom: spacing.sectionGap,
      borderBottomWidth: layout.sectionSeparator === "line" ? 1 : 0,
      borderBottomColor: colors.lineColor,
      paddingBottom: layout.sectionSeparator === "line" ? 12 : 0,
      textAlign: toTextAlign(layout.headerStyle),
    },
    name: {
      fontSize: fonts.heading.size,
      fontWeight: fonts.heading.weight === "bold" ? "bold" : "normal",
      fontFamily: fonts.heading.weight === "bold" ? "Helvetica-Bold" : "Helvetica",
      marginBottom: 6,
      color: colors.primary,
    },
    contactRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      justifyContent: layout.headerStyle === "centered" ? "center" as const : "flex-start" as const,
    },
    contactItem: {
      fontSize: fonts.accent.size,
      color: colors.text,
      marginRight: 12,
    },
    contactLink: {
      fontSize: fonts.accent.size,
      color: colors.accent,
      textDecoration: "none",
      marginRight: 12,
    },
    // Section styles
    section: {
      marginBottom: spacing.sectionGap,
    },
    sectionTitle: {
      fontSize: fonts.subheading.size,
      fontWeight: fonts.subheading.weight === "bold" ? "bold" : "normal",
      fontFamily: fonts.subheading.weight === "bold" ? "Helvetica-Bold" : "Helvetica",
      marginBottom: spacing.itemGap,
      color: colors.secondary,
      textTransform: "uppercase",
      borderBottomWidth: layout.sectionSeparator === "line" ? 0.5 : 0,
      borderBottomColor: colors.lineColor,
      paddingBottom: layout.sectionSeparator === "line" ? 2 : 0,
    },
    // Summary
    summary: {
      fontSize: fonts.body.size,
      color: colors.text,
      textAlign: "justify",
    },
    // Experience
    experienceItem: {
      marginBottom: spacing.itemGap,
    },
    experienceHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 2,
    },
    jobTitle: {
      fontSize: fonts.subheading.size,
      fontWeight: "bold",
      fontFamily: "Helvetica-Bold",
      color: colors.primary,
    },
    dateRange: {
      fontSize: fonts.accent.size,
      color: colors.secondary,
    },
    companyRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    company: {
      fontSize: fonts.body.size,
      fontStyle: "italic",
      color: colors.text,
    },
    location: {
      fontSize: fonts.accent.size,
      color: colors.secondary,
    },
    bulletList: {
      paddingLeft: 12,
    },
    bulletItem: {
      flexDirection: "row",
      marginBottom: 2,
    },
    bullet: {
      width: 8,
      fontSize: fonts.body.size,
      color: colors.text,
    },
    bulletText: {
      flex: 1,
      fontSize: fonts.body.size - 1,
      color: colors.text,
    },
    // Education
    educationItem: {
      marginBottom: spacing.itemGap,
    },
    educationHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 2,
    },
    institution: {
      fontSize: fonts.subheading.size,
      fontWeight: "bold",
      fontFamily: "Helvetica-Bold",
      color: colors.primary,
    },
    degree: {
      fontSize: fonts.body.size,
      color: colors.text,
    },
    gpa: {
      fontSize: fonts.accent.size,
      color: colors.secondary,
    },
    // Skills
    skillsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 4,
    },
    skillCategory: {
      marginBottom: 4,
    },
    skillCategoryTitle: {
      fontSize: fonts.body.size,
      fontWeight: "bold",
      fontFamily: "Helvetica-Bold",
      color: colors.primary,
    },
    skillsList: {
      fontSize: fonts.body.size - 1,
      color: colors.text,
    },
    // Projects
    projectItem: {
      marginBottom: spacing.itemGap,
    },
    projectHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 2,
    },
    projectName: {
      fontSize: fonts.subheading.size,
      fontWeight: "bold",
      fontFamily: "Helvetica-Bold",
      color: colors.primary,
    },
    projectLink: {
      fontSize: fonts.accent.size,
      color: colors.accent,
      textDecoration: "none",
    },
    projectDescription: {
      fontSize: fonts.body.size - 1,
      color: colors.text,
      marginBottom: 2,
    },
    projectTech: {
      fontSize: fonts.accent.size - 1,
      color: colors.secondary,
      fontStyle: "italic",
    },
  });
}

// Get bullet character based on style
function getBulletChar(style: string): string {
  switch (style) {
    case "disc":
      return "\u2022"; // bullet
    case "circle":
      return "\u25CB"; // white circle
    case "square":
      return "\u25A0"; // black square
    case "dash":
      return "-";
    default:
      return "\u2022";
  }
}

/**
 * Contact Section Component
 */
function ContactSection({
  contact,
  styles,
}: {
  contact: ResumeContent["contact"];
  styles: ReturnType<typeof createTemplateStyles>;
}) {
  const contactItems: React.ReactNode[] = [];

  if (contact.email) {
    contactItems.push(
      <Link key="email" src={`mailto:${contact.email}`} style={styles.contactLink}>
        {contact.email}
      </Link>
    );
  }
  if (contact.phone) {
    contactItems.push(
      <Text key="phone" style={styles.contactItem}>
        {contact.phone}
      </Text>
    );
  }
  if (contact.location) {
    contactItems.push(
      <Text key="location" style={styles.contactItem}>
        {contact.location}
      </Text>
    );
  }
  if (contact.linkedin) {
    const linkedinUrl = contact.linkedin.startsWith("http")
      ? contact.linkedin
      : `https://${contact.linkedin}`;
    contactItems.push(
      <Link key="linkedin" src={linkedinUrl} style={styles.contactLink}>
        LinkedIn
      </Link>
    );
  }
  if (contact.github) {
    const githubUrl = contact.github.startsWith("http")
      ? contact.github
      : `https://${contact.github}`;
    contactItems.push(
      <Link key="github" src={githubUrl} style={styles.contactLink}>
        GitHub
      </Link>
    );
  }

  return (
    <View style={styles.header}>
      <Text style={styles.name}>{contact.name}</Text>
      <View style={styles.contactRow}>{contactItems}</View>
    </View>
  );
}

/**
 * Summary Section Component
 */
function SummarySection({
  summary,
  styles,
}: {
  summary?: string;
  styles: ReturnType<typeof createTemplateStyles>;
}) {
  if (!summary) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Professional Summary</Text>
      <Text style={styles.summary}>{summary}</Text>
    </View>
  );
}

/**
 * Experience Section Component
 */
function ExperienceSection({
  experiences,
  styles,
  bulletStyle,
}: {
  experiences: ResumeContent["experiences"];
  styles: ReturnType<typeof createTemplateStyles>;
  bulletStyle: string;
}) {
  if (!experiences || experiences.length === 0) return null;

  const bulletChar = getBulletChar(bulletStyle);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Experience</Text>
      {experiences.map((exp) => (
        <View key={exp.id} style={styles.experienceItem}>
          <View style={styles.experienceHeader}>
            <Text style={styles.jobTitle}>{exp.title}</Text>
            <Text style={styles.dateRange}>
              {exp.startDate} - {exp.endDate || "Present"}
            </Text>
          </View>
          <View style={styles.companyRow}>
            <Text style={styles.company}>{exp.company}</Text>
            {exp.location && <Text style={styles.location}>{exp.location}</Text>}
          </View>
          {exp.bullets && exp.bullets.length > 0 && (
            <View style={styles.bulletList}>
              {exp.bullets.map((bullet) => (
                <View key={bullet.id} style={styles.bulletItem}>
                  <Text style={styles.bullet}>{bulletChar}</Text>
                  <Text style={styles.bulletText}>{bullet.text}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

/**
 * Education Section Component
 */
function EducationSection({
  education,
  styles,
}: {
  education: ResumeContent["education"];
  styles: ReturnType<typeof createTemplateStyles>;
}) {
  if (!education || education.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Education</Text>
      {education.map((edu) => (
        <View key={edu.id} style={styles.educationItem}>
          <View style={styles.educationHeader}>
            <Text style={styles.institution}>{edu.institution}</Text>
            <Text style={styles.dateRange}>{edu.graduationDate}</Text>
          </View>
          <Text style={styles.degree}>
            {edu.degree} in {edu.field}
          </Text>
          {edu.gpa && <Text style={styles.gpa}>GPA: {edu.gpa}</Text>}
        </View>
      ))}
    </View>
  );
}

/**
 * Skills Section Component
 */
function SkillsSection({
  skills,
  styles,
}: {
  skills: ResumeContent["skills"];
  styles: ReturnType<typeof createTemplateStyles>;
}) {
  const hasSkills =
    (skills.technical && skills.technical.length > 0) ||
    (skills.soft && skills.soft.length > 0) ||
    (skills.languages && skills.languages.length > 0) ||
    (skills.certifications && skills.certifications.length > 0);

  if (!hasSkills) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Skills</Text>
      {skills.technical && skills.technical.length > 0 && (
        <View style={styles.skillCategory}>
          <Text style={styles.skillsList}>
            <Text style={styles.skillCategoryTitle}>Technical: </Text>
            {skills.technical.join(", ")}
          </Text>
        </View>
      )}
      {skills.soft && skills.soft.length > 0 && (
        <View style={styles.skillCategory}>
          <Text style={styles.skillsList}>
            <Text style={styles.skillCategoryTitle}>Soft Skills: </Text>
            {skills.soft.join(", ")}
          </Text>
        </View>
      )}
      {skills.languages && skills.languages.length > 0 && (
        <View style={styles.skillCategory}>
          <Text style={styles.skillsList}>
            <Text style={styles.skillCategoryTitle}>Languages: </Text>
            {skills.languages.join(", ")}
          </Text>
        </View>
      )}
      {skills.certifications && skills.certifications.length > 0 && (
        <View style={styles.skillCategory}>
          <Text style={styles.skillsList}>
            <Text style={styles.skillCategoryTitle}>Certifications: </Text>
            {skills.certifications.join(", ")}
          </Text>
        </View>
      )}
    </View>
  );
}

/**
 * Projects Section Component
 */
function ProjectsSection({
  projects,
  styles,
}: {
  projects?: ResumeContent["projects"];
  styles: ReturnType<typeof createTemplateStyles>;
}) {
  if (!projects || projects.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Projects</Text>
      {projects.map((project) => (
        <View key={project.id} style={styles.projectItem}>
          <View style={styles.projectHeader}>
            <Text style={styles.projectName}>{project.name}</Text>
            {project.link && (
              <Link src={project.link} style={styles.projectLink}>
                View Project
              </Link>
            )}
          </View>
          <Text style={styles.projectDescription}>{project.description}</Text>
          {project.technologies && project.technologies.length > 0 && (
            <Text style={styles.projectTech}>
              Technologies: {project.technologies.join(", ")}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}

/**
 * Map section name to component
 */
function renderSection(
  sectionName: string,
  content: ResumeContent,
  styles: ReturnType<typeof createTemplateStyles>,
  bulletStyle: string
): React.ReactNode {
  switch (sectionName) {
    case "header":
      return <ContactSection key="header" contact={content.contact} styles={styles} />;
    case "summary":
      return <SummarySection key="summary" summary={content.summary} styles={styles} />;
    case "experience":
      return (
        <ExperienceSection
          key="experience"
          experiences={content.experiences}
          styles={styles}
          bulletStyle={bulletStyle}
        />
      );
    case "education":
      return (
        <EducationSection key="education" education={content.education} styles={styles} />
      );
    case "skills":
      return <SkillsSection key="skills" skills={content.skills} styles={styles} />;
    case "projects":
      return (
        <ProjectsSection key="projects" projects={content.projects} styles={styles} />
      );
    default:
      return null;
  }
}

/**
 * Template-Aware Resume PDF Document Component
 */
function TemplatedResumePDFDocument({
  content,
  template,
}: {
  content: ResumeContent;
  template: TemplateAnalysis;
}) {
  const styles = createTemplateStyles(template);
  const bulletStyle = template.sections.bulletStyle;

  // Render sections in the order specified by the template
  const sections = template.sections.order.map((sectionName) =>
    renderSection(sectionName, content, styles, bulletStyle)
  );

  // Add any sections that weren't in the template order
  const allSections = ["header", "summary", "experience", "education", "skills", "projects"];
  const missingSections = allSections.filter(
    (s) => !template.sections.order.includes(s)
  );
  missingSections.forEach((sectionName) => {
    const section = renderSection(sectionName, content, styles, bulletStyle);
    if (section) {
      sections.push(section);
    }
  });

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {sections}
      </Page>
    </Document>
  );
}

/**
 * Generate a PDF buffer from resume content using template styles
 *
 * @param content - The resume content to render
 * @param template - The template analysis to apply (optional, uses default if not provided)
 * @returns Buffer containing the PDF data
 */
export async function generateTemplatedResumePdf(
  content: ResumeContent,
  template?: TemplateAnalysis | null
): Promise<Buffer> {
  // Use provided template or fall back to default
  const templateToUse = template || DEFAULT_TEMPLATE;

  // Validate required fields
  if (!content.contact || !content.contact.name || !content.contact.email) {
    throw new Error("Resume must have contact name and email");
  }

  // Render the PDF to a buffer
  const pdfBuffer = await renderToBuffer(
    <TemplatedResumePDFDocument content={content} template={templateToUse} />
  );

  return Buffer.from(pdfBuffer);
}
