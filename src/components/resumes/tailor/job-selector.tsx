"use client";

import { Briefcase } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Job {
  id: string;
  title: string;
  companyName: string | null;
}

interface JobSelectorProps {
  jobs: Job[];
  selectedJobId: string;
  onJobSelect: (jobId: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function JobSelector({
  jobs,
  selectedJobId,
  onJobSelect,
  isLoading = false,
  disabled = false,
}: JobSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center gap-2">
        <Briefcase className="h-4 w-4 text-muted-foreground" />
        Target Job
      </label>
      <Select
        value={selectedJobId}
        onValueChange={onJobSelect}
        disabled={isLoading || disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue
            placeholder={isLoading ? "Loading jobs..." : "Select a job to tailor for"}
          />
        </SelectTrigger>
        <SelectContent>
          {jobs.map((job) => (
            <SelectItem key={job.id} value={job.id}>
              {job.title}
              {job.companyName ? ` @ ${job.companyName}` : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {jobs.length === 0 && !isLoading && (
        <p className="text-xs text-muted-foreground">
          No jobs found. Add a job first to tailor your resume.
        </p>
      )}
    </div>
  );
}
