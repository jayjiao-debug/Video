// SCENE F · 19:00, the noodle table outside her tower. THE BLIND DATE her mother set up. Under the table: two pairs of
// feet, a red bow on an ankle of each, two threads running up and back. Up: 月老 stands behind the table holding the
// two threads like reins, sure of it this time. The man asks about flat and salary; she asks whether he can take 996.
// He answers a message: his thread goes slack, 月老 tugs, the bow slips, the thread comes up empty. She opens her
// laptop: hers too. He is left with two limp threads and their two empty loops, walks round the table to her lens with
// them, and files the second 缘分未到. Then he sees she is still filming and puts a hand over the lens.
// CAMERA PLAN (her eyes, one take; 20 s, five moves):
//   open      LOOK AT her ankle and its bow (scene E's), then    close, low, under the table               still, then a pan across under the table
//             a man's ankle with a bow of its own                                                         to the other pair of feet
//   相亲      him holding the reins, the two at the table       medium wide three-shot                    she stands up and steps back
//   九九六    her flat face, his dread behind it                medium close (snap zoom, 28% tighter)     lands on the word; back for the man's answer
//   two screens  the threads coming up empty, one, two          medium wide three-shot                    STILL from 不好意思 to the gloom
//   也记      him, the two heads over their screens behind      medium close: he comes to the lens        she follows his walk round the table, then holds
//   the end   his palm                                          the lens covered                          the join to G
import * as THREE from "three";
import { seg, type Segment } from "../story";
import { zoomBy, handCover } from "../cam";
import { P, startOf, endOf, wordAt, ky, rel, V, smooth, walkAlong, hang, hit, shotCam, through, VERBS, SEATS, type ShotKey } from "./kit";
import { act, YL, XM, XQ, type MoodKey } from "./act";
import { sideCard, stamp, draw, mittenCover, type Fx } from "./fx";
import { taut, recoil, anklet, knotAt, bowKnot, FLAT } from "./thread";
import type { World } from "../world";

const S = seg("F"), HALF = Math.PI / 2;
/** he stands behind the table; his walk round its right end to the lens */
const BACK = P("street", -3.3, 0, -2.42), FRONT = P("street", -3.0, 0, -0.15);   // (he pulls up a little right of her lens: the man's head is hidden behind his, 林小满's stands clear beside it)
const ROUND = [BACK, P("street", -2.5, 0, -2.3), P("street", -2.05, 0, -1.5), P("street", -2.3, 0, -0.6), FRONT], SPEED = 1.7;
const LOW_A = [-3.2, 0.22, -0.8], ANK_A = [-3.66, 0.09, -1.56], LOW_B = [-3.4, 0.22, -0.8], ANK_B = [-2.94, 0.09, -1.56], EYEP = [-3.3, 1.45, 2.1], NEARP = [-3.3, 1.45, 1.2], MID = [-3.3, 1.0, -1.5], HER = [-3.82, 0.99, -1.5];
/** her laptop on the table in front of her (its user's edge at the table's edge), the two bowls */
const LAPTOP = P("street", -3.57, 0.62, -1.5), LAP_YAW = HALF + 0.6, BOWL_HERS = P("street", -3.38, 0.62, -1.3), BOWL_HIS = P("street", -3.06, 0.62, -1.5);

/** a small empty loop at a thread's end (what is left of the tie): flat when the end lies on the ground, hanging below it otherwise */
const noose = (end: THREE.Vector3, r = 0.028): THREE.Vector3[] => {
  const pts: THREE.Vector3[] = [], flat = end.y < 0.03;
  for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; pts.push(flat ? end.clone().add(V(r - r * Math.cos(a), 0, r * Math.sin(a))) : end.clone().add(V(r * Math.sin(a), -r + r * Math.cos(a), 0))); }
  return pts;
};
type Rein = { key: string; hand: THREE.Vector3; ank: THREE.Vector3; inward: THREE.Vector3; slack: number; tug: number; free: number; plucks: number[]; len: number };
/** ONE REIN: from his fist down behind the table to the bow on an ankle. Tied: straight, singing when he flicks it;
 *  its owner on a screen: it sags and dims; he tugs: the bow slips; free: it springs up to his fist and hangs from it,
 *  the empty loop at its end. reel 0..1 = he winds it round his fist as he walks; lag = his speed (the thread trails). */
const rein = (w: World, f: number, s: Rein, reel: number, lag: THREE.Vector3) => {
  const knot = knotAt(s.ank, s.inward, 0.026);
  if (f < s.free) {
    const k = ky(f, [[s.slack, 0], [s.slack + 14, 1]]), pull = ky(f, [[s.tug, 0], [s.tug + 3, 1]]);
    w.props.thread(s.key, taut(s.hand, knot, f, s.plucks, { sag: (0.012 + 0.2 * k) * (1 - pull), n: 12 }), { r: 0.007, glow: 0.4 * (1 - k) });
    w.props.thread(s.key + "a", anklet(s.ank, 0.026, 0.25, 0.4), { r: 0.007, closed: true });
    w.props.thread(s.key + "b", bowKnot(knot, s.inward, 0.03 * (1 - 0.8 * pull)), { r: 0.006, closed: true });
    return;
  }
  const d = f - s.free, L = THREE.MathUtils.lerp(s.len, 0.15, reel), dir = knot.clone().sub(s.hand).normalize();
  const pts = recoil(s.hand, s.hand.clone().addScaledVector(dir, L), d, FLAT, { n: 14, whip: 0.35 });
  pts.forEach((p, i) => { const u = i / 14; if (p.y > 0.03) { p.addScaledVector(lag, -0.14 * u * u); p.x += 0.018 * u * Math.sin(f * 0.21 + s.len * 9); } });
  w.props.thread(s.key, pts, { r: 0.007 });
  w.props.thread(s.key + "a", noose(pts[pts.length - 1]), { r: 0.0065, closed: true });
  if (reel > 0.12) w.props.thread(s.key + "b", anklet(s.hand.clone().add(V(0, -0.012, 0)), 0.036, 0.7, 1.2), { r: 0.006, closed: true });
};

export const SEG: Segment = {
  id: "F", from: S.from, to: S.to, enter() {}, exit() {},
  pose(w, f) {
    w.setPlace("street"); w.set.param("time", "dusk"); w.set.param("door", 0); w.set.param("lit", 0.6); w.set.param("moon", 0);
    const f01 = startOf("F01"), stable = wordAt("F01", "稳"), f02 = startOf("F02"), pay = wordAt("F02", "月薪"), f03 = startOf("F03"), n996 = wordAt("F03", "九九六"), x03 = endOf("F03");
    const f04 = startOf("F04"), msg = wordAt("F04", "回个"), x04 = endOf("F04"), f05 = startOf("F05"), fix = wordAt("F05", "修个"), x05 = endOf("F05"), f06 = startOf("F06"), fate = wordAt("F06", "缘分"), x06 = endOf("F06");
    // the business: she stands up; his phone; his thread; her laptop; her thread; the gloom; the walk; the hand
    const pan0 = f01 + 8, pan1 = pan0 + 14, rise0 = pan1 + 9, rise1 = rise0 + 26, phoneOut = f04 + 8, slackR = msg - 2, tugR = x04 - 12, freeR = tugR + 3;
    const open = f05 + 2, typing = open + 13, slackL = typing + 2, tugL = fix + 6, freeL = tugL + 3, gloom = x05 + 4, walk0 = x05 + 16;
    const arrive = walk0 + Math.ceil(VERBS.walkTime(ROUND, SPEED) * 30), lunge0 = x06 + 10, cov = lunge0 + 4;
    const t = f / 30;
    // ---------------------------------------------------------------------------------------------- his way
    const leg = walkAlong(ROUND, SPEED, Math.max(0, f - walk0) / 30, { endFacing: 0 }), walking = f >= walk0 && leg.moving;
    const lk = smooth((f - lunge0) / 7);
    const at = (f < walk0 ? BACK : leg.at).clone().add(V(0, 0, 0.22 * lk)), facing = walking ? leg.facing : 0;
    const headAt = (g: number) => (g < walk0 ? BACK : walkAlong(ROUND, SPEED, (g - walk0) / 30, { endFacing: 0 }).at).clone().add(V(0, 1.19, 0));
    // ---------------------------------------------------------------------------------------------- the camera
    // the three-shot from a step and a half away: the three of them fill the width, the table sits in the lower half, and
    // the shop front (not empty pavement) fills the rest; she backs off to EYEP as he comes round the table at her
    const THREE_ = { pos: NEARP, at: MID, sx: 505, sy: 880, fov: 62 }, PUNCH = { pos: NEARP, at: HER, sx: 440, sy: 850, fov: zoomBy(62, 0.7) };
    const keys: ShotKey[] = [
      { f: S.from, pos: LOW_A, at: ANK_A, sx: 500, sy: 1050, fov: 50 },
      { f: pan0, pos: LOW_A, at: ANK_A, sx: 500, sy: 1050, fov: 50 },
      { f: pan1, pos: LOW_B, at: ANK_B, sx: 580, sy: 1050, fov: 50 },
      { f: rise0, pos: LOW_B, at: ANK_B, sx: 580, sy: 1050, fov: 50 },
      { f: rise1, ...THREE_ },
      { f: n996 - 5, ...THREE_ },
      { f: n996, ...PUNCH },
      { f: x03 + 6, ...PUNCH },
      { f: f04 - 3, ...THREE_ },
      { f: walk0, ...THREE_ },
      { f: walk0 + 26, pos: EYEP, at: headAt, sx: 700, sy: 640, fov: 55 },
      { f: arrive, pos: EYEP, at: headAt, sx: 690, sy: 890, fov: 55 },
      { f: S.to, pos: EYEP, at: headAt, sx: 690, sy: 890, fov: 55 },
    ];
    const cam0 = shotCam("street", f, keys, { mood: "calm", amp: 0.6, walk: [[S.from, 0], [rise0, 0], [rise0 + 8, 0.5], [rise1, 0]] });
    const HC = handCover(cam0, f, cov, { len: 9 }), camera = HC.cam;
    w.setCamera(camera);
    // ---------------------------------------------------------------------------------------------- 林小满
    const A = SEATS.noodleL.top.clone().setY(0), HX = (dx: number, y: number, z: number) => rel(A, HALF, dx, y, z);
    const lidA = ky(f, [[open, -HALF], [open + 5, -0.9], [open + 10, 0.25]]);
    /** a point of the laptop (its own frame: x across, z from the user's edge -0.1 to the hinge +0.1) */
    const LP = (lx: number, y: number, lz: number) => LAPTOP.clone().add(V(lx * Math.cos(LAP_YAW) + lz * Math.sin(LAP_YAW), y, -lx * Math.sin(LAP_YAW) + lz * Math.cos(LAP_YAW)));
    const edge = (a: number) => LP(-0.09, 0.03 + 0.2 * Math.cos(a), 0.1 + 0.2 * Math.sin(a));
    const tap = (lx: number) => LP(lx + 0.012 * Math.sin(f * 1.9 + lx * 40), 0.045 + 0.006 * Math.abs(Math.sin(f * 2.3 + lx * 31)), -0.04);
    const restR = LP(-0.07, 0.052, -0.03), restL = LP(0.07, 0.052, -0.03);
    const xmR = f >= typing ? tap(-0.07) : through(f, [[open - 5, restR], [open, edge(-HALF)], [open + 5, edge(-0.9)], [typing, LP(-0.07, 0.045, -0.04)]]);
    const xmL = f >= typing ? tap(0.07) : through(f, [[open + 4, restL], [typing, LP(0.07, 0.045, -0.04)]]);
    const xm = act(w, f, XM, {
      at: A, facing: HALF, seat: SEATS.noodleL,
      faces: [[S.from, "flat"], [pay + 4, "tired"], [f03 - 3, "flat"], [f05 - 2, "smile"], [typing + 10, "flat"]],
      hands: [xmR, xmL], lookDown: f >= open ? 9 : 2, talkGaze: 0.5, gaze: f >= open ? 0 : undefined,
      head: { tilt: 2 * ky(f, [[f03 - 4, 0], [f03 + 2, 1], [x03 + 8, 1], [x03 + 16, 0]]) },
    });
    // ---------------------------------------------------------------------------------------------- 相亲对象
    const B = SEATS.noodleR.top.clone().setY(0), onPhone = f >= phoneOut, nod = hit(f, f02 + 3, 12);
    const xq = act(w, f, XQ, {
      at: B, facing: -HALF, seat: SEATS.noodleR,
      faces: [[S.from, "polite"], [n996 + 12, "shy", "take", 0.5], [f04 - 3, "polite"], [phoneOut + 12, "flat"]],
      pose: onPhone ? { kind: "phone", t, amount: 0, arm: 0 } : undefined, show: onPhone ? ["phone"] : undefined,
      talkGaze: -0.5, gaze: onPhone ? 0 : undefined, lookDown: onPhone ? 6 : 8 * nod, head: { dy: -0.03 * nod },
    });
    // ---------------------------------------------------------------------------------------------- 月老
    const HB = (dx: number, y: number, z: number) => rel(BACK, 0, dx, y, z), REST = (s: number) => HB(0.2 * s, 0.9, 0.2);
    /** a fist over time: side s = -1 his right (her thread) | 1 his left (the man's): the flick on 稳, the warning tug, the pull that frees it, holding the limp thread, the drop */
    const fist = (g: number, s: number, warn: number, tug: number, free: number) => through(g, [
      [S.from, REST(s)], [stable - 5, REST(s)], [stable - 1, HB(0.23 * s, 1.0, 0.17)], [stable + 3, HB(0.2 * s, 0.85, 0.22)], [stable + 10, REST(s)],
      [warn - 4, REST(s)], [warn, HB(0.25 * s, 0.99, 0.15)], [warn + 8, REST(s)],
      [tug - 3, REST(s)], [tug + 3, HB(0.28 * s, 1.1, 0.1)], [free + 10, HB(0.24 * s, 0.98, 0.16)], [gloom + 2, HB(0.22 * s, 0.95, 0.18)], [gloom + 14, hang(BACK, 0, s < 0 ? 0 : 1)],
    ]);
    const fistR = (g: number) => fist(g, -1, n996 + 10, tugL, freeL), fistL = (g: number) => fist(g, 1, pay + 10, tugR, freeR);
    const showK = ky(f, [[arrive - 2, 0], [arrive + 10, 1]]), shake = 0.006 * Math.sin(f * 1.1);
    const H = (dx: number, y: number, z: number) => rel(at, facing, dx, y, z);
    const hands: [THREE.Vector3 | null, THREE.Vector3 | null] | undefined = f < walk0 ? [fistR(f), fistL(f)] : walking ? undefined
      : [hang(at, facing, 0).lerp(H(-0.25, 1.0 + shake, 0.3), smooth(showK)).lerp(H(-0.24, 0.82, 0.2), lk), hang(at, facing, 1).lerp(H(0.25, 1.0 - shake, 0.3), smooth(showK)).lerp(H(0.34, 1.0, 0.42), lk)];
    const faces: MoodKey[] = [
      [S.from, "eager"], [stable - 2, "sly"], [f02 - 2, "hope"], [pay + 6, "worry"], [n996 + 4, "dread", "take", 0.8], [x03 + 14, "worry"],
      [freeR + 2, "panic", "take", 0.7], [f05 - 4, "lost"], [freeL + 4, "gloom", "sink"], [f06 - 4, "sag"], [fate - 2, "small"], [lunge0 + 1, "strain", "take", 0.6],
    ];
    const watchR = win2(f, slackR + 4, freeR + 18), watchL = win2(f, slackL + 2, freeL + 12);
    const r = act(w, f, YL, {
      at, facing, faces, pose: walking ? leg.pose : undefined, hands, talkGaze: 0,
      gaze: f < f02 - 6 || f >= gloom ? (f >= gloom && f < walk0 ? 0 : undefined) : watchR > 0.5 ? 1 : watchL > 0.5 ? -1 : f < f03 - 4 ? 1 : f < f04 - 4 ? -1 : f < f05 - 4 ? 1 : -1,
      lookDown: 10 * Math.max(watchR, watchL) + 12 * ky(f, [[gloom, 0], [gloom + 8, 1], [f06 - 8, 1], [f06 + 2, 0.3], [arrive, 0]]),
      lean: { pitch: 6 * ky(f, [[gloom, 0], [gloom + 10, 1], [arrive, 1], [arrive + 10, 0.4]]) + 9 * lk },
      head: { dy: -0.03 * ky(f, [[gloom, 0], [gloom + 8, 1], [arrive, 1], [arrive + 8, 0]]) },
    });
    w.update();
    // ---------------------------------------------------------------------------------------------- the table
    const lap = w.prop("laptop", "date").put(LAPTOP, { yaw: LAP_YAW }), lid = lap.group.getObjectByName("laptop.lid");
    if (lid) lid.rotation.x = lidA;
    w.prop("bowl", "hers").put(BOWL_HERS); w.prop("bowl", "his").put(BOWL_HIS, { yaw: 2 });
    // ---------------------------------------------------------------------------------------------- the reins
    const reel = ky(f, [[walk0 + 8, 0], [arrive, 1]]), lag = walking ? V(Math.sin(leg.facing), 0, Math.cos(leg.facing)).multiplyScalar(SPEED) : V();
    const ankHer = xm.footWorld(1).add(V(0, 0.07, 0)), ankHis = xq.footWorld(0).add(V(0, 0.07, 0));
    const lenOf = (g: THREE.Vector3, a: THREE.Vector3, inw: THREE.Vector3) => g.distanceTo(knotAt(a, inw, 0.026));
    rein(w, f, { key: "her", hand: r.handWorld(0), ank: ankHer, inward: V(1, 0, 0), slack: slackL, tug: tugL, free: freeL, plucks: [stable + 3, n996 + 10], len: lenOf(fistR(freeL), ankHer, V(1, 0, 0)) }, reel, lag);
    rein(w, f, { key: "his", hand: r.handWorld(1), ank: ankHis, inward: V(-1, 0, 0), slack: slackR, tug: tugR, free: freeR, plucks: [stable + 3, pay + 10], len: lenOf(fistL(freeR), ankHis, V(-1, 0, 0)) }, reel, lag);
    // ---------------------------------------------------------------------------------------------- over the picture
    const FX: Fx[] = [
      sideCard(f, { from: rise1 + 8, to: f02 + 40, name: "相亲对象", note: "产品经理 · 妈也在催", face: VERBS.headPx(w, xq), at: { x: 594, y: 336, s: 0.85 } }),
      stamp(f, { from: x06 - 8, to: lunge0 + 6, x: 320, y: 640, px: 70 }),   // (on the shop window: left of his hat, above her head, under the menu strips)
    ];
    return { camera, overlays: [draw(f, FX), mittenCover(HC.cover)], shown: FX, post: { bloom: 0.4 } };
  },
};
/** 0..1 inside [on, off] with soft ends */
function win2(f: number, on: number, off: number) { return Math.min(smooth((f - on) / 6), 1 - smooth((f - (off - 6)) / 6)); }
