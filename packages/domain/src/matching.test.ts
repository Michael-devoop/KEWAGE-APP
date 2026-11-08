import { describe, expect, it } from "vitest";
import { distanceKm } from "./geo";
import { rankWorkers } from "./matching";
import { DEFAULT_MATCHING_CONFIG } from "./matching-config";
import type { Job, WorkerProfile } from "./types";

const job: Job = {
  id: "job-1",
  clientId: "client-1",
  title: "Fix a leaking sink",
  description: "Kitchen sink leaks under the cabinet.",
  skills: ["plumbing"],
  location: { lat: 9.01, lng: 38.75, label: "Bole" },
  status: "SEARCHING",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  rated: false,
};

function worker(overrides: Partial<WorkerProfile> & { userId: string }): WorkerProfile {
  return {
    skills: ["plumbing"],
    experienceYears: 5,
    location: { lat: 9.01, lng: 38.75, label: "Bole" },
    availableNow: true,
    assessmentStatus: "VERIFIED",
    ratingAvg: 4,
    ratingCount: 10,
    completedJobs: 10,
    responseRate: 1,
    lastActiveAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("distanceKm", () => {
  it("is zero for the same point and grows with separation", () => {
    const here = { lat: 9.01, lng: 38.75, label: "a" };
    const near = { lat: 9.02, lng: 38.75, label: "b" };
    expect(distanceKm(here, here)).toBe(0);
    expect(distanceKm(here, near)).toBeGreaterThan(1);
  });
});

describe("rankWorkers", () => {
  it("excludes unavailable, under-skilled, out-of-radius and self workers", () => {
    const eligible = worker({ userId: "worker-ok" });
    const unavailable = worker({ userId: "worker-off", availableNow: false });
    const wrongSkill = worker({ userId: "worker-skill", skills: ["painting"] });
    const farAway = worker({
      userId: "worker-far",
      location: { lat: 9.6, lng: 38.75, label: "far" },
    });
    const self = worker({ userId: "client-1" });

    const ranked = rankWorkers(job, [eligible, unavailable, wrongSkill, farAway, self]);
    expect(ranked.map((r) => r.workerId)).toEqual(["worker-ok"]);
  });

  it("ranks closer and better-rated workers first", () => {
    const close = worker({
      userId: "close",
      location: { lat: 9.012, lng: 38.75, label: "close" },
      ratingAvg: 4.8,
      ratingCount: 40,
    });
    const far = worker({
      userId: "far",
      location: { lat: 9.08, lng: 38.75, label: "far" },
      ratingAvg: 3,
      ratingCount: 2,
    });

    const ranked = rankWorkers(job, [far, close]);
    expect(ranked[0].workerId).toBe("close");
    expect(ranked[0].score).toBeGreaterThan(ranked[1].score);
  });

  it("never returns more than the configured candidate cap", () => {
    const workers = Array.from({ length: 15 }, (_, i) =>
      worker({ userId: `worker-${i}` }),
    );
    const ranked = rankWorkers(job, workers, {
      ...DEFAULT_MATCHING_CONFIG,
      maxCandidates: 10,
    });
    expect(ranked).toHaveLength(10);
  });
});
