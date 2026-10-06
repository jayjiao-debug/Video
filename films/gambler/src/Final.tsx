import React, { useEffect, useState } from 'react';
import { AbsoluteFill, Img, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { EV, BEAT, FILM_END, SUBS, ZH, SANS, MONO, EN, prog, easeOut, easeIn, easeInOut, clamp, lerp, hit, rnd } from './lib';
import { LOOKS, LookCtx } from './look';
import { JUNO } from './brand/identity';
import { Subtitles } from './subs';

/* 《大脑是个赌徒》 final, v2 direction (owner notes after v1):
   - The cards are the only hero: the lamp pool falls on them, their backs carry a bright gold edge; everything else
     is quiet, dark and at the edges.
   - The camera is locked. A few fixed framings, hard cuts between them; the only camera move is the punch-in on the
     drop. (v1's travelling camera diluted the music's own contrast: silence, wait, hit.)
   - The expectation bar is screen furniture (fixed, right edge, always in frame), not a prop in the set.
   - The turntable sits at the far-left edge in shadow; it only matters when the needle lifts on the two silences.
   - Explanations are graphs that move gently and with direction: one inverted-U ("sweet spot") curve with a small
     card riding it, a brain scan with a playhead walking to the peak, many people's curves for the 2025 study.
   Every frame is a pure function of T. Text is never slowly scaled. */

const GOLD = '#f1c56d', GOLD_GLOW = 'rgba(241,197,109,0.75)', RED = '#ff4a3a', INK = '#f3ede2', DIM = 'rgba(243,237,226,0.55)';
const CREAM = '#f4ead4', BACK = '#1b2440', COOL = '#8fb8ff';
const BAR = 128;

const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts', { timeoutInMilliseconds: 60000 }));
  useEffect(() => {
    Promise.all(['700 40px "Noto Serif CJK SC"', '900 40px "Noto Serif CJK SC"', '400 40px "Noto Sans CJK SC"', '700 40px "Noto Sans CJK SC"', '900 40px "Noto Sans CJK SC"', '400 40px "JunoMono"', '700 40px "JunoMono"', '700 40px "Cormorant Garamond"']
      .map((f) => document.fonts.load(f, '测试0123♪')).map((p) => p.catch(() => null))).then(() => continueRender(handle));
  }, [handle]);
};

/* ---------------------------------------------------------------- timing */
const at = (s: string) => { const l = SUBS.find((x) => x[2].includes(s)); if (!l) throw new Error(`no line ${s}`); return l[0]; };
const down = (k: number) => EV.title + k * 4 * BEAT; // bar downbeats after the title (the grid is right in this section)
const vis = (T: number, a: number, z: number, fi = 0.3, fo = 0.4) => Math.min(easeOut(prog(T, a, a + fi)), 1 - prog(T, z - fo, z));
const L_ = {
  bored: at('几遍就腻'), noise: at('噪音'), cheung: at('8万个'), two: at('最上头的'), sure: at('很有把握'), unsure: at('毫无把握'),
  scan: at('扫描'), wait: at('高潮来之前'), arrive: at('高潮那一刻'),
  sweet: at('甜区"，不一样'), study: at('400多人'), spread: at('有人偏爱'), jazz: at('爵士'), train: at('学没学过'),
  tk1: at('副歌'), tk2: at('drop前停'), tk3: at('听过的所有歌'), outro: at('单曲循环'), end: at('你的甜区偏哪边'),
};
/** shots: hard cuts between fixed framings */
const SHOT = {
  open: [0, EV.title + 3.25], row: [EV.title + 3.25, L_.bored], graph1: [L_.bored, L_.two], demo: [L_.two, EV.break],
  lbox: [EV.break, EV.riser], build: [EV.riser, EV.pickup], drop: [EV.pickup, L_.sweet], graph2: [L_.sweet, L_.tk1],
  take: [L_.tk1, EV.outro], close: [EV.outro, FILM_END + 1],
} as const;
const inShot = (T: number, k: keyof typeof SHOT) => T >= SHOT[k][0] && T < SHOT[k][1];

const lamp = (T: number) => {
  let v = 1;
  v -= 0.78 * prog(T, EV.cut1, EV.cut1 + 0.06) * (1 - prog(T, EV.replay - 0.1, EV.replay + 0.25));
  v -= 0.97 * prog(T, EV.hush, EV.hush + 0.04) * (1 - prog(T, EV.pickup - 0.02, EV.pickup));
  v += 0.6 * hit(T, EV.pickup, 0.5) + 0.25 * hit(T, EV.drop, 0.4) + 0.45 * hit(T, EV.title, 0.4);
  return v;
};
const lifted = (T: number) => Math.max(
  prog(T, EV.cut1 - 0.04, EV.cut1 + 0.06) * (1 - prog(T, EV.replay - 0.1, EV.replay)),
  prog(T, EV.hush - 0.04, EV.hush + 0.04) * (1 - prog(T, EV.pickup - 0.06, EV.pickup)));
const gauge = (T: number) => {
  if (T < EV.cut1) return lerp(0.08, 0.88, easeIn(prog(T, 0, EV.cut1)));
  if (T < EV.replay) return lerp(0.88, 0.04, easeOut(prog(T, EV.cut1, EV.cut1 + 0.5)));
  if (T < EV.title) return lerp(0.04, 0.9, easeIn(prog(T, EV.replay, EV.title)));
  if (T < EV.break) {
    let v = lerp(1.1, 0.34, easeOut(prog(T, EV.title, EV.title + 3)));
    for (let k = 2; k <= 7; k++) v += 0.12 * hit(T, down(k), 0.6);
    return v;
  }
  if (T < EV.riser) return lerp(0.34, 0.24, prog(T, EV.break, EV.riser));
  if (T < EV.breath2) return lerp(0.24, 0.94, easeInOut(prog(T, EV.riser, EV.breath2)));
  if (T < EV.pickup) return 0.94 + 0.06 * prog(T, EV.breath2, EV.hush) + 0.015 * Math.sin(T * 47);
  return lerp(1.18, 0.5, easeOut(prog(T, EV.pickup, EV.pickup + 7))) + 0.06 * hit(T, EV.drop, 0.3);
};

/* ---------------------------------------------------------------- framings (locked) */
type Cam = { z: number; cx: number; cy: number };
const camAt = (T: number): Cam => {
  if (inShot(T, 'open')) return { z: 1.38, cx: 960, cy: 668 };
  if (inShot(T, 'row') || inShot(T, 'demo')) return { z: 1.3, cx: 960, cy: 676 };
  if (inShot(T, 'lbox')) return { z: 2.15, cx: 1410, cy: 300 };
  if (inShot(T, 'build')) return { z: 1.18, cx: 960, cy: 640 };
  if (inShot(T, 'drop')) return { z: 1.34, cx: 960, cy: 676 };   // the punch-in, a cut on the hit
  if (inShot(T, 'take')) return { z: 1.38, cx: 960, cy: 668 };
  return { z: 1.15, cx: 960, cy: 630 };
};
const shakeAt = (T: number) => {
  const h = 16 * hit(T, EV.pickup, 0.25) + 8 * hit(T, EV.drop, 0.2) + 10 * hit(T, EV.title, 0.2) + 3 * hit(T, EV.cut1, 0.15)
    + (T > EV.breath2 && T < EV.hush ? 1.4 : 0) + 6 * hit(T, EV.breath2, 0.2);
  return [Math.sin(T * 83) * h, Math.cos(T * 67) * h * 0.6];
};

/* ---------------------------------------------------------------- the set (quiet) */
const Wall: React.FC<{ T: number; L: number }> = ({ T, L }) => {
  const on = prog(T, EV.break + 0.5, EV.break + 0.6) * (1 - prog(T, EV.riser - 0.05, EV.riser));
  const t = T - (EV.break + 0.5);
  const lb = on * (t < 0 ? 0 : t < 0.1 ? 0.7 : t < 0.2 ? 0.15 : t < 0.27 ? 0.8 : t < 0.4 ? 0.3 : 1);
  return (
    <g>
      <defs>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#09080a" /><stop offset="1" stopColor="#151009" /></linearGradient>
        <radialGradient id="lbglow" cx="0.5" cy="0.5" r="0.7"><stop offset="0" stopColor="#eaf4ff" /><stop offset="1" stopColor="#a9c4dc" /></radialGradient>
      </defs>
      <rect x={-600} y={-300} width={3120} height={880} fill="url(#wall)" />
      {Array.from({ length: 64 }, (_, i) => <line key={i} x1={-600 + i * 48} y1={-300} x2={-600 + i * 48} y2={545} stroke="#ffffff" strokeOpacity={0.018} strokeWidth={14} />)}
      <rect x={-600} y={528} width={3120} height={24} fill="#0a0806" />
      <rect x={1188} y={108} width={444} height={324} rx={8} fill="#141110" stroke="#221b16" strokeWidth={8} />
      <rect x={1200} y={120} width={420} height={300} fill={lb > 0 ? 'url(#lbglow)' : '#0e1012'} opacity={lb > 0 ? 0.2 + 0.8 * lb : 1} />
      {lb > 0 && <BrainFilm T={T} lb={lb} />}
      {lb > 0 && <ellipse cx={1410} cy={270} rx={440} ry={320} fill="#bcd8ff" opacity={0.06 * lb} />}
      <rect x={-600} y={-300} width={3120} height={880} fill="#000" opacity={clamp(0.5 - 0.42 * L, 0, 0.85) * (1 - 0.6 * lb)} />
    </g>
  );
};

/** the lightbox film: the outline draws itself, a song's playhead walks to the peak; 等 warms up on the way, 到 lights on arrival */
const BrainFilm: React.FC<{ T: number; lb: number }> = ({ T, lb }) => {
  const draw = easeInOut(prog(T, EV.break + 0.8, EV.break + 2.4));
  const ink = '#1d2a36';
  const p0 = L_.scan + 0.3, p1 = L_.arrive + 0.15; // playhead start -> arrives at the peak
  const ph = prog(T, p0, p1);
  const waitHeat = easeIn(prog(T, L_.wait - 0.6, p1)) * (1 - 0.35 * prog(T, p1, p1 + 1.5));
  const arrive = easeOut(prog(T, p1, p1 + 0.35));
  const pulse = hit(T, p1, 0.6);
  const brain = 'M 1290 292 C 1272 214 1322 160 1404 156 C 1484 150 1552 192 1550 262 C 1548 310 1520 332 1488 334 C 1474 360 1434 366 1414 348 C 1366 356 1306 344 1290 292 Z';
  return (
    <g opacity={lb}>
      <defs>
        <radialGradient id="heatW"><stop offset="0" stopColor="#ffb347" stopOpacity={0.95} /><stop offset="0.5" stopColor="#ff7a2e" stopOpacity={0.45} /><stop offset="1" stopColor="#ff5a20" stopOpacity={0} /></radialGradient>
        <radialGradient id="heatA"><stop offset="0" stopColor="#fff0b0" stopOpacity={1} /><stop offset="0.45" stopColor={GOLD} stopOpacity={0.6} /><stop offset="1" stopColor={GOLD} stopOpacity={0} /></radialGradient>
      </defs>
      <text x={1214} y={140} style={{ fontFamily: MONO, fontSize: 10, fill: ink, letterSpacing: '0.2em' }}>PET · SALIMPOOR 2011 · 示意</text>
      <path d={brain} fill="rgba(20,30,40,0.08)" stroke={ink} strokeWidth={2.6} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw} />
      <path d="M 1310 240 C 1340 226 1360 252 1390 238 M 1340 194 C 1370 184 1390 208 1420 194 M 1430 182 C 1460 172 1480 196 1510 186 M 1460 236 C 1490 226 1510 252 1536 242 M 1320 292 C 1350 282 1372 304 1402 292 M 1428 292 C 1458 280 1478 304 1508 292"
        fill="none" stroke={ink} strokeWidth={1.6} opacity={0.5 * draw} />
      {/* 等: warms up while the playhead walks */}
      <circle cx={1392} cy={252} r={14 + 36 * waitHeat} fill="url(#heatW)" opacity={waitHeat} />
      {Array.from({ length: 10 }, (_, i) => {
        const life = 1.6, t0 = L_.wait + i * 0.32, u = ((T - t0) % (life * 3)) / life;
        if (T < t0 || u > 1) return null;
        return <circle key={i} cx={1392 + Math.sin(i * 2.1 + T) * 10 + (rnd(i) - 0.5) * 16} cy={252 - 40 * u} r={2.2} fill={GOLD} opacity={(1 - u) * waitHeat} />;
      })}
      {/* 到: lights on arrival */}
      <circle cx={1440} cy={292} r={12 + 30 * arrive + 26 * pulse} fill="url(#heatA)" opacity={arrive} />
      <circle cx={1392} cy={252} r={5} fill={waitHeat > 0.05 ? '#ff8a3a' : ink} />
      <circle cx={1440} cy={292} r={5} fill={arrive > 0.05 ? GOLD : ink} />
      <g className="lb">
        <line x1={1392} y1={252} x2={1262} y2={196} stroke={ink} strokeWidth={1.2} opacity={0.5} />
        <line x1={1440} y1={292} x2={1560} y2={330} stroke={ink} strokeWidth={1.2} opacity={0.5} />
        <text x={1214} y={190} opacity={0.45 + 0.55 * Math.min(1, waitHeat * 2)} style={{ fontFamily: ZH, fontWeight: 900, fontSize: 26, fill: '#1a1410' }}>等</text>
        <text x={1214} y={206} opacity={0.45 + 0.55 * Math.min(1, waitHeat * 2)} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 11, fill: ink }}>尾状核</text>
        <text x={1606} y={342} textAnchor="end" opacity={0.45 + 0.55 * arrive} style={{ fontFamily: ZH, fontWeight: 900, fontSize: 26, fill: '#1a1410' }}>到</text>
        <text x={1606} y={358} textAnchor="end" opacity={0.45 + 0.55 * arrive} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 11, fill: ink }}>伏隔核</text>
      </g>
      {/* the song: a waveform strip with a playhead walking to the peak */}
      <g opacity={easeOut(prog(T, L_.scan - 0.2, L_.scan + 0.3))}>
        {Array.from({ length: 60 }, (_, i) => {
          const x = 1232 + i * 5.6, u = i / 59, amp = 4 + 18 * Math.pow(u, 2.2) * (0.6 + 0.4 * Math.sin(i * 1.7)) + (i > 52 ? 10 : 0);
          return <rect key={i} x={x} y={392 - amp / 2} width={3} height={amp} fill={u <= ph ? '#c8913a' : ink} opacity={u <= ph ? 0.95 : 0.35} />;
        })}
        <line x1={1232 + 334 * ph} y1={372} x2={1232 + 334 * ph} y2={412} stroke={RED} strokeWidth={2} />
        <text className="lb" x={1566} y={372} textAnchor="end" style={{ fontFamily: SANS, fontWeight: 700, fontSize: 11, fill: ink }}>高潮 ▼</text>
      </g>
    </g>
  );
};

const Table: React.FC<{ L: number }> = ({ L }) => (
  <g>
    <defs>
      <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#36230f" /><stop offset="0.5" stopColor="#24170b" /><stop offset="1" stopColor="#110a05" /></linearGradient>
      <radialGradient id="pool" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#ffcf8a" stopOpacity={0.6} /><stop offset="0.5" stopColor="#ffb060" stopOpacity={0.16} /><stop offset="1" stopColor="#ff9a40" stopOpacity={0} /></radialGradient>
    </defs>
    <polygon points="-200,552 2120,552 2700,1300 -780,1300" fill="url(#wood)" />
    {Array.from({ length: 40 }, (_, i) => {
      const u = i / 39, x0 = lerp(-200, 2120, u), x1 = lerp(-780, 2700, u);
      return <path key={i} d={`M ${x0} 552 Q ${lerp(x0, x1, 0.5) + Math.sin(i * 1.7) * 30} 900 ${x1} 1300`} stroke="#000" strokeOpacity={0.1 + 0.08 * rnd(i, 4)} strokeWidth={1.2 + rnd(i, 5) * 1.5} fill="none" />;
    })}
    <ellipse cx={960} cy={760} rx={560} ry={190} fill="url(#pool)" opacity={clamp(L, 0, 1.6)} />
    <polygon points="-200,552 2120,552 2700,1300 -780,1300" fill="#000" opacity={clamp(0.45 - 0.4 * L, 0, 0.9)} />
  </g>
);

const Lamp: React.FC<{ T: number; L: number }> = ({ T, L }) => (
  <g>
    <defs>
      <linearGradient id="cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffd9a0" stopOpacity={0.2} /><stop offset="1" stopColor="#ffb870" stopOpacity={0} /></linearGradient>
      <linearGradient id="shade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#3a2c1c" /><stop offset="0.45" stopColor="#8a6a3e" /><stop offset="1" stopColor="#2a1f14" /></linearGradient>
    </defs>
    <polygon points="908,236 1012,236 1360,940 560,940" fill="url(#cone)" opacity={clamp(L, 0, 1.5)} style={{ mixBlendMode: 'screen' }} />
    {Array.from({ length: 22 }, (_, i) => {
      const y = 260 + ((rnd(i, 1) * 660 + T * (6 + 8 * rnd(i, 2))) % 660);
      const half = lerp(50, 400, (y - 236) / 704);
      return <circle key={i} cx={960 + (rnd(i, 3) * 2 - 1) * half * 0.8 + Math.sin(T * 0.6 + i) * 8} cy={y} r={1 + rnd(i, 4) * 1.4} fill="#ffe6b8" opacity={(0.1 + 0.25 * rnd(i, 5)) * clamp(L, 0, 1)} />;
    })}
    <line x1={960} y1={-300} x2={960} y2={150} stroke="#1a1410" strokeWidth={5} />
    <path d="M 900 238 Q 908 170 960 152 Q 1012 170 1020 238 Z" fill="url(#shade)" />
    <ellipse cx={960} cy={238} rx={60} ry={8} fill={`rgba(255,220,160,${clamp(0.25 + 0.7 * L, 0, 1)})`} />
  </g>
);

/** far left, in shadow, dark label: only the needle matters (it lifts on the two silences) */
const Turntable: React.FC<{ T: number }> = ({ T }) => {
  const cx = 150, cy = 772, up = lifted(T);
  const skip = hit(T, EV.breath2, 0.12) - hit(T, EV.breath2 + 0.1, 0.12) * 0.6;
  return (
    <g opacity={0.8}>
      <polygon points="-70,712 370,712 412,870 -112,870" fill="#1a1109" />
      <g transform={`translate(${cx} ${cy}) scale(1 0.38)`}>
        <circle r={176} fill="#1e1e20" />
        <circle r={168} fill="#09090a" />
        {Array.from({ length: 12 }, (_, i) => <circle key={i} r={70 + i * 8} fill="none" stroke="#161618" strokeWidth={2} />)}
        <g transform={`rotate(${T * 200})`}>
          <path d="M 0 0 L 168 -18 A 168 168 0 0 1 168 18 Z" fill="#ffffff" opacity={0.05} />
          <circle r={56} fill="#3a2a20" />
          <rect x={-30} y={-5} width={60} height={10} fill="#6a5440" opacity={0.6} />
        </g>
      </g>
      <circle cx={335} cy={730} r={18} fill="#2a2a2e" stroke="#5a5a5e" strokeWidth={2} />
      <g transform={`translate(0 ${-22 * up}) rotate(${-24 + 3 * up + 5 * skip} 335 730)`}>
        <line x1={335} y1={730} x2={335} y2={858} stroke={up > 0.05 ? '#d8d8dc' : '#8a8a90'} strokeWidth={7} strokeLinecap="round" />
        <rect x={322} y={850} width={26} height={30} rx={3} fill="#2d2d31" stroke="#888" strokeWidth={1.5} />
      </g>
    </g>
  );
};

/* ---------------------------------------------------------------- cards */
const Card: React.FC<{ x: number; y: number; w?: number; flip: number; face?: React.ReactNode; tone?: 'cream' | 'gold' | 'red'; rot?: number; o?: number; lift?: number; sc?: number }> =
  ({ x, y, w = 150, flip, face, tone = 'cream', rot = 0, o = 1, lift = 0, sc = 1 }) => {
    if (o <= 0.001) return null;
    const h = w * 1.42, sx = Math.abs(Math.cos(Math.PI * clamp(flip))), showFace = flip >= 0.5;
    const bg = tone === 'gold' ? `linear-gradient(160deg, #ffe7ab, ${GOLD} 55%, #c8913a)` : tone === 'red' ? 'linear-gradient(160deg, #ff8d7e, #d8322a)' : `linear-gradient(160deg, #fffaf0, ${CREAM})`;
    const glow = tone === 'gold' && showFace ? `0 0 ${w * 0.25}px ${GOLD_GLOW}, 0 ${w * 0.1}px ${w * 0.16}px rgba(0,0,0,0.5)` : `0 0 ${w * 0.08}px rgba(241,197,109,0.35), 0 ${w * 0.1}px ${w * 0.16}px rgba(0,0,0,0.6)`;
    return (
      <>
        <div style={{ position: 'absolute', left: x - w * 0.55, top: y + h / 2 - w * 0.06, width: w * 1.1, height: w * 0.16, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', filter: `blur(${w * 0.05}px)`, opacity: o * clamp(1 - lift / (w * 1.2)) }} />
        <div style={{ position: 'absolute', left: x - w / 2, top: y - h / 2 - lift, width: w, height: h, opacity: o, transform: `rotate(${rot}deg) scale(${sc * Math.max(0.02, sx)}, ${sc})`, borderRadius: w * 0.07,
          background: showFace ? bg : `repeating-linear-gradient(45deg, #23305a 0 ${w * 0.05}px, #2c3b6b ${w * 0.05}px ${w * 0.1}px)`, border: showFace ? `${Math.max(1, w * 0.01)}px solid rgba(0,0,0,0.25)` : `${w * 0.03}px solid ${GOLD}`,
          boxShadow: glow, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {showFace ? face : <div style={{ width: w * 0.42, height: w * 0.42, transform: 'rotate(45deg)', border: `${w * 0.016}px solid ${GOLD}` }} />}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(120deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 40%)' }} />
        </div>
      </>
    );
  };
const FaceText: React.FC<{ s: string; size: number; color?: string; font?: string }> = ({ s, size, color = '#1a1410', font = ZH }) => (
  <span style={{ fontFamily: font, fontWeight: 900, fontSize: size, color, letterSpacing: '0.02em', textAlign: 'center', lineHeight: 1.1, whiteSpace: 'pre' }}>{s}</span>
);
const flipAt = (T: number, t: number, d = 0.12) => (T < t ? 0 : 0.5 + 0.5 * easeOut(prog(T, t, t + d)));
const Tag: React.FC<{ x: number; y: number; s: string; o: number; color?: string; size?: number }> = ({ x, y, s, o, color = GOLD, size = 26 }) => o <= 0.001 ? null : (
  <div style={{ position: 'absolute', left: x - 200, width: 400, top: y, textAlign: 'center', opacity: o, fontFamily: SANS, fontWeight: 900, fontSize: size, color, textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>{s}</div>
);

const WorldCards: React.FC<{ T: number }> = ({ T }) => {
  const out: React.ReactNode[] = [];
  if (inShot(T, 'open')) {
    let flip = 0, tone: 'red' | 'gold' = 'red', face = '空';
    if (T >= EV.cut1 && T < EV.replay) flip = easeOut(prog(T, EV.cut1, EV.cut1 + 0.2)) * (1 - easeInOut(prog(T, EV.replay - 0.3, EV.replay)));
    if (T >= EV.title) { flip = flipAt(T, EV.title, 0.1); tone = 'gold'; face = '嘭'; }
    const tr = T < EV.cut1 ? Math.sin(T * 50) * 2 * prog(T, 4, EV.cut1) : T > EV.replay && T < EV.title ? Math.sin(T * 50) * 2 * prog(T, 12, EV.title) : 0;
    out.push(<Card key="bet" x={960 + tr} y={712} w={170} flip={flip} tone={tone} lift={22 * hit(T, EV.title, 0.3)} face={<FaceText s={face} size={96} color={tone === 'gold' ? '#2a1a06' : '#fff4ef'} />} o={1 - prog(T, EV.title + 0.14, EV.title + 0.36)} />);
  }
  if (inShot(T, 'row')) {
    ['C', 'G', 'Am', 'F', 'C', 'G'].forEach((c, i) => {
      const t = down(i + 2), x = 560 + i * 160;
      out.push(<Card key={`ch${i}`} x={x} y={712} w={128} flip={flipAt(T, t)} lift={12 * hit(T, t, 0.3)} face={<FaceText s={c} size={58} font={EN} />} />);
      out.push(<Tag key={`ok${i}`} x={x} y={540} s="押中 ✓" size={24} o={vis(T, t + 0.05, t + 1.7, 0.12, 0.4)} />);
    });
    out.push(<Tag key="n" x={960} y={850} s="和弦为示意" size={15} color={DIM} o={0.7} />);
  }
  if (inShot(T, 'demo')) {
    // two small games. 1: sure it's F -> it's E (fooled, gold). 2: no idea -> the chord that resolves (gold).
    const r1 = L_.sure + 0.95, r2 = L_.unsure + 1.0, reset = L_.unsure - 0.1;
    const g2 = T >= reset;
    const faces1 = ['C', 'G', 'Am'], faces2 = ['B♭', 'E♭', 'F♯'];
    for (let i = 0; i < 3; i++) {
      const t1 = L_.two + 0.2 + i * 0.12, t2 = reset + 0.35 + i * 0.12;
      const fl = g2 ? (T < reset + 0.2 ? 1 - easeOut(prog(T, reset, reset + 0.2)) : flipAt(T, t2)) : flipAt(T, t1);
      out.push(<Card key={`d${i}`} x={660 + i * 200} y={712} w={140} flip={fl} face={<FaceText s={g2 ? faces2[i] : faces1[i]} size={58} font={EN} />} />);
    }
    const last = g2 ? (T < reset + 0.2 ? 1 - easeOut(prog(T, reset, reset + 0.2)) : flipAt(T, r2)) : flipAt(T, r1);
    out.push(<Card key="d3" x={1260} y={712} w={140} flip={last} tone="gold" lift={26 * hit(T, g2 ? r2 : r1, 0.35)} face={<FaceText s={g2 ? 'C' : 'E'} size={62} font={EN} color="#2a1a06" />} />);
    // the guess hovering above card 4
    if (!g2) {
      const o = vis(T, L_.two + 0.8, r1 + 0.05, 0.3, 0.1);
      out.push(<div key="gF" style={{ position: 'absolute', left: 1260 - 80, width: 160, top: 470, textAlign: 'center', opacity: o, fontFamily: EN, fontWeight: 700, fontSize: 96, color: 'rgba(243,237,226,0.9)', textShadow: '0 0 18px rgba(243,237,226,0.4)' }}>F</div>);
      out.push(<Tag key="gF2" x={1260} y={430} s="很确定" size={22} color={INK} o={o} />);
      out.push(<Tag key="r1" x={1260} y={430} s="被骗了！" size={30} o={vis(T, r1 + 0.05, reset, 0.1, 0.2)} />);
    } else {
      const o = vis(T, reset + 0.8, r2 + 0.05, 0.3, 0.1);
      ['D', 'G♯', 'F', 'A♭'].forEach((g, i) => out.push(<div key={`g${i}`} style={{ position: 'absolute', left: 1260 - 60 + [-46, 40, -20, 52][i], width: 120, top: 470 + [-10, 14, 30, -24][i], textAlign: 'center', opacity: o * (0.22 + 0.16 * Math.sin(T * 2.2 + i * 1.7)), fontFamily: EN, fontWeight: 700, fontSize: 64, color: INK }}>{g}</div>));
      out.push(<Tag key="gq" x={1260} y={430} s="完全没底" size={22} color={INK} o={o} />);
      out.push(<Tag key="r2" x={1260} y={430} s="押中了！" size={30} o={vis(T, r2 + 0.05, SHOT.demo[1], 0.1, 0.2)} />);
    }
  }
  if (inShot(T, 'build') || inShot(T, 'drop')) {
    const tre = easeIn(prog(T, EV.build, EV.hush)) * (T > EV.breath2 ? 1.6 : 1) * (T >= EV.pickup ? 0 : 1);
    ['押', '中', '了', '！'].forEach((f, i) => {
      const t = EV.pickup + i * 0.03;
      out.push(<Card key={`b${i}`} x={735 + i * 150 + Math.sin(T * (40 + 7 * i)) * 4 * tre} y={712} w={132} rot={Math.sin(T * (33 + 5 * i)) * 1.6 * tre} tone="gold"
        flip={flipAt(T, t, 0.1)} lift={28 * hit(T, t, 0.35) + 14 * hit(T, EV.drop, 0.3)} sc={1 + 0.12 * hit(T, EV.pickup, 0.22) + 0.04 * hit(T, EV.drop, 0.2)}
        face={<FaceText s={f} size={78} color="#2a1a06" />} />);
    });
  }
  if (inShot(T, 'take')) {
    // the deck behind fans out on the last line: every song you've heard
    const fan = easeOut(prog(T, L_.tk3 + 0.2, L_.tk3 + 1.6));
    for (let i = 0; i < 24; i++) {
      const u = i / 23 - 0.5;
      out.push(<Card key={`fan${i}`} x={960 + u * 1100 * fan} y={760 + Math.abs(u) * 60 * fan} w={70} flip={0} rot={u * 50 * fan} o={fan} />);
    }
    [[L_.tk1, '副歌重复', '让你押中'], [L_.tk2, 'drop 前\n停一下', '让你多押一会儿']].forEach(([t, h, s], i) => {
      out.push(<Card key={`t${i}`} x={770 + i * 380} y={690} w={250} flip={flipAt(T, (t as number) + 0.1, 0.14)} tone="gold" lift={16 * hit(T, (t as number) + 0.1, 0.3)} face={
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <FaceText s={h as string} size={(h as string).length > 5 ? 38 : 44} color="#2a1a06" /><span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 22, color: '#4a3612' }}>{s as string}</span>
        </div>} />);
    });
  }
  if (inShot(T, 'close')) out.push(<Card key="last" x={960} y={712} w={170} flip={0} />);
  return <>{out}</>;
};

const Stage: React.FC<{ T: number }> = ({ T }) => {
  const L = lamp(T);
  const cam = camAt(T);
  const [sx, sy] = shakeAt(T);
  const tr = `translate(${960 + sx}px, ${540 + sy}px) scale(${cam.z}) translate(${-cam.cx}px, ${-cam.cy}px)`;
  const dim = inShot(T, 'graph1') || inShot(T, 'graph2') ? 0.72 : 0;
  return (
    <AbsoluteFill style={{ overflow: 'hidden', backgroundColor: '#040303' }}>
      <AbsoluteFill style={{ transform: tr, transformOrigin: '0 0' }}>
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          <Wall T={T} L={L} />
          <Table L={L} />
          <Lamp T={T} L={L} />
        </svg>
        <div style={{ position: 'absolute', left: -1500, top: -1500, width: 4920, height: 4080, background: '#000', opacity: L < 0.06 ? 1 : clamp(0.92 * (1 - L), 0, 0.92) }} />
        <WorldCards T={T} />
        {L < 0.06 && <div style={{ position: 'absolute', left: -1500, top: -1500, width: 4920, height: 4080, background: '#000' }} />}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 70% 65% at 50% 58%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.65) 100%)' }} />
      {dim > 0 && <AbsoluteFill style={{ background: `rgba(3,2,2,${dim})` }} />}
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- graphs (screen space, gentle and directional) */
const GX0 = 430, GX1 = 1490, GY = 790, GH = 430;
const curveY = (x: number, peak = 960, w = 250, h = GH) => GY - h * Math.exp(-Math.pow((x - peak) / w, 2));
const curvePath = (peak = 960, w = 250, h = GH, x0 = GX0 + 10, x1 = GX1 - 10) => {
  let d = '';
  for (let x = x0; x <= x1; x += 8) d += `${d ? 'L' : 'M'} ${x.toFixed(1)} ${curveY(x, peak, w, h).toFixed(1)} `;
  return d;
};
const Axes: React.FC<{ o: number; left: string; right: string }> = ({ o, left, right }) => (
  <g opacity={o}>
    <line x1={GX0} y1={GY} x2={GX1} y2={GY} stroke="rgba(243,237,226,0.5)" strokeWidth={2} />
    <line x1={GX0} y1={GY} x2={GX0} y2={GY - GH - 40} stroke="rgba(243,237,226,0.5)" strokeWidth={2} />
    <text x={GX0 - 16} y={GY - GH - 20} textAnchor="end" style={{ fontFamily: ZH, fontWeight: 900, fontSize: 28, fill: INK }}>爽</text>
    <text x={GX0} y={GY + 46} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 24, fill: DIM }}>{left}</text>
    <text x={GX1} y={GY + 46} textAnchor="end" style={{ fontFamily: SANS, fontWeight: 700, fontSize: 24, fill: DIM }}>{right}</text>
    <text x={960} y={GY + 46} textAnchor="middle" style={{ fontFamily: SANS, fontSize: 20, fill: 'rgba(243,237,226,0.4)' }}>意外程度 →</text>
  </g>
);

/** the sweet-spot curve with a small card riding it: left (腻), right (噪音), then the peak (甜区) */
const Graph1: React.FC<{ T: number }> = ({ T }) => {
  if (!inShot(T, 'graph1')) return null;
  const a = SHOT.graph1[0];
  const draw = easeInOut(prog(T, a + 0.1, a + 0.9));
  // card position along x: centre -> left -> right -> centre, eased, moving all the time but slowly
  const xs: [number, number][] = [[a, 960], [a + 1.0, 960], [L_.bored + 1.9, 500], [L_.noise + 0.2, 500], [L_.noise + 1.9, 1420], [L_.cheung + 0.2, 1420], [L_.cheung + 1.8, 960]];
  let x = 960;
  for (let i = 0; i < xs.length - 1; i++) if (T >= xs[i][0]) x = lerp(xs[i][1], xs[i + 1][1], easeInOut(prog(T, xs[i][0], xs[i + 1][0])));
    const y = curveY(x);
  const atPeak = easeOut(prog(T, L_.cheung + 1.6, L_.cheung + 2.1));
  const tagL = vis(T, L_.bored + 1.6, L_.noise + 0.6, 0.3, 0.4), tagR = vis(T, L_.noise + 1.6, L_.cheung + 0.6, 0.3, 0.4);
  return (
    <AbsoluteFill>
      <svg className="g" width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <Axes o={easeOut(prog(T, a, a + 0.4))} left="全猜中" right="全猜不中" />
        <rect x={830} y={GY - GH - 30} width={260} height={GH + 30} fill={GOLD} opacity={0.08 * atPeak} />
        <path d={curvePath()} fill="none" stroke={GOLD} strokeWidth={5} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw} style={{ filter: `drop-shadow(0 0 10px ${GOLD_GLOW})` }} />
        <text x={500} y={curveY(500) - 70} textAnchor="middle" opacity={tagL} style={{ fontFamily: ZH, fontWeight: 900, fontSize: 40, fill: INK }}>几遍就腻</text>
        <text x={1420} y={curveY(1420) - 70} textAnchor="middle" opacity={tagR} style={{ fontFamily: ZH, fontWeight: 900, fontSize: 40, fill: INK }}>噪音</text>
        <text x={960} y={GY - GH - 58} textAnchor="middle" opacity={atPeak} style={{ fontFamily: ZH, fontWeight: 900, fontSize: 56, fill: GOLD, filter: `drop-shadow(0 0 14px ${GOLD_GLOW})` }}>甜区</text>
        <text x={960} y={196} textAnchor="middle" opacity={vis(T, L_.cheung, SHOT.graph1[1], 0.3, 0.3)} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 18, letterSpacing: '0.3em', fill: DIM }}>CHEUNG 等 2019 · 745 首 BILLBOARD 歌 · 约 80,000 个和弦</text>
      </svg>
      <div style={{ position: 'absolute', left: x - 26, top: y - 37, width: 52, height: 74, borderRadius: 5, background: atPeak > 0 ? `linear-gradient(160deg, #ffe7ab, ${GOLD})` : 'repeating-linear-gradient(45deg, #23305a 0 4px, #2c3b6b 4px 8px)',
        border: `2px solid ${GOLD}`, boxShadow: `0 0 ${10 + 24 * atPeak}px ${GOLD_GLOW}`, opacity: easeOut(prog(T, a + 0.6, a + 0.9)) }} />
    </AbsoluteFill>
  );
};

/** many people's curves: the sweet spot moves from person to person; jazz lovers sit further right; training doesn't sort them */
const PEOPLE = Array.from({ length: 11 }, (_, i) => ({ peak: 700 + (i / 10) * 560 + (rnd(i, 7) - 0.5) * 40, w: 200 + rnd(i, 8) * 80, h: GH * (0.75 + 0.25 * rnd(i, 9)), trained: rnd(i, 11) > 0.5 }));
const JAZZ = 9;
const Graph2: React.FC<{ T: number }> = ({ T }) => {
  if (!inShot(T, 'graph2')) return null;
  const a = SHOT.graph2[0];
  const one = easeInOut(prog(T, a + 0.1, a + 0.9));
  const split = easeInOut(prog(T, L_.study + 0.3, L_.study + 1.8));
  const sides = vis(T, L_.spread + 0.3, L_.jazz + 0.2, 0.4, 0.3);
  const jazz = easeOut(prog(T, L_.jazz + 0.4, L_.jazz + 0.9));
  const train = easeOut(prog(T, L_.train + 0.3, L_.train + 0.8));
  return (
    <AbsoluteFill>
      <svg className="g" width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <Axes o={easeOut(prog(T, a, a + 0.4))} left="偏爱好猜" right="偏爱意外" />
        {PEOPLE.map((p, i) => {
          const pk = lerp(960, p.peak + Math.sin(T * 0.8 + i) * 8, split), w = lerp(250, p.w, split), h = lerp(GH, p.h, split);
          const isJ = i === JAZZ;
          const col = isJ && jazz > 0 ? GOLD : train > 0 ? (p.trained ? CREAM : COOL) : 'rgba(241,197,109,0.55)';
          const op = i === 5 ? 1 : split * (isJ ? 1 : lerp(0.75, 0.3, jazz) + 0.45 * train);
          return (
            <g key={i} opacity={op}>
              <path d={curvePath(pk, w, h)} fill="none" stroke={col} strokeWidth={isJ && jazz > 0 ? 5 : i === 5 && split < 0.05 ? 5 : 2} pathLength={1} strokeDasharray="1" strokeDashoffset={i === 5 ? 1 - one : 0}
                style={isJ && jazz > 0 ? { filter: `drop-shadow(0 0 10px ${GOLD_GLOW})` } : undefined} />
              <circle cx={pk} cy={GY - h} r={isJ && jazz > 0 ? 9 : 6} fill={col} opacity={split} />
            </g>
          );
        })}
        <text x={960} y={250} textAnchor="middle" opacity={vis(T, L_.study, SHOT.graph2[1], 0.3, 0.3)} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 18, letterSpacing: '0.3em', fill: DIM }}>MAS-HERRERO & MARCO-PALLARÉS · 2025 · PNAS · 406 人</text>
        <text x={960} y={GY - GH - 50} textAnchor="middle" opacity={one * (1 - split)} style={{ fontFamily: ZH, fontWeight: 900, fontSize: 56, fill: GOLD }}>甜区</text>
        <text x={GX0 + 60} y={GY - 140} opacity={sides} style={{ fontFamily: ZH, fontWeight: 900, fontSize: 34, fill: INK }}>← 有人在这</text>
        <text x={GX1 - 60} y={GY - 140} textAnchor="end" opacity={sides} style={{ fontFamily: ZH, fontWeight: 900, fontSize: 34, fill: INK }}>有人在这 →</text>
        <text x={PEOPLE[JAZZ].peak} y={GY - PEOPLE[JAZZ].h - 30} textAnchor="middle" opacity={jazz * (1 - train * 0.6)} style={{ fontFamily: ZH, fontWeight: 900, fontSize: 38, fill: GOLD, filter: `drop-shadow(0 0 12px ${GOLD_GLOW})` }}>爵士乐迷 ♪</text>
        <g opacity={train} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 22 }}>
          <circle cx={1180} cy={200} r={8} fill={CREAM} /><text x={1196} y={207} style={{ fill: INK }}>学过音乐</text>
          <circle cx={1340} cy={200} r={8} fill={COOL} /><text x={1356} y={207} style={{ fill: INK }}>没学过</text>
          <text x={GX0 + 20} y={200} style={{ fill: DIM, fontWeight: 400 }}>两种人，左右都有</text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- HUD and type */
const Bar: React.FC<{ T: number }> = ({ T }) => {
  if (T > L_.end - 0.2 || (T > EV.title && T < EV.title + 3.3)) return null;
  const v = gauge(T), fill = clamp(v), over = clamp((v - 1) / 0.18);
  const H = 470, top = 300, x = 1768, w = 40;
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      <rect x={x} y={top} width={w} height={H} rx={w / 2} fill="rgba(255,255,255,0.04)" stroke="rgba(241,197,109,0.35)" strokeWidth={2} />
      {Array.from({ length: 9 }, (_, i) => <line key={i} x1={x - 10} x2={x - 2} y1={top + 20 + i * ((H - 40) / 8)} y2={top + 20 + i * ((H - 40) / 8)} stroke="rgba(243,237,226,0.3)" strokeWidth={1.5} />)}
      <rect x={x + 6} y={top + H - 6 - (H - 12) * fill} width={w - 12} height={(H - 12) * fill} rx={(w - 12) / 2} fill={GOLD} style={{ filter: `drop-shadow(0 0 ${10 + 30 * over}px ${GOLD_GLOW})` }} />
      <rect x={x + 10} y={top + 14} width={6} height={H - 28} rx={3} fill="#fff" opacity={0.12} />
      {over > 0 && <rect x={x - 6} y={top - 6} width={w + 12} height={H + 12} rx={(w + 12) / 2} fill="none" stroke={GOLD} strokeWidth={3} opacity={over * (0.5 + 0.5 * hit(T, EV.pickup, 0.5))} />}
      <text x={x + w / 2} y={top + H + 44} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 900, fontSize: 24, fill: INK }}>期待值</text>
      <text x={x + w / 2} y={top + H + 70} textAnchor="middle" style={{ fontFamily: SANS, fontSize: 16, fill: DIM }}>示意</text>
    </svg>
  );
};

const Big: React.FC<{ s: string; y: number; size: number; color?: string; o?: number; font?: string; glow?: string; weight?: number; dy?: number }> =
  ({ s, y, size, color = INK, o = 1, font = ZH, glow, weight = 900, dy = 0 }) => o <= 0.001 ? null : (
    <div style={{ position: 'absolute', left: 0, right: 0, top: y - size * 0.6 + dy, textAlign: 'center', opacity: o, fontFamily: font, fontWeight: weight, fontSize: size, color,
      letterSpacing: '0.04em', textShadow: glow ? `0 0 26px ${glow}` : '0 4px 20px rgba(0,0,0,0.8)', whiteSpace: 'pre' }}>{s}</div>
  );
const land = (T: number, a: number) => (1 - easeOut(prog(T, a, a + 0.18))) * 26;

const Counts: React.FC<{ T: number }> = ({ T }) => {
  if (T > EV.title + 0.1) return null;
  const out: React.ReactNode[] = [];
  [EV.cut1, EV.title].forEach((t, j) => ['3', '2', '1'].forEach((n, i) => {
    const t0 = t - (3 - i) * BEAT, o = vis(T, t0, t0 + BEAT, 0.05, 0.12);
    if (o > 0) out.push(<Big key={`${j}${i}`} s={n} y={300} size={190} color={GOLD} o={o} font={EN} weight={700} glow={GOLD_GLOW} dy={land(T, t0)} />);
  }));
  out.push(<Big key="miss" s="押空了" y={300} size={120} color={RED} o={vis(T, EV.cut1 + 0.25, EV.replay - 0.1, 0.1, 0.3)} dy={land(T, EV.cut1 + 0.25)} glow="rgba(255,60,40,0.5)" />);
  return <>{out}</>;
};

const TitleCard: React.FC<{ T: number }> = ({ T }) => {
  const a = EV.title, z = a + 3.3;
  if (T < a - 0.05 || T > z + 0.4) return null;
  const out = easeInOut(prog(T, z - 0.2, z + 0.3));
  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 48%, rgba(4,3,2,0.75) 0%, rgba(4,3,2,0.45) 100%)' }} />
      {[...'大脑是个赌徒'].map((c, i) => {
        const k = easeOut(prog(T, a + 0.1 + i * 0.045, a + 0.28 + i * 0.045));
        return <div key={i} style={{ position: 'absolute', left: 960 + (i - 2.5) * 200 - 100, width: 200, top: 340 + (1 - k) * 40, textAlign: 'center', opacity: k, fontFamily: ZH, fontWeight: 900, fontSize: 180, color: GOLD, textShadow: `0 0 30px ${GOLD_GLOW}` }}>{c}</div>;
      })}
      <div style={{ position: 'absolute', left: 960 - 470 * easeOut(prog(T, a + 0.3, a + 0.7)), width: 940 * easeOut(prog(T, a + 0.3, a + 0.7)), top: 600, height: 3, background: GOLD, boxShadow: `0 0 12px ${GOLD_GLOW}` }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 630, textAlign: 'center', opacity: easeOut(prog(T, a + 0.5, a + 0.9)), fontFamily: MONO, fontWeight: 700, fontSize: 28, letterSpacing: '0.5em', color: DIM }}>{JUNO.series}</div>
    </AbsoluteFill>
  );
};

const BuildO: React.FC<{ T: number }> = ({ T }) => {
  if (T < EV.riser || T > EV.hush + 0.05) return null;
  const left = Math.max(0, EV.breath2 - T), over = T >= EV.breath2;
  const o = vis(T, EV.riser + 0.3, EV.hush + 0.03, 0.4, 0.04);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 176, textAlign: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: '0.5em', color: over ? RED : DIM }}>距离 DROP</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 210, textAlign: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 96, color: over ? RED : INK, fontVariantNumeric: 'tabular-nums', textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}>{left.toFixed(1)}</div>
      <Big s="+1 小节" y={372} size={96} color={RED} o={vis(T, EV.breath2 + 0.03, EV.hush + 0.03, 0.06, 0.04)} dy={land(T, EV.breath2 + 0.03)} glow="rgba(255,60,40,0.5)" />
    </AbsoluteFill>
  );
};

const WinO: React.FC<{ T: number }> = ({ T }) => {
  const a = EV.pickup;
  if (T < a || T > a + 2) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 58%, rgba(241,197,109,${0.45 * hit(T, a, 0.6) + 0.18 * hit(T, EV.drop, 0.4)}) 0%, rgba(0,0,0,0) 60%)`, mixBlendMode: 'screen' }} />
      {Array.from({ length: 60 }, (_, i) => {
        const ang = rnd(i) * Math.PI * 2, sp = 300 + 900 * rnd(i, 1), t = T - a;
        if (t > 1.8) return null;
        const r = sp * easeOut(clamp(t / 1.8));
        return <div key={i} style={{ position: 'absolute', left: 960 + Math.cos(ang) * r, top: 590 + Math.sin(ang) * r * 0.65 + 120 * t * t, width: 6 + 6 * rnd(i, 2), height: 6 + 6 * rnd(i, 2), borderRadius: '50%', background: GOLD, opacity: 1 - t / 1.8, boxShadow: `0 0 12px ${GOLD_GLOW}` }} />;
      })}
    </AbsoluteFill>
  );
};

const EndCard: React.FC<{ T: number }> = ({ T }) => {
  const a = L_.end;
  if (T < a) return null;
  const k = (d: number) => easeOut(prog(T, a + d, a + d + 0.4));
  const black = easeIn(prog(T, FILM_END - 0.6, FILM_END));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `rgba(4,3,2,${0.6 * k(0)})` }} />
      <Big s="大脑是个赌徒" y={290} size={100} color={GOLD} o={k(0)} glow={GOLD_GLOW} />
      <Big s="你的甜区偏哪边：好猜，还是意外？" y={450} size={58} o={k(0.4)} dy={land(T, a + 0.4)} />
      <Big s="评论区说说你单曲循环的那首" y={530} size={28} color={DIM} o={k(0.8)} font={SANS} weight={400} />
      <div style={{ position: 'absolute', left: 960 - 330, top: 590, width: 660, height: 56, borderRadius: 28, border: `2px solid ${GOLD}`, opacity: k(1.0), display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: '0.2em', color: INK }}>{JUNO.follow}</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 712, textAlign: 'center', opacity: 0.6 * k(1.2), fontFamily: SANS, fontSize: 17, color: INK, lineHeight: 1.8 }}>
        资料：Cheung 等 2019 Current Biology · Gold 等 2019 J Neurosci · Salimpoor 等 2011 Nature Neuroscience · Mas-Herrero & Marco-Pallarés 2025 PNAS · Huron《Sweet Anticipation》2006<br />
        "赌""押注"为比喻 · 期待值、脑图和曲线为示意 · 背景音乐为演示重新剪辑
      </div>
      <AbsoluteFill style={{ background: '#000', opacity: black }} />
    </AbsoluteFill>
  );
};

export const Final: React.FC<{ at?: number }> = ({ at: atT }) => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = atT ?? frame / fps;
  const mark = easeOut(prog(T, EV.title + 3.4, EV.title + 4.2)) * (1 - prog(T, L_.end - 0.3, L_.end));
  return (
    <LookCtx.Provider value={LOOKS.night}>
      <AbsoluteFill style={{ backgroundColor: '#040303' }}>
        <style>{`
          @font-face { font-family: "JunoMono"; src: url(${staticFile('fonts/DejaVuSansMono.ttf')}) format("truetype"); font-weight: 400; }
          @font-face { font-family: "JunoMono"; src: url(${staticFile('fonts/DejaVuSansMono-Bold.ttf')}) format("truetype"); font-weight: 700; }
          @font-face { font-family: "Cormorant Garamond"; src: url(${staticFile('fonts/cormorant-garamond-latin-700-normal.woff2')}) format("woff2"); font-weight: 700; }
          .g text { paint-order: stroke; stroke: rgba(5,4,3,0.92); stroke-width: 10px; stroke-linejoin: round; }
          .lb text { paint-order: stroke; stroke: #dbe6f0; stroke-width: 6px; stroke-linejoin: round; }
        `}</style>
        <Stage T={T} />
        <Graph1 T={T} />
        <Graph2 T={T} />
        <Counts T={T} />
        <BuildO T={T} />
        <WinO T={T} />
        <Bar T={T} />
        <TitleCard T={T} />
        <EndCard T={T} />
        <AbsoluteFill style={{ opacity: 0.07, pointerEvents: 'none' }}><Img src={staticFile('grain0.png')} style={{ width: '100%', height: '100%' }} /></AbsoluteFill>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: BAR, background: '#000' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: BAR, background: '#000' }} />
        <Subtitles T={T} />
        {mark > 0.001 && (
          <div style={{ position: 'absolute', top: 50, right: 60, opacity: 0.6 * mark, fontFamily: SANS, fontWeight: 500, fontSize: 20, letterSpacing: '0.3em', color: 'rgba(243,237,226,0.58)' }}>
            <span style={{ color: GOLD }}>◆ </span>{JUNO.mark}
          </div>
        )}
      </AbsoluteFill>
    </LookCtx.Provider>
  );
};
