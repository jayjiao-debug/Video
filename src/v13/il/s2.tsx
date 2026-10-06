import React from 'react';
import { W, H, C, F, Txt, Glow, Stars, Moon, Cam, Kid, KidBack, Clock, NameCard, Chip, sm, life, pop, ease, eo, lerp, clamp, rng, cue, cend, cw } from './kit';

/* ============ the painter (1960s) ============ */
export const Painter: React.FC<{ T: number }> = ({ T }) => {
  const p1 = cue('P1'), p2 = cue('P2'), p3 = cue('P3'), p4 = cue('P4'), end = cue('P5');
  const paintK = clamp((T - p2) / (p3 - p2));               // the canvas fills while he's in it
  const done = T > p3 + 0.3, away = ease((T - p3 - 0.4) / 0.9);
  const night = clamp((T - p2) / (p3 - p2));
  const r = rng(21);
  const strokes = Array.from({ length: 16 }, (_, i) => { const y = 330 + i * 26 + r() * 8, x = 1060 + r() * 40, w = 200 + r() * 200; return { y, x, w, c: [C.amber, C.teal, C.ember, C.gold, C.sky][i % 5] }; });
  const brush = (u: number) => [1080 + 380 * (0.5 + 0.5 * Math.sin(u * 13)), 340 + 380 * (0.5 + 0.5 * Math.sin(u * 7 + 1))];
  const trailK = sm(T, p4, 0.8);
  return (
    <Cam s={1.03 + (T - p1) * 0.004} x={-(T - p1) * 4}>
      <rect width={W} height={H} fill="url(#warmroom)" />
      {/* window: the moon crosses while he paints */}
      <rect x={160} y={110} width={420} height={420} rx={8} fill="#1E1626" /><rect x={176} y={126} width={388} height={388} fill="url(#night)" />
      <defs><clipPath id="pw"><rect x={176} y={126} width={388} height={388} /></clipPath></defs>
      <g clipPath="url(#pw)"><Stars T={T} n={30} seed={4} /><g transform={`translate(${210 + night * 320},${430 - Math.sin(night * Math.PI) * 240})`}><Moon x={0} y={0} r={34} /></g></g>
      <rect x={366} y={126} width={8} height={388} fill="#1E1626" />
      <Clock x={760} y={220} r={84} min={21 * 60 + night * 300 + (T > p3 ? 300 : 0)} />
      <Glow x={1200} y={520} r={700} c="amber" o={0.5} />
      {/* floor */}
      <rect x={0} y={860} width={W} height={220} fill="#2A1C26" />
      {/* the meal going cold on a stool */}
      <g transform="translate(560,820)"><rect x={-60} y={0} width={120} height={14} fill={C.wood2} /><rect x={-50} y={14} width={12} height={90} fill={C.wood} /><rect x={38} y={14} width={12} height={90} fill={C.wood} />
        <ellipse cx={0} cy={-6} rx={56} ry={14} fill={C.cream} /><ellipse cx={0} cy={-12} rx={36} ry={10} fill={C.orange} />
        {[0, 1, 2].map((i) => <path key={i} d={`M${-16 + i * 16},-24 q8,-20 0,-40 q-8,-20 0,-40`} stroke={C.cream} strokeWidth={4} fill="none" opacity={(1 - night) * 0.6} />)}</g>
      {/* easel + canvas */}
      <g>
        <line x1={1100} y1={900} x2={1200} y2={240} stroke={C.wood} strokeWidth={18} /><line x1={1500} y1={900} x2={1400} y2={240} stroke={C.wood} strokeWidth={18} />
        {!done || away < 0.5 ? (
          <g><rect x={1040} y={300} width={520} height={460} fill={C.paper} />
            {strokes.map((s, i) => { const kk = clamp(paintK * 16 - i); return kk > 0 ? <rect key={i} x={s.x} y={s.y} width={s.w * kk} height={20} rx={10} fill={s.c} opacity={0.9} /> : null; })}
          </g>
        ) : (
          <g><rect x={1040} y={300} width={520} height={460} fill={C.wood} /><line x1={1040} y1={300} x2={1560} y2={760} stroke={C.wood2} strokeWidth={10} /><line x1={1560} y1={300} x2={1040} y2={760} stroke={C.wood2} strokeWidth={10} /></g>
        )}
        <rect x={1020} y={760} width={560} height={20} fill={C.wood2} />
      </g>
      {/* the painter, from behind, at the easel — walks off once it's finished */}
      <g transform={`translate(${lerp(860, 1900, away)},560)`}>
        <KidBack x={0} y={0} s={1.25} hood="#7A4E3A" rim={C.amber} />
      </g>
      {/* the process glows: the brush's path, not the picture */}
      {trailK > 0 && <g opacity={trailK}>
        <rect x={1040} y={300} width={520} height={460} fill={C.n0} opacity={0.35} />
        <path d={Array.from({ length: 300 }, (_, i) => { const [x, y] = brush(i / 30); return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`; }).join(' ')} stroke={C.gold} strokeWidth={5} fill="none" strokeDasharray={`${6000 * ease((T - p4) / 2)} 9000`} opacity={0.9} />
        <Txt x={1300} y={240} s={72} c={C.gold} w={900} stroke={C.n0}>过程</Txt>
      </g>}
      {!done && <g transform={`translate(${brush(T)[0]},${brush(T)[1]})`}><circle r={16} fill={C.gold} opacity={0.9} /><Glow x={0} y={0} r={70} c="gold" o={0.6} /></g>}
    </Cam>
  );
};

/* ============ chess / climbing / dance, then the current ============ */
export const Interviews: React.FC<{ T: number }> = ({ T }) => {
  const a = [cue('P5'), cw('P5', '攀岩'), cw('P5', '跳舞')], cur = cw('P6', '像被');
  const flowK = clamp((T - cur + 0.3) / 1.4), lift = 30 * ease((T - cur) / 1.2);
  const r = rng(13);
  const ribbons = Array.from({ length: 24 }, (_, i) => {
    const off = (i - 12) * 10, ph = r() * 6, col = i % 6 === 2 ? C.ember : i % 2 ? C.amber : C.teal;
    const d = Array.from({ length: 49 }, (_, j) => { const u = j / 48, x = -60 + u * 2040, y = 820 + Math.sin(u * 6 + ph + T * 2.4) * 30 + off - u * 60; return `${j ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`; }).join(' ');
    return <path key={i} d={d} stroke={col} strokeWidth={i % 4 ? 2 : 4} fill="none" opacity={0.65} strokeDasharray={`${2100 * flowK} 3000`} />;
  });
  const vign = (i: number, body: React.ReactNode, lab: string) => {
    const k = pop(T, a[i], 0.45);
    if (k <= 0) return null;
    const x = 340 + i * 620;
    return (
      <g transform={`translate(${x},${470 - lift}) scale(${k})`}>
        <defs><clipPath id={`iv${i}`}><path d="M-250,300 L-250,-150 A250,250 0 0,1 250,-150 L250,300 Z" /></clipPath></defs>
        <path d="M-262,312 L-262,-150 A262,262 0 0,1 262,-150 L262,312 Z" fill={C.n0} />
        <g clipPath={`url(#iv${i})`}><rect x={-260} y={-420} width={520} height={740} fill={C.n2} /><Glow x={0} y={-120} r={360} c="amber" o={0.6} />{body}</g>
        <Txt x={0} y={370} s={46} c={C.cream}>{lab}</Txt>
      </g>
    );
  };
  return (
    <g>
      <rect width={W} height={H} fill="url(#night)" />
      <Stars T={T} n={60} seed={9} y1={400} o={0.6} />
      {vign(0, <g><path d="M-220,300 L-150,120 L150,120 L220,300 Z" fill={C.cream} />{Array.from({ length: 24 }, (_, j) => { const c = j % 6, rr = Math.floor(j / 6); return (c + rr) % 2 ? <path key={j} d={`M${-150 + c * 50 - rr * 18},${120 + rr * 45} l50,0 l${-18 + 0},45 l-50,0 Z`} fill={C.n1} /> : null; })}
        <g transform={`translate(${(Math.floor(T * 1.2) % 2) * 50},${-Math.abs(Math.sin(T * 3.8)) * 30})`}><path d="M-20,110 L-30,40 Q-40,0 -10,-20 L20,-10 L10,40 L20,110 Z" fill={C.hair} /></g><path d="M60,110 L54,70 L74,40 L90,70 L84,110 Z" fill={C.cream} /></g>, '下棋')}
      {vign(1, <g><path d="M-260,320 L-120,-420 L260,-420 L260,320 Z" fill="#7A5A4A" />{Array.from({ length: 14 }, (_, j) => <circle key={j} cx={-140 + ((j * 97) % 330)} cy={-300 + ((j * 61) % 560)} r={10} fill={j % 2 ? C.amber : C.ember} />)}
        <line x1={20} y1={-420} x2={20} y2={-60} stroke={C.cream} strokeWidth={4} />
        <g transform={`translate(20,${-20 - (T % 2) * 6})`}><circle cx={0} cy={-60} r={30} fill={C.hair} /><path d="M-30,-30 L30,-30 L24,60 L-24,60 Z" fill={C.ember} /><line x1={-26} y1={-20} x2={-70} y2={-110} stroke={C.ember} strokeWidth={18} strokeLinecap="round" /><line x1={26} y1={-20} x2={70} y2={-70} stroke={C.ember} strokeWidth={18} strokeLinecap="round" /><line x1={-14} y1={60} x2={-50} y2={140} stroke={C.n0} strokeWidth={20} strokeLinecap="round" /><line x1={14} y1={60} x2={40} y2={150} stroke={C.n0} strokeWidth={20} strokeLinecap="round" /></g></g>, '攀岩')}
      {vign(2, <g><path d="M-60,-420 L60,-420 L240,320 L-240,320 Z" fill={C.gold} opacity={0.25} /><ellipse cx={0} cy={250} rx={170} ry={30} fill={C.n1} />
        <g transform={`translate(0,40) rotate(${Math.sin(T * 3) * 8})`}><circle cx={0} cy={-120} r={30} fill={C.hair} /><path d="M-26,-90 L26,-90 L50,60 L-50,60 Z" fill={C.teal} /><line x1={-24} y1={-80} x2={-120} y2={-150} stroke={C.teal} strokeWidth={16} strokeLinecap="round" /><line x1={24} y1={-80} x2={110} y2={-30} stroke={C.teal} strokeWidth={16} strokeLinecap="round" /><line x1={-12} y1={60} x2={-30} y2={200} stroke={C.n0} strokeWidth={18} strokeLinecap="round" /><line x1={12} y1={60} x2={110} y2={150} stroke={C.n0} strokeWidth={18} strokeLinecap="round" /></g></g>, '跳舞')}
      {flowK > 0 && <g style={{ mixBlendMode: 'screen' }}>{ribbons}</g>}
    </g>
  );
};

/* ============ the checklist board: game vs homework × three conditions ============ */
const ROWS = ['目标清楚', '马上反馈', '难度刚好'];
export const Board: React.FC<{ T: number; focus?: number; reveal: number; homeworkFix?: number[]; title?: string }> = ({ T, focus = -1, reveal, homeworkFix = [] }) => {
  const k1 = cue('K1'), game = cw('K1', '游戏全'), hw = cw('K1', '作业');
  return (
    <g>
      <rect width={W} height={H} fill="url(#room)" />
      <Glow x={W / 2} y={500} r={900} c="amber" o={0.12} />
      <g transform="translate(360,150)">
        <rect x={0} y={0} width={1200} height={760} rx={30} fill={C.n1} stroke={C.n3} strokeWidth={4} />
        <Txt x={760} y={96} s={54} c={C.teal}>游戏</Txt><Txt x={1040} y={96} s={54} c={C.amber}>作业</Txt>
        {ROWS.map((lab, i) => {
          const y = 150 + i * 200, hot = focus === i;
          const show = i < reveal;
          return (
            <g key={i} opacity={focus >= 0 && !hot ? 0.35 : 1}>
              <rect x={30} y={y} width={1140} height={170} rx={20} fill={hot ? C.n3 : C.n2} />
              <Txt x={90} y={y + 108} s={64} a="start" c={show ? C.cream : C.slate} w={900}>{show ? `${'一二三'[i]}、${lab}` : `条件${'一二三'[i]}`}</Txt>
              {T > game + i * 0.15 && <g transform={`translate(760,${y + 85}) scale(${pop(T, game + i * 0.15)})`}><circle r={48} fill={C.teal} /><path d="M-22,0 L-6,18 L24,-18" stroke={C.n0} strokeWidth={12} fill="none" strokeLinecap="round" /></g>}
              {T > hw + 0.3 + i * 0.15 && <g transform={`translate(1040,${y + 85}) scale(${pop(T, hw + 0.3 + i * 0.15)})`}>
                {homeworkFix.includes(i) ? <><circle r={48} fill={C.amber} /><path d="M-22,0 L-6,18 L24,-18" stroke={C.n0} strokeWidth={12} fill="none" strokeLinecap="round" /></> : <><circle r={48} fill={C.n3} /><path d="M-18,-18 L18,18 M18,-18 L-18,18" stroke={C.ember} strokeWidth={12} strokeLinecap="round" /></>}
              </g>}
            </g>
          );
        })}
      </g>
    </g>
  );
};

/* ---------- ① goals ---------- */
const Monster: React.FC<{ x: number; y: number; s?: number; hit?: boolean; T: number }> = ({ x, y, s = 1, hit, T }) => (
  <g transform={`translate(${x},${y + Math.sin(T * 4) * 6}) scale(${s})`}>
    <ellipse cx={0} cy={60} rx={110} ry={20} fill={C.n0} opacity={0.4} />
    <path d="M-100,50 C-110,-60 -50,-110 0,-110 C50,-110 110,-60 100,50 Z" fill={hit ? C.cream : C.green} />
    <path d="M-60,-90 L-80,-140 L-30,-104 Z M60,-90 L80,-140 L30,-104 Z" fill={hit ? C.cream : C.green} />
    <ellipse cx={-34} cy={-30} rx={18} ry={22} fill="#fff" /><ellipse cx={34} cy={-30} rx={18} ry={22} fill="#fff" /><circle cx={-30} cy={-26} r={9} fill={C.hair} /><circle cx={30} cy={-26} r={9} fill={C.hair} />
    <path d="M-30,10 Q0,30 30,10" stroke={C.hair} strokeWidth={7} fill="none" strokeLinecap="round" />
  </g>
);
const GameScreen: React.FC<{ T: number; children: React.ReactNode }> = ({ T, children }) => (
  <g>
    <rect x={150} y={90} width={1620} height={860} rx={40} fill={C.n0} />
    <defs><clipPath id="gs"><rect x={180} y={120} width={1560} height={800} rx={20} /></clipPath><linearGradient id="gsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2B4C8C" /><stop offset="1" stopColor="#E89A6A" /></linearGradient></defs>
    <g clipPath="url(#gs)">
      <rect x={180} y={120} width={1560} height={800} fill="url(#gsky)" />
      <circle cx={1450} cy={330} r={70} fill={C.gold} /><Glow x={1450} y={330} r={300} c="gold" o={0.5} />
      <path d={`M180,690 ${Array.from({ length: 14 }, (_, i) => `Q${260 + i * 120},${640 + (i % 2) * 40} ${300 + i * 120},${680}`).join(' ')} L1740,920 L180,920 Z`} fill="#3E7D5A" />
      <rect x={180} y={760} width={1560} height={160} fill="#2E6047" />
      {children}
    </g>
  </g>
);
export const Goals: React.FC<{ T: number }> = ({ T }) => {
  const k3 = cue('K3'), k4 = cue('K4'), k5 = cue('K5');
  const k2 = cue('K2');
  if (T < k4 - 0.1) {
    return (
      <Cam s={1 + Math.max(0, T - k3) * 0.01}>
        <rect width={W} height={H} fill={C.n0} />
        <GameScreen T={T}>
          <Monster x={1250} y={640} s={1.2} T={T} />
          <g transform={`translate(1250,${400 + Math.sin(T * 6) * 14})`}><path d="M-34,-60 L34,-60 L0,0 Z" fill={C.gold} /><Glow x={0} y={-30} r={90} c="gold" o={0.7} /></g>
          <g transform={`translate(560,720)`}><KidBack x={0} y={0} s={0.8} hood={C.ember} /></g>
          <g transform="translate(230,250)" opacity={sm(T, k3 + 0.1, 0.3)}><rect width={560} height={170} rx={20} fill={C.n0} opacity={0.85} /><Txt x={36} y={66} s={36} a="start" c={C.gold}>任务</Txt><Txt x={36} y={132} s={54} a="start" c={C.cream} w={900}>打败这只怪</Txt><Txt x={520} y={132} s={44} a="end" c={C.teal} f={F.mono}>0/1</Txt></g>
        </GameScreen>
        <Chip T={T} at={k2} n="1" text="目标清楚" />
      </Cam>
    );
  }
  // homework: a road into fog — no visible end
  const walk = clamp((T - k4) / (k5 + 2 - k4)), tired = sm(T, k5, 0.6);
  return (
    <Cam s={1.02 + (T - k4) * 0.01}>
      <rect width={W} height={H} fill="url(#warmroom)" />
      <path d="M760,1080 L900,520 L1020,520 L1160,1080 Z" fill="#4A3A48" />
      {Array.from({ length: 6 }, (_, i) => <rect key={i} x={950} y={600 + i * 90 + ((T * 60) % 90)} width={20} height={40} fill={C.paper} opacity={0.5} />)}
      <defs><linearGradient id="fog" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.paper} stopOpacity="0" /><stop offset="0.45" stopColor={C.paper} stopOpacity="0.75" /><stop offset="0.7" stopColor={C.paper} stopOpacity="0.35" /><stop offset="1" stopColor={C.paper} stopOpacity="0" /></linearGradient></defs>
      <rect x={0} y={200} width={W} height={560} fill="url(#fog)" />
      {[0, 1, 2].map((i) => <ellipse key={i} cx={(i * 700 + T * 40) % 2400 - 240} cy={470 + i * 30} rx={520} ry={70} fill={C.paper} opacity={0.22} />)}
      <g transform="translate(640,560)"><rect x={-8} y={0} width={16} height={260} fill={C.wood} /><rect x={-170} y={-70} width={340} height={100} rx={10} fill={C.wood2} /><Txt x={0} y={0} s={46} c={C.cream} w={900}>复习第三章</Txt></g>
      {[0, 1, 2].map((i) => <Txt key={i} x={980 + (i - 1) * 140} y={330 - i * 20 + Math.sin(T * 2 + i) * 10} s={90} c={C.cream} o={0.5 * sm(T, cw('K4', '复习到哪'), 0.4)} w={900}>?</Txt>)}
      <g transform={`translate(960,${lerp(860, 780, walk)}) scale(${lerp(0.62, 0.48, walk)})`}><KidBack x={0} y={0} s={1} hood="#5B4A6E" /></g>
      <g transform="translate(1340,780)" opacity={sm(T, k5, 0.4)}><rect width={420} height={110} rx={18} fill={C.n0} opacity={0.85} /><Txt x={30} y={68} s={40} a="start" c={C.cream}>干劲</Txt><rect x={130} y={42} width={260} height={34} rx={17} fill={C.n3} /><rect x={130} y={42} width={260 * (1 - 0.8 * tired)} height={34} rx={17} fill={C.amber} /></g>
    </Cam>
  );
};

/* ---------- ② feedback ---------- */
export const Feedback: React.FC<{ T: number }> = ({ T }) => {
  const k6 = cue('K6'), k7 = cue('K7'), k8 = cue('K8'), k9 = cue('K9');
  if (T < k8 - 0.05) {
    const k = Math.max(-0.5, T - k7), n = Math.floor(k / 0.42), ph = (k % 0.42) / 0.42;
    const nums = ['+12', '+15', '暴击 +40', '+14', '+18', '+16'];
    return (
      <Cam s={1.02}>
        <rect width={W} height={H} fill={C.n0} />
        <GameScreen T={T}>
          <Monster x={1180} y={640} s={1.1} hit={k >= 0 && ph < 0.2} T={T} />
          <g transform={`translate(${700 + (k >= 0 && ph < 0.25 ? 60 : 0)},720)`}><KidBack x={0} y={0} s={0.8} hood={C.ember} /><line x1={60} y1={40} x2={ph < 0.25 ? 260 : 150} y2={ph < 0.25 ? -80 : -40} stroke={C.cream} strokeWidth={14} strokeLinecap="round" /></g>
          {k >= 0 && nums.slice(0, n + 1).map((t, i) => { const age = k - i * 0.42; if (age > 1.1) return null; return <Txt key={i} x={1180 + ((i * 97) % 200) - 100} y={420 - age * 120} s={i === 2 ? 110 : 80} c={i === 2 ? C.ember : C.gold} w={900} stroke={C.n0} o={1 - clamp((age - 0.8) / 0.3)}>{t}</Txt>; })}
          <g transform="translate(230,170)"><rect width={620} height={110} rx={20} fill={C.n0} opacity={0.85} /><Txt x={36} y={72} s={36} a="start" c={C.gold} f={F.mono}>EXP</Txt><rect x={130} y={44} width={440} height={30} rx={15} fill={C.n3} /><rect x={130} y={44} width={440 * clamp(k / 2.2)} height={30} rx={15} fill={C.gold} /></g>
        </GameScreen>
        <Chip T={T} at={k6} n="2" text="马上反馈" />
      </Cam>
    );
  }
  if (T < k9 - 0.05) {
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日', '周一'], i = Math.min(7, Math.floor((T - k8) / ((k9 - k8) / 8)));
    return (
      <Cam s={1.02}>
        <rect width={W} height={H} fill="url(#warmroom)" />
        <Glow x={W / 2} y={460} r={700} c="amber" o={0.3} />
        <g transform="translate(960,500)"><rect x={-260} y={-300} width={520} height={560} rx={24} fill={C.cream} /><rect x={-260} y={-300} width={520} height={130} rx={24} fill={C.ember} /><rect x={-260} y={-200} width={520} height={30} fill={C.ember} />
          <Txt x={0} y={-212} s={50} c={C.cream}>等着发卷子</Txt><Txt x={0} y={100} s={170} c={i === 7 ? C.ember : C.n1} w={900}>{days[i]}</Txt></g>
      </Cam>
    );
  }
  // no feedback: pushing a boulder in the dark
  const k = T - k9;
  return (
    <Cam s={1.03}>
      <rect width={W} height={H} fill={C.n0} />
      <Glow x={1500} y={200} r={700} c="cream" o={0.12} /><Moon x={1560} y={170} r={46} />
      <path d="M0,980 L1920,600 L1920,1080 L0,1080 Z" fill={C.n3} />
      <g transform={`translate(${1000 + k * 20},${790 - k * 4})`}><circle r={190} fill={C.n4} /><path d="M-120,-150 A190,190 0 0,1 150,-110" stroke={C.amber} strokeWidth={10} fill="none" opacity={0.7} /><Txt x={0} y={20} s={64} c={C.cream} w={900}>作业</Txt></g>
      <g transform={`translate(${780 + k * 20},${800 - k * 4}) rotate(14)`}><KidBack x={0} y={0} s={0.75} hood="#5B4A6E" /></g>
      <Txt x={420} y={300} s={120} c={C.slate} o={0.5} w={900}>?</Txt>
    </Cam>
  );
};

/* ---------- ③ just hard enough: the catches (original creatures + capture cube) ---------- */
const Cube: React.FC<{ x: number; y: number; s?: number; tilt?: number; glow?: boolean }> = ({ x, y, s = 1, tilt = 0, glow }) => (
  <g transform={`translate(${x},${y}) rotate(${tilt * 14}) scale(${s})`}>
    {glow && <Glow x={0} y={0} r={120} c="gold" o={0.8} />}
    <rect x={-34} y={-34} width={68} height={68} rx={12} fill={C.teal} stroke={C.n0} strokeWidth={6} />
    <rect x={-34} y={-2} width={68} height={36} rx={0} fill={C.cream} /><rect x={-34} y={-6} width={68} height={8} fill={C.n0} />
    <path d="M0,-26 L6,-14 L19,-13 L9,-5 L12,8 L0,1 L-12,8 L-9,-5 L-19,-13 L-6,-14 Z" transform="scale(0.9) translate(0,-4)" fill={C.gold} />
  </g>
);
const ExamDemon: React.FC<{ x: number; y: number; T: number }> = ({ x, y, T }) => (
  <g transform={`translate(${x},${y + Math.sin(T * 5) * 6})`}>
    <path d="M-170,-320 L-130,-400 L-90,-320 Z M90,-320 L130,-400 L170,-320 Z" fill={C.paper} />
    <rect x={-200} y={-330} width={400} height={480} rx={14} fill={C.paper} stroke={C.n0} strokeWidth={8} />
    {Array.from({ length: 7 }, (_, i) => <rect key={i} x={-160} y={-90 + i * 30} width={300 - (i % 3) * 50} height={10} rx={5} fill="#CDBF9F" />)}
    <Txt x={-150} y={-270} s={40} a="start" c={C.slate}>期末</Txt>
    <circle cx={130} cy={-260} r={40} fill="none" stroke={C.ember} strokeWidth={8} /><Txt x={130} y={-245} s={46} c={C.ember} w={900}>?</Txt>
    <path d="M-120,-190 L-30,-160 L-120,-130 Z M120,-190 L30,-160 L120,-130 Z" fill={C.n0} /><circle cx={-80} cy={-160} r={9} fill={C.ember} /><circle cx={80} cy={-160} r={9} fill={C.ember} />
    <path d={`M-110,-110 ${Array.from({ length: 8 }, (_, i) => `L${-110 + (i + 0.5) * 27.5},${i % 2 ? -110 : -80} `).join('')} L110,-110 Z`} fill={C.n0} />
    <line x1={200} y1={-20} x2={280} y2={-160} stroke={C.n0} strokeWidth={16} strokeLinecap="round" /><line x1={280} y1={-160} x2={300} y2={-300} stroke={C.ember} strokeWidth={20} strokeLinecap="round" />
  </g>
);
const Slip: React.FC<{ x: number; y: number; T: number }> = ({ x, y, T }) => (
  <g transform={`translate(${x},${y - Math.abs(Math.sin(T * 3)) * 6})`}><rect x={-70} y={-50} width={140} height={74} rx={8} fill={C.paper} stroke={C.n0} strokeWidth={5} /><Txt x={0} y={-6} s={36} c={C.slate} f={F.mono}>1+1</Txt><path d="M-34,12 L-18,12 M18,12 L34,12" stroke={C.n0} strokeWidth={5} strokeLinecap="round" /></g>
);
const Notebook: React.FC<{ x: number; y: number; T: number }> = ({ x, y, T }) => (
  <g transform={`translate(${x},${y + Math.sin(T * 4) * 8})`}>
    <rect x={-120} y={-260} width={240} height={290} rx={16} fill={C.orange} stroke={C.n0} strokeWidth={7} /><rect x={-120} y={-260} width={34} height={290} fill="#B8562A" />
    <rect x={-70} y={-230} width={170} height={60} rx={8} fill={C.cream} /><Txt x={15} y={-188} s={36} c={C.n1} w={900}>错题本</Txt>
    <ellipse cx={-20} cy={-100} rx={24} ry={28} fill="#fff" /><ellipse cx={50} cy={-100} rx={24} ry={28} fill="#fff" /><circle cx={-14} cy={-96} r={11} fill={C.hair} /><circle cx={56} cy={-96} r={11} fill={C.hair} />
    <path d="M-10,-40 Q15,-24 40,-40" stroke={C.hair} strokeWidth={7} fill="none" strokeLinecap="round" />
  </g>
);
export const Difficulty: React.FC<{ T: number }> = ({ T }) => {
  const m1 = cue('M1');
  if (T >= m1 - 0.15) return <g><Difficulty T={m1 - 0.16} /><g opacity={sm(T, m1 - 0.15, 0.3)}><rect width={W} height={H} fill={C.n0} opacity={0.8} /><Txt x={W / 2} y={600} s={170} c={C.gold} w={900} stroke={C.n0}>到底多难？</Txt></g></g>;
  const enc = [{ t0: cue('K11'), throw: 0.2, hit: 0.5, wob: [0.62, 0.78, 0.94], end: 1.15 }, { t0: cue('K12'), throw: 0.15, hit: 0.45, wob: [], end: 0.6 }, { t0: cue('K13'), throw: 0.3, hit: 0.65, wob: [0.9, 1.3, 1.7], end: 2.1 }];
  const kind = T >= enc[2].t0 ? 2 : T >= enc[1].t0 ? 1 : 0, E = enc[kind], k = T - E.t0;
  const caught = k >= E.hit + 0.08 && !(kind === 0 && k >= E.end);
  const mx = 1300, my = 760, hx = 520, hy = 880;
  const sky = ['#5A2430', '#6B6F80', '#2B4C8C'][kind];
  const wi = E.wob.findIndex((w) => k >= w && k < w + 0.22), tilt = wi >= 0 ? ((k - E.wob[wi]) < 0.11 ? -1 : 1) : 0;
  const names = ['期末卷大魔王', '1+1 小纸条', '错题本'], lv = ['Lv.99', 'Lv.1', 'Lv.12'], rate = [2, 100, 70], rc = [C.ember, C.slate, C.green];
  const intro = k < 0;
  return (
    <g>
      <rect width={W} height={H} fill={sky} />
      <Glow x={mx} y={500} r={800} c={kind === 0 ? 'ember' : kind === 2 ? 'gold' : 'cream'} o={0.35} />
      <rect x={0} y={800} width={W} height={280} fill={kind === 1 ? '#4E5262' : kind === 0 ? '#3A1E26' : '#2E6047'} />
      <ellipse cx={mx} cy={812} rx={300} ry={36} fill={C.n0} opacity={0.35} />
      {!caught && !intro && (kind === 0 ? <ExamDemon x={mx} y={my} T={T} /> : kind === 1 ? <Slip x={mx} y={my} T={T} /> : <Notebook x={mx} y={my} T={T} />)}
      {kind === 0 && k >= E.end && k < E.end + 0.3 && Array.from({ length: 14 }, (_, i) => { const a = (i / 14) * Math.PI * 2, rr = 120 + (k - E.end) * 900; return <line key={i} x1={mx + Math.cos(a) * 80} y1={my - 160 + Math.sin(a) * 80} x2={mx + Math.cos(a) * rr} y2={my - 160 + Math.sin(a) * rr} stroke={C.cream} strokeWidth={8} />; })}
      {/* hero from behind */}
      <g transform={`translate(${hx},${hy})`}><KidBack x={0} y={0} s={1.1} hood={C.ember} />
        {k >= E.throw - 0.2 && k < E.throw + 0.1 && <line x1={120} y1={60} x2={220} y2={-80} stroke={C.ember} strokeWidth={36} strokeLinecap="round" />}
        {kind === 0 && k > E.end && <path d="M100,-120 q12,22 0,32 q-12,-10 0,-32 Z" fill={C.sky} />}
        {kind === 1 && k > E.end + 0.3 && <Txt x={150} y={-140 - ((T * 40) % 40)} s={50} c={C.cream} o={0.8}>z z z</Txt>}
      </g>
      {k >= E.throw && k < E.hit && (() => { const u = (k - E.throw) / (E.hit - E.throw); return <Cube x={lerp(hx + 140, mx, u)} y={lerp(hy - 150, my - 60, u) - Math.sin(u * Math.PI) * 300} s={0.9} />; })()}
      {caught && <Cube x={mx} y={790} s={1.1} tilt={tilt} glow={(kind === 2 || kind === 1) && k >= E.end} />}
      {/* plates */}
      {!intro && <g><g transform="translate(110,140)"><rect width={600} height={170} rx={22} fill={C.n0} opacity={0.88} />
        <Txt x={36} y={66} s={46} a="start" c={C.cream} w={900}>{names[kind]}</Txt><Txt x={566} y={66} s={38} a="end" c={C.gold} f={F.mono}>{lv[kind]}</Txt>
        <Txt x={36} y={134} s={36} a="start" c={C.slate}>捕获率</Txt><rect x={170} y={108} width={260} height={28} rx={14} fill={C.n3} /><rect x={170} y={108} width={260 * rate[kind] / 100} height={28} rx={14} fill={rc[kind]} /><Txt x={566} y={136} s={56} a="end" c={rc[kind]} w={900} f={kind === 2 ? F.zh : F.num}>{kind === 2 ? '??' : `${rate[kind]}%`}</Txt></g>
      <g transform="translate(110,330)"><rect width={260} height={70} rx={16} fill={C.n0} opacity={0.8} /><Txt x={30} y={48} s={34} a="start" c={C.cream}>你 Lv.10</Txt></g></g>}
      {kind === 0 && k >= E.end + 0.05 && <g transform={`translate(${mx},300) scale(${pop(T, E.t0 + E.end + 0.05)})`}><rect x={-170} y={-60} width={340} height={90} rx={16} fill={C.ember} /><Txt x={0} y={4} s={50} c={C.cream} w={900}>挣脱了！</Txt></g>}
      {kind === 2 && k >= E.end && <g transform={`translate(${mx},560) scale(${pop(T, E.t0 + E.end)})`}><rect x={-180} y={-60} width={360} height={90} rx={16} fill={C.gold} /><Txt x={0} y={4} s={52} c={C.n0} w={900}>抓到了！</Txt></g>}
      {kind === 1 && k >= E.end + 0.1 && <Txt x={mx} y={600} s={46} c={C.cream} o={0.7}>抓到了……</Txt>}
      {!intro && <Txt x={W / 2 + 200} y={190} s={64} c={rc[kind]} w={900} stroke={C.n0} o={sm(T, E.t0 + 0.1, 0.25)}>{['太难', '太简单', '刚刚好'][kind]}</Txt>}
      <Chip T={T} at={cue('K10')} n="3" text="难度刚好" />
    </g>
  );
};
