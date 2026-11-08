import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getProfile } from "@skillconnect/api";
import { getSession } from "@/lib/session";
import { ProfileForm } from "@/components/worker/profile-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default async function WorkerProfilePage() {
  const session = await getSession();
  const t = await getTranslations("worker");
  const profile = session ? getProfile(session.userId) : undefined;
  if (!profile) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title={t("profileTitle")} description={t("profileSubtitle")} />
      <Card className="shadow-soft animate-fade-up">
        <CardContent className="p-6 md:p-8">
          <ProfileForm profile={profile} />
        </CardContent>
      </Card>
    </div>
  );
}
