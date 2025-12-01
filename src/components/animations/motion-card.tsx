"use client";

/**
 * MotionCard Component
 *
 * A card component with hover animation (lift effect).
 * Wraps existing content with subtle hover interactions.
 */

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface MotionCardProps {
  children: ReactNode;
  className?: string;
  hoverY?: number;
  hoverScale?: number;
}

export function MotionCard({
  children,
  className,
  hoverY = -8,
  hoverScale = 1.02,
}: MotionCardProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ y: 0, scale: 1 }}
      whileHover={{
        y: hoverY,
        scale: hoverScale,
        transition: { duration: 0.3, ease: "easeOut" },
      }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.div>
  );
}
