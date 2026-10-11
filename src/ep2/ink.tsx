import React from 'react';

/** Hand-drawn "ink on cream" primitives that match the Open Peeps characters. */
export const INK = '#1b1714';
export const CREAM = '#efe6d0';
export const CREAM2 = '#ddd1b3'; // shaded cream

/** static wobble filter — gives straight SVG lines a hand-drawn waver (seeded, never changes → no shimmer) */
export const Wobble: React.FC<{ id: string; scale?: number; freq?: number; seed?: number }> = ({ id, scale = 3.2, freq = 0.035, seed = 7 }) => (
  <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
    <feTurbulence type="fractalNoise" baseFrequency={freq} numOctaves={2} seed={seed} result="n" />
    <feDisplacementMap in="SourceGraphic" in2="n" scale={scale} xChannelSelector="R" yChannelSelector="G" />
  </filter>
);

/** a cream bar with an ink outline (double stroke) */
const Bar: React.FC<{ x1: number; y1: number; x2: number; y2: number; w?: number }> = ({ x1, y1, x2, y2, w = 9 }) => (
  <>
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={INK} strokeWidth={w + 8} strokeLinecap="round" />
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={CREAM} strokeWidth={w} strokeLinecap="round" />
  </>
);

const hatch = (x0: number, y0: number, n: number, dx: number, len: number, ang = 0.9) =>
  Array.from({ length: n }, (_, i) => {
    const x = x0 + i * dx, y = y0 + (i % 2) * 3;
    return <line key={i} x1={x} y1={y} x2={x + Math.cos(ang) * len} y2={y + Math.sin(ang) * len} stroke={INK} strokeWidth={3} strokeLinecap="round" />;
  });

/**
 * Green-Bank style radio telescope. Origin = bottom-centre of the pedestal.
 * `children` are drawn inside the dish frame at the feed (0,-250) (e.g. signal arcs).
 */
export const Telescope: React.FC<{ tilt?: number; children?: React.ReactNode }> = ({ tilt = -28, children }) => {
  const SW = 5;
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      {/* pedestal */}
      <path d="M -78 0 L 78 0 L 60 -150 L -60 -150 Z" fill={CREAM} stroke={INK} strokeWidth={SW} />
      {hatch(28, -128, 5, 9, 26, 1.9)}
      <path d="M -16 0 L -16 -48 Q 0 -60 16 -48 L 16 0" fill={INK} />
      <rect x={-104} y={-170} width={208} height={22} rx={6} fill={CREAM} stroke={INK} strokeWidth={SW} />
      {/* yoke arms */}
      <path d="M -100 -170 L -62 -170 L -70 -318 L -96 -318 Z" fill={CREAM} stroke={INK} strokeWidth={SW} />
      <path d="M 100 -170 L 62 -170 L 70 -318 L 96 -318 Z" fill={CREAM} stroke={INK} strokeWidth={SW} />
      <line x1={-90} y1={-180} x2={-72} y2={-240} stroke={INK} strokeWidth={3} />
      <line x1={-72} y1={-240} x2={-92} y2={-300} stroke={INK} strokeWidth={3} />
      <line x1={90} y1={-180} x2={72} y2={-240} stroke={INK} strokeWidth={3} />
      <line x1={72} y1={-240} x2={92} y2={-300} stroke={INK} strokeWidth={3} />
      {/* axis bearings */}
      <circle cx={-83} cy={-318} r={15} fill={CREAM} stroke={INK} strokeWidth={SW} />
      <circle cx={-83} cy={-318} r={4} fill={INK} />
      <circle cx={83} cy={-318} r={15} fill={CREAM} stroke={INK} strokeWidth={SW} />
      <circle cx={83} cy={-318} r={4} fill={INK} />
      {/* dish, pivoting on the elevation axis */}
      <g transform={`translate(0 -318) rotate(${tilt})`}>
        {/* back of the bowl */}
        <path d="M -250 -40 Q -210 70 0 92 Q 210 70 250 -40 Z" fill={CREAM2} stroke={INK} strokeWidth={SW} />
        {hatch(-170, 30, 9, 30, 22, 2.2)}
        {/* inside surface */}
        <ellipse cx={0} cy={-40} rx={250} ry={78} fill={CREAM} stroke={INK} strokeWidth={SW + 1} />
        <ellipse cx={0} cy={-36} rx={168} ry={52} fill="none" stroke={INK} strokeWidth={2.5} />
        <ellipse cx={0} cy={-33} rx={86} ry={27} fill="none" stroke={INK} strokeWidth={2.5} />
        {[0.35, 1.0, 1.75, 2.45, 3.3, 4.1, 4.9, 5.6].map((a, i) => (
          <line key={i} x1={Math.cos(a) * 20} y1={-31 + Math.sin(a) * 6} x2={Math.cos(a) * 246} y2={-40 + Math.sin(a) * 76} stroke={INK} strokeWidth={2.2} />
        ))}
        {/* shading on the far inside wall */}
        {hatch(-150, -100, 8, 26, 16, 1.2)}
        {/* feed legs + receiver */}
        <Bar x1={-190} y1={-8} x2={-6} y2={-236} w={8} />
        <Bar x1={190} y1={-8} x2={6} y2={-236} w={8} />
        <Bar x1={0} y1={30} x2={0} y2={-236} w={8} />
        <rect x={-20} y={-270} width={40} height={42} rx={5} fill={CREAM} stroke={INK} strokeWidth={SW} />
        <line x1={-20} y1={-252} x2={20} y2={-252} stroke={INK} strokeWidth={3} />
        {children}
      </g>
    </g>
  );
};

/** little flying saucer, centred on 0,0 */
export const Ufo: React.FC = () => (
  <g strokeLinejoin="round" strokeLinecap="round">
    <path d="M -46 -6 Q -44 -54 0 -56 Q 44 -54 46 -6 Z" fill="#cfe0de" stroke={INK} strokeWidth={5} />
    <path d="M -22 -40 Q -12 -48 0 -48" fill="none" stroke={INK} strokeWidth={3} />
    <ellipse cx={0} cy={0} rx={112} ry={30} fill={CREAM} stroke={INK} strokeWidth={5} />
    <path d="M -86 10 Q 0 34 86 10" fill="none" stroke={INK} strokeWidth={3} />
    {[-66, -22, 22, 66].map((x) => <circle key={x} cx={x} cy={4} r={7} fill="#e2b85c" stroke={INK} strokeWidth={3} />)}
    <path d="M -40 34 L -64 110 M 40 34 L 64 110" stroke="#e2b85c" strokeWidth={4} strokeDasharray="2 12" />
  </g>
);

/** hand-drawn heart, centred on 0,0, ~ size 100 */
export const Heart: React.FC<{ fill?: string }> = ({ fill = '#c4574a' }) => (
  <g strokeLinejoin="round" strokeLinecap="round">
    <path d="M 0 44 C -34 20 -52 2 -48 -20 C -44 -42 -14 -46 0 -22 C 14 -46 44 -42 48 -20 C 52 2 34 20 0 44 Z" fill={fill} stroke={INK} strokeWidth={5} />
    <path d="M -30 -22 Q -28 -32 -18 -34" fill="none" stroke={CREAM} strokeWidth={4} />
  </g>
);

/** tiny 4-point sparkle */
export const Sparkle: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} d="M 0 -14 Q 2 -2 14 0 Q 2 2 0 14 Q -2 2 -14 0 Q -2 -2 0 -14 Z" fill={INK} />
);

/** hand-drawn coffee mug, origin = bottom-centre */
export const Mug: React.FC = () => (
  <g strokeLinejoin="round" strokeLinecap="round">
    <path d="M 40 -60 Q 74 -60 74 -38 Q 74 -16 40 -20" fill="none" stroke={INK} strokeWidth={15} />
    <path d="M 40 -60 Q 74 -60 74 -38 Q 74 -16 40 -20" fill="none" stroke={CREAM} strokeWidth={6} />
    <path d="M -44 -80 L 44 -80 L 40 -6 Q 0 3 -40 -6 Z" fill={CREAM} />
    <path d="M -43 -52 L 43 -52" stroke="#b8483b" strokeWidth={11} />
    <path d="M -44 -80 L 44 -80 L 40 -6 Q 0 3 -40 -6 Z" fill="none" stroke={INK} strokeWidth={5} />
    <ellipse cx={0} cy={-80} rx={44} ry={9} fill="#4a2c1c" stroke={INK} strokeWidth={5} />
    <path d="M 22 -40 L 22 -20" stroke={INK} strokeWidth={3} />
  </g>
);

/** three rising steam wisps above (0,0); smooth, continuous, loops every `period` s */
export const Steam: React.FC<{ t: number; period?: number }> = ({ t, period = 2.2 }) => (
  <g fill="none" strokeLinecap="round">
    {[-18, 2, 20].map((x0, k) => {
      const p = (((t / period + k / 3) % 1) + 1) % 1;
      const y0 = -p * 70;
      const a = Math.sin(Math.PI * p) * 0.75;
      let d = '';
      for (let j = 0; j <= 12; j++) {
        const y = y0 - j * 7;
        const x = x0 + Math.sin(j * 0.7 + t * 2.2 + k * 2) * (4 + j * 0.8);
        d += `${j ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)} `;
      }
      return <path key={k} d={d} stroke={CREAM} strokeWidth={5} opacity={a} />;
    })}
  </g>
);
