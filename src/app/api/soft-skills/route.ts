import { NextResponse } from "next/server";
import { db, softSkills } from "@/lib/db";
import { getOrCreateLocalUser } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// GET /api/soft-skills - List all soft skill assessments for current user
export async function GET() {
  try {
    const user = await getOrCreateLocalUser();

    const userSoftSkills = await db
      .select()
      .from(softSkills)
      .where(eq(softSkills.userId, user.id))
      .orderBy(desc(softSkills.updatedAt));

    return NextResponse.json({
      success: true,
      data: userSoftSkills,
      meta: { total: userSoftSkills.length },
    });
  } catch (error) {
    console.error("Error fetching soft skills:", error);
    return NextResponse.json(
      { success: false, error: { code: "FETCH_ERROR", message: "Failed to fetch soft skills" } },
      { status: 500 }
    );
  }
}

// POST /api/soft-skills/start - Start a new soft skill assessment
export async function POST(request: Request) {
  try {
    const user = await getOrCreateLocalUser();
    const body = await request.json();

    if (!body.skillName) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "skillName is required" } },
        { status: 400 }
      );
    }

    const newSoftSkill = {
      id: uuidv4(),
      userId: user.id,
      skillName: body.skillName,
      evidenceScore: null,
      conversation: [],
      statement: null,
    };

    await db.insert(softSkills).values(newSoftSkill);

    return NextResponse.json({ success: true, data: newSoftSkill }, { status: 201 });
  } catch (error) {
    console.error("Error creating soft skill:", error);
    return NextResponse.json(
      { success: false, error: { code: "CREATE_ERROR", message: "Failed to create soft skill assessment" } },
      { status: 500 }
    );
  }
}
