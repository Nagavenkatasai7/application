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
import { ResumeCard } from "@/components/resumes/resume-card";
import { Plus, FileText } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { ResumeResponse } from "@/lib/validations/resume";

interface ResumesApiResponse {
  success: boolean;
  data: ResumeResponse[];
  meta: { total: number };
}

async function fetchResumes(): Promise<ResumesApiResponse> {
  const response = await fetch("/api/resumes");
  if (!response.ok) {
    throw new Error("Failed to fetch resumes");
  }
  return response.json();
}

async function deleteResume(id: string): Promise<void> {
  const response = await fetch(`/api/resumes/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete resume");
  }
}

function ResumeCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}

export default function ResumesPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["resumes", "list"],
    queryFn: fetchResumes,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteResume,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes", "list"] });
      toast.success("Resume deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete resume");
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this resume?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (id: string) => {
    // Navigate to resume edit page - to be implemented
    console.log("Editing resume:", id);
    toast.info("Resume editing coming soon");
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Resumes</h1>
            <p className="text-muted-foreground mt-1">
              Manage your uploaded resumes
            </p>
          </div>
          <Button asChild>
            <Link href="/resumes/new">
              <Plus className="mr-2 h-4 w-4" />
              Upload Resume
            </Link>
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ResumeCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="p-6 text-center">
              <p className="text-destructive">
                Failed to load resumes. Please try again.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() =>
                  queryClient.invalidateQueries({ queryKey: ["resumes", "list"] })
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
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
              <h3 className="text-lg font-medium">No resumes uploaded</h3>
              <p className="text-muted-foreground mt-1 mb-4">
                Upload a PDF resume to get started
              </p>
              <Button asChild>
                <Link href="/resumes/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Upload Your First Resume
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Resumes Grid */}
        {data && data.data.length > 0 && (
          <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.data.map((resume) => (
              <StaggerItem key={resume.id}>
                <ResumeCard
                  resume={resume}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        {/* Resume Count */}
        {data && data.data.length > 0 && (
          <p className="text-sm text-muted-foreground text-center">
            {data.meta.total} resume{data.meta.total !== 1 ? "s" : ""} uploaded
          </p>
        )}
      </div>
    </PageTransition>
  );
}
