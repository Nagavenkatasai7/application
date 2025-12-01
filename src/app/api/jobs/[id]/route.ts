import { db, jobs, applications } from "@/lib/db";
import { eq } from "drizzle-orm";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  forbiddenResponse,
} from "@/lib/api";

// GET /api/jobs/:id - Get a specific job
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));

    if (!job) {
      return notFoundResponse("Job");
    }

    return successResponse(job);
  } catch (error) {
    console.error("Error fetching job:", error);
    return errorResponse("FETCH_ERROR", "Failed to fetch job");
  }
}

// DELETE /api/jobs/:id - Delete a job
// Security: Only allows deletion of manually-created jobs with no active applications
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [existing] = await db.select().from(jobs).where(eq(jobs.id, id));

    if (!existing) {
      return notFoundResponse("Job");
    }

    // Only allow deletion of manually-created jobs
    if (existing.platform !== "manual") {
      return forbiddenResponse(
        "Cannot delete cached jobs from external platforms"
      );
    }

    // Check if any applications reference this job
    const jobApplications = await db
      .select()
      .from(applications)
      .where(eq(applications.jobId, id))
      .limit(1);

    if (jobApplications.length > 0) {
      return forbiddenResponse(
        "Cannot delete job with existing applications"
      );
    }

    await db.delete(jobs).where(eq(jobs.id, id));

    return successResponse({ deleted: true });
  } catch (error) {
    console.error("Error deleting job:", error);
    return errorResponse("DELETE_ERROR", "Failed to delete job");
  }
}
