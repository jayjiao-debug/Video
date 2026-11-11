// Segment D, frames 1265-1714 (narration lines 14-18): the lords stall, four more pulls.
//   1265  the lords' montage (season 0): four jump cuts, lord 3 / 4 / 5 / 6 heave at the sword and fail (a red x each);
//         the last one's hands slip and he flies off the stone
//   1311  pull THREE: Arthur hops up, draws it one-handed in the middle of a yawn; the lords' jaws drop; 第三次
//   1361  close pan over the lords: red faces, steam, "!?"
//   1389  the lead lord (lord 0) speaks his line in the foreground and points back at the boy on the stone, who looks
//         down at his plain tunic; 1438 the lords throw their hands up (管我们？)
//   1454  改天再拔 (stamp): the lords walk off, Arthur slides the sword back in and shrugs
//   1482  FEBRUARY (season 1), from the left front: Arthur walks up, knocks the snow off the pommel, hops on, pulls:
//         第四次; the lords shake their heads; 又拖
//   1565  SPRING (season 2), from the right front: Arthur has dozed off on the stone, wakes, pulls with his left hand:
//         第五次; the commons clap, the lords whistle and look away; 1633 还拖: the commons' faces turn
//   1648  EARLY SUMMER (season 3): the whole town (crowd()), a push-in; every head follows the sword up: 第六次; the
//         commons cheer, the lords stand frozen. Segment E continues from this layout.
// Every camera that shows the stone is aimed with stoneCam(): the gold letters on its front face stay above the
// caption band.
import React from "react";
import * as THREE from "three";
import { SEGMENTS, FPS, H, h, lin, lerp, smooth, clamp01, easeInOutCubic, quote, type Segment, type Pose, type CamPose, type Vec3 } from "../story";
import type { World } from "../world";
import { PEOPLE, type Person } from "../people";
import { V, v3, yawTo, lid, speak, accent, heads, walkAlong, hopArc, SPOT, tug, pullOut, pullOutAfter, raise, raiseAfter, crowd, stagger, alive, type Rig, type RigState, type RigHead } from "./common";
import { PullCounter, Mark, Burst, Flush } from "../overlay";
import { CornerTag, Stamp } from "../../group/kit/overlay";
import { Cross, Steam, Zzz, Flower } from "./segD_ov";

const S = SEGMENTS.find((s) => s.id === "D")!;
const PI = Math.PI;
const DBG = false;

// ---------------------------------------------------------------------------------------------------- beats (frames)
// captions: 几天后贵族全来试 1267 · 只有他拔得出 1311 · 第三次 1344 · 他们气炸了 1361 · “让个出身不高的小子” 1389 · “管我们？” 1438 ·
// 说改天再拔 1454 · 二月 1484 · 雪还没化 1499 · 第四次 1528 · 又拖 1550 · 春天 1566 · 花都开了 1581 · 第五次 1610 · 还拖 1633 ·
// 初夏 1649 · 当着所有人的面 1660 · 第六次 1698-1714
const T = {
  /** the montage's jump cuts (lord 3, 4, 5, 6), then the cut to Arthur */
  m: [1265, 1277, 1288, 1299, 1311],
  /** the last lord's hands slip */
  slip: 1304,
  hop3: [1306, 1313], pull3: [1315, 1336], n3: 1344,
  rage: 1361,
  line: 1389, look: 1404, hands: 1438,
  later: 1454, stamp1: 1456, back: [1446, 1466],
  feb: 1482, hop4: [1500, 1506], pull4: [1508, 1526], n4: 1528, stamp2: 1550,
  spr: 1565, bloom: 1581, wake: 1585, pull5: [1588, 1606], n5: 1610, stamp3: 1633,
  sum: 1648, pull6: [1668, 1692], n6: 1698,
};
/** the frame a pull's sword comes free of the anvil (u = 0.55) */
const freeAt = (p: number[]) => Math.round(p[0] + 0.55 * (p[1] - p[0]));

// ---------------------------------------------------------------------------------------------------- helpers
type Extra = Partial<RigState>;
type Ov = React.ReactNode[];
const exprAt = <X,>(f: number, keys: [number, X][]): X => { let e = keys[0][1]; for (const [k, x] of keys) if (f >= k) e = x; return e; };
const swapsOf = (keys: [number, unknown][]) => keys.slice(1).map(([k]) => k / FPS);
/** A camera at `pos` that looks toward (lx, ?, lz): the look height is solved so that the lowest gold letters on the
 *  stone's front face sit at `pct` of the frame height (above the caption band). Leaves the camera set. */
const stoneCam = (w: World, pos: Vec3, lx: number, lz: number, fov: number, pct = 0.592): CamPose => {
  let lo = -2.5, hi = 2.0;
  for (let i = 0; i < 16; i++) {
    const m = (lo + hi) / 2;
    w.setCamera({ pos, look: [lx, m, lz], fov });
    const y = Math.max(w.project([-0.62, 0.02, 0.5]).y, w.project([0.62, 0.02, 0.5]).y) / H;
    if (y > pct) hi = m; else lo = m;
  }
  const cam: CamPose = { pos, look: [lx, (lo + hi) / 2, lz], fov };
  w.setCamera(cam);
  return cam;
};
/** a camera kick: 3 frames of a few cm, straight down and back */
const kick = (f: number, at: number, amp = 0.035) => (f === at ? -amp : f === at + 1 ? amp * 0.5 : f === at + 2 ? -amp * 0.2 : 0);
const bump = (c: CamPose, dy: number): CamPose => (dy === 0 ? c : { ...c, pos: [(c.pos as Vec3)[0], (c.pos as Vec3)[1] + dy, (c.pos as Vec3)[2]], look: [(c.look as Vec3)[0], (c.look as Vec3)[1] + dy, (c.look as Vec3)[2]] });
/** a head on screen: centre and radius in px (after w.update()) */
const headPx = (w: World, r: Rig, fov: number) => { const p = w.project(r.headWorld()); return { x: p.x, y: p.y, r: (0.24 * H) / (2 * Math.max(0.3, p.z) * Math.tan((fov * PI) / 360)) }; };
/** a figure that stands and lives (blinks, glances); extra overrides */
const stand = (w: World, p: Person, at: THREE.Vector3, facing: number, id: number, extra: Extra = {}, key = ""): Rig => {
  const r = w.actor(p, key);
  r.set({ at, facing, pose: { kind: "idle", t: w.t + id * 0.61 }, expr: "neutral", ...alive(w.t, id), ...extra, visible: true });
  return r;
};
const dbg = (w: World, f: number, tag: string, rigs: [string, Rig][] = []) => {
  if (!DBG) return;
  const pc = (p: Vec3 | THREE.Vector3) => { const q = w.project(p); return `${Math.round(q.x)},${Math.round((q.y / H) * 100)}%`; };
  console.log(`QA: f${f} ${tag} letters ${pc([-0.62, 0.02, 0.5])} ${pc([0.62, 0.34, 0.5])} | ` + rigs.map(([n, r]) => `${n} head ${pc(r.headWorld())}`).join(" ") + ` | tip ${pc(w.stone.tip())}`);
};
const fr = (...kids: Ov) => h(React.Fragment, null, ...kids);

// the lords' gallery: where the lords who are not at the sword stand and watch (left of the stone, in staggered rows)
const GAL: Vec3[] = [[-1.3, 0, 0.35], [-1.15, 0, -0.8], [-0.55, 0, -1.3], [-1.8, 0, -1.35], [-1.25, 0, -2.0], [-0.45, 0, -2.2], [-2.0, 0, -2.3]];
/** the wide view of the stone and the lords' side of the yard (the letters at 59 %) */
const wide = (w: World, z: number, cx = -0.38, fov = 42) => stoneCam(w, [cx, 1.5, z], cx, 0, fov);
const toStone = (at: THREE.Vector3, k = 0.55) => yawTo(at, [0, 0, 0]) * k;
const L = (i: number) => PEOPLE.lord(i);

// ---------------------------------------------------------------------------------------------------- 1. the montage
const TRY: { lord: number; side: "R" | "L" | "back"; ph: number }[] = [{ lord: 3, side: "R", ph: 0.2 }, { lord: 4, side: "back", ph: 0.5 }, { lord: 5, side: "L", ph: 0.1 }, { lord: 6, side: "R", ph: 0.35 }];
function lordsTry(w: World, f: number): Pose {
  const k = f < T.m[1] ? 0 : f < T.m[2] ? 1 : f < T.m[3] ? 2 : 3, f0 = T.m[k], u = lin(f, f0, T.m[k + 1]), t = (f - f0) / FPS, me = TRY[k];
  let cam: CamPose;
  if (k === 0) cam = wide(w, 6.35 - 0.35 * u);
  else if (k === 1) cam = { pos: [0.06, 1.1, 2.68 - 0.1 * u], look: [0.06, 1.15, 0], fov: 40 };
  else if (k === 2) cam = { pos: [0.95 - 0.06 * u, 1.24, 2.35 - 0.08 * u], look: [-0.1, 1.13, -0.05], fov: 40 };
  else cam = { pos: [-0.45 + 0.25 * u, 1.2, 2.4], look: [0.22 + 0.3 * u, 1.13, -0.1], fov: 40 };
  w.setCamera(cam);
  // the gallery
  const others = [0, 1, 2, 3, 4, 5, 6, 7].filter((i) => i !== me.lord);
  others.forEach((i, n) => {
    const at = k === 1 && n === 1 ? V(-0.62, 0, -1.25) : k === 1 && n === 2 ? V(0.66, 0, -1.3) : v3(GAL[n]), tried = i >= 3 && i < me.lord;
    stand(w, L(i), at, toStone(at), i, tried ? { expr: "dazed", lookDown: 14, head: { dy: -0.08 } } : { expr: i % 2 ? "smug" : "stern", gaze: 1, head: accent("nod", f, f0 + 3 + stagger(i, 5)) });
  });
  // the one at the sword
  const r = w.actor(L(me.lord)), ov: Ov = [];
  const slipped = k === 3 && f >= T.slip;
  if (!slipped) {
    const expr = exprAt(f, [[f0, "huff"], [f0 + 4, "pained"], [f0 + 8, "wince"]] as [number, RigState["expr"]][]);
    tug(w, r, { side: me.side, t: t + me.ph, effort: 1, extra: { expr, head: heads(accent("squash", f, f0 + 4)) } });
  } else {
    const v = lin(f, T.slip, T.m[4] + 3);
    r.set({ at: hopArc(SPOT.tugR.clone().add(V(0.12, 0, 0)), V(1.35, 0, -0.15), v, 0.3), facing: -PI / 2, pose: { kind: "cheer", t: w.t * 3, amount: 1 }, expr: "shock", head: accent("jolt", f, T.slip), visible: true });
    w.stone.setStuck(0, Math.sin((f - T.slip) * 2.4) * 0.03 * (1 - v));
  }
  w.update();
  if (k > 0 && !slipped) { const hp = headPx(w, r, cam.fov); ov.push(h(Flush, { key: "fl", x: hp.x, y: hp.y, r: hp.r * 1.02, a: 0.35 + 0.5 * u })); }
  ov.push(h(CornerTag, { key: "tag", at: 1267, out: 1336, text: "几天后", frame: f }));
  // a red x over the hilt as each one gives up (the last 4 frames before the cut; the fourth as his hands slip)
  const gp = w.project(w.stone.grip(0)), xAt = k < 3 ? T.m[k + 1] - 5 : T.slip;
  ov.push(h(Cross, { key: `x${k}`, at: xAt, x: gp.x, y: gp.y - (k === 0 ? 40 : 115), size: k === 0 ? 230 : 300, frame: f }));
  dbg(w, f, `try${k}`, [["tugger", r]]);
  return { camera: cam, season: 0, focus: [0, 0], overlays: fr(...ov) };
}

// ---------------------------------------------------------------------------------------------------- 2. pull three
function pullThree(w: World, f: number): Pose {
  const t = w.t, u = lin(f, T.pull3[0], T.pull3[1]), free = freeAt(T.pull3), push = smooth(lin(f, T.m[4], T.rage));
  let cam = wide(w, 6.3 - 0.35 * push);
  cam = bump(cam, kick(f, free) + kick(f, T.n3, 0.03));
  w.setCamera(cam);
  // the lords: smug, then their jaws drop one after the other
  [0, 1, 2, 3, 4, 5, 7].forEach((i, n) => {
    const at = v3(GAL[n]), d = free + 1 + stagger(i, 5);
    const keys: [number, RigState["expr"]][] = [[0, i >= 3 ? "sigh" : i % 2 ? "smug" : "stern"], [d, "shock"]];
    stand(w, L(i), at, toStone(at), i, { expr: exprAt(f, keys), gaze: 1, blink: f >= d ? 0 : lid(t, i), head: heads(accent("jolt", f, d), accent("pop", f, T.n3 + stagger(i, 3))) });
  });
  // Arthur: lands on the stone, yawns while he draws it
  const A = w.actor(PEOPLE.arthur);
  if (f < T.hop3[1]) A.set({ at: hopArc(SPOT.stepR, SPOT.drawR, lin(f, T.hop3[0], T.hop3[1])), facing: -PI / 2, pose: { kind: "idle", t }, expr: "deadpan", visible: true });
  else {
    const yawn = smooth(lin(f, 1317, 1320)) * (1 - smooth(lin(f, 1330, 1333)));
    const expr = exprAt(f, [[0, "deadpan"], [1318, "sleep"], [1332, "deadpan"], [T.n3, "smug"]] as [number, RigState["expr"]][]);
    const head: RigHead = { dy: 0.1 * yawn + (f >= T.hop3[1] && f < T.hop3[1] + 3 ? -0.08 : 0), tilt: -7 * yawn, squash: f < T.hop3[1] + 3 ? 0.06 : 0 };
    pullOut(w, A, u, { side: "R", t, extra: { expr, blink: expr === "deadpan" && f > 1332 ? lid(t, 1, [1332 / FPS, T.n3 / FPS]) : 0, gaze: f >= T.n3 ? -1 : 0, head: heads(head, accent("pop", f, T.n3)) } });
  }
  w.update();
  if (f >= T.hop3[1]) pullOutAfter(w, A, u, "R");
  if (f >= T.pull3[1]) w.stone.setShine(clamp01(1 - (f - T.pull3[1]) / 14) * 0.9 + 0.1);
  const slot = w.project([0, 0.6, 0]), ov: Ov = [];
  ov.push(h(CornerTag, { key: "tag", at: 1267, out: 1336, text: "几天后", frame: f }));
  ov.push(h(Burst, { key: "b", at: free, x: slot.x, y: slot.y, r: 150, frame: f }));
  ov.push(h(PullCounter, { key: "n", n: 3, at: T.n3, x: 300, y: 250, scale: 0.8, frame: f }));
  dbg(w, f, "pull3", [["arthur", A]]);
  return { camera: cam, season: 0, focus: [0, 0], overlays: fr(...ov) };
}

// ---------------------------------------------------------------------------------------------------- 3. the lords explode
const RAGE: { lord: number; at: Vec3 }[] = [
  { lord: 1, at: [-3.0, 0, 0.75] }, { lord: 2, at: [-2.45, 0, 0.2] }, { lord: 3, at: [-1.9, 0, 0.75] }, { lord: 0, at: [-1.35, 0, 0.25] },
  { lord: 4, at: [-2.75, 0, -0.65] }, { lord: 5, at: [-2.0, 0, -0.6] }, { lord: 7, at: [-1.25, 0, -0.75] },
];
function rage(w: World, f: number): Pose {
  const u = smooth(lin(f, T.rage, T.line - 1)), t = w.t;
  const cam: CamPose = { pos: [lerp(-2.95, -1.6, u), 1.3, 3.35], look: [lerp(-2.9, -1.5, u), 0.92, 0.4], fov: 40 };
  w.setCamera(cam);
  const ov: Ov = [], rigs: Rig[] = [];
  RAGE.forEach((p, n) => {
    const d = T.rage + 2 + n * 4, stomp = n === 2 ? Math.max(0, Math.sin((f - T.rage) * 0.9)) * 0.05 : 0;
    const expr = exprAt(f, [[0, "stern"], [d, n % 3 === 1 ? "pained" : "huff"]] as [number, RigState["expr"]][]);
    const shiver = f >= d ? Math.sin(f * 2.6 + n) * 0.012 : 0;        // shaking with rage
    rigs.push(stand(w, L(p.lord), v3(p.at).add(V(shiver, stomp, 0)), 0.35, p.lord, { expr, gaze: 1, blink: 0, head: heads(accent("shake", f, d + 2, { dir: n % 2 ? 1 : -1 }), accent("shake", f, d + 15), accent("pop", f, d)) }));
  });
  w.update();
  RAGE.slice(0, 4).forEach((p, n) => {
    const hp = headPx(w, rigs[n], cam.fov), d = T.rage + 2 + n * 4;
    ov.push(h(Flush, { key: `f${n}`, x: hp.x, y: hp.y, r: hp.r * 1.02, a: 0.75 * smooth(lin(f, d - 2, d + 6)) }));
    ov.push(h(Steam, { key: `s${n}`, x: hp.x, y: hp.y, r: hp.r, a: f >= d ? 1 : 0, seed: n, frame: f }));
    if (n !== 2) ov.push(h(Mark, { key: `m${n}`, kind: "!?", at: d + 1, x: hp.x + hp.r * 0.5, y: hp.y - hp.r - 120, size: 150, frame: f }));
  });
  return { camera: cam, season: 0, focus: [-2, 0], overlays: fr(...ov) };
}

// ---------------------------------------------------------------------------------------------------- 4. the lord's line
function lordSpeaks(w: World, f: number): Pose {
  const u = lin(f, T.line, T.hands), t = w.t, q = quote("lord");
  const cam = wide(w, 6.3 - 0.3 * u, -0.5 - 0.07 * u);
  const l0 = w.actor(L(0)), at0 = V(-0.95, 0, 2.3);
  const sp = speak(q, f, 0, [3, 5, 8]);
  l0.set({ at: at0, facing: 0.3, pose: { kind: "point", t, arm: 1 }, hands: [null, V(at0.x + 1.4, 1.45, at0.z + 0.15)], expr: "huff", gaze: 0.5, blink: lid(t, 0), ...sp, visible: true });
  // Arthur on the stone, the sword still up: he looks down at his plain tunic, then at the lord
  const A = w.actor(PEOPLE.arthur), down = smooth(lin(f, T.look, T.look + 5)) * (1 - smooth(lin(f, 1422, 1427)));
  const expr = exprAt(f, [[0, "deadpan"], [T.look, "neutral"], [1424, "deadpan"]] as [number, RigState["expr"]][]);
  raise(A, SPOT.drawR.clone(), { arm: 0, t, extra: { expr, lookDown: 26 * down, gaze: f >= 1424 ? -1 : 0, blink: lid(t, 1, [T.look / FPS, 1424 / FPS]), head: heads({ dy: -0.1 * down }, accent("jolt", f, T.line + 4, { amp: 0.6 })) } });
  w.update();
  raiseAfter(w, A, 0);
  const ov: Ov = [], ah = headPx(w, A, cam.fov);
  ov.push(h(Mark, { key: "q", kind: "?", at: 1425, x: ah.x + ah.r + 30, y: ah.y - ah.r - 40, size: 120, frame: f }));
  dbg(w, f, "line", [["arthur", A], ["lord0", l0]]);
  return { camera: cam, season: 0, focus: [0, 0.5], overlays: fr(...ov) };
}
const HANDS: { lord: number; at: Vec3 }[] = [
  { lord: 0, at: [-2.2, 0, 1.2] }, { lord: 1, at: [-2.8, 0, 0.55] }, { lord: 2, at: [-1.6, 0, 0.55] }, { lord: 3, at: [-3.25, 0, -0.1] }, { lord: 5, at: [-2.2, 0, -0.2] }, { lord: 4, at: [-1.2, 0, -0.15] },
];
function handsUp(w: World, f: number): Pose {
  const u = lin(f, T.hands, T.later), t = w.t, q = quote("lord");
  const cam: CamPose = { pos: [-2.2, 1.4, 5.0 - 0.25 * u], look: [-2.2, 0.72, 0.8], fov: 40 };
  w.setCamera(cam);
  HANDS.forEach((p, n) => {
    const d = T.hands + (n ? 1 + stagger(p.lord, 3) : 0), hop = f >= d ? Math.max(0, Math.sin(((f - d) / 5) * PI)) * (f - d < 5 ? 0.09 : 0) : 0;
    const r = w.actor(L(p.lord));
    r.set({ at: v3(p.at).add(V(0, hop, 0)), facing: n ? 0.25 : 0.1, pose: f >= d ? { kind: "cheer", t: t * 1.6 + n * 0.3, amount: 1 } : { kind: "idle", t }, expr: n % 2 ? "stern" : "huff", gaze: 0.5, blink: lid(t, p.lord),
      head: accent("shake", f, d + 5, { dir: n % 2 ? 1 : -1 }), ...(n === 0 ? speak(q, f, 0, [3, 5, 8]) : {}), visible: true });
  });
  w.update();
  return { camera: cam, season: 0, focus: [-2, 0.5] };
}

// ---------------------------------------------------------------------------------------------------- 5. "another day"
function later(w: World, f: number): Pose {
  const u = lin(f, T.later, T.feb), t = w.t, home = T.back[1];
  let cam = wide(w, 6.0 + 0.3 * u);
  cam = bump(cam, kick(f, home));
  w.setCamera(cam);
  // the lords walk off, backs to us
  [0, 1, 2, 3, 4, 5, 7].forEach((i, n) => {
    const a = v3(GAL[n]), leg = walkAlong([a, a.clone().add(V(-2.2, 0, -1.9)), a.clone().add(V(-5, 0, -2.4))], 1.25, (f - (T.later - 9 + n * 2)) / FPS);
    const turn = smooth(lin(f, T.later - 12 + n * 2, T.later - 4 + n * 2));
    w.actor(L(i)).set({ at: leg.at, facing: leg.moving ? leg.facing : lerp(toStone(a), leg.facing, turn), pose: leg.pose, turn: 1, expr: "stern", visible: true });
  });
  // Arthur slides the sword back in, lets go, shrugs
  const A = w.actor(PEOPLE.arthur), uu = 1 - easeInOutCubic(lin(f, T.back[0], home));
  if (f <= home + 2) pullOut(w, A, uu, { side: "R", t, extra: { expr: "deadpan", blink: lid(t, 1), gaze: -1 } });
  else {
    const sh = smooth(lin(f, home + 2, home + 6));
    A.set({ at: SPOT.drawR.clone(), facing: lerp(-PI / 2, 0, sh), pose: { kind: "idle", t }, expr: f >= home + 5 ? "sigh" : "deadpan", blink: lid(t, 1, [(home + 5) / FPS]), head: heads({ tilt: 6 * sh }, accent("pop", f, home + 4)), visible: true });
  }
  w.update();
  if (f <= home + 2) pullOutAfter(w, A, uu, "R");
  const slot = w.project([0, 0.6, 0]), ov: Ov = [];
  ov.push(h(Stamp, { key: "st", at: T.stamp1, x: 360, y: 300, text: "改天再拔", rot: -7, scale: 0.9, frame: f }));
  ov.push(h(Burst, { key: "b", at: home, x: slot.x, y: slot.y, r: 120, frame: f }));
  dbg(w, f, "later", [["arthur", A]]);
  return { camera: cam, season: 0, focus: [0, 0], overlays: fr(...ov) };
}

// ---------------------------------------------------------------------------------------------------- 6. February
// camera from the left front. Seen from it, lord 0 stands at 23 deg, Arthur on the stone at 29 deg, lord 1 at 40 deg;
// Arthur walks in from the back of the yard along the 34 deg ray (toward us), so that he never crosses a lord.
const FEB_PATH: Vec3[] = [[2.5, 0, -2.6], [1.1, 0, -0.15]];
const FEB_LORDS: { lord: number; at: Vec3; facing: number; gaze: number }[] = [{ lord: 0, at: [0.04, 0, -1.41], facing: 0.1, gaze: 1 }, { lord: 1, at: [2.16, 0, -0.41], facing: -0.95, gaze: -1 }];
function february(w: World, f: number): Pose {
  const t = w.t, u = lin(f, T.pull4[0], T.pull4[1]), free = freeAt(T.pull4), pan = smooth(lin(f, T.feb, T.hop4[1] - 2));
  let cam = stoneCam(w, [-2.9, 1.5, 5.6 - 0.25 * smooth(lin(f, T.hop4[1], T.stamp2))], lerp(0.6, 0.5, pan), lerp(0.1, 0, pan), 42);
  cam = bump(cam, kick(f, free) + kick(f, T.n4, 0.03));
  w.setCamera(cam);
  FEB_LORDS.forEach((p, n) => {
    const at = v3(p.at), d = T.n4 + 4;
    stand(w, L(p.lord), at, p.facing, p.lord, { expr: exprAt(f, [[0, "stern"], [free + 1 + n, "shock"], [T.n4 + 2, "stern"]] as [number, RigState["expr"]][]), gaze: p.gaze, head: heads(accent("jolt", f, free + 1 + n, { amp: 0.6 }), accent("shake", f, d), accent("shake", f, d + 11)) });
  });
  const A = w.actor(PEOPLE.arthur);
  let u4 = u;
  const path = FEB_PATH.map(v3), t0 = T.hop4[0] - 1 - Math.round((path[0].distanceTo(path[1]) / 1.7) * FPS);
  if (f < T.hop4[0]) {
    const leg = walkAlong(path, 1.7, (f - t0) / FPS, { endFacing: -PI / 2 });
    A.set({ at: leg.at, facing: leg.facing, pose: leg.pose, expr: "deadpan", blink: lid(t, 1), visible: true });
  } else if (f < T.hop4[1]) A.set({ at: hopArc(path[1], SPOT.drawR, lin(f, T.hop4[0], T.hop4[1])), facing: -PI / 2, pose: { kind: "idle", t }, expr: "deadpan", visible: true });
  else {
    const sigh = smooth(lin(f, T.stamp2 + 1, T.stamp2 + 7));
    const expr = exprAt(f, [[0, "deadpan"], [T.n4, "neutral"], [T.stamp2 + 2, "sigh"]] as [number, RigState["expr"]][]);
    u4 = u - 0.27 * sigh;                                                     // 又拖: his arm sinks, the sword with it
    pullOut(w, A, u4, { side: "R", t, extra: { expr, gaze: f >= 1533 && f < 1540 ? -1 : f >= 1540 && f < T.stamp2 ? 1 : 0, blink: lid(t, 1, [T.n4 / FPS, (T.stamp2 + 2) / FPS]), lookDown: 14 * sigh, head: heads(accent("squash", f, T.stamp2 + 2), f < T.hop4[1] + 3 ? { squash: 0.06, dy: -0.08 } : undefined) } });
  }
  w.update();
  if (f >= T.hop4[1]) pullOutAfter(w, A, u4, "R");
  const slot = w.project([0, 0.6, 0]), ov: Ov = [];
  ov.push(h(CornerTag, { key: "tag", at: 1484, out: 1560, text: "二月", frame: f }));
  ov.push(h(Burst, { key: "b", at: free, x: slot.x, y: slot.y, r: 150, frame: f }));
  ov.push(h(PullCounter, { key: "n", n: 4, at: T.n4, out: T.stamp2 - 2, x: 820, y: 245, scale: 0.8, frame: f }));
  ov.push(h(Stamp, { key: "st", at: T.stamp2, x: 820, y: 270, text: "又拖", rot: 6, frame: f }));
  dbg(w, f, "feb", [["arthur", A]]);
  return { camera: cam, season: 1, focus: [0, 0], overlays: fr(...ov) };
}

// ---------------------------------------------------------------------------------------------------- 7. spring
// camera from the right front: screen right = (0.872, 0, -0.49), into the picture = (-0.49, 0, -0.872)
const SPR_COMMONS: Vec3[] = [[-0.07, 0, -1.34], [0.34, 0, -1.85], [-0.44, 0, -2.74], [0.41, 0, -2.87]];
/** the same four in the close shot of 还拖 (staged to the right of the stone, so that it is not in the picture) */
const SPR_CLOSE: Vec3[] = [[2.42, 0, -1.6], [2.9, 0, -2.2], [2.25, 0, -2.75], [3.38, 0, -1.6]];
const SPR_LORDS: { lord: number; at: Vec3 }[] = [{ lord: 0, at: [-1.19, 0, -0.59] }, { lord: 1, at: [-1.88, 0, -0.89] }];
function spring(w: World, f: number): Pose {
  const t = w.t, u = lin(f, T.pull5[0], T.pull5[1]), free = freeAt(T.pull5);
  let cam: CamPose;
  const close = f >= T.stamp3;
  if (!close) {
    cam = stoneCam(w, [3.0, 1.5, 5.9 - 0.2 * smooth(lin(f, T.spr, T.stamp3))], 0.1, 0, 42);
    cam = bump(cam, kick(f, free) + kick(f, T.n5, 0.03));
  } else { const v = lin(f, T.stamp3, T.sum); cam = { pos: [2.9, 1.3, 3.1 - 0.2 * v], look: [2.9, 0.82, -1.6], fov: 32 }; }
  w.setCamera(cam);
  const ov: Ov = [], cm: Rig[] = [];
  SPR_COMMONS.forEach((p, n) => {
    const at = close ? v3(SPR_CLOSE[n]) : v3(p), d = T.stamp3 + 2 + n * 2;
    const expr = exprAt(f, [[0, "deadpan"], [free + 2 + n, "happy"], [d, "huff"]] as [number, RigState["expr"]][]);
    const clap = f >= T.n5 && f < T.stamp3;
    const r = w.actor(PEOPLE.commoner(n));
    r.set({ at, facing: close ? -0.2 : 0.35, pose: clap ? { kind: "cheer", t: t * 1.5 + n * 0.4, amount: 1 } : { kind: "idle", t: t + n }, expr, ...alive(t, 20 + n), ...(f >= T.stamp3 ? { blink: 0, gaze: -0.5 } : {}),
      head: heads(accent("pop", f, free + 2 + n), accent("jolt", f, d, { amp: 0.7 }), accent("shake", f, d + 5)), visible: true });
    cm.push(r);
  });
  SPR_LORDS.forEach((p, n) => {
    const at = v3(p.at), d = T.n5 + 2 + n * 3;
    stand(w, L(p.lord), at, lerp(0.75, -0.35, smooth(lin(f, d, d + 8))), p.lord, { expr: exprAt(f, [[0, "stern"], [free + 1, "shock"], [d, "whistle"]] as [number, RigState["expr"]][]), gaze: f >= d ? -1 : 1, blink: f >= d ? 0 : lid(t, p.lord), head: heads(accent("jolt", f, free + 1), f >= d ? { tilt: -7, dy: 0.05 } : undefined) });
  });
  // Arthur: asleep on his feet with a hand on the hilt, wakes, pulls left-handed
  const A = w.actor(PEOPLE.arthur);
  const asleep = f < T.wake, nod = asleep ? 0.5 + 0.5 * Math.sin((f - T.spr) * 0.35) : 0;
  const expr = exprAt(f, [[0, "sleep"], [T.wake, "shock"], [T.wake + 5, "deadpan"], [1597, "sleep"], [1607, "deadpan"], [T.n5, "smile"], [T.stamp3, "deadpan"]] as [number, RigState["expr"]][]);
  const yawn = smooth(lin(f, 1596, 1599)) * (1 - smooth(lin(f, 1605, 1608)));
  pullOut(w, A, u, { side: "L", t, extra: {
    expr, gaze: f >= 1618 && f < T.stamp3 ? -1 : 0, blink: expr === "deadpan" || expr === "smile" ? lid(t, 1, [(T.wake + 5) / FPS, 1607 / FPS, T.n5 / FPS]) : 0,
    lookDown: asleep ? 8 + 8 * nod : 0, head: heads(asleep ? { dy: -0.04 - 0.05 * nod, tilt: -5 } : undefined, accent("jolt", f, T.wake), { dy: 0.1 * yawn, tilt: 7 * yawn }),
  } });
  w.update();
  pullOutAfter(w, A, u, "L");
  if (!close) {
    const slot = w.project([0, 0.6, 0]), ah = headPx(w, A, cam.fov);
    ov.push(h(Zzz, { key: "z", x: ah.x, y: ah.y, r: ah.r, at: T.spr - 30, out: T.wake, frame: f }));
    ov.push(h(Flower, { key: "fl", x: ah.x, y: ah.y, r: ah.r, at: T.bloom, sway: 9 * Math.sin((f - T.bloom) * 0.5) * Math.exp(-(f - T.wake) / 9) * (f >= T.wake ? 1 : 0.3), frame: f }));
    ov.push(h(Mark, { key: "wake", kind: "!", at: T.wake, out: T.wake + 8, x: ah.x - ah.r - 30, y: ah.y - ah.r - 50, size: 120, frame: f }));
    ov.push(h(Burst, { key: "b", at: free, x: slot.x, y: slot.y, r: 150, frame: f }));
    ov.push(h(PullCounter, { key: "n", n: 5, at: T.n5, x: 830, y: 250, scale: 0.8, frame: f }));
  } else {
    [0, 3].forEach((n) => { const hp = headPx(w, cm[n], cam.fov); ov.push(h(Mark, { key: `m${n}`, kind: "!?", at: T.stamp3 + 3 + n * 2, x: hp.x + (n ? 0.3 : -0.3) * hp.r, y: hp.y - hp.r - 95, size: 140, frame: f })); });
    ov.push(h(Stamp, { key: "st", at: T.stamp3, x: 540, y: 285, text: "还拖", rot: -6, frame: f }));
  }
  ov.push(h(CornerTag, { key: "tag", at: 1566, out: 1644, text: "春天", frame: f }));
  dbg(w, f, "spring", [["arthur", A], ["c0", cm[0]], ["c1", cm[1]], ["c2", cm[2]]]);
  return { camera: cam, season: 2, focus: [0, 0], overlays: fr(...ov) };
}

// ---------------------------------------------------------------------------------------------------- 8. early summer
function summer(w: World, f: number): Pose {
  const t = w.t, u = lin(f, T.pull6[0], T.pull6[1]), free = freeAt(T.pull6), push = smooth(lin(f, T.sum + 4, T.n6));
  let cam = stoneCam(w, [-0.7, 2.4 - 0.15 * push, 8.4 - 0.25 * push], 0.07, -0.6, 40);
  cam = bump(cam, kick(f, free) + kick(f, T.n6, 0.04));
  w.setCamera(cam);
  const up = smooth(lin(f, free, T.pull6[1]));
  for (const s of crowd()) {
    const r = w.actor(s.who, s.key), d = T.n6 + stagger(s.id, 5), commons = s.kind === "commoner", lord = s.kind === "lord";
    const cheer = f >= d && !lord;
    const expr: RigState["expr"] = lord ? (f >= free + 2 ? "shock" : "stern") : f >= d ? (s.id % 3 ? "grin" : "happy") : f >= free + stagger(s.id, 4) ? "happy" : commons ? (s.id % 2 ? "neutral" : "deadpan") : "smile";
    const side = s.at.x < 0 ? 1 : -1;
    r.set({ at: s.at, facing: s.facing, pose: cheer ? { kind: "cheer", t: t * 1.4 + s.id * 0.37, amount: 1 } : { kind: "idle", t: t + s.id }, expr, ...alive(t, s.id),
      ...(f >= T.pull6[0] ? { gaze: side * (up > 0.5 ? 0.5 : 1) } : {}), ...(lord && f >= free + 2 ? { blink: 0 } : {}),
      head: heads({ dy: 0.06 * up }, accent("jolt", f, free + stagger(s.id, 4), { amp: lord ? 1 : 0.5 }), cheer ? accent("pop", f, d) : undefined), visible: true });
  }
  const A = w.actor(PEOPLE.arthur);
  const expr = exprAt(f, [[0, "neutral"], [T.pull6[0], "smile"], [T.n6, "grin"]] as [number, RigState["expr"]][]);
  pullOut(w, A, u, { side: "R", t, extra: { expr, gaze: f < 1656 ? -1 : f < 1664 ? 1 : 0, blink: lid(t, 1, [T.pull6[0] / FPS, T.n6 / FPS]), head: accent("pop", f, T.n6) } });
  w.update();
  pullOutAfter(w, A, u, "R");
  w.stone.setShine(f >= T.pull6[1] ? 0.35 + 0.65 * clamp01(1 - Math.abs(f - (T.n6 + 2)) / 8) : 0.2 * up);
  const slot = w.project([0, 0.6, 0]), ov: Ov = [];
  ov.push(h(CornerTag, { key: "tag", at: 1649, out: 1712, text: "初夏", frame: f }));
  ov.push(h(Burst, { key: "b", at: free, x: slot.x, y: slot.y, r: 130, frame: f }));
  ov.push(h(PullCounter, { key: "n", n: 6, at: T.n6, x: 830, y: 232, scale: 0.8, frame: f }));
  dbg(w, f, "summer", [["arthur", A]]);
  return { camera: cam, season: 3, focus: [0, -1], overlays: fr(...ov) };
}

// ---------------------------------------------------------------------------------------------------- the segment
export const SEG: Segment = {
  id: "D", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w, f) {
    if (f < T.m[4]) return lordsTry(w, f);
    if (f < T.rage) return pullThree(w, f);
    if (f < T.line) return rage(w, f);
    if (f < T.hands) return lordSpeaks(w, f);
    if (f < T.later) return handsUp(w, f);
    if (f < T.feb) return later(w, f);
    if (f < T.spr) return february(w, f);
    if (f < T.sum) return spring(w, f);
    return summer(w, f);
  },
};
