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
import { FileText, MoreHorizontal, Trash2, Edit, Download, Star, Target, Eye } from "lucide-react";
import type { ResumeResponse } from "@/lib/validations/resume";
import Link from "next/link";

interface ResumeCardProps {
  resume: ResumeResponse;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
  onTailor?: (id: string) => void;
}

export function ResumeCard({ resume, onDelete, onEdit, onView, onTailor }: ResumeCardProps) {
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
    <Card hover className="group overflow-hidden h-full">
      <CardContent className="p-0 flex flex-col h-full">
        {/* Header section with icon and info */}
        <div className="p-5 pb-4">
          <div className="flex items-start gap-4">
            {/* Large gradient icon */}
            <div className="flex items-center justify-center w-14 h-14 rounded-xl gradient-primary text-white shadow-lg shrink-0 transition-transform duration-300 group-hover:scale-105">
              <FileText className="w-7 h-7" />
            </div>

            {/* Title and metadata */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-lg truncate">{resume.name}</h3>
                {resume.isMaster && (
                  <Badge variant="master" className="shrink-0">
                    <Star className="w-3 h-3" />
                    Master
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1.5 text-sm text-muted-foreground flex-wrap">
                {resume.fileSize && (
                  <span className="bg-muted/50 px-2 py-0.5 rounded-md">
                    {formatFileSize(resume.fileSize)}
                  </span>
                )}
                {resume.createdAt && (
                  <span>
                    {formatDate(resume.createdAt)}
                  </span>
                )}
              </div>
            </div>

            {/* More actions dropdown (for less common actions) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  aria-label="More actions"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                {resume.originalFileName && (
                  <DropdownMenuItem disabled className="rounded-lg">
                    <Download className="w-4 h-4 mr-2" />
                    Download Original
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(resume.id)}
                    className="text-destructive focus:text-destructive rounded-lg"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Preview section - grows to fill space */}
        <div className="flex-grow mx-5">
          {resume.extractedText && (
            <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {resume.extractedText.slice(0, 200)}
                {resume.extractedText.length > 200 && "..."}
              </p>
            </div>
          )}
        </div>

        {/* Action buttons - Always visible, pushed to bottom */}
        <div className="p-4 pt-4 flex items-center gap-2 border-t border-border/30 mt-auto">
          {onView && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(resume.id)}
              className="flex-1 gap-2"
            >
              <Eye className="w-4 h-4" />
              View
            </Button>
          )}
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(resume.id)}
              className="flex-1 gap-2"
              asChild
            >
              <Link href={`/resumes/${resume.id}/edit`}>
                <Edit className="w-4 h-4" />
                Edit
              </Link>
            </Button>
          )}
          {onTailor && (
            <Button
              variant="gradient"
              size="sm"
              onClick={() => onTailor(resume.id)}
              className="flex-1 gap-2"
              asChild
            >
              <Link href={`/resumes/${resume.id}/tailor`}>
                <Target className="w-4 h-4" />
                Tailor
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
