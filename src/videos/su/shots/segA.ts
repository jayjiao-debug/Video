// SEGMENT A, lines A01-A05: 清晨, the 惠州 morning market (the hook). WP5 segA. PLAN.md 8A, beats.ts BEAT.A.
// One handheld take in her eyes, no cut until the whip into B:
//   walk     A01 (f0)   already moving: she strides down lane A toward the butcher's stall (the walk bob dies by 1.0 s,
//                       BEAT.A.walk); the title block on top. SU, bamboo hat, beard everywhere, stands at the chopping
//                       block turned toward the butcher, holding the bare SPINE up in both hands like a prize; the
//                       butcher's cleaver thunks down on the block (BEAT.A.cleave); servant 0 carries a bundle of the
//                       good cuts past her left, servant 1 waits at the counter with his; the red mic swings in from the
//                       lower left on 东坡 (BEAT.A.micIn).
//   turn     A01 2nd    您怎么在买骨头: he turns to the lens (BEAT.A.turn), caught and delighted, shows her the spine.
//   lean     A02        conspiratorial: one step in toward her and a lean of the head (smug); the spine goes to his left
//                       hand; 一只羊: a raised hand ("one"); 肉: his eyes flick to the carcass on the rack; 当官的: a nod
//                       and a thumb toward screen left, and her camera pans with it (12 deg) onto servant 1 carrying the
//                       meat off toward her left, then comes back to him for A03.
//   laugh    A03-A04    she asks (puzzled), he is amused; 被贬: he laughs at himself (laugh accent); 官: two pats on his
//                       chest.
//   bone     A05        你看: he thrusts the spine right up at the lens in both hands (the bone big across the lower middle,
//                       his delighted face above it), her camera creeps in, the mic drops away; 骨头缝: he waggles it;
//                       还有肉: the small punch-in, he laughs.
//   card 1   A05 after  (nobody speaks) her camera eases back to the right; the spine goes to his right hand, he turns
//                       toward the block and flicks a coin from his left hand to the butcher, who catches it, grins and
//                       nods (BEAT.A.pay); he shoulders the spine like a club (BEAT.A.tuck: "tucks it under his arm" read
//                       as an end-on stub from her lens, so it goes up on his shoulder) and beckons "come" with his left
//                       hand (BEAT.A.beckon); the last 4 frames whip RIGHT (BEAT.A.whip: the arriving half is segB's).
// Every frame from beats.ts (BEAT.A) or lineId / capWord / card / SEGMENTS; every mark from layout/market.ts (the
// chopping stance, the step in and the cameras are derived from MARKET.*); props pinned after w.update().
// THE SERVANTS' CUTS: there is no meat prop in props/ (WP3), so this file builds two leaf-wrapped bundles of meat once
// per World (cutsOf) in the kit's prop style and keeps them in the props group under the name "prop.cuts:k" (so the
// clearance checker tests them like any prop); pose() shows / places them every frame and exit() hides them.
import * as THREE from "three";
import { SEGMENTS, FPS, lineId, capWord, card, clamp01, lerp, smooth, easeOutQuad, easeInCubic, easeInOutCubic, type Pose, type Segment, type CamPose } from "../story";
import { BEAT } from "../beats";
import * as C from "../cam";
import { SU, BUTCHER, SERVANT, VILLAGER, VILLAGER2, VILLAGER3, VILLAGER4, type Person } from "../people";
import { MARKET, EYE, FOV } from "../layout";
import { SPINE } from "../props";
import { transitionAt } from "../hud";
import { putHer, herKeys, type MicMode } from "../her";
import type { World } from "../world";
import { makeKit, Part, ball } from "../../../kit/props/kit";
import { V, rel, yawTo, lid, swaps, says, accent, heads, headPop, at, ky, walkAlong, hopArc, frag, standing, type RigState } from "./common";

type St = Partial<RigState>;
type Expr = NonNullable<RigState["expr"]>;
const S = SEGMENTS[0], A = BEAT.A;
const L2 = lineId("A02"), L3 = lineId("A03"), L4 = lineId("A04"), CARD1 = card("A05");
const word = (id: string, w: string) => capWord(id, w).from;
const RAD = Math.PI / 180;

// ------------------------------------------------------------------------------------------------------ the beats
/** 一只羊: his raised hand ("one") */ const ONE = word("A02", "一只羊");
/** 肉: his eyes flick to the carcass on the rack */ const MEAT = word("A02", "肉");
/** 骨头缝: he waggles the spine at the lens */ const GAP = word("A05", "骨头缝");
/** her walk stops (the lens settles in front of him) */ const STOP_F = A.walk[1] + 12;
/** card 1: the coin out of his robe, the flick (BEAT.A.pay), the butcher's catch, his thanks */
const COIN = CARD1.from + 10, TOSS = A.pay, CATCH = A.pay + 9;
/** the coin at 1.8 x (a 3 cm coin at 2 m is a few pixels: a toon glint big enough to follow in the air) */
const COIN_SCALE = 1.8;

// ------------------------------------------------------------------------------------------------------ the marks
/** SU's mark and facing (he faces her); the step in on A02 (22 cm toward her) */
const SU0 = MARKET.su.clone(), F0 = MARKET.suFacing, SU_IN = rel(SU0, F0, 0, 0, 0.22);
/** A05: a second step in, right up to her lens with the bone (28 cm more); he stays there for card 1 */
const SU_IN2 = rel(SU_IN, F0, 0, 0, 0.28), STEP2 = A.boneUp - 10;
/** at the start he is turned toward the butcher, showing off his prize; on card 1 he turns toward the block to pay */
const F_PRIZE = F0 + 0.4, F_PAY = F0 + 1.0;
/** THE BUTCHER'S CHOPPING STANCE: on the line from the block to his layout mark, 0.62 m from the block's middle (the
 *  layout's mark is 0.9 m behind the block, out of the reach of his short arms), facing the block */
const BLOCK = MARKET.block.clone();
const BUT = BLOCK.clone().add(MARKET.butcher.clone().sub(BLOCK).setY(0).normalize().multiplyScalar(0.62));
const BF = yawTo(BUT, BLOCK);
/** WP3's block stands on legs that end 1.2 cm over its origin: it is put that much lower (requests.md), so its top is
 *  the layout's (MARKET_SET.block.top, the cleaver's resting mark) less that */
const BLOCK_SINK = 0.012, TOP = MARKET.cleaver.y - BLOCK_SINK;
/** the two servants: their walk (layout servantPath) at a loaded pace; servant 0 is already 1.5 m along it on frame 0,
 *  servant 1 waits at the counter and sets off so that he is just past the path's second point on 当官的 */
const SV_PATH = MARKET.servantPath, SV_SPEED = 0.85;
/** servant 1 waits with his bundle at the counter right of the butcher (from the layout's first point it stood right
 *  behind SU in her walk-in), and goes round behind the butcher to the layout's path */
const SV1_PATH = [SV_PATH[0].clone().add(V(1.05, 0, 0.05)), SV_PATH[0].clone().add(V(-0.05, 0, -0.1)), ...SV_PATH.slice(1)];
const pathLen = (P: THREE.Vector3[], n: number) => { let d = 0; for (let i = 0; i < n; i++) d += P[i].distanceTo(P[i + 1]); return d; };
const SV_PATHS = [SV_PATH, SV1_PATH];
const SV_GO = [S.from - Math.round(((pathLen(SV_PATH, 1) - 0.4) / SV_SPEED) * FPS), A.nod - Math.round(((pathLen(SV1_PATH, 2) + 0.36) / SV_SPEED) * FPS)];
/** the background villagers: [layout mark index, look, facing, turn (1 = browsing the stall, back to us)] */
const CROWD: [number, Person, number, number][] = [[0, VILLAGER2, Math.PI + 0.3, 1], [1, VILLAGER, Math.PI / 2, 0], [4, VILLAGER4, Math.PI / 2 + 0.4, 0], [3, VILLAGER3, 0.6, 0], [5, VILLAGER, -0.4, 0]];

// ------------------------------------------------------------------------------------------------------ helpers
/** a rotation (put's rot: Euler YXZ) whose local +x is `x` and local +y as near `y` as it can be */
const rotXY = (x: THREE.Vector3, y: THREE.Vector3): [number, number, number] => {
  const X = x.clone().normalize(), Z = X.clone().cross(y).normalize(), Y = Z.clone().cross(X).normalize();
  const e = new THREE.Euler().setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, Y, Z), "YXZ");
  return [e.x, e.y, e.z];
};
const quatOf = (r: [number, number, number]) => new THREE.Quaternion().setFromEuler(new THREE.Euler(r[0], r[1], r[2], "YXZ"));
const eulerOf = (q: THREE.Quaternion): [number, number, number] => { const e = new THREE.Euler().setFromQuaternion(q, "YXZ"); return [e.x, e.y, e.z]; };
/** a direction given in a figure's own frame (x = its left, y up, z forward) -> world */
const dirOf = (facing: number, x: number, y: number, z: number) => rel(V(), facing, x, y, z);
/** a camera at `pos` turned so that the world point `tgt` lands on screen (sx, sy) (px of 1080 x 1920) */
const aim = (pos: THREE.Vector3, tgt: THREE.Vector3, sy: number, sx = 540, fov = FOV): CamPose => {
  const d = tgt.clone().sub(pos), hz = Math.hypot(d.x, d.z);
  const tv = Math.tan((fov * RAD) / 2), th = (tv * 9) / 16;
  const pitch = Math.atan2(d.y, hz) - Math.atan(((960 - sy) / 960) * tv), yaw = Math.atan2(d.x, d.z) + Math.atan(((sx - 540) / 540) * th);
  const look = pos.clone().add(V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)).multiplyScalar(3));
  return { pos: [pos.x, pos.y, pos.z], look: [look.x, look.y, look.z], fov };
};
/** TARGET KEYS: [frame, target(f) | null]: the target of the last key at or before f, blended over `len` frames from the
 *  one before it (null = no pin: the rig's own hand). A key whose target is null cuts (no blend). */
type TKey = [number, ((f: number) => THREE.Vector3) | null, number?];
const tkeys = (f: number, keys: TKey[], len = 7): THREE.Vector3 | null => {
  let i = -1; while (i + 1 < keys.length && keys[i + 1][0] <= f) i++;
  if (i < 0) return keys[0][1]?.(f) ?? null;
  const cur = keys[i][1]?.(f) ?? null, prev = i > 0 ? keys[i - 1][1]?.(f) ?? null : null;
  const k = smooth(clamp01((f - keys[i][0]) / Math.max(1, keys[i][2] ?? len)));
  return cur && prev && k < 1 ? prev.lerp(cur, k) : cur;
};

// ------------------------------------------------------------------------------------------------------ the cuts
/** the servants' bundles of good cuts (leaf-wrapped, pink meat and white fat bulging out of the top, a straw tie):
 *  built once per World in the props group (see the head of this file). Origin = the bundle's middle; it lies along x. */
const CUTS = new WeakMap<World, THREE.Group[]>();
const cutsOf = (w: World) => {
  let gs = CUTS.get(w);
  if (!gs) {
    const K = makeKit(w.M);
    const leaf = K.flat("#5c9a4a", { rough: 0.8 }), meat = K.flat("#e2887a", { rough: 0.7 }), fat = K.flat("#f6ead8", { rough: 0.7 }), straw = K.flat("#d6b664", { rough: 0.9 });
    gs = [0, 1].map((k) => {
      const g = new THREE.Group(); g.name = `prop.cuts:${k}`; g.visible = false;
      const P = new Part(K), s = k ? 1.12 : 1;
      P.add(leaf, ball(V(0, 0, 0), 0.1 * s, [1.5, 0.72, 1.0], 18), 0.004);
      P.add(meat, ball(V(0.02 * s, 0.05 * s, 0), 0.075 * s, [1.3, 0.55, 0.85], 14), 0.004);
      P.add(fat, ball(V(-0.055 * s, 0.062 * s, 0.01 * s), 0.04 * s, [1.2, 0.5, 0.8], 12), 0.003);
      P.add(straw, new THREE.TorusGeometry(0.1 * s, 0.006, 6, 28).scale(1.52, 0.78, 1), 0.002);
      P.add(straw, new THREE.TorusGeometry(0.1 * s, 0.006, 6, 28).rotateY(Math.PI / 2).scale(1, 0.78, 1.02), 0.002);
      P.into(g, `cuts${k}`);
      w.props.group.add(g);
      return g;
    });
    CUTS.set(w, gs);
  }
  return gs;
};

// ------------------------------------------------------------------------------------------------------ the cameras
const key = (f: number, c: CamPose, ease?: (x: number) => number): C.CamKey => ({ f, pos: c.pos, look: c.look, fov: c.fov, ease });
const head = (p: THREE.Vector3) => p.clone().add(V(0, 1.3, 0));
const STOP = MARKET.stop.clone().setY(EYE);
/** f0: 1.5 m back down the lane, striding in (his eyes just under the upper third, his hat's tip under the title
 *  block, the servant with the cuts on the left) */
const WALK0 = aim(STOP.clone().add(V(0.05, 0, 1.5)), head(SU0), 690, 560);
/** the stall: at her stop, 2.4 m in front of him (his eyes in the upper third, his hat's tip under the title block) */
const STALL0 = aim(STOP, head(SU0), 660, 520);
/** after his step in */
const STALL_IN = aim(STOP, head(SU_IN), 600, 525);
/** A05: she creeps in 0.3 m as he steps up to her: his face above the spine he holds up at her */
const CLOSE_POS = STOP.clone().add(SU_IN.clone().setY(EYE).sub(STOP).normalize().multiplyScalar(0.3));
const CLOSE = aim(CLOSE_POS, head(SU_IN2), 500, 590);   // (QA1: 540 -> 590, the hat crown out of the REC row)
/** card 1: back and to the right: his face above the card (mid-left), the block and the butcher on the right */
const CARD_POS = STOP.clone().add(V(0.3, 0, 0.1));
const CARD = aim(CARD_POS, head(SU_IN2), 600, 465);   // (QA1: 430 -> 465, the hat clear of the timestamp)
/** her camera before the whip: the walk in, the stall, the pan to the servant on 当官的, close for the bone, the card */
export const camA = (f: number): CamPose => {
  const c = C.povCam(f, [
    key(S.from, WALK0), key(STOP_F, STALL0, easeOutQuad),
    key(A.lean, STALL0), key(A.lean + 16, STALL_IN),
    key(A.boneUp - 6, STALL_IN), key(A.boneUp + 10, CLOSE),
    key(CARD1.from, CLOSE), key(CARD1.from + 20, CARD),
  ], { mood: [[S.from, "excited"], [STOP_F + 20, "calm"]], walk: [[S.from, 1], [A.walk[1], 0]], amp: 0.8 });
  const pan = ky(f, [[A.nod - 2, 0], [A.nod + 12, -12], [L3.from - 6, -12], [L3.from + 8, 0]]);
  return C.punchIn(pan ? C.nudge(c, { yaw: pan }) : c, f, A.punchIn, { k: 0.9, len: 5, off: CARD1.from + 8 });
};

// ------------------------------------------------------------------------------------------------------ SU
/** where he stands and his pose: the mark, the one step in on A02 */
const suLeg = (f: number) => f < STEP2 ? walkAlong([SU0, SU_IN], 0.8, (f - A.lean) / FPS, { startFacing: F0, endFacing: F0 }) : walkAlong([SU_IN, SU_IN2], 0.8, (f - STEP2) / FPS, { startFacing: F0, endFacing: F0 });
const suFacing = (f: number) => ky(f, [[S.from, F_PRIZE], [A.turn, F_PRIZE], [A.turn + 10, F0], [CARD1.from + 2, F0], [TOSS - 5, F_PAY], [CATCH + 6, F_PAY], [A.tuck + 6, F0]]);
const EXPR: [number, Expr][] = [
  [S.from, "happy"], [A.turn, "grin"], [A.lean, "smug"], [L3.from + 6, "smile_closed"], [L3.to - 4, "grin"], [A.laugh, "laugh"],
  [A.pat, "happy"], [A.boneUp, "happy"], [GAP, "grin"], [A.punchIn, "laugh"], [CARD1.from + 4, "smile"], [CATCH, "happy"], [A.beckon, "grin"],
];
/** THE SPINE'S HOLDS, each a function of f: its origin (middle) and rotation, which hands are on it (hand 0 on its -x
 *  end, hand 1 on its +x end: holdPoints' "pair") and which hand it is anchored to after the solve */
type R3 = [number, number, number];
type Hold = { o: THREE.Vector3; rot: R3; use: [number, number]; side: 0 | 1 };
const END = (side: 0 | 1, rot: R3) => V(side ? SPINE.hand : -SPINE.hand, 0, 0).applyQuaternion(quatOf(rot));
const two = (o: THREE.Vector3, rot: R3): Hold => ({ o, rot, use: [1, 1], side: 1 });
const one = (side: 0 | 1, hand: THREE.Vector3, rot: R3): Hold => ({ o: hand.clone().sub(END(side, rot)), rot, use: side ? [0, 1] : [1, 0], side });
/** the prize: up in both hands at his chest, toward the butcher, a proud little jiggle */
const PRIZE = (f: number, p: THREE.Vector3, fc: number) => two(rel(p, fc, 0, 1.15 + 0.015 * Math.sin(f * 0.5), 0.4), [0, fc, 0.26]);
/** shown to her at his chest */
const SHOW = (_f: number, p: THREE.Vector3, fc: number) => two(rel(p, fc, 0, 1.04, 0.36), [0, fc, -0.08]);
/** A05: thrust at the lens, a waggle on 骨头缝, lifted on 还有肉 */
const THRUST = (f: number, p: THREE.Vector3, fc: number) => {
  const wag = f >= GAP && f < GAP + 14 ? 0.1 * Math.sin(((f - GAP) / 14) * Math.PI * 3) : 0, lift = 0.03 * smooth(clamp01((f - A.punchIn) / 5));
  return two(rel(p, fc, 0, 1.13 + lift, 0.4), [-0.15, fc, wag]);
};
/** A02-A04: in his LEFT hand at the hip, pointing forward and down (his right hand talks) */
const LHIP = (_f: number, p: THREE.Vector3, fc: number) => one(1, rel(p, fc, 0.34, 0.78, 0.16), rotXY(dirOf(fc, -0.1, 0.55, -0.83), V(0, 1, 0)));
/** card 1: in his RIGHT hand at the hip (his left hand pays, toward the butcher on his left) */
const RHIP = (_f: number, p: THREE.Vector3, fc: number) => one(0, rel(p, fc, -0.36, 0.78, 0.16), rotXY(dirOf(fc, -0.1, -0.55, 0.83), V(0, 1, 0)));
/** up on his right shoulder like a club, ready to go home */
const RTUCK = (_f: number, p: THREE.Vector3, fc: number) => one(0, rel(p, fc, -0.33, 1.04, 0.16), rotXY(dirOf(fc, -0.55, 0.75, -0.35), V(0, 1, 0)));
type HoldFn = (f: number, p: THREE.Vector3, fc: number) => Hold;
const HOLDS: [number, HoldFn][] = [[S.from, PRIZE], [A.turn + 2, SHOW], [A.lean + 2, LHIP], [A.boneUp - 8, THRUST], [CARD1.from + 2, RHIP], [A.tuck, RTUCK]];
const holdAt = (f: number, p: THREE.Vector3, fc: number, len = 8): Hold => {
  let i = 0; while (i + 1 < HOLDS.length && HOLDS[i + 1][0] <= f) i++;
  const cur = HOLDS[i][1](f, p, fc), k = i > 0 ? smooth(clamp01((f - HOLDS[i][0]) / len)) : 1;
  if (k >= 1) return cur;
  const prev = HOLDS[i - 1][1](f, p, fc);
  return { o: prev.o.clone().lerp(cur.o, k), rot: eulerOf(quatOf(prev.rot).slerp(quatOf(cur.rot), k)), use: [lerp(prev.use[0], cur.use[0], k), lerp(prev.use[1], cur.use[1], k)], side: cur.side };
};
/** his hands when they are not on the spine: the RIGHT one talks on A02-A04 (the "one", the thumb toward the servants,
 *  the pats), the LEFT one pays on card 1 (the coin out of his robe, the flick toward the butcher) and beckons */
const REST = (p: THREE.Vector3, fc: number, arm: 0 | 1) => rel(p, fc, arm ? 0.27 : -0.27, 0.74, 0.16);
const rightKeys = (p: THREE.Vector3, fc: number): TKey[] => [
  [S.from, () => REST(p, fc, 0)],
  [ONE - 4, () => rel(p, fc, -0.27, 1.12, 0.22)], [ONE + 16, () => REST(p, fc, 0), 9],
  [A.nod - 4, () => rel(p, fc, -0.37, 1.0, 0.14)], [L2.to + 6, () => REST(p, fc, 0), 10],
  [A.pat - 4, (g) => rel(p, fc, -0.1, 1.0, 0.34 + 0.05 * Math.abs(Math.sin(((g - A.pat) / 9) * Math.PI)))], [A.pat + 20, () => REST(p, fc, 0), 8],
];
const COIN_HAND = (p: THREE.Vector3, fc: number) => rel(p, fc, 0.42, 1.0, 0.12);
const leftKeys = (p: THREE.Vector3, fc: number): TKey[] => [
  [S.from, () => REST(p, fc, 1)],
  [COIN - 6, () => rel(p, fc, 0.26, 0.86, 0.3)], [TOSS - 5, () => rel(p, fc, 0.3, 0.92, 0.3), 5], [TOSS, () => COIN_HAND(p, fc), 3], [TOSS + 8, () => REST(p, fc, 1), 10],
  [A.beckon, (g) => rel(p, fc, 0.3, 1.14, 0.28 - 0.12 * Math.abs(Math.sin(((g - A.beckon) / 12) * Math.PI)))], [A.whip - 4, () => REST(p, fc, 1), 8],
];

// ------------------------------------------------------------------------------------------------------ the butcher
/** the cleaver in his right hand: raised, the chop onto the block top (BEAT.A.cleave), then laid flat on the block */
const FWD = dirOf(BF, 0, 0, 1);
const IMPACT_EDGE = BLOCK.clone().add(FWD.clone().multiplyScalar(-0.12)).setY(TOP + 0.015);
const CL_IMPACT = { at: IMPACT_EDGE.clone().addScaledVector(FWD, -0.17).add(V(0, 0.08, 0)), rot: rotXY(V(0, -1, 0), FWD) };
const CL_UP = { at: rel(BUT, BF, -0.32, 1.17, 0.12), rot: rotXY(FWD.clone().add(V(0, 0.4, 0)), V(0, 0.75, 0).addScaledVector(FWD, -0.5)) };
const CL_LAY = { at: MARKET.cleaver.clone().add(V(0, 0.02 - BLOCK_SINK, 0)), rot: rotXY(dirOf(BF, -0.4, 0, -1).cross(V(0, 1, 0)).negate(), dirOf(BF, -0.4, 0, -1)) };
/** the cleaver's [frame, pose] keys: rising on frame 0, the chop, a beat on the block, laid down */
const CLEAVE: [number, { at: THREE.Vector3; rot: [number, number, number] }][] = [[S.from - 6, CL_IMPACT], [A.cleave - 5, CL_UP], [A.cleave, CL_IMPACT], [A.cleave + 8, CL_IMPACT], [A.cleave + 26, CL_LAY]];
const cleaverAt = (f: number) => {
  let i = 0; while (i + 1 < CLEAVE.length && CLEAVE[i + 1][0] <= f) i++;
  if (i + 1 >= CLEAVE.length) return { ...CLEAVE[i][1], held: false };
  const [fa, a] = CLEAVE[i], [fb, b] = CLEAVE[i + 1], u = clamp01((f - fa) / (fb - fa)), k = fb === A.cleave ? easeInCubic(u) : easeInOutCubic(u);
  return { at: a.at.clone().lerp(b.at, k), rot: eulerOf(quatOf(a.rot).slerp(quatOf(b.rot), k)), held: true };
};
const B_REST0 = rel(BUT, BF, -0.26, 0.74, 0.12);
/** where he catches the coin (his right hand up over the block's side) */
const CATCH_AT = rel(BUT, BF, -0.2, 1.08, 0.3);
const butcherRight = (f: number): THREE.Vector3 | null => {
  const cl = cleaverAt(f);
  if (cl.held) return null;
  return tkeys(f, [[A.cleave + 26, () => B_REST0], [TOSS + 2, () => CATCH_AT, 6], [CATCH + 10, () => rel(BUT, BF, -0.12, 0.86, 0.22), 8], [A.tuck + 4, () => B_REST0, 10]]);
};

// ------------------------------------------------------------------------------------------------------ the segment
export const SEG: Segment = {
  id: "A", from: S.from, to: S.to,
  enter() {},
  exit(w) { for (const g of CUTS.get(w) ?? []) g.visible = false; },
  pose(w, f): Pose {
    w.setPlace("market");
    w.set.param("crowd", 1);
    const W = C.whip(camA(f), f, A.whip, { dir: 1 });
    const cam = W.cam;
    w.setCamera(cam);
    const t = f / FPS;

    // SU
    const leg = suLeg(f), p = leg.at, fc = leg.moving ? leg.facing : suFacing(f);
    // his hands: on the spine's ends while they hold it, their own gestures otherwise (blended in and out)
    const hold = holdAt(f, p, fc);
    const grip = (i: 0 | 1) => hold.o.clone().add(END(i, hold.rot));
    const h0 = (tkeys(f, rightKeys(p, fc)) ?? REST(p, fc, 0)).lerp(grip(0), hold.use[0]);
    const h1 = (tkeys(f, leftKeys(p, fc)) ?? REST(p, fc, 1)).lerp(grip(1), hold.use[1]);
    const sp = says("su", ["A02", "A04", "A05"], f, 1);
    const gaze = at(f, [[S.from, 0.5], [A.turn, 0], [MEAT, -1], [MEAT + 14, 0], [A.nod, -1], [L2.to + 4, 0], [TOSS - 5, 1], [CATCH + 10, 0]]);
    const su: St = {
      at: p, facing: fc, pose: leg.moving ? leg.pose : { kind: "idle", t: t + 0.41 }, expr: at(f, EXPR), gaze,
      blink: sp.blink ?? lid(t, 1, swaps(EXPR)), mouth: sp.mouth,
      lookDown: ky(f, [[S.from, 9], [A.turn, 9], [A.turn + 8, 0], [TOSS - 6, 0], [TOSS, 6], [CATCH + 8, 0]]),
      head: heads(sp.head, accent("jolt", f, A.turn, { amp: 0.6 }), accent("lean", f, A.lean, { dur: (L2.to - A.lean) / FPS, dir: -1, amp: 1.3 }),
        accent("nod", f, A.nod, { amp: 1.5 }), accent("laugh", f, A.laugh, { dur: 1.3, amp: 1.2 }), accent("pop", f, A.boneUp), headPop(f, A.punchIn),
        accent("nod", f, CATCH + 2), accent("nod", f, A.beckon, { amp: 1.2 }), accent("nod", f, A.beckon + 13, { amp: 1.2 })),
      hands: [h0, h1], armFront: hold.use[0] > 0.3 && hold.use[1] > 0.3 ? [true, true] : undefined, visible: true,
    };
    const rSu = w.actor(SU); rSu.set(su);

    // the butcher: the chop, laying the cleaver down, watching, the catch
    const cl = cleaverAt(f);
    w.actor(BUTCHER).set(standing(BUT, BF, f, 2, {
      expr: at(f, [[S.from, "focus"], [A.cleave + 20, "neutral"], [A.laugh, "smile"], [L4.to + 6, "neutral"], [CATCH, "grin"], [A.tuck + 10, "smile"]] as [number, Expr][]),
      gaze: at(f, [[S.from, -0.5], [A.cleave + 28, -1], [A.nod, -1], [L3.from, -1], [TOSS, -1], [CATCH + 8, 0], [A.beckon, -1]]),
      lookDown: ky(f, [[S.from, 14], [A.cleave + 10, 14], [A.cleave + 28, 4]]),
      head: heads(accent("nod", f, A.cleave, { amp: 0.8 }), accent("laugh", f, A.laugh + 4, { dur: 0.8, amp: 0.6 }), accent("nod", f, CATCH + 3, { amp: 1.3 })),
      hands: [cl.held ? cl.at : butcherRight(f), null],
    }));

    // the servants with the cuts
    const svOn: { k: number; legAt: THREE.Vector3; facing: number }[] = [];
    for (const k of [0, 1]) {
      const sl = walkAlong(SV_PATHS[k], SV_SPEED, (f - SV_GO[k]) / FPS, { startFacing: yawTo(SV_PATHS[k][0], BLOCK) });
      if (sl.arrived || sl.at.z > MARKET.stop.z + 0.8) continue;
      w.actor(SERVANT, String(k)).set({
        ...standing(sl.at, sl.facing, f, 3 + k), pose: sl.moving ? sl.pose : { kind: "idle", t: t + 0.7 * k }, expr: "neutral",
        hands: [rel(sl.at, sl.facing, -0.13, 0.86, 0.27), rel(sl.at, sl.facing, 0.13, 0.86, 0.27)],
      });
      svOn.push({ k, legAt: sl.at, facing: sl.facing });
    }
    // the villagers at the stalls
    CROWD.forEach(([i, who, face, turn], k) => w.actor(who, `m${k}`).set(standing(MARKET.villagers[i], face, f, 6 + k, { turn, expr: k % 2 ? "smile" : "neutral" })));

    w.update();

    // the chopping block (WP3's prop on its mark)
    w.prop("block").put(BLOCK.clone().add(V(0, -BLOCK_SINK, 0)));
    // the spine on his left hand's end (and in both hands when he holds it in two)
    w.prop("spine").put(rSu.handWorld(hold.side).sub(END(hold.side, hold.rot)), { rot: hold.rot });
    // the cleaver in the butcher's hand, then on the block
    w.prop("cleaver").put(cl.held ? w.actor(BUTCHER).handWorld(0) : cl.at, { grip: "hilt", rot: cl.rot });
    // the coin: in his hand from COIN, in the air TOSS -> CATCH (a little arc, spinning), in the butcher's fist, gone
    if (f >= COIN && f < A.tuck + 4) {
      const from = COIN_HAND(p, fc), to = CATCH_AT;
      const c = f < TOSS ? rSu.handWorld(1) : f < CATCH ? hopArc(from, to, (f - TOSS) / (CATCH - TOSS), 0.3) : w.actor(BUTCHER).handWorld(0);
      w.prop("coin").put(c, { rot: [f < TOSS || f >= CATCH ? 0 : (f - TOSS) * 1.1, fc, 0], scale: COIN_SCALE });
    }
    // the cuts in the servants' arms
    const cuts = cutsOf(w);
    cuts.forEach((g) => (g.visible = false));
    for (const s of svOn) {
      const r = w.actor(SERVANT, String(s.k)), mid = r.handWorld(0).add(r.handWorld(1)).multiplyScalar(0.5);
      const g = cuts[s.k];
      g.visible = true; g.position.copy(mid).add(dirOf(s.facing, 0, 0.0, 0.04)); g.rotation.set(0, s.facing, 0); g.updateMatrixWorld(true);
    }

    // her red mic: swings in on 东坡, toward his mouth; drops away as he thrusts the bone at her
    const hw = rSu.headWorld();
    putHer(w, cam, f, { mic: { ...herKeys<MicMode>(f, [[A.micIn, "in"], [A.boneUp - 10, "off"]]), aim: hw.clone().add(V(0, -0.12, 0)), avoid: [hw] } });

    const shot = f < STOP_F ? "walk" : f < A.lean ? "turn" : f < L3.from ? "lean" : f < A.boneUp - 8 ? "laugh" : f < CARD1.from ? "bone" : f < A.whip ? "card" : "whip";
    return { camera: cam, post: W.post, overlays: frag(C.whipSmear(W.smear, 1), transitionAt(f)?.node), slate: `A ${shot}` };
  },
};
