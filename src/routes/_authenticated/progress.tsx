import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Screen } from "@/components/reset/screen";
import { habitLogsQuery, habitsQuery } from "@/features/habits/api";
import { tasksQuery } from "@/features/tasks/api";
import { computeLCI, lciLabel } from "@/lib/lci";
import { addDays, todayISO } from "@/lib/date";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/progress")({
  head: () => ({
    meta: [
      { title: "Progression — Reset LifeOS" },
      { name: "description", content: "Ton Indice de Contrôle de Vie sur 7 jours, avec ce qui pousse et ce qui freine." },
      { property: "og:title", content: "Reset LifeOS — Progression" },
      { property: "og:description", content: "L'image nette de ta semaine." },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const habits = useQuery(habitsQuery);
  const logs = useQuery(habitLogsQuery(7));
  const tasks = useQuery(tasksQuery);

  const days7: string[] = [];
  for (let i = 6; i >= 0; i--) days7.push(addDays(todayISO(), -i));

  const habitDoneCount = (logs.data ?? []).filter((l) => l.done && days7.includes(l.log_date)).length;
  const tasksDone = (tasks.data ?? []).filter((t) => t.done).length;
  const lci = computeLCI({
    habitsDone: habitDoneCount,
    habitsTotal: habits.data?.length ?? 0,
    tasksDone,
    prioritiesDone: 0,
    journalDays: 0,
  });

  return (
    <Screen title="Progression" subtitle="Ta semaine, en un chiffre.">
      <section className="surface-elevated mb-4 rounded-2xl p-6 text-center">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Indice de contrôle de vie</div>
        <div className="my-2 font-lcd text-7xl text-primary">{lci}</div>
        <div className="text-sm text-muted-foreground">{lciLabel(lci)}</div>
        <div className="mt-4"><Progress value={lci} className="h-2" /></div>
      </section>
      <section className="surface-elevated grid grid-cols-3 gap-4 rounded-2xl p-6 text-center">
        <div>
          <div className="font-lcd text-3xl text-primary">{habitDoneCount}</div>
          <div className="text-xs text-muted-foreground">Habitudes / 7j</div>
        </div>
        <div>
          <div className="font-lcd text-3xl text-primary">{tasksDone}</div>
          <div className="text-xs text-muted-foreground">Tâches faites</div>
        </div>
        <div>
          <div className="font-lcd text-3xl text-primary">{habits.data?.length ?? 0}</div>
          <div className="text-xs text-muted-foreground">Rituels actifs</div>
        </div>
      </section>
    </Screen>
  );
}