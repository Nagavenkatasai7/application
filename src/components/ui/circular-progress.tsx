"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * CircularProgress Component
 *
 * A Duolingo-inspired circular progress indicator with:
 * - SVG-based circular progress ring
 * - Color-coded score thresholds (red → yellow → green)
 * - Smooth animation on mount
 * - Optional center label
 * - Celebration animation for high scores
 * - Reduced motion support
 */

interface CircularProgressProps {
  /** Progress value from 0 to 100 */
  value: number;
  /** Size variant */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Show the percentage label in the center */
  showLabel?: boolean;
  /** Enable/disable animation */
  animated?: boolean;
  /** Custom color thresholds: scores below 'low' are red, below 'medium' are yellow, above are green */
  colorThresholds?: { low: number; medium: number };
  /** Custom label to show instead of percentage */
  customLabel?: string;
  /** Show celebration effect for high scores (> 90) */
  celebrate?: boolean;
  /** Additional class names */
  className?: string;
  /** Track color (background ring) */
  trackColor?: string;
  /** Label for accessibility */
  "aria-label"?: string;
}

const sizeConfig = {
  xs: {
    size: 40,
    strokeWidth: 4,
    fontSize: "text-xs",
    iconSize: 12,
  },
  sm: {
    size: 60,
    strokeWidth: 5,
    fontSize: "text-sm",
    iconSize: 16,
  },
  md: {
    size: 100,
    strokeWidth: 8,
    fontSize: "text-xl",
    iconSize: 24,
  },
  lg: {
    size: 140,
    strokeWidth: 10,
    fontSize: "text-3xl",
    iconSize: 32,
  },
  xl: {
    size: 180,
    strokeWidth: 12,
    fontSize: "text-4xl",
    iconSize: 40,
  },
};

function getScoreColor(
  value: number,
  thresholds: { low: number; medium: number }
): {
  ring: string;
  text: string;
  glow: string;
} {
  if (value < thresholds.low) {
    return {
      ring: "stroke-destructive",
      text: "text-destructive",
      glow: "drop-shadow-[0_0_8px_oklch(0.577_0.245_27.325/0.5)]",
    };
  }
  if (value < thresholds.medium) {
    return {
      ring: "stroke-warning",
      text: "text-warning",
      glow: "drop-shadow-[0_0_8px_oklch(0.769_0.188_70.08/0.5)]",
    };
  }
  return {
    ring: "stroke-success",
    text: "text-success",
    glow: "drop-shadow-[0_0_8px_oklch(0.723_0.219_142/0.5)]",
  };
}

export function CircularProgress({
  value,
  size = "md",
  showLabel = true,
  animated = true,
  colorThresholds = { low: 40, medium: 70 },
  customLabel,
  celebrate = false,
  className,
  trackColor,
  "aria-label": ariaLabel,
}: CircularProgressProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = animated && !prefersReducedMotion;

  const config = sizeConfig[size];
  const radius = (config.size - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedValue = Math.min(100, Math.max(0, value));
  const strokeDashoffset = circumference - (normalizedValue / 100) * circumference;

  const colors = getScoreColor(normalizedValue, colorThresholds);

  const showCelebration = celebrate && normalizedValue >= 90;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: config.size, height: config.size }}
      role="progressbar"
      aria-valuenow={normalizedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel || `${normalizedValue}% complete`}
    >
      <svg
        width={config.size}
        height={config.size}
        viewBox={`0 0 ${config.size} ${config.size}`}
        className={cn("transform -rotate-90", showCelebration && colors.glow)}
      >
        {/* Background track */}
        <circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={radius}
          fill="none"
          className={trackColor || "stroke-muted"}
          strokeWidth={config.strokeWidth}
        />

        {/* Progress ring */}
        <motion.circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={radius}
          fill="none"
          className={colors.ring}
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={shouldAnimate ? { strokeDashoffset: circumference } : { strokeDashoffset }}
          animate={{ strokeDashoffset }}
          transition={
            shouldAnimate
              ? {
                  duration: 1.5,
                  ease: [0.33, 1, 0.68, 1], // easeOut
                }
              : { duration: 0 }
          }
        />
      </svg>

      {/* Center label */}
      {showLabel && (
        <motion.div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center",
            config.fontSize,
            "font-bold",
            colors.text
          )}
          initial={shouldAnimate ? { opacity: 0, scale: 0.5 } : { opacity: 1, scale: 1 }}
          animate={
            showCelebration
              ? {
                  opacity: 1,
                  scale: [1, 1.1, 1],
                }
              : { opacity: 1, scale: 1 }
          }
          transition={
            shouldAnimate
              ? {
                  opacity: { delay: 0.8, duration: 0.3 },
                  scale: showCelebration
                    ? {
                        delay: 1.2,
                        duration: 0.6,
                        ease: "easeInOut",
                        repeat: showCelebration ? 2 : 0,
                      }
                    : { type: "spring", stiffness: 500, damping: 25, delay: 0.8 },
                }
              : { duration: 0 }
          }
        >
          <span>{customLabel || `${Math.round(normalizedValue)}`}</span>
          {!customLabel && size !== "xs" && size !== "sm" && (
            <span className="text-xs text-muted-foreground font-normal -mt-1">
              {getScoreLabel(normalizedValue, colorThresholds)}
            </span>
          )}
        </motion.div>
      )}
    </div>
  );
}

function getScoreLabel(
  value: number,
  thresholds: { low: number; medium: number }
): string {
  if (value < thresholds.low) return "Needs Work";
  if (value < thresholds.medium) return "Good";
  if (value < 90) return "Great";
  return "Excellent";
}

/**
 * Mini CircularProgress for inline use
 */
export function CircularProgressMini({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <CircularProgress
      value={value}
      size="xs"
      showLabel={false}
      animated={false}
      className={className}
    />
  );
}

export { type CircularProgressProps };
