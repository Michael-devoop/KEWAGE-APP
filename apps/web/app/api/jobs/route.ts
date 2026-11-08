import { jobSchema, SKILLS } from "@skillconnect/domain";
import {
  ApiError,
  addEvent,
  listJobsByClient,
  saveJob,
  startSearch,
} from "@skillconnect/api";
import { nextId, nowIso, publishJobEvent } from "@skillconnect/api";
import { fail, ok, parseBody, requireRole } from "@/lib/http";

export async function GET() {
  try {
    const session = await requireRole("client");
    return ok(listJobsByClient(session.userId));
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireRole("client");
    const input = parseBody(jobSchema, await request.json());

    const known = new Set(SKILLS.map((skill) => skill.id));
    if (input.skills.some((skill) => !known.has(skill))) {
      throw new ApiError(400, "VALIDATION", "Unknown skill selected");
    }

    const now = nowIso();
    const job = saveJob({
      id: nextId("job"),
      clientId: session.userId,
      title: input.title,
      description: input.description,
      skills: input.skills,
      location: input.location,
      status: "SEARCHING",
      createdAt: now,
      updatedAt: now,
      rated: false,
    });

    publishJobEvent(addEvent(job.id, "JOB_CREATED", { title: job.title }, session.userId));
    await startSearch(job.id);

    return ok(job, 201);
  } catch (error) {
    return fail(error);
  }
}
