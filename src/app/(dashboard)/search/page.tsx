"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PageTransition,
  StaggerContainer,
  StaggerItem,
} from "@/components/layout/page-transition";
import { LinkedInJobResultCard } from "@/components/jobs/linkedin-job-result-card";
import {
  TIME_FRAME_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS,
  WORKPLACE_TYPE_OPTIONS,
  JOB_TYPE_OPTIONS,
  type LinkedInJobResult,
  type TimeFrame,
  type ExperienceLevel,
  type WorkplaceType,
  type JobType,
} from "@/lib/linkedin/types";
import {
  Linkedin,
  Search,
  Loader2,
  AlertCircle,
  Briefcase,
  Sparkles,
  TrendingUp,
  MapPin,
  Clock,
  Building2,
  Filter,
  X,
} from "lucide-react";

// Search schema matching Apify actor inputs
const linkedInSearchSchema = z.object({
  keywords: z
    .string()
    .min(2, "Job title must be at least 2 characters")
    .max(100, "Job title must be less than 100 characters")
    .trim(),
  location: z
    .string()
    .max(100, "Location must be less than 100 characters")
    .trim()
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
  timeFrame: z.enum(["", "24h", "1w", "1m"] as const).optional(),
  experienceLevel: z
    .enum(["internship", "entry_level", "associate", "mid_senior", "director", "executive"] as const)
    .optional(),
  workplaceType: z.enum(["on_site", "remote", "hybrid"] as const).optional(),
  jobType: z
    .enum(["full_time", "part_time", "contract", "temporary", "internship", "volunteer"] as const)
    .optional(),
  limit: z.coerce.number().min(1).max(50).optional(),
});

type SearchFormData = z.input<typeof linkedInSearchSchema>;
type SearchInput = z.output<typeof linkedInSearchSchema>;

// Popular keyword suggestions
const KEYWORD_SUGGESTIONS = [
  { keyword: "Software Engineer", category: "Tech" },
  { keyword: "Data Analyst", category: "Analytics" },
  { keyword: "Product Manager", category: "Product" },
  { keyword: "UX Designer", category: "Design" },
  { keyword: "Marketing Manager", category: "Marketing" },
  { keyword: "Business Analyst", category: "Business" },
  { keyword: "DevOps Engineer", category: "Tech" },
  { keyword: "Data Scientist", category: "Data" },
  { keyword: "Frontend Developer", category: "Tech" },
  { keyword: "Backend Developer", category: "Tech" },
  { keyword: "Full Stack Developer", category: "Tech" },
  { keyword: "Machine Learning Engineer", category: "AI" },
];

export default function LinkedInSearchPage() {
  const [results, setResults] = useState<LinkedInJobResult[]>([]);
  const [addedJobIds, setAddedJobIds] = useState<Set<string>>(new Set());
  const [hasSearched, setHasSearched] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const queryClient = useQueryClient();

  // Form setup with defaults
  const form = useForm<SearchFormData>({
    resolver: zodResolver(linkedInSearchSchema),
    defaultValues: {
      keywords: "",
      location: "",
      timeFrame: "",
      experienceLevel: undefined,
      workplaceType: undefined,
      jobType: undefined,
      limit: 50,
    },
  });

  // Count active filters
  const activeFilters = [
    form.watch("timeFrame"),
    form.watch("experienceLevel"),
    form.watch("workplaceType"),
    form.watch("jobType"),
  ].filter(Boolean).length;

  // Search mutation
  const searchMutation = useMutation({
    mutationFn: async (data: SearchInput) => {
      const response = await fetch("/api/linkedin/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || "Search failed");
      }

      return result.data;
    },
    onSuccess: (data) => {
      setResults(data.jobs);
      setHasSearched(true);
      if (data.jobs.length === 0) {
        toast.info("No jobs found. Try adjusting your filters or keywords.");
      } else {
        toast.success(`Found ${data.jobs.length} job${data.jobs.length !== 1 ? "s" : ""}`);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
      setHasSearched(true);
    },
  });

  // Add job mutation
  const addJobMutation = useMutation({
    mutationFn: async (job: LinkedInJobResult) => {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: "linkedin",
          externalId: job.externalId,
          title: job.title,
          companyName: job.companyName,
          location: job.location,
          description: job.description,
          salary: job.salary,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add job");
      }

      return response.json();
    },
    onSuccess: (_, job) => {
      setAddedJobIds((prev) => new Set([...prev, job.id]));
      toast.success("Job added to your library!");
      queryClient.invalidateQueries({ queryKey: ["jobs", "list"] });
    },
    onError: () => {
      toast.error("Failed to add job. Please try again.");
    },
  });

  const handleSearch = (data: SearchFormData) => {
    setHasSearched(false);
    searchMutation.mutate(data as SearchInput);
  };

  const handleAddJob = (job: LinkedInJobResult) => {
    addJobMutation.mutate(job);
  };

  const handleKeywordSuggestion = (keyword: string) => {
    form.setValue("keywords", keyword);
  };

  const clearFilters = () => {
    form.setValue("timeFrame", "");
    form.setValue("experienceLevel", undefined);
    form.setValue("workplaceType", undefined);
    form.setValue("jobType", undefined);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <Linkedin className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                LinkedIn Job Search
              </h1>
              <p className="text-muted-foreground">
                Search millions of jobs on LinkedIn with advanced filters
              </p>
            </div>
          </div>
        </div>

        {/* Search Form Section */}
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          {/* Main Search Card */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-blue-500" />
                  Search Jobs
                </CardTitle>
                <CardDescription>
                  Enter job title and location, then customize with filters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(handleSearch)} className="space-y-6">
                  {/* Main Search Fields */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Keywords */}
                    <div className="space-y-2">
                      <Label htmlFor="keywords" className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Job Title / Keywords *
                      </Label>
                      <Input
                        id="keywords"
                        placeholder="e.g., Software Engineer, Data Analyst"
                        {...form.register("keywords")}
                        disabled={searchMutation.isPending}
                      />
                      {form.formState.errors.keywords && (
                        <p className="text-xs text-destructive">
                          {form.formState.errors.keywords.message}
                        </p>
                      )}
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                      <Label htmlFor="location" className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Location
                      </Label>
                      <Input
                        id="location"
                        placeholder="e.g., San Francisco, CA or Remote"
                        {...form.register("location")}
                        disabled={searchMutation.isPending}
                      />
                    </div>
                  </div>

                  {/* Toggle Advanced Filters */}
                  <div className="flex items-center justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                      className="gap-2"
                    >
                      <Filter className="h-4 w-4" />
                      {showAdvancedFilters ? "Hide Filters" : "Show Filters"}
                      {activeFilters > 0 && (
                        <Badge variant="secondary" className="ml-1">
                          {activeFilters}
                        </Badge>
                      )}
                    </Button>
                    {activeFilters > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="gap-1 text-muted-foreground"
                      >
                        <X className="h-4 w-4" />
                        Clear filters
                      </Button>
                    )}
                  </div>

                  {/* Advanced Filters */}
                  {showAdvancedFilters && (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 p-4 bg-muted/50 rounded-lg">
                      {/* Time Frame */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4" />
                          Posted Within
                        </Label>
                        <Select
                          value={form.watch("timeFrame") || "__none__"}
                          onValueChange={(value) =>
                            form.setValue("timeFrame", value === "__none__" ? "" as TimeFrame : value as TimeFrame)
                          }
                          disabled={searchMutation.isPending}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Any time" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">Any time</SelectItem>
                            {(Object.entries(TIME_FRAME_OPTIONS) as [TimeFrame, { label: string }][])
                              .filter(([value]) => value !== "")
                              .map(([value, { label }]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Experience Level */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm">
                          <TrendingUp className="h-4 w-4" />
                          Experience Level
                        </Label>
                        <Select
                          value={form.watch("experienceLevel") || "__none__"}
                          onValueChange={(value) =>
                            form.setValue(
                              "experienceLevel",
                              value === "__none__" ? undefined : (value as ExperienceLevel)
                            )
                          }
                          disabled={searchMutation.isPending}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Any level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">Any level</SelectItem>
                            {(
                              Object.entries(EXPERIENCE_LEVEL_OPTIONS) as [
                                ExperienceLevel,
                                { label: string; description: string }
                              ][]
                            ).map(([value, { label }]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Workplace Type */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm">
                          <Building2 className="h-4 w-4" />
                          Workplace Type
                        </Label>
                        <Select
                          value={form.watch("workplaceType") || "__none__"}
                          onValueChange={(value) =>
                            form.setValue(
                              "workplaceType",
                              value === "__none__" ? undefined : (value as WorkplaceType)
                            )
                          }
                          disabled={searchMutation.isPending}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Any type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">Any type</SelectItem>
                            {(
                              Object.entries(WORKPLACE_TYPE_OPTIONS) as [
                                WorkplaceType,
                                { label: string }
                              ][]
                            ).map(([value, { label }]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Job Type */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm">
                          <Briefcase className="h-4 w-4" />
                          Job Type
                        </Label>
                        <Select
                          value={form.watch("jobType") || "__none__"}
                          onValueChange={(value) =>
                            form.setValue(
                              "jobType",
                              value === "__none__" ? undefined : (value as JobType)
                            )
                          }
                          disabled={searchMutation.isPending}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Any type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">Any type</SelectItem>
                            {(
                              Object.entries(JOB_TYPE_OPTIONS) as [
                                JobType,
                                { label: string }
                              ][]
                            ).map(([value, { label }]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Results Limit */}
                      <div className="space-y-2 sm:col-span-2 lg:col-span-4">
                        <Label className="flex items-center gap-2 text-sm">
                          Results Limit
                        </Label>
                        <Select
                          value={String(form.watch("limit") || 50)}
                          onValueChange={(value) =>
                            form.setValue("limit", parseInt(value))
                          }
                          disabled={searchMutation.isPending}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10 results</SelectItem>
                            <SelectItem value="25">25 results</SelectItem>
                            <SelectItem value="50">50 results</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Search Button */}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={searchMutation.isPending}
                  >
                    {searchMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Searching LinkedIn Jobs...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Search Jobs
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Keyword Suggestions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Popular Searches
                </CardTitle>
                <CardDescription>
                  Click on a suggestion to search
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {KEYWORD_SUGGESTIONS.map((suggestion) => (
                    <Badge
                      key={suggestion.keyword}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => handleKeywordSuggestion(suggestion.keyword)}
                    >
                      {suggestion.keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tips Sidebar */}
          <div className="space-y-4">
            {/* Search Tips */}
            <Card className="border-dashed">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Search Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">1.</span>
                    <span>Use specific job titles for better results</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">2.</span>
                    <span>Leave filters empty for more results</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">3.</span>
                    <span>Try &quot;Remote&quot; in location</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Results Section - Full Width Below */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-blue-500" />
                  Search Results
                </CardTitle>
                {results.length > 0 && (
                  <CardDescription>
                    Found {results.length} job{results.length !== 1 ? "s" : ""} matching your search
                  </CardDescription>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Results Grid */}
            {results.length > 0 && (
              <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((job) => (
                  <StaggerItem key={job.id}>
                    <LinkedInJobResultCard
                      job={job}
                      isAdded={addedJobIds.has(job.id)}
                      onAdd={() => handleAddJob(job)}
                      isAdding={
                        addJobMutation.isPending &&
                        addJobMutation.variables?.id === job.id
                      }
                    />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}

            {/* Empty State */}
            {hasSearched && results.length === 0 && !searchMutation.isPending && (
              <div className="flex flex-col items-center justify-center text-center py-16">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <AlertCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium mb-1">No jobs found</p>
                <p className="text-sm text-muted-foreground">
                  Try different keywords or fewer filters.
                </p>
              </div>
            )}

            {/* Initial State */}
            {!hasSearched && results.length === 0 && !searchMutation.isPending && (
              <div className="flex flex-col items-center justify-center text-center py-16">
                <div className="rounded-full bg-blue-500/10 p-4 mb-4">
                  <Linkedin className="h-8 w-8 text-blue-500" />
                </div>
                <p className="text-lg font-medium mb-1">Ready to search</p>
                <p className="text-sm text-muted-foreground">
                  Enter a job title and click &quot;Search Jobs&quot; to find opportunities on LinkedIn
                </p>
              </div>
            )}

            {/* Loading State */}
            {searchMutation.isPending && (
              <div className="flex flex-col items-center justify-center text-center py-16">
                <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
                <p className="text-lg font-medium mb-1">Searching LinkedIn...</p>
                <p className="text-sm text-muted-foreground">
                  This may take up to a minute
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
