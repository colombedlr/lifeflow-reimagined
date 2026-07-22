import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Screen } from "@/components/reset/screen";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/reset/empty-state";
import { supabase } from "@/integrations/supabase/client";

const goalsQuery = queryOptions({
  queryKey: ["goals"],
  queryFn: async () => {
    const { data, error } = await supabase.from("goals").select("*").eq("archived", false).order("created_at");
    if (error) throw error;
    return (data ?? []) as { id: string; title: string; domain: string | null }[];
  },
});

export const Route = createFileRoute("/_authenticated/goals")({
  head: () => ({
    meta: [
      { title: "Objectifs — Reset LifeOS" },
      { name: "description", content: "Nomme ce vers quoi tu veux avancer. Peu d'objectifs, bien choisis." },
      { property: "og:title", content: "Reset LifeOS — Objectifs" },
      { property: "og:description", content: "Peu d'objectifs, bien choisis." },
    ],
  }),
  component: GoalsPage,
});

function GoalsPage() {
  const qc = useQueryClient();
  const goals = useQuery(goalsQuery);
  const [title, setTitle] = useState("");
  const add = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid || !title.trim()) return;
    const { error } = await supabase.from("goals").insert({ user_id: uid, title: title.trim() });
    if (error) return toast.error(error.message);
    setTitle("");
    qc.invalidateQueries({ queryKey: ["goals"] });
  };

  return (
    <Screen title="Objectifs" subtitle="Ce vers quoi tu veux avancer.">
      <form onSubmit={(e) => { e.preventDefault(); add(); }} className="surface-elevated mb-4 flex gap-2 rounded-2xl p-2">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex. Publier mon site" className="border-0 shadow-none focus-visible:ring-0" />
        <Button type="submit" size="sm"><Plus className="mr-1 h-4 w-4" />Ajouter</Button>
      </form>
      {(goals.data?.length ?? 0) === 0 ? (
        <EmptyState title="Aucun objectif" description="Nomme le premier pour donner un cap à tes habitudes et tes tâches." />
      ) : (
        <ul className="space-y-2">
          {goals.data!.map((g) => (
            <li key={g.id} className="surface-elevated rounded-2xl p-4">
              <div className="font-serif text-lg text-foreground">{g.title}</div>
              {g.domain ? <div className="text-xs text-muted-foreground">{g.domain}</div> : null}
            </li>
          ))}
        </ul>
      )}
    </Screen>
  );
}