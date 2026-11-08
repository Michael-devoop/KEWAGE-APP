import type {
  Job,
  JobEvent,
  Message,
  Offer,
  User,
  WorkerProfile,
} from "@skillconnect/domain";
import { hashPassword } from "./auth";
import type { Db } from "./store";

const MINUTE = 60_000;
const iso = (offsetMs = 0) => new Date(Date.now() + offsetMs).toISOString();

export const DEMO_PASSWORD = "password123";

function user(id: string, name: string, phone: string, role: "client" | "worker", offset = 0): User {
  return { id, name, phone, role, createdAt: iso(-offset) };
}

function profile(
  userId: string,
  skills: string[],
  location: WorkerProfile["location"],
  overrides: Partial<WorkerProfile> = {},
): WorkerProfile {
  return {
    userId,
    skills,
    experienceYears: 5,
    location,
    availableNow: true,
    assessmentStatus: "VERIFIED",
    ratingAvg: 4.5,
    ratingCount: 10,
    completedJobs: 10,
    responseRate: 0.9,
    lastActiveAt: iso(-5 * MINUTE),
    ...overrides,
  };
}

export function createSeedDb(): Db {
  const users: User[] = [
    user("client_1", "Hana Girma", "0911000001", "client", 30),
    user("client_2", "Yonas Bekele", "0911000002", "client", 25),
    user("worker_1", "Dawit Mekonnen", "0912000001", "worker", 20),
    user("worker_2", "Sara Alemu", "0912000002", "worker", 18),
    user("worker_3", "Mulu Tesfaye", "0912000003", "worker", 16),
    user("worker_4", "Tesfaye Abebe", "0912000004", "worker", 14),
    user("worker_5", "Abebe Kebede", "0912000005", "worker", 12),
    user("worker_6", "Lidya Haile", "0912000006", "worker", 10),
  ];

  const passwords = Object.fromEntries(
    users.map((u) => [u.id, hashPassword(DEMO_PASSWORD)]),
  );

  const profiles: WorkerProfile[] = [
    profile("worker_1", ["plumbing", "carpentry"], { lat: 9.012, lng: 38.762, label: "Bole" }, {
      experienceYears: 8,
      ratingAvg: 4.8,
      ratingCount: 24,
      completedJobs: 26,
      responseRate: 0.95,
      about: "Licensed plumber, 8 years of residential repairs.",
    }),
    profile("worker_2", ["cleaning", "painting"], { lat: 9.018, lng: 38.77, label: "Kazanchis" }, {
      experienceYears: 4,
      ratingAvg: 4.6,
      ratingCount: 18,
      completedJobs: 19,
      responseRate: 0.9,
    }),
    profile("worker_3", ["electrical", "hvac"], { lat: 9.04, lng: 38.75, label: "Piassa" }, {
      experienceYears: 6,
      ratingAvg: 4.2,
      ratingCount: 6,
      completedJobs: 7,
      responseRate: 0.8,
      assessmentStatus: "UNVERIFIED",
    }),
    profile("worker_4", ["plumbing", "general-handyman"], { lat: 9.03, lng: 38.8, label: "Megenagna" }, {
      experienceYears: 12,
      ratingAvg: 4.9,
      ratingCount: 50,
      completedJobs: 54,
      responseRate: 0.98,
      about: "General handyman for plumbing, fittings and small repairs.",
    }),
    profile("worker_5", ["carpentry", "roofing"], { lat: 9.0, lng: 38.82, label: "Gerji" }, {
      experienceYears: 9,
      ratingAvg: 4.5,
      ratingCount: 10,
      availableNow: false,
      responseRate: 0.7,
    }),
    profile("worker_6", ["moving", "cleaning", "gardening"], { lat: 9.005, lng: 38.74, label: "Old Airport" }, {
      experienceYears: 5,
      ratingAvg: 4.7,
      ratingCount: 30,
      completedJobs: 32,
      responseRate: 1,
    }),
  ];

  const jobs: Job[] = [
    {
      id: "job_1",
      clientId: "client_1",
      title: "Fix leaking kitchen sink",
      description: "Water leaks under the kitchen cabinet. Need a plumber today.",
      skills: ["plumbing"],
      location: { lat: 9.01, lng: 38.76, label: "Bole" },
      status: "IN_PROGRESS",
      assignedWorkerId: "worker_1",
      worker: {
        id: "worker_1",
        firstName: "Dawit",
        skills: ["plumbing", "carpentry"],
        ratingAvg: 4.8,
        ratingCount: 24,
      },
      createdAt: iso(-2 * 60 * MINUTE),
      updatedAt: iso(-40 * MINUTE),
      rated: false,
    },
    {
      id: "job_2",
      clientId: "client_1",
      title: "Repair a wardrobe door",
      description: "The wardrobe door came off its hinge and will not close.",
      skills: ["carpentry"],
      location: { lat: 9.01, lng: 38.76, label: "Bole" },
      status: "SEARCHING",
      createdAt: iso(-30 * MINUTE),
      updatedAt: iso(-30 * MINUTE),
      rated: false,
    },
  ];

  const offers: Offer[] = [
    {
      id: "offer_demo",
      token: "demo-offer-token",
      jobId: "job_2",
      workerId: "worker_4",
      rank: 1,
      score: 88.4,
      status: "PENDING",
      sentAt: iso(-2 * MINUTE),
      expiresAt: iso(8 * MINUTE),
      smsAttempts: 1,
      summary: {
        title: "Repair a wardrobe door",
        skill: "Carpentry",
        area: "Bole",
        distanceKm: 3.1,
      },
      serverNow: iso(),
    },
  ];

  const messages: Message[] = [
    {
      id: "msg_1",
      clientId: "seed-1",
      jobId: "job_1",
      senderId: "client_1",
      senderRole: "client",
      text: "Hi Dawit, the leak is under the kitchen sink.",
      sentAt: iso(-35 * MINUTE),
    },
    {
      id: "msg_2",
      clientId: "seed-2",
      jobId: "job_1",
      senderId: "worker_1",
      senderRole: "worker",
      text: "Thanks, I am on my way. I will check the pipe joint first.",
      sentAt: iso(-30 * MINUTE),
    },
  ];

  const events: JobEvent[] = [
    {
      id: "evt_1",
      jobId: "job_1",
      type: "JOB_CREATED",
      actorId: "client_1",
      payload: {},
      createdAt: iso(-120 * MINUTE),
    },
    {
      id: "evt_2",
      jobId: "job_1",
      type: "JOB_ASSIGNED",
      actorId: "worker_1",
      payload: { workerId: "worker_1" },
      createdAt: iso(-60 * MINUTE),
    },
    {
      id: "evt_3",
      jobId: "job_2",
      type: "JOB_CREATED",
      actorId: "client_1",
      payload: {},
      createdAt: iso(-30 * MINUTE),
    },
  ];

  return {
    users,
    passwords,
    profiles,
    jobs,
    offers,
    messages,
    ratings: [],
    events,
    sms: [],
    seq: 100,
  };
}
