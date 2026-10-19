/* Reverse opening motion test (~17 s): one ancestor 1000 years ago branches DOWN, faster and faster; half the children die young;
   the camera rides the line that leads to you, then slowly pulls out to show the whole tree and you; one ancestor on your line
   goes out, everything below him goes dark in a wave, and you vanish with it. Then the title. */
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';
import { W, H, G, GOLD, INK, SERIF, SANS, txt, glow, mark, sub } from './Looks';

export const REVERSE_LEN = 600;
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ramp = (t: number, a: number, d: number) => clamp((t - a) / d);
const eio = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const eo = (x: number) => 1 - Math.pow(1 - x, 3);

/* ---------------------------------------------------------------- the descendant tree (built once, seeded) */
const GENS = 40, CAP = 430, DY = 45, WMAX = 3200;
type N = { g: number; p: number; alive: boolean; kids: number[]; x: number; y: number; k: number; nk: number; line?: boolean; gone?: boolean };
const TREE = (() => {
  for (let seed = 7; ; seed++) {
    let s = seed; const r = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    const nodes: N[] = [{ g: 0, p: -1, alive: true, kids: [], x: 0, y: 0, k: 0, nk: 1 }];
    let front = [0];
    for (let g = 0; g < GENS && front.length; g++) {
      const next: number[] = [];
      const reproduce = Math.min(1, (CAP * 1.05) / Math.max(1, front.length * 1.35));
      for (const pi of front) {
        if (g > 2 && r() > reproduce) continue;                                   // line ends: no children
        const born = g < 3 ? 3 + Math.floor(r() * 2) : 1 + Math.floor(r() * 4);  // 1–4 children (3–4 at the start)
        for (let c = 0; c < born; c++) {
          const alive = g < 2 ? c < 2 || r() < 0.5 : r() < 0.5;                   // about half die young
          const id = nodes.length; nodes.push({ g: g + 1, p: pi, alive, kids: [], x: 0, y: 0, k: c, nk: born });
          nodes[pi].kids.push(id); if (alive) next.push(id);
        }
      }
      front = next;
    }
    const last = nodes.filter((n) => n.g === GENS && n.alive);
    if (last.length < 200) continue;
    /* layout: every living node owns a slice of [0,1]; children split their parent's slice by family size, so lines stay
       near their parents and a lost ancestor takes a clean wedge with him. The slice is mapped into a width that flares downward. */
    const byGen: number[][] = Array.from({ length: GENS + 1 }, () => []);
    const desc: number[] = new Array(nodes.length).fill(0);
    for (let i = nodes.length - 1; i > 0; i--) if (nodes[i].alive) desc[nodes[i].p] += 1 + desc[i];
    const place = (i: number, a: number, b: number) => {
      const n = nodes[i]; byGen[n.g].push(i); const w = n.g === 0 ? 0 : WMAX * Math.pow(n.g / GENS, 0.6);
      n.x = ((a + b) / 2 - 0.5) * w; n.y = n.g * DY;
      const kids = n.kids.filter((c) => nodes[c].alive); const ws = kids.map((c) => Math.sqrt(1 + desc[c]) + 0.6); const tot = ws.reduce((x, y) => x + y, 0);
      let u = a; kids.forEach((c, j) => { const v = u + ((b - a) * ws[j]) / tot; place(c, u, v); u = v; });
    };
    place(0, 0, 1);
    for (const n of nodes) if (!n.alive) { const p = nodes[n.p]; const sp = Math.min(14, 40 / Math.max(1, n.g)); n.x = p.x + (n.k - (n.nk - 1) / 2) * sp; n.y = p.y + DY * 0.42; }
    /* you: a final-generation node near the middle */
    const L = byGen[GENS]; const you = L[Math.floor(L.length * 0.56)];
    const line: number[] = []; for (let i = you; i >= 0; i = nodes[i].p) { nodes[i].line = true; line.unshift(i); }
    /* the ancestor who goes out: the one on your line between gens 5 and 9 whose subtree is the biggest share below 40 % */
    const size = (i: number): number => { const n = nodes[i]; return (n.g === GENS && n.alive ? 1 : 0) + n.kids.reduce((a, c) => a + size(c), 0); };
    let cut = line[6], best = 0;
    for (let g = 5; g <= 9; g++) { const sh = size(line[g]) / L.length; if (sh < 0.4 && sh > best) { best = sh; cut = line[g]; } }
    const mark = (i: number) => { nodes[i].gone = true; nodes[i].kids.forEach(mark); }; mark(cut);
    return { nodes, line, you, cut, byGen };
  }
})();

/* ---------------------------------------------------------------- timeline (seconds) */
const T0 = 1.0, I0 = 0.8, RR = 0.88;                                      // first generation takes 0.8 s, each next one 12 % faster
const GT: number[] = [T0]; for (let g = 1; g <= GENS; g++) GT.push(GT[g - 1] + I0 * Math.pow(RR, g - 1));
const T_GROWN = GT[GENS];                                                  // ≈ 7.6 s
const T_ZOOM = T_GROWN + 0.9, ZOOM_D = 3.6;
const T_CUT = 13.0, WAVE = 0.045;                                          // cascade: one generation every 45 ms
const T_YOUGONE = T_CUT + 0.6 + (GENS - TREE.nodes[TREE.cut].g) * WAVE;
const T_TITLE = T_YOUGONE + 1.6;
const genAt = (t: number) => { if (t < T0) return 0; for (let g = 1; g <= GENS; g++) if (t < GT[g]) return g - 1 + (t - GT[g - 1]) / (GT[g] - GT[g - 1]); return GENS; };
const goneAt = (n: N) => T_CUT + 0.6 + (n.g - TREE.nodes[TREE.cut].g) * WAVE;

const sky = (g: G) => { const b = g.createRadialGradient(960, 300, 50, 960, 540, 1400); b.addColorStop(0, '#15142a'); b.addColorStop(1, '#03040a'); g.fillStyle = b; g.fillRect(0, 0, W, H); let s = 3; const r = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; for (let i = 0; i < 500; i++) { g.fillStyle = `rgba(220,225,255,${r() * 0.35})`; g.beginPath(); g.arc(r() * W, r() * H, r() * 1.3 + 0.2, 0, 7); g.fill(); } };

/* camera: rides your line while the tree grows, then slowly pulls out to the whole tree */
const camera = (t: number) => {
  const { nodes, line } = TREE; const fg = Math.min(GENS, genAt(t)); const a = Math.floor(fg), b = Math.min(GENS, a + 1), f = fg - a;
  const fx = nodes[line[a]].x + (nodes[line[b]].x - nodes[line[a]].x) * f, fy = (a + f) * DY;
  const sClose = 2.6 - 1.0 * eio(ramp(t, T0, T_GROWN - T0));                // 2.6 → 1.6 while growing
  const close = { x: fx, y: fy - 120 / sClose * 1.6, s: sClose };
  const wide = { x: 0, y: (GENS * DY) / 2 + 40, s: Math.min(1760 / WMAX, 820 / (GENS * DY)) };
  const z = eio(ramp(t, T_ZOOM, ZOOM_D));
  const ls = Math.log(close.s) + (Math.log(wide.s) - Math.log(close.s)) * z;  // zoom in log space so it feels even
  return { x: close.x + (wide.x - close.x) * z, y: close.y + (wide.y - close.y) * z, s: Math.exp(ls) };
};

const draw = (g: G, t: number) => {
  sky(g);
  const { nodes, you, cut } = TREE; const cam = camera(t); const fg = genAt(t);
  const toS = (n: { x: number; y: number }) => ({ x: W / 2 + (n.x - cam.x) * cam.s, y: H * 0.47 + (n.y - cam.y) * cam.s });
  const lw = (px: number) => px;                                                // widths are in screen pixels
  const dimAll = 1 - 0.55 * eio(ramp(t, T_TITLE - 0.3, 0.8));
  const lineA = eo(ramp(t, T_ZOOM + 0.6, 2.4));                                 // the gold line to you fades in during the pull-out

  /* edges, batched by style */
  const living = new Path2D(), dead = new Path2D(), fading = new Path2D();
  let redA = 0;
  const seg = (P: Path2D, a: { x: number; y: number }, b: { x: number; y: number }, k: number) => { const A = toS(a), B = toS(b); const ex = A.x + (B.x - A.x) * k, ey = A.y + (B.y - A.y) * k; if (Math.max(A.x, ex) < -50 || Math.min(A.x, ex) > W + 50 || Math.max(A.y, ey) < -50 || Math.min(A.y, ey) > H + 50) return; P.moveTo(A.x, A.y); P.lineTo(ex, ey); };
  for (let i = 1; i < nodes.length; i++) {
    const n = nodes[i]; const k = clamp(fg - (n.g - 1)) * (n.alive ? 1 : 0.999); if (k <= 0) continue;
    const p = nodes[n.p];
    if (n.gone) { const tg = goneAt(n); if (t > tg + 0.5) continue; if (t > tg) { seg(fading, p, n, k); redA = Math.max(redA, 1 - (t - tg) / 0.5); continue; } }
    seg(n.alive ? living : dead, p, n, n.alive ? k : Math.min(k, 1));
  }
  g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
  const zoomedOut = ramp(t, T_ZOOM, ZOOM_D);
  g.globalAlpha = dimAll * (0.75 - 0.3 * zoomedOut); g.strokeStyle = '#ffd99a'; g.lineWidth = lw(1.6 - 0.8 * zoomedOut); g.stroke(living);
  g.globalAlpha = dimAll * 0.5; g.strokeStyle = '#6b6f8f'; g.lineWidth = lw(1.1 - 0.5 * zoomedOut); g.stroke(dead);
  g.restore();
  /* the wave: edges flash red-white as they go out */
  if (t > T_CUT + 0.5) { g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = '#ff7a5c'; g.shadowColor = '#ff5a3c'; g.shadowBlur = 10; g.lineWidth = 2; g.globalAlpha = 0.9 * Math.max(redA, 0.3) * dimAll; g.stroke(fading); g.restore(); }
  /* death dots on fresh dead children while the camera is close */
  if (zoomedOut < 0.5) { g.save(); g.fillStyle = 'rgba(160,165,200,.55)'; for (let i = 1; i < nodes.length; i++) { const n = nodes[i]; if (n.alive || fg - (n.g - 1) < 1 || fg - (n.g - 1) > 4) continue; const S = toS(n); if (S.x < 0 || S.x > W || S.y < 0 || S.y > H) continue; g.globalAlpha = (1 - zoomedOut * 2) * 0.8; g.beginPath(); g.arc(S.x, S.y, 2, 0, 7); g.fill(); } g.restore(); }

  /* your line, gold */
  if (lineA > 0) {
    const cutG = nodes[cut].g; const L = TREE.line;
    g.save(); g.strokeStyle = GOLD; g.shadowColor = GOLD; g.shadowBlur = 16; g.lineWidth = 3.2; g.lineCap = 'round';
    for (let j = 1; j < L.length; j++) {
      const n = nodes[L[j]], p = nodes[L[j - 1]]; let a = lineA * dimAll;
      if (n.g >= cutG) { const tg = goneAt(n); a *= 1 - ramp(t, tg - 0.05, 0.3); }
      if (a <= 0.01) continue; g.globalAlpha = a; const A = toS(p), B = toS(n); g.beginPath(); g.moveTo(A.x, A.y); g.lineTo(B.x, B.y); g.stroke();
    }
    g.restore();
  }

  /* the first ancestor */
  const R = toS(nodes[0]); const ra = ramp(t, 0.15, 0.6) * dimAll;
  glow(g, R.x, R.y, 120 * Math.min(1.4, cam.s / 1.6 + 0.3), '255,217,154', 0.55 * ra); g.save(); g.globalAlpha = ra; g.fillStyle = '#ffe2a8'; g.beginPath(); g.arc(R.x, R.y, Math.max(5, 7 * cam.s / 2), 0, 7); g.fill(); g.restore();

  /* the ancestor who goes out */
  if (t > T_CUT - 0.8) {
    const C = toS(nodes[cut]); const pre = ramp(t, T_CUT - 0.8, 0.5), out = ramp(t, T_CUT, 0.6);
    const flick = t < T_CUT ? 0.65 + 0.35 * Math.sin(t * 40) : 1;
    glow(g, C.x, C.y, 70, '255,120,90', 0.8 * pre * (1 - out) * flick);
    g.save(); g.globalAlpha = pre * (1 - out); g.strokeStyle = '#ffb59a'; g.lineWidth = 2.5; g.beginPath(); g.arc(C.x, C.y, 16 + 30 * out, 0, 7); g.stroke(); g.restore();
  }

  /* you */
  const Y = toS(nodes[you]);
  const youIn = ramp(t, T_GROWN - 0.1, 0.5), youOut = ramp(t, T_YOUGONE, 0.45);
  if (youIn > 0) {
    const a = youIn * (1 - youOut) * dimAll;
    if (youOut > 0 && youOut < 1) glow(g, Y.x, Y.y, 140, '255,150,110', 0.7 * Math.sin(youOut * Math.PI));
    glow(g, Y.x, Y.y, 130, '241,197,109', 0.6 * a);
    g.save(); g.globalAlpha = a; g.fillStyle = GOLD; g.beginPath(); g.arc(Y.x, Y.y, 9 + 4 * (1 - zoomedOut), 0, 7); g.fill(); g.restore();
    txt(g, '你', Y.x + 30, Y.y + 15, 44, INK, { a: 'left', alpha: a, glow: 'rgba(241,197,109,.6)' });
  }
  if (youOut >= 1 && t < T_TITLE + 0.5) { g.save(); g.globalAlpha = 0.35 * (1 - ramp(t, T_TITLE - 0.4, 0.6)); g.strokeStyle = INK; g.setLineDash([4, 6]); g.lineWidth = 1.5; g.beginPath(); g.arc(Y.x, Y.y, 14, 0, 7); g.stroke(); g.restore(); }

  /* year ruler (screen space) */
  const yr = Math.round(1000 + Math.min(GENS, fg) * (1026 / GENS));
  const ya = ramp(t, 0.4, 0.6) * (1 - ramp(t, T_ZOOM + 1, 0.6));
  txt(g, fg >= GENS ? '今天' : `公元 ${yr} 年`, 110, 150, 46, GOLD, { a: 'left', f: SERIF, alpha: ya, glow: 'rgba(241,197,109,.4)' });
  txt(g, `第 ${Math.min(GENS, Math.floor(fg))} 代`, 112, 205, 30, 'rgba(243,237,226,.65)', { a: 'left', w: 700, alpha: ya });

  /* title */
  if (t > T_TITLE) {
    const k = eo(ramp(t, T_TITLE, 0.7));
    g.save(); g.fillStyle = `rgba(3,4,10,${0.45 * k})`; g.fillRect(0, 0, W, H); g.restore();
    txt(g, '你能出生的概率', W / 2, 500 - 18 * (1 - k), 120, GOLD, { f: SERIF, alpha: k, glow: 'rgba(241,197,109,.55)' });
    txt(g, '= ?', W / 2, 650 - 18 * (1 - k), 96, INK, { f: SERIF, alpha: eo(ramp(t, T_TITLE + 0.35, 0.6)) });
  }
  mark(g);
  const line = t < 2.6 ? '1000年前，长江边，有一个人' : t < 4.9 ? '他有了孩子，孩子又有了孩子' : t < T_GROWN ? '那时候，大约一半的孩子活不到长大' : t < T_CUT - 1.0 ? '一千年后，这条线的尽头，是你' : t < T_YOUGONE - 0.2 ? '可只要这条线上，有一个人早走一步' : t < T_TITLE ? '就没有你' : '';
  if (line) sub(g, line);
};

export const Reverse: React.FC = () => {
  const f = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null); const [h] = useState(() => delayRender('fonts')); const [ok, setOk] = useState(false);
  useEffect(() => { const s = '1000年前，长江边有一个人他了孩子又那时候大约一半的活不到长一千后这条线尽头是你可只要上早走步就没能出生概率=?公元第代今天◆·JunoVIBE知识大赏0123456789';
    Promise.all([`900 70px ${SANS}`, `700 30px ${SANS}`, `900 120px ${SERIF}`].map((x) => document.fonts.load(x, s).catch(() => null))).then(() => { setOk(true); continueRender(h); }); }, [h]);
  useLayoutEffect(() => { if (!ok || !ref.current) return; const g = ref.current.getContext('2d')!; g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.clearRect(0, 0, W, H); draw(g, f / 30); }, [f, ok]);
  return <AbsoluteFill style={{ background: '#000' }}><canvas ref={ref} width={W} height={H} /></AbsoluteFill>;
};
