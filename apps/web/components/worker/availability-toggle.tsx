"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { WorkerProfile } from "@skillconnect/domain";
import { apiFetch, ApiClientError } from "@/lib/client-api";
import { cn } from "@/lib/utils";

export function AvailabilityToggle({ initial }: { initial: boolean }) {
  const t = useTranslations("worker");
  const router = useRouter();
  const [available, setAvailable] = useState(initial);
  const [pending, setPending] = useState(false);

  async function toggle() {
    const next = !available;
    setPending(true);
    try {
      const profile = await apiFetch<WorkerProfile>("/api/worker/availability", {
        method: "PATCH",
        body: JSON.stringify({ availableNow: next }),
      });
      setAvailable(profile.availableNow);
      toast.success(profile.availableNow ? "You are available" : "You are offline");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof ApiClientError ? error.message : "Could not update availability");
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={available}
      onClick={toggle}
      disabled={pending}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-2xl border p-4 text-left shadow-soft transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
        available
          ? "border-status-completed/40 bg-status-completed/10"
          : "border-border bg-card hover:border-primary/30",
      )}
    >
      <span>
        <span className="block text-sm font-semibold">{t("availableToggle")}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {available ? "You can receive job offers" : "You will not receive offers"}
        </span>
      </span>
      <span
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          available ? "bg-status-completed" : "bg-muted-foreground/30",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-5 rounded-full bg-white shadow-md transition-all duration-200",
            available ? "left-[22px]" : "left-0.5",
          )}
        />
      </span>
    </button>
  );
}
