import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-wrap items-start justify-between gap-3 border-b border-border/60 pb-4 animate-fade-up",
        className,
      )}
    >
      <div className="min-w-0 space-y-1">
        <span className="block h-1 w-9 rounded-full bg-primary/70" aria-hidden />
        <h1 className="text-balance pt-1 text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? (
          <div className="text-sm leading-relaxed text-muted-foreground">{description}</div>
        ) : null}
      </div>
      {action ? <div className="shrink-0 pt-1">{action}</div> : null}
    </header>
  );
}
