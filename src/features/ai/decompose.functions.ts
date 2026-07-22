import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";

const Input = z.object({ title: z.string().min(1).max(200) });

export const decomposeTask = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => Input.parse(raw))
  .handler(async ({ data }): Promise<{ steps: string[] }> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) return { steps: localDecompose(data.title) };
    try {
      const { createLovableAI } = await import("@/lib/ai-gateway.server");
      const gateway = createLovableAI(apiKey);
      const { output } = await generateText({
        model: gateway("openai/gpt-5.6-luna"),
        output: Output.object({ schema: z.object({ steps: z.array(z.string()).min(3).max(5) }) }),
        prompt:
          `Décompose cette tâche en 3 à 5 micro-étapes concrètes, actionnables en moins de 20 minutes chacune. Réponds en français, verbe à l'infinitif. Tâche: ${data.title}`,
      });
      return { steps: output.steps.slice(0, 5) };
    } catch (e) {
      console.error("decomposeTask fallback", e);
      return { steps: localDecompose(data.title) };
    }
  });

function localDecompose(title: string): string[] {
  const t = title.trim();
  return [
    `Clarifier l'intention de « ${t} »`,
    `Lister les 3 blocages potentiels`,
    `Faire la première action de 5 minutes`,
    `Programmer un créneau de 25 minutes`,
  ];
}