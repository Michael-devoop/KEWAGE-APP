"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, Phone, User } from "lucide-react";
import { registerSchema, type RegisterInput } from "@skillconnect/domain";
import { apiFetch, ApiClientError } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function RegisterForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", phone: "", password: "", role: "client" },
  });
  const role = form.watch("role");

  async function onSubmit(values: RegisterInput) {
    setPending(true);
    setError(null);
    try {
      const user = await apiFetch<{ role: "client" | "worker" }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(values),
      });
      toast.success("Account created");
      router.replace(user.role === "worker" ? "/worker/profile" : "/client/jobs");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Could not create account");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5" noValidate>
      <div className="grid gap-2">
        <Label className="text-zinc-300">{t("role")}</Label>
        <div className="grid grid-cols-2 gap-3">
          {(["client", "worker"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => form.setValue("role", value, { shouldValidate: true })}
              aria-pressed={role === value}
              className={cn(
                "h-10 rounded-xl border text-sm font-medium transition-colors",
                role === value
                  ? "border-zinc-50 bg-zinc-50 text-zinc-900"
                  : "border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-600",
              )}
            >
              {value === "client" ? t("roleClient") : t("roleWorker")}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="name" className="text-zinc-300">
          {t("name")}
        </Label>
        <div className="relative">
          <User
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500"
            aria-hidden
          />
          <Input
            id="name"
            autoComplete="name"
            placeholder="Abebe Bekele"
            className="h-11 rounded-xl border-zinc-800 bg-zinc-950 pl-10 text-zinc-50 placeholder:text-zinc-600"
            aria-invalid={Boolean(form.formState.errors.name)}
            {...form.register("name")}
          />
        </div>
        {form.formState.errors.name && (
          <p className="text-xs text-red-400">{form.formState.errors.name.message}</p>
        )}
      </div>

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
            placeholder="0912345678"
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
            autoComplete="new-password"
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
        {pending ? "…" : t("submitRegister")}
      </Button>
    </form>
  );
}
