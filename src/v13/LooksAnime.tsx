import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';

/* ep13 anime direction: painted anime stills, slow camera, light effects, minimal type. */
const SANS = '"Noto Sans CJK SC", sans-serif', SERIF = '"Noto Serif CJK SC", serif', MONO = '"DejaVu Sans Mono", monospace';
const Frame: React.FC<{ src: string; z?: number; ox?: number; oy?: number; children?: React.ReactNode }> = ({ src, z = 1.06, ox = 0, oy = 0, children }) => (
  <AbsoluteFill style={{ background: '#000', overflow: 'hidden' }}>
    <Img src={staticFile(src)} style={{ position: 'absolute', width: 1920, height: 1080, objectFit: 'cover', transform: `scale(${z}) translate(${ox}px,${oy}px)` }} />
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse 80% 75% at 50% 50%, rgba(0,0,0,0) 60%, rgba(0,0,0,.45) 100%)' }} />
    {children}
  </AbsoluteFill>
);
const Cap: React.FC<{ t: string }> = ({ t }) => <div style={{ position: 'absolute', left: 0, right: 0, bottom: 56, textAlign: 'center', fontFamily: SANS, fontWeight: 500, fontSize: 40, color: '#fff', letterSpacing: '0.05em', textShadow: '0 2px 12px rgba(0,0,0,.8)' }}>{t}</div>;
const Time: React.FC<{ a: string; b: string; x: number; y: number; c: string }> = ({ a, b, x, y, c }) => (
  <div style={{ position: 'absolute', left: x, top: y, fontFamily: MONO, fontWeight: 700, fontSize: 64, color: '#fff', textShadow: `0 0 24px ${c}, 0 2px 10px rgba(0,0,0,.7)` }}>{a}<span style={{ fontSize: 40, margin: '0 18px', opacity: 0.8 }}>→</span><span style={{ color: c }}>{b}</span></div>
);
const F0 = () => <Frame src="ep13/a_night.jpg" z={1.08} ox={20}><Time a="23:00" b="02:47" x={1180} y={90} c="#7FD8FF" /><Cap t="打游戏，三个小时像十分钟" /></Frame>;
const F1 = () => <Frame src="ep13/a_day.jpg" z={1.05}><Time a="20:00" b="20:10" x={110} y={90} c="#FFC46B" /><Cap t="写作业，十分钟像三个小时" /></Frame>;
const F2 = () => (
  <Frame src="ep13/a_roof.jpg" z={1.04}>
    <div style={{ position: 'absolute', left: 150, top: 330, fontFamily: SERIF, fontWeight: 700, fontSize: 190, letterSpacing: '0.16em', color: '#FFF6EA', textShadow: '0 0 40px rgba(255,170,90,.6), 0 4px 30px rgba(0,0,0,.5)' }}>心流</div>
    <div style={{ position: 'absolute', left: 160, top: 560, fontFamily: SANS, fontWeight: 500, fontSize: 36, letterSpacing: '0.3em', color: 'rgba(255,240,225,.9)', textShadow: '0 2px 12px rgba(0,0,0,.6)' }}>目标清楚 · 马上反馈 · 难度刚好</div>
  </Frame>
);
const FR = [F0, F1, F2];
export const LooksAnime: React.FC = () => { const f = useCurrentFrame(); const C = FR[Math.min(2, f)]; return <C />; };
