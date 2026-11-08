import { SiteHeader } from "@/components/layout/site-header";
import { Logo } from "@/components/layout/logo";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 md:py-14">{children}</main>
      <footer className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-muted-foreground sm:flex-row">
          <span className="flex items-center gap-2">
            <Logo className="size-5" />
            SkillConnect · Addis Ababa
          </span>
          <span>Verified workers, matched in minutes.</span>
        </div>
      </footer>
    </div>
  );
}
