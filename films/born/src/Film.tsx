/* 《你能出生的概率》 full film, look B (族谱水墨): an ink genealogy that doubles up from 你, overflows the world's population,
   folds into a net shared by everyone, and one vermilion line that never broke. Timed to bgm.mp3 (117.94 bpm). */
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AbsoluteFill, Audio, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { W, H, G, GOLD, INK, SERIF, SANS, txt, glow, setSeed, rnd, pos, lineage, ROOT, PO } from './Looks';

export const FPS = 30, LEN_S = 114.6, FILM_LEN = Math.round(LEN_S * FPS);
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ramp = (t: number, a: number, d: number) => clamp((t - a) / d);
const eio = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const eo = (x: number) => 1 - Math.pow(1 - x, 3);
const back = (x: number) => { const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
type P2 = { x: number; y: number };
const lp = (a: P2, b: P2, k: number) => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k });
const PAPER = 'rgba(236,224,200,', RED = '#d8402f', CREAM = '#ecdfc6';

/* ---------------------------------------------------------------- timing (track seconds) */
const TITLE = 16.613, TITLE_OUT = 20.0, CLIMB = 20.683, BRK = 49.172, BUILD = 65.959, DROP = 82.239, PROB = 101.57, END = 108.184;

/* [start, end, line]; [gold] / {red} mark one keyword */
const LINES: [number, number, string][] = [
  [0.33, 2.3, '你有2个父母'],
  [2.37, 5.85, '4个祖父母，8个曾祖父母'],
  [5.93, 8.4, '每往上一代，翻一倍'],
  [8.47, 12.45, '猜猜：往上40代，你有多少个祖先位置？'],
  [12.54, 16.2, 'A、B、C，先在心里选一个'],
  [20.68, 23.55, '按25年一代，往上40代'],
  [23.6, 26.5, '大约是1000年前，北宋'],
  [26.6, 29.7, '第20代，已经超过100万个'],
  [29.8, 33.1, '答案是C：约[1.1万亿]个位置'],
  [33.2, 37.1, '可从古到今，地球上只出生过约1170亿人'],
  [37.2, 40.3, '1000年前，全世界只有约3亿人'],
  [40.4, 42.5, '位置，比人还{多}'],
  [42.6, 45.7, '这些位置，是谁填满的？'],
  [45.8, 49.1, '答案是：很多位置，是[同一个人]'],
  [49.17, 52.3, '过去，人们大多和附近的人结婚'],
  [52.4, 55.8, '往上数几代，两条线会走回同一个人'],
  [55.9, 59.3, '同一个祖先，在你家谱里出现很多次'],
  [59.4, 62.5, '位置还是1.1万亿，人却少得多'],
  [62.6, 65.35, '整张家谱，缠成了一张[网]'],
  [65.45, 68.9, '2004年，一篇《自然》论文算过'],
  [69.0, 71.5, '几千年前活着的每一个人'],
  [71.56, 74.5, '要么，是今天[所有人]的祖先'],
  [74.6, 77.3, '要么，{一个后代}都没留下'],
  [77.4, 81.3, '作者写道：我们共享着，在长江边种稻子的祖先'],
  [82.24, 85.5, '而通向你的那条线，一次都[没断]'],
  [85.6, 88.9, '历史上，大约一半的孩子活不到成年'],
  [89.0, 92.4, '每一代，你的祖先都是活下来的那一半'],
  [92.5, 95.7, '只要有一个人{早走一步}，就没有你'],
  [95.8, 98.5, '只算这一条线，往上40代'],
  [98.6, 101.5, '每一代都活到成年的概率是……'],
  [101.57, 105.0, '概率约[1.1万亿分之一]'],
  [105.64, 108.1, '身后每一条线，都没断过'],
];

/* ---------------------------------------------------------------- shared drawing */
const paper = (g: G) => { const b = g.createLinearGradient(0, 0, 0, H); b.addColorStop(0, '#1a1611'); b.addColorStop(1, '#0c0a07'); g.fillStyle = b; g.fillRect(0, 0, W, H); setSeed(7); for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(255,240,210,${rnd() * 0.03})`; g.fillRect(rnd() * W, rnd() * H, 2 + rnd() * 3, 1); } const v = g.createRadialGradient(960, 540, 400, 960, 540, 1150); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.45)'); g.fillStyle = v; g.fillRect(0, 0, W, H); };
const seal = (g: G, x: number, y: number, s: string, a = 1, sc = 1) => { g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(sc, sc); g.fillStyle = '#b8261c'; g.fillRect(-34, -34, 68, 68); g.strokeStyle = 'rgba(244,230,204,.35)'; g.lineWidth = 2; g.strokeRect(-28, -28, 56, 56); g.restore(); txt(g, s, x, y + 16 * sc, 46 * sc, '#f4e6cc', { f: SERIF, alpha: a }); };
const ghostSeal = (g: G, x: number, y: number, a: number) => { g.save(); g.globalAlpha = a; g.strokeStyle = 'rgba(236,224,200,.6)'; g.setLineDash([6, 6]); g.lineWidth = 2; g.strokeRect(x - 34, y - 34, 68, 68); g.restore(); };
const mark = (g: G, a = 1) => txt(g, '◆ Juno · VIBE知识大赏', W - 56, 64, 22, 'rgba(243,237,226,.5)', { w: 500, a: 'right', alpha: a });
/* tabular digits: every digit takes the same advance so a rolling number never shivers */
const mono = (g: G, s: string, x: number, y: number, size: number, col: string, o: { a?: 'left' | 'center' | 'right'; alpha?: number; glow?: string } = {}) => {
  const adv = (c: string) => (/[0-9]/.test(c) ? size * 0.6 : c === ',' || c === '.' ? size * 0.3 : /[\u4e00-\u9fff]/.test(c) ? size * 1.0 : size * 0.62);
  const w = [...s].reduce((a, c) => a + adv(c), 0); let cx = o.a === 'left' ? x : o.a === 'right' ? x - w : x - w / 2;
  g.save(); g.globalAlpha *= o.alpha ?? 1; g.font = `700 ${size}px ${SERIF}`; g.textAlign = 'center'; g.fillStyle = col; if (o.glow) { g.shadowColor = o.glow; g.shadowBlur = 24; }
  for (const c of s) { g.fillText(c, cx + adv(c) / 2, y); cx += adv(c); } g.restore();
};
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
const plaque = (g: G, x: number, y: number, w: number, h: number, a: number) => { g.save(); g.globalAlpha = a; g.fillStyle = 'rgba(14,11,8,.92)'; g.fillRect(x - w / 2, y - h / 2, w, h); g.strokeStyle = 'rgba(236,224,200,.35)'; g.lineWidth = 2; g.strokeRect(x - w / 2 + 8, y - h / 2 + 8, w - 16, h - 16); g.restore(); };

/* subtitle: 思源黑体 700, 68 px, centred in the bottom bar, one keyword in gold [..] or red {..} */
const subtitle = (g: G, s: string, a: number) => {
  const parts: { t: string; c: string; w: number }[] = []; const re = /\[([^\]]+)\]|\{([^}]+)\}|([^[{]+)/g; let m;
  while ((m = re.exec(s))) parts.push(m[1] ? { t: m[1], c: GOLD, w: 900 } : m[2] ? { t: m[2], c: '#e5533f', w: 900 } : { t: m[3], c: INK, w: 700 });
  g.save(); g.globalAlpha = a; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
  let tw = 0; for (const p of parts) { g.font = `${p.w} 68px ${SANS}`; tw += g.measureText(p.t).width; }
  let x = W / 2 - tw / 2; const y = 1036;
  for (const p of parts) { g.font = `${p.w} 68px ${SANS}`; g.lineJoin = 'round'; g.lineWidth = 7; g.strokeStyle = 'rgba(0,0,0,.95)'; g.shadowColor = 'rgba(0,0,0,.95)'; g.shadowBlur = 14; g.shadowOffsetY = 2; g.strokeText(p.t, x, y); g.shadowBlur = 0; g.shadowOffsetY = 0; g.fillStyle = p.c; g.fillText(p.t, x, y); x += g.measureText(p.t).width; }
  g.restore();
};
const bottomBar = (g: G) => { const b = g.createLinearGradient(0, 900, 0, H); b.addColorStop(0, 'rgba(8,6,4,0)'); b.addColorStop(1, 'rgba(8,6,4,.85)'); g.fillStyle = b; g.fillRect(0, 900, W, 180); };

/* ---------------------------------------------------------------- the genealogy */
const A6: PO = { gmax: 6, top: 170, spread: 1480 }, B: PO = { gmax: 11 }, C: PO = { gmax: 11, collapse: 1 };
const NG = 11;
const P = (gen: number, i: number, grow: number, coll: number) => { const a = grow < 1 ? pos(gen, i, A6) : null, b = grow > 0 ? pos(gen, i, B) : null; let p = a && b ? lp(a, b, grow) : (a || b)!; if (coll > 0) p = lp(p, pos(gen, i, C), coll); return p; };
type TreeOpt = { grow: number; coll: number; gens: (gen: number) => number; alpha: (gen: number) => number; col?: string; width?: (gen: number) => number; dx?: number };
/* draw edges generation by generation, one Path2D per generation (bezier like a brush stroke) */
const inkTree = (g: G, o: TreeOpt) => {
  g.save(); g.lineCap = 'round';
  for (let gen = 0; gen < NG; gen++) {
    const k = o.gens(gen); if (k <= 0) continue; const a = o.alpha(gen); if (a <= 0.004) continue;
    const path = new Path2D(); const n = 2 ** gen; const sh = (gg: number) => (o.dx ? o.dx * Math.pow(Math.max(0, 1 - gg / 7), 1.4) : 0);
    for (let i = 0; i < n; i++) {
      const A0 = P(gen, i, o.grow, o.coll); const A = { x: A0.x + sh(gen), y: A0.y };
      for (const j of [2 * i, 2 * i + 1]) {
        const B0 = P(gen + 1, j, o.grow, o.coll); let Bp = { x: B0.x + sh(gen + 1), y: B0.y }; if (k < 1) Bp = lp(A, Bp, k);
        const my = (A.y + Bp.y) / 2; path.moveTo(A.x, A.y); path.bezierCurveTo(A.x, my, Bp.x, my, Bp.x, Bp.y);
      }
    }
    g.globalAlpha = a; g.strokeStyle = o.col ?? `${PAPER}1)`; g.lineWidth = o.width ? o.width(gen) : Math.max(0.5, 4 - gen * 0.4); g.stroke(path);
  }
  g.restore();
};
const plates = (g: G, upto: number, grow: number, a: number) => { if (a <= 0) return; g.save(); for (let gen = 1; gen <= Math.min(upto, 5); gen++) { const k = ramp(upto, gen - 0.7, 0.7); for (let i = 0; i < 2 ** gen; i++) { const p = P(gen, i, grow, 0); g.globalAlpha = a * k * 0.85; g.fillStyle = CREAM; const s = 1 - 0.35 * grow; g.fillRect(p.x - 9 * s, p.y - 16 * s, 18 * s, 32 * s); } } g.restore(); };
const lineEdge = (gen: number, grow: number, coll: number) => [P(gen, lineage(gen, C), grow, coll), P(gen + 1, lineage(gen + 1, C), grow, coll)];
const brush = (g: G, a: P2, b: P2, k: number) => { const e = k < 1 ? lp(a, b, k) : b; const my = (a.y + e.y) / 2; g.beginPath(); g.moveTo(a.x, a.y); g.bezierCurveTo(a.x, my, e.x, my, e.x, e.y); g.stroke(); };

/* knots: where the collapsed net's high generations land */
const KN = (() => { const m = new Map<string, { x: number; y: number; n: number }>(); for (let gen = 7; gen <= NG; gen++) for (let i = 0; i < 2 ** gen; i++) { const p = pos(gen, i, C); const key = `${p.x.toFixed(1)},${p.y.toFixed(1)}`; const e = m.get(key); if (e) e.n++; else m.set(key, { x: p.x, y: p.y, n: 1 }); } return [...m.values()]; })();
const HERO = KN.filter((k) => Math.abs(k.x - 960) < 420 && k.y < 420).sort((a, b) => b.n - a.n)[0];
const HERO_SLOTS = (() => { const out: { gen: number; i: number }[] = []; for (let gen = 7; gen <= NG; gen++) for (let i = 0; i < 2 ** gen; i++) { const p = pos(gen, i, C); if (Math.abs(p.x - HERO.x) < 0.01 && Math.abs(p.y - HERO.y) < 0.01) out.push({ gen, i }); } return out; })();
const ORPHANS = (() => { let s = 91; const r = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; const o: P2[] = []; while (o.length < 70) { const p = { x: 150 + r() * 1620, y: 130 + r() * 330 }; if (KN.every((k) => (k.x - p.x) ** 2 + (k.y - p.y) ** 2 > 900)) o.push(p); } return o; })();
const OTHERS = [-700, -360, 360, 700];

/* ---------------------------------------------------------------- scenes */
const GA = [0, 0.1, 2.37, 3.9, 5.93, 6.95, 7.96, 8.75, 9.1, 9.4, 9.7, 9.95];   // when generation k is reached
const LABELS = ['父母', '祖父母', '曾祖父母', '高祖父母', '五世祖', '六世祖'];

/* the hook tree and its match cut into the title motif */
const MOTIF = { x: 960, y: 700, s: 0.2 };
const withCam = (g: G, s: number, x: number, y: number, f: () => void) => { g.save(); g.translate(x - ROOT.x * s, y - ROOT.y * s); g.scale(s, s); f(); g.restore(); };

const hook = (g: G, T: number) => {
  const grow = eio(ramp(T, 8.47, 2.6)) * (1 - eio(ramp(T, 15.7, 0.9)));
  const z = eio(ramp(T, 15.7, 0.9)); const s = 1 + (MOTIF.s - 1) * z, cx = ROOT.x + (MOTIF.x - ROOT.x) * z, cy = ROOT.y + (MOTIF.y - ROOT.y) * z;
  const dimOpt = 1 - 0.6 * ramp(T, 12.3, 0.5) * (1 - z);
  const gh = 0.14 * (1 - ramp(T, 8.47, 1.5)); if (gh > 0) { g.save(); g.translate(0, -12 * (T / 8)); inkTree(g, { grow: 1, coll: 0, gens: () => 1, alpha: (gen) => gh * (gen < 6 ? 0.3 : 1), width: () => 1 }); g.restore(); }
  withCam(g, s, cx, cy, () => {
    inkTree(g, { grow, coll: 0, gens: (gen) => ramp(T, GA[gen + 1] ?? 99, 0.45) * (gen < 6 ? 1 : 1 - z), alpha: (gen) => dimOpt * Math.max(0.2, 0.95 - gen * 0.08), width: (gen) => Math.max(0.6, 4 - gen * 0.45) / Math.max(0.35, s) * (s < 1 ? 0.6 : 1) });
    plates(g, T < 8 ? Math.max(0, ...GA.slice(1, 6).map((t, k) => (T > t ? k + 1 + ramp(T, t, 0.45) - 1 : 0))) : 5, grow, dimOpt);
    seal(g, ROOT.x, ROOT.y, '你', 1, 0.6 + 0.4 * back(ramp(T, 0, 0.35)));
  });
  /* generation labels + counts */
  const la = (1 - ramp(T, 8.6, 0.6)) * (1 - z);
  LABELS.forEach((lb, k) => { const a = la * ramp(T, GA[k + 1] + 0.2, 0.3); if (a <= 0) return; const l = P(k + 1, 0, grow, 0), r = P(k + 1, 2 ** (k + 1) - 1, grow, 0), y = l.y + 11; txt(g, lb, Math.min(l.x - 36, 700), y, 30, `${PAPER}.62)`, { f: SERIF, a: 'right', w: 700, alpha: a }); txt(g, String(2 ** (k + 1)), Math.max(r.x + 36, 1220), y, 34, `${PAPER}.8)`, { f: SERIF, a: 'left', alpha: a }); });
  /* the top dissolving into mist, and "第40代" */
  const ma = ramp(T, 9.2, 0.8) * (1 - ramp(T, 12.3, 0.4));
  if (ma > 0) { const b = g.createLinearGradient(0, 0, 0, 300); b.addColorStop(0, `rgba(26,22,17,${0.95 * ma})`); b.addColorStop(1, 'rgba(26,22,17,0)'); g.fillStyle = b; g.fillRect(0, 0, W, 300); txt(g, '第 40 代', 960, 120, 54, `${PAPER}.85)`, { f: SERIF, alpha: ma }); txt(g, '……', 960, 170, 40, `${PAPER}.6)`, { f: SERIF, alpha: ma }); }
  /* the three choices */
  const opts: [string, string][] = [['A', '1000个'], ['B', '100万个'], ['C', '1万亿个']];
  opts.forEach(([l, v], k) => {
    const t0 = 12.543 + k * 0.509; const a = ramp(T, t0, 0.12) * (1 - ramp(T, 15.5, 0.4)); if (a <= 0) return; const sc = 0.6 + 0.4 * back(ramp(T, t0, 0.3));
    const x = 600 + k * 360, y = 470; g.save(); g.translate(x, y); g.scale(sc, sc); plaque(g, 0, 0, 300, 210, a); txt(g, l, 0, -14, 70, `${PAPER}.95)`, { f: SERIF, alpha: a }); txt(g, v, 0, 62, 44, INK, { w: 700, alpha: a }); g.restore();
  });
};

const title = (g: G, T: number) => {
  const tin = ramp(T, TITLE, 0.15), tout = ramp(T, TITLE_OUT, 0.3);
  /* motif: the same little genealogy the hook shrank into */
  const z = eio(ramp(T, TITLE_OUT, 0.68)); const s = MOTIF.s + (1 - MOTIF.s) * z, cx = MOTIF.x + (ROOT.x - MOTIF.x) * z, cy = MOTIF.y + (ROOT.y - MOTIF.y) * z;
  const grow = eio(ramp(T, TITLE_OUT, 0.68));
  withCam(g, s, cx, cy, () => {
    inkTree(g, { grow, coll: 0, gens: (gen) => (gen < 6 ? 1 : ramp(T, TITLE_OUT + 0.1 + (gen - 6) * 0.08, 0.2)), alpha: (gen) => Math.max(0.2, 0.95 - gen * 0.08), width: (gen) => Math.max(0.6, 4 - gen * 0.45) / Math.max(0.35, s) * (s < 1 ? 0.6 : 1) });
    plates(g, 5, grow, 1 - grow); seal(g, ROOT.x, ROOT.y, '你');
  });
  const a = tin * (1 - tout); if (a <= 0) return;
  txt(g, 'PEDIGREE COLLAPSE · ROHDE, OLSON & CHANG · MMIV', 960, 300, 24, `${PAPER}.6)`, { w: 500, f: SERIF, alpha: a * ramp(T, TITLE + 0.25, 0.4) });
  /* 《你能出生的概率》 stamped one character per half-beat, then gold pours in */
  const ch = ['《', '你', '能', '出', '生', '的', '概', '率', '》']; const size = 108, cw = size * 1.0, x0 = 960 - (ch.length * cw) / 2 + cw / 2, ty = 470 - tout * 40;
  const pour = ramp(T, 19.157, 0.55);
  ch.forEach((c, k) => {
    const t0 = TITLE + Math.max(0, k - 1) * 0.2545 * (k === 0 || k === ch.length - 1 ? 0 : 1) + (k === ch.length - 1 ? 7 * 0.2545 : 0); const st = ramp(T, t0, 0.12); if (st <= 0) return;
    const sc = 1 + 0.35 * (1 - eo(ramp(T, t0, 0.18)));
    g.save(); g.translate(x0 + k * cw, ty); g.scale(sc, sc); g.globalAlpha = a * st; g.font = `900 ${size}px ${SERIF}`; g.textAlign = 'center';
    const gr = g.createLinearGradient(0, -size, 0, 10); gr.addColorStop(0, '#fff0c4'); gr.addColorStop(0.5, GOLD); gr.addColorStop(1, '#c8913a');
    const lit = clamp(pour * 1.6 - (k / ch.length) * 0.6);
    g.fillStyle = CREAM; g.fillText(c, 0, 0); if (lit > 0) { g.globalAlpha = a * st * lit; g.shadowColor = 'rgba(241,197,109,.5)'; g.shadowBlur = 22; g.fillStyle = gr; g.fillText(c, 0, 0); }
    g.restore();
  });
  const ta = a * ramp(T, TITLE + 1.2, 0.5);
  txt(g, '往上40代，你有多少个祖先？', 960, 860 - tout * 30, 40, INK, { w: 700, alpha: ta });
  txt(g, 'How many ancestors did it take to make you?', 960, 912 - tout * 30, 26, `${PAPER}.6)`, { w: 400, f: SERIF, alpha: ta });
  txt(g, '— VIBE知识大赏 —', 960, 985 - tout * 30, 24, `${PAPER}.5)`, { w: 500, alpha: ta });
};

/* year ruler (right side, the top-left stays clear for the platform watermark) */
const YEARS: [number, string][] = [[2026, '今天'], [1912, '清末'], [1500, '明'], [1040, '北宋']];
const yOfGen = (gf: number) => { const k = 0.8, top = 150; return ROOT.y - (ROOT.y - top) * (1 - Math.pow(k, gf)) / (1 - Math.pow(k, NG)); };
const ruler = (g: G, a: number) => { if (a <= 0) return; g.save(); g.globalAlpha = a; g.strokeStyle = `${PAPER}.4)`; g.lineWidth = 2; g.beginPath(); g.moveTo(1835, yOfGen(0)); g.lineTo(1835, yOfGen(NG)); g.stroke(); g.restore();
  YEARS.forEach(([yr, nm]) => { const y = yOfGen((2026 - yr) / (1026 / NG)); g.save(); g.globalAlpha = a; g.fillStyle = CREAM; g.fillRect(1829, y - 1, 12, 2); g.restore(); txt(g, nm, 1815, y + 10, 28, `${PAPER}.75)`, { f: SERIF, a: 'right', w: 700, alpha: a }); }); };

const climb = (g: G, T: number) => {
  const treeA = (1 - 0.6 * ramp(T, 26.4, 0.5)) * (1 - ramp(T, 33.0, 0.7)) + ramp(T, 45.4, 0.8) * 1;
  inkTree(g, { grow: 1, coll: 0, gens: () => 1, alpha: (gen) => treeA * Math.max(0.1, 0.8 - gen * 0.065), width: (gen) => Math.max(0.5, 3.4 - gen * 0.3) });
  seal(g, ROOT.x, ROOT.y, '你', clamp(treeA * 1.4 - 0.4));
  ruler(g, ramp(T, 21.0, 0.6) * (1 - ramp(T, 26.4, 0.4)));
  /* counter plaque */
  const ca = ramp(T, 26.6, 0.3) * (1 - ramp(T, 33.0, 0.4));
  if (ca > 0) {
    plaque(g, 960, 430, 980, 330, ca);
    const gn = T < 29.8 ? Math.min(20, 1 + Math.floor(19 * eio(ramp(T, 26.7, 1.6)))) : Math.min(40, 20 + Math.floor(20 * eio(ramp(T, 29.85, 1.2))));
    txt(g, `第 ${gn} 代`, 960, 340, 38, `${PAPER}.75)`, { f: SERIF, alpha: ca });
    const done = gn === 40; mono(g, fmt(2 ** gn), 960, 470, gn > 30 ? 92 : 104, done ? GOLD : INK, { alpha: ca, glow: done ? 'rgba(241,197,109,.45)' : undefined });
    if (done) txt(g, '约 1.1 万亿个位置   ·   答案 C', 960, 552, 36, GOLD, { w: 700, alpha: ca * ramp(T, 31.1, 0.3) });
    else if (gn >= 20 && T < 29.8) txt(g, '超过 100 万', 960, 552, 36, INK, { w: 700, alpha: ca * ramp(T, 28.3, 0.3) });
  }
  /* sizes: everyone ever born, the world in 1000 AD, and the ancestor slots */
  const sa = ramp(T, 33.2, 0.5) * (1 - ramp(T, 45.4, 0.6));
  if (sa > 0) {
    const zoom = eio(ramp(T, 40.4, 1.6)); const s = 1 + (0.4 - 1) * zoom; const bx = 960, by = 880;
    const r1 = 330, r0 = r1 * Math.sqrt(3 / 1170), rB = r1 * Math.sqrt(11000 / 1170);
    const S = (x: number, y: number) => ({ x: bx + (x - bx) * s, y: by + (y - by) * s });
    /* the slots: drawn first, revealed by the pull-back */
    const bA = sa * ramp(T, 40.4, 0.8); if (bA > 0) { const c = S(bx, by - rB); g.save(); g.globalAlpha = bA; g.fillStyle = 'rgba(236,224,200,.07)'; g.beginPath(); g.arc(c.x, c.y, rB * s, 0, 7); g.fill(); g.strokeStyle = `${PAPER}.7)`; g.lineWidth = 3; g.stroke(); g.restore();
      txt(g, '你的祖先位置', c.x, c.y - rB * s * 0.55, 34, `${PAPER}.8)`, { f: SERIF, alpha: bA * ramp(T, 41.2, 0.5) }); mono(g, '约1.1万亿', c.x, c.y - rB * s * 0.55 + 70, 60, GOLD, { alpha: bA * ramp(T, 41.2, 0.5) }); }
    const c1 = S(bx, by - r1); const k1 = eo(ramp(T, 33.3, 0.9));
    g.save(); g.globalAlpha = sa; g.fillStyle = 'rgba(236,224,200,.13)'; g.beginPath(); g.arc(c1.x, c1.y, r1 * s * k1, 0, 7); g.fill(); g.strokeStyle = CREAM; g.lineWidth = 3; g.stroke(); g.restore();
    const la = sa * ramp(T, 33.9, 0.4) * (1 - ramp(T, 40.4, 0.4));
    mono(g, '约1170亿', c1.x, c1.y - 30, 72, INK, { alpha: la }); txt(g, '从古到今，出生过的所有人', c1.x, c1.y + 30, 32, `${PAPER}.75)`, { f: SERIF, alpha: la });
    const k0 = ramp(T, 37.2, 0.4); if (k0 > 0) { const c0 = S(bx, by - r0); g.save(); g.globalAlpha = sa * k0; g.fillStyle = CREAM; g.beginPath(); g.arc(c0.x, c0.y, Math.max(3, r0 * s) * back(k0), 0, 7); g.fill();
      const l0 = sa * k0 * (1 - ramp(T, 40.4, 0.4)); g.globalAlpha = l0; g.strokeStyle = `${PAPER}.6)`; g.lineWidth = 2; g.beginPath(); g.moveTo(c0.x + 22, c0.y - 6); g.lineTo(c0.x + 420, c0.y - 6); g.stroke(); g.restore();
      txt(g, '1000年前的全世界 · 约3亿人', c0.x + 440, c0.y + 4, 32, INK, { w: 700, a: 'left', alpha: l0 }); }
  }
  /* back to the tree for the answer */
  if (T > 45.4) seal(g, ROOT.x, ROOT.y, '你', ramp(T, 45.4, 0.8));
};

/* fold into a net: slots that are the same person converge on one knot */
const collapse = (g: G, T: number) => {
  const coll = eio(ramp(T, 52.4, 10.0));
  const hero = ramp(T, 52.6, 0.8);
  inkTree(g, { grow: 1, coll, gens: () => 1, alpha: (gen) => Math.max(0.08, 0.78 - gen * 0.062) * (1 - 0.35 * hero), width: (gen) => Math.max(0.45, 3.4 - gen * 0.3) });
  /* the hero knot: every slot that is this one person, highlighted */
  if (hero > 0) {
    const path = new Path2D();
    for (const { gen, i } of HERO_SLOTS) { const a = P(gen - 1, i >> 1, 1, coll), b = P(gen, i, 1, coll); const my = (a.y + b.y) / 2; path.moveTo(a.x, a.y); path.bezierCurveTo(a.x, my, b.x, my, b.x, b.y); }
    g.save(); g.globalAlpha = hero * (1 - ramp(T, 64.5, 1.2)); g.strokeStyle = '#fff3d6'; g.lineWidth = 1.6; g.shadowColor = 'rgba(255,240,200,.6)'; g.shadowBlur = 6; g.stroke(path); g.restore();
    const ha = hero * (1 - ramp(T, 64.5, 1.2));
    for (const { gen, i } of HERO_SLOTS) { const p = P(gen, i, 1, coll); g.save(); g.globalAlpha = ha * 0.8; g.fillStyle = CREAM; g.beginPath(); g.arc(p.x, p.y, 3, 0, 7); g.fill(); g.restore(); }
    const ra = ramp(T, 55.9, 0.5) * ha; if (ra > 0) { g.save(); g.globalAlpha = ra; g.strokeStyle = CREAM; g.lineWidth = 2.5; g.beginPath(); g.arc(HERO.x, HERO.y, 30 * coll + 14, 0, 7); g.stroke(); g.restore();
      const lx = HERO.x + 60, ly = HERO.y + 18; plaque(g, lx + 170, ly - 12, 380, 92, ra * 0.9); txt(g, '同一个人', lx + 20, ly, 34, INK, { a: 'left', w: 700, alpha: ra }); mono(g, `×${Math.round(HERO_SLOTS.length * ramp(T, 56.2, 2.4))}`, lx + 210, ly + 2, 40, CREAM, { a: 'left', alpha: ra }); }
  }
  seal(g, ROOT.x, ROOT.y, '你');
};

/* everyone's genealogy lands on the same net */
const model = (g: G, T: number) => {
  const oth = ramp(T, 65.45, 1.6) * (1 - ramp(T, 81.0, 1.0)); const dim = 1 - 0.6 * ramp(T, 80.8, 1.2);
  OTHERS.forEach((dx, k) => { inkTree(g, { grow: 1, coll: 1, dx, gens: () => 1, alpha: (gen) => oth * 0.55 * Math.max(0.06, 0.6 - gen * 0.05), width: (gen) => Math.max(0.4, 2.6 - gen * 0.25) }); const sx = ROOT.x + dx; g.save(); g.globalAlpha = oth * 0.8; g.fillStyle = 'rgba(236,224,200,.75)'; g.fillRect(sx - 12, ROOT.y - 18, 24, 36); g.restore(); txt(g, ['他', '她', '他', '她'][k], sx, ROOT.y + 60, 28, `${PAPER}.6)`, { f: SERIF, alpha: oth }); });
  inkTree(g, { grow: 1, coll: 1, gens: () => 1, alpha: (gen) => dim * Math.max(0.08, 0.78 - gen * 0.062), width: (gen) => Math.max(0.45, 3.4 - gen * 0.3) });
  /* knots of the top rows: shared ancestors light gold, the rest leave no one and go out */
  const top = KN.filter((k) => k.y < 470);
  const ka = ramp(T, 69.2, 0.6) * dim, gold = ramp(T, 71.56, 0.5), out = ramp(T, 75.625, 1.0);
  for (const k of top) { if (gold > 0) glow(g, k.x, k.y, 26, '241,197,109', 0.45 * gold * ka); g.save(); g.globalAlpha = ka; g.fillStyle = gold > 0 ? GOLD : CREAM; g.beginPath(); g.arc(k.x, k.y, 4 + 1.5 * gold, 0, 7); g.fill(); g.restore(); }
  for (const p of ORPHANS) { const a = ka * (1 - out); if (a <= 0) continue; g.save(); g.globalAlpha = a * 0.85; g.fillStyle = out > 0 ? '#e5533f' : CREAM; g.beginPath(); g.arc(p.x, p.y, 4, 0, 7); g.fill(); g.restore(); }
  /* the Yangtze: a river of ink across the top, paddies along it */
  const ra = ramp(T, 77.4, 1.2) * (1 - ramp(T, 81.2, 0.8));
  if (ra > 0) {
    g.save(); g.globalAlpha = ra; g.strokeStyle = 'rgba(150,180,170,.55)'; g.lineWidth = 16; g.lineCap = 'round'; g.beginPath(); for (let x = 60; x <= 1860; x += 20) { const y = 105 + Math.sin(x / 210) * 22 + Math.sin(x / 77) * 6; x === 60 ? g.moveTo(x, y) : g.lineTo(x, y); } const prog = eio(ramp(T, 77.4, 1.6)); g.setLineDash([1900 * prog, 4000]); g.stroke();
    g.setLineDash([]); g.strokeStyle = 'rgba(170,200,150,.35)'; g.lineWidth = 1.5; setSeed(5); for (let k = 0; k < 26; k++) { const x = 100 + k * 68 + rnd() * 20, y = 140 + Math.sin(x / 210) * 22 + rnd() * 10; if (x > 1860 * prog) continue; g.strokeRect(x, y, 46, 22); g.beginPath(); g.moveTo(x + 23, y); g.lineTo(x + 23, y + 22); g.stroke(); } g.restore();
    txt(g, '长江边 · 种稻子的祖先', 960, 60, 32, `${PAPER}.85)`, { f: SERIF, alpha: ra * ramp(T, 78.2, 0.5) });
  }
  seal(g, ROOT.x, ROOT.y, '你');
};

/* the vermilion line that never broke */
const survival = (g: G, T: number) => {
  const all = ramp(T, 105.64, 2.0); const plq = ramp(T, 98.6, 0.4) * (1 - ramp(T, 105.3, 0.5));
  const base = 0.35 + 0.25 * all; const treeDim = 1 - 0.55 * plq;
  inkTree(g, { grow: 1, coll: 1, gens: () => 1, alpha: (gen) => treeDim * base * Math.max(0.1, 0.78 - gen * 0.062), width: (gen) => Math.max(0.45, 3.4 - gen * 0.3) });
  /* every line behind you turns red, from you upward */
  if (all > 0) inkTree(g, { grow: 1, coll: 1, gens: (gen) => ramp(T, 105.64 + gen * 0.16, 0.3), alpha: (gen) => 0.75 * Math.max(0.12, 0.85 - gen * 0.06) * (1 - 0.5 * ramp(T, END, 0.5)), col: RED, width: (gen) => Math.max(0.5, 3 - gen * 0.25) });
  /* siblings who did not grow up: a short twig at each node, fading */
  const sib = ramp(T, 85.6, 0.3) * (1 - ramp(T, 92.3, 0.6));
  if (sib > 0) for (let gen = 1; gen <= NG; gen++) { const p = P(gen, lineage(gen, C), 1, 1); const t0 = 85.8 + gen * 0.22; const k = ramp(T, t0, 0.4); if (k <= 0) continue; const dir = gen % 2 ? 1 : -1; const e = { x: p.x + dir * 46, y: p.y + 26 }; const fade = 1 - 0.75 * ramp(T, t0 + 0.6, 0.8);
    g.save(); g.globalAlpha = sib * fade; g.strokeStyle = 'rgba(200,190,170,.8)'; g.lineWidth = 2; g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(p.x + (e.x - p.x) * k, p.y + (e.y - p.y) * k); g.stroke(); g.setLineDash([3, 3]); g.beginPath(); g.arc(e.x, e.y, 6 * k, 0, 7); g.stroke(); g.restore(); }
  /* the line: ignites on the drop, breaks for "早走一步", re-ignites */
  const cutGen = 6, brk = ramp(T, 93.3, 0.35) * (1 - ramp(T, 95.6, 0.3));
  const draw = eio(ramp(T, DROP, 1.5)) * NG;
  g.save(); g.strokeStyle = RED; g.lineWidth = 5.5; g.lineCap = 'round'; g.shadowColor = 'rgba(216,64,47,.8)'; g.shadowBlur = 18 + 30 * (1 - ramp(T, DROP, 1.2));
  for (let gen = 0; gen < Math.ceil(draw); gen++) { const [a, b] = lineEdge(gen, 1, 1); g.globalAlpha = gen < cutGen ? 1 - 0.85 * brk : 1; brush(g, a, b, clamp(draw - gen)); }
  g.restore();
  /* the ancestor who could have gone early */
  const fl = ramp(T, 92.6, 0.3) * (1 - ramp(T, 95.7, 0.3)); if (fl > 0) { const p = P(cutGen, lineage(cutGen, C), 1, 1); glow(g, p.x, p.y, 70, '229,83,63', 0.7 * fl * (T < 93.3 ? 0.6 + 0.4 * Math.sin(T * 38) : 1)); g.save(); g.globalAlpha = fl; g.strokeStyle = '#ffb59a'; g.lineWidth = 2.5; g.beginPath(); g.arc(p.x, p.y, 18, 0, 7); g.stroke(); g.restore(); }
  /* ½ at every generation on the line */
  const ha = ramp(T, 95.9, 0.3) * (1 - ramp(T, 98.6, 0.4)); if (ha > 0) for (let gen = 1; gen <= 8; gen++) { const p = P(gen, lineage(gen, C), 1, 1); const a = ha * ramp(T, 95.9 + gen * 0.13, 0.2); txt(g, '½', p.x + (gen % 2 ? 34 : -34), p.y + 12, 32, CREAM, { f: SERIF, w: 700, alpha: a }); }
  /* the probability plaque */
  if (plq > 0) {
    plaque(g, 960, 440, 1180, 380, plq);
    if (T < PROB) { const n = Math.min(40, 1 + Math.floor(39 * eio(ramp(T, 98.75, 2.6)))); txt(g, `½ × ½ × ½ × …  （${n} 次）`, 960, 380, 44, `${PAPER}.85)`, { f: SERIF, w: 700, alpha: plq }); mono(g, `1 / ${fmt(2 ** n)}`, 960, 500, 76, INK, { alpha: plq }); }
    else { const k = back(ramp(T, PROB, 0.3)); g.save(); g.translate(960, 470); g.scale(0.85 + 0.15 * k, 0.85 + 0.15 * k); mono(g, '1 / 1,099,511,627,776', 0, 0, 84, GOLD, { alpha: plq, glow: 'rgba(241,197,109,.5)' }); g.restore();
      txt(g, '约 1.1 万亿分之一', 960, 360, 44, GOLD, { w: 700, alpha: plq * ramp(T, PROB + 0.1, 0.3) });
      txt(g, '只算一条直系 · 每代按“一半活到成年”计 · 不是你出生的全部概率', 960, 570, 26, `${PAPER}.65)`, { w: 500, alpha: plq * ramp(T, PROB + 0.5, 0.4) }); }
  }
  /* you: dashed outline while the line is broken */
  const ys = 1 - brk; seal(g, ROOT.x, ROOT.y, '你', ys); if (brk > 0) ghostSeal(g, ROOT.x, ROOT.y, brk);
  if (T < DROP + 0.6) glow(g, ROOT.x, ROOT.y, 220, '216,64,47', 0.5 * (1 - ramp(T, DROP, 0.6)));
};

/* end card: monogram, title, motif, question, follow pill, sources */
const endCard = (g: G, T: number) => {
  const k = ramp(T, END, 0.5); if (k <= 0) return;
  g.save(); g.fillStyle = `rgba(10,8,6,${0.93 * k})`; g.fillRect(0, 0, W, H); g.restore();
  const ring = eio(ramp(T, END + 0.1, 0.9)); g.save(); g.globalAlpha = k; g.strokeStyle = GOLD; g.lineWidth = 3; g.beginPath(); g.arc(960, 175, 52, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ring); g.stroke(); g.restore();
  txt(g, 'J', 958, 202, 74, GOLD, { f: SERIF, alpha: k * ramp(T, END + 0.5, 0.4) }); txt(g, 'JUNO', 960, 262, 20, `${PAPER}.7)`, { w: 500, alpha: k * ramp(T, END + 0.6, 0.4) });
  const ta = k * ramp(T, END + 0.4, 0.5);
  const gr = g.createLinearGradient(0, 330, 0, 410); gr.addColorStop(0, '#fff0c4'); gr.addColorStop(0.5, GOLD); gr.addColorStop(1, '#c8913a');
  g.save(); g.globalAlpha = ta; g.font = `900 84px ${SERIF}`; g.textAlign = 'center'; g.fillStyle = gr; g.shadowColor = 'rgba(241,197,109,.4)'; g.shadowBlur = 20; g.fillText('《你能出生的概率》', 960, 400); g.restore();
  withCam(g, 0.17, 960, 560, () => { g.globalAlpha = ta; inkTree(g, { grow: 0, coll: 0, gens: (gen) => (gen < 6 ? 1 : 0), alpha: (gen) => ta * Math.max(0.25, 0.95 - gen * 0.08), width: () => 3 }); g.save(); g.strokeStyle = RED; g.lineWidth = 9; for (let gen = 0; gen < 6; gen++) brush(g, P(gen, lineage(gen, A6), 0, 0), P(gen + 1, lineage(gen + 1, A6), 0, 0), 1); g.restore(); seal(g, ROOT.x, ROOT.y, '你', ta); });
  const qa = k * ramp(T, END + 0.9, 0.5);
  txt(g, '你知道的，最远的祖先是谁？评论区见', 960, 680, 50, INK, { w: 700, alpha: qa });
  const pa = k * ramp(T, END + 1.3, 0.5); g.save(); g.globalAlpha = pa; g.strokeStyle = GOLD; g.lineWidth = 2; const pw = 520, ph = 74; g.beginPath(); g.roundRect(960 - pw / 2, 740, pw, ph, ph / 2); g.stroke(); g.restore();
  txt(g, '关注 Juno · 一起看懂世界', 960, 790, 34, GOLD, { w: 700, alpha: pa });
  txt(g, '资料：Rohde, Olson & Chang, Nature 431 (2004) · PRB (2022) · Our World in Data 儿童死亡率', 960, 905, 22, `${PAPER}.45)`, { w: 400, alpha: k * ramp(T, END + 1.6, 0.5) });
};

const draw = (g: G, T: number) => {
  paper(g);
  if (T < TITLE) hook(g, T);
  else if (T < CLIMB) title(g, T);
  else if (T < 45.8) climb(g, T);
  else if (T < BUILD) collapse(g, T);
  else if (T < DROP) model(g, T);
  else survival(g, T);
  endCard(g, T);
  const brandHide = (T >= TITLE && T < CLIMB) ? 0 : 1 - ramp(T, END, 0.4);
  mark(g, brandHide);
  const L = LINES.find(([a, b]) => T >= a && T < b);
  if (L) { bottomBar(g); subtitle(g, L[2], ramp(T, L[0], 0.12) * (1 - ramp(T, L[1] - 0.1, 0.1))); }
};

export const Film: React.FC = () => {
  const f = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null); const [h] = useState(() => delayRender('fonts')); const [ok, setOk] = useState(false);
  useEffect(() => {
    const s = LINES.map((l) => l[2]).join('') + '父母祖曾高五六世第代…ABC个万亿约位置答案超过从古到今出生过的所有人年前全世界你的祖先同一×长江边种稻子他她只算一条直系每按半活到成年计不是全部概率分之《》往上多少？—VIBE知识大赏评论区见关注Juno·一起看懂资料JUNO民国清明元南宋北宋今天½◆0123456789,/';
    Promise.all([`700 68px ${SANS}`, `900 68px ${SANS}`, `700 40px ${SANS}`, `500 26px ${SANS}`, `400 22px ${SANS}`, `900 108px ${SERIF}`, `700 44px ${SERIF}`].map((x) => document.fonts.load(x, s).catch(() => null))).then(() => { setOk(true); continueRender(h); });
  }, [h]);
  useLayoutEffect(() => { if (!ok || !ref.current) return; const g = ref.current.getContext('2d')!; g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.clearRect(0, 0, W, H); draw(g, f / FPS); }, [f, ok]);
  return <AbsoluteFill style={{ background: '#000' }}>
    <canvas ref={ref} width={W} height={H} />
    <Audio src={staticFile('bgm.mp3')} volume={(fr) => interpolate(fr, [(LEN_S - 2.6) * FPS, LEN_S * FPS], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })} />
  </AbsoluteFill>;
};
