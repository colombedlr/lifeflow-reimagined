import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { settingsQuery } from "@/features/settings/api";
import { applyTheme } from "@/lib/theme";

export function ThemeBoot() {
  const { data } = useQuery(settingsQuery);
  useEffect(() => {
    applyTheme(data?.theme ?? "rose");
  }, [data?.theme]);
  return null;
}