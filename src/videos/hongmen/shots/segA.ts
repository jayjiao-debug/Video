// Segment A (lines 1-4, frames 0-379): the hook and the only background the film gives.
//   shot 1   line 1   the privy (another engineer's shot: called exactly as the skeleton does)
//   shot 2a  line 2   THE TITLE CUT into the banquet FROZEN mid sword dance (one fixed pose time: only the camera and the
//                     lamps move): a slow push, the title, glints on the blades; on 「最后只死了一个人」 a crane-zoom
//                     onto the man in red under the blades; then the lens rushes into the door flap behind him
//   shot 2b  line 2   ... and comes out of the same flap OUTSIDE: the black figure beside the door, the "?" over him
//   shot 3   line 3   the sand table: the Qin banner topples off the capital's wall into the sand, Liu Bang dashes in
//                     and plants the red flag in its place
//   shot 4   line 4   (4i) Xiang Yu alone, large, his name; (4, cut on his arm) forty pawns thump down behind him, ten
//                     behind Liu Bang; a push onto Xiang Yu for segment B's match cut
// Every frame number is looked up (beats.ts, cap / capWord / line): T below. A shot is a pure function of f.
// Overlays show only in the Remotion film, not in the preview. The title, the two name tags and the two numbers are
// the film's overlay package (../hud); the "?", the glints, the burst, the dust, the two wipes and the streaks are
// segment A's own (segA_ov.ts: the package has none).
import * as THREE from "three";
import type React from "react";
import type { CamPose, Pose, Segment, Vec3 } from "../story";
import { SEGMENTS, cap, lerp, lin, clamp01, smooth, easeOutCubic, easeInOutCubic, easeInCubic, camMix, add3, mix3 } from "../story";
import type { World } from "../world";
import { shot, HIT, TAG, type ShotDef } from "../beats";
import { CAMS, CARD, CARD_LABELS, FREEZE, SHADOW, SEATS } from "../layout";
import { TXT } from "../lang";
import { privyOpening } from "../sets/privy";
import { LIU_PRIVY, LIU_DAGE } from "../acc/liu_dage";
import { hiltWorld } from "../acc/garb";
import { PEOPLE, FPS, V, v3, rel, hang, lid, at, ky, path, swaps, accent, heads, kick, frag, headPx, walkAlong, walkTime, banquet, standing, cam, type RigState } from "./common";
import { mark, glint, burst, cardWipe, flapWash, streaks, puffs } from "./segA_ov";
import { tag, title, count } from "../hud";
import { qinBanner, QIN } from "./segA_props";

const S = SEGMENTS[0];
const slate = (s: ShotDef, more = "") => `${s.id} ${s.place}${more ? " " + more : ""}`;
type Extra = Partial<RigState>;

// ---------------------------------------------------------------------------------------------------- the beats
/** the frame a word INSIDE a caption group starts on, by its place in the group (characters are spoken evenly inside
 *  a group, good to about 2 frames): word k of n characters */
const inGroup = (ln: number, k: number, ch: number, of: number) => { const g = cap(ln, k); return Math.round(lerp(g.from, g.end, ch / of)); };
const S2a = shot("2a"), S2b = shot("2b"), S3 = shot("3"), S4 = shot("4");
const T = {
  // ---- line 2
  /** 「鸿门宴」 is said (the 5th of the group's 7 characters): the title LANDS here, it appears 3 frames earlier */
  title: inGroup(2, 0, 4, 7),
  /** 「满屋刀剑」: four glints, 4 frames apart */
  blades: cap(2, 1).from,
  /** 「最后只死了一个人」: the crane-zoom onto Liu Bang starts 5 frames before the group and lands as 只死了 is said */
  zoom0: HIT.oneDead - 5, zoom1: HIT.oneDead + 9,
  /** the rush into the door flap: the last 10 frames of the shot */
  rush0: S2b.from - 10,
  /** the "?" */
  q: HIT.question,
  /** the card wipe covers from here (the cut to the board is under it) */
  wipe: S3.from - 6,
  // ---- line 3
  /** 「灭亡」 (the 4th of 5 characters): the Qin banner goes over */
  fall: inGroup(3, 0, 3, 5) - 3,
  /** 「刘邦抢先」: he sets off 2 frames before the name is said */
  run: cap(3, 1).from - 2,
  /** the pole hits the socket */
  plant: HIT.flag,
  /** the whip pan to Xiang Yu's side: the last 3 frames of shot 3, the first 3 of shot 4 */
  whip: S4.from - 3,
  // ---- line 4
  /** Xiang Yu's name (after the pan has landed) */
  tagXY: TAG.xiangYu + 3,
  /** the cut to the wide shot, on his arm (it starts to move 4 frames earlier) */
  wide: HIT.n40,
  /** 「对他十万」: the red rows start to drop; the number comes 3 frames later (on 十万) */
  ten: HIT.n10,
  /** the push onto Xiang Yu for segment B's match cut */
  push: S.to - 11,
};

// ---------------------------------------------------------------------------------------------------- camera helpers
/** blend two cameras; the LENS goes geometrically, so a zoom runs at an even speed */
const camZ = (a: CamPose, b: CamPose, k: number): CamPose => ({ ...camMix(a, b, k), fov: a.fov * Math.pow(b.fov / a.fov, k) });
/** the same camera moved sideways (a pan as a truck: the board is flat and endless) */
const trucked = (c: CamPose, dx: number): CamPose => (dx ? { ...c, pos: add3(c.pos, [dx, 0, 0]), look: add3(c.look, [dx, 0, 0]) } : c);
/** the whip pan: metres the picture has travelled on the 3 frames before the cut (ease-in) and after it (ease-out) */
const WHIP_OUT = [0.25, 1.0, 2.4], WHIP_IN = [1.7, 0.55, 0.12];

// ====================================================================================================== line 1
/** line 1 (frames 0 .. 77): Liu Bang on the privy. Frame 0 is the film's loop frame: the closing shot of segment E
 *  (segE.ts) must end on exactly this picture, so everything here comes from privyOpening(f) and nothing from w.t. */
function shot1(w: World, f: number): Pose {
  const s = shot("1"), P = privyOpening(f - s.from);
  w.setPlace("privy");
  w.setCamera(P.cam);
  w.actor(LIU_PRIVY).set({ ...P.state, visible: P.who === 0 });
  w.actor(LIU_DAGE).set({ ...P.state, visible: P.who === 1 });
  return { camera: P.cam, clock: P.t, hud: false, slate: `${s.id} ${s.place}/${s.cam}` };
}

// ====================================================================================================== line 2
/** the ONE pose time of the frozen banquet (seconds) and the frame the blank staging is asked for */
const FREEZE_T = 0.4, FREEZE_F = Math.round(FREEZE_T * FPS);
/** where the two blades meet: above the dancer's head, between the two swordsmen in depth. Each blade runs from its
 *  hand to this point (0.71 m and 0.65 m of 0.78): they cross at their tips, 5 cm apart in depth */
const APEX = V(-0.6, 1.75, 0.06);
/** layout's master, looking 8 cm further left: the dancer's sword hand (2 % from the left edge in the master itself)
 *  stays inside the frame through the push */
const M0: CamPose = { ...CAMS.master, look: add3(CAMS.master.look, [-0.08, 0, 0]) };
/** the master pushed 6 % along its own axis (the slow push of the title beat) */
const M1: CamPose = { ...M0, pos: mix3(M0.pos, M0.look, 0.06) };
/** the end of the crane-zoom: the same tripod trucked 0.25 m toward the door side and a long lens: a tight two-shot,
 *  the uncle's head 2 .. 41 % x / 34 % y, Liu Bang's 45 .. 79 % x / 42 % y under the wing arm; the dancer (left) and
 *  Xiang Yu (right) are just outside the frame; Liu Bang's table is in the caption band */
const ZOOM: CamPose = cam([1.05, 2.6, 5.2], [0.06, 0.62, -1.3], 20);
/** how much of the crane-zoom is the move itself; the rest is a creep that runs on to the rush (a frozen picture
 *  under a dead camera is a still). The window is narrow: at 0.97 the dancer's head has just left the left edge, at 1
 *  the uncle's head is 2 % from it, so the creep may not go past ZOOM */
const ZOOM_MOVE = 0.97;
/** deep in the door flap's cloth above Liu Bang's cap (the flap: x -0.69 .. 0.39, up to 1.94; his cap hides it below 1.15) */
const INTO_FLAP: CamPose = cam([1.05, 2.6, 5.2], [-0.13, 1.57, -2.45], 4.4);
const FLAP_COL = "#efe6cc";
/** Xiang Yu's cup in 2a: its axis CUP_OUT beyond his hand's centre, along the level forearm (cup wall r 0.05 + the
 *  armoured fist's r 0.04, less a 1.5 cm squeeze: the fist presses on the wall, under 3 mm into it; the hand's centre
 *  is 3.1 cm from the cup, so the clearance checker counts it as held); CUP_BACK sets the hand back toward the elbow
 *  (the forearm points -x, -z here), so the cup keeps its old place in the frame (and stays out of the right edge of
 *  the crane-zoom's two-shot, 158 .. 186) */
const CUP_OUT = 0.075, CUP_BACK = V(0.068, 0, 0.055);
const cam2a = (f: number): CamPose => {
  if (f < T.zoom0) return camMix(M0, M1, smooth(lin(f, S2a.from - 12, T.zoom0 + 6)));           // already moving on the cut
  const a = camMix(M0, M1, smooth(lin(T.zoom0, S2a.from - 12, T.zoom0 + 6)));
  const zk = (g: number) => ZOOM_MOVE * easeInOutCubic(lin(g, T.zoom0, T.zoom1)) + (1 - ZOOM_MOVE) * lin(g, T.zoom0, T.rush0 + 2);
  if (f < T.rush0) return camZ(a, ZOOM, zk(f));
  return camZ(camZ(a, ZOOM, zk(T.rush0)), INTO_FLAP, easeInCubic(lin(f, T.rush0 - 1, S2b.from - 1)));
};
/** line 2, first beat: the banquet frozen mid sword dance. NOBODY moves: every figure is posed at FREEZE_T. */
function shot2a(w: World, f: number): Pose {
  const s = S2a, c = cam2a(f);
  w.setPlace("tent"); w.setCamera(c);
  // Xiang Yu, the host, at ease: his cup in his left hand (the camera's side) close to his chest (7 cm further out it
  // is a yellow sliver on the right edge of the two-shot), eyes on the dance
  // The cup is GRIPPED BY ITS SIDE: it stands beyond the fist along the forearm (CUP_OUT), so the armoured fist and the
  // bracer (acc armGuards: the fist ball is r 4 cm over the hand) touch its wall and stay outside it. (Until 2026-11-12
  // its foot was centred under the hand: the fist sat inside the bowl, 4.4 cm through the wall, on screen f78-155.)
  // The hand is set back toward the elbow by about CUP_OUT, so the cup itself stays where it was framed.
  const xyAt = V(SEATS.xiangyu.top.x, 0, SEATS.xiangyu.top.z), cupHand = rel(xyAt, SEATS.xiangyu.facing, 0.2, 0.72, 0.23).add(CUP_BACK);
  const R = banquet(w, FREEZE_F, {
    in: ["liu", "xiangyu", "fanzeng"],                                              // the uncle is on the floor; Fan Kuai is not in yet; Zhang Liang is never in a north framing
    cups: ["liu", "zhang", "fankuai", "uncle", "fanzeng"],
    extra: {
      liu: { expr: "nervous", gaze: -1, blink: 0, head: { dy: 0.04, tilt: 3 } },
      xiangyu: { expr: "smug", gaze: -1, blink: 0, hands: [null, cupHand] },
      fanzeng: { blink: 0, gaze: 0 },
    },
  });
  // the two swordsmen: the dancer's blade over his head toward the middle, the uncle's blade up against it, the uncle's
  // left arm spread back toward Liu Bang (the wing of line 13)
  const dP = FREEZE.dancer, dF = FREEZE.dancerFacing, uP = FREEZE.uncle, uF = FREEZE.uncleFacing;
  const dancer = w.actor(PEOPLE.xiangZhuang), uncle = w.actor(PEOPLE.xiangBo);
  dancer.set({ at: dP.clone(), facing: dF, pose: { kind: "idle", t: FREEZE_T }, hands: [rel(dP, dF, -0.34, 1.24, 0.12), hang(dP, dF, 1)], armFront: [true, undefined], hide: ["hilt"], expr: "smug", gaze: 1, blink: 0, visible: true });
  uncle.set({ at: uP.clone(), facing: uF, pose: { kind: "idle", t: FREEZE_T }, hands: [rel(uP, uF, -0.33, 1.27, 0.06), rel(uP, uF, 0.27, 0.76, -0.06)], armFront: [true, undefined], hide: ["hilt"], expr: "stern", gaze: -1, blink: 0, visible: true });
  w.update();
  // the blades follow the solved hands; their flats face the master tripod (a fixed point: nothing may turn in a freeze)
  const eye = v3(M0.pos), dH = dancer.handWorld(0), uH = uncle.handWorld(0);
  const dDir = APEX.clone().add(V(0, 0, 0.025)).sub(dH).normalize(), uDir = APEX.clone().add(V(0, 0, -0.025)).sub(uH).normalize();
  w.prop("sword0").put(dH, { up: dDir, face: eye.clone().sub(dH) });
  w.prop("sword1").put(uH, { up: uDir, face: eye.clone().sub(uH) });
  const xy = R.xiangyu;
  if (xy) {
    const h = xy.handWorld(1), out = h.clone().sub(xy.elbowWorld(1)).setY(0).normalize();
    w.prop("cup:xiangyu").put(h.addScaledVector(out, CUP_OUT).add(V(0, -0.045, 0)));
  }
  // ---- overlays: the title on 「鸿门宴」, a glint walking over the steel on 「满屋刀剑」
  const P2 = (p: THREE.Vector3) => w.project(p), ov: React.ReactNode[] = [];
  // the film's title card (hud): 鸿门宴 slams in 2 frames before the word and has landed on it; 到底死了谁？ pops under it
  // 8 frames later (y 454 .. 538: on the door flap, above the three heads); both are gone before the crane-zoom
  ov.push(title({ f, from: T.title - 2, out: T.zoom0 - 6, y: 312, size: 168 }));
  const hilt = xy ? hiltWorld(xy) : null;
  const spots = [dH.clone().addScaledVector(dDir, 0.42), uH.clone().addScaledVector(uDir, 0.4), APEX, hilt ?? xyAt.clone().add(V(0, 0.4, 0))];
  spots.forEach((p, i) => { const q = P2(p); if (q.on && (q.y < 1150 || i < 3)) ov.push(glint(f, { at: T.blades + 4 * i, x: q.x, y: q.y, size: i === 2 ? 210 : 150, key: `g${i}` })); });
  ov.push(flapWash(f, S2b.from, FLAP_COL, 3, 0));
  return { camera: c, overlays: frag(...ov), slate: slate(s, f < T.zoom0 ? "master push" : f < T.rush0 ? "crane-zoom" : "into the flap") };
}

/** layout's `outside` trucked 0.14 m to the right: his head sits at 56 % x (layout: 64 %), so the "?" beside it is
 *  centred at about 80 % x and ends left of the app rail (in layout's framing it was clamped at 960 px, half of it in
 *  the right-hand 12 %); the door's post moves from 47 % to 39 %: still the left third of the frame */
const OUT: CamPose = trucked(CAMS.outside, 0.14);
/** the outside camera deep in the same flap's cloth (its right panel, between the ties) */
const OUT_FLAP: CamPose = cam(OUT.pos as Vec3, [60.3, 1.36, -4.0], 3.6);
/** line 2, second beat: outside the tent door, the black silhouette (the real 曹无伤 with the figures' gain at 0) */
function shot2b(w: World, f: number): Pose {
  const s = S2b, c = camZ(OUT_FLAP, OUT, easeOutCubic(lin(f, s.from, s.from + 5)));
  w.setPlace("camp", { light: { gain: 0 } }); w.setCamera(c);
  // he stands and breathes (outside, time runs); then he leans his head toward the door: he is listening
  const k = ky(f, [[s.from + 10, 0], [s.from + 17, 1]]);
  const r = w.actor(PEOPLE.caoWushang);
  r.set(standing(SHADOW.at, SHADOW.facing, f, 13, { blink: 0, gaze: 0, head: { dx: -0.06 * k, tilt: -6 * k } }));
  w.update();
  const hd = headPx(w, r);
  const ov = frag(
    flapWash(f, s.from, FLAP_COL, 0, 3),
    // the "?" on the plain wall beside his head (above his cap the awning's gold scallops would eat a gold mark)
    f >= s.from + 4 ? mark(f, { at: T.q, out: T.wipe - 2, x: Math.min(960, hd.x + 1.8 * hd.r), y: hd.y - 0.9 * hd.r, size: 230 }) : null,
    cardWipe(f, S3.from, CARD_COL),
  );
  return { camera: c, overlays: ov, slate: slate(s, "outside") };
}

// ====================================================================================================== line 3
const CARD_COL = "#e6d7ae";
/** layout's card3 trucked 0.25 m to the right: Liu Bang's head then sits at 38 .. 64 % x (he is the middle of the
 *  picture) and the sky on his right is free for his name plate, which ends at 88 % x (in card3 itself he stands at
 *  72 %: no room on either side of him, and above him is the flag's red cloth) */
const C3 = trucked(CAMS.card3, 0.25), CITY = CARD.city;
const D2R = Math.PI / 180;
/** the Qin banner's pole radius, the height of its axis when it lies on its cloth, the length to the middle of its ball */
const QIN_R = 0.022, QIN_REST = 0.066, QIN_LEN = QIN.pole + 0.02;
/** THE QIN BANNER after T.fall (u = frames since): it topples to screen right about its foot (the cloth stays toward
 *  the lens: the 秦 can be read all the way down), lies on the wall top for a moment (all but 0.12 m of the pole out
 *  in the air), tips over the wall's end, drops, turns its cloth under itself and lies in the sand 0.6 m BEHIND
 *  Liu Bang's mark. Nothing of it passes through the wall or the ground:
 *    A  u 0 .. 7    about its foot, 0 -> 90 deg (the foot lifts by the pole's radius: the pole lies ON the wall top)
 *    B  u 7 .. 10   it slides out and tips about the wall's top right corner (90 -> 102 deg)
 *    C  u 10 .. 15  it falls: the top end lands first (u 14), the foot end slaps down (u 15), the cloth turns under
 *  Returns the pole's foot, rz and spin for QinBanner.pose. */
const qinFall = (u: number): { foot: THREE.Vector3; rz: number; spin: number } => {
  const S0 = CITY.socket, C = V(CITY.wall.at.x + CITY.wall.w / 2, CITY.wall.h + QIN_R, S0.z);
  const dir = (th: number) => V(Math.sin(th), Math.cos(th), 0);
  if (u <= 7) { const th = 90 * D2R * (u / 7) ** 2; return { foot: S0.clone().add(V(0, QIN_R * Math.sin(th), 0)), rz: -th, spin: 0 }; }   // the foot's rim stays on the wall top
  const thB = (k: number) => (90 + 12 * k * k) * D2R;
  const footB = (k: number) => C.clone().addScaledVector(dir(thB(k)), -lerp(C.x - S0.x, -0.05, k)).add(V(0, 0, -0.06 * k));
  if (u <= 10) { const k = (u - 7) / 3; return { foot: footB(k), rz: -thB(k), spin: 0 }; }
  const q = Math.min(1, (u - 10) / 5), P = footB(1), land = V(C.x + 0.12, QIN_REST, S0.z - 0.44), Q1 = 0.8;
  const yAt = (k: number) => P.y - (P.y - QIN_REST) * k * k;
  const pinned = (k: number) => 90 * D2R + Math.asin(clamp01((yAt(k) - QIN_REST) / QIN_LEN));        // the top end rests on the ground
  const th = q < Q1 ? lerp(thB(1), pinned(Q1), q / Q1) : pinned(q);
  return { foot: V(lerp(P.x, land.x, q), yAt(q), lerp(P.z, land.z, q)), rz: -th, spin: 90 * D2R * smooth(clamp01(q / Q1)) };
};
/** how far from the pole's foot Liu Bang grips the flag (he holds it by its very end: the foot then clears the wall) */
const GRIP = 0.1;
/** ... and once it is home: on the ram the pole slides 7 cm down through his fist (T.plant - 2 .. T.plant), so he ends
 *  holding it 0.17 m above the socket. With the hand at GRIP his short arm (shoulder 0.97 m, 0.4 m long) sagged at
 *  the elbow below the wall top and through the wall's right end (2.3 cm, on screen, f270-278); at 0.17 the arm is
 *  almost straight and passes 3 cm over the corner */
const GRIP_HOLD = 0.17;
const gripAt = (f: number) => lerp(GRIP, GRIP_HOLD, smooth(lin(f, T.plant - 2, T.plant)));
/** his run: from outside the right edge to his mark, a dash */
const RUN_PTS = [CITY.liuFrom, CITY.liu], RUN_V = 3.4;
const T_ARR = T.run + Math.ceil(walkTime(RUN_PTS, RUN_V) * FPS);
/** the hand that carries the flag, from his floor point: low and ahead of him (he runs to screen left: the flag goes
 *  first, its pole leaning into the run). A run throws his head 0.1 m forward: hand and pole stay clear of it.
 *  0.24 toward the lens and only 0.27 ahead: his RIGHT shoulder is on the wall's side (behind its front face) when he
 *  stops at the wall's end, and with the hand further left / further back (-0.36, 0.12, until 2026-11-12) his elbow
 *  stuck into the wall's end, 3.8 cm, on screen f254-259 */
const carryHand = (p: THREE.Vector3) => p.clone().add(V(-0.27, 0.98, 0.24));
/** line 3: the capital falls to the man in red */
function shot3(w: World, f: number): Pose {
  const s = S3;
  // ---- camera: still for the gag; a kick when the pole lands; a small push on his smug face; the whip pan out
  let c: CamPose = camMix(C3, { ...C3, pos: mix3(C3.pos, [CITY.liu.x - 0.15, 1.35, CITY.liu.z], 0.07) }, smooth(lin(f, T.plant + 4, T.whip)));
  c = kick(c, f, T.plant, 0.035);
  if (f >= T.whip) c = trucked(c, -(WHIP_OUT[f - T.whip] ?? WHIP_OUT[2]));
  w.setPlace("card"); w.setCamera(c);

  // ---- the Qin banner: it stands in the socket, shivers (the last lean is AWAY from the fall), topples, and stays down
  const Q = qinBanner(w), u = f - T.fall;
  if (u < 0) { const ramp = clamp01((u + 6) / 6); Q.pose(CITY.socket, 0.012 * Math.sin(f * 0.21) * (1 - ramp) + 0.05 * ramp * Math.cos((u + 1) * 2.1)); }
  else { const k = qinFall(u); Q.pose(k.foot, k.rz, k.spin); }

  // ---- Liu Bang: dashes in with the red flag held out in front, skids, lifts it over the wall and rams it home
  const liu = w.actor(PEOPLE.liuBang), sock = CITY.socket, LP = CITY.liu;
  const leg = walkAlong(RUN_PTS, RUN_V, (f - T.run) / FPS, { endFacing: ky(f, [[T.plant + 3, -0.3], [T.plant + 11, 0.12]]) });
  // the pole: leaning into the run, swinging back when he stops, upright for the lift; it rings after the hit
  const lean0 = ky(f, [[T_ARR - 1, -0.2], [T_ARR + 2, 0.14], [T_ARR + 5, 0], [T.plant - 4, -0.05], [T.plant, 0]]);
  const wob = f >= T.plant ? 0.07 * Math.exp(-(f - T.plant) / 2.6) * Math.sin((f - T.plant) * 1.9) : 0;
  const up = V(lean0 + wob, 1, 0).normalize();
  // the lift: straight up in FRONT of the wall's face (Ha: 12 cm in front of it, so the elbow under the hand stays out
  // of the wall's corner while it rises), back over the wall top (H1), a short wind-up (H1b), down
  const H0 = carryHand(LP), Ha = V(sock.x + 0.08, 1.17, LP.z + 0.12), H1 = V(sock.x + 0.03, sock.y + 0.19, sock.z + 0.03), H1b = H1.clone().add(V(0, 0.02, 0));
  // as he turns to the lens his right shoulder comes forward: the hand slips 5 cm down the pole (it stays in reach)
  const H2 = sock.clone().addScaledVector(up, GRIP_HOLD - 0.05 * smooth(lin(f, T.plant + 4, T.plant + 11)));
  const hand = f <= T_ARR ? carryHand(leg.at) : f >= T.plant ? H2
    : path(f, [[T_ARR + 2, H0], [T_ARR + 7, Ha], [T.plant - 4, H1], [T.plant - 2, H1b], [T.plant, sock.clone().add(V(0, GRIP_HOLD, 0)), easeInCubic]]);
  const exprK: [number, NonNullable<RigState["expr"]>][] = [[0, "grin"], [T_ARR + 2, "lick"], [T.plant, "grin"], [T.plant + 9, "smug"]];
  const tL = f / FPS, onStage = f >= T.run - 1;
  if (onStage) liu.set({
    at: leg.at, facing: leg.facing, pose: leg.pose, hands: [hand, null],
    expr: at(f, exprK), blink: lid(tL, 1, swaps(exprK)), gaze: at(f, [[0, -1], [T.plant + 9, 0]]),
    // his head tilts AWAY from the lifting arm; it pops up on the hit
    head: heads(accent("squash", f, T_ARR), accent("pop", f, T.plant, { amp: 0.6 }), { tilt: ky(f, [[T_ARR, 0], [T_ARR + 4, 4], [T.plant + 4, 4], [T.plant + 11, 6]]) }),
    visible: true,
  });
  w.update();
  if (onStage) {
    const foot = f >= T.plant ? sock.clone() : liu.handWorld(0).addScaledVector(up, -gripAt(f));
    w.prop("flag").put(foot, { up, t: f / FPS });                 // the cloth ripples by its own clock
  }

  // ---- overlays: the card wipe clears; dust where the banner lands; his name beside his head on the sky; the hit
  const dust = w.project(V(CITY.wall.at.x + CITY.wall.w / 2 + 0.75, 0.12, sock.z - 0.44)), sk = w.project(sock);
  const ov = frag(
    puffs(f, { at: T.fall + 14, x: dust.x, y: dust.y, r: 44 }),
    // his red name plate, pinned to the RIGHT of his head (above it is the flag's red cloth, left of it the wall) and
    // at scale 1: the package grows a plate with the head (1.16 .. 1.18 here), and a pinned side plate is not shrunk
    // back, so it would run to 92 % x; at 1 it ends at about 88 %, left of the app rail (what C3's truck is for)
    TAG_LIU_AT_LINE_3 && onStage ? tag({ f, who: "liu", at: headPx(w, liu), from: T_ARR, out: T.whip - 5, side: "right", scale: 1 }) : null,
    burst(f, { at: T.plant, x: sk.x, y: sk.y, r: 115 }),
    f >= T.whip ? streaks(f, T.whip, T.whip + 5, -1, ["#f4ecd2", "#cdbf93", "#b8b1a0", "#c8322c"], 3) : null,
    cardWipe(f, s.from, CARD_COL),
  );
  return { camera: c, overlays: ov, slate: slate(s, f < T.run ? "the Qin banner" : f < T.plant ? "the dash" : "the flag") };
}
/** a second name tag 「刘邦」 where the narration first says the name (his tag of line 1 is on the block-jawed meme face):
 *  the director's switch */
const TAG_LIU_AT_LINE_3 = true;

// ====================================================================================================== line 4
const VS = CARD.versus, XY_S = PEOPLE.xiangYu.scale ?? 1;
/** 4i: Xiang Yu alone, large, from BELOW his chin (the lens at 0.9 m: he is 1.65 m with a tall tassel, his head is
 *  above the horizon): head 43 % x / 45 % y, tassel top at 22 %, feet 92 %. A slow 5 % push runs through the cut. */
const XY_CAM: CamPose = cam([VS.xiangyu.x + 0.3, 0.9, 4.0], [VS.xiangyu.x + 0.12, 1.22, 0], 41);
const XY_CAM1: CamPose = { ...XY_CAM, pos: mix3(XY_CAM.pos, XY_CAM.look, 0.05) };
/** Liu Bang's mark in the wide shot: layout's, 8 cm further right (the end push then takes him clean out of the frame) */
const LIU4 = VS.liu.clone().add(V(0.08, 0, 0));
const C4 = CAMS.card4;
/** the two numbers' places ON THE BOARD: the points above the last row of each block that card4 shows at layout's
 *  CARD_LABELS (335, 405) and (745, 548) */
const N40_AT = VS.army40.at.clone().add(V(-0.235, 1.66, -(VS.army40.rows - 1) * VS.army40.dz));
const N10_AT = VS.army10.at.clone().add(V(0.054, 1.545, -(VS.army10.rows - 1) * VS.army10.dz));
/** the end of the push for the match cut into segment B: Xiang Yu's head at 29 % x / 44 % y, a third of the frame wide
 *  (as he sits in CAMS.nightX); Liu Bang has left the frame on the right */
const XY_END: CamPose = cam([VS.xiangyu.x + 0.382, 2.769, 3.816], [VS.xiangyu.x + 0.34, 0.975, -0.5], 40);
/** Xiang Yu through the whole line (the same clock on both sides of the cut): he stands planted; on the tag his head
 *  pops and he looks down his nose toward Liu Bang's side (screen right); then his right arm snaps out (it is out
 *  2 frames before the cut: the cut is on the gesture): a commander calling up his army; it is down again when the
 *  last row has landed; he never looks round */
const xyState = (f: number): Extra => {
  const p = VS.xiangyu, fc = 0.2, t = f / FPS, low = rel(p, fc, -0.3 * XY_S, 0.62 * XY_S, 0.04), out = rel(p, fc, -0.5 * XY_S, 1.08 * XY_S, 0.1 * XY_S);
  const exprK: [number, NonNullable<RigState["expr"]>][] = [[0, "neutral"], [T.tagXY, "smug"], [T.wide + 22, "neutral"], [T.ten + 6, "smug"]];
  return {
    at: p.clone(), facing: fc, pose: { kind: "idle", t },
    hands: [path(f, [[T.wide - 7, low], [T.wide - 2, out], [T.wide + 12, out], [T.wide + 20, low]]), null],
    expr: at(f, exprK), blink: lid(t, 4, swaps(exprK)),
    gaze: at(f, [[0, 0], [T.tagXY + 6, 1], [T.wide - 5, 0], [T.ten + 6, 1]]),
    head: heads(accent("pop", f, T.tagXY), accent("nod", f, T.wide + 20, { amp: 0.6 }), { tilt: ky(f, [[T.tagXY + 4, 0], [T.tagXY + 10, 4], [T.wide - 5, 4], [T.wide, 0], [T.ten + 4, 0], [T.ten + 10, 4]]) }),
    visible: true,
  };
};
/** line 4: Xiang Yu, and forty against ten */
function shot4(w: World, f: number): Pose {
  const s = S4, wide = f >= T.wide;
  let c: CamPose;
  if (!wide) c = trucked(camMix(XY_CAM, XY_CAM1, smooth(lin(f, s.from, T.wide + 6))), WHIP_IN[f - s.from] ?? 0);
  else c = kick(camMix(C4, XY_END, easeInOutCubic(lin(f, T.push, S.to))), f, T.wide + 20, 0.05);
  w.setPlace("card"); w.setCamera(c);
  // ONE PAWN = 10,000 MEN. 4i: the board behind him is empty. Wide: a row of four lands every 2 frames, front row first
  // (the first is in the air on the cut); then the red rows: five of two, over at once
  w.set.setArmies(wide ? Math.min(10, (f - T.wide + 1) / 2) : 0, wide && f >= T.ten ? Math.min(5, (f - T.ten + 1) / 2) : 0);
  const xy = w.actor(PEOPLE.xiangYu), liu = w.actor(PEOPLE.liuBang);
  xy.set(xyState(f));
  if (wide) {
    // Liu Bang watches forty rows come down next to him, then gets his ten, and swallows
    const t = f / FPS, exprK: [number, NonNullable<RigState["expr"]>][] = [[0, "neutral"], [T.wide + 9, "shock"], [T.ten + 11, "nervous"]];
    liu.set({
      at: LIU4.clone(), facing: -0.2, pose: { kind: "idle", t: t + 0.4 },
      expr: at(f, exprK), blink: lid(t, 1, swaps(exprK)),
      gaze: at(f, [[0, -1], [T.ten + 1, 1], [T.ten + 11, 0]]),
      head: heads(accent("pop", f, T.wide + 9), accent("jolt", f, T.wide + 20, { amp: 0.7 }), accent("squash", f, T.ten + 12),
        { tilt: ky(f, [[T.wide + 2, 0], [T.wide + 8, -5], [T.ten - 1, -5], [T.ten + 4, 4], [T.ten + 11, 0]]) }),
      visible: true,
    });
  }
  w.update();
  // ---- overlays
  const ov: React.ReactNode[] = [];
  if (!wide) {
    ov.push(f <= s.from + 2 ? streaks(f, T.whip, T.whip + 5, -1, ["#f4ecd2", "#cdbf93", "#5b36a0", "#4a4f5e"], 3) : null);
    // his purple name plate over his crown (the sky above him is empty); it stays to the cut
    ov.push(tag({ f, who: "xiangYu", at: headPx(w, xy), from: T.tagXY, out: T.wide - 1 }));
  } else {
    // the two numbers (hud count: each counts up as its rows land and hits with a punch). They are anchored on the
    // BOARD (N40_AT / N10_AT project to layout's CARD_LABELS in card4), so they ride the kick and the first frames of
    // the end push with their armies instead of sliding over them; 「10万」 is up for 20 frames (it was 9)
    const p40 = w.project(N40_AT), p10 = w.project(N10_AT);
    ov.push(count({ f, from: T.wide, out: T.push + 5, x: p40.x, y: p40.y, text: TXT.n40, camp: "xiang", size: CARD_LABELS.n40.size, dur: 10 }));
    ov.push(count({ f, from: T.ten, out: T.push + 4, x: p10.x, y: p10.y, text: TXT.n10, camp: "liu", size: CARD_LABELS.n10.size, dur: 7 }));
  }
  return { camera: c, overlays: frag(...ov), slate: slate(s, wide ? (f < T.push ? "wide" : "push") : "Xiang Yu") };
}

const TABLE: [ShotDef, (w: World, f: number) => Pose][] = [[shot("1"), shot1], [S2a, shot2a], [S2b, shot2b], [S3, shot3], [S4, shot4]];
export const SEG: Segment = {
  id: "A", from: S.from, to: S.to,
  enter(w) { qinBanner(w).hide(); },
  exit(w) { qinBanner(w).hide(); },
  pose(w, f) {
    qinBanner(w).hide();                                     // segment A's own prop: hidden unless this frame poses it
    let fn = TABLE[0][1];
    for (const [s, g] of TABLE) if (f >= s.from) fn = g;
    return fn(w, f);
  },
};
export { QIN };
