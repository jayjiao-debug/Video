// THE NINE SCENES as segments. Each scene shows the stage scenes of scenes.ts (the room round her picture, the state of
// the panel, the side cast) by the line that is being said (PLAN), with the lips of whoever speaks, her face by the
// line (MOOD), and the scene's own camera plan (ACT): one take per scene, a move only where the scene gives a reason.
// Every frame number comes from the timeline (story.ts): nothing here is a copied number.
import React from "react";
import { line, seg, FPS, type Segment, type SceneId, type Speaker } from "../story";
import { handheld, povCam } from "../cam";
import { capWord } from "../captions";
import { easeOutCubic, smooth } from "../../group/story";
import type { CamPose } from "../../../kit/day/types";
import type { World } from "../world";
import { WZ, SPOTS } from "../sets/stage";
import { saying, speak } from "./common";
import { SCENES, SHOTS, poseScene, type Scene, type V3 } from "../scenes";
import type { RigMouth, RigState } from "../../group/kit/rig3d";
import { MONA, LEONARDO, NAPOLEON, FACES, type Person } from "../people";

// ------------------------------------------------------------------------------------------------------- the plan
/** which stage scene shows from which line on (from the silent beat before that line; `at` = a share 0..1 of the line's
 *  own words instead, `plus` = frames after that) */
type Beat = { from: string; scene: string; at?: number; plus?: number; black?: boolean };
const PLAN: Record<SceneId, Beat[]> = {
  A: [{ from: "A01", scene: "s1" }],
  B: [{ from: "B04", scene: "s2" }],
  C: [{ from: "C13", scene: "s3" }],
  // (the king's walls are swapped behind her: one wall a line; then the bedroom of 1800)
  D: [{ from: "D20", scene: "s4a" }, { from: "D21", scene: "s4b" }, { from: "D22", scene: "s4c" }, { from: "D23", scene: "s4d" }],
  // (the trunk: black from E28's silent beat to E33; the empty wall shows for the beat after E30; back on her wall for E34)
  E: [{ from: "E25", scene: "s5" }, { from: "E28", scene: "s5", black: true }, { from: "E30", scene: "s5b", at: 1, plus: 8 }, { from: "E31", scene: "s5", black: true }, { from: "E34", scene: "s5c" }],
  // (the stone inside F35, the cake after it, the soup after F36, the glass wiped after F38)
  F: [{ from: "F35", scene: "s6" }, { from: "F35", scene: "s6b", at: 0.6 }, { from: "F35", scene: "s6c", at: 1, plus: 22 }, { from: "F36", scene: "s6d", at: 1, plus: 12 }, { from: "F38", scene: "s6", at: 1, plus: 10 }],
  G: [{ from: "G43", scene: "s7" }],
  // (she lets go after "你可以动了")
  H: [{ from: "H47", scene: "s8a" }, { from: "H51", scene: "s8", at: 1, plus: 24 }],
  I: [{ from: "I53", scene: "s9" }],
};
const beatFrame = (b: Beat) => { const l = line(b.from); return (b.at === undefined ? l.preFrom : Math.round(l.from + (l.to - l.from) * b.at)) + (b.plus ?? 0); };
/** the inside of the trunk and the end: black under the subtitles (her REC lamp comes back on top with the film's own HUD) */
const BLACK = React.createElement("div", { style: { position: "absolute", inset: 0, background: "#000" } });

// ------------------------------------------------------------------------------------------------------ her face
/** HER FACE BY THE LINE (the script's Emotion column): from 4 frames before the line's first word the face is the
 *  named one of people.ts FACES; `at` (a share of the line's words) / `plus` (frames) move the change. The change
 *  itself hides under two frames of shut lids (a sink for a face going quiet, a snap back to the pose). */
type MoodKey = { line: string; face: string; at?: number; plus?: number };
const MOOD: MoodKey[] = [
  { line: "A01", face: "pose" },
  { line: "B05", face: "wuyu" }, { line: "B08", face: "pose" }, { line: "B08", face: "yawn", at: 1, plus: 16 }, { line: "B08", face: "caught", at: 1, plus: 52 }, { line: "B09", face: "pose", plus: 2 },
  { line: "C14", face: "pose" }, { line: "C16", face: "plain" }, { line: "C17", face: "pose" }, { line: "C19", face: "plain" },
  { line: "D20", face: "pose" }, { line: "D22", face: "wuyu" }, { line: "D24", face: "pose" },
  { line: "E25", face: "bright" }, { line: "E27", face: "pose" }, { line: "E34", face: "pose" },
  { line: "F35", face: "wuyu" }, { line: "F35", face: "caught", at: 0.6 }, { line: "F36", face: "pose" }, { line: "F38", face: "wuyu" }, { line: "F39", face: "plain", at: 0.7 }, { line: "F40", face: "pose" },
  { line: "F41", face: "plain", at: 1, plus: 6 }, { line: "F42", face: "caught", plus: -12 }, { line: "F42", face: "pose", at: 0.5 },
  { line: "G43", face: "pose" }, { line: "G45", face: "hold", plus: -6 },
  { line: "H47", face: "plain" }, { line: "H49", face: "pose" }, { line: "H50", face: "sigh" }, { line: "H51", face: "plain", at: 1 }, { line: "H52", face: "sore", plus: -30 },
  { line: "I53", face: "pose" },
];
const MOODS = MOOD.map((m) => { const l = line(m.line); return { f: (m.at === undefined ? l.from - 4 : Math.round(l.from + (l.to - l.from) * m.at)) + (m.plus ?? 0), face: m.face }; }).sort((a, b) => a.f - b.f);
const moodAt = (f: number) => { let m = MOODS[0], at = -999; for (const x of MOODS) if (f >= x.f) { if (x.face !== m.face) at = x.f; m = x; } return { face: m.face, since: f - at }; };
/** her blink: slow and rare (one every 4 to 6 seconds, 4 frames: half, shut, shut, half) */
const slowBlink = (f: number) => { const P = 150, k = Math.floor(f / P), at = k * P + 40 + ((k * 37) % 50), d = f - at; return d === 0 || d === 3 ? 0.5 : d === 1 || d === 2 ? 1 : 0; };

/** HER WAY OF TALKING (the personality sheet's first tic): on duty she talks through the smile. The lips barely move: a
 *  closed beat shows the smile itself, an open one is the rig's "pill", which her face draws as the smile with the lips
 *  just parted (acc/face.ts). After closing (scene H) her lips move like anyone's for the first time; in the button
 *  (scene I) they do not move at all. */
const DUTY: Partial<Record<RigMouth, RigMouth>> = { small: "pill", half: "pill", wide: "pill", round: "pill", tongue: "pill" };
const herMouth = (id: SceneId, m: RigMouth | undefined): RigMouth | undefined => (m === undefined ? m : id === "H" ? (m === "pill" ? "strip" : m) : id === "I" ? undefined : DUTY[m]);
const VOICES: [Speaker, Person][] = [["mo", MONA], ["le", LEONARDO], ["na", NAPOLEON]];

// ------------------------------------------------------------------------------------------------- the camera plans
type P3 = [number, number, number];
/** her face and her mouth in the picture (she stands at the origin, lifted to eye height) */
const FACE: P3 = [0, 1.56, 0.2], MOUTH: P3 = [0, 1.5, 0.2], BROW: P3 = [0, 1.63, 0.2];
/** the wall behind her at picture height: the resting look point */
const WALL: P3 = [0, 1.36, WZ];
const shot = (n: string) => SHOTS[n];
const lerp3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
type Act = (w: World, f: number, sc: Scene) => CamPose & { black?: boolean };

// A, the cold open (one take, three moves):
//   1 she comes in through the workshop door and walks up to the easel (the place: a bare panel with only a head on it)
//   2 she stops, level with the head: the head is talking. On "allieva" (徒弟) the painted eyes slide to the lens.
//   3 SNAP ZOOM to the mouth on "ferma" (别动): it does not move. Held: the title lands on this picture.
const sceneA: Act = (w, f) => {
  const S = seg("A"), l1 = line("A01");
  const stop = l1.from - 10, look1 = capWord("A01", "allieva").from, snap = capWord("A03", "ferma").from;
  w.actor(MONA).set({ gaze: f < look1 ? 1.0 : f < look1 + 3 ? 0.5 : 0 });
  const P: P3 = [0.18, 1.5, 4.3];
  return povCam(f, [
    { f: S.from, pos: [1.05, 1.5, 6.5], look: [0.3, 1.25, WZ], fov: 44 },
    { f: stop, pos: P, look: WALL, fov: 36 },
    { f: snap - 1, pos: P, look: WALL, fov: 36 },
    { f: snap + 4, pos: P, look: MOUTH, fov: 19, ease: easeOutCubic },
  ], { mood: "calm", walk: [[S.from, 1], [stop - 6, 0]] });
};
// B, the fourth year (four moves):
//   1 "他们是谁？": a tilt down to the jester and back up to her (the question is about him)
//   2 medium close on her for the three jokes
//   3 SNAP ZOOM on "vanno" (不走) and HOLD: the yawn happens in this close view, and she catches the lens
//   4 back out to the medium for the master's voice and "one stroke to go"
const sceneB: Act = (w, f) => {
  const S = seg("B"), l4 = line("B04"), l5 = line("B05"), l8 = line("B08"), l9 = line("B09"), l10 = line("B10");
  const snap = capWord("B08", "vanno").from, yawn0 = l8.to + 16, yawn1 = l8.to + 52;
  const jester: P3 = [-0.52, 0.98, 1.55], M: P3 = [0.12, 1.5, 3.9];
  // (the yawn: the widest mouth, the eyes shut; then caught: her eyes on the lens)
  if (f >= yawn0 && f < yawn1) w.actor(MONA).set({ mouth: f < yawn0 + 3 || f >= yawn1 - 4 ? "half" : "wide", blink: 1, head: { tilt: -4, dy: 0.02 } as RigState["head"] });
  w.actor(MONA).set({ gaze: f >= yawn1 && f < l10.from ? 0 : 0.5 });
  return povCam(f, [
    { f: S.from, pos: [0.35, 1.5, 4.9], look: [-0.1, 1.22, 1.0], fov: 40 },
    { f: l4.from, pos: [0.35, 1.5, 4.9], look: [-0.1, 1.22, 1.0], fov: 40 },
    { f: l4.to, pos: [0.3, 1.5, 4.6], look: jester, fov: 36 },
    { f: l5.from - 4, pos: M, look: [0, 1.44, WZ], fov: 32 },
    { f: snap - 1, pos: M, look: [0, 1.44, WZ], fov: 32 },
    { f: snap + 4, pos: M, look: FACE, fov: 20, ease: easeOutCubic },
    { f: l9.to + 6, pos: M, look: FACE, fov: 20 },
    { f: l10.from, pos: M, look: [0, 1.44, WZ], fov: 32 },
  ], { mood: "calm" });
};
// C, Cloux 1517 (four moves):
//   1 medium: she and the sleeping master both in frame
//   2 a step back wide on "pittore" (跑了): the panel and the old man, far from Florence
//   3 a tilt down to his right hand while he mumbles (the fact card sits on this view)
//   4 a tilt back up to her and one slow push
const sceneC: Act = (w, f) => {
  const S = seg("C"), l17 = line("C17"), l18 = line("C18"), l19 = line("C19");
  const back = capWord("C17", "pittore").from, hand: P3 = [-0.47, 0.55, 1.87];
  const M: P3 = [0.3, 1.5, 4.9], look: P3 = [-0.14, 1.2, 1.0];
  return povCam(f, [
    { f: S.from, pos: M, look, fov: 40 },
    { f: back, pos: M, look, fov: 40 },
    { f: back + 22, pos: [0.65, 1.5, 6.3], look: [-0.1, 1.2, 1.0], fov: 46 },
    { f: l17.to + 20, pos: [0.65, 1.5, 6.3], look: [-0.1, 1.2, 1.0], fov: 46 },
    { f: l18.from + 6, pos: [0.3, 1.5, 4.6], look: hand, fov: 30 },
    { f: l19.preFrom + 50, pos: [0.3, 1.5, 4.6], look: hand, fov: 30 },
    { f: l19.from - 4, pos: [0.2, 1.5, 4.2], look: [0, 1.42, WZ], fov: 32 },
    { f: S.to, pos: [0.12, 1.5, 3.7], look: FACE, fov: 30 },
  ], { mood: "calm" });
};
// D, the king's walls and the bedroom (still while the walls change behind her; then two moves):
//   1 still, on the frame: the walls are swapped, not the view
//   2 the bedroom: from the small man in the bed, a tilt up to her
//   3 SNAP ZOOM on "letto" (床头), her eyes on the lens
const sceneD: Act = (w, f, sc) => {
  const l23 = line("D23"), l24 = line("D24"), bed = shot("bed"), room = shot("room");
  if (sc.room !== "bedroom") return handheld({ pos: room.pos, look: room.look, fov: room.fov }, f, { mood: "calm" });
  const b = SPOTS.bed, him: P3 = [b.at[0], b.top + 0.55, b.at[2]], snap = capWord("D24", "letto").from;
  w.actor(MONA).set({ gaze: f >= l24.from - 4 ? 0 : -0.5 });
  return povCam(f, [
    { f: l23.preFrom, pos: bed.pos, look: lerp3(him, bed.look, 0.25), fov: 34 },
    { f: l23.to, pos: bed.pos, look: lerp3(him, bed.look, 0.25), fov: 34 },
    { f: l24.from - 2, pos: bed.pos, look: [-0.05, 1.4, WZ], fov: 34 },
    { f: snap - 1, pos: bed.pos, look: [-0.05, 1.4, WZ], fov: 34 },
    { f: snap + 4, pos: bed.pos, look: FACE, fov: 21, ease: easeOutCubic },
  ], { mood: "calm" });
};
// E, 1911 (the theft: hurried and handheld; then the dark of the trunk; then her wall again):
//   1 the gallery, the thief already at her frame; a quick push to her on "接我了"
//   2 black (the trunk); the empty wall for one beat; black
//   3 back on her wall, still
const sceneE: Act = (w, f, sc) => {
  const S = seg("E"), l25 = line("E25"), th = shot("theft");
  if (sc.who?.includes("thief")) return povCam(f, [
    { f: S.from, pos: th.pos, look: th.look, fov: th.fov },
    { f: l25.from - 6, pos: th.pos, look: th.look, fov: th.fov },
    { f: l25.from + 14, pos: [0.42, 1.5, 4.5], look: [0.3, 1.36, WZ], fov: 33 },
  ], { mood: [[S.from, "calm"], [l25.from, "excited"]] });
  return handheld({ pos: th.pos, look: th.look, fov: th.fov }, f, { mood: "calm" });
};
// F, behind the glass (the crowd's backs along the bottom; three moves):
//   1 medium over the crowd while things hit the glass (the events come to her: the view stays)
//   2 a push to her for the child's line
//   3 SNAP ZOOM to her bare brow on "真没有"
const sceneF: Act = (w, f) => {
  const S = seg("F"), l39 = line("F39"), l41 = line("F41"), l42 = line("F42"), room = shot("room");
  const M: P3 = [0, 1.5, 3.7], snap = l41.from + 2;
  return povCam(f, [
    { f: S.from, pos: room.pos, look: room.look, fov: room.fov },
    { f: l39.preFrom, pos: room.pos, look: room.look, fov: room.fov },
    { f: l39.from + 10, pos: M, look: [0, 1.46, WZ], fov: 30 },
    { f: snap - 1, pos: M, look: [0, 1.46, WZ], fov: 30 },
    { f: snap + 4, pos: M, look: BROW, fov: 17, ease: easeOutCubic },
    { f: l42.from - 14, pos: M, look: BROW, fov: 17 },
    { f: l42.from - 4, pos: M, look: [0, 1.46, WZ], fov: 30 },
  ], { mood: "calm" });
};
// G, the turn: medium close, level, still. Nothing moves but her eyes; after "一直没画完" the lights go out.
const sceneG: Act = (w, f) => {
  const l46 = line("G46"), S = seg("G");
  const k = smooth((f - (l46.to + 8)) / Math.max(1, S.to - l46.to - 12));
  w.set.param("night", 0.72 * k);
  return handheld({ pos: [0, 1.5, 3.8], look: [0, 1.44, WZ], fov: 30 }, f, { mood: "still" });
};
// H, after closing (the quiet scene): one slow push for the whole scene, no other move, no handheld sway.
const sceneH: Act = (w, f) => {
  const S = seg("H"), k = (f - S.from) / (S.to - S.from);
  return { pos: [0, 1.5, 4.3 - 0.9 * k], look: [0, 1.46, WZ], fov: 30 };
};
// I, the button: the guard's torch sweeps in and rests on her face; close, still. After the last line the camera is
// switched off: black, and her voice over it.
const sceneI: Act = (w, f) => {
  const S = seg("I"), l53 = line("I53"), l54 = line("I54"), l55 = line("I55");
  const k = smooth((f - S.from - 20) / Math.max(1, l53.from - S.from - 40));
  w.set.param("torchX", 1.5 * (1 - k)); w.set.param("torchY", 1.6 - 0.25 * (1 - k)); w.set.param("torchK", 0.3 + 0.7 * k);
  return { ...handheld({ pos: [0, 1.5, 3.4], look: [0, 1.5, WZ], fov: 27 }, f, { mood: "still" }), black: f >= Math.round((l54.to + l55.from) / 2) };
};
const ACT: Record<SceneId, Act> = { A: sceneA, B: sceneB, C: sceneC, D: sceneD, E: sceneE, F: sceneF, G: sceneG, H: sceneH, I: sceneI };

// ------------------------------------------------------------------------------------------------------ segments
const make = (id: SceneId): Segment => {
  const S = seg(id), beats = PLAN[id].map((b) => ({ ...b, f: beatFrame(b) })).sort((a, b) => a.f - b.f);
  return {
    id, from: S.from, to: S.to,
    enter() {}, exit() {},
    pose(w, f) {
      let b = beats[0];
      for (const x of beats) if (f >= x.f) b = x;
      const sc: Scene = SCENES[b.scene], t = f / FPS;
      poseScene(w, sc, t);
      // (the lips of whoever speaks; a figure that is not in this scene's cast speaks from off screen)
      for (const [who, p] of VOICES) {
        const on = who === "mo" ? !sc.gone : (sc.who ?? []).includes(p.name as never);
        if (!on) continue;
        const q = saying(who, f), m = q ? speak(q, f, 1).mouth : undefined;
        w.actor(p).set({ mouth: who === "mo" ? herMouth(id, m) : m });
      }
      // (her face by the line, the change under shut lids; her slow, rare blink)
      if (!sc.gone) {
        const m = moodAt(f), keep = b.scene === "s8";
        w.actor(MONA).set({ ...(keep ? {} : { expr: FACES[m.face] as RigState["expr"] }), blink: m.since >= -1 && m.since <= 1 && m.face !== "caught" ? 1 : sc.blink ?? slowBlink(f) });
      }
      const { black, ...camera } = ACT[id](w, f, sc);
      return { camera, slate: `${id} ${b.scene}`, ...(b.black || black ? { overlays: BLACK } : {}) };
    },
  };
};
export const SEGS: Segment[] = (["A", "B", "C", "D", "E", "F", "G", "H", "I"] as SceneId[]).map(make);
