import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ChevronRight, LogOut } from "lucide-react";
import { getSession } from "@/lib/session";
import { initials } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { DesktopNav } from "./desktop-nav";
import { LanguageSwitcher } from "./language-switcher";
import { Logo } from "./logo";
import { PublicNav } from "./public-nav";

export async function SiteHeader() {
  const t = await getTranslations("nav");
  const session = await getSession();
  const homeHref = session ? (session.role === "worker" ? "/worker" : "/client/jobs") : "/";

  return (
    <header className="sticky top-0 z-40 px-4 pb-1 pt-3">
      <div className="relative mx-auto flex h-14 w-full max-w-5xl items-center gap-2 rounded-2xl border border-border/70 bg-card/80 px-3 shadow-soft backdrop-blur-xl supports-[backdrop-filter]:bg-card/65">
        <Link
          href={homeHref}
          className="relative z-10 flex items-center gap-2 rounded-full pr-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <Logo className="size-8 shadow-soft" />
          <span className="text-[15px] font-semibold tracking-tight">SkillConnect</span>
        </Link>

        <div className="pointer-events-none absolute inset-x-0 hidden justify-center md:flex">
          <div className="pointer-events-auto">
            {session ? <DesktopNav role={session.role} /> : <PublicNav />}
          </div>
        </div>

        <div className="relative z-10 ml-auto flex items-center gap-1.5">
          <LanguageSwitcher />
          {session ? (
            <>
              <span className="ml-1 hidden items-center gap-2 rounded-full border border-border/70 bg-card/70 py-1 pl-1 pr-3 sm:inline-flex">
                <span className="grid size-6 place-items-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                  {initials(session.firstName)}
                </span>
                <span className="text-xs font-medium text-muted-foreground">{session.firstName}</span>
              </span>
              <form action="/api/auth/logout" method="post">
                <Button type="submit" variant="ghost" size="sm" className="text-muted-foreground">
                  <LogOut className="size-4" aria-hidden />
                  <span className="hidden sm:inline">{t("signOut")}</span>
                  <span className="sr-only sm:hidden">{t("signOut")}</span>
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button asChild size="sm" variant="ghost" className="hidden text-muted-foreground sm:inline-flex">
                <Link href="/login">{t("signIn")}</Link>
              </Button>
              <Button asChild size="sm" className="rounded-full shadow-soft">
                <Link href="/register" aria-label="Get started">
                  <span className="hidden sm:inline">Get started</span>
                  <ChevronRight className="size-4 sm:ml-1" aria-hidden />
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
