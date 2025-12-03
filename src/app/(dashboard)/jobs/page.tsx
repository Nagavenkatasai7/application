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
import { Plus, Briefcase, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StatCard, StatCardGrid } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
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

async function createApplication(jobId: string): Promise<{ success: boolean; data: unknown }> {
  const response = await fetch("/api/applications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobId, status: "saved" }),
  });
  if (!response.ok) {
    // Safely parse error response - handle non-JSON responses
    let errorMessage = "Failed to create application";
    try {
      const data = await response.json();
      errorMessage = data.error?.message || errorMessage;
    } catch {
      // Response was not JSON
    }
    throw new Error(errorMessage);
  }
  return response.json();
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

  const router = useRouter();

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

  const createApplicationMutation = useMutation({
    mutationFn: createApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications", "list"] });
      toast.success("Application created! Redirecting to applications...");
      router.push("/applications");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create application");
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleCreateApplication = (jobId: string) => {
    createApplicationMutation.mutate(jobId);
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

        {/* Stats Cards - Only show when there are jobs */}
        {data && data.data.length > 0 && (
          <StatCardGrid columns={3}>
            <StatCard
              label="Total Jobs"
              value={data.meta.total}
              icon={<Briefcase />}
              variant="gradient"
              size="sm"
            />
            <StatCard
              label="Recent (7 days)"
              value={data.data.filter(job => {
                if (!job.createdAt) return false;
                const createdAt = new Date(job.createdAt);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return createdAt >= weekAgo;
              }).length}
              icon={<Clock />}
              variant="glass"
              size="sm"
            />
            <StatCard
              label="Unique Companies"
              value={new Set(data.data.map(job => job.companyName).filter(Boolean)).size}
              icon={<Briefcase />}
              variant="glass"
              size="sm"
            />
          </StatCardGrid>
        )}

        {/* Empty State */}
        {data && data.data.length === 0 && (
          <EmptyState
            icon={<Briefcase />}
            title="No jobs saved yet"
            description="Add job postings to track opportunities and tailor your resume for each position."
            action={{
              label: "Add Your First Job",
              href: "/jobs/new",
              icon: <Plus className="h-4 w-4" />,
            }}
            variant="encourage"
            tip="Save job postings you're interested in to start tailoring your resume."
          />
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
