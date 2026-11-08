import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Activity, MapPin, Star, Users, Wrench } from "lucide-react";
import {
  getUserById,
  listEvents,
  listMessages,
  listOffersByJob,
  getJob,
} from "@skillconnect/api";
import { canChat, skillName } from "@skillconnect/domain";
import { getSession } from "@/lib/session";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/jobs/status-badge";
import { JobActions } from "@/components/jobs/job-actions";
import { ChatThread } from "@/components/chat/chat-thread";
import { OfferBadge } from "@/components/offers/offer-badge";
import { PageHeader } from "@/components/layout/page-header";
import { formatDistance, initials, timeAgo } from "@/lib/format";

export default async function ClientJobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const job = getJob(id);
  if (!job || !session || job.clientId !== session.userId) notFound();

  const t = await getTranslations("jobs");
  const messages = listMessages(id);
  const offers = listOffersByJob(id).sort((a, b) => a.rank - b.rank);
  const events = listEvents(id);
  const worker = job.assignedWorkerId ? getUserById(job.assignedWorkerId) : undefined;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/client/jobs"
          className="mb-2 inline-flex items-center gap-1 rounded-full text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
        >
          ← {t("title")}
        </Link>
        <PageHeader
          title={job.title}
          description={
            <span className="flex flex-wrap items-center gap-2.5">
              <StatusBadge status={job.status} />
              <span>{timeAgo(job.createdAt)}</span>
            </span>
          }
          action={<JobActions jobId={job.id} status={job.status} rated={job.rated} />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <Card className="shadow-soft">
            <CardContent className="space-y-4 p-5">
              <p className="text-sm leading-relaxed">{job.description}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Wrench className="size-3.5 text-primary" aria-hidden />
                  {job.skills.map((skill) => skillName(skill)).join(", ")}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5 text-primary" aria-hidden />
                  {job.location.label}
                </span>
              </div>
            </CardContent>
          </Card>

          {canChat(job.status) && (
            <ChatThread
              jobId={job.id}
              initialMessages={messages}
              currentUserId={session.userId}
              canWrite
            />
          )}
        </div>

        <div className="space-y-4">
          <Card className="shadow-soft">
            <CardContent className="space-y-3 p-5">
              <h2 className="flex items-center gap-1.5 text-sm font-semibold">
                <Users className="size-4 text-primary" aria-hidden />
                {t("worker")}
              </h2>
              {worker ? (
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {initials(worker.name)}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{worker.name}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="size-3.5 fill-status-searching text-status-searching" aria-hidden />
                      {job.worker?.ratingAvg?.toFixed(1) ?? "—"} · {job.worker?.ratingCount ?? 0} ratings
                    </p>
                  </div>
                </div>
              ) : job.status === "SEARCHING" ? (
                <p className="text-sm text-muted-foreground">{t("noWorker")}</p>
              ) : (
                <p className="text-sm text-muted-foreground">—</p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardContent className="space-y-2.5 p-5">
              <h2 className="text-sm font-semibold">Offer queue</h2>
              {offers.length === 0 ? (
                <p className="text-xs text-muted-foreground">No offers sent yet.</p>
              ) : (
                <ul className="divide-y divide-border/60">
                  {offers.map((offer) => {
                    const offered = getUserById(offer.workerId);
                    return (
                      <li key={offer.id} className="flex items-center justify-between gap-3 py-2 text-xs">
                        <span className="truncate">
                          <span className="mr-1.5 font-mono text-muted-foreground">#{offer.rank}</span>
                          {offered?.name ?? offer.workerId}
                          <span className="ml-1.5 text-muted-foreground">
                            {formatDistance(offer.summary.distanceKm)}
                          </span>
                        </span>
                        <OfferBadge status={offer.status} />
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardContent className="space-y-2.5 p-5">
              <h2 className="flex items-center gap-1.5 text-sm font-semibold">
                <Activity className="size-4 text-primary" aria-hidden />
                Activity
              </h2>
              <ul className="space-y-2">
                {events.slice(-6).map((event) => (
                  <li key={event.id} className="flex items-baseline gap-2 text-xs">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary/60" aria-hidden />
                    <span className="font-mono text-muted-foreground">
                      {event.type.replaceAll("_", " ").toLowerCase()}
                    </span>
                    <span className="ml-auto shrink-0 text-muted-foreground">{timeAgo(event.createdAt)}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
