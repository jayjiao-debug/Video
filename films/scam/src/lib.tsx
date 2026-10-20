/* shared drawing helpers for 《越熬越精神》 */
export const W = 1920, H = 1080;
export type G = CanvasRenderingContext2D;
let seed = 1; export const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; export const setSeed = (s: number) => { seed = s; };
export const SERIF = '"Noto Serif CJK SC"', SANS = '"Noto Sans CJK SC"';
export const GOLD = '#f1c56d', INK = '#f3ede2', RED = '#e5533f', BLUE = '#9cc3ff';
export const clamp = (x: number) => Math.max(0, Math.min(1, x));
export const ramp = (t: number, a: number, d: number) => clamp((t - a) / d);
export const eio = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const eo = (x: number) => 1 - Math.pow(1 - x, 3);
export const back = (x: number) => { const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

export const txt = (g: G, s: string, x: number, y: number, size: number, col: string, o: { w?: number; f?: string; a?: CanvasTextAlign; glow?: string; alpha?: number; ls?: number } = {}) => {
  g.save(); g.globalAlpha *= o.alpha ?? 1; g.font = `${o.w ?? 900} ${size}px ${o.f ?? SANS}`; g.textAlign = o.a ?? 'center'; g.fillStyle = col; if (o.glow) { g.shadowColor = o.glow; g.shadowBlur = 26; }
  if (o.ls) (g as any).letterSpacing = `${o.ls}px`;
  g.fillText(s, x, y); g.restore();
};
export const glow = (g: G, x: number, y: number, r: number, col: string, a: number) => { if (a <= 0) return; const b = g.createRadialGradient(x, y, 0, x, y, r); b.addColorStop(0, `rgba(${col},${a})`); b.addColorStop(0.4, `rgba(${col},${a * 0.35})`); b.addColorStop(1, `rgba(${col},0)`); g.fillStyle = b; g.fillRect(x - r, y - r, 2 * r, 2 * r); };
export const mark = (g: G, a = 1) => txt(g, '◆ Juno · VIBE知识大赏', W - 56, 64, 22, 'rgba(243,237,226,.5)', { w: 500, a: 'right', alpha: a });
export const rr = (g: G, x: number, y: number, w: number, h: number, r: number) => { g.beginPath(); g.roundRect(x, y, w, h, r); };
/* tabular digits so a changing time never shivers */
export const mono = (g: G, s: string, x: number, y: number, size: number, col: string, o: { a?: 'left' | 'center' | 'right'; alpha?: number; glow?: string; f?: string; w?: number } = {}) => {
  const adv = (c: string) => (/[0-9]/.test(c) ? size * 0.62 : c === ':' || c === '.' || c === ',' ? size * 0.32 : c === '%' ? size * 0.95 : /[一-鿿]/.test(c) ? size : size * 0.6);
  const tw = [...s].reduce((a, c) => a + adv(c), 0); let cx = o.a === 'left' ? x : o.a === 'right' ? x - tw : x - tw / 2;
  g.save(); g.globalAlpha *= o.alpha ?? 1; g.font = `${o.w ?? 700} ${size}px ${o.f ?? SANS}`; g.textAlign = 'center'; g.fillStyle = col; if (o.glow) { g.shadowColor = o.glow; g.shadowBlur = 24; }
  for (const c of s) { g.fillText(c, cx + adv(c) / 2, y); cx += adv(c); } g.restore();
};
/* subtitle: 思源黑体 700 68 px, bottom bar, one keyword [gold] or {red} */
export const subtitle = (g: G, s: string, a = 1) => {
  const parts: { t: string; c: string; w: number }[] = []; const re = /\[([^\]]+)\]|\{([^}]+)\}|([^[{]+)/g; let m;
  while ((m = re.exec(s))) parts.push(m[1] ? { t: m[1], c: GOLD, w: 900 } : m[2] ? { t: m[2], c: RED, w: 900 } : { t: m[3], c: INK, w: 700 });
  const b = g.createLinearGradient(0, 900, 0, H); b.addColorStop(0, 'rgba(4,5,9,0)'); b.addColorStop(1, `rgba(4,5,9,${0.8 * a})`); g.fillStyle = b; g.fillRect(0, 900, W, 180);
  g.save(); g.globalAlpha = a; g.textAlign = 'left';
  let tw = 0; for (const p of parts) { g.font = `${p.w} 68px ${SANS}`; tw += g.measureText(p.t).width; }
  let x = W / 2 - tw / 2; const y = 1036;
  for (const p of parts) { g.font = `${p.w} 68px ${SANS}`; g.lineJoin = 'round'; g.lineWidth = 7; g.strokeStyle = 'rgba(0,0,0,.95)'; g.shadowColor = 'rgba(0,0,0,.95)'; g.shadowBlur = 14; g.shadowOffsetY = 2; g.strokeText(p.t, x, y); g.shadowBlur = 0; g.shadowOffsetY = 0; g.fillStyle = p.c; g.fillText(p.t, x, y); x += g.measureText(p.t).width; }
  g.restore();
};
export const grain = (g: G, s = 9, a = 0.05) => { setSeed(s); for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(255,255,255,${rnd() * a})`; g.fillRect(rnd() * W, rnd() * H, 1.5, 1.5); } };
export const vignette = (g: G, a = 0.55) => { const v = g.createRadialGradient(960, 540, 350, 960, 540, 1200); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,0,0,${a})`); g.fillStyle = v; g.fillRect(0, 0, W, H); };
export const FONT_CHARS = '◆·JunoVIBE知识大赏0123456789:%+-—，。？：、①②③《》';
