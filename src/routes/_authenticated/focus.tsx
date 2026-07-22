import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, Pause, Play } from "lucide-react";
import { settingsQuery } from "@/features/settings/api";
import { startLofi, stopLofi } from "@/lib/sounds";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/focus")({
  head: () => ({
    meta: [
      { title: "Focus — Reset LifeOS" },
      { name: "description", content: "25 minutes de concentration, un seul objectif à la fois." },
      { property: "og:title", content: "Reset LifeOS — Focus" },
      { property: "og:description", content: "Un timer, une ambiance, et c'est tout." },
    ],
  }),
  component: FocusPage,
});

const DURATION = 25 * 60;

function FocusPage() {
  const settings = useQuery(settingsQuery);
  const [sec, setSec] = useState(0);
  const [running, setRunning] = useState(true);
  const started = useRef(false);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setSec((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (settings.data?.lofi_enabled) startLofi();
    return () => stopLofi();
  }, [settings.data?.lofi_enabled]);

  const remaining = Math.max(0, DURATION - sec);
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const pct = useMemo(() => (sec / DURATION) * 100, [sec]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-foreground">
      <Link to="/" className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full text-muted-foreground hover:text-foreground" aria-label="Quitter le focus">
        <X className="h-5 w-5" />
      </Link>
      <div className="relative">
        <svg viewBox="0 0 200 200" className="h-64 w-64 -rotate-90">
          <circle cx="100" cy="100" r="90" fill="none" stroke="var(--border)" strokeWidth="4" />
          <circle cx="100" cy="100" r="90" fill="none" stroke="var(--primary)" strokeWidth="6" strokeLinecap="round"
            strokeDasharray={`${(Math.min(100, pct) / 100) * 565} 565`} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="font-lcd text-6xl text-primary">{mm}:{ss}</div>
          <div className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">Focus</div>
        </div>
      </div>
      <div className="mt-8 flex gap-3">
        <Button variant="outline" onClick={() => setRunning((r) => !r)}>
          {running ? <><Pause className="mr-2 h-4 w-4" />Pause</> : <><Play className="mr-2 h-4 w-4" />Reprendre</>}
        </Button>
        <Button onClick={() => { stopLofi(); setSec(0); setRunning(false); }} variant="ghost">Reset</Button>
      </div>
    </div>
  );
}