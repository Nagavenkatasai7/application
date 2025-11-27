"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  TrendingUp,
  Loader2,
  AlertCircle,
  Lightbulb,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Percent,
  DollarSign,
  Clock,
  Users,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/layout/page-transition";
import type { ImpactResult, ImpactBullet } from "@/lib/validations/impact";
import {
  getImprovementColor,
  getImpactScoreColor,
  getImprovementLabel,
} from "@/lib/validations/impact";

interface Resume {
  id: string;
  name: string;
  content: unknown;
}

interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
  meta?: { total: number };
}

export default function ImpactPage() {
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [result, setResult] = useState<ImpactResult | null>(null);

  // Fetch user's resumes
  const { data: resumesData, isLoading: resumesLoading } = useQuery<APIResponse<Resume[]>>({
    queryKey: ["resumes"],
    queryFn: async () => {
      const res = await fetch("/api/resumes");
      if (!res.ok) throw new Error("Failed to fetch resumes");
      return res.json();
    },
  });

  const resumes = resumesData?.data || [];

  // Impact analysis mutation
  const analyzeMutation = useMutation({
    mutationFn: async (resumeId: string) => {
      const res = await fetch("/api/modules/impact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId }),
      });
      const data: APIResponse<ImpactResult> = await res.json();
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
    if (!selectedResumeId) return;
    setResult(null);
    analyzeMutation.mutate(selectedResumeId);
  };

  return (
    <PageTransition>
      <div className="container max-w-5xl py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Impact Quantification</h1>
          </div>
          <p className="text-muted-foreground">
            Transform vague bullet points into powerful, metrics-driven achievement statements.
            Add percentages, dollar amounts, and concrete numbers to showcase your impact.
          </p>
        </div>

        {/* Resume Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Resume to Analyze</CardTitle>
            <CardDescription>
              Choose a resume to quantify your achievements with specific metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Select
                value={selectedResumeId}
                onValueChange={setSelectedResumeId}
                disabled={resumesLoading}
              >
                <SelectTrigger className="w-[300px]">
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
              <Button
                onClick={handleAnalyze}
                disabled={!selectedResumeId || analyzeMutation.isPending}
              >
                {analyzeMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Quantify Impact
                  </>
                )}
              </Button>
            </div>

            {resumes.length === 0 && !resumesLoading && (
              <p className="mt-4 text-sm text-muted-foreground">
                No resumes found. Create a resume first to analyze your impact.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Error State */}
        {analyzeMutation.isError && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <p>{analyzeMutation.error?.message || "Failed to analyze impact"}</p>
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
                  <p className="font-medium">Analyzing your resume...</p>
                  <p className="text-sm text-muted-foreground">
                    Transforming bullet points with quantifiable metrics
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
                        Impact Score
                      </p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className={`text-5xl font-bold ${getImpactScoreColor(result.scoreLabel)}`}>
                          {result.score}
                        </span>
                        <span className="text-2xl text-muted-foreground">/100</span>
                      </div>
                      <Badge variant="outline" className="mt-2 capitalize">
                        {result.scoreLabel}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-2xl font-bold">{result.totalBullets}</p>
                          <p className="text-xs text-muted-foreground">Total Bullets</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-green-500">{result.bulletsImproved}</p>
                          <p className="text-xs text-muted-foreground">Improved</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-muted-foreground">{result.summary}</p>
                </CardContent>
              </Card>
            </StaggerItem>

            {/* Metric Categories */}
            <StaggerItem>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hash className="h-5 w-5 text-primary" />
                    Metrics Found
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-4">
                    <MetricCategoryCard
                      icon={<Percent className="h-5 w-5" />}
                      label="Percentage"
                      count={result.metricCategories.percentage}
                      color="text-blue-500"
                    />
                    <MetricCategoryCard
                      icon={<DollarSign className="h-5 w-5" />}
                      label="Monetary"
                      count={result.metricCategories.monetary}
                      color="text-green-500"
                    />
                    <MetricCategoryCard
                      icon={<Clock className="h-5 w-5" />}
                      label="Time"
                      count={result.metricCategories.time}
                      color="text-amber-500"
                    />
                    <MetricCategoryCard
                      icon={<Users className="h-5 w-5" />}
                      label="Scale"
                      count={result.metricCategories.scale}
                      color="text-purple-500"
                    />
                    <MetricCategoryCard
                      icon={<Hash className="h-5 w-5" />}
                      label="Other"
                      count={result.metricCategories.other}
                      color="text-gray-500"
                    />
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>

            {/* Bullet Improvements */}
            <StaggerItem>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Bullet Point Improvements ({result.bullets.length})
                  </CardTitle>
                  <CardDescription>
                    Before and after comparison with quantified metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {result.bullets.map((bullet) => (
                      <BulletCard key={bullet.id} bullet={bullet} />
                    ))}
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
                      Suggestions to Maximize Impact
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {result.suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="p-4 rounded-lg bg-muted/50 border"
                        >
                          <p className="font-medium text-sm text-primary">
                            {suggestion.area}
                          </p>
                          <p className="mt-1 text-muted-foreground">
                            {suggestion.recommendation}
                          </p>
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
 * Metric category card component
 */
function MetricCategoryCard({
  icon,
  label,
  count,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div className="text-center p-4 rounded-lg border bg-card">
      <div className={`inline-flex ${color}`}>{icon}</div>
      <p className="text-2xl font-bold mt-2">{count}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

/**
 * Individual bullet card component
 */
function BulletCard({ bullet }: { bullet: ImpactBullet }) {
  const isImproved = bullet.improvement !== "none";

  return (
    <div className="p-4 rounded-lg border bg-card">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <p className="font-medium text-sm">{bullet.experienceTitle}</p>
          <p className="text-xs text-muted-foreground">{bullet.companyName}</p>
        </div>
        <Badge className={`text-xs ${getImprovementColor(bullet.improvement)}`}>
          {getImprovementLabel(bullet.improvement)}
        </Badge>
      </div>

      {isImproved ? (
        <div className="space-y-3">
          {/* Original */}
          <div className="p-3 rounded bg-red-500/5 border border-red-500/20">
            <p className="text-xs text-red-500 uppercase tracking-wide mb-1">Original</p>
            <p className="text-sm text-muted-foreground line-through">{bullet.original}</p>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <ArrowRight className="h-5 w-5 text-primary" />
          </div>

          {/* Improved */}
          <div className="p-3 rounded bg-green-500/5 border border-green-500/20">
            <p className="text-xs text-green-500 uppercase tracking-wide mb-1">Improved</p>
            <p className="text-sm font-medium">{bullet.improved}</p>
          </div>

          {/* Metrics Added */}
          {bullet.metrics.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {bullet.metrics.map((metric, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {metric}
                </Badge>
              ))}
            </div>
          )}

          {/* Explanation */}
          {bullet.explanation && (
            <p className="text-xs text-muted-foreground italic mt-2">
              {bullet.explanation}
            </p>
          )}
        </div>
      ) : (
        <div className="p-3 rounded bg-green-500/5 border border-green-500/20">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <p className="text-xs text-green-500 uppercase tracking-wide">Already Quantified</p>
          </div>
          <p className="text-sm">{bullet.original}</p>
        </div>
      )}
    </div>
  );
}
