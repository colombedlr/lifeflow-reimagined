import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { todayISO } from "@/lib/date";

export type Priority = { id: string; the_date: string; position: number; text: string; done: boolean };

export const prioritiesTodayQuery = queryOptions({
  queryKey: ["priorities", "today"],
  queryFn: async (): Promise<Priority[]> => {
    const { data, error } = await supabase
      .from("priorities").select("*").eq("the_date", todayISO()).order("position");
    if (error) throw error;
    return (data ?? []) as unknown as Priority[];
  },
});

export async function upsertPriority(position: 1 | 2, text: string) {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) throw new Error("Non connecté");
  const { error } = await supabase.from("priorities").upsert(
    { user_id: uid, the_date: todayISO(), position, text: text.trim(), done: false },
    { onConflict: "user_id,the_date,position" },
  );
  if (error) throw error;
}

export async function togglePriority(p: Priority) {
  const { error } = await supabase.from("priorities").update({ done: !p.done }).eq("id", p.id);
  if (error) throw error;
}

export async function deletePriority(id: string) {
  const { error } = await supabase.from("priorities").delete().eq("id", id);
  if (error) throw error;
}