"use client";

import Link from "next/link";
import { Instrument_Serif } from "next/font/google";
import { motion } from "motion/react";
import { ArrowUpRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic"],
  display: "swap",
});

export type AvatarList = {
  initials: string;
  className: string;
};

type HeroCta = {
  label: string;
  href: string;
};

type HeroStat = {
  value: string;
  label: string;
};

export type HeroSectionProps = {
  title: string;
  accent?: string;
  description: string;
  primaryCta: HeroCta;
  secondaryCta: HeroCta;
  avatarList: AvatarList[];
  trustLabel: string;
  stats: HeroStat[];
};

export function HeroSection({
  title,
  accent,
  description,
  primaryCta,
  secondaryCta,
  avatarList,
  trustLabel,
  stats,
}: HeroSectionProps) {
  return (
    <section className="@container relative mx-auto w-full max-w-7xl px-4 pb-14 pt-10 sm:px-6 md:pt-14 lg:px-8 lg:pb-20 lg:pt-20">
      <div
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[26rem] w-[46rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-24 top-40 -z-10 size-72 rounded-full bg-accent/60 blur-3xl"
        aria-hidden
      />

      <div className="flex flex-col items-center text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
        >
          {title}{" "}
          {accent ? (
            <span className={cn(instrumentSerif.className, "italic text-primary")}>{accent}</span>
          ) : null}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          {description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Button asChild size="lg" className="group h-12 rounded-full px-5 shadow-soft">
            <Link href={primaryCta.href}>
              <span>{primaryCta.label}</span>
              <span className="ml-1 grid size-6 place-items-center rounded-full bg-primary-foreground/15">
                <ArrowUpRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
              </span>
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 rounded-full bg-card/70 px-5">
            <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground"
        >
          <div className="flex -space-x-2.5">
            {avatarList.map((person) => (
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
          </div>
          <span className="flex items-center gap-1.5">
            <span className="flex items-center gap-0.5 text-status-searching" aria-hidden>
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className="size-3.5 fill-current" />
              ))}
            </span>
            {trustLabel}
          </span>
        </motion.div>
      </div>

      <motion.dl
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mx-auto mt-12 grid max-w-2xl grid-cols-3 divide-x divide-border/60 rounded-2xl border border-border/60 bg-card/60 py-4 text-center shadow-soft backdrop-blur"
      >
        {stats.map((stat) => (
          <div key={stat.label} className="px-2">
            <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">{stat.label}</dt>
            <dd className="mt-0.5 font-mono text-sm font-semibold sm:text-base">{stat.value}</dd>
          </div>
        ))}
      </motion.dl>
    </section>
  );
}
