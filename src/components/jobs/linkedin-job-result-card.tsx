"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  MapPin,
  DollarSign,
  Clock,
  Check,
  Plus,
  Loader2,
  ExternalLink,
} from "lucide-react";
import type { LinkedInJobResult } from "@/lib/linkedin/types";

interface LinkedInJobResultCardProps {
  job: LinkedInJobResult;
  isAdded: boolean;
  onAdd: () => void;
  isAdding: boolean;
}

export function LinkedInJobResultCard({
  job,
  isAdded,
  onAdd,
  isAdding,
}: LinkedInJobResultCardProps) {
  return (
    <Card className="transition-colors hover:bg-card-hover">
      <CardContent className="p-4">
        <div className="flex justify-between items-start gap-3">
          {/* Job Info */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h4 className="font-medium text-sm leading-tight line-clamp-2">
              {job.title}
            </h4>

            {/* Company */}
            {job.companyName && (
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
                <Building2 className="h-3 w-3 shrink-0" />
                <span className="truncate">{job.companyName}</span>
              </div>
            )}

            {/* Location */}
            {job.location && (
              <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{job.location}</span>
              </div>
            )}

            {/* Salary & Posted Time */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
              {job.salary && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <DollarSign className="h-3 w-3 shrink-0" />
                  <span>{job.salary}</span>
                </div>
              )}
              {job.postedAt && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 shrink-0" />
                  <span>{job.postedAt}</span>
                </div>
              )}
            </div>
          </div>

          {/* Add Button */}
          <div className="flex flex-col items-end gap-2">
            <Button
              size="sm"
              variant={isAdded ? "secondary" : "default"}
              onClick={onAdd}
              disabled={isAdded || isAdding}
              className="shrink-0"
            >
              {isAdded ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Added
                </>
              ) : isAdding ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add
                </>
              )}
            </Button>

            {/* View on LinkedIn link */}
            {job.url && (
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                <span>View</span>
              </a>
            )}
          </div>
        </div>

        {/* Platform Badge */}
        <div className="mt-3">
          <Badge className="text-xs bg-blue-500/20 text-blue-400">
            LinkedIn
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
