"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { PageTransition } from "@/components/layout/page-transition";
import { ResumeForm } from "@/components/resumes/resume-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface UploadResult {
  id: string;
  name: string;
}

async function uploadResume(data: { name: string }, file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("name", data.name);

  const response = await fetch("/api/resumes/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to upload resume");
  }

  const result = await response.json();
  return result.data;
}

export default function NewResumePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: ({ data, file }: { data: { name: string }; file: File }) =>
      uploadResume(data, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes", "list"] });
      toast.success("Resume uploaded successfully");
      router.push("/resumes");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = async (data: { name: string }, file: File) => {
    try {
      await uploadMutation.mutateAsync({ data, file });
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
            <Link href="/resumes">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to resumes</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Upload Resume</h1>
            <p className="text-muted-foreground mt-1">
              Upload a PDF resume to extract and manage your information
            </p>
          </div>
        </div>

        {/* Form */}
        <ResumeForm
          onSubmit={handleSubmit}
          isLoading={uploadMutation.isPending}
        />
      </div>
    </PageTransition>
  );
}
