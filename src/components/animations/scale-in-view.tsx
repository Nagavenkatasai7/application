"use client";

/**
 * ScaleInView Component
 *
 * Scroll-triggered scale animation.
 * Elements scale up and fade in when entering the viewport.
 */

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

// Custom easing curve (Apple-like smooth animation)
const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface ScaleInViewProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  initialScale?: number;
  once?: boolean;
}

export function ScaleInView({
  children,
  className,
  delay = 0,
  duration = 0.6,
  initialScale = 0.8,
  once = true,
}: ScaleInViewProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: initialScale }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once, margin: "-50px" }}
      transition={{
        duration,
        delay,
        ease: easeOut,
      }}
    >
      {children}
    </motion.div>
  );
}
