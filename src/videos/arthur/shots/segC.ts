// Segment C, frames 843-1264 (lines 10-13): Kay's lie, the test.                                         season 0 (snow)
// THE FIELD
//   843  HARD CUT from B (Arthur ran off with the sword): Kay waits on his mark, Arthur runs in from the right holding
//        the sword out; Kay lunges and has his hand on the grip on f858.
//   859  close on Kay, the sword beside his head: "!" (he knows it); f867 the greedy grin; he spins and RUNS left with
//        the sword up, the camera tracks with him to Ector
//        (who watches the tournament); f889 "爸，石中剑！" (Kay's own line: lip-sync, he hops); Ector turns, surprised.
//   910  "我要当国王了！": Kay alone: a crown icon pops over his own head (f915), he preens.
//   935  Ector alone: one long flat look; f944 爸爸让他发誓: he leans in and points; f960 Kay alone: nervous, the crown wobbles, on 发誓 his free hand
//        goes up; f977 凯才承认: he deflates, the sword sinks, the crown tips over and drops; f997 he points off right.
//  1002  是弟弟拿的: HARD CUT to Arthur at the mark where he was left, cheering the tournament, name tag 弟弟; he
//        notices us and waves.  1014 Ector: shock ("!?").
// THE YARD (cameras: either wide enough to hold the stone's gold letters above the caption, or close enough to leave
// the stone's front face out of the frame: stoneCam / the close cameras below)
//  1027  爸爸让亚瑟插回去: the HOOK again (STAGE.putBack marks): Ector points at the anvil, Arthur brings the sword down
//        and slides it in (home f1066, Burst + kick), Kay sulks.
//  1071  再拔一次: Ector alone: "up, again" (two flicks of the hand).   1082 Arthur alone: "?"; 1093 他说: he turns to
//        us and shrugs; 1104 "这有什么难的。" (Arthur's own line: lip-sync), slow push in.
//  1137  爸爸先拔: Ector heaves (tug), Arthur and Kay watch from behind the stone.  1159 不动: close: still; he lets go,
//        shakes his head; Stamp.
//  1170  凯使出吃奶的劲: Kay heaves, three jump cuts closer and closer, the face goes red (Flush).  1209 不动: wide: his
//        hands fly off and he sails backward off the stone (lands f1215, dazed); Stamp.
//  1219  亚瑟一伸手: close: Arthur hops in from the right (lands f1223) and draws it with one hand, bored, looking at us
//        (f1225-1244).
//  1247  第二次: wide: the counter; Ector, then Kay, sink to their knees; Arthur: "?". Ends there (hard cut to D).
import { Fragment, type ReactNode } from "react";
import * as THREE from "three";
import { SEGMENTS, FPS, h, lin, smooth, clamp01, lerp, spl, easeOutCubic, easeInCubic, easeInOutCubic, easeOutBack, quote, type Segment, type Pose, type CamPose, type Vec3 } from "../story";
import type { World } from "../world";
import { EN, TXT, STAMP_CW } from "../lang";
import { PEOPLE } from "../people";
import { V, lid, speak, accent, heads, lerpA, walkAlong, hopArc, tug, pullOut, pullOutAfter, raisePoint, offerPoint, offer, kneel, SPOT, STAGE, type Rig, type RigState, type RigHead } from "./common";
import { PullCounter, Mark, Burst, Crown, NameTag, Flush } from "../overlay";
import { Stamp } from "../../group/kit/overlay";

const S = SEGMENTS[2];
const DBG = false;
const dbg = (f: number, ...a: unknown[]) => { if (DBG) console.log(`QA: dbg f${f} ` + a.map((x) => (typeof x === "number" ? x.toFixed(3) : x instanceof THREE.Vector3 ? `[${x.x.toFixed(2)},${x.y.toFixed(2)},${x.z.toFixed(2)}]` : String(x))).join(" ")); };

// ------------------------------------------------------------------------------------------------------ beats (frames)
// captions: 凯拿到剑就找爸爸 845-888 · “爸，【石中剑】！” 889-909 · “我要当【国王】了！” 910-943 · 爸爸让他【发誓】 944-976 ·
// 凯才承认 977-998 · 是【弟弟】拿的 999-1026 · 爸爸让亚瑟【插回去】 1027-1070 · 【再拔一次】 1071-1092 · 他说 1093-1103 ·
// “这有什么难的。” 1104-1136 · 爸爸先拔 1138-1158 · 【不动】 1159-1169 · 凯使出吃奶的劲 1170-1208 · 【不动】 1209-1218 ·
// 亚瑟一伸手 1219-1246 · 【第二次】 1247-1263
const T = {
  // the field
  see: 850, lunge: 853, give: 858, cu: 859,
  grin: 867, run: 869, dad: 889,
  king: 910, crown: 915, look: 935,
  swear: 944, kay: 960, oath: 965, admit: 977, crownOut: 980, point: 996,
  bro: 1002, notice: 1006, shock: 1014,
  // the yard
  yard: 1027, down: 1037, slot: 1053, home: 1066,
  again: 1071, what: 1082, says: 1093, line: 1104,
  ector: 1137, still: 1159, letGo: 1162,
  kayTug: 1170, kayTug2: 1183, kayTug3: 1196, off: 1209, land: 1215,
  arthur: 1219, hop: 1218, landA: 1223, pull0: 1225, pull1: 1244,
  count: 1247, kneelE: 1249, kneelK: 1253, mark: 1256,
};
const KQ = quote("kay"), AQ = quote("arthur");

// ------------------------------------------------------------------------------------------------------------ helpers
type St = Partial<RigState>;
type Ex = NonNullable<RigState["expr"]>;
const c3 = (pos: Vec3, look: Vec3, fov: number): CamPose => ({ pos, look, fov });
const frag = (...kids: ReactNode[]) => h(Fragment, null, ...kids);
/** keyframes [frame, value] with a smooth ease inside each interval (no overshoot) */
const ky = (f: number, keys: [number, number][]) => {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 0; i + 1 < keys.length; i++) if (f <= keys[i + 1][0]) return lerp(keys[i][1], keys[i + 1][1], smooth((f - keys[i][0]) / (keys[i + 1][0] - keys[i][0])));
  return keys[keys.length - 1][1];
};
const kv = (f: number, keys: [number, Vec3][]): Vec3 => [0, 1, 2].map((k) => ky(f, keys.map(([a, v]) => [a, v[k]] as [number, number]))) as Vec3;
/** the value of the last key at or before f */
const at = <X,>(f: number, keys: [number, X][]): X => { let e = keys[0][1]; for (const [k, x] of keys) if (f >= k) e = x; return e; };
/** a small hop: 0 .. hgt .. 0 over `dur` frames from `from` */
const hop = (f: number, from: number, dur = 6, hgt = 0.06) => { const k = (f - from) / dur; return k <= 0 || k >= 1 ? 0 : hgt * 4 * k * (1 - k); };
/** a camera kick on an impact: a few cm for 3 frames */
const kick = (f: number, on: number, amp = 0.03) => (f === on ? amp : f === on + 1 ? -0.5 * amp : f === on + 2 ? 0.2 * amp : 0);
/** head centre and radius on screen */
const headPx = (w: World, r: Rig) => { const c = r.headWorld(), p = w.project(c), q = w.project(c.clone().add(V(0, 0.24, 0))); return { x: p.x, y: p.y, r: Math.abs(p.y - q.y) }; };
const add = (p: THREE.Vector3, x: number, y: number, z: number) => p.clone().add(V(x, y, z));
const mix = (a: THREE.Vector3, b: THREE.Vector3, k: number) => a.clone().lerp(b, k);

/** A camera at `pos` that looks toward the floor point (tx, tz), pitched so that the middle of the stone's gold
 *  inscription (0, 0.18, 0.5) sits at `frac` of the frame height: above the caption band. */
function stoneCam(pos: Vec3, tx: number, tz: number, fov: number, frac = 0.575): CamPose {
  const want = (0.5 - frac) * 2 * Math.tan((fov * Math.PI) / 360);
  const P = V(0, 0.18, 0.5).sub(V(pos[0], pos[1], pos[2]));
  const g = (ly: number) => {
    const fw = V(tx - pos[0], ly - pos[1], tz - pos[2]).normalize(), rt = V().crossVectors(fw, V(0, 1, 0)).normalize(), up = V().crossVectors(rt, fw);
    return P.dot(up) / P.dot(fw) - want;
  };
  let lo = -4, hi = 4;                                              // g falls as the look point rises
  for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (g(m) > 0) lo = m; else hi = m; }
  return { pos, look: [tx, (lo + hi) / 2, tz], fov };
}
/** where the stone's inscription is in the frame (fraction of the height): must be < 0.6 or > 1 */
const insc = (w: World) => w.project(V(0, 0.18, 0.5)).y / 1920;

// ------------------------------------------------------------------------------------------------------------ the field
const F = STAGE.field;
const A_RUN: Vec3[] = [[-16.06, 0, 2.78], [-17.26, 0, 2.72]];
/** where Arthur stops to hand the sword over (a step short of his mark: the arms are short) */
const A_GIVE = V(-17.26, 0, 2.72);
const K_MARK = F.kay.at.clone();
/** Kay's lunge for the sword */
const K_GRAB = V(-17.89, 0, 2.76);
/** Ector's place, Kay's stop in front of him, Kay's step back when the finger comes */
const E_AT = V(-21.35, 0, 2.9), K_STOP = V(-20.42, 0, 2.85), K_BACK = V(-20.18, 0, 2.85), E_LEAN = V(-21.25, 0, 2.9);
const RUN_V = 4.0;

/** the tournament crowd behind the fence (as in B and E) */
function fieldCrowd(w: World, f: number) {
  const t = f / FPS;
  w.set.anchors.fieldCrowd.forEach((q, k) => w.actor(PEOPLE.commoner(k)).set({ at: q, facing: 0, pose: { kind: "cheer", t: t + k * 0.21, amount: 1 }, expr: "happy", blink: lid(t, 20 + k), visible: true }));
}
/** Kay's hops on the syllables of his line */
const kayHop = (f: number) => hop(f, 889, 6, 0.07) + hop(f, 896, 6, 0.05) + hop(f, 903, 6, 0.07) + hop(f, 926, 6, 0.05) + hop(f, 932, 6, 0.05);

/** 843-858: Arthur brings the sword, Kay grabs it */
function shotGive(w: World, f: number): Pose {
  const t = f / FPS, K = w.actor(PEOPLE.kay), A = w.actor(PEOPLE.arthur);
  const p = smooth(lin(f, S.from, T.give));
  const cam = c3([-17.66 + 0.08 * p, 1.35, 6.1 - 0.25 * p], [-17.7 + 0.08 * p, 1.02 + 0.03 * p, 2.65], 40);
  w.setCamera(cam);
  fieldCrowd(w, f);
  // Arthur: runs in with the sword held out in front of him, stops, beams
  const leg = walkAlong(A_RUN, 3.4, (f - 842) / FPS, { endFacing: -0.9 });
  A.set({
    at: leg.at, facing: leg.facing, pose: leg.pose, hands: [offerPoint(leg.at, -1), null],
    expr: "happy", blink: lid(t, 1), gaze: -1, head: heads(accent("pop", f, 853)), visible: true,
  });
  // Kay: bored on his mark, sees it, lunges, closes his hand on the grip
  const lunge = smooth(lin(f, T.lunge, T.give - 1));
  const kAt = mix(K_MARK, K_GRAB, lunge);
  kAt.y = hop(f, T.lunge, 5, 0.04);
  const grab = offerPoint(A_GIVE, -1);
  K.set({
    at: kAt, facing: lerp(0.55, 1.4, lunge), pose: { kind: "idle", t }, hands: [f >= T.lunge ? mix(add(kAt, 0.16, 0.74, 0.2), grab, lunge) : null, null],
    expr: at<Ex>(f, [[0, "huff"], [T.see, "shock"]]), blink: f >= T.see ? 0 : lid(t, 2), gaze: 1,
    head: heads(accent("jolt", f, T.see)), visible: true,
  });
  w.update();
  offer(w, A, 0, -1, 0.05);
  w.stone.setShine(0.25);
  return { camera: cam, season: 0 };
}

/** Kay's sword hand, the sword up beside his head: in the close-up (he faces us), on the run (he faces -x: the arm is
 *  his far one, so the hand goes out ahead of the face) and standing in front of Ector (turned a little left) */
const RAISE_CU = V(-0.34, 1.25, 0.08), RAISE_RUN = V(-0.37, 1.05, -0.05), RAISE_STOP = V(-0.36, 1.2, 0.06);
const kayRaise = (p: THREE.Vector3, run: number, pump = 0, cu = false) => p.clone().add(mix(cu ? RAISE_CU : RAISE_STOP, RAISE_RUN, run)).add(V(0, 0.03 * pump, 0));
/** Ector in the field: at, facing and the rest */
function ectorField(w: World, f: number, extra: St = {}) {
  const t = f / FPS, E = w.actor(PEOPLE.ector);
  E.set({
    at: E_AT.clone(), facing: lerpA(-Math.PI / 2, 0.85, smooth(lin(f, 886, 894))), pose: { kind: "idle", t },
    expr: at<Ex>(f, [[0, "smile"], [T.dad, "shock"], [901, "neutral"], [T.king, "deadpan"], [929, "stern"]]),
    gaze: f < 886 ? -1 : 1, blink: lid(t, 3, [T.king / FPS, 929 / FPS]), head: heads(accent("jolt", f, T.dad), accent("nod", f, 929, { amp: 0.7 })), visible: true, ...extra,
  });
  return E;
}
/** 859-909: he has it: "!"; the grin; the run to Ector; "爸，石中剑！" */
function shotRun(w: World, f: number): Pose {
  const t = f / FPS, K = w.actor(PEOPLE.kay), A = w.actor(PEOPLE.arthur);
  const pos = kv(f, [[T.cu, [-17.98, 1.38, 5.35]], [T.run + 1, [-18.04, 1.38, 5.2]], [879, [-19.45, 1.4, 6.6]], [888, [-20.8, 1.42, 7.05]], [909, [-20.82, 1.4, 6.8]]]);
  const look = kv(f, [[T.cu, [-18.0, 1.2, 2.8]], [T.run + 1, [-18.06, 1.2, 2.8]], [879, [-19.52, 1.05, 2.8]], [888, [-20.87, 0.74, 2.87]], [909, [-20.87, 0.76, 2.87]]]);
  const cam = c3(pos, look, 40);
  w.setCamera(cam);
  fieldCrowd(w, f);
  const leg = walkAlong([K_GRAB, K_STOP], RUN_V, (f - T.run) / FPS, { startFacing: 0.12, endFacing: -0.6 });
  const run = leg.moving ? 1 : leg.arrived ? 1 - smooth(lin(f, 888, 891)) : smooth(lin(f, T.run - 1, T.run + 1));
  const kAt = leg.at.clone(); kAt.y = kayHop(f);
  const pump = Math.max(hop(f, 889, 6, 1), hop(f, 896, 6, 0.7), hop(f, 903, 6, 1));
  const settle = easeOutBack(lin(f, T.cu - 1, T.cu + 3), 1.6);                      // the snatch: the sword arrives beside his head
  K.set({
    at: kAt, facing: leg.arrived ? leg.facing : leg.moving ? lerpA(-0.5, leg.facing, smooth(lin(f, T.run, T.run + 4))) : lerpA(lerp(0.4, 0.12, settle), -0.5, smooth(lin(f, T.run - 2, T.run))), pose: leg.moving ? leg.pose : leg.arrived ? { kind: "cheer", t, amount: 0 } : { kind: "idle", t },
    hands: [mix(add(kAt, -0.28, 1.02, 0.14), kayRaise(kAt, run, pump, f < 880), settle), null],
    expr: at<Ex>(f, [[0, "shock"], [T.grin, "grin"], [T.run + 1, "laugh"], [887, "grin"]]),
    blink: f < T.grin ? 0 : lid(t, 2, [T.grin / FPS]), gaze: -1, head: heads(accent("jolt", f, T.cu), accent("pop", f, T.grin), accent("squash", f, 888)),
    ...speak(KQ, f, 2, [0, 3]), visible: true,
  });
  ectorField(w, f);
  // Arthur, left behind: waves after him
  A.set({ at: A_GIVE.clone(), facing: -0.5, pose: f < T.run ? { kind: "idle", t } : { kind: "wave", t, arm: 0 }, expr: "happy", blink: lid(t, 1), gaze: -1, visible: true });
  w.update();
  w.stone.setFree(K.handWorld(0), V(0.27, -1, 0));
  w.stone.setShine(f < T.grin ? 0.5 + 0.5 * Math.sin((f - T.cu) * 0.9) : 0.35 + 0.3 * Math.sin(f * 0.5));
  const kh = headPx(w, K), tip = w.project(w.stone.tip());
  dbg(f, "kay head", kh.x, kh.y, kh.r);
  const ov = frag(
    h(Mark, { kind: "!", at: T.cu, out: T.run - 2, x: kh.x + kh.r * 0.75, y: kh.y - kh.r - 70, size: 190, frame: f }),
    h(Burst, { at: T.cu, x: tip.x, y: tip.y + 90, r: 120, frame: f }),
  );
  return { camera: cam, season: 0, overlays: ov };
}

/** the crown over Kay's own head: pops on f915, wobbles when the oath comes, tips over and drops on 承认 */
function kayCrown(w: World, K: Rig, f: number): ReactNode {
  if (f < T.crown) return null;
  const kh = headPx(w, K);
  const wob = f >= T.swear ? 1 : 0, fall = easeInCubic(lin(f, T.admit, T.admit + 9));
  const bobY = 10 * Math.sin((f - T.crown) * 0.35);
  return h(Crown, {
    at: T.crown, out: T.crownOut, x: kh.x + wob * 9 * Math.sin(f * 1.3) + 60 * fall, y: kh.y - kh.r * 1.05 - 95 + bobY + 260 * fall,
    size: Math.max(150, kh.r * 1.25), rot: -6 + wob * 11 * Math.sin(f * 0.9) + 70 * fall, frame: f,
  });
}
/** 910-934: "我要当国王了！": Kay alone, the crown over his own head */
function shotKing(w: World, f: number): Pose {
  const t = f / FPS, K = w.actor(PEOPLE.kay), p = lin(f, T.king, T.look);
  const cam = c3([-20.46, 1.36, 5.65 - 0.22 * p], [-20.5, 1.13 + 0.02 * p, 2.85], 40);
  w.setCamera(cam);
  fieldCrowd(w, f);
  const kAt = K_STOP.clone(); kAt.y = kayHop(f);
  const me = smooth(lin(f, 910, 914)) * (1 - smooth(lin(f, 921, 925)));          // the free hand: a thumb at his own chest
  K.set({
    at: kAt, facing: lerp(-0.6, -0.2, smooth(lin(f, T.king, 918))), pose: { kind: "idle", t },
    hands: [kayRaise(kAt, 0, Math.max(hop(f, 926, 6, 1), hop(f, 932, 6, 1))), me > 0.02 ? mix(add(kAt, 0.24, 0.7, 0.1), add(kAt, 0.13, 0.93, 0.2), me) : null],
    expr: at<Ex>(f, [[0, "grin"], [T.crown + 3, "smug"]]), blink: f >= 919 && f < 930 ? 1 : lid(t, 2), gaze: f < 919 ? -1 : 0,
    head: heads(accent("pop", f, T.crown), f >= 919 ? { tilt: 5 * smooth(lin(f, 919, 923)), dy: 0.06 * smooth(lin(f, 919, 923)) } : undefined),
    ...speak(KQ, f, 2, [0, 3, 7]), visible: true,
  });
  ectorField(w, f);
  w.update();
  w.stone.setFree(K.handWorld(0), V(0.27, -1, 0));
  w.stone.setShine(0.35 + 0.3 * Math.sin(f * 0.5));
  return { camera: cam, season: 0, overlays: frag(kayCrown(w, K, f)) };
}

/** Kay from the oath to the admission (944-1001): at, the sword hand, the free hand, the face */
function kayOath(w: World, f: number) {
  const t = f / FPS, K = w.actor(PEOPLE.kay);
  const kAt = mix(K_STOP, K_BACK, easeOutCubic(lin(f, T.swear, T.swear + 5)));
  kAt.y = hop(f, T.swear, 5, 0.05);
  const sink = easeInOutCubic(lin(f, T.admit, T.admit + 10));
  const tremble = f >= T.swear && f < T.admit ? 0.006 * Math.sin(f * 2.4) : 0;
  const sword = add(kAt, -0.36 + tremble, lerp(1.2, 0.76, sink), 0.06);
  const up = smooth(lin(f, T.oath, T.oath + 4)) * (1 - smooth(lin(f, T.admit, T.admit + 6))), pt = f >= T.point;
  const free = pt ? mix(add(kAt, 0.3, 0.72, 0.1), add(kAt, 0.46, 0.9, 0.12), easeOutBack(lin(f, T.point, T.point + 4), 1.3)) : up > 0.02 ? mix(add(kAt, 0.3, 0.72, 0.1), add(kAt, 0.37, 1.24, 0.1), up) : null;
  K.set({
    at: kAt, facing: lerp(-0.25, 0, sink), pose: { kind: "idle", t }, hands: [sword, free],
    expr: at<Ex>(f, [[0, "nervous"], [T.admit, "sad"], [T.admit + 12, "sigh"], [T.point, "sad"]]),
    blink: f >= T.admit + 3 && f < T.admit + 12 ? 1 : lid(t, 2), gaze: f < T.admit ? at(f, [[0, -1], [952, 1], [T.kay, -1], [969, 1], [973, 0]]) : pt ? 1 : 0,
    lookDown: 14 * sink * (pt ? 0.4 : 1),
    head: heads(accent("jolt", f, T.swear), accent("squash", f, T.admit), sink > 0 ? { dy: -0.12 * sink * (1 - 0.8 * smooth(lin(f, T.point - 3, T.point + 2))) } : undefined, accent("nod", f, T.point + 1, { amp: 0.5 })), visible: true,
  });
  return { K, lean: lerp(0.27, 0.4, sink) };
}
/** 935-959: Ector alone: the long flat look (Kay is still talking); 944 爸爸让他发誓: he leans in and points */
function shotSwear(w: World, f: number): Pose {
  const t = f / FPS, E = w.actor(PEOPLE.ector), p = lin(f, T.look, T.kay);
  const cam = c3([-21.3, 1.34, 5.1 - 0.22 * p], [-21.4 + 0.05 * p, 1.04, 2.9], 40);
  w.setCamera(cam);
  fieldCrowd(w, f);
  const { K, lean } = kayOath(w, f);
  const go = f >= T.swear;
  const eAt = mix(E_AT, E_LEAN, easeOutCubic(lin(f, T.swear, T.swear + 6)));
  E.set({
    at: eAt, facing: 0.85, pose: go ? { kind: "point", t, arm: 1 } : { kind: "idle", t }, hands: [null, go ? add(K_BACK, 0, 0.98, 0.05) : null],
    expr: go ? "stern" : "deadpan", gaze: 1, blink: f >= 938 && f < 941 ? 1 : 0,
    head: heads(accent("pop", f, T.swear), accent("nod", f, 950), accent("nod", f, 956), go ? { dy: -0.04 } : { tilt: -3 * smooth(lin(f, T.look, 940)) }), visible: true,
  });
  w.update();
  w.stone.setFree(K.handWorld(0), V(lean, -1, 0));
  return { camera: cam, season: 0 };
}
/** 960-1001: Kay swears, admits, points */
function shotAdmit(w: World, f: number): Pose {
  const t = f / FPS, E = w.actor(PEOPLE.ector), p = lin(f, T.kay, 1001);
  const cam = c3([-20.2 + 0.03 * p, 1.36, 5.7 - 0.25 * p], [-20.24 + 0.04 * p, 1.12, 2.85], 40);
  w.setCamera(cam);
  fieldCrowd(w, f);
  const { K, lean } = kayOath(w, f);
  E.set({ at: E_LEAN.clone(), facing: 0.85, pose: { kind: "idle", t }, expr: "stern", gaze: 1, blink: lid(t, 3), visible: true });
  w.update();
  w.stone.setFree(K.handWorld(0), V(lean, -1, 0));
  const kh = headPx(w, K);
  dbg(f, "kay head", kh.x, kh.y, kh.r);
  return { camera: cam, season: 0, overlays: frag(kayCrown(w, K, f)) };
}
/** 1002-1013: 是弟弟拿的: Arthur, cheering the tournament */
function shotBrother(w: World, f: number): Pose {
  const t = f / FPS, A = w.actor(PEOPLE.arthur), p = lin(f, T.bro, 1013);
  const cam = c3([-17.0, 1.38, 5.3 - 0.2 * p], [-17.06, 1.0, 2.75], 40);
  w.setCamera(cam);
  fieldCrowd(w, f);
  const seen = f >= T.notice;
  A.set({
    at: F.arthur.at.clone(), facing: lerpA(0.3, -0.25, smooth(lin(f, T.notice - 1, T.notice + 3))), pose: seen ? { kind: "wave", t, arm: 0 } : { kind: "cheer", t: t * 1.4, amount: 1 },
    expr: seen ? "smile" : "laugh", gaze: seen ? -1 : 1, blink: lid(t, 1, [T.notice / FPS]), head: heads(accent("pop", f, T.notice), accent("lean", f, T.notice + 2, { dur: 0.4, dir: -1 })), visible: true,
  });
  w.update();
  const ah = headPx(w, A);
  dbg(f, "arthur head", ah.x, ah.y, ah.r);
  return { camera: cam, season: 0, overlays: frag(h(NameTag, { at: T.bro, x: EN ? Math.min(Math.max(ah.x, 380), 700) : ah.x, y: ah.y - ah.r - 105, text: TXT.bro, size: EN ? 70 : 84, frame: f })) };
}
/** 1014-1026: Ector's shock */
function shotShock(w: World, f: number): Pose {
  const t = f / FPS, E = w.actor(PEOPLE.ector), p = lin(f, T.shock, 1026);
  const cam = c3([-21.16, 1.3 + kick(f, T.shock + 1, 0.025), 5.25 - 0.3 * p], [-21.27, 1.13, 2.9], 40);
  w.setCamera(cam);
  fieldCrowd(w, f);
  E.set({
    at: E_LEAN.clone(), facing: lerp(0.85, 0.3, smooth(lin(f, 1020, 1024))), pose: { kind: "idle", t }, expr: "shock", gaze: at(f, [[0, 1], [1021, 0]]), blink: 0,
    head: heads(accent("jolt", f, T.shock), accent("shake", f, 1019, { amp: 0.6 })), visible: true,
  });
  w.update();
  const eh = headPx(w, E);
  dbg(f, "ector head", eh.x, eh.y, eh.r);
  return { camera: cam, season: 0, overlays: frag(h(Mark, { kind: "!?", at: T.shock + 1, x: eh.x + eh.r * 0.55, y: eh.y - eh.r - 95, size: 160, frame: f })) };
}

// ------------------------------------------------------------------------------------------------------------- the yard
/** the watchers' marks behind the stone (STAGE.putBack's, a hand's breadth wider) */
const L_AT = STAGE.putBack.ector.at.clone(), R_AT = STAGE.putBack.kay.at.clone(), L_FACE = 0.35, R_FACE = -0.3;
/** while Ector tries: the brothers both stand left of the stone (the close shots then look past them) */
const LA_AT = V(-0.6, 0, -1.1), LB_AT = V(-1.12, 0, -0.5);
/** Arthur waits his turn in front of the stone's right end (out of the narrow frame) */
const WAIT_AT = V(1.65, 0, 0.35);
const SLOT = V(0, 0.57, 0);
/** Arthur's jump onto the stone starts here (just outside the wide shot before it) */
const HOP_FROM = V(1.36, 0, 0.25);

/** 1027-1070: the hook again: Arthur slides the sword back in */
function shotPutBack(w: World, f: number): Pose {
  const t = f / FPS, A = w.actor(PEOPLE.arthur), E = w.actor(PEOPLE.ector), K = w.actor(PEOPLE.kay), P = STAGE.putBack;
  const p = easeInOutCubic(lin(f, T.yard + 2, T.slot));
  const cam = stoneCam([0.06, 1.5 - 0.06 * p + kick(f, T.home), 5.95 - 0.5 * p], 0.03, 0, 40);
  w.setCamera(cam);
  const u = f < T.down ? 1 : f < T.slot ? lerp(1, 0.55, easeInOutCubic(lin(f, T.down, T.slot - 1))) : 0.55 * (1 - easeInCubic(lin(f, T.slot - 1, T.home)));
  const done = f > T.home + 1;
  if (!done) pullOut(w, A, u, { t, extra: { expr: at<Ex>(f, [[0, "neutral"], [T.down, "smile"], [T.slot, "focus"]]), gaze: f < T.down ? -1 : 0, blink: lid(t, 1), head: heads(accent("nod", f, T.down - 3, { amp: 0.4 }), accent("squash", f, T.home)) } });
  else A.set({ at: SPOT.drawR.clone(), facing: -Math.PI / 2, pose: { kind: "idle", t }, expr: "smile", gaze: -1, blink: lid(t, 1), visible: true });
  E.set({
    at: P.ector.at.clone(), facing: P.ector.facing, pose: { kind: "point", t, arm: 1 }, hands: [null, add(SLOT, 0, 0.05 - 0.1 * hop(f, 1053, 8, 1), 0)], expr: "stern", gaze: 1, blink: lid(t, 3),
    head: heads(accent("nod", f, T.yard + 1), accent("nod", f, 1054)), visible: true,
  });
  K.set({
    at: P.kay.at.clone(), facing: P.kay.facing, pose: { kind: "idle", t }, expr: at<Ex>(f, [[0, "huff"], [1050, "sad"]]), gaze: at(f, [[0, 1], [1046, -1], [1062, 1]]), lookDown: 8, blink: lid(t, 2),
    head: heads(accent("shake", f, 1034, { amp: 0.5 }), { dy: -0.05 }), visible: true,
  });
  w.update();
  if (!done) pullOutAfter(w, A, u);
  w.stone.setShine(0.3 * u);
  const s = w.project(SLOT);
  dbg(f, "insc", insc(w), "tip", w.project(w.stone.tip()).y / 1920);
  return { camera: cam, season: 0, overlays: frag(h(Burst, { at: T.home, x: s.x, y: s.y, r: 130, frame: f })) };
}
/** 1071-1081: 再拔一次: Ector: "up, again" */
function shotAgain(w: World, f: number): Pose {
  const t = f / FPS, E = w.actor(PEOPLE.ector), A = w.actor(PEOPLE.arthur), K = w.actor(PEOPLE.kay), P = STAGE.putBack, p = lin(f, T.again, T.what);
  const cam = c3([-0.74, 1.34, 1.65 - 0.12 * p], [-0.84, 0.98, -0.95], 40);
  w.setCamera(cam);
  const eAt = P.ector.at.clone();
  const flick = ky(f, [[T.again - 2, 0], [T.again + 3, 1], [T.again + 5, 0.25], [T.again + 8, 1], [T.again + 12, 0.8]]);
  E.set({
    at: eAt, facing: P.ector.facing, pose: { kind: "idle", t }, hands: [null, mix(add(eAt, 0.3, 0.84, 0.22), add(eAt, 0.37, 1.22, 0.14), flick)], expr: "stern", gaze: 1, blink: lid(t, 3),
    head: heads(accent("nod", f, T.again + 2), accent("nod", f, T.again + 7)), visible: true,
  });
  A.set({ at: SPOT.drawR.clone(), facing: -Math.PI / 2, pose: { kind: "idle", t }, expr: "neutral", gaze: -1, blink: lid(t, 1), visible: true });
  K.set({ at: P.kay.at.clone(), facing: P.kay.facing, pose: { kind: "idle", t }, expr: "sad", gaze: 1, blink: lid(t, 2), visible: true });
  w.update();
  dbg(f, "insc", insc(w));
  return { camera: cam, season: 0 };
}
/** 1082-1136: Arthur: "?", the shrug, "这有什么难的。" */
function shotEasy(w: World, f: number): Pose {
  const t = f / FPS, A = w.actor(PEOPLE.arthur), p = smooth(lin(f, T.what, 1136));
  const cam = c3([0.26, 1.6 - 0.02 * p, 2.3 - 0.2 * p], [0.13, 1.13 + 0.03 * p, 0], 40);
  w.setCamera(cam);
  const aAt = SPOT.drawR.clone();
  aAt.y += hop(f, T.says + 3, 5, 0.03);
  const sh = easeOutBack(lin(f, T.says + 2, T.says + 8), 1.4) * (1 - smooth(lin(f, 1128, 1134)));
  const bob = 0.02 * Math.sin((f - T.line) * 0.55) * (f >= T.line ? 1 : 0);
  const hands: [THREE.Vector3 | null, THREE.Vector3 | null] = sh > 0.02
    ? [mix(add(aAt, -0.22, 0.68, 0.06), add(aAt, -0.33, 0.83 + bob, 0.15), sh), mix(add(aAt, 0.22, 0.68, 0.06), add(aAt, 0.33, 0.83 + bob, 0.15), sh)] : [null, null];
  A.set({
    at: aAt, facing: lerpA(-Math.PI / 2, -0.12, smooth(lin(f, T.says, T.says + 7))), pose: { kind: "idle", t }, hands,
    expr: at<Ex>(f, [[0, "neutral"], [T.says + 3, "smile"]]), gaze: f < T.says + 2 ? -1 : 0, blink: lid(t, 1, [(T.says + 3) / FPS]),
    head: heads(accent("lean", f, T.what + 1, { dur: 0.3, dir: -1 }), accent("squash", f, T.says + 4), f >= T.says + 4 && f < T.line ? { tilt: 4 } : undefined),
    ...speak(AQ, f, 1, [4]), visible: true,
  });
  // (Ector and Kay stand just outside this frame, left and right behind the stone: not drawn, or a sliver of a head
  //  would sit on each edge)
  w.update();
  const ah = headPx(w, A);
  dbg(f, "insc", insc(w), "top", w.project(V(0, 0.36, 0.5)).y / 1920, "head", ah.x, ah.y, ah.r);
  return { camera: cam, season: 0, overlays: frag(h(Mark, { kind: "?", at: T.what + 1, out: T.says, x: ah.x + ah.r * 0.75, y: ah.y - ah.r - 20, size: 170, frame: f })) };
}
/** 1137-1158: 爸爸先拔: Ector heaves, the brothers watch */
function shotEctorTug(w: World, f: number): Pose {
  const t = f / FPS, A = w.actor(PEOPLE.arthur), E = w.actor(PEOPLE.ector), K = w.actor(PEOPLE.kay), p = lin(f, T.ector, T.still);
  const cam = stoneCam([-0.34 + 0.06 * p, 1.42, 5.05 - 0.15 * p], -0.3, 0, 40);
  w.setCamera(cam);
  const tt = (f - T.ector + 4) / FPS;
  tug(w, E, { side: "R", t: tt, effort: 0.75, extra: { expr: at<Ex>(f, [[0, "focus"], [1144, "huff"], [1151, "pained"]]), blink: f >= 1151 ? 0 : lid(t, 3), head: { dx: 0.007 * Math.sin(f * 2.6) } } });
  A.set({ at: LA_AT.clone(), facing: 0.3, pose: { kind: "idle", t }, expr: "neutral", gaze: 1, blink: lid(t, 1), head: heads(accent("lean", f, 1146, { dur: 0.4, dir: 1 })), visible: true });
  K.set({ at: LB_AT.clone(), facing: 0.7, pose: { kind: "idle", t }, expr: at<Ex>(f, [[0, "stern"], [1150, "smug"]]), gaze: 1, blink: lid(t, 2), head: heads(accent("nod", f, 1150)), visible: true });
  w.update();
  dbg(f, "insc", insc(w), "ector head", w.project(E.headWorld()).x, w.project(E.headWorld()).y, "kay head", w.project(K.headWorld()).x);
  return { camera: cam, season: 0 };
}
/** 1159-1169: 不动: close on the hilt: still. He lets go and shakes his head. */
function shotStill(w: World, f: number): Pose {
  const t = f / FPS, E = w.actor(PEOPLE.ector), A = w.actor(PEOPLE.arthur), K = w.actor(PEOPLE.kay), p = lin(f, T.still, T.kayTug);
  const cam = c3([-0.42, 1.5, 2.5 - 0.12 * p], [0.18, 1.14, -0.05], 40);
  w.setCamera(cam);
  const tt = (f - T.ector + 4) / FPS;
  if (f < T.letGo) tug(w, E, { side: "R", t: tt, effort: 0.75, extra: { expr: "pained", blink: 0, head: { dx: 0.007 * Math.sin(f * 2.6) } } });
  else {
    const k = easeOutCubic(lin(f, T.letGo, T.letGo + 4));
    E.set({
      at: add(SPOT.tugR, 0.3 * k, 0, 0), facing: -Math.PI / 2, pose: { kind: "idle", t }, expr: at<Ex>(f, [[0, "dazed"], [T.letGo + 4, "sigh"]]), gaze: -1, blink: lid(t, 3),
      head: heads(accent("shake", f, T.letGo + 2), accent("squash", f, T.letGo)), visible: true,
    });
  }
  A.set({ at: LA_AT.clone(), facing: 0.3, pose: { kind: "idle", t }, expr: "neutral", gaze: 1, blink: lid(t, 1), visible: true });
  K.set({ at: LB_AT.clone(), facing: 0.7, pose: { kind: "idle", t }, expr: "smug", gaze: 1, blink: lid(t, 2), visible: true });
  w.update();
  dbg(f, "insc", insc(w), "top", w.project(V(0, 0.36, 0.5)).y / 1920);
  return { camera: cam, season: 0, overlays: frag(h(Stamp, { at: T.still, x: EN ? 335 : 225, y: 290, text: TXT.stuck, rot: -9, size: 104, cw: STAMP_CW, frame: f })) };
}
/** 1170-1208: 凯使出吃奶的劲: three jump cuts, closer and closer */
function shotKayTug(w: World, f: number): Pose {
  const t = f / FPS, K = w.actor(PEOPLE.kay), A = w.actor(PEOPLE.arthur), E = w.actor(PEOPLE.ector);
  const n = f < T.kayTug2 ? 0 : f < T.kayTug3 ? 1 : 2, f0 = [T.kayTug, T.kayTug2, T.kayTug3][n], p = lin(f, f0, f0 + 13);
  const cam = n === 0 ? c3([-0.28, 1.5, 2.7 - 0.15 * p], [0.2, 1.17, -0.05], 40)
    : n === 1 ? c3([-0.3, 1.5, 2.25 - 0.12 * p], [0.24, 1.16, -0.05], 40)
      : c3([-0.2, 1.5, 1.95 - 0.1 * p], [0.28, 1.12, -0.05], 40);
  w.setCamera(cam);
  const tt = (f - T.kayTug + 5) / FPS, strain = lin(f, T.kayTug, T.off - 4);
  tug(w, K, {
    side: "R", t: tt, effort: 0.85 + 0.15 * strain,
    extra: { expr: at<Ex>(f, [[0, "huff"], [T.kayTug2, "pained"], [T.kayTug3, "wince"]]), blink: 0, head: { dx: (0.006 + 0.006 * strain) * Math.sin(f * 2.9), squash: 0.05 * strain } },
  });
  A.set({ at: WAIT_AT.clone(), facing: -0.9, pose: { kind: "idle", t }, expr: "neutral", gaze: -1, blink: lid(t, 1), visible: true });
  E.set({ at: L_AT.clone(), facing: L_FACE, pose: { kind: "idle", t }, expr: "sigh", gaze: 1, blink: lid(t, 3), visible: true });
  w.update();
  const kh = headPx(w, K);
  dbg(f, "insc", insc(w), "top", w.project(V(0, 0.36, 0.5)).y / 1920, "kay head", kh.x, kh.y, kh.r, "grip", w.project(w.stone.grip(0)).y / 1920);
  return { camera: cam, season: 0, overlays: frag(h(Flush, { x: kh.x, y: kh.y, r: kh.r * 1.02, a: 0.25 + 0.75 * strain })) };
}
/** Kay after his try: the flight off the stone, then dazed on the right mark; from f1247 he looks up */
function kayAfter(w: World, f: number, extra: St = {}) {
  const t = f / FPS, K = w.actor(PEOPLE.kay), u = lin(f, T.off, T.land);
  const air = f < T.land;
  const p = air ? hopArc(V(0.22, 0.36, -0.14), R_AT, u, 0.3) : R_AT.clone();
  K.set({
    at: p, facing: lerpA(-Math.PI / 2, R_FACE, smooth(u)), pose: air ? { kind: "cheer", t: t * 2, amount: 1 } : { kind: "idle", t },
    expr: air ? "shock" : "dazed", blink: 0, head: heads(accent("squash", f, T.land), !air && f < T.count ? { tilt: 7 * Math.sin((f - T.land) * 0.7) * Math.max(0.35, 1 - (f - T.land) / 14) } : undefined), visible: true, ...extra,
  });
  return K;
}
/** 1209-1218: 不动: Kay's hands fly off and he sails backward off the stone */
function shotKayOff(w: World, f: number): Pose {
  const t = f / FPS, E = w.actor(PEOPLE.ector);
  const cam = stoneCam([0.07, 1.42 + kick(f, T.land), 5.2 - 0.1 * lin(f, T.off, T.arthur)], 0.05, 0, 40);
  w.setCamera(cam);
  const K = kayAfter(w, f);
  E.set({
    at: L_AT.clone(), facing: L_FACE, pose: { kind: "idle", t }, expr: at<Ex>(f, [[0, "sigh"], [T.off + 2, "shock"], [T.land + 1, "wince"]]), gaze: 1, blink: f > T.land ? 1 : 0,
    head: heads(accent("jolt", f, T.off + 2), accent("squash", f, T.land + 1)), visible: true,
  });
  w.update();
  const feet = w.project(R_AT);
  dbg(f, "insc", insc(w), "kay head", w.project(K.headWorld()).x, w.project(K.headWorld()).y);
  const ov = frag(
    h(Stamp, { at: T.off, x: EN ? 335 : 250, y: 250, text: TXT.stuck, rot: -9, size: 104, cw: STAMP_CW, frame: f }),
    h(Burst, { at: T.land, x: feet.x, y: feet.y - 20, r: 150, n: 9, color: "#ffffff", frame: f }),
  );
  return { camera: cam, season: 0, overlays: ov };
}
/** 1219-1246: 亚瑟一伸手: he hops up and draws it with one hand, bored */
function shotPull(w: World, f: number): Pose {
  const t = f / FPS, A = w.actor(PEOPLE.arthur);
  const u = lin(f, T.pull0, T.pull1), up = easeInOutCubic(lin(f, T.pull0 + 9, T.pull1));
  const inn = 1 - easeOutCubic(lin(f, T.arthur, T.pull0 + 1));                     // the camera catches him coming in from the right
  const cam = c3([0.16 + 0.3 * inn, 1.58 + 0.04 * up, 2.45 + 0.05 * up + 0.07 * inn], [0.06 + 0.3 * inn, 1.12 + 0.38 * up, 0], 40);
  w.setCamera(cam);
  // (Ector and Kay stand just outside this frame, left and right behind the stone: not drawn, or a sliver of a head
  //  would sit on each edge)
  const bored: St = { expr: "deadpan", blink: 0.5, gaze: 0, head: heads(accent("squash", f, T.landA), accent("pop", f, T.pull1 - 1)) };
  if (f < T.pull0) {
    const k = lin(f, T.hop, T.landA), p = hopArc(HOP_FROM, SPOT.drawR, 1 - (1 - k) * (1 - k), 0.26), g = w.stone.grip(0);   // fast in, soft down
    A.set({ at: p, facing: -Math.PI / 2, pose: { kind: "idle", t }, hands: [mix(add(p, -0.14, 0.68, 0.04), g, smooth(lin(f, T.landA - 2, T.pull0))), null], visible: true, ...bored });
  } else pullOut(w, A, u, { t, extra: bored });
  w.update();
  if (f >= T.pull0) pullOutAfter(w, A, u);
  w.stone.setShine(lin(f, T.pull0 + 6, T.pull1));
  const tip = w.project(w.stone.tip());
  dbg(f, "insc", insc(w), "top", w.project(V(0, 0.36, 0.5)).y / 1920, "tip", tip.y / 1920, "grip", w.project(A.handWorld(0)).y / 1920);
  return { camera: cam, season: 0, overlays: frag(h(Burst, { at: T.pull1, x: tip.x, y: tip.y, r: 140, frame: f })) };
}
/** 1247-1264: 第二次: the father and the brother go down on their knees */
function shotSecond(w: World, f: number): Pose {
  const t = f / FPS, A = w.actor(PEOPLE.arthur), E = w.actor(PEOPLE.ector), p = lin(f, T.count, S.to);
  const cam = stoneCam([0.1, 1.5, 5.95 - 0.25 * p], 0.05, 0, 40);
  w.setCamera(cam);
  pullOut(w, A, 1, { t, extra: { expr: at<Ex>(f, [[0, "deadpan"], [T.kneelE + 3, "neutral"], [T.mark, "nervous"]]), blink: f < T.kneelE + 3 ? 0.5 : lid(t, 1), gaze: at(f, [[0, 0], [T.kneelE + 3, -1], [T.kneelK + 4, 1]]), head: heads(accent("jolt", f, T.mark, { amp: 0.6 })) } });
  const kE = easeInOutCubic(lin(f, T.kneelE, T.kneelE + 8)), kK = easeInOutCubic(lin(f, T.kneelK, T.kneelK + 8));
  E.set({ at: L_AT.clone(), facing: L_FACE, pose: { kind: "idle", t }, expr: f < T.kneelE ? "shock" : "relief", gaze: 1, blink: kE > 0.5 ? 1 : 0, visible: true, ...kneel(kE, L_AT), head: { dy: -0.12 * kE } });
  const K = kayAfter(w, f, { expr: f < T.kneelK ? "shock" : "sad", gaze: -1, blink: kK > 0.5 ? 1 : 0, ...kneel(kK, R_AT), head: f < T.kneelK ? heads(accent("jolt", f, T.count + 1)) : { dy: -0.12 * kK } });
  w.update();
  pullOutAfter(w, A, 1);
  w.stone.setShine(0.6 + 0.4 * Math.sin((f - T.count) * 0.5));
  const ah = headPx(w, A);
  dbg(f, "insc", insc(w), "tip", w.project(w.stone.tip()).y / 1920, "arthur head", ah.x, ah.y, ah.r, "kay head", w.project(K.headWorld()).x, w.project(K.headWorld()).y);
  const ov = frag(
    h(PullCounter, { n: 2, at: T.count, x: 842, y: 215, scale: 0.66, frame: f }),
    h(Mark, { kind: "?", at: T.mark, x: ah.x - 5, y: ah.y - ah.r - 85, size: 140, frame: f }),
  );
  return { camera: cam, season: 0, overlays: ov };
}

export const SEG: Segment = {
  id: "C", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w, f) {
    if (f < T.cu) return shotGive(w, f);
    if (f < T.king) return shotRun(w, f);
    if (f < T.look) return shotKing(w, f);
    if (f < T.kay) return shotSwear(w, f);
    if (f < T.bro) return shotAdmit(w, f);
    if (f < T.shock) return shotBrother(w, f);
    if (f < T.yard) return shotShock(w, f);
    if (f < T.again) return shotPutBack(w, f);
    if (f < T.what) return shotAgain(w, f);
    if (f < T.ector) return shotEasy(w, f);
    if (f < T.still) return shotEctorTug(w, f);
    if (f < T.kayTug) return shotStill(w, f);
    if (f < T.off) return shotKayTug(w, f);
    if (f < T.arthur) return shotKayOff(w, f);
    if (f < T.count) return shotPull(w, f);
    return shotSecond(w, f);
  },
};
