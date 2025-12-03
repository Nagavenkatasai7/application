"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { PageTransition } from "@/components/layout/page-transition";
import { JobForm } from "@/components/jobs/job-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { CreateJobInput } from "@/lib/validations/job";

async function createJob(data: CreateJobInput): Promise<{ id: string }> {
  const response = await fetch("/api/jobs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to create job");
  }

  const result = await response.json();
  return result.data;
}

export default function NewJobPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs", "list"] });
      toast.success("Job created successfully");
      router.push("/jobs");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = async (data: CreateJobInput) => {
    try {
      await createMutation.mutateAsync(data);
    } catch {
      // Error is already handled by mutation's onError callback
    }
  };

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/jobs">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to jobs</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Add Job</h1>
            <p className="text-muted-foreground mt-1">
              Paste a job URL or enter details manually
            </p>
          </div>
        </div>

        {/* Form */}
        <JobForm
          onSubmit={handleSubmit}
          onCancel={() => router.push("/jobs")}
          isLoading={createMutation.isPending}
        />
      </div>
    </PageTransition>
  );
}
