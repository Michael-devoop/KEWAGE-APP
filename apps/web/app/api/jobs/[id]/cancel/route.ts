import { canPerform } from "@skillconnect/domain";
import {
  ApiError,
  addEvent,
  getJob,
  listOffersByJob,
  publishJobEvent,
  saveJob,
  saveOffer,
} from "@skillconnect/api";
import { nowIso } from "@skillconnect/api";
import { fail, ok, requireRole } from "@/lib/http";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole("client");
    const { id } = await params;
    const job = getJob(id);
    if (!job) throw new ApiError(404, "NOT_FOUND", "Job not found");
    if (job.clientId !== session.userId) throw new ApiError(403, "FORBIDDEN", "Not your job");
    if (!canPerform("cancel", job.status, "client")) {
      throw new ApiError(409, "CONFLICT", `Cannot cancel a job that is ${job.status.toLowerCase()}`);
    }

    const body = await _request.json().catch(() => ({}));
    job.status = "CANCELLED";
    job.cancelledBy = "client";
    job.cancelReason = typeof body?.reason === "string" ? body.reason.slice(0, 300) : undefined;
    job.updatedAt = nowIso();
    saveJob(job);

    for (const offer of listOffersByJob(job.id)) {
      if (offer.status === "PENDING") {
        offer.status = "CLOSED";
        offer.respondedAt = nowIso();
        saveOffer(offer);
      }
    }

    publishJobEvent(addEvent(job.id, "JOB_CANCELLED", { by: "client" }, session.userId));
    return ok(job);
  } catch (error) {
    return fail(error);
  }
}
