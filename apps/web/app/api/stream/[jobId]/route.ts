import { ApiError, expireOverdueOffers, getBus, getJob, jobChannel } from "@skillconnect/api";
import { fail, requireSession } from "@/lib/http";
import type { JobEvent } from "@skillconnect/domain";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const session = await requireSession();
    const { jobId } = await params;
    const job = getJob(jobId);
    if (!job) throw new ApiError(404, "NOT_FOUND", "Job not found");
    if (job.clientId !== session.userId && job.assignedWorkerId !== session.userId) {
      throw new ApiError(403, "FORBIDDEN", "You are not part of this job");
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        const send = (event: JobEvent) => {
          controller.enqueue(encoder.encode(`event: job\ndata: ${JSON.stringify(event)}\n\n`));
        };

        const bus = getBus();
        bus.on(jobChannel(jobId), send);

        const heartbeat = setInterval(() => {
          controller.enqueue(encoder.encode(`: ping ${Date.now()}\n\n`));
        }, 25_000);

        const sweep = setInterval(() => {
          void expireOverdueOffers();
        }, 30_000);

        const close = () => {
          clearInterval(heartbeat);
          clearInterval(sweep);
          bus.off(jobChannel(jobId), send);
          try {
            controller.close();
          } catch {
            // Already closed.
          }
        };

        request.signal.addEventListener("abort", close);
      },
    });

    return new Response(stream, {
      headers: {
        "content-type": "text/event-stream; charset=utf-8",
        "cache-control": "no-cache, no-transform",
        connection: "keep-alive",
      },
    });
  } catch (error) {
    return fail(error);
  }
}
