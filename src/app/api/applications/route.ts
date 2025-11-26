import { NextResponse } from "next/server";
import { db, applications } from "@/lib/db";
import { getOrCreateLocalUser } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// GET /api/applications - List all applications for current user
export async function GET(request: Request) {
  try {
    const user = await getOrCreateLocalUser();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const userApplications = await db
      .select()
      .from(applications)
      .where(eq(applications.userId, user.id))
      .orderBy(desc(applications.createdAt));

    // Filter by status if provided
    const filtered = status
      ? userApplications.filter((app) => app.status === status)
      : userApplications;

    return NextResponse.json({
      success: true,
      data: filtered,
      meta: { total: filtered.length },
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { success: false, error: { code: "FETCH_ERROR", message: "Failed to fetch applications" } },
      { status: 500 }
    );
  }
}

// POST /api/applications - Create a new application
export async function POST(request: Request) {
  try {
    const user = await getOrCreateLocalUser();
    const body = await request.json();

    if (!body.jobId) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "jobId is required" } },
        { status: 400 }
      );
    }

    const newApplication = {
      id: uuidv4(),
      userId: user.id,
      jobId: body.jobId,
      resumeId: body.resumeId || null,
      status: body.status || "saved",
      appliedAt: body.appliedAt ? new Date(body.appliedAt) : null,
      notes: body.notes || null,
    };

    await db.insert(applications).values(newApplication);

    return NextResponse.json({ success: true, data: newApplication }, { status: 201 });
  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json(
      { success: false, error: { code: "CREATE_ERROR", message: "Failed to create application" } },
      { status: 500 }
    );
  }
}
