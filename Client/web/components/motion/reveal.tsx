"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  width?: "fit" | "full";
}

export function Reveal({
  children,
  className,
  delay = 0,
  width = "full",
}: RevealProps) {
  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: width === "full" ? "100%" : "fit-content",
        overflow: "hidden",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
}
