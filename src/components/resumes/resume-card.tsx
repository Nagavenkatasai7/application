"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileText, MoreVertical, Trash2, Edit, Download, Star } from "lucide-react";
import type { ResumeResponse } from "@/lib/validations/resume";

interface ResumeCardProps {
  resume: ResumeResponse;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

export function ResumeCard({ resume, onDelete, onEdit }: ResumeCardProps) {
  const formatDate = (dateValue: string | number | Date | null | undefined) => {
    if (!dateValue) return null;

    let date: Date;
    if (typeof dateValue === "number") {
      // Unix timestamp (seconds or milliseconds)
      date = new Date(dateValue < 10000000000 ? dateValue * 1000 : dateValue);
    } else if (typeof dateValue === "string") {
      date = new Date(dateValue);
    } else {
      date = dateValue;
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return null;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card className="group hover:bg-card-hover transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          {/* Icon and info */}
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium truncate">{resume.name}</h3>
                {resume.isMaster && (
                  <Badge variant="secondary" className="shrink-0">
                    <Star className="w-3 h-3 mr-1" />
                    Master
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                {resume.originalFileName && (
                  <span className="truncate max-w-[200px]">
                    {resume.originalFileName}
                  </span>
                )}
                {resume.fileSize && (
                  <>
                    <span>•</span>
                    <span>{formatFileSize(resume.fileSize)}</span>
                  </>
                )}
              </div>
              {resume.createdAt && (
                <p className="text-xs text-muted-foreground mt-1">
                  Created {formatDate(resume.createdAt)}
                </p>
              )}
            </div>
          </div>

          {/* Actions menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Open menu"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(resume.id)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {resume.originalFileName && (
                <DropdownMenuItem disabled>
                  <Download className="w-4 h-4 mr-2" />
                  Download Original
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(resume.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Extracted text preview */}
        {resume.extractedText && (
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
            {resume.extractedText.slice(0, 200)}
            {resume.extractedText.length > 200 && "..."}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
