// hud/vlog.tsx: HER CAMERA'S RECORDING LOOK, like the Qin film's (Jay 2026-11-14, PLAN 11.4-5). A pure function of the
// frame (no state, nothing random), drawn by Film.tsx in its HUD layer above the 3D picture (unless Pose.hud === false).
//   <VlogHud f rec? />
//     REC     a red dot that blinks at 1 Hz (soft edges, never fully off) + "REC", top left on the y 230 row. Hidden in
//             B's 黄州 flashback (a memory, not her camera) and where a Pose says rec: false. HER CAMERA SWITCHES OFF
//             at OFF.click (the end, as card 5 goes): the lamp goes out (dead dark-red glass), "REC" greys, and the
//             whole HUD holds still from that frame until the picture collapses over it (<SwitchOff />).
//     时辰    the scene's timestamp (SCENE_TIME): on each scene's first frame, and on the flashback's first frame (and
//             its return), it SLIDES IN big under REC with a gold underline, holds ~1.4 s, then shrinks to its small
//             place under REC, where it stays. Frame 0 starts big and settled (as Qin's). The first word in gold, the rest cream.
//     battery top right: drains 100 % (frame 0) -> 6 % (scene I's first frame), green > 35 %, amber > 15 %, red
//             below; in scene I the red fill breathes at 1 Hz (soft, never off): her battery is dying, which is why
//             the camera switches off at the very end.
//   <SwitchOff f />  THE END (Film.tsx draws it last, over the captions): black closes in from top and bottom while the
//             strip pales toward its middle line, one glowing line, the line shrinks to a dot, the dot fades, then pure
//             black to the last frame (Qin's segG ending, as a HUD piece).
//   OFF, batteryAt(f), timeStampAt(f), recAlpha(f), VLOG_RECT, vlogRectsAt(f)
import React from "react";
import { AbsoluteFill } from "remotion";
import { SEGMENTS, TOTAL, clamp01, easeInOutCubic, easeOutCubic, seg, segmentAt, type SceneId } from "../story";
import { BEAT, placeAt } from "../beats";
import { SCREEN } from "../layout";
import { EN, L, TXT } from "../lang";
import { HC, inked, type Rect } from "./style";

// ---------------------------------------------------------------------------------------------------- the words
/** each scene's timestamp (the 时辰 word first: it is drawn gold) */
export const SCENE_TIME: Record<SceneId, string> = {
  A: L("辰时 07:00 · 惠州集市", "7:00 AM · Huizhou market"),
  B: L("巳时 09:30 · 白鹤峰新居", "9:30 AM · The new house"),
  C: L("午时 12:00 · 荔枝树下", "Noon · Under the lychee tree"),
  D: L("未时 14:00 · 新居门口", "2:00 PM · At the gate"),
  E: L("酉时 18:00 · 新居里", "6:00 PM · Packing"),
  F: L("戌时 20:00 · 西湖边的松林", "8:00 PM · Pines by West Lake"),
  G: L("卯时 05:30 · 江边", "5:30 AM · The river"),
  H: L("两年后 · 儋州", "Two years later · Danzhou"),
  I: L("四年后 · 金山寺", "Four years later · Jinshan Temple"),
} as Record<SceneId, string>;
/** the flashback's timestamp (B15-B17, placeAt "huangzhou") */
export const FLASH_TIME = L("十七年前 · 黄州", "17 years earlier · Huangzhou");

// ---------------------------------------------------------------------------------------------------- numbers
/** HER CAMERA SWITCHES OFF: the off click (the lamp goes out, the HUD freezes) as card 5 goes, then the collapse to
 *  a line, the dot, pure black to the last frame. The sound (scripts/su/sound) follows OFF.click. */
const CLICK = Math.min(BEAT.I.card[1] - 1, TOTAL - 1 - 46);
export const OFF = {
  click: CLICK,
  collapse: [CLICK + 8, CLICK + 15] as [number, number],
  dot: [CLICK + 16, CLICK + 25] as [number, number],
  black: CLICK + 26,
};
const I0 = seg("I").from;
/** the battery's charge on frame f: 100 % on frame 0, a steady drain to 6 % on scene I's first frame, 6 % after */
export const batteryAt = (f: number) => Math.round(100 - 94 * clamp01(f / I0));
/** the REC dot's opacity on frame f: on for half a second, off for half a second (1 Hz), soft edges, 0.22 when off */
export const recAlpha = (f: number) => {
  const u = (((f % 30) + 30) % 30) / 30;
  return 0.22 + 0.78 * clamp01(0.5 + 1.7 * Math.cos(2 * Math.PI * u));
};
const flashback = (f: number) => placeAt(f) === "huangzhou";
/** the moments the timestamp slides in: every scene's first frame and the flashback's first frame */
const STAMP_AT: number[] = [...SEGMENTS.map((s) => s.from), BEAT.B.flashIn].sort((a, b) => a - b);
/** the timestamp on frame f: its text, t = frames since it last slid in (frame 0: settled already; back from the
 *  flashback: B's stamp is small at once) */
export const timeStampAt = (f: number): { id: SceneId; text: string; at: number; t: number } => {
  const id = segmentAt(f).id as SceneId;
  if (flashback(f)) return { id, text: FLASH_TIME, at: BEAT.B.flashIn, t: f - BEAT.B.flashIn };
  let at = STAMP_AT[0];
  for (const a of STAMP_AT) if (f >= a && a !== BEAT.B.flashIn) at = a;
  const settled = id === "B" && f >= BEAT.B.flashOut;
  return { id, text: SCENE_TIME[id], at, t: settled ? 999 : at === 0 ? Math.max(f, 0) + 8 : f - at };
};

// ---------------------------------------------------------------------------------------------------- geometry
const X0 = 110, ROW = 230;                                  // x 110: inside 抖音's side crop (skill, 14 Nov)
const _X0_OLD = 40; void _X0_OLD;                                    // the REC row's left edge and centre
const DOT = { x: X0 + 39, r: 17 };
const STAMP = { x: X0 + 22, y: 288, px: EN ? 30 : 34, big: 1.55, bigY: 304 };
const IN = 8, HOLD = 44, SHRINK = 12;                        // the timestamp's intro: slide in, hold, shrink (frames)
const BAT_X1 = 970;
/** the boxes the vlog UI takes (px): the REC row, the small timestamp, its big intro, the battery */
export const VLOG_RECT: Record<"rec" | "stamp" | "stampBig" | "battery", Rect> = {
  rec: { x0: X0, y0: ROW - 26, x1: X0 + 190, y1: ROW + 26 },
  stamp: { x0: STAMP.x - 6, y0: STAMP.y - 22, x1: STAMP.x + 480, y1: STAMP.y + 22 },
  stampBig: { x0: STAMP.x - 6, y0: STAMP.bigY - 34, x1: STAMP.x + 760, y1: STAMP.bigY + 38 },
  battery: { x0: 780, y0: ROW - 26, x1: BAT_X1, y1: ROW + 26 },
};
/** the boxes the vlog UI takes on frame f */
export const vlogRectsAt = (f: number): { what: string; r: Rect }[] => {
  if (f >= OFF.collapse[0]) return [];
  const st = timeStampAt(f), big = st.t < HOLD + SHRINK;
  return [{ what: "rec", r: VLOG_RECT.rec }, { what: big ? "stampBig" : "stamp", r: big ? VLOG_RECT.stampBig : VLOG_RECT.stamp }, { what: "battery", r: VLOG_RECT.battery }];
};
void SCREEN;

// ---------------------------------------------------------------------------------------------------- the pieces
const RecMark: React.FC<{ f: number; out?: boolean }> = ({ f, out }) => {
  const a = out ? 0 : recAlpha(f);
  return (
    <>
      <div style={{ position: "absolute", left: DOT.x - DOT.r, top: ROW - DOT.r, width: DOT.r * 2, height: DOT.r * 2, borderRadius: DOT.r, background: HC.ink, boxShadow: `0 0 0 5px ${HC.ink}, 0 3px 0 5px ${HC.shade}` }} />
      {out ? <div style={{ position: "absolute", left: DOT.x - DOT.r, top: ROW - DOT.r, width: DOT.r * 2, height: DOT.r * 2, borderRadius: DOT.r, background: "radial-gradient(circle at 38% 34%, #6e3430 0%, #4a1c1a 45%, #2c1110 100%)" }} /> : null}
      <div style={{ position: "absolute", left: DOT.x - DOT.r, top: ROW - DOT.r, width: DOT.r * 2, height: DOT.r * 2, borderRadius: DOT.r, opacity: a,
        background: `radial-gradient(circle at 38% 34%, #ff9a8a 0%, ${HC.rec} 42%, #c4100f 100%)`, boxShadow: `0 0 ${Math.round(14 * a)}px ${Math.round(3 * a)}px rgba(255,40,40,${(0.55 * a).toFixed(3)})` }} />
      <div style={{ position: "absolute", left: X0 + 76, top: ROW, transform: "translateY(-50%)", ...inked(46, out ? "#8f8a85" : HC.white, { letterSpacing: 2 }) }}>{TXT.rec}</div>
    </>
  );
};

const TimeStamp: React.FC<{ f: number }> = ({ f }) => {
  const st = timeStampAt(f), t = Math.min(st.t, HOLD + SHRINK);
  const kin = easeOutCubic((t + 1) / IN), op = clamp01((t + 1) / 5);
  const ks = easeInOutCubic((t - HOLD) / SHRINK);                       // 0 = big, 1 = small (at rest)
  const s = STAMP.big + (1 - STAMP.big) * ks, y = STAMP.bigY + (STAMP.y - STAMP.bigY) * ks, dx = -56 * (1 - kin);
  const sp = st.text.indexOf(" "), head = sp > 0 ? st.text.slice(0, sp) : st.text, tail = sp > 0 ? st.text.slice(sp) : "";
  const ul = easeOutCubic((t - 3) / 8) * (1 - clamp01(ks * 1.6));     // the gold underline under the big stamp
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
  const last = f >= I0 && !still;
  const breathe = last ? 0.5 + 0.5 * (0.5 + 0.5 * Math.cos((2 * Math.PI * f) / 30)) : 1;
  const bw = 78, bh = 38, x1 = BAT_X1 - 10, x0 = x1 - bw, y0 = ROW - bh / 2;
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
export const VlogHud: React.FC<{ f: number; rec?: boolean }> = ({ f, rec }) => {
  if (f >= OFF.collapse[0] + 4) return null;
  const fb = flashback(f), showRec = (rec ?? true) && !fb, out = f >= OFF.click, fz = Math.min(f, OFF.click);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {showRec ? <RecMark f={fz} out={out} /> : null}
      {rec !== false ? <TimeStamp f={fz} /> : null}
      {!fb ? <Battery f={fz} still={rec === false || out} /> : null}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------------------- the switch-off
const MID = 960;
const black = (key: string, top: number, height: number) => <div key={key} style={{ position: "absolute", left: 0, top, width: 1080, height, background: "#000" }} />;
const glow = (hw: number, hh: number, a: number) => (
  <div key="offLine" style={{ position: "absolute", left: 540 - hw, top: MID - hh, width: 2 * hw, height: 2 * hh, borderRadius: hh, background: "#fffaf0", opacity: a,
    boxShadow: "0 0 10px 3px rgba(255,242,222,0.9), 0 0 34px 8px rgba(255,226,190,0.32)" }} />
);
const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const SwitchOff: React.FC<{ f: number }> = ({ f }) => {
  const [c0, c1] = OFF.collapse, d0 = OFF.dot[0];
  if (f < c0) return null;
  if (f >= OFF.black) return <AbsoluteFill style={{ pointerEvents: "none", background: "#000" }} />;
  const kids: React.ReactNode[] = [];
  if (f <= c1) {
    const k = (f - c0 + 1) / (c1 - c0 + 1), hh = Math.max(3, MID * (1 - smooth(k)));
    const edge = 0.04 + 0.45 * k * k * k, mid = 0.08 + 0.8 * k * k * k, grey = 0.2 * k;
    kids.push(
      <div key="offGrey" style={{ position: "absolute", left: 0, top: MID - hh, width: 1080, height: 2 * hh, background: `rgba(128,124,120,${grey.toFixed(3)})` }} />,
      <div key="offVeil" style={{ position: "absolute", left: 0, top: MID - hh, width: 1080, height: 2 * hh,
        background: `linear-gradient(to bottom, rgba(255,246,232,${edge.toFixed(3)}) 0%, rgba(255,246,232,${mid.toFixed(3)}) 50%, rgba(255,246,232,${edge.toFixed(3)}) 100%)` }} />,
      black("offTop", 0, MID - hh), black("offBottom", MID + hh, 1920 - MID - hh),
    );
    const la = clamp01((60 - hh) / 50);
    if (la > 0) kids.push(glow(540, 3, la));
  } else {
    const n = f - d0, u = smooth(Math.min(1, (n + 1) / 6)), a = n < 6 ? 1 : 1 - (n - 5) / 5;
    kids.push(black("offAll", 0, 1920), glow(540 + (7 - 540) * u, 3 + (7 - 3) * u * u, a));
  }
  return <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>{kids}</AbsoluteFill>;
};
