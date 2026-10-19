/* 《你能出生，有多难》 gate 2a: three looks of the inverted family tree, two frames each (hook / the net + the one golden line). */
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';

export const W = 1920, H = 1080;
export type G = CanvasRenderingContext2D;
let seed = 1; export const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; export const setSeed = (s: number) => { seed = s; };
export const SERIF = '"Noto Serif CJK SC"', SANS = '"Noto Sans CJK SC"';
export const GOLD = '#f1c56d', INK = '#f3ede2';
export const txt = (g: G, s: string, x: number, y: number, size: number, col: string, o: { w?: number; f?: string; a?: CanvasTextAlign; glow?: string; alpha?: number } = {}) => {
  g.save(); g.globalAlpha *= o.alpha ?? 1; g.font = `${o.w ?? 900} ${size}px ${o.f ?? SANS}`; g.textAlign = o.a ?? 'center'; g.fillStyle = col; if (o.glow) { g.shadowColor = o.glow; g.shadowBlur = 26; } g.fillText(s, x, y); g.restore();
};
export const sub = (g: G, s: string) => { g.save(); g.font = `900 70px ${SANS}`; g.textAlign = 'center'; g.lineJoin = 'round'; g.lineWidth = 12; g.strokeStyle = '#000'; g.strokeText(s, W / 2, H - 60); g.fillStyle = '#fbf7ee'; g.fillText(s, W / 2, H - 60); g.restore(); };
export const mark = (g: G) => txt(g, '◆ Juno · VIBE知识大赏', W - 56, 64, 22, 'rgba(243,237,226,.42)', { w: 500, a: 'right' });
export const glow = (g: G, x: number, y: number, r: number, col: string, a: number) => { const b = g.createRadialGradient(x, y, 0, x, y, r); b.addColorStop(0, `rgba(${col},${a})`); b.addColorStop(0.4, `rgba(${col},${a * 0.35})`); b.addColorStop(1, `rgba(${col},0)`); g.fillStyle = b; g.fillRect(x - r, y - r, 2 * r, 2 * r); };

/* ---------------------------------------------------------------- tree geometry */
export type Node = { x: number; y: number };
export const ROOT = { x: 960, y: 830 };
const KNOTS: Node[] = (() => { let sd = 11; const r = () => { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; }; const out: Node[] = []; for (let k = 0; k < 170; k++) out.push({ x: 140 + r() * 1640, y: 140 + Math.pow(r(), 1.3) * 420 }); return out; })();
/** node position of ancestor i in generation g (g=0 is you); optional collapse pulls high generations into a few knots */
const PCACHE = new Map<string, Node>();
export type PO = { top?: number; spread?: number; collapse?: number; gmax?: number };
export const pos = (g: number, i: number, o: PO = {}): Node => {
  if (g === 0) return ROOT;
  const top = o.top ?? 150, G = o.gmax ?? 11, k = 0.8;
  const y = ROOT.y - (ROOT.y - top) * (1 - Math.pow(k, g)) / (1 - Math.pow(k, G));
  const wg = Math.min(o.spread ?? 1840, 150 * Math.pow(1.62, g));
  let x = 960 - wg / 2 + ((i + 0.5) / Math.pow(2, g)) * wg;
  const c = o.collapse ?? 0;
  if (c > 0 && g >= 5) {
    const ck = `${g}|${i}|${G}|${top}|${c}`; const hit = PCACHE.get(ck); if (hit) return hit;
    const h1 = ((i * 2654435761 + g * 97) % 4294967296) / 4294967296, h2 = ((i * 2246822519 + g * 131) % 4294967296) / 4294967296;
    const qx = x + (h1 - 0.5) * 260, qy = y + (h2 - 0.5) * 70 * (g - 4) - 30 * (g - 4);
    let best = KNOTS[0], bd = 1e18; for (const kp of KNOTS) { const d = (kp.x - qx) ** 2 + (kp.y - qy) ** 2; if (d < bd) { bd = d; best = kp; } }
    const s = c * Math.min(1, (g - 4) / 3); const res = { x: x + (best.x - x) * s, y: y + (best.y - y) * s }; PCACHE.set(ck, res); return res;
  }
  return { x, y };
};
/** the golden lineage: which ancestor index you follow in each generation */
const LCACHE = new Map<string, number[]>();
export const lineageFor = (o: PO = {}) => { const key = JSON.stringify(o); if (LCACHE.has(key)) return LCACHE.get(key)!; const L = [0]; let i = 0;
  for (let g = 1; g <= 12; g++) { const cur = pos(g - 1, i, o); const c = [2 * i, 2 * i + 1].map((j) => ({ j, p: pos(g, j, o) })); const pick = c.reduce((a, b) => (Math.abs(a.p.x - cur.x) * 0.6 + a.p.y + (g % 3 === 0 ? (a.j & 1) * 40 : 0) < Math.abs(b.p.x - cur.x) * 0.6 + b.p.y + (g % 3 === 0 ? (b.j & 1) * 40 : 0) ? a : b)); i = pick.j; L.push(i); }
  LCACHE.set(key, L); return L; };
export const lineage = (g: number, o: PO = {}) => lineageFor(o)[g];
export const edge = (g: G, a: Node, b: Node) => { const my = (a.y + b.y) / 2; g.beginPath(); g.moveTo(a.x, a.y); g.bezierCurveTo(a.x, my, b.x, my, b.x, b.y); g.stroke(); };
export const tree = (g: G, gens: number, style: (gen: number, onLine: boolean) => { col: string; w: number; a: number } | null, o: PO = {}) => {
  for (let gen = 0; gen < gens; gen++) {
    const n = Math.pow(2, gen), li = lineage(gen, o);
    for (let i = 0; i < n; i++) {
      const a = pos(gen, i, o);
      for (const j of [2 * i, 2 * i + 1]) { const on = i === li && j === lineage(gen + 1, o); const st = style(gen, on); if (!st) continue; g.globalAlpha = st.a; g.strokeStyle = st.col; g.lineWidth = st.w; edge(g, a, pos(gen + 1, j, o)); }
    }
  }
  g.globalAlpha = 1;
};
export const goldLine = (g: G, gens: number, o: PO & { w?: number } = {}) => {
  g.save(); g.strokeStyle = GOLD; g.shadowColor = GOLD; g.shadowBlur = 22; g.lineWidth = o.w ?? 5;
  for (let gen = 0; gen < gens; gen++) edge(g, pos(gen, lineage(gen, o), o), pos(gen + 1, lineage(gen + 1, o), o));
  g.restore();
};

/* ================================================================ A · 星图金线 */
const skyA = (g: G) => { const b = g.createRadialGradient(960, 900, 50, 960, 500, 1300); b.addColorStop(0, '#16152a'); b.addColorStop(1, '#03040a'); g.fillStyle = b; g.fillRect(0, 0, W, H); setSeed(3); for (let i = 0; i < 600; i++) { g.fillStyle = `rgba(220,225,255,${rnd() * 0.4})`; g.beginPath(); g.arc(rnd() * W, rnd() * H, rnd() * 1.4 + 0.2, 0, 7); g.fill(); } };
const styleA = (gen: number) => ({ col: '#ffd99a', w: Math.max(0.6, 3.2 - gen * 0.28), a: Math.max(0.12, 0.9 - gen * 0.07) });
const you = (g: G, col = GOLD) => { glow(g, ROOT.x, ROOT.y, 140, '241,197,109', 0.6); g.fillStyle = col; g.beginPath(); g.arc(ROOT.x, ROOT.y, 16, 0, 7); g.fill(); txt(g, '你', ROOT.x + 44, ROOT.y + 14, 40, INK, { w: 900, a: 'left' }); };
const hookA = (g: G) => {
  skyA(g); g.save(); g.globalCompositeOperation = 'lighter'; tree(g, 7, styleA, { gmax: 6, top: 170 }); g.restore();
  for (let gen = 1; gen <= 6; gen++) { const p = pos(gen, 0, { gmax: 6, top: 170 }); txt(g, String(2 ** gen), 70, p.y + 12, 34, gen < 4 ? GOLD : 'rgba(241,197,109,.7)', { f: SERIF, a: 'left' }); }
  you(g); mark(g); sub(g, '每往上一代，翻一倍');
};
const keyA = (g: G) => {
  skyA(g); g.save(); g.globalCompositeOperation = 'lighter'; tree(g, 11, (gen) => ({ col: '#9fb4ff', w: Math.max(0.4, 2.4 - gen * 0.2), a: Math.max(0.05, 0.5 - gen * 0.04) }), { collapse: 1 }); g.restore();
  glow(g, 960, 150, 700, '241,197,109', 0.12); goldLine(g, 11, { collapse: 1 }); you(g);
  txt(g, '长江边 · 种稻子的祖先', 960, 95, 34, 'rgba(241,197,109,.85)', { f: SERIF }); mark(g); sub(g, '通向你的那条线，一次都没断');
};

/* ================================================================ B · 族谱水墨 */
const paperB = (g: G) => { const b = g.createLinearGradient(0, 0, 0, H); b.addColorStop(0, '#191510'); b.addColorStop(1, '#0d0b08'); g.fillStyle = b; g.fillRect(0, 0, W, H); setSeed(7); for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(255,240,210,${rnd() * 0.03})`; g.fillRect(rnd() * W, rnd() * H, 2 + rnd() * 3, 1); } };
const seal = (g: G, x: number, y: number, s: string) => { g.fillStyle = '#b8261c'; g.fillRect(x - 34, y - 34, 68, 68); txt(g, s, x, y + 16, 46, '#f4e6cc', { f: SERIF }); };
const plates = (g: G, gens: number, o: PO = {}) => { for (let gen = 1; gen < Math.min(gens, 6); gen++) for (let i = 0; i < 2 ** gen; i++) { const p = pos(gen, i, o); g.fillStyle = 'rgba(236,224,200,.85)'; g.fillRect(p.x - 9, p.y - 16, 18, 32); } };
const hookB = (g: G) => {
  paperB(g); tree(g, 7, (gen) => ({ col: 'rgba(236,224,200,.8)', w: Math.max(0.8, 4 - gen * 0.5), a: Math.max(0.2, 0.95 - gen * 0.1) }), { gmax: 6, top: 170 }); plates(g, 7, { gmax: 6, top: 170 }); seal(g, ROOT.x, ROOT.y, '你');
  ['父母', '祖父母', '曾祖', '高祖', '五世', '六世'].forEach((s, k) => txt(g, s, 70, pos(k + 1, 0, { gmax: 6, top: 170 }).y + 12, 30, 'rgba(236,224,200,.6)', { f: SERIF, a: 'left', w: 700 }));
  mark(g); sub(g, '每往上一代，翻一倍');
};
const keyB = (g: G) => {
  paperB(g); tree(g, 11, (gen) => ({ col: 'rgba(236,224,200,.55)', w: Math.max(0.4, 3 - gen * 0.26), a: Math.max(0.08, 0.7 - gen * 0.06) }), { collapse: 1 });
  g.save(); g.strokeStyle = '#d8402f'; g.lineWidth = 5; for (let gen = 0; gen < 11; gen++) edge(g, pos(gen, lineage(gen, { collapse: 1 }), { collapse: 1 }), pos(gen + 1, lineage(gen + 1, { collapse: 1 }), { collapse: 1 })); g.restore();
  seal(g, ROOT.x, ROOT.y, '你'); txt(g, '族 谱', 1800, 200, 60, 'rgba(236,224,200,.75)', { f: SERIF });
  mark(g); sub(g, '通向你的那条线，一次都没断');
};

/* ================================================================ C · 光之河 */
const skyC = (g: G) => { const b = g.createLinearGradient(0, 0, 0, H); b.addColorStop(0, '#04131a'); b.addColorStop(1, '#020608'); g.fillStyle = b; g.fillRect(0, 0, W, H); };
const styleC = (gen: number) => ({ col: `hsl(${185 - gen * 9}, 80%, ${62 + gen * 2}%)`, w: Math.max(0.8, 14 * Math.pow(0.68, gen)), a: Math.max(0.15, 0.85 - gen * 0.06) });
const hookC = (g: G) => {
  skyC(g); g.save(); g.globalCompositeOperation = 'lighter'; g.shadowColor = '#4fe0d2'; g.shadowBlur = 18; tree(g, 7, styleC, { gmax: 6, top: 170 }); g.restore();
  glow(g, ROOT.x, ROOT.y, 180, '79,224,210', 0.5); g.fillStyle = '#e6fffb'; g.beginPath(); g.arc(ROOT.x, ROOT.y, 14, 0, 7); g.fill(); txt(g, '你', ROOT.x + 44, ROOT.y + 14, 40, INK, { a: 'left' });
  mark(g); sub(g, '每往上一代，翻一倍');
};
const keyC = (g: G) => {
  skyC(g); g.save(); g.globalCompositeOperation = 'lighter'; tree(g, 11, (gen) => ({ ...styleC(gen), a: Math.max(0.05, 0.4 - gen * 0.03) }), { collapse: 1 }); g.restore();
  goldLine(g, 11, { collapse: 1, w: 7 }); glow(g, ROOT.x, ROOT.y, 180, '241,197,109', 0.6); g.fillStyle = GOLD; g.beginPath(); g.arc(ROOT.x, ROOT.y, 16, 0, 7); g.fill(); txt(g, '你', ROOT.x + 44, ROOT.y + 14, 40, INK, { a: 'left' });
  mark(g); sub(g, '通向你的那条线，一次都没断');
};

export const LOOKS = [hookA, keyA, hookB, keyB, hookC, keyC];
export const Looks: React.FC = () => {
  const f = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null); const [h] = useState(() => delayRender('fonts')); const [ok, setOk] = useState(false);
  useEffect(() => { const s = '每往上一代翻倍通向你的那条线次都没断长江边种稻子祖先族谱父母祖曾高五六世◆·JunoVIBE知识大赏0123456789';
    Promise.all([`900 70px ${SANS}`, `700 40px ${SANS}`, `500 30px ${SANS}`, `900 60px ${SERIF}`, `700 30px ${SERIF}`].map((x) => document.fonts.load(x, s).catch(() => null))).then(() => { setOk(true); continueRender(h); }); }, [h]);
  useLayoutEffect(() => { if (!ok || !ref.current) return; const g = ref.current.getContext('2d')!; g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.clearRect(0, 0, W, H); LOOKS[f](g); }, [f, ok]);
  return <AbsoluteFill style={{ background: '#000' }}><canvas ref={ref} width={W} height={H} /></AbsoluteFill>;
};
