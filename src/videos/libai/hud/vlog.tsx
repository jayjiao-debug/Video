// hud/vlog.tsx: THE VLOG UI of the Qin film (PLAN.md section 5; WP4). A pure function of the frame (no state, nothing
// random), drawn by Film.tsx in its HUD layer above the 3D picture, unless the frame's Pose says hud: false.
//   <VlogHud f rec? cards? />
//     REC     a red dot that blinks at 1 Hz (soft 3-frame edges, never fully off: no hard flash) + "REC", top left on
//             the y 230 row (layout.ts SCREEN.rec). Also in the museum (her lens again); gone where a Pose says rec:
//             false. HER CAMERA SWITCHES OFF on BEAT.G.offClick: the lamp goes out (a dead dark-red glass, no glow),
//             "REC" greys, and the whole HUD holds still from that frame (nothing blinks or breathes) until the picture
//             collapses over it (segG's overlay) and black hides it.
//     时辰    the scene's timestamp (story.ts SCENE_TIME: 卯时 05:00 ... 公元前210年 七月 沙丘): on each scene's first frame
//             (and again on 第二天, BEAT.D.nextDay) it SLIDES IN big under REC with a gold underline, holds 1.4 s, then
//             shrinks into its small place under REC (left x 62, centre y 288, 34 px), where it stays. Frame 0 starts
//             big and settled (the hook's first frame is complete). The 时辰 word in gold, the rest cream.
//             cards: false skips the big intro (only the small stamp); rec: false hides it with the dot. Not in the
//             museum (it is today there: the scene's 沙丘 stamp would be wrong).
//     battery top right (SCREEN.battery): drains 100 % (frame 0) -> 8 % (scene G's first frame), green > 35 %, amber
//             > 15 %, red below; on the last day (scene G) the red fill breathes at 1 Hz (soft, never off), also in the
//             museum while REC shows; still where rec: false and from the off click.
//   batteryAt(f), timeStampAt(f), recAlpha(f): the numbers behind it (for a shot that wants to match them).
import React from "react";
import { AbsoluteFill } from "remotion";
import { SCENE_TIME, SEGMENTS, clamp01, easeInOutCubic, easeOutCubic, seg, segmentAt, type SceneId } from "../story";
import { BEAT } from "../beats";
import { SCREEN } from "../layout";
import { EN, TXT } from "../lang";
import { HC, inked, type Rect } from "./style";

// ---------------------------------------------------------------------------------------------------- numbers
/** the battery's charge on frame f: 100 % on frame 0, a steady drain to 8 % on scene G's first frame, 8 % after */
export const batteryAt = (f: number) => Math.round(100 - 92 * clamp01(f / seg("F").from));
/** the REC dot's opacity on frame f: on for half a second, off for half a second (1 Hz), 3-frame soft edges, 0.22 when off */
export const recAlpha = (f: number) => {
  const u = (((f % 30) + 30) % 30) / 30;
  return 0.22 + 0.78 * clamp01(0.5 + 1.7 * Math.cos(2 * Math.PI * u));
};
/** her camera's off click (beats.ts BEAT.G.offClick): from this frame the REC lamp is out and the HUD holds still */
export const OFF_AT = BEAT.F.offClick;
/** the moments the timestamp slides in: every scene's first frame and the 第二天 card */
const STAMP_AT: number[] = SEGMENTS.map((s) => s.from);
/** the timestamp on frame f: its text (the scene's), t = frames since it last slid in (frame 0: settled already) */
export const timeStampAt = (f: number): { id: SceneId; text: string; at: number; t: number } => {
  let at = STAMP_AT[0];
  for (const a of STAMP_AT) if (f >= a) at = a;
  const id = segmentAt(f).id;
  return { id, text: SCENE_TIME[id], at, t: at === 0 ? Math.max(f, 0) + 8 : f - at };
};

// ---------------------------------------------------------------------------------------------------- geometry
const ROW = 230;                                      // the REC row's centre (SCREEN.rec)
const DOT = { x: SCREEN.rec.x0 + 39, r: 17 };         // the REC dot's centre x and radius
const STAMP = { x: SCREEN.rec.x0 + 22, y: 288, px: EN ? 30 : 34, big: 1.55, bigY: 304 };
const IN = 8, HOLD = 44, SHRINK = 12;                 // the timestamp's intro: slide in, hold, shrink (frames)
/** the boxes the vlog UI takes (px): the REC row, the small timestamp, its big intro, the battery */
export const VLOG_RECT: Record<"rec" | "stamp" | "stampBig" | "battery", Rect> = {
  rec: { x0: SCREEN.rec.x0, y0: ROW - 26, x1: SCREEN.rec.x0 + 190, y1: ROW + 26 },
  stamp: { x0: STAMP.x - 6, y0: STAMP.y - 22, x1: STAMP.x + 440, y1: STAMP.y + 22 },
  stampBig: { x0: STAMP.x - 6, y0: STAMP.bigY - 34, x1: STAMP.x + 690, y1: STAMP.bigY + 38 },
  battery: { x0: SCREEN.battery.x0 - 30, y0: ROW - 26, x1: SCREEN.battery.x1, y1: ROW + 26 },
};

// ---------------------------------------------------------------------------------------------------- the pieces
/** the REC lamp and its label; `out`: the camera is switched off (the lamp a dead dark-red glass, the label grey) */
const RecMark: React.FC<{ f: number; out?: boolean }> = ({ f, out }) => {
  const a = out ? 0 : recAlpha(f);
  return (
    <>
      <div style={{ position: "absolute", left: DOT.x - DOT.r, top: ROW - DOT.r, width: DOT.r * 2, height: DOT.r * 2, borderRadius: DOT.r, background: HC.ink, boxShadow: `0 0 0 5px ${HC.ink}, 0 3px 0 5px ${HC.shade}` }} />
      {out ? <div style={{ position: "absolute", left: DOT.x - DOT.r, top: ROW - DOT.r, width: DOT.r * 2, height: DOT.r * 2, borderRadius: DOT.r, background: "radial-gradient(circle at 38% 34%, #6e3430 0%, #4a1c1a 45%, #2c1110 100%)" }} /> : null}
      <div style={{ position: "absolute", left: DOT.x - DOT.r, top: ROW - DOT.r, width: DOT.r * 2, height: DOT.r * 2, borderRadius: DOT.r, opacity: a,
        background: `radial-gradient(circle at 38% 34%, #ff9a8a 0%, ${HC.rec} 42%, #c4100f 100%)`, boxShadow: `0 0 ${Math.round(14 * a)}px ${Math.round(3 * a)}px rgba(255,40,40,${(0.55 * a).toFixed(3)})` }} />
      <div style={{ position: "absolute", left: SCREEN.rec.x0 + 76, top: ROW, transform: "translateY(-50%)", ...inked(46, out ? "#8f8a85" : HC.white, { letterSpacing: 2 }) }}>{TXT.rec}</div>
    </>
  );
};

const TimeStamp: React.FC<{ f: number; intro: boolean }> = ({ f, intro }) => {
  const st = timeStampAt(f), t = intro ? st.t : HOLD + SHRINK;
  const kin = easeOutCubic((t + 1) / IN), op = clamp01((t + 1) / 5);
  const ks = easeInOutCubic((t - HOLD) / SHRINK);                       // 0 = big, 1 = small (at rest)
  const s = STAMP.big + (1 - STAMP.big) * ks, y = STAMP.bigY + (STAMP.y - STAMP.bigY) * ks, dx = -56 * (1 - kin);
  const sp = st.text.indexOf(" "), head = sp > 0 ? st.text.slice(0, sp) : st.text, tail = sp > 0 ? st.text.slice(sp) : "";
  // the gold underline: draws out under the big stamp (t 3..11), fades while it shrinks
  const ul = easeOutCubic((t - 3) / 8) * (1 - clamp01(ks * 1.6));
  return (
    <div style={{ position: "absolute", left: STAMP.x + dx, top: y, transform: `translateY(-50%) scale(${s.toFixed(4)})`, transformOrigin: "0 50%", opacity: op }}>
      <div style={{ position: "relative", ...inked(STAMP.px, HC.cream, { letterSpacing: EN ? 0.5 : 1 }) }}>
        <span style={{ color: HC.goldPale }}>{head}</span>{tail}
        {ul > 0.01 ? (
          <div style={{ position: "absolute", left: 0, top: STAMP.px + 9, height: 5, width: `${(100 * ul).toFixed(1)}%`, borderRadius: 3, background: HC.gold, boxShadow: `0 0 0 3px ${HC.ink}` }} />
        ) : null}
      </div>
    </div>
  );
};

const Battery: React.FC<{ f: number; still: boolean }> = ({ f, still }) => {
  const pct = batteryAt(f), lvl = Math.max(0.06, pct / 100);
  const fill = pct > 35 ? HC.green : pct > 15 ? HC.amber : HC.red;
  const last = f >= seg("F").from && !still;
  const breathe = last ? 0.5 + 0.5 * (0.5 + 0.5 * Math.cos((2 * Math.PI * f) / 30)) : 1;
  const bw = 78, bh = 38, x1 = SCREEN.battery.x1 - 10, x0 = x1 - bw, y0 = ROW - bh / 2;
  const inner = bw - 14;
  return (
    <>
      <svg width={1080} height={400} viewBox="0 0 1080 400" style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <g transform="translate(0,3)" opacity={0.45}>
          <rect x={x0} y={y0} width={bw} height={bh} rx={9} fill="none" stroke="#08080f" strokeWidth={13} />
        </g>
        <rect x={x1 - 1} y={ROW - 9} width={9} height={18} rx={3} fill={HC.white} stroke={HC.ink} strokeWidth={6} style={{ paintOrder: "stroke fill" } as React.CSSProperties} />
        <rect x={x0} y={y0} width={bw} height={bh} rx={9} fill="rgba(10,10,18,0.28)" stroke={HC.ink} strokeWidth={13} />
        <rect x={x0} y={y0} width={bw} height={bh} rx={9} fill="none" stroke={HC.white} strokeWidth={5} />
        <rect x={x0 + 7} y={y0 + 7} width={(inner * lvl).toFixed(2)} height={bh - 14} rx={3.5} fill={fill} opacity={breathe.toFixed(3)} />
      </svg>
      <div style={{ position: "absolute", left: x0 - 14, top: ROW, transform: "translate(-100%, -50%)", ...inked(38, pct > 15 ? HC.white : "#ffd6d0") }}>{`${pct}%`}</div>
    </>
  );
};

// ---------------------------------------------------------------------------------------------------- the vlog UI
export const VlogHud: React.FC<{ f: number; rec?: boolean; cards?: boolean }> = ({ f, rec, cards }) => {
  const museum = false;
  const showRec = rec ?? true, out = f >= OFF_AT, fz = Math.min(f, OFF_AT);   // from the off click the HUD holds frame OFF_AT
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {showRec ? <RecMark f={fz} out={out} /> : null}
      {showRec && !museum ? <TimeStamp f={fz} intro={cards !== false} /> : null}
      <Battery f={fz} still={rec === false} />
    </AbsoluteFill>
  );
};
