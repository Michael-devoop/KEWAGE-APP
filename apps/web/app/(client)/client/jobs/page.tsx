import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Briefcase } from "lucide-react";
import { listJobsByClient } from "@skillconnect/api";
import { getSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { JobCard } from "@/components/jobs/job-card";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";

export default async function ClientJobsPage() {
  const session = await getSession();
  const t = await getTranslations("jobs");
  const jobs = session ? listJobsByClient(session.userId) : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        description={
          jobs.length > 0
            ? `${jobs.length} job${jobs.length === 1 ? "" : "s"} · track every request in one place`
            : "Post a job and we will find the right worker for you."
        }
        action={
          <Button asChild size="sm">
            <Link href="/client/jobs/new">{t("newTitle")}</Link>
          </Button>
        }
      />

      {jobs.length === 0 ? (
        <EmptyState
          icon={<Briefcase />}
          title={t("empty")}
          description="Describe the work once — matching and offers happen automatically."
          action={
            <Button asChild size="sm">
              <Link href="/client/jobs/new">{t("submit")}</Link>
            </Button>
          }
        />
      ) : (
        <ul className="stagger-list grid gap-3">
          {jobs.map((job) => (
            <li key={job.id}>
              <JobCard job={job} href={`/client/jobs/${job.id}`} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
