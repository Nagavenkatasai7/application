"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SkipLinkProps extends React.HTMLAttributes<HTMLAnchorElement> {
  /** The ID of the element to skip to (without #) */
  targetId?: string;
  /** The text to display in the skip link */
  children?: React.ReactNode;
}

/**
 * SkipLink - An accessible skip navigation link
 *
 * This component provides a way for keyboard users to skip repetitive navigation
 * and jump directly to the main content. It's visually hidden until focused.
 *
 * WCAG 2.1 AA Requirement: 2.4.1 Bypass Blocks
 *
 * @example
 * ```tsx
 * // In your layout
 * <SkipLink targetId="main-content" />
 * <nav>...</nav>
 * <main id="main-content">...</main>
 * ```
 */
export function SkipLink({
  targetId = "main-content",
  children = "Skip to main content",
  className,
  ...props
}: SkipLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.setAttribute("tabindex", "-1");
      target.focus();
      // Remove tabindex after blur to keep natural tab order
      target.addEventListener(
        "blur",
        () => target.removeAttribute("tabindex"),
        { once: true }
      );
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className={cn(
        // Visually hidden by default
        "sr-only",
        // Show on focus
        "focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100]",
        // Styling when visible
        "focus:block focus:rounded-md focus:bg-primary focus:px-4 focus:py-2",
        "focus:text-primary-foreground focus:font-medium focus:text-sm",
        "focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "focus:ring-offset-background",
        className
      )}
      {...props}
    >
      {children}
    </a>
  );
}

/**
 * SkipLinks - A container for multiple skip links
 *
 * Useful when you need to provide multiple skip targets (e.g., skip to navigation, skip to main)
 */
export function SkipLinks({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <nav
      aria-label="Skip links"
      className={cn("skip-links", className)}
    >
      {children}
    </nav>
  );
}
