import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ThemeName } from "@/lib/theme";

export type SettingsRow = {
  user_id: string;
  theme: ThemeName;
  sounds_enabled: boolean;
  lofi_enabled: boolean;
  decorations_enabled: boolean;
  custom_mission: Record<string, string>;
};

export const settingsQuery = queryOptions({
  queryKey: ["settings"],
  queryFn: async (): Promise<SettingsRow | null> => {
    const { data, error } = await supabase.from("settings").select("*").maybeSingle();
    if (error) throw error;
    return (data as unknown as SettingsRow) ?? null;
  },
});

export async function updateSettings(patch: Partial<Omit<SettingsRow, "user_id">>) {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) throw new Error("Non connecté");
  const { error } = await supabase.from("settings").upsert({ user_id: uid, ...patch });
  if (error) throw error;
}

export const profileQuery = queryOptions({
  queryKey: ["profile"],
  queryFn: async () => {
    const { data, error } = await supabase.from("profiles").select("*").maybeSingle();
    if (error) throw error;
    return data as { id: string; display_name: string | null; archetype: string | null; onboarding_done: boolean } | null;
  },
});