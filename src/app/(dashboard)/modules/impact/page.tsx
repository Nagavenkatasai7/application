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
  FileText,
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
import { CircularProgress } from "@/components/ui/circular-progress";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";
import type { ImpactResult, ImpactBullet } from "@/lib/validations/impact";
import {
  getImprovementColor,
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
              <EmptyState
                icon={<FileText />}
                title="No Resumes Found"
                description="Create a resume first to transform your bullet points into powerful, metrics-driven achievement statements."
                action={{
                  label: "Create Resume",
                  href: "/resumes/new",
                }}
                variant="encourage"
                tip="Numbers speak louder than words - quantified achievements get noticed by recruiters."
                className="mt-6"
              />
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
            {/* Score Card with CircularProgress */}
            <StaggerItem>
              <Card className="overflow-hidden">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <CircularProgress
                        value={result.score}
                        size="xl"
                        showLabel
                        animated
                        celebrate={result.score >= 80}
                      />
                      <div>
                        <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">
                          Impact Score
                        </p>
                        <Badge variant="outline" className="mt-2 capitalize text-sm px-3 py-1">
                          {result.scoreLabel}
                        </Badge>
                        <p className="mt-3 text-muted-foreground max-w-md leading-relaxed">{result.summary}</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <StatCard
                        label="Total Bullets"
                        value={result.totalBullets}
                        icon={<BarChart3 />}
                        size="sm"
                        variant="outline"
                      />
                      <StatCard
                        label="Improved"
                        value={result.bulletsImproved}
                        icon={<TrendingUp />}
                        size="sm"
                        variant="gradient"
                        trend={{
                          value: Math.round((result.bulletsImproved / result.totalBullets) * 100),
                          direction: result.bulletsImproved > 0 ? "up" : "stable",
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>

            {/* Metric Categories */}
            <StaggerItem>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Hash className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Metrics Found</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  <StatCard
                    label="Percentage"
                    value={result.metricCategories.percentage}
                    icon={<Percent />}
                    size="sm"
                    variant="glass"
                  />
                  <StatCard
                    label="Monetary"
                    value={result.metricCategories.monetary}
                    icon={<DollarSign />}
                    size="sm"
                    variant="glass"
                  />
                  <StatCard
                    label="Time"
                    value={result.metricCategories.time}
                    icon={<Clock />}
                    size="sm"
                    variant="glass"
                  />
                  <StatCard
                    label="Scale"
                    value={result.metricCategories.scale}
                    icon={<Users />}
                    size="sm"
                    variant="glass"
                  />
                  <StatCard
                    label="Other"
                    value={result.metricCategories.other}
                    icon={<Hash />}
                    size="sm"
                    variant="glass"
                  />
                </div>
              </div>
            </StaggerItem>

            {/* Bullet Improvements */}
            <StaggerItem>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">
                    Bullet Point Improvements ({result.bullets.length})
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Before and after comparison with quantified metrics
                </p>
                <BentoGrid columns={2} gap="md">
                  {result.bullets.map((bullet) => (
                    <BulletCard key={bullet.id} bullet={bullet} />
                  ))}
                </BentoGrid>
              </div>
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
 * Individual bullet card component with BentoCard styling
 */
function BulletCard({ bullet }: { bullet: ImpactBullet }) {
  const isImproved = bullet.improvement !== "none";

  return (
    <BentoCard variant="glass" hover animated>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-sm text-foreground">{bullet.experienceTitle}</p>
            <p className="text-xs text-muted-foreground">{bullet.companyName}</p>
          </div>
          <Badge className={`text-xs shrink-0 ${getImprovementColor(bullet.improvement)}`}>
            {getImprovementLabel(bullet.improvement)}
          </Badge>
        </div>

        {isImproved ? (
          <div className="space-y-3">
            {/* Original */}
            <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
              <p className="text-xs text-destructive uppercase tracking-wide mb-1.5 font-medium">Original</p>
              <p className="text-sm text-muted-foreground line-through">{bullet.original}</p>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <div className="p-1.5 rounded-full bg-primary/10">
                <ArrowRight className="h-4 w-4 text-primary" />
              </div>
            </div>

            {/* Improved */}
            <div className="p-3 rounded-lg bg-success/5 border border-success/20">
              <p className="text-xs text-success uppercase tracking-wide mb-1.5 font-medium">Improved</p>
              <p className="text-sm font-medium text-foreground">{bullet.improved}</p>
            </div>

            {/* Metrics Added */}
            {bullet.metrics.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {bullet.metrics.map((metric, i) => (
                  <Badge key={i} variant="secondary" className="text-xs bg-primary/10 text-primary border-0">
                    {metric}
                  </Badge>
                ))}
              </div>
            )}

            {/* Explanation */}
            {bullet.explanation && (
              <div className="pt-2 border-t border-border/50">
                <p className="text-xs text-muted-foreground italic leading-relaxed">
                  {bullet.explanation}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-success/5 border border-success/20">
            <div className="flex items-center gap-2 mb-1.5">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <p className="text-xs text-success uppercase tracking-wide font-medium">Already Quantified</p>
            </div>
            <p className="text-sm text-foreground">{bullet.original}</p>
          </div>
        )}
      </div>
    </BentoCard>
  );
}
