export type Role = "client" | "worker";

// Job statuses are not fixed in SRS v1.0 yet. Change them here if the team decides otherwise.
export type JobStatus =
  | "SEARCHING"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "EXPIRED";

// CLOSED means another worker accepted first.
export type OfferStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED" | "CLOSED";

export type AssessmentStatus = "UNVERIFIED" | "VERIFIED" | "FAILED";

export interface Location {
  lat: number;
  lng: number;
  label: string;
}

export interface Skill {
  id: string;
  name: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  role: Role;
  createdAt: string;
}

export interface WorkerProfile {
  userId: string;
  skills: string[];
  experienceYears: number;
  about?: string;
  location: Location;
  availableNow: boolean;
  assessmentStatus: AssessmentStatus;
  ratingAvg: number;
  ratingCount: number;
  completedJobs: number;
  responseRate: number;
  lastActiveAt: string;
}

export interface WorkerCard {
  id: string;
  firstName: string;
  photoUrl?: string;
  skills: string[];
  ratingAvg?: number;
  ratingCount: number;
}

export interface Job {
  id: string;
  clientId: string;
  title: string;
  description: string;
  skills: string[];
  location: Location;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  rated: boolean;
  assignedWorkerId?: string;
  worker?: WorkerCard;
  cancelledBy?: Role;
  cancelReason?: string;
}

export interface Offer {
  id: string;
  token: string;
  jobId: string;
  workerId: string;
  rank: number;
  score: number;
  status: OfferStatus;
  sentAt?: string; // ISO time set when the SMS offer is dispatched
  expiresAt: string; // ISO time
  respondedAt?: string;
  smsAttempts: number;
  summary: { title: string; skill: string; area: string; distanceKm: number };
  serverNow: string; // ISO time on the server when the offer was read
}

export interface Message {
  id: string;
  clientId: string; // made in the browser, used to avoid duplicates
  jobId: string;
  senderId: string;
  senderRole: Role;
  text: string;
  sentAt: string;
}

export interface Session {
  userId: string;
  role: Role;
  firstName: string;
}

export interface Rating {
  id: string;
  jobId: string;
  workerId: string;
  stars: number;
  comment?: string;
  createdAt: string;
}

export type JobEventType =
  | "JOB_CREATED"
  | "SEARCH_STARTED"
  | "OFFER_SENT"
  | "OFFER_REJECTED"
  | "OFFER_EXPIRED"
  | "OFFER_ACCEPTED"
  | "JOB_ASSIGNED"
  | "JOB_STARTED"
  | "JOB_COMPLETED"
  | "JOB_CANCELLED"
  | "JOB_EXPIRED"
  | "RATING_ADDED"
  | "MESSAGE_SENT";

export interface JobEvent {
  id: string;
  jobId: string;
  type: JobEventType;
  actorId?: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface SmsLog {
  id: string;
  to: string;
  template: string;
  payload: Record<string, unknown>;
  providerId?: string;
  status: "QUEUED" | "SENT" | "FAILED";
  attempts: number;
  error?: string;
  createdAt: string;
}

export interface ScoredWorker {
  workerId: string;
  score: number;
  distanceKm: number;
  skillCoverage: number;
}

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | {
      ok: false;
      code: "VALIDATION" | "FORBIDDEN" | "CONFLICT" | "EXPIRED" | "NETWORK";
      message: string;
    };
