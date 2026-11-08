import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AuthShell } from "@/features/auth/auth-shell";
import { RegisterForm } from "@/features/auth/register-form";

export default async function RegisterPage() {
  const t = await getTranslations("auth");

  return (
    <AuthShell
      title={t("registerTitle")}
      description={t("registerSubtitle")}
      footer={
        <p>
          {t("haveAccount")}{" "}
          <Link href="/login" className="text-zinc-200 hover:underline">
            {t("submitLogin")}
          </Link>
        </p>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
