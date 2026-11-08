import Link from "next/link";
import { MapPin, Wrench } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { skillName, type Job } from "@skillconnect/domain";
import { StatusBadge } from "./status-badge";
import { timeAgo } from "@/lib/format";

export async function JobCard({ job, href }: { job: Job; href: string }) {
  const t = await getTranslations("jobs");

  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-border/70 bg-card p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lift focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold leading-snug group-hover:text-primary">{job.title}</h3>
        <StatusBadge status={job.status} />
      </div>

      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{job.description}</p>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border/60 pt-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Wrench className="size-3.5 text-primary" aria-hidden />
          {job.skills.map((skill) => skillName(skill)).join(", ")}
        </span>
        <span className="inline-flex items-center gap-1">
          <MapPin className="size-3.5 text-primary" aria-hidden />
          {job.location.label}
        </span>
        <span className="ml-auto">
          {t("posted")} {timeAgo(job.createdAt)}
        </span>
      </div>
    </Link>
  );
}
