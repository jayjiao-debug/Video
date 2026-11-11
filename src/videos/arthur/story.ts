// 《石中剑》 (ArthurFilm) film engine: timing, the segment contract and the segment table. Read BIBLE.md first.
// Engine files (owned by the engine; segment builders treat them as read-only and ask for changes):
//   story.ts     this file: FPS / frames, voice lines, the Segment / Pose types, SEGMENTS; easing + RNG helpers
//                (re-exported from group/story.ts)
//   voice.ts     the narration's line timing (generated from the recorded voice)
//   world.ts     World: the one set (field | yard | house strip), the stone + sword, the cast of rig figures
//   captions.ts  the timed caption groups (gold key words) -> drawn by <Caption> in Film.tsx
//   overlay.tsx  the film's shared 2D overlays (the pull counter, ! / ? marks, speed lines)
//   Film.tsx     the composition "ArthurFilm": builds the World, picks the segment for the frame, runs enter / exit /
//                pose, applies camera + post (N8AO, InkPass, lens blur, bloom, NEUTRAL, grade), draws overlays, then
//                the caption, then `top`
//   shots/segA.ts .. segE.ts   one file per segment builder (see SEGMENTS)
// =====================================================================================================================
// HOW TO BUILD A SEGMENT (read all of it before you write code)
// =====================================================================================================================
// 0. Your files. You own shots/segX.ts and any NEW files you create with your prefix (shots/segX_*.ts). Everything
//    else is read-only for you. If you need an engine change, say so in your report.
//
// 1. The contract. shots/segX.ts exports SEG: Segment (type below):
//      export const SEG: Segment = { id: "A", from: SEGMENTS[0].from, to: SEGMENTS[0].to, enter(w) {...}, exit(w) {...}, pose(w, f) {...} };
//    from / to are inclusive absolute film frames and must equal SEGMENTS[...] (the engine checks this).
//    The engine, for every rendered frame f:
//      if the segment changed (or this is the first frame of the page):  old.exit(w); SEG.enter(w)
//      w.beginFrame(f);  const P = SEG.pose(w, f);  w.endFrame(P)
//    then draws P.overlays over the 3D picture, the caption of frame f over that, and P.top over everything.
//
// 2. Any frame can be the first one. The farm renders chunks that start at arbitrary frames, each in a fresh page,
//    and a still is a fresh page too. So pose(w, f) is a PURE function of f: it sets EVERY property it relies on,
//    EVERY frame. Never keep state between frames (no "previous frame" variables, no accumulators). Derive everything
//    from f, e.g. t = (f - 60) / FPS for "seconds since the drop". w.beginFrame(f) resets the world for you before
//    every pose: every figure hidden, the sword stuck in the anvil (setStuck(0)), glow and shine 0. So a figure you
//    do not set this frame is not in the picture. enter(w) may fetch figures (w.actor(...)) and build your own cached
//    things once (module-level variables guarded by "if (!built)"); exit(w) usually has nothing to do.
//    Determinism: no Math.random, Date, performance.now in anything that affects pixels. Use rng(seed) / hash(i, k).
//
// 3. Inside pose(w, f), in this order:
//      a. camera: const cam = { pos, look, fov };  w.setCamera(cam)      <- FIRST: the figures turn to the camera and
//         every hand position / projection depends on it. Return the same cam in the Pose.
//      b. people: const a = w.actor(PEOPLE.arthur); a.set({ at, facing, pose, expr, blink, gaze, mouth, head, hands,
//         twist, turn, lookDown, hide, visible: true }) for every figure in the shot (kit/RIG3D.md "用法",
//         "说话和头部动作", "走路"; RigState in group/kit/rig3d.ts). visible: true is REQUIRED (beginFrame hid it).
//      c. w.update(): solves all figures for the camera. After it: a.handWorld(0 | 1), a.headWorld(), a.qa.
//      d. the sword: w.stone.setStuck(k, wobble) (in the anvil; k = 0 fully in .. 1 just free) or
//         w.stone.setFree(grip, up, face) (anywhere, e.g. in a hand: grip = a.handWorld(1)); w.stone.setGlow / setShine.
//         If the sword follows a hand that is itself pinned to the sword (a pull), compute the grip point first and
//         pin the hand to it (hands: [...]), then update, then set the sword.
//      e. overlays: positions from w.project(worldPoint) -> {x, y} in 1080 x 1920 px; React nodes with h(...)
//         (segment files are .ts: no JSX) from overlay.tsx or your own.
//      f. return { camera: cam, season, focus, overlays, top?, post?, captions? }
//    season 0..3 (see sets/yard.ts; default 0 = snow). focus = [x, z] the floor point the sun's shadow frustum is
//    centred on (default: under the camera's look point): give it when the action is not where the camera looks.
//    post: { dof: {focus (m), amount (blur px at infinity, 0 = off)}, bloom, grade / gradeAmount, ink, ao }.
//
// 4. THE RULES FOR THIS FILM
//    - The reference style is NON-STOP ACTION: something moves or changes every half second (a gesture, an
//      expression, a head accent, a camera move). The camera almost never stands still: slow push-ins, pans that
//      follow a walker, quick whip pans along x between the three zones. Hard cuts are allowed (and good) between
//      beats; cut ON an action. Never a crossfade.
//    - Plain, readable cameras: eye level (y 1.1 - 1.6 m), on the +z side looking toward -z (yaw within about 50
//      degrees of -z), no top-down, no worm's-eye, no roll. Framing for 9:16: faces and the sword in the upper 60 %.
//    - Screen zones: nothing key in the caption band y 62-78 %, nothing key below y 84 %.
//    - Everything literal: what the narrator says is what the picture shows, at that moment (sync to LINES / the
//      caption groups in captions.ts).
//    - Logic: people look at what they deal with; a pull goes up and out; nobody passes through the stone, the
//      anvil, walls, or each other (set.colliders, stone.colliders; keep 0.45 m between figures' centres).
//    - Characters are alive: expression changes on key words, blinks (lid 0 / 0.5 / 1; a blink is 3 frames:
//      0.5, 1, 0.5), gaze shifts, head accents (rigHeadAccent) on reactions, anticipation before a big move.
//      Nobody frozen: idle figures still breathe (pose t = seconds), look around, react a beat late.
//    - Mouths move ONLY while that character speaks its own quoted line (rigSpeak with the line's timing from
//      QUOTES below); under the narrator all mouths are the expression's own.
//    - Faces: a figure's face turns at most 12 degrees from the camera, its body at most 45; do not leave a facing
//      between 115 and 170 degrees from the camera (use turn: 1 for a true back view). A figure's own hands are never
//      drawn in front of its own head. Arms are 0.40 m: a hand reaches only that far from the shoulder (qa.reach
//      must stay <= 0.012 for pinned hands).
//
// 5. Checking. Fast stills of the 3D picture (no overlays, no captions; 5-10 s each):
//      node scripts/rig3d/render.mjs src/videos/arthur/preview/film.ts /tmp/x/f.png --size 540x960 --opts '{"f":120}'
//      node scripts/rig3d/render.mjs src/videos/arthur/preview/film.ts /tmp/x --pick 0,15,30,45 --size 540x960
//    (the page prints "QA: f.. reach .. clear .." for figures whose arms do not reach or pass through the body).
//    The real thing with overlays and captions (about 40 s each):
//      npx remotion still src/index.ts ArthurFilm /tmp/x/f120.png --frame=120 --gl=swangle --timeout=300000 --log=warn --browser-executable=/opt/pw-browsers/chromium
//    Look at stills every 10-15 frames across your whole segment, and at every cut.
//
// 6. Hand-offs. Segments meet on hard cuts; the table below says what each one starts and ends on.
// =====================================================================================================================
import type React from "react";
import type * as THREE from "three";
import type { GradeParams } from "../vasa/grade";
import type { World } from "./world";
import { VOICE_RAW, VOICE_END_S, QUOTE_RAW } from "./voice";

export {
  clamp01, clamp, lerp, lin, smooth, smootherstep, easeInQuad, easeOutQuad, easeInOutQuad, easeInCubic, easeOutCubic, easeInOutCubic,
  easeOutBack, between, spring, pop, spl, mix3, add3, camMix, rng, hash, since, h,
} from "../group/story";

// ---------------------------------------------------------------------------------------------------- film constants
export const FPS = 30;
export const W = 1080, H = 1920;
export const TITLE = "石中剑，亚瑟王到底拔了几次？";
/** caption band: centre y 70 %, band y 64-76 % */
export const CAPTION_Y = 0.7 * H;

// ---------------------------------------------------------------------------------------------------- the contract
export type Vec3 = [number, number, number];
export type V3Like = Vec3 | THREE.Vector3;
export type Season = 0 | 1 | 2 | 3;
/** a camera pose: camera.up = up ?? (0,1,0); position = pos; lookAt(look); rotateZ(roll ?? 0); fov (vertical, degrees) */
export type CamPose = { pos: V3Like; look: V3Like; fov: number; roll?: number; up?: Vec3; near?: number; far?: number };
export type PostPose = {
  /** depth of field: focus distance (m) and blur-disc radius in px (at 1080 x 1920) of things at infinity; 0 = off */
  dof?: { focus: number; amount: number } | null;
  /** bloom intensity (threshold 1.0: only emissive / glowing things bloom) */
  bloom?: number;
  grade?: GradeParams; gradeAmount?: number;
  /** ink outline strength 0..1 (1 = default) */
  ink?: number;
  /** N8AO intensity multiplier (1 = the set's value) */
  ao?: number;
};
export type Pose = {
  camera: CamPose;
  /** 0 deep winter (default), 1 late winter, 2 spring, 3 early summer */
  season?: Season;
  /** [x, z]: where the sun's shadow frustum is centred (default: under the camera's look point) */
  focus?: [number, number];
  /** 2D layer above the 3D picture and below the captions */
  overlays?: React.ReactNode;
  /** 2D layer above the captions */
  top?: React.ReactNode;
  post?: PostPose;
  /** false hides the caption on this frame */
  captions?: boolean;
};
export type Segment = {
  id: string;
  /** inclusive absolute frames */
  from: number; to: number;
  enter(w: World): void;
  exit(w: World): void;
  /** pure function of f: pose the world and the camera, return what to show */
  pose(w: World, f: number): Pose;
};

// ---------------------------------------------------------------------------------------------------- voice
export type VoiceLine = { n: number; text: string; from: number; to: number; start: number; end: number };
/** the narration lines in frames (from = first frame of speech, to = last); n starts at 1 */
export const LINES: VoiceLine[] = VOICE_RAW.map(([n, s, e, text]) => ({ n, text, start: s, end: e, from: Math.round(s * FPS), to: Math.round(e * FPS) }));
export const SPEECH_END = Math.round(VOICE_END_S * FPS);
/** the line with number n (1-based) */
export const line = (n: number) => LINES[n - 1];
/** the line spoken at frame f (or null in a pause) */
export const lineAt = (f: number) => LINES.find((l) => f >= l.from && f <= l.to) ?? null;
/** a character's own quoted words inside a narration line: who speaks, the absolute frames, the seconds, the syllable
 *  count (for rigSpeak: { from, to } in seconds of YOUR clock, syl) and the text */
export type Quote = { line: number; who: "kay" | "arthur" | "lord" | "commons"; text: string; syl: number; from: number; to: number; start: number; end: number };
export const QUOTES: Quote[] = QUOTE_RAW.map(([ln, who, s, e, text]) => ({ line: ln, who, text, syl: [...text.replace(/[^一-鿿]/g, "")].length, start: s, end: e, from: Math.round(s * FPS), to: Math.round(e * FPS) }));
export const quote = (who: Quote["who"]) => QUOTES.find((q) => q.who === who)!;

/** film length in frames: the speech, then a short tail */
export const TOTAL = SPEECH_END + 12;

// ---------------------------------------------------------------------------------------------------- segments
const cut = (n: number) => line(n).from - 2;   // a segment starts 2 frames before its first line's first word
/** the five build segments (the script: /mnt/project-files/next-video/arthur/script_v1.md) */
export const SEGMENTS: { id: string; from: number; to: number; lines: [number, number]; shots: string }[] = [
  { id: "A", from: 0, to: cut(6) - 1, lines: [1, 5], shots: "hook: Arthur slides the sword back in; 'wait, what?'; the stone and its gold letters; the lords queue up, strain and fail" },
  { id: "B", from: cut(6), to: cut(10) - 1, lines: [6, 9], shots: "tournament edge: Kay pats his empty scabbard; Arthur runs to the lodging, nobody home; runs to the stone; the guards are gone; he pulls it out: 1" },
  { id: "C", from: cut(10), to: cut(14) - 1, lines: [10, 13], shots: "Kay claims the crown; the oath; 'put it back'; father fails, Kay fails, Arthur pulls: 2; father and Kay bow" },
  { id: "D", from: cut(14), to: cut(19) - 1, lines: [14, 18], shots: "the lords all fail, Arthur: 3; the lords' insult; February: 4; spring: 5; early summer, in front of everyone: 6" },
  { id: "E", from: cut(19), to: TOTAL - 1, lines: [19, 21], shots: "the commons shout; everyone kneels; Arthur crowned; snap back to pull one: Kay patting his empty belt" },
];
