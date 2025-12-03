import { db, resumes } from "@/lib/db";
import { getOrCreateLocalUser } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { NextResponse } from "next/server";
import { successResponse, errorResponse } from "@/lib/api";

// GET /api/resumes - List all resumes for current user
export async function GET() {
  try {
    const user = await getOrCreateLocalUser();

    const userResumes = await db
      .select()
      .from(resumes)
      .where(eq(resumes.userId, user.id))
      .orderBy(desc(resumes.updatedAt));

    // Return with meta object for consistency with other list endpoints
    return NextResponse.json({
      success: true,
      data: userResumes,
      meta: { total: userResumes.length },
    });
  } catch (error) {
    console.error("Error fetching resumes:", error);
    return errorResponse("FETCH_ERROR", "Failed to fetch resumes");
  }
}

// POST /api/resumes - Create a new resume
export async function POST(request: Request) {
  try {
    const user = await getOrCreateLocalUser();
    const body = await request.json();

    const newResume = {
      id: uuidv4(),
      userId: user.id,
      name: body.name || "Untitled Resume",
      content: body.content || {},
      templateId: body.templateId || null,
      isMaster: body.isMaster || false,
    };

    await db.insert(resumes).values(newResume);

    const [createdResume] = await db
      .select()
      .from(resumes)
      .where(eq(resumes.id, newResume.id));

    return successResponse(createdResume, 201);
  } catch (error) {
    console.error("Error creating resume:", error);
    return errorResponse("CREATE_ERROR", "Failed to create resume");
  }
}
