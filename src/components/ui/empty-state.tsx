"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";
import Link from "next/link";
import { emptyStateContent, floatingIcon } from "@/lib/animations";

/**
 * EmptyState Component
 *
 * A Notion-inspired empty state with personality.
 * Features:
 * - Animated floating icon
 * - Encouraging, student-friendly copy
 * - Optional "Pro tip" section
 * - Gradient CTA button
 * - Celebration variant for achievements
 */

interface EmptyStateProps {
  /** Icon element to display (should be a React element like a Lucide icon) */
  icon: React.ReactElement<{ className?: string }>;
  /** Main title */
  title: string;
  /** Description text */
  description: string;
  /** Primary action button */
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: React.ReactNode;
  };
  /** Secondary action button */
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  /** Visual variant */
  variant?: "default" | "celebration" | "encourage" | "minimal";
  /** Optional pro tip text */
  tip?: string;
  /** Enable/disable animations */
  animated?: boolean;
  /** Additional class names */
  className?: string;
}

const variantStyles = {
  default: {
    container: "border-dashed border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-pink-500/5",
    iconBg: "gradient-primary",
  },
  celebration: {
    container: "border-2 border-success/30 bg-gradient-to-br from-success/10 via-transparent to-emerald-500/5",
    iconBg: "bg-gradient-to-br from-success to-emerald-400",
  },
  encourage: {
    container: "border-dashed border-2 border-warning/20 bg-gradient-to-br from-warning/5 via-transparent to-amber-500/5",
    iconBg: "bg-gradient-to-br from-warning to-amber-400",
  },
  minimal: {
    container: "bg-muted/30",
    iconBg: "bg-muted",
  },
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  variant = "default",
  tip,
  animated = true,
  className,
}: EmptyStateProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = animated && !prefersReducedMotion;

  const styles = variantStyles[variant];

  const MotionDiv = shouldAnimate ? motion.div : "div";
  const containerProps = shouldAnimate
    ? {
        variants: emptyStateContent,
        initial: "hidden",
        animate: "visible",
      }
    : {};

  return (
    <MotionDiv
      className={cn(
        "rounded-2xl py-12 md:py-16 text-center",
        styles.container,
        className
      )}
      {...containerProps}
    >
      {/* Floating Icon */}
      <div className="flex justify-center mb-6">
        <motion.div
          className="relative"
          animate={shouldAnimate ? floatingIcon.animate : undefined}
        >
          <div
            className={cn(
              "rounded-2xl p-5 shadow-lg text-white",
              styles.iconBg
            )}
          >
            {React.cloneElement(icon, {
              className: "h-10 w-10",
            })}
          </div>
          {variant === "celebration" && (
            <motion.div
              className="absolute -top-2 -right-2 rounded-full bg-gradient-to-br from-warning to-amber-400 p-2 shadow-lg"
              initial={shouldAnimate ? { scale: 0 } : { scale: 1 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 500 }}
            >
              <span className="text-sm">🎉</span>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Title */}
      <motion.h3
        className={cn(
          "text-2xl font-bold",
          variant === "celebration" ? "text-success" : "gradient-text"
        )}
        variants={
          shouldAnimate
            ? {
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0, transition: { delay: 0.1 } },
              }
            : undefined
        }
      >
        {title}
      </motion.h3>

      {/* Description */}
      <motion.p
        className="text-muted-foreground mt-3 mb-8 max-w-md mx-auto px-4"
        variants={
          shouldAnimate
            ? {
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0, transition: { delay: 0.2 } },
              }
            : undefined
        }
      >
        {description}
      </motion.p>

      {/* Actions */}
      {(action || secondaryAction) && (
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-3 px-4"
          variants={
            shouldAnimate
              ? {
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0, transition: { delay: 0.3 } },
                }
              : undefined
          }
        >
          {action && (
            <Button
              variant={variant === "celebration" ? "default" : "gradient"}
              size="lg"
              asChild={!!action.href}
              onClick={action.onClick}
            >
              {action.href ? (
                <Link href={action.href}>
                  {action.icon && <span className="mr-2">{action.icon}</span>}
                  {action.label}
                </Link>
              ) : (
                <>
                  {action.icon && <span className="mr-2">{action.icon}</span>}
                  {action.label}
                </>
              )}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="outline"
              size="lg"
              asChild={!!secondaryAction.href}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.href ? (
                <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
              ) : (
                secondaryAction.label
              )}
            </Button>
          )}
        </motion.div>
      )}

      {/* Pro Tip */}
      {tip && (
        <motion.div
          className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground px-4"
          variants={
            shouldAnimate
              ? {
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { delay: 0.5 } },
                }
              : undefined
          }
        >
          <Lightbulb className="h-4 w-4 text-warning" />
          <span>{tip}</span>
        </motion.div>
      )}
    </MotionDiv>
  );
}

/**
 * EmptyStateCompact
 *
 * A more compact version for inline use.
 */

interface EmptyStateCompactProps {
  icon: React.ReactElement<{ className?: string }>;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
  };
  className?: string;
}

export function EmptyStateCompact({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateCompactProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-8 text-center",
        className
      )}
    >
      <div className="rounded-xl bg-muted/50 p-3 mb-3">
        {React.cloneElement(icon, {
          className: "h-6 w-6 text-muted-foreground",
        })}
      </div>
      <h4 className="font-medium text-foreground">{title}</h4>
      {description && (
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">{description}</p>
      )}
      {action && (
        <Button variant="ghost" size="sm" className="mt-3" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

export { type EmptyStateProps, type EmptyStateCompactProps };
