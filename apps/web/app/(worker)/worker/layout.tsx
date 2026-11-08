import { redirect } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SiteHeader } from "@/components/layout/site-header";
import { getSession } from "@/lib/session";

export default async function WorkerLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "worker") redirect("/login?next=/worker");

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-24 md:pb-10">{children}</main>
      <BottomNav role="worker" />
    </div>
  );
}
