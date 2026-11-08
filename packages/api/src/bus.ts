import { EventEmitter } from "node:events";
import type { JobEvent } from "@skillconnect/domain";

const globalBus = globalThis as unknown as { __skillconnectBus?: EventEmitter };

export function getBus(): EventEmitter {
  if (!globalBus.__skillconnectBus) {
    const bus = new EventEmitter();
    bus.setMaxListeners(0);
    globalBus.__skillconnectBus = bus;
  }
  return globalBus.__skillconnectBus;
}

export const jobChannel = (jobId: string) => `job:${jobId}`;

export function publishJobEvent(event: JobEvent): void {
  getBus().emit(jobChannel(event.jobId), event);
}
