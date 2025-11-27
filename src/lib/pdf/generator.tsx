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

/**
 * PDF Generation Error
 */
export class PDFGenerationError extends Error {
  constructor(
    message: string,
    public code: string,
    public cause?: unknown
  ) {
    super(message);
    this.name = "PDFGenerationError";
  }
}

/**
 * PDF Styles - Professional ATS-friendly resume design
 */
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    lineHeight: 1.4,
  },
  // Header / Contact Section
  header: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
    paddingBottom: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
    color: "#1a1a1a",
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  contactItem: {
    fontSize: 9,
    color: "#444444",
    marginRight: 12,
  },
  contactLink: {
    fontSize: 9,
    color: "#0066cc",
    textDecoration: "none",
    marginRight: 12,
  },
  // Section styles
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
    color: "#1a1a1a",
    textTransform: "uppercase",
    borderBottomWidth: 0.5,
    borderBottomColor: "#999999",
    paddingBottom: 2,
  },
  // Summary
  summary: {
    fontSize: 10,
    color: "#333333",
    textAlign: "justify",
  },
  // Experience
  experienceItem: {
    marginBottom: 10,
  },
  experienceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  jobTitle: {
    fontSize: 11,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
    color: "#1a1a1a",
  },
  dateRange: {
    fontSize: 9,
    color: "#666666",
  },
  companyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  company: {
    fontSize: 10,
    fontStyle: "italic",
    color: "#444444",
  },
  location: {
    fontSize: 9,
    color: "#666666",
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
    fontSize: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    color: "#333333",
  },
  // Education
  educationItem: {
    marginBottom: 8,
  },
  educationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  institution: {
    fontSize: 11,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
    color: "#1a1a1a",
  },
  degree: {
    fontSize: 10,
    color: "#333333",
  },
  gpa: {
    fontSize: 9,
    color: "#666666",
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
    fontSize: 10,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
    color: "#333333",
  },
  skillsList: {
    fontSize: 9,
    color: "#444444",
  },
  // Projects
  projectItem: {
    marginBottom: 8,
  },
  projectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  projectName: {
    fontSize: 11,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
    color: "#1a1a1a",
  },
  projectLink: {
    fontSize: 9,
    color: "#0066cc",
    textDecoration: "none",
  },
  projectDescription: {
    fontSize: 9,
    color: "#333333",
    marginBottom: 2,
  },
  projectTech: {
    fontSize: 8,
    color: "#666666",
    fontStyle: "italic",
  },
});

/**
 * Contact Section Component
 */
function ContactSection({ contact }: { contact: ResumeContent["contact"] }) {
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
function SummarySection({ summary }: { summary?: string }) {
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
}: {
  experiences: ResumeContent["experiences"];
}) {
  if (!experiences || experiences.length === 0) return null;

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
                  <Text style={styles.bullet}>•</Text>
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
}: {
  education: ResumeContent["education"];
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
function SkillsSection({ skills }: { skills: ResumeContent["skills"] }) {
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
}: {
  projects?: ResumeContent["projects"];
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
 * Resume PDF Document Component
 */
function ResumePDFDocument({ content }: { content: ResumeContent }) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <ContactSection contact={content.contact} />
        <SummarySection summary={content.summary} />
        <ExperienceSection experiences={content.experiences} />
        <EducationSection education={content.education} />
        <SkillsSection skills={content.skills} />
        <ProjectsSection projects={content.projects} />
      </Page>
    </Document>
  );
}

/**
 * Generate a PDF buffer from resume content
 *
 * @param content - The resume content to render
 * @returns Buffer containing the PDF data
 * @throws PDFGenerationError if generation fails
 */
export async function generateResumePdf(
  content: ResumeContent
): Promise<Buffer> {
  try {
    // Validate required fields
    if (!content.contact || !content.contact.name || !content.contact.email) {
      throw new PDFGenerationError(
        "Resume must have contact name and email",
        "INVALID_CONTENT"
      );
    }

    // Render the PDF to a buffer
    const pdfBuffer = await renderToBuffer(
      <ResumePDFDocument content={content} />
    );

    return Buffer.from(pdfBuffer);
  } catch (error) {
    if (error instanceof PDFGenerationError) {
      throw error;
    }

    throw new PDFGenerationError(
      "Failed to generate PDF",
      "GENERATION_ERROR",
      error
    );
  }
}

/**
 * Generate a filename for the PDF based on resume content
 */
export function generatePdfFilename(content: ResumeContent): string {
  const name = content.contact.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const timestamp = new Date().toISOString().split("T")[0];
  return `${name}-resume-${timestamp}.pdf`;
}
