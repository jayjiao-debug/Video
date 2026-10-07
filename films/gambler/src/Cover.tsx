import React, { useEffect, useState } from 'react';
import { AbsoluteFill, Img, continueRender, delayRender, staticFile } from 'remotion';
import { ZH, SANS, MONO, rnd } from './lib';
import { JUNO } from './brand/identity';

/* Douyin covers for 《大脑是个赌徒》, from the film's own key frame: the four gold cards 押中了！ under the hanging lamp,
   gold sparks in the air. Hook (gold serif, 2 lines): 高潮没到， / 多巴胺先到了 (Salimpoor 2011: dopamine release
   already during anticipation). wide = 1440×1080 (4:3), tall = 1080×1440 (3:4; lower 18 % kept clear for Douyin's UI). */
type Layout = 'wide' | 'tall';
const GOLD = '#f1c56d', GLOW = 'rgba(241,197,109,0.75)', INK = '#f3ede2', DIM = 'rgba(243,237,226,0.6)';

const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts', { timeoutInMilliseconds: 60000 }));
  useEffect(() => {
    Promise.all(['900 40px "Noto Serif CJK SC"', '700 40px "Noto Sans CJK SC"', '900 40px "Noto Sans CJK SC"', '700 40px "JunoMono"']
      .map((f) => document.fonts.load(f, '测试0123')).map((p) => p.catch(() => null))).then(() => continueRender(handle));
  }, [handle]);
};

const Card: React.FC<{ x: number; y: number; w: number; s: string; rot: number }> = ({ x, y, w, s, rot }) => {
  const h = w * 1.42;
  return (
    <>
      <div style={{ position: 'absolute', left: x - w * 0.55, top: y + h / 2 - w * 0.04, width: w * 1.1, height: w * 0.18, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', filter: `blur(${w * 0.06}px)` }} />
      <div style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, transform: `rotate(${rot}deg)`, borderRadius: w * 0.07,
        background: `linear-gradient(160deg, #ffe7ab, ${GOLD} 55%, #c8913a)`, boxShadow: `0 0 ${w * 0.3}px ${GLOW}, 0 ${w * 0.1}px ${w * 0.18}px rgba(0,0,0,0.55)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <span style={{ fontFamily: ZH, fontWeight: 900, fontSize: w * 0.58, color: '#2a1a06' }}>{s}</span>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(120deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 42%)' }} />
      </div>
    </>
  );
};

export const Cover: React.FC<{ layout: Layout }> = ({ layout }) => {
  useFonts();
  const wide = layout === 'wide';
  const w = wide ? 1440 : 1080, h = wide ? 1080 : 1440;
  // the card row and the lamp above it
  const cx = wide ? 400 : 540, cy = wide ? 640 : 760, cw = wide ? 130 : 170, gap = wide ? 150 : 196;
  const tableY = cy - (wide ? 40 : 50);
  const tx = wide ? 1065 : 540;
  const lampY = wide ? 0 : -140; // tall: the shade sits above the frame, only the light comes in
  const y = wide ? { kicker: 300, l1: 450, l2: 600, sub: 690, title: 860, series: 916 } : { kicker: 120, l1: 250, l2: 395, sub: 475, title: 1085, series: 1140 };
  return (
    <AbsoluteFill style={{ background: '#050403', overflow: 'hidden' }}>
      <style>{`
        @font-face { font-family: "JunoMono"; src: url(${staticFile('fonts/DejaVuSansMono-Bold.ttf')}) format("truetype"); font-weight: 700; }
        .cv-gold { background: linear-gradient(180deg, #fff3cf 0%, #f1c56d 45%, #c8913a 100%); -webkit-background-clip: text; background-clip: text; color: transparent; filter: drop-shadow(0 0 22px rgba(241,197,109,0.45)); }
      `}</style>
      {/* wall with faint stripes, table with a lamp pool */}
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, #0b090b 0%, #151009 100%)' }} />
      <svg width={w} height={h} style={{ position: 'absolute', inset: 0 }}>
        {Array.from({ length: Math.ceil(w / 48) + 1 }, (_, i) => <line key={i} x1={i * 48} y1={0} x2={i * 48} y2={tableY} stroke="#fff" strokeOpacity={0.02} strokeWidth={14} />)}
        <defs>
          <linearGradient id="wd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a2512" /><stop offset="1" stopColor="#0f0904" /></linearGradient>
          <radialGradient id="pl"><stop offset="0" stopColor="#ffcf8a" stopOpacity={0.6} /><stop offset="0.55" stopColor="#ffb060" stopOpacity={0.15} /><stop offset="1" stopColor="#ff9a40" stopOpacity={0} /></radialGradient>
          <linearGradient id="cn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffd9a0" stopOpacity={0.3} /><stop offset="1" stopColor="#ffb870" stopOpacity={0} /></linearGradient>
        </defs>
        <polygon points={`${-200},${tableY} ${w + 200},${tableY} ${w + 600},${h} ${-600},${h}`} fill="url(#wd)" />
        {Array.from({ length: 30 }, (_, i) => { const u = i / 29; const x0 = -200 + u * (w + 400), x1 = -600 + u * (w + 1200); return <line key={i} x1={x0} y1={tableY} x2={x1} y2={h} stroke="#000" strokeOpacity={0.12} strokeWidth={1.5} />; })}
        <ellipse cx={cx} cy={cy + 120} rx={wide ? 520 : 560} ry={wide ? 180 : 200} fill="url(#pl)" />
        <polygon points={`${cx - 55},${wide ? 120 : 10} ${cx + 55},${wide ? 120 : 10} ${cx + 460},${cy + 220} ${cx - 460},${cy + 220}`} fill="url(#cn)" style={{ mixBlendMode: 'screen' }} />
        <g transform={`translate(0 ${lampY})`}><line x1={cx} y1={-10} x2={cx} y2={wide ? 40 : 70} stroke="#1a1410" strokeWidth={5} />
        <path d={`M ${cx - 62} ${wide ? 122 : 152} Q ${cx - 54} ${wide ? 56 : 86} ${cx} ${wide ? 38 : 68} Q ${cx + 54} ${wide ? 56 : 86} ${cx + 62} ${wide ? 122 : 152} Z`} fill="#6a5030" />
        <ellipse cx={cx} cy={wide ? 122 : 152} rx={62} ry={8} fill="#ffe2ad" /></g>
        {Array.from({ length: 70 }, (_, i) => {
          const a = rnd(i) * Math.PI * 2, r = 120 + 420 * rnd(i, 1);
          return <circle key={i} cx={cx + Math.cos(a) * r * 1.1} cy={cy - 20 + Math.sin(a) * r * 0.6} r={2 + 4 * rnd(i, 2)} fill={GOLD} opacity={0.25 + 0.6 * rnd(i, 3)} style={{ filter: `drop-shadow(0 0 6px ${GLOW})` }} />;
        })}
      </svg>
      {['押', '中', '了', '！'].map((s, i) => <Card key={i} x={cx + (i - 1.5) * gap} y={cy} w={cw} s={s} rot={(i - 1.5) * 2.5} />)}
      {/* hook */}
      <div style={{ position: 'absolute', left: tx - 460, width: 920, top: y.kicker - 24, textAlign: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: '0.42em', color: DIM }}>DOPAMINE · ANTICIPATION</div>
      {['高潮没到，', '多巴胺先到了'].map((l, i) => (
        <div key={i} className="cv-gold" style={{ position: 'absolute', left: tx - 470, width: 940, top: (i ? y.l2 : y.l1) - 120, textAlign: 'center', fontFamily: ZH, fontWeight: 900, fontSize: wide ? 100 : 114, lineHeight: 1.2, whiteSpace: 'nowrap' }}>{l}</div>
      ))}
      <div style={{ position: 'absolute', left: tx - 460, width: 920, top: y.sub - 30, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 38, color: INK, textShadow: '0 2px 14px rgba(0,0,0,0.9)' }}>你的大脑，一直在赌下一拍</div>
      <div style={{ position: 'absolute', left: tx - 460, width: 920, top: y.title - 50, textAlign: 'center', fontFamily: ZH, fontWeight: 900, fontSize: 60, color: INK, textShadow: '0 2px 18px rgba(0,0,0,0.9)' }}>《大脑是个赌徒》</div>
      <div style={{ position: 'absolute', left: tx - 460, width: 920, top: y.series - 16, textAlign: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: '0.5em', color: GOLD }}>{JUNO.series}</div>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 80% 75% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.6) 100%)', pointerEvents: 'none' }} />
      <AbsoluteFill style={{ opacity: 0.06 }}><Img src={staticFile('grain0.png')} style={{ width: '100%', height: '100%' }} /></AbsoluteFill>
    </AbsoluteFill>
  );
};
