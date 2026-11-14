// hud/ms/title.tsx: SKIN A's THEMED TITLE 「采访牛顿的一天」 (row 1 of EFFECTS_PLAN; stage 2a). A leaf torn from his draft
// is blown flat onto the door by the slam's draught: a compass draws a comet's orbit round a sun-dot, 牛 then 顿 are
// written in wet crimson by an unseen broad nib (the pools swell as each stroke stops), 采访 and 的一天 small in
// iron-gall ink; it holds while the ink dries; the ink sinks into the paper and the empty leaf is sucked under the door
// after him. Mounted by Film.tsx ABOVE the vlog HUD and the shot's overlays, BELOW the whisper bubble, the subtitle and
// the phone mask.
//
// THE CONTRACT
//   <MsTitle f ctx />   f = the film frame; ctx = hud/ms/screen.ts MsCtx (null on frames where no item draws)
//   When: msT("title", f) and msItem("title").beats (local frames, t 0 = the slam's audible thud, A02's end + 0.37 + 0.27 s,
//         the frame segA's SND.thud shuts the door on; BEAT.A.doorShut is the clip's latch tick 7 frames earlier, while
//         the door still swings with his face in the doorway: director r1 note 4): slap 0 (the leaf
//         lands in MOTION.slap frames), orbit 2 (7 f), name 3 (牛 then 顿, MOTION.char a character, pools MOTION.pool
//         after each stroke), small 12 (采访, then 的一天 3 f later), hold 18 (the ink dries), sink (the ink sinks over
//         5 f), under (the empty leaf sucked under the door, 4 f; gone on the last frame). In 18, out 8. On today's voice
//         track the title is 50 frames (f184-233, the plan's fallback: fully written for 0.8 s, gone the frame before
//         A03's whisper bubble); when.ts makes it 56 whenever that still ends before the bubble, and every beat here
//         follows the item's own numbers.
//   Where: DRAWN IN THE APPROVED LAYOUT (looks/frames/A_title.png, skin_a.py title(): the leaf 780 x 580 at 130, 330,
//         turned -3 deg; inside msItem("title").box[0], x 110-930, y 300-940) and then PUT ON HIS DOOR (ctx.door, the
//         door leaf's face on screen): a similarity follows the shut door's place, size and roll on screen (the slam's
//         jolt shakes it with the door: the approved layout lands exactly on the settled hold, REF_DOOR). The title
//         starts on the thud, the frame the door is shut, so it never lies over his face in the doorway; should the door
//         still be open on a frame (a rebuilt scene), the door's own perspective takes the leaf in with it (a homography
//         from the shut face to the swinging one), so the leaf rides the door leaf. Without ctx.door (another set, a
//         forced still elsewhere) it is drawn in the approved layout as it is.
//   Words: only 采访 / 牛顿 / 的一天 (牛顿 largest, crimson with an iron-gall rim; the other two small, iron-gall); the
//         compass orbit round a sun-dot is the skin's wordless mark. No date, no place.
//   Ids: every id starts with "newton-ms-title". No blend modes and no backdrop filters (the cut composites the overlays
//         separately). A pure function of (f, ctx): no hooks, no state, hash01 only.
import React from "react";
import { clamp01, easeIn, easeOut, smooth } from "../../../../kit/overlay";
import { MS, MOTION } from "./skin";
import { msDefs, nibFilter, sinkFilter, quill, leaf, ellipseArc, ellipsePt, ellipseLen, drawOn, writeK } from "./marks";
import { msItem, msT } from "./when";
import type { MsCtx, MsPt } from "./screen";

const P = "newton-ms-title";

// ---------------------------------------------------------------------------------------------------- the layout
// the approved frame's numbers (skin_a.py title()), film px on the settled shut door
const LEAF = { x: 130, y: 330, w: 780, h: 580, rot: -3 };
const LC = { x: LEAF.x + LEAF.w / 2, y: LEAF.y + LEAF.h / 2 };
/** the comet's orbit (sepia, by compass) and its sun-dot at the left focus; the comet at -40 deg */
const ORB = { cx: 530, cy: 606, rx: 360, ry: 160, rot: -9, a0: -40 };
const ORB_LEN = ellipseLen(ORB.rx, ORB.ry, ORB.a0, ORB.a0 + 360, 140);
const FOC = (() => { const c = Math.sqrt(ORB.rx ** 2 - ORB.ry ** 2), a = (ORB.rot * Math.PI) / 180; return { x: ORB.cx - c * Math.cos(a), y: ORB.cy - c * Math.sin(a) }; })();
const COMET = ellipsePt(ORB.cx, ORB.cy, ORB.rx, ORB.ry, ORB.rot, ORB.a0);
const W_CAI = { x: 186, y: 462, S: 76, o: { rots: [-5, -2], lifts: [0, 5], scales: [1.0, 0.96], track: 4, seed: 1, core: MS.edgeInk } };
const W_NAME = { x: 236, y: 742, S: 270, o: { rots: [-4, 5], lifts: [0, 12], scales: [1.0, 0.97], track: -14, seed: 2 } };
const W_DAY = { x: 598, y: 852, S: 72, o: { rots: [3, -2, 4], lifts: [0, 4, -2], scales: [1.0, 0.94, 1.02], track: 2, seed: 3, core: MS.edgeInk } };

// ---------------------------------------------------------------------------------------------------- on the door
type M3 = number[];   // a 3 x 3 homography, row major
const UNIT: MsPt[] = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }];
/** the homography taking the 4 points `a` to the 4 points `b` (a plain 8 x 8 solve) */
const homog = (a: MsPt[], b: MsPt[]): M3 => {
  const A: number[][] = [];
  for (let i = 0; i < 4; i++) {
    const { x, y } = a[i], X = b[i].x, Y = b[i].y;
    A.push([x, y, 1, 0, 0, 0, -X * x, -X * y, X]);
    A.push([0, 0, 0, x, y, 1, -Y * x, -Y * y, Y]);
  }
  for (let c = 0; c < 8; c++) {
    let p = c;
    for (let r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    [A[c], A[p]] = [A[p], A[c]];
    const d = A[c][c] || 1e-12;
    for (let r = 0; r < 8; r++) if (r !== c) { const k = A[r][c] / d; for (let j = c; j < 9; j++) A[r][j] -= k * A[c][j]; }
  }
  return [...Array.from({ length: 8 }, (_, i) => A[i][8] / (A[i][i] || 1e-12)), 1];
};
const apply = (H: M3, p: MsPt): MsPt => { const w = H[6] * p.x + H[7] * p.y + H[8]; return { x: (H[0] * p.x + H[1] * p.y + H[2]) / w, y: (H[3] * p.x + H[4] * p.y + H[5]) / w }; };
const mul = (A: M3, B: M3): M3 => Array.from({ length: 9 }, (_, i) => { const r = Math.floor(i / 3), c = i % 3; return A[r * 3] * B[c] + A[r * 3 + 1] * B[3 + c] + A[r * 3 + 2] * B[6 + c]; });
const inv = (m: M3): M3 => {
  const [a, b, c, d, e, f, g, h, i] = m, A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g, det = a * A + b * B + c * C || 1e-12;
  return [A / det, -(b * i - c * h) / det, (b * f - c * e) / det, B / det, (a * i - c * g) / det, -(a * f - c * d) / det, C / det, -(a * h - b * g) / det, (a * e - b * d) / det];
};
/** THE REFERENCE: his shut door's face on screen on the settled hold of the title (segA f205 on the voice track of
 *  14 Nov, after the slam's jolt; probed headless with screen.ts msDoor), where the approved layout lands exactly */
const REF_DOOR: MsPt[] = [{ x: 210, y: 1508 }, { x: 882, y: 1528 }, { x: 1144, y: -519 }, { x: -37, y: -503 }];
const H_REF = homog(UNIT, REF_DOOR);
/** the leaf's centre on the door (the face's own 0..1 coordinates) and its local axes on the reference */
const ANCHOR = apply(inv(H_REF), LC);
const axes = (H: M3) => {
  const a = apply(H, ANCHOR), u = apply(H, { x: ANCHOR.x + 0.05, y: ANCHOR.y }), v = apply(H, { x: ANCHOR.x, y: ANCHOR.y + 0.05 });
  return { a, su: Math.hypot(u.x - a.x, u.y - a.y), sv: Math.hypot(v.x - a.x, v.y - a.y), ang: Math.atan2(v.y - a.y, v.x - a.x) };
};
const REF_AX = axes(H_REF);
/** the door's bottom edge in the layout's px (where the empty leaf goes under), a line through the reference corners */
const doorBottomY = (x: number) => REF_DOOR[0].y + ((x - REF_DOOR[0].x) * (REF_DOOR[1].y - REF_DOOR[0].y)) / (REF_DOOR[1].x - REF_DOOR[0].x);

/** where the layout goes on this frame: the screen = M (layout px), as a CSS transform (null = as drawn) */
const onDoor = (ctx: MsCtx | null | undefined): string | null => {
  const D = ctx?.door;
  if (!D) return null;
  const Hs = homog(UNIT, D.shut), ax = axes(Hs);
  const s = Math.sqrt((ax.su * ax.sv) / (REF_AX.su * REF_AX.sv)), r = ax.ang - REF_AX.ang, c = s * Math.cos(r), sn = s * Math.sin(r);
  // the similarity: the leaf's centre onto the door's anchor, scaled and turned with the door's face
  let M: M3 = [c, -sn, ax.a.x - (c * LC.x - sn * LC.y), sn, c, ax.a.y - (sn * LC.x + c * LC.y), 0, 0, 1];
  // the swing: from the shut face to where the face is now (identity once it is shut)
  if (D.open > 1e-3) M = mul(homog(D.shut, D.now), M);
  const k = M[8];
  M = M.map((v) => v / k);
  const flat = Math.abs(M[6]) < 1e-7 && Math.abs(M[7]) < 1e-7;
  const n = (v: number) => (Math.abs(v) < 1e-9 ? "0" : v.toPrecision(9));
  if (flat) return `matrix(${n(M[0])}, ${n(M[3])}, ${n(M[1])}, ${n(M[4])}, ${n(M[2])}, ${n(M[5])})`;
  return `matrix3d(${n(M[0])}, ${n(M[3])}, 0, ${n(M[6])}, ${n(M[1])}, ${n(M[4])}, 0, ${n(M[7])}, 0, 0, 1, 0, ${n(M[2])}, ${n(M[5])}, 0, ${n(M[8])})`;
};

// ---------------------------------------------------------------------------------------------------- the title
export const MsTitle: React.FC<{ f: number; ctx?: MsCtx | null }> = ({ f, ctx }) => {
  const t = msT("title", f);
  if (t === null) return null;
  const b = msItem("title").beats, len = msItem("title").to - msItem("title").from + 1;
  // THE SLAP: the leaf comes in from above left, accelerating onto the door, and lies flat in MOTION.slap frames
  const slapK = easeIn(writeK(t, b.slap, MOTION.slap), 2);
  const lift = 1 - slapK;
  const slapTr = `translate(${(-90 * lift).toFixed(1)} ${(-130 * lift).toFixed(1)}) rotate(${(-7 * lift).toFixed(2)} ${LC.x} ${LC.y}) translate(${LC.x} ${LC.y}) scale(${(1 + 0.12 * lift).toFixed(3)}) translate(${-LC.x} ${-LC.y})`;
  // the empty leaf SUCKED UNDER THE DOOR after him (its top passes the door's bottom edge on the last frame), drawn in
  // a little as it goes (it is pulled into the gap; this also keeps its corner left of x 930 below y 950)
  const underK = writeK(t, b.under, len - b.under);
  const dropY = (doorBottomY(LC.x) + 20 - (LEAF.y - 12)) * easeIn(underK, 2);
  if (underK >= 1) return null;
  // the compass: the sun-dot pricked as the orbit starts, the orbit swept round it in 7 f, the comet at its end
  const orbK = easeOut(writeK(t, b.orbit, 7), 1.6), prick = writeK(t, b.orbit, 2);
  // the ink dries over the hold (iron-gall darkens as it dries: the pooled cores deepen a little, the wet look goes)
  const wet = 1 - smooth((t - b.hold) / (MOTION.dry * 0.66));
  // the ink SINKS into the paper (to sepia, then the paper takes it in patches)
  const sinkK = writeK(t, b.sink, Math.max(1, b.under - b.sink + 1));
  const tr = onDoor(ctx);
  const nameOpts = { ...W_NAME.o, coreOp: 0.42 + 0.2 * wet, write: { t, at: b.name, per: MOTION.char, pool: MOTION.pool } };
  const caiOpts = { ...W_CAI.o, coreOp: 0.3 + 0.12 * (1 - wet), write: { t, at: b.small, per: 2, pool: MOTION.pool } };
  const dayOpts = { ...W_DAY.o, coreOp: 0.3 + 0.12 * (1 - wet), write: { t, at: b.small + 2, per: 1.4, pool: MOTION.pool } };
  const ink = sinkK < 1 ? (
    <g filter={sinkK > 0 ? `url(#${P}-sink)` : undefined}>
      {orbK > 0 ? <path d={ellipseArc(ORB.cx, ORB.cy, ORB.rx, ORB.ry, ORB.rot, ORB.a0, ORB.a0 + 360, 140)} stroke="#000" strokeWidth={4} fill="none" strokeLinecap="round" filter={`url(#${P}-inkS)`} {...drawOn(ORB_LEN, orbK)} /> : null}
      {prick > 0 ? (
        <g filter={`url(#${P}-inkS)`}>
          <circle cx={FOC.x.toFixed(1)} cy={FOC.y.toFixed(1)} r={10} fill="#000" />
          <circle cx={FOC.x.toFixed(1)} cy={FOC.y.toFixed(1)} r={(20 + 10 * (1 - prick)).toFixed(1)} fill="none" stroke="#000" strokeWidth={2} />
        </g>
      ) : null}
      {orbK >= 1 ? <circle cx={COMET.x.toFixed(1)} cy={COMET.y.toFixed(1)} r={9} fill="#000" filter={`url(#${P}-inkS)`} /> : null}
      {quill(`${P}-cai`, "采访", W_CAI.x, W_CAI.y, W_CAI.S, `${P}-nibA`, caiOpts)}
      {quill(`${P}-name`, "牛顿", W_NAME.x, W_NAME.y, W_NAME.S, `${P}-nibR`, nameOpts)}
      {quill(`${P}-day`, "的一天", W_DAY.x, W_DAY.y, W_DAY.S, `${P}-nibA`, dayOpts)}
    </g>
  ) : null;
  return (
    <div id={P} style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1800, transformOrigin: "0 0", transform: tr ?? undefined }}>
      <svg width={1080} height={1800} viewBox="0 0 1080 1800" style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <defs>
          {msDefs(P)}
          {nibFilter(`${P}-nibR`, MS.crimson, MS.edgeCrimson, W_NAME.S, 5)}
          {nibFilter(`${P}-nibA`, MS.ink, MS.edgeInk, W_CAI.S, 9, 0.18)}
          {sinkK > 0 ? sinkFilter(`${P}-sink`, Math.min(0.999, sinkK)) : null}
          <clipPath id={`${P}-door`}>
            <path d={`M-200,-400 L1280,-400 L1280,${doorBottomY(1280).toFixed(1)} L-200,${doorBottomY(-200).toFixed(1)} Z`} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${P}-door)`}>
          <g transform={`translate(${LC.x} ${(LC.y + dropY).toFixed(1)}) scale(${(1 - 0.07 * underK).toFixed(3)} 1) translate(${-LC.x} ${-LC.y})`}>
            <g transform={slapTr}>
              {leaf(P, `${P}-leaf`, LEAF.x, LEAF.y, LEAF.w, LEAF.h, LEAF.rot, {}, ink)}
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
};
