// THE PROPS of the Su film (props/index.ts, props/things.ts, props/dog.ts, props/horse.ts; WP3) seen through the
// film's own World: labelled sheets of every prop, the props IN USE at their marks (held with holdPoints / handWorld,
// the seats: rattan bed, desk, bench, boat, horse), the dog's poses. One "frame" = one view (frame i = views[i]):
//   bash scripts/kit/queue/still.sh src/videos/su/preview/props_sheet.ts /home/user/su_work/wp3/props/ --pick 0,1,2,3,4,5,6 --size 540x960
//   bash scripts/kit/queue/still.sh src/videos/su/preview/props_sheet.ts /home/user/su_work/wp3/props/bed.png --size 540x960 --opts '{"views":["bed"]}'
// Views (VIEW_NAMES, in this order):
//   hand     the small hand props, close: bone, bone clean, brush, coin / lychee, peeled 0.5 and 1, shell, bunch /
//            oyster shut and open, wine bowl, ink stone / chopsticks, the letter (ink 0.6) stood up to the lens
//   held     the bigger hand props: cleaver, spine, the order open 1 and 0.3, stick, lantern lit and dark; on the
//            ground the pork pot (lid on, lid off) and the folded robes
//   big      the furniture on the yard: block, trunk shut and open, desk + cushion, the rattan bed, plough, fire
//   yard     the yard dressing at its marks (YARD_CAMS.land): stove (steam) + grill + a bone on it, stool + wine
//            bowl, the bench, the ladder leaning on the veranda beam, the dog lying in front of the bench
//   hold     SU with a grilled bone (hilt), the BUTCHER with his cleaver (hilt), SU with the spine (pair)
//   hold2    the COURIER with the order open (pair), SU_OLD on his stick (hilt), MAI with the lit lantern (hook), a
//            KID with the long chopsticks (hilt)
//   bed      C: SU on the rattan bed under the tree, lying back, hands behind his head (bedSeat + bedHands)
//   sleep    C after card 2: asleep on the bed, a lychee shell on his belly, the shell pile (set param) at its foot
//   desk     E: SU writing at the desk (deskSeat, the brush in his hand, the letter half written), the open trunks
//            with the robes, the kids on the bench, the wife
//   bench    B: SU and a kid on the yard bench (benchSeat), the dog lying in front
//   boat     G: the boat at the bank (RIVER.boatPath[0]): SU on the stern seat, GUO at the oar (boatSeat)
//   dogs     the dog's six poses: idle, sniff, lookUp (head tilt, ears back), sit, walk, lie
//   dogSide  sit, lookUp and lie side-on, close
//   horse    D: the COURIER on the horse at the gate (courierSeat), unrolling the order
//   ride     D pre: the horse walking up (pose walk), the courier riding
//   plough   B15 黄州: SU behind the plough (ploughFor)
// Options (preview/common.ts adds w, h, ink, ao, raw, cam): views, labels (false = none).
// Prints  QA: view <i> <name> | reach / clear / held of each figure | the visible props' screen points (x/y % of the frame)
import * as THREE from "three";
import { preview } from "./common";
import { World } from "../world";
import { YX, YARD, YARD_CAMS, ROOM, ROOM_CAMS, RIVER, RIVER_CAMS, HUANGZHOU, HUANGZHOU_CAMS } from "../layout";
import { standing, rel, V, yawTo } from "../shots/common";
import { SU, SU_OLD, SU_HAT, BUTCHER, COURIER, MAI, KID, KID2, WIFE, GUO } from "../people";
import { holdPoints, deskSeat, bedSeat, bedHands, benchSeat, boatSeat, courierSeat, ladderRot, stovePoint, ploughFor, DESK, GRILL, STOOL, TRUNK } from "../props";
import { setSeat } from "../../../kit/acc/garb";
import { FONT } from "../../../kit/props/kit";
import type { Place, CamPose } from "../story";
import type { Rig } from "../../group/kit/rig3d";

export type Lab = (text: string, at: THREE.Vector3, size?: number) => void;
export type View = { place: Place; cam: CamPose; f: number; pose(w: World, f: number, lab: Lab, o: Record<string, any>): Rig[] };
const cm = (pos: [number, number, number], look: [number, number, number], fov: number): CamPose => ({ pos: [YX + pos[0], pos[1], pos[2]], look: [YX + look[0], look[1], look[2]], fov });
/** a point on the yard (x from the yard's middle) */
const Y = (x: number, y: number, z: number) => V(YX + x, y, z);
const PI = Math.PI;

export const VIEWS: Record<string, View> = {
  hand: {
    place: "yard", cam: cm([0.5, 1.0, 0.2], [0.5, 0.95, -1.0], 50), f: 0,
    pose(w, f, lab) {
      const z = -1.0, X = (x: number) => 0.5 + x, s = 0.032;
      w.prop("bone").put(Y(X(-0.21), 1.32, z)); lab("bone", Y(X(-0.21), 1.44, z), s);
      w.prop("bone", "clean").put(Y(X(-0.07), 1.32, z), { clean: true }); lab("clean", Y(X(-0.07), 1.44, z), s);
      w.prop("brush").put(Y(X(0.08), 1.33, z)); lab("brush", Y(X(0.08), 1.49, z), s);
      w.prop("coin").put(Y(X(0.22), 1.32, z)); lab("coin", Y(X(0.22), 1.38, z), s);
      w.prop("lychee").put(Y(X(-0.22), 1.06, z)); lab("lychee", Y(X(-0.22), 1.12, z), s);
      w.prop("lychee", "half").put(Y(X(-0.11), 1.06, z), { peeled: 0.5 }); lab(".5", Y(X(-0.11), 1.12, z), s);
      w.prop("lychee", "peeled").put(Y(X(0.0), 1.06, z), { peeled: 1 }); lab("peeled", Y(X(0.0), 1.12, z), s);
      w.prop("shell").put(Y(X(0.1), 1.05, z), { rot: [0.6, 0, 0] }); lab("shell", Y(X(0.1), 1.12, z), s);
      w.prop("lycheeBunch").put(Y(X(0.22), 1.13, z)); lab("bunch", Y(X(0.22), 1.18, z), s);
      w.prop("oyster").put(Y(X(-0.24), 0.8, z - 0.05), { rot: [0.5, 0.9, 0] }); lab("oyster", Y(X(-0.22), 0.88, z), s);
      w.prop("oyster", "open").put(Y(X(-0.07), 0.8, z - 0.05), { rot: [0.5, 0.9, 0], open: 0.7 }); lab("open .7", Y(X(-0.05), 0.88, z), s);
      w.prop("wineBowl").put(Y(X(0.1), 0.76, z), { rot: [0.5, 0, 0] }); lab("wineBowl", Y(X(0.1), 0.86, z), s);
      w.prop("inkstone").put(Y(X(0.24), 0.78, z), { rot: [0.6, 0, 0] }); lab("inkstone", Y(X(0.24), 0.86, z), s);
      w.prop("chopsticks").put(Y(X(-0.27), 0.58, z), { rot: [0, 0, PI / 2] }); lab("chopsticks", Y(X(-0.15), 0.64, z), s);
      w.prop("letter").put(Y(X(0.14), 0.56, z), { rot: [PI / 2 - 0.2, 0, 0], ink: 0.6 }); lab("letter ink .6", Y(X(0.14), 0.7, z), s);
      return [];
    },
  },
  held: {
    place: "yard", cam: cm([0.5, 1.25, 1.2], [0.5, 0.75, -1.2], 62), f: 30,
    pose(w, f, lab) {
      const z = -1.2, X = (x: number) => 0.5 + x, s = 0.055;
      w.prop("cleaver").put(Y(X(-0.42), 1.42, z)); lab("cleaver", Y(X(-0.42), 1.72, z), s);
      w.prop("spine").put(Y(X(0.0), 1.78, z)); lab("spine · pair", Y(X(0.0), 1.9, z), s);
      w.prop("scroll").put(Y(X(0.4), 1.72, z), { open: 1 }); lab("scroll open 1", Y(X(0.4), 1.82, z), s);
      w.prop("scroll", "half").put(Y(X(0.4), 1.25, z), { open: 0.3 }); lab("open .3", Y(X(0.4), 1.33, z), s);
      w.prop("stick").put(Y(X(-0.5), 1.0, z)); lab("stick", Y(X(-0.5), 1.1, z), s);
      w.prop("lantern").put(Y(X(-0.2), 1.4, z), { lit: 1 }); lab("lantern lit 1", Y(X(-0.2), 1.48, z), s);
      w.prop("lantern", "dark").put(Y(X(0.16), 1.4, z), { lit: 0 }); lab("lit 0", Y(X(0.16), 1.48, z), s);
      w.prop("porkPot").put(Y(X(-0.3), 0, -0.2)); lab("porkPot", Y(X(-0.3), 0.3, -0.2), s * 0.8);
      w.prop("porkPot", "open").put(Y(X(0.02), 0, -0.2), { lid: 1 }); lab("lid 1", Y(X(0.02), 0.3, -0.2), s * 0.8);
      w.prop("robes").put(Y(X(0.4), 0, -0.2), { rot: 0.3 }); lab("robes", Y(X(0.4), 0.24, -0.2), s * 0.8);
      return [];
    },
  },
  big: {
    place: "yard", cam: cm([0.35, 2.7, 3.9], [0.35, 0.25, -1.4], 62), f: 60,
    pose(w, f, lab) {
      const s = 0.1;
      w.prop("block").put(Y(-1.1, 0, -2.6)); lab("block", Y(-1.1, 1.0, -2.6), s);
      w.prop("trunk").put(Y(-0.2, 0, -2.6)); lab("trunk", Y(-0.2, 0.6, -2.6), s);
      w.prop("trunk", "open").put(Y(0.7, 0, -2.6), { open: 1 }); lab("open 1", Y(0.7, 0.95, -2.6), s);
      w.prop("robes").put(Y(-0.2, TRUNK.h, -2.6));
      w.prop("desk").put(Y(1.6, 0, -2.3)); lab("desk + cushion", Y(1.6, 0.62, -2.3), s);
      const D = deskSeat(Y(1.6, 0, -2.3)); w.prop("cushion").put(D.cushion);
      w.prop("inkstone").put(Y(1.25, DESK.top, -2.2)); w.prop("letter").put(Y(1.65, DESK.top, -2.25), { ink: 1 });
      w.prop("brush").put(Y(1.95, DESK.top + 0.009, -2.2), { rot: [0, 0.4, PI / 2] });
      w.prop("rattanBed").put(Y(-0.55, 0.42, -0.7), { rot: PI / 2 + 0.25 }); lab("rattanBed", Y(-0.55, 1.15, -0.7), s);
      w.prop("plough").put(Y(1.55, 0, -1.25), { rot: PI - 0.5 }); lab("plough", Y(1.4, 1.1, -1.0), s);
      w.prop("fire").put(Y(1.1, 0, 0.35), { lit: 1, t: f / 30 }); lab("fire lit 1", Y(1.1, 0.75, 0.35), s);
      return [];
    },
  },
  yard: {
    place: "yard", cam: YARD_CAMS.land, f: 90,
    pose(w, f, lab) {
      const t = f / 30, st = YARD.stove;
      w.prop("stove").put(st, { steam: 1, t }); w.prop("grill").put(stovePoint(st, 0, "grill"));
      w.prop("bone").put(stovePoint(st, 0, "grill").add(V(0, GRILL.top + 0.016, 0)), { rot: [0, 0.3, PI / 2] });
      const wn = YARD.wine; w.prop("stool").put(V(wn.x, 0, wn.z)); w.prop("wineBowl").put(V(wn.x + 0.05, STOOL.top, wn.z));
      w.prop("bench").put(YARD.bench); w.prop("ladder").put(YARD.ladder, { rot: ladderRot(YARD.ladder, YARD.ladderTop) });
      w.prop("dog").put(YARD.dog, { pose: "lie", t, rot: 0.4 });
      lab("stove · grill · bone", st.clone().add(V(0, 1.15, 0)), 0.11); lab("stool · wine", V(wn.x, 0.75, wn.z), 0.09);
      lab("bench · dog", YARD.bench.clone().add(V(0, 0.8, 0)), 0.09); lab("ladder", YARD.ladderTop.clone().add(V(0, 0.2, 0.2)), 0.1);
      return [];
    },
  },
  hold: {
    place: "yard", cam: cm([0.05, 1.5, 2.6], [0.05, 1.0, -1.5], 62), f: 120,
    pose(w, f, lab) {
      const out: Rig[] = [], z = -1.5;
      const p1 = Y(-0.85, 0, z), su = w.actor(SU), h1 = rel(p1, 0, -0.26, 1.02, 0.26);
      su.set({ ...standing(p1, 0, f, 1, { expr: "happy" }), hands: [h1, null] }); out.push(su);
      const p2 = Y(0.05, 0, z), bu = w.actor(BUTCHER), h2 = rel(p2, 0, -0.28, 0.98, 0.22);
      bu.set({ ...standing(p2, 0, f, 3), hands: [h2, null] }); out.push(bu);
      const p3 = Y(0.95, 0, z), su2 = w.actor(SU, "spine"), c3 = rel(p3, 0, 0, 0.98, 0.34), h3 = holdPoints("spine", c3, { grip: "pair" });
      su2.set({ ...standing(p3, 0, f, 5, { expr: "grin" }), hands: [h3[0], h3[1]] }); out.push(su2);
      w.update();
      w.prop("bone").put(su.handWorld(0), { grip: "hilt", rot: [0.1, 0, 0.15] }); lab("bone · hilt", Y(-0.85, 2.0, z), 0.08);
      w.prop("cleaver").put(bu.handWorld(0), { grip: "hilt", rot: [0.15, 0, 0.3] }); lab("cleaver · hilt", Y(0.05, 2.0, z), 0.08);
      w.prop("spine").put(c3, { grip: "pair" }); lab("spine · pair", Y(0.95, 2.0, z), 0.08);
      return out;
    },
  },
  hold2: {
    place: "yard", cam: cm([0.75, 1.5, 2.9], [0.75, 0.95, -1.5], 62), f: 150,
    pose(w, f, lab) {
      const out: Rig[] = [], z = -1.5;
      const p1 = Y(-0.4, 0, z), co = w.actor(COURIER), c1 = rel(p1, 0, 0, 0.98, 0.32), h1 = holdPoints("scroll", c1, { grip: "pair", open: 1 });
      co.set({ ...standing(p1, 0, f, 2, { expr: "neutral" }), hands: [h1[0], h1[1]] }); out.push(co);
      const p2 = Y(0.4, 0, z), so = w.actor(SU_OLD), h2 = rel(p2, 0, -0.27, 0.9, 0.12);
      so.set({ ...standing(p2, 0, f, 4, { expr: "smile_closed" }), hands: [h2, null] }); out.push(so);
      const p3 = Y(1.35, 0, z), ma = w.actor(MAI), h3 = rel(p3, 0, -0.3, 0.95, 0.22);
      ma.set({ ...standing(p3, 0, f, 6, { expr: "smile" }), hands: [h3, null] }); out.push(ma);
      const p4 = Y(2.0, 0, z + 0.3), ki = w.actor(KID), h4 = rel(p4, 0, -0.17, 0.62, 0.17);
      ki.set({ ...standing(p4, 0, f, 8, { expr: "grin" }), hands: [h4, null] }); out.push(ki);
      w.update();
      w.prop("scroll").put(c1, { grip: "pair", open: 1 }); lab("scroll · pair", Y(-0.4, 2.05, z), 0.08);
      w.prop("stick").put(so.handWorld(0), { grip: "hilt", rot: [0, 0, -0.03] }); lab("stick · hilt", Y(0.4, 2.05, z), 0.08);
      w.prop("lantern").put(ma.handWorld(0), { grip: "hook", lit: 1 }); lab("lantern · hook", Y(1.35, 2.05, z), 0.08);
      w.prop("chopsticks").put(ki.handWorld(0), { grip: "hilt", rot: [-0.4, 0, -0.25] }); lab("chopsticks", Y(2.0, 1.25, z), 0.08);
      return out;
    },
  },
  bed: {
    place: "yard", cam: YARD_CAMS.bed, f: 180,
    pose(w, f) {
      const B = bedSeat(YARD.bed), su = w.actor(SU);
      w.prop("rattanBed").put(YARD.bed);
      su.set({ at: B.at, facing: B.facing, seat: B.seat, pose: { kind: "sit", t: f / 30 }, expr: "smug", hide: [...SU_HAT.bare], visible: true });
      setSeat(su, B.seat, B.facing);
      w.update();
      su.set({ hands: bedHands(su.headWorld(), B.facing) });
      w.update();
      return [su];
    },
  },
  sleep: {
    place: "yard", cam: YARD_CAMS.bed, f: 210,
    pose(w, f) {
      const B = bedSeat(YARD.bed), su = w.actor(SU);
      w.prop("rattanBed").put(YARD.bed); w.set.param("shells", 1);
      su.set({ at: B.at, facing: B.facing, seat: B.seat, pose: { kind: "sit", t: f / 30 }, expr: "sleep", lookDown: 8, hide: [...SU_HAT.bare], visible: true });
      setSeat(su, B.seat, B.facing);
      w.update();
      su.set({ hands: bedHands(su.headWorld(), B.facing) });
      w.update();
      w.prop("shell").put(rel(B.seat.top, B.facing, 0.06, 0.2, 0.3), { rot: [-0.5, 0, 0.2] });
      return [su];
    },
  },
  desk: {
    place: "room", cam: ROOM_CAMS.wide, f: 240,
    pose(w, f) {
      const out: Rig[] = [], t = f / 30, D = deskSeat(ROOM.desk), su = w.actor(SU);
      w.prop("desk").put(ROOM.desk); w.prop("cushion").put(D.cushion, { rot: D.facing });
      w.prop("inkstone").put(ROOM.desk.clone().add(V(-0.42, DESK.top, 0.1))); w.prop("letter").put(ROOM.desk.clone().add(V(0.05, DESK.top, 0.02)), { ink: 0.55 });
      su.set({ at: D.at, facing: D.facing, seat: D.seat, pose: { kind: "write", t }, expr: "focus", hide: ["bambooHat", "dongpoCap"], visible: true }); out.push(su);
      ROOM.trunks.forEach((p, i) => w.prop("trunk", `t${i}`).put(p, { open: 1, rot: i ? 0.5 : 0 }));
      w.prop("robes").put(ROOM.trunks[0].clone().add(V(0, TRUNK.h - TRUNK.lid - 0.02, 0)));
      w.prop("bench").put(ROOM.bench);
      [KID, KID2].forEach((P, i) => { const S = benchSeat(ROOM.bench, 0, i ? 0.35 : -0.35), k = w.actor(P); k.set({ at: S.at, facing: S.facing, seat: S.seat, pose: { kind: "sit", t: t + i }, expr: "happy", visible: true }); setSeat(k, S.seat, S.facing); out.push(k); });
      const wi = w.actor(WIFE); wi.set(standing(ROOM.wife, yawTo(ROOM.wife, V(ROOM_CAMS.wide.pos[0], 0, ROOM_CAMS.wide.pos[2])) * 0.6, f, 9, { expr: "smile_closed" })); out.push(wi);
      w.update();
      w.prop("brush").put(su.handWorld(0), { grip: "hilt", rot: [PI * 0.85, 0, 0] });
      return out;
    },
  },
  bench: {
    place: "yard", cam: cm([1.75, 1.5, -1.2], [1.65, 0.75, -4.2], 62), f: 270,
    pose(w, f) {
      const t = f / 30, A = benchSeat(YARD.bench, 0, -0.3), B = benchSeat(YARD.bench, 0, 0.42), su = w.actor(SU), k = w.actor(KID);
      w.prop("bench").put(YARD.bench); w.prop("dog").put(YARD.dog, { pose: "lie", t, rot: 0.5 });
      su.set({ at: A.at, facing: A.facing, seat: A.seat, pose: { kind: "sit", t }, expr: "laugh", visible: true }); setSeat(su, A.seat, A.facing);
      k.set({ at: B.at, facing: B.facing, seat: B.seat, pose: { kind: "sit", t: t + 1 }, expr: "happy", visible: true }); setSeat(k, B.seat, B.facing);
      w.update();
      return [su, k];
    },
  },
  boat: {
    place: "river", cam: RIVER_CAMS.bank, f: 300,
    pose(w, f) {
      const t = f / 30, at = RIVER.boatPath[0], B = boatSeat(at, 0), su = w.actor(SU), gu = w.actor(GUO);
      w.prop("boat").put(at, { t });
      su.set({ at: B.at, facing: B.facing, seat: B.seat, pose: { kind: "wave", t }, expr: "smile", visible: true }); setSeat(su, B.seat, B.facing);
      gu.set({ ...standing(B.guo, B.facing, f, 3, { expr: "smile" }), hands: B.guoHands(t) });
      w.update();
      return [su, gu];
    },
  },
  dogs: {
    place: "yard", cam: cm([0.5, 1.15, 2.7], [0.5, 0.25, -1.5], 50), f: 330,
    pose(w, f, lab) {
      const t = f / 30, s = 0.08, rows: [string, number, number][] = [["idle", -0.62, -0.7], ["sniff", 0.0, -0.7], ["lookUp", 0.62, -0.7], ["sit", -0.62, -2.0], ["walk", 0.0, -2.0], ["lie", 0.62, -2.0]];
      for (const [pose, x, z] of rows) {
        const at = Y(0.5 + x, 0, z), looks = pose === "lookUp" || pose === "sit";
        w.prop("dog", pose).put(at, { pose, t, rot: 0.9, lookAt: looks ? Y(0.5 + x + 0.35, 1.35, z + 0.5) : undefined });
        lab(pose, at.clone().add(V(0, 0.66, 0)), s);
      }
      return [];
    },
  },
  dogSide: {
    place: "yard", cam: cm([0.5, 0.75, 1.3], [0.5, 0.3, -1.0], 50), f: 345,
    pose(w, f, lab) {
      const t = f / 30, rows: [string, number, number][] = [["sit", -0.42, -1.0], ["lookUp", 0.42, -1.0], ["lie", 0.0, -1.9]];
      for (const [pose, x, z] of rows) {
        const at = Y(0.5 + x, 0, z);
        w.prop("dog", "side" + pose).put(at, { pose, t, rot: PI / 2, lookAt: pose === "lie" ? undefined : Y(0.5 + x + 0.6, 1.4, z + 0.2) });
        lab(pose, at.clone().add(V(0, 0.7, 0)), 0.07);
      }
      return [];
    },
  },
  horse: {
    place: "yard", cam: cm([2.45, 1.5, 2.3], [2.8, 1.4, 5.4], 62), f: 360,
    pose(w, f) {
      const t = f / 30, at = YARD.courier, rot = yawTo(at, V(YARD_CAMS.gate.pos[0], 0, YARD_CAMS.gate.pos[2])) + 0.5;
      const S = courierSeat(at, rot, "stand", t), co = w.actor(COURIER);
      w.prop("horse").put(at, { rot, pose: "stand", t, rider: "#c23a30" });
      const c = rel(S.seat.top, rot - 0.5, 0, 0.36, 0.36), h = holdPoints("scroll", c, { grip: "pair", open: 1, rot: rot - 0.5 });
      co.set({ at: S.at, facing: rot, seat: S.seat, pose: { kind: "sit", t }, hands: [h[0], h[1]], expr: "neutral", visible: true });
      w.update();
      w.prop("scroll").put(c, { grip: "pair", open: 1, rot: rot - 0.5 });
      return [co];
    },
  },
  ride: {
    place: "yard", cam: YARD_CAMS.road, f: 390,
    pose(w, f) {
      const t = f / 30, at = YARD.road[1], rot = yawTo(YARD.road[1], YARD.road[2]);
      const S = courierSeat(at, rot, "walk", t), co = w.actor(COURIER);
      w.prop("horse").put(at, { rot, pose: "walk", t, rider: "#c23a30" });
      co.set({ at: S.at, facing: rot, seat: S.seat, pose: { kind: "sit", t }, expr: "neutral", visible: true });
      w.update();
      return [co];
    },
  },
  plough: {
    place: "huangzhou", cam: HUANGZHOU_CAMS.slope, f: 420,
    pose(w, f) {
      const t = f / 30, P = ploughFor(HUANGZHOU.su, HUANGZHOU.suFacing), su = w.actor(SU);
      w.prop("plough").put(P.at, { rot: P.rot });
      su.set({ ...standing(HUANGZHOU.su, HUANGZHOU.suFacing, f, 1, { expr: "happy" }), hands: P.hands });
      w.update();
      return [su];
    },
  },
};
export const VIEW_NAMES = Object.keys(VIEWS);

/** a view's QA line: each figure's rig.qa and the props' screen points */
export const qaLine = (w: World, figs: Rig[]) => {
  const pct = (p: THREE.Vector3) => { const q = w.project(p); return `${((100 * q.x) / 1080).toFixed(1)}/${((100 * q.y) / 1920).toFixed(1)}`; };
  const f = figs.map((r) => `reach ${r.qa.reach.toFixed(4)} clear ${r.qa.clear.toFixed(4)} held ${r.qa.held.toFixed(3)}`).join("; ");
  const props: string[] = [];
  w.props.group.children.forEach((g) => { if (g.visible) props.push(`${g.name.slice(5)} ${pct(g.getWorldPosition(V()))}`); });
  return `${f} | ${props.join(", ")}`;
};

if (typeof window !== "undefined") preview({ w: 540, h: 960 }, (c) => {
  const w = new World(c.renderer, c.camera);
  c.scene.add(w.root);
  const o = c.opts, names: string[] = o.views ?? VIEW_NAMES;
  const labG = new THREE.Group(); c.scene.add(labG);
  const labs = new Map<string, THREE.Mesh>();
  const lab: Lab = (text, at, size = 0.11) => {
    if (o.labels === false) return;
    let m = labs.get(text);
    if (!m) {
      const cv = document.createElement("canvas"); cv.width = 640; cv.height = 96;
      const g = cv.getContext("2d")!; g.font = `700 60px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle"; g.lineJoin = "round";
      g.strokeStyle = "#1c1822"; g.lineWidth = 12; g.strokeText(text, 320, 50); g.fillStyle = "#ffffff"; g.fillText(text, 320, 50);
      const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace;
      m = new THREE.Mesh(new THREE.PlaneGeometry(640 / 96, 1), new THREE.MeshBasicMaterial({ map: tx, transparent: true, depthTest: false, depthWrite: false, toneMapped: false }));
      m.layers.set(3); m.renderOrder = 50; labs.set(text, m); labG.add(m);
    }
    m.visible = true; m.position.copy(at); m.scale.setScalar(size); m.quaternion.copy(c.camera.quaternion);
  };
  const pose = (i: number) => {
    const name = names[((i % names.length) + names.length) % names.length], v = VIEWS[name];
    if (!v) throw new Error(`props_sheet: no view "${name}" (there are: ${VIEW_NAMES.join(", ")})`);
    for (const m of labs.values()) m.visible = false;
    w.beginFrame(v.f);
    w.setPlace(v.place); w.setCamera(v.cam);
    const figs = v.pose(w, v.f, lab, o);
    w.endFrame({ camera: v.cam });
    console.log(`QA: view ${i} ${name} | ${qaLine(w, figs)}`);
  };
  return { cam: null, frame: (i) => pose(i), ao: () => w.look().ao, bg: () => w.look().bg };
});
