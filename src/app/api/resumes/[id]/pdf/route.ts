import { NextResponse } from "next/server";
import { db, resumes } from "@/lib/db";
import { getOrCreateLocalUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import {
  generateResumePdf,
  generatePdfFilename,
  PDFGenerationError,
} from "@/lib/pdf/generator";
import { generateTemplatedResumePdf } from "@/lib/pdf/template-generator";
import type { TemplateAnalysis } from "@/lib/pdf/template-analyzer";
import type { ResumeContent } from "@/lib/validations/resume";

// PDF generation type options
type PdfType = "standard" | "templated" | "original";

/**
 * GET /api/resumes/:id/pdf - Generate and download resume as PDF
 *
 * Query Parameters:
 * - type: "standard" | "templated" | "original" (default: "standard")
 *   - standard: Use default ATS-friendly styles
 *   - templated: Use analyzed template styles from uploaded PDF
 *   - original: Download the original uploaded PDF (if available)
 *
 * Response: PDF file binary with appropriate headers
 *
 * Error Codes:
 * - RESUME_NOT_FOUND: Resume doesn't exist or user doesn't own it
 * - INVALID_RESUME: Resume has no content to export
 * - ORIGINAL_NOT_AVAILABLE: Original PDF not stored for this resume
 * - GENERATION_ERROR: Failed to generate PDF
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: resumeId } = await params;
    const user = await getOrCreateLocalUser();

    // Parse query parameters
    const url = new URL(request.url);
    const pdfType = (url.searchParams.get("type") || "standard") as PdfType;

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

    // Handle original PDF download
    if (pdfType === "original") {
      if (!resume.originalPdfUrl) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "ORIGINAL_NOT_AVAILABLE",
              message: "Original PDF is not available for this resume",
            },
          },
          { status: 404 }
        );
      }

      // Fetch the original PDF from Vercel Blob
      const response = await fetch(resume.originalPdfUrl);
      if (!response.ok) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "FETCH_ERROR",
              message: "Failed to fetch original PDF",
            },
          },
          { status: 500 }
        );
      }

      const pdfBuffer = await response.arrayBuffer();
      const filename = resume.originalFileName || "resume-original.pdf";

      return new NextResponse(new Uint8Array(pdfBuffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Content-Length": pdfBuffer.byteLength.toString(),
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    }

    // Ensure we have valid resume content for generated PDFs
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

    // Generate the PDF based on type
    let pdfBuffer: Buffer;
    let filename: string;

    if (pdfType === "templated" && resume.templateAnalysis) {
      // Use template-aware generator with stored analysis
      const templateAnalysis = resume.templateAnalysis as TemplateAnalysis;
      pdfBuffer = await generateTemplatedResumePdf(resumeContent, templateAnalysis);
      filename = generatePdfFilename(resumeContent).replace(".pdf", "-templated.pdf");
    } else {
      // Use standard ATS-friendly generator
      pdfBuffer = await generateResumePdf(resumeContent);
      filename = generatePdfFilename(resumeContent);
    }

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
