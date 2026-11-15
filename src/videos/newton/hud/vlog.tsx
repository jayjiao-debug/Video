// hud/vlog.tsx: HER CAMERA'S RECORDING UI in the Newton film (PLAN.md section 5; Jay 14 Nov: "add the recording visuals
// and sound effects like 秦始皇"). The idea is the Qin film's (src/videos/qin/hud/vlog.tsx); the look and the clock are
// this film's own. A pure function of the frame (no state, nothing random), drawn by Film.tsx FIRST in its HUD layer
// (above the 3D picture, under the title block, the fact card, the shot's overlays and the subtitles), unless the
// frame's Pose says hud: false.
//   <VlogHud f rec? cards? />
//     REC       a red lamp + "REC" top left (style.ts FRAME.rec, the row centred on y 250, under the phone app's icons
//               at y 143-222; the lamp's ink ring starts on x 110, Jay 15 Nov "a tad bit in"). The lamp BREATHES at
//               1 Hz: about 11 frames lit, 11 dim, 4-frame soft ramps, never below 24 % (never a hard flash). Gone
//               (with the timestamp) where a Pose says rec: false. On the lead card's freeze (f916-990) the lamp is
//               held LIT (prop `lit`, Film.tsx from msFrozen: she is still recording) while the rest of the UI holds. The blink's period is 1 s stretched by a hair
//               (about 30.07 frames) so that the lamp is lit on frame 0 AND has been lit for 10 frames when it dies.
//     OFF       HER CAMERA SWITCHES OFF on OFF_AT (beats.ts BEAT.G.cameraOff = the sound's sfx_poweroff click: scene G
//               to - 1.4 s, 12 frames after the last pluck, when his window has gone dark; segG's end black comes 24
//               frames later): in one frame the whole UI goes DEAD, the way nothing in a blink does: the lamp goes out
//               to a dead GREY glass (no red, no glow), "REC", the timestamp and the battery's outline and % all turn
//               the same warm grey, and the battery's fill is emptied. From that frame it holds still (nothing breathes)
//               until the end black (Pose.top) covers it.
//     时间戳    the scene's timestamp: the time of day (story.ts SCENE_STAMP: 清晨 in pale gold) and the clock (05:00,
//               warm white) in ONE CHINESE ROW, like the cards (the owner's default, 14 Nov night: no English row under
//               it in the Chinese film; STAMP_EN_ROW); lang en: the clock alone over the English word (EARLY MORNING,
//               22 px, ivory, spaced capitals). The row sits under REC centred on y 308 (style.ts FRAME.labelY).
//               On every scene's first frame it SLIDES IN BIG (x1.5, to about x 480, y 344) under REC, holds, then
//               shrinks into its small place (2 s in all) and stays.
//               THE CLOCK RUNS FAST ONLY AT THE CLOCK JOINS (script v5: ① A->B, ⑤ C->D, ⑦ D->E and ⑩ F->G, the first
//               frames of B, D, E, G; beats.ts JOINS, never a frame number), over each join's own race frames
//               (Join.race, eased in-out): ① under card 1's last second, landing on the cut; ⑤ and ⑦ from 10 frames
//               BEFORE the cut (the outgoing scene's small stamp) to 8 after it (under the big stamp sliding in); ⑩ (no
//               picture cut) from F16 end + 0.3 s to the town clock's first stroke. At a WHIP or MATCH join (B->C, E->F
//               and the joins inside a scene) the stamp slides in with its time already set: nothing runs. The word
//               follows the running digits (WORD_FROM: the outgoing scene's word until they enter the incoming scene's
//               hours).
//               Frame 0 starts big and settled (the first frame is complete). cards: false skips the big intro (only
//               the small stamp). AT A NO-CUT CLOCK JOIN (⑩ F->G, beats.ts Join.noCut: G's first frame is the same held
//               picture) the big intro is SKIPPED too while BIG_STAMP_AT_NOCUT is false (the default, gate-5 note F3,
//               the owner's choice pending: there is no new place to announce, and it sits in the quiet span): only the
//               small stamp, racing to 02:00 in its place. Flip BIG_STAMP_AT_NOCUT to true for the big slide-in there.
//               DECISION 2 (script v5's default, story.ts SCENE_DIGITS): the digits show at rest only where a source
//               gives the hour, A 05:00 and G 02:00; B-F show the time word alone (上午 / 中午 / 下午 / 傍晚 / 夜). Their
//               digits come in (3 frames) as a race into or out of them starts, run, and fade out over DIGITS_FADE
//               frames after a race lands on a word-only scene (digitsAlpha). Lang en: the English row is the word.
//     battery   top right (x ~790..970 on the row y 250, its nub ending on x 970, style.ts FRAME.rec):
//               its level follows the CLOCK, not the frame:
//               100 % at 05:00 down to 12 % at
//               02:00 (scene starts: A 100, B 75, C 71, D 58, E 46, F 25, G 12), each scene draining 3 points more
//               while it runs (G: 12 -> 7), so it steps down at every cut (a later recording); at a NO-CUT clock join
//               (⑩) there is no cut to step on, so it EASES from the outgoing scene's level to the incoming one's over
//               the race's frames with the clock's own easing (gate-5 note F2: f4581-4602, 22 % -> 12 %, turning red on
//               the way, as v5's "the battery turns red"). Green over 35 %, amber
//               over 15 %, RED from the 2 a.m. scene, where its fill breathes softly at 1 Hz. Still from the off frame
//               and where rec: false; emptied and grey from the off frame.
//   recAlpha(f), stampAt(f), stampIntro(id), BIG_STAMP_AT_NOCUT, clockAt(f), raceAt(f), RACES, CLOCK_JOINS, batteryAt(f), OFF_AT, VLOG_RECT (the corners'
//   reserve: the widest scene), stampRect(id, big) (one scene's timestamp box), vlogRectsAt(f): the numbers behind it.
import React from "react";
import { AbsoluteFill } from "remotion";
import { useOverlayFont } from "../../group/kit/overlay";
import { FPS, SCENES, SCENE_STAMP, SEGMENTS, clamp01, clockText, easeInOutCubic, easeOutCubic, segmentAt, type SceneId } from "../story";
import { EN } from "../lang";
import { BEAT, JOINS, RACE_PRE, RACE_POST } from "../beats";
import { FONT_STACK, FRAME, HC, textW, type Rect } from "./style";

// ---------------------------------------------------------------------------------------------------- the clock
/** HER CAMERA SWITCHES OFF on this frame (beats.ts BEAT.G.cameraOff = scene G to - 1.4 s = TOTAL - 42; cues.json
 *  sfx_poweroff on ["G", "to", -1.4]): 12 frames after his window goes dark (the last pluck, G to - 1.77 s); segG's end
 *  black (BEAT.G.black) starts 24 frames later, so the dead UI reads for 0.8 s */
export const OFF_AT = BEAT.G.cameraOff;
/** the blink: the middles of the first and of the last lit plateau (frame 4: lit from frame 0; OFF_AT - 5: lit for
 *  the 10 frames before it dies) and a period of about 30 frames that fits a whole number of blinks between them */
const LIT0 = 4, LIT1 = OFF_AT - 5;
const BLINK = (LIT1 - LIT0) / Math.max(1, Math.round((LIT1 - LIT0) / FPS));
const blinkCos = (f: number) => Math.cos((2 * Math.PI * (f - LIT0)) / BLINK);
/** the REC lamp's opacity on frame f: 1 Hz, 11 frames lit, 11 dim, 4-frame ramps, 0.24 at its dimmest */
export const recAlpha = (f: number) => 0.24 + 0.76 * clamp01(0.5 + 1.25 * blinkCos(f));
/** the timestamp's intro: slide in, hold big, shrink (frames from the scene's first frame) */
const IN = 8, HOLD = 48, SHRINK = 12;
/** THE OWNER'S CHOICE (gate-5 note F3): does the big stamp slide in at a NO-CUT clock join (⑩ F->G, beats.ts
 *  Join.noCut, f4584, the same held picture on both sides)? false (the default, the director's lean): no big intro there,
 *  only the small stamp racing to 02:00 in its place. true: the big slide-in as at every other scene's first frame. */
export const BIG_STAMP_AT_NOCUT = false;
/** the scenes whose first frame is a no-cut join (⑩: G) */
const NO_CUT_SCENES: SceneId[] = JOINS.filter((j) => j.noCut && j.first).map((j) => j.scene);
/** whether a scene's timestamp slides in big on its first frame (every scene's, except at a no-cut join while
 *  BIG_STAMP_AT_NOCUT is false) */
export const stampIntro = (id: SceneId): boolean => BIG_STAMP_AT_NOCUT || !NO_CUT_SCENES.includes(id);
/** the timestamp on frame f: its scene, t = frames since that scene's first frame (frame 0: already slid in; a scene
 *  with no intro, stampIntro: t starts at rest, HOLD + SHRINK, so it is small from its first frame) */
export const stampAt = (f: number): { id: SceneId; at: number; t: number } => {
  const s = segmentAt(f);
  return { id: s.id, at: s.from, t: s.from === 0 ? Math.max(f, 0) + IN : !stampIntro(s.id) ? f - s.from + HOLD + SHRINK : f - s.from };
};
/** THE CLOCK JOINS (script v5: 4 clock, 4 whip and 3 match joins; beats.ts JOINS is the one list): the scenes whose
 *  first frame is a clock join (① A->B, ⑤ C->D, ⑦ D->E, ⑩ F->G). B->C and E->F are whips: their stamp slides in already set. */
export const CLOCK_JOINS: SceneId[] = JOINS.filter((j) => j.kind === "clock" && j.first).map((j) => j.scene);
/** a race of the clock: from frame `f0` to `f1` (inclusive; beats.ts Join.race) it runs from `from` to `to` (minutes on
 *  the film day's scale), eased in-out; `cut` = its join's cut (⑩: G's first frame, no picture cut); the word goes from
 *  `fromId`'s to `toId`'s when the digits enter toId's hours */
export type Race = { cut: number; f0: number; f1: number; from: number; to: number; fromId: SceneId; toId: SceneId };
/** the default race's frames either side of the cut (camplan OVERVIEW item 3; beats.ts: ⑤ and ⑦ use it, ① and ⑩ have the
 *  script's own: ① under card 1's last second landing on the cut, ⑩ from F16 end + 0.3 s to the first stroke) */
export { RACE_PRE, RACE_POST };
/** every race of the film: one per clock join of beats.ts JOINS (each at a scene's first frame: SEGMENTS) */
export const RACES: Race[] = JOINS.filter((j) => j.kind === "clock").map((j): Race => {
  if (!j.first || !j.race) throw new Error(`hud/vlog.tsx RACES: clock join ${j.n} (${j.cut}) is not a scene's first frame with a race`);
  const prev = SCENES[SCENES.indexOf(j.scene) - 1];
  return { cut: j.cut, f0: j.race[0], f1: j.race[1], from: SCENE_STAMP[prev].min, to: SCENE_STAMP[j.scene].min, fromId: prev, toId: j.scene };
});
/** the race running on frame f, or null */
export const raceAt = (f: number): Race | null => RACES.find((r) => f >= r.f0 && f <= r.f1) ?? null;
/** the clock the timestamp shows on frame f (minutes, story.ts SCENE_CLOCK): the scene's own time, racing only across
 *  a clock join (raceAt) */
export const clockAt = (f: number): number => {
  const r = raceAt(f);
  if (r) return r.from + (r.to - r.from) * easeInOutCubic(clamp01((f - r.f0) / Math.max(1, r.f1 - r.f0)));
  return SCENE_STAMP[segmentAt(f).id].min;
};
/** WHERE EACH SCENE'S TIME WORD STARTS on the clock (minutes after the film day's midnight, story.ts SCENE_CLOCK's
 *  scale): 清晨 until 08:00, 上午 from 08:00, 中午 from 11:30, 下午 from 13:00, 傍晚 from 17:00, 夜 from 19:00, 凌晨 from
 *  24:00 (each scene's own clock lies inside its word's hours). While the clock races across a join, the word (and the
 *  English row under it) is the OUTGOING scene's until the running digits cross into the incoming scene's hours
 *  (review v2 row 7: never 「凌晨 23:25」, 「傍晚 15:35」 or 「下午 12:35」) */
export const WORD_FROM: Record<SceneId, number> = { A: 0, B: 8 * 60, C: 11 * 60 + 30, D: 13 * 60, E: 17 * 60, F: 19 * 60, G: 24 * 60 };
/** the scene whose time word goes with frame f's clock `min` (the clock as shown: whole minutes): the stamp's own scene,
 *  or across a race the outgoing / incoming scene's by the digits */
export const wordOf = (f: number, id: SceneId, min: number): SceneId => {
  const r = raceAt(f);
  if (!r) return id;
  return Math.floor(min) >= WORD_FROM[r.toId] ? r.toId : r.fromId;
};
/** DECISION 2: how much of the clock's digits shows on frame f (0..1): 1 in a scene whose hour a source gives (story.ts
 *  SCENE_DIGITS: A, G) and through every race; coming in over 3 frames as a race out of a word-only scene starts; going
 *  over DIGITS_FADE frames after a race lands on a word-only scene; else 0 (the word alone) */
export const DIGITS_FADE = 6;
export const digitsAlpha = (f: number): number => {
  const r = raceAt(f);
  if (r) return SCENE_STAMP[r.fromId].digits ? 1 : clamp01((f - r.f0 + 1) / 3);
  if (SCENE_STAMP[segmentAt(f).id].digits) return 1;
  const landed = RACES.find((x) => f > x.f1 && f <= x.f1 + DIGITS_FADE);
  return landed ? 1 - clamp01((f - landed.f1) / DIGITS_FADE) : 0;
};
/** the battery's level on frame f before rounding: its scene's start level (100 % at 05:00 .. 12 % at 02:00) less the
 *  scene's drain so far (3 points, the last scene 5) */
const batteryRaw = (f: number): number => {
  const s = segmentAt(f), h = SCENE_STAMP[s.id].min / 60;
  const start = 100 - (88 * (h - 5)) / 21, drain = s.id === "G" ? 5 : 3;
  return start - drain * clamp01((f - s.from) / Math.max(1, s.to - s.from));
};
/** the races over a NO-CUT join (⑩): there the battery eases with the clock instead of stepping on the scene's first frame */
const NO_CUT_RACES: Race[] = RACES.filter((r) => JOINS.some((j) => j.noCut && j.cut === r.cut));
/** the battery (%) on frame f: each scene starts at its clock's level (100 % at 05:00 .. 12 % at 02:00) and drains 3
 *  points more while it runs (the last one 5), so it steps down at a cut; across a no-cut join's race (⑩, gate-5 note F2)
 *  it eases from the outgoing level on the race's first frame to the incoming level on its last, with the clock's easing */
export const batteryAt = (f: number): number => {
  const r = NO_CUT_RACES.find((x) => f >= x.f0 && f <= x.f1);
  if (r) {
    const a = batteryRaw(r.f0), b = batteryRaw(r.f1);
    return Math.round(a + (b - a) * easeInOutCubic(clamp01((f - r.f0) / Math.max(1, r.f1 - r.f0))));
  }
  return Math.round(batteryRaw(f));
};

// ---------------------------------------------------------------------------------------------------- geometry
// THE 9:16 PHONE-SAFE PLACE (style.ts FRAME: the kit's FRAME_9x16 with the film's one override, Jay 15 Nov "the rec
// and batter need to go in a tad bit", the same numbers as the 李白 film): Douyin cuts ~58 px off each side and its
// back / search icons sit at y 143-222, so the REC row is centred on y 250 and the timestamp row under it on y 308;
// the REC lamp's outer ink ring starts on x 110 and the battery's nub (with its ink line) ends on x 970, so the whole
// display is x 110-970, y 225-330 (FRAME.rec). The REC label and the timestamp keep their place against the lamp (the
// stamp's ink allowance from x 110, 4 px in from the lamp's ring). The big stamp (a scene's first 2 s) reaches about y 344.
const ROW = FRAME.recY;                                   // 250: the REC row's centre y
const X0 = FRAME.rec.x0;                                  // 110: the corner's left edge (the lamp's ink ring)
const X1 = FRAME.rec.x1;                                  // 970: the battery's right edge (its nub's ink line)
const DOT = { x: X0 + 5 + 13, r: 13 };                    // the lamp's centre x and radius (its ink ring 5 px more: x 32)
const REC_X = DOT.x + 24, REC_PX = 36, REC = "REC";       // the label (the same in both languages)
const ST = { x: X0 + 4, y: FRAME.labelY - 15, zh: 30, en: 22, gap: 4, big: 1.5, bigY: FRAME.labelY - 15, lsEn: 2.0 };   // the 30 px row centred on y 308
/** the stamp's small English row under the Chinese one: only in the English film (lang en, where it is the word); the
 *  Chinese film shows Chinese only, like the cards (the owner's default, 14 Nov night) */
const STAMP_EN_ROW = EN;
const BAT = { x1: X1 - 10, w: 66, h: 30, px: 32 };        // the body's right edge; the nub reaches x1 + 8 and its ink 3 more
const inkW = (px: number) => Math.max(5, Math.round(px * 0.17));
/** the rows' strings for a scene (lang zh: 清晨 05:00, one row; lang en: 05:00 over EARLY MORNING, the word only once) */
const rows = (id: SceneId, clock: string) => {
  const s = SCENE_STAMP[id];
  return { word: EN ? "" : s.zh, clock, small: STAMP_EN_ROW ? s.en.toUpperCase() : "", smallLs: ST.lsEn };
};
/** the big row's text: the time word (if any) and the clock (if any) */
const bigRow = (r: { word: string; clock: string }) => [r.word, r.clock].filter(Boolean).join(" ");
/** a scene's timestamp width at rest (px, before the 1.5x intro): its wider row, with the ink line; `digits`: with the
 *  clock (default: as the scene shows it at rest, story.ts SCENE_DIGITS) */
const stampW = (id: SceneId, digits = SCENE_STAMP[id].digits) => {
  const r = rows(id, digits ? SCENE_STAMP[id].clock : "");
  return Math.max(textW(bigRow(r), ST.zh, 1), r.small ? textW(r.small, ST.en, r.smallLs) : 0) + inkW(ST.zh);
};
/** the widest timestamp: the widest of any scene WITH its digits (a race shows them; A's EARLY MORNING) */
const STAMP_W = Math.max(...SCENES.map((id) => stampW(id, true)));
const STAMP_H = ST.zh + (STAMP_EN_ROW ? ST.gap + ST.en : 0) + 4;
/** the boxes the vlog UI takes (px): the REC row, the small timestamp, its big intro, the battery with its % */
export const VLOG_RECT: Record<"rec" | "stamp" | "stampBig" | "battery", Rect> = {
  rec: { x0: DOT.x - DOT.r - 5, y0: ROW - DOT.r - 6, x1: Math.ceil(REC_X + textW(REC, REC_PX, 2) + inkW(REC_PX)), y1: ROW + DOT.r + 6 },
  stamp: { x0: ST.x - 4, y0: ST.y - 4, x1: Math.ceil(ST.x + STAMP_W), y1: ST.y + STAMP_H },
  stampBig: { x0: ST.x - 4, y0: ST.bigY - 4, x1: Math.ceil(ST.x + STAMP_W * ST.big), y1: Math.ceil(ST.bigY + STAMP_H * ST.big) },
  battery: { x0: Math.floor(BAT.x1 - BAT.w - 14 - textW("100%", BAT.px, 0) - inkW(BAT.px)), y0: ROW - BAT.h / 2 - 6, x1: BAT.x1 + 10, y1: ROW + BAT.h / 2 + 6 },
};
/** the timestamp's scale on frame f (1.5 = the big intro, 1 = at rest) */
const stampK = (t: number) => easeInOutCubic(clamp01((t - HOLD) / SHRINK));
/** the timestamp's box for one scene (its own width: F's 「夜 / NIGHT」 is narrower than A's), at rest or big; `digits`:
 *  with the clock (default: as the scene shows it at rest) */
export const stampRect = (id: SceneId, big: boolean, digits = SCENE_STAMP[id].digits): Rect => {
  const w = stampW(id, digits), k = big ? ST.big : 1, y = big ? ST.bigY : ST.y;
  return { x0: ST.x - 4, y0: y - 4, x1: Math.ceil(ST.x + w * k), y1: Math.ceil(y + STAMP_H * k) };
};
/** the boxes the vlog UI takes on frame f (the scene's own timestamp: its big intro while it is bigger than at rest;
 *  across a race both scenes' words, whichever is wider) */
export const vlogRectsAt = (f: number): { what: "rec" | "stamp" | "battery"; r: Rect }[] => {
  const fz = Math.min(f, OFF_AT), st = stampAt(fz), big = stampK(st.t) < 1, r = raceAt(fz);
  const ids = r ? [st.id, r.fromId, r.toId] : [st.id], dg = digitsAlpha(fz) > 0;
  const sr = ids.map((id) => stampRect(id, big, dg || SCENE_STAMP[id].digits)).reduce((a, b) => ({ x0: Math.min(a.x0, b.x0), y0: Math.min(a.y0, b.y0), x1: Math.max(a.x1, b.x1), y1: Math.max(a.y1, b.y1) }));
  return [
    { what: "rec", r: VLOG_RECT.rec },
    { what: "stamp", r: sr },
    { what: "battery", r: VLOG_RECT.battery },
  ];
};

// ---------------------------------------------------------------------------------------------------- the look
/** THE DEAD LOOK (from OFF_AT): every fill one warm grey (the English row a shade darker), the lamp's glass grey */
const OFF = { fill: "#8f857c", small: "#7b726a", glass: "radial-gradient(circle at 38% 34%, #5e5650 0%, #38312d 50%, #1d1815 100%)" };
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

/** the REC lamp and its label; `out`: the camera is off (the lamp a dead grey glass, the label warm grey); `lit` 0..1:
 *  how far the lamp is held fully lit over its breathing (the lead card's freeze: she is still recording) */
const RecMark: React.FC<{ f: number; out: boolean; lit: number }> = ({ f, out, lit }) => {
  const b = recAlpha(f), a = out ? 0 : b + (1 - b) * clamp01(lit), d = DOT.r * 2, box = { position: "absolute" as const, left: DOT.x - DOT.r, top: ROW - DOT.r, width: d, height: d, borderRadius: DOT.r };
  return (
    <>
      {/* the lamp's housing: an ink ring with a soft drop, and the unlit glass under the light */}
      <div style={{ ...box, background: out ? OFF.glass : "radial-gradient(circle at 38% 34%, #7a3a33 0%, #4e1d19 48%, #2a100d 100%)", boxShadow: `0 0 0 5px ${HC.ink}, 0 3px 0 5px rgba(10,6,4,0.45), 0 5px 10px 5px rgba(10,6,4,0.35)` }} />
      {a > 0 ? <div style={{ ...box, opacity: a, background: "radial-gradient(circle at 36% 32%, #ffc2b2 0%, #ff4b38 38%, #c8160e 100%)", boxShadow: `0 0 ${Math.round(16 * a)}px ${Math.round(4 * a)}px rgba(255,60,40,${(0.5 * a).toFixed(3)})` }} /> : null}
      {/* a little glint on the glass (there whether lit or not: it is glass) */}
      <div style={{ position: "absolute", left: DOT.x - DOT.r * 0.45, top: ROW - DOT.r * 0.62, width: DOT.r * 0.5, height: DOT.r * 0.32, borderRadius: DOT.r, background: "rgba(255,255,255,0.55)", opacity: out ? 0.25 : 0.4 + 0.5 * a, transform: "rotate(-24deg)" }} />
      <Inked px={REC_PX} ls={2} runs={[{ text: REC, color: out ? OFF.fill : HC.warm }]} style={{ left: REC_X, top: ROW - REC_PX / 2 - 1 }} />
    </>
  );
};

const TimeStamp: React.FC<{ f: number; intro: boolean; out: boolean }> = ({ f, intro, out }) => {
  const st = stampAt(f), t = intro ? st.t : HOLD + SHRINK;
  const min = clockAt(f), dA = digitsAlpha(f);
  const r = rows(wordOf(f, st.id, min), clockText(min));
  const kin = easeOutCubic(clamp01((t + 1) / IN)), op = clamp01((t + 1) / 5), ks = stampK(t);
  const s = ST.big + (1 - ST.big) * ks, y = ST.bigY + (ST.y - ST.bigY) * ks, dx = -40 * (1 - kin);
  // the English row comes in a few frames after the Chinese one (it settles under the running clock)
  const opSmall = clamp01((t - 3) / 6);
  return (
    <div style={{ position: "absolute", left: ST.x + dx, top: y, width: STAMP_W, height: STAMP_H, transform: `scale(${s.toFixed(4)})`, transformOrigin: "0 0", opacity: op }}>
      {dA >= 1 || !r.word ? (
        <div style={{ opacity: r.word ? 1 : dA }}>
          <Inked px={ST.zh} ls={1} runs={[{ text: r.word ? `${r.word} ` : "", color: out ? OFF.fill : HC.goldPale }, { text: r.clock, color: out ? OFF.fill : HC.warm }]} style={{ left: 0, top: 0 }} />
        </div>
      ) : (
        // decision 2: the word alone, its digits (if any) fading in / out after it
        <>
          <Inked px={ST.zh} ls={1} runs={[{ text: r.word, color: out ? OFF.fill : HC.goldPale }]} style={{ left: 0, top: 0 }} />
          {dA > 0 ? (
            <div style={{ opacity: dA }}>
              <Inked px={ST.zh} ls={1} runs={[{ text: r.clock, color: out ? OFF.fill : HC.warm }]} style={{ left: textW(`${r.word} `, ST.zh, 1), top: 0 }} />
            </div>
          ) : null}
        </>
      )}
      {r.small ? (
        <div style={{ opacity: opSmall }}>
          <Inked px={ST.en} ls={r.smallLs} runs={[{ text: r.small, color: out ? OFF.small : HC.ivory }]} style={{ left: 1, top: ST.zh + ST.gap }} />
        </div>
      ) : null}
    </div>
  );
};

const Battery: React.FC<{ f: number; still: boolean; out: boolean }> = ({ f, still, out }) => {
  const pct = batteryAt(f), lvl = out ? 0 : Math.max(0.12, pct / 100);   // a red sliver always shows (none once off)
  const fill = pct > 35 ? "#9ad66f" : pct > 15 ? HC.gold : "#ff5a46";
  const line = out ? OFF.fill : HC.warm;
  const breathe = pct <= 15 && !still ? 0.45 + 0.55 * (0.5 + 0.5 * blinkCos(f)) : 1;   // with the lamp
  const { w, h } = BAT, x1 = BAT.x1, x0 = x1 - w, y0 = ROW - h / 2, inner = w - 14;
  return (
    <>
      <svg width={1080} height={400} viewBox="0 0 1080 400" style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <rect x={x0} y={y0 + 3} width={w} height={h} rx={9} fill="none" stroke="rgba(10,6,4,0.45)" strokeWidth={12} />
        <rect x={x1 - 1} y={ROW - 8} width={9} height={16} rx={3} fill={line} stroke={HC.ink} strokeWidth={6} style={{ paintOrder: "stroke fill" } as React.CSSProperties} />
        <rect x={x0} y={y0} width={w} height={h} rx={9} fill="rgba(20,13,9,0.30)" stroke={HC.ink} strokeWidth={12} />
        <rect x={x0} y={y0} width={w} height={h} rx={9} fill="none" stroke={line} strokeWidth={4.5} />
        {lvl > 0 ? <rect x={x0 + 7} y={y0 + 7} width={(inner * lvl).toFixed(2)} height={h - 14} rx={3.5} fill={fill} opacity={breathe.toFixed(3)} /> : null}
      </svg>
      <Inked px={BAT.px} runs={[{ text: `${pct}%`, color: out ? OFF.fill : pct > 15 ? HC.warm : "#ffd2c8" }]} style={{ right: 1080 - (x0 - 14), top: ROW - BAT.px / 2 - 1 }} />
    </>
  );
};

// ---------------------------------------------------------------------------------------------------- the vlog UI
/** `lit` 0..1 (default 0): the REC lamp held LIT over its breathing while the rest of the UI shows frame f (Film.tsx: on
 *  the lead card's freeze, where f is the held frame, the lamp stays lit: her camera is still recording) */
export const VlogHud: React.FC<{ f: number; rec?: boolean; cards?: boolean; lit?: number }> = ({ f, rec, cards, lit = 0 }) => {
  useOverlayFont();
  const showRec = rec !== false, out = f >= OFF_AT, fz = Math.min(f, OFF_AT);   // from the off frame the UI holds OFF_AT
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {showRec ? <RecMark f={fz} out={out} lit={lit} /> : null}
      {showRec ? <TimeStamp f={fz} intro={cards !== false} out={out} /> : null}
      <Battery f={fz} still={rec === false || out} out={out} />
    </AbsoluteFill>
  );
};
/** the scenes' first frames (where the timestamp slides in) */
export const STAMP_AT: number[] = SEGMENTS.map((s) => s.from);
