"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Building2,
  Loader2,
  AlertCircle,
  Search,
  Users,
  TrendingUp,
  Target,
  MessageSquare,
  Star,
  ThumbsUp,
  ThumbsDown,
  Briefcase,
  MapPin,
  Calendar,
  Globe,
  DollarSign,
  Award,
  Lightbulb,
  CheckCircle,
  Circle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/layout/page-transition";
import type { CompanyResearchResult, InterviewTip } from "@/lib/validations/company";
import {
  getCultureScoreColor,
  getCultureScoreLabel,
  getInterviewCategoryLabel,
  getPriorityColor,
  getPriorityBgColor,
} from "@/lib/validations/company";

interface APIResponse<T> {
  success: boolean;
  data?: T;
  cached?: boolean;
  status?: "processing" | "pending" | "completed" | "failed";
  requestId?: string;
  error?: { code: string; message: string };
}

interface StatusResponse {
  success: boolean;
  status: "pending" | "processing" | "completed" | "failed";
  data?: CompanyResearchResult;
  error?: { code: string; message: string };
}

// Processing steps for progress indicator
const PROCESSING_STEPS = [
  "Initializing research...",
  "Analyzing company profile",
  "Evaluating culture dimensions",
  "Gathering employee insights",
  "Preparing interview tips",
];

export default function CompanyResearchPage() {
  const [companyName, setCompanyName] = useState("");
  const [searchedName, setSearchedName] = useState("");
  const [result, setResult] = useState<CompanyResearchResult | null>(null);
  const [wasCached, setWasCached] = useState(false);
  const [pollingId, setPollingId] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Status polling query
  const statusQuery = useQuery<StatusResponse>({
    queryKey: ["company-status", pollingId],
    queryFn: async () => {
      const res = await fetch(`/api/modules/company/status/${pollingId}`);
      let data: StatusResponse;
      try {
        data = await res.json();
      } catch {
        throw new Error("Failed to check status");
      }
      return data;
    },
    enabled: !!pollingId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === "completed" || data?.status === "failed") {
        return false; // Stop polling
      }
      return 2000; // Poll every 2 seconds
    },
  });

  // Handle status updates - this is a legitimate sync from external data (React Query)
  // to local state, which requires useEffect
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (statusQuery.data?.status === "completed" && statusQuery.data.data) {
      setResult(statusQuery.data.data);
      setPollingId(null);
      setProcessingStep(0);
      setWasCached(false);
    }
    if (statusQuery.data?.status === "failed") {
      setError(statusQuery.data.error?.message || "Company research failed");
      setPollingId(null);
      setProcessingStep(0);
    }
    // Animate progress steps while processing
    if (statusQuery.data?.status === "processing" || statusQuery.data?.status === "pending") {
      setProcessingStep((prev) => (prev < PROCESSING_STEPS.length - 1 ? prev + 1 : prev));
    }
  }, [statusQuery.data]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Company research mutation
  const researchMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch("/api/modules/company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName: name }),
      });

      // Safely parse JSON response - handle non-JSON error responses
      let data: APIResponse<CompanyResearchResult>;
      try {
        data = await res.json();
      } catch {
        // Response was not JSON (e.g., server error)
        throw new Error(res.ok ? "Invalid response from server" : `Server error: ${res.status}`);
      }

      if (!data.success && !data.status) {
        throw new Error(data.error?.message || "Research failed");
      }
      return data;
    },
    onSuccess: (data) => {
      if (data.status === "processing" && data.requestId) {
        // Start polling
        setPollingId(data.requestId);
        setProcessingStep(1);
        setError(null);
      } else if (data.data) {
        // Immediate result (cached)
        setResult(data.data);
        setWasCached(data.cached || false);
        setError(null);
      }
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleResearch = () => {
    if (!companyName.trim()) return;
    setResult(null);
    setWasCached(false);
    setPollingId(null);
    setProcessingStep(0);
    setError(null);
    setSearchedName(companyName.trim());
    researchMutation.mutate(companyName.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleResearch();
    }
  };

  // Loading state includes both mutation pending and polling
  const isLoading = researchMutation.isPending || !!pollingId;
  const hasError = !!error || researchMutation.isError;
  const errorMessage = error || researchMutation.error?.message || "Failed to research company";

  // Calculate average culture score
  const avgCultureScore = result?.cultureDimensions.length
    ? result.cultureDimensions.reduce((sum, d) => sum + d.score, 0) / result.cultureDimensions.length
    : 0;

  return (
    <PageTransition>
      <div className="container max-w-5xl py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Company Research</h1>
          </div>
          <p className="text-muted-foreground">
            Get comprehensive intelligence about any company. Understand their culture,
            prepare for interviews, and align your application with their values.
          </p>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Research a Company</CardTitle>
            <CardDescription>
              Enter a company name to generate AI-powered insights and interview preparation tips
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g., Google, Stripe, Anthropic..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleResearch}
                disabled={!companyName.trim() || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Researching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Research
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {hasError && !isLoading && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <p>{errorMessage}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={handleResearch}
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Loading State with Progress */}
        {isLoading && (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center gap-6">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <div className="text-center space-y-4 w-full max-w-md">
                  <p className="font-medium text-lg">Researching {searchedName}...</p>

                  {/* Progress Steps */}
                  <div className="space-y-2 text-left">
                    {PROCESSING_STEPS.map((step, idx) => (
                      <div
                        key={step}
                        className={`flex items-center gap-3 text-sm transition-all duration-300 ${
                          idx <= processingStep ? "opacity-100" : "opacity-30"
                        }`}
                      >
                        {idx < processingStep ? (
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        ) : idx === processingStep ? (
                          <Loader2 className="h-4 w-4 animate-spin text-primary flex-shrink-0" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground/30 flex-shrink-0" />
                        )}
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-muted-foreground mt-4">
                    This usually takes 15-30 seconds for new companies.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {result && (
          <StaggerContainer className="space-y-6">
            {/* Company Overview Card */}
            <StaggerItem>
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">{result.companyName}</CardTitle>
                      <CardDescription className="mt-1">{result.industry}</CardDescription>
                    </div>
                    {wasCached && (
                      <Badge variant="outline" className="text-xs">
                        Cached
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{result.summary}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {result.founded && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Founded {result.founded}</span>
                      </div>
                    )}
                    {result.headquarters && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{result.headquarters}</span>
                      </div>
                    )}
                    {result.employeeCount && (
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{result.employeeCount}</span>
                      </div>
                    )}
                    {result.website && (
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{result.website}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>

            {/* Culture Analysis */}
            <StaggerItem>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Culture Analysis
                  </CardTitle>
                  <CardDescription>
                    Culture dimensions rated on a 1-5 scale
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Overall Score */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-sm text-muted-foreground">Overall Culture Score</p>
                      <div className="flex items-baseline gap-2">
                        <span className={`text-3xl font-bold ${getCultureScoreColor(avgCultureScore)}`}>
                          {avgCultureScore.toFixed(1)}
                        </span>
                        <span className="text-muted-foreground">/5</span>
                      </div>
                      <Badge variant="outline" className="mt-1">
                        {getCultureScoreLabel(avgCultureScore)}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${
                            star <= Math.round(avgCultureScore)
                              ? "text-amber-500 fill-amber-500"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Culture Dimensions */}
                  <div className="grid gap-4">
                    {result.cultureDimensions.map((dim) => (
                      <div key={dim.dimension} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{dim.dimension}</span>
                          <span className={`font-semibold ${getCultureScoreColor(dim.score)}`}>
                            {dim.score.toFixed(1)}
                          </span>
                        </div>
                        <Progress value={(dim.score / 5) * 100} className="h-2" />
                        <p className="text-xs text-muted-foreground">{dim.description}</p>
                      </div>
                    ))}
                  </div>

                  {result.cultureOverview && (
                    <p className="text-sm text-muted-foreground p-4 rounded-lg bg-muted/50">
                      {result.cultureOverview}
                    </p>
                  )}
                </CardContent>
              </Card>
            </StaggerItem>

            {/* Employee Insights (Glassdoor-style) */}
            <StaggerItem>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Employee Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Rating & Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    {result.glassdoorData.overallRating && (
                      <div className="text-center p-4 rounded-lg bg-muted/50">
                        <p className="text-3xl font-bold text-primary">
                          {result.glassdoorData.overallRating.toFixed(1)}
                        </p>
                        <p className="text-xs text-muted-foreground">Overall Rating</p>
                      </div>
                    )}
                    {result.glassdoorData.recommendToFriend && (
                      <div className="text-center p-4 rounded-lg bg-muted/50">
                        <p className="text-lg font-bold text-green-500">
                          {result.glassdoorData.recommendToFriend}
                        </p>
                        <p className="text-xs text-muted-foreground">Recommend to Friend</p>
                      </div>
                    )}
                    {result.glassdoorData.ceoApproval && (
                      <div className="text-center p-4 rounded-lg bg-muted/50">
                        <p className="text-lg font-bold text-blue-500">
                          {result.glassdoorData.ceoApproval}
                        </p>
                        <p className="text-xs text-muted-foreground">CEO Approval</p>
                      </div>
                    )}
                  </div>

                  {/* Pros & Cons */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {result.glassdoorData.pros.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <ThumbsUp className="h-4 w-4 text-green-500" />
                          <span className="font-medium text-sm">Pros</span>
                        </div>
                        <ul className="space-y-1">
                          {result.glassdoorData.pros.map((pro, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.glassdoorData.cons.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <ThumbsDown className="h-4 w-4 text-red-500" />
                          <span className="font-medium text-sm">Cons</span>
                        </div>
                        <ul className="space-y-1">
                          {result.glassdoorData.cons.map((con, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <AlertCircle className="h-3 w-3 text-red-500 mt-1 flex-shrink-0" />
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>

            {/* Funding & Business */}
            {(result.fundingData.stage || result.fundingData.totalRaised) && (
              <StaggerItem>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      Funding & Business
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {result.fundingData.stage && (
                        <div className="p-4 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground">Stage</p>
                          <p className="font-medium">{result.fundingData.stage}</p>
                        </div>
                      )}
                      {result.fundingData.totalRaised && (
                        <div className="p-4 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground">Total Raised</p>
                          <p className="font-medium">{result.fundingData.totalRaised}</p>
                        </div>
                      )}
                      {result.fundingData.valuation && (
                        <div className="p-4 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground">Valuation</p>
                          <p className="font-medium">{result.fundingData.valuation}</p>
                        </div>
                      )}
                      {result.fundingData.lastRound && (
                        <div className="p-4 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground">Last Round</p>
                          <p className="font-medium">
                            {result.fundingData.lastRound.round}
                            {result.fundingData.lastRound.amount && ` (${result.fundingData.lastRound.amount})`}
                          </p>
                        </div>
                      )}
                    </div>
                    {result.fundingData.notableInvestors.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs text-muted-foreground mb-2">Notable Investors</p>
                        <div className="flex flex-wrap gap-2">
                          {result.fundingData.notableInvestors.map((investor, i) => (
                            <Badge key={i} variant="secondary">{investor}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </StaggerItem>
            )}

            {/* Competitors */}
            {result.competitors.length > 0 && (
              <StaggerItem>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Competitive Landscape
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      {result.competitors.map((comp, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <span className="font-medium">{comp.name}</span>
                          <span className="text-sm text-muted-foreground">{comp.relationship}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            )}

            {/* Interview Preparation */}
            <StaggerItem>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    Interview Preparation
                  </CardTitle>
                  <CardDescription>
                    Tips and topics to help you prepare
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Common Topics */}
                  {result.commonInterviewTopics.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Common Interview Topics</p>
                      <div className="flex flex-wrap gap-2">
                        {result.commonInterviewTopics.map((topic, i) => (
                          <Badge key={i} variant="outline">{topic}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tips by Category */}
                  <div className="space-y-4">
                    {(["preparation", "technical", "behavioral", "cultural_fit", "questions_to_ask"] as const).map((category) => {
                      const tips = result.interviewTips.filter((t) => t.category === category);
                      if (tips.length === 0) return null;

                      return (
                        <div key={category} className="space-y-2">
                          <p className="text-sm font-medium">{getInterviewCategoryLabel(category)}</p>
                          <div className="space-y-2">
                            {tips.map((tip, i) => (
                              <InterviewTipCard key={i} tip={tip} />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>

            {/* Values Alignment */}
            <StaggerItem>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Values Alignment
                  </CardTitle>
                  <CardDescription>
                    Demonstrate fit with company values
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Core Values */}
                  {result.coreValues.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Core Values</p>
                      <div className="flex flex-wrap gap-2">
                        {result.coreValues.map((value, i) => (
                          <Badge key={i} className="bg-primary/10 text-primary border-primary/20">
                            {value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* How to Demonstrate */}
                  {result.valuesAlignment.length > 0 && (
                    <div className="space-y-3">
                      {result.valuesAlignment.map((va, i) => (
                        <div key={i} className="p-4 rounded-lg bg-muted/50 border">
                          <p className="font-medium text-sm text-primary mb-1">{va.value}</p>
                          <p className="text-sm text-muted-foreground">{va.howToDemo}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </StaggerItem>

            {/* Key Takeaways */}
            {result.keyTakeaways.length > 0 && (
              <StaggerItem>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-amber-500" />
                      Key Takeaways
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.keyTakeaways.map((takeaway, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <TrendingUp className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{takeaway}</span>
                        </li>
                      ))}
                    </ul>
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
 * Interview tip card component
 */
function InterviewTipCard({ tip }: { tip: InterviewTip }) {
  return (
    <div className={`p-3 rounded-lg border ${getPriorityBgColor(tip.priority)}`}>
      <div className="flex items-start gap-2">
        <Badge variant="outline" className={`text-xs ${getPriorityColor(tip.priority)}`}>
          {tip.priority}
        </Badge>
        <p className="text-sm">{tip.tip}</p>
      </div>
    </div>
  );
}
