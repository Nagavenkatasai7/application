"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { PageTransition } from "@/components/layout/page-transition";
import { ResumeEditor } from "@/components/resumes/editor";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useEditorStore } from "@/stores/editor-store";
import type { ResumeResponse, ResumeContent } from "@/lib/validations/resume";

interface ResumeApiResponse {
  success: boolean;
  data: ResumeResponse;
}

async function fetchResume(id: string): Promise<ResumeApiResponse> {
  const response = await fetch(`/api/resumes/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch resume");
  }
  return response.json();
}

async function updateResume(
  id: string,
  data: { name?: string; content?: ResumeContent }
): Promise<ResumeApiResponse> {
  const response = await fetch(`/api/resumes/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to update resume");
  }
  return response.json();
}

function EditPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <Card>
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Inner component that handles the editing once data is loaded
function EditResumeForm({
  resume,
  resumeId,
}: {
  resume: ResumeResponse;
  resumeId: string;
}) {
  const queryClient = useQueryClient();

  // Get initial values from the resume data
  const initialName = resume.name;
  const initialContent: ResumeContent = (resume.content as ResumeContent) || {
    contact: { name: "", email: "" },
    experiences: [],
    education: [],
    skills: { technical: [], soft: [] },
  };
  const initialContentString = JSON.stringify(initialContent);

  // Local state for form
  const [resumeName, setResumeName] = useState(initialName);
  const [resumeContent, setResumeContent] = useState<ResumeContent>(initialContent);

  // Editor store for tracking changes
  const { setCurrentResumeId, setHasUnsavedChanges, hasUnsavedChanges, resetEditor } =
    useEditorStore();

  // Track original values for change detection
  const [savedName, setSavedName] = useState(initialName);
  const [savedContentString, setSavedContentString] = useState(initialContentString);

  // Update mutation
  const saveMutation = useMutation({
    mutationFn: (updateData: { name?: string; content?: ResumeContent }) =>
      updateResume(resumeId, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes", resumeId] });
      queryClient.invalidateQueries({ queryKey: ["resumes", "list"] });
      setHasUnsavedChanges(false);
      // Update saved values
      setSavedName(resumeName);
      setSavedContentString(JSON.stringify(resumeContent));
      toast.success("Resume saved successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  // Set current resume ID on mount
  useEffect(() => {
    setCurrentResumeId(resumeId);
    return () => {
      resetEditor();
    };
  }, [resumeId, setCurrentResumeId, resetEditor]);

  // Track unsaved changes
  useEffect(() => {
    const currentContentString = JSON.stringify(resumeContent);
    const hasChanges =
      currentContentString !== savedContentString || resumeName !== savedName;
    setHasUnsavedChanges(hasChanges);
  }, [resumeContent, resumeName, savedName, savedContentString, setHasUnsavedChanges]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleSave = () => {
    saveMutation.mutate({
      name: resumeName,
      content: resumeContent,
    });
  };

  const handleContentChange = (content: ResumeContent) => {
    setResumeContent(content);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 -mx-4 px-4 z-10 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/resumes/${resumeId}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to resume</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Edit Resume</h1>
            {hasUnsavedChanges && (
              <p className="text-sm text-amber-600">Unsaved changes</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/resumes/${resumeId}`}>Cancel</Link>
          </Button>
          <Button onClick={handleSave} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Resume Name */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-2">
            <Label htmlFor="resume-name">
              Resume Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="resume-name"
              value={resumeName}
              onChange={(e) => setResumeName(e.target.value)}
              placeholder="My Resume"
              disabled={saveMutation.isPending}
            />
            <p className="text-xs text-muted-foreground">
              A name to help you identify this resume
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Resume Editor */}
      <ResumeEditor
        content={resumeContent}
        onChange={handleContentChange}
        disabled={saveMutation.isPending}
      />
    </div>
  );
}

export default function EditResumePage() {
  const params = useParams();
  const router = useRouter();
  const resumeId = params.id as string;

  // Fetch resume data
  const { data, isLoading, error } = useQuery({
    queryKey: ["resumes", resumeId],
    queryFn: () => fetchResume(resumeId),
    enabled: !!resumeId,
  });

  if (error) {
    return (
      <PageTransition>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/resumes">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to resumes</span>
              </Link>
            </Button>
            <h1 className="text-2xl font-semibold tracking-tight">Resume Not Found</h1>
          </div>
          <Card className="border-destructive">
            <CardContent className="p-6 text-center">
              <p className="text-destructive">
                The resume you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => router.push("/resumes")}>
                Back to Resumes
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto">
        {isLoading && <EditPageSkeleton />}
        {!isLoading && data?.data && (
          <EditResumeForm resume={data.data} resumeId={resumeId} />
        )}
      </div>
    </PageTransition>
  );
}
