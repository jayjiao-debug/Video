// 《为什么小组作业总有人划水？》 film engine: timing, easing, the segment contract and the segment table.
// Engine files (owned by the engine; segment builders treat them as read-only and ask for changes):
//   story.ts     this file: FPS / frames, voice lines, easing + RNG helpers, the Segment / Pose types, SEGMENTS
//   world.ts     World: both sets (classroom, lab) built ONCE, each in its own THREE.Scene; casts; actor / rope pools
//   captions.ts  the timed caption groups (gold keys) -> drawn by <Caption> in Film.tsx
//   Film.tsx     the composition "GroupFilm": builds the World, picks the segment for the frame, runs enter / exit /
//                pose, applies camera + scene + post (N8AO, InkPass, lens blur, bloom, NEUTRAL, grade), draws overlays,
//                then the caption, then `top`
//   shots/segA.ts .. segD.ts   one file per builder (see SEGMENTS)
// THE FILM LOOPS: frame TOTAL-1 hands back to frame 0 (same camera, same people in the same poses). segD ends on
// exactly segA's f0 state.
// =====================================================================================================================
// HOW TO BUILD A SEGMENT (read all of it before you write code)
// =====================================================================================================================
// 0. Your files. You own shots/segX.ts and any NEW files you create with your prefix (shots/segX_*.ts, preview entries
//    preview/segX_*.ts, stills in S/group/previews/segX/). Everything else (kit/*, sets/*, world.ts, story.ts,
//    captions.ts, Film.tsx, other segments) is read-only for you. If you need an engine change, say so in your report
//    (kitRequests); if you need a kit helper changed, copy it into your own file.
//
// 1. The contract. shots/segX.ts exports SEG: Segment (type below):
//      export const SEG: Segment = { id: "A", from: 0, to: 535, enter(w) {...}, exit(w) {...}, pose(w, f) {...} };
//    from / to are inclusive absolute film frames and must equal SEGMENTS[...] below (the engine checks this).
//    The engine, for every rendered frame f:
//      if the segment changed (or this is the first frame of the page):  old.exit(w); w.reset(); SEG.enter(w)
//      w.beginFrame(f);  const P = SEG.pose(w, f);  w.endFrame(P)   (scene visibility, camera, cast update safety net)
//    then draws P.overlays over the 3D picture, the caption of frame f over that, and P.top over everything.
//
// 2. Any frame can be the first one. The farm renders 20 chunks that start at arbitrary frames, each in a fresh page,
//    and a still is a fresh page too. So:
//      - pose(w, f) is a PURE function of f: it sets EVERY property it relies on, EVERY frame (camera, light state,
//        window / door / ceiling openings, prop visibility, every acquired figure's full state, every rope's update).
//        Never keep state between frames (no "previous frame" variables, no accumulators, no lazy one-shot flags that
//        change the picture). Derive everything from f, e.g. t = (f - 60) / FPS for "seconds since the drop".
//      - enter(w) only ACQUIRES objects (w.lab.actors.acquire(look), w.lab.ropes.acquire({score}), ...) and builds
//        your own cached things (textures, canvases, meshes) once; keep them in module-level variables guarded by
//        "if (!built)" so a second enter() reuses them. exit(w) releases what you acquired and RESTORES anything you
//        changed on shared objects (set light state, window / door / ceiling, hidden set props, swapped textures,
//        crowd.state, materials). The engine also calls w.reset() between segments as a safety net (all pools
//        released, both sets back to their default state), but do not rely on it for things you added.
//      - Determinism: no Math.random, Date, performance.now or wall time in anything that affects pixels. Use rng(seed)
//        / hash(i, k) from this file. Canvas text must use the loaded font (FONT_STACK from kit/overlay) only.
//
// 3. Inside pose(w, f), in this order:
//      a. camera: const cam = { pos, look, fov, roll? };  w.setCamera(cam)   <- FIRST: cards face the camera and every
//         hand point / projection depends on it. (Return the same cam in the Pose.)
//      b. set state: w.lab.set.setDial(v) / animate(t); w.classroom.set.animate(t)
//      c. people: fig.set({...full FigState...}) for every figure you acquired (kit/cast.ts header); classroom
//         background students via w.classroom.crowd.state = (i, t) => ... (EMPTY_CROWD / BG_STUDENT in world.ts)
//      d. w.lab.update(t) / w.classroom.update(t): solves the cards for the current camera (cast.update). Rope holders
//         need the two-pass aim solve (kit/cast.ts header): set, update, re-aim at the real hands, update again.
//      e. ropes: rope.update({ a, b, ... }) every frame, ends at fig.handWorld(arm) (the stick-limb tip)
//      f. overlays: positions from w.project(worldPoint) -> {x, y} in 1080 x 1920 px; React nodes with h(...) (segment
//         files are .ts: no JSX) from kit/overlay.tsx or your own
//      g. return { scene: "classroom" | "lab" | "phone2d", camera: cam, overlays, top?, post?, captions? }
//    scene "phone2d" = no 3D at all: your overlays must fill the frame.
//    post: { dof: {focus (m), amount (blur px at infinity, 0 = off)}, bloom, grade / gradeAmount, ink, ao }.
//
// 4. THE OWNER'S RULES FOR THIS FILM (he stopped the last film for breaking them):
//    - Plain, readable cameras: eye level (1.1-1.6 m), slow eased push-ins / pull-backs / gentle pans. NO top-down,
//      NO worm's-eye, NO shots from behind a head that fills the frame, NO following a rope along the floor, no roll.
//    - No metaphors: everything on screen is literal (the rope is the real experiment's rope).
//    - Logic: every action must make sense (people pull TOWARD themselves, away from the gauge; a blindfolded person
//      cannot see; pretenders' rope sags; a person on a phone looks at the phone; hands hold things at the limb tips).
//    - Legs from the hip, seated figures on a seat (seat: {...}), standing ones on the floor; no 穿模 (check with
//      geometry: rope.clearance / distances, not only by eye).
//    - The first 5 s must move. Scene changes are motivated camera moves (push into a phone screen, push into the
//      dial, match the round dial to the round wall clock), never crossfades. Labels leave before a move starts.
//    - Characters must feel alive (see S/refstudy/ notes when ready): expression changes on key words, blinks, small
//      idle motion; nobody frozen.
//    - Screen zones: nothing key in the caption band y 62-78 %, nothing key below y 84 %.
//
// 5. Checking. Stills (never clips):
//      cd B && B=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell \
//        COMP=GroupFilm node scripts/stills.mjs ../group/previews/segX/x_ 0,15,30 0.5
//    (prefix, comma-separated absolute frames, scale; each still is a fresh page: World build + one frame). Input props
//    (IP='{"dbg":true}' before the command): dbg logs the world build and pose times; nopost = raw scene; nocap = no captions.
//
// 6. Hand-offs. Your first and last frames must equal the neighbouring segment's (camera exactly, who is where, the
//    dial value, no overlays left). Captions are the engine's: never draw your own.
// =====================================================================================================================
import React from "react";
import type * as THREE from "three";
import type { GradeParams } from "../vasa/grade";
import type { World } from "./world";

// ---------------------------------------------------------------------------------------------------- film constants
export const FPS = 30;
export const W = 1080, H = 1920;
/** film length: f0..f2002 (66.8 s); speech ends f1986; then the loop back to f0 */
export const TOTAL = 2003;
export const TITLE = "为什么小组作业总有人划水？";
/** the H3 sky joint (storyboard §4 H3): top, middle (50 %), bottom of the screen-space gradient */
export const SKY_H3: [string, string, string] = ["#7FA6D8", "#C7B9D2", "#F3C9A2"];
/** caption band (storyboard §0.1): centre y 70 %, band y 64-76 % */
export const CAPTION_Y = 0.7 * H;

// ---------------------------------------------------------------------------------------------------- the contract
export type Vec3 = [number, number, number];
export type V3Like = Vec3 | THREE.Vector3;
export type SceneId = "classroom" | "lab" | "phone2d";
/** a camera pose: applied as camera.up = up ?? (0,1,0); position = pos; lookAt(look); rotateZ(roll ?? 0) (the dorm
 *  kit convention, radians); fov (vertical, degrees); near / far default 0.03 / 600 */
export type CamPose = { pos: V3Like; look: V3Like; fov: number; roll?: number; up?: Vec3; near?: number; far?: number };
export type PostPose = {
  /** depth of field: focus distance (m) and blur-disc radius in px (at 1080 x 1920) of things at infinity; 0 = off */
  dof?: { focus: number; amount: number } | null;
  /** bloom intensity (threshold 1.0: only emissive / glowing things bloom) */
  bloom?: number;
  /** colour grade preset (vasa/grade GradeParams) and its strength 0..1 */
  grade?: GradeParams; gradeAmount?: number;
  /** ink outline strength 0..1 (1 = default) */
  ink?: number;
  /** N8AO intensity multiplier (1 = the set's value) */
  ao?: number;
};
export type Pose = {
  scene: SceneId;
  camera: CamPose;
  /** 2D layer above the 3D picture and below the captions */
  overlays?: React.ReactNode;
  /** 2D layer above the captions (the end card only) */
  top?: React.ReactNode;
  post?: PostPose;
  /** 0..1: the SKY_H3 gradient faded over the 3D picture (the H3 joint). scene "sky" is always 1 */
  sky?: number;
  /** false hides the caption on this frame (default: shown when the caption table has one) */
  captions?: boolean;
};
export type Segment = {
  id: string;
  /** inclusive absolute frames */
  from: number; to: number;
  /** acquire pooled objects, build your own cached things (once) */
  enter(w: World): void;
  /** release what you acquired, restore every shared thing you changed */
  exit(w: World): void;
  /** pure function of f: pose the world and the camera, return what to show */
  pose(w: World, f: number): Pose;
};

/** the four build segments (script_v1.md in /mnt/project-files/next-video/group-project/). */
export const SEGMENTS: { id: string; from: number; to: number; shots: string }[] = [
  { id: "A", from: 0, to: 265, shots: "lines 01-02: classroom, the four teammates; push into YOUR phone -> the lab" },
  { id: "B", from: 266, to: 770, shots: "lines 03-06: lab, 1 / 2 / 3 / 6 pullers, 91 82 78 %, out of step" },
  { id: "C", from: 771, to: 1366, shots: "lines 07-10: lab, blindfold, pretenders + slack rope, 90 85 %, push into the dial" },
  { id: "D", from: 1367, to: TOTAL - 1, shots: "lines 11-15: dial -> classroom clock, 78 studies, names on the slide, phone, loop back to f0" },
];

/** React.createElement for overlays in .ts segment files: h(RopeCounter, { at: 8, x, y }) */
export const h = React.createElement;

// ---------------------------------------------------------------------------------------------------- voice
// From S/group/vo1/voice_timing.json (Jin, eleven_v4, speed 1.12). f = round(seconds x 30).
const RAW: [number, number, number, string][] = [
  [1, 0.0, 3.397, "小组作业总有人划水，可能也包括你。"],
  [2, 3.547, 8.331, "只要以为身后有几个人帮你，你就会少出百分之十五的力。"],
  [3, 9.031, 13.034, "一九七四年，心理学家让人拉绳子测力气。"],
  [4, 13.184, 16.571, "两个人一起拉，每人只出百分之九十一；"],
  [5, 16.721, 21.205, "三个人，百分之八十二；六个人，只剩百分之七十八。"],
  [6, 21.505, 25.44, "你可能会说：人一多，大家使劲不同步嘛。"],
  [7, 25.89, 30.407, "于是他们蒙上你的眼睛，告诉你身后还有人一起拉。"],
  [8, 30.557, 33.422, "其实绳子上，只有你一个人在用力。"],
  [9, 33.572, 39.708, "以为有一个帮手，你出百分之九十；以为有两到六个，只剩百分之八十五。"],
  [10, 39.958, 45.126, "这回没有同步的问题，少的这百分之十五，是你自己松的劲。"],
  [11, 45.826, 49.212, "因为人一多，就没人看得见你出了多少力。"],
  [12, 49.362, 52.775, "七十八项研究放在一起看，结论都一样："],
  [13, 52.925, 57.643, "只要每个人那份能被单独看见，划水几乎就消失了。"],
  [14, 58.043, 62.395, "可我们分工时，最爱写的偏偏是“大家一起做”。"],
  [15, 62.695, 66.206, "谁出了多少力，谁也看不见，所以——"],
];
export type VoiceLine = { n: number; text: string; from: number; to: number; start: number; end: number };
/** the 15 narration lines in frames (from = first frame of speech, to = last) */
export const LINES: VoiceLine[] = RAW.map(([n, s, e, text]) => ({ n, text, start: s, end: e, from: Math.round(s * FPS), to: Math.round(e * FPS) }));
export const SPEECH_END = Math.round(66.206 * FPS);
/** the line spoken at frame f (or null in a pause) */
export const lineAt = (f: number) => LINES.find((l) => f >= l.from && f <= l.to) ?? null;

// ---------------------------------------------------------------------------------------------------- easing
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** 0..1 linear ramp of f between f0 and f1 (clamped) */
export const lin = (f: number, f0: number, f1: number) => (f1 === f0 ? (f >= f1 ? 1 : 0) : clamp01((f - f0) / (f1 - f0)));
export const smooth = (x: number) => { const t = clamp01(x); return t * t * (3 - 2 * t); };
export const smootherstep = (x: number) => { const t = clamp01(x); return t * t * t * (t * (t * 6 - 15) + 10); };
export const easeInQuad = (x: number) => { const t = clamp01(x); return t * t; };
export const easeOutQuad = (x: number) => { const t = clamp01(x); return 1 - (1 - t) * (1 - t); };
export const easeInOutQuad = (x: number) => { const t = clamp01(x); return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
export const easeInCubic = (x: number) => Math.pow(clamp01(x), 3);
export const easeOutCubic = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
export const easeInOutCubic = (x: number) => { const t = clamp01(x); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
/** overshooting ease-out (back): passes 1 by ~10 % (s = 1.70158) and settles */
export const easeOutBack = (x: number, s = 1.70158) => { const t = clamp01(x) - 1; return 1 + (s + 1) * t * t * t + s * t * t; };
/** eased 0..1 between frames f0 and f1 */
export const between = (f: number, f0: number, f1: number, e: (x: number) => number = easeInOutCubic) => e(lin(f, f0, f1));
/** damped spring from 0 to 1, t = seconds since the start (0 before): overshoots by ~e^(-pi zeta / sqrt(1 - zeta^2)) */
export const spring = (t: number, o: { freq?: number; zeta?: number } = {}) => {
  if (t <= 0) return 0;
  const w = 2 * Math.PI * (o.freq ?? 3), z = Math.min(0.99, o.zeta ?? 0.45), wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + (z / Math.sqrt(1 - z * z)) * Math.sin(wd * t));
};
/** pop-in scale: 0 before `at`, up to `over` at 60 % of `dur` frames, settles to 1 at `dur` (storyboard: 0 -> 1.08 -> 1 over 5 f) */
export const pop = (f: number, at: number, dur = 5, over = 1.08) => {
  if (f < at) return 0;
  const x = (f - at) / dur;
  if (x >= 1) return 1;
  return x < 0.6 ? over * easeOutQuad(x / 0.6) : lerp(over, 1, smooth((x - 0.6) / 0.4));
};
/** keyframe spline: Catmull-Rom through [frame, value] keys (numbers or Vec3), clamped before the first / after the
 *  last key. `ease` reshapes the parameter inside each key interval (default linear: constant-ish speed). */
export function spl(keys: [number, number][], f: number, ease?: (x: number) => number): number;
export function spl(keys: [number, Vec3][], f: number, ease?: (x: number) => number): Vec3;
export function spl(keys: [number, number | Vec3][], f: number, ease: (x: number) => number = (x) => x): number | Vec3 {
  const n = keys.length;
  if (n === 0) return 0;
  const first = keys[0], last = keys[n - 1];
  if (f <= first[0]) return first[1];
  if (f >= last[0]) return last[1];
  let i = 0; while (i < n - 2 && f > keys[i + 1][0]) i++;
  const u = ease(clamp01((f - keys[i][0]) / (keys[i + 1][0] - keys[i][0])));
  const g = (j: number) => keys[Math.max(0, Math.min(n - 1, j))][1];
  const cr = (p0: number, p1: number, p2: number, p3: number) =>
    0.5 * (2 * p1 + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (-p0 + 3 * p1 - 3 * p2 + p3) * u * u * u);
  const a = g(i - 1), b = g(i), c = g(i + 1), d = g(i + 2);
  if (typeof b === "number") return cr(a as number, b, c as number, d as number);
  return [0, 1, 2].map((k) => cr((a as Vec3)[k], (b as Vec3)[k], (c as Vec3)[k], (d as Vec3)[k])) as Vec3;
}
const arr = (v: V3Like): Vec3 => (Array.isArray(v) ? v : [v.x, v.y, v.z]);
/** Vec3 lerp */
export const mix3 = (a: V3Like, b: V3Like, t: number): Vec3 => { const A = arr(a), B = arr(b); return [lerp(A[0], B[0], t), lerp(A[1], B[1], t), lerp(A[2], B[2], t)]; };
export const add3 = (a: V3Like, b: V3Like): Vec3 => { const A = arr(a), B = arr(b); return [A[0] + B[0], A[1] + B[1], A[2] + B[2]]; };
/** blend two camera poses (pos, look, fov, roll linearly; up / near / far from `a`) */
export const camMix = (a: CamPose, b: CamPose, t: number): CamPose => ({
  pos: mix3(a.pos, b.pos, t), look: mix3(a.look, b.look, t), fov: lerp(a.fov, b.fov, t), roll: lerp(a.roll ?? 0, b.roll ?? 0, t),
  up: a.up, near: a.near, far: a.far,
});

// ---------------------------------------------------------------------------------------------------- seeded RNG
/** mulberry32: rng(seed)() -> 0..1, a deterministic stream */
export const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
};
/** stateless hash -> 0..1 of (i, k) */
export const hash = (i: number, k = 0) => { const v = Math.sin(i * 91.7 + k * 47.3 + 0.123) * 43758.5453; return v - Math.floor(v); };
/** seconds since frame f0 (negative before it) */
export const since = (f: number, f0: number) => (f - f0) / FPS;
