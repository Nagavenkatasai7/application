"use client";

/**
 * FadeInView Component
 *
 * Simple scroll-triggered fade-in animation wrapper.
 * Elements fade in and slide up when they enter the viewport.
 */

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

// Custom easing curve (Apple-like smooth animation)
const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface FadeInViewProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
  once?: boolean;
}

export function FadeInView({
  children,
  className,
  delay = 0,
  duration = 0.6,
  y = 30,
  once = true,
}: FadeInViewProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
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
