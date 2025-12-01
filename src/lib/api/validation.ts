/**
 * API Request Validation Utilities
 *
 * Provides consistent request validation across all API routes.
 */

import { z } from "zod";
import { validationErrorResponse } from "./responses";

/**
 * Parse and validate request body with a Zod schema
 * Returns the parsed data or a validation error response
 */
export async function parseRequestBody<T extends z.ZodType>(
  request: Request,
  schema: T
): Promise<{ success: true; data: z.infer<T> } | { success: false; response: Response }> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join(", ");
      return {
        success: false,
        response: validationErrorResponse(errors),
      };
    }

    return { success: true, data: result.data };
  } catch {
    return {
      success: false,
      response: validationErrorResponse("Invalid JSON body"),
    };
  }
}

/**
 * Sanitize a filename to prevent path traversal attacks
 * Removes directory components and dangerous characters
 */
export function sanitizeFilename(filename: string): string {
  // Handle empty/whitespace input
  if (!filename || !filename.trim()) {
    return "untitled";
  }

  // Remove any path components (directory traversal prevention)
  const basename = filename.split(/[/\\]/).pop() || "";

  // Remove or replace dangerous characters
  // Allow: alphanumeric, dots, hyphens, underscores, spaces
  const sanitized = basename
    .replace(/[<>:"|?*]/g, "") // Remove Windows-forbidden chars
    .replace(/\.{2,}/g, ".") // Collapse multiple dots to single dot
    .replace(/^\.+/, "") // Remove leading dots
    .trim();

  // Ensure we have a valid filename
  return sanitized || "untitled";
}

/**
 * User update schema for /api/users/me PATCH
 */
export const userUpdateSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less")
    .optional(),
  email: z
    .string()
    .email("Invalid email format")
    .max(255, "Email must be 255 characters or less")
    .optional(),
});
export type UserUpdate = z.infer<typeof userUpdateSchema>;

/**
 * Job create schema for /api/jobs POST
 */
export const jobCreateSchema = z.object({
  platform: z
    .enum([
      "linkedin",
      "indeed",
      "glassdoor",
      "greenhouse",
      "lever",
      "workday",
      "icims",
      "smartrecruiters",
      "manual",
    ])
    .default("manual"),
  externalId: z.string().nullable().optional(),
  title: z.string().min(1, "Job title is required").max(500),
  companyId: z.string().nullable().optional(),
  companyName: z.string().max(200).nullable().optional(),
  location: z.string().max(200).nullable().optional(),
  description: z.string().nullable().optional(),
  requirements: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  salary: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      currency: z.string().default("USD"),
    })
    .nullable()
    .optional(),
  postedAt: z.string().datetime().nullable().optional(),
});
export type JobCreate = z.infer<typeof jobCreateSchema>;
