"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Wand2,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Sparkles,
  Clock,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/layout/page-transition";
import {
  JobSelector,
  ChangesSummary,
  ResumeComparison,
  TailorActions,
  RecruiterReadinessCard,
} from "@/components/resumes/tailor";
import type { ResumeContent } from "@/lib/validations/resume";
import type { RecruiterReadinessScore } from "@/lib/ai/tailoring/types";

interface Resume {
  id: string;
  name: string;
  content: ResumeContent;
}

interface Job {
  id: string;
  title: string;
  companyName: string | null;
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
  preAnalysis: {
    impact: { score: number; scoreLabel: string; bulletsImproved: number };
    uniqueness: { score: number; scoreLabel: string; differentiators: string[] };
    context: { score: number; scoreLabel: string; keywordCoverage: number };
    softSkillsDetected: number;
    companyContextNeeded: boolean;
  };
  appliedRules: Array<{ ruleId: string; ruleName: string; recruiterIssue: string }>;
  tokenUsage: { preAnalysis: number; rewriting: number; total: number; savedVsPureAI: number };
  processingTimeMs: number;
  tailoredAt: string;
}

interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

export default function TailorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: resumeId } = use(params);
  const router = useRouter();
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [tailorResult, setTailorResult] = useState<HybridTailorResult | null>(null);

  // Fetch the resume
  const {
    data: resumeData,
    isLoading: resumeLoading,
    error: resumeError,
  } = useQuery<APIResponse<Resume>>({
    queryKey: ["resumes", resumeId],
    queryFn: async () => {
      const res = await fetch(`/api/resumes/${resumeId}`);
      if (!res.ok) throw new Error("Failed to fetch resume");
      return res.json();
    },
  });

  // Fetch jobs
  const { data: jobsData, isLoading: jobsLoading } = useQuery<
    APIResponse<Job[]>
  >({
    queryKey: ["jobs"],
    queryFn: async () => {
      const res = await fetch("/api/jobs");
      if (!res.ok) throw new Error("Failed to fetch jobs");
      return res.json();
    },
  });

  const resume = resumeData?.data;
  const jobs = jobsData?.data || [];
  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  // Hybrid Tailor mutation - uses the recruiter-optimized system
  const tailorMutation = useMutation({
    mutationFn: async ({ resumeId, jobId }: { resumeId: string; jobId: string }) => {
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
    },
  });

  const handleTailor = () => {
    if (!selectedJobId) return;
    setTailorResult(null);
    tailorMutation.mutate({ resumeId, jobId: selectedJobId });
  };

  const handleDiscard = () => {
    setTailorResult(null);
    setSelectedJobId("");
  };

  // Error state
  if (resumeError) {
    return (
      <div className="container max-w-6xl py-8">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>Failed to load resume</p>
            </div>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/resumes")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Resumes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="container max-w-6xl py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Link href={`/resumes/${resumeId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Wand2 className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">
              Tailor Resume
            </h1>
          </div>
          <p className="text-muted-foreground">
            {resume?.name || "Loading..."} - Optimize your resume for a specific job using AI
          </p>
        </div>

        {/* Job Selection */}
        {!tailorResult && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Target Job</CardTitle>
              <CardDescription>
                Choose a job to tailor your resume for. The AI will optimize your
                content to match the job requirements.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <JobSelector
                  jobs={jobs}
                  selectedJobId={selectedJobId}
                  onJobSelect={setSelectedJobId}
                  isLoading={jobsLoading}
                  disabled={tailorMutation.isPending}
                />

                <Button
                  onClick={handleTailor}
                  disabled={
                    !selectedJobId ||
                    resumeLoading ||
                    tailorMutation.isPending
                  }
                  className="w-full sm:w-auto"
                >
                  {tailorMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Tailoring Resume...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Tailor Resume
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {tailorMutation.isError && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <p>
                  {tailorMutation.error?.message || "Failed to tailor resume"}
                </p>
              </div>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => tailorMutation.reset()}
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {tailorMutation.isPending && (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                  <Loader2 className="h-8 w-8 animate-spin text-primary/50 absolute inset-0" />
                </div>
                <div className="text-center space-y-2">
                  <p className="font-medium">Analyzing & Tailoring your resume...</p>
                  <p className="text-sm text-muted-foreground">
                    Optimizing for{" "}
                    {selectedJob?.title || "the selected job"}
                    {selectedJob?.companyName &&
                      ` at ${selectedJob.companyName}`}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground mt-3">
                    <Badge variant="outline" className="text-xs">
                      <Zap className="h-3 w-3 mr-1" />
                      Hybrid System
                    </Badge>
                    <span>Running pre-analysis, applying rules, and scoring</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    This may take up to 90 seconds
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {tailorResult && resume && (
          <StaggerContainer className="space-y-6">
            {/* Recruiter Readiness Score - Main Feature */}
            <StaggerItem>
              <div className="grid gap-6 md:grid-cols-[1fr_300px]">
                <div className="space-y-6">
                  {/* Changes Summary */}
                  <ChangesSummary changes={tailorResult.changes} />

                  {/* Processing Stats */}
                  <Card className="bg-muted/30">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Processed in {(tailorResult.processingTimeMs / 1000).toFixed(1)}s</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Zap className="h-3.5 w-3.5" />
                          <span>{tailorResult.tokenUsage.total.toLocaleString()} tokens used</span>
                        </div>
                        {tailorResult.tokenUsage.savedVsPureAI > 0 && (
                          <Badge variant="outline" className="text-xs text-green-600 border-green-200 bg-green-50">
                            {tailorResult.tokenUsage.savedVsPureAI.toLocaleString()} tokens saved
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {tailorResult.appliedRules.length} rules applied
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Score Card */}
                <RecruiterReadinessCard
                  score={tailorResult.qualityScore}
                  showRecommendations={true}
                />
              </div>
            </StaggerItem>

            {/* Comparison View */}
            <StaggerItem>
              <ResumeComparison
                original={resume.content}
                tailored={tailorResult.tailoredResume}
                changes={tailorResult.changes}
              />
            </StaggerItem>

            {/* Actions */}
            <StaggerItem>
              <Card>
                <CardContent className="pt-6">
                  <TailorActions
                    resumeName={resume.name}
                    tailoredContent={tailorResult.tailoredResume}
                    jobTitle={selectedJob?.title || "Job"}
                    onDiscard={handleDiscard}
                  />
                </CardContent>
              </Card>
            </StaggerItem>
          </StaggerContainer>
        )}
      </div>
    </PageTransition>
  );
}
