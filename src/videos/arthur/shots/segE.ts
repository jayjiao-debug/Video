// Segment E, frames 1715-1990 (lines 19-21): the people decide, the crown, the punchline.            season 3, last shot 0
//  1715  HARD CUT from D's wide (crowd(), Arthur with the sword up): close on the commons on the right. On 老百姓 the
//        cheering faces turn angry (jolt, "!?"), on 急了 they push a step forward, fists pumping.
//  1745  "就要亚瑟当国王": cut to the two-shot: they point at Arthur and shout (the commons' own line: lip-sync); the camera
//        goes to Arthur on the stone; on 当国王 a crown icon pops over his head and hovers (as in the hook).
//  1783  "别再拖了！": cut to the lords: they flinch on every syllable and shrink (nervous, sweat, eyes sliding); the lead
//        lord's hands go up; commons shake their fists behind them.
//  1806  所有人齐刷刷跪下: the wide: a wave of kneeling runs outward from the stone; the lords last, the lead lord alone on
//        his feet for a moment, then down on 跪. Arthur lowers the sword and looks round: shock -> a shy smile.
//  1852  整整六次: close on Arthur, the big counter 第六次.
//  1876  他才当上国王: the crown drops; on f1884 it lands (Burst, squash) and he IS the king (PEOPLE.arthurKing). Cut wide
//        on f1891: everybody up and cheering, the king lifts the sword.
//  1905  Rewind (8 f) -> 1908 HARD CUT to the FIELD in snow, STAGE.field as in B: 第一次 (small counter). Kay, smug, pats
//        his hip: the scabbard is EMPTY (insert close-up on 忘了带剑); back to the two: Kay's embarrassed grin, Arthur
//        shrugs at us. Hold to the end.
import { Fragment, type ReactNode } from "react";
import * as THREE from "three";
import { SEGMENTS, FPS, h, lin, smooth, clamp01, lerp, easeOutCubic, easeInCubic, easeInOutCubic, easeOutBack, quote, hash, type Segment, type Pose, type CamPose, type Vec3 } from "../story";
import type { World } from "../world";
import { PEOPLE } from "../people";
import { V, lid, speak, accent, heads, raise, raiseAfter, raisePoint, kneel, crowd, stagger, alive, hopArc, SPOT, STAGE, type Rig, type RigState, type RigHead, type Spot } from "./common";
import { PullCounter, Mark, Burst, Crown } from "../overlay";
import { Rewind } from "../../group/kit/overlay";
import { Rays } from "./segE_ov";

const S = SEGMENTS[4];
const DBG = true;
const dbg = (f: number, ...a: unknown[]) => { if (DBG) console.log(`QA: dbg f${f} ` + a.map((x) => (typeof x === "number" ? x.toFixed(3) : x instanceof THREE.Vector3 ? `[${x.x.toFixed(2)},${x.y.toFixed(2)},${x.z.toFixed(2)}]` : String(x))).join(" ")); };

// ------------------------------------------------------------------------------------------------------ beats (frames)
// captions: 【老百姓】急了 1717-1744 · “就要亚瑟当国王” 1745-1782 · “【别再拖了】！” 1783-1805 · 所有人齐刷刷【跪下】 1806-1850 ·
// 整整【六次】 1853-1874 · 他才当上国王 1875-1907 · 而第一次 1908-1929 · 只因为哥哥【忘了带剑】 1930-1979 · tail to 1990
const T = {
  angry: 1717, mark: 1719, surge: 1731,                          // 老百姓 / 急了
  say: 1745, him: 1756, crown: 1767,                              // 就要 / 亚瑟 / 当国王
  lords: 1783, syl: [1783, 1789, 1794, 1800],                     // 别 再 拖 了
  wide: 1806, kneel0: 1807, lordsCut: 1830, lordsKneel: 1832, lastLord: 1840, peek: 1846,
  close: 1852, count: 1853, countOut: 1872,
  drop: 1876, land: 1884, rise: 1886, cheer: 1891,
  rewind: 1905, field: 1908, countOut1: 1926,
  pat: 1930, bro: 1947, forgot: 1958, back: 1968, shrug: 1971, end: S.to,
};
const Q = quote("commons");

// ------------------------------------------------------------------------------------------------------------ helpers
type St = Partial<RigState>;
const SPOTS = crowd();
/** each spot's number within its kind (commoner 0..15, lord 0..7) */
const NUM = new Map<Spot, number>();
{ const n: Record<string, number> = {}; for (const s of SPOTS) { n[s.kind] = (n[s.kind] ?? -1) + 1; NUM.set(s, n[s.kind]); } }
const spotOf = (kind: Spot["kind"], n: number) => SPOTS.find((s) => s.kind === kind && NUM.get(s) === n)!;
const distOf = (s: Spot) => Math.hypot(s.at.x, s.at.z);
const toStone = (s: Spot) => V(-s.at.x, 0, -s.at.z).normalize();
const c3 = (pos: Vec3, look: Vec3, fov: number): CamPose => ({ pos, look, fov });
const mixCam = (a: CamPose, b: CamPose, k: number): CamPose => {
  const A = a.pos as Vec3, B = b.pos as Vec3, C = a.look as Vec3, D = b.look as Vec3;
  return { pos: [lerp(A[0], B[0], k), lerp(A[1], B[1], k), lerp(A[2], B[2], k)], look: [lerp(C[0], D[0], k), lerp(C[1], D[1], k), lerp(C[2], D[2], k)], fov: lerp(a.fov, b.fov, k) };
};
/** A camera at `pos` that looks toward the floor point (tx, tz), pitched so that the middle of the stone's gold
 *  inscription sits at `frac` of the frame height (just above the caption band). */
function camOverStone(pos: Vec3, tx: number, tz: number, fov: number, frac = 0.575): CamPose {
  const hx = tx - pos[0], hz = tz - pos[2], hl = Math.hypot(hx, hz), ux = hx / hl, uz = hz / hl;
  const r = [0 - pos[0], 0.17 - pos[1], 0.5 - pos[2]];
  const want = (0.5 - frac) * 2 * Math.tan((fov * Math.PI) / 360);
  const g = (p: number) => { const c = Math.cos(p), s = Math.sin(p); return (r[0] * s * ux + r[1] * c + r[2] * s * uz) / (r[0] * c * ux - r[1] * s + r[2] * c * uz) - want; };
  let lo = -0.3, hi = 1.0;
  for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (g(m) < 0) lo = m; else hi = m; }
  return { pos, look: [tx, pos[1] - Math.tan((lo + hi) / 2) * hl, tz], fov };
}
/** a 3-frame camera kick (metres, added to pos.y and look.y) that starts on frame `at` */
const kick = (f: number, at: number, a = 0.03) => (f >= at && f < at + 3 ? [a, -0.6 * a, 0.3 * a][f - at] : 0);
/** head centre and radius on screen */
const headPx = (w: World, r: Rig) => { const c = r.headWorld(), p = w.project(c), q = w.project(c.clone().add(V(0, 0.24, 0))); return { x: p.x, y: p.y, r: Math.abs(p.y - q.y) }; };
const frag = (...kids: ReactNode[]) => h(Fragment, null, ...kids);
/** a hand's way through [frame, point, ease?] keys: it stands on the first point before the first key and on the last
 *  one after the last; `ease` shapes the leg that ARRIVES at its key */
type PathKey = [number, THREE.Vector3, ((x: number) => number)?];
const path = (f: number, keys: PathKey[]) => {
  if (f <= keys[0][0]) return keys[0][1].clone();
  for (let i = 1; i < keys.length; i++) if (f <= keys[i][0]) return keys[i - 1][1].clone().lerp(keys[i][1], (keys[i][2] ?? smooth)(lin(f, keys[i - 1][0], keys[i][0])));
  return keys[keys.length - 1][1].clone();
};
/** value of the last key at or before f */
const step = <X,>(f: number, keys: [number, X][]): X => { let v = keys[0][1]; for (const [k, x] of keys) if (f >= k) v = x; return v; };

/** Arthur (or the king) on the stone, facing us, the sword in his right hand (arm 0): k 1 = held up beside the head (the
 *  pose of raise()), k 0 = lowered to chest height, the point still up. Call holdAfter after w.update(). */
const HOLD_LO = V(-0.3, 0.98, 0.15), FREE_UP = V(0.33, 1.22, 0.1), FREE_DN = V(0.17, 0.585, 0.02);
function hold(r: Rig, k: number, t: number, extra: St, sag = 0) {
  const at = SPOT.drawR.clone();
  const h0 = at.clone().add(HOLD_LO).lerp(raisePoint(at, 0), k).add(V(0.01 * sag, -0.07 * sag, 0)), h1 = at.clone().add(FREE_DN).lerp(at.clone().add(FREE_UP), k);
  r.set({ at, facing: 0, pose: { kind: "idle", t }, hands: [h0, k > 0.01 ? h1 : null], visible: true, ...extra });
}
const holdAfter = (w: World, r: Rig, k: number) => w.stone.setFree(r.handWorld(0), V(lerp(0.2, 0.27, k), -1, 0));

// ---------------------------------------------------------------------------------------------- the yard: who does what
/** the commons while they are angry (1715-1805): fists up, a step forward on 急了, hopping mad; from T.say the front
 *  ones point at Arthur; everybody shouts the line */
function commoner(s: Spot, f: number, point: THREE.Vector3 | null = null): St {
  const t = f / FPS, id = s.id, n = NUM.get(s)!, d = stagger(id, 3);
  const mad = f >= T.angry + d;
  const at = hopArc(s.at, s.at.clone().addScaledVector(toStone(s), 0.2), lin(f, T.surge + d, T.surge + d + 5), 0.08);
  if (!mad) return { at, pose: { kind: "cheer", t: t + id * 0.13, amount: 1 }, expr: n % 2 ? "happy" : "laugh", blink: lid(t, id) };
  // hopping mad: small jumps, quicker after the surge
  const rate = f >= T.surge ? 0.62 : 0.45, hop = 0.05 * Math.abs(Math.sin((f - T.angry) * rate + id * 1.3));
  if (f < T.surge + d || f > T.surge + d + 5) at.y += hop;
  const say = speak(Q, f, id);
  const hd = heads(accent("jolt", f, T.angry + d), accent("pop", f, T.surge + d + 4), say.head);
  const st: St = { at, blink: lid(t, id, [(T.angry + d) / FPS]), expr: n % 3 === 1 ? "stern" : "huff", ...say, head: hd };
  if (point && f >= T.say + (d >> 1)) return { ...st, pose: { kind: "point", t, arm: 0 }, hands: [point, null] };
  const g = id % 3;
  return { ...st, pose: g === 1 ? { kind: "cheer", t: t * 2.3 + id * 0.4, amount: 1.5 } : { kind: "wave", t: t * 1.5 + id * 0.3, arm: g === 0 ? 0 : 1 } };
}
/** the lords while the commons shout: stiff and sour until T.lords, then every syllable hits them: they shrink */
function lord(s: Spot, f: number): St {
  const t = f / FPS, id = s.id, n = NUM.get(s)!;
  if (f < T.lords) return { pose: { kind: "idle", t: t + id }, expr: f >= T.crown + 3 + stagger(id, 4) ? "huff" : "stern", ...alive(t, id), head: accent("jolt", f, T.crown + 3 + stagger(id, 4)) };
  let sink = 0, back = 0; const hs: (RigHead | undefined)[] = [];
  T.syl.forEach((sf, k) => { const a = sf + 1 + stagger(id, 2, k), u = easeOutCubic(lin(f, a, a + 3)); sink += 0.028 * u; back += 0.035 * u; hs.push(accent(k % 2 ? "squash" : "jolt", f, a)); });
  const gz = [-1, 1, -0.5, 1, 0, -1][(Math.floor((f - T.lords) / 5) + id) % 6];
  const up = n === 0 && f >= T.syl[2] + 1;                       // the lead lord: hands up
  return {
    at: s.at.clone().addScaledVector(toStone(s), -back).add(V(0, -sink, 0)), pose: up ? { kind: "cheer", t, amount: 0.4 } : { kind: "idle", t: t + id },
    expr: "nervous", gaze: gz, blink: lid(t, id), head: heads(...hs, { dy: -sink * 1.5 }), lookDown: 70 * sink,
  };
}
const family = (s: Spot, f: number): St => ({ pose: { kind: "idle", t: f / FPS + s.id }, expr: f >= T.say ? "smile" : "neutral", ...alive(f / FPS, s.id) });
const guard = (s: Spot, f: number): St => ({ pose: { kind: "idle", t: f / FPS + s.id }, expr: "neutral", ...alive(f / FPS, s.id) });
/** set the whole town: fn gives the state of one spot (null = not in this shot) */
function town(w: World, fn: (s: Spot) => St | null) {
  for (const s of SPOTS) { const st = fn(s); if (st) w.actor(s.who, s.key).set({ at: s.at, facing: s.facing, pose: { kind: "idle", t: 0 }, ...st, visible: true }); }
}
const angryTown = (w: World, f: number, point: (s: Spot) => THREE.Vector3 | null = () => null) =>
  town(w, (s) => (s.kind === "commoner" ? commoner(s, f, point(s)) : s.kind === "lord" ? lord(s, f) : s.kind === "guard" ? guard(s, f) : family(s, f)));
const YARD = { season: 3 as const, focus: [0, -0.6] as [number, number] };

// ------------------------------------------------------------------------------------------------------------- shots
/** 1715-1755  【老百姓】急了: close on the commons; from f1745 (a punch-in) they point at him and shout “就要…” */
function shotCommons(w: World, f: number): Pose {
  const k = lin(f, S.from, T.say), kk = kick(f, T.angry), q = lin(f, T.say, T.him);
  const cam = f < T.say ? c3([2.9 - 0.15 * k, 1.55 + kk, 3.3 - 0.3 * k], [1.2, 0.96 + kk, -0.8], 40)
    : c3([2.6 - 0.1 * q, 1.5, 2.7 - 0.15 * q], [0.86, 1.02, -0.8], 40);
  w.setCamera(cam);
  const A = w.actor(PEOPLE.arthur), t = f / FPS, target = V(0.22, 1.25, 0);
  angryTown(w, f, (s) => (NUM.get(s)! < 4 || NUM.get(s) === 5 ? target : null));
  raise(A, SPOT.drawR.clone(), { t, extra: { expr: f >= T.angry + 4 ? "shock" : "grin", gaze: f >= T.angry + 4 ? 1 : 0, blink: lid(t, 1) } });
  w.update(); raiseAfter(w, A, 0);
  const a = headPx(w, w.actor(spotOf("commoner", 1).who)), b = headPx(w, w.actor(spotOf("commoner", 3).who));
  dbg(f, "marks", a.x, a.y, a.r, b.x, b.y, b.r);
  const ov = frag(
    h(Mark, { kind: "!?", at: T.mark, out: T.say - 6, x: a.x - 10, y: a.y - a.r - 130, size: 200, frame: f }),
    h(Mark, { kind: "!", at: T.mark + 5, out: T.say - 6, x: b.x - 20, y: b.y - b.r - 110, size: 150, frame: f }),
  );
  return { camera: cam, ...YARD, overlays: ov, post: { dof: { focus: 3.4, amount: 3 } } };
}
/** 1756-1782  “…亚瑟当国王”: Arthur, the shouting commons behind him; "me?"; the crown icon pops over his head */
function shotHim(w: World, f: number): Pose {
  const p = easeOutCubic(lin(f, T.him, T.lords)), kk = kick(f, T.crown, 0.025);
  const cam = c3([-0.62 + 0.08 * p, 1.55 + kk, 2.75 - 0.25 * p], [0.19, 1.47 + kk, 0], 40);
  w.setCamera(cam);
  const A = w.actor(PEOPLE.arthur), t = f / FPS, at = SPOT.drawR.clone(), target = V(0.22, 1.25, 0);
  angryTown(w, f, (s) => (NUM.get(s)! < 4 || NUM.get(s) === 5 ? target : null));
  // "me?": the free hand goes to his chest on 亚瑟 and back up when the crown pops
  const me = smooth(lin(f, T.him + 1, T.him + 5)) * (1 - smooth(lin(f, T.crown + 1, T.crown + 5)));
  const free = at.clone().add(FREE_UP).lerp(at.clone().add(V(0.06, 0.93, 0.15)), me);
  const seen = f >= T.crown + 2;
  raise(A, at, { t, extra: {
    hands: [raisePoint(at, 0), free], expr: seen ? "shock" : "nervous", gaze: seen ? 0 : 1, lookDown: seen ? -10 : 0,
    blink: lid(t, 1, [(T.crown + 2) / FPS]), head: heads(accent("jolt", f, T.him + 1), accent("pop", f, T.crown + 2)),
  } });
  w.update(); raiseAfter(w, A, 0);
  const hp = headPx(w, A), bob = Math.sin((f - T.crown) * 0.4) * 9;
  dbg(f, "head", hp.x, hp.y, hp.r, "inscr", w.project([0, 0.36, 0.5]).y / 1920, "tip", w.project(w.stone.tip()).x, w.project(w.stone.tip()).y);
  const ov = frag(h(Crown, { at: T.crown, x: hp.x + 6, y: hp.y - hp.r - 150 + bob, size: 220, frame: f }));
  return { camera: cam, ...YARD, overlays: ov, post: { dof: { focus: 2.7, amount: 3 } } };
}
/** 1783-1805  “别再拖了！”: the lords, hit by every syllable */
function shotLords(w: World, f: number): Pose {
  const k = easeOutCubic(lin(f, T.lords, T.lords + 5)), p = lin(f, T.lords, T.wide);
  const kk = T.syl.reduce((a, sf) => a + kick(f, sf, 0.02), 0);
  const cam = c3([-0.75, 1.25 + kk, 0.95 - 0.12 * p], [-1.3 + 0.6 * (1 - k), 0.97 + kk, -2.5], 40);
  w.setCamera(cam);
  const A = w.actor(PEOPLE.arthur), t = f / FPS;
  angryTown(w, f);
  raise(A, SPOT.drawR.clone(), { t, extra: { expr: "shock", gaze: -1, blink: lid(t, 1) } });
  w.update(); raiseAfter(w, A, 0);
  return { camera: cam, ...YARD, post: { dof: { focus: 2.6, amount: 3 } } };
}
/** the frame a spot goes down */
const kneelAt = (s: Spot) => {
  if (s.kind !== "lord") return T.kneel0 + Math.round(distOf(s) * 3.0) + stagger(s.id, 1);
  const n = NUM.get(s)!;
  return [T.lastLord, 1829, T.lordsKneel + 1, 1826, 1827, 1823, 1824, 1825][n];      // back rows first; the two in front last
};
/** the frame it gets up again to cheer */
const riseAt = (s: Spot) => T.rise + Math.round(distOf(s) * 1.2) + stagger(s.id, 2);
function kneeler(s: Spot, f: number): St {
  const t = f / FPS, id = s.id, n = NUM.get(s)!, a = kneelAt(s), b = riseAt(s), isLord = s.kind === "lord";
  if (f >= b) {
    const up = easeOutBack(lin(f, b, b + 5), 1.4), jump = isLord || s.kind === "guard" ? 0 : 0.06 * Math.abs(Math.sin((f - b) * 0.5 + id));
    return {
      ...kneel(1 - up, s.at), at: s.at.clone().add(V(0, Math.min(0, (up - 1) * 0.38) + (f >= b + 5 ? jump : 0), 0)),
      pose: s.kind === "guard" ? { kind: "idle", t } : { kind: "cheer", t: t + id * 0.13, amount: isLord ? 0.5 : 1.3 },
      expr: isLord ? "nervous" : n % 3 === 0 ? "laugh" : n % 3 === 1 ? "happy" : "grin", blink: lid(t, id),
    };
  }
  const k = easeOutBack(lin(f, a, a + 5), 1.2);
  if (isLord) {
    if (f < a) {
      if (f < T.lordsCut) {                                      // the wide: stiff, then uneasy looks left and right
        const look = [-1, 1, -1, 0.5, 1, -0.5][(Math.floor((f - T.wide) / 6) + id) % 6];
        return { pose: { kind: "idle", t: t + id }, expr: f >= T.kneel0 + 8 ? "nervous" : "stern", gaze: look, blink: lid(t, id), head: accent("shake", f, T.kneel0 + 8 + stagger(id, 8)) };
      }
      if (n === 0) return {                                      // the lead lord, the last one standing: right, left, gulp
        pose: { kind: "idle", t: t + id }, expr: "nervous", gaze: step(f, [[0, 0], [T.lordsKneel + 4, 1], [T.lordsKneel + 7, -1]]), blink: lid(t, id),
        head: heads(accent("jolt", f, T.lordsKneel + 4), accent("squash", f, T.lastLord - 3)),
      };
      return { pose: { kind: "idle", t: t + id }, expr: "nervous", gaze: f >= T.lordsCut + 1 ? -1 : 0, blink: lid(t, id), head: accent("nod", f, T.lordsKneel - 1) };
    }
    const peek = n === 0 && f >= T.peek && f < T.peek + 4;
    return { ...kneel(k, s.at, 22), pose: { kind: "idle", t: t + id }, expr: peek ? "nervous" : "sigh", blink: peek ? 0 : k > 0.6 ? 1 : 0, gaze: 1 };
  }
  if (f < a) {
    if (s.kind === "commoner") return { pose: { kind: "cheer", t: t * 2.3 + id * 0.4, amount: 1 }, expr: "huff", blink: lid(t, id) };
    return { pose: { kind: "idle", t: t + id }, expr: "smile", ...alive(t, id) };
  }
  return { ...kneel(k, s.at), pose: { kind: "idle", t: t + id }, expr: s.kind === "commoner" ? "smile_closed" : "smile", blink: k > 0.6 ? 1 : 0 };
}
/** 1806-1829  所有人齐刷刷…: the wide: the wave runs outward from the stone; the lords stay on their feet */
function shotKneel(w: World, f: number): Pose {
  const p = lin(f, T.wide, T.lordsCut);
  const cam = camOverStone([0.1, 2.5 - 0.1 * p, 8.4 - 0.6 * p], 0, -0.9, 40);
  w.setCamera(cam);
  const A = w.actor(PEOPLE.arthur), t = f / FPS, k = 1 - easeInOutCubic(lin(f, T.kneel0 + 3, T.kneel0 + 11));
  town(w, (s) => kneeler(s, f));
  hold(A, k, t, {
    expr: f < T.kneel0 + 4 ? "grin" : "shock", gaze: step(f, [[0, 0], [T.kneel0 + 4, 1], [T.kneel0 + 13, -1]]),
    blink: lid(t, 1, [(T.kneel0 + 4) / FPS]), head: heads(accent("jolt", f, T.kneel0 + 4)),
  });
  w.update(); holdAfter(w, A, k);
  return { camera: cam, ...YARD };
}
/** 1830-1851  …【跪下】: the last two lords on their feet: one goes down, the lead lord looks round, gulps, and on 跪 he
 *  drops too; the camera goes down with him; a peek at the end */
function shotLordsKneel(w: World, f: number): Pose {
  const p = lin(f, T.lordsCut, T.close), d = easeInOutCubic(lin(f, T.lastLord, T.lastLord + 5)), kk = kick(f, T.lastLord + 4, -0.025);
  const cam = c3([-0.75, 1.25 - 0.3 * d + kk, 0.9 - 0.1 * p], [-1.3, 0.97 - 0.42 * d + kk, -2.5], 40);
  w.setCamera(cam);
  const A = w.actor(PEOPLE.arthur), t = f / FPS;
  town(w, (s) => kneeler(s, f));
  hold(A, 0, t, { expr: "shock", gaze: -1, blink: lid(t, 1) });
  w.update(); holdAfter(w, A, 0);
  const hp = headPx(w, w.actor(spotOf("lord", 0).who));
  const ov = frag(f < T.lastLord ? h(Mark, { kind: "!", at: T.lordsKneel + 5, x: hp.x - hp.r * 0.6, y: hp.y - hp.r - 150, size: 170, frame: f }) : null);
  return { camera: cam, ...YARD, overlays: ov, post: { dof: { focus: 2.6, amount: 3 } } };
}
/** 1852-1890  整整【六次】: close on Arthur, the big counter; 他才…: the crown comes down and lands on f1884 */
function shotCrown(w: World, f: number): Pose {
  const p = lin(f, T.close, T.cheer), t = f / FPS, king = f >= T.land, kk = kick(f, T.land, -0.035);
  const cam = c3([0.5 - 0.1 * p, 1.52 + kk, 2.95 - 0.3 * p], [0.17, 1.4 + kk, 0], 40);
  w.setCamera(cam);
  const A = w.actor(king ? PEOPLE.arthurKing : PEOPLE.arthur);
  town(w, (s) => kneeler(s, f));
  const sag = smooth(lin(f, T.count + 9, T.count + 13)) * (1 - smooth(lin(f, T.drop + 1, T.drop + 4)));      // the shoulders drop: six times...
  const e = step<NonNullable<RigState["expr"]>>(f, [[0, "smile"], [T.count + 1, "shock"], [T.count + 9, "deadpan"], [T.drop + 2, "shock"], [T.land, "wince"], [T.land + 4, "grin"]]);
  hold(A, 0, t, {
    expr: e, gaze: step(f, [[0, -1], [T.count + 1, 0]]), lookDown: f >= T.count + 1 && f < T.count + 9 ? -12 : f >= T.drop + 2 && f < T.land ? -14 : 0,
    blink: lid(t, 1, [(T.count + 9) / FPS]),
    head: heads(accent("jolt", f, T.count + 1), accent("nod", f, T.count + 9), accent("jolt", f, T.drop + 2), accent("squash", f, T.land), accent("pop", f, T.land + 5), sag > 0 ? { dy: -0.08 * sag } : undefined),
  }, sag);
  w.update(); holdAfter(w, A, 0);
  const hp = headPx(w, A);
  const u = easeInCubic(lin(f, T.drop, T.land)), cy = lerp(-140, hp.y - hp.r - 40, u);
  const ov = frag(
    h(PullCounter, { n: 6, at: T.count, out: T.countOut, x: 620, y: 262, scale: 1.05, frame: f }),
    f >= T.drop && f < T.land ? h(Crown, { at: T.drop - 20, x: hp.x, y: cy, size: 250, rot: -6 + 10 * u, frame: f }) : null,
    h(Rays, { at: T.land, x: hp.x, y: hp.y - hp.r * 0.55, r: hp.r * 1.55, n: 9, from: -160, to: -20, frame: f }),
  );
  return { camera: cam, ...YARD, overlays: ov, post: { dof: { focus: 2.8, amount: 4 } } };
}
/** 1891-1907  …当上国王: everybody up and cheering, the king lifts the sword; from f1905 under the Rewind */
function shotCheer(w: World, f: number): Pose {
  const p = lin(f, T.cheer, T.field);
  const cam = camOverStone([0.5 - 0.3 * p, 2.3, 7.9 - 0.7 * p], 0, -0.9, 40);
  w.setCamera(cam);
  const A = w.actor(PEOPLE.arthurKing), t = f / FPS, k = clamp01(easeOutBack(lin(f, T.cheer, T.cheer + 6), 1.3));
  town(w, (s) => kneeler(s, f));
  hold(A, k, t, { expr: "laugh", blink: lid(t, 1), head: heads(accent("pop", f, T.cheer + 5)) });
  w.update(); holdAfter(w, A, k);
  w.stone.setShine(0.6 + 0.4 * Math.sin((f - T.cheer) * 0.6));
  const tip = w.project(w.stone.tip());
  const ov = frag(h(Burst, { at: T.cheer + 6, x: tip.x, y: tip.y, r: 150, n: 10, frame: f }));
  return { camera: cam, ...YARD, overlays: ov };
}

// ------------------------------------------------------------------------------------------------------------ the field
const F = STAGE.field;
/** the mouth of Kay's empty scabbard (at his left hip; garb.ts scabbard: (rb - 0.004, -0.04, -0.012) from the hip) */
const mouthOf = (K: Rig) => { const y = F.kay.facing, x = K.dim.rb - 0.004, z = -0.012; return F.kay.at.clone().add(V(x * Math.cos(y) + z * Math.sin(y), K.dim.hipY - 0.04, -x * Math.sin(y) + z * Math.cos(y))); };
const TWO = c3([-17.52, 1.35, 6.9], [-17.52, 1.02, 2.65], 40);          // both of them, head to foot (STAGE.field, a step back)
const HIP = c3([-17.9, 1.3, 5.45], [-17.93, 0.62, 2.6], 40);            // Kay alone: his head at the top, the scabbard above the caption
const FACES = c3([-17.56, 1.38, 6.4], [-17.56, 0.97, 2.65], 40);       // the last picture: the two faces
function fieldCam(f: number): CamPose {
  if (f < T.pat) return mixCam(TWO, c3([-17.52, 1.35, 6.75], [-17.52, 1.02, 2.65], 40), lin(f, T.field, T.pat));
  if (f < T.back) { const c = mixCam(c3([-17.52, 1.35, 6.75], [-17.52, 1.02, 2.65], 40), HIP, easeInOutCubic(lin(f, T.pat, T.pat + 7))); (c.pos as Vec3)[2] -= 0.25 * lin(f, T.pat + 7, T.back); return c; }
  const c = { ...FACES, pos: [...(FACES.pos as Vec3)] as Vec3 }; (c.pos as Vec3)[2] -= 0.1 * lin(f, T.back, T.end); return c;
}
/** 1908-1990  而第一次 / 只因为哥哥【忘了带剑】: Kay's empty scabbard */
function shotField(w: World, f: number): Pose {
  const t = f / FPS, cam = fieldCam(f);
  w.setCamera(cam);
  const K = w.actor(PEOPLE.kay), A = w.actor(PEOPLE.arthur);
  w.set.anchors.fieldCrowd.forEach((q, k) => w.actor(PEOPLE.commoner(k)).set({ at: q, facing: 0, pose: { kind: "cheer", t: t + k * 0.21, amount: 1 }, expr: "happy", blink: lid(t, 20 + k), visible: true }));
  // ---- Kay: smug and waving; slaps his left hip (the scabbard) twice, then the right one; "!"; shows the empty
  //      scabbard; the embarrassed grin; one more hopeless pat at the very end
  const M = mouthOf(K), kat = F.kay.at, P = T.pat;
  const L = (x: number, y: number, z: number) => kat.clone().add(V(x, y, z));
  const rest1 = L(0.19, 0.59, 0.0), up1 = L(0.36, 0.86, 0.1), on1 = L(0.15, 0.6, 0.0), away1 = L(0.36, 0.7, 0.06);
  const rest0 = L(-0.19, 0.59, 0.0), up0 = L(-0.36, 0.86, 0.1), on0 = L(-0.17, 0.6, 0.02);
  const PAT1 = [P + 6, P + 10], PAT0 = [P + 13, P + 16], LAST = [T.end - 7, T.end - 2];
  // (the wave to the crowd: the left hand, beside his head, in the middle of the picture)
  const waveAt = (g: number) => L(0.4 + 0.07 * Math.sin((g - T.field) * 0.5), 1.2 - 0.03 * Math.cos((g - T.field) * 1.0), 0.08);
  let h1: THREE.Vector3 | null = null, h0: THREE.Vector3 | null = null;
  if (f < P) h1 = waveAt(f);
  else if (f < T.back) {
    h1 = path(f, [
      [P, waveAt(P)], [PAT1[0] - 3, up1, easeOutCubic], [PAT1[0], on1, easeInCubic], [PAT1[1] - 2, up1.clone().lerp(on1, 0.35), easeOutCubic], [PAT1[1], on1, easeInCubic], [PAT1[1] + 3, rest1],
      [T.bro, rest1], [T.bro + 2, up1.clone().lerp(rest1, 0.45), easeOutCubic], [T.bro + 8, rest1], [T.forgot - 2, rest1], [T.forgot + 2, away1, easeOutCubic], [T.forgot + 8, away1], [T.forgot + 11, rest1],
    ]);
    h0 = path(f, [
      [PAT0[0] - 5, rest0], [PAT0[0] - 3, up0, easeOutCubic], [PAT0[0], on0, easeInCubic], [PAT0[1] - 2, up0.clone().lerp(on0, 0.35), easeOutCubic], [PAT0[1], on0, easeInCubic],
      [T.bro, on0], [T.bro + 2, up0.clone().lerp(rest0, 0.45), easeOutCubic], [T.bro + 8, rest0],
    ]);
  } else if (f >= LAST[0] - 4) {
    h1 = path(f, [[LAST[0] - 4, rest1], [LAST[0] - 2, up1.clone().lerp(on1, 0.5), easeOutCubic], [LAST[0], on1, easeInCubic], [LAST[1] - 2, up1.clone().lerp(on1, 0.6), easeOutCubic], [LAST[1], on1, easeInCubic]]);
  }
  const pats = [...PAT1.map((c) => ({ c, at: on1 })), ...PAT0.map((c) => ({ c, at: on0 })), ...LAST.map((c) => ({ c, at: on1 }))];
  const kExpr = step<NonNullable<RigState["expr"]>>(f, [[0, "smug"], [PAT1[0], "neutral"], [PAT1[1], "focus"], [PAT0[0], "nervous"], [T.bro, "shock"], [T.forgot, "sad"], [T.forgot + 6, "nervous"]]);
  const down = (f >= PAT1[0] - 2 && f < T.bro) || (f >= T.forgot && f < T.forgot + 6) || f >= LAST[0] - 3 ? 1 : 0;
  const side = f >= PAT0[0] - 3 && f < T.bro ? -1 : 1;
  K.set({
    at: kat, facing: F.kay.facing, pose: { kind: "idle", t }, hands: [h0, h1],
    expr: kExpr, lookDown: 22 * down, gaze: down ? side : f >= T.back && f < T.shrug + 8 ? 1 : 0,
    blink: lid(t, 2, [T.bro / FPS, (T.forgot + 6) / FPS]),
    head: heads(down ? { tilt: 7 * side } : undefined, accent("pop", f, T.field + 4), accent("jolt", f, T.bro), accent("squash", f, T.forgot + 6), accent("nod", f, T.shrug + 9)),
    visible: true,
  });
  // ---- Arthur: happy beside his big brother; at the end he shrugs at us
  const sh = easeOutBack(lin(f, T.shrug, T.shrug + 4), 2) * (1 - smooth(lin(f, T.shrug + 13, T.shrug + 17)));
  const aat = f >= T.back ? F.arthur.at.clone().add(V(-0.15, 0, 0)) : F.arthur.at;         // (the last two-shot: half a step closer, so both faces are big)
  const shrug: [THREE.Vector3 | null, THREE.Vector3 | null] = sh > 0.01 ? [aat.clone().add(V(-0.2, 0.6, 0.02)).lerp(aat.clone().add(V(-0.3, 0.9, 0.12)), sh), aat.clone().add(V(0.2, 0.6, 0.02)).lerp(aat.clone().add(V(0.3, 0.9, 0.12)), sh)] : [null, null];
  A.set({
    at: aat, facing: F.arthur.facing, pose: { kind: "idle", t }, hands: shrug,
    expr: step<NonNullable<RigState["expr"]>>(f, [[0, "happy"], [T.pat + 8, "neutral"], [T.shrug, "smug"]]), gaze: f < T.shrug ? (f >= T.field + 12 && f < T.field + 17 ? 0 : -1) : 0, blink: lid(t, 1, [T.shrug / FPS]),
    head: heads(accent("nod", f, T.field + 8), accent("lean", f, T.shrug, { dir: 1, dur: 0.5 }), sh > 0.01 ? { dy: -0.06 * sh } : undefined), visible: true,
  });
  w.update();
  const kh = headPx(w, K), m = w.project(M);
  dbg(f, "kay head", kh.x, kh.y, kh.r, "mouth", m.x, m.y, "reach", K.qa.reach, A.qa.reach);
  const ov = frag(
    rewind(f),
    h(PullCounter, { n: 1, at: T.field, out: T.countOut1, x: 540, y: 250, scale: 0.7, frame: f }),
    f < T.back ? h(Mark, { kind: "!", at: T.bro, out: T.forgot - 2, x: kh.x + kh.r + 70, y: kh.y - kh.r * 0.5, size: 190, frame: f }) : null,
    f < T.back ? h(Burst, { at: T.forgot, x: m.x, y: m.y, r: 105, n: 10, frame: f }) : null,
    ...pats.map((q, i) => { const c = w.project(q.at); return (f < T.back) === (q.c < T.back) ? h(Burst, { key: i, at: q.c, x: c.x, y: c.y, r: f < T.back ? 70 : 44, n: 7, color: "#ffffff", frame: f }) : null; }),
  );
  return { camera: cam, season: 0, focus: [-17.6, 1.0], overlays: ov, post: { dof: { focus: f >= T.pat + 4 && f < T.back ? 2.9 : 3.9, amount: 3 } } };
}

/** the Rewind overlay (f1905-1912): the timecode runs back from 63.5 s (now) to about 27 s (the first pull) */
const rewind = (f: number) => h(Rewind, { at: T.rewind, dur: T.field + 5 - T.rewind, tcFrom: T.rewind / FPS, speed: 135, frame: f });
/** f1905-1907: the film runs backwards: one frame each of the shots before (六次, the kneeling, the lords), under the Rewind */
const REWOUND = [1869, 1826, 1792];

export const SEG: Segment = {
  id: "E", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w, f) {
    if (f >= T.rewind && f < T.field) { const P = SEG.pose(w, REWOUND[f - T.rewind]); return { ...P, overlays: rewind(f), post: undefined }; }
    if (f < T.him) return shotCommons(w, f);
    if (f < T.lords) return shotHim(w, f);
    if (f < T.wide) return shotLords(w, f);
    if (f < T.lordsCut) return shotKneel(w, f);
    if (f < T.close) return shotLordsKneel(w, f);
    if (f < T.cheer) return shotCrown(w, f);
    if (f < T.field) return shotCheer(w, f);
    return shotField(w, f);
  },
};
