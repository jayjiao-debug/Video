/* The science half of 《心流》 v5, drawn as gold line-work on a dark stage with a warm key light.
   30.0  what the athletes describe: time changes, the voice in the head goes quiet, the action happens by itself → "flow"
   49.17 attention is a pipe of limited width (~110 bits/s, Csikszentmihalyi's estimate; one speaker ≈ 60)
   65.45 fill it with one task and "me" and "time" are pushed out
   68.8  the 2016 scan (Ulrich, Keller & Grön): mental arithmetic too easy / just right / too hard
   81.40 just right: the "thinking about myself" regions and the amygdala go quiet; resources go to the task
   94.3  how to get there: the channel, the 85 % model, goals · feedback · no interruptions */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { GOLD, INK, RED, BLUE, clamp, prog, easeOut, easeInOut, lerp, MONO, NameCard } from './art';
import { font } from './brand/lib';

const Stage: React.FC<{ T: number; children: React.ReactNode; drift?: number }> = ({ T, children, drift = 0.015 }) => (
  <AbsoluteFill style={{ background: '#05060b' }}>
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 42%, rgba(255,214,150,0.10) 0%, rgba(255,214,150,0.03) 35%, rgba(0,0,0,0) 65%)' }} />
    <AbsoluteFill style={{ transform: `scale(${1 + drift * Math.sin(T * 0.25)})` }}>{children}</AbsoluteFill>
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.6) 100%)' }} />
  </AbsoluteFill>
);
const label = (x: number, y: number, t: string, o: number, color: string = INK, size = 34): React.ReactNode => (
  <text x={x} y={y} textAnchor="middle" fontFamily={font.sans} fontWeight={700} fontSize={size} fill={color} opacity={o}>{t}</text>
);

/* ------------------------------------------------------------------ A · what they describe */
export const Describe: React.FC<{ T: number }> = ({ T }) => {
  const merge = easeInOut(prog(T, 30.0, 31.2));
  const dots = [560, 827, 1093, 1360];
  const icons: [number, number, string][] = [[560, 33.5, '时间变了'], [960, 37.0, '脑子里的声音消失'], [1360, 39.9, '动作自己发生']];
  const up = easeInOut(prog(T, 42.7, 43.6)), dim = prog(T, 46.6, 48.4), out = 1 - prog(T, 48.5, 49.1);
  const iconY = lerp(470, 300, up), iconS = lerp(1, 0.62, up);
  const a = (t0: number) => easeOut(prog(T, t0, t0 + 0.45));
  const tt = T - 33.5, hand = 2 * Math.PI * (tt * 0.32 + 0.22 * Math.sin(tt * 2.3));
  return (
    <Stage T={T}>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity: out * (1 - 0.7 * dim) }}>
        <defs><radialGradient id="lt"><stop offset="0" stopColor="#fff3d6" /><stop offset="0.35" stopColor={GOLD} stopOpacity={0.7} /><stop offset="1" stopColor={GOLD} stopOpacity={0} /></radialGradient></defs>
        {/* the four lights from the montage come together */}
        {dots.map((x, i) => <circle key={i} cx={lerp(x, 960, merge)} cy={lerp(520, 470, merge)} r={lerp(46, 70, merge)} fill="url(#lt)" opacity={1 - 0.75 * prog(T, 32.6, 33.6)} />)}
        {/* 1 · the clock that runs fast and slow */}
        <g transform={`translate(${icons[0][0]} ${iconY}) scale(${iconS})`} opacity={a(33.5)}>
          <circle r={110} fill="rgba(8,10,18,0.8)" stroke={GOLD} strokeWidth={4} />
          {Array.from({ length: 12 }, (_, i) => <line key={i} x1={0} y1={-92} x2={0} y2={i % 3 ? -82 : -72} stroke={GOLD} strokeWidth={4} transform={`rotate(${i * 30})`} />)}
          <line x1={0} y1={0} x2={0} y2={-78} stroke={INK} strokeWidth={6} strokeLinecap="round" transform={`rotate(${(hand * 180) / Math.PI})`} />
          <line x1={0} y1={0} x2={0} y2={-48} stroke={INK} strokeWidth={8} strokeLinecap="round" transform={`rotate(${(hand * 15) / Math.PI})`} />
          <circle r={8} fill={GOLD} />
        </g>
        {/* 2 · the voice in the head: a bubble whose words erase */}
        <g transform={`translate(${icons[1][0]} ${iconY}) scale(${iconS})`} opacity={a(37.0) * (1 - 0.6 * prog(T, 38.2, 39.6))}>
          <path d="M -120 -80 Q -120 -110 -90 -110 L 90 -110 Q 120 -110 120 -80 L 120 30 Q 120 60 90 60 L -20 60 L -60 100 L -50 60 L -90 60 Q -120 60 -120 30 Z" fill="rgba(8,10,18,0.8)" stroke={GOLD} strokeWidth={4} />
          {[-60, -25, 10].map((y, i) => <path key={i} d={`M -85 ${y} q 20 -10 40 0 t 40 0 t 40 0 t 40 0`} fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={-clamp((T - 37.8 - i * 0.35) / 0.6)} />)}
        </g>
        {/* 3 · the gear that turns by itself */}
        <g transform={`translate(${icons[2][0]} ${iconY}) scale(${iconS}) rotate(${(T - 39.9) * 40})`} opacity={a(39.9)}>
          <path d={Array.from({ length: 12 }, (_, i) => { const a0 = (i / 12) * Math.PI * 2, a1 = a0 + Math.PI / 12, r1 = 96, r2 = 118; const p = (a: number, r: number) => `${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)}`;
            return `${i ? 'L' : 'M'} ${p(a0, r1)} L ${p(a0 + 0.04, r2)} L ${p(a1 - 0.04, r2)} L ${p(a1, r1)}`; }).join(' ') + ' Z'} fill="rgba(8,10,18,0.8)" stroke={GOLD} strokeWidth={4} />
          <circle r={36} fill="none" stroke={GOLD} strokeWidth={4} />
        </g>
        {icons.map(([x, t0, w]) => <g key={w}>{label(x, iconY + 170 * iconS + 10, w, a(t0 + 0.2) * (1 - up))}</g>)}
        {/* the word */}
        <g opacity={easeOut(prog(T, 43.0, 43.6))}>
          <text x={960} y={600} textAnchor="middle" fontFamily={font.latin} fontStyle="italic" fontWeight={500} fontSize={110} fill="rgba(243,237,226,0.75)">Flow</text>
          <text x={960} y={760} textAnchor="middle" fontFamily={font.serif} fontWeight={900} fontSize={170} fill={GOLD}>心流</text>
        </g>
        {/* the open question: a slow ring that keeps searching */}
        {T > 46.5 && <circle cx={960} cy={540} r={60 + 30 * ((T - 46.5) % 1.2)} fill="none" stroke={GOLD} strokeWidth={3} opacity={(1 - ((T - 46.5) % 1.2) / 1.2) * 0.7 * out} />}
      </svg>
      <NameCard T={T} t0={43.0} t1={46.6} align="right" x={110} y={360} name="契克森米哈赖" latin="MIHALY CSIKSZENTMIHALYI · 1934–2021" rows={[['心理学家', 43.4], ['《心流》· 1990', 43.9, true]]} />
    </Stage>
  );
};

/* ------------------------------------------------------------------ B · attention is a pipe */
export const Attention: React.FC<{ T: number }> = ({ T }) => {
  const X0 = 260, X1 = 1660, Y = 520, H = 150, CELL = 26;
  const n = Math.floor((X1 - X0) / CELL), shift = ((T * 3.2) % 1) * CELL;
  const listen = prog(T, 57.4, 58.2) * (1 - prog(T, 61.0, 61.6)), full = prog(T, 61.1, 62.0);
  const pipeIn = easeOut(prog(T, 49.3, 50.2)), out = 1 - prog(T, 68.5, 69.1);
  const tokens: React.ReactNode[] = [];
  for (let i = -1; i < n; i++) {
    const x = X0 + 14 + i * CELL + shift; if (x < X0 + 6 || x > X1 - 26) continue;
    const row = [0, 1, 2, 3].map((r) => {
      const id = (i - Math.floor(T * 3.2)) * 4 + r, h = Math.sin(id * 12.9898) * 43758.5453, rnd = h - Math.floor(h);
      const isListen = rnd < 0.55 * listen, isTask = rnd < full;
      const col = isTask ? GOLD : isListen ? BLUE : 'rgba(243,237,226,0.55)';
      return <rect key={r} x={x} y={Y - H / 2 + 14 + r * 32} width={18} height={18} rx={4} fill={col} opacity={0.9} />;
    });
    tokens.push(<g key={i}>{row}</g>);
  }
  const push = easeInOut(prog(T, 65.6, 67.6));
  return (
    <Stage T={T} drift={0.01}>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity: out }}>
        <g opacity={pipeIn}>
          <rect x={X0} y={Y - H / 2} width={(X1 - X0) * pipeIn} height={H} rx={30} fill="rgba(10,12,20,0.85)" stroke={full > 0.5 ? GOLD : 'rgba(243,237,226,0.5)'} strokeWidth={4} />
          <g clipPath="url(#pipeclip)">{tokens}</g>
          <clipPath id="pipeclip"><rect x={X0} y={Y - H / 2} width={(X1 - X0) * pipeIn} height={H} rx={30} /></clipPath>
          {label(960, Y - 130, '注意力的"带宽"', 1 - prog(T, 63.6, 64.2), 'rgba(243,237,226,0.75)', 40)}
        </g>
        <g opacity={easeOut(prog(T, 53.1, 53.6)) * (1 - prog(T, 57.3, 57.8))}>
          <text x={960} y={Y + 150} textAnchor="middle" fontFamily={MONO} fontSize={72} fill={GOLD}>≈ 110 比特/秒</text>
          {label(960, Y + 205, '契克森米哈赖的估算', 1, 'rgba(243,237,226,0.55)', 28)}
        </g>
        <g opacity={listen}>
          <path d={`M ${X0 - 150} ${Y - 60} q 0 -30 30 -30 h 80 q 30 0 30 30 v 40 q 0 30 -30 30 h -50 l -30 26 l 6 -26 h -6 q -30 0 -30 -30 z`} fill="rgba(8,10,18,0.8)" stroke={BLUE} strokeWidth={4} />
          <text x={960} y={Y + 150} textAnchor="middle" fontFamily={MONO} fontSize={60} fill={BLUE}>听懂一个人说话 ≈ 60</text>
        </g>
        <g opacity={full * (1 - prog(T, 65.4, 65.8))}>{label(960, Y + 150, '一件事，占满全部', 1, GOLD, 56)}</g>
        {/* "me" and "time" get pushed out of the pipe */}
        {[['我', 860], ['时间', 1060]].map(([w, x], i) => {
          const a = easeOut(prog(T, 64.0 + i * 0.3, 64.5 + i * 0.3)); const y = Y - push * (230 + i * 40);
          return (
            <g key={w as string} opacity={a * (1 - prog(T, 67.2, 68.2))} transform={`translate(${x as number} ${y}) rotate(${push * (i ? 14 : -12)})`}>
              <rect x={-70} y={-40} width={140} height={80} rx={14} fill="rgba(8,10,18,0.9)" stroke={INK} strokeWidth={3} />
              <text x={0} y={16} textAnchor="middle" fontFamily={font.sans} fontWeight={900} fontSize={44} fill={INK}>{w}</text>
            </g>);
        })}
      </svg>
    </Stage>
  );
};

/* ------------------------------------------------------------------ C · the scan */
const BRAIN = 'M 560 560 C 515 420 600 300 760 268 C 905 238 1085 250 1205 320 C 1315 385 1362 470 1332 560 C 1312 615 1262 645 1200 652 L 1122 662 C 1050 705 950 722 862 702 C 782 690 722 662 692 632 C 640 642 590 612 560 560 Z';
const GYRI = ['M 640 360 C 700 330 760 340 800 380', 'M 820 300 C 860 340 900 350 960 330', 'M 1000 300 C 1040 350 1100 360 1150 340', 'M 1180 420 C 1220 460 1260 470 1300 450', 'M 700 470 C 760 450 820 470 850 520', 'M 1050 470 C 1100 500 1160 500 1220 520', 'M 760 600 C 820 620 900 630 980 610'];
type Region = { x: number; y: number; r: number; name: string; tag: string };
const R: Record<string, Region> = {
  mpfc: { x: 650, y: 430, r: 72, name: '前额叶内侧', tag: '想自己' },
  pcc: { x: 1085, y: 405, r: 56, name: '后扣带', tag: '想自己' },
  amy: { x: 905, y: 622, r: 38, name: '杏仁核', tag: '恐惧' },
  bg: { x: 880, y: 500, r: 54, name: '基底节等', tag: '手上的事' },
};
/** needle on the difficulty dial: easy → just right → hard → back to just right */
const dialAt = (T: number) => { if (T < 72.9) return 0.5; if (T < 74.2) return lerp(0.5, 0.15, easeInOut(prog(T, 72.9, 73.4))); if (T < 75.5) return lerp(0.15, 0.5, easeInOut(prog(T, 74.2, 74.7))); if (T < 76.8) return lerp(0.5, 0.85, easeInOut(prog(T, 75.5, 76.0))); return lerp(0.85, 0.5, easeInOut(prog(T, 76.8, 77.5))); };
export const Brain: React.FC<{ T: number }> = ({ T }) => {
  const inK = easeOut(prog(T, 68.9, 69.9)), out = 1 - prog(T, 93.7, 94.3);
  const d = dialAt(T), easy = d < 0.33, hard = d > 0.67;
  const quietSelf = easeInOut(prog(T, 81.4, 82.2)), quietFear = easeInOut(prog(T, 84.6, 85.4)), task = easeInOut(prog(T, 87.6, 88.6));
  const level = (k: string) => {
    let v = 0.55 + 0.08 * Math.sin(T * 2 + k.length);
    if (T > 72.8 && T < 81.4) { if (k === 'mpfc' || k === 'pcc') v += easy ? 0.35 : 0; if (k === 'amy') v += hard ? 0.45 : 0; }
    if (k === 'mpfc' || k === 'pcc') v = lerp(v, 0.06, quietSelf);
    if (k === 'amy') v = lerp(v, 0.06, quietFear);
    if (k === 'bg') v = lerp(v, 1.25, task);
    return v;
  };
  const dialK = easeOut(prog(T, 72.6, 73.0)) * (1 - prog(T, 80.8, 81.4));
  const flash = T >= 81.4 && T < 81.8 ? Math.exp(-(T - 81.4) / 0.09) * 0.35 : 0;
  const meSlide = easeInOut(prog(T, 91.4, 93.0));
  return (
    <Stage T={T} drift={0.012}>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity: out }}>
        <defs>
          {Object.keys(R).map((k) => <radialGradient key={k} id={'g' + k}><stop offset="0" stopColor={k === 'bg' && task > 0.3 ? '#fff0c8' : '#ffb070'} /><stop offset="0.5" stopColor={k === 'bg' && task > 0.3 ? GOLD : '#ff7a3a'} stopOpacity={0.6} /><stop offset="1" stopColor="#ff7a3a" stopOpacity={0} /></radialGradient>)}
        </defs>
        <g opacity={inK} transform={`translate(${lerp(-40, 0, inK)} 0)`}>
          <path d={BRAIN} fill="rgba(14,16,26,0.92)" stroke={GOLD} strokeWidth={4} />
          <ellipse cx={1215} cy={700} rx={112} ry={58} fill="rgba(14,16,26,0.92)" stroke={GOLD} strokeWidth={3} />
          <path d="M 1075 660 C 1080 720 1070 780 1060 840 L 1015 840 C 1025 780 1030 720 1020 668" fill="rgba(14,16,26,0.92)" stroke={GOLD} strokeWidth={3} />
          {GYRI.map((p, i) => <path key={i} d={p} fill="none" stroke={GOLD} strokeOpacity={0.25} strokeWidth={3} />)}
          {Object.entries(R).map(([k, r]) => { const v = level(k); return (
            <g key={k}>
              <circle cx={r.x} cy={r.y} r={r.r * (1.6 + 0.4 * v)} fill={`url(#g${k})`} opacity={clamp(v)} />
              <circle cx={r.x} cy={r.y} r={r.r * 0.45} fill="none" stroke={GOLD} strokeOpacity={0.5} strokeWidth={2} />
            </g>); })}
          {/* labels for the reveal */}
          {[['mpfc', quietSelf, '↓'], ['pcc', quietSelf, '↓'], ['amy', quietFear, '↓'], ['bg', task, '↑']].map(([k, a, arrow]) => { const r = R[k as string]; return (
            <g key={k as string} opacity={a as number}>
              <text x={r.x} y={k === 'amy' ? r.y + r.r + 52 : r.y - r.r - 46} textAnchor="middle" fontFamily={font.sans} fontWeight={900} fontSize={36} fill={k === 'bg' ? GOLD : INK}>{r.tag} {arrow}</text>
              <text x={r.x} y={k === 'amy' ? r.y + r.r + 82 : r.y - r.r - 14} textAnchor="middle" fontFamily={font.sans} fontWeight={500} fontSize={22} fill="rgba(243,237,226,0.55)">{r.name}</text>
            </g>); })}
          {/* resources flow from the quiet regions into the task */}
          {task > 0 && T < 93 && [R.mpfc, R.pcc, R.amy].map((r, i) => Array.from({ length: 6 }, (_, j) => { const u = ((T - 87.6) * 0.9 + j / 6) % 1;
            return <circle key={i + '-' + j} cx={lerp(r.x, R.bg.x, u)} cy={lerp(r.y, R.bg.y, u) - Math.sin(u * Math.PI) * 30} r={6} fill={GOLD} opacity={task * Math.sin(u * Math.PI)} />; }))}
        </g>
        {/* the difficulty dial */}
        <g transform="translate(1590 350)" opacity={dialK}>
          {[[0, 'rgba(243,237,226,0.35)', '太简单'], [1, GOLD, '刚刚好'], [2, RED, '太难']].map(([i, c, w]) => {
            const a0 = Math.PI + (i as number) * (Math.PI / 3), a1 = a0 + Math.PI / 3, r = 140, act = Math.floor(d * 3 - 0.0001) === i;
            return (<g key={w as string}>
              <path d={`M ${Math.cos(a0) * r} ${Math.sin(a0) * r} A ${r} ${r} 0 0 1 ${Math.cos(a1) * r} ${Math.sin(a1) * r}`} fill="none" stroke={c as string} strokeWidth={act ? 26 : 14} opacity={act ? 1 : 0.5} />
              <text x={Math.cos((a0 + a1) / 2) * 200} y={Math.sin((a0 + a1) / 2) * 200 + 10} textAnchor="middle" fontFamily={font.sans} fontWeight={700} fontSize={30} fill={c as string} opacity={act ? 1 : 0.6}>{w}</text>
            </g>); })}
          <line x1={0} y1={0} x2={Math.cos(Math.PI + d * Math.PI) * 120} y2={Math.sin(Math.PI + d * Math.PI) * 120} stroke={INK} strokeWidth={6} strokeLinecap="round" />
          <circle r={10} fill={INK} />
          {label(0, 70, '心算难度', 0.8, 'rgba(243,237,226,0.7)', 28)}
        </g>
        {/* "me" steps aside */}
        <g opacity={easeOut(prog(T, 90.7, 91.2)) * (1 - prog(T, 92.8, 93.4))} transform={`translate(${lerp(650, 300, meSlide)} ${lerp(330, 300, meSlide)})`}>
          <rect x={-60} y={-38} width={120} height={76} rx={14} fill="rgba(8,10,18,0.9)" stroke={INK} strokeWidth={3} />
          <text x={0} y={15} textAnchor="middle" fontFamily={font.sans} fontWeight={900} fontSize={44} fill={INK}>我</text>
        </g>
        <text x={90} y={1010} fontFamily={font.sans} fontSize={22} fill="rgba(243,237,226,0.42)" opacity={inK}>示意图 · 据 Ulrich, Keller & Grön 2016（23 名学生，fMRI）</text>
      </svg>
      <AbsoluteFill style={{ background: '#fff6e0', opacity: flash }} />
    </Stage>
  );
};

/* ------------------------------------------------------------------ D · how to get there */
export const How: React.FC<{ T: number }> = ({ T }) => {
  const inK = easeOut(prog(T, 94.3, 94.9)), out = 1 - prog(T, 104.1, 104.5);
  const X = 260, Y = 170, W = 640, H = 520;
  const climb = prog(T, 94.8, 97.4), steps = 6, sIdx = Math.min(steps, climb * steps), frac = sIdx - Math.floor(sIdx);
  const sx = Math.floor(sIdx) / steps + (frac > 0.5 ? (frac - 0.5) * 2 / steps : 0), sy = Math.floor(sIdx) / steps + (frac <= 0.5 ? frac * 2 / steps : 1 / steps);
  const curveK = easeOut(prog(T, 97.6, 98.6)), words = (i: number) => easeOut(prog(T, 101.3 + i * 0.6, 101.7 + i * 0.6));
  const CX = 1110, CY = 210, CW = 560, CH = 380;
  const curve = Array.from({ length: 61 }, (_, i) => { const acc = 0.5 + 0.5 * (i / 60), v = Math.exp(-Math.pow((acc - 0.85) / 0.12, 2)); return `${i ? 'L' : 'M'} ${CX + (i / 60) * CW} ${CY + CH - v * CH * 0.9}`; }).join(' ');
  return (
    <Stage T={T}>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity: out }}>
        <g opacity={inK}>
          <path d={`M ${X} ${Y} L ${X + W} ${Y} L ${X} ${Y + H} Z`} fill={RED} opacity={0.12} />
          <path d={`M ${X + W} ${Y} L ${X + W} ${Y + H} L ${X} ${Y + H} Z`} fill="rgba(243,237,226,0.07)" />
          <path d={`M ${X} ${Y + H} L ${X + W * 0.16} ${Y + H} L ${X + W} ${Y + H * 0.16} L ${X + W} ${Y} L ${X + W * 0.84} ${Y} L ${X} ${Y + H * 0.84} Z`} fill={GOLD} opacity={0.22} />
          <line x1={X} y1={Y + H} x2={X + W} y2={Y + H} stroke={INK} strokeWidth={3} /><line x1={X} y1={Y + H} x2={X} y2={Y} stroke={INK} strokeWidth={3} />
          {label(X + W / 2, Y + H + 60, '你的能力 →', 1, 'rgba(243,237,226,0.75)', 30)}
          <text x={X - 40} y={Y + H / 2} textAnchor="middle" fontFamily={font.sans} fontWeight={700} fontSize={30} fill="rgba(243,237,226,0.75)" transform={`rotate(-90 ${X - 40} ${Y + H / 2})`}>挑战 →</text>
          {label(X + W * 0.24, Y + H * 0.22, '焦虑', 0.9, RED, 40)}
          {label(X + W * 0.76, Y + H * 0.84, '无聊', 0.9, 'rgba(243,237,226,0.6)', 40)}
          {label(X + W * 0.62, Y + H * 0.42, '心流', 1, GOLD, 48)}
          <circle cx={X + 30 + sx * (W - 60)} cy={Y + H - 30 - sy * (H - 60)} r={16} fill={GOLD} />
        </g>
        <g opacity={curveK}>
          <line x1={CX} y1={CY + CH} x2={CX + CW} y2={CY + CH} stroke={INK} strokeWidth={3} />
          <path d={curve} fill="none" stroke={GOLD} strokeWidth={5} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - curveK} />
          <line x1={CX + CW * 0.7} y1={CY + CH} x2={CX + CW * 0.7} y2={CY + 30} stroke={GOLD} strokeWidth={2} strokeDasharray="8 8" />
          <text x={CX + CW * 0.7} y={CY + 10} textAnchor="middle" fontFamily={MONO} fontSize={48} fill={GOLD}>≈85%</text>
          {label(CX, CY + CH + 50, '50%', 1, 'rgba(243,237,226,0.5)', 24)}{label(CX + CW, CY + CH + 50, '100%', 1, 'rgba(243,237,226,0.5)', 24)}
          {label(CX + CW / 2, CY + CH + 50, '做对的比例 →', 1, 'rgba(243,237,226,0.75)', 28)}
          {label(CX + CW / 2, CY + CH + 92, '学得多快（学习模型 · Wilson 等 2019）', 1, 'rgba(243,237,226,0.5)', 24)}
        </g>
        {['目标清楚', '反馈即时', '别被打断'].map((w, i) => (
          <g key={w} opacity={words(i)} transform={`translate(${560 + i * 400} ${836 - (1 - words(i)) * 20})`}>
            <rect x={-150} y={-46} width={300} height={84} rx={42} fill="rgba(8,10,18,0.85)" stroke={GOLD} strokeWidth={3} />
            <text x={0} y={12} textAnchor="middle" fontFamily={font.sans} fontWeight={900} fontSize={40} fill={INK}>{w}</text>
          </g>))}
      </svg>
    </Stage>
  );
};

/* ------------------------------------------------------------------ E · the three cards (no subtitles under them) */
const TIPS: [string, string, string, number][] = [['①', '难度', '比现在难一点', 104.8], ['②', '目标', '拆到"下一步"', 107.0], ['③', '反馈', '马上检查，手机放远', 109.2]];
export const TipsV5: React.FC<{ T: number }> = ({ T }) => {
  const on = easeOut(prog(T, 104.4, 104.9)) * (1 - prog(T, 111.4, 111.85)); if (on <= 0) return null;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: 'rgba(3,4,8,0.62)', opacity: on }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', opacity: on, fontFamily: font.sans, fontWeight: 900, fontSize: 52, color: GOLD, letterSpacing: '0.12em' }}>进入心流的三件事</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 290, display: 'flex', justifyContent: 'center', gap: 46, opacity: on }}>
        {TIPS.map(([n, k, d, t0]) => { const a = easeOut(prog(T, t0, t0 + 0.45)); return (
          <div key={n} style={{ width: 500, height: 430, borderRadius: 22, background: 'rgba(10,12,20,0.92)', border: `2px solid ${GOLD}`, opacity: a, transform: `translateY(${(1 - a) * 30}px)`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 30, boxSizing: 'border-box' }}>
            <div style={{ fontFamily: MONO, fontSize: 64, color: GOLD }}>{n}</div>
            <div style={{ fontFamily: font.serif, fontWeight: 900, fontSize: 96, color: INK, marginTop: 6 }}>{k}</div>
            <div style={{ fontFamily: font.sans, fontWeight: 700, fontSize: 42, color: 'rgba(243,237,226,0.85)', marginTop: 22, textAlign: 'center', lineHeight: 1.4 }}>{d}</div>
          </div>); })}
      </div>
    </AbsoluteFill>
  );
};
