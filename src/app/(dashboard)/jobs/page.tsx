"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PageTransition,
  StaggerContainer,
  StaggerItem,
} from "@/components/layout/page-transition";
import { JobCard } from "@/components/jobs/job-card";
import { Plus, Briefcase } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { JobResponse } from "@/lib/validations/job";

interface JobsApiResponse {
  success: boolean;
  data: JobResponse[];
  meta: { total: number };
}

async function fetchJobs(): Promise<JobsApiResponse> {
  const response = await fetch("/api/jobs");
  if (!response.ok) {
    throw new Error("Failed to fetch jobs");
  }
  return response.json();
}

async function deleteJob(id: string): Promise<void> {
  const response = await fetch(`/api/jobs/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete job");
  }
}

function JobCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function JobsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["jobs", "list"],
    queryFn: fetchJobs,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs", "list"] });
      toast.success("Job deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete job");
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleCreateApplication = (jobId: string) => {
    // Navigate to application creation - to be implemented
    console.log("Creating application for job:", jobId);
    toast.info("Application creation coming soon");
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Jobs</h1>
            <p className="text-muted-foreground mt-1">
              Manage your saved job postings
            </p>
          </div>
          <Button asChild>
            <Link href="/jobs/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Job
            </Link>
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <JobCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="p-6 text-center">
              <p className="text-destructive">
                Failed to load jobs. Please try again.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() =>
                  queryClient.invalidateQueries({ queryKey: ["jobs", "list"] })
                }
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {data && data.data.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-muted p-3">
                  <Briefcase className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
              <h3 className="text-lg font-medium">No jobs saved</h3>
              <p className="text-muted-foreground mt-1 mb-4">
                Add a job posting to start tailoring your resume
              </p>
              <Button asChild>
                <Link href="/jobs/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Job
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Jobs Grid */}
        {data && data.data.length > 0 && (
          <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.data.map((job) => (
              <StaggerItem key={job.id}>
                <JobCard
                  job={job}
                  onDelete={handleDelete}
                  onCreateApplication={handleCreateApplication}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        {/* Job Count */}
        {data && data.data.length > 0 && (
          <p className="text-sm text-muted-foreground text-center">
            {data.meta.total} job{data.meta.total !== 1 ? "s" : ""} saved
          </p>
        )}
      </div>
    </PageTransition>
  );
}
