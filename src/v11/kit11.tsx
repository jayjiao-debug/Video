import React from 'react';
import { staticFile } from 'remotion';
import { b, prog, easeOut, easeInOut, lerp, clamp } from '../v6/ui6';

/* ep11 《舍不得的，是TA吗？》 — a private account book kept at night.
   Midnight desk, cream ledger, three inks (gold = 满意/reward, teal = 投入, vermilion = minus/stamps).
   Every frame is a pure function of T (film seconds; T = 0 is bgm 8.545 s, bar 4). Bar k downbeat = b(16 + 4k). */
export { b, prog, easeOut, easeInOut, lerp, clamp };
export const W = 1920, H = 1080;

export const C = {
  desk: '#0b101d', paper: '#f2ead7', paperLit: '#fbf5e7', ink: '#1e1a16', ink2: '#5b544a', ink3: '#8f877a', ink4: '#3d372f',
  rule: '#9db6c9', margin: '#c8564a', gold: '#b8852c', goldD: '#9a6c1f', goldDD: '#8a5f1a', goldHi: '#f1c56d', goldWash: '#f3dca6',
  teal: '#17706c', tealHi: '#5fc4bc', red: '#b3241b', redUI: '#c0392b', grey: '#a8a196', grey2: '#d6d0c4', cream: '#f3ede2',
  navy: '#1f2b45', navyLit: '#33456b',
};
export const F = {
  serif: '"Noto Serif CJK SC", serif',
  sans: '"Noto Sans CJK SC", sans-serif',
  lat: '"Cormorant Garamond", serif',
  mono: '"DejaVu Sans Mono", monospace',
};
export const LNUM: React.CSSProperties = { fontFeatureSettings: "'lnum' 1, 'pnum' 1" };

/* ---------- timing helpers ---------- */
export const pr = (T: number, a: number, d: number) => clamp((T - a) / d);
export const eo = (T: number, a: number, d: number) => easeOut(pr(T, a, d));
export const eio = (T: number, a: number, d: number) => easeInOut(pr(T, a, d));
/** visible window with fades */
export const win = (T: number, a: number, z: number, fi = 0.3, fo = 0.3) => Math.min(easeOut(pr(T, a, fi)), 1 - pr(T, z - fo, fo));
/** overshooting pop 0→1 */
export const pop = (T: number, a: number, d = 0.32) => {
  const k = pr(T, a, d);
  return k <= 0 ? 0 : easeOut(k) + 0.18 * Math.sin(k * Math.PI) * (1 - k);
};
/** damped spring 0→1 starting at a */
export const spring = (T: number, a: number, freq = 2.2, decay = 5) => {
  if (T <= a) return 0;
  const t = T - a;
  return 1 - Math.exp(-decay * t) * Math.cos(2 * Math.PI * freq * t);
};
/** damped pendulum angle (deg) */
export const swing = (T: number, a: number, amp: number, freq = 1.2, decay = 2.4) =>
  T <= a ? 0 : amp * Math.exp(-decay * (T - a)) * Math.cos(2 * Math.PI * freq * (T - a));
/** stroke draw-on props for a path with pathLength=1 */
export const drawOn = (p: number) => ({ pathLength: 1, strokeDasharray: '1 1', strokeDashoffset: 1 - clamp(p) });
export const mix = (a: string, z: string, k: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16)), pz = [1, 3, 5].map((i) => parseInt(z.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(lerp(v, pz[i], clamp(k)))).join(',')})`;
};
/** deterministic pseudo-random in [0,1) */
export const rnd = (i: number, s = 1) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/* ---------- shared SVG defs (one hidden svg; every scene references these ids) ---------- */
export const Defs11: React.FC = () => (
  <svg width={0} height={0} style={{ position: 'absolute' }}>
    <defs>
      <pattern id="k-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)"><line x1="0" y1="0" x2="0" y2="7" stroke={C.ink} strokeWidth="1.3" /></pattern>
      <pattern id="k-hatchFine" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><line x1="0" y1="0" x2="0" y2="5" stroke={C.ink} strokeWidth="1" /></pattern>
      <pattern id="k-hatchV" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke={C.ink} strokeWidth="1.2" /></pattern>
      <linearGradient id="k-sheen" x1="0" x2="1"><stop offset="0" stopColor="#17706c" /><stop offset=".55" stopColor="#5fa59b" /><stop offset="1" stopColor="#c79a3e" /></linearGradient>
      <filter id="k-softHead" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" /></filter>
      <radialGradient id="k-lampLit" cx="42%" cy="38%" r="62%"><stop offset="0" stopColor="#fff6d6" /><stop offset=".35" stopColor="#f8d98a" /><stop offset=".8" stopColor="#e2ad4c" /><stop offset="1" stopColor="#b8852c" /></radialGradient>
      <radialGradient id="k-lampHalo"><stop offset="0" stopColor="#f6cf74" stopOpacity=".55" /><stop offset=".45" stopColor="#f6cf74" stopOpacity=".18" /><stop offset="1" stopColor="#f6cf74" stopOpacity="0" /></radialGradient>
      <radialGradient id="k-cellLamp" cx="50%" cy="50%" r="60%"><stop offset="0" stopColor="#ffe6a6" stopOpacity=".95" /><stop offset=".55" stopColor="#f6d48a" stopOpacity=".75" /><stop offset="1" stopColor="#efc777" stopOpacity=".55" /></radialGradient>
      <linearGradient id="k-foil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e6bd66" /><stop offset=".5" stopColor="#b8852c" /><stop offset="1" stopColor="#7a5217" /></linearGradient>
      <linearGradient id="k-tix" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fbf4e3" /><stop offset=".6" stopColor="#f1e7cf" /><stop offset="1" stopColor="#e2d4b2" /></linearGradient>
      <radialGradient id="k-stampGlow"><stop offset="0" stopColor="#c0392b" stopOpacity=".09" /><stop offset="1" stopColor="#c0392b" stopOpacity="0" /></radialGradient>
      <filter id="k-stampInk" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency=".55" numOctaves="3" seed="11" result="n" />
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.25 1.52" result="m" />
        <feComposite in="SourceGraphic" in2="m" operator="in" />
      </filter>
      <filter id="k-glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="14" /></filter>
      <filter id="k-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="18" /></filter>
      <filter id="k-blur2" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="2" /></filter>
      <symbol id="k-heart" viewBox="-23 -7 46 46"><path d="M0,10 C0,-2 -20,-4 -20,9 C-20,20 -7,27 0,35 C7,27 20,20 20,9 C20,-4 0,-2 0,10 Z" /></symbol>
      <clipPath id="k-halfL"><rect x="-23" y="17" width="46" height="30" /></clipPath>
      <symbol id="k-heartBroken" viewBox="-22 -8 44 42"><path d="M0,6 C0,-6 -20,-8 -20,6 C-20,17 -7,24 0,32 C7,24 20,17 20,6 C20,-8 0,-6 0,6 Z" fill="none" stroke="#c0392b" strokeWidth="3" strokeLinejoin="round" /><path d="M0,6 L-5,13 L3,18 L-3,25 L0,32" fill="none" stroke="#c0392b" strokeWidth="3" strokeLinejoin="round" /></symbol>
      <symbol id="k-shield" viewBox="-14 -16 28 34"><path d="M0,-14 L12,-9 L12,2 C12,10 6,14 0,17 C-6,14 -12,10 -12,2 L-12,-9 Z" fill="none" stroke="#17706c" strokeWidth="2.6" strokeLinejoin="round" /></symbol>
      <symbol id="k-plane" viewBox="-6 0 64 40"><path d="M0,20 L16,17 L27,1 L34,1 L28,17 L50,17 Q60,20 50,23 L28,23 L34,39 L27,39 L16,23 Z M3,19 L-3,9 L2,9 L9,18 Z M3,21 L-3,31 L2,31 L9,22 Z" fill="#1e1a16" /></symbol>
      <symbol id="k-planeOutline" viewBox="-8 -2 68 44"><path d="M0,20 L16,17 L27,1 L34,1 L28,17 L50,17 Q60,20 50,23 L28,23 L34,39 L27,39 L16,23 Z M3,19 L-3,9 L2,9 L9,18 Z M3,21 L-3,31 L2,31 L9,22 Z" fill="none" stroke="#1e1a16" strokeWidth="2.6" strokeLinejoin="round" /></symbol>
    </defs>
  </svg>
);

/* ---------- desk + paper ---------- */
export const Desk: React.FC<{ lampX?: number; lampY?: number }> = ({ lampX = 50, lampY = 36 }) => (
  <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 62% 58% at ${lampX}% ${lampY}%, #1d2538 0%, #111727 48%, #080b14 82%, #05070d 100%)` }} />
);
export const Grain11: React.FC = () => (
  <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${staticFile('grain0.png')})`, backgroundSize: '1920px 1080px', opacity: 0.07, mixBlendMode: 'overlay', pointerEvents: 'none' }} />
);

/** the ledger page as HTML (shadow + paper + fibre) at the standard place x 120–1800, y 92–800 */
export const PaperDiv: React.FC<{ x?: number; y?: number; w?: number; h?: number; tint?: string; tintO?: number }> = ({ x = 120, y = 92, w = 1680, h = 708, tint, tintO = 0 }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 3, overflow: 'hidden',
    background: 'radial-gradient(ellipse 60% 70% at 52% 30%, rgba(255,251,240,.75) 0%, rgba(255,251,240,0) 70%), linear-gradient(180deg,#f4ecda 0%,#efe5cf 100%)',
    boxShadow: '0 30px 60px rgba(0,0,0,.55),0 6px 14px rgba(0,0,0,.35),inset 0 0 120px rgba(150,120,70,.18)' }}>
    <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${staticFile('ep11_paper.png')})`, backgroundSize: '1680px 708px' }} />
    {tint && tintO > 0 && <div style={{ position: 'absolute', inset: 0, background: tint, opacity: tintO }} />}
  </div>
);

/** ledger furniture in SVG: blue rules, red double margin, double rule under the header, header texts */
export const PageInk: React.FC<{ title?: string; sub?: string; no?: string; o?: number; titleP?: number; subP?: number; rulesFrom?: number }> = ({ title, sub, no, o = 1, titleP = 1, subP = 1, rulesFrom = 244 }) => {
  const n = title ? [...title].length : 0;
  const subX = 460 + n * 56 + 12;
  const rules: number[] = [];
  for (let y = rulesFrom; y < 800; y += 46) rules.push(y);
  return (
    <g opacity={o}>
      {rules.map((y) => <line key={y} x1={120} y1={y} x2={1800} y2={y} stroke={C.rule} strokeWidth={1} strokeOpacity={0.45} />)}
      <line x1={330} y1={92} x2={330} y2={800} stroke={C.margin} strokeWidth={1.6} strokeOpacity={0.75} />
      <line x1={337} y1={92} x2={337} y2={800} stroke={C.margin} strokeWidth={1.6} strokeOpacity={0.75} />
      <line x1={120} y1={190} x2={1800} y2={190} stroke={C.ink} strokeWidth={2} />
      <line x1={120} y1={196} x2={1800} y2={196} stroke={C.ink} strokeWidth={1} />
      {title && <PenText x={460} y={164} p={titleP} size={52} weight={900} font={F.serif} fill={C.ink} ls={4} text={title} />}
      {sub && <text x={subX} y={160} opacity={subP} style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 30 }} fill={C.ink2}>{sub}</text>}
      {no && <text x={1752} y={160} textAnchor="end" style={{ fontFamily: F.lat, fontStyle: 'italic', fontWeight: 600, fontSize: 40, ...LNUM }} fill={C.ink3}>{no}</text>}
    </g>
  );
};

/** text written on left→right (clip reveal + a pen tip) */
export const PenText: React.FC<{ x: number; y: number; p: number; size: number; weight?: number; font?: string; fill: string; ls?: number; text: string; anchor?: 'start' | 'middle' | 'end'; w?: number; id?: string; italic?: boolean }> = ({ x, y, p, size, weight = 700, font = F.serif, fill, ls = 0, text, anchor = 'start', w, id, italic }) => {
  if (p <= 0) return null;
  const width = w ?? [...text].length * (size + ls) * 1.02;
  const x0 = anchor === 'start' ? x : anchor === 'middle' ? x - width / 2 : x - width;
  const cid = id ?? `pt${Math.round(x)}_${Math.round(y)}_${text.length}`;
  return (
    <g>
      {p < 1 && <clipPath id={cid}><rect x={x0 - 4} y={y - size * 1.1} width={width * p + 4} height={size * 1.5} /></clipPath>}
      <text x={x} y={y} textAnchor={anchor} clipPath={p < 1 ? `url(#${cid})` : undefined} fill={fill}
        style={{ fontFamily: font, fontWeight: weight, fontSize: size, letterSpacing: ls, fontStyle: italic ? 'italic' : undefined, ...LNUM }}>{text}</text>
    </g>
  );
};

/** bookkeeper's marginalia at the bottom of the margin column */
export const Margin11: React.FC<{ chip: string; lines: string[]; o?: number; y0?: number }> = ({ chip, lines, o = 1, y0 }) => {
  if (o <= 0) return null;
  const top = y0 ?? 650 - 34 * (lines.length - 2);
  const w = [...chip].length * 21 + 34;
  const zh = (t: string) => /[一-鿿]/.test(t);
  return (
    <g opacity={o}>
      <rect x={160} y={top} width={w} height={34} rx={17} fill="none" stroke={C.ink2} strokeOpacity={0.7} />
      <text x={160 + w / 2} y={top + 24} textAnchor="middle" style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 21 }} fill={C.ink2}>{chip}</text>
      {lines.map((t, i) => (
        <text key={i} x={160} y={top + 68 + i * 32} style={{ fontFamily: zh(t) ? F.sans : F.mono, fontSize: zh(t) ? 21 : 19, ...LNUM }} fill={C.ink2}>{t}</text>
      ))}
    </g>
  );
};

/* ---------- tokens ---------- */
export const Coin: React.FC<{ x: number; y: number; l: 'A' | 'B'; solid?: boolean; o?: number; s?: number; r?: number; dashed?: boolean }> = ({ x, y, l, solid = l === 'A', o = 1, s = 1, r = 25, dashed }) => {
  if (o <= 0) return null;
  if (dashed)
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
        <circle r={r} fill="none" stroke={C.ink} strokeWidth={2} strokeDasharray="5 5" strokeOpacity={0.42} />
        <text y={11} textAnchor="middle" style={{ fontFamily: F.lat, fontWeight: 700, fontSize: 32 }} fill={C.ink} fillOpacity={0.3}>{l}</text>
      </g>
    );
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      <circle r={r} fill={solid ? C.ink : '#f3ebd8'} stroke={C.ink} strokeWidth={3} />
      <circle r={r - 6} fill="none" stroke={solid ? '#f3ebd8' : C.ink} strokeWidth={1} strokeOpacity={0.5} />
      <text y={11} textAnchor="middle" style={{ fontFamily: F.lat, fontWeight: 700, fontSize: 32 * (r / 25) }} fill={solid ? '#f3ebd8' : C.ink}>{l}</text>
    </g>
  );
};

export type HeartKind = 'full' | 'half' | 'empty' | 'q' | 'flick';
export const Heart: React.FC<{ x: number; y: number; kind: HeartKind; s?: number; o?: number; fill?: number }> = ({ x, y, kind, s = 1, o = 1, fill = 0.5 }) => {
  if (o <= 0 || s <= 0) return null;
  if (kind === 'q')
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
        <circle r={24} fill="#cfc8bb" fillOpacity={0.55} stroke="#9d968a" strokeWidth={2} />
        <text y={13} textAnchor="middle" style={{ fontFamily: F.lat, fontWeight: 700, fontSize: 40 }} fill="#6f685d">?</text>
      </g>
    );
  const col = kind === 'empty' ? '#9d968a' : C.gold;
  const lvl = kind === 'half' ? 0.5 : kind === 'flick' ? fill : 1;
  const cid = `hf${Math.round(x)}_${Math.round(y)}`;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      {kind === 'full' && <use href="#k-heart" x={-23} y={-23} width={46} height={46} fill={col} />}
      {(kind === 'half' || kind === 'flick') && (
        <>
          <clipPath id={cid}><rect x={-23} y={23 - 46 * lvl * 0.8 - 6} width={46} height={50} /></clipPath>
          <use href="#k-heart" x={-23} y={-23} width={46} height={46} fill="#e2b453" opacity={0.9} clipPath={`url(#${cid})`} />
        </>
      )}
      <use href="#k-heart" x={-23} y={-23} width={46} height={46} fill="none" stroke={kind === 'empty' ? '#9d968a' : C.goldDD} strokeWidth={2.6} />
    </g>
  );
};

/* ---------- the stamp ---------- */
export const Stamp: React.FC<{ x: number; y: number; rot: number; s: number; o?: number; w: number; h: number; text?: string; size?: number; sub?: string; textO?: number; ls?: number }> = ({ x, y, rot, s, o = 1, w, h, text, size = 94, sub, textO = 1, ls = 8 }) => {
  if (o <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={o} filter="url(#k-stampInk)">
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={6} fill="none" stroke={C.red} strokeWidth={7} />
      <rect x={-w / 2 + 14} y={-h / 2 + 14} width={w - 28} height={h - 28} rx={3} fill="none" stroke={C.red} strokeWidth={2.5} />
      {text && <text y={sub ? 22 : size * 0.36} textAnchor="middle" opacity={textO} style={{ fontFamily: F.serif, fontWeight: 900, fontSize: size, letterSpacing: ls }} fill={C.red}>{text}</text>}
      {sub && <text y={62} textAnchor="middle" opacity={textO} style={{ fontFamily: F.lat, fontWeight: 700, fontSize: 25, letterSpacing: 9 }} fill={C.red}>{sub}</text>}
    </g>
  );
};

/* ---------- subtitles ---------- */
const HL: React.CSSProperties = { fontWeight: 700, color: C.goldHi, textShadow: '0 0 24px rgba(241,197,109,.35),0 2px 12px rgba(0,0,0,.9)' };
const Rich: React.FC<{ s: string }> = ({ s }) => (
  <>{s.split(/(\[[^\]]+\])/).filter(Boolean).map((seg, i) => seg.startsWith('[') ? <span key={i} style={HL}>{seg.slice(1, -1)}</span> : <span key={i}>{seg}</span>)}</>
);
export type Line11 = [number, number, string];
export const Subs11: React.FC<{ T: number; lines: Line11[] }> = ({ T, lines }) => (
  <>
    {lines.map(([a, z, s], i) => {
      const o = Math.min(a <= 0.01 ? 1 : easeOut(pr(T, a, 0.2)), 1 - pr(T, z - 0.16, 0.16));
      if (o <= 0) return null;
      const bl = a <= 0.01 ? 0 : (1 - easeOut(pr(T, a, 0.26))) * 5;
      return (
        <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: 852, textAlign: 'center', opacity: o, filter: bl > 0.1 ? `blur(${bl}px)` : undefined,
          fontFamily: F.sans, fontWeight: 500, fontSize: 56, letterSpacing: '0.06em', lineHeight: 1.2, color: C.cream, textShadow: '0 2px 14px rgba(0,0,0,.9)', ...LNUM }}>
          <Rich s={s} />
        </div>
      );
    })}
  </>
);

/* ---------- camera + hinge ---------- */
/** a 1920×1080 layer with a 2D camera: scale s about (cx, cy) then translate */
export const Cam: React.FC<{ s?: number; x?: number; y?: number; cx?: number; cy?: number; o?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ s = 1, x = 0, y = 0, cx = 960, cy = 540, o = 1, children, style }) =>
  o <= 0 ? null : (
    <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, opacity: o, transformOrigin: `${cx}px ${cy}px`, transform: `translate(${x}px, ${y}px) scale(${s})`, ...style }}>{children}</div>
  );
export const Svg: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', ...style }}>{children}</svg>
);

/** the shared hinge: a leaf rotating about a vertical axis (rotateY), with a moving shade.
    angle 0 = flat; −180 = turned over to the left. Front face only (backface hidden). */
export const Hinge: React.FC<{ angle: number; axisX: number; children: React.ReactNode; shade?: boolean; back?: React.ReactNode; persp?: number }> = ({ angle, axisX, children, shade = true, back, persp = 3200 }) => {
  const a = Math.abs(angle) % 360;
  const k = Math.sin((Math.min(a, 180) * Math.PI) / 180);
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, perspective: persp, perspectiveOrigin: `${axisX}px 540px` }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, transformStyle: 'preserve-3d', transformOrigin: `${axisX}px 540px`, transform: `rotateY(${angle}deg)` }}>
        <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden' }}>
          {children}
          {shade && k > 0.01 && <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg, rgba(0,0,0,${0.55 * k}) 0%, rgba(0,0,0,${0.15 * k}) 40%, rgba(255,250,235,${0.12 * k}) 75%, rgba(0,0,0,${0.3 * k}) 100%)`, mixBlendMode: 'multiply' }} />}
        </div>
        {back && <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>{back}</div>}
      </div>
    </div>
  );
};

/** the brand's metal gold title, set with natural advances (so "TA" isn't spaced like CJK), staggered reveal + one light sweep */
export const GoldTitle11: React.FC<{ text: string; f: number; at: number; size: number; y: number; x?: number; id?: string; step?: number; fade?: number }> = ({ text, f, at, size, y, x = W / 2, id = 'gt11', step = 3, fade = 16 }) => {
  const chars = [...`《${text}》`];
  const sweep = lerp(-700, 700, easeInOut(clamp((f - at - chars.length * step - fade + 4) / 30)));
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-m`} x1="0" y1={y - size * 0.8} x2="0" y2={y + size * 0.2} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff3cf" /><stop offset="0.45" stopColor="#f3cd7a" /><stop offset="0.7" stopColor="#c99140" /><stop offset="1" stopColor="#8a5a22" />
        </linearGradient>
        <linearGradient id={`${id}-s`} x1={x + sweep - 120} y1="0" x2={x + sweep + 120} y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="0.5" stopColor="#fff" stopOpacity="0.85" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {['m', 's'].map((k) => (
        <text key={k} x={x} y={y} textAnchor="middle" style={{ fontFamily: F.serif, fontWeight: 900, fontSize: size, letterSpacing: '0.02em' }}>
          {chars.map((ch, i) => <tspan key={i} fill={`url(#${id}-${k})`} opacity={easeOut(clamp((f - at - i * step) / fade))}>{ch}</tspan>)}
        </text>
      ))}
    </g>
  );
};
