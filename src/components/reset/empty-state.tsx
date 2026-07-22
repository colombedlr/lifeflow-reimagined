import { type ReactNode } from "react";

export function EmptyState({
  title, description, action,
}: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="glass flex flex-col items-center gap-3 rounded-2xl px-6 py-14 text-center">
      <svg aria-hidden viewBox="0 0 24 24" className="h-12 w-12">
        <path
          d="M12 0 C 13.2 7.4, 16.6 10.8, 24 12 C 16.6 13.2, 13.2 16.6, 12 24 C 10.8 16.6, 7.4 13.2, 0 12 C 7.4 10.8, 10.8 7.4, 12 0 Z"
          fill="var(--primary)"
          opacity="0.7"
        />
      </svg>
      <h3 className="font-serif text-lg text-foreground">{title}</h3>
      {description ? <p className="max-w-sm text-sm text-muted-foreground">{description}</p> : null}
      {action}
    </div>
  );
}
