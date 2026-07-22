import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Screen({
  title, subtitle, action, children, className,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-3xl px-4 pb-32 pt-6 sm:px-6 sm:pt-10", className)}>
      <header className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 sm:mb-8">
        <div className="min-w-0">
          <h1 className="chrome-text truncate pb-0.5 font-serif text-3xl leading-tight sm:text-4xl">{title}</h1>
          {subtitle ? (
            <p className="mt-1 truncate text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>
      {children}
    </div>
  );
}
