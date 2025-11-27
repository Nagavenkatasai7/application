import type { ResumeContent } from "@/lib/validations/resume";

/**
 * AI Prompt Templates for Resume Operations
 * All prompts are designed to work with Claude models
 */

/**
 * System prompt for resume tailoring operations
 * Instructs the AI to optimize a resume for a specific job
 */
export const RESUME_TAILORING_SYSTEM_PROMPT = `You are an expert resume consultant with 15+ years of experience helping professionals land their dream jobs. Your role is to tailor resumes to specific job descriptions while maintaining authenticity and professionalism.

Guidelines:
1. NEVER fabricate experience or skills the candidate doesn't have
2. Reorder and emphasize relevant experience for the target role
3. Use keywords from the job description naturally where applicable
4. Quantify achievements where possible (%, $, time saved, etc.)
5. Keep bullet points concise (1-2 lines max)
6. Use strong action verbs at the start of each bullet
7. Ensure ATS compatibility with standard section headings
8. Maintain the candidate's authentic voice while optimizing for impact

Output Format:
Return the tailored resume as valid JSON matching the provided schema. Do not include any explanatory text outside the JSON.`;

/**
 * User prompt template for resume tailoring
 */
export function buildResumeTailoringPrompt(
  resume: ResumeContent,
  jobDescription: string,
  jobTitle: string,
  companyName: string,
  requirements?: string[],
  skills?: string[]
): string {
  const requirementsText = requirements?.length
    ? `\nKey Requirements:\n${requirements.map((r) => `- ${r}`).join("\n")}`
    : "";

  const skillsText = skills?.length
    ? `\nRequired Skills:\n${skills.map((s) => `- ${s}`).join("\n")}`
    : "";

  return `Please tailor the following resume for this job opportunity:

## Target Job
- **Position:** ${jobTitle}
- **Company:** ${companyName}
${requirementsText}
${skillsText}

## Job Description
${jobDescription}

## Current Resume
\`\`\`json
${JSON.stringify(resume, null, 2)}
\`\`\`

## Instructions
1. Tailor the summary to highlight relevant experience for ${jobTitle} at ${companyName}
2. Reorder experience bullets to prioritize relevant achievements
3. Optimize bullet points using keywords from the job description
4. Ensure skills section highlights relevant technical and soft skills
5. Keep all factual information accurate - do not add fabricated experience

Return the tailored resume as a JSON object with the same schema as the input.`;
}

/**
 * System prompt for skill extraction from job descriptions
 */
export const SKILL_EXTRACTION_SYSTEM_PROMPT = `You are an expert technical recruiter who specializes in identifying required skills from job descriptions. Your task is to extract and categorize skills accurately.

Guidelines:
1. Identify both explicit and implicit skill requirements
2. Categorize skills into: technical, soft, tools/platforms, and domain knowledge
3. Distinguish between required vs. nice-to-have skills
4. Include specific versions or variants when mentioned (e.g., "Python 3.x", "React 18+")
5. Do not infer skills that aren't mentioned or implied

Output Format:
Return a JSON object with the following structure:
{
  "required": {
    "technical": ["skill1", "skill2"],
    "soft": ["skill1", "skill2"],
    "tools": ["tool1", "tool2"],
    "domain": ["area1", "area2"]
  },
  "preferred": {
    "technical": ["skill1", "skill2"],
    "soft": ["skill1", "skill2"],
    "tools": ["tool1", "tool2"],
    "domain": ["area1", "area2"]
  }
}`;

/**
 * User prompt template for skill extraction
 */
export function buildSkillExtractionPrompt(
  jobDescription: string,
  jobTitle: string
): string {
  return `Extract all required and preferred skills from this ${jobTitle} job description:

${jobDescription}

Return a JSON object categorizing skills into required vs preferred, and by type (technical, soft, tools, domain).`;
}

/**
 * System prompt for professional summary generation
 */
export const SUMMARY_GENERATION_SYSTEM_PROMPT = `You are a professional resume writer specializing in crafting compelling professional summaries. Your summaries are concise, impactful, and tailored to specific roles.

Guidelines:
1. Keep summaries to 2-4 sentences (50-100 words)
2. Lead with years of experience and primary expertise
3. Include 2-3 key achievements or areas of impact
4. Mention relevant technical skills naturally
5. End with value proposition or career goal if space allows
6. Use industry-appropriate terminology
7. Avoid clichés like "results-driven" or "team player"
8. Write in first person without using "I" (e.g., "Software engineer with...")

Output Format:
Return only the summary text, no JSON wrapper or additional commentary.`;

/**
 * User prompt template for summary generation
 */
export function buildSummaryGenerationPrompt(
  resume: ResumeContent,
  targetRole?: string,
  targetCompany?: string
): string {
  const targetContext = targetRole
    ? `\n\nTarget Role: ${targetRole}${targetCompany ? ` at ${targetCompany}` : ""}`
    : "";

  return `Generate a professional summary for this candidate:

## Current Experience
${resume.experiences
  .slice(0, 3)
  .map((exp) => `- ${exp.title} at ${exp.company} (${exp.startDate} - ${exp.endDate || "Present"})`)
  .join("\n")}

## Education
${resume.education
  .slice(0, 2)
  .map((edu) => `- ${edu.degree} in ${edu.field} from ${edu.institution}`)
  .join("\n")}

## Key Skills
- Technical: ${resume.skills.technical.slice(0, 8).join(", ")}
- Soft: ${resume.skills.soft.slice(0, 5).join(", ")}
${targetContext}

Write a compelling 2-4 sentence professional summary that highlights their most relevant qualifications.`;
}

/**
 * System prompt for bullet point optimization
 */
export const BULLET_OPTIMIZATION_SYSTEM_PROMPT = `You are an expert resume writer who transforms ordinary job descriptions into impactful achievement statements. Your optimized bullets clearly communicate value and impact.

Guidelines:
1. Start each bullet with a strong action verb
2. Include quantifiable metrics where possible (%, $, time, scale)
3. Follow the CAR format: Challenge → Action → Result
4. Keep bullets to 1-2 lines (10-20 words ideal)
5. Use industry-specific keywords naturally
6. Avoid passive voice and weak verbs
7. Don't fabricate metrics - only quantify if data is provided or can be reasonably estimated
8. Maintain technical accuracy

Strong Action Verbs by Category:
- Leadership: Directed, Orchestrated, Spearheaded, Championed
- Technical: Architected, Engineered, Implemented, Optimized
- Achievement: Achieved, Exceeded, Delivered, Accelerated
- Innovation: Pioneered, Transformed, Modernized, Redesigned
- Collaboration: Partnered, Facilitated, Coordinated, Mentored

Output Format:
Return a JSON array of optimized bullet strings.`;

/**
 * User prompt template for bullet optimization
 */
export function buildBulletOptimizationPrompt(
  bullets: string[],
  jobTitle: string,
  targetRole?: string,
  targetSkills?: string[]
): string {
  const skillsContext = targetSkills?.length
    ? `\nTarget Role Skills to Emphasize: ${targetSkills.join(", ")}`
    : "";

  return `Optimize these experience bullets for a ${jobTitle} position:

Original Bullets:
${bullets.map((b, i) => `${i + 1}. ${b}`).join("\n")}

${targetRole ? `Target Role: ${targetRole}` : ""}${skillsContext}

Transform each bullet into an impactful achievement statement using the CAR format (Challenge → Action → Result). Return a JSON array of optimized bullet strings in the same order.`;
}

/**
 * System prompt for job match analysis
 */
export const JOB_MATCH_ANALYSIS_SYSTEM_PROMPT = `You are an expert career counselor and ATS (Applicant Tracking System) specialist. Your task is to analyze how well a candidate's resume matches a job description and provide actionable recommendations.

Guidelines:
1. Calculate match scores objectively based on skill alignment
2. Identify specific gaps and strengths
3. Provide actionable recommendations for improvement
4. Consider both hard and soft skill requirements
5. Account for transferable skills and equivalent experience
6. Be constructive but honest about gaps

Output Format:
Return a JSON object with the following structure:
{
  "overallScore": 0-100,
  "breakdown": {
    "technicalSkills": 0-100,
    "experience": 0-100,
    "education": 0-100,
    "softSkills": 0-100
  },
  "strengths": ["strength1", "strength2"],
  "gaps": ["gap1", "gap2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "keywordMatches": ["keyword1", "keyword2"],
  "missingKeywords": ["keyword1", "keyword2"]
}`;

/**
 * User prompt template for job match analysis
 */
export function buildJobMatchAnalysisPrompt(
  resume: ResumeContent,
  jobDescription: string,
  jobTitle: string,
  companyName: string,
  requirements?: string[],
  skills?: string[]
): string {
  const requirementsText = requirements?.length
    ? `\nRequired Qualifications:\n${requirements.map((r) => `- ${r}`).join("\n")}`
    : "";

  const skillsText = skills?.length
    ? `\nRequired Skills:\n${skills.map((s) => `- ${s}`).join("\n")}`
    : "";

  return `Analyze how well this resume matches the job requirements:

## Job Details
- **Position:** ${jobTitle}
- **Company:** ${companyName}
${requirementsText}
${skillsText}

## Job Description
${jobDescription}

## Candidate Resume
\`\`\`json
${JSON.stringify(resume, null, 2)}
\`\`\`

Provide a detailed match analysis with:
1. Overall match score (0-100)
2. Breakdown by category (technical skills, experience, education, soft skills)
3. Key strengths that align with the role
4. Gaps or missing qualifications
5. Actionable recommendations to improve the match
6. Keywords from the job description found in the resume
7. Important keywords missing from the resume`;
}

/**
 * Response type for job match analysis
 */
export interface JobMatchAnalysisResult {
  overallScore: number;
  breakdown: {
    technicalSkills: number;
    experience: number;
    education: number;
    softSkills: number;
  };
  strengths: string[];
  gaps: string[];
  recommendations: string[];
  keywordMatches: string[];
  missingKeywords: string[];
}

/**
 * Response type for skill extraction
 */
export interface SkillExtractionResult {
  required: {
    technical: string[];
    soft: string[];
    tools: string[];
    domain: string[];
  };
  preferred: {
    technical: string[];
    soft: string[];
    tools: string[];
    domain: string[];
  };
}

/**
 * System prompt for parsing resume text into structured format
 */
export const RESUME_PARSING_SYSTEM_PROMPT = `You are an expert resume parser with deep understanding of various resume formats and section naming conventions. Your task is to extract structured information from raw resume text.

Guidelines:
1. Extract ALL information present in the resume - do not skip any sections
2. Recognize different section names (e.g., "Work Experience", "Professional Experience", "Employment History" are all experience sections)
3. Handle various date formats (e.g., "Jan 2020", "January 2020", "01/2020", "2020")
4. Generate unique IDs for experiences, education, projects, and bullets using format: "exp-1", "edu-1", "proj-1", "bullet-1" etc.
5. Extract skills even if they appear in different sections (e.g., "Technical Skills", "Core Competencies", "Technologies")
6. Parse contact information from header/top of resume
7. If a section is not present in the resume, use empty array or empty string
8. Preserve the original text of bullet points - do not summarize or modify

Common Section Name Mappings:
- Experience: "Work Experience", "Professional Experience", "Employment", "Career History", "Relevant Experience"
- Education: "Education", "Academic Background", "Qualifications", "Academic Credentials"
- Skills: "Skills", "Technical Skills", "Core Competencies", "Technologies", "Expertise", "Proficiencies"
- Projects: "Projects", "Personal Projects", "Key Projects", "Notable Projects"
- Summary: "Summary", "Professional Summary", "Profile", "Objective", "About Me"

Output Format:
Return ONLY valid JSON matching the ResumeContent schema. No explanatory text.`;

/**
 * User prompt template for resume parsing
 */
export function buildResumeParsingPrompt(extractedText: string): string {
  return `Parse the following resume text into a structured JSON format:

## Resume Text
${extractedText}

## Required Output Schema
{
  "contact": {
    "name": "string (full name)",
    "email": "string (email address)",
    "phone": "string (optional)",
    "linkedin": "string (optional, LinkedIn URL or username)",
    "github": "string (optional, GitHub URL or username)",
    "location": "string (optional, city/state/country)"
  },
  "summary": "string (professional summary or objective, if present)",
  "experiences": [
    {
      "id": "string (e.g., 'exp-1')",
      "company": "string (company name)",
      "title": "string (job title)",
      "location": "string (optional)",
      "startDate": "string (e.g., 'Jan 2020')",
      "endDate": "string (e.g., 'Present' or 'Dec 2023')",
      "bullets": [
        {
          "id": "string (e.g., 'bullet-1')",
          "text": "string (achievement/responsibility)"
        }
      ]
    }
  ],
  "education": [
    {
      "id": "string (e.g., 'edu-1')",
      "institution": "string (school/university name)",
      "degree": "string (e.g., 'Bachelor of Science')",
      "field": "string (major/field of study)",
      "graduationDate": "string (e.g., 'May 2020')",
      "gpa": "string (optional)"
    }
  ],
  "skills": {
    "technical": ["string (programming languages, frameworks, tools)"],
    "soft": ["string (soft skills like leadership, communication)"],
    "languages": ["string (spoken languages, optional)"],
    "certifications": ["string (professional certifications, optional)"]
  },
  "projects": [
    {
      "id": "string (e.g., 'proj-1')",
      "name": "string (project name)",
      "description": "string (project description)",
      "technologies": ["string (technologies used)"],
      "link": "string (optional, project URL)"
    }
  ]
}

IMPORTANT:
- Return ONLY the JSON object, no markdown code blocks or explanatory text
- All arrays should be empty [] if no data is found for that section
- Use empty string "" for missing required string fields
- Generate sequential IDs (exp-1, exp-2, bullet-1, bullet-2, etc.)`;
}

/**
 * Helper to format resume content for prompts
 */
export function formatResumeForPrompt(resume: ResumeContent): string {
  const sections: string[] = [];

  // Contact
  sections.push(`## Contact
Name: ${resume.contact.name}
Email: ${resume.contact.email}
${resume.contact.phone ? `Phone: ${resume.contact.phone}` : ""}
${resume.contact.location ? `Location: ${resume.contact.location}` : ""}`);

  // Summary
  if (resume.summary) {
    sections.push(`## Summary\n${resume.summary}`);
  }

  // Experience
  if (resume.experiences.length > 0) {
    const expLines = resume.experiences.map((exp) => {
      const bullets = exp.bullets.map((b) => `  - ${b.text}`).join("\n");
      return `### ${exp.title} at ${exp.company}
${exp.location ? `Location: ${exp.location}` : ""}
${exp.startDate} - ${exp.endDate || "Present"}
${bullets}`;
    });
    sections.push(`## Experience\n${expLines.join("\n\n")}`);
  }

  // Education
  if (resume.education.length > 0) {
    const eduLines = resume.education.map(
      (edu) =>
        `- ${edu.degree} in ${edu.field}, ${edu.institution} (${edu.graduationDate})${edu.gpa ? ` - GPA: ${edu.gpa}` : ""}`
    );
    sections.push(`## Education\n${eduLines.join("\n")}`);
  }

  // Skills
  const skillLines: string[] = [];
  if (resume.skills.technical.length > 0) {
    skillLines.push(`Technical: ${resume.skills.technical.join(", ")}`);
  }
  if (resume.skills.soft.length > 0) {
    skillLines.push(`Soft: ${resume.skills.soft.join(", ")}`);
  }
  if (resume.skills.languages?.length) {
    skillLines.push(`Languages: ${resume.skills.languages.join(", ")}`);
  }
  if (resume.skills.certifications?.length) {
    skillLines.push(`Certifications: ${resume.skills.certifications.join(", ")}`);
  }
  if (skillLines.length > 0) {
    sections.push(`## Skills\n${skillLines.join("\n")}`);
  }

  // Projects
  if (resume.projects?.length) {
    const projLines = resume.projects.map(
      (proj) =>
        `### ${proj.name}
${proj.description}
Technologies: ${proj.technologies.join(", ")}${proj.link ? `\nLink: ${proj.link}` : ""}`
    );
    sections.push(`## Projects\n${projLines.join("\n\n")}`);
  }

  return sections.join("\n\n");
}
