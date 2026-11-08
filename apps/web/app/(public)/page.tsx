import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight, BadgeCheck, ClipboardList, Radar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SkillMarquee } from "@/components/marketing/skill-marquee";
import AgencyHeroSection from "@/components/ui/hero-01-utils";
import { getSession } from "@/lib/session";

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

function splitTagline(tagline: string): { title: string; accent?: string } {
  const [title, ...rest] = tagline.split(/,\s*/);
  const accent = rest.join(", ").trim();
  return accent ? { title: `${title},`, accent } : { title: tagline };
}

export default async function HomePage() {
  const t = await getTranslations("app");
  const nav = await getTranslations("nav");
  const session = await getSession();
  const { title, accent } = splitTagline(t("tagline"));

  const cta = session
    ? session.role === "worker"
      ? { label: nav("workerHome"), href: "/worker" }
      : { label: t("ctaClient"), href: "/client/jobs/new" }
    : { label: "Get started", href: "/register" };

  return (
    <div className="flex flex-col">
      <AgencyHeroSection
        navigationData={[
          { title: nav("home"), href: "/" },
          { title: "How it works", href: "#how-it-works" },
          { title: "Trades", href: "#trades-heading" },
        ]}
        cta={cta}
        signedIn={Boolean(session)}
        signInLabel={nav("signIn")}
        signOutLabel={nav("signOut")}
        title={title}
        accent={accent}
        description={t("intro")}
        primaryCta={{ label: t("ctaClient"), href: session ? cta.href : "/register" }}
        secondaryCta={{ label: t("ctaWorker"), href: "/register" }}
        avatarList={avatars}
        trustLabel="4.8 average · trusted local workers"
        stats={[
          { value: "5 min", label: "Offer window" },
          { value: "10 km", label: "Match radius" },
          { value: "Atomic", label: "First accept wins" },
        ]}
        brandItems={[
          { name: "Verified workers" },
          { name: "5-minute offers" },
          { name: "10 km match radius" },
          { name: "First accept wins" },
          { name: "In-app chat" },
          { name: "Ratings after every job" },
          { name: "Transparent pricing" },
          { name: "15 trades" },
        ]}
        brandCaption="Built for fast, fair local work"
      />

      <div className="mx-auto w-full max-w-5xl space-y-16 px-4 pb-14">
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
    </div>
  );
}
