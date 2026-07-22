import { createFileRoute } from "@tanstack/react-router";
import { TasksPage } from "@/features/tasks/tasks-page";

export const Route = createFileRoute("/_authenticated/tasks")({
  head: () => ({
    meta: [
      { title: "Tâches — Reset LifeOS" },
      { name: "description", content: "Capture rapidement, avance sereinement. Une action à la fois." },
      { property: "og:title", content: "Reset LifeOS — Tâches" },
      { property: "og:description", content: "Une action à la fois." },
    ],
  }),
  component: TasksPage,
});