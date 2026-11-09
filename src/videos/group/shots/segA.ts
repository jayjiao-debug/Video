// segment A, frames 0-265 (lines 01-02). The classroom's back row: the worker types, the three scroll; one steady
// eased push-in from OPEN to YOU (seat 78).
//   总有人【划水】: YOU snickers at his phone (eyes open); the worker's eyes flick to YOU and back, annoyed.
//   可能也包括【你】: YOU glances up at the camera, caught (dip, shock held open through 你, nervous, smug back to the phone).
//   身后有几个人【帮你】: YOU blinks as he turns to the typing worker (who goes pained and sweats), a knowing smug on 帮你,
//   blinks back to the phone: eyes open and on the phone for 你就会.
//   少出【15%】的力: a gold "−15%" pops beside YOU (a short innocent whistle, then smug eyes up and away), gone by f235;
//   YOU looks down at the phone; cut on that action to the POV insert of YOUR phone (segA_phone.ts): the feed lands on
//   the post "1974年 拉绳实验", the view zooms into its thumbnail until it fills the frame at f265 (segment B's first
//   frame, the live lab from the same camera, continues it).
// f0 is the loop frame: OPEN camera and teamLoopState() exactly (segD ends on the same state); every idle offset
// below starts from 0 at f0 (ramp) so the loop frame is untouched.
// The phone: the loop state's kit phone pose holds it under the chin, so on the caught glance (f81-86) YOU's same hand
// drops it to chest height in a hold pose, where the whole phone shows. If teamLoopState already uses a hold pose,
// that switch is skipped (no jump).
import { getInputProps } from "remotion";
import * as THREE from "three";
import type { Segment, CamPose, Vec3 } from "../story";
import { SEGMENTS, FPS, h, spl, smooth, lerp, clamp01 } from "../story";
import { OPEN, SEAT, acquireTeam, releaseTeam, teamLoopState, loopT, type Team } from "./common";
import type { World } from "../world";
import { EMPTY_CROWD } from "../world";
import { lidAt, type FxKind, type FigState } from "../kit/cast";
import type { Expr } from "../kit/toon";
import { MinusPct } from "./segA_minus";
import { PhonePOV } from "./segA_phone";

const S = SEGMENTS.find((s) => s.id === "A")!;
const IP = getInputProps() as { dbg?: boolean };

// ---------------------------------------------------------------------------------------------------- beats (frames)
/** YOU's snicker / the worker's glance on 总有人【划水】 (caption f27-60) */
const SNK = 44;
/** YOU's glance up at the camera on 可能也包括【你】 (caption f61-105, 你 spoken f91-92) */
const UP = 80;
/** YOU's sideways glance at the worker on 身后有几个人【帮你】 (caption f129-174, 帮你 spoken ~f162) */
const SIDE = 146, HELP = 162;
/** the −15% on 少出【15%】的力 (caption f200-254) */
const PCT_IN = 203, PCT_OUT = 229;
/** YOU looks down at the phone, then the cut to the POV insert */
const DOWN = 236, CUT = 242;
/** the POV zoom into the thumbnail */
const ZOOM = 249, END = S.to;

// ---------------------------------------------------------------------------------------------------- camera
/** the push-in: OPEN -> a two-shot of YOU (screen left, 20-37 %) and the worker (screen right, 67-80 %, whole head in
 *  frame through 帮你) -> it drifts on toward YOU: the worker slides out of the right edge (half out ~f206, his hair
 *  fully out by the cut: head centre 127 % at f241) -> a medium close-up of YOU (~50 %) for the −15% and the look down. Heads at y 43-48 %. Eye level
 *  (1.34-1.55 m), no roll. */
const MID: CamPose = { pos: [-0.25, 1.4, 2.15], look: [-0.25, 0.98, 4.9], fov: 58 };
const MID2: CamPose = { pos: [-0.3, 1.38, 2.3], look: [-0.3, 0.98, 4.9], fov: 55 };
const CLOSE: CamPose = { pos: [0.08, 1.34, 2.66], look: [0.08, 0.97, 4.9], fov: 46 };
/** trapezoid-velocity progress 0..1 over [f0, f1]: smooth ramps of `a` frames in and `d` frames out, constant between */
const trap = (f: number, f0: number, f1: number, a: number, d: number) => {
  const T = f1 - f0, x = Math.max(0, Math.min(T, f - f0));
  const vmax = 1 / (T - a / 2 - d / 2);
  if (x <= a) return vmax * (x * x) / (2 * a);
  if (x <= T - d) return vmax * (a / 2 + (x - a));
  const y = T - x;
  return 1 - vmax * (y * y) / (2 * d);
};
/** camera progress: eases in from the loop frame (30 f), then a steady glide that is still moving at the cut */
const camP = (f: number) => trap(f, 0, CUT + 40, 30, 40);
/** the path: a Catmull-Rom through the four keys (uniform in the key index u = 0..3), re-parameterised by arc length
 *  (metres of position + 0.01 x degrees of fov) so the speed along it is exactly camP's: no hitch at a key, no stall
 *  between close keys. The table is built once at module load (deterministic). */
const KEYS: CamPose[] = [OPEN, MID, MID2, CLOSE];
const keyPose = (u: number): CamPose => ({
  pos: spl(KEYS.map((c, i) => [i, c.pos as Vec3]), u), look: spl(KEYS.map((c, i) => [i, c.look as Vec3]), u),
  fov: spl(KEYS.map((c, i) => [i, c.fov]), u),
});
const ARC_N = 900, ARC: number[] = [0];
{
  let prev = keyPose(0);
  for (let i = 1; i <= ARC_N; i++) {
    const c = keyPose((3 * i) / ARC_N), a = c.pos as Vec3, b = prev.pos as Vec3;
    ARC.push(ARC[i - 1] + Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) + 0.01 * Math.abs(c.fov - prev.fov));
    prev = c;
  }
}
const camAt = (f: number): CamPose => {
  if (f <= 0) return { ...OPEN };
  const s = clamp01(camP(f) / camP(CUT)) * ARC[ARC_N];
  let lo = 0, hi = ARC_N;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (ARC[m] <= s) lo = m; else hi = m; }
  const q = ARC[hi] > ARC[lo] ? (s - ARC[lo]) / (ARC[hi] - ARC[lo]) : 0;
  return keyPose((3 * (lo + q)) / ARC_N);
};

// ---------------------------------------------------------------------------------------------------- acting helpers
/** keyframes with a smooth ease inside each interval (holds at the keys: snappy glances) */
const ky = (f: number, keys: [number, number][]) => spl(keys, f, smooth);
/** expression timeline: the last key at or before f */
const exprAt = (f: number, keys: [number, Expr][]) => { let e = keys[0][1]; for (const [k, x] of keys) if (f >= k) e = x; return e; };
/** blink lid on teamLoopState's clock (t + 50): its random blinks, plus a blink (f k-3..k) across every expression
 *  swap at k except the swaps listed in `pop` (the face changes with the eyes open: a shock, a brow raise), plus a
 *  blink ending at each frame in `extra` (e.g. hiding the face-turn switch during a head turn) */
const lid = (f: number, id: number, keys: [number, Expr][], pop: number[] = [], extra: number[] = []) =>
  lidAt(loopT(f) + 50, id, [...keys.slice(1).filter(([k]) => !pop.includes(k)).map(([k]) => k), ...extra].map((k) => k / FPS + 50));
/** an fx that pops at `at` and pops out (reverse pop) over 5 f from `out` */
const fxAt = (f: number, kind: FxKind, at: number, out: number): { kind: FxKind; t: number }[] => {
  if (f < at || f >= out + 5) return [];
  if (f < out) return [{ kind, t: (f - at) / FPS }];
  return [{ kind, t: 0.2 * (1 - (f - out + 1) / 5) }];
};
/** 0 at f0, 1 after ~20 f: lets the idle offsets start from the exact loop state */
const ramp = (f: number) => smooth(f / 20);
/** a smooth 0 -> 1 -> 0 window: up over [a, b], held, down over [c, d] */
const win = (f: number, a: number, b: number, c: number, d: number) => smooth((f - a) / (b - a)) * (1 - smooth((f - c) / (d - c)));
/** phone scrolling: the eyes hop up a touch every ~1.6 s (the next post) and drift back; the head sways slowly */
const scrollEyes = (t: number, seed: number) => {
  const per = 1.45 + 0.35 * seed, x = ((t + seed * 0.9) % per) / per;
  return 0.09 * (x < 0.12 ? smooth(x / 0.12) : 1 - smooth((x - 0.12) / 0.5));
};
const sway = (t: number, seed: number) => 1.6 * Math.sin(t * 1.3 + seed * 2.1) + 0.7 * Math.sin(t * 2.9 + seed);
/** typing rhythm: bursts of 0.45-0.7 s of key strokes (2.6 Hz shoulder / head bob), short pauses between; 0..1
 *  envelope and the stroke phase */
const typing = (t: number) => {
  const per = 0.95, n = Math.floor(t / per), x = t - n * per;
  const len = 0.45 + 0.25 * (0.5 + 0.5 * Math.sin(n * 2.399 + 0.7));   // deterministic burst lengths
  const env = x < len ? smooth(x / 0.08) * (1 - smooth((x - len + 0.08) / 0.08)) : 0;
  return { env, s: Math.sin(t * Math.PI * 2 * 2.6) };
};
/** the worker's eyes flick down from the screen to the keys and back (~0.3 s) every ~2.8 s */
const keysFlick = (t: number) => { const per = 2.8, x = t + 1.1 - Math.floor((t + 1.1) / per) * per; return x < 0.3 ? Math.sin((x / 0.3) * Math.PI) : 0; };

// expressions (frames).
// Gaze reads only with the kit's "lid" eyes (a pupil half-disc that slides under the lid line); "dot" eyes have no
// whites and always look into the lens. So every look at the phone or at the worker uses lid-eyed faces.
// YOU: smug scroll; a snicker on 划水 (a shoulder shake with a 6-frame grin flash, eyes on the phone either side);
// caught (shock, no blink, held through 你 f91-99); nervous (the face draws its own sweat drop); smug back to the
// phone; a plain side-eye at the worker (neutral, the face turn hides in a blink); a knowing smug side-eye on 帮你 (no
// blink); smug, eyes on the phone, for 你就会; a short whistle under the −15% (its swap blink merges with his random
// blink f201-204); smug, eyes up and away, then the look down.
const YOU_EX: [number, Expr][] = [[0, "smug"], [SNK + 3, "grin"], [SNK + 9, "smug"], [UP + 4, "shock"], [UP + 20, "nervous"], [UP + 35, "smug"],
  [SIDE + 5, "neutral"], [HELP, "smug"], [204, "whistle"], [226, "smug"]];
const YOU_POP = [SNK + 3, SNK + 9, UP + 4, HELP];
/** blink as he turns back from the worker to the phone (hides the face-turn switch) */
const YOU_BLINK = [SIDE + 29];
// the worker: stern typing; huffs as his eyes flick to YOU on 划水; pained + sweat while YOU grins at him (帮你)
const WORKER_EX: [number, Expr][] = [[0, "stern"], [SNK + 1, "huff"], [SNK + 14, "stern"], [HELP - 2, "pained"], [196, "stern"]];
const WORKER_POP = [SNK + 1];
const MATE1_EX: [number, Expr][] = [[0, "happy"], [38, "laugh"], [58, "happy"], [176, "grin"], [204, "happy"]];
const MATE2_EX: [number, Expr][] = [[0, "deadpan"], [118, "smile"], [152, "deadpan"]];

function actYou(w: World, T: Team, f: number) {
  const t = loopT(f), r = ramp(f), base = T.you.st;
  // the snicker on 划水: a quick shoulder shake (lean + head) and the eyes dip to the phone (f43-58)
  const snk = win(f, SNK - 1, SNK + 2, SNK + 9, SNK + 14), shake = snk * Math.sin((f - SNK) * 1.7);
  const scrolling = f < UP - 6 || (f > UP + 40 && f < SIDE - 2) || (f > SIDE + 34 && f < 201);
  const lookUp = ky(f, [[0, -0.85], [SNK - 1, -0.85], [SNK + 3, -1.0], [SNK + 10, -1.0], [SNK + 14, -0.85],
    [UP - 4, -0.85], [UP - 1, -1.0], [UP + 4, 0.26], [UP + 7, 0.14], [UP + 28, 0.14], [UP + 35, -1.0],
    [SIDE - 1, -1.0], [SIDE + 2, -1.1], [SIDE + 7, -0.05], [SIDE + 26, -0.05], [SIDE + 31, -1.0],
    [201, -1.0], [206, 0.35], [DOWN - 2, 0.35], [DOWN, 0.45], [DOWN + 5, -1.1]]) + scrollEyes(t, 0.3) * r * (scrolling ? 1 : 0);
  // the glance at the worker (screen right = + look): anticipation the other way, a blink during the head turn
  const look = ky(f, [[0, 0], [SIDE + 1, 0], [SIDE + 3, -0.3], [SIDE + 7, 1.4], [SIDE + 26, 1.4], [SIDE + 31, 0]]);
  // the body leans toward the worker while he looks (front view: + = top toward canvas right = toward the worker)
  const lean = ky(f, [[0, 0], [SIDE + 1, 0], [SIDE + 3, -1.5], [SIDE + 8, 6], [SIDE + 11, 5], [SIDE + 25, 5], [SIDE + 31, 0]]) + 1.4 * shake;
  // the face-turn switch falls on fully closed lids (blinks f148-151 and f172-175)
  const turned = f >= SIDE + 4 && f < SIDE + 28;
  // a small nod on 帮你 (head tips toward the worker and back)
  const nod = 2.5 * win(f, HELP - 1, HELP + 2, HELP + 4, HELP + 8);
  const tilt = r * sway(t, 0.3) + 2.2 * shake + ky(f, [[0, 0], [UP - 1, 0], [UP + 1, -3], [UP + 5, 4], [UP + 9, 2.5], [UP + 28, 2.5], [UP + 35, 0],
    [SIDE + 2, 0], [SIDE + 7, -4], [SIDE + 26, -4], [SIDE + 31, 0], [201, 0], [208, 6], [DOWN, 6], [DOWN + 5, 0]]) - nod;
  // the phone: the loop's phone pose (held under the chin) until he is caught; on the glance up the phone drops to
  // chest height (a hold pose, arm 1 = canvas right = his left hand) and stays there: the whole phone shows
  let pose = { ...base.pose, headTilt: tilt, lean };
  if (f >= UP + 1) {
    const k = base.pose.kind === "phone" ? smooth((f - UP - 1) / 5) : 1;
    // a scrolling thumb: the phone bobs a touch every ~1.5 s (a flick), and the hand rises as he looks down at it
    const flick = (() => { const x = ((t + 0.4) % 1.5) / 1.5; return x < 0.1 ? Math.sin((x / 0.1) * Math.PI) : 0; })();
    // ... and on the final look down he lifts it a little toward his face (the action we cut on)
    const lift = smooth((f - DOWN) / 5);
    const dir = lerp(-171, -152, k) + 3 * flick + 6 * lift, reach = lerp(0.35, 0.52, k) - 0.02 * flick - 0.05 * lift;
    pose = { kind: "hold", t, base: "seat", aim: [null, { dir, reach }], props: [null, "phone"], headTilt: tilt, lean } as typeof pose;
  }
  T.you.set({ ...base, pose, expr: exprAt(f, YOU_EX), blink: lid(f, SEAT.you, YOU_EX, YOU_POP, YOU_BLINK), lookUp, look, faceTurn: turned ? 1 : 0, fx: [] } as FigState);
}
function actWorker(w: World, T: Team, f: number) {
  const t = loopT(f), r = ramp(f), base = T.worker.st;
  // reading the screen while typing: the eyes run along a line, snap back to the next one
  const per = 1.25, x = (t % per) / per, run = x < 0.82 ? x / 0.82 : 1 - smooth((x - 0.82) / 0.18);
  // on 划水 his eyes flick to YOU (screen left = - look, up to YOU's face level) and back, with a huff
  const gl = win(f, SNK + 1, SNK + 5, SNK + 10, SNK + 14);
  const look = lerp(r * (-0.35 + 0.7 * run), -1.25, gl);
  const lookUp0 = (base.lookUp ?? 0) + r * (-0.45 - (base.lookUp ?? 0)) - 0.4 * r * keysFlick(t);
  const lookUp = lerp(lookUp0, -0.1, gl);
  // typing: bursts of shoulder / head bob (faster and bigger while he is pained); a slow head drift under it
  const ty = typing(t), hard = 1 + 0.5 * win(f, HELP - 2, HELP + 2, 192, 198);
  const tilt = r * (0.8 * Math.sin(t * 1.1) + 1.5 * hard * ty.env * ty.s * (1 - gl)) - 2 * gl;
  const lean = r * 0.8 * hard * ty.env * Math.sin(t * Math.PI * 2 * 2.6 + 1.2) * (1 - gl);
  const fx = fxAt(f, "sweat", HELP - 2, 206);
  T.worker.set({ ...base, pose: { ...base.pose, headTilt: tilt, lean }, expr: exprAt(f, WORKER_EX), blink: lid(f, SEAT.worker, WORKER_EX, WORKER_POP), look, lookUp, fx } as FigState);
}
function actMate(T: Team, who: "mate1" | "mate2", f: number, ex: [number, Expr][], seed: number) {
  const fig = T[who], t = loopT(f), r = ramp(f), base = fig.st;
  const laugh = exprAt(f, ex) === "laugh" ? 2.6 * Math.sin((f - 38) * 0.9) : 0;
  const lookUp = -0.85 + scrollEyes(t, seed) * r;
  fig.set({ ...base, pose: { ...base.pose, headTilt: r * sway(t, seed) + laugh }, expr: exprAt(f, ex), blink: lid(f, SEAT[who], ex), lookUp } as FigState);
}

// ---------------------------------------------------------------------------------------------------- segment
let T: Team | null = null;
const hv = new THREE.Vector3();
export const SEG: Segment = {
  id: "A", from: S.from, to: S.to,
  enter(w) { T = acquireTeam(w); },
  exit(w) { releaseTeam(w, T); T = null; },
  pose(w, f) {
    if (f >= CUT) {
      // POV insert of YOUR phone: 2D only (the classroom camera is kept so a still of this frame stays valid)
      const cam = camAt(CUT - 1); w.setCamera(cam);
      return { scene: "phone2d", camera: cam, overlays: h(PhonePOV, { f, cut: CUT, end: END, zoomAt: ZOOM }) };
    }
    const cam = camAt(f);
    w.setCamera(cam);
    const C = w.classroom;
    C.set.animate(loopT(f));
    C.set.objects.heroSheet.visible = false; C.set.objects.heroPen.visible = false;
    C.crowd.state = EMPTY_CROWD;
    const team = T!;
    teamLoopState(w, team, f);
    if (f > 0) {
      actYou(w, team, f); actWorker(w, team, f);
      actMate(team, "mate1", f, MATE1_EX, 0.7); actMate(team, "mate2", f, MATE2_EX, 1.3);
    }
    C.update(loopT(f));
    // the −15% beside YOU: above his head, a little toward the side the worker sat on (clear of his face and of the
    // caption band)
    const hw = team.you.headWorld(hv), you = w.project(hw), top = w.project(hv.set(hw.x, hw.y + team.you.headR, hw.z));
    const px = Math.max(280, Math.min(800, you.x + 120)), py = Math.max(300, Math.min(900, top.y - 150));
    const overlays = f >= PCT_IN && f <= PCT_OUT + 6 ? h(MinusPct, { f, at: PCT_IN, out: PCT_OUT, x: px, y: py, size: 210 }) : null;
    if (IP.dbg) {
      const row = (n: string, F: typeof team.you) => { const p = F.headWorld(); const q = w.project(p); return `${n} head (${p.x.toFixed(2)},${p.y.toFixed(2)},${p.z.toFixed(2)}) -> ${(q.x / 10.8).toFixed(0)}% ${(q.y / 19.2).toFixed(0)}% r ${(F.headR / q.z * 1920 / (2 * Math.tan((cam.fov * Math.PI) / 360))).toFixed(0)}px view ${F.sv?.view}`; };
      console.log(`[segA] f${f} ${row("you", team.you)} | ${row("worker", team.worker)} | ${row("mate1", team.mate1)} | ${row("mate2", team.mate2)}`);
    }
    return { scene: "classroom", camera: cam, overlays };
  },
};
