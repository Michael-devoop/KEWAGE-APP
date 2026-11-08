import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("text-primary", className)} aria-hidden>
      <rect width="32" height="32" rx="9" fill="currentColor" />
      <path
        d="M9 20.5c3.2 0 3.2-9 6.5-9s3.3 9 6.5 9"
        fill="none"
        stroke="var(--primary-foreground)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="9" cy="20.5" r="2" fill="var(--primary-foreground)" />
      <circle cx="22" cy="20.5" r="2" fill="var(--primary-foreground)" />
    </svg>
  );
}
