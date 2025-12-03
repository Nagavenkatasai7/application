"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building2,
  MapPin,
  Calendar,
  MoreVertical,
  Trash2,
  ExternalLink,
  FileText,
} from "lucide-react";
import type { JobResponse } from "@/lib/validations/job";
import { HoverGrow } from "@/components/layout/page-transition";

interface JobCardProps {
  job: JobResponse;
  onDelete?: (id: string) => void;
  onCreateApplication?: (jobId: string) => void;
}

export function JobCard({ job, onDelete, onCreateApplication }: JobCardProps) {
  const formattedDate = job.createdAt
    ? new Date(job.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const platformColors: Record<string, string> = {
    manual: "bg-secondary text-secondary-foreground",
    linkedin: "bg-blue-500/20 text-blue-400",
    indeed: "bg-purple-500/20 text-purple-400",
    glassdoor: "bg-green-500/20 text-green-400",
    greenhouse: "bg-emerald-500/20 text-emerald-400",
    lever: "bg-orange-500/20 text-orange-400",
    workday: "bg-amber-500/20 text-amber-400",
    icims: "bg-cyan-500/20 text-cyan-400",
    smartrecruiters: "bg-pink-500/20 text-pink-400",
  };

  return (
    <HoverGrow scale={1.01}>
      <Card className="group relative overflow-hidden transition-colors hover:bg-card-hover">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold truncate">
              {job.title}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <Building2 className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{job.companyName || "Unknown Company"}</span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onCreateApplication && (
                <DropdownMenuItem onClick={() => onCreateApplication(job.id)}>
                  <FileText className="h-4 w-4 mr-2" />
                  Create Application
                </DropdownMenuItem>
              )}
              {job.url && (
                <DropdownMenuItem asChild>
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Original
                  </a>
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(job.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {job.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              <span>{job.location}</span>
            </div>
          )}
          {formattedDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formattedDate}</span>
            </div>
          )}
        </div>

        {/* Skills preview */}
        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {job.skills.slice(0, 4).map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {job.skills.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{job.skills.length - 4} more
              </Badge>
            )}
          </div>
        )}

        {/* Platform badge */}
        <div className="flex items-center justify-between mt-3">
          <Badge
            className={`text-xs capitalize ${platformColors[job.platform] || platformColors.manual}`}
          >
            {job.platform}
          </Badge>
          {job.salary && (
            <span className="text-xs text-muted-foreground">{job.salary}</span>
          )}
        </div>
      </CardContent>
      </Card>
    </HoverGrow>
  );
}
