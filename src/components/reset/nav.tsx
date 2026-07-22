import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Target, Repeat, CheckSquare, BookHeart, TrendingUp, Settings, Focus } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Aujourd'hui", icon: LayoutDashboard, exact: true },
  { to: "/habits", label: "Habitudes", icon: Repeat, exact: false },
  { to: "/tasks", label: "Tâches", icon: CheckSquare, exact: false },
  { to: "/journal", label: "Journal", icon: BookHeart, exact: false },
  { to: "/progress", label: "Progression", icon: TrendingUp, exact: false },
  { to: "/goals", label: "Objectifs", icon: Target, exact: false },
  { to: "/settings", label: "Réglages", icon: Settings, exact: false },
] as const;

const mobileItems = items.slice(0, 5);

function useActive() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (to: string, exact: boolean) => (exact ? pathname === to : pathname === to || pathname.startsWith(to + "/"));
}

export function SideNav() {
  const isActive = useActive();
  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex md:flex-col">
      <div className="flex items-center gap-2 px-5 py-6">
        <div className="h-8 w-8 rounded-xl bg-primary" />
        <div className="min-w-0">
          <div className="font-serif text-lg leading-none">Reset</div>
          <div className="text-xs text-muted-foreground">LifeOS</div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {items.map((it) => {
          const Icon = it.icon;
          const active = isActive(it.to, it.exact);
          return (
            <Link
              key={it.to}
              to={it.to}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{it.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="px-3 pb-4">
        <Link
          to="/focus"
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm transition-transform hover:scale-[1.01] active:scale-[0.99]"
        >
          <Focus className="h-4 w-4" /> Mode focus
        </Link>
      </div>
    </aside>
  );
}

export function BottomNav() {
  const isActive = useActive();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/85 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <ul className="mx-auto grid max-w-3xl grid-cols-5">
        {mobileItems.map((it) => {
          const Icon = it.icon;
          const active = isActive(it.to, it.exact);
          return (
            <li key={it.to}>
              <Link
                to={it.to}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 text-[10px]",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className={cn("h-5 w-5", active ? "opacity-100" : "opacity-70")} />
                <span className="truncate">{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}