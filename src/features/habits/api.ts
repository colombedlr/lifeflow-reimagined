import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { addDays, todayISO } from "@/lib/date";

export type Habit = {
  id: string;
  title: string;
  goal_id: string | null;
  mini_version: string | null;
  archived: boolean;
  created_at: string;
};

export type HabitLog = { id: string; habit_id: string; log_date: string; done: boolean };

export const habitsQuery = queryOptions({
  queryKey: ["habits"],
  queryFn: async (): Promise<Habit[]> => {
    const { data, error } = await supabase
      .from("habits").select("*").eq("archived", false).order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []) as unknown as Habit[];
  },
});

export const habitLogsQuery = (days = 30) =>
  queryOptions({
    queryKey: ["habit_logs", days],
    queryFn: async (): Promise<HabitLog[]> => {
      const from = addDays(todayISO(), -days + 1);
      const { data, error } = await supabase
        .from("habit_logs").select("*").gte("log_date", from);
      if (error) throw error;
      return (data ?? []) as unknown as HabitLog[];
    },
  });

export async function toggleHabitToday(habit: Habit, currentlyDone: boolean) {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) throw new Error("Non connecté");
  const date = todayISO();
  if (currentlyDone) {
    const { error } = await supabase.from("habit_logs").delete().eq("habit_id", habit.id).eq("log_date", date);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("habit_logs").upsert(
      { user_id: uid, habit_id: habit.id, log_date: date, done: true },
      { onConflict: "habit_id,log_date" },
    );
    if (error) throw error;
  }
}

export async function createHabit(input: { title: string; mini_version?: string | null; goal_id?: string | null }) {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) throw new Error("Non connecté");
  const { error } = await supabase.from("habits").insert({
    user_id: uid,
    title: input.title.trim(),
    mini_version: input.mini_version?.trim() || null,
    goal_id: input.goal_id || null,
  });
  if (error) throw error;
}

export async function archiveHabit(id: string) {
  const { error } = await supabase.from("habits").update({ archived: true }).eq("id", id);
  if (error) throw error;
}

export function streakFor(habitId: string, logs: HabitLog[]) {
  const doneSet = new Set(logs.filter((l) => l.habit_id === habitId && l.done).map((l) => l.log_date));
  let n = 0;
  let d = todayISO();
  while (doneSet.has(d)) { n++; d = addDays(d, -1); }
  return n;
}