import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Clock } from "lucide-react";
import { expireOverdueOffers, getJob, getOfferByToken, saveOffer } from "@skillconnect/api";
import { nowIso } from "@skillconnect/api";
import { OfferResponse } from "@/components/offers/offer-response";
import { Logo } from "@/components/layout/logo";
import { Card, CardContent } from "@/components/ui/card";

export default async function OfferPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  let offer = getOfferByToken(token);
  if (!offer) notFound();

  await expireOverdueOffers();
  offer = getOfferByToken(token);
  if (!offer) notFound();

  const job = getJob(offer.jobId);
  if (!job) notFound();

  offer.serverNow = nowIso();
  saveOffer(offer);

  const t = await getTranslations("offer");

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-status-searching/10 to-transparent"
        aria-hidden
      />

      <div className="relative w-full max-w-lg animate-fade-up">
        <header className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Logo className="size-9 shadow-soft" />
            <div>
              <p className="text-sm font-semibold leading-tight">SkillConnect</p>
              <p className="text-xs text-muted-foreground">{t("title")}</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-status-searching/30 bg-status-searching/10 px-2.5 py-1 text-[11px] font-medium text-status-searching">
            <Clock className="size-3" aria-hidden />
            Time-limited
          </span>
        </header>

        <Card className="shadow-lift">
          <CardContent className="p-6">
            <OfferResponse token={token} offer={offer} job={job} />
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          First worker to accept gets the job. This link belongs to you — do not forward it.
        </p>
      </div>
    </div>
  );
}
