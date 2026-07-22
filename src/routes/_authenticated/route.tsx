import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { SideNav, BottomNav } from "@/components/reset/nav";
import { Decorations } from "@/components/reset/decorations";
import { useQuery } from "@tanstack/react-query";
import { settingsQuery } from "@/features/settings/api";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: Shell,
});

function Shell() {
  const { data: settings } = useQuery(settingsQuery);
  return (
    <div className="relative flex min-h-dvh w-full bg-background text-foreground">
      <Decorations enabled={settings?.decorations_enabled ?? true} />
      <SideNav />
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}