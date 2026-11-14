// THE WHISPER (悄悄话): how the reporter's asides are told in the Li Bai film (the same treatment as the Newton film) (Jay's choice, 14 Nov; bible "Talking to
// the audience": "The lens leans a step closer and tips a few degrees, as if she turned her shoulder to us. The edges
// darken, the room sound dips, and her line appears in her own bubble marked 悄悄说 ... The lead carries on, unaware.").
// An aside NEVER leaves 李白: the whisper is a lean, not a turn away. One reusable piece, keyed by LINE ID (never by a
// frame: the voice will be re-recorded, every frame here is looked up from the timing):
//   WHISPER_LINES      THE LIST (one exported array: the gate-2 script table updates it here and nowhere else; the
//                      sound mix reads the same array: scripts/libai/sound/build.py)
//   WHISPER_TUNE       optional per-line tuning for the scene builders (the bubble's place, the lean's step and tilt)
//   WHISPERS           each line's spans (frames, below), whisperSpan(id), whisperAt(f), whisperCapAt(f)
//   whisperLean(f, cam, o)   THE CAMERA PIECE: the scene builders add it to their own camera (it is a delta on any
//                      CamPose, so it stacks on a move that is running): a lean IN by one small step and a tip of the
//                      horizon, eased, landing on her first word and settling back after her line; no handheld wobble
//   whisperLeanK(f), whisperEdgeK(f), whisperBubble(f)   the 0..1 strengths behind the lean, the edges and the bubble
// Drawn by hud/whisper.tsx (<Whisper />, mounted once by Film.tsx UNDER the HUD layer: the darkened edges are the
// picture's, her camera's UI stays clean above them): the bubble REPLACES the normal subtitle for the line's frames
// (Film.tsx hides <Caption /> while whisperCapAt(f)), hud/index.ts hudRectsAt counts it as a HUD box ("whisper").
//
// THE TIMING of one whisper line (all looked up: cap(id, 0).from = the first word, line(id).to = the voice's end):
//   lean     in over LEAN_IN frames LANDING ON THE FIRST WORD; held through the line; back over about 10-14 frames
//            after the voice ends, landing on the next speaker's first word when that comes within 20 frames (the
//            bible: "The lens returns on the next speaker's first word"); when the scene ends before the return could
//            land with RACE_HOLD still frames to spare, the lean HOLDS TO THE CUT (the outgoing view stays still for
//            the clock race / whip: A06, E07)
//   edges    the vignette in over EDGE_IN (6) frames landing on the first word, out over EDGE_OUT (6) from when the lean
//            starts back (done by the scene's last frame)
//   bubble   pops in on the first word (fully in BUB_IN = 5 frames later, under 0.2 s), each caption screen of the line
//            in turn (E07 has two), out over BUB_OUT (4) frames ending BUB_HOLD (6) frames after the voice ends (never
//            later than the line's own subtitle would have stayed, never within JOIN_GUARD (4) frames of the scene's end:
//            no words run into a whip or past a cut, camplan OVERVIEW item 4)
//   room     the room sound dips 6 dB with 0.2 s ramps: down by the first word, back up from the voice's end
//            (scripts/libai/sound/build.py reads WHISPER_LINES): the ambience beds; music, voice and every other effect
//            untouched: music is never ducked
import * as THREE from "three";
const RAD = Math.PI / 180;
import { FPS, W, H, lensFov, clamp01, easeInOutCubic, line, cap, capsOf, seg, type CamPose, type CaptionGroup, type SceneId, type V3Like } from "./story";
import { camAxes, nudge } from "./cam";

// ---------------------------------------------------------------------------------------------------- lens helpers
/** a fov (the 1920 reference's vertical angle) whose view is k times as wide (tan rule) */
const zoomBy = (fov: number, k: number) => (360 / Math.PI) * Math.atan(Math.tan((fov * Math.PI) / 360) * k);
const _cam = new THREE.PerspectiveCamera();
const camOf = (c: CamPose) => {
  const p = c.pos instanceof THREE.Vector3 ? c.pos : new THREE.Vector3(...(c.pos as [number, number, number]));
  const l = c.look instanceof THREE.Vector3 ? c.look : new THREE.Vector3(...(c.look as [number, number, number]));
  _cam.position.copy(p); _cam.up.set(0, 1, 0); _cam.lookAt(l); _cam.rotateZ(c.roll ?? 0);
  _cam.fov = lensFov(c.fov); _cam.aspect = W / H; _cam.near = 0.03; _cam.far = 600; _cam.updateProjectionMatrix(); _cam.updateMatrixWorld(true);
  return _cam;
};
/** a world point on the film's screen (px, 1080 x 1800) and its depth in front of the lens */
const toScreen = (c: CamPose, p: V3Like) => {
  const cam = camOf(c), v = (p instanceof THREE.Vector3 ? p.clone() : new THREE.Vector3(p[0], p[1], p[2]));
  const z = -v.clone().applyMatrix4(cam.matrixWorldInverse).z;
  v.project(cam);
  return { x: (v.x * 0.5 + 0.5) * W, y: (0.5 - v.y * 0.5) * H, z };
};
/** a camera at pos, rolled `rollDeg`, turned so that the world point `at` lands on screen (sx, sy) (film px):
 *  solved by a few steps of yaw / pitch correction (small angles, exact enough for a lean) */
const aimCam = (pos: THREE.Vector3, at: V3Like, sx: number, sy: number, fov: number, rollDeg: number): CamPose => {
  const a = at instanceof THREE.Vector3 ? at.clone() : new THREE.Vector3(at[0], at[1], at[2]);
  let c: CamPose = { pos: [pos.x, pos.y, pos.z], look: [a.x, a.y, a.z], fov, roll: rollDeg * RAD };
  const tv = Math.tan((lensFov(fov) * Math.PI) / 360), th = tv * (W / H);
  for (let i = 0; i < 4; i++) {
    const s = toScreen(c, a);
    const dyaw = (Math.atan(((s.x - W / 2) / (W / 2)) * th) - Math.atan(((sx - W / 2) / (W / 2)) * th)) / RAD;
    const dpitch = (Math.atan(((H / 2 - s.y) / (H / 2)) * tv) - Math.atan(((H / 2 - sy) / (H / 2)) * tv)) / RAD;
    if (Math.abs(dyaw) < 0.01 && Math.abs(dpitch) < 0.01) break;
    c = nudge(c, { yaw: dyaw, pitch: dpitch });
  }
  return c;
};

// ---------------------------------------------------------------------------------------------------- the list
/** THE WHISPER LINES (the camera plans' asides; each is the reporter's (ji) line, checked below). The gate-2 script table
 *  updates this array; build.py reads it for the room dip (keep it ONE array of quoted ids). */
export const WHISPER_LINES: string[] = ["A09", "C22", "E29", "E32"];

/** per-line tuning (optional; the defaults suit the camera plans' framings):
 *    x       the bubble's centre x (px; default 540, slid left of x 930 when wide)
 *    bottom  the bubble body's bottom y (px; default and lowest 1426: its tail then ends above y 1490)
 *    step    the lean in metres (default WHISPER.step; never more than 40 % of the way to the subject)
 *    tilt    the tip in degrees (default WHISPER.tilt; + = the horizon turns clockwise on screen, cam.ts nudge)
 *    lens    true = the lean is done with the lens (the same growth of the subject, the camera does not move: tight
 *            sets, a camera near a wall) */
export type WhisperTune = { x?: number; bottom?: number; step?: number; tilt?: number; lens?: boolean };
export const WHISPER_TUNE: Partial<Record<string, WhisperTune>> = {};

/** the numbers of the treatment (frames unless named) */
export const WHISPER = {
  /** the lean: in over LEAN_IN frames landing on the first word; back over LEAN_BACK (14) after the voice's end, or
   *  NEXT_BACK (10) landing on the next speaker's first word when that comes within NEXT_WIN frames */
  LEAN_IN: 10, LEAN_BACK: 14, NEXT_BACK: 10, NEXT_WIN: 20, BACK_AFTER: 2,
  /** the scene must have this many frames left after the return lands, else the lean holds to the cut */
  RACE_HOLD: 10,
  /** the vignette's ramps */
  EDGE_IN: 6, EDGE_OUT: 6,
  /** the bubble: in, out, how long it stays after the voice, how far before the scene's end it is gone */
  BUB_IN: 5, BUB_OUT: 4, BUB_HOLD: 6, JOIN_GUARD: 4,
  /** the lean's default size: a small step (m) and a few degrees of tip */
  step: 0.2, tilt: 3,
} as const;

// ---------------------------------------------------------------------------------------------------- the spans
/** one whisper line in frames (inclusive), all looked up from the timing */
export type WhisperSpan = {
  id: string; n: number; scene: SceneId;
  /** the frame of her first word (= the line's first caption screen's from) and the last frame of her voice */
  word: number; end: number;
  /** the line's caption screens (one or more) and the last frame its normal subtitle would have shown */
  screens: CaptionGroup[]; capFrom: number; capTo: number;
  /** the lean: in [leanFrom, word], back [backFrom, backTo]; hold = true: no return, the lean holds to the cut */
  leanFrom: number; backFrom: number; backTo: number; hold: boolean;
  /** the vignette: in [edgeFrom, word], out [edgeOut, edgeOut + EDGE_OUT] */
  edgeFrom: number; edgeOut: number;
  /** the bubble: shown [word, bubbleOut] */
  bubbleOut: number;
  /** the scene's last frame */
  sceneTo: number;
  /** the whole span the treatment touches (the lean's start .. the last of the lean / edges / bubble) */
  from: number; to: number;
};
const spanOf = (id: string): WhisperSpan => {
  const L = line(id), S = seg(L.scene), screens = capsOf(id);
  if (L.who !== "ji") throw new Error(`whisper.ts: ${id} is ${L.who}'s line; a whisper is always the reporter's (ji) aside`);
  if (!screens.length) throw new Error(`whisper.ts: ${id} has no caption screens`);
  const word = cap(id, 0).from, end = L.to, capFrom = screens[0].from, capTo = screens[screens.length - 1].to;
  const W = WHISPER;
  // the next line's first word, if it is in the same scene
  let next: number | null = null;
  try { const N = line(L.n + 1); if (N.scene === L.scene) next = cap(N.id, 0).from; } catch { next = null; }
  let backFrom: number, backTo: number;
  if (next !== null && next - end <= W.NEXT_WIN) { backTo = Math.max(next, end + 4); backFrom = backTo - W.NEXT_BACK; }
  else { backFrom = end + W.BACK_AFTER; backTo = backFrom + W.LEAN_BACK; }
  backFrom = Math.max(backFrom, word + 1);
  const hold = backTo + W.RACE_HOLD > S.to;
  const edgeOut = Math.max(word + 1, Math.min(hold ? end + W.BACK_AFTER : backFrom, S.to - W.EDGE_OUT));
  const bubbleOut = Math.max(word + W.BUB_IN, Math.min(capTo, end + W.BUB_HOLD, S.to - W.JOIN_GUARD));
  const leanFrom = word - W.LEAN_IN, edgeFrom = word - W.EDGE_IN;
  return {
    id, n: L.n, scene: L.scene, word, end, screens, capFrom, capTo,
    leanFrom, backFrom, backTo, hold, edgeFrom, edgeOut, bubbleOut, sceneTo: S.to,
    from: Math.max(S.from, Math.min(leanFrom, edgeFrom)), to: hold ? S.to : Math.max(backTo, edgeOut + W.EDGE_OUT, bubbleOut, capTo),
  };
};
/** every whisper line's spans, in film order (throws at import on an unknown id, a line that is not the reporter's, or
 *  two whispers that overlap) */
export const WHISPERS: WhisperSpan[] = WHISPER_LINES.map(spanOf).sort((a, b) => a.word - b.word);
for (let i = 1; i < WHISPERS.length; i++) if (WHISPERS[i].from <= WHISPERS[i - 1].to) throw new Error(`whisper.ts: ${WHISPERS[i - 1].id} and ${WHISPERS[i].id} overlap`);
/** the spans of whisper line `id` (throws when it is not in WHISPER_LINES) */
export const whisperSpan = (id: string): WhisperSpan => {
  const s = WHISPERS.find((x) => x.id === id);
  if (!s) throw new Error(`whisperSpan("${id}"): not a whisper line (WHISPER_LINES: ${WHISPER_LINES.join(" ")})`);
  return s;
};
/** the whisper line whose treatment touches frame f (lean, edges or bubble), or null */
export const whisperAt = (f: number): WhisperSpan | null => WHISPERS.find((s) => f >= s.from && f <= s.to) ?? null;
/** the whisper line whose NORMAL SUBTITLE frames include f (the bubble replaces it: Film.tsx hides <Caption /> and
 *  hudRectsAt drops the caption box on these frames), or null */
export const whisperCapAt = (f: number): WhisperSpan | null => WHISPERS.find((s) => f >= s.capFrom && f <= s.capTo) ?? null;
/** the tuning of a whisper line (WHISPER_TUNE, else {}) */
export const whisperTune = (id: string): WhisperTune => WHISPER_TUNE[id] ?? {};

// ---------------------------------------------------------------------------------------------------- the strengths
const ramp = (f: number, a: number, b: number) => easeInOutCubic(clamp01((f - a) / Math.max(1, b - a)));
/** 0..1: the lean on frame f (eased in landing on the first word, held, eased back; 0 outside every whisper) */
export const whisperLeanK = (f: number, s: WhisperSpan | null = whisperAt(f)): number => {
  if (!s || f < s.leanFrom || f > s.to) return 0;
  const k = ramp(f, s.leanFrom, s.word);
  return s.hold ? k : k * (1 - ramp(f, s.backFrom, s.backTo));
};
/** 0..1: the darkened edges on frame f (6 frames in landing on the first word, 6 out) */
export const whisperEdgeK = (f: number, s: WhisperSpan | null = whisperAt(f)): number => {
  if (!s) return 0;
  const k = clamp01((f - s.edgeFrom) / WHISPER.EDGE_IN) * (1 - clamp01((f - s.edgeOut) / WHISPER.EDGE_OUT));
  return k * k * (3 - 2 * k);
};
/** the bubble on frame f: the span, the caption screen it carries (the line's screen of that frame, else the last one
 *  started), `pop` (0..1 frames since the first word over BUB_IN: the pop's own easing is the HUD's), `fade` (0..1: 1
 *  until the out ramp), `swap` (0..1 since this screen replaced the previous one, over 4 frames; 1 for the first) and
 *  `prev` (the screen it replaced, while swapping); null when no bubble shows */
export type WhisperBubble = { s: WhisperSpan; screen: CaptionGroup; k: number; pop: number; fade: number; swap: number; prev: CaptionGroup | null };
export const whisperBubble = (f: number): WhisperBubble | null => {
  const s = WHISPERS.find((x) => f >= x.word && f <= x.bubbleOut);
  if (!s) return null;
  let i = 0;
  while (i + 1 < s.screens.length && s.screens[i + 1].from <= f) i++;
  const screen = s.screens[i], prev = i > 0 ? s.screens[i - 1] : null;
  const pop = clamp01((f - s.word + 1) / WHISPER.BUB_IN), fade = clamp01((s.bubbleOut - f + 1) / WHISPER.BUB_OUT);
  const swap = prev ? clamp01((f - screen.from + 1) / 4) : 1;
  return { s, screen, k: Math.min(pop, fade), pop, fade, swap, prev: swap < 1 ? prev : null };
};

// ---------------------------------------------------------------------------------------------------- the camera
const v3 = (p: V3Like) => (p instanceof THREE.Vector3 ? p.clone() : new THREE.Vector3(p[0], p[1], p[2]));
/** THE WHISPER LEAN: the scene builder's camera of frame f with the whisper on top. A pure function (no noise, no
 *  handheld): returns `cam` itself, untouched, outside every whisper line.
 *    at     the subject (world point: 李白's eyes). Given, it is HELD ON ITS SCREEN POINT
 *           through the lean (cam.ts aimCam: the aim-by-screen-point rule) and the tip turns about it; left out, the
 *           lens dollies along its view and tips about the frame's centre
 *    step   the lean in metres (default: WHISPER_TUNE[id].step ?? WHISPER.step = 0.2), never more than 40 % of the way
 *           to the subject (or to the look point)
 *    tilt   degrees (default: WHISPER_TUNE[id].tilt ?? WHISPER.tilt = 3; + = the horizon turns clockwise on screen)
 *    lens   true: the lean is the LENS EQUIVALENT (the subject grows as a step of `step` would make it grow; the
 *           camera stays where it is: a camera near a wall)
 *    k      0..1 scale on the whole treatment (default 1)
 *  In a shot:  const cam = whisperLean(f, myCam(f), { at: eyes });  w.setCamera(cam);  return { camera: cam, ... } */
export const whisperLean = (f: number, cam: CamPose, o: { at?: V3Like; step?: number; tilt?: number; lens?: boolean; k?: number } = {}): CamPose => {
  const s = whisperAt(f);
  const k = whisperLeanK(f, s) * (o.k ?? 1);
  if (!s || k <= 0) return cam;
  const tune = whisperTune(s.id), A = camAxes(cam);
  const dist = o.at ? Math.max(0.3, v3(o.at).distanceTo(A.p)) : A.dist;
  const step = Math.min(o.step ?? tune.step ?? WHISPER.step, 0.4 * dist) * k;
  const tilt = (o.tilt ?? tune.tilt ?? WHISPER.tilt) * k;
  const lens = o.lens ?? tune.lens ?? false;
  // the lens equivalent: tan(half angle) x (d - step) / d, the subject's growth for a step of `step`
  const fov = lens ? zoomBy(cam.fov, (dist - step) / dist) : cam.fov;
  const pos = lens ? A.p : A.p.clone().addScaledVector(A.fwd, step);
  const sp = o.at ? toScreen(cam, o.at) : null;
  if (o.at && sp && sp.z > 0.1) return { ...cam, ...aimCam(pos, o.at, sp.x, sp.y, fov, (cam.roll ?? 0) / RAD + tilt) };
  const moved = lens ? cam : nudge(cam, { fwd: step });
  return { ...nudge(moved, { roll: tilt }), fov };
};
/** the whisper spans in seconds (the sound's view of them: first word .. the voice's end), for checks */
export const whisperSeconds = () => WHISPERS.map((s) => ({ id: s.id, word: s.word / FPS, end: s.end / FPS }));
