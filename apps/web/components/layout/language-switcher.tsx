"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LOCALE_COOKIE, SUPPORTED_LOCALES, type Locale } from "@/i18n/config";

const LABELS: Record<Locale, string> = { en: "EN", am: "አማ" };

function setLocaleCookie(next: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=31536000;samesite=lax`;
}

export function LanguageSwitcher() {
  const router = useRouter();
  const locale = useLocale() as Locale;

  function switchTo(next: Locale) {
    setLocaleCookie(next);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1 rounded-full border border-border/70 p-0.5">
      <Languages className="ml-1.5 size-3.5 text-muted-foreground" aria-hidden />
      {SUPPORTED_LOCALES.map((code) => (
        <Button
          key={code}
          type="button"
          size="sm"
          variant={code === locale ? "secondary" : "ghost"}
          className="h-6 rounded-full px-2 text-[11px] font-semibold"
          onClick={() => switchTo(code)}
          aria-pressed={code === locale}
        >
          {LABELS[code]}
        </Button>
      ))}
    </div>
  );
}
