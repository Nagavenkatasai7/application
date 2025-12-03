"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";

/**
 * BentoGrid Component
 *
 * A Linear-inspired flexible grid layout for dashboard sections.
 * Features:
 * - Responsive grid with configurable columns
 * - Staggered animation on mount
 * - Column span variants
 * - Gap size variants
 */

interface BentoGridProps {
  /** Grid children */
  children: React.ReactNode;
  /** Number of columns on desktop */
  columns?: 2 | 3 | 4;
  /** Gap between items */
  gap?: "sm" | "md" | "lg";
  /** Enable stagger animation */
  animated?: boolean;
  /** Additional class names */
  className?: string;
}

const gapSizes = {
  sm: "gap-3",
  md: "gap-4 md:gap-6",
  lg: "gap-6 md:gap-8",
};

const columnClasses = {
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
};

export function BentoGrid({
  children,
  columns = 3,
  gap = "md",
  animated = true,
  className,
}: BentoGridProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = animated && !prefersReducedMotion;

  const Wrapper = shouldAnimate ? motion.div : "div";
  const wrapperProps = shouldAnimate
    ? {
        variants: staggerContainer,
        initial: "hidden",
        animate: "visible",
      }
    : {};

  return (
    <Wrapper
      className={cn("grid", columnClasses[columns], gapSizes[gap], className)}
      {...wrapperProps}
    >
      {children}
    </Wrapper>
  );
}

/**
 * BentoCard Component
 *
 * Individual card for use within BentoGrid.
 * Features:
 * - Column span variants
 * - Height variants
 * - Visual variants (default, gradient, glass)
 * - Hover animations
 */

interface BentoCardProps {
  /** Card children */
  children: React.ReactNode;
  /** Column span (1, 2, or full width) */
  span?: "1" | "2" | "full";
  /** Row span for tall cards */
  rowSpan?: "1" | "2";
  /** Visual variant */
  variant?: "default" | "gradient" | "glass" | "outline";
  /** Enable hover lift effect */
  hover?: boolean;
  /** Enable stagger animation (should be true when inside animated BentoGrid) */
  animated?: boolean;
  /** Additional class names */
  className?: string;
  /** onClick handler */
  onClick?: () => void;
}

const spanClasses = {
  "1": "",
  "2": "md:col-span-2",
  full: "col-span-full",
};

const rowSpanClasses = {
  "1": "",
  "2": "md:row-span-2",
};

const variantClasses = {
  default: "bg-card border border-border",
  gradient: "gradient-border bg-card",
  glass: "glass-panel",
  outline: "border-2 border-dashed border-border bg-transparent",
};

export function BentoCard({
  children,
  span = "1",
  rowSpan = "1",
  variant = "default",
  hover = true,
  animated = true,
  className,
  onClick,
}: BentoCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = animated && !prefersReducedMotion;

  const Wrapper = shouldAnimate ? motion.div : "div";
  const wrapperProps = shouldAnimate
    ? {
        variants: staggerItem,
        whileHover: hover ? { scale: 1.02, y: -4 } : undefined,
        whileTap: onClick ? { scale: 0.98 } : undefined,
        transition: { type: "spring" as const, stiffness: 400, damping: 17 },
      }
    : {};

  return (
    <Wrapper
      className={cn(
        "rounded-2xl p-4 md:p-6",
        spanClasses[span],
        rowSpanClasses[rowSpan],
        variantClasses[variant],
        hover && !shouldAnimate && "transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
      {...wrapperProps}
    >
      {children}
    </Wrapper>
  );
}

/**
 * BentoCardHeader
 *
 * Header section for BentoCard with icon support.
 */

interface BentoCardHeaderProps {
  /** Icon element */
  icon?: React.ReactNode;
  /** Title text */
  title: string;
  /** Description text */
  description?: string;
  /** Additional actions (e.g., buttons) */
  action?: React.ReactNode;
  /** Additional class names */
  className?: string;
}

export function BentoCardHeader({
  icon,
  title,
  description,
  action,
  className,
}: BentoCardHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="flex items-start gap-3">
        {icon && (
          <div className="flex items-center justify-center w-10 h-10 rounded-xl gradient-primary text-white shrink-0">
            {icon}
          </div>
        )}
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/**
 * BentoCardContent
 *
 * Content section for BentoCard.
 */

interface BentoCardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function BentoCardContent({ children, className }: BentoCardContentProps) {
  return <div className={cn("mt-4", className)}>{children}</div>;
}

/**
 * BentoCardFooter
 *
 * Footer section for BentoCard with actions.
 */

interface BentoCardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function BentoCardFooter({ children, className }: BentoCardFooterProps) {
  return (
    <div className={cn("mt-4 pt-4 border-t border-border flex items-center gap-2", className)}>
      {children}
    </div>
  );
}

/**
 * BentoGridSkeleton
 *
 * Skeleton loader for BentoGrid.
 */

interface BentoGridSkeletonProps {
  /** Number of skeleton cards */
  count?: number;
  /** Number of columns */
  columns?: 2 | 3 | 4;
  /** Gap size */
  gap?: "sm" | "md" | "lg";
  className?: string;
}

export function BentoGridSkeleton({
  count = 6,
  columns = 3,
  gap = "md",
  className,
}: BentoGridSkeletonProps) {
  return (
    <div className={cn("grid", columnClasses[columns], gapSizes[gap], className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl p-4 md:p-6 bg-card border border-border animate-pulse"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );
}

export {
  type BentoGridProps,
  type BentoCardProps,
  type BentoCardHeaderProps,
  type BentoCardContentProps,
  type BentoCardFooterProps,
  type BentoGridSkeletonProps,
};
