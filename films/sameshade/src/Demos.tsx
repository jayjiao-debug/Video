import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { JUNO } from './brand/identity';
import music from './music.json';

/* Finished demos of three candidate illusions for the quiet section of 《大脑的懒惰》 (break → build, 16.28 s each),
   played back to back for review, each over the same 16 s of the track. Code-drawn; every number shown is the value
   drawn on screen. Motion runs on its own clocks, not the beat. */
export const SEG = music.events.build - music.events.break; // 16.28 s
const GOLD = '#f1c56d', INK = '#f3ede2', DIM = 'rgba(243,237,226,0.55)', RED = '#ff5a48';
const SANS = '"Noto Sans CJK SC", sans-serif', MONO = '"JunoMono", monospace';
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const prog = (t: number, a: number, z: number) => clamp((t - a) / (z - a));
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const vis = (t: number, a: number, z: number, fi = 0.25, fo = 0.3) => Math.min(easeOut(prog(t, a, a + fi)), 1 - prog(t, z - fo, z));

const useFonts = () => {
  const [h] = useState(() => delayRender('fonts', { timeoutInMilliseconds: 60000 }));
  useEffect(() => {
    Promise.all(['700 40px "Noto Sans CJK SC"', '900 40px "Noto Sans CJK SC"', '700 40px "JunoMono"'].map((f) => document.fonts.load(f, '测试0123')))
      .then(() => continueRender(h), () => continueRender(h));
  }, [h]);
};

type Line = [number, number, string];
const Subs: React.FC<{ t: number; lines: Line[] }> = ({ t, lines }) => {
  const cur = lines.find(([a, z]) => t >= a - 0.05 && t < z + 0.1);
  if (!cur) return null;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 972, textAlign: 'center', opacity: Math.min(easeOut(prog(t, cur[0] - 0.05, cur[0] + 0.12)), 1 - prog(t, cur[1], cur[1] + 0.1)) }}>
      <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 68, color: INK, letterSpacing: '0.03em', lineHeight: 1.25, textShadow: '0 0 3px #000, 0 0 3px #000, 0 2px 14px rgba(0,0,0,0.95)' }}>
        {cur[2].split(/(\[[^\]]+\]|\{[^}]+\})/).filter(Boolean).map((seg, i) => seg.startsWith('[') ? <span key={i} style={{ color: GOLD, fontWeight: 900 }}>{seg.slice(1, -1)}</span>
          : seg.startsWith('{') ? <span key={i} style={{ color: RED, fontWeight: 900 }}>{seg.slice(1, -1)}</span> : <span key={i}>{seg}</span>)}
      </span>
    </div>
  );
};
const Box: React.FC<{ title: string; rows: [string, string, string?][]; o: number }> = ({ title, rows, o }) => o <= 0.001 ? null : (
  <div style={{ position: 'absolute', right: 70, top: 160, width: 450, padding: '16px 24px 18px', borderRadius: 16, background: 'rgba(10,10,12,0.88)', border: '1px solid rgba(243,237,226,0.2)', fontFamily: MONO, color: INK, opacity: o }}>
    <div style={{ fontSize: 22, letterSpacing: '0.2em', color: DIM, marginBottom: 10, fontFamily: SANS, fontWeight: 700 }}>{title}</div>
    {rows.map(([k, v, sw], i) => (
      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 33, fontWeight: 700, marginTop: i ? 10 : 0 }}>
        {sw && <span style={{ width: 42, height: 42, borderRadius: 7, background: sw, border: '1px solid rgba(255,255,255,0.35)' }} />}
        <span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 30, flexGrow: 1, whiteSpace: 'nowrap' }}>{k}</span>
        <span style={{ whiteSpace: 'pre' }}>{v}</span>
      </div>
    ))}
  </div>
);
const Cross: React.FC<{ x: number; y: number; o: number }> = ({ x, y, o }) => o <= 0.001 ? null : (
  <g opacity={o}>
    <g stroke="#000" strokeWidth={6} opacity={0.6}><line x1={x - 34} y1={y} x2={x - 10} y2={y} /><line x1={x + 10} y1={y} x2={x + 34} y2={y} /><line x1={x} y1={y - 34} x2={x} y2={y - 10} /><line x1={x} y1={y + 10} x2={x} y2={y + 34} /></g>
    <g stroke="#fff" strokeWidth={2.5}><line x1={x - 34} y1={y} x2={x - 10} y2={y} /><line x1={x + 10} y1={y} x2={x + 34} y2={y} /><line x1={x} y1={y - 34} x2={x} y2={y - 10} /><line x1={x} y1={y + 10} x2={x} y2={y + 34} /></g>
  </g>
);

/* ---------------------------------------------------------------- 1. lilac chaser (Hinton, c. 2005; Troxler fading) */
const LILAC_BG = 200, DISC = '#e07ad8', R0 = 300;
const STEP = 4 / 30; // one disc goes missing every 4 frames, its own clock (the beat is 15.3 frames)
const FREEZE = 11.0;
const LILAC_LINES: Line[] = [[0.2, 3.0, '盯住中间的十字，别看别处'], [3.1, 6.6, '几秒后，粉点会消失，只剩一个绿点在转'],
  [11.1, 14.0, '那个绿点？取色——{这里只有灰色}'], [14.1, 16.2, '绿色，是大脑自己[补]上去的']];
const Lilac: React.FC<{ t: number }> = ({ t }) => {
  const step = Math.floor(Math.min(t, FREEZE) / STEP);
  const gap = step % 12;
  const gx = 960 + Math.cos((gap / 12) * Math.PI * 2 - Math.PI / 2) * R0, gy = 540 + Math.sin((gap / 12) * Math.PI * 2 - Math.PI / 2) * R0;
  const proof = vis(t, FREEZE + 0.1, SEG + 1, 0.2, 0.1);
  return (
    <AbsoluteFill style={{ background: `rgb(${LILAC_BG},${LILAC_BG},${LILAC_BG})` }}>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        {/* soft discs as radial gradients (a Gaussian-like falloff): the same look as a blur, far cheaper to render */}
        <defs><radialGradient id="lg"><stop offset="0" stopColor={DISC} stopOpacity={1} /><stop offset="0.38" stopColor={DISC} stopOpacity={0.95} /><stop offset="0.6" stopColor={DISC} stopOpacity={0.6} /><stop offset="0.8" stopColor={DISC} stopOpacity={0.2} /><stop offset="1" stopColor={DISC} stopOpacity={0} /></radialGradient></defs>
        {Array.from({ length: 12 }, (_, i) => {
          if (i === gap) return null;
          const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
          return <circle key={i} cx={960 + Math.cos(a) * R0} cy={540 + Math.sin(a) * R0} r={90} fill="url(#lg)" />;
        })}
        <g stroke="#000" strokeWidth={5}><line x1={940} y1={540} x2={980} y2={540} /><line x1={960} y1={520} x2={960} y2={560} /></g>
        <Cross x={gx} y={gy} o={proof} />
      </svg>
      <Box title="取色器 · RGB" o={proof} rows={[['绿点处', `${LILAC_BG} ${LILAC_BG} ${LILAC_BG}`, `rgb(${LILAC_BG},${LILAC_BG},${LILAC_BG})`]]} />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- 2. motion-induced blindness (Bonneh, Cooperman & Sagi, Nature 2001) */
const STOP = 11.0;
const MIB_DOTS: [number, number][] = [[960 - 290, 540 - 170], [960 + 290, 540 - 170], [960, 540 + 290]];
const MIB_LINES: Line[] = [[0.2, 3.0, '盯住中间的绿点，别看黄点'], [3.1, 5.8, '三个黄点，会一个个[消失]'],
  [11.1, 13.8, '网格停下——黄点{一直都在}'], [13.9, 16.2, '东西不变，大脑就懒得[报告]']];
const MIB: React.FC<{ t: number }> = ({ t }) => {
  // the grid turns at 50°/s, then eases to a stop and dims on the proof
  const k = prog(t, STOP, STOP + 0.6);
  const rot = 50 * Math.min(t, STOP) + 50 * 0.6 * (k - (k * k) / 2) * 1;
  const gridO = 1 - 0.75 * easeOut(prog(t, STOP + 0.4, STOP + 1.0));
  const blink = Math.floor(t * 4.6) % 2 === 0 ? 1 : 0.25; // the fixation dot flickers on its own clock
  const proof = vis(t, STOP + 0.4, SEG + 1, 0.2, 0.1);
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <g transform={`rotate(${rot} 960 540)`} stroke="#3b5bff" strokeWidth={6} opacity={gridO}>
          {Array.from({ length: 11 }, (_, i) => Array.from({ length: 11 }, (_, j) => { const x = 960 + (i - 5) * 110, y = 540 + (j - 5) * 110; return <g key={`${i}-${j}`}><line x1={x - 22} y1={y} x2={x + 22} y2={y} /><line x1={x} y1={y - 22} x2={x} y2={y + 22} /></g>; }))}
        </g>
        {MIB_DOTS.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={15} fill="#ffe100" />)}
        <circle cx={960} cy={540} r={9} fill="#22e05a" opacity={t < STOP ? blink : 1} />
        {MIB_DOTS.map(([x, y], i) => <Cross key={i} x={x} y={y} o={proof} />)}
      </svg>
      <Box title="取色器 · RGB" o={proof} rows={[['三个黄点', '255 225 0', '#ffe100'], ['全程', '从没变过']]} />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- 3. stepping feet (Anstis 2003) */
const SPEED = 72, SW = 24; // px/s; stripe width (period 48); bars are two periods long, so both edges hit the same stripe
const OFF0 = 10.0, ON1 = 13.3;
const FEET_LINES: Line[] = [[0.2, 3.4, '两块方块，看起来在[一步一停]地走'], [3.5, 6.6, '黄的走，蓝的停；蓝的走，黄的停'],
  [10.1, 13.0, '拿掉条纹：它们一直是{匀速}'], [13.4, 16.2, '条纹一回来，又开始走走停停']];
const Feet: React.FC<{ t: number }> = ({ t }) => {
  const x = 420 + SPEED * t;
  const stripes = t < OFF0 || t >= ON1;
  return (
    <AbsoluteFill style={{ background: '#808080' }}>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        {stripes && Array.from({ length: 41 }, (_, i) => <rect key={i} x={i * 2 * SW} y={0} width={SW} height={1080} fill="#000" />)}
        {stripes && Array.from({ length: 41 }, (_, i) => <rect key={`w${i}`} x={i * 2 * SW + SW} y={0} width={SW} height={1080} fill="#fff" />)}
        <rect x={x} y={420} width={4 * SW} height={44} fill="#fff200" />
        <rect x={x} y={616} width={4 * SW} height={44} fill="#0a1a6e" />
      </svg>
      <Box title="速度计 · 像素/秒" o={1} rows={[['黄', String(SPEED), '#fff200'], ['蓝', String(SPEED), '#0a1a6e']]} />
    </AbsoluteFill>
  );
};

const NAMES = ['候选 2 · 丁香追逐者', '候选 3 · 运动诱导盲', '候选 4 · 踩步错觉'];
export const Demos: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = frame / fps;
  const k = Math.min(2, Math.floor(T / SEG)), t = T - k * SEG;
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <style>{`@font-face { font-family: "JunoMono"; src: url(${staticFile('fonts/DejaVuSansMono-Bold.ttf')}) format("truetype"); font-weight: 700; }`}</style>
      {k === 0 && <Lilac t={t} />}
      {k === 1 && <MIB t={t} />}
      {k === 2 && <Feet t={t} />}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 128, background: '#000' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 128, background: '#000' }} />
      <div style={{ position: 'absolute', top: 48, left: 70, fontFamily: SANS, fontWeight: 700, fontSize: 26, color: DIM }}>{NAMES[k]}（审片用标签，正片不出现）</div>
      <Subs t={t} lines={[LILAC_LINES, MIB_LINES, FEET_LINES][k]} />
      <div style={{ position: 'absolute', top: 50, right: 60, opacity: 0.6, fontFamily: SANS, fontWeight: 500, fontSize: 20, letterSpacing: '0.3em', color: 'rgba(243,237,226,0.58)' }}><span style={{ color: GOLD }}>◆ </span>{JUNO.mark}</div>
    </AbsoluteFill>
  );
};
