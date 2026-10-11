import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender } from 'remotion';
import { GoldTitle } from '../brand/Brand';
import { V1Side } from './toon';
import { mulberry } from '../v1/data';

/* Cover for 《它在瞄准谁》, drawn natively at its own size (no frame grabs). */
const SERIF = '"Noto Serif CJK SC", "Noto Serif SC", serif';
const LATIN = '"Cormorant Garamond", Georgia, serif';
const r = (() => { const m = mulberry(1944); return Array.from({ length: 2000 }, () => m()); })();

export const CoverV3: React.FC<{ w: number; h: number }> = ({ w, h }) => {
  const [handle] = useState(() => delayRender('cover fonts'));
  useEffect(() => {
    Promise.all(['900 40px "Noto Serif CJK SC"', '700 40px "Noto Serif CJK SC"', '600 40px "Cormorant Garamond"']
      .map((f) => document.fonts.load(f, '它在瞄准谁ABC').catch(() => null))).then(() => continueRender(handle));
  }, [handle]);
  const tall = h > w;
  const cx = w / 2;
  const cy = tall ? h * 0.47 : h * 0.47;
  const R = tall ? 400 : 330;
  const titleSize = tall ? 128 : 116;
  const roofTop = tall ? h - 330 : h - 250;
  // ember sites: dense clusters near the reticle, sparse elsewhere
  const embers = Array.from({ length: tall ? 420 : 380 }, (_, i) => {
    const clustered = r[i] < 0.35;
    const x = clustered ? cx + (r[i + 500] - 0.5) * R * 1.1 : r[i + 500] * w;
    const y = clustered ? cy + (r[i + 1000] - 0.5) * R * 1.1 : r[i + 1000] * roofTop;
    return { x, y, s: 2 + r[i + 1500] * 3.5, o: 0.25 + 0.5 * r[i + 200] };
  });
  const houses = Array.from({ length: Math.ceil(w / 180) + 1 }, (_, i) => ({ x: i * 180 - 40, roof: roofTop + (i % 3) * 16 }));
  const hit = (x: number) => Math.abs(x + 90 - cx) < 200;
  const ticks = Array.from({ length: 72 }, (_, i) => i);
  return (
    <AbsoluteFill style={{ background: '#07080d' }}>
      <svg width={w} height={h}>
        <defs>
          <radialGradient id="cv-bg" cx="50%" cy="45%" r="75%"><stop offset="0" stopColor="#1d2536" /><stop offset="1" stopColor="#06070b" /></radialGradient>
          <radialGradient id="cv-lens" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#2e3850" stopOpacity="0.55" /><stop offset="1" stopColor="#0b0e16" stopOpacity="0.1" /></radialGradient>
          <radialGradient id="cv-fire" cx="50%" cy="100%" r="80%"><stop offset="0" stopColor="#ffb24a" stopOpacity="0.85" /><stop offset="0.5" stopColor="#ff6a20" stopOpacity="0.35" /><stop offset="1" stopColor="#ff6a20" stopOpacity="0" /></radialGradient>
          <radialGradient id="cv-ember"><stop offset="0" stopColor="#ffd08a" /><stop offset="0.4" stopColor="#ff8a2a" stopOpacity="0.6" /><stop offset="1" stopColor="#ff8a2a" stopOpacity="0" /></radialGradient>
          <linearGradient id="cv-top" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#07080d" stopOpacity="0.95" /><stop offset="1" stopColor="#07080d" stopOpacity="0" /></linearGradient>
          <radialGradient id="cv-moonglow"><stop offset="0.5" stopColor="#efe6cf" stopOpacity="0.35" /><stop offset="1" stopColor="#efe6cf" stopOpacity="0" /></radialGradient>
          <mask id="cv-m"><rect width={w} height={h} fill="white" /><circle cx={cx} cy={cy} r={R} fill="black" /></mask>
        </defs>
        <rect width={w} height={h} fill="url(#cv-bg)" />
        {/* the map of London: streets and the Thames */}
        <g opacity={0.55}>
          {Array.from({ length: Math.ceil(w / 70) + 2 }, (_, i) => <line key={`v${i}`} x1={i * 70} y1={0} x2={i * 70 - 40} y2={h} stroke="#28314a" strokeWidth={1.4} />)}
          {Array.from({ length: Math.ceil(h / 70) + 2 }, (_, i) => <line key={`h${i}`} x1={0} y1={i * 70} x2={w} y2={i * 70 + 30} stroke="#28314a" strokeWidth={1.4} />)}
        </g>
        <path d={`M -40 ${cy + R * 0.55} C ${w * 0.2} ${cy + R * 0.25}, ${w * 0.45} ${cy + R * 0.85}, ${w * 0.65} ${cy + R * 0.5} S ${w * 0.9} ${cy + R * 0.2}, ${w + 40} ${cy + R * 0.45}`}
          stroke="#2c4a74" strokeWidth={tall ? 46 : 40} fill="none" opacity={0.75} />
        {embers.map((e, i) => <circle key={i} cx={e.x} cy={e.y} r={e.s * 3} fill="url(#cv-ember)" opacity={e.o} />)}
        {/* everything outside the scope is darker */}
        <rect width={w} height={h} fill="#05060a" opacity={0.55} mask="url(#cv-m)" />
        <circle cx={cx} cy={cy} r={R} fill="url(#cv-lens)" />
        {/* the reticle */}
        <g stroke="#f1c56d" fill="none">
          <circle cx={cx} cy={cy} r={R} strokeWidth={4} />
          <circle cx={cx} cy={cy} r={R - 18} strokeWidth={1.2} opacity={0.5} />
          {ticks.map((i) => {
            const a = (i / 72) * Math.PI * 2, l = i % 6 === 0 ? 26 : 12;
            return <line key={i} x1={cx + Math.cos(a) * R} y1={cy + Math.sin(a) * R} x2={cx + Math.cos(a) * (R - l)} y2={cy + Math.sin(a) * (R - l)} strokeWidth={i % 6 === 0 ? 3 : 1.4} />;
          })}
          <line x1={cx - R - 70} y1={cy} x2={cx - R + 30} y2={cy} strokeWidth={2.5} />
          <line x1={cx + R - 30} y1={cy} x2={cx + R + 70} y2={cy} strokeWidth={2.5} />
          <line x1={cx} y1={cy - R - 70} x2={cx} y2={cy - titleSize * 1.05} strokeWidth={2.5} />
          <line x1={cx} y1={cy + titleSize * 0.75} x2={cx} y2={cy + R + 70} strokeWidth={2.5} />
          {[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy], i) => {
            const x0 = cx + sx * R * 0.5, y0 = cy - titleSize * 0.35 + sy * R * 0.5;
            return <path key={i} d={`M ${x0} ${y0 - sy * 56} L ${x0} ${y0} L ${x0 - sx * 56} ${y0}`} strokeWidth={6} />;
          })}
        </g>
        {/* moon behind the V-1 so its silhouette reads */}
        <circle cx={tall ? w - 190 : w - 200} cy={tall ? 330 : 250} r={tall ? 190 : 160} fill="url(#cv-moonglow)" />
        <circle cx={tall ? w - 190 : w - 200} cy={tall ? 330 : 250} r={tall ? 108 : 92} fill="#efe6cf" />
        {/* a V-1 diving into the scope, engine still burning */}
        <g transform={`translate(${tall ? w - 190 : w - 200}, ${tall ? 330 : 250}) scale(${tall ? -0.9 : -0.8}, ${tall ? 0.9 : 0.8}) rotate(28)`}>
          <V1Side flame={1} T={0.37} />
        </g>
        {/* title */}
        <g transform={`translate(${cx - 960}, 0)`}>
          <GoldTitle text="它在瞄准谁" f={200} at={0} size={titleSize} y={cy + titleSize * 0.36} />
        </g>
        {/* top: headline */}
        <rect width={w} height={tall ? 320 : 230} fill="url(#cv-top)" />
        <text x={cx} y={tall ? 128 : 92} textAnchor="middle" style={{ fontFamily: SERIF, fontWeight: 900, fontSize: tall ? 70 : 62, fill: '#f6efe1', letterSpacing: '0.04em' }}>倒霉的事，为什么总扎堆？</text>
        <g transform={`translate(${cx}, ${tall ? 196 : 148})`}>
          <line x1={-300} y1={-10} x2={-200} y2={-10} stroke="#f1c56d" strokeWidth={1.5} opacity={0.7} />
          <line x1={200} y1={-10} x2={300} y2={-10} stroke="#f1c56d" strokeWidth={1.5} opacity={0.7} />
          <text textAnchor="middle" style={{ fontFamily: LATIN, fontWeight: 600, fontSize: 30, letterSpacing: '0.32em', fill: '#f1c56d' }}>LONDON · 1944</text>
        </g>
        {/* bottom: the street that keeps getting hit */}
        <ellipse cx={cx} cy={roofTop + 70} rx={420} ry={260} fill="url(#cv-fire)" />
        {houses.map((hs, i) => {
          const burnt = hit(hs.x);
          const d = burnt
            ? `M ${hs.x} ${h} L ${hs.x} ${hs.roof + 60} L ${hs.x + 40} ${hs.roof + 30} L ${hs.x + 70} ${hs.roof + 70} L ${hs.x + 110} ${hs.roof + 20} L ${hs.x + 140} ${hs.roof + 75} L ${hs.x + 180} ${hs.roof + 50} L ${hs.x + 180} ${h} Z`
            : `M ${hs.x} ${h} L ${hs.x} ${hs.roof + 60} L ${hs.x + 90} ${hs.roof} L ${hs.x + 180} ${hs.roof + 60} L ${hs.x + 180} ${h} Z`;
          return (
            <g key={i}>
              <path d={d} fill="#0b0d14" />
              {!burnt && <rect x={hs.x + 30} y={hs.roof + 2} width={18} height={44} fill="#0b0d14" />}
              {[0, 1].map((c) => (
                <g key={c}>
                  <rect x={hs.x + 34 + c * 72} y={hs.roof + 100} width={44} height={56} fill={burnt ? '#ff9a40' : '#e9c77a'} opacity={burnt ? 0.95 : 0.3 + 0.3 * r[i * 2 + c]} />
                  {!burnt && <path d={`M ${hs.x + 34 + c * 72} ${hs.roof + 100} l 44 56 m 0 -56 l -44 56`} stroke="#0b0d14" strokeWidth={4} />}
                </g>
              ))}
            </g>
          );
        })}
        <rect y={h - (tall ? 170 : 130)} width={w} height={tall ? 170 : 130} fill="#07080d" opacity={0.9} />
        <text x={cx} y={h - (tall ? 66 : 50)} textAnchor="middle" style={{ fontFamily: SERIF, fontWeight: 900, fontSize: tall ? 60 : 52, fill: '#f6efe1' }}>飞弹，专挑我家这条街？</text>
      </svg>
    </AbsoluteFill>
  );
};
