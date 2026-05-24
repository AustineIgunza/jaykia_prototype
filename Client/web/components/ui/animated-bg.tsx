"use client";

import { useEffect, useRef } from "react";

interface AnimatedBgProps {
  variant?: "public" | "admin";
}

export function AnimatedBg({ variant = "public" }: AnimatedBgProps) {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;

    function onMove(e: MouseEvent) {
      glow!.style.left = `${e.clientX}px`;
      glow!.style.top = `${e.clientY}px`;
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const isAdmin = variant === "admin";
  const orbOpacity = isAdmin ? 0.06 : 0.1;
  const particleOpacity = isAdmin ? 0.15 : 0.25;

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden motion-reduce:hidden"
      aria-hidden="true"
    >
      {/* Mouse-reactive glow */}
      <div
        ref={glowRef}
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 500,
          height: 500,
          background: "radial-gradient(circle, var(--jk-gold) 0%, transparent 70%)",
          opacity: 0.06,
          filter: "blur(80px)",
          transition: "left 0.4s ease-out, top 0.4s ease-out",
          willChange: "left, top",
        }}
      />

      {/* Orbs — CSS animated */}
      <div className="jk-orb jk-orb-1" style={{ opacity: orbOpacity }} />
      <div className="jk-orb jk-orb-2" style={{ opacity: orbOpacity }} />
      <div className="jk-orb jk-orb-3" style={{ opacity: orbOpacity }} />
      <div className="jk-orb jk-orb-4" style={{ opacity: orbOpacity }} />

      {/* Particles — CSS animated */}
      {Array.from({ length: 15 }, (_, i) => (
        <div
          key={i}
          className="jk-particle"
          style={{
            left: `${(i * 6.7) % 100}%`,
            top: `${(i * 13.3) % 100}%`,
            width: 2 + (i % 3) * 1.5,
            height: 2 + (i % 3) * 1.5,
            opacity: particleOpacity,
            animationDuration: `${10 + (i % 5) * 4}s`,
            animationDelay: `${i * 0.6}s`,
          }}
        />
      ))}

      {/* Sweeping beams */}
      <div className="jk-beam jk-beam-1" />
      <div className="jk-beam jk-beam-2" />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, var(--jk-charcoal) 100%)",
          opacity: 0.5,
        }}
      />
    </div>
  );
}
