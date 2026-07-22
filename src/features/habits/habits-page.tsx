import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Flame, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Screen } from "@/components/reset/screen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetDescription } from "@/components/ui/sheet";
import { archiveHabit, createHabit, habitLogsQuery, habitsQuery, streakFor, toggleHabitToday, type Habit } from "@/features/habits/api";
import { EmptyState } from "@/components/reset/empty-state";
import { sfx } from "@/lib/sounds";
import { todayISO } from "@/lib/date";
import { cn } from "@/lib/utils";

export function HabitsPage() {
  const qc = useQueryClient();
  const habits = useQuery(habitsQuery);
  const logs = useQuery(habitLogsQuery(30));
  const doneToday = new Set(logs.data?.filter((l) => l.log_date === todayISO() && l.done).map((l) => l.habit_id));

  return (
    <Screen title="Habitudes" subtitle="Rituels simples, tenus dans la durée." action={<NewHabitSheet onDone={() => qc.invalidateQueries({ queryKey: ["habits"] })} />}>
      {(habits.data?.length ?? 0) === 0 ? (
        <EmptyState
          title="Commence par une seule habitude"
          description="Choisis-en une petite, ancrée dans ton quotidien. Tu en ajouteras d'autres plus tard."
          action={<NewHabitSheet onDone={() => qc.invalidateQueries({ queryKey: ["habits"] })} />}
        />
      ) : (
        <ul className="space-y-2">
          {habits.data!.map((h) => (
            <HabitRow key={h.id} habit={h} done={doneToday.has(h.id)} streak={streakFor(h.id, logs.data ?? [])}
              onToggle={async () => {
                sfx.ok();
                await toggleHabitToday(h, doneToday.has(h.id));
                qc.invalidateQueries({ queryKey: ["habit_logs"] });
              }}
              onArchive={async () => {
                await archiveHabit(h.id);
                qc.invalidateQueries({ queryKey: ["habits"] });
                toast("Habitude archivée");
              }}
            />
          ))}
        </ul>
      )}
    </Screen>
  );
}

function HabitRow({ habit, done, streak, onToggle, onArchive }: { habit: Habit; done: boolean; streak: number; onToggle: () => void; onArchive: () => void }) {
  return (
    <li className="surface-elevated flex items-center gap-3 rounded-2xl p-4">
      <button
        aria-label={done ? "Décocher" : "Cocher pour aujourd'hui"}
        onClick={onToggle}
        className={cn(
          "grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 transition-all",
          done ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-border text-transparent hover:border-primary",
        )}
      >
        <span className="text-xl">✓</span>
      </button>
      <div className="min-w-0 flex-1">
        <div className="truncate text-base text-foreground">{habit.title}</div>
        {habit.mini_version ? <div className="truncate text-xs text-muted-foreground">2 min : {habit.mini_version}</div> : null}
      </div>
      {streak > 0 ? (
        <div className="flex items-center gap-1 rounded-full bg-accent px-2 py-1 text-xs font-medium text-accent-foreground">
          <Flame className="h-3 w-3" /> {streak}
        </div>
      ) : null}
      <button aria-label="Archiver" onClick={onArchive} className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:text-destructive">
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
}

function NewHabitSheet({ onDone }: { onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [mini, setMini] = useState("");
  const submit = async () => {
    if (!title.trim()) return;
    try { await createHabit({ title, mini_version: mini || null }); onDone(); setTitle(""); setMini(""); setOpen(false); sfx.ok(); }
    catch (e) { toast.error((e as Error).message); }
  };
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" />Nouvelle</Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[85dvh]">
        <SheetHeader>
          <SheetTitle>Ajouter une habitude</SheetTitle>
          <SheetDescription>Commence petit. La régularité prime sur l'intensité.</SheetDescription>
        </SheetHeader>
        <div className="space-y-3 px-4 py-4">
          <Input placeholder="Ex. Méditer" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          <Input placeholder="Version 2 min (optionnel)" value={mini} onChange={(e) => setMini(e.target.value)} />
        </div>
        <SheetFooter>
          <Button onClick={submit} className="w-full">Créer</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}