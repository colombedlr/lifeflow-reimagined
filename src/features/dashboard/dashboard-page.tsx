import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, Circle, Focus, Plus, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Screen } from "@/components/reset/screen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { habitLogsQuery, habitsQuery, toggleHabitToday } from "@/features/habits/api";
import { bucketToday, tasksQuery, toggleTask } from "@/features/tasks/api";
import { deletePriority, prioritiesTodayQuery, togglePriority, upsertPriority } from "@/features/priorities/api";
import { profileQuery, settingsQuery, updateSettings } from "@/features/settings/api";
import { greetingFor, todayISO, formatFR } from "@/lib/date";
import { sfx } from "@/lib/sounds";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

export function DashboardPage() {
  const qc = useQueryClient();
  const profile = useQuery(profileQuery);
  const settings = useQuery(settingsQuery);
  const habits = useQuery(habitsQuery);
  const logs = useQuery(habitLogsQuery(1));
  const tasks = useQuery(tasksQuery);
  const priorities = useQuery(prioritiesTodayQuery);

  const today = todayISO();
  const doneToday = new Set(logs.data?.filter((l) => l.log_date === today && l.done).map((l) => l.habit_id));
  const habitCount = habits.data?.length ?? 0;
  const habitDoneCount = habits.data?.filter((h) => doneToday.has(h.id)).length ?? 0;
  const dayProgress = habitCount ? Math.round((habitDoneCount / habitCount) * 100) : 0;

  const todayTasks = (tasks.data ?? []).filter(bucketToday).slice(0, 3);
  const nextHabit = habits.data?.find((h) => !doneToday.has(h.id));

  const [mission, setMission] = useState("");
  const [missionEdit, setMissionEdit] = useState(false);
  const currentMission = (settings.data?.custom_mission ?? {})[today] ?? "";

  useEffect(() => { setMission(currentMission); }, [currentMission]);

  const saveMission = async () => {
    const patch = { ...(settings.data?.custom_mission ?? {}), [today]: mission.trim() };
    await updateSettings({ custom_mission: patch });
    qc.invalidateQueries({ queryKey: ["settings"] });
    setMissionEdit(false);
  };

  const p1 = priorities.data?.find((p) => p.position === 1);
  const p2 = priorities.data?.find((p) => p.position === 2);

  return (
    <Screen title={greetingFor(profile.data?.display_name)} subtitle={formatFR(today)}>
      {/* Mission */}
      <section className="surface-elevated mb-4 rounded-2xl p-5">
        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" /> Mission du jour
        </div>
        {missionEdit ? (
          <div className="flex gap-2">
            <Input autoFocus value={mission} onChange={(e) => setMission(e.target.value)} placeholder="Ex. Avancer sur mon projet principal" />
            <Button onClick={saveMission}>OK</Button>
          </div>
        ) : (
          <button
            onClick={() => setMissionEdit(true)}
            className="w-full text-left font-serif text-2xl leading-snug text-foreground hover:opacity-80"
          >
            {currentMission || "Choisis une intention pour aujourd'hui…"}
          </button>
        )}
      </section>

      {/* Priorités */}
      <section className="surface-elevated mb-4 rounded-2xl p-5">
        <div className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Tes 2 priorités</div>
        <PriorityRow pos={1} value={p1} onSaved={() => qc.invalidateQueries({ queryKey: ["priorities"] })} />
        <div className="my-2" />
        <PriorityRow pos={2} value={p2} onSaved={() => qc.invalidateQueries({ queryKey: ["priorities"] })} />
      </section>

      {/* Focus CTA + Progression */}
      <section className="mb-4 grid gap-3 sm:grid-cols-[2fr_1fr]">
        <Link to="/focus" className="surface-elevated flex items-center gap-4 rounded-2xl bg-primary p-5 text-primary-foreground transition-transform hover:scale-[1.01]">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary-foreground/15">
            <Focus className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <div className="font-serif text-lg leading-tight">Entrer en mode focus</div>
            <div className="text-xs opacity-80">25 minutes, un seul objectif</div>
          </div>
        </Link>
        <div className="surface-elevated rounded-2xl p-5">
          <div className="mb-1 text-xs uppercase tracking-widest text-muted-foreground">Journée</div>
          <div className="mb-2 flex items-baseline gap-2">
            <span className="font-lcd text-4xl text-primary">{dayProgress}</span>
            <span className="text-sm text-muted-foreground">/ 100</span>
          </div>
          <Progress value={dayProgress} className="h-2" />
          <div className="mt-2 text-xs text-muted-foreground">{habitDoneCount}/{habitCount} habitudes cochées</div>
        </div>
      </section>

      {/* Prochaine habitude */}
      {nextHabit ? (
        <section className="surface-elevated mb-4 flex items-center gap-3 rounded-2xl p-5">
          <button
            aria-label={`Cocher ${nextHabit.title}`}
            onClick={async () => {
              sfx.ok();
              await toggleHabitToday(nextHabit, false);
              qc.invalidateQueries({ queryKey: ["habit_logs"] });
            }}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary"
          >
            <Circle className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Prochaine habitude</div>
            <div className="truncate text-lg text-foreground">{nextHabit.title}</div>
            {nextHabit.mini_version ? (
              <div className="truncate text-xs text-muted-foreground">Version 2 min : {nextHabit.mini_version}</div>
            ) : null}
          </div>
          <Link to="/habits" className="text-xs font-medium text-primary underline-offset-4 hover:underline">Voir tout</Link>
        </section>
      ) : null}

      {/* Tâches du jour */}
      <section className="surface-elevated rounded-2xl p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Tâches du jour</div>
          <Link to="/tasks" className="text-xs font-medium text-primary underline-offset-4 hover:underline">Tout voir</Link>
        </div>
        {todayTasks.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Rien à faire aujourd'hui — profite. <Link to="/tasks" className="text-primary underline-offset-4 hover:underline">Ajouter une tâche</Link>
          </div>
        ) : (
          <ul className="space-y-1">
            {todayTasks.map((t) => (
              <li key={t.id} className="flex min-h-11 items-center gap-3">
                <button
                  aria-label={t.done ? "Marquer non fait" : "Marquer fait"}
                  onClick={async () => { sfx.tick(); await toggleTask(t); qc.invalidateQueries({ queryKey: ["tasks"] }); }}
                  className={cn(
                    "grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-colors",
                    t.done ? "border-primary bg-primary text-primary-foreground" : "border-border text-transparent hover:border-primary",
                  )}
                >
                  <CheckCircle2 className="h-4 w-4" />
                </button>
                <span className={cn("min-w-0 truncate", t.done && "text-muted-foreground line-through")}>{t.title}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Screen>
  );
}

function PriorityRow({ pos, value, onSaved }: { pos: 1 | 2; value?: { id: string; text: string; done: boolean }; onSaved: () => void }) {
  const [editing, setEditing] = useState(!value);
  const [text, setText] = useState(value?.text ?? "");
  useEffect(() => { setText(value?.text ?? ""); setEditing(!value); }, [value]);

  const save = async () => {
    if (!text.trim()) return;
    try { await upsertPriority(pos, text); onSaved(); setEditing(false); sfx.soft(); }
    catch (e) { toast.error((e as Error).message); }
  };
  const toggle = async () => {
    if (!value) return;
    sfx.tick();
    await togglePriority(value);
    onSaved();
  };
  const clear = async () => {
    if (!value) return;
    await deletePriority(value.id);
    onSaved();
  };

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <span className="font-lcd text-lg text-primary">{pos}</span>
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder={`Priorité #${pos}`} onKeyDown={(e) => e.key === "Enter" && save()} />
        <Button size="sm" onClick={save}><Plus className="mr-1 h-3 w-3" />OK</Button>
      </div>
    );
  }
  return (
    <div className="flex min-h-11 items-center gap-3">
      <button
        aria-label={value?.done ? "Marquer non faite" : "Marquer faite"}
        onClick={toggle}
        className={cn(
          "grid h-7 w-7 shrink-0 place-items-center rounded-full border transition-colors",
          value?.done ? "border-primary bg-primary text-primary-foreground" : "border-border text-transparent hover:border-primary",
        )}
      >
        <CheckCircle2 className="h-4 w-4" />
      </button>
      <span className={cn("min-w-0 flex-1 truncate", value?.done && "text-muted-foreground line-through")}>
        {value?.text}
      </span>
      <button onClick={() => setEditing(true)} className="text-xs text-muted-foreground hover:text-foreground">Modifier</button>
      <button onClick={clear} className="text-xs text-muted-foreground hover:text-destructive">×</button>
    </div>
  );
}