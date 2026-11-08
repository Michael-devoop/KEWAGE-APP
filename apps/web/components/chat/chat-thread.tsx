"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { Message } from "@skillconnect/domain";
import { apiFetch, ApiClientError } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function ChatThread({
  jobId,
  initialMessages,
  currentUserId,
  canWrite,
}: {
  jobId: string;
  initialMessages: Message[];
  currentUserId: string;
  canWrite: boolean;
}) {
  const t = useTranslations("chat");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  useEffect(() => {
    const source = new EventSource(`/api/stream/${jobId}`);
    source.addEventListener("job", () => {
      apiFetch<Message[]>(`/api/jobs/${jobId}/messages`)
        .then(setMessages)
        .catch(() => {});
    });
    return () => source.close();
  }, [jobId]);

  async function send(event: React.FormEvent) {
    event.preventDefault();
    const value = text.trim();
    if (!value || pending) return;
    setPending(true);
    try {
      const message = await apiFetch<Message>(`/api/jobs/${jobId}/messages`, {
        method: "POST",
        body: JSON.stringify({ text: value }),
      });
      setMessages((current) => [...current, message]);
      setText("");
    } catch (error) {
      toast.error(error instanceof ApiClientError ? error.message : "Message not sent");
    } finally {
      setPending(false);
    }
  }

  return (
    <section
      className="flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-soft"
      aria-label={t("title")}
    >
      <header className="flex items-center gap-2 border-b border-border/70 px-4 py-2.5">
        <span className="size-1.5 rounded-full bg-status-completed" aria-hidden />
        <h2 className="text-sm font-semibold">{t("title")}</h2>
      </header>

      <div className="min-h-40 max-h-80 space-y-2 overflow-y-auto px-4 py-3">
        {messages.length === 0 && <p className="text-xs text-muted-foreground">{t("empty")}</p>}
        {messages.map((message) => {
          const mine = message.senderId === currentUserId;
          return (
            <div key={message.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
              <p
                className={cn(
                  "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                  mine
                    ? "rounded-br-md bg-primary text-primary-foreground shadow-sm"
                    : "rounded-bl-md bg-muted text-foreground shadow-sm",
                )}
              >
                {message.text}
              </p>
            </div>
          );
        })}
        <div ref={bottom} />
      </div>

      {canWrite && (
        <form onSubmit={send} className="flex items-center gap-2 border-t border-border/70 p-2.5">
          <Input
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={t("placeholder")}
            aria-label={t("placeholder")}
            maxLength={1000}
          />
          <Button type="submit" size="sm" disabled={pending || !text.trim()}>
            {t("send")}
          </Button>
        </form>
      )}
    </section>
  );
}
