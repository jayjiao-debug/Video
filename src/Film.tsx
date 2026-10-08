import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Board, P0, pt, DARK, LIGHT, A_CELL, B_CELL, Proj } from './Board';
import { EV, BEAT, FILM_END, SUBS, ZH, SANS, MONO, prog, easeOut, easeIn, easeInOut, clamp, lerp, hit } from './lib';
import music from './music.json';
import { JUNO } from './brand/identity';

/* 《大脑的懒惰》 v3: five shortcuts the brain takes, each one measured: the Adelson checker shadow (lightness), Shepard's
   tables (perspective), Anstis's footsteps (speed from contrast), Novick's confetti spheres (colour borrowed from
   neighbours) and the barber pole (the simplest direction). Each illusion hands over to the next through an object:
   board → table top, gold table top → yellow block, black-and-white stripes → the spheres' coloured stripes,
   coloured stripes → the barber pole behind a closing slit, slit shut → recap, board card → the board.
   Locked camera; punches only on the title, the table landing, the drop and the window opening. The eyedropper readout
   is screen furniture (top right) and always tells the truth: every value it shows is the value of the pixel under
   the crosshair in the rendered frame (checked by sampling the render). No grain and no vignette anywhere over the
   board, so A and B stay identical pixels. Every frame is a pure function of T. */

const GOLD = '#f1c56d', GLOW = 'rgba(241,197,109,0.7)', INK = '#f3ede2', DIM = 'rgba(243,237,226,0.55)', RED = '#ff5a48';
const NUM = '#f4b860';
const BAR = 128;
const useFonts = () => {
  const [h] = useState(() => delayRender('fonts', { timeoutInMilliseconds: 60000 }));
  useEffect(() => {
    Promise.all(['900 40px "Noto Serif CJK SC"', '400 40px "Noto Sans CJK SC"', '700 40px "Noto Sans CJK SC"', '900 40px "Noto Sans CJK SC"', '400 40px "JunoMono"', '700 40px "JunoMono"']
      .map((f) => document.fonts.load(f, '测试0123')).map((p) => p.catch(() => null))).then(() => continueRender(h));
  }, [h]);
};

/* ---------------------------------------------------------------- timing */
const strip = (s: string) => s.replace(/[[\]{}]/g, '');
const at = (s: string) => { const l = SUBS.find((x) => strip(x[2]).includes(s)); if (!l) throw new Error(`no line ${s}`); return l[0]; };
const vis = (T: number, a: number, z: number, fi = 0.25, fo = 0.3) => Math.min(easeOut(prog(T, a, a + fi)), 1 - prog(T, z - fo, z));
const rise = (T: number, a: number, d = 22) => (1 - easeOut(prog(T, a, a + 0.2))) * d; // a fast landing, then still
const L = {
  hide: at('盯着B'), deeper: at('B在变深'), take: at('把阴影'), guess: at('大脑不测量'), helm: at('1867'),
  glass: at('这块玻璃'), bet1: at('放得进'), lift: at('看好了'), fit: at('严丝合缝'), measure: at('两条长边'), look2: at('左边还是更长'), persp: at('透视'),
  race: at('赛跑'), step: at('一步一停'), tie: at('同时撞线'), again: at('再跑一次'),
  balls: at('再来一组'), rgb: at('红、绿'), pick: at('取一次色'), first: at('第一个'), second: at('第二个'),
  same: at('同一种米色'), lines: at('彩色的'), save: at('处理颜色很'),
  right: at('明明在往右'), fingers: at('两根手指，把'), up: at('一条缝'), lazy: at('最省事'),
  world: at('你看到的世界'), right2: at('都猜对了'), now: at('再看一眼A和B'), still: at('还是不一样'),
};
const TITLE = EV.title, DROP = EV.drop, BAR4 = 4 * BEAT;
const TITLE_OUT = TITLE + 3.3;                    // the card leaves through the board growing back around A and B
// v7 (music lengthened by repeated phrases, scripts/music.py):
const T1 = TITLE + 8 * BAR4;                      // 24.42 board → tables, on a phrase start
const LAND = TITLE + 12 * BAR4;                   // 32.56 the glass lands on the right table
const T2 = EV.break, OFF = EV.break + 5 * BAR4;   // 48.84 race starts; 59.01 both cross the line on a downbeat
const T3 = EV.build;                              // 69.19 race → spheres
const T4 = DROP + 5 * BAR4;                       // 95.31 spheres → barber pole
const SLIT = DROP + 9 * BAR4;                     // 103.45 the sides close to a slit (≈5 s to put fingers on)
const T5 = DROP + 12 * BAR4;                      // 109.56 the slit shuts → recap
const T6 = DROP + 16 * BAR4;                      // 117.70 recap → board
const END_CARD = DROP + 19 * BAR4;                // 123.80; the film ends at drop + 23 bars
const SHOT = {
  board1: [0, T1], tables: [T1, T2], feet: [T2, T3], balls: [T3, T4], barber: [T4, T5], recap: [T5, T6], board2: [T6, FILM_END],
} as const;
/** the next beat at or after t (after the drop the tracker's grid is half a beat off: count from the measured onset) */
const BEATS: number[] = (music as any).beats;
const nextBeat = (t: number) => t > DROP ? DROP + Math.ceil((t - DROP) / BEAT - 1e-6) * BEAT : (BEATS.find((b) => b >= t - 1e-6) ?? t);
/** the five shortcuts, stamped into the top bar one by one */
const STAMPS: [string, string, number][] = [          // each lands on its reveal hit
  ['阴影', '按阴影调亮', nextBeat(L.helm)], ['透视', '按透视拉长', LAND], ['对比', '看对比估速度', OFF],
  ['借色', '借旁边的颜色', DROP], ['省事', '挑最省事的答案', SLIT],
];
const inShot = (T: number, k: keyof typeof SHOT) => T >= SHOT[k][0] && T < SHOT[k][1];

/* ---------------------------------------------------------------- screen furniture */
type Row = { k: string; v: [number, number, number]; o: number; note?: string };
const Picker: React.FC<{ rows: Row[]; o?: number; foot?: string; footO?: number }> = ({ rows, o = 1, foot, footO = 1 }) => o <= 0.001 ? null : (
  <div style={{ position: 'absolute', right: 70, top: 160, width: 450, padding: '16px 24px 18px', borderRadius: 16, background: 'rgba(10,10,12,0.86)', border: '1px solid rgba(243,237,226,0.18)', fontFamily: MONO, color: INK, opacity: o }}>
    <div style={{ fontSize: 22, letterSpacing: '0.25em', color: DIM, marginBottom: 10, fontFamily: SANS, fontWeight: 700 }}>取色器 · RGB</div>
    {rows.map((r, i) => (
      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 33, fontWeight: 700, marginTop: i ? 10 : 0, opacity: r.o }}>
        <span style={{ width: 42, height: 42, borderRadius: 7, background: `rgb(${r.v.join(',')})`, border: '1px solid rgba(255,255,255,0.35)', flexShrink: 0 }} />
        <span style={{ minWidth: 70, fontFamily: SANS, fontWeight: 900, fontSize: 30, whiteSpace: 'nowrap', flexGrow: 1 }}>{r.k}</span>
        <span style={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'pre' }}>{r.v.map((x) => String(x).padStart(3, ' ')).join(' ')}</span>
      </div>
    ))}
    {foot && <div style={{ marginTop: 10, fontSize: 24, fontFamily: SANS, fontWeight: 700, color: DIM, opacity: footO }}>{foot}</div>}
  </div>
);
const G = (v: number): [number, number, number] => [v, v, v];

/** the eyedropper's crosshair */
const Cross: React.FC<{ x: number; y: number; o: number; ring?: number }> = ({ x, y, o, ring = 0 }) => o <= 0.001 ? null : (
  <g opacity={o}>
    {ring > 0 && <circle cx={x} cy={y} r={18 + 40 * (1 - ring)} fill="none" stroke="#fff" strokeWidth={2} opacity={ring} />}
    <g stroke="#000" strokeWidth={5} opacity={0.6}><line x1={x - 30} y1={y} x2={x - 9} y2={y} /><line x1={x + 9} y1={y} x2={x + 30} y2={y} /><line x1={x} y1={y - 30} x2={x} y2={y - 9} /><line x1={x} y1={y + 9} x2={x} y2={y + 30} /></g>
    <g stroke="#fff" strokeWidth={2}><line x1={x - 30} y1={y} x2={x - 9} y2={y} /><line x1={x + 9} y1={y} x2={x + 30} y2={y} /><line x1={x} y1={y - 30} x2={x} y2={y - 9} /><line x1={x} y1={y + 9} x2={x} y2={y + 30} /></g>
  </g>
);

/** the eyedropper (pipette), our own drawing: tip at (x, y), body up and to the right. The glass barrel fills with
    the colour it has just picked (level 0..1); a ring spreads from the tip on each pick. */
const Dropper: React.FC<{ x: number; y: number; o: number; ring?: number; fill?: string; level?: number }> = ({ x, y, o, ring = 0, fill, level = 0 }) => o <= 0.001 ? null : (
  <g opacity={o}>
    {ring > 0 && <circle cx={x} cy={y} r={10 + 44 * (1 - ring)} fill="none" stroke="#fff" strokeWidth={2.5} opacity={ring} />}
    <g transform={`translate(${x} ${y}) rotate(-45)`}>
      {/* soft shadow */}
      <path d="M 4 4 L 40 7 L 40 15 L 126 15 L 126 19 L 138 19 L 138 21 Q 190 21 190 4 Q 190 -13 138 -13 L 138 -11 L 126 -11 L 126 -7 L 40 -7 L 40 1 Z" fill="#000" opacity={0.35} transform="translate(5 7)" />
      {/* nozzle */}
      <path d="M 0 0 L 38 -5 L 38 5 Z" fill="rgba(225,240,248,0.85)" stroke="#1b1b20" strokeWidth={2.5} strokeLinejoin="round" />
      {/* barrel: glass, filling with the picked colour */}
      <rect x={38} y={-11} width={88} height={22} rx={4} fill="rgba(225,240,248,0.35)" />
      {fill && level > 0 && <rect x={38} y={-9} width={86 * level} height={18} rx={3} fill={fill} />}
      <rect x={38} y={-11} width={88} height={22} rx={4} fill="none" stroke="#1b1b20" strokeWidth={3} />
      <line x1={44} y1={-6} x2={118} y2={-6} stroke="#fff" strokeOpacity={0.75} strokeWidth={2.5} strokeLinecap="round" />
      {/* collar and rubber bulb */}
      <rect x={124} y={-15} width={16} height={30} rx={3} fill="#3a3a42" stroke="#1b1b20" strokeWidth={2.5} />
      <path d="M 140 -13 Q 192 -15 192 0 Q 192 15 140 13 Z" fill="#2a2a30" stroke="#121216" strokeWidth={2.5} />
      <path d="M 150 -7 Q 176 -8 182 -2" fill="none" stroke="#fff" strokeOpacity={0.35} strokeWidth={3} strokeLinecap="round" />
    </g>
  </g>
);

const Tag: React.FC<{ x: number; y: number; top: string; sub?: string; o: number; dy?: number; color?: string }> = ({ x, y, top, sub, o, dy = 0, color = DIM }) => o <= 0.001 ? null : (
  <div style={{ position: 'absolute', left: x, top: y + dy, opacity: o }}>
    <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: '0.2em', color }}>{top}</div>
    {sub && <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 31, color: INK, marginTop: 8 }}>{sub}</div>}
  </div>
);

const Big: React.FC<{ s: string; y: number; size: number; color?: string; o?: number; font?: string; glow?: string; dy?: number }> =
  ({ s, y, size, color = INK, o = 1, font = SANS, glow, dy = 0 }) => o <= 0.001 ? null : (
    <div style={{ position: 'absolute', left: 0, right: 0, top: y + dy, textAlign: 'center', opacity: o, fontFamily: font, fontWeight: 900, fontSize: size, color,
      letterSpacing: '0.04em', textShadow: glow ? `0 0 26px ${glow}, 0 4px 18px rgba(0,0,0,0.8)` : '0 0 4px #000, 0 4px 20px rgba(0,0,0,0.9)', whiteSpace: 'pre' }}>{s}</div>
  );

/* ---------------------------------------------------------------- 1. the board */
const [AX, AY] = pt(P0, A_CELL[0] + 0.5, A_CELL[1] + 0.5);
const [BX, BY] = pt(P0, B_CELL[0] + 0.5, B_CELL[1] + 0.5);

/** the room under the board: a dark table seen from above at an angle, a warm light from behind the board (the light
    that casts the cylinder's shadow towards us). Drawn under the board only; nothing is laid over the squares. */
const Table: React.FC<{ uid: string }> = ({ uid }) => {
  const q = (u: number, v: number) => pt(P0, u, v).join(',');
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <linearGradient id={`${uid}wall`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0d0b0d" /><stop offset="1" stopColor="#17130f" /></linearGradient>
        <linearGradient id={`${uid}tab`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a2a1b" /><stop offset="0.5" stopColor="#24190f" /><stop offset="1" stopColor="#120c07" /></linearGradient>
        <radialGradient id={`${uid}pool`} cx="0.5" cy="0.18" r="0.6"><stop offset="0" stopColor="#ffcf8a" stopOpacity={0.22} /><stop offset="1" stopColor="#ffb060" stopOpacity={0} /></radialGradient>
        <filter id={`${uid}cs`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="22" /></filter>
      </defs>
      <rect width={1920} height={1080} fill={`url(#${uid}wall)`} />
      <polygon points={`${q(-1.6, -1.6)} ${q(6.6, -1.6)} ${q(6.6, 6.6)} ${q(-1.6, 6.6)}`} fill={`url(#${uid}tab)`} />
      {Array.from({ length: 16 }, (_, i) => { const u = -1.6 + (i + 0.5) * (8.2 / 16); const [x0, y0] = pt(P0, u, -1.6), [x1, y1] = pt(P0, u, 6.6); return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke="#000" strokeOpacity={0.12} strokeWidth={1.5} />; })}
      <polygon points={`${q(-1.6, -1.6)} ${q(6.6, -1.6)} ${q(6.6, 6.6)} ${q(-1.6, 6.6)}`} fill={`url(#${uid}pool)`} />
      {/* contact shadow under the board (towards the viewer, away from the light) */}
      <polygon points={`${q(0.2, 0.6)} ${q(5.4, 0.6)} ${q(5.4, 5.7)} ${q(0.2, 5.7)}`} fill="#000" opacity={0.55} filter={`url(#${uid}cs)`} />
    </svg>
  );
};

const slideAt = (T: number) => {
  if (T < L.take) return 0;
  const away = easeInOut(prog(T, L.take + 0.25, L.take + 1.75)), back = easeInOut(prog(T, L.guess + 0.2, L.guess + 1.5));
  return 1.65 * (away - back);
};
const irisAt = (T: number) => {
  if (T >= L.hide && T < TITLE) return lerp(1500, 150, easeInOut(prog(T, L.hide + 0.05, TITLE - 0.15)));
  if (T >= TITLE_OUT - 0.25 && T < TITLE_OUT + 0.35) return lerp(150, 1600, easeIn(prog(T, TITLE_OUT - 0.25, TITLE_OUT + 0.35)));
  return 0;
};

/** opening cursor: to A, click, to B, click, away */
const CUR = { a0: 0.25, a1: 0.65, b0: 0.8, b1: 1.15, off: 1.5 };
const cursorAt = (T: number): [number, number, number, number] => {
  const home: [number, number] = [1640, 320];
  let x = home[0], y = home[1];
  const ka = easeInOut(prog(T, CUR.a0, CUR.a1)), kb = easeInOut(prog(T, CUR.b0, CUR.b1));
  x = lerp(home[0], AX, ka); y = lerp(home[1], AY, ka);
  if (T >= CUR.b0) { x = lerp(AX, BX, kb); y = lerp(AY, BY, kb); }
  const ring = T >= CUR.b1 ? Math.max(0, 1 - (T - CUR.b1) / 0.35) : T >= CUR.a1 ? Math.max(0, 1 - (T - CUR.a1) / 0.35) : 0;
  const o = Math.min(easeOut(prog(T, 0.05, 0.25)), 1 - prog(T, CUR.off, CUR.off + 0.3));
  return [x, y, o, ring];
};

/** what the brain does with A and B: pixel ÷ the light it assumes = the surface it reports (示意) */
const Infer: React.FC<{ T: number }> = ({ T }) => {
  const o = vis(T, L.guess + 1.4, T1 - 0.45, 0.3, 0.25);   // after the cylinder has slid back under it
  if (o <= 0.001) return null;
  const res = easeOut(prog(T, L.guess + 2.3, L.guess + 2.55));
  const row = (k: string, light: string, f: string, out: number, word: string, o2: number) => (
    <div style={{ marginTop: 12, opacity: o2 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, fontFamily: MONO, fontWeight: 700, fontSize: 33, color: INK, whiteSpace: 'pre' }}>
        <span style={{ fontFamily: SANS, fontWeight: 900, width: 30 }}>{k}</span><span>{DARK}</span><span style={{ color: DIM }}>÷</span><span>{f}</span>
        <span style={{ color: DIM }}>=</span><span style={{ color: res > 0.5 ? (out === LIGHT ? GOLD : INK) : DIM, opacity: 0.35 + 0.65 * res }}>{res > 0.01 ? out : '???'}</span>
      </div>
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 25, color: DIM, marginTop: 2, marginLeft: 42 }}>
        {light} → <span style={{ color: res > 0.5 ? INK : DIM }}>{res > 0.01 ? word : '…'}</span>
      </div>
    </div>
  );
  return (
    <div style={{ position: 'absolute', right: 70, top: 160, width: 450, padding: '14px 24px 18px', borderRadius: 16, background: 'rgba(10,10,12,0.86)', border: '1px solid rgba(241,197,109,0.35)', opacity: o }}>
      <div style={{ fontSize: 22, letterSpacing: '0.15em', color: DIM, fontFamily: SANS, fontWeight: 700 }}>大脑的推断 · 示意</div>
      <div style={{ fontSize: 22, color: DIM, fontFamily: SANS, marginTop: 4 }}>像素 ÷ 以为的光 = 看到的颜色</div>
      {row('B', '以为在阴影里', '0.5', LIGHT, '浅色格', 1)}
      {row('A', '以为在亮处', '1.0', DARK, '深色格', easeOut(prog(T, L.guess + 1.8, L.guess + 2.1)))}
    </div>
  );
};

const BoardShot: React.FC<{ T: number; uid: string; open?: boolean }> = ({ T, uid, open }) => {
  const r = open ? irisAt(T) : 0;
  const masked = open && T >= TITLE && T < TITLE_OUT - 0.25;
  const punch = open ? 1 + 0.03 * hit(T, TITLE, 0.22) : 1;
  const la = open ? [easeOut(prog(T, CUR.a1 - 0.05, CUR.a1 + 0.15)), easeOut(prog(T, CUR.b1 - 0.05, CUR.b1 + 0.15))] as [number, number] : [1, 1] as [number, number];
  return (
    <AbsoluteFill>
      {!masked && <Table uid={uid} />}
      {masked && <AbsoluteFill style={{ background: '#050505' }} />}
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <g transform={`translate(${BX} ${(AY + BY) / 2}) scale(${punch}) translate(${-BX} ${-(AY + BY) / 2})`}>
          <Board uid={uid} slide={open ? slideAt(T) : 0} bFixed={open && T >= L.take} irisR={r} maskAB={masked ? 1 : 0} labelO={la} />
        </g>
      </svg>
      {open && T >= T1 - 0.55 && <Fold T={T} />}
    </AbsoluteFill>
  );
};

const TitleCard: React.FC<{ T: number }> = ({ T }) => {
  const a = TITLE;
  if (T < a - 0.02 || T > TITLE_OUT + 0.1) return null;
  const out = easeInOut(prog(T, TITLE_OUT - 0.6, TITLE_OUT - 0.3));
  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      {[...'大脑的懒惰'].map((c, i) => {
        const k = easeOut(prog(T, a + 0.08 + i * 0.05, a + 0.26 + i * 0.05));
        return <div key={i} style={{ position: 'absolute', left: 960 + (i - 2) * 150 - 75, width: 150, top: 668 + (1 - k) * 34, textAlign: 'center', opacity: k, fontFamily: ZH, fontWeight: 900, fontSize: 132, color: GOLD, textShadow: `0 0 30px ${GLOW}` }}>{c}</div>;
      })}
      <div style={{ position: 'absolute', left: 960 - 400 * easeOut(prog(T, a + 0.3, a + 0.7)), width: 800 * easeOut(prog(T, a + 0.3, a + 0.7)), top: 860, height: 3, background: GOLD, boxShadow: `0 0 12px ${GLOW}` }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 880, textAlign: 'center', opacity: easeOut(prog(T, a + 0.5, a + 0.9)), fontFamily: MONO, fontWeight: 700, fontSize: 28, letterSpacing: '0.45em', color: DIM }}>{JUNO.series}</div>
    </AbsoluteFill>
  );
};


/* ---------------------------------------------------------------- 2. Shepard's tables (Shepard 1990, Mind Sights) */
type P2 = [number, number];
const U: P2 = [-118, -276], V: P2 = [112, 46];            // |U| = 300, |V| = 121
const rot = ([x, y]: P2, a: number): P2 => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
const quadOf = (c: P2, u: P2, v: P2): P2[] => { const o: P2 = [c[0] - (u[0] + v[0]) / 2, c[1] - (u[1] + v[1]) / 2]; return [o, [o[0] + u[0], o[1] + u[1]], [o[0] + u[0] + v[0], o[1] + u[1] + v[1]], [o[0] + v[0], o[1] + v[1]]]; };
const pts = (p: P2[]) => p.map((q) => q.join(',')).join(' ');
const C_L: P2 = [640, 520], C_R: P2 = [1290, 560];
const Q_L = quadOf(C_L, U, V), Q_R = quadOf(C_R, rot(U, -Math.PI / 2), rot(V, -Math.PI / 2));
/** corners in clockwise order from the top-most, so two quads can be morphed without twisting */
const cw = (q: P2[]): P2[] => {
  const cx = q.reduce((a, p) => a + p[0], 0) / q.length, cy = q.reduce((a, p) => a + p[1], 0) / q.length;
  const s = [...q].sort((a, b) => Math.atan2(a[1] - cy, a[0] - cx) - Math.atan2(b[1] - cy, b[0] - cx));
  const top = s.reduce((bi, p, i) => (p[1] < s[bi][1] ? i : bi), 0);
  return [...s.slice(top), ...s.slice(0, top)];
};
const mix = (a: P2[], b: P2[], k: number): P2[] => { const A = cw(a), B = cw(b); return A.map((p, i) => [lerp(p[0], B[i][0], k), lerp(p[1], B[i][1], k)] as P2); };

const TableDraw: React.FC<{ q: P2[]; leg: number; o?: number }> = ({ q, leg, o = 1 }) => {
  const TH = 16, LEG = 150 * leg;
  const low = [...q].sort((a, b) => b[1] - a[1]).slice(0, 3);
  return (
    <g opacity={o}>
      {low.map((p, i) => <rect key={i} x={p[0] - 7} y={p[1] + TH - 4} width={14} height={LEG} fill="#3a2414" />)}
      {q.map((p, i) => { const n = q[(i + 1) % 4]; return <polygon key={i} points={`${p[0]},${p[1]} ${n[0]},${n[1]} ${n[0]},${n[1] + TH} ${p[0]},${p[1] + TH}`} fill="#5a3518" />; })}
      <polygon points={pts(q)} fill="#b9773e" />
      <polygon points={pts(q)} fill="none" stroke="#e0a565" strokeWidth={2} />
    </g>
  );
};
const Room: React.FC = () => (
  <AbsoluteFill style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 42%, #2c2219 0%, #140e0a 68%, #070504 100%)' }}>
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      <rect x={0} y={770} width={1920} height={310} fill="#0e0a07" />
      <ellipse cx={960} cy={790} rx={900} ry={60} fill="#000" opacity={0.35} />
    </svg>
  </AbsoluteFill>
);

/** board1 → tables: the board's outline folds down into the left table top (last 0.55 s of the board shot) */
const BOARD_Q: P2[] = [pt(P0, 0, 0), pt(P0, 5, 0), pt(P0, 5, 5), pt(P0, 0, 5)] as P2[];
const Fold: React.FC<{ T: number }> = ({ T }) => {
  const k = easeInOut(prog(T, T1 - 0.55, T1));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: '#0a0706', opacity: 0.92 * easeOut(prog(T, T1 - 0.55, T1 - 0.2)) }} />
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <polygon points={pts(mix(BOARD_Q, Q_L, k))} fill={`rgba(185,119,62,${0.25 + 0.75 * k})`} stroke={GOLD} strokeWidth={4} />
      </svg>
    </AbsoluteFill>
  );
};

const LIFT0 = () => L.lift - 0.05;
/** the glass pane: lies on the left table, flies (turning 90°) and lands exactly on the right one */
const glassAt = (T: number): P2[] => {
  const k = easeInOut(prog(T, LIFT0(), LAND));
  const a = -Math.PI / 2 * k;
  const c: P2 = [lerp(C_L[0], C_R[0], k), lerp(C_L[1], C_R[1], k) - 6 - 130 * Math.sin(Math.PI * k)];
  return quadOf(c, rot(U, a), rot(V, a));
};
const Glass: React.FC<{ q: P2[]; o?: number; fit?: number }> = ({ q, o = 1, fit = 0 }) => {
  const [a, b, c, d] = q;
  const g = (k: number, j: number): P2 => [lerp(lerp(a[0], b[0], k), lerp(d[0], c[0], k), j), lerp(lerp(a[1], b[1], k), lerp(d[1], c[1], k), j)];
  return (
    <g opacity={o}>
      <polygon points={pts(q)} fill="rgba(170,225,240,0.42)" stroke={fit > 0 ? GOLD : 'rgba(225,248,255,0.95)'} strokeWidth={3 + 3 * fit} />
      {[[0.2, 0.15, 0.55, 0.4], [0.35, 0.12, 0.7, 0.32]].map(([k0, j0, k1, j1], i) => { const p0 = g(k0, j0), p1 = g(k1, j1); return <line key={i} x1={p0[0]} y1={p0[1]} x2={p1[0]} y2={p1[1]} stroke="#fff" strokeOpacity={0.7} strokeWidth={4} strokeLinecap="round" />; })}
    </g>
  );
};
/** "push your bet": the options and a 3-2-1 on the beats; on the reveal the right answer turns gold */
const Bet: React.FC<{ T: number; at: number; reveal: number; opts: string[]; right: number; until: number }> = ({ T, at, reveal, opts, right, until }) => {
  const o = vis(T, at, until, 0.2, 0.3);
  if (o <= 0.001) return null;
  const b0 = nextBeat(at + 0.6), beats = [b0, b0 + BEAT, b0 + 2 * BEAT];
  const n = beats.filter((b) => T >= b).length, done = T >= beats[2] + BEAT, shown = T >= reveal;
  const digit = n > 0 && !done ? String(4 - n) : '';
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 150, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, opacity: o }}>
      <span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 34, color: INK, textShadow: '0 0 6px #000, 0 2px 12px #000', marginRight: 6 }}>押一个</span>
      {opts.map((w, i) => {
        const win = shown && i === right, lose = shown && i !== right;
        return (
          <div key={i} style={{ padding: '10px 26px', borderRadius: 40, border: `3px solid ${win ? GOLD : 'rgba(243,237,226,0.75)'}`, background: win ? `rgba(${Math.round(40 + 160 * hit(T, reveal, 0.4))},${Math.round(30 + 130 * hit(T, reveal, 0.4))},${Math.round(12 + 60 * hit(T, reveal, 0.4))},0.94)` : 'rgba(10,10,12,0.92)',   // opaque: the bet must read over the stripes
            fontFamily: SANS, fontWeight: 900, fontSize: 40, color: win ? GOLD : lose ? 'rgba(243,237,226,0.4)' : INK, opacity: 1, boxShadow: win ? `0 0 ${12 + 30 * hit(T, reveal, 0.5)}px ${GLOW}` : 'none' }}>{w}{win ? ' ✓' : ''}</div>
        );
      })}
      <div style={{ width: 84, height: 84, borderRadius: 42, border: `3px solid ${done ? 'rgba(243,237,226,0.3)' : GOLD}`, background: 'rgba(10,10,12,0.78)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: MONO, fontWeight: 700, fontSize: 52, color: GOLD, marginLeft: 8, transform: `scale(${1 + 0.25 * hit(T, beats[Math.max(0, n - 1)], 0.15) * (n > 0 && !done ? 1 : 0)})` }}>{digit}</div>
    </div>
  );
};
const YELLOW_RECT: P2[] = [[420, 420], [516, 420], [516, 464], [420, 464]];
const TablesShot: React.FC<{ T: number }> = ({ T }) => {
  const legL = easeOut(prog(T, T1, T1 + 0.22)), legR = easeOut(prog(T, T1 + 0.08, T1 + 0.3));
  const punch = 1 + 0.03 * hit(T, LAND, 0.22);
  const landed = T >= LAND;
  const out = easeInOut(prog(T, T2 - 0.5, T2));            // tables → race: the glass becomes the yellow block
  const glassIn = easeOut(prog(T, L.glass, L.glass + 0.35)) * (1 - easeInOut(prog(T, L.look2, L.look2 + 0.45)));
  const gq = out > 0 ? mix(Q_R, YELLOW_RECT, out) : glassAt(T);
  const edges = vis(T, L.measure, L.look2 + 0.4, 0.25, 0.4);
  const longL: P2[] = [Q_L[0], Q_L[1]], longR: P2[] = [Q_R[0], Q_R[1]];
  return (
    <AbsoluteFill>
      <Room />
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <g transform={`translate(960 600) scale(${punch}) translate(-960 -600)`} opacity={1 - out}>
          <TableDraw q={Q_L} leg={legL} />
          <TableDraw q={Q_R} leg={legR} />
          {/* "measure the two long edges with two fingers": the two long sides light up, same length */}
          {edges > 0 && [longL, longR].map(([p, q], i) => (
            <g key={i} opacity={edges}>
              <line x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke={GOLD} strokeWidth={9} strokeLinecap="round" />
              <circle cx={p[0]} cy={p[1]} r={9} fill={GOLD} /><circle cx={q[0]} cy={q[1]} r={9} fill={GOLD} />
            </g>
          ))}
        </g>
      </svg>
      {out > 0 && <AbsoluteFill style={{ background: '#808080', opacity: out }} />}
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        {out > 0 ? <polygon points={pts(gq)} opacity={easeOut(prog(out, 0, 0.35))} fill={`rgb(${Math.round(lerp(170, 255, out))},${Math.round(lerp(225, 242, out))},${Math.round(lerp(240, 0, out))})`} />
          : <Glass q={gq} o={glassIn} fit={landed ? 1 : 0} />}
      </svg>
      {edges > 0 && [longL, longR].map(([p, q], i) => (
        <div key={i} style={{ position: 'absolute', left: (p[0] + q[0]) / 2 + (i ? -20 : -150), top: i ? 380 : (p[1] + q[1]) / 2 - 30, opacity: edges, fontFamily: MONO, fontWeight: 700, fontSize: 40, color: GOLD,
          textShadow: '0 0 6px #000, 0 2px 10px #000' }}>300</div>
      ))}
      <Bet T={T} at={L.bet1} reveal={LAND} opts={['放得进', '放不进']} right={0} until={L.measure} />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- 3. the race (stepping feet, Anstis 2001, Perception) */
const SW = 24, FINISH = 1200, X0 = 420;
const V1 = (FINISH - 4 * SW - X0) / (OFF - T2);               // 84 px/s: both fronts reach the line on the downbeat
const RW0 = () => L.again - 0.2, RW1 = () => L.again + 0.25;  // rewind, then a second race without stripes
const RACE2 = () => RW1() + 0.15, R2END = () => T3 - 0.9;
const V2 = () => (FINISH - 4 * SW - X0) / (R2END() - RACE2());
const barX = (T: number) => {
  if (T < RW0()) return X0 + V1 * (T - T2);
  if (T < RACE2()) { const x1 = X0 + V1 * (RW0() - T2); return lerp(x1, X0, easeInOut(prog(T, RW0(), RW1()))); }
  return X0 + V2() * Math.min(T - RACE2(), R2END() - RACE2() + 0.6);
};
const FeetStripes: React.FC<{ wipe?: number; o?: number }> = ({ wipe = 1, o = 1 }) => (
  <g opacity={o}>
    <defs><clipPath id="fw"><rect x={0} y={0} width={1920 * wipe} height={1080} /></clipPath></defs>
    <g clipPath="url(#fw)">{Array.from({ length: 41 }, (_, i) => <rect key={i} x={i * 2 * SW} y={0} width={SW} height={1080} fill="#000" />)}
      {Array.from({ length: 41 }, (_, i) => <rect key={`w${i}`} x={i * 2 * SW + SW} y={0} width={SW} height={1080} fill="#fff" />)}</g>
  </g>
);
const FeetShot: React.FC<{ T: number }> = ({ T }) => {
  const wipe = easeOut(prog(T, T2, T2 + 0.35));
  const stripes = T < L.again;
  const k = easeInOut(prog(T, T3 - 0.5, T3));               // race → spheres: coloured stripes turn in
  const x = barX(T);
  const crossFlash = hit(T, OFF, 0.4);
  return (
    <AbsoluteFill style={{ background: '#808080' }}>
      {k > 0 && <AbsoluteFill style={{ background: '#0b0b0b', opacity: k }} />}
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        {stripes && <FeetStripes wipe={wipe} />}
        {k > 0 && <g transform={`rotate(${-90 * (1 - k)} 960 540)`} opacity={k}><ColourStripes /></g>}
        <g opacity={1 - k}>
          {/* the finish line */}
          <rect x={FINISH - 5} y={360} width={10} height={360} fill={GOLD} stroke="#000" strokeWidth={3} />
          <rect x={FINISH - 5} y={360} width={10} height={360} fill={GOLD} opacity={0.5 + 0.5 * crossFlash} />
          <rect x={x} y={420} width={4 * SW} height={44} fill="#fff200" />
          <rect x={x} y={616} width={4 * SW} height={44} fill="#0a1a6e" opacity={easeOut(prog(T, T2, T2 + 0.3))} />
        </g>
      </svg>
      <div style={{ position: 'absolute', left: FINISH - 100, width: 200, top: 300, textAlign: 'center', opacity: 1 - k, fontFamily: SANS, fontWeight: 900, fontSize: 40, color: GOLD, textShadow: '0 0 6px #000, 0 2px 10px #000' }}>终点</div>
      <Big s="平局" y={760} size={88} color={GOLD} glow={GLOW} o={vis(T, OFF, L.again - 0.2, 0.06, 0.3)} dy={rise(T, OFF, 26)} />
      <Bet T={T} at={L.race + 0.2} reveal={OFF} opts={['黄先到', '蓝先到', '同时到']} right={2} until={L.again - 0.2} />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- 4. the spheres (Novick 2018, Munker–White) */
export const BEIGE = '#c9b79c';
export const SPHERE_RGB: [number, number, number] = [219, 203, 178]; // the pixel under the crosshair, sampled from the render
const STRIPE = ['#ff2a2a', '#18c43c', '#2f6bff', '#b23cff', '#ff9a1f', '#14c8d4'];
const SPH0: [number, number, number][] = [[620, 380, 0], [800, 330, 1], [980, 360, 2], [1160, 330, 3], [1330, 390, 4], [700, 560, 5], [880, 520, 3], [1060, 545, 0], [1250, 560, 1], [760, 740, 2], [960, 720, 4], [1160, 735, 5]];
const SPH: [number, number, number][] = SPH0.map(([x, y, c]) => [Math.round(975 + (x - 975) * 1.08), Math.round(545 + (y - 545) * 1.08), c]);
const R = 84, PITCH = 8, SH = 3.4;
const SAMPLE_DY = -R - 2 + 10 * PITCH + (SH + PITCH) / 2;
const ColourStripes: React.FC<{ wipe?: number }> = ({ wipe = 1 }) => (
  <g>
    <defs><clipPath id="csw"><rect x={-400} y={-400} width={(1920 + 800) * wipe} height={1880} /></clipPath></defs>
    <g clipPath="url(#csw)">{Array.from({ length: 236 }, (_, i) => <rect key={i} x={-400} y={-400 + i * PITCH} width={2720} height={SH} fill={STRIPE[Math.floor(i / 3) % STRIPE.length]} opacity={0.5} />)}</g>
  </g>
);
const PICKS = (() => {
  const t = [L.first + 0.15, L.second + 0.15, L.second + 1.3];
  const left = DROP - 0.3 - (t[2] + 0.35), n = 9, w = Array.from({ length: n }, (_, i) => Math.pow(0.86, i)), sw = w.reduce((a, b) => a + b, 0);
  let x = t[2] + 0.35;
  for (let i = 0; i < n; i++) { t.push(x); x += left * w[i] / sw; }
  return t;
})();
const picked = (T: number) => PICKS.filter((p) => T >= p).length;

const SphereSet: React.FC<{ T: number; stripes: number; wipe: number; uid: string }> = ({ T, stripes, wipe, uid }) => {
  const punch = 1 + 0.04 * hit(T, DROP, 0.25);
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <radialGradient id={`${uid}sph`} cx="0.38" cy="0.32" r="0.75"><stop offset="0" stopColor="#efe2cc" /><stop offset="0.55" stopColor={BEIGE} /><stop offset="1" stopColor="#7d6d58" /></radialGradient>
        {SPH.map(([x, y], i) => <clipPath key={i} id={`${uid}c${i}`}><circle cx={x} cy={y} r={R} /></clipPath>)}
        <clipPath id={`${uid}w`}><rect x={0} y={0} width={1920 * wipe} height={1080} /></clipPath>
      </defs>
      <g transform={`translate(960 540) scale(${punch}) translate(-960 -540)`}>
        {SPH.map(([x, y, c], i) => {
          // on the build hit each sphere pops in (a quick land, then still); on the way out they fall
          const pin = easeOut(prog(T, T3 + i * 0.025, T3 + 0.2 + i * 0.025)), s = 0.6 + 0.4 * pin + 0.08 * Math.sin(Math.PI * pin) * (1 - pin);
          const fall = 900 * easeIn(prog(T, T4 - 0.7 + i * 0.02, T4 - 0.12));
          return (
            <g key={i} transform={`translate(${x} ${y + fall}) scale(${s}) translate(${-x} ${-y})`} opacity={pin}>
              <circle cx={x} cy={y} r={R} fill={`url(#${uid}sph)`} />
              <g clipPath={`url(#${uid}c${i})`} opacity={stripes}><g clipPath={`url(#${uid}w)`}>{Array.from({ length: 24 }, (_, k) => <rect key={k} x={x - R - 2} y={y - R - 2 + k * PITCH} width={2 * R + 4} height={SH} fill={STRIPE[c]} />)}</g></g>
            </g>
          );
        })}
      </g>
    </svg>
  );
};

const Lens: React.FC<{ x: number; y: number; r: number; o: number; tint: number; id: string }> = ({ x, y, r, o, tint, id }) => {
  if (o <= 0.001) return null;
  const Z = 8, m = (k: number) => SPHERE_RGB.map((v, i) => Math.round(lerp(v, [255, 42, 42][i], k))).join(',');
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity: o }}>
      <defs><clipPath id={id}><circle cx={x} cy={y} r={r} /></clipPath></defs>
      <g clipPath={`url(#${id})`}>
        <rect x={x - r} y={y - r} width={2 * r} height={2 * r} fill={`rgb(${m(0.45 * tint)})`} />
        {Array.from({ length: 8 }, (_, k) => <rect key={k} x={x - r} y={y - r + 14 + k * PITCH * Z} width={2 * r} height={SH * Z} fill="#ff2a2a" />)}
      </g>
      <circle cx={x} cy={y} r={r} fill="none" stroke="#fff" strokeOpacity={0.8} strokeWidth={3} />
    </svg>
  );
};

const BallsShot: React.FC<{ T: number }> = ({ T }) => {
  const n = picked(T), dropped = T >= DROP;
  const stripesOn = !dropped || T >= L.lines + 0.1;
  const wipe = dropped ? easeInOut(prog(T, L.lines + 0.1, L.lines + 0.8)) : 1;
  const away = easeInOut(prog(T, T4 - 0.7, T4));          // spheres → barber pole: the room goes, the spheres fall
  let cx = 1640, cy = 330, co = 0;
  if (T >= L.pick && T < DROP) {
    co = Math.min(easeOut(prog(T, L.pick, L.pick + 0.3)), 1 - prog(T, DROP - 0.12, DROP));
    const k0 = easeInOut(prog(T, L.pick + 0.2, L.pick + 1.0));
    cx = lerp(1640, SPH[0][0], k0); cy = lerp(330, SPH[0][1] + SAMPLE_DY, k0);
    for (let i = 1; i < PICKS.length; i++) {
      const gap = PICKS[i] - PICKS[i - 1], m0 = PICKS[i] - Math.min(0.28, gap * 0.7);
      const k = easeInOut(prog(T, m0, PICKS[i] - 0.02));
      if (T >= m0) { cx = lerp(SPH[i - 1][0], SPH[i][0], k); cy = lerp(SPH[i - 1][1], SPH[i][1], k) + SAMPLE_DY; }
    }
  }
  const lens = vis(T, L.save, T4 - 0.72, 0.3, 0.22);   // gone before the spheres start to fall
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: '#0b0b0b', opacity: 1 - away }} />
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <g opacity={(stripesOn ? 1 : 0) * (1 - away)}><ColourStripes wipe={wipe} /></g>
      </svg>
      <SphereSet T={T} stripes={stripesOn ? 1 : 0} wipe={wipe} uid="sp" />
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        {!dropped && PICKS.map((p, i) => T >= p ? <circle key={i} cx={SPH[i][0]} cy={SPH[i][1]} r={R + 8} fill="none" stroke="#fff" strokeWidth={2} opacity={0.55} /> : null)}
        <Dropper x={cx} y={cy} o={co} ring={n > 0 ? Math.max(0, 1 - (T - PICKS[n - 1]) / 0.3) : 0} fill={`rgb(${SPHERE_RGB.join(',')})`} level={easeOut(prog(T, PICKS[0], PICKS[0] + 0.2))} />
      </svg>
      <Big s="12 个球 · 1 种颜色" y={150} size={84} color={GOLD} glow={GLOW} o={vis(T, DROP, L.lines, 0.05, 0.3)} dy={rise(T, DROP, 30)} />
      {lens > 0 && <AbsoluteFill style={{ background: 'rgba(6,6,7,0.82)', opacity: lens }} />}
      <Lens id="l1" x={690} y={520} r={250} o={lens} tint={0} />
      <Lens id="l2" x={1230} y={520} r={250} o={lens} tint={easeInOut(prog(T, L.save + 0.8, L.save + 2.2))} />
      <div style={{ position: 'absolute', left: 690 - 300, width: 600, top: 790, textAlign: 'center', opacity: lens, fontFamily: SANS, fontWeight: 900, fontSize: 33, color: INK }}>实际像素 · 放大 8 倍</div>
      <div style={{ position: 'absolute', left: 1230 - 300, width: 600, top: 790, textAlign: 'center', opacity: lens, fontFamily: SANS, fontWeight: 900, fontSize: 33, color: INK }}>大脑看到的（示意）</div>
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- 5. barber pole / aperture problem (Wallach 1935), played backwards:
   first the wide window (clearly moving right), then the viewer is asked to cover the sides with two fingers; on the
   downbeat two dark bands slide in where the fingers go, and the same stripes now run up. */
const SPD = 110, PER = 70, WIDE = 1300, NARROW = 480, SLIT_W = 110; // v6: the window shrinks to two finger-widths + a slit
const slitW = (T: number) => {
  const close = easeInOut(prog(T, T4 - 0.7, T4));                     // full frame → wide window, as the spheres fall
  const shrink = easeInOut(prog(T, L.fingers - 0.1, L.fingers + 0.45));   // small enough for two fingertips on a phone
  const shut = easeInOut(prog(T, T5 - 0.4, T5));
  return lerp(lerp(2000, WIDE, close), NARROW, shrink) * (1 - shut);
};
const fingersAt = (T: number) => easeInOut(prog(T, SLIT - 0.35, SLIT)); // the bands that stand in for the fingers
const BarberShot: React.FC<{ T: number }> = ({ T }) => {
  const w = slitW(T), h = lerp(1080, 540, easeInOut(prog(T, T4 - 0.7, T4))), x0 = 960 - w / 2, y0 = 540 - h / 2 + 90 * easeInOut(prog(T, T4 - 0.7, T4));
  const dx = (SPD * (T - (T4 - 0.7))) % PER;
  const intro = easeInOut(prog(T, T4 - 0.7, T4 - 0.2));
  const punch = 1 + 0.025 * hit(T, SLIT, 0.22);
  const f = fingersAt(T), bandW = (NARROW - SLIT_W) / 2;
  const guide = vis(T, L.fingers + 0.45, SLIT + 0.1, 0.25, 0.15);
  const arrow = vis(T, L.right, L.fingers + 0.6, 0.2, 0.3);
  return (
    <AbsoluteFill style={{ background: '#101014' }}>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <clipPath id="ap"><rect x={x0} y={y0} width={w} height={h} rx={10} /></clipPath>
          <pattern id="hatch" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="9" height="18" fill="rgba(243,237,226,0.22)" /></pattern>
        </defs>
        <g transform={`translate(960 600) scale(${punch}) translate(-960 -600)`}>
          <g clipPath="url(#ap)">
            <rect x={x0} y={y0} width={w} height={h} fill="#f1ece2" opacity={intro} />
            <g transform={`translate(${dx} 0)`} opacity={intro}>
              {Array.from({ length: 70 }, (_, i) => { const x = -1700 + i * PER; return <polygon key={i} points={`${x},0 ${x + 32},0 ${x + 32 + 1080},1080 ${x + 1080},1080`} fill="#c8302a" />; })}
            </g>
            {/* where to put the fingers, then the bands that do it for you */}
            {guide > 0 && [x0, 960 + SLIT_W / 2].map((bx, i) => <rect key={`g${i}`} x={bx} y={y0} width={bandW} height={h} fill="url(#hatch)" stroke={GOLD} strokeWidth={4} strokeDasharray="16 10" opacity={guide} />)}
            {f > 0 && <rect x={x0} y={y0} width={bandW * f} height={h} fill="#16161c" />}
            {f > 0 && <rect x={x0 + w - bandW * f} y={y0} width={bandW * f} height={h} fill="#16161c" />}
          </g>
          {w > 1 && <rect x={x0} y={y0} width={w} height={h} rx={10} fill="none" stroke="#3a3a44" strokeWidth={10} opacity={intro} />}
        </g>
        <g opacity={arrow}><line x1={760} y1={925} x2={1140} y2={925} stroke={GOLD} strokeWidth={8} /><polygon points="1140,907 1176,925 1140,943" fill={GOLD} /></g>
      </svg>
      {guide > 0 && [x0 + bandW / 2, 960 + SLIT_W / 2 + bandW / 2].map((cx, i) => (
        <div key={i} style={{ position: 'absolute', left: cx - 100, width: 200, top: y0 + h / 2 - 48, textAlign: 'center', opacity: guide, fontFamily: SANS, fontWeight: 900, fontSize: 80, color: GOLD, textShadow: '0 0 8px #000, 0 2px 14px #000' }}>挡</div>
      ))}
      <Big s="两根手指，各挡一边的虚线框" y={y0 - 76} size={40} color={GOLD} o={guide} />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- 6. recap: five shortcuts, each card still moving on its own clock */
const CARD_W = 340, CARD_H = 440, CARD_TOP = 180;
const CARD_X = [0, 1, 2, 3, 4].map((i) => 960 + (i - 2) * 360);
const MINI_P: Proj = { cx: CARD_X[0], cy0: CARD_TOP + 150, a: 31, b: 16 };
const MINI_K = 0.32;                                  // tables / glass drawn at 32 % inside their card
const RecapShot: React.FC<{ T: number }> = ({ T }) => {
  const t = T - T5;
  const card = (i: number) => easeOut(prog(T, T5 + i * 0.06, T5 + 0.25 + i * 0.06));
  const k = easeInOut(prog(T, T6 - 0.45, T6));               // recap → board: the board card grows into the board
  const others = 1 - easeOut(prog(T, T6 - 0.45, T6 - 0.27));
  const p: Proj = { cx: lerp(MINI_P.cx, P0.cx, k), cy0: lerp(MINI_P.cy0, P0.cy0, k), a: lerp(MINI_P.a, P0.a, k), b: lerp(MINI_P.b, P0.b, k) };
  const dy = (i: number) => (1 - card(i)) * 30;
  const sweep = (i: number) => hit(T, L.world + 0.2 + i * 0.12, 0.3);
  const osc = (period: number, ph = 0) => 0.5 - 0.5 * Math.cos((2 * Math.PI * (t + ph)) / period);
  // 1 tables: the glass goes over and back (3.6 s)
  const gk = easeInOut(osc(3.6));
  const ga = -Math.PI / 2 * gk;
  const gc: P2 = [lerp(C_L[0], C_R[0], gk), lerp(C_L[1], C_R[1], gk) - 6 - 110 * Math.sin(Math.PI * gk)];
  // 2 feet: two blocks crossing the card, looping (2.6 s)
  const fx = CARD_X[2] - CARD_W / 2 - 40 + ((t * 120) % (CARD_W + 60));
  // 3 spheres: stripes on and off (1.7 s)
  const sOn = Math.floor(t / 1.7) % 2 === 0;
  // 4 barber: stripes running in the slit
  const bdx = (t * 60) % 24;
  const by = (i: number) => CARD_TOP + dy(i);
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #0f0d10 0%, #17130f 100%)' }}>
      {CARD_X.map((x, i) => (
        <div key={i} style={{ position: 'absolute', left: x - CARD_W / 2, top: by(i), width: CARD_W, height: CARD_H, borderRadius: 18, background: '#0a0909',
          border: `2px solid rgba(241,197,109,${0.18 + 0.7 * sweep(i)})`, opacity: card(i) * others }} />
      ))}
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <defs>{CARD_X.map((x, i) => <clipPath key={i} id={`rc${i}`}><rect x={x - CARD_W / 2} y={by(i)} width={CARD_W} height={CARD_H} rx={18} /></clipPath>)}</defs>
        {/* 0 board: the shadow slides off and back, B never changes (it grows into the board on the way out) */}
        <g opacity={card(0)} transform={`translate(0 ${dy(0) * (1 - k)})`}><Board p={p} uid="rb" labels={k > 0.9} slide={1.65 * easeInOut(osc(4)) * (1 - k)} bFixed /></g>
        {/* 1 tables + glass */}
        <g opacity={card(1) * others} clipPath="url(#rc1)">
          <g transform={`translate(${CARD_X[1]} ${by(1) + 230}) scale(${MINI_K}) translate(-965 -560)`}>
            <TableDraw q={Q_L} leg={1} /><TableDraw q={Q_R} leg={1} />
            <Glass q={quadOf(gc, rot(U, ga), rot(V, ga))} fit={gk > 0.98 ? 1 : 0} />
          </g>
        </g>
        {/* 2 race */}
        <g opacity={card(2) * others} clipPath="url(#rc2)">
          {Array.from({ length: 24 }, (_, j) => <rect key={j} x={CARD_X[2] - CARD_W / 2 + j * 16} y={by(2)} width={8} height={CARD_H} fill="#000" />)}
          {Array.from({ length: 24 }, (_, j) => <rect key={`w${j}`} x={CARD_X[2] - CARD_W / 2 + j * 16 + 8} y={by(2)} width={8} height={CARD_H} fill="#fff" />)}
          <rect x={fx} y={by(2) + 150} width={40} height={24} fill="#fff200" /><rect x={fx} y={by(2) + 250} width={40} height={24} fill="#0a1a6e" />
        </g>
        {/* 3 spheres */}
        <g opacity={card(3) * others}>
          <defs>{[0, 1, 2, 3, 4, 5].map((i) => <clipPath key={i} id={`rs${i}`}><circle cx={CARD_X[3] - 95 + (i % 3) * 95} cy={by(3) + 140 + Math.floor(i / 3) * 120} r={42} /></clipPath>)}</defs>
          {[0, 1, 2, 3, 4, 5].map((i) => { const x = CARD_X[3] - 95 + (i % 3) * 95, y = by(3) + 140 + Math.floor(i / 3) * 120; return (
            <g key={i}><circle cx={x} cy={y} r={42} fill={BEIGE} />
              {sOn && <g clipPath={`url(#rs${i})`}>{Array.from({ length: 13 }, (_, j) => <rect key={j} x={x - 44} y={y - 44 + j * 7} width={88} height={3} fill={STRIPE[i]} />)}</g>}</g>); })}
        </g>
        {/* 4 barber pole */}
        <g opacity={card(4) * others}>
          <defs><clipPath id="rbp"><rect x={CARD_X[4] - 30} y={by(4) + 40} width={60} height={CARD_H - 80} rx={6} /></clipPath></defs>
          <g clipPath="url(#rbp)"><rect x={CARD_X[4] - 100} y={by(4)} width={200} height={CARD_H} fill="#f1ece2" />
            <g transform={`translate(${bdx} 0)`}>{Array.from({ length: 30 }, (_, j) => { const x = CARD_X[4] - 400 + j * 24, y = by(4); return <polygon key={j} points={`${x},${y} ${x + 11},${y} ${x + 11 + CARD_H},${y + CARD_H} ${x + CARD_H},${y + CARD_H}`} fill="#c8302a" />; })}</g></g>
          <rect x={CARD_X[4] - 30} y={by(4) + 40} width={60} height={CARD_H - 80} rx={6} fill="none" stroke="#3a3a44" strokeWidth={4} />
        </g>
      </svg>
      {CARD_X.map((x, i) => (
        <div key={i} style={{ position: 'absolute', left: x - CARD_W / 2, width: CARD_W, top: by(i) + CARD_H + 14, textAlign: 'center', opacity: card(i) * others }}>
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 54, color: GOLD, lineHeight: 1.1 }}>{STAMPS[i][0]}</div>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 32, color: DIM, marginTop: 6 }}>{STAMPS[i][1]}</div>
        </div>
      ))}
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- the score in the top bar: how many times were you fooled */
const Tally: React.FC<{ T: number }> = ({ T }) => {
  const o = easeOut(prog(T, TITLE_OUT + 0.4, TITLE_OUT + 0.9)) * (1 - prog(T, END_CARD, END_CARD + 0.4));
  if (o <= 0.001) return null;
  const n = STAMPS.filter(([, , t]) => T >= t).length;
  return (
    <div style={{ position: 'absolute', top: 34, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, opacity: o }}>
      <span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 28, color: DIM, marginRight: 8 }}>你被骗了几次？</span>
      {STAMPS.map(([, , t], i) => {
        const on = T >= t, k = easeOut(prog(T, t, t + 0.14)), glow = hit(T, t, 0.5) + (T >= T5 ? hit(T, L.world + 0.2 + i * 0.12, 0.3) : 0);
        return (
          <div key={i} style={{ width: 58, height: 58, borderRadius: 29, border: `2px solid ${on ? GOLD : 'rgba(243,237,226,0.22)'}`, background: on ? `rgba(241,197,109,${0.75 + 0.25 * glow})` : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${on ? 1 + 0.25 * (1 - k) : 1})`, boxShadow: on ? `0 0 ${8 + 26 * glow}px ${GLOW}` : 'none' }}>
            {on && <span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 34, color: '#1a1206', opacity: k }}>✓</span>}
          </div>
        );
      })}
      <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 34, color: GOLD, marginLeft: 10, minWidth: 70 }}>{n}/5</span>
    </div>
  );
};

/* ---------------------------------------------------------------- end card: the five, for counting */
const Icon: React.FC<{ i: number; x: number; y: number }> = ({ i, x, y }) => {
  const g = GOLD;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-46} y={-46} width={92} height={92} rx={14} fill="rgba(241,197,109,0.08)" stroke={g} strokeWidth={2.5} />
      {i === 0 && <g><polygon points="0,-30 30,-8 0,14 -30,-8" fill="none" stroke={g} strokeWidth={3} /><polygon points="0,-30 15,-19 0,-8 -15,-19" fill={g} /><polygon points="0,14 -15,3 0,-8 15,3" fill={g} opacity={0.5} /><ellipse cx={16} cy={-26} rx={9} ry={5} fill={g} /></g>}
      {i === 1 && <g><polygon points="-30,-6 -18,-26 30,-12 18,8" fill="none" stroke={g} strokeWidth={3} /><line x1={-26} y1={0} x2={-26} y2={28} stroke={g} strokeWidth={3} /><line x1={14} y1={12} x2={14} y2={30} stroke={g} strokeWidth={3} /></g>}
      {i === 2 && <g>{[-30, -18, -6, 6, 18].map((sx) => <rect key={sx} x={sx} y={-30} width={6} height={60} fill={g} opacity={0.55} />)}<rect x={-20} y={-14} width={24} height={9} fill={g} /><rect x={-20} y={8} width={24} height={9} fill={g} /></g>}
      {i === 3 && <g><circle cx={0} cy={0} r={28} fill="none" stroke={g} strokeWidth={3} />{[-16, -8, 0, 8, 16].map((sy) => <line key={sy} x1={-Math.sqrt(784 - sy * sy)} y1={sy} x2={Math.sqrt(784 - sy * sy)} y2={sy} stroke={g} strokeWidth={2} />)}</g>}
      {i === 4 && <g><rect x={-12} y={-32} width={24} height={64} rx={3} fill="none" stroke={g} strokeWidth={3} />{[-24, -10, 4, 18].map((sy) => <line key={sy} x1={-12} y1={sy} x2={12} y2={sy + 14} stroke={g} strokeWidth={3} />)}</g>}
    </g>
  );
};
const EndCard: React.FC<{ T: number }> = ({ T }) => {
  const a = END_CARD;
  if (T < a) return null;
  const k = (d: number) => easeOut(prog(T, a + d, a + d + 0.4));
  const black = easeIn(prog(T, FILM_END - 0.8, FILM_END));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `rgba(4,4,5,${0.9 * k(0)})` }} />
      <Big s="大脑的懒惰" y={150} size={96} color={GOLD} o={k(0)} glow={GLOW} font={ZH} />
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        {[0, 1, 2, 3, 4].map((i) => <g key={i} opacity={k(0.3 + i * 0.08)}><Icon i={i} x={960 + (i - 2) * 130} y={340} /></g>)}
      </svg>
      <Big s="五个里，你被骗了几个？" y={420} size={64} o={k(0.8)} dy={rise(T, a + 0.8)} />
      <Big s="评论区报分 · 不信就暂停截图，自己量" y={520} size={36} color={DIM} o={k(1.1)} />
      <div style={{ position: 'absolute', left: 960 - 330, top: 596, width: 660, height: 58, borderRadius: 29, border: `2px solid ${GOLD}`, opacity: k(1.3), display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: SANS, fontWeight: 700, fontSize: 28, letterSpacing: '0.15em', color: INK }}>{JUNO.follow}</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 712, textAlign: 'center', opacity: 0.6 * k(1.5), fontFamily: SANS, fontSize: 18, color: INK, lineHeight: 1.8 }}>
        资料：Adelson 1995（MIT）· Helmholtz 1867《生理光学手册》· Shepard 1990《Mind Sights》· Anstis 2001 Perception · Novick 2018（UTEP）· Wallach 1935<br />
        所有图形均为代码重绘 · "懒惰"为比喻
      </div>
      <AbsoluteFill style={{ background: '#000', opacity: black }} />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- subtitles */
const Rich: React.FC<{ s: string }> = ({ s }) => (
  <>{s.split(/(\[[^\]]+\]|\{[^}]+\}|[0-9][0-9.,%]*)/).filter(Boolean).map((seg, i) => {
    if (seg.startsWith('[')) return <span key={i} style={{ color: GOLD, fontWeight: 900 }}>{seg.slice(1, -1)}</span>;
    if (seg.startsWith('{')) return <span key={i} style={{ color: RED, fontWeight: 900 }}>{seg.slice(1, -1)}</span>;
    if (/^[0-9]/.test(seg)) return <span key={i} style={{ color: NUM }}>{seg}</span>;
    return <span key={i}>{seg}</span>;
  })}</>
);
const Subtitles: React.FC<{ T: number }> = ({ T }) => {
  const cur = SUBS.find(([a, z]) => T >= a - 0.05 && T < z + 0.1);
  if (!cur) return null;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 972, textAlign: 'center', opacity: Math.min(easeOut(prog(T, cur[0] - 0.05, cur[0] + 0.12)), 1 - prog(T, cur[1], cur[1] + 0.1)) }}>
      <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 68, color: INK, letterSpacing: '0.03em', lineHeight: 1.25, textShadow: '0 0 3px #000, 0 0 3px #000, 0 2px 14px rgba(0,0,0,0.95)', fontVariantNumeric: 'lining-nums' }}>
        <Rich s={cur[2].replace(/[。，；：、——]+$/, '')} />
      </span>
    </div>
  );
};

/* ---------------------------------------------------------------- the measuring box per shot */
const Meter: React.FC<{ title: string; rows: [string, string, string?][]; o: number }> = ({ title, rows, o }) => o <= 0.001 ? null : (
  <div style={{ position: 'absolute', right: 70, top: 160, width: 450, padding: '16px 24px 18px', borderRadius: 16, background: 'rgba(10,10,12,0.86)', border: '1px solid rgba(243,237,226,0.18)', fontFamily: MONO, color: INK, opacity: o }}>
    <div style={{ fontSize: 22, letterSpacing: '0.2em', color: DIM, marginBottom: 10, fontFamily: SANS, fontWeight: 700 }}>{title}</div>
    {rows.map(([k, v, sw], i) => (
      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 33, fontWeight: 700, marginTop: i ? 10 : 0 }}>
        {sw && <span style={{ width: 42, height: 42, borderRadius: 7, background: sw, border: '1px solid rgba(255,255,255,0.35)', flexShrink: 0 }} />}
        <span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 30, flexGrow: 1, whiteSpace: 'nowrap' }}>{k}</span>
        <span style={{ whiteSpace: 'pre' }}>{v}</span>
      </div>
    ))}
  </div>
);
const PickerNow: React.FC<{ T: number }> = ({ T }) => {
  if (inShot(T, 'board1')) {
    if (T >= TITLE && T < TITLE_OUT + 0.2) return null;
    const o = (T < TITLE ? easeOut(prog(T, CUR.a1 - 0.1, CUR.a1 + 0.1)) : easeOut(prog(T, TITLE_OUT + 0.2, TITLE_OUT + 0.5))) * (1 - vis(T, L.guess + 1.4, 99, 0.3, 0.2)) * (1 - prog(T, T1 - 0.5, T1 - 0.2));
    return <Picker o={o} rows={[{ k: 'A', v: G(DARK), o: easeOut(prog(T, CUR.a1, CUR.a1 + 0.12)) }, { k: 'B', v: G(DARK), o: easeOut(prog(T, CUR.b1, CUR.b1 + 0.12)) }]} />;
  }
  if (inShot(T, 'tables')) return <Meter title="量一下 · 像素" o={vis(T, L.measure + 0.3, L.look2 + 0.4, 0.2, 0.4)} rows={[['左边长边', '300'], ['右边长边', '300']]} />;
  if (inShot(T, 'feet')) {
    const v = T < RW0() ? V1 : T < RACE2() ? 0 : V2();
    const sv = v ? String(Math.round(v)) : '—';
    return <Meter title={T < RW0() ? '速度计 · 像素/秒' : '第二回合 · 像素/秒'} o={vis(T, OFF, T3 - 0.3, 0.2, 0.25)} rows={[['黄', sv, '#fff200'], ['蓝', sv, '#0a1a6e']]} />;   // after the bet is settled
  }
  if (inShot(T, 'balls')) {
    if (T >= T4 - 0.72) return null;
    if (T >= L.save) return <Picker rows={[{ k: '缝隙', v: SPHERE_RGB, o: 1 }, { k: '细线', v: [255, 42, 42], o: 1 }]} o={easeOut(prog(T, L.save, L.save + 0.3))} />;
    const n = picked(T);
    if (T >= DROP) return <Picker rows={[{ k: '全部', v: SPHERE_RGB, o: 1 }]} foot="12 个球 · 同一个值" />;
    if (n === 0) return null;
    return <Picker rows={[{ k: '这个球', v: SPHERE_RGB, o: 1 }]} foot={`已取 ${n} / 12 · 全部相同`} />;
  }
  if (inShot(T, 'barber')) return <Meter title="实际运动 · 全程不变" o={vis(T, T4 + 0.2, T5 - 0.3, 0.3, 0.25)} rows={[['方向', '→ 水平'], ['速度', `${SPD} px/s`]]} />;
  if (inShot(T, 'board2') && T < END_CARD) return <Picker o={easeOut(prog(T, T6 + 0.2, T6 + 0.5))} rows={[{ k: 'A', v: G(DARK), o: 1 }, { k: 'B', v: G(DARK), o: 1 }]} />;
  return null;
};

export const Film: React.FC<{ at?: number }> = ({ at: atT }) => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = atT ?? frame / fps;
  const mark = (T < TITLE ? 0 : easeOut(prog(T, TITLE_OUT + 0.3, TITLE_OUT + 1.0))) * (1 - prog(T, END_CARD, END_CARD + 0.4));
  return (
    <AbsoluteFill style={{ backgroundColor: '#050505' }}>
      <style>{`
        @font-face { font-family: "JunoMono"; src: url(${staticFile('fonts/DejaVuSansMono.ttf')}) format("truetype"); font-weight: 400; }
        @font-face { font-family: "JunoMono"; src: url(${staticFile('fonts/DejaVuSansMono-Bold.ttf')}) format("truetype"); font-weight: 700; }
      `}</style>
      {inShot(T, 'board1') && <BoardShot T={T} uid="b1" open />}
      {inShot(T, 'tables') && <TablesShot T={T} />}
      {inShot(T, 'feet') && <FeetShot T={T} />}
      {(inShot(T, 'barber') || (T >= T4 - 0.7 && T < T4)) && <BarberShot T={T} />}
      {inShot(T, 'balls') && <BallsShot T={T} />}
      {inShot(T, 'recap') && <RecapShot T={T} />}
      {inShot(T, 'board2') && <BoardShot T={T} uid="b2" />}
      {inShot(T, 'board1') && T < CUR.off + 0.4 && (() => { const [x, y, o, ring] = cursorAt(T); return <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}><Dropper x={x} y={y} o={o} ring={ring} fill={`rgb(${DARK},${DARK},${DARK})`} level={easeOut(prog(T, CUR.a1, CUR.a1 + 0.18))} /></svg>; })()}
      <Infer T={T} />
      <PickerNow T={T} />
      <TitleCard T={T} />
      <EndCard T={T} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: BAR, background: '#000' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: BAR, background: '#000' }} />
      <Tally T={T} />
      <Subtitles T={T} />
      {mark > 0.001 && (
        <div style={{ position: 'absolute', top: 50, right: 60, opacity: 0.6 * mark, fontFamily: SANS, fontWeight: 500, fontSize: 20, letterSpacing: '0.3em', color: 'rgba(243,237,226,0.58)' }}>
          <span style={{ color: GOLD }}>◆ </span>{JUNO.mark}
        </div>
      )}
    </AbsoluteFill>
  );
};
