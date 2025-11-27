"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type AriaLive = "polite" | "assertive" | "off";
type AriaRelevant = "additions" | "removals" | "text" | "all" | "additions text";

interface LiveRegionProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The politeness level of the announcement
   * - "polite": Waits for user to finish current action
   * - "assertive": Interrupts immediately (use sparingly)
   * - "off": Disables announcements
   */
  politeness?: AriaLive;
  /**
   * What types of changes should be announced
   * - "additions": New content added
   * - "removals": Content removed
   * - "text": Text changes
   * - "all": All changes
   * - "additions text": New content and text changes (default)
   */
  relevant?: AriaRelevant;
  /** Whether the region is atomic (announces entire region vs just changes) */
  atomic?: boolean;
  /** The content to announce */
  children?: React.ReactNode;
}

/**
 * LiveRegion - Announces dynamic content changes to screen readers
 *
 * Use this component to announce important updates like:
 * - Form validation errors
 * - Loading states
 * - Search results count
 * - Toast messages
 * - Status updates
 *
 * WCAG 2.1 AA Requirement: 4.1.3 Status Messages
 *
 * @example
 * ```tsx
 * // Announce loading state
 * <LiveRegion politeness="polite">
 *   {isLoading ? "Loading..." : "Content loaded"}
 * </LiveRegion>
 *
 * // Announce form errors
 * <LiveRegion politeness="assertive" atomic>
 *   {error && `Error: ${error}`}
 * </LiveRegion>
 * ```
 */
export function LiveRegion({
  politeness = "polite",
  relevant = "additions text",
  atomic = true,
  children,
  className,
  ...props
}: LiveRegionProps) {
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-relevant={relevant}
      aria-atomic={atomic}
      className={cn("sr-only", className)}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Announce - A utility component for one-time announcements
 *
 * This component announces its content once when mounted or when
 * the message changes. Useful for temporary status messages.
 */
export function Announce({
  message,
  politeness = "polite",
  clearDelay = 1000,
}: {
  message: string;
  politeness?: AriaLive;
  clearDelay?: number;
}) {
  const [announcement, setAnnouncement] = React.useState(message);

  React.useEffect(() => {
    setAnnouncement(message);
    const timer = setTimeout(() => setAnnouncement(""), clearDelay);
    return () => clearTimeout(timer);
  }, [message, clearDelay]);

  return (
    <LiveRegion politeness={politeness} atomic>
      {announcement}
    </LiveRegion>
  );
}

/**
 * LoadingAnnouncement - Announces loading states to screen readers
 */
export function LoadingAnnouncement({
  isLoading,
  loadingMessage = "Loading, please wait...",
  completedMessage = "Content loaded",
}: {
  isLoading: boolean;
  loadingMessage?: string;
  completedMessage?: string;
}) {
  // Track if component was ever in a loading state
  const [wasLoading, setWasLoading] = React.useState(false);

  React.useEffect(() => {
    if (isLoading && !wasLoading) {
      setWasLoading(true);
    }
  }, [isLoading, wasLoading]);

  // Only show completed message if we transitioned from loading to not loading
  const showCompleted = !isLoading && wasLoading;

  return (
    <LiveRegion politeness="polite">
      {isLoading ? loadingMessage : showCompleted ? completedMessage : ""}
    </LiveRegion>
  );
}
