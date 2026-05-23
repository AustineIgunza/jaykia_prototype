function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-[var(--radius-md)] bg-surface-hover ${className}`}
      aria-hidden="true"
    />
  );
}

function SkeletonCard() {
  return (
    <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6 space-y-3">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-7 w-32" />
    </div>
  );
}

function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-surface border border-border rounded-[var(--radius-lg)] overflow-hidden">
      <div className="border-b border-border p-4 flex gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-3 w-20" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-b border-border p-4 flex gap-6 last:border-0">
          {[1, 2, 3, 4].map((j) => (
            <Skeleton key={j} className="h-4 w-24" />
          ))}
        </div>
      ))}
    </div>
  );
}

function SkeletonPage() {
  return (
    <div className="space-y-6 animate-pulse">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <SkeletonTable />
    </div>
  );
}

export { Skeleton, SkeletonCard, SkeletonTable, SkeletonPage };
