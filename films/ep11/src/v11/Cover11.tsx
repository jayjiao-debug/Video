import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, staticFile, useVideoConfig } from 'remotion';
import { Monogram } from '../brand/Brand';
import { JUNO } from '../brand/identity';
import { C, F, LNUM, Defs11 } from './kit11';
import { Ticket } from './Open11';

/* Douyin covers for 《舍不得的，是TA吗？》: the paid-for cinema ticket under the lamp, a two-line hook, and the
   experiment's two numbers (85 % kept investing after 1000万 sunk; 17 % with nothing sunk). Same art as the film.
   Wide 4:3 (1440×1080) and tall 3:4 (1080×1440; the lower ~18 % is left for Douyin's UI). */
const useFonts = () => {
  const [handle] = useState(() => delayRender('cover11-fonts'));
  const [ok, setOk] = useState(false);
  useEffect(() => {
    Promise.all(['900 40px "Noto Serif CJK SC"', '700 40px "Noto Serif CJK SC"', '700 40px "Noto Sans CJK SC"', '500 40px "Noto Sans CJK SC"', '700 40px "Cormorant Garamond"', 'italic 600 40px "Cormorant Garamond"', '400 40px "DejaVu Sans Mono"']
      .map((f) => document.fonts.load(f, '舍不得是TA吗85%17万投').catch(() => null))).then(() => { setOk(true); continueRender(handle); });
  }, [handle]);
  return ok;
};

const GOLD_T: React.CSSProperties = { background: 'linear-gradient(180deg,#fff4d2 0%,#f4cf7c 55%,#c9913f 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' };

const Num: React.FC<{ n: string; l1: string; l2: string; hot: boolean; size: number }> = ({ n, l1, l2, hot, size }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ fontFamily: F.lat, fontWeight: 700, fontSize: size, lineHeight: 1, ...LNUM, ...(hot ? GOLD_T : { color: '#9aa3b5' }), filter: hot ? 'drop-shadow(0 4px 24px rgba(0,0,0,.9))' : undefined }}>{n}</div>
    <div style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 30, letterSpacing: '0.08em', color: hot ? '#f3dca6' : '#9aa3b5', marginTop: 10, ...LNUM }}>{l1}</div>
    <div style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 26, letterSpacing: '0.08em', color: hot ? 'rgba(243,237,226,.8)' : '#7d8597', marginTop: 4 }}>{l2}</div>
  </div>
);

export const Ep11Cover: React.FC<{ layout: 'wide' | 'tall' }> = ({ layout }) => {
  const ok = useFonts();
  const { width: W, height: H } = useVideoConfig();
  if (!ok) return null;
  const tall = layout === 'tall';
  const tix = tall ? { x: 540, y: 640, s: 0.86, r: -7 } : { x: 1060, y: 660, s: 0.62, r: -8 };
  const head = tall ? 116 : 104;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 60% at ${tall ? '50% 48%' : '70% 58%'}, #1d2538 0%, #111727 45%, #070a12 80%, #04050a 100%)`, overflow: 'hidden' }}>
      <Defs11 />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id="cv-lamp"><stop offset="0" stopColor="#ffe9b8" stopOpacity=".32" /><stop offset="1" stopColor="#ffe9b8" stopOpacity="0" /></radialGradient>
          <radialGradient id="cv-vig" cx="50%" cy="50%" r="72%"><stop offset=".45" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".75" /></radialGradient>
        </defs>
        <ellipse cx={tix.x} cy={tix.y} rx={tall ? 560 : 520} ry={tall ? 330 : 300} fill="url(#cv-lamp)" />
        <g transform={`translate(${tix.x} ${tix.y}) rotate(${tix.r}) scale(${tix.s})`}><Ticket /></g>
        <rect width={W} height={H} fill="url(#cv-vig)" />
      </svg>
      <div style={{ position: 'absolute', left: tall ? 0 : 92, right: tall ? 0 : undefined, top: tall ? 96 : 96, textAlign: tall ? 'center' : 'left' }}>
        <div style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 32, letterSpacing: '0.3em', color: '#e6bd66' }}>感情里的经济学 · 沉没成本</div>
        <div style={{ fontFamily: F.serif, fontWeight: 900, fontSize: head, lineHeight: 1.2, color: '#fff7e6', marginTop: 22, textShadow: '0 6px 30px rgba(0,0,0,.9)' }}>
          付出得越多
          <br />
          越<span style={GOLD_T}>舍不得</span>走？
        </div>
      </div>
      <div style={{ position: 'absolute', left: tall ? 0 : 92, right: tall ? 0 : undefined, top: tall ? 815 : 560, display: 'flex', justifyContent: tall ? 'center' : 'flex-start', alignItems: 'flex-end', gap: tall ? 70 : 48 }}>
        <Num n="85%" l1="已投1000万" l2="接着投" hot size={tall ? 150 : 128} />
        <div style={{ fontFamily: F.lat, fontStyle: 'italic', fontWeight: 600, fontSize: 48, color: '#7d8597', paddingBottom: 76 }}>vs</div>
        <Num n="17%" l1="没投过" l2="愿意投" hot={false} size={tall ? 150 : 128} />
      </div>
      <div style={{ position: 'absolute', left: tall ? 0 : 92, right: tall ? 0 : undefined, top: tall ? 1090 : 900, display: 'flex', alignItems: 'center', justifyContent: tall ? 'center' : 'flex-start', gap: 22 }}>
        <svg width={64} height={64} viewBox="-60 -60 120 120"><Monogram draw={1} size={0.9} /></svg>
        <div style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 34, color: '#f3ede2', letterSpacing: '0.04em' }}>《舍不得的，是TA吗？》</div>
        <div style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 26, letterSpacing: '0.2em', color: 'rgba(230,189,102,.85)' }}>{JUNO.series}</div>
      </div>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${staticFile('grain0.png')})`, backgroundSize: `${W}px ${H}px`, opacity: 0.06, mixBlendMode: 'overlay' }} />
    </AbsoluteFill>
  );
};
