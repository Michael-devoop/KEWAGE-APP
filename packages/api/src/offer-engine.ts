import { randomBytes } from "node:crypto";
import {
  DEFAULT_MATCHING_CONFIG,
  OFFER_TIMEOUT_MINUTES,
  rankWorkers,
  skillName,
  type Job,
  type Offer,
} from "@skillconnect/domain";
import { publishJobEvent } from "./bus";
import { conflict, expired, notFound } from "./errors";
import {
  addEvent,
  addSmsLog,
  getJob,
  getOfferByToken,
  getUserById,
  listAllOffers,
  listOffersByJob,
  listProfiles,
  saveJob,
  saveOffer,
} from "./repositories";
import { getSmsProvider } from "./sms";
import { nextId, nowIso } from "./store";

const OFFER_TIMEOUT_MS = OFFER_TIMEOUT_MINUTES * 60_000;

function emit(event: ReturnType<typeof addEvent>) {
  publishJobEvent(event);
}

async function sendOfferSms(offer: Offer): Promise<void> {
  const worker = getUserById(offer.workerId);
  if (!worker) return;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const url = `${baseUrl}/o/${offer.token}`;
  const log = addSmsLog({
    id: nextId("sms"),
    to: worker.phone,
    template: "offer",
    payload: { offerId: offer.id, jobId: offer.jobId, url },
    status: "QUEUED",
    attempts: 1,
    createdAt: nowIso(),
  });
  try {
    const { providerId } = await getSmsProvider().send({
      to: worker.phone,
      template: "offer",
      data: { title: offer.summary.title, url },
    });
    log.status = "SENT";
    log.providerId = providerId;
  } catch (error) {
    log.status = "FAILED";
    log.error = error instanceof Error ? error.message : "unknown sms error";
  }
}

/**
 * Creates ranked offers for a job and sends the first one.
 * Production would enqueue this (NFR-05); the mock runs it inline.
 */
export async function startSearch(jobId: string): Promise<Offer[]> {
  const job = getJob(jobId);
  if (!job) throw notFound("Job");

  const alreadyOffered = new Set(listOffersByJob(jobId).map((offer) => offer.workerId));
  const ranked = rankWorkers(
    job,
    listProfiles(),
    DEFAULT_MATCHING_CONFIG,
    [...alreadyOffered],
  );

  emit(addEvent(jobId, "SEARCH_STARTED", { candidates: ranked.length }));

  if (ranked.length === 0) {
    markJobExpired(jobId);
    return [];
  }

  const now = nowIso();
  const offers = ranked.map((candidate, index) => {
    const offer: Offer = {
      id: nextId("offer"),
      token: randomBytes(24).toString("base64url"),
      jobId,
      workerId: candidate.workerId,
      rank: index + 1,
      score: candidate.score,
      status: "PENDING",
      expiresAt: now,
      smsAttempts: 0,
      summary: {
        title: job.title,
        skill: skillName(job.skills[0] ?? ""),
        area: job.location.label,
        distanceKm: candidate.distanceKm,
      },
      serverNow: now,
    };
    return saveOffer(offer);
  });

  await dispatchNext(jobId);
  return offers;
}

/** Sends the next pending offer in rank order, or expires the job. */
export async function dispatchNext(jobId: string): Promise<Offer | null> {
  const pending = listOffersByJob(jobId)
    .filter((offer) => offer.status === "PENDING" && !offer.sentAt)
    .sort((a, b) => a.rank - b.rank);

  const next = pending[0];
  if (!next) {
    markJobExpired(jobId);
    return null;
  }

  const now = nowIso();
  next.sentAt = now;
  next.expiresAt = new Date(Date.now() + OFFER_TIMEOUT_MS).toISOString();
  next.smsAttempts += 1;
  saveOffer(next);

  emit(addEvent(jobId, "OFFER_SENT", { offerId: next.id, workerId: next.workerId, rank: next.rank }));
  await sendOfferSms(next);
  return next;
}

function markJobExpired(jobId: string): void {
  const job = getJob(jobId);
  if (!job || job.status !== "SEARCHING") return;
  job.status = "EXPIRED";
  job.updatedAt = nowIso();
  saveJob(job);
  emit(addEvent(jobId, "JOB_EXPIRED", {}));
}

function closeOtherOffers(jobId: string, acceptedOfferId: string): void {
  for (const offer of listOffersByJob(jobId)) {
    if (offer.id !== acceptedOfferId && offer.status === "PENDING") {
      offer.status = "CLOSED";
      offer.respondedAt = nowIso();
      saveOffer(offer);
    }
  }
}

async function notifyClientOfAssignment(job: Job): Promise<void> {
  const client = getUserById(job.clientId);
  if (!client) return;
  const log = addSmsLog({
    id: nextId("sms"),
    to: client.phone,
    template: "assignment",
    payload: { jobId: job.id, workerId: job.assignedWorkerId },
    status: "QUEUED",
    attempts: 1,
    createdAt: nowIso(),
  });
  try {
    const { providerId } = await getSmsProvider().send({
      to: client.phone,
      template: "assignment",
      data: { jobId: job.id },
    });
    log.status = "SENT";
    log.providerId = providerId;
  } catch (error) {
    // Failed SMS must not roll back an accepted assignment (NFR-02).
    log.status = "FAILED";
    log.error = error instanceof Error ? error.message : "unknown sms error";
  }
}

/**
 * Atomic assignment. In this single-process store the check-and-set below runs
 * synchronously, so two near-simultaneous accepts cannot both win. A Postgres
 * adapter must use: UPDATE jobs SET status='ASSIGNED' WHERE id=$1 AND status='SEARCHING'.
 */
export async function respondToOffer(
  token: string,
  decision: "accept" | "reject",
): Promise<{ offer: Offer; job: Job }> {
  const offer = getOfferByToken(token);
  if (!offer) throw notFound("Offer");
  if (offer.status !== "PENDING") throw conflict(`Offer is already ${offer.status.toLowerCase()}`);

  const now = nowIso();
  if (new Date(offer.expiresAt).getTime() <= Date.now()) {
    offer.status = "EXPIRED";
    offer.respondedAt = now;
    saveOffer(offer);
    emit(addEvent(offer.jobId, "OFFER_EXPIRED", { offerId: offer.id, workerId: offer.workerId }));
    await dispatchNext(offer.jobId);
    throw expired();
  }

  if (decision === "reject") {
    offer.status = "REJECTED";
    offer.respondedAt = now;
    saveOffer(offer);
    emit(addEvent(offer.jobId, "OFFER_REJECTED", { offerId: offer.id, workerId: offer.workerId }));
    await dispatchNext(offer.jobId);
    return { offer, job: getJob(offer.jobId) as Job };
  }

  const job = getJob(offer.jobId);
  if (!job) throw notFound("Job");

  // Critical section: first valid acceptance wins, every later one gets CONFLICT.
  if (job.status !== "SEARCHING" || job.assignedWorkerId) {
    offer.status = "CLOSED";
    offer.respondedAt = now;
    saveOffer(offer);
    throw conflict("Another worker has already accepted this job");
  }

  job.status = "ASSIGNED";
  job.assignedWorkerId = offer.workerId;
  job.updatedAt = now;
  const worker = getUserById(offer.workerId);
  if (worker) {
    job.worker = {
      id: worker.id,
      firstName: worker.name.split(" ")[0],
      skills: listProfiles().find((p) => p.userId === worker.id)?.skills ?? [],
      ratingAvg: listProfiles().find((p) => p.userId === worker.id)?.ratingAvg,
      ratingCount: listProfiles().find((p) => p.userId === worker.id)?.ratingCount ?? 0,
    };
  }
  saveJob(job);

  offer.status = "ACCEPTED";
  offer.respondedAt = now;
  saveOffer(offer);
  closeOtherOffers(job.id, offer.id);

  emit(addEvent(job.id, "OFFER_ACCEPTED", { offerId: offer.id, workerId: offer.workerId }));
  emit(addEvent(job.id, "JOB_ASSIGNED", { workerId: offer.workerId }, offer.workerId));
  await notifyClientOfAssignment(job);

  return { offer, job };
}

/** Marks overdue offers EXPIRED and advances each affected job. */
export async function expireOverdueOffers(): Promise<number> {
  const now = Date.now();
  const affected = new Set<string>();
  for (const offer of listAllOffers()) {
    if (offer.status === "PENDING" && offer.sentAt && new Date(offer.expiresAt).getTime() <= now) {
      offer.status = "EXPIRED";
      offer.respondedAt = nowIso();
      saveOffer(offer);
      emit(addEvent(offer.jobId, "OFFER_EXPIRED", { offerId: offer.id, workerId: offer.workerId }));
      affected.add(offer.jobId);
    }
  }
  for (const jobId of affected) {
    await dispatchNext(jobId);
  }
  return affected.size;
}
