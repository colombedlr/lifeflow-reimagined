import { createFileRoute } from "@tanstack/react-router";
import { HabitsPage } from "@/features/habits/habits-page";

export const Route = createFileRoute("/_authenticated/habits")({
  head: () => ({
    meta: [
      { title: "Habitudes — Reset LifeOS" },
      { name: "description", content: "Suis tes rituels quotidiens avec simplicité et garde tes séries en vie." },
      { property: "og:title", content: "Reset LifeOS — Habitudes" },
      { property: "og:description", content: "Rituels simples, tenus dans la durée." },
    ],
  }),
  component: HabitsPage,
});