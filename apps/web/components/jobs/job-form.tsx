"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { jobSchema, SKILLS, type Job, type JobInput } from "@skillconnect/domain";
import { apiFetch, ApiClientError } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ADDIS_SPOTS, LocationPicker } from "./location-picker";
import { cn } from "@/lib/utils";

export function JobForm() {
  const t = useTranslations("jobs");
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const form = useForm<JobInput, unknown, JobInput>({
    resolver: zodResolver(jobSchema) as Resolver<JobInput, unknown, JobInput>,
    defaultValues: {
      title: "",
      description: "",
      skills: [],
      location: ADDIS_SPOTS[0],
    },
  });

  const skills = form.watch("skills");
  const location = form.watch("location");

  function toggleSkill(id: string) {
    form.setValue(
      "skills",
      skills.includes(id) ? skills.filter((skill) => skill !== id) : [...skills, id],
      { shouldValidate: true },
    );
  }

  async function onSubmit(values: JobInput) {
    setPending(true);
    try {
      const job = await apiFetch<Job>("/api/jobs", {
        method: "POST",
        body: JSON.stringify(values),
      });
      toast.success("Job posted — matching workers");
      router.push(`/client/jobs/${job.id}`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof ApiClientError ? error.message : "Could not post job");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="title">{t("jobTitle")}</Label>
        <Input id="title" placeholder="Fix leaking kitchen sink" {...form.register("title")} />
        {form.formState.errors.title && (
          <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">{t("description")}</Label>
        <Textarea id="description" rows={5} placeholder="What needs to be done?" {...form.register("description")} />
        {form.formState.errors.description && (
          <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>
        )}
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">{t("skills")}</legend>
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

      <div className="space-y-2">
        <Label>{t("location")}</Label>
        <LocationPicker value={location} onChange={(next) => form.setValue("location", next)} />
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "…" : t("submit")}
      </Button>
    </form>
  );
}
