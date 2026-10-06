import React from 'react';
import { AbsoluteFill } from 'remotion';
import { CUT, FILM_BEATS, SANS, MONO, INK, DIM, FAINT, RED, BLUE, GOLD, prog, easeOut, easeIn, easeInOut, lerp, clamp, rnd, pop, hit } from './lib';
import { stageStyle } from './camera';

/* Stages 4–6: the network that turns over in 7 years (Mollenhorst; 48 % of confidants and helpers still there),
   hours a day with friends by age (ATUS via Our World in Data), and closeness to friends vs family when contact
   drops (Roberts & Dunbar), building into the second drop. */

const Stage: React.FC<{ style: React.CSSProperties | null; children: React.ReactNode }> = ({ style, children }) =>
  style ? <AbsoluteFill style={style}><svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>{children}</svg></AbsoluteFill> : null;
const BLACK: React.CSSProperties = { fontFamily: SANS, fontWeight: 900 };
const Src: React.FC<{ text: string; o?: number }> = ({ text, o = 1 }) => <text x={120} y={858} opacity={o} style={{ fontFamily: SANS, fontSize: 24, fill: 'rgba(242,240,234,0.5)' }}>{text}</text>;

// ------------------------------------------------------------------ 7 years, half the people
const N0 = 25, KEEP = 12; // 12 of 25 = 48 %
const NODES = Array.from({ length: N0 }, (_, i) => ({
  ang: (i / N0) * Math.PI * 2 + (rnd(i, 1) - 0.5) * 0.18, r: 230 + rnd(i, 2) * 120,
  keep: [0, 2, 4, 6, 9, 11, 13, 15, 17, 19, 21, 23].includes(i), leave: 0.15 + rnd(i, 3) * 0.8,
}));
const NEW = Array.from({ length: N0 - KEEP }, (_, i) => ({ ang: ((i + 0.5) / (N0 - KEEP)) * Math.PI * 2 + 0.3, r: 300 + rnd(i, 5) * 110, come: 0.25 + rnd(i, 6) * 0.7 }));

export const Net: React.FC<{ T: number }> = ({ T }) => {
  const st = stageStyle(T, CUT.net, CUT.atus, [20, 0]);
  if (!st) return null;
  const a = CUT.net;
  const years = 7 * easeInOut(prog(T, 33.9, 40.2));
  const yk = years / 7;
  const reveal = easeOut(prog(T, 40.66, 40.95));
  const big = pop(T, 40.7, 0.4);
  const drift = easeInOut(prog(T, 42.4, 45.7));
  const spin = (T - a) * 0.08;
  const C = [960, 500];
  const pos = (ang: number, r: number) => [C[0] + Math.cos(ang + spin) * r * (1 + 0.6 * drift), C[1] + Math.sin(ang + spin) * r * 0.62 * (1 + 0.6 * drift)];
  const pulse = (x1: number, y1: number, x2: number, y2: number, k: number, col: string) => {
    const f = ((T * 0.9 + rnd(k, 9)) % 1);
    return <circle cx={lerp(x1, x2, f)} cy={lerp(y1, y2, f)} r={4} fill={col} opacity={0.8} />;
  };
  return (
    <Stage style={st}>
      <text x={1800} y={250} textAnchor="end" style={{ fontFamily: MONO, fontWeight: 700, fontSize: 92, fill: INK }}>第 {Math.min(7, Math.floor(years + 1e-6))} 年</text>
      <text x={1800} y={292} textAnchor="end" style={{ fontFamily: SANS, fontSize: 26, fill: DIM }}>604 人，跟踪 7 年 · 荷兰</text>
      {NODES.map((n, i) => {
        const gone = !n.keep && yk > n.leave;
        const o = n.keep ? 1 : 1 - prog(yk, n.leave, n.leave + 0.08);
        const [x, y] = pos(n.ang, n.r);
        const col = reveal > 0 && n.keep ? INK : 'rgba(242,240,234,0.75)';
        const edge = (1 - drift * 0.85);
        return (
          <g key={i} opacity={o}>
            <line x1={C[0]} y1={C[1]} x2={x} y2={y} stroke={n.keep && reveal > 0 ? 'rgba(242,240,234,0.5)' : 'rgba(242,240,234,0.22)'} strokeWidth={2} strokeDasharray={drift > 0 ? `${10 * edge} ${16 * drift + 2}` : undefined} />
            {!gone && drift < 0.5 && pulse(C[0], C[1], x, y, i, n.keep && reveal > 0 ? INK : 'rgba(242,240,234,0.6)')}
            <circle cx={x} cy={y} r={n.keep && reveal > 0 ? 15 : 12} fill={col} style={n.keep && reveal > 0 ? { filter: 'drop-shadow(0 0 10px rgba(242,240,234,0.8))' } : undefined} />
          </g>
        );
      })}
      {NEW.map((n, i) => {
        const o = prog(yk, n.come, n.come + 0.08);
        if (o <= 0) return null;
        const [x, y] = pos(n.ang, n.r);
        return <g key={`n${i}`} opacity={o * (reveal > 0 ? 0.45 : 1)}>
          <line x1={C[0]} y1={C[1]} x2={x} y2={y} stroke="rgba(74,168,255,0.35)" strokeWidth={2} />
          <circle cx={x} cy={y} r={11} fill={BLUE} />
        </g>;
      })}
      <circle cx={C[0]} cy={C[1]} r={22} fill={RED} style={{ filter: 'drop-shadow(0 0 14px rgba(255,61,46,0.9))' }} />
      <text x={C[0]} y={C[1] + 60} textAnchor="middle" style={{ fontFamily: SANS, fontSize: 28, fill: INK }}>你</text>
      {reveal > 0 && (
        <g opacity={reveal}>
          <text x={120} y={480} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 200 * (0.9 + 0.1 * Math.min(1.1, big)), fill: INK }}>48%</text>
          <text x={124} y={540} style={{ fontFamily: SANS, fontSize: 30, fill: DIM }}>知心人和帮手，7 年后还在</text>
          <g transform="translate(124 590)">
            <circle cx={10} cy={-8} r={9} fill={BLUE} /><text x={30} y={0} style={{ fontFamily: SANS, fontSize: 24, fill: DIM }}>新认识的人补了进来</text>
          </g>
        </g>
      )}
      {drift > 0 && <text x={1800} y={720} textAnchor="end" opacity={easeOut(prog(T, 42.6, 43.0))} style={{ ...BLACK, fontSize: 54, fill: RED }}>没有了见面的机会</text>}
      <Src text="Mollenhorst 等 · 乌得勒支大学 · Social Networks 2014" o={easeOut(prog(T, a + 0.3, a + 0.8))} />
    </Stage>
  );
};

// ------------------------------------------------------------------ hours a day with friends
const PTS: [number, number][] = [[15, 1.54], [18, 1.95], [25, 1.08], [30, 0.76], [40, 0.5], [60, 0.53]];
const ax = (age: number) => 200 + ((age - 15) / 45) * 1520;
const ay = (h: number) => 760 - (h / 2.2) * 440;
const hoursAt = (age: number) => { // monotone-ish piecewise cubic (smoothstep) between the data points
  for (let i = 0; i < PTS.length - 1; i++) {
    const [a0, h0] = PTS[i], [a1, h1] = PTS[i + 1];
    if (age <= a1) { const u = (age - a0) / (a1 - a0); const s = u * u * (3 - 2 * u); return lerp(h0, h1, s); }
  }
  return PTS[PTS.length - 1][1];
};

export const Atus: React.FC<{ T: number }> = ({ T }) => {
  const st = stageStyle(T, CUT.atus, CUT.dunbar, [0, 0]);
  if (!st) return null;
  const a = CUT.atus;
  const draw = easeInOut(prog(T, a + 0.1, a + 1.6));
  const age = T < 49.7 ? 18 : T < 52.3 ? lerp(18, 30, easeInOut(prog(T, 49.7, 50.5))) : lerp(30, 40, easeInOut(prog(T, 52.3, 53.0)));
  const mk = [ax(age), ay(hoursAt(age))];
  const pan = -(mk[0] - 960) * 0.25;
  const mins = Math.round(hoursAt(age) * 60);
  const drain = easeInOut(prog(T, 54.4, 56.2));
  const ageEnd = lerp(15, 60, draw);
  const path = (from: number, to: number) => Array.from({ length: 90 }, (_, i) => { const g = lerp(from, to, i / 89); return `${ax(g)},${ay(hoursAt(g))}`; }).join(' ');
  const ring = (T * 1.4) % 1;
  return (
    <Stage style={st}>
      <g transform={`translate(${pan} 0)`}>
        <line x1={ax(15)} x2={ax(60)} y1={760} y2={760} stroke={FAINT} strokeWidth={2} />
        {[15, 20, 30, 40, 50, 60].map((g) => <text key={g} x={ax(g)} y={798} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 24, fill: DIM }}>{g}岁</text>)}
        {[0.5, 1, 1.5, 2].map((h) => <g key={h}><line x1={ax(15)} x2={ax(60)} y1={ay(h)} y2={ay(h)} stroke="rgba(242,240,234,0.06)" /><text x={ax(15) - 16} y={ay(h) + 8} textAnchor="end" style={{ fontFamily: MONO, fontSize: 22, fill: DIM }}>{h}h</text></g>)}
        <polygon points={`${ax(15)},760 ${path(15, ageEnd)} ${ax(ageEnd)},760`} fill="rgba(255,61,46,0.16)" />
        {drain > 0 && <polygon points={`${ax(age)},760 ${path(age, 60)} ${ax(60)},760`} fill="rgba(6,6,8,0.75)" opacity={drain} />}
        <polyline points={path(15, ageEnd)} fill="none" stroke={RED} strokeWidth={5} style={{ filter: 'drop-shadow(0 0 10px rgba(255,61,46,0.6))' }} />
        {PTS.map(([g, h]) => g <= ageEnd && <circle key={g} cx={ax(g)} cy={ay(h)} r={7} fill={INK} />)}
        {draw > 0.3 && (
          <g>
            <line x1={mk[0]} x2={mk[0]} y1={mk[1]} y2={760} stroke={INK} strokeWidth={2} strokeDasharray="6 6" />
            <circle cx={mk[0]} cy={mk[1]} r={14 + 26 * ring} fill="none" stroke={INK} strokeWidth={2} opacity={1 - ring} />
            <circle cx={mk[0]} cy={mk[1]} r={13} fill={INK} />
            <text x={mk[0] + 26} y={mk[1] - 26} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 34, fill: INK }}>{Math.round(age)}岁</text>
          </g>
        )}
      </g>
      <text x={1800} y={250} textAnchor="end" style={{ fontFamily: MONO, fontWeight: 700, fontSize: 150, fill: INK }}>{mins}<tspan fontSize={50} fontFamily={SANS}> 分钟/天</tspan></text>
      <text x={1800} y={300} textAnchor="end" style={{ fontFamily: SANS, fontSize: 28, fill: DIM }}>和朋友待在一起</text>
      <Src text="美国时间利用调查 ATUS 2010–2024 · Our World in Data · 指面对面相处" o={easeOut(prog(T, a + 0.3, a + 0.8))} />
    </Stage>
  );
};

// ------------------------------------------------------------------ closeness: friends vs family over 18 months
export const Dunbar: React.FC<{ T: number }> = ({ T }) => {
  const st = stageStyle(T, CUT.dunbar, CUT.drop, [0, 0]);
  if (!st) return null;
  const a = CUT.dunbar;
  const m = 18 * easeInOut(prog(T, 57.4, 66.5));
  const mx = (mm: number) => 260 + (mm / 18) * 1360;
  const fy = (mm: number) => 360 + 260 * easeInOut(clamp(mm / 18));
  const hy = (mm: number) => 380 - 20 * (mm / 18);
  const pts = (f: (x: number) => number) => Array.from({ length: 60 }, (_, i) => { const mm = (i / 59) * m; return `${mx(mm)},${f(mm)}`; }).join(' ');
  const famO = easeOut(prog(T, 64.6, 65.0));
  const big = easeOut(prog(T, 67.3, 67.6));
  // build-up to the drop: everything starts to tremble
  const tense = easeIn(prog(T, 70.4, CUT.drop));
  const beatKick = FILM_BEATS.filter((b) => b > 70.4 && b < CUT.drop).reduce((acc, b) => acc + hit(T, b, 0.16), 0);
  const jx = Math.sin(T * 83) * 3 * tense + beatKick * 0, jy = Math.cos(T * 67) * 2 * tense;
  return (
    <Stage style={st}>
      <g transform={`translate(${jx} ${jy})`}>
        <text x={1800} y={250} textAnchor="end" style={{ fontFamily: MONO, fontWeight: 700, fontSize: 92, fill: INK }}>第 {Math.floor(m)} 个月</text>
        <text x={1800} y={292} textAnchor="end" style={{ fontFamily: SANS, fontSize: 26, fill: DIM }}>从高中到大学 · 英国</text>
        <text x={240} y={330} style={{ fontFamily: SANS, fontSize: 26, fill: DIM }}>亲密度（示意）</text>
        <line x1={mx(0)} x2={mx(18)} y1={700} y2={700} stroke={FAINT} strokeWidth={2} />
        {[0, 6, 12, 18].map((mm) => <text key={mm} x={mx(mm)} y={736} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 22, fill: DIM }}>{mm}月</text>)}
        {/* meetings with friends per month: fewer and fewer */}
        {Array.from({ length: 19 }, (_, mm) => mm <= m && Array.from({ length: Math.max(1, Math.round(8 - mm * 0.38)) }, (_, k) => (
          <circle key={`${mm}-${k}`} cx={mx(mm)} cy={770 + k * 11} r={3.5} fill={RED} opacity={0.7} />
        )))}
        <text x={mx(18) + 20} y={790} style={{ fontFamily: SANS, fontSize: 22, fill: RED }} opacity={easeOut(prog(T, 58, 58.4))}>见朋友的次数</text>
        <polyline points={pts(fy)} fill="none" stroke={RED} strokeWidth={6} style={{ filter: 'drop-shadow(0 0 10px rgba(255,61,46,0.6))' }} />
        <circle cx={mx(m)} cy={fy(m)} r={14} fill={RED} />
        <text x={mx(m) + 24} y={fy(m) + 10} style={{ ...BLACK, fontSize: 34, fill: RED }}>朋友</text>
        <g opacity={famO}>
          <polyline points={pts(hy)} fill="none" stroke={BLUE} strokeWidth={6} style={{ filter: 'drop-shadow(0 0 10px rgba(74,168,255,0.6))' }} />
          <circle cx={mx(m)} cy={hy(m)} r={14} fill={BLUE} />
          <text x={mx(m) + 24} y={hy(m) + 10} style={{ ...BLACK, fontSize: 34, fill: BLUE }}>家人</text>
        </g>
        {big > 0 && (
          <g opacity={big}>
            <rect x={960 - 470} y={470} width={940} height={124} rx={18} fill="rgba(6,6,8,0.85)" />
            <text x={960} y={566} textAnchor="middle" style={{ ...BLACK, fontSize: 96, fill: INK }}>友情，更依赖<tspan fill={RED}>见面</tspan></text>
          </g>
        )}
        <Src text="Roberts & Dunbar · Evolution and Human Behavior 2011 / Human Nature 2015" o={easeOut(prog(T, a + 0.3, a + 0.8))} />
      </g>
    </Stage>
  );
};
export { pop, easeIn };
