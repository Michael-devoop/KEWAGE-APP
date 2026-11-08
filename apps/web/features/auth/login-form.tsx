"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Eye, EyeOff, Lock, Phone } from "lucide-react";
import { loginSchema, type LoginInput } from "@skillconnect/domain";
import { authClient } from "@/lib/auth-client";
import { phoneToEmail } from "@/lib/phone-email";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export function LoginForm({ next }: { next?: string }) {
  const t = useTranslations("auth");
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    setPending(true);
    setError(null);
    try {
      const { data, error: signInError } = await authClient.signIn.email({
        email: phoneToEmail(values.phone),
        password: values.password,
        rememberMe,
      });
      if (signInError) {
        setError(
          signInError.status === 401
            ? "Phone number or password is incorrect"
            : (signInError.message ?? "Could not sign in"),
        );
        return;
      }
      const role = (data?.user as { role?: string } | undefined)?.role;
      const destination =
        next && next.startsWith("/") && !next.startsWith("//")
          ? next
          : role === "worker"
            ? "/worker"
            : "/client/jobs";
      router.replace(destination);
      router.refresh();
    } catch {
      setError("Could not sign in");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5" noValidate>
      <div className="grid gap-2">
        <Label htmlFor="phone" className="text-zinc-300">
          {t("phone")}
        </Label>
        <div className="relative">
          <Phone
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500"
            aria-hidden
          />
          <Input
            id="phone"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0911000001"
            className="h-11 rounded-xl border-zinc-800 bg-zinc-950 pl-10 text-zinc-50 placeholder:text-zinc-600"
            aria-invalid={Boolean(form.formState.errors.phone)}
            {...form.register("phone")}
          />
        </div>
        {form.formState.errors.phone && (
          <p className="text-xs text-red-400">{form.formState.errors.phone.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="password" className="text-zinc-300">
          {t("password")}
        </Label>
        <div className="relative">
          <Lock
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500"
            aria-hidden
          />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            className="h-11 rounded-xl border-zinc-800 bg-zinc-950 pl-10 pr-10 text-zinc-50 placeholder:text-zinc-600"
            aria-invalid={Boolean(form.formState.errors.password)}
            {...form.register("password")}
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide characters" : "Show characters"}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-zinc-400 hover:text-zinc-200"
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {form.formState.errors.password && (
          <p className="text-xs text-red-400">{form.formState.errors.password.message}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="remember"
          checked={rememberMe}
          onCheckedChange={(checked) => setRememberMe(checked === true)}
          className="border-zinc-700 data-[state=checked]:bg-zinc-50 data-[state=checked]:text-zinc-900"
        />
        <Label htmlFor="remember" className="text-zinc-400">
          Remember me
        </Label>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={pending}
        className="h-11 w-full rounded-xl bg-zinc-50 text-zinc-900 hover:bg-zinc-200"
      >
        {pending ? "…" : t("submitLogin")}
      </Button>

      <p className="text-center text-xs text-zinc-500">{t("demoHint")}</p>
    </form>
  );
}
