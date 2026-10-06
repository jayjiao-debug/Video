import React from 'react';
import { Img, staticFile } from 'remotion';
import TL from '../il_tl.json';

/* 《心流》illustrated film — kit. Look "夜灯": flat illustration in the manner of the tanks episode, richer:
   deep navy night, warm amber lamp light and cool screen light as the two light sources, layered depth,
   soft radial glows (no blur filters), film grain, slow continuous camera. */
export const W = 1920, H = 1080;
export const C = {
  n0: '#090D22', n1: '#111938', n2: '#1B2650', n3: '#2A3A70', n4: '#44569A', slate: '#7C88B5',
  amber: '#FFB54A', orange: '#FF7B33', ember: '#E2492F', gold: '#FFD98A', cream: '#F7ECD8', paper: '#EFE3CB',
  teal: '#4FD1C5', sky: '#8FD3FF', skin: '#F2C6A0', skinSh: '#D99E78', hair: '#17172A', red: '#E4463A', green: '#5CC98A', wood: '#6B4430', wood2: '#8A5A3C',
};
export const F = { zh: '"Noto Sans CJK SC", sans-serif', serif: '"Noto Serif CJK SC", serif', num: '"Cormorant Garamond", serif', mono: '"DejaVu Sans Mono", monospace' };
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const ease = (t: number) => { t = clamp(t); return t * t * (3 - 2 * t); };
export const eo = (t: number) => { t = clamp(t); return 1 - (1 - t) ** 3; };
export const ei = (t: number) => { t = clamp(t); return t ** 3; };
/** 0→1 over [a, a+d] smoothed */
export const sm = (T: number, a: number, d = 0.4) => ease((T - a) / d);
/** fade in at a, out at b */
export const life = (T: number, a: number, b: number, fi = 0.3, fo = 0.3) => Math.min(sm(T, a, fi), 1 - sm(T, b - fo, fo));
/** springy pop 0→1 with overshoot */
export const pop = (T: number, a: number, d = 0.35) => { const k = clamp((T - a) / d); return k <= 0 ? 0 : eo(k) + 0.12 * Math.sin(k * Math.PI) * (1 - k); };
export const rng = (seed: number) => { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); };

type Seg = { id: string; caption: string; t0: number; t1: number };
export const SEGS = TL.segments as Seg[];
const CUE: Record<string, Seg> = Object.fromEntries(SEGS.map((s) => [s.id, s]));
export const cue = (id: string, dt = 0) => CUE[id].t0 + dt;
export const cend = (id: string) => CUE[id].t1;
/** time a phrase is spoken inside a segment (proportional to characters) */
export const cw = (id: string, phrase: string) => { const s = CUE[id], i = s.caption.indexOf(phrase), n = [...s.caption].length; return s.t0 + ((i < 0 ? 0 : [...s.caption.slice(0, i)].length) / n) * (s.t1 - s.t0); };
export const HIT = TL.hit, DROP2 = TL.drop2, VO_END = TL.vo_end, FILM_END = TL.film_end;

export const Txt: React.FC<{ x: number; y: number; s: number; c?: string; w?: number; a?: 'start' | 'middle' | 'end'; f?: string; o?: number; ls?: string; children: React.ReactNode; stroke?: string }> = ({ x, y, s, c = C.cream, w = 700, a = 'middle', f = F.zh, o = 1, ls, children, stroke }) => (
  <text x={x} y={y} textAnchor={a} opacity={o} style={{ fontFamily: f, fontSize: s, fontWeight: w, letterSpacing: ls, fontFeatureSettings: "'tnum' 1" }} fill={c} stroke={stroke} strokeWidth={stroke ? s * 0.12 : 0} paintOrder="stroke" strokeLinejoin="round">{children}</text>
);
/** radial glow (gradient id must be unique per colour) */
export const GlowDefs: React.FC = () => (
  <defs>
    {Object.entries({ amber: C.amber, teal: C.teal, gold: C.gold, ember: C.ember, cream: C.cream, sky: C.sky, red: C.red, green: C.green }).map(([k, v]) => (
      <radialGradient key={k} id={`g-${k}`}><stop offset="0" stopColor={v} stopOpacity="0.9" /><stop offset="0.35" stopColor={v} stopOpacity="0.35" /><stop offset="1" stopColor={v} stopOpacity="0" /></radialGradient>
    ))}
    <linearGradient id="night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.n0} /><stop offset="0.65" stopColor={C.n1} /><stop offset="1" stopColor={C.n2} /></linearGradient>
    <linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.n1} /><stop offset="0.55" stopColor={C.n3} /><stop offset="0.85" stopColor="#B4566A" /><stop offset="1" stopColor={C.orange} /></linearGradient>
    <linearGradient id="dawn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3D5A9E" /><stop offset="0.6" stopColor="#E7A57C" /><stop offset="1" stopColor={C.gold} /></linearGradient>
    <linearGradient id="room" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.n1} /><stop offset="1" stopColor={C.n0} /></linearGradient>
    <linearGradient id="warmroom" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3A2A3A" /><stop offset="1" stopColor="#1E1626" /></linearGradient>
    <radialGradient id="vig" cx="50%" cy="50%" r="72%"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.55" /></radialGradient>
  </defs>
);
export const Glow: React.FC<{ x: number; y: number; r: number; c?: string; o?: number; sy?: number }> = ({ x, y, r, c = 'amber', o = 1, sy = 1 }) => <ellipse cx={x} cy={y} rx={r} ry={r * sy} fill={`url(#g-${c})`} opacity={o} />;
export const Vignette: React.FC = () => <rect width={W} height={H} fill="url(#vig)" />;
export const Grain: React.FC<{ frame: number; o?: number }> = ({ frame, o = 0.1 }) => (
  <Img src={staticFile(`grain${Math.floor(frame / 2) % 4}.png`)} style={{ position: 'absolute', inset: 0, width: W, height: H, mixBlendMode: 'overlay', opacity: o }} />
);
export const Stars: React.FC<{ n?: number; seed?: number; T: number; y1?: number; o?: number }> = ({ n = 90, seed = 3, T, y1 = 600, o = 1 }) => {
  const r = rng(seed);
  return <g opacity={o}>{Array.from({ length: n }, (_, i) => { const x = r() * W, y = r() * y1, s = 0.8 + r() * 2.2, ph = r() * 6; return <circle key={i} cx={x} cy={y} r={s} fill={C.cream} opacity={0.35 + 0.45 * (0.5 + 0.5 * Math.sin(T * 1.7 + ph))} />; })}</g>;
};
export const Moon: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 60 }) => (
  <g><Glow x={x} y={y} r={r * 5} c="cream" o={0.35} /><circle cx={x} cy={y} r={r} fill={C.cream} /><circle cx={x + r * 0.35} cy={y - r * 0.2} r={r * 0.16} fill="#E5D7BC" /><circle cx={x - r * 0.3} cy={y + r * 0.3} r={r * 0.1} fill="#E5D7BC" /></g>
);
/** a camera: scale/translate around a focus point */
export const Cam: React.FC<{ s?: number; x?: number; y?: number; children: React.ReactNode }> = ({ s = 1, x = 0, y = 0, children }) => (
  <g transform={`translate(${W / 2 + x},${H / 2 + y}) scale(${s}) translate(${-W / 2},${-H / 2})`}>{children}</g>
);

/* ---------------- the kid (front view) ---------------- */
export type Face = { eyes?: 'open' | 'wide' | 'half' | 'closed' | 'up' | 'side'; mouth?: 'smile' | 'grin' | 'o' | 'flat' | 'frown' | 'sigh'; blush?: boolean; sweat?: number };
export const Kid: React.FC<{ x: number; y: number; s?: number; face?: Face; light?: string; lightO?: number; hood?: string; headTilt?: number; chin?: boolean; T?: number }> = ({ x, y, s = 1, face = {}, light, lightO = 0.5, hood = C.n3, headTilt = 0, chin = false, T = 0 }) => {
  const { eyes = 'open', mouth = 'flat', blush = false, sweat = 0 } = face;
  const blink = eyes === 'open' && (T % 3.1) > 3.0;
  const eye = (ex: number) => {
    const e = blink ? 'closed' : eyes;
    if (e === 'closed') return <path d={`M${ex - 16},0 Q${ex},10 ${ex + 16},0`} stroke={C.hair} strokeWidth={6} fill="none" strokeLinecap="round" />;
    if (e === 'half') return <g><ellipse cx={ex} cy={4} rx={14} ry={9} fill={C.hair} /><rect x={ex - 20} y={-14} width={40} height={16} fill={C.skin} /><path d={`M${ex - 17},2 L${ex + 17},2`} stroke={C.hair} strokeWidth={5} strokeLinecap="round" /></g>;
    const ry = e === 'wide' ? 20 : 15, py = e === 'up' ? -7 : 0, px = e === 'side' ? -6 : 0;
    return <g><ellipse cx={ex} cy={0} rx={e === 'wide' ? 17 : 13} ry={ry} fill="#fff" /><ellipse cx={ex + px} cy={py + 2} rx={e === 'wide' ? 7 : 10} ry={e === 'wide' ? 8 : 12} fill={C.hair} /><circle cx={ex + px + 4} cy={py - 4} r={3.5} fill="#fff" /></g>;
  };
  const m = { smile: 'M-18,0 Q0,16 18,0', grin: 'M-24,-2 Q0,26 24,-2 Z', o: '', flat: 'M-12,4 L12,4', frown: 'M-14,8 Q0,-2 14,8', sigh: 'M-10,6 Q0,2 10,8' }[mouth];
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      {/* body */}
      <path d="M-170,260 C-170,150 -120,110 0,110 C120,110 170,150 170,260 Z" fill={hood} />
      <path d="M-60,118 Q0,170 60,118" stroke={C.n1} strokeOpacity={0.5} strokeWidth={10} fill="none" />
      <line x1={-24} y1={140} x2={-28} y2={200} stroke={C.cream} strokeWidth={6} strokeLinecap="round" /><line x1={24} y1={140} x2={28} y2={200} stroke={C.cream} strokeWidth={6} strokeLinecap="round" />
      <rect x={-26} y={80} width={52} height={44} rx={10} fill={C.skinSh} />
      <g transform={`rotate(${headTilt}, 0, 0) ${chin ? 'translate(0,8)' : ''}`}>
        <ellipse cx={-92} cy={6} rx={18} ry={24} fill={C.skin} /><ellipse cx={92} cy={6} rx={18} ry={24} fill={C.skin} />
        <ellipse cx={0} cy={0} rx={92} ry={98} fill={C.skin} />
        <path d="M-92,0 A92,98 0 0,0 92,0 L92,40 A92,60 0 0,1 -92,40 Z" fill={C.skinSh} opacity={0.25} />
        {/* hair */}
        <path d="M-98,-6 C-104,-92 -40,-128 6,-126 C70,-124 108,-80 98,-4 C86,-40 70,-52 54,-56 L46,-28 L30,-56 L10,-26 L-6,-58 L-26,-24 L-40,-56 L-62,-26 C-72,-40 -86,-36 -98,-6 Z" fill={C.hair} />
        <g transform="translate(0,4)">{eye(-36)}{eye(36)}</g>
        {eyes === 'wide' ? <><path d="M-54,-38 Q-36,-50 -18,-40" stroke={C.hair} strokeWidth={6} fill="none" strokeLinecap="round" /><path d="M18,-40 Q36,-50 54,-38" stroke={C.hair} strokeWidth={6} fill="none" strokeLinecap="round" /></>
          : eyes === 'half' ? <><path d="M-54,-24 L-18,-26" stroke={C.hair} strokeWidth={6} strokeLinecap="round" /><path d="M18,-26 L54,-22" stroke={C.hair} strokeWidth={6} strokeLinecap="round" /></>
          : <><path d="M-54,-30 L-18,-24" stroke={C.hair} strokeWidth={6} strokeLinecap="round" /><path d="M18,-24 L54,-30" stroke={C.hair} strokeWidth={6} strokeLinecap="round" /></>}
        {blush && <><ellipse cx={-56} cy={34} rx={14} ry={7} fill={C.red} opacity={0.35} /><ellipse cx={56} cy={34} rx={14} ry={7} fill={C.red} opacity={0.35} /></>}
        <g transform="translate(0,52)">{mouth === 'o' ? <ellipse cx={0} cy={4} rx={10} ry={13} fill={C.hair} /> : mouth === 'grin' ? <path d={m} fill={C.hair} /> : <path d={m} stroke={C.hair} strokeWidth={6} fill="none" strokeLinecap="round" />}</g>
        {sweat > 0 && <path d={`M96,${-40 + sweat * 30} q10,18 0,26 q-10,-8 0,-26 Z`} fill={C.sky} opacity={0.9} />}
        {light && <ellipse cx={0} cy={0} rx={92} ry={98} fill={light} opacity={lightO} style={{ mixBlendMode: 'soft-light' }} />}
      </g>
    </g>
  );
};
/** the kid seen from behind, at a desk */
export const KidBack: React.FC<{ x: number; y: number; s?: number; hood?: string; rim?: string }> = ({ x, y, s = 1, hood = C.n3, rim }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M-170,260 C-170,150 -120,110 0,110 C120,110 170,150 170,260 Z" fill={hood} />
    <ellipse cx={-92} cy={10} rx={16} ry={22} fill={C.skinSh} /><ellipse cx={92} cy={10} rx={16} ry={22} fill={C.skinSh} />
    <ellipse cx={0} cy={0} rx={94} ry={100} fill={C.hair} />
    {rim && <path d="M-80,-56 A94,100 0 0,1 80,-56" stroke={rim} strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.9} />}
  </g>
);
export const Panel: React.FC<{ x: number; y: number; w: number; h: number; r?: number; fill?: string; stroke?: string; o?: number; children?: React.ReactNode }> = ({ x, y, w, h, r = 22, fill = C.n1, stroke, o = 1, children }) => (
  <g opacity={o}><rect x={x} y={y} width={w} height={h} rx={r} fill={fill} stroke={stroke} strokeWidth={stroke ? 3 : 0} />{children}</g>
);
export const Clock: React.FC<{ x: number; y: number; r: number; min: number; sec?: number; face?: string }> = ({ x, y, r, min, sec, face = C.cream }) => {
  const mA = (min % 60) * 6, hA = ((min / 60) % 12) * 30;
  return (
    <g transform={`translate(${x},${y})`}>
      <circle r={r + 8} fill={C.n0} /><circle r={r} fill={face} />
      {Array.from({ length: 12 }, (_, i) => <line key={i} x1={0} y1={-r + 8} x2={0} y2={-r + (i % 3 ? 16 : 24)} stroke={C.n1} strokeWidth={i % 3 ? 3 : 6} transform={`rotate(${i * 30})`} />)}
      <line x1={0} y1={0} x2={0} y2={-r * 0.5} stroke={C.n1} strokeWidth={9} strokeLinecap="round" transform={`rotate(${hA})`} />
      <line x1={0} y1={0} x2={0} y2={-r * 0.78} stroke={C.n1} strokeWidth={6} strokeLinecap="round" transform={`rotate(${mA})`} />
      {sec !== undefined && <line x1={0} y1={10} x2={0} y2={-r * 0.85} stroke={C.ember} strokeWidth={3} transform={`rotate(${sec * 6})`} />}
      <circle r={8} fill={C.n1} />
    </g>
  );
};
export const hhmm = (m: number) => { const h = Math.floor((((m % 1440) + 1440) % 1440) / 60), mm = Math.floor(((m % 60) + 60) % 60); return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`; };
/** condition banner: pops big at the top, then settles into a corner chip */
export const Chip: React.FC<{ T: number; at: number; n: string; text: string }> = ({ T, at, n, text }) => {
  if (T < at) return null;
  const k = pop(T, at, 0.4), m = ease((T - at - 1.3) / 0.5);
  const x = lerp(W / 2, 250, m), y = lerp(200, 70, m), s = lerp(1, 0.48, m) * k;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <rect x={-330} y={-82} width={660} height={140} rx={70} fill={C.n0} opacity={0.92} stroke={C.amber} strokeWidth={5} />
      <circle cx={-250} cy={-12} r={46} fill={C.amber} /><Txt x={-250} y={12} s={64} c={C.n0} w={900} f={F.num}>{n}</Txt>
      <Txt x={40} y={14} s={74} c={C.cream} w={900}>{text}</Txt>
    </g>
  );
};
/** lower-third name card */
export const NameCard: React.FC<{ x: number; y: number; k: number; name: string; sub: string }> = ({ x, y, k, name, sub }) => (
  <g opacity={k} transform={`translate(${x - 30 * (1 - k)},${y})`}>
    <rect x={0} y={0} width={8} height={104} fill={C.amber} />
    <Txt x={30} y={52} s={52} a="start" c={C.cream} w={900}>{name}</Txt>
    <Txt x={32} y={92} s={28} a="start" c={C.gold} w={500}>{sub}</Txt>
  </g>
);
const HIDE = new Set(['K2', 'K3', 'K6', 'K10', 'E6']);   // the picture already says these
/** caption under the picture (the voice line) */
export const Captions: React.FC<{ T: number }> = ({ T }) => {
  const s = SEGS.find((g, i) => (T >= g.t0 - 0.05 || i === 0) && T < Math.min(g.t1 + 0.25, SEGS[i + 1] ? SEGS[i + 1].t0 - 0.02 : 1e9));
  if (!s || HIDE.has(s.id)) return null;
  const o = s === SEGS[0] ? 1 : Math.min(clamp((T - s.t0 + 0.05) / 0.12), 1);
  const txt = s.caption.replace(/[；，。：]$/, '');
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 54, textAlign: 'center', opacity: o, fontFamily: F.zh, fontSize: 40, fontWeight: 600, letterSpacing: '0.04em', color: '#FBF4E6', textShadow: '0 0 12px rgba(5,8,25,.95), 0 2px 4px rgba(5,8,25,.9)' }}>{txt}</div>
  );
};
