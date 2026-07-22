export type ThemeName = "rose" | "chrome" | "pop" | "nuit";

export const THEMES: { id: ThemeName; label: string; swatch: string }[] = [
  { id: "rose", label: "Rose", swatch: "oklch(0.65 0.21 355)" },
  { id: "chrome", label: "Chrome", swatch: "oklch(0.58 0.14 235)" },
  { id: "pop", label: "Pop", swatch: "oklch(0.63 0.26 345)" },
  { id: "nuit", label: "Nuit", swatch: "oklch(0.74 0.19 350)" },
];

export const themeClass = (t: ThemeName) => `theme-${t}`;

export const applyTheme = (t: ThemeName) => {
  if (typeof document === "undefined") return;
  const el = document.documentElement;
  ["theme-rose", "theme-chrome", "theme-pop", "theme-nuit"].forEach((c) => el.classList.remove(c));
  el.classList.add(themeClass(t));
  if (t === "nuit") el.classList.add("dark");
  else el.classList.remove("dark");
};
