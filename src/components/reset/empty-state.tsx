import { type ReactNode } from "react";

export function EmptyState({
  title, description, action,
}: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="glass flex flex-col items-center gap-3 rounded-2xl px-6 py-14 text-center">
      <svg aria-hidden viewBox="0 0 100 100" className="h-12 w-12 opacity-60">
        <path d="M50 50 C 20 20, 20 60, 50 50 C 80 40, 80 80, 50 50 Z" fill="var(--primary)" />
      </svg>
      <h3 className="font-serif text-lg text-foreground">{title}</h3>
      {description ? <p className="max-w-sm text-sm text-muted-foreground">{description}</p> : null}
      {action}
    </div>
  );
}