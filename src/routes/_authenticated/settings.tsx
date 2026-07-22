import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Screen } from "@/components/reset/screen";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { profileQuery, settingsQuery, updateSettings } from "@/features/settings/api";
import { supabase } from "@/integrations/supabase/client";
import { THEMES, applyTheme, type ThemeName } from "@/lib/theme";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Réglages — Reset LifeOS" },
      { name: "description", content: "Choisis ton ambiance, ton style sonore et gère ton compte." },
      { property: "og:title", content: "Reset LifeOS — Réglages" },
      { property: "og:description", content: "Ajuste l'app à ton rythme." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const qc = useQueryClient();
  const nav = useNavigate();
  const settings = useQuery(settingsQuery);
  const profile = useQuery(profileQuery);
  const s = settings.data;

  const set = async (patch: Parameters<typeof updateSettings>[0]) => {
    if (patch.theme) applyTheme(patch.theme);
    await updateSettings(patch);
    qc.invalidateQueries({ queryKey: ["settings"] });
  };

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    toast("À bientôt");
    nav({ to: "/auth", replace: true });
  };

  return (
    <Screen title="Réglages" subtitle={profile.data?.display_name ? `Connecté·e comme ${profile.data.display_name}` : "Compte et ambiance"}>
      {/* Thème */}
      <section className="surface-elevated mb-4 rounded-2xl p-5">
        <div className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Ambiance</div>
        <div className="grid grid-cols-4 gap-2">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => set({ theme: t.id as ThemeName })}
              className={cn(
                "group flex flex-col items-center gap-2 rounded-2xl border p-3 transition-all",
                s?.theme === t.id ? "border-primary shadow-sm" : "border-border hover:border-primary/50",
              )}
            >
              <span className="h-10 w-10 rounded-full border border-border" style={{ background: t.swatch }} />
              <span className="text-xs text-foreground">{t.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Toggles */}
      <section className="surface-elevated mb-4 space-y-4 rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <Label>Micro-sons rétro</Label>
            <p className="text-xs text-muted-foreground">Petites confirmations sonores.</p>
          </div>
          <Switch checked={s?.sounds_enabled ?? true} onCheckedChange={(v) => set({ sounds_enabled: v })} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label>Ambiance lo-fi en focus</Label>
            <p className="text-xs text-muted-foreground">Bourdon musical pendant le mode focus.</p>
          </div>
          <Switch checked={s?.lofi_enabled ?? true} onCheckedChange={(v) => set({ lofi_enabled: v })} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label>Ornements Y2K</Label>
            <p className="text-xs text-muted-foreground">Papillons et volutes en fond.</p>
          </div>
          <Switch checked={s?.decorations_enabled ?? true} onCheckedChange={(v) => set({ decorations_enabled: v })} />
        </div>
      </section>

      <section className="surface-elevated rounded-2xl p-5">
        <div className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Compte</div>
        <Button variant="outline" onClick={signOut} className="w-full">Se déconnecter</Button>
      </section>
    </Screen>
  );
}