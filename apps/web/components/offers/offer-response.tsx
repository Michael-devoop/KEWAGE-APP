"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { Job, Offer } from "@skillconnect/domain";
import { apiFetch, ApiClientError } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { formatDistance } from "@/lib/format";
import { cn } from "@/lib/utils";

function useCountdown(expiresAt: string, serverNow: string) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, new Date(expiresAt).getTime() - new Date(serverNow).getTime()),
  );

  useEffect(() => {
    const offset = new Date(serverNow).getTime() - Date.now();
    const tick = () =>
      setRemaining(Math.max(0, new Date(expiresAt).getTime() - Date.now() - offset));
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [expiresAt, serverNow]);

  return remaining;
}

export function OfferResponse({ token, offer, job }: { token: string; offer: Offer; job: Job }) {
  const t = useTranslations("offer");
  const [status, setStatus] = useState(offer.status);
  const [pending, setPending] = useState<"accept" | "reject" | null>(null);
  const remaining = useCountdown(offer.expiresAt, offer.serverNow);
  const expired = status === "PENDING" && remaining <= 0;

  async function respond(decision: "accept" | "reject") {
    setPending(decision);
    try {
      const result = await apiFetch<{ offer: Offer }>(`/api/offers/${token}/respond`, {
        method: "POST",
        body: JSON.stringify({ decision }),
      });
      setStatus(result.offer.status);
      toast.success(decision === "accept" ? t("accepted") : t("rejected"));
    } catch (error) {
      toast.error(error instanceof ApiClientError ? error.message : "Could not respond");
    } finally {
      setPending(null);
    }
  }

  const total = Math.max(1, new Date(offer.expiresAt).getTime() - new Date(offer.sentAt ?? offer.serverNow).getTime());
  const progress = Math.max(0, Math.min(1, remaining / total));
  const minutes = Math.floor(remaining / 60_000);
  const seconds = Math.floor((remaining % 60_000) / 1000);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div
          className="relative grid size-20 shrink-0 place-items-center rounded-full"
          style={{
            background: `conic-gradient(var(--color-status-searching) ${progress * 360}deg, var(--muted) 0deg)`,
          }}
          role="timer"
          aria-live="off"
          aria-label={`${t("expiresIn")} ${minutes}:${String(seconds).padStart(2, "0")}`}
        >
          <div className="grid size-[68px] place-items-center rounded-full bg-card text-center">
            <div>
              <p className="font-mono text-lg font-semibold leading-none tabular-nums">
                {minutes}:{String(seconds).padStart(2, "0")}
              </p>
              <p className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                {t("expiresIn")}
              </p>
            </div>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          <p>{formatDistance(offer.summary.distanceKm)} {t("distance")}</p>
          <p className="mt-1 text-xs">{t("deadlineNote")}</p>
        </div>
      </div>

      <dl className="grid gap-3 rounded-xl border border-border/70 bg-card p-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Job</dt>
          <dd className="mt-0.5 text-sm font-medium">{job.title}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Skill</dt>
          <dd className="mt-0.5 text-sm font-medium">{offer.summary.skill}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Details</dt>
          <dd className="mt-0.5 text-sm">{job.description}</dd>
        </div>
      </dl>

      {status === "PENDING" && !expired ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <Button size="lg" onClick={() => respond("accept")} disabled={pending !== null}>
            {pending === "accept" ? "…" : t("accept")}
          </Button>
          <Button size="lg" variant="outline" onClick={() => respond("reject")} disabled={pending !== null}>
            {pending === "reject" ? "…" : t("reject")}
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            "rounded-xl border p-4 text-sm",
            status === "ACCEPTED"
              ? "border-status-completed/40 bg-status-completed/10 text-status-completed"
              : "border-border bg-muted/40 text-muted-foreground",
          )}
        >
          {status === "ACCEPTED"
            ? t("accepted")
            : status === "REJECTED"
              ? t("rejected")
              : t("expired")}
        </div>
      )}
    </div>
  );
}
