import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { TIMELINE, CH, ZH, SANS, MONO, EN, INK, DIM, FAINT, RED, GOLD, prog, easeOut, clamp } from './lib';
import { JUNO } from './brand/identity';

/* The shared layer of 《越过越快》 (the engine, not the look): background, chapter head (top-left, the reference
   format: index, title, English line, the study it comes from), voice-over captions, the chapter progress bar,
   corner mark, vignette and grain. */

export const FontFace: React.FC = () => (
  <style>{`
    @font-face { font-family: "JunoMono"; src: url(${staticFile('fonts/DejaVuSansMono.ttf')}) format("truetype"); font-weight: 400; }
    @font-face { font-family: "JunoMono"; src: url(${staticFile('fonts/DejaVuSansMono-Bold.ttf')}) format("truetype"); font-weight: 700; }
  `}</style>
);

export const Backdrop: React.FC = () => (
  <AbsoluteFill style={{ background: 'radial-gradient(ellipse 80% 70% at 50% 45%, #15171d 0%, #0b0c10 60%, #07080b 100%)' }}>
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity: 0.5 }}>
      {Array.from({ length: 25 }, (_, i) => <line key={`v${i}`} x1={i * 80} x2={i * 80} y1={0} y2={1080} stroke="rgba(255,255,255,0.025)" />)}
      {Array.from({ length: 14 }, (_, i) => <line key={`h${i}`} x1={0} x2={1920} y1={i * 80} y2={i * 80} stroke="rgba(255,255,255,0.025)" />)}
    </svg>
  </AbsoluteFill>
);

export const META: Record<string, { no: string; zh: string; en: string; cite: string }> = {
  survey: { no: '01', zh: '不是错觉', en: "IT'S NOT JUST YOU", cite: 'Friedman & Janssen · Acta Psychologica · 2010　｜　Wittmann & Lehnhoff · 2005' },
  ratio: { no: '02', zh: '比例理论', en: 'PROPORTIONAL THEORY', cite: 'Paul Janet · Revue philosophique · 1877' },
  log: { no: '03', zh: '感觉上的人生', en: 'A LOGARITHMIC LIFE', cite: '按比例理论推算 · 是模型估算，不是测量结果' },
  fall: { no: '04', zh: '31 米自由落体', en: 'FREE FALL', cite: 'Stetson, Fiesta & Eagleman · PLoS ONE · 2007' },
  memory: { no: '05', zh: '大脑在数回忆', en: 'THE MEMORY CLOCK', cite: 'Faber & Gennari · Cognition · 2015' },
  routine: { no: '06', zh: '重复会压缩时间', en: 'ROUTINE', cite: 'Avni-Babad & Ritov · J. Exp. Psychol.: General · 2003' },
  child: { no: '07', zh: '第一次', en: 'FIRST TIMES', cite: '' },
  holiday: { no: '08', zh: '假期悖论', en: 'THE HOLIDAY PARADOX', cite: 'William James · The Principles of Psychology · 1890' },
  slow: { no: '09', zh: '让时间变慢', en: 'SLOWING TIME DOWN', cite: '' },
};

export const ChapterHead: React.FC<{ T: number; id: string }> = ({ T, id }) => {
  const c = CH(id), m = META[id];
  if (!m || T < c.a || T >= c.z) return null;
  const k = easeOut(prog(T, c.a, c.a + 0.45));
  const w = 54 * easeOut(prog(T, c.a + 0.1, c.a + 0.7));
  return (
    <div style={{ position: 'absolute', left: 120, top: 78, opacity: k, transform: `translateX(${(1 - k) * -18}px)` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, color: RED }}>{m.no}</span>
        <span style={{ width: w, height: 1.5, background: 'rgba(255,90,69,0.7)' }} />
        <span style={{ fontFamily: MONO, fontSize: 16, letterSpacing: '0.28em', color: DIM }}>{m.en}</span>
      </div>
      <div style={{ fontFamily: ZH, fontWeight: 900, fontSize: 54, color: INK, marginTop: 10, letterSpacing: '0.04em' }}>{m.zh}</div>
      {m.cite && <div style={{ fontFamily: SANS, fontSize: 23, color: 'rgba(236,232,223,0.5)', marginTop: 8, letterSpacing: '0.02em' }}>{m.cite}</div>}
    </div>
  );
};

/** captions of the voice-over; numbers in red */
const Rich: React.FC<{ s: string }> = ({ s }) => (
  <>{s.split(/([0-9][0-9.,/%]*[%]?)/).filter(Boolean).map((seg, i) => /^[0-9]/.test(seg)
    ? <span key={i} style={{ color: '#ff8a76', fontFamily: MONO, fontWeight: 700, fontSize: '0.92em' }}>{seg}</span> : <span key={i}>{seg}</span>)}</>
);
export const Captions: React.FC<{ T: number }> = ({ T }) => {
  for (const l of TIMELINE.lines) {
    if (T < l.a - 0.05 || T > l.z + 0.12) continue;
    const c = l.chunks.find(([a, z]) => T >= a - 0.05 && T < z + 0.12) ?? l.chunks[l.chunks.length - 1];
    if (!c) continue;
    const o = Math.min(easeOut(prog(T, c[0] - 0.05, c[0] + 0.12)), 1 - prog(T, l.z + 0.02, l.z + 0.12));
    return (
      <div style={{ position: 'absolute', left: 0, right: 0, top: 952, textAlign: 'center', opacity: o }}>
        <span style={{ fontFamily: SANS, fontWeight: 500, fontSize: 42, color: '#f4f1ea', letterSpacing: '0.04em', textShadow: '0 2px 10px rgba(0,0,0,0.95), 0 0 2px rgba(0,0,0,0.9)' }}><Rich s={c[2]} /></span>
      </div>
    );
  }
  return null;
};
export const CaptionBand: React.FC = () => (
  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 230, background: 'linear-gradient(180deg, rgba(7,8,11,0) 0%, rgba(7,8,11,0.7) 60%, rgba(7,8,11,0.88) 100%)' }} />
);

/** chapter progress bar along the bottom edge (the reference's navigation strip) */
export const Progress: React.FC<{ T: number; o?: number }> = ({ T, o = 1 }) => {
  const chs = TIMELINE.chapters.filter((c) => META[c.id]);
  const x0 = 120, x1 = 1800, a0 = chs[0].a, a1 = chs[chs.length - 1].z;
  const X = (t: number) => x0 + ((t - a0) / (a1 - a0)) * (x1 - x0);
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity: o * clamp((T - a0) / 0.4) }}>
      {chs.map((c) => {
        const xa = X(c.a) + 3, xz = X(c.z) - 3, fill = clamp((T - c.a) / (c.z - c.a));
        const on = T >= c.a && T < c.z;
        return (
          <g key={c.id}>
            <rect x={xa} y={1052} width={xz - xa} height={3} fill={FAINT} />
            <rect x={xa} y={1052} width={(xz - xa) * fill} height={3} fill={on ? RED : 'rgba(255,90,69,0.45)'} />
          </g>
        );
      })}
    </svg>
  );
};

export const CornerMark: React.FC<{ o: number }> = ({ o }) =>
  o <= 0.001 ? null : (
    <div style={{ position: 'absolute', top: 44, right: 56, opacity: 0.55 * o, fontFamily: SANS, fontWeight: 500, fontSize: 20, letterSpacing: '0.3em', color: 'rgba(243,237,226,0.58)' }}>
      <span style={{ color: JUNO.colors.gold }}>◆ </span>{JUNO.mark}
    </div>
  );

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.5 }) => (
  <AbsoluteFill style={{ pointerEvents: 'none', background: `radial-gradient(ellipse 75% 70% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,${strength}) 100%)` }} />
);
export const Grain: React.FC = () => (
  <AbsoluteFill style={{ opacity: 0.05, pointerEvents: 'none' }}>
    <Img src={staticFile('grain0.png')} style={{ width: '100%', height: '100%' }} />
  </AbsoluteFill>
);

/** gold title, one character per beat-fraction (the brand's title stamp) */
export const GoldTitle: React.FC<{ text: string; T: number; at: number; size: number; y: number; step?: number; id?: string }> = ({ text, T, at, size, y, step = 0.12, id = 'gt' }) => {
  const chars = [...`《${text}》`];
  const width = chars.length * size * 0.98;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-metal`} x1="0" y1={y - size * 0.8} x2="0" y2={y + size * 0.2} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff3cf" /><stop offset="0.45" stopColor="#f3cd7a" /><stop offset="0.7" stopColor="#c99140" /><stop offset="1" stopColor="#8a5a22" />
        </linearGradient>
      </defs>
      <text y={y} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 900, fontSize: size, letterSpacing: '0.04em' }}>
        {chars.map((ch, i) => {
          const p = easeOut(prog(T, at + i * step, at + i * step + 0.18));
          return <tspan key={i} x={960 - width / 2 + (i + 0.5) * (width / chars.length)} fill={`url(#${id}-metal)`} opacity={p}>{ch}</tspan>;
        })}
      </text>
    </g>
  );
};
export { EN, GOLD };
