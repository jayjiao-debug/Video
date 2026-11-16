// THE HOOK (STORYBOARD line 1, shot 1; the callback, shot 11): the envoy with his back to E1 holding the jade high in
// ONE hand, the half-risen King of Qin across the hall waving both hands, from CAMS.hook. Shot 1 (WP7) and shot 11
// (WP8) both call hookPose(w, f, f0) with their own first frame f0, so 852 shows exactly what 0 shows (minus the
// subtitle and the tag): every clock here (the wave, the head shake, the breathing, the jade's tremble, the panic
// strokes, the blinks) runs on u = f - f0, never on w.t or on the film frame.
//
//   const H = hookPose(w, f, shot("1").from, { feint: FEINT1, kingExpr: [[0, "shock"], [HIT.glint1 + 1, "nervous"]] });
//   return { camera: H.camera, hud: false, overlays: frag(...H.overlays, myTag) };
//
// What it does: setPlace("hall") (no ceremony, no map stand), the camera (CAMS.hook with its slow push and the
// shake on the strike), both figures, w.update(), the jade put on the envoy's hand; it returns the camera, both rigs,
// their heads on screen, the jade's centre (world and screen), the king's hands on screen, and the overlays it owns
// (the panic strokes at the king's hands, the gold smear of the strike). The caller adds its own (the tag, the glint).
//
// FRAME 0 (the thumbnail): LIN_RAGE at HALL.pillar, his back and left shoulder against E1, facing -0.45, head tilt
// +8 deg toward the pillar, gaze +1, face huff; his LEFT hand (hand 1, screen right) up beside his head under the
// disc's bottom edge (HALL.jadeHand0; the disc's centre HALL.jade0, hook 71/37); his right hand hangs. The King of Qin
// half-risen from the 榻 (seated(..., { rise: 0.45 })), both hands up and out (HALL.kingHookHand), face shock, gaze +1.
// THE FEINT (Feint: absolute frames, so 11 times its own): the wind-up draws the disc to HALL.jadeWind (65/35: up and
// toward screen LEFT, away from the column) and he coils (tilt +14, head down 2 cm) while the king's hands freeze high;
// the strike swings it across to HALL.jadeHit (76/39) in 3 frames and STOPS on `hit`, never touching the lacquer, his
// body turning to facing -0.25 with it (rig.qa: at -0.45 the hand is 1.7 cm short of jadeHit's rim point, at -0.25 it
// reaches); a gold smear arc follows it; the camera shakes; the king winces; his hands wave again from `rewave`.
// WP1b's jade marks are the disc's CENTRE (rig.qa: as hand points they are 7-9 cm out of reach); the hand is the rim
// point under it (raiseJade).
import * as THREE from "three";
import type React from "react";
import type { CamPose } from "../story";
import { FPS, lerp, lin, smooth, easeInQuad } from "../story";
import type { World } from "../world";
import { HIT } from "../beats";
import { CAMS, HALL } from "../layout";
import { PEOPLE, type Person } from "../people";
import { panic, smear } from "../hud";
import { V, lid, at, accent, heads, headPx, headM, seated, raiseJade, kingWave, kingShake, shake, type Rig, type RigState } from "./common";

type Extra = Partial<RigState>;
type Expr = NonNullable<RigState["expr"]>;

/** THE FEINT's frames (absolute): the wind-up starts on `wind` and has arrived 6 frames before `strike`; the strike
 *  leaves on `strike` and stops on `hit` (3 frames); the king's hands freeze over the 13 frames from `wind` and wave
 *  again from `rewave` */
export type Feint = { wind: number; strike: number; hit: number; rewave: number };
/** shot 1's feint: 要往 (75) the wind-up, 撞 (100) the stop, the wave again on 104 (the cut to 2 comes on it) */
export const FEINT1: Feint = { wind: HIT.wind1, strike: HIT.smash1 - 2, hit: HIT.smash1, rewave: HIT.smash1 + 4 };

/** the hook camera on the shot's clock u: CAMS.hook with the slow push fov 28 -> 26 (eased over `len` frames) */
export const hookCam = (u: number, len = 107): CamPose => ({ ...CAMS.hook, fov: lerp(CAMS.hook.fov, 26, smooth(u / len)) });

/** the envoy's facing at the pillar, and after the strike (he turns into the swing) */
const FACING0 = HALL.pillarFacing, FACING_HIT = -0.25;
/** the envoy's head: tilt (deg, + = its top toward screen right, the pillar) at rest, wound up, after the stop; dx (head
 *  radii, - = toward screen left) keeps the tilted head and its rage tufts clear of the disc beside it and of his own
 *  raised arm (the clearance checker: the disc's edge is 1 cm from the untilted head at HALL.jade0). With these, the
 *  hold 1 cm low (LOW) and the squash at 0.2, rig.qa.clear is >= 0 on 0-171 (was 13 mm inside with -0.17 / -0.22 /
 *  -0.12); a wider wind-up lean (-0.33) moves the overlap to the strike instead */
const HEAD = { tilt0: 8, tiltWind: 11, tiltHit: 6, dx0: -0.19, dxWind: -0.28, dxHit: -0.16 };
/** the disc's roll at the stop (rad, + = its top toward screen left): it leans into the swing, top toward the column */
const ROLL_HIT = -0.14;
/** the whole hold 1 cm under WP2's marks: at their height the raised forearm passed up to 5.2 mm inside his head's
 *  real shape over the wind-up (88-97, hidden behind it) and 1.6 mm on 62-63; 1 cm lower, rig.qa.clear is >= 0 */
const LOW = V(0, -0.01, 0);

/** where the jade is on frame f (u = f - f0): its centre, its put rotation and how far the strike has gone (0..1) */
export const hookJade = (f: number, u: number, F?: Feint): { c: THREE.Vector3; rot: [number, number, number]; k: number; wind: number } => {
  const t = u / FPS, quiet = F ? 1 - smooth(lin(f, F.wind, F.wind + 6)) : 1;
  // the tremble: +-1 cm at 2 Hz (and a little up and down), dying away as he winds up
  const tr = V(0.01 * Math.sin(2 * Math.PI * 2 * t), 0.006 * Math.sin(2 * Math.PI * 2 * t + 1.1), 0).multiplyScalar(quiet);
  if (!F) return { c: HALL.jade0.clone().add(tr).add(LOW), rot: [0, 0, 0], k: 0, wind: 0 };
  const wk = smooth(lin(f, F.wind, F.strike - 6));                          // the wind-up
  const coil = V(-0.006, 0.004, 0.004).multiplyScalar(smooth(lin(f, F.strike - 6, F.strike)));   // a last draw-back
  const sk = f < F.strike ? 0 : f >= F.hit ? 1 : easeInQuad((f - F.strike + 1) / (F.hit - F.strike + 1));
  const wind = HALL.jadeWind.clone().add(coil);
  const c = HALL.jade0.clone().lerp(wind, wk).add(tr).lerp(HALL.jadeHit, sk).add(LOW);
  return { c, rot: [0, 0, ROLL_HIT * sk], k: sk, wind: wk };
};

/** the envoy's state on frame f (LIN_RAGE unless `who` says otherwise): pin hand 1 to the returned jade's hand */
export const hookLin = (f: number, u: number, F?: Feint): { state: Extra; jade: ReturnType<typeof hookJade>; hand: THREE.Vector3; put: ReturnType<typeof raiseJade>["put"] } => {
  const J = hookJade(f, u, F), R = raiseJade(J.c, J.rot), t = u / FPS;
  const fc = lerp(FACING0, FACING_HIT, F ? smooth(lin(f, F.strike - 1, F.hit + 1)) : 0);
  const after = F ? smooth(lin(f, F.hit, F.hit + 8)) : 0;
  const tilt = HEAD.tilt0 + (HEAD.tiltWind - HEAD.tilt0) * J.wind * (1 - after) + (HEAD.tiltHit - HEAD.tilt0) * after;
  const dx = HEAD.dx0 + (HEAD.dxWind - HEAD.dx0) * J.wind * (1 - after) + (HEAD.dxHit - HEAD.dx0) * after;
  const dy = headM(-0.02) * J.wind * (1 - after);
  return {
    state: {
      at: HALL.pillar.clone(), facing: fc, pose: { kind: "idle", t: t + 0.4 },
      hands: [null, R.hand], expr: "huff", gaze: 1,
      blink: u < 8 ? 0 : lid(t, 1),
      // the squash on the stop at 0.2: wider, the head met the extended arm (rig.qa.clear -9 mm at 0.6, -3.6 at 0.35)
      head: heads({ tilt, dx, dy }, F ? accent("squash", f, F.hit, { amp: 0.2 }) : undefined),
      visible: true,
    },
    jade: J, hand: R.hand, put: R.put,
  };
};

/** how wide the King of Qin's wave is on frame f: 1, frozen high over the wind-up, back from `rewave` */
export const waveAmp = (f: number, F?: Feint) => (F ? (f < F.rewave ? 1 - smooth(lin(f, F.wind, F.wind + 13)) : smooth(lin(f, F.rewave, F.rewave + 6))) : 1);

/** the King of Qin's state in the hook on frame f (u = f - f0): half-risen, hands waving at amplitude amp, face by
 *  `expr` keys (absolute frames), gaze +1 (at the envoy); the wince on the stop */
export const hookKing = (r: Rig, f: number, u: number, amp: number, expr: [number, Expr][], F?: Feint, extra: Extra = {}): Extra => {
  const t = u / FPS, sc = PEOPLE.qinWang.scale ?? 1;
  const wince = F && f >= F.hit && f < F.hit + 8 ? 1 - (f - F.hit) / 8 : 0;
  return {
    ...seated(HALL.seat, t, { rise: 0.45, hipY: r.dim.hipY, scale: sc }),
    hands: kingWave(u, amp), expr: at(f, expr), gaze: 1,
    blink: F && f >= F.hit && f < F.hit + 2 ? 1 : u < 8 ? 0 : lid(t, 2, expr.slice(1).map(([k]) => (k - (f - u)) / FPS)),
    head: heads(kingShake(u, amp), wince ? { dy: headM(-0.03) * wince } : undefined),
    visible: true, ...extra,
  };
};

export type HookOpts = {
  /** the wind-up and the strike (none: the frame-0 hold with the wave, the breathing, the tremble) */ feint?: Feint;
  /** the king's face, [absolute frame, expr] step keys (default shock) */ kingExpr?: [number, Expr][];
  /** who plays the envoy (default LIN_RAGE) */ lin?: Person;
  /** frames of the slow push (default 107: shot 1's length) */ push?: number;
  /** a last change to the camera (11's punch-in): applied after the push and the shake */ camera?: (c: CamPose, f: number) => CamPose;
};
export type HookOut = {
  camera: CamPose; lin: Rig; king: Rig;
  /** heads on screen (headPx), the jade's centre (world, screen and its radius in px), the king's hands on screen */
  linHead: ReturnType<typeof headPx>; kingHead: ReturnType<typeof headPx>;
  jade: THREE.Vector3; jadePx: { x: number; y: number; r: number }; hands: { x: number; y: number }[];
  /** the panic strokes and the smear (give them on every frame of the shot) */ overlays: React.ReactNode[];
};

/** THE HOOK on frame f of a shot that starts on f0 (shot 1: 0, shot 11: 852). Call it FIRST in the shot (it sets the
 *  place, the camera, both figures, updates and puts the jade); add your own overlays to H.overlays. */
export function hookPose(w: World, f: number, f0: number, o: HookOpts = {}): HookOut {
  const u = f - f0, F = o.feint;
  let camera = hookCam(u, o.push);
  if (F) camera = shake(camera, f, F.hit, 6, 6.3, 8);
  if (o.camera) camera = o.camera(camera, f);
  w.setPlace("hall");
  w.setCamera(camera);
  const L = hookLin(f, u, F);
  const env = w.actor(o.lin ?? PEOPLE.linRage);
  env.set(L.state);
  const king = w.actor(PEOPLE.qinWang);
  king.set(hookKing(king, f, u, waveAmp(f, F), o.kingExpr ?? [[f0, "shock"]], F));
  w.update();
  w.prop("jade").put(L.hand, L.put);
  // ---- on screen
  const jp = w.project(L.jade.c), je = w.project(L.jade.c.clone().add(V(0, 0.1275, 0)));
  const hands = [0, 1].map((i) => { const q = w.project(king.handWorld(i as 0 | 1)); return { x: q.x, y: q.y }; });
  const overlays: React.ReactNode[] = [panic({ f, from: f0, pts: hands, key: `panic${f0}` })];
  if (F) {
    const a = w.project(HALL.jadeWind), b = w.project(HALL.jadeHit);
    // thick and well bent (the default 40 px / 0.22 read as a thin sliver on a phone); it cannot start further back:
    // the wind-up point is beside his hat
    overlays.push(smear({ f, from: F.strike, a: { x: a.x, y: a.y }, b: { x: b.x, y: b.y }, width: 64, bend: 0.34, key: `smear${F.strike}` }));
  }
  return {
    camera, lin: env, king, linHead: headPx(w, env), kingHead: headPx(w, king),
    jade: L.jade.c, jadePx: { x: jp.x, y: jp.y, r: Math.abs(jp.y - je.y) }, hands, overlays,
  };
}

/** the hook's numbers for a caller that needs them (WP8's 10b / 11) */
export const HOOK = { FACING0, FACING_HIT, ROLL_HIT };
