import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  ArrowRight,
  BadgeCheck,
  Clock,
  ClipboardList,
  MapPin,
  Radar,
  Sparkles,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/layout/logo";
import { SkillMarquee } from "@/components/marketing/skill-marquee";
import { cn } from "@/lib/utils";

const avatars = [
  { initials: "DA", className: "bg-primary/10 text-primary" },
  { initials: "HN", className: "bg-status-searching/20 text-status-searching" },
  { initials: "SM", className: "bg-status-assigned/20 text-status-assigned" },
  { initials: "YI", className: "bg-status-progress/20 text-status-progress" },
];

const steps = [
  {
    icon: ClipboardList,
    title: "Describe the work",
    body: "Pick the skills and drop a pin on the map. No phone calls needed.",
  },
  {
    icon: Radar,
    title: "We match nearby workers",
    body: "Skills, distance, rating and responsiveness decide who gets the offer first.",
  },
  {
    icon: BadgeCheck,
    title: "Track to completion",
    body: "Chat, start, finish and rate — one clear trail from request to done.",
  },
];

export default async function HomePage() {
  const t = await getTranslations("app");

  return (
    <div className="space-y-16 pb-6">
      <section className="relative -mx-4 overflow-hidden px-4 pb-2 pt-10 sm:pt-14">
        <div
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[26rem] w-[46rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-24 top-40 -z-10 size-72 rounded-full bg-accent/60 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-24 top-24 -z-10 size-72 rounded-full bg-status-assigned/10 blur-3xl"
          aria-hidden
        />

        <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/80 py-1 pl-1 pr-3 text-xs font-medium shadow-soft backdrop-blur animate-fade-up">
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-primary-foreground">
              New
            </span>
            Verified workers across Addis Ababa
          </span>

          <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl animate-fade-up [animation-delay:60ms]">
            {t("tagline")}
          </h1>

          <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg animate-fade-up [animation-delay:120ms]">
            {t("intro")}
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3 animate-fade-up [animation-delay:180ms]">
            <Button asChild size="lg" className="rounded-full shadow-soft">
              <Link href="/register">
                {t("ctaClient")}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full bg-card/70">
              <Link href="/register">{t("ctaWorker")}</Link>
            </Button>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground animate-fade-up [animation-delay:240ms]">
            <div className="flex -space-x-2.5">
              {avatars.map((person) => (
                <span
                  key={person.initials}
                  className={cn(
                    "grid size-9 place-items-center rounded-full border-2 border-card text-[11px] font-semibold shadow-soft",
                    person.className,
                  )}
                >
                  {person.initials}
                </span>
              ))}
              <span className="grid size-9 place-items-center rounded-full border-2 border-card bg-muted text-[11px] font-semibold text-muted-foreground shadow-soft">
                +3
              </span>
            </div>
            <span className="flex items-center gap-1.5">
              <span className="flex items-center gap-0.5 text-status-searching" aria-hidden>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="size-3.5 fill-current" />
                ))}
              </span>
              4.8 average · trusted local workers
            </span>
          </div>
        </div>

        <div className="relative mx-auto mt-10 max-w-md animate-fade-up [animation-delay:300ms]">
          <div className="absolute -inset-5 -z-10 rounded-[2.5rem] bg-primary/5 blur-2xl" aria-hidden />

          <div className="rounded-[2rem] border border-border/60 bg-card/70 p-2.5 shadow-lift backdrop-blur">
            <Card className="gap-0 border-border/70 shadow-none">
              <CardContent className="space-y-4 p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <Logo className="size-10" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">Job offer · Plumbing</p>
                    <p className="text-xs text-muted-foreground">Ranked by skill and distance</p>
                  </div>
                  <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-status-searching/15 px-2 py-1 text-[11px] font-medium text-status-searching ring-1 ring-inset ring-status-searching/25">
                    <span className="size-1.5 rounded-full bg-current animate-soft-pulse" aria-hidden />
                    Live
                  </span>
                </div>

                <div className="space-y-2 rounded-2xl border border-border/70 bg-muted/40 p-3.5 text-sm">
                  <p className="flex items-center gap-2">
                    <MapPin className="size-4 text-primary" aria-hidden />
                    Bole · 3.1 km away
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="size-4 text-status-searching" aria-hidden />
                    Respond within 5 minutes
                  </p>
                  <p className="flex items-center gap-2">
                    <Star className="size-4 fill-status-searching text-status-searching" aria-hidden />
                    Top-ranked match, verified skills
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <span className="inline-flex h-9 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                    Accept job
                  </span>
                  <span className="inline-flex h-9 items-center justify-center rounded-full border border-border text-xs font-medium text-muted-foreground">
                    Decline
                  </span>
                </div>

                <p className="flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
                  <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
                  First worker to accept gets the job. Everyone else is notified automatically.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <dl className="mx-auto mt-10 grid max-w-2xl grid-cols-3 divide-x divide-border/60 rounded-2xl border border-border/60 bg-card/60 py-4 text-center shadow-soft backdrop-blur">
          <div className="px-2">
            <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Offer window</dt>
            <dd className="mt-0.5 font-mono text-sm font-semibold sm:text-base">5 min</dd>
          </div>
          <div className="px-2">
            <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Match radius</dt>
            <dd className="mt-0.5 font-mono text-sm font-semibold sm:text-base">10 km</dd>
          </div>
          <div className="px-2">
            <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">First accept wins</dt>
            <dd className="mt-0.5 font-mono text-sm font-semibold sm:text-base">Atomically</dd>
          </div>
        </dl>
      </section>

      <section className="space-y-5" aria-labelledby="trades-heading">
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            15 trades, one network
          </p>
          <h2 id="trades-heading" className="mt-1.5 text-xl font-semibold tracking-tight sm:text-2xl">
            Every trade, one trusted place
          </h2>
        </div>
        <SkillMarquee />
      </section>

      <section id="how-it-works" className="scroll-mt-24 space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-lg font-semibold tracking-tight">How it works</h2>
          <p className="text-sm text-muted-foreground">From request to done, without phone tag.</p>
        </div>

        <div className="stagger-list grid gap-4 sm:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={step.title} className="shadow-soft transition-shadow hover:shadow-lift">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-center justify-between">
                    <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-4.5" aria-hidden />
                    </span>
                    <span className="font-mono text-xs font-semibold text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[2.5rem] bg-primary px-6 py-12 text-center text-primary-foreground shadow-lift md:py-16">
        <div
          className="pointer-events-none absolute -left-16 -top-20 size-64 rounded-full bg-primary-foreground/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-24 -right-10 size-72 rounded-full bg-accent/20 blur-3xl"
          aria-hidden
        />
        <h2 className="relative text-balance text-2xl font-semibold tracking-tight md:text-4xl">
          Help is one post away.
        </h2>
        <p className="relative mx-auto mt-3 max-w-xl text-pretty text-sm text-primary-foreground/80 md:text-base">
          Post the job, get matched with a verified worker nearby, and follow every step until it is
          done.
        </p>
        <div className="relative mt-7 flex flex-wrap items-center justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="rounded-full bg-primary-foreground text-primary shadow-soft hover:bg-primary-foreground/90"
          >
            <Link href="/register">
              Get started
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-full border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
