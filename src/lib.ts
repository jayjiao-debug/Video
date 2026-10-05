import TL from './timeline.json';

/* 《越过越快》: a voice-over data essay. Every visual is a pure function of the global time T (seconds).
   The timeline (timeline.json) is built by scripts/timeline.py from the voice-over clips: each line's start and end,
   the chapter starts (snapped to the music's beats), the caption chunks, the film length and the music offset. */
export const FPS = 30;
export const W = 1920;
export const H = 1080;

export type TLine = { id: string; ch: string; a: number; z: number; text: string; tts: string; w: [number, number][]; chunks: [number, number, string][] };
export type TChapter = { id: string; a: number; z: number };
export const TIMELINE = TL as unknown as { lines: TLine[]; chapters: TChapter[]; end: number; title: number; beats: number[]; endCard: number };
export const FILM_END = TIMELINE.end;
export const FILM_FRAMES = Math.round(FILM_END * FPS);

const BY_ID: Record<string, TLine> = Object.fromEntries(TIMELINE.lines.map((l) => [l.id, l]));
/** start / end of a voice-over line */
export const L = (id: string) => BY_ID[id];
/** the moment the voice says `s` (as written in the TTS text) inside line `id` */
export const at = (id: string, s: string) => {
  const l = BY_ID[id]; const i = l.tts.indexOf(s);
  if (i < 0) throw new Error(`"${s}" not in line ${id}`);
  const m = l.w.find(([p]) => p >= i) ?? l.w[l.w.length - 1];
  const prev = [...l.w].reverse().find(([p]) => p <= i);
  return prev && prev[0] === i ? prev[1] : m ? m[1] : l.a;
};
export const CH = (id: string) => TIMELINE.chapters.find((c) => c.id === id)!;
/** the film-time beat nearest to t (for hits that should land on the music) */
export const beatNear = (t: number) => TIMELINE.beats.reduce((p, b) => (Math.abs(b - t) < Math.abs(p - t) ? b : p), TIMELINE.beats[0]);
export const beatAfter = (t: number) => TIMELINE.beats.find((b) => b >= t) ?? t;

export const ZH = '"Noto Serif CJK SC", "Noto Serif SC", serif';
export const SANS = '"Noto Sans CJK SC", "Noto Sans SC", sans-serif';
export const MONO = '"JunoMono", "DejaVu Sans Mono", monospace';
export const EN = '"Cormorant Garamond", Georgia, serif';

// palette: charcoal night, paper ink, signal red (time / now), cyan (memory), gold (brand + the answer)
export const BG = '#0b0c10';
export const INK = '#ece8df';
export const DIM = 'rgba(236,232,223,0.42)';
export const FAINT = 'rgba(236,232,223,0.14)';
export const RED = '#ff5a45';
export const CYAN = '#56d2e2';
export const GOLD = '#f1c56d';

export const clamp = (x: number, a = 0, c = 1) => Math.max(a, Math.min(c, x));
export const prog = (t: number, a: number, z: number) => clamp((t - a) / (z - a));
export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
export const easeIn = (x: number) => x * x * x;
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const lerp = (a: number, z: number, x: number) => a + (z - a) * x;
/** in over [a, a+fin], out over [z-fout, z] */
export const inOut = (t: number, a: number, z: number, fin = 0.4, fout = 0.35) => Math.min(easeOut(prog(t, a, a + fin)), 1 - prog(t, z - fout, z));
export const pop = (T: number, a: number, d = 0.3) => {
  const k = clamp((T - a) / d);
  return k <= 0 ? 0 : easeOut(k) + 0.14 * Math.sin(k * Math.PI) * (1 - k);
};
export const mulberry = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
export const rnd = (i: number, k = 0) => mulberry(i * 7919 + k * 104729 + 17)();
export const fmt = (n: number, d = 0) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
