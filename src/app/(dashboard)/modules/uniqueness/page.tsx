"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sparkles, Loader2, AlertCircle, ChevronRight, Lightbulb, TrendingUp, FileText } from "lucide-react";
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
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";
import type { UniquenessResult, UniquenessFactor } from "@/lib/validations/uniqueness";
import { getRarityColor } from "@/lib/validations/uniqueness";

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

export default function UniquenessPage() {
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [result, setResult] = useState<UniquenessResult | null>(null);

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

  // Uniqueness analysis mutation
  const analyzeMutation = useMutation({
    mutationFn: async (resumeId: string) => {
      const res = await fetch("/api/modules/uniqueness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId }),
      });
      const data: APIResponse<UniquenessResult> = await res.json();
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
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Uniqueness Extraction</h1>
          </div>
          <p className="text-muted-foreground">
            Discover what makes you stand out from other candidates. Identify rare skill combinations,
            distinctive experiences, and unique differentiators.
          </p>
        </div>

        {/* Resume Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Resume to Analyze</CardTitle>
            <CardDescription>
              Choose a resume to identify your unique differentiators
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
                    <Sparkles className="mr-2 h-4 w-4" />
                    Analyze Uniqueness
                  </>
                )}
              </Button>
            </div>

            {resumes.length === 0 && !resumesLoading && (
              <EmptyState
                icon={<FileText />}
                title="No Resumes Found"
                description="Create a resume first to analyze your uniqueness and discover what makes you stand out from other candidates."
                action={{
                  label: "Create Resume",
                  href: "/resumes/new",
                }}
                variant="encourage"
                tip="Your unique combination of skills is more valuable than any single skill."
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
                <p>{analyzeMutation.error?.message || "Failed to analyze uniqueness"}</p>
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
                    Identifying rare skills, unique experiences, and differentiators
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
              <Card className="overflow-hidden">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">
                        Uniqueness Score
                      </p>
                      <p className="mt-4 text-muted-foreground leading-relaxed">{result.summary}</p>
                      <Badge variant="outline" className="mt-4 capitalize text-sm px-3 py-1">
                        {result.scoreLabel}
                      </Badge>
                    </div>
                    <div className="shrink-0">
                      <CircularProgress
                        value={result.score}
                        size="xl"
                        showLabel
                        animated
                        celebrate={result.score >= 80}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>

            {/* Key Differentiators */}
            {result.differentiators.length > 0 && (
              <StaggerItem>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Key Differentiators
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.differentiators.map((diff, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>{diff}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </StaggerItem>
            )}

            {/* Uniqueness Factors */}
            <StaggerItem>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">
                    Uniqueness Factors ({result.factors.length})
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Detailed analysis of what makes you unique
                </p>
                <BentoGrid columns={2} gap="md">
                  {result.factors.map((factor) => (
                    <FactorCard key={factor.id} factor={factor} />
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
                      Suggestions to Enhance Uniqueness
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
 * Individual factor card component with enhanced styling
 */
function FactorCard({ factor }: { factor: UniquenessFactor }) {
  const typeLabels: Record<UniquenessFactor["type"], string> = {
    skill_combination: "Skill Combination",
    career_transition: "Career Transition",
    unique_experience: "Unique Experience",
    domain_expertise: "Domain Expertise",
    achievement: "Achievement",
    education: "Education",
  };

  const typeIcons: Record<UniquenessFactor["type"], React.ReactNode> = {
    skill_combination: <Sparkles className="h-4 w-4" />,
    career_transition: <TrendingUp className="h-4 w-4" />,
    unique_experience: <Lightbulb className="h-4 w-4" />,
    domain_expertise: <FileText className="h-4 w-4" />,
    achievement: <TrendingUp className="h-4 w-4" />,
    education: <FileText className="h-4 w-4" />,
  };

  return (
    <BentoCard variant="glass" hover animated>
      <div className="space-y-3">
        {/* Header with badges */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              {typeIcons[factor.type]}
            </div>
            <Badge variant="outline" className="text-xs font-medium">
              {typeLabels[factor.type]}
            </Badge>
          </div>
          <Badge className={`text-xs capitalize ${getRarityColor(factor.rarity)}`}>
            {factor.rarity.replace("_", " ")}
          </Badge>
        </div>

        {/* Title and description */}
        <div>
          <h4 className="font-semibold text-foreground">{factor.title}</h4>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            {factor.description}
          </p>
        </div>

        {/* Evidence section */}
        {factor.evidence.length > 0 && (
          <div className="pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2 font-medium">
              Evidence
            </p>
            <ul className="text-sm space-y-1.5">
              {factor.evidence.map((e, i) => (
                <li key={i} className="text-muted-foreground italic text-sm flex items-start gap-2">
                  <ChevronRight className="h-3 w-3 mt-1 shrink-0 text-primary/60" />
                  <span>&ldquo;{e}&rdquo;</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggestion section */}
        {factor.suggestion && (
          <div className="mt-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-2 mb-1.5">
              <Lightbulb className="h-3.5 w-3.5 text-primary" />
              <p className="text-xs text-primary uppercase tracking-wide font-medium">
                How to emphasize
              </p>
            </div>
            <p className="text-sm text-foreground/80">{factor.suggestion}</p>
          </div>
        )}
      </div>
    </BentoCard>
  );
}
