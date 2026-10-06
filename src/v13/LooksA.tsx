import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

/* ep13 direction A — "游戏 vs 作业": bright flat illustration + game UI. Three style frames:
   0 hook split screen · 1 the three things games get right · 2 homework turned into levels. */
const SANS = '"Noto Sans CJK SC", sans-serif', MONO = '"DejaVu Sans Mono", monospace';
const K = {
  cream: '#FFF4E2', ink: '#1E1B2E', violet: '#2A1E5C', violet2: '#3D2C8D', cyan: '#4CC9F0', mint: '#3DDC97',
  coral: '#FF5D73', yellow: '#FFD23F', grey: '#B9B4AA', grey2: '#8F8A80', paper: '#FFFFFF', desk: '#E9C99A', desk2: '#D9B07A',
};
const T: React.FC<{ x: number; y: number; s: number; c?: string; w?: number; a?: 'start' | 'middle' | 'end'; f?: string; children: React.ReactNode; ls?: string }> = ({ x, y, s, c = K.ink, w = 700, a = 'start', f = SANS, children, ls }) =>
  <text x={x} y={y} textAnchor={a} style={{ fontFamily: f, fontSize: s, fontWeight: w, letterSpacing: ls, fontFeatureSettings: "'tnum' 1" }} fill={c}>{children}</text>;

/** a person seen from behind at a desk: round head, shoulders, no hands */
const Back: React.FC<{ x: number; y: number; s?: number; hair?: string; shirt?: string }> = ({ x, y, s = 1, hair = K.ink, shirt = K.coral }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M-120,180 C-120,70 -70,40 0,40 C70,40 120,70 120,180 Z" fill={shirt} />
    <circle cx={0} cy={-10} r={62} fill={hair} />
    <path d="M-62,-6 C-58,-50 58,-50 62,-6" fill="none" stroke="#000" strokeOpacity={0.12} strokeWidth={6} />
  </g>
);
const Clock: React.FC<{ x: number; y: number; from: string; to: string; c: string; bg: string }> = ({ x, y, from, to, c, bg }) => (
  <g transform={`translate(${x},${y})`}>
    <rect x={-170} y={-52} width={340} height={84} rx={42} fill={bg} />
    <T x={-120} y={6} s={40} c={c} f={MONO} w={700}>{from}</T>
    <T x={6} y={4} s={30} c={c} w={700} a="middle">→</T>
    <T x={36} y={6} s={40} c={c} f={MONO} w={700}>{to}</T>
  </g>
);

const F0: React.FC = () => (
  <svg width={1920} height={1080}>
    {/* left: game at night */}
    <rect x={0} y={0} width={960} height={1080} fill={K.violet} />
    <circle cx={180} cy={150} r={260} fill={K.violet2} opacity={0.6} />
    {/* monitor */}
    <rect x={150} y={250} width={660} height={400} rx={26} fill="#120C2E" />
    <rect x={172} y={272} width={616} height={356} rx={14} fill="#1B1446" />
    {/* game scene inside: a boss and HUD */}
    <path d="M520,560 L600,420 L680,560 Z" fill={K.coral} />
    <circle cx={600} cy={455} r={12} fill={K.yellow} />
    <rect x={300} y={500} width={60} height={60} rx={10} fill={K.cyan} />
    <T x={455} y={470} s={44} c={K.yellow} w={900}>-128</T>
    <T x={540} y={410} s={30} c={K.yellow} w={900} >CRIT!</T>
    <rect x={196} y={292} width={250} height={22} rx={11} fill="#3A2F7A" /><rect x={196} y={292} width={190} height={22} rx={11} fill={K.mint} />
    <T x={196} y={344} s={22} c="#CFC8FF" w={700}>任务：击败 Boss 0/1</T>
    <rect x={196} y={598} width={570} height={14} rx={7} fill="#3A2F7A" /><rect x={196} y={598} width={430} height={14} rx={7} fill={K.yellow} />
    <T x={770} y={590} s={20} c={K.yellow} w={900} a="end">LV 27</T>
    <path d="M150,650 h660 v40 h-660 Z" fill="#000" opacity={0.25} />
    <Back x={480} y={820} s={1.15} shirt={K.cyan} />
    <Clock x={480} y={980} from="23:00" to="02:47" c={K.violet} bg={K.yellow} />
    <T x={70} y={110} s={58} c="#FFFFFF" w={900}>打游戏</T>
    {/* right: homework */}
    <rect x={960} y={0} width={960} height={1080} fill="#ECE8E1" />
    <rect x={1110} y={600} width={660} height={60} rx={10} fill={K.desk} />
    <rect x={1250} y={330} width={380} height={290} rx={8} fill={K.paper} />
    {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={1285} y={380 + i * 36} width={i === 5 ? 180 : 300} height={10} rx={5} fill="#D6D1C8" />)}
    <T x={1285} y={366} s={22} c={K.grey2} w={700}>复习第三章（？）</T>
    <Back x={1440} y={820} s={1.15} shirt={K.grey} />
    <Clock x={1440} y={980} from="20:00" to="20:10" c="#FFFFFF" bg={K.grey2} />
    <T x={1030} y={110} s={58} c={K.ink} w={900}>写作业</T>
    {/* question */}
    <rect x={760} y={150} width={400} height={96} rx={48} fill={K.ink} />
    <T x={960} y={212} s={40} c="#FFFFFF" w={900} a="middle">同一个脑子？</T>
  </svg>
);

const Card: React.FC<{ x: number; y: number; n: string; title: string; sub: string; c: string; children: React.ReactNode }> = ({ x, y, n, title, sub, c, children }) => (
  <g transform={`translate(${x},${y})`}>
    <rect x={0} y={0} width={520} height={640} rx={36} fill="#FFFFFF" />
    <rect x={0} y={0} width={520} height={300} rx={36} fill={c} />
    <rect x={0} y={260} width={520} height={40} fill={c} />
    <circle cx={70} cy={70} r={40} fill="#FFFFFF" />
    <T x={70} y={86} s={44} c={c} w={900} a="middle" f={MONO}>{n}</T>
    <g transform="translate(0,0)">{children}</g>
    <T x={44} y={400} s={64} w={900}>{title}</T>
    <T x={44} y={470} s={32} c={K.grey2} w={500}>{sub}</T>
  </g>
);
const F1: React.FC = () => (
  <svg width={1920} height={1080}>
    <rect width={1920} height={1080} fill={K.cream} />
    <T x={960} y={140} s={64} w={900} a="middle">游戏偷偷做对了 <tspan fill={K.coral}>3</tspan> 件事</T>
    <Card x={110} y={250} n="1" title="目标清楚" sub="永远知道下一步干嘛" c={K.violet2}>
      <rect x={60} y={140} width={400} height={110} rx={18} fill="#1B1446" />
      <T x={86} y={186} s={26} c="#CFC8FF" w={700}>主线任务</T>
      <T x={86} y={228} s={30} c="#FFFFFF" w={900}>击败 Boss  0/1</T>
      <path d="M420,180 l18,18 l30,-34" stroke={K.mint} strokeWidth={10} fill="none" strokeLinecap="round" />
    </Card>
    <Card x={700} y={250} n="2" title="马上反馈" sub="每一下都有回应" c={K.coral}>
      <T x={150} y={170} s={64} c={K.yellow} w={900}>+120 XP</T>
      <rect x={60} y={210} width={400} height={30} rx={15} fill="#FFFFFF" opacity={0.35} />
      <rect x={60} y={210} width={300} height={30} rx={15} fill={K.yellow} />
    </Card>
    <Card x={1290} y={250} n="3" title="难度刚好" sub="总是“差一点点”就能过" c={K.mint}>
      {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={70 + i * 80} y={240 - i * 28 - 40} width={64} height={40 + i * 28} rx={10} fill="#FFFFFF" opacity={0.5 + i * 0.1} />)}
      <circle cx={102 + 3 * 80} cy={240 - 3 * 28 - 60} r={16} fill={K.ink} />
    </Card>
    <rect x={560} y={940} width={800} height={84} rx={42} fill={K.ink} />
    <T x={960} y={996} s={36} c="#FFFFFF" w={700} a="middle">心理学管这叫：<tspan fill={K.yellow}>心流</tspan></T>
  </svg>
);

const F2: React.FC = () => {
  const lv = [[300, 760, '第1关', '背10个公式', 1], [640, 600, '第2关', '做5道基础题', 1], [980, 700, '第3关', '错题重做', 0.5], [1320, 520, '第4关', '一道难题', 0], [1620, 330, 'BOSS', '整套卷子', 0]] as [number, number, string, string, number][];
  return (
    <svg width={1920} height={1080}>
      <rect width={1920} height={1080} fill="#E8F7FF" />
      <path d={`M${lv.map(([x, y]) => `${x},${y}`).join(' L')}`} stroke="#FFFFFF" strokeWidth={46} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M${lv.map(([x, y]) => `${x},${y}`).join(' L')}`} stroke={K.cyan} strokeWidth={10} strokeDasharray="2 26" fill="none" strokeLinecap="round" />
      {lv.map(([x, y, a, b, done], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={i === 4 ? 92 : 70} fill={done === 1 ? K.mint : done > 0 ? K.yellow : i === 4 ? K.coral : '#FFFFFF'} stroke={K.ink} strokeWidth={6} />
          {done === 1 && <path d={`M${x - 26},${y} l18,18 l34,-38`} stroke="#FFFFFF" strokeWidth={12} fill="none" strokeLinecap="round" />}
          {done !== 1 && <T x={x} y={y + 14} s={i === 4 ? 40 : 36} w={900} a="middle" c={i === 4 ? '#FFFFFF' : K.ink}>{a}</T>}
          <rect x={x - 130} y={y + (i === 4 ? 110 : 90)} width={260} height={64} rx={14} fill="#FFFFFF" />
          <T x={x} y={y + (i === 4 ? 152 : 132)} s={28} w={700} a="middle">{done === 1 ? `${a} · ${b}` : b}</T>
        </g>
      ))}
      <g transform="translate(980,560)"><circle r={22} fill={K.ink} /></g>
      {/* HUD */}
      <rect x={60} y={60} width={620} height={120} rx={24} fill={K.ink} />
      <T x={96} y={116} s={30} c="#CFC8FF" w={700}>今晚的作业</T>
      <rect x={96} y={136} width={420} height={18} rx={9} fill="#3A2F7A" /><rect x={96} y={136} width={250} height={18} rx={9} fill={K.yellow} />
      <T x={540} y={154} s={30} c={K.yellow} w={900}>+250 XP</T>
      <T x={1860} y={1010} s={54} w={900} a="end">把作业，改成一关一关</T>
    </svg>
  );
};

const FR = [F0, F1, F2];
export const LooksA: React.FC = () => { const f = useCurrentFrame(); const C = FR[Math.min(2, f)]; return <AbsoluteFill><C /></AbsoluteFill>; };
