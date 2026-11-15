// hud/ms/fx.tsx: SKIN A's 综艺 EFFECTS (stage 2b), mounted by Film.tsx ABOVE the vlog HUD and the shot's overlays,
// BELOW the whisper bubble, the subtitle and the phone mask. Every piece is a slip or scrap of his paper WRITTEN ON by an
// unseen nib and LEAVING BY SINKING INTO THE PAPER (fxkit.tsx exitK: the ink goes sepia and the paper takes it, then the
// slip goes), and carries one crimson rubric mark.
//   row 2   Humphrey's banner (a side card, on the live shot)            hud/ms/banner.tsx  <MsBanner>
//   row 3   THE DETAIL ZOOM ON THE FLICK: a magnifier ring on his two fingers and the label 意思：别烦我      (here)
//   rows 5, 6, 8, 10   THE LAUGH METER: born 0/1, tick 1, tick 2 + 我笑的不算, 1/1 + 证毕   hud/ms/meter.tsx   <MsMeter>
//   row 7   花字 拒收 slammed onto the floor where the chair comes to rest; it jolts when the chair hits the lens (here)
//   row 9   GAME BAR 午饭进度 over the plate's far rim: 1 %, then 2 % on the second fork clink                (here)
// (Row 2 is a card in the plan's budget but drawn here, on stage 2b's side of the split: card.tsx draws Newton's card.)
//
// WHERE (anchored to the picture through ctx, hud/ms/screen.ts; then clamped into the item's box in when.ts):
//   flick   his LEFT hand (people: arm 1, the free one; the quill is in his right), projected from the rig's 3D hand
//           point (msFig(ctx, "newton").hands[1]) whenever he is in the posed shot. The ring (about 230 px across with
//           its paper rim) goes on it; a hand right of x 770 or below y 1000 puts it up-left of the hand with a short
//           dotted leader (the plan); then the ring is clamped into its box and the label (under it, a little left)
//           into its own (when.ts msItem("flick").box: ring, label); a ring over a face steps off it. No Newton in the
//           posed shot -> the documented constant FLICK_HAND (the swatch's hand), clamped the same way. TODAY'S segB
//           PANS OFF HIM DURING THE FLICK (the camera follows Humphrey to the door; his hand leaves the frame at f775):
//           today's boxes hold the ring up-left of where his hand is on the flick's first frame (x 935, y 761), under
//           his face and right of Humphrey's, its leader pointing off the right edge once he has gone. RECHECK AFTER
//           THE SCENE REBUILD (and refit the boxes). Until then it is OFF in the film (when.ts heldOff, director r1
//           note 3: with him gone the label reads as Humphrey's); a still can still force it (fx.force "flick").
//           The ring does not magnify: the overlay pass may not read the picture under it (the cut rule, marks.tsx
//           header), so the ring marks the hand at 1x where the swatch showed it at 2x (a picture-side inset would be
//           the scene's job).
//   stamp   the chair's seat, projected from the posed chair (ctx.props.chair.seat): it rides the chair and the camera,
//           clamped so the whole piece, its jolt included, stays inside the item's box (when.ts msItem("stamp").box).
//           No chair -> the box's lower right.
//   lunch   the plate's far rim (ctx.props.plate.far): the bar's bottom 12 px above it, clamped so the bar stays inside
//           the item's box (when.ts msItem("lunch").box): on today's segE the plate sits at his chin's height (its far
//           rim at y 790, his face down to y 723 and right of x 429, no room left of him), so today's box puts the
//           bar under the plate on the cloth's front until the rebuild brings the plate down.
// THE BOXES are fitted to today's scenes (provisional: they move with the rebuild; refit them in when.ts and the pieces
// follow, since every piece clamps into its own box).
// Ids: newton-ms-fx* (the banner newton-ms-banner*, the meter newton-ms-meter*). No blend modes, no backdrop filters.
// A pure function of (f, ctx): no hooks, no state, hash01 only.
import React from "react";
import { clamp, clamp01, easeOut, easeOutBack, part, shake, slap } from "../../../../kit/overlay";
import { MS, MOTION } from "./skin";
import { msDefs, nibFilter, quill, quillOutline, inkText, leaf, swash, ellipseArc, ellipseLen, drawOn, writeK, sinkFilter } from "./marks";
import { MS_ITEMS, msItem, msOn, msT } from "./when";
import { Sheet, layK, about, exitK, sinkDef, hits, faceBoxes } from "./fxkit";
import { msFig, type MsCtx, type MsPt } from "./screen";
import { MsBanner } from "./banner";
import { MsMeter } from "./meter";

// ---------------------------------------------------------------------------------------------------- row 3 the flick
const PF = "newton-ms-fx-flick";
/** THE DOCUMENTED CONSTANT: his flicking hand when the frame has no Newton in its posed shot (a still without ctx;
 *  swatch_A: f0879 rows 700-1120, hand at 390, 226 of the strip). Clamped into the item's box like the rig's hand. */
export const FLICK_HAND: MsPt = { x: 390, y: 986 };   // 9:15 (390, 926) + 60
const RING = 100;
/** round the ring's centre: its paper rim and the pop's overshoot (120); round the label's middle top: half its width
 *  laid a touch large and tilted (160), 2 above, 74 below */
const FL = { ring: 120, lw: 160, lu: 2, ld: 74 };
export const flickPlace = (ctx: MsCtx | null | undefined) => {
  const nt = ctx ? msFig(ctx, "newton") : null;
  // his hand from the rig whenever he is in the posed shot, in the picture or not (today's segB pans off him over the
  // hold: his hand leaves the frame at f775), else the constant
  const fromRig = !!(nt && nt.front);
  const hand = fromRig ? nt!.hands[1] : FLICK_HAND;
  // THE RING (the plan): on the hand; a hand right of x 770 or below y 1000 (9:16: the ring would reach the app's
  // button column, x >= 890 from y 1000; it was x 820 / y 950 on the 9:15 frame) puts it up-left of the hand (in the gap
  // between the two men) with a short leader. Then clamped into the ring's box (when.ts msItem("flick").box[0]: today's
  // keeps it clear of both faces for the whole hold, so it holds its place while the shot pans off him)
  const [RB, LB0] = msItem("flick").box, LBX = LB0 ?? RB;
  const far = hand.x > 770 || hand.y > 1000, want = far ? { x: hand.x - 150, y: hand.y - 150 } : hand;
  const cx0 = RB.x0 + FL.ring, cx1 = Math.max(cx0, RB.x1 - FL.ring), cy0 = RB.y0 + FL.ring, cy1 = Math.max(cy0, RB.y1 - FL.ring);
  const c = { x: clamp(want.x, cx0, cx1), y: clamp(want.y, cy0, cy1) };
  // never over a face: step the ring below it (or above it) when the box leaves room
  for (const fb of faceBoxes(ctx, 12)) {
    if (!hits({ x0: c.x - RING - 16, y0: c.y - RING - 16, x1: c.x + RING + 16, y1: c.y + RING + 16 }, fb)) continue;
    const down = fb.y1 + RING + 18, up = fb.y0 - RING - 18;
    c.y = clamp(down <= cy1 ? down : up, cy0, cy1);
  }
  // THE LABEL under the ring, a little to its left (the swatch), inside its own box (box[1]; left of x 890)
  const lw = 300, lh = 66;
  const lx = clamp(c.x - 100, LBX.x0 + FL.lw, Math.max(LBX.x0 + FL.lw, LBX.x1 - FL.lw));
  const ly = clamp(c.y + RING + 22, LBX.y0 + FL.lu, Math.max(LBX.y0 + FL.lu, LBX.y1 - FL.ld));
  const left = lx <= c.x;
  // the dotted sepia leader from the ring's rim toward his hand while the hand is off the ring, cut at the ring's box
  // (so it never leaves it: today it points off the frame's right edge once he has slid out)
  const dx = hand.x - c.x, dy = hand.y - c.y, d = Math.hypot(dx, dy);
  let lead: null | { x0: number; y0: number; x1: number; y1: number } = null;
  if (d > RING * 0.8) {
    const V = { x0: RB.x0 + 4, y0: RB.y0 + 4, x1: RB.x1 - 4, y1: RB.y1 - 4 };
    let k = 1;
    if (c.x + dx * k > V.x1) k = (V.x1 - c.x) / dx;
    if (c.x + dx * k < V.x0) k = (V.x0 - c.x) / dx;
    if (c.y + dy * k > V.y1) k = (V.y1 - c.y) / dy;
    if (c.y + dy * k < V.y0) k = (V.y0 - c.y) / dy;
    const s0 = (RING + 14) / d;
    if (d * k - (RING + 14) > 14) lead = { x0: c.x + dx * s0, y0: c.y + dy * s0, x1: c.x + dx * k, y1: c.y + dy * k };
  }
  return { hand, c, lead, lx, ly, lw, lh, left, fromRig };
};
const Flick: React.FC<{ t: number; ctx?: MsCtx | null }> = ({ t, ctx }) => {
  const b = msItem("flick").beats, ex = exitK(t, b.out, b.leave), pl = flickPlace(ctx), { c } = pl;
  const sink = ex.ink > 0 ? `url(#${PF}-sink)` : undefined;
  // THE RING pops in 4 f: the compass draws it from 200 deg round (the nib's ink), the paper rim comes with it
  const ringK = easeOut(part(t, b.ring, b.in), 2), pop = 0.82 + 0.18 * easeOutBack(part(t, b.ring, b.in), 2.2);
  const Lr = ellipseLen(RING, RING, 200, 560, 90), Lo = ellipseLen(RING + 13, RING + 13, 200, 560, 90);
  const lay = layK(t, b.label);
  // THE RUBRIC MARK, a crimson swash: from the label's top corner nearest the ring to the ring's edge (the swatch); when
  // that corner is inside the ring (the label tucked under it), under 别烦我 instead
  let sx = pl.left ? pl.lx + 80 : pl.lx - 80, sy = pl.ly + 18;
  let ea = Math.atan2(sy - c.y, sx - c.x), ex1 = c.x + (RING + 4) * Math.cos(ea), ey1 = c.y + (RING + 4) * Math.sin(ea);
  if (Math.hypot(sx - c.x, sy - c.y) < RING + 24) { sx = pl.lx - 4; sy = pl.ly + 57; ex1 = pl.lx + 114; ey1 = pl.ly + 55; ea = 0; }
  return (
    <Sheet id={PF}>
      <defs>{msDefs(PF)}{sinkDef(`${PF}-sink`, ex.ink)}</defs>
      <g transform={about(c.x, c.y, pop)} opacity={ex.paper}>
        <g filter={`url(#${PF}-shs)`} opacity={clamp01(ringK * 2)}><circle cx={c.x} cy={c.y} r={RING + 7} fill="none" stroke={MS.slip} strokeWidth={16} filter={`url(#${PF}-torn2)`} /></g>
      </g>
      <g transform={about(c.x, c.y, pop)} filter={sink}>
        <path d={ellipseArc(c.x, c.y, RING, RING, 0, 200, 560, 90)} fill="none" stroke="#000" strokeWidth={4} filter={`url(#${PF}-inkA)`} {...drawOn(Lr, ringK)} />
        <path d={ellipseArc(c.x, c.y, RING + 13, RING + 13, 0, 200, 560, 90)} fill="none" stroke="#000" strokeWidth={2.5} filter={`url(#${PF}-inkS)`} {...drawOn(Lo, part(t, b.ring + 1, b.in))} />
        {pl.lead && ringK > 0.5 ? <path d={`M${pl.lead.x0.toFixed(1)},${pl.lead.y0.toFixed(1)} L${pl.lead.x1.toFixed(1)},${pl.lead.y1.toFixed(1)}`} stroke="#000" strokeWidth={2.5} strokeDasharray="3 6" fill="none" filter={`url(#${PF}-inkS)`} /> : null}
      </g>
      {t >= b.label ? (
        <g transform={about(pl.lx, pl.ly + pl.lh / 2, lay.s)} opacity={lay.o}>
          {leaf(PF, `${PF}-label`, pl.lx - pl.lw / 2, pl.ly, pl.lw, pl.lh, -1.5, { fill: MS.slip, small: true, fox: false, opacity: ex.paper })}
          <g transform={`rotate(-1.5 ${pl.lx} ${pl.ly + pl.lh / 2})`} filter={sink}>
            {inkText(`${PF}-say`, "意思：别烦我", pl.lx, pl.ly + 46, 36, `${PF}-inkA`, { anchor: "middle", w: 6 * 36, write: { t, at: b.label + 1, per: 1 } })}
          </g>
        </g>
      ) : null}
      <g filter={sink}>{swash(`${PF}-lead`, sx, sy, ex1, ey1, -8, 6, `url(#${PF}-inkR)`, { blot: false, k: writeK(t, b.label + 2, 3) })}</g>
    </Sheet>
  );
};

// ---------------------------------------------------------------------------------------------------- row 7 拒收
const PS = "newton-ms-fx-stamp";
/** the approved frame's word (skin_a.py effects: quill("拒收", 640, 1226, 136), the double swash, the splatter) and
 *  its anchor: the word's middle on its baseline */
const ST = { x: 640, y: 1226, S: 136, ax: 770, ay: 1210, rots: [-11, 6], lifts: [0, 18], scales: [1.0, 0.97], track: -4 };
/** the piece round its anchor (the scrap, the swashes, the splatter: x -180..+144, y -124..+96) and the jolt's reach */
const ST_EXT = { l: 180, r: 144, u: 124, d: 96, jolt: 16 };
/** where the anchor may go so the whole piece, jolt included, stays inside the item's box (when.ts msItem("stamp").box) */
const stBox = () => {
  const B = msItem("stamp").box[0], j = ST_EXT.jolt;
  const x0 = B.x0 + ST_EXT.l + j, x1 = B.x1 - ST_EXT.r - j, y0 = B.y0 + ST_EXT.u + j, y1 = B.y1 - ST_EXT.d - j;
  return { x0, x1: Math.max(x0, x1), y0, y1: Math.max(y0, y1) };
};
export const stampAnchor = (ctx: MsCtx | null | undefined) => {
  const seat = ctx?.props?.chair?.seat, R = stBox();
  return seat && seat.front ? { x: clamp(seat.x, R.x0, R.x1), y: clamp(seat.y, R.y0, R.y1) } : { x: R.x1, y: R.y1 };
};
const SPLAT: [number, number, number][] = [[622, 1132, 7], [610, 1154, 4], [904, 1150, 5], [914, 1176, 3], [590, 1252, 4]];
const Stamp: React.FC<{ t: number; ctx?: MsCtx | null }> = ({ t, ctx }) => {
  const b = msItem("stamp").beats, ex = exitK(t, b.out, b.leave);
  const a = stampAnchor(ctx);
  // SLAMMED IN 4 f: the scrap lands large and squashes to rest (kit slap) while the nib writes the two characters fast
  // (2 f each); the swashes and the flicked ink follow; THE JOLT when the chair hits the lens (kit shake, one event)
  const sl = slap(t, b.slam, 1.45), jo = shake(t, b.jolt, 7, 16, 11), rotKick = t >= b.jolt && t < b.jolt + 5 ? 3 * (1 - (t - b.jolt) / 5) * (t % 2 ? -1 : 1) : 0;
  const o = { rots: ST.rots, lifts: ST.lifts, scales: ST.scales, track: ST.track, seed: 6 };
  const sink = ex.ink > 0 ? `url(#${PS}-sink)` : undefined;
  const swK = writeK(t, b.slam + 3, 3), splK = clamp01((t - b.slam - 1) / 2);
  const tr = `translate(${(a.x - ST.ax + jo.x).toFixed(1)} ${(a.y - ST.ay + jo.y).toFixed(1)}) ${about(ST.ax, ST.ay, sl || 1, rotKick)}`;
  return (
    <Sheet id={PS}>
      <defs>{msDefs(PS)}{nibFilter(`${PS}-nib`, MS.crimson, MS.edgeCrimson, ST.S, 6)}{sinkDef(`${PS}-sink`, ex.ink)}</defs>
      <g transform={tr}>
        <g opacity={ex.paper} filter={`url(#${PS}-sh)`}><g filter={`url(#${PS}-torn2)`}>{quillOutline(`${PS}-scrap`, "拒收", ST.x, ST.y, ST.S, MS.slip, 30, o)}</g></g>
        <g filter={sink}>
          {quill(`${PS}-w`, "拒收", ST.x, ST.y, ST.S, `${PS}-nib`, { ...o, write: { t, at: b.slam, per: 2, pool: 1 } })}
          {swash(`${PS}-s1`, 632, 1268, 900, 1272, 10, 12, `url(#${PS}-inkR)`, { blot: false, k: swK })}
          {swash(`${PS}-s2`, 656, 1294, 884, 1298, 8, 8, `url(#${PS}-inkR)`, { k: writeK(t, b.slam + 4, 3) })}
          {splK > 0 ? <g fill="#000" filter={`url(#${PS}-inkR)`}>{SPLAT.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={(r * (0.4 + 0.6 * splK)).toFixed(1)} />)}</g> : null}
        </g>
      </g>
    </Sheet>
  );
};

// ---------------------------------------------------------------------------------------------------- row 9 午饭进度
const PL = "newton-ms-fx-lunch";
/** the approved bar (swatch_A: paper(40, 30, 420, 76, 0.8)) in its own frame, drawn at 0.9 (about 380 x 68, the plan) */
const LB = { w: 420, h: 76, rot: 0.8, s: 0.9 };
/** where the bar's bottom middle may go so the whole bar (laid a touch large, the number's kick) stays inside the
 *  item's box (when.ts msItem("lunch").box): half its width + 13, its height + 3 above, 3 below */
const lbBox = () => {
  const B = msItem("lunch").box[0], hw = (LB.w * LB.s) / 2 + 13, h = LB.h * LB.s + 3;
  return { x0: B.x0 + hw, x1: Math.max(B.x0 + hw, B.x1 - hw), y0: B.y0 + h, y1: Math.max(B.y0 + h, B.y1 - 3) };
};
export const lunchAnchor = (ctx: MsCtx | null | undefined) => {
  const far = ctx?.props?.plate?.far, R = lbBox();
  // the bar's bottom middle: 12 px above the plate's far rim, clamped into the box (no plate: the box's bottom middle)
  return far && far.front ? { x: clamp(far.x, R.x0, R.x1), y: clamp(far.y - 12, R.y0, R.y1) } : { x: (R.x0 + R.x1) / 2, y: R.y1 };
};
/** the fill's width in px for a percentage (the bar's four boxes are 172 px of track; a percent is drawn a little
 *  wider than true so 1 -> 2 still reads at phone size) */
const fillW = (pct: number) => 2.5 * pct;
/** the number: its digit ends here and the % starts here (FrSans bold, as swatch_A draws 2%: about 0.57 em a digit);
 *  the % ends about 414, inside the slip's torn right edge */
const NUM_SPLIT = 357 + 23;
const Lunch: React.FC<{ t: number; ctx?: MsCtx | null }> = ({ t, ctx }) => {
  const b = msItem("lunch").beats, ex = exitK(t, b.out, b.leave);
  const bm = lunchAnchor(ctx);
  const sw = LB.w * LB.s, sh = LB.h * LB.s, ox = bm.x - sw / 2, oy = bm.y - sh;
  const lay = layK(t, 0), sink = ex.ink > 0 ? `url(#${PL}-sink)` : undefined;
  // 1 % from the start; ON THE TICK (the second fork clink) the fill grows to 2 % in 2 f, the 1 sinks and the 2 is
  // written in its place, and the number gives a small kick
  const tk = clamp01((t - b.tick + 1) / 2), pct = 1 + tk, one = clamp01((t - b.tick) / 3), two = writeK(t, b.tick, 3);
  const kick = t >= b.tick ? 1 + 0.14 * (1 - clamp01((t - b.tick) / 4)) : 1;
  const numK = writeK(t, 5, 3);
  const cx = LB.w / 2, cy = LB.h / 2;
  return (
    <Sheet id={PL}>
      <defs>{msDefs(PL)}{sinkDef(`${PL}-sink`, ex.ink)}{sinkFilter(`${PL}-sink1`, Math.min(0.999, one))}</defs>
      <g transform={`translate(${ox.toFixed(1)} ${oy.toFixed(1)}) scale(${LB.s})`}>
        <g transform={about(cx, cy, lay.s)} opacity={lay.o}>
          {leaf(PL, `${PL}-slip`, 0, 0, LB.w, LB.h, LB.rot, { fill: MS.slip, small: true, fox: false, opacity: ex.paper })}
          <g transform={`rotate(${LB.rot} ${cx} ${cy})`} filter={sink}>
            {inkText(`${PL}-say`, "午饭进度", 20, 54, 34, `${PL}-inkA`, { w: 4 * 34, write: { t, at: 1, per: MOTION.rowChar } })}
            {[0, 1, 2, 3].map((k) => {
              const kk = writeK(t, 2 + k, 3);
              return kk > 0 ? <rect key={k} x={172 + k * 46} y={22} width={38} height={36} fill="none" stroke="#000" strokeWidth={3} filter={`url(#${PL}-inkAsm)`} pathLength={1} strokeDasharray="1 1.02" strokeDashoffset={(1 - kk).toFixed(3)} /> : null;
            })}
            {/* THE RUBRIC MARK: the crimson fill (1 %, then 2 %) and the number */}
            {numK > 0 ? <rect x={174} y={24 + 32 * (1 - numK)} width={fillW(pct).toFixed(2)} height={(32 * numK).toFixed(1)} fill="#000" filter={`url(#${PL}-inkR)`} /> : null}
            {numK > 0 ? (
              <g transform={about(385, 42, kick)}>
                <defs><clipPath id={`${PL}-nk`}><rect x={353} y={8} width={(70 * numK).toFixed(1)} height={62} /></clipPath><clipPath id={`${PL}-tk`}><rect x={353} y={8} width={(NUM_SPLIT - 353 + 2) * two} height={62} /></clipPath></defs>
                <g clipPath={numK < 1 ? `url(#${PL}-nk)` : undefined}>
                  {one < 1 ? <g filter={one > 0 ? `url(#${PL}-sink1)` : undefined}>{inkText(`${PL}-n1`, "1", NUM_SPLIT, 57, 40, `${PL}-inkR`, { anchor: "end", w: 23 })}</g> : null}
                  {two > 0 ? <g clipPath={two < 1 ? `url(#${PL}-tk)` : undefined}>{inkText(`${PL}-n2`, "2", NUM_SPLIT, 57, 40, `${PL}-inkR`, { anchor: "end", w: 23 })}</g> : null}
                  {inkText(`${PL}-pc`, "%", NUM_SPLIT, 57, 40, `${PL}-inkR`, { w: 34 })}
                </g>
              </g>
            ) : null}
          </g>
        </g>
      </g>
    </Sheet>
  );
};

// ---------------------------------------------------------------------------------------------------- the layer
const FX = MS_ITEMS.filter((i) => i.layer === "fx" || i.id === "banner").map((i) => i.id);
export const MsFx: React.FC<{ f: number; ctx?: MsCtx | null }> = ({ f, ctx }) => {
  if (!FX.some((id) => msOn(id, f))) return null;
  const tf = msT("flick", f), ts = msT("stamp", f), tl = msT("lunch", f);
  return (
    <>
      <MsBanner f={f} ctx={ctx} />
      {tf !== null ? <Flick t={tf} ctx={ctx} /> : null}
      <MsMeter f={f} ctx={ctx} />
      {ts !== null ? <Stamp t={ts} ctx={ctx} /> : null}
      {tl !== null ? <Lunch t={tl} ctx={ctx} /> : null}
    </>
  );
};
