"use client";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DIMENSION_DISPLAY_NAMES, getProgressColor } from "@/lib/scoring/thresholds";
import type { RecruiterReadinessScore, DimensionScore } from "@/lib/ai/tailoring/types";

interface DimensionProgressProps {
  dimensions: RecruiterReadinessScore["dimensions"];
  showLabels?: boolean;
  compact?: boolean;
}

export function DimensionProgress({
  dimensions,
  showLabels = true,
  compact = false,
}: DimensionProgressProps) {
  const dimensionEntries = Object.entries(dimensions) as [
    keyof typeof dimensions,
    DimensionScore
  ][];

  return (
    <div className={cn("space-y-3", compact && "space-y-2")}>
      {dimensionEntries.map(([key, value]) => {
        const displayInfo = DIMENSION_DISPLAY_NAMES[key];
        const progressColor = getProgressColor(value.raw);

        return (
          <TooltipProvider key={key}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="space-y-1">
                  {showLabels && (
                    <div className="flex justify-between items-center">
                      <span
                        className={cn(
                          "text-sm font-medium",
                          compact && "text-xs"
                        )}
                      >
                        {displayInfo.name}
                      </span>
                      <span
                        className={cn(
                          "text-sm tabular-nums",
                          compact && "text-xs"
                        )}
                      >
                        {value.raw}%
                      </span>
                    </div>
                  )}
                  <div
                    className={cn(
                      "relative h-2 w-full overflow-hidden rounded-full bg-primary/10",
                      compact && "h-1.5"
                    )}
                  >
                    <div
                      className={cn(
                        "h-full transition-all duration-500 ease-out rounded-full",
                        progressColor
                      )}
                      style={{ width: `${value.raw}%` }}
                    />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <div className="space-y-1">
                  <p className="font-medium">
                    Issue #{displayInfo.issueNumber}: {displayInfo.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {displayInfo.description}
                  </p>
                  <p className="text-xs">
                    Score: <span className="font-medium">{value.raw}%</span> (
                    {value.label})
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
}

interface SingleDimensionProps {
  dimension: keyof RecruiterReadinessScore["dimensions"];
  score: number;
  label: string;
  showTooltip?: boolean;
}

export function SingleDimension({
  dimension,
  score,
  label,
  showTooltip = true,
}: SingleDimensionProps) {
  const displayInfo = DIMENSION_DISPLAY_NAMES[dimension];
  const progressColor = getProgressColor(score);

  const content = (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{displayInfo.name}</span>
        <span className="text-sm tabular-nums">{score}%</span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-primary/10">
        <div
          className={cn(
            "h-full transition-all duration-500 ease-out rounded-full",
            progressColor
          )}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );

  if (!showTooltip) {
    return content;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">
              Issue #{displayInfo.issueNumber}: {displayInfo.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {displayInfo.description}
            </p>
            <p className="text-xs">
              Score: <span className="font-medium">{score}%</span> ({label})
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
