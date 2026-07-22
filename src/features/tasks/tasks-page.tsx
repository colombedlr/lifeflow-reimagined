import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Screen } from "@/components/reset/screen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { bucketToday, bucketUpcoming, createTask, deleteTask, tasksQuery, toggleTask, type Task } from "@/features/tasks/api";
import { EmptyState } from "@/components/reset/empty-state";
import { decomposeTask } from "@/features/ai/decompose.functions";
import { sfx } from "@/lib/sounds";
import { cn } from "@/lib/utils";

export function TasksPage() {
  const qc = useQueryClient();
  const tasks = useQuery(tasksQuery);
  const [title, setTitle] = useState("");
  const add = async () => {
    if (!title.trim()) return;
    try { await createTask({ title }); setTitle(""); qc.invalidateQueries({ queryKey: ["tasks"] }); sfx.tick(); }
    catch (e) { toast.error((e as Error).message); }
  };
  const today = (tasks.data ?? []).filter(bucketToday);
  const upcoming = (tasks.data ?? []).filter(bucketUpcoming);
  const all = tasks.data ?? [];

  return (
    <Screen title="Tâches" subtitle="Une action à la fois.">
      <form
        onSubmit={(e) => { e.preventDefault(); add(); }}
        className="surface-elevated mb-4 flex gap-2 rounded-2xl p-2"
      >
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ajouter une tâche…" className="border-0 shadow-none focus-visible:ring-0" />
        <Button type="submit" size="sm"><Plus className="mr-1 h-4 w-4" />Ajouter</Button>
      </form>

      <Tabs defaultValue="today">
        <TabsList className="mb-4 grid w-full grid-cols-3">
          <TabsTrigger value="today">Aujourd'hui {today.length ? `(${today.length})` : ""}</TabsTrigger>
          <TabsTrigger value="upcoming">À venir {upcoming.length ? `(${upcoming.length})` : ""}</TabsTrigger>
          <TabsTrigger value="all">Toutes</TabsTrigger>
        </TabsList>
        <TabsContent value="today"><TaskList items={today} /></TabsContent>
        <TabsContent value="upcoming"><TaskList items={upcoming} /></TabsContent>
        <TabsContent value="all"><TaskList items={all} /></TabsContent>
      </Tabs>
    </Screen>
  );
}

function TaskList({ items }: { items: Task[] }) {
  const qc = useQueryClient();
  const [decompose, setDecompose] = useState<{ title: string; steps: string[] } | null>(null);
  const [busy, setBusy] = useState(false);

  if (!items.length) {
    return <EmptyState title="Rien ici" description="Ajoute une tâche pour commencer." />;
  }
  return (
    <>
      <ul className="space-y-1">
        {items.map((t) => (
          <li key={t.id} className="surface-elevated flex min-h-14 items-center gap-3 rounded-xl px-3">
            <button
              aria-label={t.done ? "Décocher" : "Cocher"}
              onClick={async () => { sfx.tick(); await toggleTask(t); qc.invalidateQueries({ queryKey: ["tasks"] }); }}
              className={cn(
                "grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-colors",
                t.done ? "border-primary bg-primary text-primary-foreground" : "border-border text-transparent hover:border-primary",
              )}
            >
              ✓
            </button>
            <span className={cn("min-w-0 flex-1 truncate", t.done && "text-muted-foreground line-through")}>{t.title}</span>
            {!t.done ? (
              <button
                aria-label="Décomposer avec l'IA"
                onClick={async () => {
                  setBusy(true);
                  try {
                    const res = await decomposeTask({ data: { title: t.title } });
                    setDecompose({ title: t.title, steps: res.steps });
                  } catch (e) { toast.error((e as Error).message); }
                  setBusy(false);
                }}
                disabled={busy}
                className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:text-primary"
              >
                <Sparkles className="h-4 w-4" />
              </button>
            ) : null}
            <button
              aria-label="Supprimer"
              onClick={async () => { await deleteTask(t.id); qc.invalidateQueries({ queryKey: ["tasks"] }); }}
              className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
      <Sheet open={!!decompose} onOpenChange={(o) => !o && setDecompose(null)}>
        <SheetContent side="bottom" className="max-h-[85dvh]">
          <SheetHeader>
            <SheetTitle>Décomposer : {decompose?.title}</SheetTitle>
            <SheetDescription>Étapes suggérées pour débloquer cette tâche.</SheetDescription>
          </SheetHeader>
          <ol className="space-y-2 px-4 py-4">
            {decompose?.steps.map((s, i) => (
              <li key={i} className="flex items-start gap-3 rounded-xl border border-border p-3">
                <span className="font-lcd text-primary">{i + 1}</span>
                <span className="text-sm text-foreground">{s}</span>
              </li>
            ))}
          </ol>
        </SheetContent>
      </Sheet>
    </>
  );
}