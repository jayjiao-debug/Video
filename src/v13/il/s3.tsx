import React from 'react';
import { W, H, C, F, Txt, Glow, Stars, Moon, Cam, Kid, KidBack, sm, life, pop, ease, eo, lerp, clamp, rng, cue, cend, cw, DROP2, VO_END, FILM_END } from './kit';
import { Monogram, GoldTitle } from '../../brand/Brand';
import { GameRoom } from './s1';
import { Board } from './s2';

/* ============ how hard is just right? the learning program and the 85% hill ============ */
/* learning speed in Wilson et al.'s model: z·φ(z) with z = Φ⁻¹(accuracy); 0 at 50% and 100%, peak at Φ(1) ≈ 84% */
const invPhi = (p: number) => { // Acklam's rational approximation
  const a = [-39.6968302866538, 220.946098424521, -275.928510446969, 138.357751867269, -30.6647980661472, 2.50662827745924], b = [-54.4760987982241, 161.585836858041, -155.698979859887, 66.8013118877197, -13.2806815528857], c = [-0.00778489400243029, -0.322396458041136, -2.40075827716184, -2.54973253934373, 4.37466414146497, 2.93816398269878], d = [0.00778469570904146, 0.32246712907004, 2.445134137143, 3.75440866190742];
  if (p <= 0) return -8; if (p >= 1) return 8;
  if (p < 0.02425) { const q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  if (p > 1 - 0.02425) { const q = Math.sqrt(-2 * Math.log(1 - p)); return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  const q = p - 0.5, r = q * q; return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
};
const curve = (a: number) => { const z = invPhi(Math.min(0.99999, Math.max(0.5, a))); return (z * Math.exp(-z * z / 2)) / Math.exp(-0.5); };
const PEAK = 0.8413;
const Robot: React.FC<{ x: number; y: number; s?: number; T: number; mood?: 'think' | 'happy' }> = ({ x, y, s = 1, T, mood = 'think' }) => (
  <g transform={`translate(${x},${y + Math.sin(T * 3) * 6}) scale(${s})`}>
    <line x1={0} y1={-170} x2={0} y2={-120} stroke={C.slate} strokeWidth={8} /><circle cx={0} cy={-176} r={14} fill={C.ember} />
    <rect x={-130} y={-120} width={260} height={190} rx={40} fill={C.cream} /><rect x={-104} y={-94} width={208} height={120} rx={24} fill={C.n1} />
    {mood === 'think' ? <><rect x={-60} y={-50} width={36} height={14} rx={7} fill={C.teal} /><rect x={24} y={-50} width={36} height={14} rx={7} fill={C.teal} /></> : <><path d="M-62,-36 Q-42,-62 -22,-36" stroke={C.teal} strokeWidth={10} fill="none" /><path d="M22,-36 Q42,-62 62,-36" stroke={C.teal} strokeWidth={10} fill="none" /></>}
    <rect x={-90} y={80} width={180} height={120} rx={30} fill={C.cream} /><rect x={-40} y={110} width={80} height={40} rx={10} fill={C.n3} />
  </g>
);
export const Model: React.FC<{ T: number }> = ({ T }) => {
  const m1 = cue('M1'), m2 = cue('M2'), m3 = cue('M3'), m4 = cue('M4'), m5 = cue('M5'), m6 = cue('M6'), m7 = cue('M7');
  // chart frame
  const X0 = 300, X1 = 1700, Y0 = 820, YH = 520;
  const px = (a: number) => X0 + (a - 0.5) / 0.5 * (X1 - X0), py = (v: number) => Y0 - v * YH;
  const chartK = sm(T, m3 - 0.2, 0.5);
  const knob = clamp((T - m3) / (m4 - m3 - 0.2));            // difficulty sweeps; accuracy 100% → 50%
  const nDots = Math.floor(knob * 26);
  const dots = Array.from({ length: nDots }, (_, i) => { const a = 1 - (i / 25) * 0.5; return [a, curve(a) * (0.94 + 0.06 * Math.sin(i * 2.3))]; });
  const peak = T >= DROP2 - 0.05, pk = pop(T, DROP2, 0.5);
  const robotS = 1 - 0.5 * chartK, robotX = lerp(960, 1620, chartK), robotY = lerp(620, 300, chartK);
  return (
    <Cam s={1 + (peak ? 0.03 * Math.exp(-(T - DROP2) * 3) : 0)}>
      <rect width={W} height={H} fill="url(#room)" />
      <Glow x={W / 2} y={560} r={900} c="teal" o={0.12} />
      {/* the learning program practising: flash cards A / B */}
      <g opacity={1 - chartK * 0.0}>
        <Robot x={robotX} y={robotY} s={robotS} T={T} mood={peak ? 'happy' : 'think'} />
        {chartK < 0.6 && [0, 1].map((i) => <g key={i} transform={`translate(${780 + i * 360},${330 + Math.sin(T * 4 + i) * 10}) rotate(${i ? 6 : -6})`} opacity={1 - chartK * 1.6}><rect x={-90} y={-120} width={180} height={240} rx={18} fill={i ? C.amber : C.teal} /><Txt x={0} y={36} s={120} c={C.n0} w={900} f={F.num}>{i ? 'B' : 'A'}</Txt></g>)}
        <g opacity={life(T, m2 + 0.2, m3 + 0.6, 0.3, 0.4)}><rect x={120} y={820} width={500} height={120} rx={20} fill={C.n0} opacity={0.85} /><Txt x={150} y={895} s={44} a="start" c={C.gold}>2019 · 一个学习模型</Txt></g>
      </g>
      {chartK > 0 && <g opacity={chartK}>
        <line x1={X0} y1={Y0} x2={X1 + 40} y2={Y0} stroke={C.cream} strokeWidth={4} /><line x1={X0} y1={Y0} x2={X0} y2={Y0 - YH - 60} stroke={C.cream} strokeWidth={4} />
        {[0.5, 0.6, 0.7, 0.8, 0.9, 1].map((a) => <g key={a}><line x1={px(a)} y1={Y0} x2={px(a)} y2={Y0 + 14} stroke={C.cream} strokeWidth={3} /><Txt x={px(a)} y={Y0 + 62} s={40} c={C.slate} f={F.num} w={700}>{`${Math.round(a * 100)}%`}</Txt></g>)}
        <Txt x={X1 + 30} y={Y0 + 110} s={36} a="end" c={C.cream}>答对的比例 →</Txt>
        <Txt x={X0 + 20} y={Y0 - YH - 30} s={36} a="start" c={C.cream}>↑ 学得多快</Txt>
        {dots.map(([a, v], i) => <circle key={i} cx={px(a)} cy={py(v)} r={12} fill={C.teal} />)}
        {knob > 0.02 && knob < 1 && <g transform={`translate(${px(1 - knob * 0.5)},${py(curve(1 - knob * 0.5)) - 60})`}><path d="M-20,0 L20,0 L0,26 Z" fill={C.gold} /></g>}
        {T > m4 - 0.3 && <path d={Array.from({ length: 101 }, (_, i) => { const a = 0.5 + i / 200; return `${i ? 'L' : 'M'}${px(a).toFixed(1)},${py(curve(a)).toFixed(1)}`; }).join(' ')} stroke={C.gold} strokeWidth={8} fill="none" strokeDasharray={`${2200 * ease((T - m4 + 0.3) / 0.8)} 3000`} />}
        {peak && <g>
          <Glow x={px(PEAK)} y={py(1)} r={300} c="gold" o={0.7 * pk} />
          <line x1={px(PEAK)} y1={py(1)} x2={px(PEAK)} y2={Y0} stroke={C.gold} strokeWidth={4} strokeDasharray="12 10" />
          <g transform={`translate(${px(PEAK)},${py(1) - 70}) scale(${pk})`}><Txt x={0} y={0} s={150} c={C.gold} w={900} f={F.num} stroke={C.n0}>≈85%</Txt></g>
        </g>}
        {T > m5 && <g opacity={sm(T, m5, 0.3)}><circle cx={px(1)} cy={py(curve(1))} r={20} fill={C.slate} /><Txt x={px(1) - 30} y={Y0 - 110} s={40} a="end" c={C.cream}>全对：没学到新东西</Txt></g>}
        {T > m6 && <g opacity={sm(T, m6, 0.3)}><circle cx={px(0.5)} cy={py(curve(0.5))} r={20} fill={C.slate} /><Txt x={px(0.5) + 30} y={Y0 - 110} s={40} a="start" c={C.cream}>一半对：跟瞎猜差不多</Txt></g>}
        {T > m7 && <g opacity={sm(T, m7, 0.4)}>
          <rect x={px(PEAK)} y={Y0 - 40} width={px(1) - px(PEAK)} height={40} fill={C.ember} opacity={0.8} /><Txt x={(px(PEAK) + px(1)) / 2} y={Y0 - 52} s={40} c={C.ember} w={900}>错一点</Txt>
          <g transform="translate(300,120)"><rect width={720} height={80} rx={40} fill={C.n0} opacity={0.85} stroke={C.slate} strokeWidth={2} /><Txt x={360} y={54} s={38} c={C.cream}>作者的猜想 · 还没在人身上试过</Txt></g>
        </g>}
      </g>}
    </Cam>
  );
};

/* ============ work vs leisure: the pager study ============ */
const City: React.FC<{ T: number; lights: number; ping?: number }> = ({ T, lights, ping = 0 }) => {
  const r = rng(77); const out: React.ReactNode[] = []; let idx = 0;
  for (let i = 0; i < 13; i++) {
    const x = 60 + i * 140 + (r() - 0.5) * 20, h = 300 + r() * 360, w = 110 + r() * 20, top = 880 - h;
    out.push(<rect key={`b${i}`} x={x} y={top} width={w} height={h} fill={i % 3 ? C.n2 : C.n3} />);
    for (let yy = top + 30; yy < 860; yy += 46) for (let xx = x + 16; xx < x + w - 20; xx += 34) {
      const on = r() < 0.5 && idx < 78 && idx < lights; if (r() < 0.5 && idx < 78) {
        const me = idx; idx++;
        const beep = ping > 0 && Math.floor(T * 4 + me * 7.3) % 11 === 0;
        out.push(<g key={`w${me}`}>{beep && <circle cx={xx + 9} cy={yy + 12} r={28} fill="none" stroke={C.gold} strokeWidth={4} opacity={0.8} />}<rect x={xx} y={yy} width={18} height={24} fill={me < lights ? (beep ? C.gold : C.amber) : C.n1} /></g>);
      } else out.push(<rect key={`d${xx}-${yy}`} x={xx} y={yy} width={18} height={24} fill={C.n1} opacity={on ? 1 : 0.6} />);
    }
  }
  return <g>{out}</g>;
};
export const Work: React.FC<{ T: number }> = ({ T }) => {
  const w1 = cue('W1'), w2 = cue('W2'), w3 = cue('W3'), w4 = cue('W4'), w5 = cue('W5'), w6 = cue('W6'), w7 = cue('W7');
  if (T < w2 - 0.05) {   // office vs couch: which one?
    const k = pop(T, w1 + 0.2), k2 = pop(T, w1 + 0.5);
    return (
      <g><rect width={W} height={H} fill="url(#room)" />
        <g transform={`translate(560,560) scale(${k})`}><Glow x={0} y={0} r={360} c="teal" o={0.4} /><rect x={-220} y={60} width={440} height={30} fill={C.wood2} /><rect x={-150} y={-120} width={300} height={180} rx={14} fill={C.n0} /><rect x={-134} y={-104} width={268} height={148} fill={C.sky} opacity={0.6} /><Txt x={0} y={240} s={72} c={C.teal} w={900}>上班</Txt></g>
        <g transform={`translate(1360,560) scale(${k2})`}><Glow x={0} y={0} r={360} c="amber" o={0.4} /><rect x={-230} y={-20} width={460} height={120} rx={30} fill="#7A4E3A" /><rect x={-230} y={-120} width={460} height={110} rx={30} fill="#8E5E46" /><Txt x={0} y={240} s={72} c={C.amber} w={900}>下班</Txt></g>
        <Txt x={W / 2} y={600} s={140} c={C.cream} w={900} o={sm(T, cw('W1', '更容易'), 0.3)}>&gt;</Txt>
      </g>
    );
  }
  if (T < w3 - 0.05) {   // memories are blurry: ask in the moment instead
    return (
      <g><rect width={W} height={H} fill="url(#room)" />
        <Kid x={700} y={600} s={1.3} face={{ eyes: 'up', mouth: 'flat' }} T={T} />
        <ellipse cx={1300} cy={360} rx={360} ry={220} fill={C.cream} opacity={0.9} /><circle cx={1000} cy={560} r={30} fill={C.cream} opacity={0.9} /><circle cx={940} cy={620} r={18} fill={C.cream} opacity={0.9} />
        {[0, 1, 2].map((i) => <rect key={i} x={1120 + i * 20} y={260 + i * 70} width={300 - i * 60} height={30} rx={15} fill={C.slate} opacity={0.3 + 0.2 * Math.sin(T * 6 + i)} />)}
        <Txt x={1300} y={380} s={110} c={C.slate} w={900} o={sm(T, cw('W2', '事后'), 0.3)}>???</Txt>
      </g>
    );
  }
  if (T < w5 - 0.05) {   // Chicago, 78 workers, pagers ringing at random
    const lights = Math.floor(clamp((T - w3) / 1.6) * 78);
    const card = sm(T, cw('W4', '当场'), 0.4);
    return (
      <Cam s={1.02 + (T - w3) * 0.005}>
        <rect width={W} height={H} fill="url(#dusk)" /><Stars T={T} n={40} seed={6} y1={300} o={0.6} />
        <City T={T} lights={lights} ping={T > w4 ? 1 : 0} />
        <rect x={0} y={880} width={W} height={200} fill={C.n0} />
        <g transform="translate(150,110)"><rect width={560} height={130} rx={20} fill={C.n0} opacity={0.85} /><Txt x={36} y={88} s={44} a="start" c={C.cream}>芝加哥 · 上班族</Txt><Txt x={530} y={92} s={72} a="end" c={C.amber} f={F.num} w={700}>{lights}</Txt></g>
        {T > w4 && <g transform="translate(1290,110)"><rect width={480} height={130} rx={20} fill={C.n0} opacity={0.85} /><Txt x={36} y={88} s={44} a="start" c={C.cream}>一周响了</Txt><Txt x={450} y={92} s={72} a="end" c={C.gold} f={F.num} w={700}>{Math.min(56, Math.floor((T - w4) * 14))}</Txt></g>}
        {card > 0 && <g opacity={card} transform={`translate(1220,${360 + 40 * (1 - card)})`}><rect width={560} height={300} rx={20} fill={C.cream} />
          {['在干嘛', '难不难', '会不会'].map((l, i) => <g key={i}><Txt x={40} y={80 + i * 80} s={44} a="start" c={C.n1}>{l}</Txt>{i === 0 ? <Txt x={260} y={80} s={44} a="start" c={C.ember}>开会</Txt> : Array.from({ length: 5 }, (_, j) => <rect key={j} x={240 + j * 56} y={46 + i * 80} width={44} height={44} rx={8} fill={j < [0, 4, 3][i] ? (i === 1 ? C.ember : C.teal) : '#DCCFB4'} />)}</g>)}
        </g>}
      </Cam>
    );
  }
  if (T < w7 - 0.05) {   // 54% vs 17%
    const bar = (lab: string, v: number, y: number, at: number, col: string) => { const p = T < at ? 0 : eo((T - at) / 0.8) * v; return <g><Txt x={330} y={y + 70} s={80} a="end" c={col} w={900}>{lab}</Txt><rect x={380} y={y} width={1100} height={100} rx={50} fill={C.n2} /><rect x={380} y={y} width={Math.max(100, 1100 * p)} height={100} rx={50} fill={col} opacity={T < at ? 0.15 : 1} /><Txt x={1520} y={y + 84} s={110} a="start" c={col} w={900} f={F.num}>{`${Math.round(p * 100)}%`}</Txt></g>; };
    return (
      <g><rect width={W} height={H} fill="url(#room)" /><Glow x={900} y={400} r={800} c="teal" o={0.12} />
        <Txt x={W / 2} y={200} s={46} c={C.slate}>处在心流里的时刻</Txt>
        {bar('上班', 0.54, 330, cw('W5', '54%') - 0.2, C.teal)}
        {bar('下班', 0.17, 560, cw('W6', '17%') - 0.2, C.amber)}
      </g>
    );
  }
  // evening TV: relaxed, but no goal, no challenge
  const fl = [C.sky, C.teal, C.cream, C.sky][Math.floor(T * 6) % 4];
  return (
    <Cam s={1.02 + (T - w7) * 0.01}>
      <rect width={W} height={H} fill={C.n0} />
      <path d="M1460,420 L560,200 L560,1000 L1460,700 Z" fill={fl} opacity={0.08} />
      <g transform="translate(1520,560)"><rect x={-200} y={-160} width={400} height={260} rx={14} fill={C.n2} /><rect x={-180} y={-140} width={360} height={220} fill={fl} opacity={0.8} /><rect x={-20} y={100} width={40} height={60} fill={C.n2} /></g>
      <Glow x={1520} y={520} r={500} c="sky" o={0.3} />
      <rect x={220} y={640} width={760} height={240} rx={40} fill="#3A2A3A" /><rect x={220} y={520} width={760} height={160} rx={50} fill="#4A3646" />
      <Kid x={600} y={560} s={1.1} face={{ eyes: 'half', mouth: 'flat' }} hood="#5B4A6E" light={C.sky} lightO={0.25} T={T} />
      <rect x={0} y={880} width={W} height={200} fill="#140F1C" />
    </Cam>
  );
};

/* ============ ending: design, not willpower → homework as levels → the question ============ */
export const Ending: React.FC<{ T: number }> = ({ T }) => {
  const e1 = cue('E1'), e2 = cue('E2'), e3 = cue('E3'), e4 = cue('E4'), e5 = cue('E5'), e6 = cue('E6');
  if (T < e2 - 0.05) {
    const fix = [0, 1, 2].filter((i) => T > cw('E1', '靠设计') + i * 0.18);
    return <g><Board T={T} reveal={3} homeworkFix={fix} /><g opacity={sm(T, e1, 0.3) * (1 - sm(T, cw('E1', '靠设计'), 0.3))}><Txt x={W / 2} y={110} s={56} c={C.slate}>意志力 ✗</Txt></g></g>;
  }
  if (T < e6 - 0.1) {
    const nodes = [{ x: 420, y: 760, lab: '先做完这5道题', at: e3 + 0.3 }, { x: 860, y: 560, lab: '马上对答案', at: e4 }, { x: 1300, y: 640, lab: '会错一两成的题', at: e5 }, { x: 1560, y: 380, lab: 'BOSS：整章', at: e5 + 0.6 }];
    const path = ease((T - e2) / 1.2);
    return (
      <Cam s={1.02}>
        <rect width={W} height={H} fill="url(#warmroom)" />
        <rect x={180} y={140} width={1560} height={800} rx={24} fill={C.paper} />
        <Txt x={300} y={250} s={60} a="start" c={C.n1} w={900} o={1 - sm(T, e3, 0.4)}>复习第三章</Txt>
        <path d={`M${nodes.map((n) => `${n.x},${n.y}`).join(' L')}`} stroke="#B9A57E" strokeWidth={16} fill="none" strokeDasharray={`20 22`} strokeDashoffset={0} opacity={path} />
        {nodes.map((n, i) => {
          const k = pop(T, n.at), done = (i === 0 && T > e4 + 0.4) || (i === 1 && T > e4 + 0.9);
          if (k <= 0) return null;
          return <g key={i} transform={`translate(${n.x},${n.y}) scale(${k})`}>
            <circle r={i === 3 ? 74 : 60} fill={done ? C.green : i === 3 ? C.ember : C.amber} stroke={C.n1} strokeWidth={8} />
            {done ? <path d="M-24,0 L-6,18 L26,-18" stroke={C.cream} strokeWidth={12} fill="none" strokeLinecap="round" /> : <Txt x={0} y={20} s={i === 3 ? 34 : 50} c={C.n1} w={900}>{i === 3 ? 'BOSS' : `${i + 1}`}</Txt>}
            <rect x={-170} y={84} width={340} height={70} rx={14} fill={C.n1} /><Txt x={0} y={133} s={36} c={C.cream}>{n.lab}</Txt>
          </g>;
        })}
        {T > e4 + 0.4 && <Txt x={420} y={620 - Math.min(60, (T - e4 - 0.4) * 120)} s={60} c={C.gold} w={900} stroke={C.n1} o={1 - clamp((T - e4 - 1.2) / 0.4)}>+50 XP</Txt>}
        {T > e5 && <g transform="translate(260,200)" opacity={sm(T, e5, 0.3)}><rect width={520} height={130} rx={20} fill={C.n1} /><Txt x={30} y={56} s={34} a="start" c={C.slate}>答对的比例</Txt>
          <rect x={30} y={78} width={460} height={24} rx={12} fill={C.n3} /><rect x={30 + 460 * 0.6} y={78} width={460 * 0.2} height={24} fill={C.green} />
          <Txt x={30 + 460 * lerp(0.2, 0.7, eo((T - e5) / 0.8))} y={72} s={30} c={C.gold} w={900}>▼</Txt></g>}
      </Cam>
    );
  }
  // the question, back in the room at dawn — calmer now
  return (
    <Cam s={1.06 - (T - e6) * 0.01}>
      <GameRoom T={T} dawnK={1} face={{ eyes: 'open', mouth: 'smile', blush: true }} mins={6 * 60 + 10} showClock={false} />
      <rect width={W} height={H} fill={C.n0} opacity={0.45} />
      <Txt x={W / 2} y={460} s={92} c={C.cream} w={900} stroke={C.n0} o={sm(T, e6, 0.3)}>你最近一次忘了时间，</Txt>
      <Txt x={W / 2} y={590} s={92} c={C.gold} w={900} stroke={C.n0} o={sm(T, cw('E6', '是在'), 0.3)}>是在做什么？</Txt>
    </Cam>
  );
};

const SOURCES = 'Wilson et al. 2019, Nat Commun · Csikszentmihalyi & LeFevre 1989, JPSP · Nakamura & Csikszentmihalyi 2002 · Kubey & Csikszentmihalyi 2002, Sci Am';
export const EndCard: React.FC<{ T: number; a: number }> = ({ T, a }) => {
  const k = sm(T, a, 0.5);
  return (
    <g opacity={k}>
      <rect width={W} height={H} fill="url(#night)" />
      <Stars T={T} n={80} seed={12} y1={1080} o={0.6} />
      <Glow x={W / 2} y={420} r={700} c="amber" o={0.3} sy={0.6} />
      <g transform={`translate(${W / 2},230)`}><Monogram draw={sm(T, a + 0.1, 1.2)} size={1.1} wordmark="Juno" /></g>
      <GoldTitle text="心流" f={T * 30} at={(a + 0.5) * 30} size={140} y={500} />
      <Txt x={W / 2} y={600} s={42} c={C.cream} o={sm(T, a + 0.4, 0.4)}>你最近一次忘了时间，是在做什么？</Txt>
      <Txt x={W / 2} y={665} s={30} c={C.slate} o={sm(T, a + 0.7, 0.4)}>@ 那个总说"学不进去"的朋友</Txt>
      <g opacity={sm(T, a + 1, 0.4)}><rect x={W / 2 - 330} y={720} width={660} height={70} rx={35} fill="none" stroke={C.amber} strokeWidth={3} /><Txt x={W / 2} y={767} s={32} c={C.amber} ls="0.1em">关注 Juno · 每期一个反直觉的知识</Txt></g>
      <Txt x={W / 2} y={1010} s={23} c={C.slate} f={F.num} w={500} o={0.9 * sm(T, a + 1.2, 0.4)}>{SOURCES}</Txt>
    </g>
  );
};
