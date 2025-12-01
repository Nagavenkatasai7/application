"use client";

/**
 * SlideInView Component
 *
 * Scroll-triggered slide animation from left or right.
 */

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

// Custom easing curve (Apple-like smooth animation)
const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface SlideInViewProps {
  children: ReactNode;
  className?: string;
  direction?: "left" | "right";
  delay?: number;
  duration?: number;
  distance?: number;
  once?: boolean;
}

export function SlideInView({
  children,
  className,
  direction = "left",
  delay = 0,
  duration = 0.6,
  distance = 50,
  once = true,
}: SlideInViewProps) {
  const prefersReducedMotion = useReducedMotion();
  const x = direction === "left" ? -distance : distance;

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x }}
      whileInView={{ opacity: 1, x: 0 }}
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
