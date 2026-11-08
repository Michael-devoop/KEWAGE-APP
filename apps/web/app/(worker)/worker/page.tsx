import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Briefcase, CheckCircle2, Inbox, Star, TrendingUp } from "lucide-react";
import { getProfile, listJobsByWorker, listOffersByWorker } from "@skillconnect/api";
import { skillName } from "@skillconnect/domain";
import { getSession } from "@/lib/session";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/jobs/status-badge";
import { AvailabilityToggle } from "@/components/worker/availability-toggle";
import { OfferBadge } from "@/components/offers/offer-badge";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { formatDistance, timeAgo } from "@/lib/format";

export default async function WorkerHomePage() {
  const session = await getSession();
  const t = await getTranslations("worker");
  const profile = session ? getProfile(session.userId) : undefined;
  const offers = session ? listOffersByWorker(session.userId) : [];
  const jobs = session ? listJobsByWorker(session.userId) : [];
  const pending = offers.filter((offer) => offer.status === "PENDING" && offer.sentAt);

  if (!profile) {
    return (
      <EmptyState
        icon={<Briefcase />}
        title="Finish your profile to start receiving offers."
        description="Add your skills, experience and location so matching can find you."
        action={
          <Button asChild size="sm">
            <Link href="/worker/profile">{t("profileTitle")}</Link>
          </Button>
        }
      />
    );
  }

  const stats = [
    {
      label: "Rating",
      value: profile.ratingAvg.toFixed(1),
      hint: `${profile.ratingCount} ratings`,
      icon: Star,
    },
    {
      label: "Completed",
      value: String(profile.completedJobs),
      hint: "jobs finished",
      icon: CheckCircle2,
    },
    {
      label: "Open offers",
      value: String(pending.length),
      hint: pending.length === 1 ? "awaiting reply" : "awaiting replies",
      icon: Inbox,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hi ${session?.firstName ?? ""}`}
        description={
          <span className="flex items-center gap-1.5">
            <TrendingUp className="size-4 text-primary" aria-hidden />
            {profile.skills.length > 0
              ? `${profile.skills.length} skills · ${profile.experienceYears} yrs experience`
              : "Add skills to unlock more matches"}
          </span>
        }
      />

      <div className="stagger-list grid grid-cols-3 gap-2 sm:gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} size="sm" className="shadow-soft">
              <CardContent className="space-y-1 p-3.5">
                <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  <Icon className="size-3.5 text-primary" aria-hidden />
                  {stat.label}
                </span>
                <p className="font-mono text-xl font-semibold leading-none tracking-tight">{stat.value}</p>
                <p className="text-[11px] text-muted-foreground">{stat.hint}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AvailabilityToggle initial={profile.availableNow} />

      {profile.skills.length === 0 && (
        <div className="rounded-2xl border border-status-searching/35 bg-status-searching/10 p-4 text-sm">
          Add your skills so matching can find you.{" "}
          <Link
            href="/worker/profile"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Complete profile
          </Link>
        </div>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold">
            <Inbox className="size-4 text-status-searching" aria-hidden />
            {t("offers")}
          </h2>
          {pending.length > 0 ? (
            <span className="rounded-full bg-status-searching/15 px-2 py-0.5 text-[11px] font-medium text-status-searching">
              {pending.length} live
            </span>
          ) : null}
        </div>

        {pending.length === 0 ? (
          <EmptyState
            icon={<Inbox />}
            title={t("noOffers")}
            description="Keep your availability on and we will text you when a matching job appears."
            className="py-8"
          />
        ) : (
          <ul className="stagger-list grid gap-3">
            {pending.map((offer) => (
              <li key={offer.id}>
                <Link
                  href={`/o/${offer.token}`}
                  className="group block rounded-2xl border border-status-searching/40 bg-status-searching/5 p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:border-status-searching/60 hover:bg-status-searching/10 hover:shadow-lift focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold group-hover:text-status-searching">
                        {offer.summary.title}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {offer.summary.skill} · {offer.summary.area} ·{" "}
                        {formatDistance(offer.summary.distanceKm)}
                        {offer.sentAt ? ` · ${timeAgo(offer.sentAt)}` : ""}
                      </p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-status-searching/15 px-2 py-1 text-xs font-medium text-status-searching">
                      View <ArrowRight className="size-3.5" aria-hidden />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold">
          <Briefcase className="size-4 text-primary" aria-hidden />
          {t("assigned")}
        </h2>
        {jobs.length === 0 ? (
          <EmptyState
            icon={<Briefcase />}
            title="Assigned jobs will appear here."
            description="Accept an offer to start a job and chat with the client."
            className="py-8"
          />
        ) : (
          <ul className="stagger-list grid gap-3">
            {jobs.map((job) => (
              <li key={job.id}>
                <Link
                  href={`/worker/jobs/${job.id}`}
                  className="block rounded-2xl border border-border/70 bg-card p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lift focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold">{job.title}</p>
                    <StatusBadge status={job.status} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {job.skills.map((skill) => skillName(skill)).join(", ")} · {job.location.label}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {offers.some((offer) => offer.status !== "PENDING") && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold">Recent offers</h2>
          <Card className="shadow-soft">
            <CardContent className="divide-y divide-border/60 p-4">
              {offers
                .filter((offer) => offer.status !== "PENDING")
                .slice(0, 5)
                .map((offer) => (
                  <div key={offer.id} className="flex items-center justify-between gap-3 py-2 text-xs first:pt-0 last:pb-0">
                    <span className="truncate">{offer.summary.title}</span>
                    <OfferBadge status={offer.status} />
                  </div>
                ))}
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
