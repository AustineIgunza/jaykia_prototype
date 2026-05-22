type BadgeVariant = "pending" | "success" | "error" | "info" | "warning";

interface StatusBadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  pending: "bg-accent/15 text-accent-light border-accent/25",
  success: "bg-success/15 text-success border-success/25",
  error: "bg-error/15 text-error border-error/25",
  info: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  warning: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25",
};

function StatusBadge({ variant = "info", children, className = "" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export { StatusBadge, type BadgeVariant };
