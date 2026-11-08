"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { canCancel, canRate, type JobStatus } from "@skillconnect/domain";
import { apiFetch, ApiClientError } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function JobActions({ jobId, status, rated }: { jobId: string; status: JobStatus; rated: boolean }) {
  const t = useTranslations("jobs");
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");

  async function cancel() {
    if (!window.confirm(t("cancelConfirm"))) return;
    setPending(true);
    try {
      await apiFetch(`/api/jobs/${jobId}/cancel`, { method: "POST", body: JSON.stringify({}) });
      toast.success("Job cancelled");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof ApiClientError ? error.message : "Could not cancel");
    } finally {
      setPending(false);
    }
  }

  async function rate() {
    if (stars < 1) {
      toast.error("Choose 1 to 5 stars");
      return;
    }
    setPending(true);
    try {
      await apiFetch(`/api/jobs/${jobId}/rate`, {
        method: "POST",
        body: JSON.stringify({ stars, comment: comment || undefined }),
      });
      toast.success("Thanks for the rating");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof ApiClientError ? error.message : "Could not save rating");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4">
      {canCancel(status) && (
        <Button variant="outline" size="sm" onClick={cancel} disabled={pending}>
          {t("cancel")}
        </Button>
      )}

      {canRate(status) && !rated && (
        <div className="rounded-xl border border-border/70 bg-card p-4">
          <p className="text-sm font-medium">{t("rate")}</p>
          <div className="mt-2 flex gap-1" role="radiogroup" aria-label={t("rate")}>
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={stars === value}
                onClick={() => setStars(value)}
                className="rounded p-1 focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Star
                  className={value <= stars ? "size-6 fill-status-searching text-status-searching" : "size-6 text-muted-foreground"}
                />
              </button>
            ))}
          </div>
          <Textarea
            className="mt-3"
            rows={2}
            placeholder="Optional comment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />
          <Button className="mt-3" size="sm" onClick={rate} disabled={pending}>
            {t("rate")}
          </Button>
        </div>
      )}

      {canRate(status) && rated && (
        <p className="text-xs text-muted-foreground">{t("rated")}</p>
      )}
    </div>
  );
}
