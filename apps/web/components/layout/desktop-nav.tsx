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

export function DesktopNav({ role }: { role: Role }) {
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
    <nav aria-label="Primary" className="ml-3 hidden items-center gap-0.5 md:flex">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
