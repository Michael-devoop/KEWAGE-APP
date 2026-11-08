"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Briefcase, Home, PlusCircle, User, Wrench } from "lucide-react";
import type { Role } from "@skillconnect/domain";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  if (pathname === href) return true;
  if (href === "/client/jobs") {
    return pathname.startsWith("/client/jobs/") && !pathname.startsWith("/client/jobs/new");
  }
  if (href === "/client/jobs/new") return pathname.startsWith("/client/jobs/new");
  if (href === "/worker") return false;
  return pathname.startsWith(`${href}/`);
}

export function BottomNav({ role }: { role: Role }) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  const items =
    role === "client"
      ? [
          { href: "/client/jobs", label: t("jobs"), icon: Briefcase },
          { href: "/client/jobs/new", label: t("postJob"), icon: PlusCircle },
          { href: "/client/account", label: t("account"), icon: User },
        ]
      : [
          { href: "/worker", label: t("workerHome"), icon: Home },
          { href: "/worker/profile", label: t("profile"), icon: Wrench },
          { href: "/worker/account", label: t("account"), icon: User },
        ];

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg md:hidden"
    >
      <ul className="mx-auto flex max-w-md items-stretch gap-1 px-2 py-1.5">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-12 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-1 text-[11px] font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "absolute inset-x-5 top-0 h-0.5 rounded-full bg-primary transition-opacity",
                    active ? "opacity-100" : "opacity-0",
                  )}
                  aria-hidden
                />
                <Icon className="size-5" aria-hidden />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
