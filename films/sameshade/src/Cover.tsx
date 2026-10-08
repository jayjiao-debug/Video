import React, { useEffect, useState } from 'react';
import { AbsoluteFill, Img, continueRender, delayRender, staticFile } from 'remotion';
import { Board, Proj, pt } from './Board';
import { ZH, SANS, MONO, GOLD } from './lib';
import { JUNO } from './brand/identity';

/* Douyin covers for 《大脑的懒惰》, from the film's own key frame: the checker-shadow board with A and B on the
   wooden table under a warm pool of light (the opening of the film; A and B are the same grey, 108).
   Gold serif title plus the hook line 「A和B，是同一个颜色」 (owner's ask). wide = 1440×1080 (4:3), tall = 1080×1440 (3:4; lower 18 % kept
   clear for Douyin's UI). */
type Layout = 'wide' | 'tall';
const GLOW = 'rgba(241,197,109,0.6)', INK = '#f3ede2', DIM = 'rgba(243,237,226,0.6)';

const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts', { timeoutInMilliseconds: 60000 }));
  useEffect(() => {
    Promise.all(['900 40px "Noto Serif CJK SC"', '900 40px "Noto Sans CJK SC"', '700 40px "JunoMono"']
      .map((f) => document.fonts.load(f, '测试AB0123')).map((p) => p.catch(() => null))).then(() => continueRender(handle));
  }, [handle]);
};

const TableUnder: React.FC<{ p: Proj; w: number; h: number }> = ({ p, w, h }) => {
  const q = (u: number, v: number) => pt(p, u, v).join(',');
  const k = p.a / 120;
  return (
    <svg width={w} height={h} style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <linearGradient id="cwall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0d0b0d" /><stop offset="1" stopColor="#17130f" /></linearGradient>
        <linearGradient id="ctab" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a2a1b" /><stop offset="0.5" stopColor="#24190f" /><stop offset="1" stopColor="#120c07" /></linearGradient>
        <radialGradient id="cpool" cx="0.5" cy="0.3" r="0.6"><stop offset="0" stopColor="#ffcf8a" stopOpacity={0.26} /><stop offset="1" stopColor="#ffb060" stopOpacity={0} /></radialGradient>
        <filter id="ccs" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={22 * k} /></filter>
      </defs>
      <rect width={w} height={h} fill="url(#cwall)" />
      <polygon points={`${q(-1.6, -1.6)} ${q(6.6, -1.6)} ${q(6.6, 6.6)} ${q(-1.6, 6.6)}`} fill="url(#ctab)" />
      {Array.from({ length: 16 }, (_, i) => { const u = -1.6 + (i + 0.5) * (8.2 / 16); const [x0, y0] = pt(p, u, -1.6), [x1, y1] = pt(p, u, 6.6); return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke="#000" strokeOpacity={0.12} strokeWidth={1.5} />; })}
      <polygon points={`${q(-1.6, -1.6)} ${q(6.6, -1.6)} ${q(6.6, 6.6)} ${q(-1.6, 6.6)}`} fill="url(#cpool)" />
      <polygon points={`${q(0.2, 0.6)} ${q(5.3, 0.6)} ${q(5.3, 5.7)} ${q(0.2, 5.7)}`} fill="#000" opacity={0.55} filter="url(#ccs)" />
    </svg>
  );
};

export const Cover: React.FC<{ layout: Layout }> = ({ layout }) => {
  useFonts();
  const wide = layout === 'wide';
  const w = wide ? 1440 : 1080, h = wide ? 1080 : 1440;
  // the board: left half on the wide cover, under the title on the tall one
  const a = wide ? 76 : 92;
  const p: Proj = wide ? { cx: 455, cy0: 420, a, b: a * 62 / 120 } : { cx: 540, cy0: 640, a, b: a * 62 / 120 };
  const tx = wide ? 1100 : 540;
  return (
    <AbsoluteFill style={{ background: '#050505', overflow: 'hidden' }}>
      <style>{`
        @font-face { font-family: "JunoMono"; src: url(${staticFile('fonts/DejaVuSansMono-Bold.ttf')}) format("truetype"); font-weight: 700; }
        .cv-gold { background: linear-gradient(180deg, #fff3cf 0%, #f1c56d 45%, #c8913a 100%); -webkit-background-clip: text; background-clip: text; color: transparent; filter: drop-shadow(0 0 22px rgba(241,197,109,0.45)); }
      `}</style>
      <TableUnder p={p} w={w} h={h} />
      {/* vignette and grain under the board only: A and B stay exactly 108 on the cover too */}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 80% 75% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.6) 100%)', pointerEvents: 'none' }} />
      <AbsoluteFill style={{ opacity: 0.05 }}><Img src={staticFile('grain0.png')} style={{ width: '100%', height: '100%' }} /></AbsoluteFill>
      <svg width={w} height={h} style={{ position: 'absolute', inset: 0 }}>
        <Board p={p} uid="cv" />
      </svg>
      {/* the title: wide = two stacked lines beside the board, tall = one line above it */}
      {(wide ? ['大脑的', '懒惰'] : ['大脑的懒惰']).map((l, i) => (
        <div key={i} className="cv-gold" style={{ position: 'absolute', left: tx - 480, width: 960, top: wide ? 380 + i * 190 : 170, textAlign: 'center', fontFamily: ZH, fontWeight: 900, fontSize: wide ? 168 : 150, lineHeight: 1.1, whiteSpace: 'nowrap' }}>{l}</div>
      ))}
      <div style={{ position: 'absolute', left: tx - 160, width: 320, top: wide ? 788 : 362, height: 3, background: GOLD, boxShadow: `0 0 12px ${GLOW}`, opacity: 0.85 }} />
      <div style={{ position: 'absolute', left: tx - 460, width: 920, top: wide ? 810 : 384, textAlign: 'center', fontFamily: MONO, fontWeight: 700, fontSize: wide ? 28 : 26, letterSpacing: '0.5em', color: DIM }}>{JUNO.series}</div>
      {/* the hook the owner asked for: A and B are the same colour (true on this cover, 108 = 108) */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: wide ? 900 : 452, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: wide ? 84 : 76, color: INK, textShadow: '0 0 10px #000, 0 4px 18px #000', whiteSpace: 'nowrap' }}>
        A和B，是<span style={{ color: GOLD, textShadow: `0 0 18px ${GLOW}, 0 4px 18px #000` }}>同一个颜色</span>
      </div>
    </AbsoluteFill>
  );
};
