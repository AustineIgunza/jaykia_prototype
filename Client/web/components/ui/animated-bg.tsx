"use client";

import { memo } from "react";

interface AnimatedBgProps {
  variant?: "public" | "admin";
}

export const AnimatedBg = memo(function AnimatedBg({ variant = "public" }: AnimatedBgProps) {
  const isAdmin = variant === "admin";
  const baseOpacity = isAdmin ? 0.5 : 1;

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden motion-reduce:hidden"
      aria-hidden="true"
    >
      {/* Soft gradient orbs — no blur filter, uses pre-blurred radial gradients */}
      <div className="jk-glow jk-glow-1" style={{ opacity: 0.08 * baseOpacity }} />
      <div className="jk-glow jk-glow-2" style={{ opacity: 0.06 * baseOpacity }} />
      <div className="jk-glow jk-glow-3" style={{ opacity: 0.05 * baseOpacity }} />

      {/* Floating gold dots */}
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={i}
          className="jk-dot"
          style={{
            left: `${10 + i * 16}%`,
            top: `${15 + (i * 37) % 70}%`,
            width: 3 + (i % 3),
            height: 3 + (i % 3),
            opacity: (0.15 + (i % 3) * 0.1) * baseOpacity,
            animationDuration: `${18 + i * 4}s`,
            animationDelay: `${i * 2}s`,
          }}
        />
      ))}

      {/* Sweeping horizontal light beams */}
      <div className="jk-beam jk-beam-1" style={{ opacity: 0.04 * baseOpacity }} />
      <div className="jk-beam jk-beam-2" style={{ opacity: 0.03 * baseOpacity }} />

      {/* Subtle diagonal shimmer line */}
      <div className="jk-shimmer" style={{ opacity: 0.06 * baseOpacity }} />

      {/* Vignette overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 30%, var(--jk-charcoal) 100%)",
          opacity: 0.6,
        }}
      />
    </div>
  );
});
