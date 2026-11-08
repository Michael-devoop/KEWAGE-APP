import { canPerform } from "@skillconnect/domain";
import {
  ApiError,
  addEvent,
  getJob,
  getProfile,
  publishJobEvent,
  saveJob,
  saveProfile,
} from "@skillconnect/api";
import { nowIso } from "@skillconnect/api";
import { fail, ok, requireRole } from "@/lib/http";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole("worker");
    const { id } = await params;
    const job = getJob(id);
    if (!job) throw new ApiError(404, "NOT_FOUND", "Job not found");
    if (job.assignedWorkerId !== session.userId) {
      throw new ApiError(403, "FORBIDDEN", "This job is not assigned to you");
    }
    if (!canPerform("complete", job.status, "worker")) {
      throw new ApiError(409, "CONFLICT", "This job cannot be completed right now");
    }

    job.status = "COMPLETED";
    job.updatedAt = nowIso();
    saveJob(job);

    const profile = getProfile(session.userId);
    if (profile) {
      profile.completedJobs += 1;
      profile.lastActiveAt = nowIso();
      saveProfile(profile);
    }

    publishJobEvent(addEvent(job.id, "JOB_COMPLETED", {}, session.userId));
    return ok(job);
  } catch (error) {
    return fail(error);
  }
}
