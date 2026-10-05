import React from 'react';
import { C, F, LNUM, Svg, PaperDiv, PageInk, PenText, Coin, Margin11, Stamp, pr, eo, eio, pop, spring, lerp, clamp, easeInOut, drawOn } from './kit11';
import { CUT } from './time11';
import { b } from '../v6/ui6';

/* S07 the model (balance sheet) · S08 被套牢 (7 months of A's account) · S09 rewind to zero.
   Everything here is drawn on one page; S10 takes over at CUT.s10. */

// ---- S07 geometry
export const ZX = 900;              // zero rule
export const ROW = { sat: 432, inv: 512, alt: 592 };
export const BAR_H = 34;
export const TOT = { rule: 630, y: 700, bar: 686 };
export const SUM_X = 1400;
const LG0 = 360, LT0 = 300, LR = 160, LG1 = 160, LT1 = 500;

// ---- S08 geometry (style frame 2)
const X0 = 540, X1 = 1470, AX = 690, N = 12;
const xs = Array.from({ length: N + 1 }, (_, i) => X0 + ((X1 - X0) * i) / N);
const ease = (t: number) => 0.55 * t + (0.45 * (1 - Math.cos(Math.PI * t))) / 2;
const inv = xs.map((_, i) => 330 - 70 * ease(i / N));
const sat = xs.map((_, i) => 566 - 10 * ease(i / N));
const smooth = (ys: number[]) => {
  let d = `M${xs[0]},${ys[0]}`;
  for (let i = 0; i < N; i++) {
    const x0 = xs[Math.max(i - 1, 0)], y0 = ys[Math.max(i - 1, 0)], x1 = xs[i], y1 = ys[i], x2 = xs[i + 1], y2 = ys[i + 1], x3 = xs[Math.min(i + 2, N)], y3 = ys[Math.min(i + 2, N)];
    d += ` C${x1 + (x2 - x0) / 6},${y1 + (y2 - y0) / 6} ${x2 - (x3 - x1) / 6},${y2 - (y3 - y1) / 6} ${x2},${y2}`;
  }
  return d;
};
const INV_D = smooth(inv), SAT_D = smooth(sat);
const MX = 1520, CYc = AX - 28, BX0 = MX - 92, AXc = MX - 34, BX1 = MX + 176;
const P0 = [BX0 + 10, CYc - 27], C1 = [BX0 + 70, CYc - 76], C2 = [BX1 - 80, CYc - 76], P3 = [BX1 - 24, CYc - 27];
const bez = (t: number) => {
  const u = 1 - t;
  return [0, 1].map((k) => u * u * u * P0[k] + 3 * u * u * t * C1[k] + 3 * u * t * t * C2[k] + t * t * t * P3[k]);
};
/** coins at the end of S09 (S10 picks them up from here) */
export const S09_COINS = { A: [600, CYc], B: [542, CYc] };
export const STAMP = { x: 1130, y: 438, w: 356, h: 176, rot: -7 };

/** a bar from (x,y) with length L at angle th (deg), thickness h */
const Bar: React.FC<{ x: number; y: number; L: number; th: number; h: number; fill: string; o?: number }> = ({ x, y, L, th, h, fill, o = 1 }) =>
  L <= 0.5 || o <= 0 ? null : (
    <g transform={`translate(${x} ${y}) rotate(${th})`} opacity={o}>
      <rect x={0} y={-h / 2} width={L} height={h} fill={fill} />
      <rect x={0} y={-h / 2} width={L} height={h} fill="url(#k-hatchFine)" opacity={0.12} />
    </g>
  );

export const S07S09: React.FC<{ T: number }> = ({ T }) => {
  if (T < CUT.s7 - 0.02 || T > CUT.s10 + 0.7) return null;
  return (
    <>
      {T > CUT.s7 + 0.95 && <PaperDiv />}
      <Svg>
        <SheetInk T={T} />
      </Svg>
    </>
  );
};

const SheetInk: React.FC<{ T: number }> = ({ T }) => {
  const toTime = eio(T, CUT.s8, 0.6);         // S07 → S08 morph
  const othersO = 1 - eo(T, CUT.s8, 0.3);
  const pageO = 1 - eo(T, CUT.s10 - 0.1, 0.5); // the whole chart page fades as the board grows
  // header
  const subP = eo(T, CUT.s8 + 0.05, 0.5);
  // S07 build
  const fP = pr(T, b(79), 0.8);
  const rowK = [eo(T, b(80), 0.45), eo(T, b(81), 0.45), eo(T, b(82), 0.45)];
  const labK = [pr(T, b(75), 0.5), pr(T, b(76), 0.5), pr(T, b(77), 0.6)]; // L10: the ledger's rows are ruled first (empty)
  const totLab = pr(T, b(78), 0.5);
  const totK = eo(T, b(83), 0.45);
  const lock = pop(T, b(83) + 0.45, 0.25);
  const sh = eio(T, b(85), 2.2);
  const LG = lerp(LG0, LG1, sh), LT = lerp(LT0, LT1, sh);
  const glint = T > b(85) + 2.25 ? Math.exp(-(T - b(85) - 2.25) * 4) : 0;
  // S07 → S08: gold & teal rotate to stand at x 540, teal above gold
  const g0 = { x: ZX, y: ROW.sat - 14, L: LG1 * rowK[0], th: 0, h: BAR_H };
  const g1 = { x: X0, y: AX, L: AX - 566, th: -90, h: 14 };
  const t0 = { x: ZX, y: ROW.inv - 14, L: LT1 * rowK[1], th: 0, h: BAR_H };
  const t1 = { x: X0, y: 566, L: 566 - 330, th: -90, h: 14 };
  const morph = (a: typeof g0, z: typeof g1, k: number) => ({ x: lerp(a.x, z.x, k), y: lerp(a.y, z.y, k), L: lerp(a.L, z.L, k), th: lerp(a.th, z.th, k), h: lerp(a.h, z.h, k) });
  const barsO = 1 - eo(T, CUT.s8 + 0.75, 0.4);
  const gold = T < CUT.s8 ? { x: ZX, y: ROW.sat - 14, L: LG * rowK[0], th: 0, h: BAR_H } : morph(g0, g1, toTime);
  const teal = T < CUT.s8 ? { x: ZX, y: ROW.inv - 14, L: LT * rowK[1], th: 0, h: BAR_H } : morph(t0, t1, toTime);
  // S08
  const axisP = eo(T, CUT.s8 + 0.1, 0.6);
  const drawP = T < CUT.s9 ? pr(T, CUT.s8 + 0.5, 1.45) : 1 - easeInOut(pr(T, CUT.s9, 1.6));
  const markP = eo(T, b(95), 0.35);
  const hopT = b(95) + 0.12;
  const hop = T < CUT.s9 ? eio(T, hopT, 0.36) : 1 - eio(T, CUT.s9 + 0.05, 0.4);
  // the stamp
  const st = T - CUT.stamp;
  const slam = st < 0 ? 0 : 1;
  const sScale = st < 0 ? 0 : st < 0.167 ? lerp(1.6, 1, easeInOut(st / 0.167)) : 1 + 0.02 * eo(T, CUT.stamp + 0.2, 2);
  const sRot = st < 0 ? 0 : lerp(-2, -7, clamp(spring(T, CUT.stamp, 2.5, 7)));
  const lift = eio(T, CUT.s9 + 0.3, 1.4);
  const stampScale = sScale * lerp(1, 1.12, lift);
  const textO = 1 - lift;
  const glow = st > 0 ? Math.exp(-st * 2.5) : 0;
  const shake = st > 0 && st < 0.3 ? 3 * Math.exp(-st * 12) * Math.sin(st * 90) : 0;
  // coins
  const walkX = lerp(X0 + 20, AXc, clamp(pr(T, CUT.s8 + 0.5, 1.45)));
  const back = eio(T, CUT.s9 + 0.4, 1.25);
  let ax = walkX, bx = walkX - 58;
  if (T >= CUT.s9) { ax = lerp(AXc, S09_COINS.A[0], back); bx = lerp(BX0, S09_COINS.B[0], back); }
  const coinsIn = eo(T, CUT.s8 + 0.4, 0.3);
  const bob = (x: number) => (T < b(95) ? -Math.abs(Math.sin(x / 18)) * 4 : 0);
  const months = T < CUT.s9 ? 7 : Math.round(7 * (1 - easeInOut(pr(T, CUT.s9, 1.6))));
  const bHop = bez(hop);
  const bOutline = T >= b(95) && (T < CUT.s9 + 0.45);
  const bO = hop > 0.02 && T < CUT.s9 + 0.45 ? lerp(1, 0.4, hop) : 1;
  const zeroO = eo(T, CUT.s9 + 1.4, 0.4);
  return (
    <g opacity={pageO} transform={`translate(${shake} ${shake * 0.6})`}>
      <g opacity={T < CUT.s7 + 0.4 ? 0 : 1}>
        <PageInk title="感情账本" no="Ledger · No. 4" titleP={eo(T, CUT.s7 + 0.4, 0.5)} sub={T >= CUT.s8 ? '· A 的账，7个月' : undefined} subP={subP} />
      </g>
      {/* header coins */}
      <Coin x={1380} y={148} l="A" r={18} o={eo(T, CUT.s7 + 0.7, 0.3) * othersO} />
      <Coin x={1428} y={148} l="B" r={18} o={eo(T, CUT.s7 + 0.8, 0.3) * othersO} />

      {/* ---------- S07: the balance sheet ---------- */}
      <g opacity={othersO}>
        <line x1={440} y1={330} x2={1500} y2={330} stroke={C.ink} strokeWidth={3} opacity={T > CUT.s7 + 0.8 ? 1 : 0} />
        {fP > 0 && (
          <>
            <PenText x={460} y={296} p={fP} size={56} weight={900} fill={C.ink} text="想留下 = 满意 + 投入 − 别的选择" w={880} id="s07f" />
            <text x={1356} y={292} opacity={eo(T, b(79) + 0.7, 0.3)} style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 30 }} fill={C.grey}>（模型）</text>
          </>
        )}
        <line x1={ZX} y1={372} x2={ZX} y2={720} stroke={C.ink} strokeWidth={1.6} strokeOpacity={0.6 * eo(T, b(78.5), 0.3)} />
        {([[ROW.sat, '+ 满意', C.goldD, 0], [ROW.inv, '+ 投入', C.teal, 1], [ROW.alt, '− 别的选择', C.red, 2]] as [number, string, string, number][]).map(([y, l, col, i]) => (
          <PenText key={i} x={460} y={y} p={labK[i]} size={40} weight={900} fill={col} text={l} id={`s07l${i}`} />
        ))}
        {totLab > 0 && totK <= 0 && (
          <g>
            <line x1={440} y1={TOT.rule} x2={440 + 1060 * eo(T, b(78), 0.5)} y2={TOT.rule} stroke={C.ink} strokeWidth={2.4} />
            <line x1={440} y1={TOT.rule + 6} x2={440 + 1060 * eo(T, b(78), 0.5)} y2={TOT.rule + 6} stroke={C.ink} strokeWidth={1.2} />
            <PenText x={460} y={TOT.y} p={totLab} size={40} weight={900} fill={C.ink} text="= 想留下" id="s07tl" />
          </g>
        )}
        <Bar x={ZX} y={ROW.alt - 14} L={LR * rowK[2]} th={180} h={BAR_H} fill={C.red} o={0.9} />
        {totK > 0 && (
          <g>
            <line x1={440} y1={TOT.rule} x2={1500} y2={TOT.rule} stroke={C.ink} strokeWidth={2.4} />
            <line x1={440} y1={TOT.rule + 6} x2={1500} y2={TOT.rule + 6} stroke={C.ink} strokeWidth={1.2} />
            <text x={460} y={TOT.y} style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 40 }} fill={C.ink}>= 想留下</text>
            <Bar x={ZX} y={TOT.bar - 14} L={(LG0 + LT0 - LR) * totK} th={0} h={BAR_H} fill={C.ink} o={0.88} />
            <line x1={ZX} y1={TOT.bar + 12} x2={ZX + 500 * lock} y2={TOT.bar + 12} stroke={C.ink} strokeWidth={2.4} />
            <line x1={ZX} y1={TOT.bar + 18} x2={ZX + 500 * lock} y2={TOT.bar + 18} stroke={C.ink} strokeWidth={1.2} />
          </g>
        )}
        {totK > 0 && (
          <g opacity={eo(T, b(84), 0.4)}>
            <line x1={SUM_X} y1={386} x2={SUM_X} y2={TOT.bar + 26} stroke={C.ink2} strokeWidth={2} strokeDasharray="7 7" />
            <text x={SUM_X} y={372} textAnchor="middle" style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 30 }} fill={C.ink2}>总数</text>
            {glint > 0.02 && <line x1={SUM_X} y1={386} x2={SUM_X} y2={TOT.bar + 26} stroke={C.goldHi} strokeWidth={6} opacity={glint} />}
          </g>
        )}
        <Margin11 chip="模型" lines={['Caryl Rusbult', '1980', '投资模型']} o={eo(T, b(75), 0.4)} />
      </g>
      {/* gold + teal bars (shared by S07 and the morph into S08) */}
      <g opacity={barsO}>
        <Bar {...gold} fill={C.gold} o={0.92} />
        <Bar {...teal} fill={C.teal} o={0.92} />
      </g>

      {/* ---------- S08 / S09: seven months ---------- */}
      {T >= CUT.s8 && (
        <g>
          <line x1={X0 - 20} y1={AX} x2={lerp(X0 - 20, X1 + 40, axisP)} y2={AX} stroke={C.ink} strokeWidth={2} />
          {xs.map((x, i) => <line key={i} x1={x} y1={AX} x2={x} y2={AX + (i % N === 0 ? 16 : 10)} stroke={C.ink} strokeWidth={1.5} opacity={clamp(axisP * 1.3 - i / N)} />)}
          <text x={X0} y={AX + 48} textAnchor="middle" opacity={axisP} style={{ fontFamily: F.lat, fontWeight: 600, fontSize: 36, ...LNUM }} fill={C.ink}>0</text>
          <text x={X1} y={AX + 50} textAnchor="middle" opacity={axisP} style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 34, ...LNUM }} fill={C.ink}>{months}个月</text>
          <text x={(X0 + X1) / 2} y={AX + 46} textAnchor="middle" opacity={axisP * (1 - lift)} style={{ fontFamily: F.mono, fontSize: 22, ...LNUM }} fill={C.ink2}>每17天一次问卷</text>
          {drawP > 0 && (
            <>
              <clipPath id="s08-draw"><rect x={X0 - 10} y={200} width={(X1 - X0 + 20) * drawP} height={520} /></clipPath>
              <g clipPath="url(#s08-draw)">
                <path d={INV_D + ' L' + xs.slice().reverse().map((x, i) => `${x},${sat[N - i]}`).join(' L') + ' Z'} fill={C.teal} fillOpacity={0.05} />
                {([[INV_D, inv, C.teal], [SAT_D, sat, '#b07c22']] as [string, number[], string][]).map(([d, ys, col], k) => (
                  <g key={k}>
                    <path d={d} fill="none" stroke={col} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" />
                    {xs.map((x, i) => <circle key={i} cx={x} cy={ys[i]} r={6.5} fill="#f3ebd8" stroke={col} strokeWidth={3.5} />)}
                  </g>
                ))}
              </g>
              <text x={X0 - 36} y={inv[0] + 13} textAnchor="end" opacity={clamp(drawP * 4)} style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 42 }} fill={C.teal}>投入</text>
              <text x={X0 - 36} y={sat[0] + 13} textAnchor="end" opacity={clamp(drawP * 4)} style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 42 }} fill="#b07c22">满意</text>
            </>
          )}
          {/* the breakup marker */}
          {markP > 0 && (
            <g opacity={T < CUT.s9 ? 1 : 1 - eo(T, CUT.s9, 0.5)}>
              <line x1={MX} y1={236} x2={MX} y2={lerp(236, AX, markP)} stroke={C.redUI} strokeWidth={2} strokeDasharray="8 7" />
              <g transform={`translate(${MX} ${214 + 23 - 30 * (1 - markP)}) scale(${pop(T, b(95), 0.3)})`}>
                <use href="#k-heartBroken" x={-24} y={-23} width={48} height={46} />
              </g>
              <text x={MX + 34} y={250} opacity={markP} style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 36 }} fill={C.redUI}>被分手</text>
            </g>
          )}
          {/* B's hop: from its outline beside A, out past the line */}
          {bOutline && <Coin x={BX0} y={CYc} l="B" dashed o={1} />}
          {T >= hopT && T < CUT.s9 + 0.45 && (
            <path d={`M${P0} C${C1} ${C2} ${P3}`} fill="none" stroke={C.ink} strokeWidth={2.5} strokeDasharray="2 9" strokeLinecap="round" strokeOpacity={0.6} opacity={T < CUT.s9 ? 1 : 1 - eo(T, CUT.s9, 0.3)} />
          )}
          {/* coins */}
          <g opacity={coinsIn * (T < CUT.s10 ? 1 : 0)}>
            <Coin x={ax} y={CYc + bob(ax)} l="A" />
            {T >= hopT && T < CUT.s9 + 0.45 ? <Coin x={bHop[0]} y={bHop[1] + 27 - 27 * Math.sin(Math.PI * hop) * 0} l="B" o={bO} /> : <Coin x={bx} y={CYc + bob(bx + 9)} l="B" solid={false} />}
          </g>
          <text x={572} y={608} opacity={zeroO * (1 - eo(T, CUT.s10, 0.3))} textAnchor="middle" style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 34, ...LNUM }} fill={C.teal}>投入：0</text>
          {/* the stamp */}
          {slam > 0 && (
            <g>
              <circle cx={STAMP.x} cy={STAMP.y} r={230 * (1 + 0.3 * glow)} fill="url(#k-stampGlow)" opacity={T < CUT.s10 ? 1 : 0} />
              {lift > 0 && T < CUT.s10 && <rect x={STAMP.x - 178 * stampScale} y={STAMP.y - 88 * stampScale + 26 * lift} width={356 * stampScale} height={176 * stampScale} fill="none" stroke="#000" strokeWidth={10} opacity={0.14 * lift} filter="url(#k-blur2)" transform={`rotate(-7 ${STAMP.x} ${STAMP.y})`} />}
              {T < CUT.s10 && <Stamp x={STAMP.x} y={STAMP.y - 14 * lift} rot={sRot} s={stampScale} w={STAMP.w} h={STAMP.h} text="被套牢" sub="ENTRAPMENT" textO={textO} />}
            </g>
          )}
          <Margin11 chip="示意" lines={['一项小研究', '34人', 'Rusbult 1983']} o={eo(T, CUT.s8 + 0.3, 0.4) * (1 - eo(T, CUT.s9 + 1, 0.4))} />
        </g>
      )}
    </g>
  );
};
