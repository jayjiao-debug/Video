// 《你的朋友，有几个也把你当朋友？》 film engine: timing, easing, the segment contract and the segment table.
// Engine files (owned by the engine; segment builders treat them as read-only and ask for changes):
//   story.ts     this file: FPS / frames, voice lines, easing + RNG helpers, the Segment / Pose types, SEGMENTS
//   world.ts     World: both sets built ONCE (each in its own THREE.Scene), casts, crowd, actor / rope / ghost pools,
//                the 775-rope web (lazy), the storyboard's named places re-fitted to the real anchors, projection
//   captions.ts  the caption groups of storyboard §1 (timed, gold keys) -> drawn by <Caption> in Film.tsx
//   Film.tsx     the composition "FriendsFilm": builds the World, picks the segment for the frame, runs enter / exit /
//                pose, applies camera + scene + post (N8AO, InkPass, lens blur, bloom, NEUTRAL, grade), draws overlays,
//                the H3 sky gradient, captions, then `top` (end card)
//   shots/segA.ts .. segE.ts   one file per builder (A f0-535, B f536-1012, C f1013-1352, D f1353-1812, E f1813-2285)
//
// =====================================================================================================================
// HOW TO BUILD A SEGMENT (read all of it before you write code)
// =====================================================================================================================
// 0. Your files. You own shots/segX.ts and any NEW files you create with your prefix (shots/segX_*.ts, preview entries
//    preview/segX_*.ts, stills in S/friends/previews/segX/). Everything else (kit/*, sets/*, world.ts, story.ts,
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
// 2. Any frame can be the first one. The farm renders 12 chunks that start at arbitrary frames, each in a fresh page,
//    and a still is a fresh page too. So:
//      - pose(w, f) is a PURE function of f: it sets EVERY property it relies on, EVERY frame (camera, light state,
//        window / door / ceiling openings, prop visibility, every acquired figure's full state, every rope's update).
//        Never keep state between frames (no "previous frame" variables, no accumulators, no lazy one-shot flags that
//        change the picture). Derive everything from f, e.g. t = (f - 60) / FPS for "seconds since the drop".
//      - enter(w) only ACQUIRES objects (w.dorm.actors.acquire(look), w.dorm.ropes.acquire({score}), ...) and builds
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
//      b. set state: w.dorm.set.setLight("evening") / setWindowOpen(...), w.classroom.set.setCeilingOpen(...), set.animate(t)
//      c. people: fig.set({...full FigState...}) for every figure you acquired; crowd: w.classroom.crowd.state = (i, t) => ...
//      d. w.dorm.update(t) / w.classroom.update(t): solves the cards for the current camera (cast.update). Two-person
//         ropes need the two-pass aim solve (kit/cast.ts header): set, update, re-aim at the real hands, update again.
//      e. ropes: rope.update({ a: fig.handWorld(1), b: ..., attachA: {kind: "coil", axis}, gold, ... }) every frame
//      f. overlays: positions from w.project(worldPoint) -> {x, y} in 1080 x 1920 px; build React nodes with h(...)
//         (segment files are .ts: no JSX) from kit/overlay.tsx (RopeCounter, Ticker, BigPercent, ...) or your own
//      g. return { scene: "dorm" | "classroom" | "sky" | "phone2d", camera: cam, overlays, top?, post?, sky?, captions? }
//    scene "sky" = the H3 joint: no 3D, the full-frame screen-space gradient SKY_H3 (top/mid/bottom). sky: 0..1 fades
//    the same gradient over a 3D scene (C: classroom -> sky f1336-1350; D: sky -> dawn f1355-1372).
//    scene "phone2d" = no 3D at all: your overlays must fill the frame (S18's chat UI).
//    post: { dof: {focus (m), amount (blur px at infinity, 0 = off)}, bloom (intensity), grade / gradeAmount, ink, ao }.
//    Omit post to get the scene defaults (no DOF, bloom .35 classroom / .45 dorm, the accepted BtCannon grade).
//
// 4. Where things are. The storyboard's DORM numbers match the current dorm build; w.dorm.marks has you0, bed1,
//    ladderFoot1, ladderKnot and w.dorm.cams the storyboard cameras (D_TIGHT, D_WIDE1, REV_LOCK, DESK_OTS, DESK_SIDE,
//    MORNING_MED, LOW_ROPE) next to the set's own D.cams. The storyboard's CLASSROOM numbers are STALE (it was written
//    for a 15-desk room): use w.classroom.roles (you 41, C1 42, C2 75, STAR 43, RES, the radiator route, platform,
//    window 0, aisle x) and w.classroom.A (set anchors). Keep the storyboard's relations and framing intent, re-fit the
//    numbers, and projection-check your framings (w.project) against §0.1's screen zones: nothing key in the caption
//    band y 62-78 % before f2232, nothing key at x > 86 % for y 40-85 %, nothing key below y 84 %.
//
// 5. People. Figures come from w.<set>.actors.acquire(look) (LOOK.you / LOOK.friends[i] / LOOK.res / LOOK.buddy /
//    LOOK.zhou / classmate(i) ...). The classroom crowd (84 seated cards, one per seat, YOU at roles.you) is always
//    there; to animate a seated person with ropes (YOU, C1, C2, STAR) hide that seat in crowd.state (visible: false)
//    and acquire a full Figure in the same seat. The 你 tag above YOUR head is the 2D overlay youTag(w, fig) from
//    world.ts (storyboard: 0.30 m above the head, gold, 44 px). Owner rules: legs from the hip, seated figures on a
//    seat (seat: {...}), standing ones on the floor, rope ends at handWorld() (the stick-limb tip), no 穿模: check
//    ropes with rope.clearance(boxes) / ropeClearance and cards with cardClearance (D.colliders in the dorm).
//
// 6. Ropes. w.<set>.ropes.acquire({ score: 3|4|5, gold: 1, seed }) -> kit Rope (already in the scene, visible).
//    rope.update(pose) every frame (cheap). Colour changes blend over 4 frames (storyboard §0.2). The classroom web:
//    w.classroom.web("S09", camPose) builds it ONCE per key with the crowd's hands solved for that FIXED camera pose
//    (pass a constant, never the per-frame camera) and returns { web, net, seats, aims, holdState }; use holdState as
//    the crowd's pose so the drawn hands match the rope ends. web.mesh.visible is yours to set every frame.
//
// 7. Speed. The farm (SwiftShader, 12 chunks) fails a chunk whose first frame takes more than ~180 s to load; the
//    World build is ~10-20 s of that. In your segment: no per-frame geometry builds except rope.update / ghost.update,
//    build canvases and meshes once in enter(), merge / instance repeated things, no canvas ctx.filter per stroke,
//    textures <= 2048 px. A typical frame should render in a few seconds locally.
//
// 8. Checking. Stills (never clips):
//      cd B && B=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell \
//        COMP=FriendsFilm node scripts/stills.mjs ../friends/previews/segX/x_ 0,15,30 0.5
//    (prefix, comma-separated absolute frames, scale; each still is a fresh page: World build + one frame). Look at
//    your first and last frame against the hand-off states H1-H4 in storyboard §4, and at the beats in between.
//    Input props (IP='{"dbg":true}' before the command): dbg logs the world build, the pose time of the frame and
//    the first composer draw ("[friends] ..." lines in the output); put your own projection / 穿模 logs behind it
//    (shots/segA.ts debugS01 logs every head's screen % and each rope's collider hits by name). nopost renders the
//    raw scene (no N8AO / ink / bloom / grade); nocap hides the captions.
//    Measured (4-core local SwiftShader, --scale 0.5): World build ~7 s (classroom 2 s, dorm 5 s); S01 pose ~0.15 s;
//    first composer draw (shader compile) ~3.6 s; ~38 s per dorm still / ~28 s per classroom still end to end.
//
// 9. Hand-offs. Your first and last frames must equal the storyboard's hand-off states (camera exactly, who is where,
//    which ropes exist in which colour, no overlays left). Captions are the engine's: never draw your own.
// =====================================================================================================================
import React from "react";
import type * as THREE from "three";
import type { GradeParams } from "../vasa/grade";
import type { World } from "./world";

// ---------------------------------------------------------------------------------------------------- film constants
export const FPS = 30;
export const W = 1080, H = 1920;
/** film length: f0..f2285 (76.2 s); speech ends f2232, the end card builds from f2226 */
export const TOTAL = 2286;
export const TITLE = "你的朋友，有几个也把你当朋友？";
/** the H3 sky joint (storyboard §4 H3): top, middle (50 %), bottom of the screen-space gradient */
export const SKY_H3: [string, string, string] = ["#7FA6D8", "#C7B9D2", "#F3C9A2"];
/** caption band (storyboard §0.1): centre y 70 %, band y 64-76 % */
export const CAPTION_Y = 0.7 * H;

// ---------------------------------------------------------------------------------------------------- the contract
export type Vec3 = [number, number, number];
export type V3Like = Vec3 | THREE.Vector3;
export type SceneId = "classroom" | "dorm" | "sky" | "phone2d";
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

/** the five build segments (storyboard §4). Shots and hand-offs for reference. */
export const SEGMENTS: { id: string; from: number; to: number; shots: string; handoffIn?: string; handoffOut?: string }[] = [
  { id: "A", from: 0, to: 535, shots: "S01-S04 (dorm evening -> classroom day)", handoffOut: "H1" },
  { id: "B", from: 536, to: 1012, shots: "S05-S08 (classroom day)", handoffIn: "H1", handoffOut: "H2" },
  { id: "C", from: 1013, to: 1352, shots: "S09, S10, S11a (classroom, ceiling off -> sky)", handoffIn: "H2", handoffOut: "H3" },
  { id: "D", from: 1353, to: 1812, shots: "S11b, S12-S15 (sky -> dorm dawn, REV_LOCK)", handoffIn: "H3", handoffOut: "H4" },
  { id: "E", from: 1813, to: 2285, shots: "S16-S19 + end card (dorm dawn -> evening, exterior night)", handoffIn: "H4" },
];

/** React.createElement for overlays in .ts segment files: h(RopeCounter, { at: 8, x, y }) */
export const h = React.createElement;

// ---------------------------------------------------------------------------------------------------- voice
// From S/friends/vo1/voice_timing.json (Jin, eleven_v4, speed 1.12; speech ends 74.385 s). f = round(seconds x 30).
const RAW: [number, number, number, string][] = [
  [1, 0.0, 4.032, "你当朋友的十个人里，大约三个，没把你当朋友。"],
  [2, 4.182, 7.01, "你肯定在想：我的朋友不会。"],
  [3, 7.51, 12.426, "研究者真测过：一门大学课，八十四个人，互相打分。"],
  [4, 12.576, 17.727, "零到五分，三分以上算朋友。再猜：对方会给我几分？"],
  [5, 17.877, 22.288, "他们当朋友的人里，百分之九十四，都以为是双向的。"],
  [6, 22.438, 25.754, "实际上，真双向的，大约只有七成。"],
  [7, 26.104, 29.531, "友谊是根绳，你只握得到自己这头。"],
  [8, 29.681, 33.735, "先别委屈：也有人把你当朋友，你没接。"],
  [9, 33.885, 39.312, "算上你没接的，全班的绳子，两头都握住的，才百分之五十三。"],
  [10, 39.662, 43.839, "研究者推测：很多单向的友谊，其实是仰望。"],
  [11, 44.339, 48.129, "单向还是双向，还关系到谁带得动你。"],
  [12, 48.279, 50.648, "健身实验里，每人配了搭子："],
  [13, 50.798, 53.083, "双向的搭子，最能带动你；"],
  [14, 53.233, 56.446, "他把你当朋友，你没有：也有用；"],
  [15, 56.596, 60.185, "你把他当朋友，他没有：测不出效果。"],
  [16, 60.585, 63.359, "所以，别人抛给你的绳，接住。"],
  [17, 63.509, 66.055, "自己抛出去的，别猜，去问。"],
  [18, 66.405, 70.832, "把这条发给你会打五分的那个人，问他：你给我打几分？"],
  [19, 70.982, 74.385, "只要他回三分以上，这根绳就是双向的。"],
];
export type VoiceLine = { n: number; text: string; from: number; to: number; start: number; end: number };
/** the 19 narration lines in frames (from = first frame of speech, to = last) */
export const LINES: VoiceLine[] = RAW.map(([n, s, e, text]) => ({ n, text, start: s, end: e, from: Math.round(s * FPS), to: Math.round(e * FPS) }));
export const SPEECH_END = Math.round(74.385 * FPS); // 2232
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
