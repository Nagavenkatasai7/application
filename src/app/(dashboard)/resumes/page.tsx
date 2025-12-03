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
import { Plus, FileText, Sparkles, Upload, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StatCard, StatCardGrid } from "@/components/ui/stat-card";
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
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-5 pb-4">
          <div className="flex items-start gap-4">
            <Skeleton className="h-14 w-14 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </div>
        <div className="mx-5 mb-4">
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
        <div className="p-4 pt-0 flex gap-2">
          <Skeleton className="h-9 flex-1 rounded-xl" />
          <Skeleton className="h-9 flex-1 rounded-xl" />
          <Skeleton className="h-9 flex-1 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function ResumesPage() {
  const router = useRouter();
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
    router.push(`/resumes/${id}/edit`);
  };

  const handleView = (id: string) => {
    router.push(`/resumes/${id}`);
  };

  const handleTailor = (id: string) => {
    router.push(`/resumes/${id}/tailor`);
  };

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight gradient-text">Resumes</h1>
            <p className="text-muted-foreground mt-2">
              Manage and tailor your resumes for any job
            </p>
          </div>
          <Button variant="gradient" size="lg" asChild>
            <Link href="/resumes/new">
              <Plus className="mr-2 h-5 w-5" />
              Upload Resume
            </Link>
          </Button>
        </div>

        {/* Stats Cards - Only show when there are resumes */}
        {data && data.data && data.data.length > 0 && data.meta && (
          <StatCardGrid columns={3}>
            <StatCard
              label="Total Resumes"
              value={data.meta.total}
              icon={<FileText />}
              variant="gradient"
              size="sm"
            />
            <StatCard
              label="Recently Updated"
              value={data.data.filter(resume => {
                const updatedAt = new Date(resume.updatedAt);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return updatedAt >= weekAgo;
              }).length}
              icon={<Clock />}
              variant="glass"
              size="sm"
            />
            <StatCard
              label="AI-Tailored"
              value={data.data.filter(resume => resume.name?.includes('Tailored')).length}
              icon={<Sparkles />}
              variant="glass"
              size="sm"
            />
          </StatCardGrid>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ResumeCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-2xl bg-destructive/10 p-4">
                  <FileText className="h-8 w-8 text-destructive" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-destructive">Failed to load resumes</h3>
              <p className="text-muted-foreground mt-2 mb-6">
                Something went wrong. Please try again.
              </p>
              <Button
                variant="outline"
                onClick={() =>
                  queryClient.invalidateQueries({ queryKey: ["resumes", "list"] })
                }
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty State - Student-friendly */}
        {data && data.data.length === 0 && (
          <Card className="border-dashed border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-pink-500/5">
            <CardContent className="py-16 text-center">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="rounded-2xl gradient-primary p-5 shadow-lg animate-float">
                    <Upload className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 rounded-full gradient-primary p-2 shadow-lg animate-pulse-glow">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-bold gradient-text">Ready to land your dream job?</h3>
              <p className="text-muted-foreground mt-3 mb-8 max-w-md mx-auto">
                Upload your resume and let AI help you tailor it for any position.
                Stand out from the crowd!
              </p>
              <Button variant="gradient" size="lg" asChild>
                <Link href="/resumes/new">
                  <Plus className="mr-2 h-5 w-5" />
                  Upload Your First Resume
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Resumes Grid */}
        {data && data.data.length > 0 && (
          <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.data.map((resume) => (
              <StaggerItem key={resume.id}>
                <ResumeCard
                  resume={resume}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  onView={handleView}
                  onTailor={handleTailor}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        {/* Resume Count */}
        {data && data.data.length > 0 && data.meta && (
          <p className="text-sm text-muted-foreground text-center">
            <span className="font-medium text-foreground">{data.meta.total}</span>{" "}
            resume{data.meta.total !== 1 ? "s" : ""} uploaded
          </p>
        )}
      </div>
    </PageTransition>
  );
}
