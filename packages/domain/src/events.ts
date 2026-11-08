import type { JobEventType } from "./types";

export const OFFER_EVENTS: JobEventType[] = [
  "OFFER_SENT",
  "OFFER_REJECTED",
  "OFFER_EXPIRED",
  "OFFER_ACCEPTED",
];

export const JOB_STATE_EVENTS: JobEventType[] = [
  "JOB_CREATED",
  "SEARCH_STARTED",
  "JOB_ASSIGNED",
  "JOB_STARTED",
  "JOB_COMPLETED",
  "JOB_CANCELLED",
  "JOB_EXPIRED",
];
