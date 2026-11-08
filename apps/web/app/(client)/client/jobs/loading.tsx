import { Skeleton } from "@/components/ui/skeleton";

export default function JobsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3 border-b border-border/60 pb-4">
        <Skeleton className="h-1 w-9 rounded-full" />
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid gap-3">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="rounded-2xl border border-border/60 bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <Skeleton className="mt-3 h-4 w-full max-w-md" />
            <Skeleton className="mt-2 h-4 w-3/5" />
            <div className="mt-4 flex gap-4">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
