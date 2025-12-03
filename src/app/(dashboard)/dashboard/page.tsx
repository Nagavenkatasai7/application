"use client";

import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  PageTransition,
  StaggerContainer,
  StaggerItem,
} from "@/components/layout/page-transition";
import { StatCard, StatCardGrid } from "@/components/ui/stat-card";
import { Sparkles, Loader2, AlertCircle, Download, Save, RotateCcw, FileText, Target, Wand2, Zap } from "lucide-react";
import { ResumeSelector } from "@/components/dashboard/resume-selector";
import { JobInput } from "@/components/dashboard/job-input";
import { RecruiterReadinessCard } from "@/components/resumes/tailor/recruiter-readiness-card";
import type { ResumeContent } from "@/lib/validations/resume";
import type { RecruiterReadinessScore } from "@/lib/ai/tailoring/types";

interface JobInputValue {
  mode: "paste" | "saved";
  jobText?: string;
  savedJobId?: string;
}

interface HybridTailorResult {
  tailoredResume: ResumeContent;
  qualityScore: RecruiterReadinessScore;
  changes: {
    summaryModified: boolean;
    experienceBulletsModified: number;
    skillsReordered: boolean;
    sectionsReordered: boolean;
  };
  processingTimeMs: number;
}

interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

// Get time-based greeting
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const queryClient = useQueryClient();

  // Selection state
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{
    file: File;
    name: string;
  } | null>(null);
  const [jobInput, setJobInput] = useState<JobInputValue>({
    mode: "paste",
    jobText: "",
  });

  // Result state
  const [tailorResult, setTailorResult] = useState<HybridTailorResult | null>(
    null
  );
  const [resumeName, setResumeName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [createdResumeId, setCreatedResumeId] = useState<string | null>(null);

  // Handle resume selection
  const handleResumeSelect = useCallback(
    (
      resumeId: string | null,
      uploaded?: { file: File; name: string }
    ) => {
      setSelectedResumeId(resumeId);
      setUploadedFile(uploaded || null);
      // Reset results when resume changes
      setTailorResult(null);
      setCreatedResumeId(null);
    },
    []
  );

  // Handle job input change
  const handleJobChange = useCallback((value: JobInputValue) => {
    setJobInput(value);
    // Reset results when job changes
    setTailorResult(null);
    setCreatedResumeId(null);
  }, []);

  // Upload resume mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", file.name.replace(".pdf", ""));

      const res = await fetch("/api/resumes/upload", {
        method: "POST",
        body: formData,
      });
      const data: APIResponse<{ id: string; name: string }> = await res.json();
      if (!data.success) {
        throw new Error(data.error?.message || "Failed to upload resume");
      }
      return data.data!;
    },
  });

  // Create job from pasted text mutation
  const createJobMutation = useMutation({
    mutationFn: async (description: string) => {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Job from Dashboard",
          description,
          source: "manual",
        }),
      });
      const data: APIResponse<{ id: string; title: string }> = await res.json();
      if (!data.success) {
        throw new Error(data.error?.message || "Failed to create job");
      }
      return data.data!;
    },
  });

  // Tailor mutation
  const tailorMutation = useMutation({
    mutationFn: async ({
      resumeId,
      jobId,
    }: {
      resumeId: string;
      jobId: string;
    }) => {
      const res = await fetch(`/api/resumes/${resumeId}/hybrid-tailor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const data: APIResponse<HybridTailorResult> = await res.json();
      if (!data.success) {
        throw new Error(data.error?.message || "Failed to tailor resume");
      }
      return data.data!;
    },
    onSuccess: (data) => {
      setTailorResult(data);
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
    },
  });

  // Save tailored resume mutation
  const saveResumeMutation = useMutation({
    mutationFn: async () => {
      if (!tailorResult) throw new Error("No tailored result");
      const newName = `${resumeName} - Tailored for ${jobTitle}`;
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          content: tailorResult.tailoredResume,
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
      setCreatedResumeId(data.id);
      toast.success("Resume saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Download PDF handler
  const handleDownload = async () => {
    if (!tailorResult) return;

    try {
      // Save first if not already saved
      let resumeIdToDownload = createdResumeId;
      if (!resumeIdToDownload) {
        const newName = `${resumeName} - Tailored for ${jobTitle}`;
        const res = await fetch("/api/resumes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: newName,
            content: tailorResult.tailoredResume,
            isMaster: false,
          }),
        });
        const data: APIResponse<{ id: string }> = await res.json();
        if (!data.success) {
          throw new Error(data.error?.message || "Failed to save resume");
        }
        resumeIdToDownload = data.data!.id;
        setCreatedResumeId(resumeIdToDownload);
        queryClient.invalidateQueries({ queryKey: ["resumes"] });
      }

      // Download PDF
      const pdfRes = await fetch(`/api/resumes/${resumeIdToDownload}/pdf`);
      if (!pdfRes.ok) throw new Error("Failed to generate PDF");

      const blob = await pdfRes.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${resumeName} - Tailored for ${jobTitle}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("PDF downloaded!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to download PDF"
      );
    }
  };

  // Main tailor handler
  const handleTailor = async () => {
    try {
      let finalResumeId = selectedResumeId;
      let finalJobId = jobInput.savedJobId;

      // Step 1: Upload resume if needed
      if (!finalResumeId && uploadedFile) {
        const uploadedResume = await uploadMutation.mutateAsync(
          uploadedFile.file
        );
        finalResumeId = uploadedResume.id;
        setResumeName(uploadedResume.name);
        setSelectedResumeId(finalResumeId);
      }

      if (!finalResumeId) {
        toast.error("Please select or upload a resume");
        return;
      }

      // Step 2: Create job if using paste mode
      if (jobInput.mode === "paste") {
        if (!jobInput.jobText?.trim()) {
          toast.error("Please enter a job description");
          return;
        }
        const createdJob = await createJobMutation.mutateAsync(
          jobInput.jobText
        );
        finalJobId = createdJob.id;
        setJobTitle(createdJob.title);
      }

      if (!finalJobId) {
        toast.error("Please select or enter a job");
        return;
      }

      // Set resume name if not set yet
      if (!resumeName && selectedResumeId) {
        // Fetch resume name
        const res = await fetch(`/api/resumes/${selectedResumeId}`);
        const data = await res.json();
        if (data.success) {
          setResumeName(data.data.name);
        }
      }

      // Step 3: Run tailoring
      await tailorMutation.mutateAsync({
        resumeId: finalResumeId,
        jobId: finalJobId,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    }
  };

  // Reset handler
  const handleReset = () => {
    setTailorResult(null);
    setCreatedResumeId(null);
  };

  // Check if ready to tailor
  const canTailor =
    (selectedResumeId || uploadedFile) &&
    ((jobInput.mode === "paste" && jobInput.jobText?.trim()) ||
      (jobInput.mode === "saved" && jobInput.savedJobId));

  const isProcessing =
    uploadMutation.isPending ||
    createJobMutation.isPending ||
    tailorMutation.isPending;

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Welcome Hero Section */}
        <motion.div
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-transparent to-pink-500/10 border border-primary/20 p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Animated background blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse" style={{ animationDelay: "1s" }} />

          <div className="relative">
            <motion.div
              className="flex items-center gap-2 mb-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                className="rounded-full gradient-primary p-2"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Wand2 className="h-5 w-5 text-white" />
              </motion.div>
              <span className="text-sm font-medium text-primary">AI-Powered Resume Tailoring</span>
            </motion.div>

            <motion.h1
              className="text-4xl md:text-5xl font-bold tracking-tight"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="gradient-text">{getGreeting()}!</span>
            </motion.h1>

            <motion.p
              className="text-lg text-muted-foreground mt-3 max-w-xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Ready to land your dream job? Tailor your resume in seconds with AI that understands what recruiters want.
            </motion.p>

            {/* Quick Stats using StatCard */}
            <motion.div
              className="mt-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <StatCardGrid columns={3} className="max-w-2xl">
                <StatCard
                  label="Easy Steps"
                  value="2"
                  icon={<FileText />}
                  variant="glass"
                  size="sm"
                />
                <StatCard
                  label="ATS Match"
                  value="90%+"
                  icon={<Target />}
                  variant="glass"
                  size="sm"
                />
                <StatCard
                  label="Tailor Time"
                  value="<30s"
                  icon={<Zap />}
                  variant="glass"
                  size="sm"
                />
              </StatCardGrid>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Content */}
        <StaggerContainer className="grid gap-6 lg:grid-cols-2">
          {/* Resume Selection */}
          <StaggerItem>
            <Card hover className="h-full border-2 border-transparent hover:border-primary/30">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="icon-container size-12">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">1. Select Your Resume</CardTitle>
                    <CardDescription>
                      Choose an existing resume or upload a new one
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResumeSelector
                  onResumeSelect={handleResumeSelect}
                  disabled={isProcessing}
                />
              </CardContent>
            </Card>
          </StaggerItem>

          {/* Job Input */}
          <StaggerItem>
            <Card hover className="h-full border-2 border-transparent hover:border-primary/30">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="icon-container size-12">
                    <Target className="h-6 w-6 text-pink-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">2. Target Job</CardTitle>
                    <CardDescription>
                      Paste a job description or select from your saved jobs
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <JobInput onJobChange={handleJobChange} disabled={isProcessing} />
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerContainer>

        {/* Tailor Button */}
        <div className="flex justify-center">
          <Button
            variant="gradient"
            size="lg"
            onClick={handleTailor}
            disabled={!canTailor || isProcessing}
            className="min-w-[240px] h-14 text-lg shadow-lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {uploadMutation.isPending
                  ? "Uploading..."
                  : createJobMutation.isPending
                    ? "Processing job..."
                    : "Tailoring..."}
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Tailor My Resume
              </>
            )}
          </Button>
        </div>

        {/* Error Display */}
        {(uploadMutation.isError ||
          createJobMutation.isError ||
          tailorMutation.isError) && (
          <Alert variant="destructive" className="rounded-xl">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {uploadMutation.error?.message ||
                createJobMutation.error?.message ||
                tailorMutation.error?.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Results Section */}
        {tailorResult && (
          <StaggerContainer className="space-y-6">
            <StaggerItem>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold gradient-text">Results</h2>
                <Button variant="ghost" size="sm" onClick={handleReset} className="rounded-xl">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Start Over
                </Button>
              </div>
            </StaggerItem>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Score Card */}
              <StaggerItem>
                <RecruiterReadinessCard
                  score={tailorResult.qualityScore}
                  showRecommendations={true}
                />
              </StaggerItem>

              {/* Changes Summary */}
              <StaggerItem>
                <Card hover>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Changes Made
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                      <span className="text-muted-foreground">
                        Summary Modified
                      </span>
                      <span className={`font-medium ${tailorResult.changes.summaryModified ? 'text-success' : 'text-muted-foreground'}`}>
                        {tailorResult.changes.summaryModified ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                      <span className="text-muted-foreground">
                        Experience Bullets Updated
                      </span>
                      <span className="font-medium text-primary">
                        {tailorResult.changes.experienceBulletsModified}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                      <span className="text-muted-foreground">
                        Skills Reordered
                      </span>
                      <span className={`font-medium ${tailorResult.changes.skillsReordered ? 'text-success' : 'text-muted-foreground'}`}>
                        {tailorResult.changes.skillsReordered ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                      <span className="text-muted-foreground">
                        Processing Time
                      </span>
                      <span className="font-medium">
                        {(tailorResult.processingTimeMs / 1000).toFixed(1)}s
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            </div>

            {/* Action Buttons */}
            <StaggerItem>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleDownload}
                  disabled={saveResumeMutation.isPending}
                  className="min-w-[180px]"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download PDF
                </Button>
                <Button
                  variant="gradient"
                  size="lg"
                  onClick={() => saveResumeMutation.mutate()}
                  disabled={
                    saveResumeMutation.isPending || !!createdResumeId
                  }
                  className="min-w-[180px]"
                >
                  {saveResumeMutation.isPending ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-5 w-5" />
                  )}
                  {createdResumeId ? "Saved!" : "Save as New Resume"}
                </Button>
              </div>
            </StaggerItem>
          </StaggerContainer>
        )}
      </div>
    </PageTransition>
  );
}
