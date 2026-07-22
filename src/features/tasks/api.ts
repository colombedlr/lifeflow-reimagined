import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { todayISO } from "@/lib/date";

export type Task = {
  id: string;
  title: string;
  done: boolean;
  due_date: string | null;
  priority: number;
  project_id: string | null;
  goal_id: string | null;
  notes: string | null;
  created_at: string;
};

export const tasksQuery = queryOptions({
  queryKey: ["tasks"],
  queryFn: async (): Promise<Task[]> => {
    const { data, error } = await supabase
      .from("tasks").select("*")
      .order("done")
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("created_at");
    if (error) throw error;
    return (data ?? []) as unknown as Task[];
  },
});

export async function createTask(input: { title: string; due_date?: string | null }) {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) throw new Error("Non connecté");
  const { error } = await supabase.from("tasks").insert({
    user_id: uid,
    title: input.title.trim(),
    due_date: input.due_date ?? null,
  });
  if (error) throw error;
}

export async function toggleTask(t: Task) {
  const { error } = await supabase.from("tasks").update({ done: !t.done }).eq("id", t.id);
  if (error) throw error;
}

export async function deleteTask(id: string) {
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw error;
}

export const bucketToday = (t: Task) => !t.done && (!t.due_date || t.due_date <= todayISO());
export const bucketUpcoming = (t: Task) => !t.done && !!t.due_date && t.due_date > todayISO();