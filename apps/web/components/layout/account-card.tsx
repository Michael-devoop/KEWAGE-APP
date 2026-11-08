import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function AccountCard({
  name,
  phone,
  languageLabel,
  languageControl,
  signOutLabel,
}: {
  name: string;
  phone: string;
  languageLabel: string;
  languageControl: ReactNode;
  signOutLabel: string;
}) {
  return (
    <div className="space-y-4 animate-fade-up">
      <Card className="shadow-soft">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary/10 text-lg font-semibold text-primary">
              {name.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold">{name}</p>
              <p className="font-mono text-xs text-muted-foreground">{phone}</p>
            </div>
          </div>

          <dl className="mt-6 divide-y divide-border/70 text-sm">
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-muted-foreground">Phone</dt>
              <dd className="font-mono text-xs sm:text-sm">{phone}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-muted-foreground">{languageLabel}</dt>
              <dd>{languageControl}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <form action="/api/auth/logout" method="post">
        <Button type="submit" variant="outline" className="w-full">
          {signOutLabel}
        </Button>
      </form>
    </div>
  );
}
