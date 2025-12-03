import { NextResponse } from "next/server";
import { db, resumes } from "@/lib/db";
import { requireAuth, getUserById } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { put } from "@vercel/blob";
import { extractTextFromPdf } from "@/lib/pdf/parser";
import { analyzeTemplateFromText } from "@/lib/pdf/template-analyzer";
import { MAX_FILE_SIZE, ALLOWED_MIME_TYPES } from "@/lib/validations/resume";
import { parseResumeText } from "@/lib/ai/resume-parser";
import { isAIConfigured } from "@/lib/ai/config";
import { sanitizeFilename } from "@/lib/api";
import type { ResumeContent } from "@/lib/validations/resume";

// Check if Vercel Blob is configured
function isBlobConfigured(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

// Allow up to 3 minutes for PDF extraction and AI parsing
// Vercel Fluid Compute on Hobby plan supports up to 300s
export const maxDuration = 180;

// POST /api/resumes/upload - Upload a PDF resume
export async function POST(request: Request) {
  try {
    // Authenticate user using modern auth pattern
    const authUser = await requireAuth();
    const user = await getUserById(authUser.id);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "USER_NOT_FOUND", message: "User not found" },
        },
        { status: 404 }
      );
    }

    // Parse FormData
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const name = formData.get("name") as string | null;

    // Validate file presence
    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NO_FILE", message: "No file provided" },
        },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "INVALID_TYPE", message: "Only PDF files are allowed" },
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FILE_TOO_LARGE",
            message: `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
          },
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text from PDF
    let extractedText = "";
    try {
      extractedText = await extractTextFromPdf(buffer);
    } catch (error) {
      console.error("Error extracting text from PDF:", error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PDF_EXTRACTION_FAILED",
            message:
              "Could not extract text from PDF. The file may be corrupted or password-protected.",
          },
        },
        { status: 400 }
      );
    }

    // Default content structure
    let parsedContent: ResumeContent = {
      contact: { name: "", email: "" },
      experiences: [],
      education: [],
      skills: { technical: [], soft: [] },
    };

    // Try to parse resume content using AI if text was extracted and AI is configured
    let aiParsingFailed = false;
    let aiErrorMessage = "";

    if (extractedText && isAIConfigured()) {
      try {
        parsedContent = await parseResumeText(extractedText);
        console.log("Successfully parsed resume with AI");
      } catch (error) {
        console.error("Error parsing resume with AI:", error);
        aiParsingFailed = true;
        aiErrorMessage =
          error instanceof Error ? error.message : "AI parsing failed";
        // Continue with default empty content - user can edit manually
      }
    }

    // Sanitize the uploaded filename to prevent path traversal
    const safeFileName = sanitizeFilename(file.name);

    // Generate resume name from filename, parsed name, or use provided name
    const resumeName =
      name ||
      (parsedContent.contact.name && parsedContent.contact.name.trim()) ||
      safeFileName.replace(/\.pdf$/i, "") ||
      "Untitled Resume";

    // Generate resume ID upfront for blob path
    const resumeId = uuidv4();

    // Store original PDF in Vercel Blob for template preservation
    let originalPdfUrl: string | null = null;
    if (isBlobConfigured()) {
      try {
        const blob = await put(`resumes/${resumeId}/original.pdf`, buffer, {
          access: "public",
          contentType: "application/pdf",
        });
        originalPdfUrl = blob.url;
        console.log("Stored original PDF in Vercel Blob:", blob.url);
      } catch (error) {
        console.error("Failed to store PDF in Vercel Blob:", error);
        // Continue without blob storage - not critical for functionality
      }
    }

    // Analyze template structure from extracted text
    let templateAnalysis = null;
    if (extractedText && originalPdfUrl) {
      try {
        templateAnalysis = analyzeTemplateFromText(extractedText);
        console.log("Template analysis complete:", templateAnalysis.sections.order);
      } catch (error) {
        console.error("Template analysis failed:", error);
        // Continue without template analysis
      }
    }

    // Create resume record with timestamps
    const now = new Date();
    const newResume = {
      id: resumeId,
      userId: user.id,
      name: resumeName,
      content: parsedContent,
      originalFileName: safeFileName,
      fileSize: file.size,
      extractedText: extractedText || null,
      originalPdfUrl: originalPdfUrl,
      templateAnalysis: templateAnalysis,
      hasCustomTemplate: !!originalPdfUrl, // Mark as having custom template if PDF stored
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(resumes).values(newResume);

    // Return the newResume directly instead of SELECT to avoid replica lag
    return NextResponse.json(
      {
        success: true,
        data: newResume,
        warning: aiParsingFailed
          ? `Resume uploaded but AI parsing failed: ${aiErrorMessage}. You can edit details manually.`
          : undefined,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error uploading resume:", error);

    // Determine specific error type for better user feedback
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // Handle authentication errors
    const isAuthError = errorMessage.includes("Authentication required");
    if (isAuthError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required. Please log in.",
          },
        },
        { status: 401 }
      );
    }

    const isTimeout =
      errorMessage.includes("timeout") || errorMessage.includes("ETIMEDOUT");

    return NextResponse.json(
      {
        success: false,
        error: {
          code: isTimeout ? "UPLOAD_TIMEOUT" : "UPLOAD_ERROR",
          message: isTimeout
            ? "Resume processing timed out. Please try again with a smaller file."
            : `Failed to upload resume: ${errorMessage}`,
        },
      },
      { status: 500 }
    );
  }
}
