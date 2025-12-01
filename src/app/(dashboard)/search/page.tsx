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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  PageTransition,
  StaggerContainer,
  StaggerItem,
} from "@/components/layout/page-transition";
import { LinkedInJobResultCard } from "@/components/jobs/linkedin-job-result-card";
import {
  TIME_FRAME_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS,
  type LinkedInJobResult,
  type TimeFrame,
  type ExperienceLevel,
} from "@/lib/linkedin/types";
import {
  Linkedin,
  Search,
  Loader2,
  AlertCircle,
  GraduationCap,
  Briefcase,
  Sparkles,
  TrendingUp,
} from "lucide-react";

// Entry-level focused search schema
const entryLevelSearchSchema = z.object({
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
  timeFrame: z.enum(["1h", "24h", "1w", "1m"] as const),
  // Single experience level - Apify only accepts one value
  experienceLevel: z.enum(["internship", "entry_level", "associate"] as const),
  limit: z.coerce.number().min(1).max(25).optional(),
});

type EntryLevelSearchFormData = z.input<typeof entryLevelSearchSchema>;
type EntryLevelSearchInput = z.output<typeof entryLevelSearchSchema>;

// Suggested keywords for freshers/entry-level
const FRESHER_KEYWORD_SUGGESTIONS = [
  { keyword: "Software Engineer Intern", category: "Tech" },
  { keyword: "Junior Developer", category: "Tech" },
  { keyword: "Data Analyst Intern", category: "Analytics" },
  { keyword: "Marketing Intern", category: "Marketing" },
  { keyword: "Product Management Intern", category: "Product" },
  { keyword: "UX Design Intern", category: "Design" },
  { keyword: "Business Analyst", category: "Business" },
  { keyword: "Graduate Engineer", category: "Engineering" },
  { keyword: "Junior Data Scientist", category: "Data" },
  { keyword: "Content Writer Intern", category: "Content" },
  { keyword: "HR Intern", category: "HR" },
  { keyword: "Finance Intern", category: "Finance" },
];

export default function EntryLevelSearchPage() {
  const [results, setResults] = useState<LinkedInJobResult[]>([]);
  const [addedJobIds, setAddedJobIds] = useState<Set<string>>(new Set());
  const [hasSearched, setHasSearched] = useState(false);

  const queryClient = useQueryClient();

  // Form setup with entry-level defaults
  const form = useForm<EntryLevelSearchFormData>({
    resolver: zodResolver(entryLevelSearchSchema),
    defaultValues: {
      keywords: "",
      location: "",
      timeFrame: "24h",
      experienceLevel: "internship", // Default to internship for freshers
      limit: 25,
    },
  });

  // Watch form values for controlled components
  const selectedExperienceLevel = form.watch("experienceLevel");

  // Search mutation
  const searchMutation = useMutation({
    mutationFn: async (data: EntryLevelSearchInput) => {
      // Convert single experienceLevel to array for API
      const apiData = {
        ...data,
        experienceLevels: [data.experienceLevel],
      };
      const response = await fetch("/api/linkedin/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiData),
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
        toast.info("No entry-level jobs found. Try different keywords or a longer time frame.");
      } else {
        toast.success(`Found ${data.jobs.length} entry-level job${data.jobs.length !== 1 ? "s" : ""}`);
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

  const handleSearch = (data: EntryLevelSearchFormData) => {
    setHasSearched(false);
    searchMutation.mutate(data as EntryLevelSearchInput);
  };

  const handleAddJob = (job: LinkedInJobResult) => {
    addJobMutation.mutate(job);
  };

  const handleKeywordSuggestion = (keyword: string) => {
    form.setValue("keywords", keyword);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <GraduationCap className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Entry-Level Job Search
              </h1>
              <p className="text-muted-foreground">
                Find internships and entry-level positions for freshers
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* Search Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Linkedin className="h-5 w-5 text-blue-500" />
                  Search LinkedIn Jobs
                </CardTitle>
                <CardDescription>
                  Search for entry-level positions and internships on LinkedIn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(handleSearch)} className="space-y-4">
                  {/* Keywords */}
                  <div className="space-y-2">
                    <Label htmlFor="keywords">Job Title / Keywords *</Label>
                    <Input
                      id="keywords"
                      placeholder="e.g., Software Engineer Intern, Junior Developer"
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
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g., San Francisco, CA or Remote"
                      {...form.register("location")}
                      disabled={searchMutation.isPending}
                    />
                  </div>

                  {/* Experience Level Selection */}
                  <div className="space-y-2">
                    <Label>Experience Level</Label>
                    <RadioGroup
                      value={selectedExperienceLevel}
                      onValueChange={(value) => form.setValue("experienceLevel", value as ExperienceLevel)}
                      disabled={searchMutation.isPending}
                      className="flex flex-wrap gap-2"
                    >
                      {(Object.entries(EXPERIENCE_LEVEL_OPTIONS) as [ExperienceLevel, { label: string; description: string }][]).map(
                        ([level, { label, description }]) => (
                          <div
                            key={level}
                            className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                              selectedExperienceLevel === level
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            }`}
                            onClick={() => form.setValue("experienceLevel", level)}
                          >
                            <RadioGroupItem value={level} id={level} />
                            <div>
                              <p className="text-sm font-medium">{label}</p>
                              <p className="text-xs text-muted-foreground">{description}</p>
                            </div>
                          </div>
                        )
                      )}
                    </RadioGroup>
                    {form.formState.errors.experienceLevel && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.experienceLevel.message}
                      </p>
                    )}
                  </div>

                  {/* Time Frame */}
                  <div className="space-y-2">
                    <Label>Posted Within</Label>
                    <Select
                      value={form.watch("timeFrame")}
                      onValueChange={(value) => form.setValue("timeFrame", value as TimeFrame)}
                      disabled={searchMutation.isPending}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.entries(TIME_FRAME_OPTIONS) as [TimeFrame, { label: string }][]).map(
                          ([value, { label }]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Search Button */}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={searchMutation.isPending}
                  >
                    {searchMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Searching for Entry-Level Jobs...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Search Entry-Level Jobs
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
                  Popular Searches for Freshers
                </CardTitle>
                <CardDescription>
                  Click on a suggestion to search
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {FRESHER_KEYWORD_SUGGESTIONS.map((suggestion) => (
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

            {/* Tips for Freshers */}
            <Card className="border-dashed">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Tips for Entry-Level Job Seekers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">1.</span>
                    <span>Use keywords like &quot;intern&quot;, &quot;junior&quot;, &quot;graduate&quot;, or &quot;entry-level&quot;</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">2.</span>
                    <span>Set &quot;Past 24 hours&quot; for the freshest opportunities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">3.</span>
                    <span>Include &quot;Remote&quot; in location for more options</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">4.</span>
                    <span>Apply early - internships and entry-level roles fill quickly</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="lg:h-[calc(100vh-200px)]">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-3 shrink-0">
                <CardTitle className="text-base flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Search Results
                </CardTitle>
                {results.length > 0 && (
                  <CardDescription>
                    Found {results.length} job{results.length !== 1 ? "s" : ""}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-0">
                {/* Results List */}
                {results.length > 0 && (
                  <ScrollArea className="h-full px-6 pb-6">
                    <StaggerContainer className="space-y-3">
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
                  </ScrollArea>
                )}

                {/* Empty State */}
                {hasSearched && results.length === 0 && !searchMutation.isPending && (
                  <div className="flex flex-col items-center justify-center text-center py-12 px-6">
                    <div className="rounded-full bg-muted p-3 mb-3">
                      <AlertCircle className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      No entry-level jobs found.
                      <br />
                      Try different keywords or a longer time frame.
                    </p>
                  </div>
                )}

                {/* Initial State */}
                {!hasSearched && results.length === 0 && !searchMutation.isPending && (
                  <div className="flex flex-col items-center justify-center text-center py-12 px-6">
                    <div className="rounded-full bg-blue-500/10 p-3 mb-3">
                      <GraduationCap className="h-6 w-6 text-blue-500" />
                    </div>
                    <p className="text-sm font-medium mb-1">Ready to find your first job?</p>
                    <p className="text-xs text-muted-foreground">
                      Enter a job title and click search to find
                      <br />
                      internships and entry-level positions
                    </p>
                  </div>
                )}

                {/* Loading State */}
                {searchMutation.isPending && (
                  <div className="flex flex-col items-center justify-center text-center py-12 px-6">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Searching LinkedIn for entry-level jobs...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
