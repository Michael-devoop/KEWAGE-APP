import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { MapPin, User, Wrench } from "lucide-react";
import { getJob, getUserById, listMessages } from "@skillconnect/api";
import { canChat, skillName } from "@skillconnect/domain";
import { getSession } from "@/lib/session";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/jobs/status-badge";
import { WorkerJobActions } from "@/components/jobs/worker-job-actions";
import { ChatThread } from "@/components/chat/chat-thread";
import { PageHeader } from "@/components/layout/page-header";
import { timeAgo } from "@/lib/format";

export default async function WorkerJobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const job = getJob(id);
  if (!job || !session || job.assignedWorkerId !== session.userId) notFound();

  const t = await getTranslations("jobs");
  const messages = listMessages(id);
  const client = getUserById(job.clientId);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/worker"
          className="mb-2 inline-flex items-center gap-1 rounded-full text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
        >
          ← {t("title")}
        </Link>
        <PageHeader
          title={job.title}
          description={
            <span className="flex flex-wrap items-center gap-2.5">
              <StatusBadge status={job.status} />
              <span>{timeAgo(job.createdAt)}</span>
            </span>
          }
          action={<WorkerJobActions jobId={job.id} status={job.status} />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <Card className="shadow-soft">
            <CardContent className="space-y-4 p-5">
              <p className="text-sm leading-relaxed">{job.description}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Wrench className="size-3.5 text-primary" aria-hidden />
                  {job.skills.map((skill) => skillName(skill)).join(", ")}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5 text-primary" aria-hidden />
                  {job.location.label}
                </span>
              </div>
            </CardContent>
          </Card>

          {canChat(job.status) && (
            <ChatThread
              jobId={job.id}
              initialMessages={messages}
              currentUserId={session.userId}
              canWrite
            />
          )}
        </div>

        <Card className="h-fit shadow-soft">
          <CardContent className="space-y-3 p-5">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold">
              <User className="size-4 text-primary" aria-hidden />
              Client
            </h2>
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {(client?.name ?? "Client").slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{client?.name ?? "Client"}</p>
                <p className="font-mono text-xs text-muted-foreground">{client?.phone}</p>
              </div>
            </div>
            <div className="space-y-1.5 border-t border-border/60 pt-3 text-xs text-muted-foreground">
              <p className="flex items-center gap-1.5">
                <MapPin className="size-3.5" aria-hidden />
                {job.location.label}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
