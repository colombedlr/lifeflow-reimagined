// Web Audio ambient + micro sfx, lazy.
let ctx: AudioContext | null = null;
let lofiHandle: { stop: () => void } | null = null;

function getCtx() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

export function tone(freq: number, dur = 0.08, type: OscillatorType = "sine", vol = 0.04) {
  const c = getCtx();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.value = 0;
  g.gain.linearRampToValueAtTime(vol, c.currentTime + 0.005);
  g.gain.linearRampToValueAtTime(0, c.currentTime + dur);
  o.connect(g).connect(c.destination);
  o.start();
  o.stop(c.currentTime + dur + 0.02);
}

export const sfx = {
  tick: () => tone(880, 0.05, "square", 0.03),
  ok: () => { tone(660, 0.08, "sine", 0.05); setTimeout(() => tone(990, 0.09, "sine", 0.05), 60); },
  soft: () => tone(520, 0.09, "sine", 0.03),
};

export function startLofi() {
  const c = getCtx();
  if (!c || lofiHandle) return;
  const chord = [220, 277.18, 329.63, 415.3];
  const oscs = chord.map((f) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "sine";
    o.frequency.value = f;
    g.gain.value = 0.015;
    o.connect(g).connect(c.destination);
    o.start();
    return { o, g };
  });
  const iv = window.setInterval(() => {
    oscs.forEach((n) => {
      n.g.gain.linearRampToValueAtTime(0.005 + Math.random() * 0.015, c.currentTime + 1.5);
    });
  }, 1600);
  lofiHandle = {
    stop: () => {
      window.clearInterval(iv);
      oscs.forEach((n) => {
        try { n.g.gain.linearRampToValueAtTime(0, c.currentTime + 0.4); n.o.stop(c.currentTime + 0.5); } catch { /* noop */ }
      });
      lofiHandle = null;
    },
  };
}

export function stopLofi() { lofiHandle?.stop(); }