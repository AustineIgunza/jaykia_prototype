"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
}

const directionOffset = {
  up: { y: 24 },
  down: { y: -24 },
  left: { x: 24 },
  right: { x: -24 },
  none: {},
};

export function FadeIn({
  children,
  className,
  delay = 0,
  duration = 0.6,
  direction = "up",
  distance,
}: FadeInProps) {
  const offset = { ...directionOffset[direction] };
  if (distance !== undefined) {
    if ("y" in offset) offset.y = direction === "up" ? distance : -distance;
    if ("x" in offset) offset.x = direction === "left" ? distance : -distance;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}
