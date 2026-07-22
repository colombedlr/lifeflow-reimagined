export const todayISO = () => {
  const d = new Date();
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 10);
};

export const addDays = (iso: string, n: number) => {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

export const greetingFor = (name?: string | null) => {
  const h = new Date().getHours();
  const base = h < 5 ? "Bonne nuit" : h < 12 ? "Bonjour" : h < 18 ? "Bel après-midi" : "Bonsoir";
  return name ? `${base}, ${name}` : base;
};

export const formatFR = (iso: string) => {
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("fr-FR", {
      weekday: "long", day: "numeric", month: "long",
    });
  } catch { return iso; }
};