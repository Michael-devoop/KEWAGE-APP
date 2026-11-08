import { canPerform } from "@skillconnect/domain";
import { ApiError, addEvent, getJob, publishJobEvent, saveJob } from "@skillconnect/api";
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
    if (!canPerform("start", job.status, "worker")) {
      throw new ApiError(409, "CONFLICT", "This job cannot be started right now");
    }

    job.status = "IN_PROGRESS";
    job.updatedAt = nowIso();
    saveJob(job);
    publishJobEvent(addEvent(job.id, "JOB_STARTED", {}, session.userId));
    return ok(job);
  } catch (error) {
    return fail(error);
  }
}
