import { ApiError } from "@skillconnect/api";
import { respondToOffer } from "@skillconnect/api";
import { fail, ok } from "@/lib/http";

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const body = (await request.json().catch(() => null)) as { decision?: string } | null;
    if (body?.decision !== "accept" && body?.decision !== "reject") {
      throw new ApiError(400, "VALIDATION", "decision must be accept or reject");
    }

    const result = await respondToOffer(token, body.decision);
    return ok({ offer: result.offer, job: result.job });
  } catch (error) {
    return fail(error);
  }
}
