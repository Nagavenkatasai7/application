"use client";

import * as React from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { buttonPress } from "@/lib/animations";

/**
 * MotionButton Component
 *
 * A Framer Motion enhanced button that maintains the same API as Button
 * but adds spring-based hover and tap animations.
 *
 * Use this for interactive buttons where micro-animations enhance UX.
 * For standard buttons, use the regular Button component.
 */

interface MotionButtonProps
  extends Omit<HTMLMotionProps<"button">, "ref">,
    VariantProps<typeof buttonVariants> {
  /** Children elements */
  children: React.ReactNode;
  /** Disable all animations */
  disableAnimation?: boolean;
}

export function MotionButton({
  className,
  variant,
  size,
  children,
  disableAnimation = false,
  ...props
}: MotionButtonProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = !disableAnimation && !prefersReducedMotion;

  return (
    <motion.button
      data-slot="motion-button"
      className={cn(buttonVariants({ variant, size, className }))}
      variants={shouldAnimate ? buttonPress : undefined}
      initial="rest"
      whileHover={shouldAnimate ? "hover" : undefined}
      whileTap={shouldAnimate ? "tap" : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}

/**
 * MotionIconButton
 *
 * An icon-only motion button with rotation animation on hover.
 */

interface MotionIconButtonProps
  extends Omit<HTMLMotionProps<"button">, "ref">,
    VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
  /** Icon rotation on hover (degrees) */
  hoverRotation?: number;
}

export function MotionIconButton({
  className,
  variant = "ghost",
  size = "icon",
  children,
  hoverRotation = 0,
  ...props
}: MotionIconButtonProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.button
      data-slot="motion-icon-button"
      className={cn(buttonVariants({ variant, size, className }))}
      whileHover={
        prefersReducedMotion
          ? undefined
          : {
              scale: 1.05,
              rotate: hoverRotation,
            }
      }
      whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}

/**
 * MotionLinkButton
 *
 * A motion button styled for navigation links.
 * Wraps an anchor tag with motion effects.
 */

interface MotionLinkButtonProps
  extends Omit<HTMLMotionProps<"a">, "ref">,
    VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
  href: string;
}

export function MotionLinkButton({
  className,
  variant = "default",
  size,
  children,
  ...props
}: MotionLinkButtonProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.a
      data-slot="motion-link-button"
      className={cn(buttonVariants({ variant, size, className }))}
      whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...props}
    >
      {children}
    </motion.a>
  );
}

export { type MotionButtonProps, type MotionIconButtonProps, type MotionLinkButtonProps };
