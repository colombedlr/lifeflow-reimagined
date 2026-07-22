// Ornements Y2K : sparkles 4 branches, papillon, anneau chromé.
// Respecte prefers-reduced-motion et se désactive via les réglages.

function Sparkle({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 0 C 13.2 7.4, 16.6 10.8, 24 12 C 16.6 13.2, 13.2 16.6, 12 24 C 10.8 16.6, 7.4 13.2, 0 12 C 7.4 10.8, 10.8 7.4, 12 0 Z"
        fill="var(--decor-color)"
      />
    </svg>
  );
}

export function Decorations({ enabled }: { enabled: boolean }) {
  if (!enabled) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Anneau chromé qui tourne lentement */}
      <svg
        className="absolute -top-28 -left-28 h-[26rem] w-[26rem] motion-safe:animate-[spin_140s_linear_infinite]"
        viewBox="0 0 200 200"
        fill="none"
      >
        <circle cx="100" cy="100" r="72" stroke="var(--decor-color)" strokeWidth="10" />
        <circle cx="100" cy="100" r="72" stroke="var(--gloss-hi)" strokeWidth="2" strokeDasharray="40 300" strokeLinecap="round" />
        <circle cx="100" cy="100" r="52" stroke="var(--decor-color)" strokeWidth="1" />
      </svg>

      {/* Sparkles scintillants */}
      <Sparkle className="absolute right-[8%] top-[14%] motion-safe:animate-[pulse_5s_ease-in-out_infinite]" size={34} />
      <Sparkle className="absolute right-[14%] top-[22%] opacity-70 motion-safe:animate-[pulse_7s_ease-in-out_1.5s_infinite]" size={16} />
      <Sparkle className="absolute left-[10%] bottom-[26%] opacity-80 motion-safe:animate-[pulse_6s_ease-in-out_0.8s_infinite]" size={22} />
      <Sparkle className="absolute right-[24%] bottom-[10%] opacity-60 motion-safe:animate-[pulse_8s_ease-in-out_2.2s_infinite]" size={14} />

      {/* Papillon Y2K */}
      <svg className="absolute bottom-10 right-8 h-24 w-24 motion-safe:animate-[pulse_9s_ease-in-out_infinite]" viewBox="0 0 100 100" fill="none">
        <path d="M50 48 C 24 16, 8 40, 30 54 C 12 62, 26 84, 48 60" fill="var(--decor-color)" />
        <path d="M50 48 C 76 16, 92 40, 70 54 C 88 62, 74 84, 52 60" fill="var(--decor-color)" />
        <path d="M50 40 C 46 30, 42 26, 38 24 M50 40 C 54 30, 58 26, 62 24" stroke="var(--decor-color)" strokeWidth="1.6" strokeLinecap="round" />
        <ellipse cx="50" cy="52" rx="2.6" ry="12" fill="var(--decor-color)" />
      </svg>
    </div>
  );
}
