"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Content to be hidden visually but available to screen readers */
  children: React.ReactNode;
  /** The element type to render */
  as?: React.ElementType;
}

/**
 * VisuallyHidden - Hides content visually while keeping it accessible to screen readers
 *
 * Use this component to provide context for screen reader users without affecting
 * visual layout. This is essential for:
 * - Icon-only buttons that need text labels
 * - Decorative images that need alt text
 * - Additional context for complex UI patterns
 *
 * WCAG 2.1 AA Requirement: 1.1.1 Non-text Content, 2.4.4 Link Purpose
 *
 * @example
 * ```tsx
 * // Icon button with accessible label
 * <Button variant="ghost" size="icon">
 *   <TrashIcon />
 *   <VisuallyHidden>Delete item</VisuallyHidden>
 * </Button>
 *
 * // Link with more context
 * <a href="/article">
 *   Read more <VisuallyHidden>about accessibility best practices</VisuallyHidden>
 * </a>
 * ```
 */
export function VisuallyHidden({
  children,
  as: Component = "span",
  className,
  ...props
}: VisuallyHiddenProps) {
  return (
    <Component className={cn("sr-only", className)} {...props}>
      {children}
    </Component>
  );
}

/**
 * Utility component that wraps text for screen readers
 * Alias for VisuallyHidden for semantic clarity
 */
export function ScreenReaderOnly({
  children,
  as: Component = "span",
  className,
  ...props
}: {
  children: React.ReactNode;
  as?: React.ElementType;
  className?: string;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <Component className={cn("sr-only", className)} {...props}>
      {children}
    </Component>
  );
}
