import { NextResponse } from "next/server";
import { db, applications } from "@/lib/db";
import { getOrCreateLocalUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

// GET /api/applications/:id - Get a specific application
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getOrCreateLocalUser();

    const [application] = await db
      .select()
      .from(applications)
      .where(and(eq(applications.id, id), eq(applications.userId, user.id)));

    if (!application) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Application not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: application });
  } catch (error) {
    console.error("Error fetching application:", error);
    return NextResponse.json(
      { success: false, error: { code: "FETCH_ERROR", message: "Failed to fetch application" } },
      { status: 500 }
    );
  }
}

// PATCH /api/applications/:id - Update an application
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
      .from(applications)
      .where(and(eq(applications.id, id), eq(applications.userId, user.id)));

    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Application not found" } },
        { status: 404 }
      );
    }

    await db
      .update(applications)
      .set({
        status: body.status ?? existing.status,
        resumeId: body.resumeId ?? existing.resumeId,
        appliedAt: body.appliedAt ? new Date(body.appliedAt) : existing.appliedAt,
        notes: body.notes ?? existing.notes,
        updatedAt: new Date(),
      })
      .where(eq(applications.id, id));

    const [updatedApplication] = await db
      .select()
      .from(applications)
      .where(eq(applications.id, id));

    return NextResponse.json({ success: true, data: updatedApplication });
  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json(
      { success: false, error: { code: "UPDATE_ERROR", message: "Failed to update application" } },
      { status: 500 }
    );
  }
}

// DELETE /api/applications/:id - Delete an application
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
      .from(applications)
      .where(and(eq(applications.id, id), eq(applications.userId, user.id)));

    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Application not found" } },
        { status: 404 }
      );
    }

    await db.delete(applications).where(eq(applications.id, id));

    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (error) {
    console.error("Error deleting application:", error);
    return NextResponse.json(
      { success: false, error: { code: "DELETE_ERROR", message: "Failed to delete application" } },
      { status: 500 }
    );
  }
}
