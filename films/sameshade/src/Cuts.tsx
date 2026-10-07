import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import { JUNO } from './brand/identity';

/* Candidate interactive illusions for the quiet section of 《大脑的懒惰》, as key frames (frame index = cut).
   All code-drawn. Each one is something the viewer experiences on their own phone, and each ends with an
   eyedropper proof, like the board and the spheres. */
const GOLD = '#f1c56d', INK = '#f3ede2', DIM = 'rgba(243,237,226,0.55)', RED = '#ff5a48';
const SANS = '"Noto Sans CJK SC", sans-serif', MONO = '"JunoMono", monospace';

const useFonts = () => {
  const [h] = useState(() => delayRender('fonts', { timeoutInMilliseconds: 60000 }));
  useEffect(() => {
    Promise.all(['700 40px "Noto Sans CJK SC"', '900 40px "Noto Sans CJK SC"', '700 40px "JunoMono"'].map((f) => document.fonts.load(f, '测试0123')))
      .then(() => continueRender(h), () => continueRender(h));
  }, [h]);
};
const Sub: React.FC<{ s: string }> = ({ s }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, top: 972, textAlign: 'center' }}>
    <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 68, color: INK, letterSpacing: '0.03em', lineHeight: 1.25, textShadow: '0 0 3px #000, 0 0 3px #000, 0 2px 14px rgba(0,0,0,0.95)' }}>
      {s.split(/(\[[^\]]+\]|\{[^}]+\})/).filter(Boolean).map((seg, i) => seg.startsWith('[') ? <span key={i} style={{ color: GOLD, fontWeight: 900 }}>{seg.slice(1, -1)}</span>
        : seg.startsWith('{') ? <span key={i} style={{ color: RED, fontWeight: 900 }}>{seg.slice(1, -1)}</span> : <span key={i}>{seg}</span>)}
    </span>
  </div>
);
const Picker: React.FC<{ rows: [string, [number, number, number]][]; foot?: string }> = ({ rows, foot }) => (
  <div style={{ position: 'absolute', right: 70, top: 160, width: 450, padding: '16px 24px 18px', borderRadius: 16, background: 'rgba(10,10,12,0.88)', border: '1px solid rgba(243,237,226,0.2)', fontFamily: MONO, color: INK }}>
    <div style={{ fontSize: 22, letterSpacing: '0.25em', color: DIM, marginBottom: 10, fontFamily: SANS, fontWeight: 700 }}>取色器 · RGB</div>
    {rows.map(([k, v], i) => (
      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 33, fontWeight: 700, marginTop: i ? 10 : 0 }}>
        <span style={{ width: 42, height: 42, borderRadius: 7, background: `rgb(${v.join(',')})`, border: '1px solid rgba(255,255,255,0.35)' }} />
        <span style={{ minWidth: 70, fontFamily: SANS, fontWeight: 900, fontSize: 30, flexGrow: 1, whiteSpace: 'nowrap' }}>{k}</span>
        <span style={{ whiteSpace: 'pre' }}>{v.map((x) => String(x).padStart(3, ' ')).join(' ')}</span>
      </div>
    ))}
    {foot && <div style={{ marginTop: 10, fontSize: 24, fontFamily: SANS, fontWeight: 700, color: DIM }}>{foot}</div>}
  </div>
);
const Tag: React.FC<{ n: string; t: string }> = ({ n, t }) => (
  <div style={{ position: 'absolute', left: 70, top: 160, fontFamily: SANS, fontWeight: 700, fontSize: 24, color: DIM, padding: '8px 14px', background: 'rgba(0,0,0,0.55)', borderRadius: 8 }}>{n} · {t}</div>
);
const Chrome: React.FC<{ children: React.ReactNode; bg?: string; sub?: string }> = ({ children, bg = '#0b0b0b', sub }) => (
  <AbsoluteFill style={{ background: bg }}>
    <style>{`@font-face { font-family: "JunoMono"; src: url(${staticFile('fonts/DejaVuSansMono-Bold.ttf')}) format("truetype"); font-weight: 700; }`}</style>
    {children}
    <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 128, background: '#000' }} />
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 128, background: '#000' }} />
    {sub && <Sub s={sub} />}
    <div style={{ position: 'absolute', top: 50, right: 60, opacity: 0.6, fontFamily: SANS, fontWeight: 500, fontSize: 20, letterSpacing: '0.3em', color: 'rgba(243,237,226,0.58)' }}><span style={{ color: GOLD }}>◆ </span>{JUNO.mark}</div>
  </AbsoluteFill>
);
const Cross: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <g stroke="#000" strokeWidth={6} opacity={0.6}><line x1={x - 34} y1={y} x2={x - 10} y2={y} /><line x1={x + 10} y1={y} x2={x + 34} y2={y} /><line x1={x} y1={y - 34} x2={x} y2={y - 10} /><line x1={x} y1={y + 10} x2={x} y2={y + 34} /></g>
    <g stroke="#fff" strokeWidth={2.5}><line x1={x - 34} y1={y} x2={x - 10} y2={y} /><line x1={x + 10} y1={y} x2={x + 34} y2={y} /><line x1={x} y1={y - 34} x2={x} y2={y - 10} /><line x1={x} y1={y + 10} x2={x} y2={y + 34} /></g>
  </g>
);

/* ---------------------------------------------------------------- 1. colour afterimage (a lakeside at dusk, our own drawing) */
type RGB = [number, number, number];
const hex = (h: string): RGB => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB;
const inv = (c: RGB): RGB => c.map((v) => 255 - v) as RGB;
const lum = (c: RGB): RGB => { const y = Math.round(0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]); return [y, y, y]; };
const PAL = { cloud: '#f4f6fb', mtn: '#6f8fb8', sky0: '#2f6fd6', sky1: '#7fb2f0', sun: '#ffd23a', hill0: '#2f9a3e', hill1: '#1f7a30', house: '#d8322a', roof: '#7a2a1a', lake: '#2a7fc0', tree: '#1e8a3a', trunk: '#6b4226', field: '#e8c040' };
const Scene: React.FC<{ mode: 'neg' | 'grey' | 'true'; id: string }> = ({ mode, id }) => {
  const f = (h: string) => { const c = hex(h); const o = mode === 'neg' ? inv(c) : mode === 'grey' ? lum(c) : c; return `rgb(${o.join(',')})`; };
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      <defs><linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={f(PAL.sky0)} /><stop offset="1" stopColor={f(PAL.sky1)} /></linearGradient></defs>
      <rect width={1920} height={1080} fill={`url(#${id}sky)`} />
      <circle cx={1180} cy={290} r={100} fill={f(PAL.sun)} />
      {[[360, 250, 120], [470, 230, 90], [1560, 380, 110], [1660, 360, 80]].map(([x, y, r], i) => <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.42} fill={f(PAL.cloud)} />)}
      <path d="M 0 600 L 220 430 L 380 540 L 560 400 L 760 560 L 980 470 L 1160 580 L 1400 440 L 1640 560 L 1920 470 L 1920 700 L 0 700 Z" fill={f(PAL.mtn)} />
      <path d="M 0 640 C 300 470 600 520 900 600 C 1200 680 1500 500 1920 560 L 1920 1080 L 0 1080 Z" fill={f(PAL.hill1)} />
      <path d="M 0 700 C 400 620 800 660 1100 700 C 1400 740 1700 690 1920 700 L 1920 1080 L 0 1080 Z" fill={f(PAL.hill0)} />
      <rect x={0} y={800} width={1920} height={280} fill={f(PAL.lake)} />
      <path d="M 0 790 C 500 760 1000 830 1920 780 L 1920 820 L 0 830 Z" fill={f(PAL.field)} />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={1130 - i * 14} y={850 + i * 24} width={100 + i * 28} height={8} fill={f(PAL.sun)} opacity={0.9} />)}
      <rect x={520} y={560} width={220} height={160} fill={f(PAL.house)} />
      <polygon points="500,566 630,470 760,566" fill={f(PAL.roof)} />
      <rect x={605} y={640} width={50} height={80} fill={f(PAL.roof)} />
      <rect x={1240} y={560} width={26} height={140} fill={f(PAL.trunk)} />
      <circle cx={1253} cy={520} r={90} fill={f(PAL.tree)} />
    </svg>
  );
};
const Fix: React.FC<{ ring?: number; dark?: boolean }> = ({ ring, dark }) => (
  <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
    {ring !== undefined && <circle cx={960} cy={540} r={34} fill="none" stroke="#fff" strokeOpacity={0.85} strokeWidth={5} strokeDasharray={`${2 * Math.PI * 34 * ring} 999`} transform="rotate(-90 960 540)" />}
    <circle cx={960} cy={540} r={9} fill={dark ? '#000' : '#fff'} stroke={dark ? '#fff' : '#000'} strokeWidth={3} />
  </svg>
);

/* ---------------------------------------------------------------- 2. lilac chaser (Hinton, c. 2005) */
const LILAC_BG = 200;
const Lilac: React.FC<{ gap: number }> = ({ gap }) => (
  <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
    <defs><filter id="lb" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="20" /></filter></defs>
    <rect width={1920} height={1080} fill={`rgb(${LILAC_BG},${LILAC_BG},${LILAC_BG})`} />
    {Array.from({ length: 12 }, (_, i) => {
      if (i === gap) return null;
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
      return <circle key={i} cx={960 + Math.cos(a) * 300} cy={540 + Math.sin(a) * 300} r={46} fill="#e07ad8" filter="url(#lb)" />;
    })}
    <g stroke="#000" strokeWidth={5}><line x1={940} y1={540} x2={980} y2={540} /><line x1={960} y1={520} x2={960} y2={560} /></g>
  </svg>
);

/* ---------------------------------------------------------------- 3. motion-induced blindness (Bonneh et al., Nature 2001) */
const MIB: React.FC<{ rot: number }> = ({ rot }) => (
  <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
    <rect width={1920} height={1080} fill="#000" />
    <g transform={`rotate(${rot} 960 540)`} stroke="#3b5bff" strokeWidth={6}>
      {Array.from({ length: 9 }, (_, i) => Array.from({ length: 9 }, (_, j) => { const x = 960 + (i - 4) * 110, y = 540 + (j - 4) * 110; return <g key={`${i}${j}`}><line x1={x - 22} y1={y} x2={x + 22} y2={y} /><line x1={x} y1={y - 22} x2={x} y2={y + 22} /></g>; }))}
    </g>
    {[[960 - 290, 540 - 170], [960 + 290, 540 - 170], [960, 540 + 300]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={15} fill="#ffe100" />)}
    <circle cx={960} cy={540} r={9} fill="#22e05a" />
  </svg>
);

/* ---------------------------------------------------------------- 4. stepping feet (Anstis 2003) */
const Feet: React.FC<{ stripes: boolean; x: number }> = ({ stripes, x }) => (
  <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
    <rect width={1920} height={1080} fill="#808080" />
    {stripes && Array.from({ length: 70 }, (_, i) => <rect key={i} x={i * 28} y={128} width={14} height={824} fill="#000" />)}
    {stripes && Array.from({ length: 70 }, (_, i) => <rect key={`w${i}`} x={i * 28 + 14} y={128} width={14} height={824} fill="#fff" />)}
    <rect x={x} y={420} width={200} height={44} fill="#fff200" />
    <rect x={x} y={616} width={200} height={44} fill="#0a1a6e" />
  </svg>
);

const CUTS: React.FC[] = [
  // 1 · afterimage: stare
  () => (<Chrome sub="盯住中间的白点，[15秒]，别眨眼"><Scene mode="neg" id="a1" /><Fix ring={0.55} /><Tag n="候选 1 · 颜色残像" t="① 盯 15 秒（安静段）" /></Chrome>),
  // 1 · afterimage: the switch to grey, on the build hit
  () => (<Chrome sub="现在——你看到[颜色]了吗？"><Scene mode="grey" id="a2" /><Fix dark />
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}><Cross x={700} y={200} /><Cross x={560} y={690} /><Cross x={1500} y={760} /></svg>
    <Picker rows={[['天空', [116, 116, 116]], ['房子', [99, 99, 99]], ['草地', [112, 112, 112]]]} foot="R = G = B：一点颜色都没有" />
    <Tag n="候选 1 · 颜色残像" t="② 57 s 音乐点切成黑白" /></Chrome>),
  // 2 · lilac chaser
  () => (<Chrome bg="#c8c8c8" sub="盯住中间的十字，别看别处"><Lilac gap={3} /><Tag n="候选 2 · 丁香追逐者" t="① 盯十字：粉点会消失，出现一个绿点" /></Chrome>),
  () => (<Chrome bg="#c8c8c8" sub="那个绿点？取色——{这里只有灰色}"><Lilac gap={3} /><svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}><Cross x={960 + Math.cos(-Math.PI / 2 + Math.PI / 2) * 300} y={540 + Math.sin(-Math.PI / 2 + Math.PI / 2) * 300} /></svg>
    <Picker rows={[['绿点处', [LILAC_BG, LILAC_BG, LILAC_BG]]]} foot="屏幕上从来没有绿色" /><Tag n="候选 2 · 丁香追逐者" t="② 证明：绿色是大脑补的" /></Chrome>),
  // 3 · motion-induced blindness
  () => (<Chrome bg="#000" sub="盯住中间的绿点：黄点会一个个[消失]"><MIB rot={14} /><Tag n="候选 3 · 运动诱导盲" t="蓝网格一直转，黄点其实一直都在" /></Chrome>),
  // 4 · stepping feet
  () => (<Chrome sub="两块方块，看起来在[一步一停]地走"><Feet stripes x={760} /><Tag n="候选 4 · 踩步错觉" t="① 条纹背景上匀速平移" /></Chrome>),
  () => (<Chrome sub="拿掉条纹：它们一直是{匀速}"><Feet stripes={false} x={1020} /><Tag n="候选 4 · 踩步错觉" t="② 抽掉背景（和彩球同一招）" /></Chrome>),
];

export const Cuts: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const S = CUTS[Math.min(CUTS.length - 1, f)];
  return <S />;
};
export const N_CUTS = CUTS.length;
