import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ensureSeedUsers } from "@/lib/auth";
import { AuthShell } from "@/features/auth/auth-shell";
import { LoginForm } from "@/features/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const t = await getTranslations("auth");
  const { next } = await searchParams;
  await ensureSeedUsers();

  return (
    <AuthShell
      title={t("loginTitle")}
      description={t("loginSubtitle")}
      footer={
        <p>
          {t("noAccount")}{" "}
          <Link href="/register" className="text-zinc-200 hover:underline">
            {t("submitRegister")}
          </Link>
        </p>
      }
    >
      <LoginForm next={next} />
    </AuthShell>
  );
}
