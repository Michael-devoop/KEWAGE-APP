import type { JobStatus, Role } from "./types";

export type JobAction = "cancel" | "start" | "complete" | "rate";

const ALLOWED: Record<JobAction, { from: JobStatus[]; to: JobStatus; role: Role }> = {
  cancel: { from: ["SEARCHING", "ASSIGNED"], to: "CANCELLED", role: "client" },
  start: { from: ["ASSIGNED"], to: "IN_PROGRESS", role: "worker" },
  complete: { from: ["IN_PROGRESS"], to: "COMPLETED", role: "worker" },
  rate: { from: ["COMPLETED"], to: "COMPLETED", role: "client" },
};

export function canPerform(action: JobAction, status: JobStatus, role: Role): boolean {
  const rule = ALLOWED[action];
  return rule.role === role && rule.from.includes(status);
}

export function nextStatus(action: JobAction, status: JobStatus, role: Role): JobStatus | null {
  if (!canPerform(action, status, role)) return null;
  return ALLOWED[action].to;
}
