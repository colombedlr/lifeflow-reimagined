import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/features/dashboard/dashboard-page";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Aujourd'hui — Reset LifeOS" },
      { name: "description", content: "Ta mission, tes priorités et ta progression du jour, en un coup d'œil." },
      { property: "og:title", content: "Reset LifeOS — Aujourd'hui" },
      { property: "og:description", content: "Ce qui compte vraiment, ici et maintenant." },
    ],
  }),
  component: DashboardPage,
});