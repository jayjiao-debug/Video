import React from 'react';
import {b, beatAt, clamp, easeInOut, easeOut, inOut, keys, lerp, mulberry, prog} from '../lib';
import {C, dot, glow, LATIN, Light, motif, SANS, SERIF} from '../look';

import {flash, kuramoto, phase, pin} from '../sync';

/* The river (S2, S10 callback) plus the title and end cards. A Thai mangrove bank at night: seven tree
   crowns outlined by 3,000 fireflies, mirrored in the water. S2 runs a real Kuramoto simulation: each
   tree first falls into its own rhythm (strong pull inside a tree), then the trees lock to each other;
   once they agree, the shared flash is pinned to the music's beat (pin()). S10: all on the beat. */
const TREES: [number, number, number, number][] = [
  [170, 470, 150, 120],
  [420, 452, 190, 150],
  [690, 478, 140, 105],
  [930, 442, 215, 168],
  [1195, 468, 170, 130],
  [1450, 452, 200, 150],
  [1725, 478, 150, 110],
];
export const BANK = 560;
const N = 3000;
const FLIES = (() => {
  const r = mulberry(3);
  const out: {x: number; y: number; g: number; j: number}[] = [];
  while (out.length < N) {
    const g = Math.floor(r() * TREES.length);
    const t = TREES[g];
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r());
    const x = t[0] + Math.cos(a) * d * t[2];
    const y = t[1] + Math.sin(a) * d * t[3] * 0.8;
    if (y < BANK - 4) out.push({x, y, g, j: (r() - 0.5) * 0.5});
  }
  return out;
})();
const GROUPS = Int32Array.from(FLIES.map((f) => f.g));
/** S1's run: trees lock from ~6.5 s, the bank from ~9.5 s */
export const FLIES_J = FLIES.map((f) => f.j);
/** S2's run (from b39): each tree locks within a second or two, the whole bank by about b46 */
export const S2RUN = kuramoto({n: N, seconds: 27, hz: 1.966, spread: 0.06, groups: GROUPS, Kin: (t) => (t < 1 ? 0 : Math.min(8, (t - 1) * 5)), K: (t) => (t < 2.4 ? 0 : Math.min(5, (t - 2.4) * 2.5)), seed: 8});

/** draw the bank: θ(i) gives each firefly's phase; zoom/pan for camera moves */
export const drawRiver = (ctx: CanvasRenderingContext2D, th: (i: number) => number, o: {a: number; zoom?: number; T: number; fx?: number; fy?: number; sy?: number}) => {
  const z = o.zoom ?? 1;
  const fx = o.fx ?? 960;
  const fy = o.fy ?? BANK;
  const sy = o.sy ?? BANK;
  const X = (x: number) => 960 + (x - fx) * z;
  const Y = (y: number) => sy + (y - fy) * z;
  const bank = Y(BANK);
  const a = o.a;
  // horizon and ripples
  ctx.strokeStyle = `rgba(241,197,109,${0.18 * a})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, bank);
  ctx.lineTo(1920, bank);
  ctx.stroke();
  const rr = mulberry(5);
  for (let k = 0; k < 46; k++) {
    const y = bank + 14 + rr() * 300;
    const x = (rr() * 2200 + o.T * (8 + rr() * 10)) % 2200 - 140;
    ctx.strokeStyle = `rgba(200,210,235,${(0.04 + rr() * 0.05) * a})`;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 40 + rr() * 120, y);
    ctx.stroke();
  }
  // trunks
  for (const [x, y, w, h] of TREES) {
    ctx.strokeStyle = `rgba(241,197,109,${0.1 * a * clamp(2 - z)})`;
    ctx.lineWidth = 2 * z;
    ctx.beginPath();
    ctx.moveTo(X(x), Y(y + h * 0.5));
    ctx.lineTo(X(x - w * 0.05), bank);
    ctx.moveTo(X(x), Y(y + h * 0.4));
    ctx.lineTo(X(x + w * 0.18), bank);
    ctx.stroke();
  }
  for (let i = 0; i < N; i++) {
    const f = flash(th(i));
    const {x, y} = FLIES[i];
    const sx = X(x);
    const sy2 = Y(y);
    if (sx < -20 || sx > 1940 || sy2 < -20 || sy2 > 1100) continue;
    dot(ctx, sx, sy2, 1.1 * Math.sqrt(z), (0.2 + 0.08 * (z - 1)) * a);
    if (f > 0.02) {
      glow(ctx, sx, sy2, 2.2 * Math.sqrt(z), 0.8 * f * a, f > 0.5);
      const ry = 2 * bank - sy2 + 8 * z;
      dot(ctx, sx + Math.sin(ry * 0.08 + o.T * 2) * 3, ry, 1.6, 0.28 * f * a);
    }
  }
};

// ------------------------------------------------------------------ title card (b31 → b39)
const TITLE = ['没', '有', '指', '挥'];
export const TitleCard: React.FC<{T: number}> = ({T}) => {
  const out = prog(T, b(38), b(39));
  const draw = (ctx: CanvasRenderingContext2D) => {
    motif(ctx, 960, 320, 2, (1 - out) * easeOut(prog(T, b(31), b(32))), easeInOut(prog(T, b(31), b(33))), beatAt(T) % 1);
  };
  const words = 1 - easeOut(out);
  const rise = -24 * easeInOut(out);
  const pour = easeInOut(prog(T, b(35), b(36)));
  const col = `rgb(${Math.round(lerp(255, 246, pour))},${Math.round(lerp(246, 207, pour))},${Math.round(lerp(230, 120, pour))})`;
  const half = (b(32) - b(31)) / 2;
  return (
    <>
      <Light draw={draw} deps={[T]} bloom={1} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 410, textAlign: 'center', opacity: words, transform: `translateY(${rise}px)`}}>
        <div style={{fontFamily: LATIN, fontVariantNumeric: 'lining-nums', fontSize: 24, letterSpacing: '0.42em', color: 'rgba(243,239,230,0.6)', opacity: inOut(T, b(32), 999, 0.5, 0)}}>SPONTANEOUS SYNC · KURAMOTO · 1975</div>
        <div style={{fontFamily: SERIF, fontWeight: 900, fontSize: 132, letterSpacing: '0.1em', marginTop: 14, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4}}>
          {['《', ...TITLE, '》'].map((ch, i) => {
            const at = b(31) + Math.max(0, Math.min(TITLE.length - 1, i - 1)) * half;
            const k = clamp((T - at) / 0.16);
            const sc = 1.35 - 0.35 * easeOut(k);
            return (
              <span key={i} style={{display: 'inline-block', color: col, opacity: k, transform: `scale(${sc})`, textShadow: `0 0 ${18 + 24 * pour}px rgba(241,197,109,${0.25 + 0.4 * pour}), 0 4px 18px rgba(0,0,0,0.8)`}}>
                {ch}
              </span>
            );
          })}
        </div>
        <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 36, color: C.ink, marginTop: 18, opacity: inOut(T, b(33), 999, 0.5, 0), letterSpacing: '0.06em'}}>没有人领头，为什么会一起？</div>
        <div style={{fontFamily: LATIN, fontStyle: 'italic', fontSize: 26, color: 'rgba(243,239,230,0.5)', marginTop: 8, opacity: inOut(T, b(33.5), 999, 0.5, 0)}}>No one leads. So how do they fall into step?</div>
        <div style={{fontFamily: SANS, fontSize: 18, color: 'rgba(241,197,109,0.6)', marginTop: 26, letterSpacing: '0.3em', opacity: inOut(T, b(34), 999, 0.6, 0)}}>— Juno · VIBE知识大赏 —</div>
      </div>
    </>
  );
};

// ------------------------------------------------------------------ S10 (b273 → b311)
export const S10: React.FC<{T: number}> = ({T}) => {
  const fin = inOut(T, b(273), b(311) + 0.3, 0.8, 1.2);
  const zoom = keys(T, [[b(273), 1.05], [b(310), 0.62]], easeInOut);
  const th = (i: number) => 2 * Math.PI * beatAt(T) + FLIES[i].j * keys(T, [[b(273), 1], [b(281), 0.3]]);
  const draw = (ctx: CanvasRenderingContext2D) => drawRiver(ctx, th, {a: fin, zoom, T});
  return <Light draw={draw} deps={[T]} bloom={1.1} />;
};

// ------------------------------------------------------------------ end card (last 6 s)
const QUESTION = '你现在的节奏，是你自己的吗？';
const SOURCES = 'Buck & Buck 1968 · Huygens 1665 · Kuramoto 1975 · Mirollo & Strogatz 1990 · Ikeguchi Lab 2012 · Dallard et al. 2001 · Strogatz et al. 2005 · Néda et al. 2000';
export const EndCard: React.FC<{T: number}> = ({T}) => {
  const t0 = b(311);
  const o = inOut(T, t0 - 0.2, 999, 0.6, 0);
  const ring = easeInOut(prog(T, t0, t0 + 1.2));
  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = `rgba(241,197,109,${0.95 * o})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(960, 170, 52, -Math.PI / 2, -Math.PI / 2 + ring * Math.PI * 2);
    ctx.stroke();
    motif(ctx, 960, 490, 1, o * prog(T, t0 + 0.8, t0 + 1.4), 1, beatAt(T) % 1);
  };
  const at = (d: number) => inOut(T, t0 + d, 999, 0.5, 0) * o;
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: '#05060b', opacity: 0.55 * o}} />
      <Light draw={draw} deps={[T]} bloom={0.9} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 128, textAlign: 'center', fontFamily: LATIN, fontWeight: 600, fontSize: 62, lineHeight: '84px', color: '#f6cf78', opacity: at(0.6)}}>J</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 268, textAlign: 'center', fontFamily: SERIF, fontWeight: 900, fontSize: 92, letterSpacing: '0.1em', color: '#f6cf78', textShadow: '0 0 26px rgba(241,197,109,0.45)', opacity: at(0.4)}}>《没有指挥》</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 570, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 44, color: C.ink, opacity: at(1.2)}}>{QUESTION}</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 670, display: 'flex', justifyContent: 'center', opacity: at(1.8)}}>
        <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 26, color: '#05060b', background: C.gold, borderRadius: 999, padding: '8px 30px', letterSpacing: '0.06em'}}>关注 Juno · 每期一个反直觉的知识</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 790, textAlign: 'center', fontFamily: SANS, fontSize: 17, color: 'rgba(243,239,230,0.38)', opacity: at(2.2)}}>{SOURCES}</div>
    </>
  );
};
