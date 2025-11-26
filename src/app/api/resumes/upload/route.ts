import { NextResponse } from "next/server";
import { db, resumes } from "@/lib/db";
import { getOrCreateLocalUser } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import { extractTextFromPdf } from "@/lib/pdf/parser";
import { MAX_FILE_SIZE, ALLOWED_MIME_TYPES } from "@/lib/validations/resume";

// POST /api/resumes/upload - Upload a PDF resume
export async function POST(request: Request) {
  try {
    const user = await getOrCreateLocalUser();

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
      // Continue without extracted text - not a fatal error
    }

    // Generate resume name from filename or use provided name
    const resumeName =
      name || file.name.replace(/\.pdf$/i, "") || "Untitled Resume";

    // Create resume record
    const newResume = {
      id: uuidv4(),
      userId: user.id,
      name: resumeName,
      content: {
        contact: { name: "", email: "" },
        experiences: [],
        education: [],
        skills: { technical: [], soft: [] },
      },
      originalFileName: file.name,
      fileSize: file.size,
      extractedText: extractedText || null,
    };

    await db.insert(resumes).values(newResume);

    // Fetch the created resume
    const [createdResume] = await db
      .select()
      .from(resumes)
      .where(eq(resumes.id, newResume.id));

    return NextResponse.json(
      { success: true, data: createdResume },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error uploading resume:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "UPLOAD_ERROR", message: "Failed to upload resume" },
      },
      { status: 500 }
    );
  }
}
