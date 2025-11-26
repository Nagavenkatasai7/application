import { NextResponse } from "next/server";
import { db, resumes } from "@/lib/db";
import { getOrCreateLocalUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

// GET /api/resumes/:id - Get a specific resume
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getOrCreateLocalUser();

    const [resume] = await db
      .select()
      .from(resumes)
      .where(and(eq(resumes.id, id), eq(resumes.userId, user.id)));

    if (!resume) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Resume not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: resume });
  } catch (error) {
    console.error("Error fetching resume:", error);
    return NextResponse.json(
      { success: false, error: { code: "FETCH_ERROR", message: "Failed to fetch resume" } },
      { status: 500 }
    );
  }
}

// PATCH /api/resumes/:id - Update a resume
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getOrCreateLocalUser();
    const body = await request.json();

    // Verify ownership
    const [existing] = await db
      .select()
      .from(resumes)
      .where(and(eq(resumes.id, id), eq(resumes.userId, user.id)));

    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Resume not found" } },
        { status: 404 }
      );
    }

    await db
      .update(resumes)
      .set({
        name: body.name ?? existing.name,
        content: body.content ?? existing.content,
        templateId: body.templateId ?? existing.templateId,
        isMaster: body.isMaster ?? existing.isMaster,
        updatedAt: new Date(),
      })
      .where(eq(resumes.id, id));

    const [updatedResume] = await db.select().from(resumes).where(eq(resumes.id, id));

    return NextResponse.json({ success: true, data: updatedResume });
  } catch (error) {
    console.error("Error updating resume:", error);
    return NextResponse.json(
      { success: false, error: { code: "UPDATE_ERROR", message: "Failed to update resume" } },
      { status: 500 }
    );
  }
}

// DELETE /api/resumes/:id - Delete a resume
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getOrCreateLocalUser();

    // Verify ownership
    const [existing] = await db
      .select()
      .from(resumes)
      .where(and(eq(resumes.id, id), eq(resumes.userId, user.id)));

    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Resume not found" } },
        { status: 404 }
      );
    }

    await db.delete(resumes).where(eq(resumes.id, id));

    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (error) {
    console.error("Error deleting resume:", error);
    return NextResponse.json(
      { success: false, error: { code: "DELETE_ERROR", message: "Failed to delete resume" } },
      { status: 500 }
    );
  }
}
