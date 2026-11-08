import { Skeleton } from "@/components/ui/skeleton";

export default function WorkerLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3 border-b border-border/60 pb-4">
        <Skeleton className="h-1 w-9 rounded-full" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="rounded-3xl border border-border/60 bg-card p-3.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="mt-2 h-6 w-10" />
            <Skeleton className="mt-2 h-3 w-14" />
          </div>
        ))}
      </div>
      <Skeleton className="h-20 w-full rounded-3xl" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    </div>
  );
}
