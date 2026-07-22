import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Screen } from "@/components/reset/screen";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { todayISO, formatFR } from "@/lib/date";

const journalTodayQuery = queryOptions({
  queryKey: ["journal", "today"],
  queryFn: async () => {
    const { data, error } = await supabase.from("journal_entries").select("*").eq("entry_date", todayISO()).maybeSingle();
    if (error) throw error;
    return data as { id: string; content: string; mood: number | null } | null;
  },
});

export const Route = createFileRoute("/_authenticated/journal")({
  head: () => ({
    meta: [
      { title: "Journal — Reset LifeOS" },
      { name: "description", content: "Un espace calme pour noter ta journée, sans pression." },
      { property: "og:title", content: "Reset LifeOS — Journal" },
      { property: "og:description", content: "Un espace calme pour poser tes pensées." },
    ],
  }),
  component: JournalPage,
});

function JournalPage() {
  const qc = useQueryClient();
  const entry = useQuery(journalTodayQuery);
  const [text, setText] = useState("");
  useEffect(() => { setText(entry.data?.content ?? ""); }, [entry.data?.content]);

  const save = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) return;
    const { error } = await supabase.from("journal_entries").upsert(
      { user_id: uid, entry_date: todayISO(), content: text },
      { onConflict: "user_id,entry_date" },
    );
    if (error) return toast.error(error.message);
    toast.success("Journal enregistré");
    qc.invalidateQueries({ queryKey: ["journal"] });
  };

  return (
    <Screen title="Journal" subtitle={formatFR(todayISO())}>
      <div className="surface-elevated rounded-2xl p-4">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Comment s'est passée ta journée ? Qu'est-ce que tu as appris ?"
          rows={12}
          className="resize-none border-0 text-base shadow-none focus-visible:ring-0"
        />
        <div className="mt-3 flex justify-end">
          <Button onClick={save}>Enregistrer</Button>
        </div>
      </div>
    </Screen>
  );
}