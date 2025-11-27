import { NextResponse } from "next/server";
import { db, applications, jobs, resumes } from "@/lib/db";
import { getOrCreateLocalUser } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// GET /api/applications - List all applications for current user with job data
export async function GET(request: Request) {
  try {
    const user = await getOrCreateLocalUser();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // Fetch applications with related job and resume data
    const userApplications = await db
      .select({
        id: applications.id,
        userId: applications.userId,
        jobId: applications.jobId,
        resumeId: applications.resumeId,
        status: applications.status,
        appliedAt: applications.appliedAt,
        notes: applications.notes,
        createdAt: applications.createdAt,
        updatedAt: applications.updatedAt,
        // Job data
        jobTitle: jobs.title,
        jobCompanyName: jobs.companyName,
        jobLocation: jobs.location,
        // Resume data
        resumeName: resumes.name,
      })
      .from(applications)
      .leftJoin(jobs, eq(applications.jobId, jobs.id))
      .leftJoin(resumes, eq(applications.resumeId, resumes.id))
      .where(eq(applications.userId, user.id))
      .orderBy(desc(applications.createdAt));

    // Transform to include nested job/resume objects
    const transformedApplications = userApplications.map((app) => ({
      id: app.id,
      userId: app.userId,
      jobId: app.jobId,
      resumeId: app.resumeId,
      status: app.status,
      appliedAt: app.appliedAt,
      notes: app.notes,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
      job: {
        id: app.jobId,
        title: app.jobTitle,
        companyName: app.jobCompanyName,
        location: app.jobLocation,
      },
      resume: app.resumeId
        ? {
            id: app.resumeId,
            name: app.resumeName,
          }
        : null,
    }));

    // Filter by status if provided
    const filtered = status
      ? transformedApplications.filter((app) => app.status === status)
      : transformedApplications;

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
