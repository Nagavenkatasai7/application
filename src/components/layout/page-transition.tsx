"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

// Animation variants based on Design Document Section 3
// Full motion variants with movement
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -20,
  },
};

// Reduced motion variants - fade only, no movement
// WCAG 2.1 AA: 2.3.3 Animation from Interactions
const reducedMotionVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
  exit: {
    opacity: 0,
  },
};

// Spring configurations from Design Document Section 3.1
const pageTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 25,
};

// Instant transition for reduced motion preference
const reducedMotionTransition = {
  duration: 0.01,
};

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={prefersReducedMotion ? reducedMotionVariants : pageVariants}
      transition={prefersReducedMotion ? reducedMotionTransition : pageTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Stagger container for animating children
const staggerContainerVariants = {
  initial: {},
  animate: {
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.08,
    },
  },
};

// Reduced motion stagger - no delay, instant
const reducedStaggerContainerVariants = {
  initial: {},
  animate: {
    transition: {
      delayChildren: 0,
      staggerChildren: 0,
    },
  },
};

const staggerItemVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 25,
    },
  },
};

// Reduced motion item - fade only
const reducedStaggerItemVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.01,
    },
  },
};

export function StaggerContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={prefersReducedMotion ? reducedStaggerContainerVariants : staggerContainerVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      variants={prefersReducedMotion ? reducedStaggerItemVariants : staggerItemVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Card hover animation from Design Document Section 3.2
export function AnimatedCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();

  // Disable hover animation for reduced motion preference
  const hoverProps = prefersReducedMotion
    ? {}
    : {
        whileHover: {
          y: -8,
          scale: 1.02,
          transition: {
            type: "spring" as const,
            stiffness: 400,
            damping: 30,
          },
        },
      };

  return (
    <motion.div {...hoverProps} className={className}>
      {children}
    </motion.div>
  );
}
