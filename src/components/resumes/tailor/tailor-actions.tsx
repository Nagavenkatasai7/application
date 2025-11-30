"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Save,
  Download,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ResumeContent } from "@/lib/validations/resume";

interface TailorActionsProps {
  resumeName: string;
  tailoredContent: ResumeContent;
  jobTitle: string;
  onDiscard: () => void;
}

interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

export function TailorActions({
  resumeName,
  tailoredContent,
  jobTitle,
  onDiscard,
}: TailorActionsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isDownloading, setIsDownloading] = useState(false);

  // Create new resume mutation
  const createResumeMutation = useMutation({
    mutationFn: async () => {
      const newName = `${resumeName} - Tailored for ${jobTitle}`;
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          content: tailoredContent,
          isMaster: false,
        }),
      });
      const data: APIResponse<{ id: string }> = await res.json();
      if (!data.success) {
        throw new Error(data.error?.message || "Failed to save resume");
      }
      return data.data!;
    },
    onSuccess: (data) => {
      toast.success("Resume saved successfully");
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      router.push(`/resumes/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save resume");
    },
  });

  // Download PDF
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // First save the tailored resume
      const newName = `${resumeName} - Tailored for ${jobTitle}`;
      const createRes = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          content: tailoredContent,
          isMaster: false,
        }),
      });
      const createData: APIResponse<{ id: string }> = await createRes.json();
      if (!createData.success) {
        throw new Error(createData.error?.message || "Failed to save resume");
      }

      // Then download PDF
      const pdfRes = await fetch(`/api/resumes/${createData.data!.id}/pdf`);
      if (!pdfRes.ok) {
        throw new Error("Failed to generate PDF");
      }

      const blob = await pdfRes.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${newName}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("PDF downloaded successfully");
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      router.push(`/resumes/${createData.data!.id}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to download PDF"
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const isLoading = createResumeMutation.isPending || isDownloading;

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Button
        variant="outline"
        onClick={onDiscard}
        disabled={isLoading}
        className="flex-1 sm:flex-none"
      >
        <X className="mr-2 h-4 w-4" />
        Discard
      </Button>
      <Button
        variant="outline"
        onClick={handleDownload}
        disabled={isLoading}
        className="flex-1 sm:flex-none"
      >
        {isDownloading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Download className="mr-2 h-4 w-4" />
        )}
        Download PDF
      </Button>
      <Button
        onClick={() => createResumeMutation.mutate()}
        disabled={isLoading}
        className="flex-1 sm:flex-none"
      >
        {createResumeMutation.isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        Save as New Resume
      </Button>
    </div>
  );
}
