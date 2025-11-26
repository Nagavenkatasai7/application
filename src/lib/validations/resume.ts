import { z } from "zod";

// Maximum file size: 10MB
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed MIME types for PDF
export const ALLOWED_MIME_TYPES = ["application/pdf"];

// Schema for resume content structure (matching editor-store.ts)
export const resumeContentSchema = z.object({
  contact: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
    location: z.string().optional(),
  }),
  summary: z.string().optional(),
  experiences: z.array(
    z.object({
      id: z.string(),
      company: z.string(),
      title: z.string(),
      location: z.string().optional(),
      startDate: z.string(),
      endDate: z.string().optional(),
      bullets: z.array(
        z.object({
          id: z.string(),
          text: z.string(),
          isModified: z.boolean().optional(),
        })
      ),
    })
  ),
  education: z.array(
    z.object({
      id: z.string(),
      institution: z.string(),
      degree: z.string(),
      field: z.string(),
      graduationDate: z.string(),
      gpa: z.string().optional(),
    })
  ),
  skills: z.object({
    technical: z.array(z.string()),
    soft: z.array(z.string()),
    languages: z.array(z.string()).optional(),
    certifications: z.array(z.string()).optional(),
  }),
  projects: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        technologies: z.array(z.string()),
        link: z.string().optional(),
      })
    )
    .optional(),
});

export type ResumeContent = z.infer<typeof resumeContentSchema>;

// Schema for creating a resume manually
export const createResumeSchema = z.object({
  name: z
    .string()
    .min(1, "Resume name is required")
    .max(200, "Resume name must be less than 200 characters"),
  content: resumeContentSchema.optional().default({
    contact: { name: "", email: "" },
    experiences: [],
    education: [],
    skills: { technical: [], soft: [] },
  }),
  templateId: z.string().optional(),
  isMaster: z.boolean().optional().default(false),
});

export type CreateResumeInput = z.infer<typeof createResumeSchema>;

// Schema for uploading a PDF resume
export const uploadResumeSchema = z.object({
  name: z
    .string()
    .min(1, "Resume name is required")
    .max(200, "Resume name must be less than 200 characters"),
});

export type UploadResumeInput = z.infer<typeof uploadResumeSchema>;

// File validation helper
export function validatePdfFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: "No file provided" };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: "Only PDF files are allowed" };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    };
  }

  return { valid: true };
}

// Schema for resume response from API
export const resumeResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  content: z.unknown(), // JSON content
  templateId: z.string().nullable(),
  isMaster: z.boolean().nullable(),
  originalFileName: z.string().nullable(),
  fileSize: z.number().nullable(),
  extractedText: z.string().nullable(),
  createdAt: z.union([z.string(), z.date(), z.number()]),
  updatedAt: z.union([z.string(), z.date(), z.number()]),
});

export type ResumeResponse = z.infer<typeof resumeResponseSchema>;
