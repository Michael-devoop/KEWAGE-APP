import { profileSchema } from "@skillconnect/domain";
import { ApiError, getProfile, saveProfile } from "@skillconnect/api";
import { nowIso } from "@skillconnect/api";
import { fail, ok, parseBody, requireRole } from "@/lib/http";

export async function GET() {
  try {
    const session = await requireRole("worker");
    const profile = getProfile(session.userId);
    if (!profile) throw new ApiError(404, "NOT_FOUND", "Worker profile not found");
    return ok(profile);
  } catch (error) {
    return fail(error);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireRole("worker");
    const input = parseBody(profileSchema, await request.json());

    const existing = getProfile(session.userId);
    if (!existing) throw new ApiError(404, "NOT_FOUND", "Worker profile not found");

    const profile = saveProfile({
      ...existing,
      skills: input.skills,
      experienceYears: input.experienceYears,
      about: input.about,
      location: input.location,
      lastActiveAt: nowIso(),
    });

    return ok(profile);
  } catch (error) {
    return fail(error);
  }
}
