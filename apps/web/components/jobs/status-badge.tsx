import { useTranslations } from "next-intl";
import type { JobStatus } from "@skillconnect/domain";
import { cn } from "@/lib/utils";

const STYLES: Record<JobStatus, string> = {
  SEARCHING: "bg-status-searching/15 text-status-searching ring-status-searching/25",
  ASSIGNED: "bg-status-assigned/15 text-status-assigned ring-status-assigned/25",
  IN_PROGRESS: "bg-status-progress/15 text-status-progress ring-status-progress/25",
  COMPLETED: "bg-status-completed/15 text-status-completed ring-status-completed/25",
  CANCELLED: "bg-status-cancelled/15 text-status-cancelled ring-status-cancelled/25",
  EXPIRED: "bg-status-expired/15 text-status-expired ring-status-expired/25",
};

export function StatusBadge({ status, className }: { status: JobStatus; className?: string }) {
  const t = useTranslations("status");
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        STYLES[status],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {t(status)}
    </span>
  );
}
