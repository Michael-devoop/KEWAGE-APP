import type { OfferStatus } from "@skillconnect/domain";
import { cn } from "@/lib/utils";

const LABELS: Record<OfferStatus, string> = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  REJECTED: "Declined",
  EXPIRED: "Expired",
  CLOSED: "Filled by another",
};

export function OfferBadge({ status }: { status: OfferStatus }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[11px] font-medium",
        status === "PENDING" && "bg-status-searching/15 text-status-searching",
        status === "ACCEPTED" && "bg-status-completed/15 text-status-completed",
        status === "REJECTED" && "bg-muted text-muted-foreground",
        status === "EXPIRED" && "bg-status-expired/15 text-status-expired",
        status === "CLOSED" && "bg-muted text-muted-foreground",
      )}
    >
      {LABELS[status]}
    </span>
  );
}
