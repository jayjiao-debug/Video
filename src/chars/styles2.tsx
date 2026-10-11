import React from 'react';
import { Style, Part, Mat } from './Figure';
import { Layer, anchor, ship, mix, rng, ridge, Ctx } from './styles';
import { circle, capsule, P } from './rig';

/* Second batch of character looks on the same rig: two anime flavours, clay stop-motion, woodcut print. */
const W = 1920, H = 1080;
type Pal = Record<Mat, [string, string]>; // [base, shade]

/** hard-edged two-tone cel gradients, one per material */
const celDefs = (id: string, pal: Pal, lightFromRight = false) => (
  <>
    {(Object.keys(pal) as Mat[]).map((m) => (
      <linearGradient key={m} id={`${id}-${m}`} x1={lightFromRight ? 1 : 0} y1={0} x2={lightFromRight ? 0 : 1} y2={1}>
        <stop offset="0" stopColor={pal[m][0]} /><stop offset="0.56" stopColor={pal[m][0]} /><stop offset="0.56" stopColor={pal[m][1]} /><stop offset="1" stopColor={pal[m][1]} />
      </linearGradient>
    ))}
  </>
);
const celPart = (id: string, pal: Pal, line: string, lw: number) => (p: Part) => (
  <path key={p.k} d={p.d} transform={p.tf} fill={p.far ? pal[p.mat][1] : `url(#${id}-${p.mat})`} stroke={p.far ? mix(line, pal[p.mat][1], 0.35) : line} strokeWidth={lw} strokeLinejoin="round" />
);

/** anime head kit, 3/4 view facing +x (head-local coords) */
const animeHead = (o: { skin: [string, string]; hair: [string, string]; hat: [string, string]; iris: string; line: string; lw: number; eye: number; blush: string }) => (k: string) => {
  const L = { stroke: o.line, strokeWidth: o.lw, strokeLinejoin: 'round' as const };
  const e = o.eye;
  return (
    <g key={k}>
      <path d="M -24 -24 C -44 -4 -40 26 -26 46 L -18 33 L -12 48 L -5 34 L 3 42 C 0 22 2 0 4 -18 Z" fill={o.hair[1]} {...L} />
      <path d="M -22 -16 C -26 8 -18 32 2 42 C 14 46 26 36 30 20 C 33 8 33 -6 29 -18 Z" fill={o.skin[0]} {...L} />
      <path d="M -22 -16 C -24 4 -20 22 -10 34 C -2 20 -2 0 -6 -16 Z" fill={o.skin[1]} />
      {/* near eye */}
      <ellipse cx={17} cy={6} rx={6.2 * e} ry={8.6 * e} fill="#ffffff" />
      <ellipse cx={18.5} cy={7} rx={4.6 * e} ry={7 * e} fill={o.iris} />
      <ellipse cx={18.5} cy={9.5} rx={2.6 * e} ry={3.4 * e} fill={mix(o.iris, '#000000', 0.5)} />
      <circle cx={16.6} cy={3.4} r={2 * e} fill="#ffffff" /><circle cx={20.4} cy={11} r={0.9 * e} fill="#ffffff" />
      <path d={`M ${17 - 8 * e} ${6 - 8 * e} Q 17 ${4 - 12 * e} ${17 + 8 * e} ${7 - 9 * e}`} stroke={o.line} strokeWidth={o.lw * 1.5} fill="none" strokeLinecap="round" />
      {/* far eye, foreshortened at the contour */}
      <ellipse cx={30} cy={6} rx={2.2 * e} ry={7.6 * e} fill="#ffffff" />
      <ellipse cx={30.6} cy={7} rx={1.6 * e} ry={6 * e} fill={o.iris} />
      <path d={`M ${27.5} ${6 - 8 * e} Q 30 ${4 - 10 * e} 32 ${6 - 8 * e}`} stroke={o.line} strokeWidth={o.lw * 1.3} fill="none" strokeLinecap="round" />
      <path d="M 9 -8 L 22 -10" stroke={o.line} strokeWidth={o.lw} strokeLinecap="round" />
      <path d="M 31 13 L 34 17 L 31 18" stroke={o.line} strokeWidth={o.lw * 0.8} fill="none" strokeLinejoin="round" />
      <path d="M 20 28 Q 24 29 27 27" stroke={o.line} strokeWidth={o.lw * 0.9} fill="none" strokeLinecap="round" />
      {[0, 1, 2].map((i) => <path key={i} d={`M ${9 + i * 4} 19 l 2.4 -3.4`} stroke={o.blush} strokeWidth={1.6} strokeLinecap="round" />)}
      {/* side lock, beanie + bangs */}
      <path d="M -20 -14 C -24 6 -20 26 -12 38 L -7 22 L -2 34 C 1 14 -1 -2 -3 -14 Z" fill={o.hair[0]} {...L} />
      <path d="M -6 -16 L -1 12 L 4 -14 L 11 4 L 15 -14 L 24 -1 L 28 -16 Z" fill={o.hair[0]} {...L} />
      <path d="M -36 -14 C -38 -42 -14 -54 4 -52 C 24 -50 36 -38 33 -16 Z" fill={o.hat[0]} {...L} />
      <path d="M -36 -14 C -38 -42 -20 -52 -6 -52 C -16 -42 -18 -28 -14 -16 Z" fill={o.hat[1]} />
      <path d={capsule([-37, -15], [33, -17], 7.5, 7.5)} fill={o.hat[1]} {...L} />
      <circle cx={-10} cy={-56} r={9} fill={o.hat[0]} {...L} />
      <path d="M -36 6 C -40 20 -36 34 -28 42" stroke="#ffffff" strokeOpacity={0.6} strokeWidth={2.4} fill="none" strokeLinecap="round" />
    </g>
  );
};

/* ========================= E · 日系动画·晴空 bright anime ========================= */
const PE: Pal = { coat: ['#34477e', '#212c55'], trousers: ['#3d3d4c', '#272733'], boots: ['#5a3d2a', '#38241a'], skin: ['#ffe4d0', '#f2bea6'], hat: ['#f4efe4', '#cfc4b4'], scarf: ['#e8463c', '#b22e2c'], glove: ['#7d5038', '#56351f'] };
export const Anime: Style = {
  id: 'E', name: '日系动画 · 晴空', en: 'Anime, bright cel shading',
  part: celPart('an', PE, '#1d2140', 2.2),
  face: () => null,
  head: animeHead({ skin: PE.skin, hair: ['#4a3229', '#33221c'], hat: PE.hat, iris: '#3d5fb0', line: '#2a1c22', lw: 2.2, eye: 1.22, blush: '#f08a8a' }),
  defs: celDefs('an', PE),
};
const cloud = (cx: number, cy: number, s: number, k: string, shade: string, lit: string) => {
  const bubbles: [number, number, number][] = [[-120, 0, 70], [-50, -40, 90], [40, -60, 110], [130, -20, 85], [200, 10, 60], [-180, 20, 50], [60, 10, 90]];
  return (
    <g key={k} transform={`translate(${cx} ${cy}) scale(${s})`}>
      {bubbles.map(([x, y, r], i) => <circle key={'s' + i} cx={x} cy={y} r={r} fill={shade} />)}
      {bubbles.map(([x, y, r], i) => <circle key={'l' + i} cx={x - r * 0.12} cy={y - r * 0.16} r={r * 0.9} fill={lit} />)}
    </g>
  );
};
export const AnimeBG: React.FC<{ c: Ctx; fg?: boolean }> = ({ c, fg }) => {
  const { cam, camEnd, t } = c;
  if (fg) {
    const sun: P = [1560, 170], ctr: P = [W / 2, H / 2];
    return (
      <g style={{ mixBlendMode: 'screen' }}>
        {[[0.35, 26, 0.22], [0.55, 14, 0.3], [0.8, 46, 0.12], [1.25, 70, 0.1], [1.45, 20, 0.22]].map(([k, r, a], i) => {
          const x = sun[0] + (ctr[0] - sun[0]) * k, y = sun[1] + (ctr[1] - sun[1]) * k;
          const hex = Array.from({ length: 6 }, (_, j) => `${x + r * Math.cos((j * Math.PI) / 3)},${y + r * Math.sin((j * Math.PI) / 3)}`).join(' ');
          return <polygon key={i} points={hex} fill={i % 2 ? '#bfe8ff' : '#fff2c8'} opacity={a} />;
        })}
      </g>
    );
  }
  const sp = anchor(camEnd, 0.3, 1430, 650), sh = ship(0.85), r = rng(41);
  return (
    <>
      <defs>
        <linearGradient id="an-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1557c9" /><stop offset="0.45" stopColor="#4aa3ef" /><stop offset="0.68" stopColor="#bfe7ff" /></linearGradient>
        <radialGradient id="an-sun"><stop offset="0" stopColor="#ffffff" /><stop offset="0.12" stopColor="#ffffff" stopOpacity={0.9} /><stop offset="0.4" stopColor="#fff6d8" stopOpacity={0.35} /><stop offset="1" stopColor="#ffffff" stopOpacity={0} /></radialGradient>
      </defs>
      <rect width={W} height={H} fill="url(#an-sky)" />
      <Layer cam={cam} d={0.04}>
        {cloud(-500 + t * 6, anchor(camEnd, 0.04, 0, 330)[1], 1.6, 'c1', '#b8d4f2', '#ffffff')}
        {cloud(400 + t * 6, anchor(camEnd, 0.04, 0, 470)[1], 1.1, 'c2', '#b8d4f2', '#ffffff')}
        {cloud(1250 + t * 6, anchor(camEnd, 0.04, 0, 400)[1], 1.35, 'c3', '#b8d4f2', '#ffffff')}
      </Layer>
      <circle cx={1560} cy={170} r={360} fill="url(#an-sun)" />
      <Layer cam={cam} d={0.12}>
        <path d={ridge(51, -3000, 4000, 360, anchor(camEnd, 0.12, 0, 690)[1], 260)} fill="#9db9e2" />
        <path d={ridge(51, -3000, 4000, 360, anchor(camEnd, 0.12, 0, 690)[1] - 14, 230)} fill="#f3f8ff" />
      </Layer>
      <Layer cam={cam} d={0.3}>
        <g transform={`translate(${sp[0]} ${sp[1]}) rotate(-6)`}>
          <path d={sh.hull} fill="#3b3a52" stroke="#1d2140" strokeWidth={2} />
          {sh.spars.map((d, i) => <path key={i} d={d} fill="#3b3a52" />)}
        </g>
        <path d={ridge(53, -3000, 4000, 170, sp[1] + 6, 26)} fill="#e9f2ff" stroke="#9db9e2" strokeWidth={2} />
      </Layer>
      <Layer cam={cam} d={1}>
        <path d="M-3000 0 Q-1500 -16 0 -3 Q1500 10 3000 -5 Q4500 -14 7000 0 L7000 3000 L-3000 3000 Z" fill="#f7fbff" />
        {Array.from({ length: 12 }, (_, i) => { const x = -2400 + i * 760 + r() * 200; return <path key={i} d={`M${x} ${40 + r() * 200} q 200 -30 420 0 q -200 26 -420 0 Z`} fill="#d3e3f7" />; })}
        {c.prints.filter((p) => p.t <= t).map((p, i) => <ellipse key={'fp' + i} cx={p.x + 20} cy={5 + (i % 2) * 6} rx={22} ry={5} fill="#b9cdea" />)}
        {Array.from({ length: 40 }, (_, i) => { const x = -2400 + i * 230 + r() * 150, y = 20 + r() * 380, ph = r() * 6, a = Math.max(0, Math.sin(t * 3 + ph)); const s = 4 + 7 * a; return <path key={'sp' + i} d={`M${x} ${y - s} L${x + s * 0.22} ${y} L${x} ${y + s} L${x - s * 0.22} ${y} Z M${x - s} ${y} L${x} ${y + s * 0.22} L${x + s} ${y} L${x} ${y - s * 0.22} Z`} fill="#ffffff" opacity={a} />; })}
      </Layer>
    </>
  );
};

/* ========================= F · 90年代赛璐璐 retro cel at dusk ========================= */
const PF: Pal = { coat: ['#8c4a3c', '#5a2c2c'], trousers: ['#4a4f63', '#30324a'], boots: ['#3d2f2a', '#251b1a'], skin: ['#f4cbab', '#cf9484'], hat: ['#6d8476', '#465a55'], scarf: ['#dcb65c', '#a37f3c'], glove: ['#5a4a3a', '#3a2e2a'] };
export const Retro: Style = {
  id: 'F', name: '90年代赛璐璐', en: 'Retro 90s cel animation at dusk',
  part: celPart('rt', PF, '#2a1e2c', 2.8),
  face: () => null,
  head: animeHead({ skin: PF.skin, hair: ['#2e2430', '#1d161f'], hat: PF.hat, iris: '#4a3a3a', line: '#2a1e2c', lw: 2.6, eye: 0.95, blush: '#d9877a' }),
  defs: celDefs('rt', PF, true),
};
export const RetroBG: React.FC<{ c: Ctx; fg?: boolean }> = ({ c, fg }) => {
  const { cam, camEnd, t } = c;
  if (fg) return (
    <>
      <rect width={W} height={H} fill="url(#rt-halo)" style={{ mixBlendMode: 'screen' }} />
      <rect width={W} height={H} fill="url(#rt-vig)" />
    </>
  );
  const sp = anchor(camEnd, 0.3, 1380, 660), sh = ship(0.85);
  return (
    <>
      <defs>
        <linearGradient id="rt-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#241f40" /><stop offset="0.35" stopColor="#5a3f68" /><stop offset="0.55" stopColor="#c46e62" /><stop offset="0.66" stopColor="#f1a868" /><stop offset="0.72" stopColor="#f8d290" /></linearGradient>
        <radialGradient id="rt-halo" cx="0.78" cy="0.6" r="0.5"><stop offset="0" stopColor="#ffb070" stopOpacity={0.45} /><stop offset="1" stopColor="#ff8050" stopOpacity={0} /></radialGradient>
        <radialGradient id="rt-vig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.6" stopColor="#100818" stopOpacity={0} /><stop offset="1" stopColor="#100818" stopOpacity={0.55} /></radialGradient>
        <filter id="rt-soft"><feGaussianBlur stdDeviation={6} /></filter>
        <linearGradient id="rt-snow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#b9879a" /><stop offset="0.25" stopColor="#d9a9a8" /><stop offset="1" stopColor="#6e5a7c" /></linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#rt-sky)" />
      <Layer cam={cam} d={0.03}>
        <g filter="url(#rt-soft)">
          {[[-300, 250, 900, '#7a4f78'], [500, 320, 1100, '#c97a72'], [-100, 420, 700, '#e7956a'], [900, 200, 800, '#5e4572']].map(([x, y, w, col], i) => (
            <path key={i} d={`M${(x as number) + t * 5} ${anchor(camEnd, 0.03, 0, y as number)[1]} q ${(w as number) / 2} -30 ${w} 0 q -${(w as number) / 2} 22 -${w} 0 Z`} fill={col as string} opacity={0.8} />
          ))}
        </g>
      </Layer>
      <circle cx={1500} cy={650} r={70} fill="#ffe2a8" />
      <Layer cam={cam} d={0.12}><path d={ridge(61, -3000, 4000, 380, anchor(camEnd, 0.12, 0, 700)[1], 240)} fill="#4a3557" /></Layer>
      <Layer cam={cam} d={0.3}>
        <g transform={`translate(${sp[0]} ${sp[1]}) rotate(-6)`}>
          <path d={sh.hull} fill="#2c2238" />{sh.spars.map((d, i) => <path key={i} d={d} fill="#2c2238" />)}
          {[-110, -60, 40].map((x) => <rect key={x} x={x} y={-30} width={8} height={6} fill="#ffd27a" />)}
        </g>
        <path d={ridge(63, -3000, 4000, 170, sp[1] + 6, 24)} fill="#6c4f6e" />
      </Layer>
      <Layer cam={cam} d={0.55}><path d={ridge(65, -3000, 5000, 420, anchor(camEnd, 0.55, 0, 850)[1], 90)} fill="#8a6380" /></Layer>
      <Layer cam={cam} d={1}>
        <path d="M-3000 0 Q-1500 -16 0 -3 Q1500 10 3000 -5 Q4500 -14 7000 0 L7000 3000 L-3000 3000 Z" fill="url(#rt-snow)" />
        <path d="M-3000 0 Q-1500 -16 0 -3 Q1500 10 3000 -5 Q4500 -14 7000 0" stroke="#ffcf9a" strokeWidth={3} fill="none" opacity={0.7} />
        {c.prints.filter((p) => p.t <= t).map((p, i) => <ellipse key={'fp' + i} cx={p.x + 20} cy={5 + (i % 2) * 6} rx={22} ry={5} fill="#8a6380" opacity={0.7} />)}
      </Layer>
    </>
  );
};

/* ========================= G · 黏土定格 clay stop-motion miniature ========================= */
const PG: Record<Mat, string> = { coat: '#e0663a', trousers: '#4f6fa8', boots: '#5a3a2a', skin: '#f3c19c', hat: '#f2cf48', scarf: '#56ad86', glove: '#8a5a3c' };
export const Clay: Style = {
  id: 'G', name: '黏土定格', en: 'Clay stop-motion miniature',
  thick: 1.32,
  part: (p) => <path key={p.k} d={p.d} transform={p.tf} fill={`url(#cl-${p.mat}${p.far ? 'F' : ''})`} />,
  face: (k) => (
    <g key={k}>
      <circle cx={13} cy={-3} r={8} fill="#fbf7ef" /><circle cx={16} cy={-2} r={3.6} fill="#1d1a1a" /><circle cx={14.8} cy={-3.4} r={1.1} fill="#ffffff" />
      <path d={capsule([5, -15], [21, -14], 2.6, 2.4)} fill="#6a4630" />
      <path d="M 14 16 Q 22 22 29 16" stroke="#9a4a3a" strokeWidth={2.6} fill="none" strokeLinecap="round" />
      <circle cx={6} cy={10} r={6} fill="#ee8a72" opacity={0.5} />
    </g>
  ),
  filter: 'url(#cl-tex)',
  defs: (
    <>
      {(Object.keys(PG) as Mat[]).flatMap((m) => [false, true].map((far) => (
        <radialGradient key={m + far} id={`cl-${m}${far ? 'F' : ''}`} cx="0.35" cy="0.3" r="0.85">
          <stop offset="0" stopColor={mix(PG[m], '#ffffff', far ? 0.05 : 0.3)} /><stop offset="0.5" stopColor={mix(PG[m], '#1a1020', far ? 0.25 : 0)} /><stop offset="1" stopColor={mix(PG[m], '#1a1020', far ? 0.5 : 0.35)} />
        </radialGradient>
      )))}
      <filter id="cl-tex" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves={3} seed={5} result="n" />
        <feDiffuseLighting in="n" surfaceScale={1.4} lightingColor="#ffffff" result="l"><feDistantLight azimuth={225} elevation={58} /></feDiffuseLighting>
        <feComponentTransfer in="l" result="l2"><feFuncR type="linear" slope={1.25} /><feFuncG type="linear" slope={1.25} /><feFuncB type="linear" slope={1.25} /></feComponentTransfer>
        <feComposite in="l2" in2="SourceGraphic" operator="arithmetic" k1={1} k2={0} k3={0} k4={0} result="m" />
        <feComposite in="m" in2="SourceGraphic" operator="in" />
      </filter>
    </>
  ),
};
export const ClayBG: React.FC<{ c: Ctx; fg?: boolean }> = ({ c, fg }) => {
  const { cam, camEnd, t } = c;
  const blob = (seed: number, x0: number, x1: number, y: number, h: number, step: number) => {
    const r = rng(seed); let d = `M${x0} 3000 L${x0} ${y}`;
    for (let x = x0; x < x1; x += step) d += ` Q${x + step * 0.5} ${y - h * (0.6 + r() * 0.6)} ${x + step} ${y - h * 0.15 * r()}`;
    return d + ` L${x1} 3000 Z`;
  };
  if (fg) return (
    <Layer cam={cam} d={1.6}><g filter="url(#cl-dof8)">{[-800, 1100, 2500, 3600].map((x, i) => <ellipse key={i} cx={x} cy={620} rx={260} ry={150} fill={i % 2 ? '#f4f1ea' : '#e6e1d8'} />)}</g></Layer>
  );
  const sp = anchor(camEnd, 0.35, 1430, 680), sh = ship(0.8);
  return (
    <>
      <defs>
        <linearGradient id="cl-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7fb3d9" /><stop offset="0.7" stopColor="#d6e9f2" /></linearGradient>
        <radialGradient id="cl-vig" cx="0.5" cy="0.45" r="0.85"><stop offset="0.65" stopColor="#1a1020" stopOpacity={0} /><stop offset="1" stopColor="#1a1020" stopOpacity={0.3} /></radialGradient>
        <filter id="cl-dof3"><feGaussianBlur stdDeviation={3} /></filter>
        <filter id="cl-dof6"><feGaussianBlur stdDeviation={6} /></filter>
        <filter id="cl-dof8"><feGaussianBlur stdDeviation={10} /></filter>
        <radialGradient id="cl-snowball" cx="0.4" cy="0.3" r="0.8"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#c9cfd9" /></radialGradient>
      </defs>
      <rect width={W} height={H} fill="url(#cl-sky)" />
      <g filter="url(#cl-dof6)">
        {[[300, 250, 1], [1100, 180, 1.3], [1650, 300, 0.9]].map(([x, y, s], i) => (
          <g key={i} transform={`translate(${x + Math.floor(t * 12) * 0.4} ${y}) scale(${s})`}>{[[-70, 10, 50], [-10, -20, 70], [60, 0, 55], [110, 20, 35]].map(([a, b, r], j) => <circle key={j} cx={a} cy={b} r={r} fill="url(#cl-snowball)" />)}</g>
        ))}
      </g>
      <Layer cam={cam} d={0.15}><g filter="url(#cl-dof6)"><path d={blob(71, -3000, 4000, anchor(camEnd, 0.15, 0, 700)[1], 260, 320)} fill="#a9bfd6" /></g></Layer>
      <Layer cam={cam} d={0.35}>
        <g filter="url(#cl-dof3)">
          <g transform={`translate(${sp[0]} ${sp[1]}) rotate(-6)`} filter="url(#cl-tex)">
            <path d={sh.hull} fill="#7a4a32" />{sh.spars.map((d, i) => <path key={i} d={d} fill="#6a4030" />)}
          </g>
          <path d={blob(73, -3000, 4000, sp[1] + 10, 40, 200)} fill="#e9ecef" />
        </g>
      </Layer>
      <Layer cam={cam} d={1}>
        <g filter="url(#cl-tex)"><path d={blob(75, -3000, 7000, 6, 10, 400)} fill="#f2f1ec" /></g>
        {c.prints.filter((p) => p.t <= t).map((p, i) => <ellipse key={'fp' + i} cx={p.x + 22} cy={5 + (i % 2) * 6} rx={24} ry={6} fill="#cfcbc2" />)}
      </Layer>
      <rect width={W} height={H} fill="url(#cl-vig)" />
    </>
  );
};

/* ========================= H · 木刻版画 woodcut print ========================= */
const INK = '#1b1714', RED = '#b8382c', PAPER = '#efe6d2';
export const Woodcut: Style = {
  id: 'H', name: '木刻版画', en: 'Woodcut print, black and one red',
  part: (p) => {
    const red = p.mat === 'scarf' || p.mat === 'hat';
    if (p.mat === 'skin') return <path key={p.k} d={p.d} transform={p.tf} fill={PAPER} stroke={INK} strokeWidth={3.2} />;
    if (red) return <g key={p.k} transform="translate(2.5 1.5)"><path d={p.d} transform={p.tf} fill={RED} style={{ mixBlendMode: 'multiply' }} /></g>;
    return (
      <g key={p.k}>
        <path d={p.d} transform={p.tf} fill={INK} />
        {(p.mat === 'coat' || p.mat === 'trousers') && !p.far && <path d={p.d} transform={p.tf} fill="url(#wc-hatch)" />}
        {p.far && <path d={p.d} transform={p.tf} fill="url(#wc-hatch2)" />}
      </g>
    );
  },
  face: (k) => <g key={k}><path d="M 10 -2 L 21 -3" stroke={INK} strokeWidth={3.4} strokeLinecap="round" /><path d="M 6 12 l 4 5 M 12 12 l 4 5" stroke={INK} strokeWidth={1.6} /></g>,
  filter: 'url(#wc-rough)',
  defs: (
    <>
      <pattern id="wc-hatch" width={9} height={9} patternUnits="userSpaceOnUse" patternTransform="rotate(-28)"><path d="M0 4.5 L5.5 4.5" stroke={PAPER} strokeWidth={1.6} strokeLinecap="round" /></pattern>
      <pattern id="wc-hatch2" width={6} height={6} patternUnits="userSpaceOnUse" patternTransform="rotate(-28)"><path d="M0 3 L6 3" stroke={PAPER} strokeWidth={1.4} /></pattern>
      <filter id="wc-rough" x="-15%" y="-15%" width="130%" height="130%">
        <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves={2} seed={8} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={3.5} xChannelSelector="R" yChannelSelector="G" result="d" />
        <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves={2} seed={12} result="s" />
        <feColorMatrix in="s" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -12 9.6" result="sm" />
        <feComposite in="d" in2="sm" operator="in" />
      </filter>
    </>
  ),
};
export const WoodcutBG: React.FC<{ c: Ctx; fg?: boolean }> = ({ c, fg }) => {
  const { cam, camEnd, t } = c;
  if (fg) return (
    <>
      <rect x={18} y={18} width={W - 36} height={H - 36} fill="none" stroke={INK} strokeWidth={14} filter="url(#wc-rough)" />
      <rect width={W} height={H} filter="url(#wc-paper)" opacity={0.6} style={{ mixBlendMode: 'multiply' }} />
    </>
  );
  const sp = anchor(camEnd, 0.3, 1430, 660), sh = ship(0.85), r = rng(81);
  const my = anchor(camEnd, 0.14, 0, 690)[1], md = ridge(83, -3000, 4000, 360, my, 250);
  return (
    <>
      <defs><filter id="wc-paper"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={3} seed={3} /><feColorMatrix values="0 0 0 0 0.6  0 0 0 0 0.52  0 0 0 0 0.4  0 0 0 0.25 0" /></filter></defs>
      <rect width={W} height={H} fill={PAPER} />
      <g filter="url(#wc-rough)">
        {Array.from({ length: 14 }, (_, i) => { const y = 250 + i * 24, w = 0.6 + (14 - i) * 0.12; return <path key={i} d={`M${-20 + r() * 80} ${y} ${Array.from({ length: 8 }, (_, j) => `L${j * 280 + r() * 100} ${y + (r() - 0.5) * 6}`).join(' ')}`} stroke={INK} strokeWidth={w * 2.2} strokeDasharray={`${120 + r() * 200} ${20 + r() * 60}`} fill="none" opacity={1} />; })}
        <g transform="translate(1520 260)" style={{ mixBlendMode: 'multiply' }}>
          <circle r={92} fill={RED} />
          {Array.from({ length: 18 }, (_, i) => { const a = (i / 18) * Math.PI * 2; return <path key={i} d={`M${Math.cos(a) * 110} ${Math.sin(a) * 110} L${Math.cos(a) * 150} ${Math.sin(a) * 150}`} stroke={RED} strokeWidth={6} strokeLinecap="round" />; })}
        </g>
      </g>
      <Layer cam={cam} d={0.14}>
        <g filter="url(#wc-rough)">
          <path d={md} fill={INK} />
          {[14, 30, 48].map((dy) => <path key={dy} d={md} transform={`translate(0 ${dy})`} fill="none" stroke={PAPER} strokeWidth={2.4} strokeDasharray="40 14" />)}
        </g>
      </Layer>
      <Layer cam={cam} d={0.3}>
        <path d={`M-3000 ${sp[1] - 4} L5000 ${sp[1] - 4} L5000 3000 L-3000 3000 Z`} fill={PAPER} />
        <g filter="url(#wc-rough)">
          <g transform={`translate(${sp[0]} ${sp[1]}) rotate(-6)`}><path d={sh.hull} fill={INK} />{sh.spars.map((d, i) => <path key={i} d={d} fill={INK} />)}</g>
          {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M${-2000 + i * 200} ${sp[1] + 18 + (i % 3) * 12} l ${80 + (i % 4) * 20} 0`} stroke={INK} strokeWidth={3} strokeLinecap="round" />)}
        </g>
      </Layer>
      <Layer cam={cam} d={1}>
        <path d="M-3000 0 Q-1500 -16 0 -3 Q1500 10 3000 -5 Q4500 -14 7000 0 L7000 3000 L-3000 3000 Z" fill={PAPER} />
        <g filter="url(#wc-rough)">
          <path d="M-3000 0 Q-1500 -16 0 -3 Q1500 10 3000 -5 Q4500 -14 7000 0" stroke={INK} strokeWidth={5} fill="none" />
          {Array.from({ length: 50 }, (_, i) => { const x = -2500 + i * 180 + (i * 37) % 90, y = 40 + ((i * 53) % 300); return <path key={i} d={`M${x} ${y} q 40 -6 ${70 + (i % 5) * 16} 0`} stroke={INK} strokeWidth={3.4} fill="none" strokeLinecap="round" />; })}
          {c.prints.filter((p) => p.t <= t).map((p, i) => <path key={'fp' + i} d={`M${p.x} ${6 + (i % 2) * 5} l 40 0`} stroke={INK} strokeWidth={5} strokeLinecap="round" />)}
        </g>
      </Layer>
    </>
  );
};

export const WORLDS2 = [
  { st: Anime, BG: AnimeBG, cam0: { z: 0.92, cy: -250 }, cam1: { z: 1.7, cy: -430 }, shadow: '#7f9fd0', so: 0.55 },
  { st: Retro, BG: RetroBG, cam0: { z: 0.92, cy: -250 }, cam1: { z: 1.7, cy: -430 }, shadow: '#3a2240', so: 0.45, weave: true },
  { st: Clay, BG: ClayBG, cam0: { z: 0.95, cy: -260 }, cam1: { z: 1.6, cy: -420 }, shadow: '#3a3040', so: 0.3, hold: 12 },
  { st: Woodcut, BG: WoodcutBG, cam0: { z: 0.92, cy: -250 }, cam1: { z: 1.6, cy: -420 }, shadow: '', so: 0 },
];
