import { beforeEach, describe, expect, it } from "vitest";
import {
  expireOverdueOffers,
  getJob,
  getOfferByToken,
  getPasswordHash,
  listOffersByJob,
  nowIso,
  resetDb,
  respondToOffer,
  saveJob,
  setSmsProvider,
  startSearch,
  verifyPassword,
} from "@skillconnect/api";
import type { Job } from "@skillconnect/domain";

const JOB_ID = "job_test";
const sent: string[] = [];

function makeJob(skills: string[]): void {
  const job: Job = {
    id: JOB_ID,
    clientId: "client_2",
    title: "Test job",
    description: "A job created by the offer engine test suite.",
    skills,
    location: { lat: 9.01, lng: 38.76, label: "Bole" },
    status: "SEARCHING",
    createdAt: nowIso(),
    updatedAt: nowIso(),
    rated: false,
  };
  saveJob(job);
}

beforeEach(() => {
  resetDb();
  sent.length = 0;
  makeJob(["plumbing"]);
  setSmsProvider({
    async send(message) {
      sent.push(message.template);
      return { providerId: `test_${sent.length}` };
    },
  });
});

describe("offer engine", () => {
  it("ranks, creates offers and sends only the first one", async () => {
    const offers = await startSearch(JOB_ID);

    expect(offers.length).toBeGreaterThan(1);
    expect(offers.every((offer) => offer.status === "PENDING")).toBe(true);

    const dispatched = offers.filter((offer) => offer.sentAt);
    expect(dispatched).toHaveLength(1);
    expect(offers.map((offer) => offer.rank)).toEqual(
      [...offers.map((offer) => offer.rank)].sort((a, b) => a - b),
    );
    expect(sent).toEqual(["offer"]);
  });

  it("assigns the job to the first acceptance and closes the rest", async () => {
    const offers = await startSearch(JOB_ID);
    const [first, second] = offers;

    const result = await respondToOffer(first.token, "accept");
    expect(result.job.status).toBe("ASSIGNED");
    expect(result.job.assignedWorkerId).toBe(first.workerId);
    expect(getOfferByToken(first.token)?.status).toBe("ACCEPTED");

    const stillPending = listOffersByJob(JOB_ID).filter(
      (offer) => offer.id !== first.id && offer.status === "PENDING",
    );
    expect(stillPending).toHaveLength(0);
    expect(sent).toContain("assignment");

    await expect(respondToOffer(second.token, "accept")).rejects.toMatchObject({
      code: "CONFLICT",
      status: 409,
    });
  });

  it("rejecting dispatches the next ranked offer", async () => {
    const offers = await startSearch(JOB_ID);
    const [first, second] = offers;

    const result = await respondToOffer(first.token, "reject");
    expect(result.offer.status).toBe("REJECTED");
    expect(getOfferByToken(second.token)?.sentAt).toBeTruthy();
    expect(getJob(JOB_ID)?.status).toBe("SEARCHING");
  });

  it("expires overdue offers and advances the queue", async () => {
    const offers = await startSearch(JOB_ID);
    const [first, second] = offers;

    const stored = getOfferByToken(first.token);
    if (!stored) throw new Error("missing offer");
    stored.expiresAt = new Date(Date.now() - 1000).toISOString();

    const expiredJobs = await expireOverdueOffers();
    expect(expiredJobs).toBe(1);
    expect(getOfferByToken(first.token)?.status).toBe("EXPIRED");
    expect(getOfferByToken(second.token)?.sentAt).toBeTruthy();
    expect(sent.filter((template) => template === "offer")).toHaveLength(2);
  });

  it("refuses an expired acceptance and releases the job", async () => {
    const offers = await startSearch(JOB_ID);
    const stored = getOfferByToken(offers[0].token);
    if (!stored) throw new Error("missing offer");
    stored.expiresAt = new Date(Date.now() - 1000).toISOString();

    await expect(respondToOffer(stored.token, "accept")).rejects.toMatchObject({
      code: "EXPIRED",
      status: 410,
    });
    expect(getJob(JOB_ID)?.status).toBe("SEARCHING");
    expect(sent.filter((template) => template === "offer")).toHaveLength(2);
  });

  it("expires the job when nobody is left to offer", async () => {
    const offers = await startSearch(JOB_ID);

    for (let attempt = 0; attempt <= offers.length; attempt += 1) {
      const pending = listOffersByJob(JOB_ID).find(
        (offer) => offer.status === "PENDING" && offer.sentAt,
      );
      if (!pending) break;
      pending.expiresAt = new Date(Date.now() - 1000).toISOString();
      await expireOverdueOffers();
    }

    expect(getJob(JOB_ID)?.status).toBe("EXPIRED");
  });

  it("verifies seeded demo passwords", () => {
    expect(verifyPassword("password123", getPasswordHash("client_1")!)).toBe(true);
    expect(verifyPassword("wrong-password", getPasswordHash("client_1")!)).toBe(false);
  });
});
