import { NextResponse } from "next/server";
import { db, companies } from "@/lib/db";
import { desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// GET /api/companies - List all companies
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const allCompanies = await db
      .select()
      .from(companies)
      .orderBy(desc(companies.cachedAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      success: true,
      data: allCompanies,
      meta: { limit, offset, total: allCompanies.length },
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json(
      { success: false, error: { code: "FETCH_ERROR", message: "Failed to fetch companies" } },
      { status: 500 }
    );
  }
}

// POST /api/companies - Create a company (for manual entry or after research)
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Company name is required" } },
        { status: 400 }
      );
    }

    const newCompany = {
      id: uuidv4(),
      name: body.name,
      glassdoorData: body.glassdoorData || null,
      fundingData: body.fundingData || null,
      cultureSignals: body.cultureSignals || null,
      competitors: body.competitors || null,
      cachedAt: new Date(),
    };

    await db.insert(companies).values(newCompany);

    return NextResponse.json({ success: true, data: newCompany }, { status: 201 });
  } catch (error) {
    console.error("Error creating company:", error);
    return NextResponse.json(
      { success: false, error: { code: "CREATE_ERROR", message: "Failed to create company" } },
      { status: 500 }
    );
  }
}
