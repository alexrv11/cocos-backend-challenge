interface Props {
  className?: string;
}

export default function Skeleton({ className = '' }: Props) {
  return (
    <div
      className={`animate-pulse bg-tab-bg rounded-lg ${className}`}
      aria-hidden="true"
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-border p-5 flex flex-col gap-3">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-8 w-40" />
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <Skeleton className="w-9 h-9 rounded-full shrink-0" />
      <div className="flex flex-col gap-1 flex-1">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-20" />
    </div>
  );
}

export function InstrumentCardSkeleton() {
  return (
    <div className="p-4 rounded-2xl border border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}
