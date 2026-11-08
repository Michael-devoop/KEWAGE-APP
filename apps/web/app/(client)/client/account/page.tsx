import { getTranslations } from "next-intl/server";
import { getUserById } from "@skillconnect/api";
import { getSession } from "@/lib/session";
import { AccountCard } from "@/components/layout/account-card";
import { PageHeader } from "@/components/layout/page-header";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

export default async function ClientAccountPage() {
  const session = await getSession();
  const t = await getTranslations("nav");
  const user = session ? getUserById(session.userId) : undefined;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <PageHeader title={t("account")} description="Manage your details and language." />
      <AccountCard
        name={user?.name ?? session?.firstName ?? ""}
        phone={user?.phone ?? ""}
        languageLabel={t("language")}
        languageControl={<LanguageSwitcher />}
        signOutLabel={t("signOut")}
      />
    </div>
  );
}
