// hud/ms/card.tsx: SKIN A's LEAD CARD for NEWTON (EFFECTS_PLAN rows 4-5; stage 2a), on the 2.5 s freeze after B03
// 「牛顿先生，您在写什么？」. Mounted by Film.tsx BELOW the HUD layer (the vlog UI, REC / 上午 / battery, stays on top of the
// full-screen card unchanged, as the plan says) and above the 3D picture and the whisper's darkened edges.
// (Humphrey's banner, row 2, is drawn by hud/ms/banner.tsx, stage 2b.)
//
// THE CONTRACT
//   <MsCard f ctx />    f = the film frame; ctx = hud/ms/screen.ts MsCtx (null where nothing draws)
//   When: msT("card", f): t 0..74 = the 75 frames after B03's last frame (the picture is held on that frame and the set
//         washed to sepia laid paper in 3D: freeze.ts, wash.ts; 75 = the voice track's and the mix's G2, director r1
//         note 1). Beats in msItem("card").beats: everything is WRITTEN ON in the first 6-7 frames (the slip laid 0,
//         the compass construction 0, the name 1, the propositions 1-3, the date, the seal pressed and the target 3), it
//         holds to `out` (67), then the card sinks into the paper (6 f) while the target line FLIES to the meter's slot
//         (`fly`, 8 f) and lands exactly on skin.ts METER (the empty circle with 笑 in it, 0/1, turned with the meter's
//         slip) on t 74; fx's meter (hud/ms/meter.tsx, meter0) takes over from the next frame, the frame the picture runs
//         again on. The wash drains back into colour from `drain` (71).
//   What: the approved frame (looks/frames/A_card.png; skin_a.py card()), fitted to the phone-safe rules:
//     - a soft shade under the vlog UI (REC and 上午 keep their contrast on the pale page);
//     - the compass construction BEHIND HIM (a circle round his head, the inscribed triangle ABC with its letters in
//       FreeSerif Italic, a dashed orbit), anchored to his head on screen (msFig(ctx, "newton")) and cut away round his
//       head, wig, body and hands (a mask from the figure's head, face box and hands: DOM cannot go behind him), so no
//       line crosses his face;
//     - the crimson wax seal 冷面学神 in the wall space right of his head;
//     - the label slip pasted over the desk line: 艾萨克·牛顿 (crimson, the broad nib), 1686年5月 · 剑桥三一学院 (small,
//       sepia), 命题一/二/三 (crimson labels) with the three stats in iron-gall, a dotted rule, 今日目标：让他笑一次 with the
//       meter's empty circle and 0/1 (upright FrSans bold, as the meter draws it: the approved frames' numerals).
//   Where: the slip and every word inside x 70-930 (the paper inside x 56-930), y 944-1490; the seal in x 690-926,
//         y 330-578 (msItem("card").box); the construction x 57-800, y 150-870, never over his face.
//   Ids: every id starts with "newton-ms-card". No blend modes and no backdrop filters. A pure function of (f, ctx).
import React from "react";
import { clamp, clamp01, easeOut, smooth } from "../../../../kit/overlay";
import { MS, METER } from "./skin";
import { msDefs, nibFilter, sinkFilter, quill, inkText, serifText, leaf, waxSeal, ellipseArc, ellipseLen, drawOn, writeK } from "./marks";
import { msItem, msT } from "./when";
import { msFig, type MsCtx, type MsPt } from "./screen";

const P = "newton-ms-card";

// ---------------------------------------------------------------------------------------------------- the layout
// the approved frame (skin_a.py card()), the slip fitted inside the card's box (x 56-930, y 944-1490: the approved slip
// ran to x 46 and y 1496) and its rows closed up by 4 % to fit
const SLIP = { x: 68, y: 962, w: 848, h: 508, rot: -0.8 };
const SC = { x: SLIP.x + SLIP.w / 2, y: SLIP.y + SLIP.h / 2 };
const NAME = { x: 88, y: 1080, S: 118, o: { rots: [-4, 2, -1, 0, -3, 4], lifts: [0, 5, -3, 0, 2, 7], scales: [1.0, 0.96, 1.02, 1.0, 1.0, 0.97], track: 2, seed: 4 } };
const DATE = { s: "1686年5月 · 剑桥三一学院", x: 90, y: 1132, px: 34, ls: 3 };
const ROWS: [string, string][] = [["命题一", "睡衣：助手从没见他穿过"], ["命题二", "独自坐下吃饭：助手没见过"], ["命题三", "出生：他说一升杯装得下"]];
const ROW = { y: 1200, step: 60, kx: 88, kpx: 31, vx: 216, vpx: 45 };
const RULE = { x0: 88, x1: 900, y: 1346 };
/** the target row: 今日目标：让他 | 笑 | 一次 (笑 flies into the meter's circle), the empty circle, 0/1 */
const TGT = { x: 86, y: 1422, px: 58, pre: "今日目标：让他", mid: "笑", post: "一次" };
const RING = { cx: 760, cy: TGT.y - 21, r: 34 };
const COUNT = { x: 806, y: TGT.y, px: 60 };
/** the seal (the approved: centre 808, 452, r 112, turned 8 deg) */
const SEAL = { cx: 806, cy: 452, r: 112, rot: 8, rows: ["冷面", "学神"] };
/** the approved frame's construction against his head there (head 360, 500, drawn radius 195; the probed radius is about
 *  1.1 x the drawn one): centre (+0.15 r, +0.09 r), radius 1.54 r, triangle at -96 / 18 / 158 deg, the dashed orbit */
const CON = { dx: 0.15, dy: 0.09, R: 1.54, tri: [-96, 18, 158], orb: { dx: 40 / 326, dy: 30 / 326, rx: 1.13, ry: 0.46, rot: -12 } };
/** fallback when no Newton is found (a forced still elsewhere): the probed head on B03's last frame (f909) */
const HEAD0 = { x: 354, y: 505, r: 214 };

// ---------------------------------------------------------------------------------------------------- helpers
const n1 = (v: number) => v.toFixed(1);
const rotAbout = (p: MsPt, c: MsPt, deg: number): MsPt => {
  const a = (deg * Math.PI) / 180, dx = p.x - c.x, dy = p.y - c.y;
  return { x: c.x + dx * Math.cos(a) - dy * Math.sin(a), y: c.y + dx * Math.sin(a) + dy * Math.cos(a) };
};
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerpPt = (a: MsPt, b: MsPt, k: number): MsPt => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) });

// ---------------------------------------------------------------------------------------------------- the card
export const MsCard: React.FC<{ f: number; ctx?: MsCtx | null }> = ({ f, ctx }) => {
  const t = msT("card", f);
  if (t === null) return null;
  const b = msItem("card").beats;
  // ---- the exit: the card sinks into the paper over 6 f from `out`; the slip's paper goes over its second half
  const sk = writeK(t, b.out, 6), paper = 1 - clamp01((sk - 0.45) / 0.55);
  const shade = Math.min(writeK(t, 0, 3), 1 - writeK(t, b.out, b.leave));
  // ---- the slip laid down in 3 f: it settles the last few px onto the frozen page, its opacity up over the first half
  // (no scale: the slip already runs to within a few px of the safe frame's left edge)
  const lay = writeK(t, b.wipe, 3), layDy = -10 * (1 - easeOut(lay, 2));
  // ---- his head on the held frame
  const nt = ctx ? msFig(ctx, "newton") : null;
  const hd = nt ? { x: nt.head.x, y: nt.head.y, r: nt.r } : HEAD0;
  const face = nt?.face ?? { x0: HEAD0.x - 190, y0: HEAD0.y + 26, x1: HEAD0.x + 186, y1: HEAD0.y + 198 };
  const hands = nt?.hands ?? [{ x: 225, y: 930 }, { x: 388, y: 928 }];

  // ---- THE CONSTRUCTION (behind him: cut away round his figure)
  const ccx = hd.x + CON.dx * hd.r, ccy = hd.y + CON.dy * hd.r;
  const R = Math.min(CON.R * hd.r, ccx - 60, 1022 - ccx, ccy - 150);
  const tri = CON.tri.map((a) => ({ x: ccx + R * Math.cos((a * Math.PI) / 180), y: ccy + R * Math.sin((a * Math.PI) / 180) }));
  const circK = easeOut(writeK(t, b.construct, 5), 1.5), triK = writeK(t, b.construct + 2, 4), orbO = writeK(t, b.construct + 3, 3);
  const triLen = tri.reduce((L, p, i) => L + Math.hypot(tri[(i + 1) % 3].x - p.x, tri[(i + 1) % 3].y - p.y), 0);
  const circLen = ellipseLen(R, R, CON.tri[0], CON.tri[0] + 360, 120);
  const orb = { cx: ccx + CON.orb.dx * R, cy: ccy + CON.orb.dy * R, rx: CON.orb.rx * R, ry: CON.orb.ry * R };
  const label = (p: MsPt, i: number) => {
    const x = clamp(p.x + (p.x > ccx ? 18 : -40), 60, 990), y = p.y + (p.y < ccy ? -14 : 44);
    return writeK(t, b.construct + 2 + i, 1) > 0 ? <React.Fragment key={i}>{serifText(`${P}-L${i}`, "ABC"[i], x, y, 50, { filter: `${P}-inkAsm` })}</React.Fragment> : null;
  };
  const r = hd.r;
  const cut = (
    <mask id={`${P}-behind`} maskUnits="userSpaceOnUse" x={0} y={0} width={1080} height={1800}>
      <rect x={0} y={0} width={1080} height={1800} fill="#fff" />
      <g fill="#000" stroke="#000">
        {/* his head and wig, the wig's side curls, the face box itself */}
        <ellipse cx={n1(hd.x)} cy={n1(hd.y)} rx={n1(1.25 * r)} ry={n1(1.03 * r)} strokeWidth={0} />
        <ellipse cx={n1(hd.x)} cy={n1(hd.y + 0.47 * r)} rx={n1(1.23 * r)} ry={n1(0.58 * r)} strokeWidth={0} />
        <rect x={n1(face.x0 - 10)} y={n1(face.y0 - 10)} width={n1(face.x1 - face.x0 + 20)} height={n1(face.y1 - face.y0 + 20)} strokeWidth={0} />
        {/* his body, arms and hands down to the desk */}
        <path d={`M${n1(hd.x - 0.62 * r)},${n1(hd.y + 0.85 * r)} L${n1(hd.x + 0.62 * r)},${n1(hd.y + 0.85 * r)} L${n1(hd.x + 0.72 * r)},1000 L${n1(hd.x - 0.72 * r)},1000 Z`} strokeWidth={0} />
        {hands.map((h, i) => (
          <React.Fragment key={i}>
            <line x1={n1(hd.x + (i ? 0.5 : -0.5) * r)} y1={n1(hd.y + 0.98 * r)} x2={n1(h.x)} y2={n1(h.y)} strokeWidth={n1(0.36 * r)} strokeLinecap="round" />
            <circle cx={n1(h.x)} cy={n1(h.y)} r={n1(0.24 * r)} strokeWidth={0} />
          </React.Fragment>
        ))}
      </g>
    </mask>
  );
  const construction = (
    <g opacity={0.72} mask={`url(#${P}-behind)`}>
      {circK > 0 ? <path d={ellipseArc(ccx, ccy, R, R, 0, CON.tri[0], CON.tri[0] + 360, 120)} fill="none" stroke="#000" strokeWidth={4} strokeLinecap="round" filter={`url(#${P}-inkAsm)`} {...drawOn(circLen, circK)} /> : null}
      {triK > 0 ? <path d={`M${tri.map((p) => `${n1(p.x)},${n1(p.y)}`).join(" L")} Z`} fill="none" stroke="#000" strokeWidth={3} strokeLinejoin="round" filter={`url(#${P}-inkAsm)`} {...drawOn(triLen, triK)} /> : null}
      {orbO > 0 ? <path d={ellipseArc(orb.cx, orb.cy, orb.rx, orb.ry, CON.orb.rot, 0, 360, 140)} fill="none" stroke="#000" strokeWidth={3} strokeDasharray="14 9" opacity={orbO} filter={`url(#${P}-inkS)`} /> : null}
      {tri.map(label)}
    </g>
  );

  // ---- THE SEAL, pressed in 2 f (it lands round and wide and settles), right of his head
  const seal = { ...SEAL, cx: clamp(Math.max(SEAL.cx, hd.x + 1.25 * r + SEAL.r + 10), 690 + SEAL.r, 926 - SEAL.r - 6), cy: clamp(hd.y - 0.25 * r, 330 + SEAL.r + 6, 578 - SEAL.r * 1.11 - 2) };
  const sd = t - b.seal, squash = sd < 0 ? 0 : sd === 0 ? 1.22 : sd === 1 ? 1.08 : sd === 2 ? 0.97 : 1;

  // ---- THE SLIP'S INK (in the slip's turned frame)
  const rowPer = 0.3;
  const slipInk = (
    <>
      {quill(`${P}-name`, "艾萨克·牛顿", NAME.x, NAME.y, NAME.S, `${P}-nibN`, { ...NAME.o, write: { t, at: b.name, per: 0.9, pool: 2 } })}
      {inkText(`${P}-date`, DATE.s, DATE.x, DATE.y, DATE.px, `${P}-inkS`, { ls: DATE.ls, write: { t, at: b.date, per: 0.2 } })}
      {ROWS.map(([k, v], i) => {
        const y = ROW.y + i * ROW.step, at = b.stats + i;
        return (
          <React.Fragment key={i}>
            {inkText(`${P}-k${i}`, k, ROW.kx, y, ROW.kpx, `${P}-inkRsm`, { ls: 2, write: { t, at, per: rowPer } })}
            {inkText(`${P}-v${i}`, v, ROW.vx, y + 2, ROW.vpx, `${P}-inkAsm`, { write: { t, at: at + 0.6, per: rowPer } })}
          </React.Fragment>
        );
      })}
      {writeK(t, b.target, 2) > 0 ? <line x1={RULE.x0} y1={RULE.y} x2={RULE.x0 + (RULE.x1 - RULE.x0) * writeK(t, b.target, 2)} y2={RULE.y} stroke="#000" strokeWidth={2} strokeDasharray="3 8" filter={`url(#${P}-inkS)`} /> : null}
    </>
  );

  // ---- THE TARGET LINE: written on with the card. From `fly` it is torn off the sinking card on a strip of the same
  // slip and FLIES to the meter's slot along an arc kept right of his body: the strip becomes the meter's slip
  // (METER.slip: place, size, turn), the empty circle goes onto METER.circle, 笑 into it, 0/1 onto METER.count, the rest
  // of the line shrinks into 笑 and sinks into the paper on the way. On t 74 it is exactly the meter's slip at rest, so
  // fx's meter (meter0) takes over on the next frame.
  // fk = along the arc; fe = the strip's size and the marks' layout on it (narrowed early, so it never lies on his arm)
  const fk = smooth(writeK(t, b.fly, b.leave)), fe = easeOut(fk, 3), flying = t >= b.fly;
  const tPer = 0.32, tAt = b.target;
  // the strip: from round the target row on the card (the slip's own frame) to the meter's slip; centre on an arc
  const A0 = { x: 76, y: TGT.y - 62, w: 904 - 76, h: 84 }, A1 = METER.slip;
  const c0 = rotAbout({ x: A0.x + A0.w / 2, y: A0.y + A0.h / 2 }, SC, SLIP.rot), c1 = { x: A1.x + A1.w / 2, y: A1.y + A1.h / 2 };
  const ctl = { x: Math.max(c0.x, 680), y: lerp(c0.y, c1.y, 0.45) };
  const cen = { x: (1 - fk) ** 2 * c0.x + 2 * (1 - fk) * fk * ctl.x + fk * fk * c1.x, y: (1 - fk) ** 2 * c0.y + 2 * (1 - fk) * fk * ctl.y + fk * fk * c1.y };
  const sw = lerp(A0.w, A1.w, fe), shh = lerp(A0.h, A1.h, fe), srot = lerp(SLIP.rot, A1.rot, fe);
  // each mark's place in the strip's own (unturned) frame, from the centre: on the card -> on the meter
  const loc = (card: MsPt, meter: MsPt): MsPt => lerpPt({ x: card.x - (A0.x + A0.w / 2), y: card.y - (A0.y + A0.h / 2) }, { x: meter.x - c1.x, y: meter.y - c1.y }, fe);
  // (before the flight: the card slip's own unturned frame, turned with it below)
  const base = flying ? cen : { x: A0.x + A0.w / 2, y: A0.y + A0.h / 2 };
  const pos = (card: MsPt, meter: MsPt): MsPt => { const l = loc(card, meter); return { x: base.x + l.x, y: base.y + l.y }; };
  const midX0 = TGT.x + TGT.pre.length * TGT.px;                 // 笑's left edge on the slip (FrSans CJK: 1 em)
  const mid = pos({ x: midX0 + TGT.px / 2, y: TGT.y }, { x: METER.circle.cx, y: METER.circle.cy + 16 }), midPx = lerp(TGT.px, METER.circle.px, fe);
  const ring = pos({ x: RING.cx, y: RING.cy }, { x: METER.circle.cx, y: METER.circle.cy }), ringR = lerp(RING.r, METER.circle.r, fe);
  const cnt = pos({ x: COUNT.x, y: COUNT.y }, { x: METER.count.x, y: METER.count.y }), cntPx = lerp(COUNT.px, METER.count.px, fe);
  // the count's digit ends at cntSplit and "/1" starts there, as meter.tsx sets it (FrSans digits are about 0.57 em)
  const cntDigit = 0.57 * cntPx, cntSplit = cnt.x + cntDigit;
  const ringO = writeK(t, tAt + 2, 2), dotO = writeK(t, tAt + 3, 1), cntO = writeK(t, tAt + 3, 2);
  // the rest of the line shrinks into 笑 and is gone by 40 % of the flight
  const rest = smooth(clamp01(fk / 0.4)), restS = 1 - 0.8 * rest;
  const targetInk = (
    <>
      {rest < 1 ? (
        <g transform={`translate(${n1(mid.x)} ${n1(mid.y)}) scale(${restS.toFixed(3)})`} opacity={(1 - rest).toFixed(3)} filter={sk > 0 ? `url(#${P}-sink)` : undefined}>
          {inkText(`${P}-tpre`, TGT.pre, -midPx / 2 / restS - TGT.pre.length * TGT.px, 0, TGT.px, `${P}-inkA`, { w: TGT.pre.length * TGT.px, write: { t, at: tAt, per: tPer } })}
          {inkText(`${P}-tpost`, TGT.post, midPx / 2 / restS, 0, TGT.px, `${P}-inkA`, { w: TGT.post.length * TGT.px, write: { t, at: tAt + (TGT.pre.length + 1) * tPer, per: tPer } })}
        </g>
      ) : null}
      {inkText(`${P}-tmid`, TGT.mid, mid.x, mid.y, midPx, `${P}-inkA`, { anchor: "middle", w: midPx, write: { t, at: tAt + TGT.pre.length * tPer, per: tPer } })}
      {ringO > 0 ? <circle cx={n1(ring.x)} cy={n1(ring.y)} r={n1(ringR)} fill="none" stroke="#000" strokeWidth={3} strokeDasharray="7 7" opacity={ringO} filter={`url(#${P}-inkS)`} /> : null}
      {dotO > 0 ? <circle cx={n1(ring.x)} cy={n1(ring.y - ringR)} r={5} fill="#000" filter={`url(#${P}-inkA)`} /> : null}
      {/* the count 0/1 upright in the body hand (FrSans bold through the iron-gall ink), exactly as meter.tsx draws it at
          METER.count: every approved frame draws it so (A_card, A_fx, swatch_A), and the hand-off needs no re-ink */}
      {cntO > 0 ? (
        <g opacity={cntO}>
          {inkText(`${P}-c0`, "0", cntSplit, cnt.y, cntPx, `${P}-inkA`, { anchor: "end", w: cntDigit })}
          {inkText(`${P}-cs`, "/1", cntSplit, cnt.y, cntPx, `${P}-inkA`, { w: 2 * cntDigit })}
        </g>
      ) : null}
    </>
  );
  // before the flight the marks sit on the card's slip (its turn); in flight on the strip (the strip's turn)
  const target = flying
    ? leaf(P, `${P}-strip`, cen.x - sw / 2, cen.y - shh / 2, sw, shh, srot, { fill: MS.slip, small: true, fox: false }, targetInk)
    : <g transform={`rotate(${SLIP.rot} ${SC.x} ${SC.y})`}>{targetInk}</g>;

  return (
    <svg id={P} width={1080} height={1800} viewBox="0 0 1080 1800" style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <defs>
        {msDefs(P)}
        {nibFilter(`${P}-nibN`, MS.crimson, MS.edgeCrimson, NAME.S, 4)}
        {sk > 0 ? sinkFilter(`${P}-sink`, Math.min(0.999, sk)) : null}
        <linearGradient id={`${P}-shade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={MS.ink} stopOpacity={0.5} /><stop offset="1" stopColor={MS.ink} stopOpacity={0} />
        </linearGradient>
        {cut}
      </defs>
      {/* a soft shade under the vlog UI so its white and amber words keep their contrast on the pale page */}
      {shade > 0 ? <rect x={0} y={0} width={1080} height={290} fill={`url(#${P}-shade)`} opacity={shade} /> : null}
      {sk < 1 ? (
        <g filter={sk > 0 ? `url(#${P}-sink)` : undefined}>
          {construction}
          {squash > 0 ? waxSeal(P, `${P}-seal`, seal.cx, seal.cy, seal.r, seal.rot, seal.rows, { squash }) : null}
        </g>
      ) : null}
      {lay > 0 && paper > 0 ? (
        <g transform={`translate(0 ${layDy.toFixed(1)})`} opacity={clamp01(lay * 2) * paper}>
          {leaf(P, `${P}-slip`, SLIP.x, SLIP.y, SLIP.w, SLIP.h, SLIP.rot, { fill: MS.slip, fox: false }, sk < 1 ? <g filter={sk > 0 ? `url(#${P}-sink)` : undefined}>{slipInk}</g> : null)}
        </g>
      ) : null}
      {lay >= 1 ? target : null}
    </svg>
  );
};
