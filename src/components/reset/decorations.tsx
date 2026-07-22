// Discrete Y2K ornaments (butterflies, flourishes) in the background.
// Respects prefers-reduced-motion and can be toggled off via settings.
export function Decorations({ enabled }: { enabled: boolean }) {
  if (!enabled) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <svg className="absolute -top-24 -left-24 h-96 w-96 opacity-70 motion-safe:animate-[spin_120s_linear_infinite]" viewBox="0 0 200 200" fill="none">
        <path d="M100 20 C 140 40, 160 80, 100 100 C 40 120, 60 160, 100 180" stroke="var(--decor-color)" strokeWidth="1" />
        <circle cx="100" cy="100" r="70" stroke="var(--decor-color)" strokeWidth="0.5" />
      </svg>
      <svg className="absolute bottom-8 right-8 h-24 w-24 opacity-60" viewBox="0 0 100 100" fill="none">
        <path d="M50 50 C 20 20, 20 60, 50 50 C 80 40, 80 80, 50 50 Z" fill="var(--decor-color)" />
      </svg>
      <svg className="absolute top-1/3 right-10 h-16 w-16 opacity-40 motion-safe:animate-[pulse_6s_ease-in-out_infinite]" viewBox="0 0 60 60" fill="none">
        <path d="M30 30 C 12 12, 12 40, 30 30 C 48 20, 48 48, 30 30 Z" fill="var(--decor-color)" />
      </svg>
    </div>
  );
}