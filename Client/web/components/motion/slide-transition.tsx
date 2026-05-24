"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";

interface SlideTransitionProps {
  children: ReactNode;
  activeKey: string;
  direction?: "left" | "right";
  className?: string;
}

export function SlideTransition({
  children,
  activeKey,
  direction = "left",
  className,
}: SlideTransitionProps) {
  const xOffset = direction === "left" ? 40 : -40;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeKey}
        className={className}
        initial={{ opacity: 0, x: xOffset }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -xOffset }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
