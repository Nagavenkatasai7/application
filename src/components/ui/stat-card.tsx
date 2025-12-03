"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { scaleIn } from "@/lib/animations";

/**
 * StatCard Component
 *
 * A dashboard metrics card for displaying statistics.
 * Features:
 * - Large value display
 * - Trend arrow with percentage
 * - Icon support
 * - Multiple visual variants
 * - Count-up animation
 */

interface StatCardProps {
  /** Stat label */
  label: string;
  /** Stat value (number or string) */
  value: number | string;
  /** Optional icon (should be a React element like a Lucide icon) */
  icon?: React.ReactElement<{ className?: string }>;
  /** Trend information */
  trend?: {
    value: number;
    direction: "up" | "down" | "stable";
    label?: string;
  };
  /** Visual variant */
  variant?: "default" | "gradient" | "outline" | "glass";
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Enable animations */
  animated?: boolean;
  /** Additional class names */
  className?: string;
  /** onClick handler */
  onClick?: () => void;
}

const sizeConfig = {
  sm: {
    padding: "p-3",
    valueSize: "text-2xl",
    labelSize: "text-xs",
    iconSize: "w-4 h-4",
    iconWrapper: "w-8 h-8",
  },
  md: {
    padding: "p-4",
    valueSize: "text-3xl",
    labelSize: "text-sm",
    iconSize: "w-5 h-5",
    iconWrapper: "w-10 h-10",
  },
  lg: {
    padding: "p-6",
    valueSize: "text-4xl",
    labelSize: "text-base",
    iconSize: "w-6 h-6",
    iconWrapper: "w-12 h-12",
  },
};

const variantStyles = {
  default: "bg-card border border-border hover:border-primary/30",
  gradient: "gradient-border bg-card",
  outline: "border-2 border-dashed border-border bg-transparent",
  glass: "glass-panel",
};

export function StatCard({
  label,
  value,
  icon,
  trend,
  variant = "default",
  size = "md",
  animated = true,
  className,
  onClick,
}: StatCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = animated && !prefersReducedMotion;
  const config = sizeConfig[size];

  const Wrapper = shouldAnimate ? motion.div : "div";
  const wrapperProps = shouldAnimate
    ? {
        variants: scaleIn,
        initial: "hidden",
        animate: "visible",
        whileHover: onClick ? { scale: 1.02, y: -4 } : undefined,
        whileTap: onClick ? { scale: 0.98 } : undefined,
      }
    : {};

  return (
    <Wrapper
      className={cn(
        "rounded-2xl transition-all duration-300",
        config.padding,
        variantStyles[variant],
        onClick && "cursor-pointer",
        !shouldAnimate && onClick && "hover:scale-[1.02] hover:-translate-y-1",
        className
      )}
      onClick={onClick}
      {...wrapperProps}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Label */}
          <p className={cn("text-muted-foreground font-medium", config.labelSize)}>
            {label}
          </p>

          {/* Value */}
          <motion.p
            className={cn("font-bold text-foreground mt-1", config.valueSize)}
            initial={shouldAnimate ? { opacity: 0, y: 10 } : undefined}
            animate={shouldAnimate ? { opacity: 1, y: 0 } : undefined}
            transition={shouldAnimate ? { delay: 0.1, duration: 0.3 } : undefined}
          >
            {value}
          </motion.p>

          {/* Trend */}
          {trend && (
            <motion.div
              className="flex items-center gap-1.5 mt-2"
              initial={shouldAnimate ? { opacity: 0 } : undefined}
              animate={shouldAnimate ? { opacity: 1 } : undefined}
              transition={shouldAnimate ? { delay: 0.2 } : undefined}
            >
              <TrendBadge direction={trend.direction} />
              <span
                className={cn(
                  "text-xs font-medium",
                  trend.direction === "up" && "text-success",
                  trend.direction === "down" && "text-destructive",
                  trend.direction === "stable" && "text-muted-foreground"
                )}
              >
                {trend.direction !== "stable" && (trend.direction === "up" ? "+" : "")}
                {trend.value}%
              </span>
              {trend.label && (
                <span className="text-xs text-muted-foreground">{trend.label}</span>
              )}
            </motion.div>
          )}
        </div>

        {/* Icon */}
        {icon && (
          <motion.div
            className={cn(
              "rounded-xl gradient-primary flex items-center justify-center text-white shrink-0",
              config.iconWrapper
            )}
            initial={shouldAnimate ? { scale: 0 } : undefined}
            animate={shouldAnimate ? { scale: 1 } : undefined}
            transition={
              shouldAnimate
                ? { type: "spring", stiffness: 500, damping: 25, delay: 0.1 }
                : undefined
            }
          >
            {React.cloneElement(icon, {
              className: config.iconSize,
            })}
          </motion.div>
        )}
      </div>
    </Wrapper>
  );
}

function TrendBadge({ direction }: { direction: "up" | "down" | "stable" }) {
  const Icon = direction === "up" ? TrendingUp : direction === "down" ? TrendingDown : Minus;
  const bgColor =
    direction === "up"
      ? "bg-success/10"
      : direction === "down"
        ? "bg-destructive/10"
        : "bg-muted/50";
  const iconColor =
    direction === "up"
      ? "text-success"
      : direction === "down"
        ? "text-destructive"
        : "text-muted-foreground";

  return (
    <div className={cn("rounded-full p-1", bgColor)}>
      <Icon className={cn("w-3 h-3", iconColor)} />
    </div>
  );
}

/**
 * StatCardGrid
 *
 * A responsive grid layout for StatCards.
 */

interface StatCardGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StatCardGrid({ children, columns = 3, className }: StatCardGridProps) {
  const columnClasses = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", columnClasses[columns], className)}>{children}</div>
  );
}

/**
 * StatCardSkeleton
 *
 * Loading skeleton for StatCard.
 */

interface StatCardSkeletonProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StatCardSkeleton({ size = "md", className }: StatCardSkeletonProps) {
  const config = sizeConfig[size];

  return (
    <div
      className={cn(
        "rounded-2xl bg-card border border-border animate-pulse",
        config.padding,
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-20" />
          <div className="h-8 bg-muted rounded w-16" />
          <div className="h-3 bg-muted rounded w-24" />
        </div>
        <div className={cn("rounded-xl bg-muted", config.iconWrapper)} />
      </div>
    </div>
  );
}

/**
 * StatCardGridSkeleton
 *
 * Loading skeleton for StatCardGrid.
 */

interface StatCardGridSkeletonProps {
  count?: number;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StatCardGridSkeleton({
  count = 3,
  columns = 3,
  className,
}: StatCardGridSkeletonProps) {
  return (
    <StatCardGrid columns={columns} className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </StatCardGrid>
  );
}

export {
  type StatCardProps,
  type StatCardGridProps,
  type StatCardSkeletonProps,
  type StatCardGridSkeletonProps,
};
