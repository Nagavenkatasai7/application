"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  getScoreColor,
  getScoreBgColor,
  getScoreBorderColor,
  getReadableLabel,
} from "@/lib/scoring/thresholds";
import { DimensionProgress } from "./dimension-progress";
import type { RecruiterReadinessScore } from "@/lib/ai/tailoring/types";
import { Target, TrendingUp, Lightbulb, Info } from "lucide-react";

interface RecruiterReadinessCardProps {
  score: RecruiterReadinessScore;
  compact?: boolean;
  showRecommendations?: boolean;
  className?: string;
}

export function RecruiterReadinessCard({
  score,
  compact = false,
  showRecommendations = true,
  className,
}: RecruiterReadinessCardProps) {
  const labelColor = getScoreColor(score.label);
  const bgColor = getScoreBgColor(score.label);
  const borderColor = getScoreBorderColor(score.label);
  const readableLabel = getReadableLabel(score.label);

  // Find the weakest dimension for recommendations
  const sortedDimensions = Object.entries(score.dimensions)
    .map(([key, value]) => ({ key, ...value }))
    .sort((a, b) => a.raw - b.raw);

  const weakestDimension = sortedDimensions[0];

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className={cn("pb-3", compact && "pb-2")}>
        <div className="flex items-center justify-between">
          <CardTitle className={cn("text-base", compact && "text-sm")}>
            Recruiter Readiness Score
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs">
                <p className="text-xs">
                  Based on 5 critical issues that cause international students
                  to be rejected by U.S. recruiters.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>

      <CardContent className={cn("space-y-4", compact && "space-y-3")}>
        {/* Main Score Circle */}
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "relative flex items-center justify-center rounded-full border-4",
              compact ? "h-16 w-16" : "h-20 w-20",
              bgColor,
              borderColor
            )}
          >
            <div className="text-center">
              <span
                className={cn(
                  "font-bold tabular-nums",
                  compact ? "text-xl" : "text-2xl",
                  labelColor
                )}
              >
                {score.composite}
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant="outline"
                className={cn("font-medium", labelColor, bgColor, borderColor)}
              >
                {readableLabel}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {getScoreDescription(score.label)}
            </p>
          </div>
        </div>

        {/* Dimension Progress Bars */}
        <div className={cn("pt-2 border-t", compact && "pt-1")}>
          <DimensionProgress
            dimensions={score.dimensions}
            showLabels={!compact}
            compact={compact}
          />
        </div>

        {/* Recommendations Section */}
        {showRecommendations && score.topSuggestions.length > 0 && !compact && (
          <div className="pt-2 border-t space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <span>Top Priorities</span>
            </div>
            <ul className="space-y-1.5">
              {score.topSuggestions.slice(0, 3).map((suggestion, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-xs text-muted-foreground"
                >
                  <span className="mt-0.5 flex-shrink-0 h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-medium">
                    {index + 1}
                  </span>
                  <span>{suggestion.action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Weakest Area Quick Tip - for compact mode */}
        {compact && weakestDimension && weakestDimension.raw < 60 && (
          <div className="flex items-start gap-2 text-xs text-muted-foreground pt-1 border-t">
            <Target className="h-3 w-3 mt-0.5 text-amber-500 flex-shrink-0" />
            <span>
              Focus on <span className="font-medium">{weakestDimension.key}</span> for the biggest improvement
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getScoreDescription(
  label: RecruiterReadinessScore["label"]
): string {
  switch (label) {
    case "exceptional":
      return "Your resume is highly optimized and stands out from other candidates.";
    case "strong":
      return "Your resume effectively addresses key recruiter concerns with room for minor improvements.";
    case "good":
      return "Your resume covers the basics well but could be more impactful in key areas.";
    case "getting_there":
      return "Your resume shows potential but needs work on several recruiter priorities.";
    case "needs_work":
      return "Your resume needs significant improvements to compete effectively.";
  }
}

/**
 * Compact inline score display
 */
interface InlineScoreProps {
  score: RecruiterReadinessScore;
  showLabel?: boolean;
}

export function InlineScore({ score, showLabel = true }: InlineScoreProps) {
  const labelColor = getScoreColor(score.label);
  const bgColor = getScoreBgColor(score.label);
  const borderColor = getScoreBorderColor(score.label);
  const readableLabel = getReadableLabel(score.label);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center gap-1.5">
            <div
              className={cn(
                "flex items-center justify-center h-6 w-6 rounded-full border text-xs font-bold",
                bgColor,
                borderColor,
                labelColor
              )}
            >
              {score.composite}
            </div>
            {showLabel && (
              <span className={cn("text-xs font-medium", labelColor)}>
                {readableLabel}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-2">
            <p className="font-medium">Recruiter Readiness: {score.composite}%</p>
            <div className="space-y-1 text-xs">
              {Object.entries(score.dimensions).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                  <span className="font-medium">{value.raw}%</span>
                </div>
              ))}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Score improvement indicator
 */
interface ScoreImprovementProps {
  before: number;
  after: number;
}

export function ScoreImprovement({ before, after }: ScoreImprovementProps) {
  const improvement = after - before;
  const isPositive = improvement > 0;

  if (improvement === 0) return null;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        isPositive ? "text-green-500" : "text-red-500"
      )}
    >
      <TrendingUp
        className={cn("h-3 w-3", !isPositive && "rotate-180")}
      />
      <span>
        {isPositive ? "+" : ""}
        {improvement}%
      </span>
    </div>
  );
}
