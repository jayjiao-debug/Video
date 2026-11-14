// hud/vlog.tsx: HER CAMERA'S RECORDING UI in the Newton film (PLAN.md section 5; Jay 14 Nov: "add the recording visuals
// and sound effects like 秦始皇"). The idea is the Qin film's (src/videos/qin/hud/vlog.tsx); the look and the clock are
// this film's own. A pure function of the frame (no state, nothing random), drawn by Film.tsx FIRST in its HUD layer
// (above the 3D picture, under the title block, the fact card, the shot's overlays and the subtitles), unless the
// frame's Pose says hud: false.
//   <VlogHud f rec? cards? />
//     REC       a red lamp + "REC" top left (layout.ts SCREEN.rec, the row centred on y 204). The lamp BREATHES at
//               1 Hz: about 11 frames lit, 11 dim, 4-frame soft ramps, never below 24 % (never a hard flash). Gone
//               (with the timestamp) where a Pose says rec: false.
//               HER CAMERA SWITCHES OFF on OFF_AT (= the sound's sfx_poweroff: scene G to - 1.2 s, in the quiet after
//               the last pluck, when his window has gone dark, before the end black): the lamp goes out (a dead
//               dark-red glass, no glow), "REC" turns warm grey, and the whole UI holds still from that frame (nothing
//               breathes, the battery stops) until segG's end black (Pose.top) covers it. The blink's phase is set from
//               OFF_AT, so the lamp has been fully lit for 7 frames when it dies (and it happens to be lit on frame 0).
//     时间戳    the scene's timestamp, two rows: the time of day (story.ts SCENE_STAMP: 清晨 in pale gold) and the clock
//               (05:00, warm white), the English word small under it (EARLY MORNING, ivory, spaced capitals).
//               On every scene's first frame it SLIDES IN BIG (x1.5) under REC; while it lands the CLOCK RUNS ON from
//               the last scene's time to this one (the day fast-forwarding: 05:00 ... 11:00, ease-out over 14 frames);
//               it holds, then shrinks into its small place under REC (left x 54, rows on y 255 / 290) and stays.
//               Frame 0 starts big and settled (no run: the first frame is complete). cards: false skips the big
//               intro (only the small stamp).
//     battery   top right (SCREEN.battery): its level follows the CLOCK, not the frame: 100 % at 05:00 down to 12 % at
//               02:00 (scene starts: A 100, B 75, C 71, D 58, E 46, F 25, G 12), each scene draining 3 points more
//               while it runs (G: 12 -> 7), so it steps down at every cut (a later recording). Green over 35 %, amber
//               over 15 %, RED from the 2 a.m. scene, where its fill breathes softly at 1 Hz. Still from the off frame
//               and where rec: false.
//   recAlpha(f), stampAt(f), clockAt(f), batteryAt(f), OFF_AT, VLOG_RECT, vlogRectsAt(f): the numbers behind it.
import React from "react";
import { AbsoluteFill } from "remotion";
import { useOverlayFont } from "../../group/kit/overlay";
import { FPS, SCENES, SCENE_STAMP, SEGMENTS, TOTAL, clamp01, clockText, easeInOutCubic, easeOutCubic, segmentAt, type SceneId } from "../story";
import { SCREEN } from "../layout";
import { EN } from "../lang";
import { FONT_STACK, HC, textW, type Rect } from "./style";

// ---------------------------------------------------------------------------------------------------- the clock
/** HER CAMERA SWITCHES OFF on this frame (scene G to - 1.2 s; cues.json sfx_poweroff on ["G", "to", -1.2]): after his
 *  window goes dark (the last pluck, G to - 1.77 s), before the end black (segG: a second after the window) */
export const OFF_AT = TOTAL - Math.round(1.2 * FPS);
/** the REC lamp's opacity on frame f: 1 Hz, a plateau lit, 4-frame ramps, 0.24 at its dimmest; phase from OFF_AT */
export const recAlpha = (f: number) => {
  const k = (((f - OFF_AT + 2) % 30) + 30) % 30;
  return 0.24 + 0.76 * clamp01(0.5 + 1.25 * Math.cos((2 * Math.PI * k) / 30));
};
/** the timestamp's intro: slide in, run the clock, hold big, shrink (frames from the scene's first frame) */
const IN = 8, RUN = 14, HOLD = 48, SHRINK = 12;
/** the timestamp on frame f: its scene, t = frames since that scene's first frame (frame 0: already slid in) */
export const stampAt = (f: number): { id: SceneId; at: number; t: number } => {
  const s = segmentAt(f);
  return { id: s.id, at: s.from, t: s.from === 0 ? Math.max(f, 0) + IN : f - s.from };
};
/** the clock the timestamp shows on frame f (minutes, story.ts SCENE_CLOCK): it runs on from the last scene's time to
 *  this scene's over the intro's first RUN frames (ease-out), then holds */
export const clockAt = (f: number): number => {
  const st = stampAt(f), i = SCENES.indexOf(st.id), to = SCENE_STAMP[st.id].min;
  if (i <= 0 || st.t >= RUN) return to;
  const from = SCENE_STAMP[SCENES[i - 1]].min;
  return from + (to - from) * easeOutCubic(clamp01((st.t + 1) / RUN));
};
/** the battery (%) on frame f: each scene starts at its clock's level (100 % at 05:00 .. 12 % at 02:00) and drains 3
 *  points more while it runs (the last one 5) */
export const batteryAt = (f: number): number => {
  const s = segmentAt(f), h = SCENE_STAMP[s.id].min / 60;
  const start = 100 - (88 * (h - 5)) / 21, drain = s.id === "G" ? 5 : 3;
  return Math.round(start - drain * clamp01((f - s.from) / Math.max(1, s.to - s.from)));
};

// ---------------------------------------------------------------------------------------------------- geometry
const ROW = 204;                                          // the REC row's centre y (SCREEN.rec)
const X0 = SCREEN.rec.x0;                                 // 50: the corner's left edge
const DOT = { x: X0 + 22, r: 14 };                        // the lamp's centre x and radius (its ink ring 5 px more)
const REC_X = X0 + 48, REC_PX = 38, REC = "REC";          // the label (the same in both languages)
const ST = { x: X0 + 4, y: 238, zh: 34, en: 21, gap: 7, big: 1.5, bigY: 246, lsEn: 2.4 };
const BAT = { x1: SCREEN.battery.x1 - 12, w: 70, h: 32, px: 34 };
const inkW = (px: number) => Math.max(5, Math.round(px * 0.17));
/** the two rows' strings for a scene (lang zh: 清晨 05:00 / EARLY MORNING; lang en: Early morning 05:00 / 清晨) */
const rows = (id: SceneId, clock: string) => {
  const s = SCENE_STAMP[id];
  return EN ? { word: s.en, clock, small: s.zh, smallLs: 1 } : { word: s.zh, clock, small: s.en.toUpperCase(), smallLs: ST.lsEn };
};
/** the widest timestamp at rest (px, before the 1.5x intro): the widest row of any scene */
const STAMP_W = Math.max(...SCENES.map((id) => {
  const r = rows(id, SCENE_STAMP[id].clock);
  return Math.max(textW(`${r.word} ${r.clock}`, ST.zh, 1), textW(r.small, ST.en, r.smallLs)) + inkW(ST.zh);
}));
const STAMP_H = ST.zh + ST.gap + ST.en + 6;
/** the boxes the vlog UI takes (px): the REC row, the small timestamp, its big intro, the battery with its % */
export const VLOG_RECT: Record<"rec" | "stamp" | "stampBig" | "battery", Rect> = {
  rec: { x0: X0, y0: ROW - DOT.r - 6, x1: Math.ceil(REC_X + textW(REC, REC_PX, 2) + inkW(REC_PX)), y1: ROW + DOT.r + 6 },
  stamp: { x0: ST.x - 4, y0: ST.y - 4, x1: Math.ceil(ST.x + STAMP_W), y1: ST.y + STAMP_H },
  stampBig: { x0: ST.x - 4, y0: ST.bigY - 4, x1: Math.ceil(ST.x + STAMP_W * ST.big), y1: Math.ceil(ST.bigY + STAMP_H * ST.big) },
  battery: { x0: Math.floor(BAT.x1 - BAT.w - 14 - textW("100%", BAT.px, 0) - inkW(BAT.px)), y0: ROW - BAT.h / 2 - 6, x1: BAT.x1 + 10, y1: ROW + BAT.h / 2 + 6 },
};
/** the timestamp's scale on frame f (1.5 = the big intro, 1 = at rest) */
const stampK = (t: number) => easeInOutCubic(clamp01((t - HOLD) / SHRINK));
/** the boxes the vlog UI takes on frame f (the big intro while it is bigger than at rest) */
export const vlogRectsAt = (f: number): { what: "rec" | "stamp" | "battery"; r: Rect }[] => {
  const st = stampAt(Math.min(f, OFF_AT));
  return [
    { what: "rec", r: VLOG_RECT.rec },
    { what: "stamp", r: stampK(st.t) < 1 ? VLOG_RECT.stampBig : VLOG_RECT.stamp },
    { what: "battery", r: VLOG_RECT.battery },
  ];
};

// ---------------------------------------------------------------------------------------------------- the look
/** inked text, the subtitles' way: a dark warm ink line drawn as its own layer UNDER the fill, a hard little drop and a
 *  soft shadow; `runs` colour parts of the fill */
const Inked: React.FC<{ px: number; ls?: number; runs: { text: string; color: string }[]; style?: React.CSSProperties }> = ({ px, ls = 0, runs, style }) => {
  const text = runs.map((r) => r.text).join("");
  const drop = Math.max(2, Math.round(px * 0.06)), soft = Math.round(px * 0.3);
  const base: React.CSSProperties = { fontFamily: FONT_STACK, fontWeight: 700, fontSize: px, lineHeight: 1, letterSpacing: ls, whiteSpace: "pre", fontVariantNumeric: "tabular-nums" };
  return (
    <div style={{ position: "absolute", ...base, ...style }}>
      <span style={{ color: HC.ink, WebkitTextStroke: `${inkW(px)}px ${HC.ink}`, textShadow: `0 ${drop}px 0 rgba(10,6,4,0.45), 0 ${drop + 2}px ${soft}px rgba(10,6,4,0.5)` } as React.CSSProperties}>{text}</span>
      <span style={{ position: "absolute", left: 0, top: 0 }}>{runs.map((r, i) => <span key={i} style={{ color: r.color }}>{r.text}</span>)}</span>
    </div>
  );
};

/** the REC lamp and its label; `out`: the camera is off (the lamp a dead dark-red glass, the label warm grey) */
const RecMark: React.FC<{ f: number; out: boolean }> = ({ f, out }) => {
  const a = out ? 0 : recAlpha(f), d = DOT.r * 2, box = { position: "absolute" as const, left: DOT.x - DOT.r, top: ROW - DOT.r, width: d, height: d, borderRadius: DOT.r };
  return (
    <>
      {/* the lamp's housing: an ink ring with a soft drop, and the unlit glass under the light */}
      <div style={{ ...box, background: "radial-gradient(circle at 38% 34%, #7a3a33 0%, #4e1d19 48%, #2a100d 100%)", boxShadow: `0 0 0 5px ${HC.ink}, 0 3px 0 5px rgba(10,6,4,0.45), 0 5px 10px 5px rgba(10,6,4,0.35)` }} />
      {a > 0 ? <div style={{ ...box, opacity: a, background: "radial-gradient(circle at 36% 32%, #ffc2b2 0%, #ff4b38 38%, #c8160e 100%)", boxShadow: `0 0 ${Math.round(16 * a)}px ${Math.round(4 * a)}px rgba(255,60,40,${(0.5 * a).toFixed(3)})` }} /> : null}
      {/* a little glint on the glass (there whether lit or not: it is glass) */}
      <div style={{ position: "absolute", left: DOT.x - DOT.r * 0.45, top: ROW - DOT.r * 0.62, width: DOT.r * 0.5, height: DOT.r * 0.32, borderRadius: DOT.r, background: "rgba(255,255,255,0.55)", opacity: out ? 0.25 : 0.4 + 0.5 * a, transform: "rotate(-24deg)" }} />
      <Inked px={REC_PX} ls={2} runs={[{ text: REC, color: out ? "#8f857c" : HC.warm }]} style={{ left: REC_X, top: ROW - REC_PX / 2 - 1 }} />
    </>
  );
};

const TimeStamp: React.FC<{ f: number; intro: boolean }> = ({ f, intro }) => {
  const st = stampAt(f), t = intro ? st.t : HOLD + SHRINK;
  const r = rows(st.id, clockText(intro ? clockAt(f) : SCENE_STAMP[st.id].min));
  const kin = easeOutCubic(clamp01((t + 1) / IN)), op = clamp01((t + 1) / 5), ks = stampK(t);
  const s = ST.big + (1 - ST.big) * ks, y = ST.bigY + (ST.y - ST.bigY) * ks, dx = -40 * (1 - kin);
  // the English row comes in a few frames after the Chinese one (it settles under the running clock)
  const opSmall = clamp01((t - 3) / 6);
  return (
    <div style={{ position: "absolute", left: ST.x + dx, top: y, width: STAMP_W, height: STAMP_H, transform: `scale(${s.toFixed(4)})`, transformOrigin: "0 0", opacity: op }}>
      <Inked px={ST.zh} ls={1} runs={[{ text: `${r.word} `, color: HC.goldPale }, { text: r.clock, color: HC.warm }]} style={{ left: 0, top: 0 }} />
      <div style={{ opacity: opSmall }}>
        <Inked px={ST.en} ls={r.smallLs} runs={[{ text: r.small, color: HC.ivory }]} style={{ left: 1, top: ST.zh + ST.gap }} />
      </div>
    </div>
  );
};

const Battery: React.FC<{ f: number; still: boolean }> = ({ f, still }) => {
  const pct = batteryAt(f), lvl = Math.max(0.12, pct / 100);   // a red sliver always shows
  const fill = pct > 35 ? "#9ad66f" : pct > 15 ? HC.gold : "#ff5a46";
  const breathe = pct <= 15 && !still ? 0.45 + 0.55 * (0.5 + 0.5 * Math.cos((2 * Math.PI * (f - OFF_AT)) / 30)) : 1;
  const { w, h } = BAT, x1 = BAT.x1, x0 = x1 - w, y0 = ROW - h / 2, inner = w - 14;
  return (
    <>
      <svg width={1080} height={400} viewBox="0 0 1080 400" style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <rect x={x0} y={y0 + 3} width={w} height={h} rx={9} fill="none" stroke="rgba(10,6,4,0.45)" strokeWidth={12} />
        <rect x={x1 - 1} y={ROW - 8} width={9} height={16} rx={3} fill={HC.warm} stroke={HC.ink} strokeWidth={6} style={{ paintOrder: "stroke fill" } as React.CSSProperties} />
        <rect x={x0} y={y0} width={w} height={h} rx={9} fill="rgba(20,13,9,0.30)" stroke={HC.ink} strokeWidth={12} />
        <rect x={x0} y={y0} width={w} height={h} rx={9} fill="none" stroke={HC.warm} strokeWidth={4.5} />
        <rect x={x0 + 7} y={y0 + 7} width={(inner * lvl).toFixed(2)} height={h - 14} rx={3.5} fill={fill} opacity={breathe.toFixed(3)} />
      </svg>
      <Inked px={BAT.px} runs={[{ text: `${pct}%`, color: pct > 15 ? HC.warm : "#ffd2c8" }]} style={{ right: 1080 - (x0 - 14), top: ROW - BAT.px / 2 - 1 }} />
    </>
  );
};

// ---------------------------------------------------------------------------------------------------- the vlog UI
export const VlogHud: React.FC<{ f: number; rec?: boolean; cards?: boolean }> = ({ f, rec, cards }) => {
  useOverlayFont();
  const showRec = rec !== false, out = f >= OFF_AT, fz = Math.min(f, OFF_AT);   // from the off frame the UI holds OFF_AT
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {showRec ? <RecMark f={fz} out={out} /> : null}
      {showRec ? <TimeStamp f={fz} intro={cards !== false} /> : null}
      <Battery f={fz} still={rec === false || out} />
    </AbsoluteFill>
  );
};
/** the scenes' first frames (where the timestamp slides in) */
export const STAMP_AT: number[] = SEGMENTS.map((s) => s.from);
