import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Board, P0, pt, DARK, LIGHT, A_CELL, B_CELL, Proj } from './Board';
import { EV, BEAT, FILM_END, SUBS, ZH, SANS, MONO, prog, easeOut, easeIn, easeInOut, clamp, lerp, hit } from './lib';
import { JUNO } from './brand/identity';

/* 《大脑的懒惰》 (the Adelson checker shadow, the dress, Novick's confetti spheres).
   Locked camera, hard cuts; the only moves are the punch on the two drops. One hero per shot. The eyedropper readout
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
  hide: at('盯着B'), deeper: at('B在变深'), take: at('把阴影'), lazy: at('省力策略'), guess: at('它先猜'), bright: at('调亮'),
  helm: at('1867'), infer: at('对光的'), skill: at('这原本是'), paper: at('阴影里的白纸'),
  dress: at('2015'), poll: at('1401'), shade: at('以为在阴影里'), lamp: at('以为在灯下'),
  balls: at('再看一组'), rgb: at('红、绿'), pick: at('取一次色'), first: at('第一个'), second: at('第二个'),
  same: at('同一种米色'), lines: at('彩色的'), novick: at('诺维克'), fine: at('处理形状'), borrow: at('借过来'),
  world: at('你看到的世界'), eff: at('其实是'), now: at('现在你知道'), still: at('还是不一样'),
};
const TITLE = EV.title, DROP = EV.drop;
const TITLE_OUT = TITLE + 3.3;                    // the card leaves through the board growing back around A and B
const END_CARD = DROP + 17 * 4 * BEAT;            // 107.52, a bar downbeat; 6.1 s to the phrase end
const SHOT = {
  board1: [0, L.skill], paper: [L.skill, EV.break], dress: [EV.break, EV.build], balls: [EV.build, L.world],
  recap: [L.world, L.now], board2: [L.now, FILM_END],
} as const;
const inShot = (T: number, k: keyof typeof SHOT) => T >= SHOT[k][0] && T < SHOT[k][1];

/* ---------------------------------------------------------------- screen furniture */
type Row = { k: string; v: [number, number, number]; o: number; note?: string };
const Picker: React.FC<{ rows: Row[]; o?: number; foot?: string; footO?: number }> = ({ rows, o = 1, foot, footO = 1 }) => o <= 0.001 ? null : (
  <div style={{ position: 'absolute', right: 70, top: 160, width: 370, padding: '16px 22px 18px', borderRadius: 14, background: 'rgba(10,10,12,0.86)', border: '1px solid rgba(243,237,226,0.18)', fontFamily: MONO, color: INK, opacity: o }}>
    <div style={{ fontSize: 16, letterSpacing: '0.3em', color: DIM, marginBottom: 12, fontFamily: SANS, fontWeight: 700 }}>取色器 · RGB</div>
    {rows.map((r, i) => (
      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 25, fontWeight: 700, marginTop: i ? 10 : 0, opacity: r.o }}>
        <span style={{ width: 32, height: 32, borderRadius: 6, background: `rgb(${r.v.join(',')})`, border: '1px solid rgba(255,255,255,0.35)', flexShrink: 0 }} />
        <span style={{ minWidth: 92, fontFamily: SANS, fontSize: 23, whiteSpace: 'nowrap', flexGrow: 1 }}>{r.k}</span>
        <span style={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'pre' }}>{r.v.map((x) => String(x).padStart(3, ' ')).join(' ')}</span>
      </div>
    ))}
    {foot && <div style={{ marginTop: 12, fontSize: 18, fontFamily: SANS, fontWeight: 700, color: DIM, opacity: footO }}>{foot}</div>}
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

const Tag: React.FC<{ x: number; y: number; top: string; sub?: string; o: number; dy?: number; color?: string }> = ({ x, y, top, sub, o, dy = 0, color = DIM }) => o <= 0.001 ? null : (
  <div style={{ position: 'absolute', left: x, top: y + dy, opacity: o }}>
    <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 18, letterSpacing: '0.25em', color }}>{top}</div>
    {sub && <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 24, color: INK, marginTop: 8 }}>{sub}</div>}
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
  const away = easeInOut(prog(T, L.take + 0.25, L.take + 1.75)), back = easeInOut(prog(T, L.guess + 0.2, L.guess + 1.6));
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
  const o = vis(T, L.guess + 0.1, SHOT.board1[1], 0.3, 0.2);
  if (o <= 0.001) return null;
  const res = easeOut(prog(T, L.bright + 0.1, L.bright + 0.35));
  const row = (k: string, light: string, f: string, out: number, word: string, o2: number) => (
    <div style={{ marginTop: 14, opacity: o2 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, fontFamily: MONO, fontWeight: 700, fontSize: 25, color: INK, whiteSpace: 'pre' }}>
        <span style={{ fontFamily: SANS, fontWeight: 900, width: 26 }}>{k}</span><span>{DARK}</span><span style={{ color: DIM }}>÷</span><span>{f}</span>
        <span style={{ color: DIM }}>=</span><span style={{ color: res > 0.5 ? (out === LIGHT ? GOLD : INK) : DIM, opacity: 0.35 + 0.65 * res }}>{res > 0.01 ? out : '???'}</span>
      </div>
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 19, color: DIM, marginTop: 4, marginLeft: 36 }}>
        {light} → <span style={{ color: res > 0.5 ? INK : DIM }}>{res > 0.01 ? word : '…'}</span>
      </div>
    </div>
  );
  return (
    <div style={{ position: 'absolute', right: 70, top: 330, width: 370, padding: '16px 22px 18px', borderRadius: 14, background: 'rgba(10,10,12,0.86)', border: '1px solid rgba(241,197,109,0.35)', opacity: o }}>
      <div style={{ fontSize: 16, letterSpacing: '0.2em', color: DIM, fontFamily: SANS, fontWeight: 700 }}>大脑的推断 · 示意</div>
      <div style={{ fontSize: 16, color: DIM, fontFamily: SANS, marginTop: 6 }}>像素 ÷ 它以为的光 = 它报告的颜色</div>
      {row('B', '以为在阴影里', '0.5', LIGHT, '浅色格', 1)}
      {row('A', '以为在亮处', '1.0', DARK, '深色格', easeOut(prog(T, L.guess + 0.5, L.guess + 0.8)))}
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
      <div style={{ position: 'absolute', left: 0, right: 0, top: 880, textAlign: 'center', opacity: easeOut(prog(T, a + 0.5, a + 0.9)), fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: '0.5em', color: DIM }}>{JUNO.series}</div>
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- 2. the paper */
const PAPER: [number, number, number] = [236, 233, 226];
const PAPER_SH: [number, number, number] = [118, 116, 113]; // PAPER × 0.5, sampled from the render
const P_LIT: [number, number] = [700, 640], P_SH: [number, number] = [1240, 640];
const PaperShot: React.FC<{ T: number }> = ({ T }) => {
  const t = T - SHOT.paper[0];
  const d = -6 * t; // the shadow edge drifts slowly as the light moves (its own clock)
  const quad = '540,300 1380,300 1470,850 450,850';
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="pdesk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a1e14" /><stop offset="1" stopColor="#120c07" /></linearGradient>
          <radialGradient id="ppool" cx="0.3" cy="0.25" r="0.7"><stop offset="0" stopColor="#ffcf8a" stopOpacity={0.25} /><stop offset="1" stopColor="#ffb060" stopOpacity={0} /></radialGradient>
          <filter id="psh" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="7" /></filter>
          <clipPath id="pclip"><polygon points={quad} /></clipPath>
        </defs>
        <rect width={1920} height={1080} fill="url(#pdesk)" />
        {Array.from({ length: 22 }, (_, i) => <line key={i} x1={0} y1={140 + i * 40} x2={1920} y2={150 + i * 40} stroke="#000" strokeOpacity={0.14} strokeWidth={2} />)}
        <rect width={1920} height={1080} fill="url(#ppool)" />
        <polygon points="452,856 1472,856 1480,872 446,872" fill="#000" opacity={0.35} />
        <polygon points={quad} fill={`rgb(${PAPER.join(',')})`} />
        {/* printed lines, kept clear of the two sample points */}
        <g clipPath="url(#pclip)" fill="#cfc9bd">
          {Array.from({ length: 9 }, (_, i) => { const y = 360 + i * 52; if (Math.abs(y - 640) < 40) return null; return <rect key={i} x={600 - i * 7} y={y} width={720 + i * 14 - (i % 3) * 120} height={10} />; })}
        </g>
        {/* the standing book and its shadow across the right half of the page */}
        <g clipPath="url(#pclip)"><polygon points={`${960 + d},250 1600,250 1600,900 ${975 + d},900`} fill="#000" opacity={0.5} filter="url(#psh)" /></g>
        <polygon points="1520,180 1640,150 1660,820 1540,860" fill="#3b1f1a" />
        <polygon points="1640,150 1700,170 1712,806 1660,820" fill="#22110e" />
        <Cross x={P_LIT[0]} y={P_LIT[1]} o={vis(T, SHOT.paper[0] + 0.2, SHOT.paper[1] + 1, 0.2, 0.1)} />
        <Cross x={P_SH[0]} y={P_SH[1]} o={vis(T, SHOT.paper[0] + 0.5, SHOT.paper[1] + 1, 0.2, 0.1)} />
      </svg>
      <Tag x={P_LIT[0] - 30} y={P_LIT[1] + 44} top="亮处" color="#4a443c" o={vis(T, SHOT.paper[0] + 0.2, SHOT.paper[1] + 1)} />
      <Tag x={P_SH[0] - 30} y={P_SH[1] + 44} top="阴影里" color="#1e1b17" o={vis(T, SHOT.paper[0] + 0.5, SHOT.paper[1] + 1)} />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- 3. the dress (示意, not the photo) */
const DRESS_PATH = 'M -70 0 L -40 0 L -30 40 L 30 40 L 40 0 L 70 0 L 60 120 L 150 560 L -150 560 L -60 120 Z';
const Dress: React.FC<{ x: number; y: number; s: number; body: string; lace: string; o?: number; id: string }> = ({ x, y, s, body, lace, o = 1, id }) => o <= 0.001 ? null : (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <defs><clipPath id={id}><path d={DRESS_PATH} /></clipPath></defs>
    <path d={DRESS_PATH} fill={body} />
    <g clipPath={`url(#${id})`}>
      {[150, 300, 430, 540].map((yy, i) => <rect key={i} x={-160} y={yy} width={320} height={i === 3 ? 22 : 30} fill={lace} />)}
      <rect x={-62} y={110} width={124} height={26} fill={lace} />
    </g>
  </g>
);
const DRESS = { photo: ['#8f9bcc', '#6e5a36'], bb: ['#2f52b0', '#151515'], wg: ['#ece7de', '#b8913c'] } as const;
const POLL: [string, number, string][] = [['蓝黑', 57.0, '#2f52b0'], ['白金', 30.3, '#d9cfb8'], ['蓝棕', 10.6, '#6b5a7a'], ['其他', 2.1, '#4a4a4a']];

const Arrow: React.FC<{ x0: number; x1: number; y: number; k: number; color: string }> = ({ x0, x1, y, k, color }) => {
  if (k <= 0) return null;
  const xe = lerp(x0, x1, k), dir = Math.sign(x1 - x0);
  return (<g>
    <line x1={x0} y1={y} x2={xe} y2={y} stroke={color} strokeWidth={5} strokeLinecap="round" />
    {k > 0.9 && <polygon points={`${x1},${y} ${x1 - dir * 22},${y - 13} ${x1 - dir * 22},${y + 13}`} fill={color} />}
  </g>);
};

const DressShot: React.FC<{ T: number }> = ({ T }) => {
  const oc = easeOut(prog(T, L.dress, L.dress + 0.3));
  const os = [easeOut(prog(T, L.poll, L.poll + 0.3)), easeOut(prog(T, L.poll + 0.12, L.poll + 0.42))];
  const kR = easeInOut(prog(T, L.shade + 0.1, L.shade + 0.6)), kL = easeInOut(prog(T, L.lamp + 0.1, L.lamp + 0.6));
  const bar = easeInOut(prog(T, L.poll + 0.3, L.poll + 1.2));
  const DY = 300, S = 0.78;
  let acc = 0;
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #0e0d12 0%, #15121a 100%)' }}>
      {/* the light each camp assumes, washed over its half of the room */}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 40% 60% at 78% 50%, rgba(110,150,255,0.22) 0%, rgba(110,150,255,0) 70%)', opacity: kR }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 40% 60% at 22% 50%, rgba(255,190,90,0.22) 0%, rgba(255,190,90,0) 70%)', opacity: kL }} />
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <Dress id="dc" x={960} y={DY + rise(T, L.dress)} s={S} body={DRESS.photo[0]} lace={DRESS.photo[1]} o={oc} />
        <Dress id="dl" x={460} y={DY + rise(T, L.poll)} s={S} body={DRESS.bb[0]} lace={DRESS.bb[1]} o={os[0]} />
        <Dress id="dr" x={1460} y={DY + rise(T, L.poll + 0.12)} s={S} body={DRESS.wg[0]} lace={DRESS.wg[1]} o={os[1]} />
        <Arrow x0={1110} x1={1300} y={560} k={kR} color="#8fb0ff" />
        <Arrow x0={810} x1={620} y={560} k={kL} color="#ffc46a" />
        {/* the poll as one bar */}
        {POLL.map(([, v, c], i) => { const x = 560 + 800 * acc / 100, w = 800 * v / 100 * bar; acc += v; return <rect key={i} x={x} y={792} width={Math.max(0, w - 3)} height={22} fill={c} opacity={os[0]} />; })}
      </svg>
      <Big s="照片里的裙子（示意）" y={236} size={24} color={DIM} o={oc} />
      <div style={{ position: 'absolute', left: 460 - 300, width: 600, top: 226, textAlign: 'center', opacity: os[0], fontFamily: SANS, fontWeight: 900, fontSize: 34, color: INK }}>57% 看成蓝黑</div>
      <div style={{ position: 'absolute', left: 1460 - 300, width: 600, top: 226, textAlign: 'center', opacity: os[1], fontFamily: SANS, fontWeight: 900, fontSize: 34, color: GOLD }}>30% 看成白金</div>
      <div style={{ position: 'absolute', left: 1205 - 120, width: 240, top: 500, textAlign: 'center', opacity: kR, fontFamily: SANS, fontWeight: 700, fontSize: 24, color: '#b9ccff' }}>以为在阴影里</div>
      <div style={{ position: 'absolute', left: 1205 - 120, width: 240, top: 584, textAlign: 'center', opacity: kR, fontFamily: SANS, fontWeight: 900, fontSize: 26, color: INK }}>扣除蓝光</div>
      <div style={{ position: 'absolute', left: 715 - 120, width: 240, top: 500, textAlign: 'center', opacity: kL, fontFamily: SANS, fontWeight: 700, fontSize: 24, color: '#ffd59a' }}>以为在灯下</div>
      <div style={{ position: 'absolute', left: 715 - 120, width: 240, top: 584, textAlign: 'center', opacity: kL, fontFamily: SANS, fontWeight: 900, fontSize: 26, color: INK }}>扣除黄光</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 826, textAlign: 'center', opacity: os[0] * 0.9, fontFamily: SANS, fontWeight: 700, fontSize: 20, color: DIM }}>
        1401 人 · 蓝黑 57% · 白金 30% · 蓝棕 11% · 其他 2% · Lafer-Sousa 等 2015 Current Biology
      </div>
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- 4. the spheres (Novick 2018, Munker–White) */
export const BEIGE = '#c9b79c';
export const SPHERE_RGB: [number, number, number] = [215, 199, 174]; // the pixel under the crosshair, sampled from the render
const STRIPE = ['#ff2a2a', '#18c43c', '#2f6bff', '#b23cff', '#ff9a1f', '#14c8d4'];
const SPH: [number, number, number][] = [[620, 380, 0], [800, 330, 1], [980, 360, 2], [1160, 330, 3], [1330, 390, 4], [700, 560, 5], [880, 520, 3], [1060, 545, 0], [1250, 560, 1], [760, 740, 2], [960, 720, 4], [1160, 735, 5]];
const R = 78, PITCH = 8, SH = 3.4;
const SAMPLE_DY = -R - 2 + 10 * PITCH + (SH + PITCH) / 2;   // the middle of a gap between two stripes, near the centre
const PICKS = (() => {
  const t = [L.first + 0.15, L.second + 0.15, L.second + 1.3];
  const left = DROP - 0.3 - (t[2] + 0.35), n = 9, w = Array.from({ length: n }, (_, i) => Math.pow(0.86, i)), sw = w.reduce((a, b) => a + b, 0);
  let x = t[2] + 0.35;
  for (let i = 0; i < n; i++) { t.push(x); x += left * w[i] / sw; }
  return t;
})();
const picked = (T: number) => PICKS.filter((p) => T >= p).length;

const Spheres: React.FC<{ stripes: number; wipe?: number; uid: string; sc?: number; cx?: number; cy?: number }> = ({ stripes, wipe = 1, uid, sc = 1, cx = 960, cy = 540 }) => (
  <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
    <defs>
      <radialGradient id={`${uid}sph`} cx="0.38" cy="0.32" r="0.75"><stop offset="0" stopColor="#efe2cc" /><stop offset="0.55" stopColor={BEIGE} /><stop offset="1" stopColor="#7d6d58" /></radialGradient>
      {SPH.map(([x, y], i) => <clipPath key={i} id={`${uid}c${i}`}><circle cx={x} cy={y} r={R} /></clipPath>)}
      <clipPath id={`${uid}w`}><rect x={0} y={0} width={1920 * wipe} height={1080} /></clipPath>
    </defs>
    <g transform={`translate(${cx} ${cy}) scale(${sc}) translate(${-cx} ${-cy})`}>
      <g opacity={stripes} clipPath={`url(#${uid}w)`}>{Array.from({ length: 110 }, (_, i) => <rect key={i} x={-200} y={100 + i * PITCH} width={2320} height={SH} fill={STRIPE[Math.floor(i / 3) % STRIPE.length]} opacity={0.5} />)}</g>
      {SPH.map(([x, y, c], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={R} fill={`url(#${uid}sph)`} />
          <g clipPath={`url(#${uid}c${i})`} opacity={stripes}><g clipPath={`url(#${uid}w)`}>{Array.from({ length: 22 }, (_, k) => <rect key={k} x={x - R - 2} y={y - R - 2 + k * PITCH} width={2 * R + 4} height={SH} fill={STRIPE[c]} />)}</g></g>
        </g>
      ))}
    </g>
  </svg>
);

const Lens: React.FC<{ x: number; y: number; r: number; o: number; tint: number; id: string }> = ({ x, y, r, o, tint, id }) => {
  if (o <= 0.001) return null;
  const Z = 8, mix = (k: number) => SPHERE_RGB.map((v, i) => Math.round(lerp(v, [255, 42, 42][i], k))).join(',');
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity: o }}>
      <defs><clipPath id={id}><circle cx={x} cy={y} r={r} /></clipPath></defs>
      <g clipPath={`url(#${id})`}>
        <rect x={x - r} y={y - r} width={2 * r} height={2 * r} fill={`rgb(${mix(0.45 * tint)})`} />
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
  const punch = 1 + 0.04 * hit(T, DROP, 0.25);
  // the crosshair: comes out on 取一次色, settles on sphere 1, then jumps from sphere to sphere on its own clock
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
  const lens = vis(T, L.fine, SHOT.balls[1], 0.3, 0.2);
  const lensR = vis(T, L.borrow, SHOT.balls[1], 0.3, 0.2);
  return (
    <AbsoluteFill style={{ background: '#0b0b0b' }}>
      <Spheres uid="sp" stripes={stripesOn ? 1 : 0} wipe={wipe} sc={punch} />
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        {!dropped && PICKS.map((p, i) => T >= p ? <circle key={i} cx={SPH[i][0]} cy={SPH[i][1]} r={R + 8} fill="none" stroke="#fff" strokeWidth={2} opacity={0.55} /> : null)}
        <Cross x={cx} y={cy} o={co} ring={n > 0 ? Math.max(0, 1 - (T - PICKS[n - 1]) / 0.3) : 0} />
      </svg>
      <Big s="12 个球 · 1 种颜色" y={150} size={84} color={GOLD} glow={GLOW} o={vis(T, DROP, L.lines, 0.05, 0.3)} dy={rise(T, DROP, 30)} />
      <Tag x={70} y={830} top="DAVID NOVICK · UTEP · 2018" sub="彩色小球错觉（Munker–White 效应）" o={vis(T, L.novick, L.fine, 0.25, 0.25)} dy={rise(T, L.novick, 14)} />
      {lens > 0 && <AbsoluteFill style={{ background: 'rgba(6,6,7,0.82)', opacity: lens }} />}
      <Lens id="l1" x={700} y={520} r={230} o={lens} tint={0} />
      <Lens id="l2" x={1220} y={520} r={230} o={lensR} tint={easeInOut(prog(T, L.borrow + 0.3, L.borrow + 1.6))} />
      <div style={{ position: 'absolute', left: 700 - 300, width: 600, top: 772, textAlign: 'center', opacity: lens, fontFamily: SANS, fontWeight: 900, fontSize: 26, color: INK }}>实际像素 · 放大 8 倍</div>
      <div style={{ position: 'absolute', left: 1220 - 300, width: 600, top: 772, textAlign: 'center', opacity: lensR, fontFamily: SANS, fontWeight: 900, fontSize: 26, color: INK }}>大脑看到的（示意）</div>
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- 5. recap: three guesses */
const RecapShot: React.FC<{ T: number }> = ({ T }) => {
  const a = L.world;
  const card = (i: number) => easeOut(prog(T, a + 0.1 + i * 0.12, a + 0.4 + i * 0.12));
  const xs = [430, 960, 1490], top = 250, w = 500, h = 420;
  const mini: Proj = { cx: 430, cy0: 360, a: 44, b: 22.7 };
  const caps: [string, string][] = [['棋盘', '扣掉了阴影'], ['裙子', '扣掉了光的颜色'], ['彩球', '借来了旁边的颜色']];
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #0f0d10 0%, #17130f 100%)' }}>
      {xs.map((x, i) => (
        <div key={i} style={{ position: 'absolute', left: x - w / 2, top: top + (1 - card(i)) * 24, width: w, height: h, borderRadius: 16, background: '#0a0909', border: '1px solid rgba(243,237,226,0.16)', opacity: card(i), overflow: 'hidden' }} />
      ))}
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <g opacity={card(0)} transform={`translate(0 ${(1 - card(0)) * 24})`}><Board p={mini} uid="rb" labels={false} /></g>
        <g opacity={card(1)} transform={`translate(0 ${(1 - card(1)) * 24})`}>
          <Dress id="rd1" x={885} y={300} s={0.62} body={DRESS.bb[0]} lace={DRESS.bb[1]} />
          <Dress id="rd2" x={1035} y={300} s={0.62} body={DRESS.wg[0]} lace={DRESS.wg[1]} />
        </g>
        <g opacity={card(2)} transform={`translate(0 ${(1 - card(2)) * 24})`}>
          <defs>{[0, 1, 2, 3, 4, 5].map((i) => <clipPath key={i} id={`rs${i}`}><circle cx={1370 + (i % 3) * 120} cy={390 + Math.floor(i / 3) * 140} r={48} /></clipPath>)}</defs>
          {[0, 1, 2, 3, 4, 5].map((i) => { const x = 1370 + (i % 3) * 120, y = 390 + Math.floor(i / 3) * 140; return (
            <g key={i}><circle cx={x} cy={y} r={48} fill={BEIGE} />
              <g clipPath={`url(#rs${i})`}>{Array.from({ length: 14 }, (_, k) => <rect key={k} x={x - 50} y={y - 50 + k * 7.5} width={100} height={3.2} fill={STRIPE[i]} />)}</g></g>); })}
        </g>
      </svg>
      {xs.map((x, i) => (
        <div key={i} style={{ position: 'absolute', left: x - w / 2, width: w, top: top + h + 26, textAlign: 'center', opacity: card(i) }}>
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 30, color: INK }}>{caps[i][0]}</div>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 24, color: DIM, marginTop: 8 }}>大脑{caps[i][1]}</div>
        </div>
      ))}
      <Big s="省力 = 效率" y={150} size={56} color={GOLD} glow={GLOW} o={vis(T, L.eff, SHOT.recap[1], 0.2, 0.2)} dy={rise(T, L.eff, 18)} font={ZH} />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- end card */
const EndCard: React.FC<{ T: number }> = ({ T }) => {
  const a = END_CARD;
  if (T < a) return null;
  const k = (d: number) => easeOut(prog(T, a + d, a + d + 0.4));
  const black = easeIn(prog(T, FILM_END - 0.6, FILM_END));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `rgba(4,4,5,${0.88 * k(0)})` }} />
      <Big s="大脑的懒惰" y={240} size={100} color={GOLD} o={k(0)} glow={GLOW} font={ZH} />
      <Big s="那条裙子，你当年看到的是什么颜色？" y={404} size={58} o={k(0.4)} dy={rise(T, a + 0.4)} />
      <Big s="还不信 A = B？暂停 · 截图 · 自己取色" y={498} size={28} color={DIM} o={k(0.8)} />
      <div style={{ position: 'absolute', left: 960 - 330, top: 572, width: 660, height: 56, borderRadius: 28, border: `2px solid ${GOLD}`, opacity: k(1.0), display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: '0.2em', color: INK }}>{JUNO.follow}</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center', opacity: 0.6 * k(1.2), fontFamily: SANS, fontSize: 17, color: INK, lineHeight: 1.8 }}>
        资料：Adelson 1995（MIT）· Helmholtz 1867《生理光学手册》· Lafer-Sousa, Hermann &amp; Conway 2015 Current Biology · Novick 2018（UTEP）<br />
        棋盘、裙子、彩球均为代码重绘的示意，不是原图 · "懒惰"为比喻
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

/* ---------------------------------------------------------------- the eyedropper per shot */
const PickerNow: React.FC<{ T: number }> = ({ T }) => {
  if (inShot(T, 'board1')) {
    if (T >= TITLE && T < TITLE_OUT + 0.2) return null;
    const o = T < TITLE ? easeOut(prog(T, CUR.a1 - 0.1, CUR.a1 + 0.1)) : easeOut(prog(T, TITLE_OUT + 0.2, TITLE_OUT + 0.5));
    return <Picker o={o} rows={[{ k: 'A', v: G(DARK), o: easeOut(prog(T, CUR.a1, CUR.a1 + 0.12)) }, { k: 'B', v: G(DARK), o: easeOut(prog(T, CUR.b1, CUR.b1 + 0.12)) }]} />;
  }
  if (inShot(T, 'paper')) {
    const a = SHOT.paper[0];
    return <Picker o={easeOut(prog(T, a + 0.2, a + 0.4))} rows={[{ k: '亮处', v: PAPER, o: easeOut(prog(T, a + 0.3, a + 0.45)) }, { k: '阴影里', v: PAPER_SH, o: easeOut(prog(T, a + 0.6, a + 0.75)) }]}
      foot="阴影里 = 亮处 × ½" footO={easeOut(prog(T, L.paper, L.paper + 0.3))} />;
  }
  if (inShot(T, 'balls')) {
    if (T >= L.fine) return <Picker rows={[{ k: '缝隙', v: SPHERE_RGB, o: 1 }, { k: '细线', v: [255, 42, 42], o: 1 }]} o={easeOut(prog(T, L.fine, L.fine + 0.3))} />;
    const n = picked(T);
    if (T >= DROP) return <Picker rows={[{ k: '全部 12 个', v: SPHERE_RGB, o: 1 }]} />;
    if (n === 0) return null;
    return <Picker rows={[{ k: '这个球', v: SPHERE_RGB, o: 1 }]} foot={`已取 ${n} / 12 · 全部相同`} />;
  }
  if (inShot(T, 'board2') && T < END_CARD) return <Picker rows={[{ k: 'A', v: G(DARK), o: 1 }, { k: 'B', v: G(DARK), o: 1 }]} />;
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
      {inShot(T, 'paper') && <PaperShot T={T} />}
      {inShot(T, 'dress') && <DressShot T={T} />}
      {inShot(T, 'balls') && <BallsShot T={T} />}
      {inShot(T, 'recap') && <RecapShot T={T} />}
      {inShot(T, 'board2') && <BoardShot T={T} uid="b2" />}
      {inShot(T, 'board1') && T < CUR.off + 0.4 && (() => { const [x, y, o, ring] = cursorAt(T); return <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}><Cross x={x} y={y} o={o} ring={ring} /></svg>; })()}
      <Infer T={T} />
      <Tag x={70} y={800} top="HERMANN VON HELMHOLTZ · 1867" sub="《生理光学手册》：无意识推理" o={vis(T, L.helm, L.skill, 0.25, 0.2)} dy={rise(T, L.helm, 14)} />
      <PickerNow T={T} />
      <TitleCard T={T} />
      <EndCard T={T} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: BAR, background: '#000' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: BAR, background: '#000' }} />
      <Subtitles T={T} />
      {mark > 0.001 && (
        <div style={{ position: 'absolute', top: 50, right: 60, opacity: 0.6 * mark, fontFamily: SANS, fontWeight: 500, fontSize: 20, letterSpacing: '0.3em', color: 'rgba(243,237,226,0.58)' }}>
          <span style={{ color: GOLD }}>◆ </span>{JUNO.mark}
        </div>
      )}
    </AbsoluteFill>
  );
};
