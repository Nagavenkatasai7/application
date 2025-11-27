"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Target,
  Loader2,
  AlertCircle,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Briefcase,
  FileText,
  TrendingUp,
  Search,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/layout/page-transition";
import type {
  ContextResult,
  MatchedSkill,
  MissingRequirement,
  ExperienceAlignment,
} from "@/lib/validations/context";
import {
  getContextScoreColor,
  getRelevanceColor,
  getImportanceColor,
  getStrengthColor,
  getPriorityColor,
} from "@/lib/validations/context";

interface Resume {
  id: string;
  name: string;
  content: unknown;
}

interface Job {
  id: string;
  title: string;
  companyName: string | null;
  description: string | null;
}

interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
  meta?: { total: number };
}

export default function ContextPage() {
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [result, setResult] = useState<ContextResult | null>(null);

  // Fetch user's resumes
  const { data: resumesData, isLoading: resumesLoading } = useQuery<APIResponse<Resume[]>>({
    queryKey: ["resumes"],
    queryFn: async () => {
      const res = await fetch("/api/resumes");
      if (!res.ok) throw new Error("Failed to fetch resumes");
      return res.json();
    },
  });

  // Fetch jobs
  const { data: jobsData, isLoading: jobsLoading } = useQuery<APIResponse<Job[]>>({
    queryKey: ["jobs"],
    queryFn: async () => {
      const res = await fetch("/api/jobs");
      if (!res.ok) throw new Error("Failed to fetch jobs");
      return res.json();
    },
  });

  const resumes = resumesData?.data || [];
  const jobs = jobsData?.data || [];

  // Context analysis mutation
  const analyzeMutation = useMutation({
    mutationFn: async ({ resumeId, jobId }: { resumeId: string; jobId: string }) => {
      const res = await fetch("/api/modules/context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId, jobId }),
      });
      const data: APIResponse<ContextResult> = await res.json();
      if (!data.success) {
        throw new Error(data.error?.message || "Analysis failed");
      }
      return data.data!;
    },
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const handleAnalyze = () => {
    if (!selectedResumeId || !selectedJobId) return;
    setResult(null);
    analyzeMutation.mutate({ resumeId: selectedResumeId, jobId: selectedJobId });
  };

  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  return (
    <PageTransition>
      <div className="container max-w-5xl py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Context Alignment</h1>
          </div>
          <p className="text-muted-foreground">
            Analyze how well your resume aligns with a specific job opportunity.
            Get detailed insights on skill matches, gaps, and tailoring suggestions.
          </p>
        </div>

        {/* Selection Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Resume and Job</CardTitle>
            <CardDescription>
              Choose a resume and job to analyze their alignment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Resume Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Resume
                </label>
                <Select
                  value={selectedResumeId}
                  onValueChange={setSelectedResumeId}
                  disabled={resumesLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={resumesLoading ? "Loading..." : "Select a resume"} />
                  </SelectTrigger>
                  <SelectContent>
                    {resumes.map((resume) => (
                      <SelectItem key={resume.id} value={resume.id}>
                        {resume.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {resumes.length === 0 && !resumesLoading && (
                  <p className="text-xs text-muted-foreground">
                    No resumes found. Create a resume first.
                  </p>
                )}
              </div>

              {/* Job Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  Job
                </label>
                <Select
                  value={selectedJobId}
                  onValueChange={setSelectedJobId}
                  disabled={jobsLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={jobsLoading ? "Loading..." : "Select a job"} />
                  </SelectTrigger>
                  <SelectContent>
                    {jobs.map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.title} {job.companyName ? `@ ${job.companyName}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {jobs.length === 0 && !jobsLoading && (
                  <p className="text-xs text-muted-foreground">
                    No jobs found. Add a job first.
                  </p>
                )}
              </div>
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={!selectedResumeId || !selectedJobId || analyzeMutation.isPending}
              className="w-full md:w-auto"
            >
              {analyzeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Alignment...
                </>
              ) : (
                <>
                  <Target className="mr-2 h-4 w-4" />
                  Analyze Context Alignment
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Error State */}
        {analyzeMutation.isError && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <p>{analyzeMutation.error?.message || "Failed to analyze alignment"}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {analyzeMutation.isPending && (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <div className="text-center">
                  <p className="font-medium">Analyzing alignment...</p>
                  <p className="text-sm text-muted-foreground">
                    Comparing your resume with {selectedJob?.title || "the job"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {result && (
          <StaggerContainer className="space-y-6">
            {/* Score Card */}
            <StaggerItem>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground uppercase tracking-wide">
                        Alignment Score
                      </p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className={`text-5xl font-bold ${getContextScoreColor(result.scoreLabel)}`}>
                          {result.score}
                        </span>
                        <span className="text-2xl text-muted-foreground">/100</span>
                      </div>
                      <Badge variant="outline" className="mt-2 capitalize">
                        {result.scoreLabel}
                      </Badge>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-500">{result.matchedSkills.length}</p>
                          <p className="text-xs text-muted-foreground">Matched Skills</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-red-500">{result.missingRequirements.length}</p>
                          <p className="text-xs text-muted-foreground">Missing</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-muted-foreground">{result.summary}</p>
                </CardContent>
              </Card>
            </StaggerItem>

            {/* Keyword Coverage */}
            <StaggerItem>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-primary" />
                    Keyword Coverage
                  </CardTitle>
                  <CardDescription>
                    ATS optimization - keywords from the job description found in your resume
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Progress value={result.keywordCoverage.percentage} className="flex-1" />
                      <span className="text-sm font-medium">
                        {result.keywordCoverage.matched}/{result.keywordCoverage.total} ({result.keywordCoverage.percentage}%)
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.keywordCoverage.keywords.map((kw, i) => (
                        <Badge
                          key={i}
                          variant={kw.found ? "default" : "outline"}
                          className={kw.found ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}
                        >
                          {kw.found ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                          {kw.keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>

            {/* Matched Skills */}
            {result.matchedSkills.length > 0 && (
              <StaggerItem>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      Matched Skills ({result.matchedSkills.length})
                    </CardTitle>
                    <CardDescription>
                      Skills from your resume that match the job requirements
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {result.matchedSkills.map((skill, i) => (
                        <SkillCard key={i} skill={skill} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            )}

            {/* Missing Requirements */}
            {result.missingRequirements.length > 0 && (
              <StaggerItem>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                      Missing Requirements ({result.missingRequirements.length})
                    </CardTitle>
                    <CardDescription>
                      Job requirements not found in your resume
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {result.missingRequirements.map((req, i) => (
                        <RequirementCard key={i} requirement={req} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            )}

            {/* Experience Alignment */}
            {result.experienceAlignments.length > 0 && (
              <StaggerItem>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                      Experience Relevance
                    </CardTitle>
                    <CardDescription>
                      How your work experience aligns with this role
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {result.experienceAlignments.map((exp, i) => (
                        <ExperienceCard key={i} experience={exp} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            )}

            {/* Fit Assessment */}
            <StaggerItem>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Fit Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-green-500 mb-2">Strengths</p>
                      <ul className="space-y-1">
                        {result.fitAssessment.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-red-500 mb-2">Gaps</p>
                      <ul className="space-y-1">
                        {result.fitAssessment.gaps.map((g, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <span>{g}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 border">
                    <p className="text-sm">{result.fitAssessment.overallFit}</p>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>

            {/* Suggestions */}
            {result.suggestions.length > 0 && (
              <StaggerItem>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-amber-500" />
                      Recommendations
                    </CardTitle>
                    <CardDescription>
                      Prioritized suggestions to improve your alignment
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {result.suggestions.map((suggestion, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-lg bg-muted/50 border"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs capitalize">
                              {suggestion.category}
                            </Badge>
                            <span className={`text-xs font-medium ${getPriorityColor(suggestion.priority)}`}>
                              {suggestion.priority} priority
                            </span>
                          </div>
                          <p className="text-sm">{suggestion.recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            )}
          </StaggerContainer>
        )}
      </div>
    </PageTransition>
  );
}

/**
 * Matched skill card component
 */
function SkillCard({ skill }: { skill: MatchedSkill }) {
  return (
    <div className="p-3 rounded-lg border bg-card">
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-sm">{skill.skill}</span>
        <Badge className={`text-xs capitalize ${getStrengthColor(skill.strength)}`}>
          {skill.strength}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground">
        Found in: {skill.source} | {skill.evidence}
      </p>
    </div>
  );
}

/**
 * Missing requirement card component
 */
function RequirementCard({ requirement }: { requirement: MissingRequirement }) {
  return (
    <div className="p-4 rounded-lg border bg-card">
      <div className="flex items-start justify-between gap-4 mb-2">
        <span className="font-medium text-sm">{requirement.requirement}</span>
        <Badge className={`text-xs capitalize ${getImportanceColor(requirement.importance)}`}>
          {requirement.importance.replace("_", " ")}
        </Badge>
      </div>
      <div className="p-2 rounded bg-primary/5 border border-primary/10">
        <p className="text-xs text-primary uppercase tracking-wide mb-1">Suggestion</p>
        <p className="text-sm text-muted-foreground">{requirement.suggestion}</p>
      </div>
    </div>
  );
}

/**
 * Experience alignment card component
 */
function ExperienceCard({ experience }: { experience: ExperienceAlignment }) {
  return (
    <div className="p-4 rounded-lg border bg-card">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <p className="font-medium">{experience.experienceTitle}</p>
          <p className="text-sm text-muted-foreground">{experience.companyName}</p>
        </div>
        <Badge className={`capitalize ${getRelevanceColor(experience.relevance)}`}>
          {experience.relevance} relevance
        </Badge>
      </div>
      {experience.matchedAspects.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {experience.matchedAspects.map((aspect, i) => (
            <Badge key={i} variant="secondary" className="text-xs">
              {aspect}
            </Badge>
          ))}
        </div>
      )}
      <p className="text-sm text-muted-foreground">{experience.explanation}</p>
    </div>
  );
}
