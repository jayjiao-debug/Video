import React from 'react';

/* A small 2D character rig: flat illustration with volume shading and rim light.
   Local units: pelvis at (0,0), up is -y. Standing height ≈ 1000 units (feet at +500). Facing 3/4 to the right. */

export type Pose = {
  lean?: number; head?: number; // degrees
  shR?: number; elR?: number; shL?: number; elL?: number; // arms: 0 = hanging down, + = forward
  hipR?: number; knR?: number; hipL?: number; knL?: number; // legs: 0 = straight down, + = forward
};
export type Look = {
  id: string;
  skin: string; skinDark: string;
  hair: string; hairStyle: 'short' | 'side' | 'long' | 'bob';
  top: string; topDark: string; sleeves?: 'long' | 'short';
  jacket?: string; jacketDark?: string; tie?: string;
  bottom: string; bottomDark: string; shoes: string;
  glasses?: boolean; dress?: boolean; blush?: number; belt?: boolean;
};

const rad = (d: number) => (d * Math.PI) / 180;
const pt = (x: number, y: number, len: number, a: number) => ({ x: x + len * Math.sin(rad(a)), y: y + len * Math.cos(rad(a)) });

/** tapered limb between two points: a quad plus round caps (no arcs, no holes) */
const Limb: React.FC<{ x1: number; y1: number; x2: number; y2: number; w1: number; w2: number; fill: string }> = ({ x1, y1, x2, y2, w1, w2, fill }) => {
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L, ny = dx / L;
  const d = `M ${x1 + (nx * w1) / 2} ${y1 + (ny * w1) / 2} L ${x2 + (nx * w2) / 2} ${y2 + (ny * w2) / 2} L ${x2 - (nx * w2) / 2} ${y2 - (ny * w2) / 2} L ${x1 - (nx * w1) / 2} ${y1 - (ny * w1) / 2} Z`;
  return (<g fill={fill}><path d={d} /><circle cx={x1} cy={y1} r={w1 / 2} /><circle cx={x2} cy={y2} r={w2 / 2} /></g>);
};

const TORSO = 'M -46 -298 C -80 -296 -96 -278 -92 -248 C -86 -204 -72 -152 -64 -112 C -70 -62 -76 -22 -72 4 L 68 4 C 70 -22 64 -62 58 -112 C 64 -152 78 -204 82 -248 C 86 -278 72 -296 44 -298 Z';
const FACE = 'M -58 -10 C -60 -60 -30 -78 4 -76 C 44 -74 66 -44 64 -2 C 63 30 50 58 22 72 C 8 78 -8 76 -22 66 C -44 50 -56 26 -58 -10 Z';

const HAIR_BACK: Record<Look['hairStyle'], string> = {
  short: 'M -66 -4 C -74 -64 -36 -94 8 -92 C 54 -90 76 -58 68 -20 L 60 -6 C 40 -40 -10 -40 -40 -30 L -50 20 Z',
  side: 'M -66 0 C -74 -66 -34 -96 10 -93 C 56 -90 78 -56 70 -18 L 62 -8 C 44 -46 -8 -46 -40 -34 L -52 22 Z',
  long: 'M -68 -8 C -78 -72 -30 -98 12 -94 C 58 -90 80 -52 72 -4 C 78 50 76 110 66 170 L -78 170 C -86 100 -82 30 -68 -8 Z',
  bob: 'M -68 -8 C -78 -72 -30 -98 12 -94 C 58 -90 80 -52 72 -4 C 76 30 72 58 62 76 L -70 76 C -80 44 -80 14 -68 -8 Z',
};
const HAIR_FRONT: Record<Look['hairStyle'], string> = {
  short: 'M -60 -18 C -62 -70 -24 -90 14 -88 C 50 -86 70 -62 66 -26 C 56 -44 40 -52 22 -50 C 4 -44 -22 -44 -40 -40 C -48 -32 -54 -26 -60 -18 Z',
  side: 'M -60 -16 C -64 -72 -22 -92 16 -89 C 52 -86 72 -60 68 -28 C 62 -52 44 -60 30 -60 C 12 -52 -16 -50 -36 -44 C -46 -36 -54 -26 -60 -16 Z',
  long: 'M -62 -18 C -60 -72 -20 -90 16 -88 C 50 -86 68 -60 66 -28 C 52 -50 32 -58 10 -54 C -8 -42 -34 -34 -62 -18 Z',
  bob: 'M -62 -18 C -60 -72 -20 -90 16 -88 C 50 -86 68 -60 66 -28 C 52 -50 32 -58 10 -54 C -8 -42 -34 -34 -62 -18 Z',
};

export const Person: React.FC<{ look: Look; pose?: Pose; x?: number; y?: number; scale?: number; rim?: string; shadow?: boolean; flip?: boolean; blink?: number }> = ({
  look: L, pose = {}, x = 0, y = 0, scale = 1, rim = 'rgba(255,214,150,0.55)', shadow = true, flip = false, blink = 0,
}) => {
  const P = { lean: 0, head: 0, shR: 6, elR: 8, shL: -6, elL: 6, hipR: 2, knR: 0, hipL: -3, knL: 0, ...pose };
  const id = L.id;
  const g = (n: string) => `url(#${id}-${n})`;
  // joints
  const sR = { x: 50, y: -258 }, sL = { x: -60, y: -258 };
  const eR = pt(sR.x, sR.y, 165, P.shR), wR = pt(eR.x, eR.y, 150, P.shR + P.elR), hR = pt(wR.x, wR.y, 20, P.shR + P.elR);
  const eL = pt(sL.x, sL.y, 165, P.shL), wL = pt(eL.x, eL.y, 150, P.shL + P.elL), hL = pt(wL.x, wL.y, 20, P.shL + P.elL);
  const hpR = { x: 30, y: -8 }, hpL = { x: -34, y: -8 };
  const kR = pt(hpR.x, hpR.y, 255, P.hipR), aR = pt(kR.x, kR.y, 235, P.hipR + P.knR);
  const kL = pt(hpL.x, hpL.y, 255, P.hipL), aL = pt(kL.x, kL.y, 235, P.hipL + P.knL);
  const armFill = L.jacket ? g('jacket') : g('top');
  const shoe = (a: { x: number; y: number }, far: boolean) => (
    <path d={`M ${a.x - 20} ${a.y - 8} L ${a.x + 40} ${a.y - 8} C ${a.x + 64} ${a.y - 8} ${a.x + 68} ${a.y + 14} ${a.x + 52} ${a.y + 20} L ${a.x - 20} ${a.y + 20} Z`}
      fill={L.shoes} opacity={far ? 0.85 : 1} />
  );
  const HEAD_T = `translate(4 -398) scale(1.1) rotate(${P.head})`;
  const arm = (s: { x: number; y: number }, e: { x: number; y: number }, w: { x: number; y: number }, h: { x: number; y: number }, far: boolean) => {
    const sleeve = L.sleeves === 'short' ? g('skin') : armFill;
    const cuff = { x: e.x + (w.x - e.x) * 0.86, y: e.y + (w.y - e.y) * 0.86 };
    return (
      <g opacity={far ? 0.92 : 1} style={far ? { filter: 'brightness(0.78)' } : undefined}>
        <Limb x1={s.x} y1={s.y} x2={e.x} y2={e.y} w1={52} w2={42} fill={armFill} />
        <Limb x1={e.x} y1={e.y} x2={w.x} y2={w.y} w1={42} w2={34} fill={sleeve} />
        {L.sleeves === 'short' && <Limb x1={s.x} y1={s.y} x2={s.x + (e.x - s.x) * 0.55} y2={s.y + (e.y - s.y) * 0.55} w1={56} w2={50} fill={g('top')} />}
        {L.sleeves !== 'short' && <Limb x1={cuff.x} y1={cuff.y} x2={w.x} y2={w.y} w1={35} w2={35} fill={L.jacket ? L.top : 'rgba(255,255,255,0.12)'} />}
        <ellipse cx={h.x} cy={h.y} rx={17} ry={21} fill={g('skin')} />
        {!far && <Limb x1={s.x} y1={s.y} x2={e.x} y2={e.y} w1={52} w2={42} fill={g('rim')} />}
      </g>
    );
  };
  const leg = (hp: { x: number; y: number }, k: { x: number; y: number }, a: { x: number; y: number }, far: boolean) => (
    <g opacity={far ? 0.94 : 1}>
      {shoe(a, far)}
      <Limb x1={hp.x} y1={hp.y} x2={k.x} y2={k.y} w1={72} w2={52} fill={far ? L.bottomDark : g('bottom')} />
      <Limb x1={k.x} y1={k.y} x2={a.x} y2={a.y} w1={52} w2={40} fill={far ? L.bottomDark : g('bottom')} />
      {!far && <path d={`M ${k.x + 6} ${k.y + 30} L ${a.x + 6} ${a.y - 30}`} stroke="rgba(0,0,0,0.15)" strokeWidth={3} />}
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}>
      <defs>
        <linearGradient id={`${id}-skin`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={L.skinDark} /><stop offset="0.65" stopColor={L.skin} /></linearGradient>
        <linearGradient id={`${id}-top`} x1="0" y1="0" x2="1" y2="0.3"><stop offset="0" stopColor={L.topDark} /><stop offset="0.7" stopColor={L.top} /></linearGradient>
        <linearGradient id={`${id}-jacket`} x1="0" y1="0" x2="1" y2="0.3"><stop offset="0" stopColor={L.jacketDark || L.topDark} /><stop offset="0.7" stopColor={L.jacket || L.top} /></linearGradient>
        <linearGradient id={`${id}-bottom`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={L.bottomDark} /><stop offset="0.7" stopColor={L.bottom} /></linearGradient>
        <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="1" y2="0"><stop offset="0.62" stopColor={rim} stopOpacity="0" /><stop offset="1" stopColor={rim} /></linearGradient>
        <linearGradient id={`${id}-hair`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={L.hair} /><stop offset="1" stopColor={L.hair} stopOpacity="0.85" /></linearGradient>
      </defs>
      {shadow && <ellipse cx={0} cy={520} rx={150} ry={20} fill="rgba(0,0,0,0.35)" />}
      {/* far leg + far arm */}
      {leg(hpL, kL, aL, true)}
      <g transform={`rotate(${-P.lean} 0 0)`}>{arm(sL, eL, wL, hL, true)}</g>
      {/* near leg */}
      {leg(hpR, kR, aR, false)}
      {L.dress && <path d={`M -74 -6 L 70 -6 L ${Math.max(100, kR.x + 40)} ${Math.min(kR.y + 20, 260)} L ${Math.min(-98, kL.x - 40)} ${Math.min(kL.y + 20, 260)} Z`} fill={g('top')} />}
      <g transform={`rotate(${-P.lean} 0 0)`}>
        {L.hairStyle === 'long' && <g transform={HEAD_T}><path d={HAIR_BACK.long} fill={g('hair')} /></g>}
        {/* neck */}
        <path d="M -20 -345 L 22 -345 L 24 -282 L -22 -282 Z" fill={g('skin')} />
        <path d="M -20 -330 Q 2 -312 24 -322 L 24 -300 L -20 -300 Z" fill="rgba(0,0,0,0.18)" />
        {/* torso */}
        <path d={TORSO} fill={L.jacket ? g('jacket') : g('top')} />
        {L.jacket && (
          <>
            <path d="M -8 -292 L 34 -292 L 16 -150 Z" fill={L.top} />
            {L.tie && <path d="M 8 -286 L 22 -286 L 26 -196 L 15 -178 L 5 -196 Z" fill={L.tie} />}
            <path d="M -8 -292 L 16 -150 M 34 -292 L 16 -150" stroke="rgba(0,0,0,0.25)" strokeWidth={3} fill="none" />
          </>
        )}
        {!L.jacket && <path d="M -20 -298 Q 8 -258 40 -298 L 30 -298 Q 8 -270 -10 -298 Z" fill="rgba(255,255,255,0.18)" />}
        {!L.dress && L.belt !== false && <rect x={-72} y={-22} width={140} height={16} fill="rgba(0,0,0,0.35)" />}
        {!L.dress && L.belt !== false && <rect x={20} y={-24} width={20} height={20} rx={3} fill="none" stroke="rgba(233,194,122,0.7)" strokeWidth={3} />}
        <path d={TORSO} fill={g('rim')} />
        {/* head */}
        <g transform={HEAD_T}>
          {L.hairStyle !== 'long' && <path d={HAIR_BACK[L.hairStyle]} fill={g('hair')} />}
          <ellipse cx={-42} cy={8} rx={11} ry={16} fill={L.skinDark} />
          <path d={FACE} fill={g('skin')} />
          <path d={FACE} fill={g('rim')} />
          <ellipse cx={40} cy={24} rx={12} ry={6} fill="#e8907e" opacity={L.blush ?? 0.22} />
          {/* eyes */}
          <ellipse cx={14} cy={-2} rx={5.2} ry={6.8 * (1 - blink)} fill="#241a16" />
          <ellipse cx={44} cy={-4} rx={4.6} ry={6.4 * (1 - blink)} fill="#241a16" />
          <circle cx={16} cy={-4} r={1.6} fill="#fff" opacity={0.8 * (1 - blink)} />
          <circle cx={45.5} cy={-6} r={1.4} fill="#fff" opacity={0.8 * (1 - blink)} />
          <path d="M 2 -20 Q 13 -27 25 -21 M 36 -24 Q 46 -28 56 -21" stroke={L.hair} strokeWidth={4} strokeLinecap="round" fill="none" />
          <path d="M 57 4 Q 64 18 53 22" stroke={L.skinDark} strokeWidth={3} strokeLinecap="round" fill="none" />
          <path d="M 30 42 Q 40 47 50 40" stroke="#9a5646" strokeWidth={3} strokeLinecap="round" fill="none" />
          {L.glasses && (
            <g stroke="#1b1612" strokeWidth={3} fill="rgba(255,255,255,0.06)">
              <circle cx={14} cy={-2} r={14} /><circle cx={45} cy={-4} r={12.5} />
              <path d="M 28 -4 L 32 -5 M 0 -3 L -38 -2" fill="none" />
            </g>
          )}
          <path d={HAIR_FRONT[L.hairStyle]} fill={g('hair')} />
          <path d="M -20 -78 Q 10 -86 40 -76" stroke="rgba(255,255,255,0.18)" strokeWidth={5} fill="none" strokeLinecap="round" />
        </g>
      </g>
      {/* near arm last */}
      <g transform={`rotate(${-P.lean} 0 0)`}>{arm(sR, eR, wR, hR, false)}</g>
    </g>
  );
};

/* ---------- cast ---------- */
export const CAST: Record<string, Look> = {
  youM: { id: 'youM', skin: '#f1cfae', skinDark: '#d9a984', hair: '#1c1714', hairStyle: 'short', top: '#e9e2d3', topDark: '#b9b2a3', sleeves: 'long',
    jacket: '#3b4a66', jacketDark: '#27324a', bottom: '#2b2f3a', bottomDark: '#1d2029', shoes: '#141414' },
  youF: { id: 'youF', skin: '#f4d4b6', skinDark: '#dcae8c', hair: '#1a1411', hairStyle: 'long', top: '#b8483b', topDark: '#8a3128', sleeves: 'long',
    bottom: '#e9e2d3', bottomDark: '#b8b0a0', shoes: '#2a211c', blush: 0.3, belt: false },
  drake: { id: 'drake', skin: '#efcaa9', skinDark: '#d1a07c', hair: '#3a2a1e', hairStyle: 'side', top: '#f2eee4', topDark: '#c9c3b5', sleeves: 'long',
    tie: '#2d3a58', jacket: '#6b6457', jacketDark: '#4b463d', bottom: '#4b463d', bottomDark: '#34302a', shoes: '#1c1612', glasses: true },
  backus: { id: 'backus', skin: '#f0caa8', skinDark: '#d09d78', hair: '#6a4a30', hairStyle: 'short', top: '#5b6f8a', topDark: '#3f4f66', sleeves: 'long',
    bottom: '#2f3440', bottomDark: '#20242d', shoes: '#191919' },
  rose: { id: 'rose', skin: '#f3d2b6', skinDark: '#d8a88a', hair: '#7a3b22', hairStyle: 'bob', top: '#2f4a4a', topDark: '#1f3434', sleeves: 'long',
    bottom: '#2a2a33', bottomDark: '#1c1c22', shoes: '#2a1c16', dress: true, blush: 0.3 },
};
