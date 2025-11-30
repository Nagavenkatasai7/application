"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LinkedInJobResultCard } from "./linkedin-job-result-card";
import {
  linkedInSearchSchema,
  type LinkedInSearchFormData,
  type LinkedInSearchInput,
} from "@/lib/validations/linkedin";
import {
  TIME_FRAME_OPTIONS,
  DEFAULT_TIME_FRAME,
  type LinkedInJobResult,
  type TimeFrame,
} from "@/lib/linkedin/types";
import { Linkedin, Search, Loader2, AlertCircle } from "lucide-react";

interface LinkedInSearchSheetProps {
  onJobAdded?: () => void;
}

export function LinkedInSearchSheet({ onJobAdded }: LinkedInSearchSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<LinkedInJobResult[]>([]);
  const [addedJobIds, setAddedJobIds] = useState<Set<string>>(new Set());
  const [hasSearched, setHasSearched] = useState(false);

  const queryClient = useQueryClient();

  // Form setup
  const form = useForm<LinkedInSearchFormData>({
    resolver: zodResolver(linkedInSearchSchema),
    defaultValues: {
      keywords: "",
      location: "",
      timeFrame: DEFAULT_TIME_FRAME,
      limit: 25,
    },
  });

  // Search mutation
  const searchMutation = useMutation({
    mutationFn: async (data: LinkedInSearchInput) => {
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
        toast.info("No jobs found. Try different keywords or a longer time frame.");
      } else {
        toast.success(`Found ${data.jobs.length} jobs`);
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
      onJobAdded?.();
    },
    onError: () => {
      toast.error("Failed to add job. Please try again.");
    },
  });

  const handleSearch = (data: LinkedInSearchFormData) => {
    setHasSearched(false);
    searchMutation.mutate(data as LinkedInSearchInput);
  };

  const handleAddJob = (job: LinkedInJobResult) => {
    addJobMutation.mutate(job);
  };

  // Reset state when sheet closes
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Don't reset results immediately to avoid flicker
      setTimeout(() => {
        setResults([]);
        setAddedJobIds(new Set());
        setHasSearched(false);
        form.reset();
      }, 300);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline">
          <Linkedin className="mr-2 h-4 w-4" />
          Search LinkedIn
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Linkedin className="h-5 w-5 text-blue-500" />
            Search LinkedIn Jobs
          </SheetTitle>
          <SheetDescription>
            Find jobs on LinkedIn and add them to your library
          </SheetDescription>
        </SheetHeader>

        {/* Search Form */}
        <form
          onSubmit={form.handleSubmit(handleSearch)}
          className="space-y-4 mt-6"
        >
          {/* Keywords */}
          <div className="space-y-2">
            <Label htmlFor="keywords">Job Title *</Label>
            <Input
              id="keywords"
              placeholder="e.g., Prompt Engineer, Software Developer"
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
              placeholder="e.g., San Francisco, CA (optional)"
              {...form.register("location")}
              disabled={searchMutation.isPending}
            />
          </div>

          {/* Time Frame */}
          <div className="space-y-2">
            <Label>Posted Within</Label>
            <Select
              value={form.watch("timeFrame")}
              onValueChange={(value) =>
                form.setValue("timeFrame", value as TimeFrame)
              }
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
                Searching LinkedIn...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search Jobs
              </>
            )}
          </Button>
        </form>

        {/* Divider */}
        {(results.length > 0 || hasSearched) && (
          <div className="border-t my-4" />
        )}

        {/* Results Header */}
        {results.length > 0 && (
          <div className="text-sm text-muted-foreground mb-2">
            Found {results.length} job{results.length !== 1 ? "s" : ""}
          </div>
        )}

        {/* Results List */}
        {results.length > 0 && (
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-3 pb-4">
              {results.map((job) => (
                <LinkedInJobResultCard
                  key={job.id}
                  job={job}
                  isAdded={addedJobIds.has(job.id)}
                  onAdd={() => handleAddJob(job)}
                  isAdding={
                    addJobMutation.isPending &&
                    addJobMutation.variables?.id === job.id
                  }
                />
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Empty State */}
        {hasSearched && results.length === 0 && !searchMutation.isPending && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <div className="rounded-full bg-muted p-3 mb-3">
              <AlertCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              No jobs found. Try different keywords
              <br />
              or a longer time frame.
            </p>
          </div>
        )}

        {/* Initial State */}
        {!hasSearched && results.length === 0 && !searchMutation.isPending && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <div className="rounded-full bg-blue-500/10 p-3 mb-3">
              <Linkedin className="h-6 w-6 text-blue-500" />
            </div>
            <p className="text-sm text-muted-foreground">
              Search for jobs to get started
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
