// Segment B (lines 5-9): THE INFORMER IS PLANTED. Xiang Yu's quarters at night (a red officer scurries in, kneels at
// his ear and whispers behind his hand; the fist comes down, "tomorrow we hit him", the arm points out of the door);
// Liu Bang's camp the same night (the uncle runs in with the warning; Liu Bang hands him his cup: the two families
// are pledged); the camp gate next morning (the bow, "some petty man": a black figure with a "?"; Xiang Yu blurts
// the man's NAME: the figure gets a face).
// Five shots, four cuts, three designed place changes:
//   5   nightX two-shot   the officer runs in from the right, kneels, whispers behind his hand; the camera pushes in
//                         on the secret until the two faces fill the frame, and he says the words
//   6   nightX, from low  the fist on the table, the officer shrinks away; "tomorrow we hit him": Xiang Yu's arm
//                         points out of the door                              (push on the blow)
//       -> WHIP PAN RIGHT (the way the arm points: to Liu Bang's camp)
//   7   nightL two-shot   the uncle runs in to Liu Bang (who stands by his fire, a cup in his hand), points back
//                         twice; Liu Bang hands him the cup with a bow of the hands: 亲家  (push on the pledge)
//       -> WHIP PAN LEFT (back to Xiang Yu's camp, morning)
//   8   the gate, wide    Liu Bang walks up and bows; he speaks bowed; on 小人 the window of the unknown man pops
//                         (push from the establishing wide to the two men)
//   9   the gate, close   Xiang Yu laughs it off and names the man: the window gets its face and its name; Liu
//                         Bang's head comes up, his eyes go to the window    (held still)
//       -> FLAP WIPE into the banquet (segment C uncovers)
// Every frame number is looked up (beats.ts, cap / line / quote): see B below. The shots are pure functions of f.
// Notes: /home/user/hm_notes/seg_B.md.
import type * as THREE from "three";
import type { Expr } from "../../group/kit/toon";
import { COL } from "../../group/kit/overlay";
import type { CamPose, Pose, Quote, Segment, V3Like, Vec3 } from "../story";
import { SEGMENTS, cap, line, quote, lin, smooth, clamp01, lerp, easeInOutCubic, easeOutCubic, easeOutBack, camMix } from "../story";
import type { World } from "../world";
import { shot, HIT, TAG, TAG_LEN } from "../beats";
import { CAMS, CART, GATE, NIGHT_L, NIGHT_X } from "../layout";
import { FPS, PEOPLE, V, accent, at, cam, frag, headPx, heads, kick, kneel, ky, lid, path, seated, speak, staged, swaps, walkAlong, walkTime, yawTo, type Rig, type RigState } from "./common";
import { inset, stamp, tag } from "../hud";
import { anger, burst, flapWipe, mystery, streak } from "./segB_ov";
import { FACE } from "./segB_face";

const S = SEGMENTS[1];
type Ex = Expr;
type St = Partial<RigState>;

// ====================================================================================================== the beats
const N5 = NIGHT_X, I5 = N5.informer, NL = NIGHT_L, G = GATE;
/** the officer's OWN kneeling mark: 5 cm further from Xiang Yu than the layout's and 10 cm nearer the lens (on the
 *  layout's mark the tip of the bigger Xiang Yu's shoulder guard met the officer's arm) */
const K5 = I5.at.clone().add(V(0.05, 0, 0.1));
/** the height of a head's centre (m) as the picture shows it (measured on stills of shots 5 and 7 through their
 *  cameras): the kneeling officer's, the standing uncle's */
const HEAD5_Y = 0.83, HEAD7_Y = 1.25;
/** Liu Bang's OWN mark at the gate (the layout's GATE.liuTo is 0.8 m from Xiang Yu: the bow put his head 10 cm from
 *  the bigger Xiang Yu's shoulder guard): 0.9 m away and a little further back */
const L8 = V(G.xiangyu.x + 0.9, 0, 1.05);
/** line 7, OWN marks: the two men 8 cm nearer each other than the layout's (a hand that GRIPS the cup sits 4 cm
 *  nearer its middle than one that touches its side); the uncle's run starts 1.3 m left of his mark (the layout's
 *  uncleFrom is further out: a camera that holds him from there looks past the tent's left end into the dark) */
const U7 = NL.uncle.clone().add(V(0.04, 0, 0)), LB7 = NL.liu.clone().add(V(-0.04, 0, 0)), U_FROM = V(U7.x - 1.3, 0, -0.3);
const Q5 = quote("caoWushang", 5), Q6 = quote("xiangYu", 6), Q8 = quote("liuBang", 8), Q9 = quote("xiangYu", 9);
const S5 = shot("5"), S6 = shot("6"), S7 = shot("7"), S8 = shot("8"), S9 = shot("9");
/** speeds (m/s): the officer scurries, the uncle runs, Liu Bang walks up */
const RUN5 = 2.0, RUN7 = 2.9, WALK8 = 1.3;
/** the frame on which syllable i (from 0) of a quote starts */
const syl = (q: Quote, i: number) => Math.round(q.from + (i * (q.to - q.from + 1)) / q.syl);
const B = (() => {
  // ---- line 5: he sets off outside the frame five frames before the first word, so that he is down on his knees
  //      when his tag lands (TAG.officer)
  const go = line(5).from - 5, arrive = go + Math.ceil(walkTime([I5.from, K5], RUN5) * FPS);
  const words = Q5.from;                                   // the first frame of his words (the push-in has arrived)
  const flick = syl(Q5, 3);                                // his eyes flick to us on "称"; Xiang Yu hears "称王"
  // ---- line 6
  const slam = HIT.slam, hit2 = syl(Q6, 3);                // the fist lands; on "打" the arm points out of the door
  const smug6 = slam + 17;                                 // the officer has what he came for
  // ---- line 7
  const uncleAt = TAG.uncle - 5;                           // he stops 5 frames before his tag (he runs in under the whip pan, on "当晚")
  const uncleGo = uncleAt - Math.ceil(walkTime([U_FROM, U7], RUN7) * FPS);
  const pt1 = cap(7, 2).from + 1, pt2 = pt1 + 9;           // "跑来报信": he points back, twice
  const two7 = HIT.toast, pledge = HIT.qinjia, sly = pledge + 14;
  const take = two7 + 15, give = take + 2;                 // the uncle's hand is on the cup; Liu Bang lets go
  // ---- line 8
  const liuAt = HIT.bow - 2;                               // he arrives; the bow goes down on "上门赔罪"
  const liuGo = liuAt - Math.ceil(walkTime([G.liuFrom, L8], WALK8) * FPS);
  const xiaoren = syl(Q8, 4);                              // "小人": a shake of the clasped hands, the unknown man's window
  const soften = xiaoren + 14;                             // Xiang Yu's scowl eases
  // ---- line 9
  const lift = S9.from - 3;                                // his hand starts up 3 frames before the cut
  const pointGo = Q9.from - 3, name = HIT.name;
  const up9 = name + 3, narrow9 = name + 13;               // Liu Bang's head comes up; his eyes narrow (and stay so)
  const wipe = S.to - 3;                                   // the last frame before the cloth
  return { go, arrive, words, flick, inform: HIT.inform, slam, hit2, smug6, uncleGo, uncleAt, pt1, pt2, two7, take, give, pledge, sly, liuGo, liuAt, xiaoren, soften, lift, pointGo, name, up9, narrow9, wipe };
})();

// ====================================================================================================== cameras
const arr3 = (p: V3Like): Vec3 => (Array.isArray(p) ? p : [p.x, p.y, p.z]);
/** the camera turned by `a` radians about the vertical through its own position (+ = to the right) */
const panned = (c: CamPose, a: number): CamPose => {
  if (!a) return c;
  const p = arr3(c.pos), l = arr3(c.look), dx = l[0] - p[0], dz = l[2] - p[2], cs = Math.cos(a), sn = Math.sin(a);
  return { ...c, look: [p[0] + dx * cs - dz * sn, l[1], p[2] + dx * sn + dz * cs] };
};
/** the camera moved the share k of the way to its own look point (a push-in on its own axis; k < 0 = back) */
const pushed = (c: CamPose, k: number): CamPose => { const p = arr3(c.pos), l = arr3(c.look); return { ...c, pos: [lerp(p[0], l[0], k), lerp(p[1], l[1], k), lerp(p[2], l[2], k)] }; };
/** the camera aimed dx metres to the side of its look point (a pan that keeps the tripod) */
const aimed = (c: CamPose, dx: number): CamPose => { const l = arr3(c.look); return { ...c, look: [l[0] + dx, l[1], l[2]] }; };
/** THE WHIP PAN: 26 degrees in three frames before the cut (it starts hard only under the streak), and the new shot
 *  comes to rest over its first three frames. dir 1 = the camera pans RIGHT. */
const WHIP = 0.46;
const whipOut = (f: number, cut: number, dir: 1 | -1, amp = WHIP) => dir * amp * Math.pow(lin(f, cut - 4, cut - 1), 2);
const whipIn = (f: number, cut: number, dir: 1 | -1) => -dir * WHIP * Math.pow(1 - lin(f, cut - 1, cut + 3), 3);
/** the smear over a whip pan round the cut (frames cut - 3 .. cut + 2) */
const whipStreak = (f: number, cut: number, dir: 1 | -1, cols: string[]) => streak({ f, from: cut - 3, to: cut + 2, cut, dir, cols });
const NIGHT_COLS = ["#232a5c", "#3a3378", "#161a3e", "#5a4a86"], DAWN_COLS = ["#2a3168", "#8fa4d8", "#e8d9b0", "#4a4a86"];

/** shot 5, where the push-in on the whisper ENDS (on the layout's nightX axis, 1.2 x nearer): the two faces fill the
 *  frame: Xiang Yu's whole face at the left (the frame's edge cuts his hair, not his face), the officer's head 37 % of
 *  the width at 71 % x, his hand between them, his cap whole under the top margin */
const T5 = cam([-29.795, 1.75, 3.32], [-29.975, 0.57, 0.03], 36);
/** shot 6, FROM LOW (level with the two heads; shot 5 looks down on them): Xiang Yu looms, the table's top and the
 *  fist on it sit at 53 % of the height (above the captions), both men and both shoulder guards whole. X6LW = where
 *  the shot starts (the push on the blow ends on X6L). */
const X6L = cam([-30.02, 0.85, 4.46], [-30.02, 0.42, 0.03], 36), X6LW = cam([-30.02, 0.87, 4.9], [-30.02, 0.42, 0.03], 36);
/** shot 7 (the layout's campNight seen from 0.28 m further left and aimed up a little): both men from the first
 *  frame, and the tent's 刘 banner WHOLE in the upper left (its left edge 45 px inside the frame, the character at
 *  12 .. 25 % of the height: under the source tag's line, above the uncle's cap). C7 = where the push on the pledge
 *  ends: only 0.4 m nearer, because a longer push carries the banner's character out through the frame's corner
 *  (half a 刘 at the edge read as a fault) or Liu Bang's face into the right margin. */
const C7W = cam([29.7, 1.35, 4.9], [29.9, 1.16, -0.5], 40), C7 = cam([29.7, 1.33, 4.5], [29.885, 1.2, -0.5], 40);
/** shot 8: the gate from 0.35 m right of CAMS.gate, a little longer lens (47), aimed left and up: of the gate's two
 *  项 banners (they hang 7.1 m apart, wider than the frame at this distance: the layout's camera cuts one in half,
 *  a camera aimed at the gate's middle cuts both) the LEFT one is whole, above Xiang Yu, its character under the
 *  source tag's line; the right one is outside the frame. The 鸿门 board is whole at 15 .. 24 % of the height, the
 *  chariot whole at the right. The shot starts 0.8 m further back (GATE8W) and pushes in on the bow to GATE8IN
 *  (shot 9 is then 1.5 x nearer: a cut-in, not a jump). */
const GATE8W = cam([91.242, 1.366, 6.88], [89.452, 1.09, -6], 47), GATE8IN = cam([91.133, 1.3275, 6.075], [89.381, 1.09, -6], 47);
/** shot 9: CAMS.gateXY with a wider lens (36), from 0.5 m higher: the gate's board leaves the top of the frame
 *  (half a board cut by the edge read as a fault), Liu Bang's cap stays under the window's plate */
const GATE9 = cam([90.66, 1.9, 5.6], [90.425, 1.15, 1.25], 36);

// ====================================================================================================== small helpers
const sq = (x: number) => x * x;
const clampN = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
/** where an UNPINNED hand is this frame (it solves the figures as they are set so far): a pinned gesture starts from
 *  it and returns to it, so pinning and releasing a hand never pops */
const restHand = (w: World, r: Rig, arm: 0 | 1) => { w.update(); return r.handWorld(arm).clone(); };
/** a head offset (a speech lean, an accent) at the share k: for a head that already sits low (a kneel, a bow), where
 *  the full lean would carry it into its own shoulder */
const soft = (hd: ReturnType<typeof heads>, k: number): ReturnType<typeof heads> => (hd ? { ...hd, dx: (hd.dx ?? 0) * k, dy: (hd.dy ?? 0) * k, tilt: (hd.tilt ?? 0) * k } : hd);
/** a head that STANDS STILL on screen, for a name tag (hud/tag.tsx takes { x, y, r } as shots/common.ts headPx gives
 *  it): c = where the head's centre comes to rest in the world. The tag hangs over that spot and does not ride the
 *  man's head through a lean or a pant. */
const fixedHead = (w: World, c: THREE.Vector3) => { const p = w.project(c), q = w.project(c.clone().add(V(0, 0.24, 0))); return { x: p.x, y: p.y, r: Math.abs(p.y - q.y) }; };
const LOG = !!(globalThis as { __HM_LOG_B?: boolean }).__HM_LOG_B;
const log = (f: number, s: string) => { if (LOG) console.log(`QA:B f${f} ${s}`); };
const px = (p: { x: number; y: number }) => `${Math.round(p.x)},${Math.round(p.y)}`;
const v3s = (p: THREE.Vector3) => `${p.x.toFixed(2)},${p.y.toFixed(2)},${p.z.toFixed(2)}`;

// ====================================================================================================== lines 5-6: Xiang Yu's quarters
/** where the officer shrinks to when the fist lands (7 cm off his mark, with a start: the layout's flinch point is
 *  measured from the layout's mark) */
const FLINCH6 = K5.clone().add(V(0.07, 0, 0));
/** where the whispering hand rests, from the officer's kneeling mark K5: beside his jaw on Xiang Yu's side, 0.26 m
 *  in front of his body (it was at body depth, inside the hanging flap of the bigger Xiang Yu's shoulder guard, which
 *  reaches 0.45 m out from his middle and 0.22 m forward) */
const WHISPER = V(-0.3, 0.72, 0.26);
/** THE TRACK of the two men in Xiang Yu's quarters over lines 5 and 6 (frames S5.from .. S7.from - 1), for whichever
 *  camera looks at them. Returns the figures and where the fist lands. */
function nightX(w: World, f: number) {
  const t = f / FPS, XY = w.actor(PEOPLE.xiangYu), CW = w.actor(PEOPLE.caoWushang);
  // ---- the officer: runs in bent (a look back over his shoulder), kneels (a sink), leans to the ear with a hand
  //      beside his mouth, says it; starts away from the fist; ends smiling, his eyes on where Xiang Yu points
  const leg = walkAlong([I5.from, K5], RUN5, (f - B.go) / FPS, { endFacing: I5.facing, bounce: 0.5 });
  const kn = easeInOutCubic(lin(f, B.arrive + 1, B.arrive + 8));
  const fl = easeOutCubic(lin(f, B.slam, B.slam + 4));
  const lean = ky(f, [[B.inform - 4, 0], [B.inform + 5, 1]]) * (1 - fl);
  const duck = ky(f, [[B.slam, 0], [B.slam + 3, 1], [B.slam + 12, 1], [B.smug6 + 3, 0.2], [B.hit2 - 2, 0.2], [B.hit2 + 3, 0.7]]);
  // the lean is the whole man shifting to the ear (a head pushed sideways on its own runs into his shoulder); 4 cm
  // leaves a hand's width of air between the two heads; the start on the blow is a small hop on his knees
  const start = 0.05 * Math.sin(Math.PI * lin(f, B.slam, B.slam + 5));
  const p = leg.at.clone().lerp(FLINCH6, fl).add(V(-0.04 * lean, start, 0));
  const EXC: [number, Ex][] = [[0, "nervous"], [B.arrive + 3, "smug"], [B.slam, "shock"], [B.slam + 9, "nervous"], [B.smug6, "smug"]];
  const sayC = speak(Q5, f, 5);
  CW.set({
    at: p, facing: leg.facing, pose: leg.pose, ...kneel(kn, p, 0),
    lookDown: leg.moving ? 9 : 12 * kn * (1 - clamp01(lean)) + 2 * kn,
    expr: at(f, EXC), blink: sayC.blink ?? lid(t, 13, swaps(EXC)), mouth: sayC.mouth,
    gaze: at(f, [[0, -1], [B.go + 9, 1], [B.go + 14, -1], [B.flick, 0], [B.flick + 5, -1], [B.slam + 9, -0.5], [B.smug6, -1], [B.hit2 + 1, 1]]),
    head: heads({ dy: -0.07 * kn - 0.05 * duck, dx: -0.015 * lean + 0.02 * duck, tilt: -6 * lean + 5 * duck }, soft(accent("jolt", f, B.slam, { amp: 0.7 }), 0.6), soft(accent("nod", f, B.smug6 + 4), 0.6), soft(sayC.head, 0.45)),
    visible: true,
  });
  // the whisper: his right hand (the one on Xiang Yu's side) comes up beside his mouth on "告密" and stays there
  // while he says the words; it is down again when the words end. On his knees (from the kneel to the blow) that arm
  // is pinned with the rig's "point" pose, whose elbow drops DOWN: the idle pose swings the elbow out and back, and
  // with the hand raised it went into the hanging flap of Xiang Yu's shoulder guard (clearance check, 2.6-4.5 cm,
  // f420-478). The pose changes in the middle of the kneel and back on the blow, both under a big move of the whole
  // man (only the idle's 1.2 degree sway and the bow of a straight hanging arm change on those frames).
  const wh = ky(f, [[B.inform - 4, 0], [B.inform + 4, 1], [Q5.to - 5, 1], [Q5.to + 1, 0]]);
  if (f >= B.arrive + 4 && f < B.slam) {
    const rest = restHand(w, CW, 0), e = smooth(wh);
    // a fixed point beside the rested head (it does not ride the lean or the speaking head: a hand that followed the
    // head carried the elbow into his chest), and on the way up and down the hand passes in front of the flap
    const bulge = e * Math.sin(Math.PI * e);
    CW.set({ pose: { kind: "point", arm: 0, t }, hands: [rest.lerp(K5.clone().add(WHISPER), e).add(V(0.03 * bulge, 0, 0.08 * bulge)), null] });
  }
  // ---- Xiang Yu at his table: bored; his eyes follow the man in; he tilts an ear to him; "称王" goes in (a jolt,
  //      the scowl turns to fury); the fist; he roars it and his arm points out of the door
  const sayX = speak(Q6, f, 4, [3]);
  const EXX: [number, Ex][] = [[0, "stern"], [B.flick + 3, "huff"]];
  const listen = ky(f, [[B.inform - 2, 0], [B.inform + 6, 1], [B.flick + 2, 1], [B.flick + 6, 0]]);
  XY.set({
    ...seated(N5.seat, t), expr: at(f, EXX), blink: sayX.blink ?? lid(t, 4, swaps(EXX)), mouth: sayX.mouth,
    gaze: at(f, [[0, 0], [B.go + 11, 1], [B.arrive + 9, 0], [B.inform + 2, 1], [B.inform + 14, 0], [B.words + 4, 1], [B.flick + 3, 0], [B.hit2, 1]]),
    head: heads({ tilt: 5 * listen }, accent("jolt", f, B.flick + 3, { amp: 0.6 }), accent("pop", f, B.slam), accent("jolt", f, B.hit2, { amp: 0.8 }), sayX.head),
    visible: true,
  });
  let down: THREE.Vector3 | null = null;
  if (f >= B.slam - 6) {
    // the fist goes up beside his crown (out to his right, clear of the chest) and comes straight down; it stays
    // planted where it landed
    const rest = restHand(w, XY, 0), rest1 = XY.handWorld(1).clone(), up = rest.clone().add(V(-0.22, 0.54, -0.14));
    down = rest.clone().add(V(0, 0, 0.03));
    const fist = path(f, [[B.slam - 6, rest], [B.slam - 2, up, easeOutCubic], [B.slam, down, sq]]);
    // "打他": the left arm thrown up and out toward the door and the night outside it (screen right: where the
    // officer came from, where Liu Bang's camp is), above the kneeling officer's cap
    const out = staged(w, V(N5.seat.top.x, 0, N5.seat.top.z), 0.36, 0.94, 0.18), jab = 0.03 * Math.sin(Math.PI * lin(f, B.hit2 + 1, B.hit2 + 7));
    const point = f >= B.hit2 - 5 ? path(f, [[B.hit2 - 5, rest1], [B.hit2, out, (x) => easeOutBack(x, 0.7)]]).add(V(jab, 0.6 * jab, 0)) : null;
    XY.set({ hands: [fist, point] });
  }
  // the cup on his table jumps with the blow
  const hop = 0.1 * Math.sin(Math.PI * lin(f, B.slam, B.slam + 6));
  w.prop("cup:xiangyu").put(N5.seat.cup.clone().add(V(0, hop, 0)));
  return { XY, CW, down };
}
/** the officer's tag hangs over the place where his head comes to rest (it does not ride his head): the centre of
 *  his head when he kneels, half way into the lean to the ear */
const HEAD5 = K5.clone().add(V(-0.02, HEAD5_Y, 0));

/** shot 5: the two-shot. Xiang Yu alone and bored; the red officer scurries in from the right, kneels at his ear,
 *  leans in behind his hand. The camera pushes in on the whisper and has arrived when he says the words: the two
 *  faces fill the frame, Xiang Yu hears "称王". */
function shot5(w: World, f: number): Pose {
  w.setPlace("nightX");
  const c = camMix(CAMS.nightX, T5, easeInOutCubic(lin(f, B.inform - 8, B.words + 4)));
  w.setCamera(c);
  const T = nightX(w, f);
  w.update();
  const hd = fixedHead(w, HEAD5);
  if (LOG) log(f, `5 xyHead ${px(w.project(T.XY.headWorld()))} ${v3s(T.XY.headWorld())} cwHead ${px(w.project(T.CW.headWorld()))} ${v3s(T.CW.headWorld())} tagHead ${px(hd)} r ${Math.round(hd.r)} cwHand0 ${v3s(T.CW.handWorld(0))} ${px(w.project(T.CW.handWorld(0)))} xyHand0 ${px(w.project(T.XY.handWorld(0)))}`);
  // the film's tag of the informer before he has a name (red plate 刘邦的军官 with the round 密 seal), pinned above
  // his cap: the camera pushes in during its life, and a pinned side cannot change place between two frames
  const ov = tag({ f, who: "officer", at: hd, from: TAG.officer, out: TAG.officer + TAG_LEN - 7, side: "up" });
  return { camera: c, overlays: ov, slate: "5 nightX whisper" };
}
/** shot 6: cut ON the blow to the low camera: the fist, the cup jumps, the officer shrinks away; Xiang Yu roars it
 *  and on "打" his arm points out of the door. The camera pushes in on the blow and whips away to the right, the way
 *  the arm points. */
function shot6(w: World, f: number): Pose {
  w.setPlace("nightX");
  let c: CamPose = camMix(X6LW, X6L, easeOutCubic(lin(f, B.slam - 1, B.slam + 9)));
  c = kick(c, f, B.slam, 0.05);
  c = panned(c, whipOut(f, S7.from, 1, 0.41));   // (0.46 showed the end of the east wall on the last frame)
  w.setCamera(c);
  const T = nightX(w, f);
  w.update();
  const hit = T.down ? w.project(T.down) : { x: 0, y: 0 }, hx = headPx(w, T.XY);
  if (LOG) log(f, `6 xyHead ${px(hx)} r ${Math.round(hx.r)} ${v3s(T.XY.headWorld())} cwHead ${px(w.project(T.CW.headWorld()))} ${v3s(T.CW.headWorld())} hitPx ${px(hit)} xyHand1 ${v3s(T.XY.handWorld(1))} ${px(w.project(T.XY.handWorld(1)))}`);
  const ov = frag(
    burst({ f, at: B.slam, x: hit.x, y: hit.y - 20, r: 150, n: 11, color: COL.white }),
    // the vein mark ON his right temple (screen left, away from the officer; above the brow), from the blow to the whip pan
    anger({ f, from: B.slam, out: S7.from - 3, x: hx.x - 0.82 * hx.r, y: hx.y - 0.98 * hx.r, s: clampN(hx.r / 125, 0.8, 1.5), hits: [B.hit2] }),
    whipStreak(f, S7.from, 1, NIGHT_COLS));
  return { camera: c, overlays: ov, slate: "6 nightX slam" };
}

// ====================================================================================================== line 7: Liu Bang's camp, the same night
const FU7 = yawTo(U7, LB7) * 0.55, FL7 = yawTo(LB7, U7) * 0.55;
/** THE CUP (cup:uncle, drawn 1.7 x: 17 cm across, 15 cm high): the middle of its height on its way: held in front of
 *  Liu Bang's chest, held out between the two men (the layout's toast point, a hand higher: its foot above the
 *  flame's tip on screen), and where the uncle lifts it to once it is his */
const CUP_K = 1.7, CUP_R = 0.05 * CUP_K, CUP_H = 0.09 * CUP_K;
const OFFER7 = V((U7.x + LB7.x) / 2, NL.toast.y + 0.09, NL.toast.z - 0.04), HOLD7 = V(LB7.x - 0.255, 0.88, LB7.z + 0.06), TAKEN7 = OFFER7.clone().add(V(-0.03, 0.02, 0.08));
/** where a hand grips the cup, from the cup's middle: on its side wall, toward the lens (Liu Bang's from the right,
 *  the uncle's from the left) */
const GRIP = 0.71 * (CUP_R + 0.012), GL = V(GRIP, -0.02, GRIP), GU = V(-GRIP, -0.02, GRIP);
/** Liu Bang's hand while the cup rests in front of his chest (frames S7.from .. HIT.toast - 4): UNDER its foot, the
 *  cup standing on his palm. Gripped on its side (GL) there, his forearm ran back to the elbow along the cup's back
 *  wall, 1.3-1.5 cm inside it (clearance check, f537-591). */
const GL0 = V(0.02, -(CUP_H / 2 + 0.0235), 0);
/** the uncle's tag hangs over where his head stops (the centre of his head at his mark; it does not pant with him) */
const HEAD7 = U7.clone().add(V(0.03, HEAD7_Y, 0));
/** a point in a standing figure's own frame (x = to its left, z = forward) */
const relP = (p: THREE.Vector3, facing: number, x: number, y: number, z: number) => p.clone().add(V(Math.cos(facing) * x + Math.sin(facing) * z, y, -Math.sin(facing) * x + Math.cos(facing) * z));

/** THE TRACK of line 7: Liu Bang stands by his fire, a cup in his hand; the uncle runs in, pants, points back twice
 *  (Liu Bang starts); Liu Bang holds the cup out to him; the uncle takes it and lifts it; Liu Bang's hands come
 *  together: 亲家. */
function liuCamp(w: World, f: number) {
  const t = f / FPS, UN = w.actor(PEOPLE.xiangBo), LIU = w.actor(PEOPLE.liuBang);
  const leg = walkAlong([U_FROM, U7], RUN7, (f - B.uncleGo) / FPS, { endFacing: FU7 });
  const pant = (1 - lin(f, B.uncleAt, B.uncleAt + 30)) * Math.sin((f - B.uncleAt) * 1.05) * 0.07 * (f >= B.uncleAt ? 1 : 0);
  // ---- the cup: in Liu Bang's hand until B.give, then in the uncle's
  const shake = f >= B.pledge ? 0.02 * Math.sin((f - B.pledge) * 1.5) * (1 - lin(f, B.pledge, B.pledge + 9)) : 0;
  const cup = path(f, [[B.two7 - 4, HOLD7], [B.two7 + 3, OFFER7, (x) => easeOutBack(x, 1.2)], [B.give, OFFER7], [B.give + 7, TAKEN7, easeInOutCubic]])
    .add(V(0, 0.03 * ky(f, [[B.pledge - 4, 0], [B.pledge, 1]]) + shake, 0));
  // ---- the uncle
  const EXU: [number, Ex][] = [[0, "nervous"], [B.two7 + 3, "shock"], [B.two7 + 10, "smile_closed"], [B.pledge, "grin"]];
  UN.set({
    at: leg.at, facing: leg.facing, pose: leg.pose,
    expr: at(f, EXU), blink: lid(t, 5, swaps(EXU)),
    gaze: at(f, [[0, 1], [B.pt1 - 2, -1], [B.pt1 + 6, 1]]),
    head: heads({ dy: pant, tilt: -4 * ky(f, [[B.pt1 - 3, 0], [B.pt1 + 1, 1], [B.pt2 + 5, 1], [B.two7 + 2, 0]]) }, accent("squash", f, B.uncleAt), accent("nod", f, B.pt2), accent("pop", f, B.pledge)),
    visible: true,
  });
  const handsU: [THREE.Vector3 | null, THREE.Vector3 | null] = [null, null];
  if (f >= B.pt1 - 5 && f < B.two7 + 5) {
    // the right arm thrown out toward where he came from (screen left), twice
    const rest = restHand(w, UN, 0), out = staged(w, U7, -0.46, 1.04, 0.14), back = out.clone().lerp(rest, 0.4);
    handsU[0] = path(f, [[B.pt1 - 5, rest], [B.pt1, out, easeOutCubic], [B.pt1 + 4, out], [B.pt1 + 7, back], [B.pt2, out, easeOutCubic], [B.two7 - 3, out], [B.two7 + 5, rest]]);
  }
  if (f >= B.take - 6) {
    // his left hand goes to the cup, closes on it, and the cup is his
    const rest = restHand(w, UN, 1);
    handsU[1] = f < B.take ? path(f, [[B.take - 6, rest], [B.take, OFFER7.clone().add(GU), easeOutCubic]]) : cup.clone().add(GU);
  }
  UN.set({ hands: handsU });
  // ---- Liu Bang: at ease with his cup; the news hits him; a thought; all smiles, he holds the cup out; once the
  //      uncle has it his hands come together and he bows his head over them; his eyes slide to us
  const EXL: [number, Ex][] = [[0, "neutral"], [B.pt1 + 3, "shock"], [B.two7 - 9, "smile"], [B.two7 - 2, "grin"], [B.sly, "smug"]];
  const sal = easeInOutCubic(lin(f, B.give + 1, B.give + 10));
  LIU.set({
    at: LB7.clone(), facing: FL7, pose: { kind: "idle", t: t + 0.4 },
    expr: at(f, EXL), blink: lid(t, 1, swaps(EXL)), gaze: at(f, [[0, -1], [B.two7 - 9, 0], [B.two7 - 2, -1], [B.sly, 0]]),
    lookDown: 12 * sal * (1 - lin(f, B.sly - 2, B.sly + 3)),
    head: heads({ dy: -0.04 * sal * (1 - lin(f, B.sly - 2, B.sly + 3)) }, accent("jolt", f, B.pt1 + 3, { amp: 0.7 }), accent("nod", f, B.two7 + 3), accent("pop", f, B.pledge)),
    visible: true,
  });
  // until he holds it out the cup stands on his palm (GL0); on the way out his hand comes round to its side (GL)
  let h0 = cup.clone().add(GL0.clone().lerp(GL, easeInOutCubic(lin(f, B.two7 - 4, B.two7 + 2)))), h1: THREE.Vector3 | null = null;
  if (f > B.give) {
    w.update();
    const r1 = LIU.handWorld(1).clone(), s0 = relP(LB7, FL7, -0.05, 0.84, 0.3), s1 = relP(LB7, FL7, 0.05, 0.84, 0.3);
    h0 = OFFER7.clone().add(GL).lerp(s0, sal); h1 = r1.lerp(s1, sal);
  }
  LIU.set({ hands: [h0, h1] });
  return { UN, LIU, cup, leg };
}
/** shot 7: the pan lands on Liu Bang's camp with the uncle RUNNING in at the left edge; he stops in front of Liu
 *  Bang, out of breath; his tag; he points back the way he came, twice. Then the camera pushes in while Liu Bang
 *  holds his cup out to him; on 亲家 the cup is the uncle's, Liu Bang's hands are together, the stamp lands; Liu
 *  Bang's eyes slide to us. Whip pan left at the end. */
function shot7(w: World, f: number): Pose {
  w.setPlace("nightL");
  // the whip lands 0.45 m left of the shot's rest (the uncle is coming in there) and settles with him; the push on
  // the pledge starts when Liu Bang has had his thought and ends before the stamp
  let c: CamPose = camMix(C7W, C7, easeInOutCubic(lin(f, B.two7 - 8, B.pledge - 4)));
  c = aimed(c, -0.45 * sq(1 - lin(f, S7.from - 1, B.uncleAt - 2)));
  c = panned(c, whipOut(f, S8.from, -1, 0.2));     // 11 degrees only: further left the camp ends
  w.setCamera(c);
  const T = liuCamp(w, f);
  w.update();
  w.prop("cup:uncle").put(T.cup.clone().add(V(0, -CUP_H / 2, 0)), { scale: CUP_K });
  const hu = w.project(T.UN.headWorld()), hl = headPx(w, T.LIU), hd = fixedHead(w, HEAD7);
  if (LOG) log(f, `7 unHead ${px(hu)} ${v3s(T.UN.headWorld())} liuHead ${px(hl)} ${v3s(T.LIU.headWorld())} tagHead ${px(hd)} r ${Math.round(hd.r)} cup ${px(w.project(T.cup))} liuHand0 ${v3s(T.LIU.handWorld(0))} unHand1 ${v3s(T.UN.handWorld(1))}`);
  const ov = frag(
    whipStreak(f, S7.from, 1, NIGHT_COLS),
    // the camera has come to rest when the tag starts and does not move during its life (lift 1.35 head radii: his
    // cap is flat, the package's 1.8 leaves the tail's tip a hand above it); it keeps off Liu Bang's head
    tag({ f, who: "uncle", at: hd, from: TAG.uncle, out: TAG.uncle + TAG_LEN - 7, lift: 1.35, avoid: [hl] }),
    stamp({ f, id: "qinjia", from: B.pledge, out: B.pledge + 20, x: 540, y: clampN(Math.min(hu.y, hl.y) - 335, 330, 620) }),
    whipStreak(f, S8.from, -1, DAWN_COLS));
  return { camera: c, overlays: ov, slate: "7 nightL warning + pledge" };
}

// ====================================================================================================== lines 8-9: the gate, next morning
/** Xiang Yu is turned a third of the way to Liu Bang (31 degrees: turned half way his crown and brow band sat beside
 *  his face, which always looks at the lens) */
const FX8 = yawTo(G.xiangyu, L8) * 0.3;
/** Liu Bang bows TOWARD Xiang Yu, but more to the lens than to him (29 degrees off it): the bow carries his head
 *  0.13 m toward the man instead of 0.19 */
const FB8 = -0.5;
/** the 拱手 hands of the bow in his own frame (shots/common.ts salute) */
const BOW_HANDS: [number, number, number][] = [[-0.05, 0.8, 0.36], [0.05, 0.8, 0.36]];
/** the round window of lines 8 and 9 on the 1080 x 1920 frame (hud/inset.tsx: centre and diameter): upper right (the
 *  informer's corner). Its ring starts under the top safe line; the plate hangs from its lower rim down to about
 *  y 690, above Liu Bang's cap when his head comes up. */
const INSET9 = { x: 816, y: 394, d: 344 };
/** the window of the UNKNOWN man (mine: segB_ov.ts mystery): from "小人" in line 8, across the cut, until the film's
 *  inset has popped over it with his face on Xiang Yu's "是你手下" */
const unknown = (f: number) => mystery({ f, from: B.xiaoren, out: HIT.inset + 3, ...INSET9 });

/** THE TRACK of lines 8 and 9 at the gate (frames S8.from .. S.to), for both cameras. */
function gate(w: World, f: number) {
  const t = f / FPS, XY = w.actor(PEOPLE.xiangYu), LIU = w.actor(PEOPLE.liuBang);
  // ---- Liu Bang: walks up (he is half way on the first frame), bows with his hands together, speaks bowed with his
  //      eyes up at Xiang Yu; on the NAME his head comes up, then his eyes go to the window with the man's face
  const leg = walkAlong([G.liuFrom, L8], WALK8, (f - B.liuGo) / FPS, { endFacing: FB8 });
  const bw = easeInOutCubic(lin(f, B.liuAt + 1, B.liuAt + 9));
  const up = ky(f, [[B.up9, 0], [B.up9 + 4, 1], [B.narrow9, 1], [B.narrow9 + 6, 0.8]]);
  const EXL: [number, Ex][] = [[0, "neutral"], [B.liuAt + 2, "nervous"], [B.up9, "shock"], [B.narrow9, "stern"]];
  const sayL = speak(Q8, f, 1, [4]);
  const baseL: St = {
    at: leg.at, facing: leg.facing, pose: leg.pose,
    expr: at(f, EXL), blink: sayL.blink ?? lid(t, 1, swaps(EXL)), mouth: sayL.mouth,
    gaze: at(f, [[0, -0.5], [B.liuAt + 2, -1], [B.narrow9, 1]]),
    visible: true,
  };
  LIU.set(baseL);
  if (bw > 0) {
    const r0 = restHand(w, LIU, 0), r1 = LIU.handWorld(1).clone(), e = smooth(lin(bw, 0, 0.75));
    const jig = 0.014 * Math.sin((f - B.xiaoren) * 1.6) * (f >= B.xiaoren ? 1 - lin(f, B.xiaoren, B.xiaoren + 10) : 0);
    const hands = BOW_HANDS.map(([x, y, z], i) => (i ? r1 : r0).lerp(relP(L8, FB8, x, y + jig, z), e)) as [THREE.Vector3, THREE.Vector3];
    LIU.set({ pose: { kind: "haul", t: 0, phase: 0, amount: -bw }, hands, lookDown: 22 * bw * (1 - 0.85 * up), head: heads({ dy: -0.08 * bw * (1 - up) + 0.05 * up }, soft(accent("jolt", f, B.up9, { amp: 0.5 }), 0.6), soft(sayL.head, 0.4)) });
  }
  // ---- Xiang Yu: waits, scowling, his eyes on the man coming; a snort at the bow; "小人?": the brows come up, the
  //      apology pleases him; he laughs it off and says the name, careless, pointing at the man and then at the face
  const sayX = speak(Q9, f, 3, [4]);
  const EXX: [number, Ex][] = [[0, "stern"], [B.liuAt + 10, "huff"], [B.liuAt + 22, "stern"], [B.xiaoren + 4, "neutral"], [B.soften, "smug"], [S9.from + 4, "grin"], [B.pointGo, "happy"], [Q9.to + 2, "grin"]];
  const chin = ky(f, [[B.liuAt + 6, 0], [B.liuAt + 12, 1], [B.xiaoren + 2, 1], [B.xiaoren + 8, 0]]);
  const baseX: St = {
    at: G.xiangyu.clone(), facing: FX8, pose: { kind: "idle", t: t + 0.7 },
    expr: at(f, EXX), blink: sayX.blink ?? lid(t, 4, swaps(EXX)), mouth: sayX.mouth,
    gaze: at(f, [[0, 1], [B.lift + 6, 0.5], [B.pointGo, 1], [Q9.to + 3, 0.5]]),
    head: heads({ dy: 0.025 * chin, tilt: 4 * ky(f, [[B.xiaoren + 3, 0], [B.xiaoren + 9, 1], [B.lift, 1], [B.lift + 5, 0]]) }, accent("nod", f, B.liuAt + 10), accent("laugh", f, S9.from + 6, { dur: 0.45 }), accent("pop", f, B.name), sayX.head),
    visible: true,
  };
  XY.set(baseX);
  if (f >= B.lift) {
    const rest = restHand(w, XY, 1), w0 = staged(w, G.xiangyu, 0.32, 1.12, 0.1), pt = staged(w, G.xiangyu, 0.34, 1.02, 0.08), top = staged(w, G.xiangyu, 0.42, 1.4, 0.03);
    // a loose flap of the hand ("oh, that"), then the finger at the man ("your man"); on the NAME the arm swings up
    // to the WINDOW with the officer's face (the hand stops under its lower left corner): "HE said it"
    const wv = (f - S9.from) * 0.55, flap = w0.clone().add(V(0.035 * Math.sin(wv), 0.03 * Math.cos(wv * 0.5), 0));
    const jab = 0.025 * Math.sin(Math.PI * lin(f, B.name + 1, B.name + 7));
    const hand = path(f, [[B.lift, rest], [S9.from + 4, flap, easeOutCubic], [B.pointGo, flap], [Q9.from + 2, pt, easeOutCubic], [B.name - 2, pt], [B.name + 1, top, easeOutCubic]]).add(V(0.7 * jab, 0.7 * jab, 0));
    XY.set({ hands: [null, hand] });
  }
  // the chariot's horse between the set's shafts, seen from behind (w_props.md: the place its builder gives for lines
  // 8, 9 and 18). NOT the layout's GATE.horse with the saddle horse: that was the place of the stand-in block; the real
  // horse (1.5 m long, head toward +z) would stand there with its head and neck inside the chariot's box.
  w.prop("horse2").put(V(CART.at.x, 0, CART.at.z - 1.65), { facing: Math.PI, t });
  return { XY, LIU, leg };
}
/** shot 8: the pan lands on the gate seen wide (the 鸿门 board, the 项 banner, Xiang Yu waiting, the chariot); Liu
 *  Bang walks up to him and bows, and the camera pushes in on the two men; he speaks bowed; on "小人" the window of
 *  the unknown man pops, upper right. */
function shot8(w: World, f: number): Pose {
  w.setPlace("gate");
  const k = 0.82 * easeInOutCubic(lin(f, B.liuAt - 8, B.liuAt + 14)) + 0.18 * smooth(lin(f, B.liuAt + 14, S9.from + 8));
  let c: CamPose = camMix(GATE8W, GATE8IN, k);
  c = panned(c, whipIn(f, S8.from, -1));
  w.setCamera(c);
  const T = gate(w, f);
  w.update();
  if (LOG) log(f, `8 xyHead ${px(w.project(T.XY.headWorld()))} ${v3s(T.XY.headWorld())} liuHead ${px(w.project(T.LIU.headWorld()))} ${v3s(T.LIU.headWorld())} liuHands ${v3s(T.LIU.handWorld(0))} ${px(w.project(T.LIU.handWorld(0)))}`);
  return { camera: c, overlays: frag(whipStreak(f, S8.from, -1, DAWN_COLS), unknown(f)), slate: "8 gate bow" };
}
/** shot 9: in on the same axis, from a little higher. Xiang Yu laughs it off and says whose man it was: the unknown
 *  man's window gets the officer's face; on the NAME the plate under it turns into the name and Liu Bang's head comes
 *  up; his eyes go to the window. Held still; the camera only takes the knock of the name. Then the cloth comes down
 *  (the flap wipe into the banquet). */
function shot9(w: World, f: number): Pose {
  w.setPlace("gate");
  const c = kick(camMix(GATE9, pushed(GATE9, 0.035), smooth(lin(f, S9.from - 4, B.name + 10))), f, B.name, 0.022);
  w.setCamera(c);
  const T = gate(w, f);
  w.update();
  if (LOG) log(f, `9 xyHead ${px(w.project(T.XY.headWorld()))} liuHead ${px(w.project(T.LIU.headWorld()))} ${v3s(T.LIU.headWorld())} xyHand1 ${v3s(T.XY.handWorld(1))} ${px(w.project(T.XY.handWorld(1)))} liuHand ${px(w.project(T.LIU.handWorld(0)))}`);
  const ov = frag(
    unknown(f),
    // the film's window of the informer: his face of line 5 (FACE, a crop of the film's own frame), the plate
    // 刘邦的军官 that flips to 曹无伤 / 告密的 on the name's frame (its own jolt and rays)
    inset({ f, from: HIT.inset, flipAt: B.name, ...INSET9, img: FACE }),
    flapWipe(lin(f, B.wipe - 1, B.wipe + 2)));
  return { camera: c, overlays: ov, slate: "9 gate name" };
}

// ====================================================================================================== the segment
const TABLE: [number, (w: World, f: number) => Pose][] = [
  [S5.from, shot5], [S6.from, shot6], [S7.from, shot7], [S8.from, shot8], [S9.from, shot9],
];
export const SEG: Segment = {
  id: "B", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w, f) { let fn = TABLE[0][1]; for (const [from, g] of TABLE) if (f >= from) fn = g; return fn(w, f); },
};
