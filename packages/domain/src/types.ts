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

export interface Location {
  lat: number;
  lng: number;
  label: string;
}

export interface Skill {
  id: string;
  name: string;
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
  title: string;
  description: string;
  skills: string[];
  location: Location;
  status: JobStatus;
  createdAt: string;
  rated: boolean;
  worker?: WorkerCard;
}

export interface Offer {
  token: string;
  status: OfferStatus;
  summary: { title: string; skill: string; area: string; distanceKm: number };
  expiresAt: string; // ISO time
  serverNow: string; // ISO time on the server when the offer was read
}

export interface Message {
  id: string;
  clientId: string; // made in the browser, used to avoid duplicates
  jobId: string;
  senderRole: Role;
  text: string;
  sentAt: string;
}

export interface Session {
  userId: string;
  role: Role;
  firstName: string;
}

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | {
      ok: false;
      code: "VALIDATION" | "FORBIDDEN" | "CONFLICT" | "EXPIRED" | "NETWORK";
      message: string;
    };
