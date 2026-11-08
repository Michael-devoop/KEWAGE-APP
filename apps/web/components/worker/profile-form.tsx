"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { profileSchema, SKILLS, type ProfileInput, type WorkerProfile } from "@skillconnect/domain";
import { apiFetch, ApiClientError } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LocationPicker } from "@/components/jobs/location-picker";
import { cn } from "@/lib/utils";

export function ProfileForm({ profile }: { profile: WorkerProfile }) {
  const t = useTranslations("worker");
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const form = useForm<ProfileInput, unknown, ProfileInput>({
    resolver: zodResolver(profileSchema) as Resolver<ProfileInput, unknown, ProfileInput>,
    defaultValues: {
      skills: profile.skills,
      experienceYears: profile.experienceYears,
      about: profile.about ?? "",
      location: profile.location,
    },
  });

  const skills = form.watch("skills") ?? [];
  const location = form.watch("location");

  function toggleSkill(id: string) {
    form.setValue(
      "skills",
      skills.includes(id) ? skills.filter((skill) => skill !== id) : [...skills, id],
      { shouldValidate: true },
    );
  }

  async function onSubmit(values: ProfileInput) {
    setPending(true);
    try {
      await apiFetch<WorkerProfile>("/api/worker/profile", {
        method: "PUT",
        body: JSON.stringify(values),
      });
      toast.success(t("save"));
      router.refresh();
    } catch (error) {
      toast.error(error instanceof ApiClientError ? error.message : "Could not save profile");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">{t("profileTitle")}</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {SKILLS.map((skill) => {
            const active = skills.includes(skill.id);
            return (
              <label
                key={skill.id}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                  active ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40",
                )}
              >
                <input
                  type="checkbox"
                  className="size-3.5 accent-[var(--primary)]"
                  checked={active}
                  onChange={() => toggleSkill(skill.id)}
                />
                {skill.name}
              </label>
            );
          })}
        </div>
        {form.formState.errors.skills && (
          <p className="text-xs text-destructive">{form.formState.errors.skills.message}</p>
        )}
      </fieldset>

      <div className="space-y-1.5">
        <Label htmlFor="experienceYears">{t("experience")}</Label>
        <Input
          id="experienceYears"
          type="number"
          min={0}
          max={50}
          {...form.register("experienceYears")}
        />
        {form.formState.errors.experienceYears && (
          <p className="text-xs text-destructive">{form.formState.errors.experienceYears.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="about">{t("about")}</Label>
        <Textarea id="about" rows={4} {...form.register("about")} />
        {form.formState.errors.about && (
          <p className="text-xs text-destructive">{form.formState.errors.about.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Location</Label>
        <LocationPicker value={location} onChange={(next) => form.setValue("location", next)} />
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "…" : t("save")}
      </Button>
    </form>
  );
}
