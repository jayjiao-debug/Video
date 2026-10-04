import React from 'react';
import { ZH, EN, SANS, prog, easeOut } from './lib';

/* A person card: introduces a real person without animating one. A cut-paper profile silhouette (19th-century cameo)
   in a thin gold oval, with name, years and role beside it. Rises in, holds still while read, fades. Screen space,
   placed mid-left (the top-left belongs to Douyin's watermark, the bottom to subtitles). */
const HEAD =
  'M20,240 C25,204 48,192 70,186 C72,172 68,160 62,150 C45,135 40,100 50,75 C62,40 100,28 128,36 C150,42 160,60 160,80 ' +
  'C160,90 158,98 162,104 L177,128 C173,132 169,134 166,136 C168,140 170,144 168,148 C172,150 170,154 166,156 ' +
  'C168,160 166,166 160,170 C150,176 140,176 132,174 C128,182 128,190 132,196 C160,205 185,215 190,240 Z';

export const PersonCard: React.FC<{ T: number; at: number; out: number; name: string; zh: string; years: string; role: string; beard?: boolean; glasses?: boolean; x?: number; y?: number }> = ({ T, at, out, name, zh, years, role, beard = true, glasses = false, x = 110, y = 430 }) => {
  const o = Math.min(easeOut(prog(T, at, at + 0.45)), 1 - prog(T, out - 0.4, out));
  if (o <= 0) return null;
  const rise = (1 - easeOut(prog(T, at, at + 0.5))) * 16;
  const id = `pc-${name.replace(/\W/g, '')}`;
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity: o }}>
      <defs>
        <clipPath id={id}><ellipse cx={90} cy={110} rx={74} ry={94} /></clipPath>
        <radialGradient id={`${id}-shade`} cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#05060b" stopOpacity="0.62" /><stop offset="0.7" stopColor="#05060b" stopOpacity="0.35" /><stop offset="1" stopColor="#05060b" stopOpacity="0" /></radialGradient>
        <radialGradient id={`${id}-bg`} cx="0.45" cy="0.4" r="0.7"><stop offset="0" stopColor="#f3e9d2" /><stop offset="1" stopColor="#d9c9a4" /></radialGradient>
      </defs>
      <g transform={`translate(${x},${y + rise})`}>
        {/* a soft pool of shadow instead of a hard panel, so the card sits in the set */}
        <ellipse cx={250} cy={110} rx={360} ry={170} fill={`url(#${id}-shade)`} />
        <ellipse cx={90} cy={110} rx={74} ry={94} fill={`url(#${id}-bg)`} />
        <g clipPath={`url(#${id})`}>
          <g transform="translate(16,20) scale(0.72)" fill="#231a12">
            <path d={HEAD} />
            <path d="M48,80 C40,48 70,26 110,28 C140,30 156,44 160,62 C150,50 130,44 110,46 C86,48 66,62 60,92 Z" />
            {beard && <path d="M146,138 C166,146 172,172 162,196 C152,212 126,208 116,190 C110,176 118,160 130,156 Z" />}
            {glasses && <g stroke="#231a12" strokeWidth={3} fill="none"><line x1={104} y1={96} x2={158} y2={98} /><ellipse cx={162} cy={100} rx={6} ry={8} /></g>}
          </g>
        </g>
        <ellipse cx={90} cy={110} rx={74} ry={94} fill="none" stroke="#c8913a" strokeWidth={3} />
        <ellipse cx={90} cy={110} rx={82} ry={102} fill="none" stroke="#c8913a" strokeWidth={1} opacity={0.6} />
        <text x={200} y={70} style={{ fontFamily: EN, fontWeight: 700, fontSize: 24, letterSpacing: '0.22em', fill: '#c8913a', fontVariantNumeric: 'lining-nums' }}>{name}</text>
        <text x={200} y={124} paintOrder="stroke" stroke="#05060b" strokeWidth={6} strokeOpacity={0.6} style={{ fontFamily: ZH, fontWeight: 900, fontSize: 46, fill: '#f3ede2' }}>{zh}</text>
        <text x={200} y={164} paintOrder="stroke" stroke="#05060b" strokeWidth={5} strokeOpacity={0.6} style={{ fontFamily: EN, fontWeight: 600, fontSize: 28, fill: '#e2dccf', fontVariantNumeric: 'lining-nums' }}>{years}</text>
        <text x={200} y={200} paintOrder="stroke" stroke="#05060b" strokeWidth={5} strokeOpacity={0.6} style={{ fontFamily: SANS, fontSize: 22, letterSpacing: '0.06em', fill: '#c9c2b4' }}>{role}</text>
      </g>
    </svg>
  );
};
