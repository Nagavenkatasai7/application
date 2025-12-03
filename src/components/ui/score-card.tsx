"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CircularProgress } from "@/components/ui/circular-progress";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, Check, ChevronRight } from "lucide-react";
import { fadeInUp } from "@/lib/animations";

/**
 * ScoreCard Component
 *
 * A card component for displaying analysis scores with:
 * - Circular progress visualization
 * - Trend indicator
 * - List of insights
 * - Color-coded thresholds
 */

interface ScoreCardProps {
  /** Card title */
  title: string;
  /** Score value (0-100) */
  score: number;
  /** Maximum possible score (for display purposes) */
  maxScore?: number;
  /** Optional description */
  description?: string;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Trend direction */
  trend?: "up" | "down" | "stable";
  /** Trend value (e.g., "+5%" or "-3 points") */
  trendValue?: string;
  /** List of key insights */
  insights?: string[];
  /** Enable animations */
  animated?: boolean;
  /** Additional class names */
  className?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Show celebration for high scores */
  celebrate?: boolean;
}

const sizeConfig = {
  sm: {
    progressSize: "sm" as const,
    titleSize: "text-base",
    padding: "p-4",
  },
  md: {
    progressSize: "md" as const,
    titleSize: "text-lg",
    padding: "p-5",
  },
  lg: {
    progressSize: "lg" as const,
    titleSize: "text-xl",
    padding: "p-6",
  },
};

export function ScoreCard({
  title,
  score,
  maxScore = 100,
  description,
  icon,
  trend,
  trendValue,
  insights,
  animated = true,
  className,
  size = "md",
  celebrate = false,
}: ScoreCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = animated && !prefersReducedMotion;
  const config = sizeConfig[size];

  // Normalize score to 0-100 for the CircularProgress
  const normalizedScore = maxScore !== 100 ? (score / maxScore) * 100 : score;

  const Wrapper = shouldAnimate ? motion.div : "div";

  return (
    <Card hover className={cn(className)}>
      <CardContent className={cn(config.padding)}>
        <Wrapper
          className="flex flex-col md:flex-row md:items-center gap-4"
          {...(shouldAnimate ? { variants: fadeInUp, initial: "hidden", animate: "visible" } : {})}
        >
          {/* Score Circle */}
          <div className="flex-shrink-0 flex justify-center md:justify-start">
            <CircularProgress
              value={normalizedScore}
              size={config.progressSize}
              animated={shouldAnimate}
              celebrate={celebrate}
              showLabel
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              {icon && (
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white shrink-0">
                  {icon}
                </div>
              )}
              <h3 className={cn("font-semibold text-foreground", config.titleSize)}>
                {title}
              </h3>
            </div>

            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}

            {/* Trend Indicator */}
            {trend && (
              <div className="flex items-center justify-center md:justify-start gap-1.5 mt-2">
                <TrendIndicator trend={trend} />
                {trendValue && (
                  <span
                    className={cn(
                      "text-sm font-medium",
                      trend === "up" && "text-success",
                      trend === "down" && "text-destructive",
                      trend === "stable" && "text-muted-foreground"
                    )}
                  >
                    {trendValue}
                  </span>
                )}
              </div>
            )}

            {/* Insights */}
            {insights && insights.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {insights.slice(0, 3).map((insight, index) => (
                  <motion.li
                    key={index}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                    initial={shouldAnimate ? { opacity: 0, x: -10 } : undefined}
                    animate={shouldAnimate ? { opacity: 1, x: 0 } : undefined}
                    transition={shouldAnimate ? { delay: 0.5 + index * 0.1 } : undefined}
                  >
                    <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span>{insight}</span>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        </Wrapper>
      </CardContent>
    </Card>
  );
}

function TrendIndicator({ trend }: { trend: "up" | "down" | "stable" }) {
  const Icon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const colorClass = trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-muted-foreground";

  return (
    <div className={cn("rounded-full p-1 bg-muted/50", colorClass)}>
      <Icon className="w-3 h-3" />
    </div>
  );
}

/**
 * ScoreCardCompact
 *
 * A compact version for inline score display.
 */

interface ScoreCardCompactProps {
  title: string;
  score: number;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function ScoreCardCompact({
  title,
  score,
  icon,
  onClick,
  className,
}: ScoreCardCompactProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:bg-accent/50 transition-colors w-full text-left",
        onClick && "cursor-pointer",
        className
      )}
    >
      {icon && (
        <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <CircularProgress value={score} size="xs" showLabel={false} animated={false} />
          <span className="text-xs text-muted-foreground">{score}%</span>
        </div>
      </div>
      {onClick && <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
    </button>
  );
}

/**
 * ScoreCardSkeleton
 *
 * Loading skeleton for ScoreCard.
 */

export function ScoreCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardContent className="p-5">
        <div className="flex flex-col md:flex-row md:items-center gap-4 animate-pulse">
          <div className="flex-shrink-0 flex justify-center md:justify-start">
            <div className="w-24 h-24 rounded-full bg-muted" />
          </div>
          <div className="flex-1 space-y-2 text-center md:text-left">
            <div className="h-6 bg-muted rounded w-32 mx-auto md:mx-0" />
            <div className="h-4 bg-muted rounded w-48 mx-auto md:mx-0" />
            <div className="space-y-1.5 mt-3">
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-5/6" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export { type ScoreCardProps, type ScoreCardCompactProps };
