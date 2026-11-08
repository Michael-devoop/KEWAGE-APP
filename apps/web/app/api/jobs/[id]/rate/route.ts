import { canPerform, ratingSchema } from "@skillconnect/domain";
import {
  ApiError,
  addEvent,
  addRating,
  getJob,
  getProfile,
  listRatingsForWorker,
  publishJobEvent,
  saveJob,
  saveProfile,
} from "@skillconnect/api";
import { nextId, nowIso } from "@skillconnect/api";
import { fail, ok, parseBody, requireRole } from "@/lib/http";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole("client");
    const { id } = await params;
    const input = parseBody(ratingSchema, await request.json());

    const job = getJob(id);
    if (!job) throw new ApiError(404, "NOT_FOUND", "Job not found");
    if (job.clientId !== session.userId) throw new ApiError(403, "FORBIDDEN", "Not your job");
    if (!canPerform("rate", job.status, "client")) {
      throw new ApiError(409, "CONFLICT", "Only completed jobs can be rated");
    }
    if (job.rated) throw new ApiError(409, "CONFLICT", "This job has already been rated");
    if (!job.assignedWorkerId) throw new ApiError(409, "CONFLICT", "No worker to rate");

    const rating = addRating({
      id: nextId("rating"),
      jobId: job.id,
      workerId: job.assignedWorkerId,
      stars: input.stars,
      comment: input.comment,
      createdAt: nowIso(),
    });

    job.rated = true;
    job.updatedAt = nowIso();
    saveJob(job);

    const profile = getProfile(job.assignedWorkerId);
    if (profile) {
      const ratings = listRatingsForWorker(job.assignedWorkerId);
      profile.ratingCount = ratings.length;
      profile.ratingAvg = ratings.reduce((sum, item) => sum + item.stars, 0) / ratings.length;
      saveProfile(profile);
    }

    publishJobEvent(addEvent(job.id, "RATING_ADDED", { stars: rating.stars }, session.userId));
    return ok(rating, 201);
  } catch (error) {
    return fail(error);
  }
}
