// hud/ms/meter.tsx: SKIN A's LAUGH METER (EFFECTS_PLAN rows 5, 6, 8, 10; stage 2b): a slip of his paper in the slot top
// right under the battery (skin.ts METER: x 754-1024, y 154-292), with 笑 inside the dashed pencil guide of a circle his
// compass has not drawn yet, the count 0/1, and one CRIMSON CROSS per failed try (the meter's rubric mark). THE COUNT is
// set in the body hand (FrSans bold through the iron-gall ink filter), as the approved frames draw it (A_fx.png,
// swatch_A.png: upright bold numerals; the generator's italic face never loaded, so what Jay picked is FrSans), not in
// glyphs.ts SERIF; the card draws its 0/1 the same way. It is on screen only at its four moments, each written on and
// each leaving by sinking into the paper:
//   meter0  row 5   born from the card's target line (card.tsx flies it onto METER.circle / METER.count over its t 67-74
//                   and lays the slip there): the meter takes over on the next frame with the slip and the bold 0/1 at
//                   rest, exactly as the card landed them (no re-ink: director r1 note 7), so the hand-off has no pop;
//                   the three try-dots are written; held about 0.8 s
//   tick1   row 6   after B09 「没笑。」: the first crimson cross written in 0.2 s (beats.cross, crossLen)
//   tick2   row 8   after D05 「他没笑，我笑了。」: the second cross, then the note 我笑的不算 (crimson) on a slip under it;
//                   a screen element: it does not jolt with clap 1
//   meter1  row 10  after G02's laugh: the compass closes the circle in one sweep (from the tick dot, clockwise), 0
//                   becomes 1 (1/1), and 证毕 is written in crimson under it (quill on a paper scrap, a swash); gone
//                   before the sack's thump. If his head is in the slot on that hold, the whole piece goes low left
//                   (x 72-306, y 1070-1290: the plan's other place, when.ts meter1's second box), at 0.8 its size.
// Look: looks/frames/A_fx.png (the slip), swatch_A.png (tick 2 + note, 1/1 + 证毕); looks/src/skin_a.py meter_slip,
// sheet.py swatch_a. Ids: newton-ms-meter*. A pure function of (f, ctx).
import React from "react";
import { clamp01, easeOut } from "../../../../kit/overlay";
import { MS, METER, MOTION } from "./skin";
import { msDefs, nibFilter, quill, quillOutline, quillLayout, inkText, leaf, swash, xMark, ellipseArc, ellipseLen, drawOn, writeK, sinkFilter } from "./marks";
import { msItem, msT, type MsId } from "./when";
import { Sheet, layK, about, exitK, sinkDef, hits, headBox } from "./fxkit";
import { msFig, type MsCtx } from "./screen";

const P = "newton-ms-meter";
const S = METER.slip, C = METER.circle, N = METER.count, T = METER.tries, NOTE = METER.note;
const SCX = S.x + S.w / 2, SCY = S.y + S.h / 2;
/** the count's digit ends at SPLIT and "/1" starts there (FrSans digits are about 0.57 em) */
const DIGIT = 0.57 * N.px, SPLIT = N.x + DIGIT;
/** the slot (when.ts SLOT) and the plan's other place for the 1/1 */
const SLOT = { x0: 752, y0: 155, x1: 1026, y1: 300 };
const LOW_LEFT = { x: 80, y: 1078, s: 0.8 };
/** 证毕: written with the broad nib in crimson under the slip (swatch_A: under it, a little right, a swash below) */
const QED = { x: 806, y: 378, S: 76, rots: [-7, 3], lifts: [0, 6] };
const qedW = quillLayout("证毕", QED.S, { rots: QED.rots, lifts: QED.lifts }).width;

type Showing = {
  t: number;
  /** crosses already there */ crosses: number;
  /** try slots on the slip (3 before the laugh, 2 at the laugh: skin_a.py meter_slip) */ slots: number;
  /** a cross written now: at, frames */ cross?: [number, number];
  /** the try-dots written on (the meter's birth): at */ dots?: number;
  /** the compass closes the circle: at, frames */ close?: [number, number];
  /** THE HAND-OFF (meter0): the slip and its 0/1 are already down (the card laid them on METER at its t 74), so no
   *  lay */ landed?: boolean;
};

/** THE SLIP'S INK at local frame t (in the slip's own frame; the caller turns it with the slip) */
const slipInk = (o: Showing) => {
  const { t } = o, kids: React.ReactNode[] = [];
  const closeK = o.close ? easeOut(writeK(t, o.close[0], o.close[1]), 1.6) : 0;
  // the pencil guide of the circle not yet drawn; then the compass's ink circle swept over it from the tick dot
  kids.push(<circle key="guide" cx={C.cx} cy={C.cy} r={C.r} fill="none" stroke="#000" strokeWidth={3} strokeDasharray="7 7" filter={`url(#${P}-inkS)`} opacity={1 - 0.6 * closeK} />);
  if (closeK > 0) {
    const L = ellipseLen(C.r, C.r, -90, 270, 72);
    kids.push(<path key="ring" d={ellipseArc(C.cx, C.cy, C.r, C.r, 0, -90, 270, 72)} fill="none" stroke="#000" strokeWidth={5} strokeLinecap="round" filter={`url(#${P}-inkA)`} {...drawOn(L, closeK)} />);
  }
  kids.push(<circle key="dot" cx={C.cx} cy={C.cy - C.r} r={5} fill="#000" filter={`url(#${P}-inkA)`} />);
  kids.push(inkText(`${P}-xiao`, "笑", C.cx, C.cy + 16, C.px, `${P}-inkA`, { anchor: "middle", w: C.px }));
  // the count: the digit (0, or 0 sinking and 1 written as the circle closes) ending at SPLIT, then "/1" from it
  if (o.close) {
    const z = clamp01((t - o.close[0] - 2) / 3), one = writeK(t, o.close[0] + 3, 3);
    if (z < 1) kids.push(<g key="z0" filter={z > 0 ? `url(#${P}-sink0)` : undefined}>{inkText(`${P}-c0`, "0", SPLIT, N.y, N.px, `${P}-inkA`, { anchor: "end", w: DIGIT })}</g>);
    if (one > 0) {
      kids.push(
        <g key="z1">
          <defs><clipPath id={`${P}-c1k`}><rect x={SPLIT - DIGIT - 10} y={N.y - N.px} width={DIGIT + 20} height={N.px * 1.2 * one} /></clipPath></defs>
          <g clipPath={one < 1 ? `url(#${P}-c1k)` : undefined}>{inkText(`${P}-c1`, "1", SPLIT, N.y, N.px, `${P}-inkA`, { anchor: "end", w: DIGIT })}</g>
        </g>,
      );
    }
  } else kids.push(inkText(`${P}-c0`, "0", SPLIT, N.y, N.px, `${P}-inkA`, { anchor: "end", w: DIGIT }));
  kids.push(inkText(`${P}-cs`, "/1", SPLIT, N.y, N.px, `${P}-inkA`, { w: 2 * DIGIT }));
  // the tries: crimson crosses, then sepia dots for the tries left
  for (let k = 0; k < o.slots; k++) {
    const x = T.x + k * T.step;
    if (k < o.crosses) kids.push(xMark(`${P}-x${k}`, x, T.y, T.s, `url(#${P}-inkR)`, 1));
    else if (k === o.crosses && o.cross) kids.push(xMark(`${P}-x${k}`, x, T.y, T.s, `url(#${P}-inkR)`, writeK(t, o.cross[0], o.cross[1])));
    else if (o.dots === undefined || t >= o.dots + k) kids.push(<circle key={`d${k}`} cx={x} cy={T.y} r={3} fill="#000" filter={`url(#${P}-inkS)`} />);
  }
  return kids;
};

/** the slip with its ink: laid down at t 0 (already down at the hand-off), leaving by sinking over the item's last frames */
const slip = (o: Showing, ex: { ink: number; paper: number }) => {
  const lay = o.landed ? { s: 1, o: 1 } : layK(o.t, 0);
  return (
    <g key="slip" transform={about(SCX, SCY, lay.s)} opacity={lay.o}>
      {leaf(P, `${P}-leaf`, S.x, S.y, S.w, S.h, S.rot, { fill: MS.slip, small: true, fox: false, opacity: ex.paper })}
      <g transform={`rotate(${S.rot} ${SCX} ${SCY})`} filter={ex.ink > 0 ? `url(#${P}-sink)` : undefined}>{slipInk(o)}</g>
    </g>
  );
};

/** tick 2's note under the slip: 我笑的不算 in crimson on its own small slip, laid at `at` and written row-wise */
const note = (t: number, at: number, ex: { ink: number; paper: number }) => {
  if (t < at) return null;
  const lay = layK(t, at), cx = NOTE.x + NOTE.w / 2, cy = NOTE.y + NOTE.h / 2, rot = -2;
  return (
    <g key="note" transform={about(cx, cy, lay.s)} opacity={lay.o}>
      {leaf(P, `${P}-nleaf`, NOTE.x, NOTE.y, NOTE.w, NOTE.h, rot, { fill: MS.slip, small: true, fox: false, opacity: ex.paper })}
      <g transform={`rotate(${rot} ${cx} ${cy})`} filter={ex.ink > 0 ? `url(#${P}-sink)` : undefined}>
        {inkText(`${P}-note`, "我笑的不算", cx, NOTE.y + NOTE.h - 13, NOTE.px, `${P}-inkR`, { anchor: "middle", w: 5 * NOTE.px, write: { t, at: at + 1, per: MOTION.rowChar } })}
      </g>
    </g>
  );
};

/** 证毕 written in crimson with the broad nib on a scrap cut round it, a swash under it (swatch_A) */
const qed = (t: number, at: number, ex: { ink: number; paper: number }) => {
  if (t < at) return null;
  const per = 3, o = { rots: QED.rots, lifts: QED.lifts, seed: 12 };
  const scrap = clamp01((t - at + 1) / 2);
  const sw = writeK(t, at + 2 * per, 3);
  return (
    <g key="qed">
      <g opacity={scrap * ex.paper} filter={`url(#${P}-shs)`}><g filter={`url(#${P}-torn2)`}>{quillOutline(`${P}-qo`, "证毕", QED.x, QED.y, QED.S, MS.slip, 24, o)}</g></g>
      <g filter={ex.ink > 0 ? `url(#${P}-sink)` : undefined}>
        {quill(`${P}-q`, "证毕", QED.x, QED.y, QED.S, `${P}-nibQ`, { ...o, write: { t, at, per } })}
        {swash(`${P}-qs`, QED.x - 4, QED.y + 28, QED.x + qedW + 6, QED.y + 22, 6, 8, `url(#${P}-inkR)`, { k: sw })}
      </g>
    </g>
  );
};

const SHOW: MsId[] = ["meter0", "tick1", "tick2", "meter1"];
/** THE METER on film frame f (null when none of its four showings is on) */
export const MsMeter: React.FC<{ f: number; ctx?: MsCtx | null }> = ({ f, ctx }) => {
  const id = SHOW.find((i) => msT(i, f) !== null);
  if (!id) return null;
  const t = msT(id, f)!, it = msItem(id), b = it.beats, ex = exitK(t, b.out, b.leave);
  let body: React.ReactNode[] = [], place = "";
  if (id === "meter0") body = [slip({ t, crosses: 0, slots: 3, dots: 1, landed: true }, ex)];
  if (id === "tick1") body = [slip({ t, crosses: 0, slots: 3, cross: [b.cross, b.crossLen] }, ex)];
  if (id === "tick2") body = [note(t, b.note, ex), slip({ t, crosses: 1, slots: 3, cross: [b.cross, b.crossLen] }, ex)];
  if (id === "meter1") {
    body = [slip({ t, crosses: 2, slots: 2, close: [b.close, b.closeLen] }, ex), qed(t, b.qed, ex)];
    // the plan's other place when his head is in the slot on this hold
    const nt = ctx ? msFig(ctx, "newton") : null;
    if (nt && hits(headBox(nt), SLOT)) place = `translate(${LOW_LEFT.x} ${LOW_LEFT.y}) scale(${LOW_LEFT.s}) translate(${-S.x} ${-S.y})`;
  }
  return (
    <Sheet id={`${P}-${id}`}>
      <defs>
        {msDefs(P)}
        {nibFilter(`${P}-nibQ`, MS.crimson, MS.edgeCrimson, QED.S, 12)}
        {sinkDef(`${P}-sink`, ex.ink)}
        {id === "meter1" ? sinkFilter(`${P}-sink0`, clamp01((t - b.close - 2) / 3)) : null}
      </defs>
      <g transform={place || undefined}>{body}</g>
    </Sheet>
  );
};
