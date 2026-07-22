import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Decorations } from "@/components/reset/decorations";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Se connecter — Reset LifeOS" },
      { name: "description", content: "Connecte-toi à Reset LifeOS pour retrouver ton tableau de bord personnel." },
      { property: "og:title", content: "Reset LifeOS — Connexion" },
      { property: "og:description", content: "Retrouve ton parcours et tes habitudes." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Bon retour ✨");
    navigate({ to: "/" });
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { display_name: name || null },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Compte créé — tu peux te connecter.");
  }

  async function google() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    setBusy(false);
    if (result.error) return toast.error(result.error.message ?? "Connexion Google indisponible");
    if (result.redirected) return;
    navigate({ to: "/" });
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-background px-4 py-10 text-foreground">
      <Decorations enabled />
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 h-10 w-10 rounded-2xl bg-primary" />
          <h1 className="font-serif text-3xl">Reset LifeOS</h1>
          <p className="mt-1 text-sm text-muted-foreground">Ta boussole du quotidien.</p>
        </div>
        <div className="glass rounded-3xl p-6">
          <Tabs defaultValue="in">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="in">Connexion</TabsTrigger>
              <TabsTrigger value="up">Inscription</TabsTrigger>
            </TabsList>
            <TabsContent value="in" className="mt-4">
              <form className="space-y-3" onSubmit={signIn}>
                <div className="space-y-1.5">
                  <Label htmlFor="in-email">Email</Label>
                  <Input id="in-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="in-pass">Mot de passe</Label>
                  <Input id="in-pass" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button className="w-full" disabled={busy}>Se connecter</Button>
              </form>
            </TabsContent>
            <TabsContent value="up" className="mt-4">
              <form className="space-y-3" onSubmit={signUp}>
                <div className="space-y-1.5">
                  <Label htmlFor="up-name">Prénom</Label>
                  <Input id="up-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Optionnel" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="up-email">Email</Label>
                  <Input id="up-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="up-pass">Mot de passe</Label>
                  <Input id="up-pass" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button className="w-full" disabled={busy}>Créer un compte</Button>
              </form>
            </TabsContent>
          </Tabs>
          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> ou <div className="h-px flex-1 bg-border" />
          </div>
          <Button variant="outline" className="w-full" onClick={google} disabled={busy}>
            Continuer avec Google
          </Button>
        </div>
      </div>
    </div>
  );
}