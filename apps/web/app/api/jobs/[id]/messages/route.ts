import { canChat, messageSchema } from "@skillconnect/domain";
import {
  ApiError,
  addEvent,
  addMessage,
  getJob,
  listMessages,
  publishJobEvent,
} from "@skillconnect/api";
import { nextId, nowIso } from "@skillconnect/api";
import { fail, ok, parseBody, requireSession } from "@/lib/http";

function assertParticipant(jobId: string, userId: string) {
  const job = getJob(jobId);
  if (!job) throw new ApiError(404, "NOT_FOUND", "Job not found");
  if (job.clientId !== userId && job.assignedWorkerId !== userId) {
    throw new ApiError(403, "FORBIDDEN", "You are not part of this job");
  }
  return job;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const { id } = await params;
    assertParticipant(id, session.userId);
    return ok(listMessages(id));
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const job = assertParticipant(id, session.userId);
    if (!canChat(job.status)) {
      throw new ApiError(409, "CONFLICT", "Chat opens once a worker is assigned");
    }

    const input = parseBody(messageSchema, await request.json());
    const message = addMessage({
      id: nextId("msg"),
      clientId: nextId("local"),
      jobId: id,
      senderId: session.userId,
      senderRole: session.role,
      text: input.text,
      sentAt: nowIso(),
    });

    publishJobEvent(addEvent(id, "MESSAGE_SENT", { messageId: message.id }, session.userId));
    return ok(message, 201);
  } catch (error) {
    return fail(error);
  }
}
