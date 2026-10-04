import React from 'react';
import { AbsoluteFill } from 'remotion';
import { ZH, EN, beats, prog, easeOut, easeIn, easeInOut, lerp, clamp } from '../lib';
import { mulberry } from '../v1/data';
import { Vignette, Grain } from '../ui';
import { Sub } from './Titanic2';

/* 《应该没事吧》 part 5, b168-b212: 11 March 2011. One clock, two places.
   Okawa Elementary (Ishinomaki): the manual said gather in the schoolyard; they waited there for close to 50 minutes,
   then moved towards the river bridge instead of the hill behind the school. 74 of 108 students died.
   Kamaishi: children who had watched footage of the 2004 tsunami in class ran for high ground as soon as the shaking
   stopped; 99.8% of the city's elementary and junior-high students survived.
   Top-down contour maps, one dot per student (Okawa) / per ~25 students (Kamaishi). */
const b = (i: number) => beats[i];
export const SC_IN = b(168), SC_OUT = b(212);
const W = 1920, H = 1080;
const rnd = (() => { const r = mulberry(311); return Array.from({ length: 8000 }, () => r()); })();
const PW = 860, PH = 590, PY = 170;
const PX = [60, 1000];
const CLOCK_A = b(177), CLOCK_B = b(193); // 14:46 -> 15:37
const minutes = (T: number) => 51 * clamp((T - CLOCK_A) / (CLOCK_B - CLOCK_A));
const atMinute = (m: number) => CLOCK_A + (CLOCK_B - CLOCK_A) * (m / 51);
const QUAKE = b(168) + 0.3;
const OKAWA_FLOOD = atMinute(49), KAMA_FLOOD = atMinute(35);

/* ---------------- map helpers ---------------- */
type Hill = { x: number; y: number; r: number; h: number; ph: number };
const elev = (hills: Hill[], x: number, y: number) => hills.reduce((e, hl) => e + hl.h * Math.exp(-(((x - hl.x) / hl.r) ** 2 + ((y - hl.y) / (hl.r * 0.8)) ** 2)), 0);
const contour = (hl: Hill, k: number) => {
  const R = hl.r * Math.sqrt(-Math.log(k / hl.h + 1e-6));
  if (!isFinite(R) || R <= 0) return '';
  const pts = Array.from({ length: 64 }, (_, i) => {
    const a = (i / 64) * Math.PI * 2;
    const rr = R * (1 + 0.1 * Math.sin(3 * a + hl.ph) + 0.05 * Math.sin(5 * a + hl.ph * 2));
    return `${(hl.x + Math.cos(a) * rr).toFixed(1)},${(hl.y + Math.sin(a) * rr * 0.8).toFixed(1)}`;
  });
  return `M ${pts.join(' L ')} Z`;
};
const Contours: React.FC<{ hills: Hill[]; draw: number }> = ({ hills, draw }) => (
  <g>
    {hills.map((hl, i) => [0.15, 0.3, 0.45, 0.6, 0.75, 0.9].map((k, j) => (
      <path key={`${i}-${j}`} d={contour(hl, k * hl.h)} fill={`rgba(120,160,120,${0.05 + j * 0.025})`} stroke="#5f7f6a" strokeWidth={1.4} opacity={clamp(draw * 7 - j)} />
    )))}
  </g>
);
/* flood cells: a grid of water squares that fills low ground from the sea side */
const Flood: React.FC<{ hills: Hill[]; t: number; from: 'left' | 'bottom'; level: number; seaEdge: number }> = ({ hills, t, from, level, seaEdge }) => {
  if (t <= 0) return null;
  const cells: React.ReactNode[] = [];
  const cs = 22;
  for (let gx = 0; gx < PW / cs; gx++) {
    for (let gy = 0; gy < PH / cs; gy++) {
      const x = gx * cs + cs / 2, y = gy * cs + cs / 2;
      const e = elev(hills, x, y);
      if (e > level) continue;
      const dist = from === 'left' ? x - seaEdge : seaEdge - y;
      const reach = t * (from === 'left' ? PW : PH) * 1.1;
      const k = clamp((reach - dist) / 60);
      if (k <= 0) continue;
      cells.push(<rect key={`${gx}-${gy}`} x={gx * cs + 1} y={gy * cs + 1} width={cs - 2} height={cs - 2} rx={3} fill="#3a8fd0" opacity={0.55 * k * (0.75 + 0.25 * rnd[(gx * 37 + gy) % 8000])} />);
    }
  }
  return <g>{cells}</g>;
};
const Tally: React.FC<{ n: number; bad: number; cols: number; size: number; x: number; y: number; o: number; t: number; label: string; big: string; bigColor: string }> = ({ n, bad, cols, size, x, y, o, t, label, big, bigColor }) => {
  if (o <= 0) return null;
  const rows = Math.ceil(n / cols), gap = size * 0.35;
  return (
    <g opacity={o}>
      <rect x={x - 24} y={y - 70} width={cols * (size + gap) + 48 + 230} height={rows * (size + gap) + 100} rx={16} fill="#070b14" opacity={0.86} />
      {Array.from({ length: n }, (_, i) => {
        const c = i % cols, r = Math.floor(i / cols);
        const isBad = i >= n - bad;
        const show = clamp(t * 1.6 - (i / n) * 0.6);
        return <rect key={i} x={x + c * (size + gap)} y={y + r * (size + gap)} width={size} height={size} rx={size * 0.2} fill={isBad ? '#5a6070' : '#f6cf78'} opacity={show} />;
      })}
      <text x={x} y={y - 26} style={{ fontFamily: ZH, fontSize: 24, fill: 'rgba(243,237,226,0.8)', letterSpacing: '0.08em' }}>{label}</text>
      <text x={x + cols * (size + gap) + 30} y={y + rows * (size + gap) - 6} style={{ fontFamily: EN, fontWeight: 600, fontSize: 70, fill: bigColor }}>{big}</text>
    </g>
  );
};

/* ---------------- Okawa ---------------- */
const OK_HILLS: Hill[] = [
  { x: 470, y: 560, r: 170, h: 1, ph: 0.4 }, { x: 700, y: 620, r: 200, h: 1, ph: 1.3 }, { x: 250, y: 640, r: 150, h: 0.8, ph: 2.2 },
  { x: 720, y: 90, r: 160, h: 0.9, ph: 2.9 }, { x: 420, y: 40, r: 140, h: 0.7, ph: 0.9 },
];
const RIVER = 'M 0 330 C 160 300 260 360 380 330 S 620 270 700 300 S 820 330 870 300';
const OK_SCHOOL = { x: 420, y: 400 };
const OK_BRIDGE = { x: 600, y: 300 };
const OK_DOTS = Array.from({ length: 108 }, (_, i) => ({ x: 360 + rnd[i] * 120, y: 405 + rnd[i + 200] * 46, ph: rnd[i + 400] * 6 }));
const Okawa: React.FC<{ T: number }> = ({ T }) => {
  const draw = easeOut(prog(T, SC_IN, SC_IN + 1.2));
  const gather = easeInOut(prog(T, b(176), b(178)));
  const move = easeInOut(prog(T, atMinute(46.5), atMinute(50)));
  const flood = prog(T, OKAWA_FLOOD, OKAWA_FLOOD + 1.6);
  const hillO = easeOut(prog(T, b(186), b(187))) * (1 - prog(T, b(193), b(194)));
  return (
    <g>
      <rect width={PW} height={PH} fill="#16202c" />
      <rect width={70} height={PH} fill="#0d2238" />
      <text x={14} y={PH - 16} style={{ fontFamily: ZH, fontSize: 18, fill: '#6f8fb0', letterSpacing: '0.1em' }} transform={`rotate(-90 14 ${PH - 16})`}>往海 · 约4公里</text>
      <Contours hills={OK_HILLS} draw={draw} />
      <path d={RIVER} stroke="#1d4a72" strokeWidth={46} fill="none" opacity={draw} />
      <text x={150} y={292} style={{ fontFamily: ZH, fontSize: 20, fill: '#7fa8d0', letterSpacing: '0.2em' }} opacity={draw}>北上川</text>
      <rect x={OK_BRIDGE.x - 10} y={OK_BRIDGE.y - 40} width={20} height={80} fill="#9a9a90" opacity={draw} />
      <text x={OK_BRIDGE.x + 18} y={OK_BRIDGE.y + 70} style={{ fontFamily: ZH, fontSize: 18, fill: '#c9c2b0' }} opacity={draw}>大桥</text>
      {/* school and yard */}
      <rect x={OK_SCHOOL.x - 80} y={OK_SCHOOL.y - 2} width={160} height={58} rx={6} fill="#2a3446" stroke="#c9c2b0" strokeWidth={2} opacity={draw} />
      <rect x={OK_SCHOOL.x + 90} y={OK_SCHOOL.y + 6} width={70} height={44} fill="#c9c2b0" opacity={draw} />
      <text x={OK_SCHOOL.x - 72} y={OK_SCHOOL.y - 12} style={{ fontFamily: ZH, fontSize: 20, fill: '#f3ede2' }} opacity={draw}>操场</text>
      <text x={OK_SCHOOL.x + 92} y={OK_SCHOOL.y + 72} style={{ fontFamily: ZH, fontSize: 18, fill: '#c9c2b0' }} opacity={draw}>校舍</text>
      {/* the hill right behind the school */}
      <g opacity={hillO}>
        <path d={`M ${OK_SCHOOL.x} ${OK_SCHOOL.y + 60} Q ${OK_SCHOOL.x + 30} ${OK_SCHOOL.y + 110} ${OK_SCHOOL.x + 50} ${OK_SCHOOL.y + 150}`} stroke="#f6cf78" strokeWidth={4} strokeDasharray="10 8" fill="none" />
        <circle cx={OK_SCHOOL.x + 50} cy={OK_SCHOOL.y + 150} r={8} fill="#f6cf78" />
        <text x={OK_SCHOOL.x + 66} y={OK_SCHOOL.y + 156} style={{ fontFamily: ZH, fontWeight: 700, fontSize: 24, fill: '#f6cf78' }}>后山</text>
      </g>
      <Flood hills={OK_HILLS} t={flood} from="left" level={0.32} seaEdge={70} />
      {/* students */}
      {OK_DOTS.map((d, i) => {
        const jx = Math.sin(T * 1.7 + d.ph) * 3, jy = Math.cos(T * 1.3 + d.ph) * 2;
        const sx = OK_SCHOOL.x + 40 + rnd[i + 600] * 70, sy = OK_SCHOOL.y + 20 + rnd[i + 800] * 24;
        let x = lerp(sx, d.x, gather) + jx, y = lerp(sy, d.y, gather) + jy;
        x = lerp(x, OK_BRIDGE.x - 30 + rnd[i + 1000] * 40, move * (0.4 + 0.6 * rnd[i + 1200]));
        y = lerp(y, OK_BRIDGE.y + 50 + rnd[i + 1400] * 30, move * (0.4 + 0.6 * rnd[i + 1200]));
        const lost = flood > 0.4 ? clamp((flood - 0.4) * 3) : 0;
        return <circle key={i} cx={x} cy={y} r={4.2} fill="#f6cf78" opacity={draw * (1 - 0.85 * lost)} />;
      })}
      <Tally n={108} bad={74} cols={18} size={14} x={150} y={150} o={easeOut(prog(T, b(194), b(194) + 0.4))} t={prog(T, b(194), b(196))}
        label="108个学生 · 灰色：遇难" big="74" bigColor="#ff6a5c" />
    </g>
  );
};

/* ---------------- Kamaishi ---------------- */
const KA_HILLS: Hill[] = [
  { x: 520, y: 80, r: 230, h: 1.2, ph: 0.7 }, { x: 180, y: 120, r: 180, h: 1, ph: 1.9 }, { x: 800, y: 160, r: 170, h: 1, ph: 2.6 },
  { x: 60, y: 380, r: 120, h: 0.7, ph: 0.2 },
];
const SEA_Y = 470;
const KA_SCHOOLS = [{ x: 330, y: 400, name: '釜石东中学' }, { x: 470, y: 420, name: '鹈住居小学' }];
const KA_GOAL = { x: 560, y: 130 };
const KA_DOTS = Array.from({ length: 116 }, (_, i) => {
  const s = KA_SCHOOLS[i % 2];
  return { sx: s.x - 40 + rnd[2000 + i] * 80, sy: s.y - 14 + rnd[2200 + i] * 30, gx: KA_GOAL.x - 90 + rnd[2400 + i] * 180, gy: KA_GOAL.y - 40 + rnd[2600 + i] * 70, delay: rnd[2800 + i] * 1.4, ph: rnd[3000 + i] * 6 };
});
const Kamaishi: React.FC<{ T: number }> = ({ T }) => {
  const draw = easeOut(prog(T, SC_IN + 0.2, SC_IN + 1.4));
  const flood = prog(T, KAMA_FLOOD, KAMA_FLOOD + 1.6);
  return (
    <g>
      <rect width={PW} height={PH} fill="#16202c" />
      <Contours hills={KA_HILLS} draw={draw} />
      {/* town blocks on the flats */}
      {Array.from({ length: 40 }, (_, i) => {
        const x = 120 + (i % 10) * 64, y = 300 + Math.floor(i / 10) * 40;
        return <rect key={i} x={x} y={y} width={46} height={26} rx={3} fill="#232e3e" opacity={draw * 0.9} />;
      })}
      <path d={`M 0 ${SEA_Y} Q 220 ${SEA_Y - 30} 430 ${SEA_Y + 10} T ${PW} ${SEA_Y - 10} L ${PW} ${PH} L 0 ${PH} Z`} fill="#0d2238" />
      <text x={PW - 120} y={PH - 30} style={{ fontFamily: ZH, fontSize: 20, fill: '#6f8fb0', letterSpacing: '0.2em' }}>太平洋</text>
      {KA_SCHOOLS.map((s) => (
        <g key={s.name} opacity={draw}>
          <rect x={s.x - 46} y={s.y - 18} width={92} height={36} rx={5} fill="#2a3446" stroke="#c9c2b0" strokeWidth={2} />
          <text x={s.x} y={s.y + 46} textAnchor="middle" style={{ fontFamily: ZH, fontSize: 18, fill: '#c9c2b0' }}>{s.name}</text>
        </g>
      ))}
      <text x={KA_GOAL.x} y={KA_GOAL.y - 62} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 22, fill: '#f6cf78' }} opacity={easeOut(prog(T, b(182), b(183)))}>高处</text>
      <Flood hills={KA_HILLS} t={flood} from="bottom" level={0.3} seaEdge={SEA_Y} />
      {KA_DOTS.map((d, i) => {
        const u = easeInOut(clamp((T - (b(177) + d.delay)) / 4.2));
        const mx = lerp(d.sx, d.gx, 0.5) + 60 * Math.sin(i), my = lerp(d.sy, d.gy, 0.55) + 20;
        const x = (1 - u) * (1 - u) * d.sx + 2 * (1 - u) * u * mx + u * u * d.gx + (u >= 1 ? Math.sin(T * 1.4 + d.ph) * 2 : 0);
        const y = (1 - u) * (1 - u) * d.sy + 2 * (1 - u) * u * my + u * u * d.gy;
        return <circle key={i} cx={x} cy={y} r={4.6} fill="#f6cf78" opacity={draw} />;
      })}
      <Tally n={500} bad={1} cols={25} size={9} x={190} y={300} o={easeOut(prog(T, b(205), b(205) + 0.4))} t={prog(T, b(205), b(207))}
        label="近3000名中小学生 · 每格≈6人" big="99.8%" bigColor="#f6cf78" />
    </g>
  );
};

/* ---------------- scene ---------------- */
type Line = [number, number, string, string];
const LINES: Line[] = [
  [SC_IN + 0.15, b(176) - 0.1, '2011年3月11日，日本大地震，海啸正在赶来', '11 March 2011. A great earthquake, and a tsunami on its way.'],
  [b(176) + 0.06, b(184) - 0.1, '大川小学：老师让学生在操场集合，讨论往哪撤', 'Okawa Elementary: the children waited in the schoolyard while teachers talked.'],
  [b(184) + 0.06, b(194) - 0.1, '在操场上等了将近50分钟，学校后面就是山', 'They waited almost 50 minutes. There was a hill right behind the school.'],
  [b(194) + 0.06, b(200) - 0.1, '108个学生，{74人遇难}', '74 of 108 children died.'],
  [b(200) + 0.06, b(205) - 0.1, '釜石的孩子，课上看过2004年印度洋海啸的录像', 'In Kamaishi, children had watched footage of the 2004 tsunami in class.'],
  [b(205) + 0.06, SC_OUT - 0.15, '地震一停就往高处跑，生存率[99.8%]', 'They ran for high ground the moment the shaking stopped. 99.8% survived.'],
];
export const SchoolsScene: React.FC<{ T: number }> = ({ T }) => {
  if (T < SC_IN - 0.05 || T > SC_OUT + 0.05) return null;
  const inO = easeOut(prog(T, SC_IN - 0.05, SC_IN + 0.5));
  const outO = 1 - easeIn(prog(T, SC_OUT - 0.4, SC_OUT));
  const quake = T > QUAKE && T < QUAKE + 1.6 ? 7 * (1 - (T - QUAKE) / 1.6) : 0;
  const qx = quake * Math.sin(T * 63), qy = quake * Math.sin(T * 47);
  const m = minutes(T);
  const hh = 14 + Math.floor((46 + m) / 60), mm = Math.floor((46 + m) % 60);
  const clockO = easeOut(prog(T, SC_IN + 0.4, SC_IN + 0.9));
  // focus: dim the side that is not being talked about
  const focusL = T < b(176) ? 1 : T < b(200) ? 1 : 0.45;
  const focusR = T < b(176) ? 1 : T < b(200) ? 0.6 : 1;
  return (
    <AbsoluteFill style={{ backgroundColor: '#05070d', opacity: inO * outO }}>
      <svg width={W} height={H}>
        <g transform={`translate(${qx}, ${qy})`}>
          {[0, 1].map((side) => (
            <g key={side} transform={`translate(${PX[side]}, ${PY})`} opacity={side ? focusR : focusL}>
              <defs><clipPath id={`sc${side}`}><rect width={PW} height={PH} rx={10} /></clipPath></defs>
              <g clipPath={`url(#sc${side})`}>{side ? <Kamaishi T={T} /> : <Okawa T={T} />}</g>
              <rect width={PW} height={PH} rx={10} fill="none" stroke="#c9c2b0" strokeWidth={3} />
              <text x={0} y={-22} style={{ fontFamily: ZH, fontWeight: 700, fontSize: 32, fill: '#f3ede2', letterSpacing: '0.12em' }}>{side ? '釜石市' : '大川小学'}</text>
              <text x={side ? 118 : 150} y={-22} style={{ fontFamily: ZH, fontSize: 22, fill: 'rgba(243,237,226,0.55)', letterSpacing: '0.1em' }}>{side ? '岩手县' : '宫城县石卷市'}</text>
            </g>
          ))}
        </g>
        <g opacity={clockO}>
          <rect x={W / 2 - 150} y={40} width={300} height={66} rx={33} fill="#0b111e" stroke="#c9c2b0" strokeOpacity={0.4} />
          <text x={W / 2 - 18} y={85} textAnchor="end" style={{ fontFamily: EN, fontWeight: 600, fontSize: 44, fill: '#f3ede2', fontVariantNumeric: 'tabular-nums' }}>{hh}:{String(mm).padStart(2, '0')}</text>
          <text x={W / 2 + 0} y={82} style={{ fontFamily: ZH, fontSize: 20, fill: 'rgba(243,237,226,0.6)' }}>地震后 {Math.floor(m)} 分钟</text>
        </g>
      </svg>
      {LINES.map(([at, out, zh, en], i) => <Sub key={i} T={T} at={at} out={out} zh={zh} en={en} />)}
      <Vignette strength={0.35} />
      <Grain />
    </AbsoluteFill>
  );
};
