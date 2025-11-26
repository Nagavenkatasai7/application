import { NextResponse } from "next/server";
import { db, jobs } from "@/lib/db";
import { desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// GET /api/jobs - List all jobs
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const query = db.select().from(jobs).orderBy(desc(jobs.createdAt));

    const allJobs = await query.limit(limit).offset(offset);

    return NextResponse.json({
      success: true,
      data: allJobs,
      meta: { limit, offset, total: allJobs.length },
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { success: false, error: { code: "FETCH_ERROR", message: "Failed to fetch jobs" } },
      { status: 500 }
    );
  }
}

// POST /api/jobs - Create a job (manual entry)
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newJob = {
      id: uuidv4(),
      platform: body.platform || "manual",
      externalId: body.externalId || null,
      title: body.title,
      companyId: body.companyId || null,
      companyName: body.companyName || null,
      location: body.location || null,
      description: body.description || null,
      requirements: body.requirements || [],
      skills: body.skills || [],
      salary: body.salary || null,
      postedAt: body.postedAt ? new Date(body.postedAt) : null,
      cachedAt: new Date(),
    };

    await db.insert(jobs).values(newJob);

    return NextResponse.json({ success: true, data: newJob }, { status: 201 });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { success: false, error: { code: "CREATE_ERROR", message: "Failed to create job" } },
      { status: 500 }
    );
  }
}
