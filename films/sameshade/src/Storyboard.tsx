import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import { Board, P0, pt, DARK, LIGHT, grey, A_CELL, B_CELL } from './Board';
import { JUNO } from './brand/identity';

/* Key frames for 《大脑的懒惰》, one per scene (frame index = scene). Code-drawn; no images. */
const GOLD = '#f1c56d', GLOW = 'rgba(241,197,109,0.7)', INK = '#f3ede2', DIM = 'rgba(243,237,226,0.55)';
const SANS = '"Noto Sans CJK SC", sans-serif', SERIF = '"Noto Serif CJK SC", serif', MONO = '"JunoMono", monospace';

const useFonts = () => {
  const [h] = useState(() => delayRender('fonts', { timeoutInMilliseconds: 60000 }));
  useEffect(() => {
    Promise.all(['700 40px "Noto Sans CJK SC"', '900 40px "Noto Sans CJK SC"', '900 40px "Noto Serif CJK SC"', '700 40px "JunoMono"'].map((f) => document.fonts.load(f, '测试0123')))
      .then(() => continueRender(h), () => continueRender(h));
  }, [h]);
};

const Sub: React.FC<{ s: string }> = ({ s }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, top: 972, textAlign: 'center' }}>
    <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 68, color: INK, letterSpacing: '0.03em', lineHeight: 1.25, textShadow: '0 0 3px #000, 0 0 3px #000, 0 2px 14px rgba(0,0,0,0.95)' }}>
      {s.split(/(\[[^\]]+\]|\{[^}]+\})/).filter(Boolean).map((seg, i) => seg.startsWith('[') ? <span key={i} style={{ color: GOLD, fontWeight: 900 }}>{seg.slice(1, -1)}</span>
        : seg.startsWith('{') ? <span key={i} style={{ color: '#ff5a48', fontWeight: 900 }}>{seg.slice(1, -1)}</span> : <span key={i}>{seg}</span>)}
    </span>
  </div>
);

/** the eyedropper readout, fixed top-right (screen furniture) */
const Picker: React.FC<{ rows: [string, [number, number, number]][] }> = ({ rows }) => (
  <div style={{ position: 'absolute', right: 70, top: 160, padding: '18px 22px', borderRadius: 14, background: 'rgba(10,10,12,0.82)', border: '1px solid rgba(243,237,226,0.18)', fontFamily: MONO, color: INK }}>
    <div style={{ fontSize: 16, letterSpacing: '0.3em', color: DIM, marginBottom: 12 }}>⌖ 取色器</div>
    {rows.map(([k, [r, g, b]], i) => (
      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 26, fontWeight: 700, marginTop: i ? 10 : 0 }}>
        <span style={{ width: 34, height: 34, borderRadius: 6, background: `rgb(${r},${g},${b})`, border: '1px solid rgba(255,255,255,0.3)' }} />
        <span style={{ minWidth: 70 }}>{k}</span><span style={{ fontVariantNumeric: 'tabular-nums' }}>{`${r} ${g} ${b}`}</span>
      </div>
    ))}
  </div>
);

const Chrome: React.FC<{ children: React.ReactNode; bg?: string; sub?: string }> = ({ children, bg = 'linear-gradient(180deg, #121014 0%, #1b1712 100%)', sub }) => (
  <AbsoluteFill style={{ background: bg }}>
    <style>{`@font-face { font-family: "JunoMono"; src: url(${staticFile('fonts/DejaVuSansMono-Bold.ttf')}) format("truetype"); font-weight: 700; }`}</style>
    {children}
    <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 128, background: '#000' }} />
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 128, background: '#000' }} />
    {sub && <Sub s={sub} />}
    <div style={{ position: 'absolute', top: 50, right: 60, opacity: 0.6, fontFamily: SANS, fontWeight: 500, fontSize: 20, letterSpacing: '0.3em', color: 'rgba(243,237,226,0.58)' }}><span style={{ color: GOLD }}>◆ </span>{JUNO.mark}</div>
  </AbsoluteFill>
);
const Tag: React.FC<{ n: string; t: string }> = ({ n, t }) => (
  <div style={{ position: 'absolute', left: 70, top: 160, fontFamily: MONO, fontSize: 18, letterSpacing: '0.3em', color: DIM }}>{n} · {t}</div>
);

/* ---------- strawberries: drawn in true colours, then every colour pushed through one cyan cast. The berries come out
   grey (R never above G or B); the scene around them goes cyan. */
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const czk = (cast: number) => (h: string) => { const [r, g, b] = hex(h); const k = 1 - cast, c = 255 * cast; return `rgb(${Math.round(k * r)},${Math.round(k * g + c)},${Math.round(k * b + c)})`; };
const cz = czk(0.4);
const Berry: React.FC<{ x: number; y: number; s: number; rot: number; f: (h: string) => string }> = ({ x, y, s, rot, f }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <defs><radialGradient id={`bg${x}${y}`} cx="0.38" cy="0.35" r="0.75"><stop offset="0" stopColor={f('#ff6b6b')} /><stop offset="0.45" stopColor={f('#d8262e')} /><stop offset="1" stopColor={f('#7a0f16')} /></radialGradient></defs>
    <path d="M 0 -52 C 46 -54 62 -20 52 10 C 40 44 14 66 0 74 C -14 66 -40 44 -52 10 C -62 -20 -46 -54 0 -52 Z" fill={`url(#bg${x}${y})`} />
    <path d="M 0 -52 C 30 -52 44 -30 40 -6 C 20 -24 -10 -28 -40 -14 C -40 -40 -24 -52 0 -52 Z" fill={f('#ff6a6a')} opacity={0.55} />
    <path d="M 52 10 C 40 44 14 66 0 74 C 20 50 34 30 40 2 Z" fill={f('#8e1a22')} opacity={0.8} />
    {Array.from({ length: 14 }, (_, i) => <ellipse key={i} cx={-34 + (i % 5) * 17 + (Math.floor(i / 5) % 2) * 8} cy={-24 + Math.floor(i / 5) * 26} rx={2.6} ry={4} fill={f('#f2d05a')} />)}
    <path d="M -36 -50 L -8 -44 L 0 -70 L 8 -44 L 36 -50 L 14 -36 L 24 -22 L 0 -32 L -24 -22 L -14 -36 Z" fill={f('#3b8f3a')} />
  </g>
);
const BERRIES: [number, number, number, number][] = [[820, 560, 1.15, -12], [960, 530, 1.2, 6], [1100, 565, 1.15, 18], [880, 650, 1.2, -4], [1040, 655, 1.2, 10], [960, 720, 1.1, -8]];
const Strawberries: React.FC<{ masked?: boolean; cast?: number }> = ({ masked, cast = 0.4 }) => {
  const f = czk(cast);
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      {!masked && <>
        <rect width={1920} height={1080} fill={f('#2a2622')} />
        <rect y={700} width={1920} height={380} fill={f('#6b4a2c')} />
        <ellipse cx={960} cy={760} rx={360} ry={96} fill={f('#d9d4ca')} />
        <ellipse cx={960} cy={735} rx={340} ry={80} fill={f('#f4f1ea')} />
      </>}
      {masked && <rect width={1920} height={1080} fill="#050505" />}
      {BERRIES.map(([x, y, s, r], i) => <Berry key={i} x={x} y={y} s={s} rot={r} f={f} />)}
    </svg>
  );
};


/* ---------- confetti spheres (Novick 2018, Munker–White): 12 spheres, all one beige; thin coloured stripes in front */
const BEIGE = '#c9b79c';
const STRIPE = ['#ff2a2a', '#18c43c', '#2f6bff', '#b23cff', '#ff9a1f', '#14c8d4'];
const SPHERES: [number, number, number][] = [[620, 380, 0], [800, 330, 1], [980, 360, 2], [1160, 330, 3], [1330, 390, 4], [700, 560, 5], [880, 520, 3], [1060, 545, 0], [1250, 560, 1], [760, 740, 2], [960, 720, 4], [1160, 735, 5]];
const Confetti: React.FC<{ stripes?: number }> = ({ stripes = 1 }) => (
  <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
    <defs>
      <radialGradient id="sph" cx="0.38" cy="0.32" r="0.75"><stop offset="0" stopColor="#efe2cc" /><stop offset="0.55" stopColor={BEIGE} /><stop offset="1" stopColor="#7d6d58" /></radialGradient>
      {SPHERES.map(([x, y], i) => <clipPath key={i} id={`sc${i}`}><circle cx={x} cy={y} r={78} /></clipPath>)}
    </defs>
    <rect width={1920} height={1080} fill="#0b0b0b" />
    {/* background stripes, every colour, faint */}
    <g opacity={stripes}>{Array.from({ length: 140 }, (_, i) => <rect key={i} x={0} y={128 + i * 6} width={1920} height={2.4} fill={STRIPE[Math.floor(i / 3) % STRIPE.length]} opacity={0.55} />)}</g>
    {SPHERES.map(([x, y, c], i) => (
      <g key={i}>
        <circle cx={x} cy={y} r={78} fill="url(#sph)" />
        <g clipPath={`url(#sc${i})`} opacity={stripes}>{Array.from({ length: 30 }, (_, k) => <rect key={k} x={x - 80} y={y - 80 + k * 6} width={160} height={2.6} fill={STRIPE[c]} />)}</g>
      </g>
    ))}
  </svg>
);

/* ---------- the dress, twice (示意; not the photo) */
const Dress: React.FC<{ x: number; body: string; lace: string }> = ({ x, body, lace }) => (
  <g transform={`translate(${x} 250)`}>
    <path d="M -70 0 L -40 0 L -30 40 L 30 40 L 40 0 L 70 0 L 60 120 L 150 560 L -150 560 L -60 120 Z" fill={body} />
    {[150, 300, 430, 540].map((y, i) => <rect key={i} x={-160} y={y} width={320} height={i === 3 ? 22 : 30} fill={lace} clipPath="url(#dressClip)" />)}
    <rect x={-62} y={110} width={124} height={26} fill={lace} />
  </g>
);

const SCENES: React.FC[] = [
  // 0 · opening
  () => (
    <Chrome sub="A和B，是[同一个颜色]。">
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}><Board /></svg>
      <Picker rows={[['A', [DARK, DARK, DARK]], ['B', [DARK, DARK, DARK]]]} />
      <Tag n="S1" t="开场 0 s · 第一帧就是完整棋盘" />
    </Chrome>
  ),
  // 0b · the one opening proof: black closes in on A and B, one continuous take into the drop
  () => (<Chrome sub="盯着B，我把周围[遮住]——"><svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}><Board iris={0.72} /></svg>
    <Picker rows={[['A', [DARK, DARK, DARK]], ['B', [DARK, DARK, DARK]]]} /><Tag n="S1" t="2.5 s · 黑幕从四周往里收（唯一一步证明）" /></Chrome>),
  () => (<Chrome sub="B在变深——它{一像素没动}。"><svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}><Board iris={0.9} /></svg>
    <Picker rows={[['A', [DARK, DARK, DARK]], ['B', [DARK, DARK, DARK]]]} /><Tag n="S1" t="5.2 s · 收到只剩两块，下一拍就是 drop" /></Chrome>),
  // 1 · the drop: everything but A and B goes black; the title
  () => (
    <Chrome bg="#050505">
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}><Board maskAB={1} /></svg>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center', fontFamily: SERIF, fontWeight: 900, fontSize: 120, color: GOLD, textShadow: `0 0 30px ${GLOW}` }}>大脑的懒惰</div>
      <Picker rows={[['A', [DARK, DARK, DARK]], ['B', [DARK, DARK, DARK]]]} />
      <Tag n="S1" t="8.1 s DROP · 黑幕收成两块方块 · 标题" />
    </Chrome>
  ),
  // 2 · the shadow slid away; B keeps its true value and now looks dark
  () => (
    <Chrome sub="把阴影[拿开]：B一点没变，它本来就这么深。">
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}><Board shadowOff={[2.0, 0]} bFixed /></svg>
      <Picker rows={[['B', [DARK, DARK, DARK]], ['B 旁边', [LIGHT, LIGHT, LIGHT]]]} />
      <Tag n="S2" t="11.6 s · 阴影滑走，B 不动（兼做解释，不另起证明）" />
    </Chrome>
  ),
  // 3 · a sheet of paper, half in shadow
  () => (
    <Chrome sub="这本来是好本事：白纸在阴影里，还是[白纸]。">
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <rect x={0} y={128} width={1920} height={824} fill="#2b2620" />
        <polygon points="560,330 1360,330 1440,820 480,820" fill="rgb(236,233,226)" />
        <polygon points="960,330 1360,330 1440,820 960,820" fill="#000" opacity={0.45} />
        <polygon points="0,128 960,128 960,952 0,952" fill="#ffd9a0" opacity={0.05} />
        <line x1={960} y1={300} x2={960} y2={850} stroke="rgba(0,0,0,0.2)" strokeWidth={2} />
      </svg>
      <Picker rows={[['亮处', [236, 233, 226]], ['暗处', [130, 128, 124]]]} />
      <Tag n="S3" t="白纸还是白纸" />
    </Chrome>
  ),
  // 4 · the dress (示意)
  () => (
    <Chrome bg="linear-gradient(180deg, #0f0e12 0%, #16131a 100%)" sub="1401人里：57%看成蓝黑，30%看成[白金]。">
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <defs><clipPath id="dressClip"><path d="M -70 0 L -40 0 L -30 40 L 30 40 L 40 0 L 70 0 L 60 120 L 150 560 L -150 560 L -60 120 Z" /></clipPath></defs>
        <Dress x={560} body="#2f52b0" lace="#141414" />
        <Dress x={1360} body="#ece7de" lace="#b8913c" />
        <g style={{ fontFamily: SANS, fontWeight: 900 }}>
          <text x={560} y={232} textAnchor="middle" fontSize={44} fill={INK}>57% 蓝黑</text>
          <text x={1360} y={232} textAnchor="middle" fontSize={44} fill={GOLD}>30% 白金</text>
          <text x={960} y={560} textAnchor="middle" fontSize={30} fill={DIM}>11% 蓝棕</text>
          <text x={960} y={610} textAnchor="middle" fontSize={22} fill={DIM}>1401 人 · Current Biology 2015</text>
          <text x={560} y={880} textAnchor="middle" fontSize={26} fill={DIM}>以为在灯下 → 减掉黄光</text>
          <text x={1360} y={880} textAnchor="middle" fontSize={26} fill={DIM}>以为在阴影里 → 减掉蓝光</text>
        </g>
      </svg>
      <Tag n="S4" t="那条裙子（示意，不是原照片）" />
    </Chrome>
  ),
  // 5 · build: twelve spheres, each a different colour
  () => (
    <Chrome sub="最后一个。这12个球，各是什么颜色？">
      <Confetti />
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <g stroke="#fff" strokeWidth={2}><line x1={980} y1={300} x2={980} y2={420} /><line x1={920} y1={360} x2={1040} y2={360} /><circle cx={980} cy={360} r={22} fill="none" /></g>
      </svg>
      <Picker rows={[['这个球', hex(BEIGE) as [number, number, number]]]} />
      <Tag n="S5" t="蓄力：逐个取色" />
    </Chrome>
  ),
  // 6 · drop: the stripes lift, twelve identical beige spheres
  () => (
    <Chrome bg="#050505" sub="12个球，全是[同一种米色]。">
      <Confetti stripes={0} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 80, color: GOLD, textShadow: `0 0 26px ${GLOW}` }}>12 个球 · 1 种颜色</div>
      <Picker rows={[['全部', hex(BEIGE) as [number, number, number]]]} />
      <Tag n="S6" t="72.9 s 大 DROP" />
    </Chrome>
  ),
  // 7 · ending: the board again, untouched
  () => (
    <Chrome sub="现在你知道了。再看一眼——它们还是{不一样}。">
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}><Board /></svg>
      <Picker rows={[['A', [DARK, DARK, DARK]], ['B', [DARK, DARK, DARK]]]} />
      <Tag n="S7" t="收尾" />
    </Chrome>
  ),
  // 8 · end card: the question, plus the screenshot line folded in (no separate beat)
  () => (
    <Chrome bg="#050505">
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity: 0.2 }}><Board labels={false} /></svg>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 72, color: INK, textShadow: '0 0 4px #000, 0 2px 18px #000' }}>那条裙子，你当年看到的是<span style={{ color: GOLD }}>什么颜色</span>？</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 520, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 34, color: DIM, letterSpacing: '0.12em' }}>还不信 A = B？暂停 · 截图 · 自己取色</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 820, textAlign: 'center', fontFamily: MONO, fontSize: 18, color: DIM, letterSpacing: '0.2em' }}>Adelson 1995 · Lafer-Sousa et al. 2015 · Wallisch 2017 · Novick 2018</div>
      <Tag n="S8" t="片尾卡" />
    </Chrome>
  ),
];

export const Storyboard: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const S = SCENES[Math.min(SCENES.length - 1, f)];
  return <S />;
};
export const N_SCENES = SCENES.length;
