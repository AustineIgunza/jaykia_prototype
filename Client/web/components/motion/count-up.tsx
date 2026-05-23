"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";

interface CountUpProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  formatter?: (n: number) => string;
}

export function CountUp({
  value,
  duration = 1.5,
  prefix = "",
  suffix = "",
  className,
  formatter,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const start = performance.now();
    const durationMs = duration * 1000;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / durationMs, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [isInView, value, duration]);

  const formatted = formatter ? formatter(display) : display.toLocaleString();

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.3 }}
    >
      {prefix}{formatted}{suffix}
    </motion.span>
  );
}
