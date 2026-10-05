import React from 'react';
import { random } from 'remotion';
import { GoldTitle11 } from '../v11/kit11';
import { Monogram } from '../brand/Brand';
import { JUNO } from '../brand/identity';
import {
  A, INK, LAB, SEC, TER, F, W, H, cue, segEnd, BLK, bound, pr, eo, eio, pop, spring, lerp, clamp, rnd, cnt, mix, tcOf, goldOn,
  roughEllipse, roughLine, roughCurve, Arrow, G, Grease, GText, Strip, GA, Fr, Header, Tx, Svg, Layer, Token, FILM_END,
} from './kit12';

const SChip: React.FC<{ x: number; y: number; label: string; t: number; T: number; size?: number }> = ({ x, y, label, t, T, size = 30 }) => {
  const k = eo(T, t, 0.22);
  if (k <= 0) return null;
  const w = 12 + size * 0.62 + 6 + label.length * size + 14;
  return (
    <g transform={`translate(${x},${y}) scale(${lerp(1.25, 1, k)})`} opacity={k}>
      <rect x={0} y={0} width={w} height={size + 18} rx={5} fill="#E1E6E2" stroke="#7D868C" strokeWidth={1.4} />
      <Tx x={12} y={size * 0.92} size={size * 0.62} w={400} mono color={SEC}>▸</Tx>
      <Tx x={12 + size * 0.62 + 6} y={size + 4} size={size} w={700}>{label}</Tx>
    </g>
  );
};

/* ============================== B6 · 害怕时，时间会变慢吗？ ============================== */
export const B6Scene: React.FC<{ T: number; x: number }> = ({ T, x }) => {
  const a = bound('B5', 'B6') - 0.25;
  const tFall = cue('B6a', '自由落体'), t31 = cue('B6a', '三十一米'), tAfter = cue('B6b', '事后'), t36 = cue('B6c', '百分之三十六'), tIf = cue('B6d', '要是'), tWrist = cue('B6e', '手腕'), tNo = cue('B6f', '看不清'), tGold = cue('B6g');
  // fall: token tips then drops under gravity onto the net (y 690)
  const tip = eio(T, tFall, 0.35) * -95;
  const fk = clamp((T - tFall - 0.35) / 1.2);
  const ty = lerp(360, 690, fk * fk);
  const net = fk >= 1 ? 24 * Math.exp(-(T - tFall - 1.55) * 5) * Math.cos((T - tFall - 1.55) * 18) : 0;
  const timer = (2.49 * clamp((T - tFall - 0.35) / 1.2)).toFixed(2);
  const area = (k: number) => lerp(1, 0.35, k);
  const fallDim = T > tAfter ? eo(T, tAfter, 0.3) : 0;
  const memLit = eo(T, tAfter, 0.3);
  const ledLit = eo(T, tIf, 0.3);
  const gold = eo(T, tGold - 0.3, 0.3);
  const L1 = 1080 + 499 * eo(T, tAfter, 0.5), L2 = 1080 + 681 * eo(T, tAfter + 0.4, 0.7);
  const fr1: Fr[] = Array.from({ length: 9 }, (_, i) => ({ x: 1084 + i * 60, w: 52, state: 'normal', pic: 'pTower', picO: 0.35 }));
  const play = Math.floor(Math.max(0, T - tGold) * 10);
  const fr2: Fr[] = Array.from({ length: 23 }, (_, i) => ({ x: 1084 + i * 30, w: 24, state: 'acc', pic: (i + play) % 3 === 0 ? 'pTower' : undefined, picO: 0.35 }));
  const flick = Math.floor(T * 30) % 2;
  const lens = eio(T, tWrist - 0.2, 0.5) * (1 - eio(T, tNo + 0.6, 0.3));
  const sharp = T < tNo ? 1 : 1 - eo(T, tNo, 0.2);
  const otherDim = gold ? lerp(1, 0.55, gold) : 1;
  return (
    <Layer x={x}>
      <Header T={T} a={a} vol="06" field="神经科学" title="害怕时，时间会变慢吗？" titleSize={90} eng="DOES TIME SLOW DOWN IN A FALL?" chip="研究" line="Stetson, Fiesta & Eagleman · 2007 · 7人 · 一项小实验" />
      <Svg>
        {/* fall column */}
        <g opacity={area(fallDim * 0.6) * otherDim}>
          <rect x={160} y={340} width={280} height={510} rx={4} fill="url(#g12-img)" filter="url(#g12-lift)" />
          <g stroke="#AEB6BC" strokeWidth={2} fill="none" opacity={0.75}>
            <path d="M262,850 L284,360 L316,360 L338,850" />
            {Array.from({ length: 12 }, (_, i) => { const y = 400 + i * 38; const k = (y - 360) / 490; return <line key={i} x1={284 - 22 * k} y1={y} x2={316 + 22 * k} y2={y} />; })}
          </g>
          <rect x={250} y={352} width={100} height={10} fill="#E3E7E9" />
          <Tx x={176} y={830} size={30} w={500} color="#E3E7E9" o={0.8}>塔高 46 米</Tx>
          <path d={`M200,690 Q300,${700 + net} 400,690`} stroke="#AEB6BC" strokeWidth={3} fill="none" />
          <path d={`M200,700 Q300,${710 + net} 400,700`} stroke="#AEB6BC" strokeWidth={2} fill="none" opacity={0.6} />
          <Token x={300} y={ty} s={0.7} color="#E4E9EB" rot={tip} />
          <Tx x={600} y={420} size={34} w={500} color={LAB}>真实下落</Tx>
          <Tx x={600} y={500} size={64} w={900} tnum>{`${timer} 秒`}</Tx>
        </g>
        {/* LED test */}
        <g opacity={lerp(0.35, 1, ledLit) * otherDim} >
          <Tx x={600} y={600} size={34} w={500} color={LAB}>腕上的数字</Tx>
          <rect x={600} y={620} width={320} height={150} rx={12} fill="#15171A" />
          {[0, 1].map((m) => (
            <g key={m}>
              {Array.from({ length: 64 }, (_, i) => {
                const c = i % 8, r = Math.floor(i / 8);
                const on = rnd(i + m * 64, Math.floor(T * 30)) > 0.5;
                return <circle key={i} cx={635 + m * 144 + c * 15} cy={642 + r * 15} r={5} fill={on ? '#EEF2EE' : '#2A2F34'} opacity={flick ? 0.9 : 0.75} />;
              })}
            </g>
          ))}
          <SChip x={600} y={792} label="地面：看不清" t={tNo + 0.1} T={T} size={26} />
          <Tx x={838} y={824} size={30} w={700} o={eo(T, tNo + 0.2, 0.2)}>=</Tx>
          <SChip x={866} y={792} label="空中：看不清" t={tNo + 0.25} T={T} size={26} />
        </g>
        {/* memory strips */}
        <g opacity={lerp(0.35, 1, memLit) * (T > tIf ? lerp(1, 0.55, eo(T, tIf, 0.3)) : 1) + (gold ? 0.45 * gold : 0)}>
          <Tx x={1080} y={420} size={34} w={500} color={LAB}>别人那一跳（估计）</Tx>
          <Tx x={1579} y={420} size={40} w={700} anchor="end" tnum o={eo(T, tAfter + 0.4, 0.3)}>2.17 秒</Tx>
          <Strip x0={1080} x1={L1} y={436} g={GA.bar} perf="dim" frames={fr1} />
          <Tx x={1080} y={580} size={34} w={500} color={LAB}>自己那一跳（回想）</Tx>
          <Tx x={1761} y={580} size={40} w={700} anchor="end" color={A} tnum o={eo(T, tAfter + 1.0, 0.3)}>2.96 秒</Tx>
          <Strip x0={1080} x1={L2} y={596} g={GA.bar} perf="bright" frames={fr2} hi />
          <Tx x={1500} y={800} size={112} w={900} color={A} tnum o={eo(T, t36, 0.2)}>{`+${cnt(T, t36, 36, 0.6)}%`}</Tx>
        </g>
        <Grease>
          <g opacity={otherDim}>
            <G d={roughLine(460, 362, 460, 688, 71, 2, 6)} p={pr(T, t31, 0.4)} w={6} />
            <G d={roughLine(450, 362, 472, 362, 72, 1, 2)} p={pr(T, t31, 0.2)} w={6} />
            <G d={roughLine(450, 688, 472, 688, 73, 1, 2)} p={pr(T, t31 + 0.2, 0.2)} w={6} />
            <GText x={474} y={540} p={pr(T, t31 + 0.2, 0.3)} size={40} text="31 米" />
          </g>
          <G d={roughCurve([[1579, 680], [1590, 690], [1750, 690], [1761, 680]], 74, 2)} p={pr(T, t36, 0.3)} w={6} />
          <G d={roughLine(600, 532, 860, 530, 75, 1.5, 6)} p={pr(T, tGold + 0.4, 0.3)} w={6} />
          {/* the prediction, struck */}
          <GText x={944} y={680} p={pr(T, tWrist + 0.4, 0.3)} size={34} text="就该看得清" o={1} />
          <G d={roughLine(936, 668, 1124, 652, 76, 2, 5)} p={pr(T, tNo + 0.05, 0.25)} w={7} />
        </Grease>
        {/* loupe over the LED, showing the prediction (a steady digit) */}
        {lens > 0.01 && (
          <g transform={`translate(${lerp(1300, 760, lens)},${695})`} opacity={clamp(lens * 2)}>
            <circle r={150} fill="#15171A" opacity={0.92} />
            <g opacity={sharp}>
              {[[1, 1, 1, 1, 1, 1, 1, 0], [0, 0, 0, 0, 0, 1, 1, 0], [0, 0, 0, 0, 1, 1, 0, 0], [0, 0, 0, 1, 1, 0, 0, 0], [0, 0, 1, 1, 0, 0, 0, 0], [0, 0, 1, 1, 0, 0, 0, 0], [0, 0, 1, 1, 0, 0, 0, 0], [0, 0, 1, 1, 0, 0, 0, 0]].flatMap((row, r) => row.map((on, c) => <circle key={`${r}-${c}`} cx={-105 + c * 30} cy={-105 + r * 30} r={10} fill={on ? '#EEF2EE' : '#2A2F34'} />))}
            </g>
            {sharp < 1 && Array.from({ length: 64 }, (_, i) => <circle key={i} cx={-105 + (i % 8) * 30} cy={-105 + Math.floor(i / 8) * 30} r={10} fill={rnd(i, Math.floor(T * 30)) > 0.5 ? '#EEF2EE' : '#2A2F34'} opacity={1 - sharp} />)}
            <circle r={164} fill="none" stroke="#15171A" strokeWidth={16} filter="url(#g12-liftHi)" />
            <circle r={151} fill="none" stroke={SEC} strokeWidth={1.5} />
            <circle r={150} fill="none" stroke={A} strokeWidth={3} strokeDasharray="10 8" opacity={sharp} />
          </g>
        )}
      </Svg>
    </Layer>
  );
};

/* ============================== B7 · 回忆会快进 ============================== */
const EV: Record<number, string> = { 4: 'pPost', 11: 'pPaper', 21: 'pDrink', 29: 'pCafe' };
const PITCH = 1624 / 17;
export const B7Scene: React.FC<{ T: number; x: number; push: number }> = ({ T, x, push }) => {
  const a = BLK.B7[0] - 0.55;
  const t128 = cue('B7b', '一百多个'), t33 = cue('B7c', '三十三分钟'), tRe = cue('B7c', '回想这段路'), t5 = cue('B7d', '不到五分钟'), tFF = cue('B7d', '像按了快进');
  const feed = eo(T, a, 1.2);
  const tcUp = Math.round(1987 * eo(T, a + 0.2, Math.max(0.6, t33 - a - 0.2)));
  const roll = eio(T, t5, 1.2);
  const tcDn = Math.round(lerp(1987, 292, roll));
  const fmt = (s: number) => `00:${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const rows = [0, 1].map((row) => {
    const y = 376 + row * 124, nF = row ? 16 : 17;
    const fr: Fr[] = Array.from({ length: nF }, (_, i) => {
      const m = row * 17 + i + 1, k = EV[m];
      return { x: 148 + i * PITCH + (1 - feed) * 1800 * (row ? 1.15 : 1), w: 88, state: k ? 'key' : 'dim', pic: k || 'pWalk', picO: k ? 1 : 0.6, label: String(m) };
    });
    return <Strip key={row} x0={128} x1={row ? 148 + nF * PITCH + 12 : 1792} y={y} g={GA.card} perf="dim" frames={fr} tc={row ? undefined : tcOf(T)} />;
  });
  const KX = 640, KY = 704, kLen = 20 + 4.87 * PITCH + 6;
  const rb = ['pPost', 'pPaper', 'pDrink', 'pCafe', 'pWalk'];
  const evPos = [[4, 0, 3], [11, 0, 10], [21, 1, 3], [29, 1, 11]];
  const ffk = T > tFF ? Math.floor((T - tFF) * 12) : 0;
  const repl: Fr[] = rb.map((id, i) => {
    const t = tRe + 0.5 + i * 0.12;
    const k = eo(T, t, 0.3);
    return { x: KX + 20 + i * PITCH, w: i < 4 ? 88 * (k > 0 ? 1 : 0) : (0.87 * PITCH - 7) * eo(T, tRe + 1.1, 0.3), state: i < 4 ? 'key' : 'dim', pic: T > tFF && T < tFF + 0.7 ? rb[(i + ffk) % 4] : id, picO: i < 4 ? k : 0.6 };
  });
  return (
    <Layer x={x} s={lerp(1, 1.42, push)} cx={140.9} cy={600.9} o={1 - eo(push, 0.45, 0.55)}>
      <Header T={T} a={a} vol="07" field="认知心理学" title="回忆会快进" eng="TEMPORAL COMPRESSION IN MEMORY" chip="研究" line={`Jeunehomme 等 · 2018 · ${cnt(T, a + 0.3, 128, 0.8)}名大学生 · 随身相机`} />
      <Svg>
        <Tx x={148} y={360} size={40} w={900} o={eo(T, a + 0.3, 0.3)}>散步原片</Tx>
        <Tx x={334} y={360} size={34} w={500} color={SEC} o={eo(T, a + 0.4, 0.3)}>1 格 = 1 分钟</Tx>
        <Tx x={1792} y={362} size={64} w={900} anchor="end" tnum o={eo(T, a + 0.2, 0.3)}>{fmt(tcUp)}</Tx>
        {rows}
        {/* the wearable camera */}
        <g transform={`translate(72,434) scale(${pop(T, t128)})`}>
          <rect x={-32} y={-24} width={64} height={48} rx={8} fill="#2A2F34" />
          <circle r={14} fill="#59616A" /><circle r={5} cx={-4} cy={-4} fill="#EEF2EE" opacity={0.5 + 0.5 * Math.sin(T * 3)} />
          <rect x={-10} y={-34} width={20} height={10} rx={2} fill="#2A2F34" />
        </g>
        {T > tRe && (
          <g>
            <Tx x={148} y={760} size={42} w={900} o={eo(T, tRe + 0.3, 0.3)}>回想一遍</Tx>
            <Tx x={148} y={808} size={34} w={500} color={SEC} o={eo(T, tRe + 0.4, 0.3)}>同一段路</Tx>
            <Strip x0={KX} x1={KX + kLen * eo(T, tRe + 0.35, 0.4)} y={KY} g={GA.card} perf="bright" frames={repl} hi />
            <Tx x={148} y={850} size={28} w={500} color={SEC} o={eo(T, tRe + 1.2, 0.3)}>长度按数据 · 画面为示意</Tx>
          </g>
        )}
        {T > t5 - 0.05 && <Tx x={1186} y={808} size={112} w={900} color={roll > 0.95 ? A : mix('#121417', '#2347E0', roll)} tnum transform={`translate(1186,808) scale(${1 + 0.04 * Math.sin(Math.PI * pr(T, t5 + 1.2, 0.15))}) translate(-1186,-808)`}>{fmt(tcDn)}</Tx>}
        <Grease>
          {evPos.map(([m, row, i], k) => <G key={m} d={roughEllipse(148 + i * PITCH + 44, 376 + row * 124 + 58, 62, 47, m * 3, 1.12, 0.04, m % 2 ? 0.06 : -0.05)} p={pr(T, tRe + k * 0.12, 0.3)} w={7} />)}
          <Arrow pts={[[884, 628], [882, 660], [885, 692]]} p={pr(T, tRe + 0.3, 0.35)} seed={12} w={7} head={22} />
          <G d={roughLine(1190, 834, 1660, 830, 21, 1.5, 5)} p={pr(T, t5 + 1.25, 0.3)} w={7} />
          <GText x={1680} y={800} p={pr(T, tFF, 0.3)} size={48} text="▸▸" />
        </Grease>
      </Svg>
    </Layer>
  );
};

/* ============================== B8 · 大脑像视频压缩 ============================== */
const xm = (m: number) => 151 + (m - 18) * 135.6;
export const B8Scene: React.FC<{ T: number; x: number; inK: number }> = ({ T, x, inK }) => {
  const a = bound('B7', 'B8') - 0.1;
  const tAn = cue('B8a', '视频压缩'), tSame = cue('B8b', '画面不变'), tNo = cue('B8b', '不存'), tCut = cue('B8c', '切换'), t5 = cue('B8d', '五倍'), tGold = cue('B8e');
  const kDeck = eio(T, tSame + 0.3, 0.6), kCol = eio(T, tNo + 0.3, 0.3);
  const kGold = eio(T, tGold - 0.1, 0.8);
  // frame positions: 22..27 deck onto 22; 28,29 close the gap; on the gold line 18..20 deck onto 18 and the short strip centres
  const ms = Array.from({ length: 12 }, (_, i) => 18 + i);
  const pos = (m: number) => {
    let px = xm(m);
    if (m >= 22 && m <= 27) px = lerp(xm(m), xm(22) + (m - 22) * 4 * (1 - kCol), kDeck);
    if (m >= 28) px = xm(m) - 5 * 135.6 * kDeck - 0 * kCol;
    if (kGold > 0) {
      const order: Record<number, number> = { 18: 0, 19: 0, 20: 0, 21: 1, 22: 2, 23: 2, 24: 2, 25: 2, 26: 2, 27: 2, 28: 2, 29: 3 };
      const target = 689 + order[m] * 135.6;
      px = lerp(px, target, kGold);
    }
    return px;
  };
  const fr: Fr[] = ms.map((m) => {
    const k = m === 21 ? 'pDrink' : m === 29 ? 'pCafe' : 'pWalk';
    const lit = m === 29 && T > tCut;
    return { x: pos(m), w: 125, state: lit || m === 21 ? 'key' : 'dim', pic: k, picO: m === 21 || m === 29 ? 1 : 0.6 };
  });
  // draw the deck order so merged frames stack
  const stripX0 = lerp(128, 669, kGold), stripX1 = lerp(1792 - 5 * 135.6 * kDeck, 669 + 4 * 135.6 + 20, kGold);
  const flash = T > tCut && T < tCut + 0.07;
  const barHero = 180 * eo(T, t5 + 0.5, 0.6), barCmp = 36 * eo(T, t5, 0.6);
  const dim = goldOn(T) ? 0.55 : 1;
  return (
    <Layer x={x} o={inK}>
      <Header T={T} a={a} vol="08" field="认知心理学 × 视频编码" title="大脑像视频压缩" titleChip="类比" eng="EVENT BOUNDARIES · KEYFRAMES" chip="研究" line="Jeunehomme & D'Argembeau · 2020" chipPulse={tAn} />
      <Svg>
        <Strip x0={stripX0} x1={stripX1} y={458} g={{ h: 164, band: 40, hw: 13, hh: 17, hr: 3, pitch: 25.6, inset: 11 }} perf="dim" frames={fr} tc={tcOf(T)} />
        {flash && <rect x={pos(29)} y={498} width={125} height={85} fill="#FCFDFB" opacity={0.9} />}
        <g opacity={dim * (1 - kGold)}>
          <Tx x={1180} y={636} size={34} w={500} color={LAB} o={eo(T, t5, 0.3)}>被记住的机会</Tx>
          <rect x={1240} y={830 - barHero} width={80} height={barHero} rx={3} fill={A} />
          <rect x={1460} y={830 - barCmp} width={80} height={barCmp} rx={3} fill="#AEB6BC" />
          <Tx x={1280} y={872} size={30} w={700} color={LAB} anchor="middle" o={eo(T, t5, 0.3)}>切换那一刻</Tx>
          <Tx x={1500} y={872} size={30} w={700} color={LAB} anchor="middle" o={eo(T, t5, 0.3)}>其他时刻</Tx>
          <Tx x={200} y={820} size={112} w={900} color={A} tnum o={eo(T, t5, 0.2)}>{String(Math.max(1, Math.round(lerp(1, 5, eo(T, t5, 0.6)))))}</Tx>
          <Tx x={270} y={820} size={56} w={900} color={A} o={pop(T, t5 + 0.6)}>倍以上</Tx>
        </g>
        {kGold > 0 && <SChip x={1100} y={676} label="示意" t={tGold + 0.6} T={T} />}
        <Grease>
          <g opacity={1 - kGold}>
            <G d={roughCurve([[xm(22) - 8, 448], [xm(22) - 8, 432], [xm(27) + 133, 432], [xm(27) + 133, 448]], 81, 3)} p={pr(T, tSame, 0.3)} w={6} o={1 - kDeck} />
            <G d={roughLine(xm(22) - 10, 470, xm(22) + 135, 610, 82, 2, 4)} p={pr(T, tNo, 0.25)} w={7} o={1 - kCol * 0.6} />
            <G d={roughLine(xm(22) + 135, 470, xm(22) - 10, 610, 83, 2, 4)} p={pr(T, tNo + 0.1, 0.25)} w={7} o={1 - kCol * 0.6} />
            <GText x={xm(22) + 62} y={436} p={pr(T, tNo + 0.2, 0.3)} size={40} text="不存" anchor="middle" />
            <G d={roughEllipse(pos(29) + 62, 540, 100, 72, 84)} p={pr(T, tCut + 0.1, 0.45)} w={7} />
            <GText x={pos(29) + 62} y={436} p={pr(T, tCut + 0.3, 0.3)} size={40} text="存" anchor="middle" />
          </g>
          <G d={roughCurve([[689, 640], [700, 655], [1220, 655], [1231, 640]], 85, 3)} p={pr(T, tGold + 0.6, 0.3)} w={6} />
          <GText x={960} y={706} p={pr(T, tGold + 0.8, 0.3)} size={34} text="回忆里的长度" anchor="middle" />
        </Grease>
      </Svg>
    </Layer>
  );
};

/* ============================== B9 · 重复：当下慢，回头短 ============================== */
export const B9Scene: React.FC<{ T: number; x: number }> = ({ T, x }) => {
  const a = bound('B8', 'B9') - 0.1;
  const tNow = cue('B9c', '当下过得更慢'), tBack = cue('B9c', '回头看'), tHS = cue('B9d', '高中'), t20 = cue('B9b', '二十多岁');
  const stamp = (len: number, t: number, d: number) => len * clamp((T - t) / d);
  const rep = (x0: number, len: number, hero: boolean, pic: (i: number) => string, step?: boolean): Fr[] =>
    Array.from({ length: Math.floor(len / 92) + 1 }, (_, i) => ({ x: x0 + 4 + i * 92, w: Math.min(84, len - i * 92 - 8), state: hero ? 'normal' : 'normal', pic: pic(i), picO: 0.85 }));
  const desk = (i: number) => (T > tHS + i * 0.04 ? 'pDesk' : 'pWalk');
  const vary = ['pSea', 'pPost', 'pPaper', 'pDrink', 'pCafe', 'pWheel', 'pBooks', 'pSea', 'pPost', 'pDrink'];
  const tTask = cue('B9b', '重复的任务');
  const pre = (t: number) => 560 * eo(T, t, 0.7);
  const L1 = T < tNow ? pre(tTask) : lerp(560, 1000, clamp((T - tNow) / 0.8)), L2 = T < tNow ? pre(tTask + 0.1) : lerp(560, 731, eo(T, tNow, 0.6));
  const L3 = T < tBack ? pre(tTask + 0.2) : lerp(560, 731, eo(T, tBack, 0.6)), L4 = T < tBack ? pre(tTask + 0.3) : lerp(560, 913, eo(T, tBack, 0.6));
  return (
    <Layer x={x}>
      <Header T={T} a={a} vol="09" field="心理学" title="重复：当下慢，回头短" eng="ROUTINE AND THE PERCEPTION OF TIME" chip="研究" line="Avni-Babad & Ritov · 2003 · 93人 · 20–25岁" />
      <Svg>
        <Tx x={148} y={480} size={64} w={900} o={eo(T, a + 0.3, 0.3)}>当下</Tx>
        <Tx x={148} y={720} size={64} w={900} o={eo(T, a + 0.3, 0.3)}>回头看</Tx>
        {[['重复', 424], ['有变化', 504], ['重复', 664], ['有变化', 744]].map(([l, y], i) => <Tx key={i} x={500} y={Number(y)} size={34} w={700} color={LAB} anchor="end" o={eo(T, a + 0.4, 0.3)}>{l}</Tx>)}
        <Strip x0={520} x1={520 + L1} y={380} g={GA.bar} perf="bright" frames={rep(520, L1, true, desk)} hi />
        <Strip x0={520} x1={520 + L2} y={460} g={GA.bar} perf="dim" frames={rep(520, L2, false, (i) => vary[i % vary.length])} />
        <Strip x0={520} x1={520 + L3} y={620} g={GA.bar} perf="bright" frames={rep(520, L3, true, desk)} hi />
        <Strip x0={520} x1={520 + L4} y={700} g={GA.bar} perf="dim" frames={rep(520, L4, false, (i) => vary[(i + 3) % vary.length])} />
        <Grease>
          <G d={roughLine(1240, 290, 1690, 288, 91, 1.5, 6)} p={pr(T, t20, 0.3)} w={5} o={0} />
          <GText x={1536} y={430} p={pr(T, tNow + 0.8, 0.3)} size={48} text="慢" />
          <Arrow pts={[[1530, 470], [1480, 560], [1290, 600], [1262, 612]]} p={pr(T, tBack + 0.4, 0.4)} seed={92} w={6} head={22} />
          <GText x={1267} y={668} p={pr(T, tBack + 0.8, 0.3)} size={48} text="短" />
        </Grease>
      </Svg>
    </Layer>
  );
};

/* ============================== P + E1 · payoff and 第一次 ============================== */
export const PE1Scene: React.FC<{ T: number; x: number }> = ({ T, x }) => {
  const a = bound('B9', 'P') - 0.1;
  const tBl = cue('P1', '一眨眼'), tNow = cue('P3', '当下飞快'), tBack = cue('P4', '回头看很短'), tGood = cue('E1a', '好消息'), tFirst = cue('E1c', '第一次'), tThing = cue('E1b', '变长');
  const z = bound('E1', 'E2');
  if (T < a - 0.6 || T > z + 0.7) return null;
  const blink = T > tBl && T < tBl + 0.07;
  const goldDim = goldOn(T) ? 0.55 : 1;
  const fadeP = 1 - eo(T, tGood, 0.4);
  const zipK = eio(T, tNow, 0.4);
  const deckK = eio(T, tBack, 0.5);
  // 回头看 strip: identical frames that deck into 3; then (E1) move to centre as a wide strip and lengthen
  const cK = eio(T, tGood + 0.1, 0.8);
  const grow = clamp(spring(T, tThing, 1.4, 4));
  const backFr: Fr[] = [];
  const nB = 10;
  for (let i = 0; i < nB; i++) {
    const px = 564 + i * 92;
    const dx = i < 2 ? px : 564 + 2 * 92 + Math.max(0, i - 2) * 92 * (1 - deckK) ;
    backFr.push({ x: dx, w: 84, state: 'normal', pic: 'pWalk', picO: 0.7 });
  }
  const wideFr: Fr[] = [];
  const pics = ['pSea', 'pBooks', 'pPost', 'pWheel', 'pDrink', 'pPaper', 'pCafe'];
  for (let i = -3; i <= 3; i++) {
    const k = Math.abs(i) <= 1 ? 1 : grow;
    const fx = 960 - 75 + i * 166 * (Math.abs(i) <= 1 ? 1 : lerp(0.5, 1, k));
    if (Math.abs(i) > 1 && k < 0.02) continue;
    wideFr.push({ x: fx, w: 150, state: i === 0 && T > tFirst ? 'lit' : 'normal', pic: i === 0 ? (T > tFirst ? 'pWheel' : 'pWalk') : pics[i + 3], picO: i === 0 ? 1 : 0.8, warm: 1 });
  }
  const ext = 166 + 2 * 166 * grow;
  const wideX0 = 960 - 75 - ext - 20, wideX1 = 960 + 75 + ext + 20;
  const flashF = T > tFirst && T < tFirst + 0.07;
  return (
    <Layer x={x}>
      <Svg>
        {/* the 现在 frame on the hero strip (the hook's third frame, back) */}
        <g opacity={fadeP * goldDim}>
          <Strip x0={-200} x1={2120} y={240} g={GA.hero} perf="bright" frames={[{ x: 154, w: 524, state: 'dim', pic: 'pDesk', picO: 0.4 }, { x: 698, w: 524, state: 'normal' }, { x: 1242, w: 524, state: 'dim', pic: 'pWalk', picO: 0.4 }]} edge={[[700, '▸ 20 ▸ 20A 现在']]} />
          <clipPath id="p-f"><rect x={698} y={285} width={524} height={220} rx={3} /></clipPath>
          <g clipPath="url(#p-f)">
            <use href="#pBlur" x={698 + ((T * 30) % 40) - 20} y={290} width={524} height={210} opacity={0.9} />
            <Tx x={734} y={345} size={34} color="#B3BBC1">现在，一年</Tx>
            <Tx x={730} y={467} size={112} w={900} color="#FFFFFF">一眨眼</Tx>
            {blink && <rect x={698} y={285} width={524} height={220} fill="#fff" opacity={0.9} />}
          </g>
        </g>
        <g opacity={fadeP}>
          <Tx x={148} y={676} size={64} w={900} o={eo(T, tNow - 0.2, 0.3)}>当下</Tx>
          <Tx x={148} y={786} size={64} w={900} o={eo(T, tNow - 0.2, 0.3)}>回头看</Tx>
          {T > tNow - 0.2 && <Strip x0={560} x1={lerp(1500, 900, zipK)} y={620} g={GA.bar} perf="dim" frames={Array.from({ length: 10 }, (_, i) => ({ x: 564 + i * 92, w: 84, state: 'normal' as const, pic: 'pPost', picO: 0.6 }))} o={eo(T, tNow - 0.2, 0.3)} />}
          {T > tNow && (
            <g opacity={eo(T, tNow + 0.2, 0.3)}>
              <rect x={1000} y={647} width={300} height={10} rx={5} fill="#9fb0f2" />
              <circle cx={1300} cy={652} r={22} fill={A} />
              <Tx x={1000} y={630} size={28} w={700} color={LAB}>事多 · 赶</Tx>
            </g>
          )}
        </g>
        {T > tNow - 0.2 && T < tGood + 1.2 && (
          <g opacity={1 - cK}>
            <Strip x0={560} x1={lerp(1500, 812 + 40, deckK)} y={730} g={GA.bar} perf="bright" frames={backFr} hi o={eo(T, tNow - 0.2, 0.3)} />
          </g>
        )}
        {cK > 0 && (
          <g opacity={cK}>
            <Strip x0={wideX0} x1={wideX1} y={480} g={GA.wide} perf="bright" frames={wideFr} hi />
            {flashF && <rect x={885} y={510} width={150} height={90} fill="#FCFDFB" opacity={0.9} />}
          </g>
        )}
        <Grease>
          <g opacity={fadeP}>
            <GText x={1340} y={676} p={pr(T, tNow + 0.3, 0.3)} size={64} text="忙" />
            <GText x={850} y={786} p={pr(T, tBack + 0.5, 0.3)} size={64} text="重复" />
          </g>
          <G d={roughEllipse(960, 555, 120, 85, 101)} p={pr(T, tFirst + 0.05, 0.45)} w={8} o={cK} />
          <GText x={960} y={440} p={pr(T, tFirst + 0.1, 0.3)} size={64} text="第一次" anchor="middle" o={cK} />
        </Grease>
      </Svg>
    </Layer>
  );
};

/* ============================== E2 · 聊起过的，更难忘 ============================== */
export const E2Scene: React.FC<{ T: number; inK: number; outK: number }> = ({ T, inK, outK }) => {
  const a = bound('E1', 'E2') - 0.2;
  const tFirst = cue('E2a', '第一次'), tPull = cue('E2a', '拉上一个人'), tTalk = cue('E2b', '常一起'), tMem = cue('E2b', '更难忘');
  if (inK <= 0.001 || outK >= 0.999) return null;
  // the hero frame flies in from E1's middle frame, then splits in two
  const kIn = eio(T, a, 0.6);
  const hx0 = lerp(885, 660, kIn), hy0 = lerp(510, 360, kIn), hw = lerp(150, 600, kIn), hh = lerp(90, 338, kIn);
  const sp = eio(T, tPull, 0.4);
  const L = { x: lerp(hx0, 200, sp), y: lerp(hy0, 380, sp), w: lerp(hw, 560, sp), h: lerp(hh, 315, sp) };
  const R = { x: lerp(hx0, 1160, sp), y: lerp(hy0, 380, sp), w: lerp(hw, 560, sp), h: lerp(hh, 315, sp) };
  const fadeL = eo(T, tMem, 1.2);
  const step = eo(T, tPull + 0.3, 0.4);
  const frameBox = (b: { x: number; y: number; w: number; h: number }, o: number, two: number, bub: boolean, key: string) => (
    <g opacity={o}>
      <rect x={b.x - 14} y={b.y - 14} width={b.w + 28} height={b.h + 28} rx={4} fill="url(#g12-film)" filter="url(#g12-liftHi)" />
      <clipPath id={`e2-${key}`}><rect x={b.x} y={b.y} width={b.w} height={b.h} rx={3} /></clipPath>
      <g clipPath={`url(#e2-${key})`}>
        <rect x={b.x} y={b.y} width={b.w} height={b.h} fill="#F6EAD6" />
        <use href="#pWheel" x={b.x + b.w * 0.05} y={b.y + b.h * 0.02} width={b.w * 0.9} height={b.h * 0.9} opacity={0.55} />
        <Token x={b.x + b.w * 0.42} y={b.y + b.h * 0.92} s={b.w / 560} color={INK} />
        {two > 0 && <Token x={b.x + b.w * (0.42 + 0.17) + (1 - two) * 120} y={b.y + b.h * 0.92 - 30 * Math.sin(Math.PI * two) * (b.w / 560)} s={b.w / 560} color={A} />}
      </g>
    </g>
  );
  return (
    <Layer o={inK * (1 - outK)}>
      <Header T={T} a={a + 0.2} vol="10" field="心理学 · 日记研究" title="聊起过的，更难忘" eng="RETENTION OF AUTOBIOGRAPHICAL MEMORIES" chip="研究" line="Kristo, Janssen & Murre · 2009 · 878人" />
      <Svg>
        {sp > 0.01 && frameBox(L, lerp(1, 0.3, fadeL), 0, false, 'l')}
        {frameBox(R, 1, sp > 0.5 ? step : 0, true, 'r')}
        <Tx x={480} y={752} size={34} w={700} color={LAB} anchor="middle" o={eo(T, tPull + 0.3, 0.3) * lerp(1, 0.5, fadeL)}>一个人</Tx>
        <Tx x={1440} y={752} size={34} w={700} color={LAB} anchor="middle" o={eo(T, tPull + 0.3, 0.3)}>一起</Tx>
        <SChip x={1160} y={780} label="示意" t={tMem + 0.2} T={T} />
        <Grease>
          {[0, 1].map((i) => {
            const bx = 1395 + i * 95, by = 520 - i * 15, k = pop(T, tTalk + i * 0.4);
            return k > 0 ? (
              <g key={i} opacity={clamp(k)} transform={`translate(${bx},${by + 2 * Math.sin(T * 3 + i)}) scale(${k})`}>
                <G d={roughEllipse(0, 0, 34, 22, 111 + i, 1.05, 0.03)} p={1} w={5} />
                <G d={roughLine(-8, 20, -18, 36, 113 + i, 1, 2)} p={1} w={5} />
                <GText x={0} y={8} p={1} size={24} text="…" anchor="middle" w={24} />
              </g>
            ) : null;
          })}
        </Grease>
      </Svg>
    </Layer>
  );
};

/* ============================== E3 + E4 · 大约六十个夏天 → 这周 ============================== */
const TINTS = ['#E0A458', '#5FA8A0', '#C77D8A', '#7C9CCB', '#9DB46A', '#D9C26A'];
export const E34Scene: React.FC<{ T: number; inK: number; off: number }> = ({ T, inK, off }) => {
  const a = bound('E2', 'E3') - 0.2;
  const t60 = cue('E3b', '六十个夏天'), tPress = cue('E3c', '压成'), tSend = cue('E4a', '发给'), tWeek = cue('E4b', '这周'), tLast = cue('E4b', '第一次的事吧');
  if (inK <= 0.001) return null;
  const pan = -40 * Math.max(0, T - a) - 60 * (1 - eo(T, a, 0.6));
  // squeeze toward slot 1, stop at 45 %, spring back apart
  const sq = T < tPress ? 0 : T < tPress + 0.85 ? 0.45 * easeInP(pr(T, tPress, 0.7)) : 0.45 * (1 - clamp(spring(T, tPress + 0.85, 1.6, 3.5)));
  const drain = T < tPress ? 0 : T < tPress + 0.85 ? pr(T, tPress, 0.7) : 1 - eo(T, tPress + 0.85, 0.4);
  const sendK = eio(T, tSend, 0.6);
  const fr: Fr[] = Array.from({ length: 60 }, (_, i) => {
    const px = 216 + i * 166 * (1 - sq) + pan;
    return { x: px, w: 150, state: 'lit' as const, warm: 1, pic: i === 0 ? 'pWheel' : undefined, picO: 0.6, tint: i === 0 ? undefined : mix(TINTS[i % 6], '#AEB6BC', drain) } as Fr;
  }).filter((f) => f.x > -200 && f.x < 2100);
  const stripO = lerp(1, 0.4, sendK) * (1 - off * 0.7);
  const lifted = { x: lerp(216 + 166 * (1 - sq) + pan, 720, sendK), y: lerp(470, 385, sendK), w: lerp(150, 480, sendK), h: lerp(90, 270, sendK) };
  const ghostK = eio(T, tSend + 0.2, 0.7);
  const gx = lerp(lifted.x + lifted.w / 2, 1980, ghostK), gy = lerp(lifted.y + lifted.h / 2, 300, ghostK) - 80 * Math.sin(Math.PI * ghostK);
  const circleSnap = off; // 0 → 1 during the end-card morph (handled in EndScene)
  return (
    <Layer o={inK}>
      <Svg>
        <g opacity={stripO} transform={`translate(0,${120 * sendK})`}>
          <Strip x0={-200} x1={2200} y={440} g={GA.wide} perf={off > 0.5 ? 'dark' : 'bright'} frames={fr.filter((_, i) => !(i === 1 && sendK > 0))} edge={[[260 + (pan % 166), '▸ 夏天'], [760 + (pan % 166), '▸ 夏天'], [1260 + (pan % 166), '▸ 夏天']]} />
        </g>
        <g opacity={(1 - sendK) * (1 - off)}>
          <Tx x={960} y={400} size={140} w={900} color={A} anchor="middle" tnum o={pop(T, t60)}>60</Tx>
          <Tx x={858} y={398} size={56} w={900} anchor="end" o={pop(T, t60)}>大约</Tx>
          <Tx x={1062} y={398} size={56} w={900} o={pop(T, t60)}>个夏天</Tx>
          <g opacity={eo(T, t60 + 0.3, 0.3)}>
            <Tx x={1792} y={846} size={30} w={500} color={SEC} anchor="end">估算 · 按全国人均预期寿命（国家卫健委 2025）推算</Tx>
          </g>
        </g>
        {T > tSend && (
          <g opacity={1 - off * 0.75}>
            <rect x={lifted.x - 12} y={lifted.y - 12} width={lifted.w + 24} height={lifted.h + 24} rx={4} fill="url(#g12-film)" filter="url(#g12-liftHi)" />
            <rect x={lifted.x} y={lifted.y} width={lifted.w} height={lifted.h} rx={3} fill={mix('#F6EAD6', '#2A2F34', off)} />
            <rect x={lifted.x} y={lifted.y} width={lifted.w} height={lifted.h} rx={3} fill={TINTS[1]} opacity={0.28 * (1 - off)} />
            <use href="#pWheel" x={lifted.x + lifted.w * 0.1} y={lifted.y + lifted.h * 0.05} width={lifted.w * 0.8} height={lifted.h * 0.9} opacity={0.6 * eo(T, tSend + 0.3, 0.4) * (1 - off)} />
            <Token x={lifted.x + lifted.w * 0.42} y={lifted.y + lifted.h * 0.93} s={lifted.w / 640} color={INK} o={eo(T, tSend + 0.3, 0.4) * (1 - off)} />
            <Token x={lifted.x + lifted.w * 0.56} y={lifted.y + lifted.h * 0.93} s={lifted.w / 640} color={A} o={eo(T, tSend + 0.3, 0.4) * (1 - off)} />
            {ghostK > 0 && ghostK < 1 && <rect x={gx - 75} y={gy - 45} width={150} height={90} rx={3} fill="#F6EAD6" stroke="#15171A" strokeWidth={8} opacity={0.8 * (1 - ghostK * 0.5)} />}
          </g>
        )}
        <Grease>
          <g opacity={1 - off}>
            <Arrow pts={[[lifted.x + lifted.w + 10, lifted.y + lifted.h * 0.45], [1560, 430], [1880, 380]]} p={pr(T, tSend + 0.1, 0.4)} seed={121} w={6} />
            <GText x={960} y={290} p={pr(T, tWeek, 0.3)} size={64} text="这周 · 第一次" anchor="middle" />
          </g>
          {circleSnap <= 0 && <G d={roughEllipse(960, 525, 310, 200, 77, 1.12, 0.035)} p={pr(T, tLast, 0.45)} w={8} />}
        </Grease>
      </Svg>
    </Layer>
  );
};
const easeInP = (k: number) => k * k * k;

/* ============================== switch-off → J ring → end card ============================== */
export const tOff = () => segEnd('E4b') + 0.3;
export const EndScene: React.FC<{ T: number }> = ({ T }) => {
  const t0 = tOff();
  if (T < t0) return null;
  const m = eio(T, t0 + 0.35, 0.6); // circle → ring
  const bgK = eo(T, t0 + 0.4, 0.5);
  const f = (T - (t0 + 0.9)) * 30;
  const p = (a: number, d: number) => clamp((f - a) / d);
  const dur = (FILM_END - (t0 + 0.9)) * 30;
  const black = clamp((f - (dur - 18)) / 18) ** 2;
  // morph: the rough grease circle (960,520,300,215) → a gold ring (960,240) r 54
  const cx = 960, cy = lerp(520, 240, m), rx = lerp(300, 54, m), ry = lerp(215, 54, m);
  const d = roughEllipse(cx, cy, rx, ry, 77, lerp(1.12, 1.0, m), lerp(0.035, 0, m));
  const col = mix('#2347E0', '#F1C56D', m);
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, opacity: bgK, background: 'radial-gradient(ellipse 70% 70% at 50% 44%, #1b2033 0%, #0c0f1a 50%, #040509 100%)' }} />
      <Svg>
        {m < 1 && <g filter={m < 0.5 ? 'url(#g12-grease)' : undefined}><path d={d} fill="none" stroke={col} strokeWidth={lerp(8, 2.5, m)} strokeLinecap="round" opacity={1 - p(0, 6)} /></g>}
        {f > -2 && (
          <g>
            {Array.from({ length: 50 }, (_, i) => {
              const x0 = random(`e12x${i}`) * W, y0 = random(`e12y${i}`) * H, z = random(`e12z${i}`);
              const x = x0 + Math.sin((f + 400 + i * 13) / (60 + z * 40)) * 20, y = ((y0 - (f + 400) * (0.2 + z * 0.6)) % H + H) % H;
              return <circle key={i} cx={x} cy={y} r={0.8 + z * 2.2} fill="#ffe3a8" opacity={(0.12 + 0.4 * z) * (0.5 + 0.5 * Math.sin((f + 400) / 11 + i)) * bgK} />;
            })}
            <g transform={`translate(${W / 2},240)`}><Monogram draw={clamp(0.6 + p(0, 30) * 0.4)} size={1} wordmark={JUNO.name} /></g>
            <GoldTitle11 text="为什么一年一眨眼" f={f} at={10} size={92} y={468} id="e12t" />
            <g transform={`translate(${W / 2 - 210},${560})`} opacity={p(26, 30)}>
              <rect x={0} y={0} width={420} height={100} fill="none" stroke="#F1C56D" strokeWidth={1.6} />
              {Array.from({ length: 16 }, (_, i) => <g key={i}><rect x={10 + i * 25.5} y={6} width={9} height={10} fill="#F1C56D" opacity={0.7} /><rect x={10 + i * 25.5} y={84} width={9} height={10} fill="#F1C56D" opacity={0.7} /></g>)}
              {Array.from({ length: 5 }, (_, i) => <rect key={i} x={20 + i * 80} y={22} width={70} height={56} fill={i === 2 ? '#F1C56D' : 'none'} fillOpacity={0.9} stroke="#F1C56D" strokeWidth={1.4} />)}
            </g>
            <text x={W / 2} y={736} textAnchor="middle" opacity={p(40, 18)} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 46, letterSpacing: '0.06em' }} fill="#f3ede2">你今年最难忘的“第一次”，是什么？</text>
            <text x={W / 2} y={782} textAnchor="middle" opacity={p(50, 18)} style={{ fontFamily: F.sans, fontSize: 25, letterSpacing: '0.12em' }} fill="rgba(243,237,226,0.58)">@ 那个总说“一年好快”的朋友，这周和TA做一件第一次的事</text>
            <g opacity={p(58, 20)}>
              <rect x={W / 2 - 330} y={814} width={660} height={56} rx={28} fill="none" stroke="#e6bd66" strokeOpacity={0.6} />
              <text x={W / 2} y={850} textAnchor="middle" style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 26, letterSpacing: '0.2em' }} fill="#e6bd66">{JUNO.follow}</text>
            </g>
            <g opacity={p(66, 20)} style={{ fontFamily: F.sans, fontSize: 17, letterSpacing: '0.03em' }} fill="rgba(243,237,226,0.42)">
              <text x={W / 2} y={978} textAnchor="middle">《为什么一年一眨眼》 · VIBE知识大赏　|　资料：Janet 1877（经 James 1890）· Wittmann 等 2015 · Lee & Janssen 2019 · Janssen, Naka & Friedman 2013 · Block, Hancock & Zakay 2010 · Stetson, Fiesta & Eagleman 2007</text>
              <text x={W / 2} y={1004} textAnchor="middle">Jeunehomme 等 2018 · Jeunehomme & D'Argembeau 2020 · Avni-Babad & Ritov 2003 · Kristo, Janssen & Murre 2009 · 国家卫健委 2025年统计公报（“大约60个夏天”为估算）· 图示为示意</text>
            </g>
          </g>
        )}
        <rect width={W} height={H} fill="#000" opacity={black} />
      </Svg>
    </>
  );
};
