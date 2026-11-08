import type {
  Job,
  JobEvent,
  Message,
  Offer,
  Rating,
  SmsLog,
  User,
  WorkerProfile,
} from "@skillconnect/domain";
import { createSeedDb } from "./seed";

export interface Db {
  users: User[];
  passwords: Record<string, string>;
  profiles: WorkerProfile[];
  jobs: Job[];
  offers: Offer[];
  messages: Message[];
  ratings: Rating[];
  events: JobEvent[];
  sms: SmsLog[];
  seq: number;
}

const globalStore = globalThis as unknown as { __skillconnectDb?: Db };

export function getDb(): Db {
  if (!globalStore.__skillconnectDb) {
    globalStore.__skillconnectDb = createSeedDb();
  }
  return globalStore.__skillconnectDb;
}

export function resetDb(db: Db = createSeedDb()): Db {
  globalStore.__skillconnectDb = db;
  return db;
}

export function nowIso(): string {
  return new Date().toISOString();
}

let internalSeq = 10_000;

export function nextId(prefix: string): string {
  internalSeq += 1;
  return `${prefix}_${internalSeq.toString(36)}`;
}
