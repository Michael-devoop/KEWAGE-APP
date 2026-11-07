import type { JobStatus, OfferStatus } from "./types";

export const STATUS_MAP: Record<
  JobStatus,
  { label: string; icon: string; terminal: boolean }
> = {
  SEARCHING: { label: "Looking for a worker", icon: "search", terminal: false },
  ASSIGNED: { label: "Worker assigned", icon: "user-check", terminal: false },
  IN_PROGRESS: { label: "Work in progress", icon: "hammer", terminal: false },
  COMPLETED: { label: "Completed", icon: "check-circle", terminal: true },
  CANCELLED: { label: "Cancelled", icon: "x-circle", terminal: true },
  EXPIRED: { label: "No worker found", icon: "clock-off", terminal: true },
};

// Which statuses allow cancelling is still open in SRS v1.0. Change this list when it is decided.
const CANCELLABLE: JobStatus[] = ["SEARCHING", "ASSIGNED"];

export const canCancel = (s: JobStatus) => CANCELLABLE.includes(s);
export const canStart = (s: JobStatus) => s === "ASSIGNED";
export const canComplete = (s: JobStatus) => s === "IN_PROGRESS";
export const canRate = (s: JobStatus) => s === "COMPLETED";
export const canChat = (s: JobStatus) => s === "ASSIGNED" || s === "IN_PROGRESS";
export const isTerminal = (s: JobStatus) => STATUS_MAP[s].terminal;

export const canRespondToOffer = (s: OfferStatus) => s === "PENDING";
