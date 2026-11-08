import { getTranslations } from "next-intl/server";
import { JobForm } from "@/components/jobs/job-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default async function NewJobPage() {
  const t = await getTranslations("jobs");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title={t("newTitle")} description={t("newSubtitle")} />
      <Card className="shadow-soft animate-fade-up">
        <CardContent className="p-6 md:p-8">
          <JobForm />
        </CardContent>
      </Card>
    </div>
  );
}
