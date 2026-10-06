import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';

/* 《心流》premium-manga teaser (19 s). Motion recipes adapted from video-shotcraft cards:
   comic-panel-split (staggered panel pops + 12° gutters), sakuga-timing-shift (3-frame counter steps),
   line-boil (hold frames redrawn every 3 f), anime-impact (3 f negative + concentration lines + RGB split
   + decaying shake), marker-underline-title, ink-bleed-reveal (turbulent mask, unmounted when full). */
export const MT_FRAMES = 570;
const SERIF = '"Noto Serif CJK SC", serif', NUM = '"Cormorant Garamond", serif';
const INK = '#111111', PAPER = '#F4F1EA', RED = '#D7261E';
const cl = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
const ip = (f: number, a: number, b: number, v0 = 0, v1 = 1, ease?: (t: number) => number) => interpolate(f, [a, b], [v0, v1], { ...cl, easing: ease });
const oc = Easing.out(Easing.cubic), ic = Easing.in(Easing.cubic), ioc = Easing.inOut(Easing.cubic);
const rnd = (i: number) => { const s = Math.sin(i * 127.3) * 43758.5453; return s - Math.floor(s); };
const rng = (seed: number) => { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); };

/* timeline (frames) */
const PA = 0, PB = 5, PC = 10;                  // panel pops (comic-panel-split, 3 f each)
const NARR1 = 108, TURN = 160, P2 = 172, NARR2 = 180, RISE = 214, HIT = 270, LINE = 284, BLEED = 378, BLEED_END = 444, NARR3 = 470, OUT = 552;

const Defs: React.FC<{ f: number; boil: boolean }> = ({ f, boil }) => (
  <defs>
    <pattern id="dot1" width={9} height={9} patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx={4.5} cy={4.5} r={2.1} fill={INK} /></pattern>
    <pattern id="dot2" width={7} height={7} patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx={3.5} cy={3.5} r={1.1} fill={INK} /></pattern>
    <pattern id="hatch" width={10} height={10} patternUnits="userSpaceOnUse" patternTransform="rotate(-35)"><line x1={0} y1={0} x2={0} y2={10} stroke={INK} strokeWidth={1.6} /></pattern>
    <pattern id="hatch2" width={7} height={7} patternUnits="userSpaceOnUse" patternTransform="rotate(55)"><line x1={0} y1={0} x2={0} y2={7} stroke={INK} strokeWidth={1.2} /></pattern>
    <linearGradient id="fadeDown" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#fff" stopOpacity="1" /></linearGradient>
    <linearGradient id="fadeUp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="1" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
    <mask id="mDown" maskContentUnits="objectBoundingBox"><rect width={1} height={1} fill="url(#fadeDown)" /></mask>
    <mask id="mUp" maskContentUnits="objectBoundingBox"><rect width={1} height={1} fill="url(#fadeUp)" /></mask>
    <filter id="paperF" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="8" />
      <feColorMatrix type="matrix" values="0 0 0 0 0.3  0 0 0 0 0.28  0 0 0 0 0.24  0 0 0 0.07 0" />
    </filter>
    {/* line-boil: only mounted during holds; seed steps every 3 frames */}
    {boil && (
      <filter id="boil" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="2" seed={Math.floor(f / 3)} result="t" />
        <feDisplacementMap in="SourceGraphic" in2="t" scale="7" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    )}
  </defs>
);
const Paper: React.FC = () => <><rect width={1920} height={1080} fill={PAPER} /><rect width={1920} height={1080} filter="url(#paperF)" /></>;
const radial = (cx: number, cy: number, r0: number, n: number, seed: number, len = 1700, wmax = 0.008) => {
  const r = rng(seed); const out: string[] = [];
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + r() * 0.03, w = 0.002 + r() * wmax, ri = r0 * (0.85 + r() * 0.5); out.push(`M${(cx + ri * Math.cos(a)).toFixed(1)},${(cy + ri * Math.sin(a)).toFixed(1)} L${(cx + len * Math.cos(a - w)).toFixed(1)},${(cy + len * Math.sin(a - w)).toFixed(1)} L${(cx + len * Math.cos(a + w)).toFixed(1)},${(cy + len * Math.sin(a + w)).toFixed(1)} Z`); }
  return out.join(' ');
};
/** narration box whose text types on at ~2 characters per frame (typewriter) */
const Narr: React.FC<{ x: number; y: number; w: number; lines: string[]; s: number; f: number; at: number }> = ({ x, y, w, lines, s, f, at }) => {
  if (f < at) return null;
  const pop = ip(f, at, at + 4, 0, 1, oc);
  let budget = Math.floor((f - at - 3) * 1.4);
  return (
    <g transform={`translate(${x},${y}) scale(${0.96 + 0.04 * pop})`} opacity={pop}>
      <rect x={0} y={0} width={w} height={lines.length * s * 1.5 + s * 0.8} fill="#FFFFFF" stroke={INK} strokeWidth={3} />
      {lines.map((l, i) => { const n = Math.max(0, Math.min(l.length, budget)); budget -= l.length; return <text key={i} x={s * 0.7} y={s * 1.35 + i * s * 1.5} style={{ fontFamily: SERIF, fontWeight: 700, fontSize: s }} fill={INK}>{l.slice(0, n)}</text>; })}
    </g>
  );
};
/** ink panel: clip + border; pops 1.06 → 1 over 3 frames, hard mount (no fade) */
const Panel: React.FC<{ d: string; id: string; f: number; at: number; cx: number; cy: number; children: React.ReactNode }> = ({ d, id, f, at, cx, cy, children }) => {
  if (f < at) return null;
  const s = ip(f, at, at + 3, 1.06, 1, oc);
  return (
    <g transform={`translate(${cx},${cy}) scale(${s}) translate(${-cx},${-cy})`}>
      <defs><clipPath id={id}><path d={d} /></clipPath></defs>
      <g clipPath={`url(#${id})`}>{children}</g>
      <path d={d} fill="none" stroke={INK} strokeWidth={7} strokeLinejoin="miter" />
    </g>
  );
};
const clockTime = (m: number) => { const h = Math.floor(((m % 1440) + 1440) % 1440 / 60), mm = Math.floor(((m % 60) + 60) % 60); return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`; };

/* ---------- page 1 ---------- */
const Page1: React.FC<{ f: number }> = ({ f }) => {
  const A = 'M40,40 L1150,40 L1060,1040 L40,1040 Z', B = 'M1180,40 L1880,40 L1880,520 L1138,520 Z', Cc = 'M1135,550 L1880,550 L1880,1040 L1090,1040 Z';
  const r = rng(4);
  const city = Array.from({ length: 14 }, (_, i) => ({ x: 60 + i * 80, h: 140 + r() * 260, win: Array.from({ length: 10 }, () => r() > 0.78) }));
  // sakuga counter: 23:00 → 02:47 in 3-frame steps (227 minutes over 45 frames, then holds)
  const stepF = Math.floor(f / 3) * 3;
  const nightMin = 23 * 60 + Math.round(227 * ip(stepF, 3, 48, 0, 1, Easing.in(Easing.quad)));
  // the afternoon crawls: 20:00 → 20:10, one minute every 9 frames
  const dayMin = 20 * 60 + Math.min(10, Math.max(0, Math.floor((f - 18) / 9)));
  const boilOn = f >= 50 && f < TURN;
  const lines = radial(560, 640, 120, 150, 11 + Math.floor(f / 3), 1400, 0.008);
  const push = 1 + 0.035 * ip(f, 0, TURN, 0, 1);
  const secA = (f / 30) * 6;
  return (
    <g transform={`translate(960,540) scale(${push}) translate(-960,-540)`}>
      <Paper />
      <Panel d={A} id="pa" f={f} at={PA} cx={545} cy={540}>
        <rect width={1200} height={1080} fill={INK} />
        {city.map((c, i) => <g key={i}><rect x={c.x} y={760 - c.h} width={66} height={c.h + 400} fill="#1C1C1C" stroke="#2A2A2A" strokeWidth={2} />{c.win.map((w, j) => (w ? <rect key={j} x={c.x + 10 + (j % 3) * 18} y={780 - c.h + 30 + Math.floor(j / 3) * 34} width={10} height={14} fill={PAPER} opacity={0.85} /> : null))}</g>)}
        <path d={lines} fill={PAPER} opacity={0.72} />
        <rect x={360} y={520} width={400} height={250} fill={PAPER} />
        <rect x={380} y={540} width={360} height={210} fill="url(#dot1)" mask="url(#mUp)" />
        <g filter={boilOn ? 'url(#boil)' : undefined}>
          <path d="M420,1080 C420,900 480,840 560,840 C640,840 700,900 700,1080 Z" fill={INK} stroke={PAPER} strokeWidth={4} />
          <circle cx={560} cy={790} r={84} fill={INK} stroke={PAPER} strokeWidth={4} />
        </g>
        <rect x={70} y={50} width={480} height={220} fill={INK} />
        <text x={110} y={180} style={{ fontFamily: NUM, fontStyle: 'italic', fontWeight: 700, fontSize: 150 }} fill={PAPER}>{clockTime(nightMin)}</text>
        <text x={116} y={240} style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 30, letterSpacing: '0.3em' }} fill={PAPER} opacity={0.75}>打游戏</text>
      </Panel>
      <Panel d={B} id="pb" f={f} at={PB} cx={1510} cy={280}>
        <rect x={1100} width={800} height={600} fill={PAPER} />
        <rect x={1100} y={300} width={800} height={260} fill="url(#dot1)" mask="url(#mDown)" opacity={0.7} />
        <circle cx={1500} cy={300} r={190} fill="#FFFFFF" stroke={INK} strokeWidth={9} />
        {Array.from({ length: 60 }, (_, i) => { const t = i * Math.PI / 30; const L = i % 5 ? 10 : 26; return <line key={i} x1={1500 + (178 - L) * Math.cos(t)} y1={300 + (178 - L) * Math.sin(t)} x2={1500 + 176 * Math.cos(t)} y2={300 + 176 * Math.sin(t)} stroke={INK} strokeWidth={i % 5 ? 2 : 6} />; })}
        <line x1={1500} y1={300} x2={1500 + 140 * Math.sin(((dayMin % 60) * 6) * Math.PI / 180)} y2={300 - 140 * Math.cos(((dayMin % 60) * 6) * Math.PI / 180)} stroke={INK} strokeWidth={9} strokeLinecap="round" />
        <line x1={1500} y1={300} x2={1500 + 100 * Math.sin((240 + (dayMin % 60) * 0.5) * Math.PI / 180)} y2={300 - 100 * Math.cos((240 + (dayMin % 60) * 0.5) * Math.PI / 180)} stroke={INK} strokeWidth={12} strokeLinecap="round" />
        <line x1={1500} y1={300} x2={1500 + 160 * Math.sin(secA * Math.PI / 180)} y2={300 - 160 * Math.cos(secA * Math.PI / 180)} stroke={RED} strokeWidth={4} strokeLinecap="round" />
        <circle cx={1500} cy={300} r={12} fill={INK} />
      </Panel>
      <Panel d={Cc} id="pc" f={f} at={PC} cx={1485} cy={795}>
        <rect x={1080} y={540} width={820} height={520} fill={PAPER} />
        <rect x={1080} y={540} width={820} height={520} fill="url(#hatch)" opacity={0.25} />
        <text x={1820} y={760} textAnchor="end" style={{ fontFamily: NUM, fontStyle: 'italic', fontWeight: 700, fontSize: 150 }} fill={INK}>{clockTime(dayMin)}</text>
        <text x={1820} y={820} textAnchor="end" style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 30, letterSpacing: '0.3em' }} fill={INK} opacity={0.7}>写作业</text>
        <path d="M1180,930 q40,-34 80,0 q40,34 80,0 q40,-34 80,0" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" strokeDasharray={260} strokeDashoffset={260 * (1 - ip(f, 70, 92, 0, 1, oc))} />
      </Panel>
      <Narr x={1150} y={880} w={430} lines={['同一个脑子，', '为什么差这么多？']} s={34} f={f} at={NARR1} />
    </g>
  );
};

/* ---------- page 2: the build-up and the hit ---------- */
const Page2Content: React.FC<{ f: number; neg?: boolean }> = ({ f, neg }) => {
  const r0 = f < HIT ? ip(f, RISE, HIT, 900, 330, ic) : 330;
  const phase = f >= HIT && f < HIT + 3 ? f - HIT : Math.floor(f / 3);
  const stamp = f >= HIT;
  const s = stamp ? ip(f, HIT, HIT + 5, 1.35, 1, oc) : 1;
  const boil = f >= LINE + 14 && f < BLEED;
  const under = ip(f, LINE, LINE + 12, 0, 1, oc);
  return (
    <g>
      <rect width={1920} height={1080} fill={PAPER} />
      <path d={radial(1020, 520, r0, 300, 21 + phase * 7, 1700, f >= HIT ? 0.009 : 0.005)} fill={INK} />
      <ellipse cx={1020} cy={520} rx={430 * (r0 / 330) * 0.9} ry={300 * (r0 / 330) * 0.9} fill={PAPER} />
      <rect x={0} y={760} width={1920} height={320} fill="url(#dot1)" mask="url(#mDown)" opacity={0.85} />
      {!stamp && f >= NARR2 + 20 && (
        <text x={1020} y={610} textAnchor="middle" style={{ fontFamily: NUM, fontWeight: 700, fontStyle: 'italic', fontSize: 300, letterSpacing: '-0.02em' }} fill={INK} opacity={0.12 + 0.5 * ip(f, RISE, HIT, 0, 1, ic)}>{`${10 + Math.floor(rnd(Math.floor(f / 3) * 7 + 3) * 89)}%`}</text>
      )}
      {stamp && (
        <g transform={`translate(1020,520) scale(${s}) rotate(${-3 * (1 - ip(f, HIT, HIT + 5))}) translate(-1020,-520)`} filter={boil ? 'url(#boil)' : undefined}>
          <text x={1020} y={610} textAnchor="middle" style={{ fontFamily: NUM, fontWeight: 700, fontStyle: 'italic', fontSize: 330, letterSpacing: '-0.02em' }} fill={INK}>85%</text>
        </g>
      )}
      {under > 0 && (
        <path d={`M830,${662} C${880 + 300 * under * 0.3},${656} ${830 + 380 * under * 0.7},${650} ${830 + 380 * under},${646}`} stroke={RED} strokeWidth={14} strokeLinecap="round" fill="none" opacity={0.92} />
      )}
      <text x={1020} y={730} textAnchor="middle" style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 46, letterSpacing: '0.2em' }} fill={INK} opacity={ip(f, LINE + 6, LINE + 16)}>学得最快的正确率</text>
      {!neg && <Narr x={90} y={90} w={540} lines={['2019年，几位科学家', '用数学模型算出——']} s={34} f={f} at={NARR2} />}
    </g>
  );
};

/* ---------- page 3: the flow sky ---------- */
const InkCloud: React.FC<{ x: number; y: number; s: number; seed: number }> = ({ x, y, s, seed }) => {
  const r = rng(seed); const b: [number, number, number][] = [];
  for (let i = 0; i < 9; i++) { const t = i / 8; b.push([(t - 0.5) * 480 + (r() - 0.5) * 40, -Math.sin(Math.PI * t) * 120 * (0.6 + r() * 0.5), 55 + Math.sin(Math.PI * t) * 70 * (0.7 + r() * 0.4)]); }
  const id = `ic${seed}`;
  const shape = <>{b.map(([bx, by, br], i) => <circle key={i} cx={bx} cy={by} r={br} />)}<rect x={-290} y={-30} width={580} height={70} rx={35} /></>;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <defs><clipPath id={id}>{shape}</clipPath></defs>
      <g fill={PAPER} stroke={INK} strokeWidth={3.2 / s}>{shape}</g>
      <g fill={PAPER}>{b.map(([bx, by, br], i) => <circle key={i} cx={bx} cy={by} r={br - 2.5 / s} />)}<rect x={-287} y={-27} width={574} height={64} rx={32} /></g>
      <g clipPath={`url(#${id})`}><rect x={-320} y={-10} width={640} height={60} fill="url(#hatch2)" opacity={0.75} /><rect x={-320} y={-60} width={640} height={50} fill="url(#dot2)" opacity={0.4} /></g>
    </g>
  );
};
const Page3: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const ribbon = (k: number) => { const p: string[] = []; for (let i = 0; i <= 80; i++) { const u = i / 80, x = -80 + 2100 * u, y = 820 - 560 * u + 70 * Math.sin(u * 6 + k * 0.35 - t * 1.6) + k * 9; p.push(`${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`); } return p.join(' '); };
  const drift = ip(f, BLEED, OUT + 18, 0, 1);
  const title = ip(f, BLEED_END - 10, BLEED_END + 20, 0, 1, oc);
  const seal = f >= BLEED_END + 24 ? ip(f, BLEED_END + 24, BLEED_END + 28, 1.4, 1, oc) : 0;
  return (
    <g>
      <rect width={1920} height={1080} fill={PAPER} />
      <rect x={0} y={0} width={1920} height={380} fill="url(#dot2)" mask="url(#mUp)" opacity={0.55} />
      <InkCloud x={420 + 30 * drift} y={330} s={0.9} seed={3} />
      <InkCloud x={1500 + 20 * drift} y={230} s={0.7} seed={5} />
      <InkCloud x={1250 + 45 * drift} y={650} s={1.2} seed={8} />
      {Array.from({ length: 14 }, (_, k) => <path key={k} d={ribbon(k)} stroke={k === 7 ? RED : INK} strokeWidth={k === 7 ? 4 : k % 4 === 0 ? 3 : 1.4} fill="none" strokeLinecap="round" opacity={k === 7 ? 1 : 0.85} />)}
      <path d="M0,930 L1920,900 L1920,1080 L0,1080 Z" fill={INK} />
      <line x1={0} y1={915} x2={1920} y2={885} stroke={INK} strokeWidth={5} />
      {Array.from({ length: 26 }, (_, i) => <line key={i} x1={20 + i * 78} y1={928 - i * 1.3} x2={20 + i * 78} y2={890 - i * 1.3} stroke={INK} strokeWidth={4} />)}
      <path d="M300,930 C300,850 318,826 340,826 C362,826 380,850 380,930 Z" fill={INK} />
      <circle cx={340} cy={804} r={24} fill={INK} />
      <g opacity={title}>
        {[...'心流'].map((c, i) => (
          <text key={c} x={1700} y={330 + i * 190 + 30 * (1 - title)} textAnchor="middle" style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 180 }} fill={INK} stroke={PAPER} strokeWidth={10} paintOrder="stroke">{c}</text>
        ))}
      </g>
      {seal > 0 && (
        <g transform={`translate(1700,725) scale(${seal}) translate(-1700,-725)`}>
          <rect x={1655} y={680} width={90} height={90} fill={RED} />
          <text x={1700} y={738} textAnchor="middle" style={{ fontFamily: NUM, fontStyle: 'italic', fontWeight: 700, fontSize: 40 }} fill={PAPER}>flow</text>
        </g>
      )}
      <Narr x={90} y={90} w={620} lines={['目标清楚，马上反馈，难度刚好——', '时间，就消失了。']} s={30} f={f} at={NARR3} />
    </g>
  );
};

export const MangaTeaser: React.FC = () => {
  const f = useCurrentFrame();
  const boil = (f >= 50 && f < TURN) || (f >= LINE + 14 && f < BLEED);
  // page turn 1 → 2: the page slides off left with a cast shadow (paper-page-turn)
  const turn = ip(f, TURN, P2, 0, 1, ioc);
  // anime-impact: 3 negative frames, then a decaying shake
  const impact = f >= HIT && f < HIT + 3;
  const since = f - (HIT + 3);
  const env = since >= 0 ? 9 * Math.exp(-since / 2.4) : 0;
  const shx = env * Math.sin(since * 3.7), shy = env * 0.7 * Math.sin(since * 5.1 + 0.9);
  // ink bleed 2 → 3
  const bleeding = f >= BLEED && f < BLEED_END + 2;
  const baseR = ip(f, BLEED, BLEED_END - 4, 0, 1500, Easing.out(Easing.quad));
  const wob = ip(f, BLEED_END - 24, BLEED_END - 4, 1, 0);
  const rr = Math.max(0, baseR * (1 + 0.08 * Math.sin(f * 0.32) * wob));
  const disp = ip(f, BLEED, BLEED_END, 60, 160);
  const fadeOut = 1 - ip(f, OUT, MT_FRAMES - 1);
  const page2 = (neg?: boolean) => <Page2Content f={f} neg={neg} />;
  return (
    <AbsoluteFill style={{ background: '#000', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: fadeOut, transform: `translate(${shx}px,${shy}px)` }}>
        <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0 }}>
          <Defs f={f} boil={boil} />
          {f >= TURN && f < BLEED_END + 2 && !impact && page2()}
          {f >= BLEED_END + 2 && <Page3 f={f} />}
          {bleeding && (
            <>
              <defs>
                <filter id="bleedF" x="-40%" y="-40%" width="180%" height="180%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" seed="7" result="n" />
                  <feDisplacementMap in="SourceGraphic" in2="n" scale={disp} xChannelSelector="R" yChannelSelector="G" />
                </filter>
                <mask id="bleedM" maskUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080">
                  <rect width={1920} height={1080} fill="black" />
                  {rr > 0.5 && <circle cx={1020} cy={560} r={rr} fill="white" filter="url(#bleedF)" />}
                </mask>
              </defs>
              <g mask="url(#bleedM)"><Page3 f={f} /></g>
            </>
          )}
          {f < P2 && (
            <g transform={`translate(${-1980 * turn},0)`}>
              <Page1 f={f} />
              {turn > 0 && <rect x={1920} y={0} width={60} height={1080} fill="url(#dot2)" opacity={0.5 * (1 - turn)} />}
            </g>
          )}
        </svg>
        {impact && (
          <>
            <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, filter: 'invert(1) grayscale(1)' }}><Defs f={f} boil={false} />{page2(true)}</svg>
            {[[-8, '#ff0033'], [8, '#00e5ff']].map(([dx, col], i) => (
              <div key={i} style={{ position: 'absolute', inset: 0, mixBlendMode: 'screen', transform: `translate(${dx}px, ${(f - HIT) % 2 === 0 ? 4 * (i ? -1 : 1) : -4 * (i ? -1 : 1)}px)` }}>
                <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, filter: 'invert(1) grayscale(1)' }}><Defs f={f} boil={false} />{page2(true)}</svg>
                <div style={{ position: 'absolute', inset: 0, background: col as string, mixBlendMode: 'multiply' }} />
              </div>
            ))}
            <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
              {Array.from({ length: 30 }, (_, i) => {
                const k = i * 13 + (f - HIT) * 101, ang = ((i + 0.5) / 30) * Math.PI * 2 + (rnd(k) - 0.5) * 0.22, r0 = 300 + rnd(k + 1) * 220, hw = (7 + rnd(k + 2) * 16) / 1300;
                const pts = `${1020 + Math.cos(ang) * r0},${520 + Math.sin(ang) * r0} ${1020 + Math.cos(ang - hw) * 1300},${520 + Math.sin(ang - hw) * 1300} ${1020 + Math.cos(ang + hw) * 1300},${520 + Math.sin(ang + hw) * 1300}`;
                return <polygon key={i} points={pts} fill={i % 4 === 0 ? '#111111' : '#f5f5f5'} />;
              })}
            </svg>
          </>
        )}
      </div>
    </AbsoluteFill>
  );
};
