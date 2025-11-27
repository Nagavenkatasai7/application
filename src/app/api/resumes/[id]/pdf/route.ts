import { NextResponse } from "next/server";
import { db, resumes } from "@/lib/db";
import { getOrCreateLocalUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import {
  generateResumePdf,
  generatePdfFilename,
  PDFGenerationError,
} from "@/lib/pdf/generator";
import type { ResumeContent } from "@/lib/validations/resume";

/**
 * GET /api/resumes/:id/pdf - Generate and download resume as PDF
 *
 * Response: PDF file binary with appropriate headers
 *
 * Error Codes:
 * - RESUME_NOT_FOUND: Resume doesn't exist or user doesn't own it
 * - INVALID_RESUME: Resume has no content to export
 * - GENERATION_ERROR: Failed to generate PDF
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: resumeId } = await params;
    const user = await getOrCreateLocalUser();

    // Fetch the resume and verify ownership
    const [resume] = await db
      .select()
      .from(resumes)
      .where(and(eq(resumes.id, resumeId), eq(resumes.userId, user.id)));

    if (!resume) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "RESUME_NOT_FOUND", message: "Resume not found" },
        },
        { status: 404 }
      );
    }

    // Ensure we have valid resume content
    const resumeContent = resume.content as ResumeContent | null;
    if (!resumeContent || !resumeContent.contact) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_RESUME",
            message: "Resume has no content to export",
          },
        },
        { status: 400 }
      );
    }

    // Generate the PDF
    const pdfBuffer = await generateResumePdf(resumeContent);
    const filename = generatePdfFilename(resumeContent);

    // Return the PDF as a downloadable file
    // Convert Buffer to Uint8Array for NextResponse compatibility
    const pdfData = new Uint8Array(pdfBuffer);

    return new NextResponse(pdfData, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.length.toString(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);

    // Handle PDFGenerationError with specific error codes
    if (error instanceof PDFGenerationError) {
      const statusMap: Record<string, number> = {
        INVALID_CONTENT: 400,
        GENERATION_ERROR: 500,
      };

      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status: statusMap[error.code] || 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "PDF_ERROR",
          message: "Failed to generate PDF",
        },
      },
      { status: 500 }
    );
  }
}
