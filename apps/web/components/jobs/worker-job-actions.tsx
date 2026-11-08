"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { canComplete, canStart, type JobStatus } from "@skillconnect/domain";
import { apiFetch, ApiClientError } from "@/lib/client-api";
import { Button } from "@/components/ui/button";

export function WorkerJobActions({ jobId, status }: { jobId: string; status: JobStatus }) {
  const t = useTranslations("jobs");
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function act(action: "start" | "complete") {
    setPending(true);
    try {
      await apiFetch(`/api/jobs/${jobId}/${action}`, { method: "POST" });
      toast.success(action === "start" ? "Work started" : "Job completed");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof ApiClientError ? error.message : "Could not update job");
    } finally {
      setPending(false);
    }
  }

  if (canStart(status)) {
    return (
      <Button onClick={() => act("start")} disabled={pending} className="w-full sm:w-auto">
        {t("start")}
      </Button>
    );
  }

  if (canComplete(status)) {
    return (
      <Button onClick={() => act("complete")} disabled={pending} className="w-full sm:w-auto">
        {t("complete")}
      </Button>
    );
  }

  return null;
}
