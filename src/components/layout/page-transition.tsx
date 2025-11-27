"use client";

import { motion, AnimatePresence, useSpring, useTransform, useMotionValue } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useEffect, useState } from "react";

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

// ============================================
// NEW ANIMATION COMPONENTS - Phase 4 Priority 5
// ============================================

// Animated list with exit animations for deleted items
const listItemVariants = {
  initial: {
    opacity: 0,
    x: -20,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    scale: 0.95,
    transition: {
      duration: 0.2,
    },
  },
};

const reducedListItemVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.01 } },
  exit: { opacity: 0, transition: { duration: 0.01 } },
};

interface AnimatedListProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedList({ children, className }: AnimatedListProps) {
  return (
    <AnimatePresence mode="popLayout">
      <div className={className}>{children}</div>
    </AnimatePresence>
  );
}

interface AnimatedListItemProps {
  children: React.ReactNode;
  className?: string;
  layoutId?: string;
}

export function AnimatedListItem({ children, className, layoutId }: AnimatedListItemProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      layout
      layoutId={layoutId}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={prefersReducedMotion ? reducedListItemVariants : listItemVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Animated number counter for stats
interface AnimatedNumberProps {
  value: number;
  duration?: number;
  className?: string;
  formatFn?: (value: number) => string;
}

export function AnimatedNumber({
  value,
  duration = 1,
  className,
  formatFn = (v) => Math.round(v).toString(),
}: AnimatedNumberProps) {
  const prefersReducedMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(0);

  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    stiffness: 100,
    damping: 30,
    duration: prefersReducedMotion ? 0 : duration,
  });
  const rounded = useTransform(springValue, (latest) => formatFn(latest));

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  useEffect(() => {
    const unsubscribe = rounded.on("change", (latest) => {
      setDisplayValue(parseFloat(latest) || 0);
    });
    return unsubscribe;
  }, [rounded]);

  if (prefersReducedMotion) {
    return <span className={className}>{formatFn(value)}</span>;
  }

  return (
    <motion.span className={className}>
      {formatFn(displayValue)}
    </motion.span>
  );
}

// Fade in animation for elements appearing
const fadeInVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 }
  },
};

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function FadeIn({ children, className, delay = 0 }: FadeInProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={fadeInVariants}
      transition={{ delay: prefersReducedMotion ? 0 : delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Slide in animation from different directions
type SlideDirection = "up" | "down" | "left" | "right";

const slideOffsets: Record<SlideDirection, { x: number; y: number }> = {
  up: { x: 0, y: 20 },
  down: { x: 0, y: -20 },
  left: { x: 20, y: 0 },
  right: { x: -20, y: 0 },
};

interface SlideInProps {
  children: React.ReactNode;
  className?: string;
  direction?: SlideDirection;
  delay?: number;
}

export function SlideIn({
  children,
  className,
  direction = "up",
  delay = 0
}: SlideInProps) {
  const prefersReducedMotion = useReducedMotion();
  const offset = slideOffsets[direction];

  const variants = {
    initial: prefersReducedMotion
      ? { opacity: 0 }
      : { opacity: 0, x: offset.x, y: offset.y },
    animate: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 25,
        delay: prefersReducedMotion ? 0 : delay,
      },
    },
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Scale animation for buttons and interactive elements
interface ScaleOnTapProps {
  children: React.ReactNode;
  className?: string;
  scale?: number;
}

export function ScaleOnTap({ children, className, scale = 0.95 }: ScaleOnTapProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      whileTap={prefersReducedMotion ? {} : { scale }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Pulse animation for attention-grabbing elements
interface PulseProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
}

export function Pulse({ children, className, duration = 2 }: PulseProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      animate={prefersReducedMotion ? {} : {
        scale: [1, 1.05, 1],
        opacity: [1, 0.8, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Success checkmark animation
interface SuccessCheckProps {
  show: boolean;
  className?: string;
  size?: number;
}

export function SuccessCheck({ show, className, size = 24 }: SuccessCheckProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {show && (
        <motion.svg
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0 }}
          animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <motion.path
            d="M20 6L9 17L4 12"
            initial={prefersReducedMotion ? {} : { pathLength: 0 }}
            animate={prefersReducedMotion ? {} : { pathLength: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          />
        </motion.svg>
      )}
    </AnimatePresence>
  );
}

// Shimmer loading effect
interface ShimmerProps {
  className?: string;
  width?: string;
  height?: string;
}

export function Shimmer({ className, width = "100%", height = "1rem" }: ShimmerProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={`bg-muted rounded overflow-hidden ${className}`}
      style={{ width, height }}
    >
      <motion.div
        className="h-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={prefersReducedMotion ? {} : {
          x: ["-100%", "100%"],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </motion.div>
  );
}

// Skeleton with shimmer effect
interface SkeletonShimmerProps {
  className?: string;
  lines?: number;
  avatar?: boolean;
}

export function SkeletonShimmer({ className, lines = 3, avatar = false }: SkeletonShimmerProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {avatar && (
        <div className="flex items-center gap-3">
          <Shimmer className="rounded-full" width="2.5rem" height="2.5rem" />
          <div className="space-y-2 flex-1">
            <Shimmer height="0.875rem" width="60%" />
            <Shimmer height="0.75rem" width="40%" />
          </div>
        </div>
      )}
      {Array.from({ length: lines }).map((_, i) => (
        <Shimmer
          key={i}
          height="0.875rem"
          width={i === lines - 1 ? "60%" : "100%"}
        />
      ))}
    </div>
  );
}

// Hover grow effect for cards
interface HoverGrowProps {
  children: React.ReactNode;
  className?: string;
  scale?: number;
}

export function HoverGrow({ children, className, scale = 1.02 }: HoverGrowProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={prefersReducedMotion ? {} : {
        scale,
        transition: { type: "spring", stiffness: 400, damping: 25 }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
