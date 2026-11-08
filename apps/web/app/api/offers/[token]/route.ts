import { ApiError, expireOverdueOffers, getJob, getOfferByToken, saveOffer } from "@skillconnect/api";
import { nowIso } from "@skillconnect/api";
import { fail, ok } from "@/lib/http";

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    let offer = getOfferByToken(token);
    if (!offer) throw new ApiError(404, "NOT_FOUND", "Offer not found");

    if (offer.status === "PENDING" && offer.sentAt && new Date(offer.expiresAt).getTime() <= Date.now()) {
      await expireOverdueOffers();
      offer = getOfferByToken(token);
      if (!offer) throw new ApiError(404, "NOT_FOUND", "Offer not found");
    }

    const job = getJob(offer.jobId);
    if (!job) throw new ApiError(404, "NOT_FOUND", "Job not found");

    offer.serverNow = nowIso();
    saveOffer(offer);

    return ok({
      offer,
      job: {
        id: job.id,
        title: job.title,
        description: job.description,
        skills: job.skills,
        location: job.location,
        status: job.status,
      },
    });
  } catch (error) {
    return fail(error);
  }
}
