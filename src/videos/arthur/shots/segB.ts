// Segment B, frames 452-842 (narration lines 6-9): the forgotten sword and the FIRST pull. Season 0 (snow).
//
//  452  fieldWide   the tournament edge: tents, pennants, the crowd cheering behind the tilt fence; Kay strides to his
//                   mark, Arthur trots in behind him; the camera travels with them.            新年【比武大会】
//  486  names       STAGE.field: name tags 亚瑟 (486) and 凯 / 亚瑟的哥哥 (508); Kay waves.      亚瑟的哥哥叫【凯】
//  525  knight      from the left front: Kay puffs up, fists up, a sparkle off his helmet; Arthur claps.  刚当上骑士
//  552  pat         close on Kay's belt: his hand pats the scabbard, twice ...                    一摸腰
//  568              ... it is EMPTY: shock, "!", a burst round the scabbard.                      【剑忘带了】
//  577  go          two-shot: Kay points "go!"; Arthur jolts, turns and (591) RUNS off right.     【亚瑟】回去拿
//  606  house       the lodging: Arthur runs up to the door (back view), skids, knocks three times (618, 622, 626),
//                   rattles the padlock, "?".                                                     家里【没人】
//  640  crowd       the field: the whole street is behind the fence, watching (Ector in the middle).  全看比武去了
//  659  door        Arthur at the door turns to us: slumps, shakes his head; 675 "!": he remembers (a thought bubble
//                   with the sword in the stone); 691 he sprints off LEFT.                        他想起 / 石头上...
//  703  yard        the stone and the shining sword; Arthur runs in from the right and skids.     【还插着一把】
//  735  spears      wide: TEN spears stand alone in a row behind the stone, footprints lead away; Arthur looks left,
//                   looks right, "?".                                                             连【十个守卫】
//  762  guards      the field: ten guards (no spears) cheer behind the fence; the camera runs along the row.  都看比武去了
//  779  pull        Arthur shrugs, hops onto the stone (lands 792), draws the sword with one hand (795-818, free on
//                   808) and holds it up; 826 "第一次"; 832 he hops down and runs off LEFT with it.  他一拔就出来 / 【第一次】
//
// Own props (segB_props.ts): the ten spears with their heaps of snow and the footprints, two puffs of snow.
// Own overlays (segB_ov.ts): speed lines for the runs, the thought bubble.
import React from "react";
import * as THREE from "three";
import type { World } from "../world";
import { SEGMENTS, FPS, h, lin, smooth, lerp, clamp01, easeOutCubic, easeInOutCubic, hash, camMix, type Segment, type Pose, type CamPose, type Vec3 } from "../story";
import { PEOPLE, SPOT, STAGE, V, lerpA, lid, accent, heads, walkAlong, hopArc, pullOut, pullOutAfter, raisePoint, rigWalk, cam, type Rig, type RigState, type RigHead } from "./common";
import { PullCounter, Mark, Burst, NameTag } from "../overlay";
import { CornerTag } from "../../group/kit/overlay";
import { propsOf, hideProps, SPEAR_N } from "./segB_props";
import { speedLines, thoughtSword } from "./segB_ov";

const S = SEGMENTS[1];

// ------------------------------------------------------------------------------------------------- beats (film frames)
const F = {
  wide: 452, names: 486, tagKay: 508, knight: 525, pat: 552, forgot: 568, go: 577, run: 591,
  house: 606, knock: [618, 622, 626], nobody: 629, crowd: 640, door: 659, idea: 675, sprint: 691,
  yard: 703, spears: 735, guards: 762, shrug: 779, hop: 786, land: 792, pull0: 795, pull1: 818, count: 826, off: 832, down: 838,
};
type Expr = NonNullable<RigState["expr"]>;
type Shot = (w: World, f: number) => Pose;

// ------------------------------------------------------------------------------------------------- small helpers
const PI = Math.PI;
const tOf = (f: number) => f / FPS;
/** the value of the last key at or before f */
const keyAt = <T,>(f: number, keys: [number, T][]): T => { let v = keys[0][1]; for (const [k, x] of keys) if (f >= k) v = x; return v; };
/** piecewise-linear keys */
const kf = (f: number, keys: [number, number][]) => {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 0; i + 1 < keys.length; i++) if (f <= keys[i + 1][0]) return lerp(keys[i][1], keys[i + 1][1], (f - keys[i][0]) / (keys[i + 1][0] - keys[i][0]));
  return keys[keys.length - 1][1];
};
/** blink with the expression swaps hidden under it */
const bl = (f: number, id: number, swaps: number[] = []) => lid(tOf(f), id, swaps.map(tOf));
/** a camera kick: 3 frames of a few cm, straight up and down (never a roll) */
const kick = (c: CamPose, f: number, at: number, amp = 0.035): CamPose => {
  const d = f - at;
  if (d < 0 || d > 2) return c;
  const dy = amp * [1, -0.55, 0.2][d], p = c.pos as Vec3, l = c.look as Vec3;
  return { ...c, pos: [p[0], p[1] + dy, p[2]], look: [l[0], l[1] + dy, l[2]] };
};
/** unit vectors of the picture at a floor point: toward the camera, and screen right */
const screenAxes = (w: World, at: THREE.Vector3) => {
  const toCam = V(w.camera.position.x - at.x, 0, w.camera.position.z - at.z).normalize();
  return { toCam, right: V(toCam.z, 0, -toCam.x) };
};
/** a point staged for the camera: `r` to screen right, `up` above the floor, `fwd` toward the camera */
const staged = (w: World, at: THREE.Vector3, r: number, up: number, fwd: number) => { const a = screenAxes(w, at); return at.clone().addScaledVector(a.right, r).addScaledVector(a.toCam, fwd).add(V(0, up, 0)); };
/** where the top of a figure's head is on screen (px) */
const headTop = (w: World, r: Rig) => { const p = r.headWorld(); p.y += 0.25; return w.project(p); };
const frag = (...kids: React.ReactNode[]) => h(React.Fragment, null, ...kids);

// ------------------------------------------------------------------------------------------------- the field crowd
// Behind the tilt fence (z -3.2), facing the lists (= us). The set's eight anchors (1.2 m apart) carry commoner(0..7)
// as in preview/act_test "field"; a 9:16 frame only shows 2-3 m of the fence, so more people stand between them and
// in a second row. Ector is in the middle of them (the family IS at the tournament).
type CrowdSpot = { who: (typeof PEOPLE)["kay"]; x: number; z: number; id: number };
const CROWD: CrowdSpot[] = (() => {
  const out: CrowdSpot[] = [];
  for (let k = 0; k < 8; k++) out.push({ who: PEOPLE.commoner(k), x: -18.7 + (k - 3.5) * 1.2, z: -3.2, id: 20 + k });
  out.push({ who: PEOPLE.ector, x: -18.7, z: -3.2, id: 40 });
  out.push({ who: PEOPLE.commoner(8), x: -17.5, z: -3.2, id: 28 }, { who: PEOPLE.commoner(9), x: -19.9, z: -3.2, id: 29 });
  [-19.6, -19.0, -18.4, -17.8, -17.2, -16.6].forEach((x, i) => out.push({ who: PEOPLE.commoner(10 + i), x, z: -3.85, id: 30 + i }));
  return out;
})();
const CHEER_FACES: Expr[] = ["happy", "laugh", "grin", "happy", "laugh", "smile"];
/** the crowd at the fence. wild 0..1 = how hard they cheer (jumps); sweep = a gaze (-1..1) they all follow (the
 *  jousters riding past, unseen) or null; boom = the frame a hit lands and everybody goes up */
function fieldCrowd(w: World, f: number, o: { wild?: number; sweep?: number | null; boom?: number; only?: (s: CrowdSpot) => boolean } = {}) {
  const t = tOf(f), wild = o.wild ?? 0.4;
  for (const s of CROWD) {
    if (o.only && !o.only(s)) continue;
    const ph = hash(s.id, 1) * 6.283, late = Math.floor(hash(s.id, 2) * 4);
    const after = o.boom !== undefined ? f - o.boom - late : -1;
    // a jump: a quick hop every half second or so, each on his own beat; after a boom all go up together
    const beat = (t * (2.1 + 0.5 * hash(s.id, 4)) + hash(s.id, 5)) % 1;
    let jump = wild * 0.09 * Math.max(0, Math.sin(beat * PI * 2));
    if (o.boom !== undefined && after < 0) jump = 0;
    if (after >= 0) jump = 0.17 * Math.abs(Math.sin((after / 7) * PI));
    const up = after >= 0 ? 1 : o.boom !== undefined ? 0.35 : 1;
    const expr: Expr = o.boom !== undefined && after < 0 ? (hash(s.id, 6) < 0.5 ? "smile" : "shock") : o.boom !== undefined ? (s.id % 2 ? "laugh" : "grin") : CHEER_FACES[s.id % CHEER_FACES.length];
    const gaze = o.sweep !== null && o.sweep !== undefined && after < 0 ? Math.round(o.sweep * 2) / 2 : [0, 0.5, 0, -0.5][Math.floor(t * 1.3 + hash(s.id, 3) * 4) % 4];
    w.actor(s.who).set({
      at: V(s.x, jump, s.z), facing: (s.x + 18.3) * -0.04, pose: { kind: "cheer", t: t * (1 + 0.6 * wild) + ph, amount: 0.6 + 0.9 * wild * up },
      expr, gaze, blink: bl(f, s.id), head: heads(after >= 0 ? accent("pop", f, (o.boom ?? 0) + late) : undefined, o.sweep ? { tilt: 3 * o.sweep } : undefined),
      visible: true,
    });
  }
}

// ------------------------------------------------------------------------------------------------- 452-485  fieldWide
const KAY_MARK = STAGE.field.kay, ART_MARK = STAGE.field.arthur;
const KAY_WALK = { pts: [V(-15.3, 0, 2.6), KAY_MARK.at], speed: 2.2, f0: 447 };
const ART_WALK = { pts: [V(-13.95, 0, 2.75), ART_MARK.at], speed: 2.16, f0: 444 };
/** Kay striding in / standing on his mark; Arthur trotting in behind him (short quick steps) */
function kayArrives(w: World, f: number, extra: Partial<RigState> = {}) {
  const k = walkAlong(KAY_WALK.pts, KAY_WALK.speed, (f - KAY_WALK.f0) / FPS, { endFacing: KAY_MARK.facing });
  return w.actor(PEOPLE.kay).set({ at: k.at, facing: k.facing, pose: k.pose, expr: "smug", blink: bl(f, 2), visible: true, ...extra });
}
function arthurArrives(w: World, f: number, extra: Partial<RigState> = {}) {
  const a = walkAlong(ART_WALK.pts, ART_WALK.speed, (f - ART_WALK.f0) / FPS, { endFacing: ART_MARK.facing });
  const stride = 0.2, pose = a.moving ? { kind: "walk" as const, phase: (a.d / ((2 * stride) / 0.6)) % 1, stride, amount: 1.15 } : a.pose;
  return w.actor(PEOPLE.arthur).set({ at: a.at, facing: a.facing, pose, expr: "smile", blink: bl(f, 1), visible: true, ...extra });
}
const tagNew = (f: number) => h(CornerTag, { key: "ny", at: 454, out: 583, text: "新年", icon: "none", tone: "white", frame: f });

const fieldWide: Shot = (w, f) => {
  const c = camMix(cam([-14.75, 1.55, 8.9], [-15.55, 0.8, 0], 48), cam([-17.62, 1.45, 7.6], [-17.72, 0.9, 0.5], 44), smooth(lin(f, 440, 492)));
  w.setCamera(c);
  kayArrives(w, f, { gaze: keyAt(f, [[452, 0], [466, -0.5], [476, 0]]), head: heads({ dy: 0.04 }, accent("nod", f, 470)) });
  // Arthur hurries after him, looking round at the tents and the crowd
  arthurArrives(w, f, { expr: keyAt<Expr>(f, [[452, "smile"], [470, "happy"]]), gaze: keyAt(f, [[452, -0.5], [462, 1], [472, -1], [482, -0.5]]), blink: bl(f, 1, [470]) });
  fieldCrowd(w, f, { wild: 0.7 });
  w.update();
  return { camera: c, overlays: frag(tagNew(f)), focus: [-17, 0.5] };
};

// ------------------------------------------------------------------------------------------------- 486-524  names
const names: Shot = (w, f) => {
  // STAGE.field's marks and direction, from 0.6 m further back: at 3.5 m the two heads touch the frame's edges
  const u = lin(f, F.names, F.knight - 1), c0 = STAGE.field.cam, p = c0.pos as Vec3, l = c0.look as Vec3;
  const c: CamPose = { pos: [p[0] + 0.02, p[1] + 0.01, p[2] + 0.8 - 0.3 * u], look: [l[0] + 0.05, l[1], l[2]], fov: c0.fov };
  w.setCamera(c);
  // Kay plants himself, then waves to the stands (the hand between the two of them: inside the frame)
  const waving = f >= 492;
  const K = kayArrives(w, f, waving ? {
    pose: { kind: "wave", arm: 1, t: (f - 492) / FPS }, expr: keyAt<Expr>(f, [[492, "grin"], [F.tagKay, "smug"], [516, "grin"]]),
    gaze: keyAt(f, [[492, -0.5], [500, 0.5], [F.tagKay, 0], [517, -0.5]]), blink: bl(f, 2, [F.tagKay, 516]), head: heads(accent("pop", f, F.tagKay), accent("lean", f, 494, { dur: 0.9, dir: -1 })),
  } : { head: accent("squash", f, 485) });
  // Arthur arrives a few steps later, takes it all in, then looks up at his big brother
  const A = arthurArrives(w, f, {
    expr: keyAt<Expr>(f, [[486, "smile"], [503, "grin"]]), gaze: keyAt(f, [[486, -0.5], [493, 0.5], [499, 0], [505, -1]]), blink: bl(f, 1, [503]),
    head: heads(accent("squash", f, 489), accent("lean", f, 505, { dur: 0.7, dir: -1 }), accent("nod", f, F.tagKay + 2)),
  });
  fieldCrowd(w, f, { wild: 0.55 });
  w.update();
  const ha = headTop(w, A), hk = headTop(w, K);
  return {
    camera: c, focus: [-17.5, 1],
    overlays: frag(tagNew(f),
      h(NameTag, { key: "na", at: F.names, out: 541, x: Math.min(ha.x, 930), y: ha.y - 120, text: "亚瑟", frame: f }),
      h(NameTag, { key: "nk", at: F.tagKay, out: 541, x: Math.max(hk.x, 250), y: hk.y - 150, text: "凯", sub: "亚瑟的哥哥", frame: f })),
  };
};

// ------------------------------------------------------------------------------------------------- 525-551  knight
/** two hands clapping in front of the chest, a clap every 6 frames (they meet on f0, f0 + 6 ...) */
const clap = (w: World, at: THREE.Vector3, f: number, f0: number): [THREE.Vector3, THREE.Vector3] => {
  const ph = (((f - f0) % 6) + 6) % 6, sep = 0.035 + 0.15 * [0, 0.55, 1, 1, 0.6, 0.2][ph];
  return [staged(w, at, -sep / 2, 0.93, 0.21), staged(w, at, sep / 2, 0.93, 0.21)];
};
const knight: Shot = (w, f) => {
  const u = lin(f, F.knight, F.pat - 1);
  // (from the left front, 40 degrees round from the names shot: Kay nearer and bigger, showing off to the stands on
  // our side; Arthur beyond him, clapping)
  const c = camMix(cam([-20.15, 1.36, 5.95], [-17.65, 0.92, 2.65], 42), cam([-20.0, 1.35, 5.75], [-17.65, 0.94, 2.65], 42), u);
  w.setCamera(c);
  const t = tOf(f), K = w.actor(PEOPLE.kay), A = w.actor(PEOPLE.arthur);
  // Kay puffs up: fists up beside the helmet, chin up, eyes shut in bliss, a pump on each beat
  const pump = Math.max(0, Math.sin(((f - 527) / 9) * PI * 2)) * (f >= 527 ? 1 : 0);
  K.set({
    at: KAY_MARK.at.clone().add(V(0, 0.02 * pump, 0)), facing: -0.45, pose: { kind: "cheer", t, amount: 0.25 },
    expr: keyAt<Expr>(f, [[525, "grin"], [530, "smug"]]), blink: f >= 533 && f <= 546 ? 1 : bl(f, 2, [530]), gaze: 0,
    head: heads({ dy: 0.06 + 0.05 * pump, tilt: -3 }, accent("pop", f, 526), accent("pop", f, 538, { amp: 0.7 })), visible: true,
  });
  // Arthur claps, looking up at him
  const aAt = ART_MARK.at.clone().add(V(0, 0.025 * Math.max(0, Math.sin(((f - 526) / 6) * PI * 2)), 0));
  A.set({
    at: aAt, facing: -0.5, pose: { kind: "idle", t }, hands: clap(w, aAt, f, 527), expr: keyAt<Expr>(f, [[525, "grin"], [540, "happy"]]),
    gaze: -1, blink: bl(f, 1, [540]), head: heads({ tilt: -4 }, accent("nod", f, 533, { amp: 0.6 }), accent("nod", f, 545, { amp: 0.6 })), visible: true,
  });
  // (from this side the frame's left edge would cut the man at x -15.7 in half: he is left out of this shot)
  fieldCrowd(w, f, { wild: 0.6, only: (s) => Math.abs(s.x + 15.7) > 0.3 });
  w.update();
  // (the sparkles sit on the helmet's two shoulders, clear of the name tag above it)
  const ha = headTop(w, A), hk = headTop(w, K), helm = w.project(K.headWorld());
  return {
    camera: c, focus: [-17.5, 1],
    overlays: frag(tagNew(f),
      h(NameTag, { key: "na", at: F.names, out: 541, x: Math.min(ha.x, 930), y: ha.y - 120, text: "亚瑟", frame: f }),
      h(NameTag, { key: "nk", at: F.tagKay, out: 541, x: Math.max(hk.x, 250), y: hk.y - 150, text: "凯", sub: "亚瑟的哥哥", frame: f }),
      h(Burst, { key: "b1", at: 528, x: helm.x - 165, y: helm.y - 110, r: 90, n: 8, frame: f }),
      h(Burst, { key: "b2", at: 539, x: helm.x + 150, y: helm.y - 140, r: 70, n: 6, color: "#ffffff", frame: f })),
  };
};

// ------------------------------------------------------------------------------------------------- 552-576  pat
/** the mouth of Kay's scabbard in the world (acc/garb.ts scabbard: at the body's left side, 4 cm under the body's
 *  bottom edge), for a Kay who stands upright at `at` with his body turned `yaw` (= his facing while that is within
 *  30 degrees of the camera) */
const scabbardMouth = (K: Rig, at: THREE.Vector3, yaw: number) => {
  const x = K.dim.rb - 0.004, z = -0.012, c = Math.cos(yaw), s = Math.sin(yaw);
  return V(at.x + x * c + z * s, at.y + K.dim.hipY - 0.04, at.z - x * s + z * c);
};
const KAY_PAT_FACING = -0.22;
const pat: Shot = (w, f) => {
  // all of Kay in the upper 60 % of the frame: the scabbard hangs from the hip to the knee and must stay clear of the
  // caption band
  const u = smooth(lin(f, F.pat - 3, F.forgot + 2));
  let c = camMix(cam([-17.75, 1.33, 6.2], [-17.95, 0.5, 2.6], 38), cam([-17.79, 1.3, 5.85], [-17.95, 0.5, 2.6], 38), u);
  c = kick(c, f, F.forgot, 0.02);
  w.setCamera(c);
  const t = tOf(f), K = w.actor(PEOPLE.kay), at = KAY_MARK.at.clone();
  const shocked = f >= F.forgot;
  // the hand goes for the hilt: up, SLAP on the scabbard's mouth (554), up, SLAP (560), then it gropes round the mouth
  // ... nothing there; after 568 it flaps about in panic
  const lift = kf(f, [[552, 0.9], [554, 0], [557, 1], [560, 0], [563, 0.5], [565, 0], [567, 0.3]]);
  const m = scabbardMouth(K, at, KAY_PAT_FACING), ax = screenAxes(w, at);
  // (where a hilt would stand: just above and in front of the mouth)
  const hand = m.clone().addScaledVector(ax.right, 0.012 + 0.13 * lift).add(V(0, 0.05 + 0.17 * lift, 0)).addScaledVector(ax.toCam, 0.035 + 0.02 * lift);
  const slap = Math.max(0, 1 - Math.abs(f - 554) / 2, 1 - Math.abs(f - 560) / 2);
  K.set({
    // 568: it is not there: both hands fly up beside the helmet
    at, facing: KAY_PAT_FACING, pose: shocked ? { kind: "cheer", t: t * 2.2, amount: 0.5 } : { kind: "idle", t }, hands: shocked ? undefined : [null, hand],
    expr: shocked ? "shock" : keyAt<Expr>(f, [[552, "smug"], [556, "neutral"], [561, "nervous"]]),
    gaze: shocked ? (f < 573 ? 0 : 1) : 1, lookDown: shocked ? 0 : kf(f, [[552, 6], [555, 20], [567, 24]]),
    blink: shocked ? 0 : bl(f, 2, [556, 561]),
    head: heads(shocked ? accent("jolt", f, F.forgot) : { tilt: 5 + 2 * slap, dy: -0.04 * slap }, shocked ? accent("shake", f, 572, { amp: 0.7 }) : undefined),
    visible: true,
  });
  fieldCrowd(w, f, { wild: 0.5 });
  w.update();
  const pm = w.project(m.clone().add(V(0, -0.08, 0))), hk = headTop(w, K), ph = w.project(m.clone().add(V(0, 0.03, 0)));
  return {
    camera: c, focus: [-17.8, 1],
    overlays: frag(tagNew(f),
      h(Burst, { key: "p1", at: 554, x: ph.x + 12, y: ph.y, r: 70, n: 7, color: "#ffffff", frame: f }),
      h(Burst, { key: "p2", at: 560, x: ph.x + 12, y: ph.y, r: 70, n: 7, color: "#ffffff", frame: f }),
      h(Burst, { key: "p3", at: F.forgot + 1, x: pm.x + 10, y: pm.y, r: 140, n: 12, frame: f }),
      h(Mark, { key: "m", kind: "!", at: F.forgot, x: hk.x + 250, y: hk.y + 70, size: 210, frame: f })),
  };
};

// ------------------------------------------------------------------------------------------------- 577-605  go
const ART_RUN = { pts: [ART_MARK.at, V(-9, 0, 3.05)], speed: 4.3 };
const go: Shot = (w, f) => {
  const t = tOf(f), K = w.actor(PEOPLE.kay), A = w.actor(PEOPLE.arthur);
  const run = walkAlong(ART_RUN.pts, ART_RUN.speed, (f - F.run) / FPS);
  // the camera holds the two, then travels with the runner (he gains on it: he is leaving)
  // (it catches up with him in 8 frames and then keeps him just left of the middle: room ahead of the runner)
  const cx = lerp(-17.5, run.at.x + 0.22, smooth(lin(f, F.run, 599))), pull = smooth(lin(f, F.run, 604));
  const c = cam([cx, 1.37, 6.75 + 0.3 * pull], [cx - 0.03, 1.02, 2.65], 40);
  w.setCamera(c);
  // Kay: turned to Arthur, the arm shoots out to the right: "go!"; a second jab; then he watches him leave
  const jab = kf(f, [[576, 0.45], [579, 1], [583, 1], [585, 0.72], [587, 1.05], [589, 1], [596, 1], [603, 0.1]]);
  const kAt = KAY_MARK.at.clone(), target = kAt.clone().add(V(3.2, 0.98 + 2.3 * Math.min(1, jab) - 1.2 * (1 - Math.min(1, jab)), 0.9));
  const pointing = f < 600;
  K.set({
    at: kAt, facing: 0.85, pose: pointing ? { kind: "point", arm: 1, t } : { kind: "idle", t }, hands: pointing ? [null, target] : undefined,
    expr: keyAt<Expr>(f, [[577, "huff"], [594, "stern"], [601, "sigh"]]), gaze: 1, blink: bl(f, 2, [594]),
    head: heads({ dx: 0.1 * Math.min(1, jab) }, accent("pop", f, 579), accent("nod", f, 587, { amp: 0.8 })), visible: true,
  });
  // Arthur: a jolt, a nod, a turn with a dip, and off he goes
  const turn = smooth(lin(f, 585, 590)), dip = Math.sin(clamp01((f - 585) / 6) * PI);
  if (f < F.run) {
    A.set({
      at: ART_MARK.at.clone(), facing: lerpA(-0.5, PI / 2, turn), pose: { kind: "idle", t },
      expr: keyAt<Expr>(f, [[577, "smile"], [580, "shock"], [584, "smile"], [588, "grin"]]), gaze: f < 585 ? -1 : 1, blink: f < 584 ? 0 : bl(f, 1, [584, 588]),
      head: heads(accent("jolt", f, 580), accent("nod", f, 584), { dy: -0.14 * dip, squash: 0.06 * dip }), visible: true,
    });
  } else {
    // (the head leads the body: he is in a hurry)
    A.set({ at: run.at, facing: run.facing, pose: run.pose, expr: "grin", gaze: 1, blink: 0, head: { dx: 0.14, tilt: 6 }, visible: true });
  }
  fieldCrowd(w, f, { wild: 0.5 });
  w.update();
  return {
    camera: c, focus: [run.at.x, 1.5],
    overlays: frag(tagNew(f), speedLines(f, { from: 593, to: 605, dir: 1, rows: [[120, 560], [1010, 1150]] })),
  };
};

// ------------------------------------------------------------------------------------------------- 606-639  house
/** where Arthur stands at the lodging's door (the door's face is at z -3.2, the padlock at x 17.5, y 0.66-0.93) */
const DOOR = V(17.08, 0, -2.87);
const DOOR_DIR = V(0.25, 0, -0.97).normalize(), DOOR_YAW = Math.atan2(DOOR_DIR.x, DOOR_DIR.z);
const KNOCK_HIT = V(17.335, 1.2, -3.168), KNOCK_BACK = V(17.3, 1.17, -2.99), PADLOCK = V(17.5, 0.8, -3.035);
const house: Shot = (w, f) => {
  // the lodging's front for a moment (the timber frame, the door, the lantern), then the camera runs in after him
  // to the door and the padlock
  const k = easeInOutCubic(lin(f, 608, 621)), drift = lin(f, 604, 612), creep = lin(f, 621, 639);
  const c = camMix(cam([17.9, 1.45, 3.7 - 0.35 * drift], [17.2, 1.35, -3.1], 44), cam([17.37, 1.22, -0.5 - 0.3 * creep], [17.21, 0.85, -3.1], 40), k);
  w.setCamera(c);
  const t = tOf(f), A = w.actor(PEOPLE.arthur), P = propsOf(w);
  const RUN = 4.5, slideFrom = 612, slideTo = 616, SLIDE = 0.32;
  let at: THREE.Vector3, pose: RigState["pose"], facing = DOOR_YAW, skid = -1;
  if (f < slideFrom) {
    const back = SLIDE + ((slideFrom - f) / FPS) * RUN;          // metres still to go
    at = DOOR.clone().addScaledVector(DOOR_DIR, -back); pose = rigWalk(10 - back, RUN);
  } else if (f <= slideTo) {
    const s = easeOutCubic(lin(f, slideFrom, slideTo));
    at = DOOR.clone().addScaledVector(DOOR_DIR, -SLIDE * (1 - s)); pose = { kind: "haul", t: 0, phase: 0.1, amount: 0.75 * (1 - 0.6 * s) };
    facing = lerpA(DOOR_YAW, PI, s); skid = 1 - s;
  } else { at = DOOR.clone(); pose = { kind: "idle", t }; facing = PI; }
  // the knocking hand (his right: screen right in this back view), then the padlock
  let hand: THREE.Vector3 | null = null;
  if (f >= 616) {
    const [k0, k1, k2] = F.knock;
    if (f < k0) hand = at.clone().add(V(0.24, 0.7, -0.05)).lerp(KNOCK_BACK, smooth(lin(f, 615, k0 - 1)));
    else if (f <= k2 + 2) { const ph = f >= k2 ? f - k2 : f >= k1 ? f - k1 : f - k0; hand = KNOCK_HIT.clone().lerp(KNOCK_BACK, [0, 0.75, 1, 0.45][Math.min(ph, 3)]); }
    else if (f < F.nobody + 2) hand = KNOCK_BACK.clone().lerp(PADLOCK, smooth(lin(f, k2 + 2, F.nobody + 2)));
    else { const r = f - (F.nobody + 2); hand = PADLOCK.clone().add(V(0.028 * Math.sin(r * 2.3), 0.012 * Math.sin(r * 3.1), 0.03 * Math.abs(Math.sin(r * 1.15)))); }
  }
  // (the skid: arms out to both sides for balance; in this back view his right hand is on screen right)
  const hands: [THREE.Vector3 | null, THREE.Vector3 | null] = skid >= 0 && f < 616 ? [staged(w, at, 0.33, 0.86 + 0.1 * skid, 0), staged(w, at, -0.33, 0.9 + 0.08 * skid, 0)] : [hand, null];
  A.set({
    at, facing, turn: 1, pose, hands, expr: "neutral",
    head: heads(...F.knock.map((kf0) => accent("nod", f, kf0, { amp: 0.7 })), f >= F.nobody + 1 ? { tilt: 7 * smooth(lin(f, F.nobody + 1, F.nobody + 5)) } : undefined, accent("squash", f, slideTo)),
    visible: true,
  });
  P.puff(0, lin(f, slideFrom, slideFrom + 9), DOOR.clone().addScaledVector(DOOR_DIR, -0.25), [DOOR_DIR.x + 0.4, DOOR_DIR.z]);
  w.update();
  const kp = w.project(KNOCK_HIT), ht = headTop(w, A);
  return {
    camera: c, focus: [17, -1.5],
    overlays: frag(
      ...F.knock.map((kf0, i) => h(Burst, { key: "k" + i, at: kf0, x: kp.x + 30, y: kp.y - 10, r: 80, n: 7, frame: f })),
      h(Mark, { key: "q", kind: "?", at: F.nobody + 1, x: ht.x + 20, y: ht.y - 105, size: 230, frame: f })),
  };
};

// ------------------------------------------------------------------------------------------------- 640-658  crowd
const crowdShot: Shot = (w, f) => {
  const c = camMix(cam([-18.9, 1.5, 2.0], [-18.74, 0.82, -3.3], 40), cam([-18.68, 1.48, 1.0], [-18.68, 0.86, -3.3], 40), lin(f, F.crowd - 2, F.door + 2));
  w.setCamera(c);
  // they follow the charge with their eyes (left to right) ... a hit: everybody up
  fieldCrowd(w, f, { wild: 1, sweep: kf(f, [[640, -1], [649, 1]]), boom: 650, only: (s) => s.x > -21 && s.x < -16 });
  w.update();
  return { camera: c, focus: [-18.7, -2] };
};

// ------------------------------------------------------------------------------------------------- 659-702  door
const LEAVE = { pts: [DOOR, V(16.35, 0, -2.05), V(11.5, 0, -1.35)], speed: 4.6 };
const door: Shot = (w, f) => {
  const t = tOf(f), A = w.actor(PEOPLE.arthur);
  const run = walkAlong(LEAVE.pts, LEAVE.speed, (f - F.sprint) / FPS);
  const push = smooth(lin(f, F.door - 4, F.sprint)), go2 = easeInOutCubic(lin(f, F.sprint - 1, 702));
  // (691: the camera swings round after him and falls back, so the whole runner stays in the frame as he leaves)
  const dx = run.at.x - DOOR.x, dz = run.at.z - DOOR.z;
  let c: CamPose = cam([17.45 - 0.07 * push + dx * 0.45, 1.3, -0.3 - 0.45 * push + 2.3 * go2], [17.15 - 0.02 * push + dx - 0.3 * go2, 1.08 + 0.02 * push - 0.12 * go2, -2.87 + dz], 38 + 4 * go2);
  c = kick(c, f, F.idea, 0.025);
  w.setCamera(c);
  if (f < F.sprint) {
    // he turns to us and sags: nobody home. Then: wait ... the sword in the stone!
    const idea = f >= F.idea, away = smooth(lin(f, 685, 690)), dip = Math.sin(clamp01((f - 684) / 7) * PI);
    const sag = idea ? 0 : smooth(lin(f, 660, 666));
    A.set({
      at: DOOR.clone(), facing: lerpA(lerpA(0.95, 0.12, smooth(lin(f, 658, 664))), -PI / 2, away), pose: { kind: "idle", t },
      expr: keyAt<Expr>(f, [[659, "sad"], [668, "sigh"], [F.idea, "shock"], [678, "grin"], [686, "smile"]]),
      gaze: keyAt(f, [[659, 0], [F.idea, 0], [679, 0.5], [686, -1]]), lookDown: 14 * sag, blink: idea ? (f < 678 ? 0 : bl(f, 1, [678, 686])) : bl(f, 1, [668]),
      head: heads({ dy: -0.11 * sag - 0.14 * dip, squash: 0.06 * dip }, accent("shake", f, 663, { amp: 1.3 }), accent("jolt", f, F.idea), accent("pop", f, F.idea + 3), accent("nod", f, 681, { amp: 0.8 })),
      visible: true,
    });
  } else {
    A.set({ at: run.at, facing: run.facing, pose: run.pose, expr: "grin", gaze: -1, blink: 0, head: { dx: -0.14, tilt: -6 }, visible: true });
  }
  w.update();
  const ht = headTop(w, A);
  return {
    camera: c, focus: [run.at.x, -1.5],
    overlays: frag(
      h(Mark, { key: "i", kind: "!", at: F.idea, out: 677, x: ht.x - 10, y: ht.y - 115, size: 260, frame: f }),
      thoughtSword(f, { at: 678, out: 688, x: 745, y: 265, scale: 1.2, tail: -1 }),
      speedLines(f, { from: 693, to: 702, dir: -1, rows: [[120, 520], [1010, 1150]] })),
  };
};

// ------------------------------------------------------------------------------------------------- the yard
/** where Arthur pulls up beside the stone (0.3 m off its right edge; the recipe's SPOT.stepR is 20 cm further out:
 *  at 1.25 his head touches the edge of a frame that also holds the sword and all of the inscription) */
const STOP = V(1.05, 0, 0.3);
/** the wide yard cameras keep the stone's front face (the gold letters, x -0.4 .. 0.45) above the caption band and
 *  inside the frame, with Arthur on his mark at its right */
const YARD_A = cam([0.66, 1.42, 6.0], [0.5, 0.4, 0], 40), YARD_B = cam([0.56, 1.4, 5.35], [0.48, 0.36, 0], 40);

// ------------------------------------------------------------------------------------------------- 703-734  yard
const ARRIVE = { from: V(4.3, 0, 0.78), slide: 0.36, slideFrom: 712, slideTo: 716, speed: 4.5 };
const yard: Shot = (w, f) => {
  const c = camMix(YARD_A, YARD_B, easeOutCubic(lin(f, F.yard - 3, F.spears)));
  w.setCamera(c);
  const t = tOf(f), A = w.actor(PEOPLE.arthur), P = propsOf(w);
  P.spears(true);
  const dir = STOP.clone().sub(ARRIVE.from).setY(0).normalize(), yaw = Math.atan2(dir.x, dir.z);
  let at: THREE.Vector3, pose: RigState["pose"], facing = yaw, skidHands: [THREE.Vector3, THREE.Vector3] | undefined;
  if (f < ARRIVE.slideFrom) {
    const back = ARRIVE.slide + ((ARRIVE.slideFrom - f) / FPS) * ARRIVE.speed;
    at = STOP.clone().addScaledVector(dir, -back); pose = rigWalk(10 - back, ARRIVE.speed);
  } else if (f <= ARRIVE.slideTo) {
    const s = easeOutCubic(lin(f, ARRIVE.slideFrom, ARRIVE.slideTo));
    at = STOP.clone().addScaledVector(dir, -ARRIVE.slide * (1 - s)); pose = { kind: "haul", t: 0, phase: 0.1, amount: 0.8 * (1 - 0.7 * s) };
    // (arms flung out ahead and behind for balance)
    skidHands = [at.clone().addScaledVector(dir, 0.22).add(V(0, 0.9, -0.02)), at.clone().addScaledVector(dir, -(0.4 + 0.14 * (1 - s))).add(V(0, 0.88, 0.2))];
  } else { at = STOP.clone(); pose = { kind: "idle", t }; facing = -PI / 2; }
  // there it is: he bounces on the spot and points at it
  // (the arm that points is the one on our side: it aims in his own depth plane, so it never crosses his chest; from
  // 730 it comes down again, the next shot finds him with his hands at his sides)
  const there = f >= 722, aim = V(0, 1.05, 0.5).lerp(V(0.78, 0.5, 0.5), smooth(lin(f, 730, 734)));
  const bounce = f >= 718 && f < 724 ? 0.07 * Math.sin(((f - 718) / 6) * PI) : 0;
  A.set({
    at: at.clone().add(V(0, bounce, 0)), facing, pose: there ? { kind: "point", arm: 1, t } : pose, hands: there ? [null, aim] : skidHands,
    expr: keyAt<Expr>(f, [[703, "smile"], [713, "shock"], [718, "grin"], [723, "smile"], [729, "happy"]]), gaze: -1, blink: f < 718 ? 0 : bl(f, 1, [723, 729]),
    head: heads(accent("squash", f, ARRIVE.slideTo), accent("pop", f, 718), accent("nod", f, 723), accent("nod", f, 729, { amp: 0.7 })),
    visible: true,
  });
  P.puff(0, lin(f, ARRIVE.slideFrom, ARRIVE.slideFrom + 9), STOP.clone().addScaledVector(dir, -0.2), [dir.x, dir.z + 0.5]);
  w.update();
  // the sword: one sweep of light as we arrive, then it keeps a soft gleam
  w.stone.setShine(kf(f, [[703, 0.1], [707, 1], [713, 0.3], [718, 0.3], [721, 0.9], [727, 0.35]]));
  const pm = w.project(V(0, 1.2, 0));
  return {
    camera: c, focus: [0.4, 0],
    overlays: frag(h(Burst, { key: "s", at: 706, x: pm.x, y: pm.y, r: 130, n: 10, frame: f })),
  };
};

// ------------------------------------------------------------------------------------------------- 735-761  spears
const spearsShot: Shot = (w, f) => {
  const c = camMix(cam([0.2, 1.5, 6.35], [0.05, 0.4, -0.6], 46), cam([0.2, 1.48, 5.95], [0.05, 0.4, -0.6], 46), lin(f, F.spears, F.guards));
  w.setCamera(c);
  const t = tOf(f), A = w.actor(PEOPLE.arthur), P = propsOf(w);
  P.spears(true);
  // he looks along the empty row: left ... right ... nobody
  const look = kf(f, [[735, -0.6], [738, -1], [745, -1], [748, 1], [755, 1], [758, 0]]);
  A.set({
    at: STOP.clone(), facing: 0.55 * look - 0.1, pose: { kind: "idle", t }, expr: keyAt<Expr>(f, [[735, "smile"], [747, "nervous"], [757, "smile"]]),
    gaze: Math.round(look * 2) / 2, blink: bl(f, 1, [747, 757]),
    head: heads({ tilt: 4 * look, dx: 0.08 * look }, accent("jolt", f, 748, { amp: 0.6 })), visible: true,
  });
  w.update();
  w.stone.setShine(0.3);
  const ht = headTop(w, A);
  return {
    camera: c, focus: [0, -0.5],
    overlays: frag(h(Mark, { key: "q", kind: "?", at: 747, x: ht.x - 10, y: ht.y - 95, size: 180, frame: f })),
  };
};

// ------------------------------------------------------------------------------------------------- 762-778  guards
/** ten guards (the four guard Persons, more figures of each by key) in one row behind the fence, 0.6 m apart (their
 *  kettle helmets are wide); the camera runs along the whole row */
const GUARD_X0 = -20.3, GUARD_DX = 0.6;
const guardsShot: Shot = (w, f) => {
  const u = lin(f, F.guards - 1, F.shrug);
  const x = lerp(-19.25, -15.95, u);
  const c = cam([x, 1.5, 2.3], [x + 0.1, 0.84, -3.2], 40);
  w.setCamera(c);
  const t = tOf(f);
  for (let i = 0; i < SPEAR_N; i++) {
    const G = w.actor(PEOPLE.guard(i % 4), i < 4 ? "" : i < 8 ? "b" : "c");
    // football-terrace jumping, on two beats so the row is not one block; fists pumping at the shoulders
    const beat = (((f - 760 + (i % 2) * 4) % 8) + 8) % 8, jump = 0.11 * Math.sin((Math.min(beat, 6) / 6) * PI);
    const at = V(GUARD_X0 + i * GUARD_DX, jump, -3.2);
    const fist = 1.2 + 0.05 * Math.sin((f + i * 3) * 1.3);
    G.set({
      at, facing: 0, pose: { kind: "idle", t: t + i }, hide: ["spear"],
      hands: [staged(w, at, -0.36, fist, 0.08), staged(w, at, 0.36, 1.2 + 0.05 * Math.sin((f + i * 3) * 1.3 + 2), 0.08)],
      expr: (["laugh", "happy", "grin"] as Expr[])[i % 3], gaze: [0, 0.5, -0.5][(i + Math.floor(f / 7)) % 3], blink: bl(f, 50 + i),
      head: beat < 2 ? { squash: 0.05 } : undefined, visible: true,
    });
  }
  // townsfolk behind them, on tiptoe
  for (let j = 0; j < 10; j++) {
    const id = 60 + j, hop2 = 0.07 * Math.max(0, Math.sin(t * 9 + j * 1.7));
    w.actor(PEOPLE.commoner(j)).set({
      at: V(GUARD_X0 + 0.3 + j * 0.6, hop2, -3.85), facing: 0, pose: { kind: "cheer", t: t * 1.5 + j, amount: 1.3 },
      expr: CHEER_FACES[j % CHEER_FACES.length], blink: bl(f, id), visible: true,
    });
  }
  w.update();
  return { camera: c, focus: [x, -2] };
};

// ------------------------------------------------------------------------------------------------- 779-842  pull
const PULL_CLOSE = cam([-0.3, 1.4, 4.75], [0.1, 0.3, 0], 40), PULL_WIDE = cam([0.25, 1.45, 6.6], [0.3, 0.46, 0], 40);
/** where he lands when he jumps off toward us, and the way he runs off (west, to the tournament) */
const LAND = V(-0.25, 0, 1.05);
const pull: Shot = (w, f) => {
  const t = tOf(f), A = w.actor(PEOPLE.arthur), P = propsOf(w);
  P.spears(true);
  // the camera closes in as he hops up and stays close while the sword slides out; on 808 (the sword is free and
  // swings up) a HARD CUT back to the wide view, which holds the raised blade and leaves room for "第一次" above it
  const kIn = easeInOutCubic(lin(f, 784, 797)), creep = lin(f, 797, 808), follow = smooth(lin(f, F.off, 846)), back = lin(f, 808, 842);
  let c = f < 808 ? camMix(camMix(YARD_B, PULL_CLOSE, kIn), cam([-0.24, 1.4, 4.62], [0.1, 0.3, 0], 40), creep) : camMix(PULL_WIDE, cam([0.25, 1.45, 6.3], [0.3, 0.46, 0], 40), back);
  c = { ...c, pos: [(c.pos as Vec3)[0] - 0.25 * follow, (c.pos as Vec3)[1], (c.pos as Vec3)[2]], look: [(c.look as Vec3)[0] - 0.45 * follow, (c.look as Vec3)[1], (c.look as Vec3)[2]] };
  c = kick(c, f, 808, 0.03);
  w.setCamera(c);
  const u = lin(f, F.pull0, F.pull1);
  let after: (() => void) | null = null;
  if (f < F.hop) {
    // a shrug at the camera: well then
    const k = Math.min(smooth(lin(f, F.shrug - 1, 782)), 1 - smooth(lin(f, 783, 786)));
    A.set({
      at: STOP.clone(), facing: lerpA(0.05, -0.6, smooth(lin(f, 783, 786))), pose: { kind: "idle", t },
      hands: k > 0.02 ? [staged(w, STOP, -0.3 - 0.07 * k, 0.7 + 0.12 * k, 0.16), staged(w, STOP, 0.3 + 0.07 * k, 0.7 + 0.12 * k, 0.16)] : undefined,
      expr: keyAt<Expr>(f, [[779, "deadpan"], [784, "smile"]]), gaze: f < 783 ? 0 : -1, blink: bl(f, 1, [784]),
      head: { dy: -0.03 * k, tilt: 6 * k, squash: 0.04 * k }, visible: true,
    });
  } else if (f < F.land) {
    // the hop onto the stone
    const k = lin(f, F.hop, F.land), at = hopArc(STOP, SPOT.drawR, k, 0.3);
    A.set({ at, facing: lerpA(-0.6, -PI / 2, smooth(k * 2)), pose: { kind: "walk", phase: 0.2 + 0.25 * k, stride: 0.2, amount: 0 }, expr: "smile", gaze: -1, blink: 0, head: { squash: -0.07 * Math.sin(k * PI) }, visible: true });
  } else if (f < F.off) {
    // the pull: one hand, no effort. 792-794 the hand closes on the grip; 795-818 out and up; then he holds it high
    const reach = smooth(lin(f, F.land - 1, F.pull0 - 1));
    const extra: Partial<RigState> = {
      // (he does not even look: bored eyes on us while the sword comes out; then it is in his hand: oh, nice)
      expr: keyAt<Expr>(f, [[F.land, "smile"], [800, "neutral"], [808, "happy"], [815, "grin"]]),
      gaze: keyAt(f, [[F.land, -1], [800, 0], [808, -1]]), blink: f < 800 ? 0 : bl(f, 1, [800, 808, 815]),
      head: heads(accent("squash", f, F.land), accent("pop", f, 808), accent("pop", f, F.count, { amp: 0.8 }), f >= F.pull1 ? { tilt: -4 } : undefined),
    };
    // (his far hand: it hangs on the far side of him and goes forward to the grip, never through the body)
    if (reach < 1) extra.hands = [SPOT.drawR.clone().add(V(-0.1, 0.6, -0.17)).lerp(w.stone.grip(0), reach), null];
    pullOut(w, A, u, { t, extra });
    after = () => pullOutAfter(w, A, u);
  } else {
    // 832: off the stone toward us, then away to the left with the sword held high
    const k = lin(f, F.off, F.down), run = Math.max(0, (f - F.down) / FPS) * 4.4;
    const at = f < F.down ? hopArc(SPOT.drawR, LAND, k, 0.24) : LAND.clone().add(V(-run, 0, 0));
    const side = smooth(lin(f, F.off, F.off + 4));
    const hand = at.clone().add(V(lerp(-0.34, -0.36, side), lerp(1.25, 1.16, side), lerp(0.08, -0.1, side)));
    A.set({
      at, facing: lerpA(0, -PI / 2, side), pose: f < F.down ? { kind: "walk", phase: 0.2 + 0.3 * k, stride: 0.2, amount: 0 } : rigWalk(run, 4.4),
      hands: [hand, null], expr: "grin", gaze: -1, blink: 0, head: accent("squash", f, F.down), visible: true,
    });
    after = () => w.stone.setFree(A.handWorld(0), V(lerp(0.27, 0.14, side), -1, 0));
    P.puff(1, lin(f, F.down, F.down + 8), LAND, [0.6, 0.6]);
  }
  w.update();
  if (after) after();
  // the blade: a soft gleam in the anvil, bright once it is free
  w.stone.setShine(kf(f, [[779, 0.3], [806, 0.35], [810, 1], [826, 0.8], [842, 0.7]]));
  const slot = w.project(V(0, 0.62, 0.05));
  return {
    camera: c, focus: [0.2, 0.3],
    overlays: frag(
      h(Burst, { key: "f", at: 808, x: slot.x, y: slot.y, r: 150, n: 12, frame: f }),
      h(PullCounter, { key: "n", n: 1, at: F.count, out: 837, x: 590, y: 232, scale: 0.95, frame: f })),
  };
};

// ------------------------------------------------------------------------------------------------- the segment
const SHOTS: [number, Shot][] = [
  [F.wide, fieldWide], [F.names, names], [F.knight, knight], [F.pat, pat], [F.go, go], [F.house, house], [F.crowd, crowdShot],
  [F.door, door], [F.yard, yard], [F.spears, spearsShot], [F.guards, guardsShot], [F.shrug, pull],
];
export const SEG: Segment = {
  id: "B", from: S.from, to: S.to,
  enter(w) { propsOf(w); },
  exit(w) { hideProps(w); },
  pose(w, f) {
    propsOf(w).begin();
    let shot = SHOTS[0][1];
    for (const [from, s] of SHOTS) if (f >= from) shot = s;
    const P = shot(w, f);
    return { season: 0, ...P };
  },
};
