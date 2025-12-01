/**
 * User Data Export API Route
 *
 * POST /api/users/export - Export all user data as JSON
 */

import { NextResponse } from "next/server";
import { requireAuth, getUserById } from "@/lib/auth";
import { db, resumes, jobs, applications, userSettings, softSkills } from "@/lib/db";
import { errorResponse, parseRequestBody, unauthorizedResponse } from "@/lib/api";
import { dataExportSchema } from "@/lib/validations/profile";
import { eq } from "drizzle-orm";

// POST /api/users/export - Export all user data
export async function POST(request: Request) {
  try {
    const authUser = await requireAuth();

    // Validate request body
    const parsed = await parseRequestBody(request, dataExportSchema);
    if (!parsed.success) {
      return parsed.response;
    }

    const options = parsed.data;

    // Get full user profile
    const user = await getUserById(authUser.id);
    if (!user) {
      return unauthorizedResponse("User not found");
    }

    // Build export data based on options
    const exportData: Record<string, unknown> = {
      exportedAt: new Date().toISOString(),
      format: options.format,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        profilePictureUrl: user.profilePictureUrl,
        jobTitle: user.jobTitle,
        experienceLevel: user.experienceLevel,
        skills: user.skills,
        preferredIndustries: user.preferredIndustries,
        city: user.city,
        country: user.country,
        bio: user.bio,
        linkedinUrl: user.linkedinUrl,
        githubUrl: user.githubUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };

    // Include resumes if requested
    if (options.includeResumes) {
      const userResumes = await db
        .select()
        .from(resumes)
        .where(eq(resumes.userId, authUser.id));
      exportData.resumes = userResumes.map((r) => ({
        id: r.id,
        name: r.name,
        content: r.content,
        isMaster: r.isMaster,
        originalFileName: r.originalFileName,
        fileSize: r.fileSize,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }));
    }

    // Include saved jobs if requested
    if (options.includeJobs) {
      // Get jobs via applications
      const userApplications = await db
        .select({
          application: applications,
          job: jobs,
        })
        .from(applications)
        .innerJoin(jobs, eq(applications.jobId, jobs.id))
        .where(eq(applications.userId, authUser.id));

      const uniqueJobs = new Map();
      userApplications.forEach(({ job }) => {
        if (!uniqueJobs.has(job.id)) {
          uniqueJobs.set(job.id, {
            id: job.id,
            platform: job.platform,
            title: job.title,
            companyName: job.companyName,
            location: job.location,
            description: job.description,
            requirements: job.requirements,
            skills: job.skills,
            salary: job.salary,
            postedAt: job.postedAt,
            createdAt: job.createdAt,
          });
        }
      });
      exportData.jobs = Array.from(uniqueJobs.values());
    }

    // Include applications if requested
    if (options.includeApplications) {
      const userApplications = await db
        .select()
        .from(applications)
        .where(eq(applications.userId, authUser.id));
      exportData.applications = userApplications.map((a) => ({
        id: a.id,
        jobId: a.jobId,
        resumeId: a.resumeId,
        status: a.status,
        appliedAt: a.appliedAt,
        notes: a.notes,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      }));
    }

    // Include settings if requested
    if (options.includeSettings) {
      const [settings] = await db
        .select()
        .from(userSettings)
        .where(eq(userSettings.userId, authUser.id));
      exportData.settings = settings?.settings || null;

      // Include soft skills assessments
      const userSoftSkills = await db
        .select()
        .from(softSkills)
        .where(eq(softSkills.userId, authUser.id));
      exportData.softSkills = userSoftSkills.map((s) => ({
        id: s.id,
        skillName: s.skillName,
        evidenceScore: s.evidenceScore,
        statement: s.statement,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      }));
    }

    // Return as downloadable JSON
    const jsonContent = JSON.stringify(exportData, null, 2);
    const filename = `resumint-export-${new Date().toISOString().split("T")[0]}.json`;

    return new NextResponse(jsonContent, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return unauthorizedResponse();
    }
    console.error("Error exporting user data:", error);
    return errorResponse("EXPORT_ERROR", "Failed to export user data", 500);
  }
}
