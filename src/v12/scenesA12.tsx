import React from 'react';
import { GoldTitle11 } from '../v11/kit11';
import {
  A, INK, LAB, SEC, TER, F, W, H, cue, segEnd, BLK, TITLE_T, bound, pr, eo, eio, pop, spring, lerp, clamp, rnd, cnt, mix, tcOf,
  roughEllipse, roughLine, roughCurve, Arrow, G, Grease, GText, Strip, GA, Fr, Header, Tx, Svg, Layer, Chip,
} from './kit12';

/* ============================== H · hook (0 → whip) ============================== */
const hookFrames = (stretch: number) => {
  const w1 = 524 + 256 * stretch;
  const x1 = 148, x2 = x1 + w1 + 20, x3 = x2 + 524 + 20;
  return { w1, x1, x2, x3 };
};
export const tWhip = () => cue('H3', '一眨眼') + 0.12;
export const HookScene: React.FC<{ T: number }> = ({ T }) => {
  const tWh = tWhip();
  if (T > tWh + 0.7) return null;
  const st = clamp(spring(T, cue('H1', '好长') - 0.05, 1.8, 4));
  const { w1, x1, x2, x3 } = hookFrames(st);
  // camera: table (cx,cy) -> screen (960,595) at scale s
  const tG = cue('H2', '高中') - 0.05, tN = cue('H3', '现在') - 0.05;
  const c1 = { s: 2.0 + 0.05 * eo(T, 0, 1.4), cx: 410 + 128 * st + 26 * eio(T, 0, 1.2), cy: 372 }, c2 = { s: 2.0, cx: x2 + 262, cy: 372 }, c3 = { s: 0.86, cx: 1082 + 128, cy: 455 };
  const kG = eio(T, tG, 0.4), kN = eio(T, tN, 0.45);
  let s = lerp(c1.s, c2.s, kG), cx = lerp(c1.cx, c2.cx, kG), cy = lerp(c1.cy, c2.cy, kG);
  s = lerp(s, c3.s, kN); cx = lerp(cx, c3.cx, kN); cy = lerp(cy, c3.cy, kN);
  // whip: the strip runs left (table units), the camera pushes in on the black leader that follows
  const kW = clamp(pr(T, tWh, 0.42) ** 1.6);
  const whipX = -2600 * kW;
  const shake = T > cue('H2', '好慢') ? 6 * Math.exp(-(T - cue('H2', '好慢')) * 12) * Math.sin((T - cue('H2', '好慢')) * 90) : 0;
  const blink = T > cue('H3', '一眨眼') && T < cue('H3', '一眨眼') + 0.07 ? 1 : 0;
  const strip = (dx: number, o: number, k: number) => {
    const fr: Fr[] = [
      { x: -396 + dx, w: 524, state: 'dim', pic: 'pWalk', picO: 0.3 },
      { x: x1 + dx, w: w1, state: 'normal' },
      { x: x2 + dx, w: 524, state: 'normal' },
      { x: x3 + dx, w: 524, state: 'normal' },
      { x: x3 + 544 + dx, w: 524, state: 'dim', pic: 'pWalk', picO: 0.3 },
    ];
    return (
      <g key={k} opacity={o}>
        <Strip x0={-600 + dx} x1={x3 + 1100 + dx} y={190} g={GA.hero} perf="bright" frames={fr}
          edge={[[470 + dx, '▸ 7 ▸ 7A 小学'], [x2 + 2 + dx, '▸ 16 ▸ 16A 高中'], [x3 + 2 + dx, '▸ 20 ▸ 20A 现在']]} />
      </g>
    );
  };
  const ghosts = kW > 0 && kW < 1 ? [1, 2, 3, 4, 5].map((k) => strip(whipX + 2600 * (clamp(pr(T - k / 60, tWh, 0.42) ** 1.6) - kW) * -1, [0.45, 0.3, 0.2, 0.12, 0.06][k - 1], k)) : [];
  const hM = T >= cue('H2', '好慢') - 0.02;
  const mk = clamp(spring(T, cue('H2', '好慢'), 1.4, 6));
  const nk = T >= cue('H3', '一眨眼') - 0.02;
  return (
    <Layer x={960 - cx * s} y={595 - cy * s + shake} s={s} cx={0} cy={0}>
      <Svg>
        {ghosts}
        {strip(whipX, 1, 0)}
        {/* frame contents */}
        <g transform={`translate(${whipX},0)`}>
          <clipPath id="h-f1"><rect x={x1} y={235} width={w1} height={220} rx={3} /></clipPath>
          <g clipPath="url(#h-f1)">
            <use href="#pSea" x={x1 + w1 - 300} y={300} width={260} height={156} opacity={0.9} />
            <Tx x={x1 + 36} y={295} size={34} color="#B3BBC1">小学，暑假</Tx>
            <g transform={`translate(${x1 + 32},417) scale(${1 + 0.45 * st},1)`}><Tx x={0} y={0} size={112} w={900} color="#FFFFFF">好长</Tx></g>
          </g>
          <clipPath id="h-f2"><rect x={x2} y={235} width={524} height={220} rx={3} /></clipPath>
          <g clipPath="url(#h-f2)">
            <use href="#pDesk" x={x2 + 260} y={300} width={240} height={144} opacity={0.9} />
            <Tx x={x2 + 36} y={295} size={34} color="#B3BBC1">高中，三年</Tx>
            {hM && <g transform={`translate(${x2 + 32},${417 - 80 * (1 - mk)})`} opacity={eo(T, cue('H2', '好慢'), 0.18)}><Tx x={0} y={0} size={112} w={900} color="#FFFFFF">好慢</Tx></g>}
          </g>
          <clipPath id="h-f3"><rect x={x3} y={235} width={524} height={220} rx={3} /></clipPath>
          <g clipPath="url(#h-f3)">
            <use href="#pBlur" x={x3} y={240} width={524} height={210} opacity={0.9} />
            <Tx x={x3 + 36} y={295} size={34} color="#B3BBC1">现在，一年</Tx>
            {nk && <Tx x={x3 + 32} y={417} size={112} w={900} color="#FFFFFF" o={eo(T, cue('H3', '一眨眼'), 0.08)}>一眨眼</Tx>}
            {blink ? <rect x={x3} y={235} width={524} height={220} fill="#FFFFFF" opacity={0.9} /> : null}
          </g>
          {hM && <Grease><G d={roughLine(x2 + 34, 440, x2 + 262, 438, 31, 2, 6)} p={pr(T, cue('H2', '好慢') + 0.2, 0.9)} w={8} color="#9FB4FF" /></Grease>}
        </g>
      </Svg>
      {/* the black leader that follows the strip's tail */}
      {kW > 0 && <div style={{ position: 'absolute', left: x3 + 1100 + whipX, top: -400, width: 4000, height: 1600, background: '#15171A' }} />}
    </Layer>
  );
};

/* ============================== T · title on the black leader ============================== */
export const tRunOut = () => BLK.B1[0] - 0.25;
export const TitleScene: React.FC<{ T: number }> = ({ T }) => {
  const a = tWhip() + 0.3, ro = tRunOut();
  if (T < a || T > ro + 0.5) return null;
  const kR = eio(T, ro, 0.45);
  const x = -1920 * kR;
  const f = T * 30, at = (TITLE_T - 0.1) * 30;
  const drift = -12 * (T - a);
  const holes = Array.from({ length: 22 }, (_, i) => i * 96 + (((drift % 96) + 96) % 96) - 96);
  return (
    <Layer x={x}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,#1d2023 0%,#141618 12%,#17191c 50%,#121416 88%,#1d2023 100%)' }} />
      <Svg>
        {holes.map((hx, i) => (
          <g key={i}>
            <rect x={hx} y={7} width={72} height={79} rx={14} fill="#EEF2EE" opacity={0.85} />
            <rect x={hx} y={994} width={72} height={79} rx={14} fill="#EEF2EE" opacity={0.85} />
          </g>
        ))}
        {T < TITLE_T + 0.1 && <text x={960} y={590} textAnchor="middle" opacity={eo(T, cue('T1') - 0.05, 0.15) * (1 - eo(T, TITLE_T - 0.15, 0.2))} style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 110, letterSpacing: '0.08em' }} fill="#F3EDE2">为什么？</text>}
        <GoldTitle11 text="为什么一年一眨眼" f={f} at={at} size={120} y={590} step={1} fade={6} id="t12" />
        {/* splice tape at the trailing edge */}
        <rect x={1924} y={0} width={120} height={H} fill="#EEF2EE" opacity={0.35} />
      </Svg>
    </Layer>
  );
};

/* ============================== B1 · 一年，占你人生多少？ ============================== */
export const B1Scene: React.FC<{ T: number; x: number }> = ({ T, x }) => {
  const a = BLK.B1[0] - 0.45;
  const t20 = cue('B1a', '二十岁'), t5p = cue('B1a', '百分之五'), t5y = cue('B1b', '五岁'), t20p = cue('B1b', '百分之二十'), tPh = cue('B1c', '哲学家'), tLong = cue('B1d', '活得越久'), tShort = cue('B1d', '越短');
  // strip geometry: phase 1 (20 frames) → phase 2 (5 frames) → phase 3 (60 frames)
  const L0 = 148, L = 1612, k2 = eio(T, t5y, 0.5), k3 = eio(T, tLong, Math.max(0.6, tShort - tLong + 0.2));
  const fr: Fr[] = [];
  let xx = L0;
  if (T < tLong) {
    const g = 8, w20 = (L - 19 * g) / 20, w5 = (L - 4 * g) / 5;
    for (let i = 1; i <= 20; i++) {
      const kk = clamp((k2 * 20 - (20 - i) * 0.6) / 9);
      const w = i <= 5 ? lerp(w20, w5, k2) : lerp(w20, 0, clamp(k2 * 1.6 - (20 - i) * 0.02));
      const lit = (i === 20 && T < t5y + 0.1) || (i === 5 && T > t5y + 0.45);
      fr.push({ x: xx, w, state: lit ? 'lit' : 'dim', label: w > 30 && !lit ? String(i) : undefined });
      xx += w + (w > 0.5 ? g : 0) * (i <= 5 ? 1 : 1 - kk);
    }
  } else {
    const n = 60, g = lerp(8, 3, k3), w5 = (L - 4 * 8) / 5, wN = (L - (n - 1) * 3) / n;
    for (let i = 1; i <= n; i++) {
      const lit = i === n;
      const w = i <= 4 ? lerp(w5, wN, k3) : lit ? lerp(w5, wN, k3) : lerp(0, wN, clamp(k3 * 1.3 - (i / n) * 0.3));
      fr.push({ x: xx, w, state: lit ? 'lit' : 'dim' });
      xx += w + (w > 0.5 ? g : 0);
    }
  }
  const litF = fr.find((f) => f.state === 'lit') || fr[T < t5y + 0.3 ? fr.length - 1 : 4] || fr[0];
  const litCx = litF.x + litF.w / 2;
  const ringO = T < t5y ? 1 : T < t5y + 0.5 ? 1 - pr(T, t5y, 0.15) : 1;
  const ringP = T < t5y + 0.5 ? pr(T, t20, 0.45) : pr(T, t5y + 0.55, 0.45);
  const sq = T > tShort ? 1 - 0.12 * Math.sin(Math.PI * pr(T, tShort, 0.2)) : 1;
  const numO = 1 - eo(T, tLong, 0.3);
  const val = T < t5y ? Number(cnt(T, t5p, 5, 0.6)) : Math.round(lerp(5, 20, eio(T, t20p, 0.6)));
  const age = T < t20p + 0.3 ? '20岁' : '5岁';
  const arrowO = 1 - (pr(T, t5y, 0.15) * (T < t5y + 0.6 ? 1 : 0));
  const arrowP = T < t5y ? pr(T, t5p + 0.75, 0.43) : pr(T, t5y + 0.6, 0.43);
  return (
    <Layer x={x}>
      <Header T={T} a={a} vol="01" field="哲学" title="一年，占你人生多少？" eng="THE PROPORTIONAL THEORY" chip="说法" line="Paul Janet · 1877（经 William James 1890 转述）" chipPulse={tPh} />
      <Svg>
        <Tx x={148} y={470} size={74} w={900} o={eo(T, t20, 0.3) * numO}>{`${age}的一年 = 人生的`}</Tx>
        <Tx x={906} y={482} size={176} w={900} color={A} tnum o={eo(T, t5p, 0.2) * numO}>{`${val}%`}</Tx>
        <Tx x={906} y={548} size={34} w={500} color={SEC} o={eo(T, t5p + 0.3, 0.3) * numO}>按比例算 · 估算</Tx>
        <Strip x0={128} x1={1780} y={580} g={GA.life} perf="dim" frames={fr.map((f) => ({ ...f, x: f.x + (1 - eo(T, a, 0.9)) * 1700 }))} tc={tcOf(T)} edge={[[160, 'ISO 400 · 第01卷']]} />
        <Tx x={148} y={736} size={34} color={LAB} o={eo(T, a + 0.4, 0.3)}>出生</Tx>
        <Tx x={1784} y={736} size={34} color={LAB} anchor="end" o={eo(T, a + 0.4, 0.3)}>{T < tLong ? age : '现在'}</Tx>
        <line x1={236} y1={724} x2={1650} y2={724} stroke={TER} strokeWidth={1.5} strokeDasharray="4 6" opacity={eo(T, a + 0.4, 0.3)} />
        <Grease>
          <G d={roughEllipse(litCx, 632, (litF.w / 2 + 30) * sq, 54 * sq, 4, 1.12, 0.04, 0.05)} p={ringP} w={7} o={ringO} />
          <G d={roughEllipse(1012, 424, 150, 92, 11, 1.14, 0.03, -0.04)} p={pr(T, t5p + 0.3, 0.45)} w={8} o={numO} />
          <g opacity={arrowO * numO}><Arrow pts={[[1180, 440], [1400, 436], [litCx - 40, 470], [litCx, 568]]} p={arrowP} seed={7} /></g>
          <GText x={1400} y={410} p={pr(T, t5p + 1.1, 0.3)} size={42} text="1 年" o={arrowO * numO * (T < t5y ? 1 : 0)} />
          <GText x={1250} y={548} p={pr(T, tPh + 0.1, 0.3)} size={34} text="说法 · 不是定律" o={numO} />
        </Grease>
      </Svg>
    </Layer>
  );
};

/* ============================== B2 · 年轻人，也觉得快 ============================== */
const VBar: React.FC<{ x: number; base: number; h: number; hero: boolean; o?: number }> = ({ x, base, h, hero, o = 1 }) =>
  h <= 0.5 ? null : (
    <g opacity={o} filter="url(#g12-lift)">
      <rect x={x} y={base - h} width={96} height={h} fill="url(#g12-film)" />
      <rect x={x + 16} y={base - h + 4} width={64} height={Math.max(0, h - 8)} rx={3} fill={hero ? A : '#AEB6BC'} />
      {Array.from({ length: Math.floor(h / 20) }, (_, i) => (
        <g key={i}>
          <rect x={x + 4} y={base - 14 - i * 20} width={8} height={10} rx={1.5} fill={hero ? '#EEF2EE' : '#8F989E'} />
          <rect x={x + 84} y={base - 14 - i * 20} width={8} height={10} rx={1.5} fill={hero ? '#EEF2EE' : '#8F989E'} />
        </g>
      ))}
    </g>
  );
export const B2Scene: React.FC<{ T: number; x: number }> = ({ T, x }) => {
  const a = bound('B1', 'B2') - 0.1;
  const t400 = cue('B2a', '四百多人'), tWk = cue('B2b', '上周'), tMo = cue('B2b', '上个月'), tYr = cue('B2b', '去年'), t30 = cue('B2c', '三十岁'), t70 = cue('B2d', '七十岁'), tEv = cue('B2d', '甚至更快'), tDec = cue('B2e', '过去十年'), tOld = cue('B2f', '年纪越大');
  const sheetO = 1 - eo(T, tWk, 0.5);
  const S = 4.2, base = 800;
  const groups: [number, string, number, number, number][] = [[470, '上周', 71.8, 67.9, tWk], [830, '上个月', 73.4, 66.8, tMo], [1190, '去年', 75.6, 71.5, tYr], [1550, '过去十年', 60.3, 77.7, tDec]];
  const chartO = eo(T, tWk, 0.35);
  return (
    <Layer x={x}>
      <Header T={T} a={a} vol="02" field="心理学" title="年轻人，也觉得快" eng="SUBJECTIVE PASSAGE OF TIME" chip="研究" line={`Wittmann 等 · 2015 · ${cnt(T, t400, 423, 0.9)}人 · 网上问卷`} />
      <Svg>
        {sheetO > 0.01 && (
          <g opacity={sheetO}>
            {Array.from({ length: 423 }, (_, i) => {
              const c = i % 47, r = Math.floor(i / 47);
              const lit = eo(T, t400 + (i / 423) * 0.9, 0.1);
              const fly = eio(T, tWk + rnd(i, 3) * 0.3, 0.45);
              const cx0 = 208 + c * 32, cy0 = 400 + r * 32;
              const cx = lerp(cx0, 960, fly), cy = lerp(cy0, 290, fly), s = lerp(1, 0.3, fly);
              return <rect key={i} x={cx} y={cy} width={24 * s} height={24 * s} rx={4} fill={mix('#D7DDD8', A, lit)} stroke="#AEB6BC" strokeWidth={lit > 0.5 ? 0 : 1.5} opacity={eo(T, a + 0.2 + (c / 47) * 0.4, 0.2)} />;
            })}
          </g>
        )}
        <g opacity={chartO}>
          <line x1={300} y1={base} x2={1720} y2={base} stroke={SEC} strokeWidth={2} />
          <line x1={300} y1={base - 50 * S} x2={1720} y2={base - 50 * S} stroke={TER} strokeWidth={1.5} strokeDasharray="6 8" opacity={eo(T, t30, 0.3)} />
          <Tx x={1730} y={base - 50 * S + 10} size={30} w={500} color={SEC} o={eo(T, t30, 0.3)}>50 · 中间</Tx>
          <Tx x={300} y={362} size={34} w={500} color={LAB}>觉得过得多快（平均分）</Tx>
          <Tx x={288} y={388} size={30} w={500} color={SEC} anchor="end">100 很快</Tx>
          <Tx x={288} y={808} size={30} w={500} color={SEC} anchor="end">0</Tx>
          <g opacity={pop(T, t30)}><rect x={1250} y={338} width={28} height={28} rx={4} fill={A} /><Tx x={1290} y={362} size={34} w={500} color={LAB}>30岁以下</Tx></g>
          <g opacity={pop(T, t70)}><rect x={1490} y={338} width={28} height={28} rx={4} fill="#AEB6BC" /><Tx x={1530} y={362} size={34} w={500} color={LAB}>70岁以上</Tx></g>
        </g>
        {groups.map(([gx, lab, yv, ov, tl], i) => {
          const tY = i < 3 ? t30 + i * 0.08 : tOld, tO = i < 3 ? t70 + i * 0.08 : tOld + 0.35;
          const hy = yv * S * clamp(eo(T, tY, 0.6) + 0.04 * Math.sin(Math.PI * pr(T, tY + 0.6, 0.3)));
          const ho = ov * S * clamp(eo(T, tO, 0.6));
          const pulse = i < 3 && T > tEv ? 1 + 0.04 * Math.sin(Math.PI * pr(T, tEv, 0.3)) : 1;
          return (
            <g key={i}>
              <Tx x={gx} y={846} size={34} w={700} color={LAB} anchor="middle" o={pop(T, tl)}>{lab}</Tx>
              <g transform={`translate(${gx - 56},${base}) scale(1,${pulse}) translate(${-(gx - 56)},${-base})`}><VBar x={gx - 104} base={base} h={hy} hero /></g>
              <VBar x={gx + 8} base={base} h={ho} hero={false} />
            </g>
          );
        })}
        <Grease>
          {[0, 1, 2].map((i) => <G key={i} d={roughLine(groups[i][0] - 84, base - groups[i][2] * S - 18, groups[i][0] - 44, base - groups[i][2] * S - 30, 40 + i, 1.5, 3)} p={pr(T, tEv + i * 0.1, 0.18)} w={7} />)}
          <G d={roughEllipse(1550, 834, 110, 34, 44, 1.12, 0.03)} p={pr(T, tDec, 0.45)} w={7} />
          <Arrow pts={[[1502, base - 60.3 * S - 20], [1530, base - 77.7 * S - 50], [1560, base - 77.7 * S - 18]]} p={pr(T, tOld + 0.9, 0.4)} seed={45} w={6} head={20} />
        </Grease>
      </Svg>
    </Layer>
  );
};

/* ============================== B3 · 听说过，就更觉得快？ ============================== */
export const B3Scene: React.FC<{ T: number; x: number }> = ({ T, x }) => {
  const a = bound('B2', 'B3') - 0.1;
  const tQ = cue('B3a', '人越老'), t86 = cue('B3b', '八成多'), t45 = cue('B3c', '不到一半'), tYou = cue('B3d', '而你'), tHeard = cue('B3d', '听说过了'), tCalm = cue('B3e', '放心');
  const grid = (x0: number, n: number, t: number, skip?: number) =>
    Array.from({ length: 100 }, (_, i) => {
      const c = i % 10, r = Math.floor(i / 10);
      if (i === skip) return null;
      const lit = i < n ? eo(T, t + (i / n) * 0.9, 0.1) : 0;
      const s = lerp(0.7, 1, lit || 1);
      return <rect key={i} x={x0 + c * 38 + (30 - 30 * s) / 2} y={470 + r * 38 + (30 - 30 * s) / 2} width={30 * s} height={30 * s} rx={4} fill={mix('#D7DDD8', A, lit)} stroke="#AEB6BC" strokeWidth={lit > 0.5 ? 0 : 1.5} />;
    });
  // the 你 cell: right grid (row 10, col 9) → left grid (row 10, col 5)
  const h = eio(T, tHeard, 0.5);
  const fx = 1000 + 8 * 38, fy = 470 + 9 * 38, tx = 200 + 4 * 38, ty = fy;
  const yx = lerp(fx, tx, h), yy = lerp(fy, ty, h) - 170 * Math.sin(Math.PI * h);
  const blink = T > tHeard + 0.5 && T < tHeard + 1.25 && Math.floor((T - tHeard - 0.5) / 0.12) % 2 === 0;
  return (
    <Layer x={x}>
      <Header T={T} a={a} vol="03" field="心理学" title="听说过，就更觉得快？" eng="LAYPEOPLE'S BELIEFS ABOUT TIME" chip="研究" line="Lee & Janssen · 2019 · 313人" />
      <Svg>
        <g opacity={eo(T, a + 0.2, 0.3)}>
          <rect x={700} y={344} width={520} height={56} rx={6} fill="#E1E6E2" stroke="#7D868C" strokeWidth={1.4} />
          <Tx x={960} y={386} size={40} w={700} anchor="middle">“人越老、时间越快”</Tx>
          <Tx x={200} y={452} size={40} w={900}>听说过</Tx>
          <Tx x={1000} y={452} size={40} w={900}>没怎么听说过</Tx>
          {grid(200, 86, t86)}
          {grid(1000, 45, t45, 98)}
        </g>
        <Tx x={610} y={700} size={112} w={900} tnum o={eo(T, t86, 0.2)}>{`${cnt(T, t86, 85.8, 0.9, 1)}%`}</Tx>
        <Tx x={1410} y={700} size={112} w={900} tnum o={eo(T, t45, 0.2)}>{`${cnt(T, t45, 45.0, 0.7, 1)}%`}</Tx>
        <g opacity={eo(T, t86 + 0.5, 0.3)}><rect x={610} y={764} width={28} height={28} rx={4} fill={A} /><Tx x={650} y={790} size={34} w={500} color={LAB}>觉得自己也这样</Tx></g>
        {T > t45 + 0.3 && (
          <g transform={`translate(1410,752) scale(${lerp(1.25, 1, eo(T, t45 + 0.3, 0.22)) * (T > tCalm ? 1 + 0.1 * Math.sin(Math.PI * pr(T, tCalm, 0.3)) : 1)})`} opacity={eo(T, t45 + 0.3, 0.22)}>
            <rect x={0} y={-8} width={470} height={66} rx={6} fill="#E1E6E2" stroke="#7D868C" strokeWidth={1.6} />
            <Tx x={14} y={38} size={26} w={400} mono color={SEC}>▸</Tx>
            <Tx x={44} y={41} size={44} w={700}>只是相关，不是因果</Tx>
          </g>
        )}
        {T > tYou - 0.05 && (
          <g>
            <rect x={yx} y={yy} width={30} height={30} rx={4} fill={blink ? A : '#D7DDD8'} stroke={A} strokeWidth={2.5} />
          </g>
        )}
        <Grease>
          <G d={roughLine(712, 410, 1208, 406, 51, 1.5, 6)} p={pr(T, tQ, 0.5)} w={6} />
          <G d={roughEllipse(fx + 15, fy + 15, 30, 28, 52)} p={pr(T, tYou, 0.3)} w={6} o={1 - eo(T, tHeard, 0.2)} />
          <GText x={fx + 52} y={fy + 30} p={pr(T, tYou + 0.15, 0.3)} size={40} text="你" o={1 - eo(T, tHeard, 0.2)} />
          <G d={roughLine(1416, 826, 1872, 824, 53, 1.5, 6)} p={pr(T, tCalm + 0.1, 0.3)} w={6} />
        </Grease>
      </Svg>
    </Layer>
  );
};

/* ============================== B4 · 越忙，越快 ============================== */
const gaugeXY = (deg: number, r: number) => [1360 + r * Math.cos((deg * Math.PI) / 180), 780 + r * Math.sin((deg * Math.PI) / 180)];
const arcD = (d0: number, d1: number, r: number) => {
  const [x0, y0] = gaugeXY(d0, r), [x1, y1] = gaugeXY(d1, r);
  return `M${x0},${y0} A${r},${r} 0 ${d1 - d0 > 180 ? 1 : 0} 1 ${x1},${y1}`;
};
export const B4Scene: React.FC<{ T: number; x: number }> = ({ T, x }) => {
  const a = bound('B3', 'B4') - 0.1;
  const tAge = cue('B4b', '比起年龄'), tRel = cue('B4b', '更相关'), tBusy = cue('B4c', '事越多'), tFast = cue('B4d', '飞快');
  const k1 = eio(T, tAge + 0.1, 1.2), k2 = eio(T, tBusy, 1.0);
  // needle: rest 270, wobble on age, swing toward 330 with knob 2, then 345 on 飞快 (spring)
  const wob = T > tAge ? 3 * Math.exp(-(T - tAge) * 2) * Math.sin((T - tAge) * 9) : 0;
  const target = 270 + 60 * k2 + 15 * clamp(spring(T, tFast, 1.6, 4));
  const jit = 0.5 * Math.sin(T * 2 * Math.PI * 3);
  const ndl = target + wob + jit;
  const [nx, ny] = gaugeXY(ndl, 260);
  const s1o = T > tRel ? lerp(1, 0.45, eo(T, tRel, 0.3)) : 1;
  const panel = eo(T, a + 0.2, 0.5);
  return (
    <Layer x={x}>
      <Header T={T} a={a} vol="04" field="心理学" title="越忙，越快" eng="TIME PRESSURE" chip="研究" line={`Janssen, Naka & Friedman · 2013 · ${cnt(T, a + 0.4, 868, 0.8)}人`} />
      <Svg>
        <g opacity={panel}>
          <g transform={`translate(1600,372) scale(${lerp(1.25, 1, eo(T, a + 0.5, 0.22))})`} opacity={eo(T, a + 0.5, 0.22)}>
            <rect x={0} y={0} width={130} height={48} rx={5} fill="#E1E6E2" stroke="#7D868C" strokeWidth={1.4} />
            <Tx x={12} y={32} size={19} w={400} mono color={SEC}>▸</Tx><Tx x={36} y={35} size={30} w={700}>示意</Tx>
          </g>
          {/* slider 1: 年龄 */}
          <g opacity={s1o}>
            <Tx x={220} y={452} size={40} w={900}>年龄</Tx>
            <rect x={220} y={495} width={640 * eo(T, a + 0.2, 0.4)} height={10} rx={5} fill="#AEB6BC" />
            {Array.from({ length: 11 }, (_, i) => <rect key={i} x={219 + i * 64} y={514} width={2} height={14} fill={TER} />)}
            <Tx x={220} y={556} size={34} w={500} color={LAB}>年轻</Tx><Tx x={860} y={556} size={34} w={500} color={LAB} anchor="end">年长</Tx>
          </g>
          <g transform={`translate(${lerp(220, 860, k1)},500)`} opacity={s1o}><circle r={26} fill={A} filter="url(#g12-lift)" /><Tx x={0} y={9} size={26} w={700} color="#fff" anchor="middle">你</Tx></g>
          {/* slider 2: 事多 · 赶 */}
          <Tx x={220} y={662} size={40} w={T > tRel ? 900 : 700}>事多 · 赶</Tx>
          <rect x={220} y={705} width={640 * eo(T, a + 0.3, 0.4)} height={10} rx={5} fill={T > tRel ? mix('#AEB6BC', '#9fb0f2', eo(T, tRel, 0.3)) : '#AEB6BC'} />
          {Array.from({ length: 11 }, (_, i) => <rect key={i} x={219 + i * 64} y={724} width={2} height={14} fill={TER} />)}
          <Tx x={220} y={766} size={34} w={500} color={LAB}>少</Tx><Tx x={860} y={766} size={34} w={500} color={LAB} anchor="end">多</Tx>
          <circle cx={lerp(220, 860, k2)} cy={710} r={26} fill={T > tBusy ? A : '#FCFDFB'} stroke={INK} strokeWidth={3} filter="url(#g12-lift)" />
          {/* gauge */}
          <path d={arcD(180, 180 + 180 * eo(T, a + 0.3, 0.5), 300)} fill="none" stroke="#D7DDD8" strokeWidth={22} />
          <path d={arcD(320, 360, 300)} fill="none" stroke={A} strokeWidth={22} opacity={eo(T, a + 0.7, 0.3)} />
          {Array.from({ length: 19 }, (_, i) => {
            const d = 180 + i * 10, [x0, y0] = gaugeXY(d, i % 3 === 0 ? 262 : 272), [x1, y1] = gaugeXY(d, 286);
            return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={SEC} strokeWidth={i % 3 === 0 ? 4 : 3} opacity={eo(T, a + 0.4 + i * 0.02, 0.2)} />;
          })}
          <Tx x={1030} y={830} size={40} w={900} anchor="middle">慢</Tx>
          <Tx x={1690} y={830} size={40} w={900} anchor="middle" color={T > tFast ? A : INK}>快</Tx>
          <Tx x={1360} y={848} size={34} w={500} color={LAB} anchor="middle">这周、这个月过得多快</Tx>
          <line x1={1360} y1={780} x2={nx} y2={ny} stroke={INK} strokeWidth={6} strokeLinecap="round" />
          <circle cx={1360} cy={780} r={18} fill={INK} /><circle cx={1360} cy={780} r={6} fill="#fff" />
        </g>
        <Grease>
          <GText x={1360} y={440} p={pr(T, tAge + 1.25, 0.3)} size={34} text="几乎不动" anchor="middle" o={1 - eo(T, tBusy - 0.2, 0.3)} />
          <G d={roughEllipse(1690, 815, 52, 46, 61)} p={pr(T, tFast + 0.25, 0.45)} w={7} />
        </Grease>
      </Svg>
    </Layer>
  );
};

/* ============================== B5 · “快”分两种 ============================== */
export const loupeAt = () => ({ x: 1350, y: 678 });
export const B5Scene: React.FC<{ T: number; x: number; dive: number }> = ({ T, x, dive }) => {
  const a = bound('B4', 'B5') - 0.1;
  const tNow = cue('B5a', '当下'), tBack = cue('B5a', '回头看'), t117 = cue('B5b', '一百一十七'), tBusy = cue('B5c', '脑子越忙'), tFast = cue('B5c', '当下过得越快'), tLong = cue('B5d', '反而显得越长'), tQ = cue('B5e', '按什么算');
  const nowW = 942 - 342 * eio(T, tFast + 0.3, 0.6);
  const backW = 942 + 288 * clamp(eo(T, tLong + 0.2, 0.6) + 0.04 * Math.sin(Math.PI * pr(T, tLong + 0.8, 0.3)));
  const meter = 0.85 * eo(T, tBusy, 0.8);
  const nowIn = eo(T, tNow - 0.1, 0.4), backIn = eo(T, tBack - 0.1, 0.4);
  const frames = (x0: number, w: number, st: 'normal' | 'acc', pic?: string): Fr[] => Array.from({ length: Math.ceil(w / 92) }, (_, i) => ({ x: x0 + 4 + i * 92, w: 84, state: st, pic, picO: 0.5 }));
  const lp = loupeAt();
  const lk = eio(T, tQ + 0.25, 0.5);
  const lx = lerp(2150, lp.x, lk) - 6 * Math.sin(Math.PI * pr(T, tQ + 0.75, 0.15)), ly = lerp(560, lp.y, lk) + 2 * Math.sin(T * Math.PI);
  return (
    <Layer x={x} s={1 + 0.35 * dive} cx={lp.x} cy={lp.y}>
      <Header T={T} a={a} vol="05" field="心理学 · 元分析" title="“快”分两种" eng="PROSPECTIVE VS RETROSPECTIVE" chip="研究" line={`Block, Hancock & Zakay · 2010 · ${cnt(T, a + 0.3, 117, 0.8)}个实验`} />
      <Svg>
        <Tx x={560} y={404} size={30} w={500} color={SEC} o={eo(T, a + 0.3, 0.3)}>感觉有多长</Tx>
        <g transform={`translate(1580,372) scale(${lerp(1.25, 1, eo(T, a + 0.5, 0.22))})`} opacity={eo(T, a + 0.5, 0.22)}>
          <rect x={0} y={0} width={130} height={48} rx={5} fill="#E1E6E2" stroke="#7D868C" strokeWidth={1.4} />
          <Tx x={12} y={32} size={19} w={400} mono color={SEC}>▸</Tx><Tx x={36} y={35} size={30} w={700}>示意</Tx>
        </g>
        <Tx x={330} y={488} size={64} w={900} o={pop(T, tNow)}>当下</Tx>
        <Tx x={330} y={698} size={64} w={900} o={pop(T, tBack)}>回头看</Tx>
        {T > tFast + 0.3 && <rect x={560} y={436} width={942} height={64} fill="none" stroke={TER} strokeWidth={1.5} strokeDasharray="6 6" />}
        <g transform={`translate(${(1 - nowIn) * 1400},0)`} opacity={nowIn}><Strip x0={560} x1={560 + nowW} y={436} g={GA.bar} perf="dim" frames={frames(560, nowW, 'normal', 'pWalk')} /></g>
        <g transform={`translate(${-(1 - backIn) * 1400},0)`} opacity={backIn}><Strip x0={560} x1={560 + backW} y={646} g={GA.bar} perf="bright" frames={frames(560, backW, 'acc')} hi /></g>
        {/* meter */}
        <g opacity={eo(T, a + 0.4, 0.3)}>
          <rect x={200} y={400} width={64} height={400} fill="url(#g12-film)" filter="url(#g12-lift)" />
          <rect x={212} y={404 + 392 * (1 - meter)} width={40} height={392 * meter} rx={3} fill={A} />
          <Tx x={232} y={846} size={34} w={700} color={LAB} anchor="middle">脑子多忙</Tx>
        </g>
        <Grease>
          <GText x={560 + nowW + 24} y={486} p={pr(T, tFast + 0.8, 0.3)} size={48} text="快" />
          <GText x={560 + backW + 24} y={696} p={pr(T, tLong + 0.8, 0.3)} size={48} text="长" />
          <GText x={1180} y={700} p={pr(T, tQ, 0.3)} size={64} text="？" o={1 - pr(T, tQ + 0.5, 0.2)} />
        </Grease>
        {/* the loupe */}
        {lk > 0 && (
          <g transform={`translate(${lx},${ly})`}>
            <circle r={164} fill="none" stroke="#15171A" strokeWidth={16} filter="url(#g12-liftHi)" />
            <circle r={150} fill="#ffffff" opacity={0.1} />
            <circle r={151} fill="none" stroke={SEC} strokeWidth={1.5} />
            <path d="M -110,-112 A 160 160 0 0 1 -40,-155" stroke="#EEF2EE" strokeWidth={2} fill="none" />
            <Tx x={0} y={22} size={64} w={900} color={A} anchor="middle">？</Tx>
          </g>
        )}
      </Svg>
    </Layer>
  );
};
