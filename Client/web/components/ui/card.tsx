import type { ReactNode, HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
}

function Card({ children, hover = false, className = "", ...props }: CardProps) {
  return (
    <div
      className={`bg-surface border border-border rounded-[var(--radius-lg)] p-6 ${hover ? "transition-colors duration-200 hover:border-accent/30 hover:bg-surface-hover" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

function CardHeader({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

function CardTitle({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={`font-display text-lg font-semibold text-foreground ${className}`}>
      {children}
    </h3>
  );
}

function CardContent({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export { Card, CardHeader, CardTitle, CardContent };
