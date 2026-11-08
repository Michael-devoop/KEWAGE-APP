"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, LogOut } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";

export type NavigationSection = {
  title: string;
  href: string;
};

type HeaderProps = {
  navigationData: NavigationSection[];
  cta: { label: string; href: string };
  signedIn?: boolean;
  signInLabel: string;
  signOutLabel: string;
};

export default function Header({
  navigationData,
  cta,
  signedIn = false,
  signInLabel,
  signOutLabel,
}: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-40 px-3 pb-1 pt-3 sm:px-4"
      >
        <div
          className={cn(
            "relative mx-auto flex h-14 w-full max-w-7xl items-center gap-2 rounded-2xl border border-border/70 bg-card/80 px-3 backdrop-blur-xl transition-shadow supports-[backdrop-filter]:bg-card/65",
            scrolled ? "shadow-soft" : "shadow-none",
          )}
        >
          <Link
            href="/"
            className="flex items-center gap-2 rounded-full pr-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <Logo className="size-8 shadow-soft" />
            <span className="text-[15px] font-semibold tracking-tight">SkillConnect</span>
          </Link>

          <div className="pointer-events-none absolute inset-x-0 hidden justify-center md:flex">
            <div className="pointer-events-auto">
              <NavigationMenu>
                <NavigationMenuList>
                  {navigationData.map((item) => (
                    <NavigationMenuItem key={item.title}>
                      <NavigationMenuLink asChild>
                        <Link
                          href={item.href}
                          className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          {item.title}
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>

            {signedIn ? (
              <form action="/api/auth/logout" method="post">
                <Button type="submit" variant="ghost" size="sm" className="text-muted-foreground">
                  <LogOut className="size-4" aria-hidden />
                  <span className="hidden sm:inline">{signOutLabel}</span>
                </Button>
              </form>
            ) : (
              <Button asChild size="sm" variant="ghost" className="hidden text-muted-foreground sm:inline-flex">
                <Link href="/login">{signInLabel}</Link>
              </Button>
            )}

            <Button asChild size="sm" className="group hidden rounded-full shadow-soft sm:inline-flex">
              <Link href={cta.href}>
                <span>{cta.label}</span>
                <ArrowUpRight
                  className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden
                />
              </Link>
            </Button>

            <div className="md:hidden">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Open menu">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5" aria-hidden>
                      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
                    </svg>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[85%] sm:max-w-sm">
                  <SheetHeader className="border-b border-border/60">
                    <SheetTitle className="flex items-center gap-2">
                      <Logo className="size-7" />
                      SkillConnect
                    </SheetTitle>
                  </SheetHeader>

                  <nav className="flex flex-col gap-1 px-4">
                    <AnimatePresence initial={false}>
                      {navigationData.map((item, index) => (
                        <motion.div
                          key={item.title}
                          initial={{ opacity: 0, x: 12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.04 }}
                        >
                          <SheetClose asChild>
                            <Link
                              href={item.href}
                              className="block rounded-xl px-3 py-2.5 text-base font-medium transition-colors hover:bg-muted"
                            >
                              {item.title}
                            </Link>
                          </SheetClose>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </nav>

                  <div className="mt-auto space-y-3 border-t border-border/60 p-4">
                    <SheetClose asChild>
                      <Button asChild className="w-full rounded-full">
                        <Link href={cta.href}>
                          {cta.label}
                          <ArrowUpRight className="size-4" aria-hidden />
                        </Link>
                      </Button>
                    </SheetClose>
                    {signedIn ? (
                      <form action="/api/auth/logout" method="post">
                        <Button type="submit" variant="outline" className="w-full rounded-full">
                          <LogOut className="size-4" aria-hidden />
                          {signOutLabel}
                        </Button>
                      </form>
                    ) : (
                      <SheetClose asChild>
                        <Button asChild variant="outline" className="w-full rounded-full">
                          <Link href="/login">{signInLabel}</Link>
                        </Button>
                      </SheetClose>
                    )}
                    <div className="flex justify-center pt-1">
                      <LanguageSwitcher />
                    </div>
                    <p className="text-center text-xs text-muted-foreground">
                      SkillConnect · Addis Ababa
                    </p>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </motion.header>
    </>
  );
}
