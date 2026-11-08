import type {
  Job,
  JobEvent,
  JobEventType,
  Message,
  Offer,
  Rating,
  SmsLog,
  User,
  WorkerProfile,
} from "@skillconnect/domain";
import { nextId, nowIso, getDb } from "./store";

export function findUserByPhone(phone: string): User | undefined {
  return getDb().users.find((user) => user.phone === phone);
}

export function getUserById(id: string): User | undefined {
  return getDb().users.find((user) => user.id === id);
}

export function createUser(
  input: Pick<User, "name" | "phone" | "role">,
  passwordHash: string,
): User {
  const db = getDb();
  const user: User = {
    id: nextId("user"),
    name: input.name,
    phone: input.phone,
    role: input.role,
    createdAt: nowIso(),
  };
  db.users.push(user);
  db.passwords[user.id] = passwordHash;
  return user;
}

export function getPasswordHash(userId: string): string | undefined {
  return getDb().passwords[userId];
}

export function getProfile(userId: string): WorkerProfile | undefined {
  return getDb().profiles.find((profile) => profile.userId === userId);
}

export function listProfiles(): WorkerProfile[] {
  return getDb().profiles;
}

export function saveProfile(profile: WorkerProfile): WorkerProfile {
  const db = getDb();
  const index = db.profiles.findIndex((item) => item.userId === profile.userId);
  if (index === -1) db.profiles.push(profile);
  else db.profiles[index] = profile;
  return profile;
}

export function listJobs(): Job[] {
  return getDb().jobs;
}

export function getJob(id: string): Job | undefined {
  return getDb().jobs.find((job) => job.id === id);
}

export function saveJob(job: Job): Job {
  const db = getDb();
  const index = db.jobs.findIndex((item) => item.id === job.id);
  if (index === -1) db.jobs.push(job);
  else db.jobs[index] = job;
  return job;
}

export function listJobsByClient(clientId: string): Job[] {
  return getDb()
    .jobs.filter((job) => job.clientId === clientId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listJobsByWorker(workerId: string): Job[] {
  return getDb()
    .jobs.filter((job) => job.assignedWorkerId === workerId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function addEvent(
  jobId: string,
  type: JobEventType,
  payload: Record<string, unknown> = {},
  actorId?: string,
): JobEvent {
  const event: JobEvent = {
    id: nextId("evt"),
    jobId,
    type,
    actorId,
    payload,
    createdAt: nowIso(),
  };
  getDb().events.push(event);
  return event;
}

export function listEvents(jobId: string): JobEvent[] {
  return getDb()
    .events.filter((event) => event.jobId === jobId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function listAllOffers(): Offer[] {
  return getDb().offers;
}

export function listOffersByJob(jobId: string): Offer[] {
  return getDb().offers.filter((offer) => offer.jobId === jobId);
}

export function listOffersByWorker(workerId: string): Offer[] {
  return getDb()
    .offers.filter((offer) => offer.workerId === workerId)
    .sort((a, b) => (b.sentAt ?? b.expiresAt).localeCompare(a.sentAt ?? a.expiresAt));
}

export function getOfferByToken(token: string): Offer | undefined {
  return getDb().offers.find((offer) => offer.token === token);
}

export function saveOffer(offer: Offer): Offer {
  const db = getDb();
  const index = db.offers.findIndex((item) => item.id === offer.id);
  if (index === -1) db.offers.push(offer);
  else db.offers[index] = offer;
  return offer;
}

export function addMessage(message: Message): Message {
  getDb().messages.push(message);
  return message;
}

export function listMessages(jobId: string): Message[] {
  return getDb()
    .messages.filter((message) => message.jobId === jobId)
    .sort((a, b) => a.sentAt.localeCompare(b.sentAt));
}

export function addRating(rating: Rating): Rating {
  getDb().ratings.push(rating);
  return rating;
}

export function listRatingsForWorker(workerId: string): Rating[] {
  return getDb().ratings.filter((rating) => rating.workerId === workerId);
}

export function addSmsLog(log: SmsLog): SmsLog {
  getDb().sms.push(log);
  return log;
}

export function listSmsLogs(): SmsLog[] {
  return getDb().sms;
}
