"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Briefcase, ClipboardPaste, FolderOpen } from "lucide-react";

interface Job {
  id: string;
  title: string;
  companyName: string | null;
}

type JobInputMode = "paste" | "saved";

interface JobInputValue {
  mode: JobInputMode;
  jobText?: string;
  savedJobId?: string;
}

interface JobInputProps {
  onJobChange: (value: JobInputValue) => void;
  disabled?: boolean;
}

export function JobInput({ onJobChange, disabled }: JobInputProps) {
  const [mode, setMode] = useState<JobInputMode>("paste");
  const [jobText, setJobText] = useState("");
  const [selectedJobId, setSelectedJobId] = useState("");

  const { data: jobsData, isLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const res = await fetch("/api/jobs");
      if (!res.ok) throw new Error("Failed to fetch jobs");
      return res.json();
    },
  });

  const jobs: Job[] = jobsData?.data || [];

  const handleModeChange = (newMode: string) => {
    const tabMode = newMode as JobInputMode;
    setMode(tabMode);
    if (tabMode === "paste") {
      onJobChange({ mode: "paste", jobText });
    } else {
      onJobChange({ mode: "saved", savedJobId: selectedJobId });
    }
  };

  const handleTextChange = (text: string) => {
    setJobText(text);
    onJobChange({ mode: "paste", jobText: text });
  };

  const handleJobSelect = (jobId: string) => {
    setSelectedJobId(jobId);
    onJobChange({ mode: "saved", savedJobId: jobId });
  };

  return (
    <div className="space-y-4">
      <Label className="mb-2 flex items-center gap-2">
        <Briefcase className="h-4 w-4" />
        Target Job
      </Label>

      <Tabs value={mode} onValueChange={handleModeChange}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="paste" disabled={disabled}>
            <ClipboardPaste className="mr-2 h-4 w-4" />
            Paste Job
          </TabsTrigger>
          <TabsTrigger value="saved" disabled={disabled}>
            <FolderOpen className="mr-2 h-4 w-4" />
            Saved Jobs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="paste" className="mt-4">
          <Textarea
            placeholder="Paste the job description or job posting URL here..."
            value={jobText}
            onChange={(e) => handleTextChange(e.target.value)}
            disabled={disabled}
            rows={6}
            className="resize-none"
          />
          <p className="text-muted-foreground mt-2 text-sm">
            Paste the full job description or a link to the job posting
          </p>
        </TabsContent>

        <TabsContent value="saved" className="mt-4">
          <Select
            value={selectedJobId}
            onValueChange={handleJobSelect}
            disabled={disabled || isLoading}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={isLoading ? "Loading..." : "Select a saved job"}
              />
            </SelectTrigger>
            <SelectContent>
              {jobs.length === 0 ? (
                <div className="text-muted-foreground p-4 text-center text-sm">
                  No saved jobs yet. Use the paste option or import jobs first.
                </div>
              ) : (
                jobs.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title}
                    {job.companyName ? ` @ ${job.companyName}` : ""}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <p className="text-muted-foreground mt-2 text-sm">
            Select from jobs you&apos;ve previously imported
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
