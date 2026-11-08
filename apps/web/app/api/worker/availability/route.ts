import { ApiError, getProfile, saveProfile } from "@skillconnect/api";
import { nowIso } from "@skillconnect/api";
import { fail, ok, requireRole } from "@/lib/http";

export async function PATCH(request: Request) {
  try {
    const session = await requireRole("worker");
    const body = (await request.json().catch(() => null)) as { availableNow?: unknown } | null;
    if (typeof body?.availableNow !== "boolean") {
      throw new ApiError(400, "VALIDATION", "availableNow must be a boolean");
    }

    const profile = getProfile(session.userId);
    if (!profile) throw new ApiError(404, "NOT_FOUND", "Worker profile not found");

    profile.availableNow = body.availableNow;
    profile.lastActiveAt = nowIso();
    saveProfile(profile);

    return ok(profile);
  } catch (error) {
    return fail(error);
  }
}
