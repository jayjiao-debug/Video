// SCENE C · 09:30, the case-file cabinet. HIS OLD RESULTS (v6, owner's notes 4, 6, 7, 13 and 15 on v5). He pulls up at
// the wall of drawers and shows her his famous cases, one POP-UP BOOK each (popbook.ts: a thread-bound book with the
// story's name on its cover; opened toward her lens, a paper pop-up stands up off the pages and plays the case). He is
// a god with a filing system: he beckons, a drawer shoots open and the case book flies out into his hands, growing to
// its size as it comes (in its drawer it stands 3/4 size, like a file). Each case is a brag that goes wrong in his hands:
//   《牛郎织女》 opened on 我绑的: the magpie bridge. On "once a year" the magpies fly off one by one; the two lean toward
//              each other over the river (异地恋); he shuts it and flicks it back to its drawer
//   《梁祝》     by the grave mound: on 变蝴蝶了 the two fold away and two butterflies flutter up out of the frame;
//              这单别记: snapped shut and put behind his back (her OS: 记下了), and let drop behind him
//   《白蛇传》   from the bottom drawer: 审批走了一千年: a concertina of approval slips climbs out of the book far over his
//              head and folds back; he lets the book drop at his feet
//   《红楼梦》   宝玉's thread to 黛玉; 手一抖: it shakes, swings over and lands on 宝钗; the readers' letters burst out at
//              her; he hurls it back into its drawer
//   《天仙配》   from the top drawer, slowly, bound in imperial yellow under the Jade Emperor's seal strip; opened a crack,
//              the jade seal springs up; 扣了: it slams down and shuts the book, which pulls out of his hands and flies back
//              up into its drawer by itself; he droops
// No HUD case cards (v5's were "boring illustrated"): the books carry the names and the gags. One 演绎 seal on his first
// claim, one OS. One face per thought (16 in 37 s, v5 had 30), each on the beat that causes it. No finger (note 7).
// CAMERA PLAN (her eyes, one take; 37 s, seven moves; the books face her, his face above them, both clear of the REC
// row and the subtitles):
//   arrive    LOOK AT him pulling up at the wall of drawers   medium wide (the whip pan lands here)    still
//   老业绩     the first book flying to him                   medium                                   the lens turns with the book into the medium
//   变蝴蝶了   the butterflies                                 tilt up after them                       along his look; back down as he hides the book
//   一千年     the concertina of slips                        tilt up along it                         back down as it folds away
//   骂了我     the letters bursting at her                     one kick                                 the hit
//   七仙女     his face over the yellow book                  slow push in (a thought landing)          the seal springs up in the closer frame
//   扣了       the seal slamming down                         one kick; she steps back wide            he is small before his drawers (scene D goes on from here)
import * as THREE from "three";
import { seg, type Segment } from "../story";
import { whip, whipSmear } from "../cam";
import { P, ky, rel, V, smooth, kick, hang, faceTo, through, turnTo, hit, shotCam, type ShotKey } from "./kit";
import { act, YL, type MoodKey } from "./act";
import { os, truth, draw, type Fx } from "./fx";
import { toCab, CAB_AT } from "./segB";
import { OFFICE } from "../places";
import { CASE_CELLS } from "../sets/office";
import { PB, type BookKind } from "../popbook";
import type { World } from "../world";
import { W_, CASE_T, BACK, type CaseTime } from "./segC_time";

const S = seg("C");
const CABX = OFFICE.cabinetX, OUT = 0.2;
type Cell = { z: number; y: number };
const cell = (c: number, r: number): Cell => { const top = 2.2 - r * 0.26; return { z: OFFICE.cabinet.z1 - (c + 0.5) * 0.25, y: top - 0.13 }; };
/** the five case drawers, spread over the wall so each flight reads beside him: 牛郎织女 at his right (her left), 梁祝
 *  high at his left, 白蛇传 in the bottom row, 红楼梦 at his left, 天仙配 in the top row over his head (top secret) */
const CELLS = CASE_CELLS.map(([c, r]) => cell(c, r));   // (5,5), (11,4), (4,7), (12,5), (7,1): sets/office.ts hides each one's painted knob while it is out
const KINDS: BookKind[] = ["niulang", "liangzhu", "baishe", "baodai", "qixian"];
/** which hand beckons each drawer (-1 his right, +1 his left) */
const SIDE = [-1, 1, -1, 1, -1];
/** where he stands (scene D starts him here) */
export const BASE = P("office", -2.1, 0, -0.3);
/** her lens at the end of the scene (scene D starts from it) */
export const CAM_C1 = { pos: [-0.35, 1.52, 1.45], look: [-2.72, 1.0, -0.5], fov: 58 };
/** where she stands while he shows the books (he turns his front toward it) */
const HER = P("office", -0.44, 0, 1.43);
const FRONT = faceTo(BASE, HER);
/** the two books he lets fall: 梁祝 behind him, 白蛇传 at his feet (clear of his hem, and of his run in scene D) */
const FLOOR2 = P("office", -2.36, 0, -0.8), FLOOR3 = P("office", -1.74, 0, 0.08);   // (v6b: FLOOR3 8 cm further out: his robe brushed it; v6c: FLOOR2 55 cm behind him, so the falling book clears his hem)

// ------------------------------------------------------------------------------------------------- the books' frame
type BP = { at: THREE.Vector3; q: THREE.Quaternion; open: number; s: number };
const PW = PB.pw, PH = PB.ph, S_IN = 0.75;
const Q = (yaw: number, pitch = 0, roll = 0) => new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch, yaw, roll, "YXZ"));
/** a point given in the book's own units (popbook.ts frame) in the world */
const bpt = (b: BP, x: number, y: number, z: number) => V(x, y, z).multiplyScalar(b.s).applyQuaternion(b.q).add(b.at);
const lerpBP = (a: BP, b: BP, k: number): BP => ({ at: a.at.clone().lerp(b.at, k), q: a.q.clone().slerp(b.q, k), open: a.open + (b.open - a.open) * k, s: a.s + (b.s - a.s) * k });
/** standing in its drawer on its bottom edge, the cover to the drawer's front (+x), 4 cm behind it, at 3/4 size */
const inDrawer = (c: Cell, out: number): BP => ({ at: P("office", CABX + out - 0.04, c.y - 0.1 + (PH * S_IN) / 2 + 0.001, c.z - (PW * S_IN) / 2), q: Q(Math.PI / 2), open: 0, s: S_IN });
/** lying shut on the floor, the cover up */
const onFloor = (p: THREE.Vector3, yaw: number): BP => ({ at: p.clone().setY(0.022), q: Q(yaw, -Math.PI / 2), open: 0, s: 1 });
/** THE HOLD: up in front of his chest, clear of his beard (26 cm deep), its top under his mouth as she sees it, tilted
 *  back a little to face her lens. Shut it sits centred on him; as it opens the spine slides to his middle. */
const SHOW_Y = 0.76, SHOW_Z = 0.44, TILT = -0.22;   // (v6b: 0.4 left the beard touching the book's back when he looked up)
// grips (book units): the right hand under the bottom edge near the fore-edge; the left under the spine side when shut,
// under the right-hand page's outer corner when open
const RH = [-0.21, -PH / 2 - 0.05, -0.014] as const;
const LH = (open: number) => [-0.04 + 0.25 * smooth(open), -PH / 2 - 0.05, -0.014] as const;

// ------------------------------------------------------------------------------------------------------ the timing
// (v7: the numbers live in segC_time.ts, which the sound's event list reads too; each case gets its drawer cell here)
type Case = CaseTime & { cell: Cell };
const CASES: Case[] = CASE_T.map((t, i) => ({ ...t, cell: CELLS[i] }));
/** the gag of each book over the frames (popbook.ts reads g its own way) */
const GAG: [number, number][][] = [
  [[CASES[0].open[0], 0], [W_.solid - 7, 0.2], [W_.year, 0.3], [W_.c04 - 5, 0.64], [W_.c04 + 2, 0.7], [W_.counts - 5, 0.92]],
  [[CASES[1].open[1], 0.1], [W_.bf - 3, 0.27], [W_.bf - 1, 0.3], [W_.bf + 10, 0.42], [W_.hide - 3, 0.91]],
  [[CASES[2].open[1], 0.1], [W_.appr - 5, 0.2], [W_.kyr + 8, 0.7], [W_.kyr + 15, 0.86], [W_.kyr + 21, 0.98]],
  [[CASES[3].open[1], 0.08], [W_.shake - 2, 0.15], [W_.tie - 5, 0.3], [W_.tie + 6, 0.42], [W_.chai + 6, 0.47], [W_.curse - 4, 0.6], [W_.curse + 12, 0.85], [W_.late + 12, 0.98]],
  [[CASES[4].open[1], 0.12], [W_.jade + 5, 0.27], [W_.c11 - 3, 0.45], [W_.c11, 0.6], [W_.c11 + 3, 0.68]],
];
/** how far each drawer is out on frame f: open for its book to leave, shut after it; open again to take it back */
const outs = (f: number) => CASES.map((c, i) => {
  const away = ky(f, [[c.s + 4, 0], [c.s + 8, OUT], [c.leave + 6, OUT], [c.leave + 12, 0]]), b = BACK[i];
  return b ? Math.max(away, ky(f, [[b[0] - 2, 0], [b[0] + 3, OUT], [b[1], OUT], [b[1] + (i === 0 ? 5 : 3), 0]])) : away;
});

// ------------------------------------------------------------------------------------------------- where he stands
const body = (f: number) => {
  const leg = toCab(f), walking = f < CAB_AT, turnK = smooth((f - (CAB_AT - 5)) / 11);
  // he turns a little toward each drawer as he beckons it, and toward where each book goes back
  let facing = FRONT;
  CASES.forEach((c, i) => { const k = ky(f, [[c.s - 4, 0], [c.s + 2, 1], [c.leave + 4, 1], [c.catch - 2, 0]]); facing += SIDE[i] * 0.38 * k; });
  for (const [i, b] of Object.entries(BACK)) { const k = ky(f, [[b[0] - 3, 0], [b[0] + 2, 1], [b[1] + 2, 1], [b[1] + 10, 0]]); facing += SIDE[+i] * 0.3 * k; }
  const at = BASE.clone();
  if (walking) at.copy(leg.at);
  if (turnK < 1) facing = turnTo(leg.facing, facing, turnK);
  return { at, facing, walking, leg };
};
/** the book held up in front of him on frame f (open 0..1); dy: a lift (the catch, the pride bob, the shield) */
const showAt = (f: number, open: number, dy = 0): BP => {
  const b = body(f), o = smooth(open), base = rel(BASE, FRONT, 0, 0, 0);
  void base;
  const at = rel(b.at, FRONT, 0.1 * (1 - o), SHOW_Y + dy, SHOW_Z);
  return { at, q: Q(faceTo(at, HER), TILT), open, s: 1 };
};

// ------------------------------------------------------------------------------------------------- each book's state
type Book = { bp: BP; g: number; held?: boolean; R?: THREE.Vector3; L?: THREE.Vector3 } | null;
const openOf = (c: Case, f: number) => (f < c.shut[0] ? ky(f, [[c.open[0], 0], [c.open[1], c.open[2]]]) : ky(f, [[c.shut[0], c.open[2]], [c.shut[1], 0]]));
/** while held up: the catch, the pride bob on 牢吧, the shield against the letters, the tremble of 手一抖 */
const lift = (i: number, f: number) => {
  const c = CASES[i]; let d = -0.03 * hit(f, c.catch, 9);
  if (i === 0) d += 0.025 * hit(f, W_.solid - 2, 12);
  if (i === 3) d += 0.05 * ky(f, [[W_.curse - 6, 0], [W_.curse, 1], [c.exit - 8, 1], [c.exit, 0]]) + (f >= W_.shake - 2 && f < W_.tie + 2 ? 0.007 * Math.sin(f * 2.7) : 0);
  if (i === 4) d += f >= c.catch && f < W_.that ? 0.004 * Math.sin(f * 3.1) : 0;   // (it is hot in his hands)
  return d;
};
const held = (i: number, f: number): Book => {
  const c = CASES[i], op = openOf(c, f), bp = showAt(f, op, lift(i, f));
  return { bp, g: ky(f, GAG[i]), held: true, R: bpt(bp, RH[0], RH[1], RH[2]), L: bpt(bp, ...LH(op)) };
};
/** where each flight bends (a point beside or over him, his place-relative: dx (+ his left), y, forward), so a book from a
 *  drawer behind him comes round his side or over his head, never through him */
const VIA: [number, number, number][] = [[-0.62, 1.0, 0.22], [0.8, 1.2, 0.05], [-0.62, 0.85, 0.3], [0.85, 1.05, 0.1], [0.05, 2.0, 0.25]];
const via = (i: number) => rel(BASE, FRONT, VIA[i][0], VIA[i][1], VIA[i][2]);
/** the way back, where it differs: 天仙配 goes up round his right shoulder (out of her frame and in again as she pulls
 *  back), never up across his face */
const VIA_BACK: Record<number, [number, number, number]> = { 4: [-0.95, 1.4, 0.15] };
const viaBack = (i: number) => (VIA_BACK[i] ? rel(BASE, FRONT, VIA_BACK[i][0], VIA_BACK[i][1], VIA_BACK[i][2]) : via(i));
/** a quadratic flight from a to b, k 0..1, bending through `mid`; with a flutter (roll) that dies */
const flight = (a: BP, b: BP, k: number, mid0: THREE.Vector3): BP => {
  const e = k < 0.5 ? 2 * k * k : 1 - 2 * (1 - k) * (1 - k), mid = mid0.clone(), u = 1 - e;
  const at = a.at.clone().multiplyScalar(u * u).add(mid.multiplyScalar(2 * e * u)).add(b.at.clone().multiplyScalar(e * e));
  const r = lerpBP(a, b, smooth(k)); r.at = at;
  r.q.multiply(Q(0, 0, 0.35 * Math.sin(k * Math.PI * 3) * (1 - k)));
  return r;
};
const BOOK = (i: number, f: number, behind?: (f: number) => BP | null): Book => {
  const c = CASES[i], out = outs(f)[i], inside: Book = out > 0.004 ? { bp: inDrawer(c.cell, out), g: 0 } : null;
  if (f < c.leave) return inside;
  if (f < c.catch) return { bp: flight(inDrawer(c.cell, OUT), showAt(c.catch, 0), (f - c.leave) / (c.catch - c.leave), via(i)), g: 0 };
  if (i === 1 && f >= W_.hide) { const hb = behind?.(f); return hb ? { bp: hb, g: 0 } : { bp: onFloor(FLOOR2, 0.6), g: 0 }; }
  if (f < c.exit) return held(i, f);
  const b = BACK[i];
  if (b) {
    if (f < b[1]) return { bp: flight(showAt(b[0], 0), inDrawer(c.cell, OUT), (f - b[0]) / (b[1] - b[0]), viaBack(i)), g: 0 };
    return inside;
  }
  // 白蛇传: let fall at his feet, a short fall turning flat, one small bounce
  const a = showAt(c.exit, 0), fl = onFloor(FLOOR3, 0.35), u = Math.min(1, (f - c.exit) / 8), bp = lerpBP(a, fl, smooth(u));
  bp.at.y = a.at.y + (fl.at.y - a.at.y) * u * u + 0.03 * Math.sin(Math.PI * Math.min(1, Math.max(0, (f - c.exit - 8) / 5)));
  return { bp, g: 0 };
};
/** what stays behind from scene C on: 梁祝 on the floor behind where he stood, 白蛇传 at his feet. Scene D calls this. */
export const cabinetMess = (w: World, f: number) => {
  void f;
  const put = (kind: BookKind, b: BP) => { const e = new THREE.Euler().setFromQuaternion(b.q, "YXZ"); w.props.book(kind).put(b.at, { yaw: e.y, pitch: e.x, roll: e.z, scale: b.s }).set({ open: 0 }); };
  put("liangzhu", onFloor(FLOOR2, 0.6)); put("baishe", onFloor(FLOOR3, 0.35));
};

export const SEG: Segment = {
  id: "C", from: S.from, to: S.to, enter() {}, exit() {},
  pose(w, f) {
    w.setPlace("office"); w.set.param("tangle", 0.46); w.set.param("kpi", 0); w.set.param("smoke", 0);
    w.set.param("knobs", outs(f).reduce((m, x, i) => m | (x > 0.004 ? 1 << i : 0), 0));   // (an open drawer's knob goes out with it)
    const t = W_;
    // ---------------------------------------------------------------------------------------------- the camera
    const C0: Omit<ShotKey, "f"> = { pos: [-0.55, 1.5, 1.2], at: [-2.72, 1.0, -0.4], sx: 540, sy: 960, fov: 56 };
    const MP: [number, number, number] = [-0.44, 1.45, 1.43];
    // (the medium keeps his dome under the REC row and the book's bottom over the subtitles; for what flies up out of a
    // book she widens instead of tilting, so nothing he holds slides down into the subtitles)
    const MED: Omit<ShotKey, "f"> = { pos: MP, at: [-2.02, 0.88, -0.22], sx: 548, sy: 860, fov: 46 };
    const BFLY: Omit<ShotKey, "f"> = { ...MED, sy: 900, fov: 54 };
    const SLIPS: Omit<ShotKey, "f"> = { ...MED, sy: 920, fov: 57 };
    const CLOSE: Omit<ShotKey, "f"> = { pos: [-0.72, 1.43, 1.12], at: [-2.04, 0.92, -0.24], sx: 548, sy: 850, fov: 47 };   // (v6b: 43 left the jade seal at the frame edge)
    const WIDE: Omit<ShotKey, "f"> = { pos: CAM_C1.pos, at: CAM_C1.look, sx: 540, sy: 960, fov: CAM_C1.fov };
    const K = (k: number, c: Omit<ShotKey, "f">): ShotKey => ({ f: k, ...c });
    const [c1, c2, c3, c4, c5] = CASES;
    let camera = shotCam("office", f, [
      K(S.from, C0), K(c1.s, C0), K(c1.catch + 4, MED),
      K(t.bf + 3, MED), K(t.bf + 18, BFLY), K(t.hide - 8, BFLY), K(t.hide + 7, MED),
      K(t.appr + 4, MED), K(t.appr + 26, SLIPS), K(t.kyr + 12, SLIPS), K(c3.exit + 4, MED),
      K(c5.catch - 6, MED), K(t.jade + 30, CLOSE), K(BACK[4][0], CLOSE), K(BACK[4][0] + 34, WIDE), K(S.to, WIDE),
    ], { mood: "calm", amp: 0.5, walk: [[S.from, 0], [c1.s, 0], [c1.s + 8, 0.25], [c1.catch + 4, 0], [BACK[4][0], 0], [BACK[4][0] + 10, 0.3], [BACK[4][0] + 34, 0]] });
    camera = kick(kick(camera, f, t.curse - 4, 0.03), f, t.c11 + 2, 0.025);   // the letters burst at her; the seal slams down
    const W = whip(camera, f, S.from - 4, { dir: -1, to: camera });
    camera = W.cam;
    w.setCamera(camera);
    // ---------------------------------------------------------------------------------------------- where he stands
    const B = body(f), { at, facing, walking, leg } = B;
    const H = (dx: number, y: number, z: number) => rel(at, facing, dx, y, z);
    // (his hands at rest hang a little wider and further forward than the kit's: his robe is a wide bell)
    const hangR = rel(at, facing, -0.228, 0.59, 0.05), hangL = rel(at, facing, 0.228, 0.59, 0.05);   // (where the rig's own idle puts them, so handing over to it never jumps)
    void hang;
    const pullUp = f < CAB_AT + 10 ? ky(f, [[CAB_AT - 9, 8], [CAB_AT - 2, -5], [CAB_AT + 3, -2.5], [CAB_AT + 10, 0]]) : 0;
    // ---------------------------------------------------------------------------------------------- 这单别记: behind his back
    // each hand round its own side of him (never through him), the book in his right; k 0 = in front, 1 = behind
    const swing = (arm: 0 | 1, k: number) => { const phi = ((18 + 137 * k) * Math.PI) / 180, r = 0.337 - 0.117 * k + 0.04 * Math.sin(Math.PI * k); return H((arm ? 1 : -1) * r * Math.sin(phi), 0.77 - 0.15 * k, r * Math.cos(phi)); };
    const h0 = t.hide, HIDE_N = 14, let2 = c2.exit;
    const hideK = smooth((f - h0) / HIDE_N);
    const hiding = f >= h0 && f < let2 + 10;
    /** the book from the hold into his right hand at his side, round behind him with it; let go behind him, it drops */
    const behind = (g: number): BP | null => {
      if (g < h0) return null;
      const k = smooth((g - h0) / HIDE_N), phi = ((18 + 137 * k) * Math.PI) / 180, hand = swing(0, k), yaw = facing - phi;
      const side: BP = { at: hand.clone().add(V(Math.sin(yaw), 0, Math.cos(yaw)).multiplyScalar(0.03)).add(V(0, -0.02, 0)), q: Q(yaw), open: 0, s: 1 };
      side.at.add(V((PW / 2) * side.s, 0, 0).applyQuaternion(side.q));   // (his hand at the middle of the book's face)
      if (g < let2) return lerpBP(showAt(h0, 0), side, smooth((g - h0) / 4));
      const u = Math.min(1, (g - let2) / 9);
      if (u >= 1) return null;
      // (v6c: it leaves his back at once and falls clear of the bell of his robe: out fast, down with gravity)
      const fl = onFloor(FLOOR2, 0.6), away = 1 - (1 - u) ** 2.5, bp = lerpBP(side, fl, smooth(u));
      bp.at.x = side.at.x + (fl.at.x - side.at.x) * away; bp.at.z = side.at.z + (fl.at.z - side.at.z) * away;
      bp.at.y = side.at.y + (fl.at.y - side.at.y) * u * u;
      return bp;
    };
    // ---------------------------------------------------------------------------------------------- the books
    const books = KINDS.map((_, i) => BOOK(i, f, i === 1 ? behind : undefined));
    // ---------------------------------------------------------------------------------------------- his hands
    // the beckon: the near hand comes up open toward the drawer, then draws back (come here); both hands come to meet
    // the book as it lands; after a book goes, they rest low
    const beckon = (i: number) => { const sd = SIDE[i]; return i === 4 ? [H(-0.32, 0.86, 0.3), H(-0.24, 0.8, 0.32)] as const : [H(sd * 0.3, 0.98, 0.16), H(sd * 0.22, 0.9, 0.26)] as const; };   // (the top drawer: a timid beckon, low, out in front of him)
    const rest = (sd: number) => H(sd * 0.2, 0.6, 0.14);
    const KR: [number, THREE.Vector3][] = [[CAB_AT + 3, hangR], [t.mine - 9, hangR]], KL: [number, THREE.Vector3][] = [[CAB_AT + 3, hangL], [t.mine - 9, hangL]];
    CASES.forEach((c, i) => {
      const [up, draw0] = beckon(i), mine = SIDE[i] < 0 ? KR : KL, other = SIDE[i] < 0 ? KL : KR, sd = SIDE[i];
      mine.push([c.s - 3, mine === KR ? rest(-1) : rest(1)], [c.s + 3, up], [c.leave + 1, up], [c.leave + 5, draw0]);
      other.push([c.s + 2, other === KR ? rest(-1) : rest(1)]);
      void sd;
    });
    for (const [i, b] of Object.entries(BACK)) {
      // the toss back: both hands follow it toward its drawer, then come down to rest
      const sd = SIDE[+i], toss = [H(sd * 0.24 - 0.06, 0.78, 0.38), H(sd * 0.24 + 0.06, 0.78, 0.38)];
      if (+i !== 4) { KR.push([b[0] + 4, toss[0]], [b[0] + 12, rest(-1)]); KL.push([b[0] + 4, toss[1]], [b[0] + 12, rest(1)]); }
      else { KR.push([b[0] + 3, H(-0.06, 0.7, 0.34)], [b[0] + 14, H(-0.16, 0.56, 0.18)]); KL.push([b[0] + 3, H(0.14, 0.78, 0.36)], [b[0] + 14, H(0.16, 0.56, 0.18)]); }   // (it pulls out of them up past his right shoulder: the right hand drops out of its way; they stay up, empty, then sink)
    }
    KR.push([CASES[2].exit + 3, H(-0.22, 0.62, 0.3)]); KL.push([CASES[2].exit + 3, H(0.22, 0.62, 0.3)]);   // (白蛇传 let fall: the hands open)
    KR.push([let2 + 8, rest(-1)]); KL.push([let2 + 8, rest(1)]);
    KR.sort((a, b) => a[0] - b[0]); KL.sort((a, b) => a[0] - b[0]);
    let R = through(f, KR), L = through(f, KL);
    // a held book: the hands are where its grips are. Coming in, they meet it over its last 8 frames.
    books.forEach((b, i) => { if (b?.held && b.R && b.L) { R = b.R; L = b.L; } void i; });
    CASES.forEach((c, i) => {
      if (f >= c.catch - 8 && f < c.catch) {
        const k = smooth((f - (c.catch - 8)) / 8), at0 = showAt(c.catch, 0);
        R = R.clone().lerp(bpt(at0, RH[0], RH[1], RH[2]), k); L = L.clone().lerp(bpt(at0, ...LH(0)), k);
      }
      void i;
    });
    if (hiding) {
      const k0 = smooth((f - h0) / 4), b0 = showAt(h0, 0), out = smooth((f - let2) / 6);
      const sR = swing(0, hideK), sL = swing(1, hideK);
      R = bpt(b0, RH[0], RH[1], RH[2]).lerp(sR, k0); L = bpt(b0, ...LH(0)).lerp(sL, k0);
      // let go behind him, the hands come back round his sides the way they went (never through him)
      if (f >= let2) { const kb = 1 - smooth((f - let2) / 10); R = swing(0, kb); L = swing(1, kb); void out; }
    }
    const hands: [THREE.Vector3, THREE.Vector3] | undefined = walking || f < CAB_AT + 3 || f > BACK[4][0] + 30 ? undefined : [R, L];
    // ---------------------------------------------------------------------------------------------- his face
    // one face per thought, each on the beat that causes it
    const faces: MoodKey[] = [
      [S.from, "eager"], [t.mine - 3, "proud"],                                   // 我的老业绩
      [t.year + 10, "small", "sink"], [t.c04 - 3, "sheepish"],                       // 一年见一次 · 异地恋，也算成
      [t.c05 - 4, "proud"], [t.bf - 1, "wonder", "take", 0.7], [t.hide - 4, "sly"],  // 梁祝 · 变蝴蝶了 · 这单别记
      [c3.s + 2, "proud"], [t.appr + 22, "tired", "sink"],                          // 许仙白娘子 · 一千年
      [t.c07 - 2, "tender"], [t.shake - 3, "worry"], [t.tie, "aghast", "take", 0.6], [t.curse - 2, "small"],   // 宝黛 · 手一抖 · 宝钗 · 骂了我
      [c5.s - 2, "dread"], [t.jade + 1, "grave", "take", 0.5], [t.c11 + 2, "lost", "sink"],                     // 七仙女 · 玉帝的亲闺女 · 扣了
    ];
    const win = (a: number, up: number, hold: number, down: number) => ky(f, [[a, 0], [a + up, 1], [hold, 1], [hold + down, 0]]);
    // where his eyes and head go: to each drawer he calls, down at a book as its gag goes wrong, up after what flies out
    // of it, to her on the punch
    const downMag = win(t.year + 2, 8, t.c04 - 6, 6), downFlip = win(t.tie - 8, 6, t.chai + 4, 6);
    const upBf = win(t.bf + 4, 8, t.hide - 10, 6), upSlips = win(t.appr + 6, 14, t.kyr + 12, 10), upSeal = win(t.jade - 2, 6, t.c11 - 2, 6);
    const upTop = win(c5.s - 2, 6, c5.leave + 8, 8), downLow = win(c3.s - 2, 5, c3.leave + 6, 8);
    const cower = win(t.curse - 5, 5, c4.exit - 8, 8), droop = ky(f, [[t.c11 + 2, 0], [t.c11 + 12, 0.6], [BACK[4][1], 0.6], [BACK[4][1] + 10, 1]]);
    const calling = CASES.reduce((a, c, i) => a + SIDE[i] * win(c.s - 4, 5, c.leave + 5, 6), 0);
    const r = act(w, f, YL, {
      at, facing, faces,
      pose: walking ? leg.pose : undefined,
      hands,
      lookDown: 12 * downMag + 12 * downFlip - 6 * upBf - 8 * upSlips - 8 * upSeal - 14 * upTop + 12 * downLow + 9 * cower + 12 * droop,
      gaze: Math.abs(calling) > 0.2 ? 0.6 * calling : upBf > 0.2 ? 0.45 * upBf : downMag + downFlip > 0.2 ? 0 : undefined,
      lean: { pitch: pullUp + 6 * cower + 7 * droop - 5 * upSeal - 3 * upSlips - 4 * upTop + 6 * downLow, roll: 0 },
      head: { dy: -0.04 * cower - 0.05 * droop + 0.03 * upSeal + 0.04 * hit(f, t.bound + 2, 8) - 0.03 * hit(f, CAB_AT - 1, 9), tilt: 6 * upBf + 4 * Math.sin(f * 0.15) * upSlips },
    });
    w.update();
    // ---------------------------------------------------------------------------------------------- the drawers and the books
    const out = outs(f);
    out.forEach((x, i) => { if (x > 0.004) { w.prop("caseDrawer", `d${i}`).put(P("office", CABX + x, CELLS[i].y, CELLS[i].z)); w.prop("hole", `h${i}`).put(P("office", CABX, CELLS[i].y, CELLS[i].z)); } });
    // a held book goes with his real hands (they may fall a little short of where they were asked to be)
    const r0 = r.handWorld(0), r1 = r.handWorld(1);
    books.forEach((b, i) => {
      if (!b) return;
      const bp = { ...b.bp, at: b.bp.at.clone() };
      if (b.held && b.R && b.L) bp.at.add(r0.clone().sub(b.R).add(r1.clone().sub(b.L)).multiplyScalar(0.5));
      else if (i === 1 && hiding && f < let2) bp.at.add(r0.clone().sub(R));
      const e = new THREE.Euler().setFromQuaternion(bp.q, "YXZ");
      w.props.book(KINDS[i]).put(bp.at, { yaw: e.y, pitch: e.x, roll: e.z, scale: bp.s }).set({ open: bp.open, g: b.g, t: f / 30 });
    });
    // ---------------------------------------------------------------------------------------------- over the picture
    // one 演绎 seal on his first claim (the cases are legends; his part in them is ours); her OS on 这单别记
    const FX: Fx[] = [
      truth(f, { from: t.bound + 6, to: t.bound + 80, x: 214, y: 476, kind: "演绎" }),
      os(f, { from: t.noted + 6, to: t.noted + 46, x: 112, y: 860, text: "记下了" }),
    ];
    void c4;
    return { camera, overlays: [draw(f, FX), whipSmear(W.smear, -1)], shown: FX, post: W.post };
  },
};
