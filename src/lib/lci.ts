// Life Control Index — simplified port of the reference algorithm.
export function computeLCI(input: {
  habitsDone: number;
  habitsTotal: number;
  tasksDone: number;
  prioritiesDone: number;
  journalDays: number;
}) {
  const habits = input.habitsTotal
    ? Math.min(1, input.habitsDone / (input.habitsTotal * 7))
    : 0;
  const tasks = Math.min(1, input.tasksDone / 10);
  const priorities = Math.min(1, input.prioritiesDone / 14);
  const journal = Math.min(1, input.journalDays / 7);
  const raw = habits * 40 + tasks * 25 + priorities * 25 + journal * 10;
  return Math.round(raw);
}

export function lciLabel(v: number) {
  if (v >= 80) return "En pleine maîtrise";
  if (v >= 60) return "Belle dynamique";
  if (v >= 40) return "En construction";
  if (v >= 20) return "À réamorcer";
  return "Début du reset";
}